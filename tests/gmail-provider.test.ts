import {generateKeyPairSync, randomBytes, sign} from 'node:crypto';
import {readdirSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {GmailAttachmentService, safeDownloadFilename, safeDownloadMimeType} from '@/server/gmail/attachments';
import {GmailAuthorizationService, GmailCredentialService} from '@/server/gmail/authorization';
import type {GmailEnvironment} from '@/server/gmail/config';
import {GmailCredentialCipher, sha256} from '@/server/gmail/crypto';
import {normalizeGmailMessage} from '@/server/gmail/normalize';
import {assertOauthBrowserBinding, oauthBrowserCookie} from '@/server/gmail/oauth-browser-binding';
import {GmailPushIngress, GooglePubSubJwtVerifier} from '@/server/gmail/pubsub';
import {GmailSyncService} from '@/server/gmail/sync';
import type {
  GmailHistoryPage,
  GmailMessage,
  GmailMessageListPage,
  GmailProviderClient,
  GmailTokenSet,
  GmailWatch
} from '@/server/gmail/types';
import {GmailProviderError, GMAIL_READONLY_SCOPE} from '@/server/gmail/types';
import {runGmailReconciliation} from '@/server/gmail/worker';

const environment: GmailEnvironment = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  redirectUri: 'https://app.example/api/providers/gmail/oauth/callback',
  credentialKey: randomBytes(32).toString('base64'),
  credentialKeyVersion: 'v1',
  pubsubAudience: 'https://app.example/api/providers/gmail/pubsub',
  pubsubServiceAccount: 'push@example.iam.gserviceaccount.com',
  pubsubTopic: 'projects/example/topics/gmail',
  workerSecret: 'worker-secret'
};

function message(id: string, overrides: Partial<GmailMessage> = {}): GmailMessage {
  return {
    id,
    threadId: `thread-${id}`,
    internalDate: '1704067200000',
    historyId: '100',
    labelIds: ['INBOX', 'UNREAD'],
    payload: {
      mimeType: 'multipart/mixed',
      headers: [
        {name: 'From', value: 'Sender <sender@example.com>'},
        {name: 'To', value: 'Owner <owner@example.com>'},
        {name: 'Subject', value: `Subject ${id}`}
      ],
      parts: [
        {mimeType: 'text/plain', body: {data: Buffer.from(`body ${id}`).toString('base64url')}},
        {
          partId: '2',
          mimeType: 'application/pdf',
          filename: 'evidence.pdf',
          headers: [{name: 'Content-Disposition', value: 'attachment'}],
          body: {attachmentId: `attachment-${id}`, size: 12}
        }
      ]
    },
    ...overrides
  };
}

function provider(overrides: Partial<GmailProviderClient> = {}): GmailProviderClient {
  return {
    exchangeCode: vi.fn(async () => ({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() + 3600_000,
      tokenType: 'Bearer' as const,
      scope: GMAIL_READONLY_SCOPE
    })),
    refresh: vi.fn(async () => ({accessToken: 'new-access', expiresAt: Date.now() + 3600_000})),
    revoke: vi.fn(async () => undefined),
    getProfile: vi.fn(async () => ({emailAddress: 'owner@example.com', historyId: '100'})),
    watch: vi.fn(async () => ({historyId: '100', expiration: String(Date.now() + 7 * 86400_000)})),
    listMessages: vi.fn(async () => ({messages: []})),
    getMessage: vi.fn(async (_token, id) => message(id)),
    listHistory: vi.fn(async () => ({historyId: '101'})),
    getAttachment: vi.fn(async () => ({data: Buffer.from('attachment').toString('base64url'), size: 10})),
    ...overrides
  };
}

describe('G20 Gmail credential and authorization boundary', () => {
  it('persists ciphertext only behind the composite account ownership FK', () => {
    const migrationName = readdirSync(resolve(process.cwd(), 'drizzle/migrations'))
      .filter((name) => name.endsWith('.sql'))
      .find((name) => readFileSync(resolve(process.cwd(), 'drizzle/migrations', name), 'utf8')
        .includes('CREATE TABLE "gmail_provider_credentials"'));
    expect(migrationName).toBeDefined();
    const migration = readFileSync(resolve(process.cwd(), 'drizzle/migrations', migrationName!), 'utf8');
    expect(migration).toContain('CREATE TABLE "gmail_provider_credentials"');
    expect(migration).toContain('"encrypted_payload" text NOT NULL');
    expect(migration).toContain('"gmail_provider_credentials_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id")');
    expect(migration).toContain('CONSTRAINT "gmail_sync_signals_delivery_uq" UNIQUE("delivery_key")');
    expect(migration).not.toContain('"access_token"');
    expect(migration).not.toContain('"refresh_token"');
  });

  it('encrypts token material with authenticated account context and rejects tampering', () => {
    const cipher = new GmailCredentialCipher(environment.credentialKey);
    const token: GmailTokenSet = {
      accessToken: 'secret-access-token',
      refreshToken: 'secret-refresh-token',
      expiresAt: 123,
      tokenType: 'Bearer'
    };
    const encrypted = cipher.encrypt(token, 'gmail-token:user-a:account-a');
    expect(encrypted).not.toContain(token.accessToken);
    expect(encrypted).not.toContain(token.refreshToken);
    expect(cipher.decrypt(encrypted, 'gmail-token:user-a:account-a')).toEqual(token);
    expect(() => cipher.decrypt(encrypted, 'gmail-token:user-b:account-a')).toThrow(/authenticated/);
    const damaged = `${encrypted.slice(0, -2)}aa`;
    expect(() => cipher.decrypt(damaged, 'gmail-token:user-a:account-a')).toThrow();
  });

  it('uses one-time encrypted PKCE state, offline access, and only gmail.readonly', async () => {
    const cipher = new GmailCredentialCipher(environment.credentialKey);
    const states = new Map<string, Record<string, unknown>>();
    const credentials: {encryptedPayload?: string; scopes?: readonly string[]} = {};
    const gmailRepository = {
      createOauthState: vi.fn(async (input: {stateDigest: string}) => { states.set(input.stateDigest, input as never); }),
      consumeOauthState: vi.fn(async (input: {stateDigest: string}) => {
        const row = states.get(input.stateDigest) as {userId: string; consumed?: boolean} | undefined;
        if (!row || row.consumed) return null;
        row.consumed = true;
        return row as never;
      }),
      activateConnection: vi.fn(async (input: {
        encryptPayload: (connectedAccountId: string) => string;
        grantedScopes: readonly string[];
      }) => {
        credentials.encryptedPayload = input.encryptPayload('00000000-0000-4000-8000-000000000002');
        credentials.scopes = input.grantedScopes;
        return {
          connectedAccountId: '00000000-0000-4000-8000-000000000002',
          credentialId: 'credential-id'
        };
      })
    };
    const service = new GmailAuthorizationService(
      environment,
      cipher,
      provider(),
      gmailRepository as never
    );
    const authorizationUrl = new URL(await service.createAuthorizationUrl('00000000-0000-4000-8000-000000000001', '//evil.example'));
    expect(authorizationUrl.searchParams.get('scope')).toBe(GMAIL_READONLY_SCOPE);
    expect(authorizationUrl.searchParams.get('access_type')).toBe('offline');
    expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe('S256');
    const state = authorizationUrl.searchParams.get('state')!;
    const persistedState = states.get(sha256(state))!;
    expect(String(persistedState.encryptedCodeVerifier)).not.toContain('refresh-token');
    const result = await service.completeAuthorization({
      state,
      code: 'authorization-code'
    });
    expect(result.returnPath).toBe('/');
    expect(result.userId).toBe('00000000-0000-4000-8000-000000000001');
    expect(credentials.encryptedPayload).not.toContain('access-token');
    expect(credentials.encryptedPayload).not.toContain('refresh-token');
    expect(credentials.scopes).toEqual([GMAIL_READONLY_SCOPE]);
    await expect(service.completeAuthorization({
      state, code: 'again'
    })).rejects.toMatchObject({code: 'INVALID_OAUTH_STATE'});
  });

  it('keeps callback CSRF binding independent of app-session expiry or account switching', () => {
    const state = 'one-time-oauth-state';
    const binding = oauthBrowserCookie(state);
    expect(() => assertOauthBrowserBinding(state, `${binding.name}=${binding.value}`)).not.toThrow();
    expect(() => assertOauthBrowserBinding('swapped-state', `${binding.name}=${binding.value}`))
      .toThrow(/INVALID_OAUTH_BROWSER_BINDING/);
    expect(() => assertOauthBrowserBinding(state, null)).toThrow(/INVALID_OAUTH_BROWSER_BINDING/);
  });

  it('checks user and account ownership before decrypting or refreshing', async () => {
    const cipher = new GmailCredentialCipher(environment.credentialKey);
    const providerClient = provider();
    const repository = {
      getOwnedCredential: vi.fn(async () => null),
      putCredential: vi.fn(),
      invalidateCredential: vi.fn(),
      deleteCredential: vi.fn()
    };
    const service = new GmailCredentialService(environment, cipher, providerClient, repository as never);
    await expect(service.getAccessToken('other-user', 'account-a')).rejects.toMatchObject({
      code: 'ACCOUNT_NOT_OWNED'
    });
    expect(providerClient.refresh).not.toHaveBeenCalled();
  });

  it('marks reconnect required when refresh authority is revoked', async () => {
    const cipher = new GmailCredentialCipher(environment.credentialKey);
    const context = 'gmail-token:user-a:account-a';
    const repository = {
      getOwnedCredential: vi.fn(async () => ({
        id: 'credential-a',
        encryptedPayload: cipher.encrypt({
          accessToken: 'expired', refreshToken: 'revoked', expiresAt: 0, tokenType: 'Bearer'
        }, context),
        keyVersion: 'v1',
        grantedScopes: [GMAIL_READONLY_SCOPE],
        invalidatedAt: null,
        connectionState: 'CONNECTED',
        emailAddress: 'owner@example.com'
      })),
      putCredential: vi.fn(),
      invalidateCredential: vi.fn(async () => undefined),
      deleteCredential: vi.fn()
    };
    const service = new GmailCredentialService(environment, cipher, provider({
      refresh: vi.fn(async () => { throw new GmailProviderError(400, 'invalid_grant'); })
    }), repository as never);
    await expect(service.getAccessToken('user-a', 'account-a')).rejects.toMatchObject({code: 'invalid_grant'});
    expect(repository.invalidateCredential).toHaveBeenCalledWith('user-a', 'account-a');
  });

  it('deletes intentionally disconnected credentials even if an old key cannot decrypt them', async () => {
    const repository = {
      getOwnedCredential: vi.fn(async () => ({
        id: 'credential-a', encryptedPayload: 'not-decryptable', keyVersion: 'old',
        grantedScopes: [GMAIL_READONLY_SCOPE], invalidatedAt: null,
        connectionState: 'CONNECTED', emailAddress: 'owner@example.com'
      })),
      putCredential: vi.fn(),
      invalidateCredential: vi.fn(),
      deleteCredential: vi.fn(async () => undefined)
    };
    const service = new GmailCredentialService(
      environment,
      new GmailCredentialCipher(environment.credentialKey),
      provider(),
      repository as never
    );
    await expect(service.disconnect('user-a', 'account-a')).resolves.toBeUndefined();
    expect(repository.deleteCredential).toHaveBeenCalledWith('user-a', 'account-a');
  });
});

describe('G20 deployed runtime bindings', () => {
  it('binds the durable worker owner to the deployed ten-minute cron', async () => {
    const enqueueDueWork = vi.fn(async () => 2);
    const runPending = vi.fn(async () => ({processed: 3, failed: 1}));
    await expect(runGmailReconciliation({sync: {enqueueDueWork, runPending} as never}))
      .resolves.toEqual({enqueued: 2, processed: 3, failed: 1});
    expect(runPending).toHaveBeenCalledWith(20);

    const wrangler = readFileSync(resolve(process.cwd(), 'wrangler.jsonc'), 'utf8');
    const worker = readFileSync(resolve(process.cwd(), 'src/worker.ts'), 'utf8');
    expect(wrangler).toContain('"main": "src/worker.ts"');
    expect(wrangler).toContain('"crons": ["*/10 * * * *"]');
    expect(worker).toContain('context.waitUntil(runGmailReconciliation())');
  });

  it('declares the complete authenticated Gmail Pub/Sub IAM chain', () => {
    const provisioning = readFileSync(resolve(process.cwd(), 'infra/gmail-pubsub/main.tf'), 'utf8');
    expect(provisioning).toContain('serviceAccount:gmail-api-push@system.gserviceaccount.com');
    expect(provisioning).toContain('roles/pubsub.publisher');
    expect(provisioning).toContain('roles/iam.serviceAccountTokenCreator');
    expect(provisioning).toContain('@gcp-sa-pubsub.iam.gserviceaccount.com');
    expect(provisioning).toContain('oidc_token {');
    expect(provisioning).toContain('audience              = var.oidc_audience');
    expect(provisioning).toContain('retry_policy {');
  });
});

describe('G20 Gmail normalization', () => {
  it('normalizes chronology, direction, labels and attachment evidence deterministically', async () => {
    const input = {
      userId: '00000000-0000-4000-8000-000000000001',
      connectedAccountId: '00000000-0000-4000-8000-000000000002',
      accountEmail: 'owner@example.com',
      message: message('message-a')
    };
    const first = await normalizeGmailMessage(input);
    const second = await normalizeGmailMessage(input);
    expect(first.conversation.id).toBe(second.conversation.id);
    expect(first.direction).toBe('INBOUND');
    expect(first.occurredAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(first.textBody).toBe('body message-a');
    expect(first.attachments?.[0]).toMatchObject({
      providerAttachmentId: 'attachment-message-a',
      contentReference: 'gmail://message-a/attachment-message-a',
      previewState: 'PROVIDER_FETCH_REQUIRED'
    });
    expect(first.sanitizedHtmlBody).toBeUndefined();
  });

  it('sanitizes hostile filenames, MIME types, subjects and snippets at the provider boundary', async () => {
    const normalized = await normalizeGmailMessage({
      userId: '00000000-0000-4000-8000-000000000001',
      connectedAccountId: '00000000-0000-4000-8000-000000000002',
      accountEmail: 'owner@example.com',
      message: message('message-hostile', {
        snippet: 'safe\r\nX-Injected: yes\u202e.exe',
        payload: {
          mimeType: 'multipart/mixed',
          headers: [
            {name: 'From', value: 'Sender <sender@example.com>'},
            {name: 'To', value: 'Owner <owner@example.com>'},
            {name: 'Subject', value: 'Invoice\r\nX-Injected: yes'}
          ],
          parts: [{
            partId: '2',
            mimeType: 'text/html\r\nX-Evil: yes',
            filename: '../../invoice\r\nContent-Type: text/html.exe',
            body: {attachmentId: 'attachment-hostile', size: 12}
          }]
        }
      })
    });
    expect(normalized.subject).toBe('Invoice X-Injected: yes');
    expect(normalized.rawProviderMetadata.snippet).toBe('safe X-Injected: yes .exe');
    expect(normalized.attachments[0]).toMatchObject({
      filename: 'html.exe',
      mimeType: 'application/octet-stream',
      contentDisposition: 'attachment'
    });
    expect(normalized.attachments[0]!.contentReference).not.toContain('..');
  });

  it('represents unsafe or unsupported addresses explicitly without poisoning reconciliation', async () => {
    const normalized = await normalizeGmailMessage({
      userId: '00000000-0000-4000-8000-000000000001',
      connectedAccountId: '00000000-0000-4000-8000-000000000002',
      accountEmail: 'owner@example.com',
      message: message('message-address', {
        payload: {
          headers: [
            {name: 'From', value: 'sender@example.com\r\nBcc: victim@example.com'},
            {name: 'To', value: 'not-an-address'}
          ]
        }
      })
    });
    expect(normalized.sender).toMatchObject({
      displayName: 'Unsupported provider address',
      derivedMetadata: {providerRepresentation: 'UNSUPPORTED_RFC5322_ADDRESS'}
    });
    expect(normalized.recipients).toEqual([]);
    expect(normalized.rawProviderMetadata.normalization).toMatchObject({status: 'PARTIAL'});
    expect(normalized.rawProviderMetadata.normalization.unsupported).toEqual(expect.arrayContaining([
      'FROM_HEADER_UNSAFE', 'TO_ADDRESS_UNSUPPORTED'
    ]));
  });

  it('parses quoted comments and RFC 5322 groups without splitting display-name commas', async () => {
    const normalized = await normalizeGmailMessage({
      userId: '00000000-0000-4000-8000-000000000001',
      connectedAccountId: '00000000-0000-4000-8000-000000000002',
      accountEmail: 'owner@example.com',
      message: message('message-addresses', {
        payload: {
          headers: [
            {name: 'From', value: '"Doe, Jane" (Sales) <jane@example.com>'},
            {name: 'To', value: 'Team: Owner <owner@example.com>, Other <other@example.com>;'}
          ],
          mimeType: 'text/plain',
          body: {data: Buffer.from('hello').toString('base64url')}
        }
      })
    });
    expect(normalized.sender).toMatchObject({email: 'jane@example.com', displayName: 'Doe, Jane'});
    expect(normalized.recipients.map(({email}) => email)).toEqual(['owner@example.com', 'other@example.com']);
  });

  it('preserves sanitized HTML-only body evidence', async () => {
    const normalized = await normalizeGmailMessage({
      userId: '00000000-0000-4000-8000-000000000001',
      connectedAccountId: '00000000-0000-4000-8000-000000000002',
      accountEmail: 'owner@example.com',
      message: message('message-html', {
        payload: {
          mimeType: 'text/html',
          headers: [{name: 'From', value: 'sender@example.com'}],
          body: {data: Buffer.from('<p>Hello <strong>world</strong><script>alert(1)</script></p>').toString('base64url')}
        }
      })
    });
    expect(normalized.textBody).toBeUndefined();
    expect(normalized.sanitizedHtmlBody).toBe('<p>Hello <strong>world</strong></p>');
    expect(normalized.rawProviderMetadata.normalization.bodyState).toBe('INLINE');
  });

  it('fetches externalized text as body evidence and does not misclassify it as an attachment', async () => {
    const loadBodyPart = vi.fn(async () => ({
      data: Buffer.from('externalized body').toString('base64url'),
      size: 17
    }));
    const normalized = await normalizeGmailMessage({
      userId: '00000000-0000-4000-8000-000000000001',
      connectedAccountId: '00000000-0000-4000-8000-000000000002',
      accountEmail: 'owner@example.com',
      message: message('message-external-body', {
        payload: {
          mimeType: 'multipart/alternative',
          headers: [{name: 'From', value: 'sender@example.com'}],
          parts: [{
            partId: '1', mimeType: 'text/plain', filename: '',
            body: {attachmentId: 'body-attachment-id', size: 17}
          }]
        }
      }),
      loadBodyPart
    });
    expect(loadBodyPart).toHaveBeenCalledWith('body-attachment-id');
    expect(normalized.textBody).toBe('externalized body');
    expect(normalized.attachments).toEqual([]);
    expect(normalized.rawProviderMetadata.normalization.bodyState).toBe('PROVIDER_FETCHED');
  });

  it('uses Gmail SENT evidence for messages sent from an account alias', async () => {
    const normalized = await normalizeGmailMessage({
      userId: '00000000-0000-4000-8000-000000000001',
      connectedAccountId: '00000000-0000-4000-8000-000000000002',
      accountEmail: 'primary@example.com',
      message: message('message-alias', {
        labelIds: ['SENT'],
        payload: {
          mimeType: 'text/plain',
          headers: [{name: 'From', value: 'Alias <alias@example.com>'}],
          body: {data: Buffer.from('sent from alias').toString('base64url')}
        }
      })
    });
    expect(normalized.direction).toBe('OUTBOUND');
  });
});

describe('G20 authenticated Pub/Sub ingress', () => {
  function jwt(audience: string, kid = 'key-1') {
    const {privateKey, publicKey} = generateKeyPairSync('rsa', {modulusLength: 2048});
    const header = Buffer.from(JSON.stringify({alg: 'RS256', kid})).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({
      iss: 'https://accounts.google.com',
      aud: audience,
      exp: now + 300,
      iat: now,
      email: environment.pubsubServiceAccount,
      email_verified: true
    })).toString('base64url');
    const signature = sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), privateKey).toString('base64url');
    return {
      token: `${header}.${payload}.${signature}`,
      jwk: {...publicKey.export({format: 'jwk'}), kid, alg: 'RS256', use: 'sig'}
    };
  }

  it('verifies Google OIDC claims and durably deduplicates notifications', async () => {
    const signed = jwt(environment.pubsubAudience);
    const verifier = new GooglePubSubJwtVerifier(
      environment.pubsubAudience,
      environment.pubsubServiceAccount,
      vi.fn(async () => new Response(JSON.stringify({keys: [signed.jwk]}), {
        status: 200,
        headers: {'cache-control': 'max-age=300'}
      }))
    );
    const delivered = new Set<string>();
    const repository = {
      findConnectedAccountsByEmail: vi.fn(async () => [{id: 'account-a', userId: 'user-a'}]),
      enqueueSignal: vi.fn(async ({deliveryKey}: {deliveryKey: string}) => {
        if (delivered.has(deliveryKey)) return false;
        delivered.add(deliveryKey);
        return true;
      })
    };
    const ingress = new GmailPushIngress(verifier, repository as never);
    const body = {
      message: {
        messageId: 'delivery-1',
        data: Buffer.from(JSON.stringify({emailAddress: 'owner@example.com', historyId: '123'})).toString('base64')
      }
    };
    await expect(ingress.accept(`Bearer ${signed.token}`, body)).resolves.toBe('ENQUEUED');
    await expect(ingress.accept(`Bearer ${signed.token}`, body)).resolves.toBe('DUPLICATE');
    expect(repository.enqueueSignal).toHaveBeenCalledWith(expect.objectContaining({reason: 'PUSH', hintedHistoryId: '123'}));
  });

  it('rejects a correctly signed token for the wrong audience', async () => {
    const signed = jwt('https://wrong.example');
    const verifier = new GooglePubSubJwtVerifier(
      environment.pubsubAudience,
      environment.pubsubServiceAccount,
      vi.fn(async () => new Response(JSON.stringify({keys: [signed.jwk]}), {status: 200}))
    );
    await expect(verifier.verify(`Bearer ${signed.token}`)).rejects.toMatchObject({
      code: 'INVALID_PUBSUB_JWT_CLAIMS'
    });
  });

  it('refreshes cached Google keys once when a rotated kid first appears', async () => {
    const old = jwt(environment.pubsubAudience, 'old-key');
    const rotated = jwt(environment.pubsubAudience, 'rotated-key');
    const request = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({keys: [old.jwk]}), {
        status: 200, headers: {'cache-control': 'max-age=3600'}
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({keys: [rotated.jwk]}), {
        status: 200, headers: {'cache-control': 'max-age=3600'}
      }));
    const verifier = new GooglePubSubJwtVerifier(
      environment.pubsubAudience,
      environment.pubsubServiceAccount,
      request
    );
    await expect(verifier.verify(`Bearer ${rotated.token}`)).resolves.toMatchObject({
      email: environment.pubsubServiceAccount
    });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('fails shut after one JWKS refresh when an unknown kid remains unknown', async () => {
    const known = jwt(environment.pubsubAudience, 'known-key');
    const unknown = jwt(environment.pubsubAudience, 'unknown-key');
    const request = vi.fn(async () => new Response(JSON.stringify({keys: [known.jwk]}), {status: 200}));
    const verifier = new GooglePubSubJwtVerifier(
      environment.pubsubAudience,
      environment.pubsubServiceAccount,
      request
    );
    await expect(verifier.verify(`Bearer ${unknown.token}`)).rejects.toMatchObject({
      code: 'UNKNOWN_PUBSUB_JWT_KEY'
    });
    expect(request).toHaveBeenCalledTimes(2);
  });
});

function syncRepository(cursor: string | null = '100') {
  const state: {
    cursor: string | null;
    contextCalls: number;
    bootstrap: {
      baselineHistoryId: string;
      pageToken: string | null;
      pageOffset: number;
      processedMessageCount: number;
    } | null;
  } = {cursor, contextCalls: 0, bootstrap: null};
  return {
    state,
    getSyncContext: vi.fn(async () => ({
      userId: 'user-a',
      connectedAccountId: 'account-a',
      emailAddress: 'owner@example.com',
      connectionState: 'CONNECTED',
      cursor: state.cursor,
      syncGeneration: 1,
      watchExpirationAt: new Date(Date.now() + 7 * 86400_000)
    })),
    setSyncStatus: vi.fn(async () => undefined),
    advanceCursor: vi.fn(async ({expectedCursor, nextCursor}: {expectedCursor: string | null; nextCursor: string}) => {
      if (state.cursor !== expectedCursor) return false;
      state.cursor = nextCursor;
      return true;
    }),
    saveWatch: vi.fn(async () => undefined),
    invalidateCredential: vi.fn(async () => undefined),
    enqueueSignal: vi.fn(async () => true),
    listDueAccountIds: vi.fn(async (): Promise<readonly {id: string; reason: 'SAFETY' | 'WATCH_RENEWAL'}[]> => []),
    claimSignals: vi.fn(async () => []),
    completeSignal: vi.fn(async () => undefined),
    failSignal: vi.fn(async () => undefined),
    getBootstrapState: vi.fn(async () => state.bootstrap),
    saveBootstrapState: vi.fn(async (input: {
      baselineHistoryId: string;
      pageToken: string | null;
      pageOffset: number;
      processedMessageCount: number;
    }) => {
      state.bootstrap = {
        baselineHistoryId: input.baselineHistoryId,
        pageToken: input.pageToken,
        pageOffset: input.pageOffset,
        processedMessageCount: input.processedMessageCount
      };
    }),
    deleteBootstrapState: vi.fn(async () => { state.bootstrap = null; })
  };
}

function evidenceWriter(events: string[] = []) {
  const ids = new Set<string>();
  const absent = new Set<string>();
  return {
    ids,
    absent,
    upsertNormalizedMessage: vi.fn(async (input: {providerMessageId: string}) => {
      events.push(`upsert:${input.providerMessageId}`);
      ids.add(input.providerMessageId);
      absent.delete(input.providerMessageId);
    }),
    listProviderMessageIds: vi.fn(async () => [...ids]),
    markNormalizedMessageAbsent: vi.fn(async ({providerMessageId}: {providerMessageId: string}) => {
      events.push(`absent:${providerMessageId}`);
      if (!ids.has(providerMessageId)) return false;
      absent.add(providerMessageId);
      return true;
    })
  };
}

function credentials(accessToken = 'access') {
  return {getAccessToken: vi.fn(async () => accessToken)};
}

const signal = (reason: 'INITIAL' | 'PUSH' | 'SAFETY' | 'WATCH_RENEWAL' = 'PUSH') => ({
  id: 'signal-a', connectedAccountId: 'account-a', reason, hintedHistoryId: '999', attempts: 1
});

describe('G20 watch/history reconciliation oracles', () => {
  it('commits normalized evidence before advancing the cursor and ignores push hints as truth', async () => {
    const events: string[] = [];
    const repository = syncRepository('100');
    repository.advanceCursor.mockImplementation(async ({expectedCursor, nextCursor}) => {
      events.push(`cursor:${nextCursor}`);
      if (repository.state.cursor !== expectedCursor) return false;
      repository.state.cursor = nextCursor;
      return true;
    });
    const evidence = evidenceWriter(events);
    const service = new GmailSyncService(environment.pubsubTopic, provider({
      listHistory: vi.fn(async () => ({
        history: [{id: '105', messagesAdded: [{message: {id: 'message-1'}}]}],
        historyId: '105'
      }))
    }), credentials() as never, repository as never, evidence as never);
    await service.reconcile(signal());
    expect(events).toEqual(['upsert:message-1', 'cursor:105']);
    expect(repository.state.cursor).toBe('105');
  });

  it('converges duplicate and delayed notifications through the persisted cursor', async () => {
    const repository = syncRepository('100');
    const evidence = evidenceWriter();
    const history = vi.fn(async (_token: string, cursor: string): Promise<GmailHistoryPage> =>
      cursor === '100'
        ? {history: [{messagesAdded: [{message: {id: 'message-1'}}]}], historyId: '105'}
        : {history: [], historyId: '105'}
    );
    const service = new GmailSyncService(environment.pubsubTopic, provider({listHistory: history}), credentials() as never, repository as never, evidence as never);
    await service.reconcile(signal());
    await service.reconcile(signal());
    expect(evidence.ids).toEqual(new Set(['message-1']));
    expect(history.mock.calls.map((call) => call[1])).toEqual(['100', '105']);
    expect(repository.state.cursor).toBe('105');
  });

  it('performs explicit complete recovery on stale history and tombstones missing Source evidence', async () => {
    const repository = syncRepository('stale-100');
    const evidence = evidenceWriter();
    evidence.ids.add('deleted-message');
    const providerClient = provider({
      listHistory: vi.fn(async () => { throw new GmailProviderError(404, 'NOT_FOUND'); }),
      getProfile: vi.fn(async () => ({emailAddress: 'owner@example.com', historyId: '200'})),
      listMessages: vi.fn(async (): Promise<GmailMessageListPage> => ({messages: [{id: 'current-message'}]}))
    });
    const service = new GmailSyncService(environment.pubsubTopic, providerClient, credentials() as never, repository as never, evidence as never);
    await service.reconcile(signal('SAFETY'));
    expect(evidence.ids).toEqual(new Set(['deleted-message', 'current-message']));
    expect(evidence.absent).toEqual(new Set(['deleted-message']));
    expect(evidence.markNormalizedMessageAbsent).toHaveBeenCalledWith(expect.objectContaining({providerMessageId: 'deleted-message'}));
    expect(repository.state.cursor).toBe('200');
    expect(repository.setSyncStatus).toHaveBeenCalledWith(expect.objectContaining({
      status: 'RECONCILIATION_REQUIRED', lastErrorCode: 'STALE_HISTORY'
    }));
  });

  it('renews watch and bounds initial historical ingestion without creating Responsibilities', async () => {
    const repository = syncRepository(null);
    const evidence = evidenceWriter();
    const providerClient = provider({
      watch: vi.fn(async (): Promise<GmailWatch> => ({historyId: '300', expiration: String(Date.now() + 86400_000)})),
      listMessages: vi.fn(async () => ({messages: [{id: 'recent-1'}, {id: 'recent-2'}]})),
      listHistory: vi.fn(async () => ({historyId: '300'}))
    });
    const service = new GmailSyncService(environment.pubsubTopic, providerClient, credentials() as never, repository as never, evidence as never);
    await service.reconcile(signal('INITIAL'));
    expect(providerClient.watch).toHaveBeenCalledWith('access', environment.pubsubTopic);
    expect(evidence.ids).toEqual(new Set(['recent-1', 'recent-2']));
    expect(repository.state.cursor).toBe('300');
    expect(repository.saveWatch).toHaveBeenCalled();
  });

  it('persists incomplete bootstrap coverage and resumes before publishing a healthy cursor', async () => {
    const repository = syncRepository(null);
    const evidence = evidenceWriter();
    const page = Array.from({length: 251}, (_, index) => ({id: `message-${index}`}));
    const providerClient = provider({
      watch: vi.fn(async (): Promise<GmailWatch> => ({historyId: '300', expiration: String(Date.now() + 86400_000)})),
      listMessages: vi.fn(async () => ({messages: page})),
      listHistory: vi.fn(async () => ({historyId: '305'}))
    });
    const service = new GmailSyncService(environment.pubsubTopic, providerClient, credentials() as never, repository as never, evidence as never);

    await service.reconcile(signal('INITIAL'));
    expect(evidence.ids.size).toBe(250);
    expect(repository.state.cursor).toBeNull();
    expect(repository.state.bootstrap).toMatchObject({
      baselineHistoryId: '300', pageOffset: 250, processedMessageCount: 250
    });
    expect(repository.setSyncStatus).toHaveBeenCalledWith(expect.objectContaining({
      status: 'RECONCILIATION_REQUIRED', lastErrorCode: 'BOOTSTRAP_INCOMPLETE'
    }));
    expect(repository.enqueueSignal).toHaveBeenCalledWith(expect.objectContaining({reason: 'INITIAL'}));

    await service.reconcile(signal('INITIAL'));
    expect(evidence.ids.size).toBe(251);
    expect(repository.state.bootstrap).toBeNull();
    expect(repository.state.cursor).toBe('305');
    expect(providerClient.watch).toHaveBeenCalledTimes(1);
    expect(providerClient.listHistory).toHaveBeenCalledWith('access', '300', undefined);
  });

  it('finishes an exactly full final bootstrap batch without replaying it', async () => {
    const repository = syncRepository(null);
    const evidence = evidenceWriter();
    const providerClient = provider({
      watch: vi.fn(async (): Promise<GmailWatch> => ({historyId: '400', expiration: String(Date.now() + 86400_000)})),
      listMessages: vi.fn(async () => ({
        messages: Array.from({length: 250}, (_, index) => ({id: `exact-${index}`}))
      })),
      listHistory: vi.fn(async () => ({historyId: '401'}))
    });
    const service = new GmailSyncService(environment.pubsubTopic, providerClient, credentials() as never, repository as never, evidence as never);
    await service.reconcile(signal('INITIAL'));
    expect(evidence.ids.size).toBe(250);
    expect(repository.state.cursor).toBe('401');
    expect(repository.state.bootstrap).toBeNull();
    expect(providerClient.listMessages).toHaveBeenCalledTimes(1);
  });

  it('periodically enqueues safety work even when push is dropped', async () => {
    const repository = syncRepository('100');
    repository.listDueAccountIds.mockResolvedValue([{id: 'account-a', reason: 'SAFETY'}]);
    const service = new GmailSyncService(environment.pubsubTopic, provider(), credentials() as never, repository as never, evidenceWriter() as never);
    await expect(service.enqueueDueWork(new Date('2026-09-04T00:00:00Z'))).resolves.toBe(1);
    expect(repository.enqueueSignal).toHaveBeenCalledWith(expect.objectContaining({reason: 'SAFETY'}));
  });
});

describe('G20 attachment evidence access', () => {
  it('defensively prevents response-header and path metadata injection', () => {
    expect(safeDownloadFilename('../invoice\r\nContent-Type: text/html')).toBe('html');
    expect(safeDownloadFilename('..')).toBe('attachment');
    expect(safeDownloadMimeType('text/html\r\nX-Test: yes')).toBe('application/octet-stream');
    expect(safeDownloadMimeType('Application/PDF')).toBe('application/pdf');
  });

  it('checks ownership before provider access and preserves provider security blocks', async () => {
    const providerClient = provider({
      getAttachment: vi.fn(async () => { throw new GmailProviderError(403, 'FORBIDDEN'); })
    });
    const credentialService = {...credentials(), markReconnectRequired: vi.fn(async () => undefined)};
    const ownedRepository = {
      getOwnedAttachment: vi.fn(async () => ({
        providerMessageId: 'message-a',
        providerAttachmentId: 'attachment-a',
        filename: 'blocked.exe',
        mimeType: 'application/octet-stream',
        sizeBytes: 12
      }))
    };
    const service = new GmailAttachmentService(providerClient, credentialService as never, ownedRepository);
    await expect(service.fetch({userId: 'user-a', connectedAccountId: 'account-a', attachmentId: 'attachment-a'}))
      .rejects.toMatchObject({code: 'PROVIDER_SECURITY_BLOCK'});

    const unowned = new GmailAttachmentService(providerClient, credentialService as never, {
      getOwnedAttachment: vi.fn(async () => null)
    });
    await expect(unowned.fetch({userId: 'user-b', connectedAccountId: 'account-a', attachmentId: 'attachment-a'}))
      .rejects.toMatchObject({code: 'ATTACHMENT_NOT_FOUND'});
    expect(credentialService.getAccessToken).toHaveBeenCalledTimes(1);
  });

  it('marks the account for reconnect when attachment authority is lost', async () => {
    const providerClient = provider({
      getAttachment: vi.fn(async () => { throw new GmailProviderError(401, 'UNAUTHENTICATED'); })
    });
    const credentialService = {...credentials(), markReconnectRequired: vi.fn(async () => undefined)};
    const service = new GmailAttachmentService(providerClient, credentialService as never, {
      getOwnedAttachment: vi.fn(async () => ({
        providerMessageId: 'message-a', providerAttachmentId: 'attachment-a',
        filename: 'evidence.pdf', mimeType: 'application/pdf', sizeBytes: 12
      }))
    });
    await expect(service.fetch({userId: 'user-a', connectedAccountId: 'account-a', attachmentId: 'attachment-a'}))
      .rejects.toMatchObject({status: 401});
    expect(credentialService.markReconnectRequired).toHaveBeenCalledWith('user-a', 'account-a');
  });
});
