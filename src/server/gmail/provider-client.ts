import type {
  GmailHistoryPage,
  GmailMessage,
  GmailMessageListPage,
  GmailProfile,
  GmailProviderClient,
  GmailTokenSet,
  GmailWatch
} from './types';
import {GmailProviderError} from './types';

type ProviderClientConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  fetch?: typeof fetch;
};

function providerCode(status: number, payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const candidate = payload as {error?: string | {status?: string}};
    if (typeof candidate.error === 'string') return candidate.error;
    if (candidate.error?.status) return candidate.error.status;
  }
  return `HTTP_${status}`;
}

export class GoogleGmailClient implements GmailProviderClient {
  private readonly request: typeof fetch;

  constructor(private readonly config: ProviderClientConfig) {
    this.request = config.fetch ?? fetch;
  }

  private async json<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await this.request(url, init);
    const payload = await response.json().catch(() => null) as unknown;
    if (!response.ok) {
      throw new GmailProviderError(response.status, providerCode(response.status, payload));
    }
    return payload as T;
  }

  private authorized<T>(accessToken: string, url: URL | string, init: RequestInit = {}): Promise<T> {
    return this.json<T>(url.toString(), {
      ...init,
      headers: {...init.headers, Authorization: `Bearer ${accessToken}`}
    });
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<GmailTokenSet & {scope: string}> {
    const payload = await this.json<{
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
      scope?: string;
    }>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri
      })
    });
    if (!payload.access_token || !payload.refresh_token) {
      throw new GmailProviderError(401, 'OFFLINE_ACCESS_NOT_GRANTED');
    }
    return {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: Date.now() + payload.expires_in * 1000,
      tokenType: 'Bearer',
      scope: payload.scope ?? ''
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.json<{
      access_token: string;
      expires_in: number;
      token_type: string;
      refresh_token?: string;
    }>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    return {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: Date.now() + payload.expires_in * 1000,
      tokenType: 'Bearer' as const
    };
  }

  async revoke(token: string): Promise<void> {
    const response = await this.request('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({token})
    });
    if (!response.ok && response.status !== 400) {
      throw new GmailProviderError(response.status, `HTTP_${response.status}`);
    }
  }

  getProfile(accessToken: string): Promise<GmailProfile> {
    return this.authorized(accessToken, 'https://gmail.googleapis.com/gmail/v1/users/me/profile');
  }

  watch(accessToken: string, topicName: string): Promise<GmailWatch> {
    return this.authorized(accessToken, 'https://gmail.googleapis.com/gmail/v1/users/me/watch', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({topicName})
    });
  }

  listMessages(accessToken: string, pageToken?: string): Promise<GmailMessageListPage> {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.set('maxResults', '100');
    url.searchParams.set('includeSpamTrash', 'true');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    return this.authorized(accessToken, url);
  }

  getMessage(accessToken: string, messageId: string): Promise<GmailMessage> {
    const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}`);
    url.searchParams.set('format', 'full');
    return this.authorized(accessToken, url);
  }

  listHistory(accessToken: string, startHistoryId: string, pageToken?: string): Promise<GmailHistoryPage> {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/history');
    url.searchParams.set('startHistoryId', startHistoryId);
    url.searchParams.set('maxResults', '500');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    return this.authorized(accessToken, url);
  }

  getAttachment(accessToken: string, messageId: string, attachmentId: string) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`;
    return this.authorized<{data: string; size?: number}>(accessToken, url);
  }
}
