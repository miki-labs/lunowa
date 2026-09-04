import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {SessionEntry} from '@/components/auth-boundary';
import {LunowaShell} from '@/components/lunowa-shell';

afterEach(cleanup);

describe('UI-01 application session boundary', () => {
  it('presents app sign-in separately from mailbox authorization', () => {
    render(<SessionEntry reason="signed-out" onAuthenticate={vi.fn()} />);
    expect(screen.getByRole('heading', {name: 'Lunowaにサインイン'})).toBeInTheDocument();
    expect(screen.getByText(/メールボックスの接続は、サインイン後に別の操作/)).toBeInTheDocument();
    expect(screen.queryByText(/Google/)).not.toBeInTheDocument();
  });

  it('submits sign-in and account-creation credentials through distinct modes', async () => {
    const authenticate = vi.fn().mockResolvedValue(undefined);
    render(<SessionEntry reason="signed-out" onAuthenticate={authenticate} />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), {target: {value: 'user@example.invalid'}});
    fireEvent.change(screen.getByLabelText('パスワード'), {target: {value: 'password-123'}});
    fireEvent.click(screen.getByRole('button', {name: 'サインインする'}));
    await waitFor(() => expect(authenticate).toHaveBeenCalledWith('sign-in', {
      name: '', email: 'user@example.invalid', password: 'password-123'
    }));

    fireEvent.click(screen.getByRole('button', {name: /アカウントを作成/}));
    fireEvent.change(screen.getByLabelText('名前'), {target: {value: 'Lunowa User'}});
    fireEvent.change(screen.getByLabelText('メールアドレス'), {target: {value: 'new@example.invalid'}});
    fireEvent.change(screen.getByLabelText('パスワード'), {target: {value: 'new-password-123'}});
    fireEvent.click(screen.getByRole('button', {name: 'アカウントを作成する'}));
    await waitFor(() => expect(authenticate).toHaveBeenLastCalledWith('sign-up', {
      name: 'Lunowa User', email: 'new@example.invalid', password: 'new-password-123'
    }));
  });

  it('explains expiry and confirmed sign-out without claiming monitoring stopped', () => {
    const {rerender} = render(<SessionEntry reason="session-expired" onAuthenticate={vi.fn()} />);
    expect(screen.getByRole('heading', {name: 'セッションの期限が切れました'})).toBeInTheDocument();
    expect(screen.getByText(/サーバー側の監視が停止したことは意味しません/)).toBeInTheDocument();

    rerender(<SessionEntry reason="signed-out" signedOutConfirmed onAuthenticate={vi.fn()} />);
    expect(screen.getByText(/この端末からログアウトしました。Lunowaの監視設定は変更されていません/)).toBeInTheDocument();
  });
});

describe('UI-17 settings account actions', () => {
  it('labels app sign-out separately from mailbox connection and preserves its consequence', () => {
    render(<LunowaShell appUser={{name: 'User', email: 'user@example.invalid'}} onSignOut={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', {name: '設定を表示'}));
    expect(screen.getByRole('button', {name: 'この端末からログアウト'})).toBeInTheDocument();
    expect(screen.getByText(/ログアウトしても、メール連携は解除されず/)).toBeInTheDocument();
    expect(screen.getByText('未接続（fixture）')).toBeInTheDocument();
  });
});
