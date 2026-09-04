import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signOut: vi.fn(),
  signInEmail: vi.fn(),
  signUpEmail: vi.fn()
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: authMocks.getSession,
    signOut: authMocks.signOut,
    signIn: {email: authMocks.signInEmail},
    signUp: {email: authMocks.signUpEmail}
  }
}));

import {AuthBoundary} from '@/components/auth-boundary';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const appSession = {
  session: {
    id: '735cad1c-a617-4985-9e18-8ff3c8fc5190',
    userId: 'f5ab470d-97e3-44d3-a1e1-2575744152a2',
    token: 'test-token',
    expiresAt: new Date('2030-01-02T00:00:00.000Z'),
    createdAt: new Date('2030-01-01T00:00:00.000Z'),
    updatedAt: new Date('2030-01-01T00:00:00.000Z')
  },
  user: {
    id: 'f5ab470d-97e3-44d3-a1e1-2575744152a2',
    name: 'Race User',
    email: 'race@example.invalid',
    emailVerified: false,
    image: null,
    createdAt: new Date('2030-01-01T00:00:00.000Z'),
    updatedAt: new Date('2030-01-01T00:00:00.000Z')
  }
};

describe('application session currentness', () => {
  it('does not let an older session check undo confirmed sign-out', async () => {
    let resolveStaleCheck: ((result: {data: typeof appSession; error: null}) => void) | undefined;
    authMocks.getSession
      .mockResolvedValueOnce({data: appSession, error: null})
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveStaleCheck = resolve;
      }));
    authMocks.signOut.mockResolvedValue({data: {success: true}, error: null});

    render(<AuthBoundary />);
    await screen.findByTestId('lunowa-shell');
    fireEvent.click(screen.getByRole('button', {name: '設定を表示'}));

    window.dispatchEvent(new Event('focus'));
    await waitFor(() => expect(authMocks.getSession).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole('button', {name: 'この端末からログアウト'}));
    await screen.findByText(/この端末からログアウトしました。Lunowaの監視設定は変更されていません/);

    resolveStaleCheck?.({data: appSession, error: null});
    await waitFor(() => expect(screen.getByRole('heading', {name: 'Lunowaにサインイン'})).toBeVisible());
    expect(screen.queryByTestId('lunowa-shell')).not.toBeInTheDocument();
  });
});
