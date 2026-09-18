import {afterEach, describe, expect, it, vi} from 'vitest';
import {beginGoogleSignIn} from '@/lib/google-sign-in';

const social = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth-client', () => ({authClient: {signIn: {social}}}));

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); social.mockReset(); });

function setup() {
  const popup = {closed: false, close: vi.fn(), location: {replace: vi.fn()}};
  vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
  social.mockResolvedValue({data: {url: 'https://accounts.google.com/o/oauth2/v2/auth?state=fixture'}, error: null});
  return popup;
}

describe('Google authentication window', () => {
  it('waits for the correct window and same origin without navigating the working document', async () => {
    const popup = setup();
    const result = beginGoogleSignIn('en');
    await vi.waitFor(() => expect(popup.location.replace).toHaveBeenCalled());
    let finished = false;
    void result.then(() => { finished = true; });
    const notify = (origin: string, source: Window | null) => window.dispatchEvent(new MessageEvent('message', {
      origin, source, data: {type: 'lunowa:auth-callback', failed: false}
    }));
    notify('https://evil.invalid', popup as unknown as Window);
    notify(window.location.origin, null);
    await Promise.resolve();
    expect(finished).toBe(false);
    notify(window.location.origin, popup as unknown as Window);
    await result;
    expect(social).toHaveBeenCalledWith(expect.objectContaining({provider: 'google', callbackURL: '/en?auth=returned', errorCallbackURL: '/en?auth=failed', disableRedirect: true}));
    expect(popup.close).toHaveBeenCalledOnce();
  });

  it('rejects a blocked popup before initiating OAuth', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    await expect(beginGoogleSignIn('ja')).rejects.toThrow('AUTH_WINDOW_BLOCKED');
    expect(social).not.toHaveBeenCalled();
  });

  it('rejects a non-Google destination', async () => {
    const popup = setup();
    social.mockResolvedValue({data: {url: 'https://evil.invalid'}, error: null});
    await expect(beginGoogleSignIn('ja')).rejects.toThrow('INVALID_AUTH_DESTINATION');
    expect(popup.location.replace).not.toHaveBeenCalled();
    expect(popup.close).toHaveBeenCalledOnce();
  });

  it('unlocks cancellation even if the initiation request never finishes', async () => {
    vi.useFakeTimers();
    const popup = setup();
    social.mockReturnValue(new Promise(() => {}));
    const result = expect(beginGoogleSignIn('ja')).rejects.toThrow('AUTH_WINDOW_CLOSED');
    popup.closed = true;
    await vi.advanceTimersByTimeAsync(500);
    await result;
    expect(vi.getTimerCount()).toBe(0);
    expect(social.mock.calls[0][0].fetchOptions.signal.aborted).toBe(true);
  });
});
