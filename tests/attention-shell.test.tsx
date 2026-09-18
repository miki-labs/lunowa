import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {LunowaShell} from '@/components/lunowa-shell';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const attention = {
  source: {readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z'},
  integrity: {status: 'healthy', message: null},
  needsYou: [{
    id: 'responsibility-1',
    subjectKind: 'RESPONSIBILITY',
    responsibilityId: 'responsibility-1',
    admissionReviewId: null,
    conversationId: 'conversation-1',
    surface: 'NEEDS_YOU',
    projection: {bucket: 'MY_TURN', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-user-obligation:REPLY'},
    operationalOutcome: '見積書の確認を終える',
    reviewQuestion: null,
    primaryAction: '返信する',
    awaitedEvent: null,
    returnCondition: null,
    nearestRelevantTime: null,
    overdue: false
  }],
  managed: [],
  later: [],
  review: [],
  done: [],
  strictZero: false,
  managedCount: 0,
  delegatedCount: 1,
  derivedAt: '2030-01-01T00:00:00.000Z'
};

describe('G40 live attention surfaces', () => {
  it('renders accepted attention state instead of the shell fixture and routes it to Moment', async () => {
    const source = {
      accounts: [],
      conversations: [],
      readiness: 'ready',
      dataThroughAt: '2030-01-01T00:00:00.000Z',
      query: {text: '', accountId: null, sender: null, from: null, to: null},
      total: 0,
      nextCursor: null
    };
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) =>
      String(input).endsWith('/attention')
        ? new Response(JSON.stringify(attention), {headers: {'Content-Type': 'application/json'}})
        : new Response(JSON.stringify(source), {headers: {'Content-Type': 'application/json'}})
    ));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await waitFor(() => expect(screen.getByRole('button', {name: /返信する/})).toBeTruthy());
    expect(screen.queryByText('見積書を確認して返信する')).toBeNull();
    expect(screen.queryByLabelText('表示状態')).toBeNull();
    expect(screen.queryByText('一部の監視を確認できていません')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: /返信する/}));
    expect(screen.getByRole('heading', {name: '見積書の確認を終える'})).toBeTruthy();
  });

  it('keeps a direct Attention Source open bound to its accepted account after another mailbox was selected', async () => {
    const sourceAccount = (id: string, emailAddress: string, displayName: string) => ({
      id, provider: 'gmail', providerAccountId: emailAddress, emailAddress, displayName, connectionState: 'CONNECTED',
      sync: {status: 'HEALTHY', lastSuccessAt: '2030-01-01T00:00:00.000Z', lastFullReconcileAt: '2030-01-01T00:00:00.000Z', dataThroughAt: '2030-01-01T00:00:00.000Z', errorCode: null}
    });
    const accountA = sourceAccount('account-a', 'a@example.com', 'Account A');
    const accountB = sourceAccount('account-b', 'b@example.com', 'Account B');
    const liveAttention = {...attention, needsYou: [{...attention.needsYou[0], conversationId: 'conversation-b', connectedAccountId: accountB.id}]};
    const conversation = {id: 'conversation-b', providerThreadId: 'thread-b', subject: 'B account evidence', preview: 'Exact B account Source', lastMessageAt: '2030-01-01T00:00:00.000Z', messageCount: 1, hasAttachments: false, account: accountB, latestSender: {email: 'sender@example.com', displayName: 'Sender'}};
    const source = {accounts: [accountA, accountB], conversations: [conversation], readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z', query: {text: '', accountId: null, sender: null, from: null, to: null}, total: 1, nextCursor: null};
    const detail = {id: conversation.id, providerThreadId: conversation.providerThreadId, subject: conversation.subject, account: accountB, evidenceRevision: 1, messages: []};
    const requested: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);
      if (url.endsWith('/attention')) return new Response(JSON.stringify(liveAttention));
      if (url.includes('/source/conversations/conversation-b')) return new Response(JSON.stringify(detail));
      if (url.includes('accountId=account-a')) return new Response(JSON.stringify({...source, accounts: [accountA], conversations: [], query: {...source.query, accountId: accountA.id}, total: 0}));
      return new Response(JSON.stringify(source));
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    fireEvent.click(await screen.findByRole('button', {name: /Gmail · Account A · a@example.com/}));
    fireEvent.click(screen.getByRole('button', {name: '対応が必要を表示'}));
    fireEvent.click(await screen.findByRole('button', {name: '元の会話を開く'}));
    await waitFor(() => expect(requested.some((url) => url.includes('/source/conversations/conversation-b?accountId=account-b'))).toBe(true));
  });

  it('orders typed Attention by urgency and opens the first accepted detail on desktop', async () => {
    const needs = {...attention.needsYou[0], id: 'needs-later', responsibilityId: 'needs-later', primaryAction: '通常の返信をする', operationalOutcome: '通常の返信を終える', nearestRelevantTime: '2030-01-03T00:00:00.000Z'};
    const urgentReview = {...attention.needsYou[0], id: 'review-overdue', responsibilityId: 'review-overdue', surface: 'REVIEW', projection: {bucket: 'REVIEW', subjectKind: 'RESPONSIBILITY', primaryReason: 'accepted-review'}, primaryAction: null, reviewQuestion: '期限切れの依頼を確認する', operationalOutcome: '期限切れの条件を判断する', nearestRelevantTime: '2030-01-04T00:00:00.000Z', overdue: true};
    const liveAttention = {...attention, needsYou: [needs], review: [urgentReview]};
    const source = {accounts: [], conversations: [], readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z', query: {text: '', accountId: null, sender: null, from: null, to: null}, total: 0, nextCursor: null};
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).endsWith('/attention')
      ? new Response(JSON.stringify(liveAttention))
      : new Response(JSON.stringify(source))));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    const urgentButton = await screen.findByRole('button', {name: /期限切れの依頼を確認する/});
    await waitFor(() => expect(urgentButton).toHaveAttribute('aria-current', 'true'));
    expect(screen.getByRole('heading', {name: '期限切れの依頼を確認する'})).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: /通常の返信をする/}));
    expect(screen.getByRole('heading', {name: '通常の返信を終える'})).toBeTruthy();
  });

  it('shows Later as its own counted summary without inventing a zero Managed metric', async () => {
    const later = {...attention.needsYou[0], id: 'later-1', responsibilityId: 'later-1', surface: 'LATER', primaryAction: null, operationalOutcome: '来週もう一度確認する', awaitedEvent: '先方からの回答', returnCondition: '来週月曜'};
    const liveAttention = {...attention, needsYou: [], later: [later], managed: [], managedCount: 0, delegatedCount: 1, strictZero: true};
    const source = {accounts: [], conversations: [], readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z', query: {text: '', accountId: null, sender: null, from: null, to: null}, total: 0, nextCursor: null};
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).endsWith('/attention')
      ? new Response(JSON.stringify(liveAttention))
      : new Response(JSON.stringify(source))));

    const {container} = render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    const laterMetric = await screen.findByRole('button', {name: /あとで確認するもの.*1/});
    expect(container.querySelector('.metric-managed')).toBeNull();
    fireEvent.click(laterMetric);
    expect(screen.getByRole('heading', {name: /委ねた確認/})).toHaveTextContent('1');
    expect(screen.getByRole('button', {name: /来週もう一度確認する/})).toBeTruthy();
  });

  it('uses live coverage truth on attention surfaces instead of fixture coverage', async () => {
    const liveCoverage = {
      ...attention,
      source: {readiness: 'partial', dataThroughAt: null},
      integrity: {status: 'unknown', message: 'ライブの確認範囲がまだ十分ではありません。'}
    };
    const source = {
      accounts: [],
      conversations: [],
      readiness: 'ready',
      dataThroughAt: '2030-01-01T00:00:00.000Z',
      query: {text: '', accountId: null, sender: null, from: null, to: null},
      total: 0,
      nextCursor: null
    };
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) =>
      String(input).endsWith('/attention')
        ? new Response(JSON.stringify(liveCoverage), {headers: {'Content-Type': 'application/json'}})
        : new Response(JSON.stringify(source), {headers: {'Content-Type': 'application/json'}})
    ));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await waitFor(() => expect(screen.getByRole('button', {name: /返信する/})).toBeTruthy());
    fireEvent.click(screen.getByRole('button', {name: '対応が必要を表示'}));

    expect(screen.getByText('ライブの確認範囲がまだ十分ではありません。')).toBeTruthy();
    expect(screen.queryByText('最新の確認範囲: 10:15。')).toBeNull();
  });

  it('opens the first live Managed item from Home with its accepted context', async () => {
    const managed = {
      ...attention.needsYou[0],
      id: 'responsibility-managed',
      responsibilityId: 'responsibility-managed',
      conversationId: 'conversation-managed',
      surface: 'MANAGED',
      projection: {bucket: 'WAITING', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-loop-awaits-counterpart-or-external-event'},
      operationalOutcome: '納品日の回答を見守る',
      primaryAction: null,
      awaitedEvent: '取引先からの納品日回答',
      returnCondition: '9月10日',
      nearestRelevantTime: '2026-09-10',
      overdue: false
    };
    const liveAttention = {
      ...attention,
      needsYou: [],
      managed: [managed],
      strictZero: true,
      managedCount: 1,
      delegatedCount: 1
    };
    const source = {
      accounts: [],
      conversations: [],
      readiness: 'ready',
      dataThroughAt: '2030-01-01T00:00:00.000Z',
      query: {text: '', accountId: null, sender: null, from: null, to: null},
      total: 0,
      nextCursor: null
    };
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) =>
      String(input).endsWith('/attention')
        ? new Response(JSON.stringify(liveAttention), {headers: {'Content-Type': 'application/json'}})
        : new Response(JSON.stringify(source), {headers: {'Content-Type': 'application/json'}})
    ));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await waitFor(() => expect(screen.getByRole('button', {name: '管理中を見る'})).toBeTruthy());
    fireEvent.click(screen.getByRole('button', {name: '管理中を見る'}));

    expect(screen.getByRole('heading', {name: '納品日の回答を見守る'})).toBeTruthy();
    expect(screen.getByText('取引先からの納品日回答、または9月10日を見守っています。')).toBeTruthy();
    expect(screen.getByRole('button', {name: '元の会話を確認する'})).toBeTruthy();
  });

  it('keeps accepted Managed truth while a trusted Stop Tracking request is pending or rejected', async () => {
    const managed = {
      ...attention.needsYou[0],
      id: '11111111-1111-4111-8111-111111111111',
      responsibilityId: '11111111-1111-4111-8111-111111111111',
      conversationId: '33333333-3333-4333-8333-333333333333',
      connectedAccountId: '22222222-2222-4222-8222-222222222222',
      acceptedEvidenceRevision: 3,
      aggregateVersion: 7,
      liveTrackingState: 'TRACKING_ACTIVE',
      surface: 'MANAGED',
      projection: {bucket: 'WAITING', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-loop-awaits-counterpart-or-external-event'},
      operationalOutcome: '納品日の回答を見守る',
      primaryAction: null,
      awaitedEvent: '取引先からの納品日回答',
      returnCondition: '9月10日'
    };
    const liveAttention = {...attention, needsYou: [], managed: [managed], strictZero: true, managedCount: 1, delegatedCount: 1};
    const source = {
      accounts: [], conversations: [], readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z',
      query: {text: '', accountId: null, sender: null, from: null, to: null}, total: 0, nextCursor: null
    };
    let releaseAction: (response: Response) => void = () => undefined;
    const actionResponse = new Promise<Response>((resolve) => { releaseAction = resolve; });
    let actionBody: Record<string, unknown> | undefined;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/attention')) return new Response(JSON.stringify(liveAttention));
      if (url.includes('/attention/actions')) {
        actionBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return actionResponse;
      }
      return new Response(JSON.stringify(source));
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await waitFor(() => expect(screen.getByRole('button', {name: '管理中を見る'})).toBeTruthy());
    fireEvent.click(screen.getByRole('button', {name: '管理中を見る'}));
    fireEvent.click(screen.getByRole('button', {name: '監視を停止する'}));
    expect(screen.getByRole('button', {name: '監視を停止しています'})).toBeTruthy();
    expect(screen.getByRole('heading', {name: '納品日の回答を見守る'})).toBeTruthy();
    expect(actionBody).toMatchObject({action: 'STOP_TRACKING'});
    expect(String(actionBody?.requestKey)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(String(actionBody?.requestKey).length).toBeLessThanOrEqual(48);

    releaseAction(new Response(JSON.stringify({accepted: false, error: 'stale'}), {status: 409}));
    await waitFor(() => expect(screen.getByText('監視を停止できませんでした。現在の監視は継続しています。')).toBeTruthy());
    expect(screen.getByText('取引先からの納品日回答、または9月10日を見守っています。')).toBeTruthy();
  });

  it('offers one explicit delegation path for an inactive accepted loop', async () => {
    const candidate = {
      ...attention.needsYou[0],
      id: 'responsibility-candidate',
      responsibilityId: 'responsibility-candidate',
      conversationId: 'conversation-candidate',
      connectedAccountId: 'account-1',
      acceptedEvidenceRevision: 4,
      aggregateVersion: 2,
      liveTrackingState: 'HISTORICAL_INACTIVE',
      surface: 'NONE',
      projection: {bucket: 'NONE', subjectKind: 'NONE', primaryReason: 'historical-candidate-is-not-live-work'},
      operationalOutcome: '契約条件を確認する',
      primaryAction: null,
      awaitedEvent: '相手からの確認返信',
      returnCondition: '返信が届くまで'
    };
    const source = {accounts: [], conversations: [], readiness: 'ready', dataThroughAt: '2030-01-01T00:00:00.000Z', query: {text: '', accountId: null, sender: null, from: null, to: null}, total: 0, nextCursor: null};
    let actionPayload: unknown;
    const updated = {...attention, needsYou: [], delegationCandidates: [], managed: [{...candidate, liveTrackingState: 'TRACKING_ACTIVE', surface: 'MANAGED', projection: {bucket: 'WAITING', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-loop-awaits-counterpart-or-external-event'}}], managedCount: 1, strictZero: true};
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/attention')) return new Response(JSON.stringify(actionPayload ? updated : {...attention, needsYou: [], delegationCandidates: [candidate], strictZero: true, managedCount: 0, delegatedCount: 0}));
      if (url.includes('/attention/actions')) {
        actionPayload = init?.body;
        return new Response(JSON.stringify({accepted: true}));
      }
      return new Response(JSON.stringify(source));
    }));

    render(<LunowaShell appUser={{id: 'user-1', name: 'Owner', email: 'owner@example.com'}} />);
    await waitFor(() => expect(screen.getByRole('button', {name: /契約条件を確認する/})).toBeTruthy());
    fireEvent.click(screen.getByRole('button', {name: /契約条件を確認する/}));
    expect(screen.getByText('期待する出来事: 相手からの確認返信')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'この件を任せる'}));
    await waitFor(() => expect(screen.getByText('任せる操作を保存しました。現在の状態を更新しています。')).toBeTruthy());
    expect(actionPayload).toBeTruthy();
  });
});
