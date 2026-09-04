import {randomUUID} from 'node:crypto';

import {GmailRepository} from '@/server/db/repositories/gmail';

import type {GmailEnvironment} from './config';
import {GMAIL_OAUTH_SCOPES} from './config';
import {GmailCredentialCipher, pkceChallenge, randomUrlToken, sha256} from './crypto';
import {isSafeMailboxAddress} from './normalize';
import type {GmailProviderClient, GmailTokenSet} from './types';
import {GmailProviderError, GMAIL_READONLY_SCOPE} from './types';

const OAUTH_STATE_TTL_MS = 10 * 60_000;

type OAuthRepository = Pick<GmailRepository, 'createOauthState' | 'consumeOauthState' | 'activateConnection'>;

function safeReturnPath(candidate: string | undefined): string {
  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    /[\u0000-\u001f]/.test(candidate)
  ) return '/';
  return candidate;
}

function grantedCapabilities(scopes: readonly string[]): readonly string[] {
  if (!scopes.includes(GMAIL_READONLY_SCOPE)) return [];
  return ['mail_read', 'incremental_sync', 'attachment_fetch'];
}

export class GmailAuthorizationService {
  constructor(
    private readonly environment: GmailEnvironment,
    private readonly cipher: GmailCredentialCipher,
    private readonly provider: GmailProviderClient,
    private readonly gmailRepository: OAuthRepository = new GmailRepository()
  ) {}

  async createAuthorizationUrl(userId: string, returnPath?: string): Promise<string> {
    const state = randomUrlToken();
    const stateDigest = sha256(state);
    const codeVerifier = randomUrlToken(64);
    await this.gmailRepository.createOauthState({
      stateDigest,
      userId,
      encryptedCodeVerifier: this.cipher.encrypt(codeVerifier, `oauth-state:${userId}:${stateDigest}`),
      returnPath: safeReturnPath(returnPath),
      expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS)
    });
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: this.environment.clientId,
      redirect_uri: this.environment.redirectUri,
      response_type: 'code',
      scope: GMAIL_OAUTH_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'false',
      state,
      code_challenge: pkceChallenge(codeVerifier),
      code_challenge_method: 'S256'
    }).toString();
    return url.toString();
  }

  async completeAuthorization(input: {state: string; code: string}) {
    const stateDigest = sha256(input.state);
    const oauthState = await this.gmailRepository.consumeOauthState({
      stateDigest,
      now: new Date()
    });
    if (!oauthState) throw new GmailProviderError(400, 'INVALID_OAUTH_STATE');
    // The single-use high-entropy state is the authoritative correlation to
    // the initiating app user. A callback-time browser session may have
    // expired, signed out, or switched users during external consent.
    const userId = oauthState.userId;
    const codeVerifier = this.cipher.decrypt<string>(
      oauthState.encryptedCodeVerifier,
      `oauth-state:${userId}:${stateDigest}`
    );
    const exchanged = await this.provider.exchangeCode(input.code, codeVerifier);
    const scopes = exchanged.scope.split(/\s+/).filter(Boolean);
    if (!scopes.includes(GMAIL_READONLY_SCOPE)) {
      await this.provider.revoke(exchanged.refreshToken).catch(() => undefined);
      throw new GmailProviderError(403, 'GMAIL_READ_SCOPE_NOT_GRANTED');
    }
    const profile = await this.provider.getProfile(exchanged.accessToken);
    const emailAddress = profile.emailAddress.trim().toLowerCase();
    if (!isSafeMailboxAddress(emailAddress) || !/^\d+$/.test(profile.historyId)) {
      await this.provider.revoke(exchanged.refreshToken).catch(() => undefined);
      throw new GmailProviderError(502, 'INVALID_GMAIL_PROFILE');
    }
    const activated = await this.gmailRepository.activateConnection({
      activationId: randomUUID(),
      credentialId: randomUUID(),
      userId,
      providerAccountId: emailAddress,
      emailAddress,
      encryptPayload: (connectedAccountId) => this.cipher.encrypt(
        exchanged satisfies GmailTokenSet,
        `gmail-token:${userId}:${connectedAccountId}`
      ),
      keyVersion: this.environment.credentialKeyVersion,
      grantedScopes: scopes,
      grantedCapabilities: grantedCapabilities(scopes),
    });
    return {connectedAccountId: activated.connectedAccountId, returnPath: oauthState.returnPath, userId};
  }
}

type CredentialRepository = Pick<
  GmailRepository,
  'getOwnedCredential' | 'putCredential' | 'invalidateCredential' | 'deleteCredential'
>;

export class GmailCredentialService {
  constructor(
    private readonly environment: Pick<GmailEnvironment, 'credentialKeyVersion'>,
    private readonly cipher: GmailCredentialCipher,
    private readonly provider: GmailProviderClient,
    private readonly repository: CredentialRepository = new GmailRepository()
  ) {}

  async getAccessToken(userId: string, connectedAccountId: string): Promise<string> {
    const row = await this.repository.getOwnedCredential(userId, connectedAccountId);
    if (!row) throw new GmailProviderError(403, 'ACCOUNT_NOT_OWNED');
    if (row.invalidatedAt || row.connectionState !== 'CONNECTED') {
      throw new GmailProviderError(401, 'RECONNECT_REQUIRED');
    }
    if (row.keyVersion !== this.environment.credentialKeyVersion) {
      throw new GmailProviderError(503, 'CREDENTIAL_KEY_VERSION_UNAVAILABLE');
    }
    const context = `gmail-token:${userId}:${connectedAccountId}`;
    const token = this.cipher.decrypt<GmailTokenSet>(row.encryptedPayload, context);
    if (token.expiresAt > Date.now() + 60_000) return token.accessToken;

    try {
      const refreshed = await this.provider.refresh(token.refreshToken);
      const nextToken: GmailTokenSet = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? token.refreshToken,
        expiresAt: refreshed.expiresAt,
        tokenType: 'Bearer'
      };
      await this.repository.putCredential({
        id: row.id,
        userId,
        connectedAccountId,
        encryptedPayload: this.cipher.encrypt(nextToken, context),
        keyVersion: this.environment.credentialKeyVersion,
        grantedScopes: row.grantedScopes
      });
      return nextToken.accessToken;
    } catch (error) {
      if (error instanceof GmailProviderError && (error.code === 'invalid_grant' || error.status === 401)) {
        await this.repository.invalidateCredential(userId, connectedAccountId);
      }
      throw error;
    }
  }

  async disconnect(userId: string, connectedAccountId: string): Promise<void> {
    const row = await this.repository.getOwnedCredential(userId, connectedAccountId);
    if (!row) throw new GmailProviderError(403, 'ACCOUNT_NOT_OWNED');
    try {
      const token = this.cipher.decrypt<GmailTokenSet>(
        row.encryptedPayload,
        `gmail-token:${userId}:${connectedAccountId}`
      );
      await this.provider.revoke(token.refreshToken).catch(() => undefined);
    } catch {
      // Local deletion is authoritative for intentional disconnect even when
      // an unavailable old key prevents best-effort remote revocation.
    } finally {
      await this.repository.deleteCredential(userId, connectedAccountId);
    }
  }

  async markReconnectRequired(userId: string, connectedAccountId: string): Promise<void> {
    await this.repository.invalidateCredential(userId, connectedAccountId);
  }
}
