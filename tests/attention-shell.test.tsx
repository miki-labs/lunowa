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
    fireEvent.change(screen.getByLabelText('表示状態'), {target: {value: 'degraded'}});
    expect(screen.queryByText('一部の監視を確認できていません')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: /返信する/}));
    expect(screen.getByRole('heading', {name: '見積書の確認を終える'})).toBeTruthy();
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
});
