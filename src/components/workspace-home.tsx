'use client';

import {ArrowRight, Check, CircleHelp, Clock3, Mail, Search, ShieldCheck, Sparkles} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import type {AttentionItemReadModel, AttentionReadModel} from '@/lib/attention-types';
import type {ShellFixture} from './lunowa-shell-model';
import type {SourcePageReadModel} from './source-types';

type Open = (origin?: string) => void;
export type TypedAttention = {item: AttentionItemReadModel; kind: 'needs' | 'review'};

export function orderedTypedAttention(attention: AttentionReadModel): TypedAttention[] {
  const time = (item: AttentionItemReadModel) => item.nearestRelevantTime && !Number.isNaN(Date.parse(item.nearestRelevantTime)) ? Date.parse(item.nearestRelevantTime) : Number.POSITIVE_INFINITY;
  return [
    ...attention.needsYou.map((item) => ({item, kind: 'needs' as const})),
    ...attention.review.map((item) => ({item, kind: 'review' as const}))
  ].sort((left, right) => Number(Boolean(right.item.overdue)) - Number(Boolean(left.item.overdue)) || time(left.item) - time(right.item) || left.item.id.localeCompare(right.item.id));
}
type Props = {
  selectedOrigin?: string;
  fixture: ShellFixture;
  attention: AttentionReadModel | null;
  sourceModel: SourcePageReadModel | null;
  live: boolean;
  sourceLoading: boolean;
  sourceError: string;
  openMoment: Open;
  openReview: Open;
  openManaged: Open;
  openDelegation: Open;
  openConversation: (origin: string, conversationId?: string) => void;
  onNavigate: (surface: 'needs' | 'review' | 'managed' | 'source' | 'search') => void;
};

export function WorkspaceHome({selectedOrigin, fixture, attention, sourceModel, live, sourceLoading, sourceError, openMoment, openReview, openManaged, openDelegation, openConversation, onNavigate}: Props) {
  const t = useTranslations('Workspace');
  const locale = useLocale();
  const needs = attention ? attention.needsYou.length : Number(fixture.hasNeedsYou);
  const reviews = attention ? attention.review.length : Number(fixture.hasReview);
  const healthy = attention ? attention.integrity.status === 'healthy' && attention.source.readiness === 'ready' : fixture.integrity === 'healthy' && fixture.sourceReadiness === 'ready';
  const active = attention ? attention.managedCount > 0 : fixture.monitoringPosture === 'active';
  const managedCount = attention?.managedCount ?? (active ? 4 : 0);
  const hasLater = (attention?.later.length ?? 0) > 0;
  const laterCount = attention?.later.length ?? 0;
  const typedAttention = attention ? orderedTypedAttention(attention) : [];
  const hasDelegatedAttention = (attention?.delegatedCount ?? 0) > 0 && needs + reviews > 0;
  const managedItem = attention?.managed[0] ?? attention?.later[0];
  const managedOrigin = managedItem ? `managed-${managedItem.id}` : !attention && active ? 'managed-estimate' : null;
  const strictZero = attention ? attention.strictZero && healthy && needs === 0 && reviews === 0 : healthy && active && needs === 0 && reviews === 0;
  const checkedValue = attention?.source.dataThroughAt;
  const lastChecked = checkedValue && !Number.isNaN(Date.parse(checkedValue)) ? checkedValue : null;
  const conversations = sourceModel?.conversations.slice(0, 3) ?? [];
  const itemRow = (item: AttentionItemReadModel, review: boolean) => {
    const conversation = sourceModel?.conversations.find((entry) => entry.id === item.conversationId);
    const origin = `${review ? 'review' : 'attention'}-${item.id}`;
    return <button key={item.id} id={origin} aria-current={selectedOrigin === origin || undefined} className={`work-row ${review ? 'work-review' : 'work-action'}`} onClick={() => (review ? openReview : openMoment)(origin)}>
      <span className="work-row-top"><span className={`state-chip ${review ? 'review' : 'action'}`}>{t(review ? 'reviewType' : 'actionType')}</span>{conversation?.latestSender && <span className="work-person">{conversation.latestSender.displayName || conversation.latestSender.email}</span>}</span>
      <strong>{review ? item.reviewQuestion ?? item.operationalOutcome : item.primaryAction ?? item.operationalOutcome}</strong>
      <span className="work-row-description">{conversation?.subject ?? item.operationalOutcome}</span>
      {item.nearestRelevantTime && <span className="work-time"><Clock3 size={14} />{item.overdue ? t('overdue') : t('returnTime')} · {item.nearestRelevantTime}</span>}
      <ArrowRight className="work-row-arrow" size={18} aria-hidden="true" />
    </button>;
  };

  return <div className="workspace-home">
    {attention && !healthy && <aside className="coverage-notice" role="status">{attention.integrity.message || t('coverageUnknown')}</aside>}
    <div className="home-metrics" aria-label={t('overview')}>
      <button className="home-metric metric-action" onClick={() => onNavigate('needs')}><span><Sparkles size={16} />{t('needs')}</span><strong>{needs}</strong><span className="metric-caption">{t('needsHint')}<ArrowRight size={15} /></span></button>
      <button className="home-metric metric-review" onClick={() => onNavigate('review')}><span><CircleHelp size={16} />{t('review')}</span><strong>{reviews}</strong><span className="metric-caption">{t('reviewHint')}<ArrowRight size={15} /></span></button>
      {(active || !attention || !healthy) && <button className="home-metric metric-managed" onClick={() => onNavigate('managed')}><span><ShieldCheck size={16} />{t('managed')}</span><strong>{healthy ? managedCount : '—'}</strong><span className="metric-caption">{t(healthy ? 'managedHint' : 'coveragePending')}<ArrowRight size={15} /></span></button>}
      {hasLater && <button className="home-metric metric-later" onClick={() => onNavigate('managed')}><span><Clock3 size={16} />{t('laterTitle')}</span><strong>{laterCount}</strong><span className="metric-caption">{t('laterBody')}<ArrowRight size={15} /></span></button>}
    </div>

    <div className="home-columns">
      <section className="home-attention" aria-labelledby="attention-heading">
        <div className="section-heading"><h2 id="attention-heading">{t('attentionTitle')}</h2><span>{t('itemCount', {count: needs + reviews})}</span></div>
        {strictZero ? <div className="home-zero"><span className="zero-symbol"><Check size={24} /></span><h2>{t('allClear')}</h2><p>{t(active || hasLater ? 'allClearBody' : 'noMonitoring')}</p></div> : <>
          {attention ? typedAttention.map(({item, kind}) => itemRow(item, kind === 'review')) : fixture.hasNeedsYou && <button id="estimate-hiroko" aria-current={selectedOrigin === "estimate-hiroko" || undefined} className="work-row work-action" onClick={() => openMoment('estimate-hiroko')}><span className="work-row-top"><span className="state-chip action">{t('actionType')}</span><span className="work-person">{t('samplePerson')}</span></span><strong>{t('sampleAction')}</strong><span className="work-row-description">{t('sampleWhy')}</span><span className="work-time"><Clock3 size={14} />{t('sampleDeadline')}</span><ArrowRight className="work-row-arrow" size={18} /></button>}
          {!attention && fixture.hasReview && <button id="review-condition" aria-current={selectedOrigin === "review-condition" || undefined} className="work-row work-review" onClick={() => openReview('review-condition')}><span className="work-row-top"><span className="state-chip review">{t('reviewType')}</span><span className="work-person">{t('samplePerson')}</span></span><strong>{t('sampleReview')}</strong><span className="work-row-description">{t('sampleReviewWhy')}</span><ArrowRight className="work-row-arrow" size={18} /></button>}
          {needs + reviews === 0 && <p className="home-quiet-message">{t(healthy ? 'noAttention' : 'coverageUnknown')}</p>}
        </>}
        {(attention?.delegationCandidates?.length ?? 0) > 0 && <section className="home-candidates"><h3>{t('candidates')}</h3>{attention!.delegationCandidates!.map((item) => <button id={`delegation-${item.id}`} key={item.id} className="list-row" onClick={() => openDelegation(`delegation-${item.id}`)}><strong>{item.operationalOutcome}</strong><span>{t('inspectCandidate')}</span></button>)}</section>}
      </section>

      <aside className="home-stewardship" aria-labelledby="managed-heading">
        <span className="stewardship-icon"><ShieldCheck size={24} strokeWidth={1.5} /></span>
        <p className="eyebrow">{t('stewardship')}</p>
        <h2 id="managed-heading">{t(!healthy ? 'coveragePending' : active ? 'watching' : hasLater ? 'laterTitle' : hasDelegatedAttention ? 'actionInProgress' : fixture.monitoringPosture === 'stopped_by_user' && !attention ? 'stopped' : 'noMonitoring')}</h2>
        <p>{t(!healthy ? 'reassurancePaused' : active ? 'watchingBody' : hasLater ? 'laterBody' : hasDelegatedAttention ? 'actionInProgressBody' : fixture.monitoringPosture === 'stopped_by_user' && !attention ? 'stoppedBody' : 'notDelegatedBody')}</p>
        {healthy && active && <p className="stewardship-count">{t('watchingCount', {count: managedCount})}</p>}
        {healthy && !active && hasLater && <p className="stewardship-count">{t('laterCount', {count: attention!.later.length})}</p>}
        {lastChecked && <p className="metadata">{t('lastChecked')} <time dateTime={lastChecked}>{new Intl.DateTimeFormat(locale, {dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tokyo'}).format(new Date(lastChecked))}</time></p>}
        <button id={managedOrigin ?? 'home-monitoring'} className="workspace-text-button" onClick={() => managedOrigin ? openManaged(managedOrigin) : onNavigate('managed')}>{t(active ? 'viewManaged' : 'viewMonitoring')}<ArrowRight size={16} /></button>
      </aside>
    </div>

    <section className="home-conversations" aria-labelledby="recent-heading">
      <div className="section-heading"><h2 id="recent-heading">{t('recent')}</h2><button className="workspace-text-button" onClick={() => onNavigate('source')}>{t('viewConversations')}<ArrowRight size={16} /></button></div>
      {live ? sourceLoading && !sourceModel ? <p className="home-quiet-message" role="status">{t('sourceLoading')}</p> : sourceError ? <p className="coverage-notice">{t('sourceError')}</p> : conversations.length ? conversations.map((conversation) => <button id={`home-source-${conversation.id}`} key={conversation.id} className="home-conversation" onClick={() => openConversation(`home-source-${conversation.id}`, conversation.id)}><span className="conversation-avatar" aria-hidden="true">{(conversation.latestSender?.displayName || conversation.latestSender?.email || '?').slice(0, 1)}</span><span className="conversation-copy"><strong>{conversation.latestSender?.displayName || conversation.latestSender?.email || t('unknownSender')}</strong><span>{conversation.subject}</span><span className="conversation-preview">{conversation.preview}</span></span><ArrowRight size={16} /></button>) : <p className="home-quiet-message">{t(sourceModel?.readiness === 'ready' ? 'sourceEmpty' : 'sourceIncomplete')}</p> : <button id="home-source-estimate" className="home-conversation" onClick={() => openConversation('home-source-estimate', 'source-estimate')}><span className="conversation-avatar" aria-hidden="true">{locale === 'ja' ? '佐' : 'H'}</span><span className="conversation-copy"><strong>{t('samplePerson')}</strong><span>{t('sampleSubject')}</span><span className="conversation-preview">{t('samplePreview')}</span></span><ArrowRight size={16} /></button>}
      <div className="home-source-footer"><span><Mail size={15} />{t('sourceIndependence')}</span><button className="workspace-text-button" onClick={() => onNavigate('search')}><Search size={15} />{t('searchMail')}</button></div>
    </section>
  </div>;
}
