import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {NextIntlClientProvider} from 'next-intl';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {WorkspaceHome} from '@/components/workspace-home';
import {LunowaShell} from '@/components/lunowa-shell';
import {shellFixtures} from '@/components/lunowa-shell-model';
import type {AttentionItemReadModel, AttentionReadModel} from '@/lib/attention-types';
import en from '../messages/en.json';

afterEach(() => {cleanup(); vi.unstubAllGlobals();});
const item: AttentionItemReadModel = {
  id: 'real-work', subjectKind: 'RESPONSIBILITY', responsibilityId: 'real-work', admissionReviewId: null,
  conversationId: 'real-conversation', surface: 'LATER', projection: {bucket: 'LATER', subjectKind: 'RESPONSIBILITY', primaryReason: 'deferred'},
  operationalOutcome: 'Confirm delivery', primaryAction: null, reviewQuestion: null, awaitedEvent: 'Delivery confirmation',
  returnCondition: 'Tomorrow', nearestRelevantTime: null, overdue: false
};
const base: AttentionReadModel = {
  source: {readiness: 'ready', dataThroughAt: null}, integrity: {status: 'healthy', message: null},
  needsYou: [], managed: [], later: [], review: [], done: [], strictZero: false, managedCount: 0, delegatedCount: 0, derivedAt: '2030-01-01'
};
function show(attention: AttentionReadModel) {
  const openManaged = vi.fn(); const onNavigate = vi.fn();
  render(<NextIntlClientProvider locale="en" messages={en} timeZone="Asia/Tokyo"><WorkspaceHome fixture={shellFixtures[0]} attention={attention} sourceModel={null} live sourceLoading={false} sourceError="" openMoment={vi.fn()} openReview={vi.fn()} openManaged={openManaged} openDelegation={vi.fn()} openConversation={vi.fn()} onNavigate={onNavigate} /></NextIntlClientProvider>);
  return {openManaged, onNavigate};
}
describe('Home monitoring truth and preview isolation', () => {
  it('keeps Later visible and opens its accepted item with a real focus origin', () => {
    const {openManaged} = show({...base, later: [item], delegatedCount: 1});
    expect(screen.getByRole('heading', {name: 'Scheduled to return'})).toBeTruthy();
    expect(screen.queryByText('Nothing is being monitored yet')).toBeNull();
    const button = screen.getByRole('button', {name: 'View monitoring status'});
    fireEvent.click(button);
    expect(openManaged).toHaveBeenCalledWith(button.id);
    expect(button.id).toBe('managed-real-work');
  });
  it('opens monitoring status rather than a fabricated detail when no work exists', () => {
    const {openManaged, onNavigate} = show(base);
    fireEvent.click(screen.getByRole('button', {name: 'View monitoring status'}));
    expect(onNavigate).toHaveBeenCalledWith('managed');
    expect(openManaged).not.toHaveBeenCalled();
    expect(screen.queryByText('Hiroko Sato')).toBeNull();
  });
  it('does not equate delegated Needs You work with no monitoring', () => {
    show({...base, needsYou: [{...item, surface: 'NEEDS_YOU', primaryAction: 'Reply'}], delegatedCount: 1});
    expect(screen.getByRole('heading', {name: 'Delegated work needs your attention'})).toBeTruthy();
    expect(screen.queryByText('Nothing is being monitored yet')).toBeNull();
  });
  it('never reassures with a zero count while coverage is unknown', () => {
    show({...base, strictZero: true, integrity: {status: 'unknown', message: null}});
    expect(screen.queryByText('Nothing needs your attention right now.')).toBeNull();
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getAllByText(en.Workspace.coverageUnknown).length).toBeGreaterThan(0);
  });
  it('switches preview language without issuing auth or BFF requests', () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    render(<LunowaShell locale="ja" preview />);
    fireEvent.change(screen.getByLabelText('表示言語'), {target: {value: 'en'}});
    expect(screen.getByRole('heading', {name: 'Home'})).toBeTruthy();
    expect(screen.getByTestId('lunowa-shell').getAttribute('lang')).toBe('en');
    expect(screen.getByText(en.Workspace.previewNotice)).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
});
