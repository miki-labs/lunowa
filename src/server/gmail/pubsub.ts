import {createLocalJWKSet, errors, jwtVerify, type JSONWebKeySet, type JWTPayload} from 'jose';

import {GmailRepository} from '@/server/db/repositories/gmail';

import {isSafeMailboxAddress} from './normalize';
import {GmailProviderError} from './types';

type PubSubClaims = JWTPayload & {email?: string; email_verified?: boolean};

export class GooglePubSubJwtVerifier {
  private cached: {expiresAt: number; jwks: JSONWebKeySet} | null = null;

  constructor(
    private readonly audience: string,
    private readonly serviceAccount: string,
    private readonly request: typeof fetch = fetch,
    private readonly now: () => number = () => Date.now()
  ) {}

  private async keys(forceRefresh = false): Promise<JSONWebKeySet> {
    if (!forceRefresh && this.cached && this.cached.expiresAt > this.now()) return this.cached.jwks;
    const response = await this.request('https://www.googleapis.com/oauth2/v3/certs');
    if (!response.ok) throw new GmailProviderError(503, 'PUBSUB_JWKS_UNAVAILABLE');
    const payload = await response.json() as JSONWebKeySet;
    if (!Array.isArray(payload.keys) || payload.keys.length === 0) {
      throw new GmailProviderError(503, 'PUBSUB_JWKS_UNAVAILABLE');
    }
    const configuredMaxAge = Number(/max-age=(\d+)/i.exec(response.headers.get('cache-control') ?? '')?.[1] ?? 300);
    const maxAgeSeconds = Math.min(86_400, Math.max(60, configuredMaxAge));
    this.cached = {jwks: payload, expiresAt: this.now() + maxAgeSeconds * 1000};
    return payload;
  }

  private async verifiedPayload(token: string, refreshAttempted = false): Promise<PubSubClaims> {
    try {
      const {payload} = await jwtVerify(token, createLocalJWKSet(await this.keys(refreshAttempted)), {
        algorithms: ['RS256'],
        audience: this.audience,
        issuer: ['accounts.google.com', 'https://accounts.google.com'],
        clockTolerance: 60,
        currentDate: new Date(this.now()),
        maxTokenAge: '1h'
      });
      return payload as PubSubClaims;
    } catch (error) {
      if (error instanceof GmailProviderError) throw error;
      if (error instanceof errors.JWKSNoMatchingKey && !refreshAttempted) {
        // Google signing-key rotation can introduce a kid while the previous
        // JWKS response is still cached. Refresh exactly once, then fail shut.
        return this.verifiedPayload(token, true);
      }
      if (error instanceof errors.JWKSNoMatchingKey) {
        throw new GmailProviderError(401, 'UNKNOWN_PUBSUB_JWT_KEY');
      }
      if (error instanceof errors.JWTClaimValidationFailed || error instanceof errors.JWTExpired) {
        throw new GmailProviderError(401, 'INVALID_PUBSUB_JWT_CLAIMS');
      }
      throw new GmailProviderError(401, 'INVALID_PUBSUB_JWT');
    }
  }

  async verify(authorization: string | null): Promise<PubSubClaims> {
    const token = authorization?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
    if (!token) throw new GmailProviderError(401, 'MISSING_PUBSUB_JWT');
    const claims = await this.verifiedPayload(token);
    if (claims.email_verified !== true || claims.email !== this.serviceAccount) {
      throw new GmailProviderError(401, 'INVALID_PUBSUB_JWT_CLAIMS');
    }
    return claims;
  }
}

type PubSubRepository = Pick<GmailRepository, 'findConnectedAccountsByEmail' | 'enqueueSignal'>;

export class GmailPushIngress {
  constructor(
    private readonly verifier: Pick<GooglePubSubJwtVerifier, 'verify'>,
    private readonly repository: PubSubRepository = new GmailRepository()
  ) {}

  async accept(authorization: string | null, body: unknown): Promise<'ENQUEUED' | 'DUPLICATE' | 'IGNORED'> {
    await this.verifier.verify(authorization);
    if (!body || typeof body !== 'object') throw new GmailProviderError(400, 'INVALID_PUBSUB_BODY');
    const message = (body as {message?: {messageId?: string; data?: string}}).message;
    if (!message?.messageId || !/^[A-Za-z0-9._~+-]{1,512}$/.test(message.messageId) ||
        !message.data || message.data.length > 16_384) {
      throw new GmailProviderError(400, 'INVALID_PUBSUB_BODY');
    }
    let notification: {emailAddress?: string; historyId?: string};
    try {
      notification = JSON.parse(Buffer.from(message.data, 'base64').toString('utf8')) as typeof notification;
    } catch {
      throw new GmailProviderError(400, 'INVALID_PUBSUB_DATA');
    }
    if (!notification.emailAddress || !isSafeMailboxAddress(notification.emailAddress) ||
        !/^\d+$/.test(notification.historyId ?? '')) {
      throw new GmailProviderError(400, 'INVALID_PUBSUB_DATA');
    }
    const accounts = await this.repository.findConnectedAccountsByEmail(notification.emailAddress);
    if (accounts.length === 0) return 'IGNORED';
    let created = false;
    for (const account of accounts) {
      created = await this.repository.enqueueSignal({
        connectedAccountId: account.id,
        deliveryKey: `pubsub:${account.id}:${message.messageId}`,
        reason: 'PUSH',
        hintedHistoryId: notification.historyId
      }) || created;
    }
    return created ? 'ENQUEUED' : 'DUPLICATE';
  }
}
