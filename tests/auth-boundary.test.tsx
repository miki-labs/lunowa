import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {SessionEntry} from '@/components/auth-boundary';
import {LunowaShell} from '@/components/lunowa-shell';
import {AuthTestProvider, EnglishAuthTestProvider} from './auth-test-provider';

afterEach(cleanup);

describe('UI-01 application session boundary', () => {
  it('presents app sign-in separately from mailbox authorization', () => {
    render(<SessionEntry reason="signed-out" onAuthenticate={vi.fn()} />, {wrapper: AuthTestProvider});
    expect(screen.getByRole('heading', {name: 'Lunowaへようこそ'})).toBeInTheDocument();
    expect(screen.getByText(/Gmailの読み取りや送信は許可されません/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Google で続行'})).toBeInTheDocument();
    expect(screen.queryByLabelText('パスワード')).not.toBeInTheDocument();
  });

  it('starts Google only once and remains pending until redirect without showing an auth error', async () => {
    const authenticate = vi.fn().mockResolvedValue(undefined);
    render(<SessionEntry reason="signed-out" onAuthenticate={authenticate} />, {wrapper: AuthTestProvider});
    const button = screen.getByRole('button', {name: 'Google で続行'});
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(authenticate).toHaveBeenCalledTimes(1));
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains expiry and confirmed sign-out without claiming monitoring stopped', () => {
    const {rerender} = render(<SessionEntry reason="session-expired" onAuthenticate={vi.fn()} />, {wrapper: AuthTestProvider});
    expect(screen.getByRole('heading', {name: 'もう一度、サインイン'})).toBeInTheDocument();
    expect(screen.getByText(/サーバー側の監視が停止することはありません/)).toBeInTheDocument();

    rerender(<SessionEntry reason="signed-out" signedOutConfirmed onAuthenticate={vi.fn()} />);
    expect(screen.getByText(/この端末からログアウトしました。Lunowaの監視設定は変更されていません/)).toBeInTheDocument();
  });

  it('localizes authentication failure and enables an explicit retry without leaking raw errors', async () => {
    const authenticate = vi.fn().mockRejectedValueOnce(new Error('INTERNAL_SECRET_DETAIL')).mockResolvedValueOnce(undefined);
    render(<SessionEntry reason="signed-out" onAuthenticate={authenticate} />, {wrapper: EnglishAuthTestProvider});
    fireEvent.click(screen.getByRole('button', {name: 'Continue with Google'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t complete Google sign-in.');
    expect(screen.queryByText('INTERNAL_SECRET_DETAIL')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Try again with Google'}));
    await waitFor(() => expect(authenticate).toHaveBeenCalledTimes(2));
  });

  it('serializes session retry and restores the retry button after a failed probe', async () => {
    let finish: (() => void) | undefined;
    const retry = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<SessionEntry reason="auth-error" onRetrySession={retry} />, {wrapper: AuthTestProvider});
    const button = screen.getByRole('button', {name: 'もう一度確認する'});
    fireEvent.click(button); fireEvent.click(button);
    expect(retry).toHaveBeenCalledTimes(1);
    finish?.();
    await waitFor(() => expect(button).toHaveAttribute('aria-busy', 'false'));
    expect(screen.getByRole('alert')).toHaveTextContent('監視設定は変更されていません');
  });
});

describe('UI-17 settings account actions', () => {
  it('labels app sign-out separately from mailbox connection and preserves its consequence', () => {
    render(<LunowaShell appUser={{name: 'User', email: 'user@example.invalid'}} onSignOut={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', {name: '設定を表示'}));
    expect(screen.getByRole('button', {name: 'この端末からログアウト'})).toBeInTheDocument();
    expect(screen.getByText(/ログアウトしても、メール連携は解除されず/)).toBeInTheDocument();
    expect(screen.getByText('未接続（fixture）')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Gmailを接続 / 再接続'})).not.toBeInTheDocument();
  });

  it('exposes the owned Gmail authorize route for an authenticated app user', () => {
    render(<LunowaShell appUser={{id: 'user/1', name: 'User', email: 'user@example.invalid'}} onSignOut={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', {name: '設定を表示'}));

    const connect = screen.getByRole('button', {name: 'Gmailを接続 / 再接続'});
    const form = connect.closest('form');
    expect(form).not.toBeNull();
    expect(form).toHaveAttribute('action', '/api/bff/users/user%2F1/gmail/authorize');
    expect(form).toHaveAttribute('method', 'get');
    expect(form?.querySelector('input[name="returnTo"]')).toHaveAttribute('value', '/ja');
    expect(screen.getByText(/Googleの同意画面へ移動します/)).toBeInTheDocument();
  });
});
