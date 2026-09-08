import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {LunowaShell} from '@/components/lunowa-shell';

const attention = {
  source: {readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z'},
  integrity: {status: 'healthy', message: null},
  needsYou: [{
    id: 'responsibility-1', subjectKind: 'RESPONSIBILITY', responsibilityId: 'responsibility-1', admissionReviewId: null,
    conversationId: 'conversation-1', connectedAccountId: 'account-1', surface: 'NEEDS_YOU',
    projection: {bucket: 'MY_TURN', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-user-obligation:REPLY'},
    operationalOutcome: '見積書に返信する', reviewQuestion: null, primaryAction: '返信する', awaitedEvent: null, returnCondition: null,
    nearestRelevantTime: null, overdue: false, acceptedEvidenceRevision: 2, aggregateVersion: 1, liveTrackingState: 'TRACKING_ACTIVE'
  }],
  managed: [], later: [], review: [], done: [], strictZero: false, managedCount: 0, delegatedCount: 1,
  derivedAt: '2030-01-01T00:00:00.000Z'
};

const source = {
  accounts: [], conversations: [], readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z',
  query: {text: '', accountId: null, sender: null, from: null, to: null}, total: 0, nextCursor: null
};

function replyContext(sendAuthorized: boolean, draft = true) {
  return {
    connectedAccount: {id: 'account-1', emailAddress: 'owner@example.com', displayName: 'Owner', connectionState: 'CONNECTED', sendAuthorized},
    conversationId: 'conversation-1', providerThreadId: 'thread-1', inReplyToMessageId: 'message-1', inReplyToProviderMessageId: 'provider-message-1',
    evidenceRevision: 2, mode: 'REPLY', sender: {email: 'owner@example.com', displayName: 'Owner'},
    recipients: [{email: 'sender@example.com', displayName: 'Sender'}], cc: [], bcc: [], subject: 'Re: Request',
    ...(draft ? {draft: {id: 'draft-1', version: 1, body: '確認しました。', recipients: [{email: 'sender@example.com', displayName: 'Sender'}], cc: []}} : {})
  };
}

function json(value: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(value), {headers: {'Content-Type': 'application/json'}, ...init});
}

function baseFetch(context: ReturnType<typeof replyContext>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/attention')) return json(attention);
    if (url.includes('/drafts/context?')) return json(context);
    if (url.includes('/source/conversations')) return json(source);
    return json({error: 'UNEXPECTED_REQUEST'}, {status: 500});
  });
}

async function openComposer() {
  await waitFor(() => expect(screen.getByRole('button', {name: /返信する/})).toBeTruthy());
  fireEvent.click(screen.getByRole('button', {name: /返信する/}));
  await waitFor(() => expect(screen.getByRole('heading', {name: '返信'})).toBeTruthy());
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Object.defineProperty(window.navigator, 'onLine', {configurable: true, value: true});
});

describe('G50 live composer safety', () => {
  it('keeps manual reply usable but disables Send when live mail_send capability is missing', async () => {
    const fetchMock = baseFetch(replyContext(false));
    vi.stubGlobal('fetch', fetchMock);
    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await openComposer();

    expect(screen.getByDisplayValue('確認しました。')).toBeTruthy();
    expect(screen.getByText(/Gmailの送信権限がありません/)).toBeTruthy();
    expect(screen.getByRole('button', {name: '送信する'})).toBeDisabled();
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/send-operations'))).toBe(false);
  });

  it('does not create a SendOperation while the browser is offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {configurable: true, value: false});
    const fetchMock = baseFetch(replyContext(true));
    vi.stubGlobal('fetch', fetchMock);
    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await openComposer();

    fireEvent.click(screen.getByRole('button', {name: '送信する'}));
    await waitFor(() => expect(screen.getByText(/現在オフラインです。送信されていません/)).toBeTruthy());
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/send-operations'))).toBe(false);
    expect(screen.getByDisplayValue('確認しました。')).toBeTruthy();
  });


  it('binds the selected Responsibility and follows ambiguous Send reconciliation to a truthful reconciled state', async () => {
    let sendPosts = 0;
    const sendBodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/attention')) return json(attention);
      if (url.includes('/drafts/context?')) return json(replyContext(true));
      if (url.includes('/source/conversations')) return json(source);
      if (url.endsWith('/send-operations') && init?.method === 'POST') {
        sendPosts += 1;
        sendBodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        return json({accepted: true, operation: {id: 'operation-1', status: sendPosts === 1 ? 'AMBIGUOUS' : 'RECONCILED'}});
      }
      return json({error: 'UNEXPECTED_REQUEST'}, {status: 500});
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await openComposer();

    fireEvent.click(screen.getByRole('button', {name: '送信する'}));
    await waitFor(() => expect(sendPosts).toBe(2), {timeout: 2500});
    expect(sendBodies[0]).toMatchObject({
      draftId: 'draft-1',
      responsibilityBinding: {responsibilityId: 'responsibility-1', aggregateVersion: 1, evidenceRevision: 2}
    });
    expect(sendBodies[1]).toEqual(sendBodies[0]);
    await waitFor(() => expect(screen.getByRole('button', {name: '送信済み'})).toBeDisabled());
    expect(screen.getByText(/現在の状態へ反映済み/)).toBeTruthy();
  });

  it('serializes autosave so a newer edit waits for the prior version result', async () => {
    let releaseFirst: (response: Response) => void = () => undefined;
    const firstSave = new Promise<Response>((resolve) => { releaseFirst = resolve; });
    const draftBodies: Array<Record<string, unknown>> = [];
    let draftPostCount = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/attention')) return json(attention);
      if (url.includes('/drafts/context?')) return json(replyContext(true, false));
      if (url.includes('/source/conversations')) return json(source);
      if (url.endsWith('/drafts') && init?.method === 'POST') {
        draftPostCount += 1;
        draftBodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        if (draftPostCount === 1) return firstSave;
        return json({id: 'draft-1', version: 2, body: '二つ目'});
      }
      return json({error: 'UNEXPECTED_REQUEST'}, {status: 500});
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await openComposer();

    const editor = screen.getByLabelText('本文');
    fireEvent.change(editor, {target: {value: '一つ目'}});
    await waitFor(() => expect(draftPostCount).toBe(1), {timeout: 1500});
    fireEvent.change(editor, {target: {value: '二つ目'}});
    await new Promise((resolve) => window.setTimeout(resolve, 320));
    expect(draftPostCount).toBe(1);

    releaseFirst(json({id: 'draft-1', version: 1, body: '一つ目'}));
    await waitFor(() => expect(draftPostCount).toBe(2), {timeout: 1800});
    expect(draftBodies[1]).toMatchObject({draftId: 'draft-1', expectedVersion: 1, body: '二つ目'});
    await waitFor(() => expect(screen.getByRole('button', {name: '送信する'})).not.toBeDisabled());
  });
});
