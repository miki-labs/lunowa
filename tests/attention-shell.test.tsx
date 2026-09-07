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
    responsibilityId: 'responsibility-1',
    conversationId: 'conversation-1',
    surface: 'NEEDS_YOU',
    projection: {bucket: 'MY_TURN', subjectKind: 'RESPONSIBILITY', primaryReason: 'open-user-obligation:REPLY'},
    operationalOutcome: '見積書の確認を終える',
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
    await waitFor(() => expect(screen.getByRole('button', {name: /返信する/})).toBeInTheDocument());
    expect(screen.queryByText('見積書を確認して返信する')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /返信する/}));
    expect(screen.getByRole('heading', {name: '見積書を確認して返信する'})).toBeInTheDocument();
  });
});
