import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {LunowaShell} from '@/components/lunowa-shell';
import {sanitizeSourceHtml} from '@/lib/source-html';
import {sourcePreview} from '@/server/source/sanitize';
import type {SourceConversationReadModel, SourcePageReadModel} from '@/components/source-types';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const account = {
  id: 'account-1',
  provider: 'gmail',
  providerAccountId: 'provider-account-1',
  emailAddress: 'owner@example.com',
  displayName: 'Work',
  connectionState: 'CONNECTED',
  sync: {
    status: 'HEALTHY',
    lastSuccessAt: '2026-09-06T01:00:00.000Z',
    lastFullReconcileAt: '2026-09-06T00:00:00.000Z',
    dataThroughAt: '2026-09-06T01:00:00.000Z',
    errorCode: null
  }
};

const page: SourcePageReadModel = {
  accounts: [account],
  conversations: [{
    id: 'conversation-1',
    providerThreadId: 'thread-1',
    subject: 'Original provider subject',
    preview: 'The original source body.',
    lastMessageAt: '2026-09-06T01:00:00.000Z',
    messageCount: 1,
    hasAttachments: true,
    account,
    latestSender: {email: 'sender@example.com', displayName: 'Source Sender'}
  }],
  readiness: 'ready',
  dataThroughAt: '2026-09-06T01:00:00.000Z',
  query: {text: '', accountId: null, sender: null, from: null, to: null},
  total: 1,
  nextCursor: null
};

const detail: SourceConversationReadModel = {
  id: 'conversation-1',
  providerThreadId: 'thread-1',
  subject: 'Original provider subject',
  account,
  evidenceRevision: 2,
  messages: [{
    id: 'message-1',
    providerMessageId: 'provider-message-1',
    providerThreadId: 'thread-1',
    direction: 'INBOUND',
    sender: {email: 'sender@example.com', displayName: 'Source Sender'},
    recipients: [{email: 'owner@example.com', displayName: 'Work'}],
    cc: [],
    bcc: [],
    subject: 'Original provider subject',
    textBody: null,
    sanitizedHtmlBody: '<p>Safe source</p><script>window.authority = true</script>',
    occurredAt: '2026-09-06T01:00:00.000Z',
    providerReceivedAt: '2026-09-06T01:00:00.000Z',
    readState: 'READ',
    providerDeletedAt: null,
    attachments: [{
      id: 'attachment-1',
      providerAttachmentId: 'provider-attachment-1',
      filename: 'evidence.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 100,
      contentDisposition: 'attachment',
      contentReference: 'gmail://message-1/provider-attachment-1',
      contentHash: null,
      previewState: 'LOCAL_RENDER_FAILED'
    }]
  }]
};

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {status, headers: {'Content-Type': 'application/json'}});
}

describe('G21 Source safety boundaries', () => {
  it('sanitizes provider HTML to inert formatting and keeps previews deterministic', () => {
    const sanitized = sanitizeSourceHtml('<p onclick="steal()">Hello</p><script>bad()</script><a href="https://evil.invalid">link</a><img src="x">');
    expect(sanitized).toContain('<p>Hello</p>');
    expect(sanitized).not.toMatch(/script|onclick|href|<a|<img/i);
    expect(sourcePreview(null, '<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    expect(sourcePreview('  exact\nsource  ', '<p>unused</p>')).toBe('exact source');
  });

  it('renders an authorized Source list/detail independently and retains search scope on no-match', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/source/conversations/conversation-1')) return jsonResponse(detail);
      if (url.includes('/source/search')) return jsonResponse({
        ...page,
        conversations: [],
        readiness: 'ready',
        query: {text: 'missing evidence', accountId: 'account-1', sender: null, from: null, to: null},
        total: 0
      });
      return jsonResponse(page);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(screen.getByRole('button', {name: '会話を表示'}));
    await waitFor(() => expect(screen.getByRole('button', {name: /Source Sender/})).toBeInTheDocument());
    expect(screen.getAllByText(/gmail · owner@example.com/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', {name: 'すべてのGmail · 1件'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Gmail · Work · owner@example.com · 接続済み'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Gmailを追加'})).toBeInTheDocument();
    const callsBeforeReselect = fetchMock.mock.calls.filter(([input]) => String(input).includes('/source/conversations?')).length;
    fireEvent.click(screen.getByRole('button', {name: /すべて/}));
    expect(screen.getByRole('button', {name: /Source Sender/})).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([input]) => String(input).includes('/source/conversations?'))).toHaveLength(callsBeforeReselect);

    fireEvent.click(screen.getByRole('button', {name: /Source Sender/}));
    await waitFor(() => expect(screen.getByRole('heading', {name: 'Original provider subject'})).toBeInTheDocument());
    expect(screen.getByText('Safe source')).toBeInTheDocument();
    const detailCalls = fetchMock.mock.calls.filter(([input]) => String(input).includes('/source/conversations/conversation-1')).length;
    fireEvent.click(screen.getByRole('button', {name: /Source Sender/}));
    fireEvent.click(screen.getByRole('button', {name: /Source Sender/}));
    expect(screen.getByText('Safe source')).toBeInTheDocument();
    expect(screen.queryByText('Sourceの会話を読み込んでいます。')).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([input]) => String(input).includes('/source/conversations/conversation-1'))).toHaveLength(detailCalls);
    expect(screen.queryByText('window.authority = true')).not.toBeInTheDocument();
    expect(screen.getByText(/この画面でのプレビューに失敗しました/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '送信する'})).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: /一覧に戻る/}));
    fireEvent.click(screen.getByRole('button', {name: '検索を表示'}));
    fireEvent.change(screen.getByLabelText('メールを検索'), {target: {value: 'missing evidence'}});
    fireEvent.change(screen.getByLabelText('検索するアカウント'), {target: {value: 'account-1'}});
    await waitFor(() => expect(screen.getByText(/「missing evidence」に一致する認可されたSourceはありません/)).toBeInTheDocument(), {timeout: 1000});
    expect(screen.getByLabelText('メールを検索')).toHaveValue('missing evidence');
    expect(screen.getByLabelText('検索するアカウント')).toHaveValue('account-1');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('accountId=account-1'), expect.anything());
  });

  it('continues a bounded Source list through its cursor', async () => {
    const secondConversation = {
      ...page.conversations[0],
      id: 'conversation-2',
      subject: 'Second source subject',
      latestSender: {email: 'second@example.com', displayName: 'Second Sender'}
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('cursor=page-2')) {
        return jsonResponse({...page, conversations: [secondConversation], total: 2, nextCursor: null});
      }
      return jsonResponse({...page, total: 2, nextCursor: 'page-2'});
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(screen.getByRole('button', {name: '会話を表示'}));
    await waitFor(() => expect(screen.getByRole('button', {name: '次の会話を読み込む'})).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', {name: '次の会話を読み込む'}));
    await waitFor(() => expect(screen.getByRole('button', {name: /Second Sender/})).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('cursor=page-2'), expect.anything());
  });

  it('rejects an old page response after switching away and back to the same account scope', async () => {
    const account2 = {...account, id: 'account-2', providerAccountId: 'provider-account-2', emailAddress: 'second@example.com', displayName: 'Second'};
    const conversation = (id: string, subject: string, selectedAccount = account) => ({...page.conversations[0], id, subject, account: selectedAccount, latestSender: {email: `${id}@example.com`, displayName: subject}});
    const allPage = {...page, accounts: [account, account2], conversations: [conversation('all-1', 'All mailbox item')], total: 2};
    const scoped = (selectedAccount: typeof account, item: ReturnType<typeof conversation>, nextCursor: string | null = null): SourcePageReadModel => ({
      ...page, accounts: [selectedAccount], conversations: [item], query: {...page.query, accountId: selectedAccount.id}, total: nextCursor ? 2 : 1, nextCursor
    });
    let oldPageSettled = false;
    let releaseOldPage: (response: Response) => void = () => undefined;
    const oldPage = new Promise<Response>((resolve) => { releaseOldPage = resolve; }).then((response) => { oldPageSettled = true; return response; });
    let account1Loads = 0;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), 'https://example.test');
      if (!url.pathname.includes('/source/conversations')) return jsonResponse(page);
      const accountId = url.searchParams.get('accountId');
      if (!accountId) return jsonResponse(allPage);
      if (accountId === account.id && url.searchParams.has('cursor')) return oldPage;
      if (accountId === account.id) {
        account1Loads += 1;
        return jsonResponse(scoped(account, conversation(`account-1-${account1Loads}`, account1Loads === 1 ? 'First account page' : 'Fresh account page'), account1Loads === 1 ? 'old-page-2' : null));
      }
      return jsonResponse(scoped(account2, conversation('account-2-1', 'Second account page', account2)));
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await screen.findByRole('button', {name: /Work/});
    fireEvent.click(screen.getByRole('button', {name: /Work/}));
    await screen.findByRole('button', {name: /First account page/});
    fireEvent.click(screen.getByRole('button', {name: '次の会話を読み込む'}));
    fireEvent.click(screen.getByRole('button', {name: /Second/}));
    await screen.findByRole('button', {name: /Second account page/});
    fireEvent.click(screen.getByRole('button', {name: /Work/}));
    await screen.findByRole('button', {name: /Fresh account page/});

    releaseOldPage(jsonResponse(scoped(account, conversation('stale-page-2', 'Stale old page'))));
    await waitFor(() => expect(oldPageSettled).toBe(true));
    await waitFor(() => expect(screen.getByRole('button', {name: /Fresh account page/})).toBeInTheDocument());
    expect(screen.queryByRole('button', {name: /Stale old page/})).not.toBeInTheDocument();
  });

  it('invalidates a delayed search response when the query is cleared even if fetch ignores abort', async () => {
    let searchSettled = false;
    let releaseSearch: (response: Response) => void = () => undefined;
    const delayedSearch = new Promise<Response>((resolve) => { releaseSearch = resolve; }).then((response) => { searchSettled = true; return response; });
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/source/search')) return delayedSearch;
      return jsonResponse(page);
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(screen.getByRole('button', {name: '検索を表示'}));
    const search = screen.getByLabelText('メールを検索');
    fireEvent.change(search, {target: {value: 'delayed'}});
    await screen.findByText('認可されたSourceを検索しています。');
    fireEvent.change(search, {target: {value: ''}});
    await screen.findByText('検索語を入力すると、認可された会話の原文を検索します。');

    releaseSearch(jsonResponse({...page, conversations: [{...page.conversations[0], id: 'stale-search', subject: 'Stale search result'}], query: {...page.query, text: 'delayed'}}));
    await waitFor(() => expect(searchSettled).toBe(true));
    await waitFor(() => expect(screen.getByText('検索語を入力すると、認可された会話の原文を検索します。')).toBeInTheDocument());
    expect(screen.queryByRole('button', {name: /Stale search result/})).not.toBeInTheDocument();
    expect(screen.getByLabelText('メールを検索')).toHaveValue('');
  });

  it('merges refreshed scoped account truth into the full mailbox registry used by Settings', async () => {
    const secondAccount = {...account, id: 'account-2', providerAccountId: 'provider-account-2', emailAddress: 'second@example.com', displayName: 'Second'};
    const reconnectAccount = {...account, connectionState: 'RECONNECT_REQUIRED', sync: {...account.sync, status: 'RECONCILIATION_REQUIRED', errorCode: 'RECONNECT_REQUIRED'}};
    const allPage: SourcePageReadModel = {...page, accounts: [account, secondAccount], total: 2};
    const scopedPage: SourcePageReadModel = {...page, accounts: [reconnectAccount], conversations: [{...page.conversations[0], account: reconnectAccount}], query: {...page.query, accountId: account.id}};
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), 'https://example.test');
      if (url.pathname.includes('/source/conversations') && url.searchParams.get('accountId') === account.id) return jsonResponse(scopedPage);
      return jsonResponse(allPage);
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    const workAccount = await screen.findByRole('button', {name: 'Gmail · Work · owner@example.com · 接続済み'});
    fireEvent.click(workAccount);
    await screen.findByRole('button', {name: 'Gmail · Work · owner@example.com · 再接続が必要'});
    expect(screen.getByRole('button', {name: 'すべてのGmail'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: '設定を表示'}));
    expect(screen.getByRole('heading', {name: 'owner@example.com'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'second@example.com'})).toBeInTheDocument();
  });

  it('refreshes global mailbox truth after changing a non-selected account in Settings', async () => {
    const secondAccount = {...account, id: 'account-2', providerAccountId: 'provider-account-2', emailAddress: 'second@example.com', displayName: 'Second'};
    const disconnectedSecond = {
      ...secondAccount,
      connectionState: 'DISCONNECTED',
      monitoring: {status: 'disconnected' as const, reasonCode: 'INTENTIONAL_DISCONNECT', lastTrustworthyAt: secondAccount.sync.lastSuccessAt, recoveryAction: null},
      sync: {...secondAccount.sync, status: 'ERROR', errorCode: 'INTENTIONAL_DISCONNECT'}
    };
    let secondDisconnected = false;
    const allPage = (): SourcePageReadModel => ({...page, accounts: [account, secondDisconnected ? disconnectedSecond : secondAccount], total: 2});
    const scopedPage: SourcePageReadModel = {...page, accounts: [account], query: {...page.query, accountId: account.id}};
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), 'https://example.test');
      if (init?.method === 'DELETE' && url.pathname.endsWith('/gmail/accounts/account-2')) {
        secondDisconnected = true;
        return new Response(null, {status: 204});
      }
      if (url.pathname.includes('/source/conversations') && url.searchParams.get('accountId') === account.id) return jsonResponse(scopedPage);
      return jsonResponse(allPage());
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(await screen.findByRole('button', {name: 'Gmail · Work · owner@example.com · 接続済み'}));
    await screen.findByRole('button', {name: 'すべてのGmail'});
    fireEvent.click(screen.getByRole('button', {name: '設定を表示'}));
    const secondSettings = screen.getByRole('heading', {name: 'second@example.com'}).closest('article');
    expect(secondSettings).not.toBeNull();
    fireEvent.click(within(secondSettings!).getByRole('button', {name: 'メール連携を解除する'}));
    fireEvent.click(within(secondSettings!).getByRole('button', {name: '解除を確定する'}));

    await screen.findByRole('button', {name: 'Gmail · Second · second@example.com · 解除済み'});
    expect(within(secondSettings!).getByText('意図的に解除済み')).toBeInTheDocument();
  });

  it('keeps a successful disconnect truthful when the global mailbox refresh fails', async () => {
    const secondAccount = {...account, id: 'account-2', providerAccountId: 'provider-account-2', emailAddress: 'second@example.com', displayName: 'Second'};
    const allPage: SourcePageReadModel = {...page, accounts: [account, secondAccount], total: 2};
    const scopedPage: SourcePageReadModel = {...page, accounts: [account], query: {...page.query, accountId: account.id}};
    let initialAllLoaded = false;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), 'https://example.test');
      if (init?.method === 'DELETE' && url.pathname.endsWith('/gmail/accounts/account-2')) return new Response(null, {status: 204});
      if (url.pathname.includes('/source/conversations') && url.searchParams.get('accountId') === account.id) return jsonResponse(scopedPage);
      if (url.pathname.includes('/source/conversations') && !initialAllLoaded) {
        initialAllLoaded = true;
        return jsonResponse(allPage);
      }
      if (url.pathname.includes('/source/conversations')) return jsonResponse({error: 'unavailable'}, 503);
      return jsonResponse(page);
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(await screen.findByRole('button', {name: 'Gmail · Work · owner@example.com · 接続済み'}));
    await screen.findByRole('button', {name: 'すべてのGmail'});
    fireEvent.click(screen.getByRole('button', {name: '設定を表示'}));
    const secondSettings = screen.getByRole('heading', {name: 'second@example.com'}).closest('article');
    expect(secondSettings).not.toBeNull();
    fireEvent.click(within(secondSettings!).getByRole('button', {name: 'メール連携を解除する'}));
    fireEvent.click(within(secondSettings!).getByRole('button', {name: '解除を確定する'}));

    await screen.findByRole('button', {name: 'Gmail · Second · second@example.com · 解除済み'});
    const retry = await screen.findByRole('button', {name: 'メールボックス状態を再取得'});
    expect(retry).toBeInTheDocument();
    fireEvent.click(retry);
    await screen.findByRole('button', {name: 'メールボックス状態を再取得'});
    expect(screen.getByRole('button', {name: 'Gmail · Second · second@example.com · 解除済み'})).toBeInTheDocument();
  });

  it('surfaces degraded sync on Source detail even when the account remains connected', async () => {
    const degradedAccount = {
      ...account,
      sync: {...account.sync, status: 'ERROR', errorCode: 'HISTORY_GAP'}
    };
    const degradedPage = {
      ...page,
      accounts: [degradedAccount],
      conversations: [{...page.conversations[0], account: degradedAccount}]
    };
    const degradedDetail = {...detail, account: degradedAccount};
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      return String(input).includes('/source/conversations/conversation-1')
        ? jsonResponse(degradedDetail)
        : jsonResponse(degradedPage);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(screen.getByRole('button', {name: '会話を表示'}));
    await waitFor(() => expect(screen.getByRole('button', {name: /Source Sender/})).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', {name: /Source Sender/}));
    await waitFor(() => expect(screen.getByText('Sourceの確認範囲に問題があります')).toBeInTheDocument());
    expect(screen.getByText(/検索結果は全件を表さない可能性があります/)).toBeInTheDocument();
  });

  it('keeps saved Source inspectable after intentional disconnect without claiming active sync', async () => {
    const disconnectedAccount = {
      ...account,
      connectionState: 'DISCONNECTED',
      monitoring: {
        status: 'disconnected' as const,
        reasonCode: 'INTENTIONAL_DISCONNECT',
        lastTrustworthyAt: account.sync.lastSuccessAt,
        recoveryAction: null
      },
      sync: {...account.sync, status: 'ERROR', errorCode: 'INTENTIONAL_DISCONNECT'}
    };
    const disconnectedPage: SourcePageReadModel = {
      ...page,
      accounts: [disconnectedAccount],
      conversations: [{...page.conversations[0], account: disconnectedAccount}],
      readiness: 'unavailable',
      dataThroughAt: null
    };
    const disconnectedDetail: SourceConversationReadModel = {...detail, account: disconnectedAccount};
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) =>
      String(input).includes('/source/conversations/conversation-1')
        ? jsonResponse(disconnectedDetail)
        : jsonResponse(disconnectedPage)
    ));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(screen.getByRole('button', {name: '会話を表示'}));
    await waitFor(() => expect(screen.getByRole('button', {name: /Source Sender/})).toBeInTheDocument());
    expect(screen.getByText(/保存済みのSourceは引き続き確認できます/)).toBeInTheDocument();
    expect(screen.queryByText(/会話を同期しています/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: /Source Sender/}));
    await waitFor(() => expect(screen.getByRole('heading', {name: 'Original provider subject'})).toBeInTheDocument());
    expect(screen.getByText(/このメール連携は解除済みです/)).toBeInTheDocument();
    expect(screen.getByText('Safe source')).toBeInTheDocument();
  });

});
