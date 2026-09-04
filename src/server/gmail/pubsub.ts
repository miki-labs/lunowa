import {createPublicKey, verify} from 'node:crypto';

import {GmailRepository} from '@/server/db/repositories/gmail';

import {GmailProviderError} from './types';

type JwtHeader = {alg?: string; kid?: string; typ?: string};
type JwtClaims = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  email?: string;
  email_verified?: boolean;
};
type GoogleJwk = JsonWebKey & {kid?: string; alg?: string; use?: string};

function parseJsonSegment<T>(segment: string): T {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
  } catch {
    throw new GmailProviderError(401, 'INVALID_PUBSUB_JWT');
  }
}

export class GooglePubSubJwtVerifier {
  private cached: {expiresAt: number; keys: GoogleJwk[]} | null = null;

  constructor(
    private readonly audience: string,
    private readonly serviceAccount: string,
    private readonly request: typeof fetch = fetch,
    private readonly now: () => number = () => Date.now()
  ) {}

  private async keys(): Promise<GoogleJwk[]> {
    if (this.cached && this.cached.expiresAt > this.now()) return this.cached.keys;
    const response = await this.request('https://www.googleapis.com/oauth2/v3/certs');
    if (!response.ok) throw new GmailProviderError(503, 'PUBSUB_JWKS_UNAVAILABLE');
    const payload = await response.json() as {keys?: GoogleJwk[]};
    if (!payload.keys?.length) throw new GmailProviderError(503, 'PUBSUB_JWKS_UNAVAILABLE');
    const maxAge = /max-age=(\d+)/i.exec(response.headers.get('cache-control') ?? '')?.[1];
    this.cached = {
      keys: payload.keys,
      expiresAt: this.now() + Math.max(60, Number(maxAge ?? 300)) * 1000
    };
    return payload.keys;
  }

  async verify(authorization: string | null): Promise<JwtClaims> {
    const token = authorization?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
    if (!token) throw new GmailProviderError(401, 'MISSING_PUBSUB_JWT');
    const segments = token.split('.');
    if (segments.length !== 3) throw new GmailProviderError(401, 'INVALID_PUBSUB_JWT');
    const header = parseJsonSegment<JwtHeader>(segments[0]!);
    const claims = parseJsonSegment<JwtClaims>(segments[1]!);
    if (header.alg !== 'RS256' || !header.kid) throw new GmailProviderError(401, 'INVALID_PUBSUB_JWT');
    const jwk = (await this.keys()).find((candidate) => candidate.kid === header.kid && candidate.alg === 'RS256');
    if (!jwk) throw new GmailProviderError(401, 'UNKNOWN_PUBSUB_JWT_KEY');
    const validSignature = verify(
      'RSA-SHA256',
      Buffer.from(`${segments[0]}.${segments[1]}`, 'ascii'),
      createPublicKey({key: jwk as never, format: 'jwk'}),
      Buffer.from(segments[2]!, 'base64url')
    );
    const nowSeconds = Math.floor(this.now() / 1000);
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const valid =
      validSignature &&
      (claims.iss === 'accounts.google.com' || claims.iss === 'https://accounts.google.com') &&
      audiences.includes(this.audience) &&
      typeof claims.exp === 'number' && claims.exp > nowSeconds &&
      typeof claims.iat === 'number' && claims.iat <= nowSeconds + 60 &&
      claims.iat >= nowSeconds - 3600 &&
      claims.email_verified === true &&
      claims.email === this.serviceAccount;
    if (!valid) throw new GmailProviderError(401, 'INVALID_PUBSUB_JWT_CLAIMS');
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
    if (!message?.messageId || !message.data || message.data.length > 16_384) {
      throw new GmailProviderError(400, 'INVALID_PUBSUB_BODY');
    }
    let notification: {emailAddress?: string; historyId?: string};
    try {
      notification = JSON.parse(Buffer.from(message.data, 'base64').toString('utf8')) as typeof notification;
    } catch {
      throw new GmailProviderError(400, 'INVALID_PUBSUB_DATA');
    }
    if (!notification.emailAddress || !/^\d+$/.test(notification.historyId ?? '')) {
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
