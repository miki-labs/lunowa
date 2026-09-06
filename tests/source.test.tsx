import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
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

    fireEvent.click(screen.getByRole('button', {name: /Source Sender/}));
    await waitFor(() => expect(screen.getByRole('heading', {name: 'Original provider subject'})).toBeInTheDocument());
    expect(screen.getByText('Safe source')).toBeInTheDocument();
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
});
