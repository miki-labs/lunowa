// @vitest-environment node
import {betterAuth} from 'better-auth';
import {memoryAdapter} from 'better-auth/adapters/memory';
import {describe, expect, it} from 'vitest';
import {createAppAuth} from '@/server/auth/auth';

function testAuth() {
  const production = createAppAuth({} as never, {
    secret: 'local-contract-test-secret-at-least-32-characters',
    baseURL: 'http://localhost:3000',
    google: {clientId: 'fixture-client', clientSecret: 'fixture-secret'}
  });
  // Exercise the same endpoint policy using disposable memory persistence.
  return betterAuth({...production.options, database: memoryAdapter({user: [], account: [], session: [], verification: []})});
}

describe('identity-only Google consent', () => {
  it('requests only identity scopes and no durable Google grant', async () => {
    const auth = testAuth();
    const response = await auth.handler(new Request('http://localhost:3000/api/auth/sign-in/social', {
      method: 'POST', headers: {'content-type': 'application/json', origin: 'http://localhost:3000'},
      body: JSON.stringify({provider: 'google', callbackURL: '/ja?auth=returned', disableRedirect: true})
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    const url = new URL(body.url);
    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.searchParams.get('scope')?.split(' ').sort()).toEqual(['email', 'openid', 'profile']);
    expect(url.searchParams.get('access_type')).toBe('online');
    // Google defaults to false when omitted; Better Auth omits false values.
    expect(url.searchParams.get('include_granted_scopes')).toBeNull();
    expect(url.searchParams.get('state')).toBeTruthy();
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/callback/google');
  });

  it.each([
    ['/sign-in/social', {provider: 'google', scopes: ['https://www.googleapis.com/auth/gmail.readonly']}],
    ['/sign-in/social', {provider: 'google', additionalParams: {scope: 'https://mail.google.com/'}}],
    ['/sign-in/social', {provider: 'google', idToken: {token: 'untrusted'}}],
    ['/sign-in/social', {provider: 'apple'}],
    ['/link-social', {provider: 'google', scopes: ['https://mail.google.com/']}],
    ['/sign-in/email', {email: 'test@example.invalid', password: 'not-supported'}],
    ['/sign-up/email', {name: 'Test', email: 'test@example.invalid', password: 'not-supported'}]
  ])('rejects unsupported initiation %s %j', async (path, body) => {
    const response = await testAuth().handler(new Request(`http://localhost:3000/api/auth${path}`, {
      method: 'POST', headers: {'content-type': 'application/json', origin: 'http://localhost:3000'}, body: JSON.stringify(body)
    }));
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(await response.text()).not.toContain('accounts.google.com');
  });
});
