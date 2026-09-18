import {beforeEach, describe, expect, it, vi} from 'vitest';

import {assertOauthBrowserBinding, oauthBrowserCookie} from '@/server/gmail/oauth-browser-binding';

const mocks = vi.hoisted(() => ({
  createAuthorizationUrl: vi.fn(),
  getOwnedAppSession: vi.fn(),
  sessionAccessResponse: vi.fn()
}));

vi.mock('@/server/auth/session', () => ({
  getOwnedAppSession: mocks.getOwnedAppSession,
  sessionAccessResponse: mocks.sessionAccessResponse
}));
vi.mock('@/server/gmail/runtime', () => ({
  createGmailRuntime: vi.fn(() => ({
    authorization: {createAuthorizationUrl: mocks.createAuthorizationUrl}
  }))
}));

import {GET} from '@/app/api/bff/users/[userId]/gmail/authorize/route';

describe('Gmail OAuth authorization route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOwnedAppSession.mockResolvedValue({user: {id: 'user-1'}});
    mocks.sessionAccessResponse.mockReturnValue(null);
  });

  it('returns the callback-scoped browser binding in the external redirect response', async () => {
    const state = 'route-one-time-state';
    const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?state=${state}`;
    mocks.createAuthorizationUrl.mockResolvedValue(authorizationUrl);

    const response = await GET(
      new Request('https://preview.example.com/api/bff/users/user-1/gmail/authorize?returnTo=%2Fja'),
      {params: Promise.resolve({userId: 'user-1'})}
    );
    const binding = oauthBrowserCookie(state);
    const setCookie = response.headers.get('set-cookie');

    expect(mocks.getOwnedAppSession).toHaveBeenCalledWith(expect.any(Headers), 'user-1');
    expect(mocks.createAuthorizationUrl).toHaveBeenCalledWith('user-1', '/ja');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(authorizationUrl);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.has('x-middleware-set-cookie')).toBe(false);
    expect(setCookie).toBe(
      `${binding.name}=${binding.value}; Path=/api/providers/gmail/oauth/callback; ` +
      'Max-Age=600; HttpOnly; SameSite=Lax; Secure'
    );
    expect(() => assertOauthBrowserBinding(state, setCookie?.split(';', 1)[0] ?? null)).not.toThrow();
  });
});
