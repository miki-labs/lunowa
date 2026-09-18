'use client';

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {NextIntlClientProvider, useLocale, useTranslations} from 'next-intl';
import {House, Sparkles, ShieldCheck, CircleHelp, Mail, Search as SearchIcon, Settings as SettingsIcon, Menu, ArrowRight, UserRound} from 'lucide-react';
import jaMessages from '../../messages/ja.json';
import enMessages from '../../messages/en.json';
import {WorkspaceHome} from './workspace-home';
import './workspace.css';

import {
  shellFixtures,
  type CommonMutationTarget,
  type MutationState,
  type SendLifecycle,
  type ShellFixture
} from './lunowa-shell-model';
import {isAttentionReadModel, type AttentionItemReadModel, type AttentionReadModel} from '@/lib/attention-types';
import {
  FixtureSourceList,
  RealSourceList,
  RealSourceSearch,
  SourceConversationDetail
} from './source-ui';
import type {SourceConversationReadModel, SourcePageReadModel} from './source-types';
import type {CommunicationParticipant, DraftSaveState, ReplyContextReadModel, ReplyMode} from '@/lib/communication-types';

export * from './lunowa-shell-model';

type Surface = 'home' | 'needs' | 'managed' | 'review' | 'source' | 'search' | 'settings';
type Detail = 'moment' | 'managed-detail' | 'review-detail' | 'delegation' | 'conversation' | null;
type AttentionAction = 'STOP_TRACKING' | 'RETURN_ATTENTION' | 'DELEGATE' | 'RESOLVE_ADMISSION_REVIEW' | 'CORRECT_OPERATIONAL_OUTCOME';
type AttentionMutation = {key: string; state: MutationState; error: string};

const navigation: readonly {id: Surface; label: string; icon: typeof House}[] = [
  {id: 'home', label: 'ホーム', icon: House}, {id: 'needs', label: '対応が必要', icon: Sparkles},
  {id: 'managed', label: '管理中', icon: ShieldCheck}, {id: 'review', label: '確認', icon: CircleHelp},
  {id: 'source', label: '会話', icon: Mail}, {id: 'search', label: '検索', icon: SearchIcon},
  {id: 'settings', label: '設定', icon: SettingsIcon}
];

const attentionItemStatic = {
  id: 'estimate-hiroko',
  person: '佐藤ひろ子',
  topic: '見積書の確認',
  action: '見積書を確認して返信する',
  whyNow: '明日の打ち合わせ前に確認が必要です。'
};

const sourceItem = {
  id: 'source-estimate',
  sender: '佐藤ひろ子',
  subject: '来期の見積書について',
  preview: '添付の見積書をご確認いただけますか。',
  time: '10:24'
};

export function isImeKeyboardEvent(event: Pick<KeyboardEvent, 'isComposing' | 'keyCode'>) {
  return event.isComposing || event.keyCode === 229;
}

export type AppUserSummary = {id?: string; name: string; email: string};

type ShellProps = {
  appUser?: AppUserSummary;
  onSignOut?: () => Promise<void>;
  signingOut?: boolean;
  sessionActionError?: string;
  locale?: 'ja' | 'en';
  preview?: boolean;
};

export function LunowaShell(props: ShellProps = {}) {
  const [previewLocale, setPreviewLocale] = useState<'ja' | 'en'>(props.locale ?? 'ja');
  const locale = props.preview ? previewLocale : props.locale ?? 'ja';
  return <NextIntlClientProvider locale={locale} messages={{Workspace: (locale === 'en' ? enMessages : jaMessages).Workspace}} timeZone="Asia/Tokyo"><LunowaWorkspace {...props} onPreviewLocaleChange={setPreviewLocale} /></NextIntlClientProvider>;
}

function LunowaWorkspace({appUser, onSignOut, signingOut = false, sessionActionError = '', preview = false, onPreviewLocaleChange}: ShellProps & {onPreviewLocaleChange: (locale: 'ja' | 'en') => void}) {
  const t = useTranslations('Workspace');
  const locale = useLocale();
  const [surface, setSurface] = useState<Surface>('home');
  const [detail, setDetail] = useState<Detail>(null);
  const [detailOrigin, setDetailOrigin] = useState(attentionItemStatic.id);
  const [fixtureId, setFixtureId] = useState<ShellFixture['id']>('normal');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftVersion, setDraftVersion] = useState<number | null>(null);
  const [draftSaveState, setDraftSaveState] = useState<DraftSaveState>('idle');
  const [draftDirty, setDraftDirty] = useState(false);
  const [replyMode, setReplyMode] = useState<ReplyMode>('REPLY');
  const [replyContext, setReplyContext] = useState<ReplyContextReadModel | null>(null);
  const [draftRecipients, setDraftRecipients] = useState<{to: CommunicationParticipant[]; cc: CommunicationParticipant[]} | null>(null);
  const [replyContextKey, setReplyContextKey] = useState('');
  const [replyContextError, setReplyContextError] = useState('');
  const [sendOperationStatus, setSendOperationStatus] = useState<SendLifecycle>('draft');
  const draftGeneration = useRef(0);
  const draftEditRevision = useRef(0);
  const draftSaveInFlightGeneration = useRef<number | null>(null);
  const [localCommonMutations, setLocalCommonMutations] = useState<Record<Exclude<CommonMutationTarget, null>, MutationState>>({
    'stop-tracking': 'idle',
    'review-answer': 'idle'
  });
  const [sendOverride, setSendOverride] = useState<SendLifecycle | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchAccountId, setSearchAccountId] = useState('');
  const [sourceModel, setSourceModel] = useState<SourcePageReadModel | null>(null);
  const [sourceLoading, setSourceLoading] = useState(() => Boolean(appUser?.id));
  const [sourceError, setSourceError] = useState('');
  const [sourceReload, setSourceReload] = useState(0);
  const [sourceSearchModel, setSourceSearchModel] = useState<SourcePageReadModel | null>(null);
  const [sourceSearchLoading, setSourceSearchLoading] = useState(false);
  const [sourceSearchError, setSourceSearchError] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [sourceConversation, setSourceConversation] = useState<SourceConversationReadModel | null>(null);
  const [sourceConversationLoading, setSourceConversationLoading] = useState(false);
  const [sourceConversationError, setSourceConversationError] = useState('');
  const [historyKey, setHistoryKey] = useState('');
  const [attentionModel, setAttentionModel] = useState<AttentionReadModel | null>(null);
  const [attentionOwnerId, setAttentionOwnerId] = useState<string | null>(null);
  const [attentionLoading, setAttentionLoading] = useState(() => Boolean(appUser?.id));
  const [attentionError, setAttentionError] = useState('');
  const [attentionReload, setAttentionReload] = useState(0);
  const [attentionMutation, setAttentionMutation] = useState<AttentionMutation>({key: '', state: 'idle', error: ''});
  const navTrigger = useRef<HTMLButtonElement>(null);
  const drawerPanel = useRef<HTMLElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const fixture = shellFixtures.find(({id}) => id === fixtureId) ?? shellFixtures[0];

  const liveAttention = appUser?.id && attentionOwnerId === appUser.id ? attentionModel : null;
  const liveAttentionLoading = Boolean(appUser?.id) && (attentionOwnerId !== appUser?.id || attentionLoading);
  const liveAttentionError = attentionOwnerId === appUser?.id ? attentionError : '';
  const reviewCount = appUser?.id ? liveAttention?.review.length ?? 0 : Number(fixture.hasReview);
  const hasReview = reviewCount > 0;
  const selectedAttention = liveAttention
    ? [...liveAttention.needsYou, ...liveAttention.managed, ...liveAttention.later, ...liveAttention.review, ...liveAttention.done, ...(liveAttention.delegationCandidates ?? [])]
      .find((item) => detailOrigin === item.id || detailOrigin === `attention-${item.id}` || detailOrigin === `managed-${item.id}` || detailOrigin === `review-${item.id}` || detailOrigin === `delegation-${item.id}`) ?? null
    : null;
  const historyConversationId = detail === 'moment' ? selectedAttention?.conversationId : detail === 'conversation' ? selectedConversationId : undefined;
  const historyAccountId = detail === 'moment' ? selectedAttention?.connectedAccountId : undefined;
  const activeHistoryKey = appUser?.id && historyConversationId ? `${appUser.id}:${historyConversationId}:${historyAccountId ?? ''}` : '';
  const visibleHistory = historyKey === activeHistoryKey && sourceConversation && sourceConversation.id === historyConversationId && (!historyAccountId || sourceConversation.account.id === historyAccountId) ? sourceConversation : null;

  const commonMutations = {
    'stop-tracking': localCommonMutations['stop-tracking'] === 'idle' && fixture.mutationTarget === 'stop-tracking' ? fixture.mutation : localCommonMutations['stop-tracking'],
    'review-answer': localCommonMutations['review-answer'] === 'idle' && fixture.mutationTarget === 'review-answer' ? fixture.mutation : localCommonMutations['review-answer']
  };
  const sendState = sendOverride ?? fixture.send;
  const changeFixture = (id: ShellFixture['id']) => {
    draftGeneration.current += 1;
    draftEditRevision.current += 1;
    setLocalCommonMutations({'stop-tracking': 'idle', 'review-answer': 'idle'});
    setSendOverride(null);
    setReplyContext(null);
    setReplyContextKey('');
    setReplyContextError('');
    setDraftRecipients(null);
    setDraftId(null);
    setDraftVersion(null);
    setDraftSaveState('idle');
    setDraftDirty(false);
    setSendOperationStatus('draft');
    setFixtureId(id);
  };

  const openDetail = (next: Detail, origin: string) => {
    setDetail(next);
    setDetailOrigin(origin);
    window.setTimeout(() => {
      if (window.matchMedia?.('(max-width: 719px)').matches) detailHeading.current?.focus();
    }, 0);
  };

  const openConversation = (origin: string, conversationId = origin) => {
    if (replyContext?.conversationId !== conversationId) {
      draftGeneration.current += 1;
      draftEditRevision.current += 1;
      setReplyContext(null);
      setReplyContextKey('');
      setReplyContextError('');
      setDraft('');
      setDraftId(null);
      setDraftVersion(null);
      setDraftRecipients(null);
      setDraftSaveState('idle');
      setDraftDirty(false);
      setSendOperationStatus('draft');
    }
    setSelectedConversationId(conversationId);
    setSourceConversation(null);
    setSourceConversationLoading(true);
    setSourceConversationError('');
    openDetail('conversation', origin);
  };

  const selectSurface = (next: Surface) => {
    setSurface(next);
    setDetail(null);
    setDrawerOpen(false);
    setStatus(t('navigateStatus', {name: t(next)}));
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    window.setTimeout(() => navTrigger.current?.focus(), 0);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawerOpen) {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key === 'Tab' && drawerOpen && drawerPanel.current) {
        const focusable = Array.from(drawerPanel.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], select:not([disabled])'));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (first && last) {
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
      const target = event.target;
      const editable = target instanceof Element && target.matches('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !editable && !isImeKeyboardEvent(event)) {
        event.preventDefault();
        setSurface('search');
        setDetail(null);
        window.setTimeout(() => document.getElementById('source-search')?.focus(), 0);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) window.setTimeout(() => drawerPanel.current?.querySelector<HTMLElement>('button')?.focus(), 0);
  }, [drawerOpen]);

  useEffect(() => {
    if (!appUser?.id) return;
    const controller = new AbortController();
    void fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/source/conversations?limit=50`, {
      credentials: 'same-origin',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('SOURCE_LIST_FAILED');
        return response.json() as Promise<SourcePageReadModel>;
      })
      .then((result) => setSourceModel(result))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setSourceError(error instanceof Error ? error.message : 'SOURCE_LIST_FAILED');
      })
      .finally(() => {
        if (!controller.signal.aborted) setSourceLoading(false);
      });
    return () => controller.abort();
  }, [appUser?.id, sourceReload]);

  const loadMoreSource = () => {
    if (!appUser?.id || !sourceModel?.nextCursor || sourceLoading) return;
    const controller = new AbortController();
    const query = new URLSearchParams({limit: '50', cursor: sourceModel.nextCursor});
    setSourceLoading(true);
    setSourceError('');
    void fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/source/conversations?${query.toString()}`, {
      credentials: 'same-origin',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('SOURCE_LIST_FAILED');
        return response.json() as Promise<SourcePageReadModel>;
      })
      .then((result) => setSourceModel((current) => current ? {
        ...result,
        conversations: [...current.conversations, ...result.conversations]
      } : result))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setSourceError(error instanceof Error ? error.message : 'SOURCE_LIST_FAILED');
      })
      .finally(() => {
        if (!controller.signal.aborted) setSourceLoading(false);
      });
  };

  useEffect(() => {
    if (!appUser?.id) return;
    if (!search.trim()) return;
    const controller = new AbortController();
    const userId = appUser.id;
    const timer = window.setTimeout(() => {
      setSourceSearchLoading(true);
      setSourceSearchError('');
      const query = new URLSearchParams({q: search});
      if (searchAccountId) query.set('accountId', searchAccountId);
      void fetch(`/api/bff/users/${encodeURIComponent(userId)}/source/search?${query.toString()}`, {
        credentials: 'same-origin',
        signal: controller.signal
      })
        .then(async (response) => {
          if (!response.ok) throw new Error('SOURCE_SEARCH_FAILED');
          return response.json() as Promise<SourcePageReadModel>;
        })
        .then((result) => setSourceSearchModel(result))
        .catch((error: unknown) => {
          if (!controller.signal.aborted) setSourceSearchError(error instanceof Error ? error.message : 'SOURCE_SEARCH_FAILED');
        })
        .finally(() => {
          if (!controller.signal.aborted) setSourceSearchLoading(false);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [appUser?.id, search, searchAccountId]);

  const loadMoreSourceSearch = () => {
    if (!appUser?.id || !search.trim() || !sourceSearchModel?.nextCursor || sourceSearchLoading) return;
    const controller = new AbortController();
    const query = new URLSearchParams({q: search, limit: '50', cursor: sourceSearchModel.nextCursor});
    if (searchAccountId) query.set('accountId', searchAccountId);
    setSourceSearchLoading(true);
    setSourceSearchError('');
    void fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/source/search?${query.toString()}`, {
      credentials: 'same-origin',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('SOURCE_SEARCH_FAILED');
        return response.json() as Promise<SourcePageReadModel>;
      })
      .then((result) => setSourceSearchModel((current) => current && current.query.text === search.normalize('NFC').trim() && current.query.accountId === (searchAccountId || null) ? {
        ...result,
        conversations: [...current.conversations, ...result.conversations]
      } : current))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setSourceSearchError(error instanceof Error ? error.message : 'SOURCE_SEARCH_FAILED');
      })
      .finally(() => {
        if (!controller.signal.aborted) setSourceSearchLoading(false);
      });
  };

  useEffect(() => {
    if (!appUser?.id || !historyConversationId) return;
    const controller = new AbortController();
    const accountQuery = historyAccountId ? `?accountId=${encodeURIComponent(historyAccountId)}` : '';
    void fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/source/conversations/${encodeURIComponent(historyConversationId)}${accountQuery}`, {
      credentials: 'same-origin',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('SOURCE_CONVERSATION_FAILED');
        return response.json() as Promise<SourceConversationReadModel>;
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        setHistoryKey(activeHistoryKey);
        setSourceConversationError('');
        setSourceConversation(result);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setHistoryKey(activeHistoryKey);
          setSourceConversationError(error instanceof Error ? error.message : 'SOURCE_CONVERSATION_FAILED');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSourceConversationLoading(false);
      });
    return () => controller.abort();
  }, [appUser?.id, historyConversationId, historyAccountId, activeHistoryKey]);

  useEffect(() => {
    if (!appUser?.id || (detail !== 'moment' && detail !== 'conversation')) return;
    const attentionItem = attentionModel
      ? [...attentionModel.needsYou, ...attentionModel.managed, ...attentionModel.later, ...attentionModel.review, ...attentionModel.done, ...(attentionModel.delegationCandidates ?? [])]
        .find((item) => detailOrigin === item.id || detailOrigin === `attention-${item.id}` || detailOrigin === `managed-${item.id}` || detailOrigin === `review-${item.id}` || detailOrigin === `delegation-${item.id}`)
      : null;
    const conversationId = detail === 'moment' ? attentionItem?.conversationId : sourceConversation?.id ?? replyContext?.conversationId;
    const accountId = detail === 'moment' ? attentionItem?.connectedAccountId : sourceConversation?.account.id ?? replyContext?.connectedAccount.id;
    if (!conversationId || !accountId || (detail === 'conversation' && !sourceConversation)) return;
    const latestInboundMessage = detail === 'conversation' ? [...sourceConversation!.messages].reverse().find((message) => message.direction === 'INBOUND') : undefined;
    const key = `${conversationId}:${accountId}:${replyMode}:${latestInboundMessage?.id ?? ''}`;
    if (replyContextKey === key && replyContext) return;
    const controller = new AbortController();
    const query = new URLSearchParams({connectedAccountId: accountId, conversationId, mode: replyMode});
    if (latestInboundMessage) query.set('inReplyToMessageId', latestInboundMessage.id);
    void fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/drafts/context?${query.toString()}`, {credentials: 'same-origin', signal: controller.signal})
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json().catch(() => null) as {error?: string} | null)?.error ?? 'REPLY_CONTEXT_FAILED');
        const result: unknown = await response.json();
        if (!result || typeof result !== 'object' || !Array.isArray((result as {recipients?: unknown}).recipients) || !Array.isArray((result as {cc?: unknown}).cc) || !(result as {sender?: unknown}).sender) throw new Error('REPLY_CONTEXT_INVALID');
        return result as ReplyContextReadModel;
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        draftGeneration.current += 1;
        const sameConversation = replyContext?.conversationId === result.conversationId;
        setReplyContext(result);
        setReplyContextKey(key);
        setReplyContextError('');
        setDraft(result.draft?.body ?? (sameConversation ? draft : ''));
        setDraftId(result.draft?.id ?? null);
        setDraftVersion(result.draft?.version ?? null);
        setDraftRecipients(result.draft ? {to: result.draft.recipients, cc: result.draft.cc} : null);
        setDraftSaveState(result.draft ? 'saved' : 'idle');
        setDraftDirty(false);
        setSendOperationStatus('draft');
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setReplyContextError(error instanceof Error ? error.message : 'REPLY_CONTEXT_FAILED');
      });
    return () => controller.abort();
  }, [appUser?.id, attentionModel, detail, detailOrigin, draft, replyContext, replyContextKey, replyMode, sourceConversation]);

  useEffect(() => {
    if (!appUser?.id || !replyContext || !draftDirty) return;
    const userId = appUser.id;
    const generation = draftGeneration.current;
    const editRevision = draftEditRevision.current;
    const timer = window.setTimeout(() => {
      if (draftSaveInFlightGeneration.current === generation) return;
      draftSaveInFlightGeneration.current = generation;
      setDraftSaveState('saving');
      void fetch(`/api/bff/users/${encodeURIComponent(userId)}/drafts`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          draftId,
          expectedVersion: draftVersion,
          connectedAccountId: replyContext.connectedAccount.id,
          conversationId: replyContext.conversationId,
          inReplyToMessageId: replyContext.inReplyToMessageId,
          mode: replyContext.mode,
          body: draft,
          recipients: draftRecipients?.to,
          cc: draftRecipients?.cc
        })
      })
        .then(async (response) => {
          const result = await response.json().catch(() => null) as {id?: string; version?: number; error?: string} | null;
          if (!response.ok || !result?.id || !result.version) throw new Error(result?.error ?? 'DRAFT_SAVE_FAILED');
          return result;
        })
        .then((result) => {
          if (generation !== draftGeneration.current) return;
          setDraftId(result.id!);
          setDraftVersion(result.version!);
          if (editRevision === draftEditRevision.current) {
            setDraftSaveState('saved');
            setDraftDirty(false);
          } else {
            setDraftSaveState('idle');
          }
        })
        .catch((error: unknown) => {
          if (generation === draftGeneration.current) setDraftSaveState(error instanceof Error && error.message === 'DRAFT_VERSION_CONFLICT' ? 'conflict' : 'failed');
        })
        .finally(() => {
          if (draftSaveInFlightGeneration.current === generation) draftSaveInFlightGeneration.current = null;
        });
    }, 240);
    return () => window.clearTimeout(timer);
  }, [appUser?.id, draft, draftDirty, draftId, draftRecipients, draftVersion, replyContext]);

  useEffect(() => {
    if (!appUser?.id) return;
    const userId = appUser.id;
    const controller = new AbortController();
    void fetch(`/api/bff/users/${encodeURIComponent(userId)}/attention`, {
      credentials: 'same-origin',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('ATTENTION_LOAD_FAILED');
        const result: unknown = await response.json();
        if (!isAttentionReadModel(result)) throw new Error('ATTENTION_READ_MODEL_INVALID');
        return result;
      })
      .then((result) => {
        setAttentionModel(result);
        setAttentionOwnerId(userId);
        setAttentionError('');
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAttentionOwnerId(userId);
          setAttentionError(error instanceof Error ? error.message : 'ATTENTION_LOAD_FAILED');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAttentionLoading(false);
      });
    return () => controller.abort();
  }, [appUser?.id, attentionReload]);

  if (fixture.session === 'session_expired') {
    return (
      <main className="session-panel" data-testid="session-expired">
        <p className="eyebrow">LUNOWA</p>
        <h1>セッションの期限が切れました</h1>
        <p>アプリへのアクセスを続けるには、もう一度サインインしてください。</p>
        <button className="primary-button" type="button">サインインする</button>
        <FixtureSwitch fixtureId={fixtureId} onChange={changeFixture} />
      </main>
    );
  }

  const announceMutation = (target: Exclude<CommonMutationTarget, null>, message: string) => {
    setLocalCommonMutations((current) => ({...current, [target]: 'pending'}));
    setStatus(message);
  };

  const attentionMutationKey = (action: AttentionAction, item: AttentionItemReadModel) => `${action}:${item.subjectKind}:${item.id}`;
  const performAttentionAction = async (action: AttentionAction, item: AttentionItemReadModel, value?: string) => {
    if (!appUser?.id) return;
    const key = attentionMutationKey(action, item);
    const requestKey = crypto.randomUUID();
    setAttentionMutation({key, state: 'pending', error: ''});
    setStatus(action === 'DELEGATE' ? 'この件を任せています' : action === 'RETURN_ATTENTION' ? '注意を戻しています' : action === 'STOP_TRACKING' ? '監視を停止しています' : action === 'RESOLVE_ADMISSION_REVIEW' ? '確認を保存しています' : '修正を保存しています');
    const body: Record<string, unknown> = {
      action,
      requestKey,
      connectedAccountId: item.connectedAccountId,
      evidenceRevision: item.acceptedEvidenceRevision,
      expectedAggregateVersion: item.aggregateVersion,
      responsibilityId: item.responsibilityId
    };
    if (action === 'RESOLVE_ADMISSION_REVIEW') {
      body.admissionReviewId = item.admissionReviewId;
      body.resolution = 'DO_NOT_TRACK';
    }
    if (action === 'CORRECT_OPERATIONAL_OUTCOME') body.value = value;
    try {
      if (!body.connectedAccountId || body.evidenceRevision === undefined || body.expectedAggregateVersion === undefined || (action !== 'RESOLVE_ADMISSION_REVIEW' && !body.responsibilityId) || (action === 'RESOLVE_ADMISSION_REVIEW' && !body.admissionReviewId)) {
        throw new Error('現在の受け入れ状態を確認できないため、操作を保留しました');
      }
      const response = await fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/attention/actions`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok || !result || typeof result !== 'object' || (result as {accepted?: unknown}).accepted !== true) {
        const message = result && typeof result === 'object' && typeof (result as {error?: unknown}).error === 'string' ? (result as {error: string}).error : 'ATTENTION_ACTION_FAILED';
        throw new Error(message);
      }
      setAttentionMutation({key, state: 'confirmed', error: ''});
      setStatus('保存を確認しました。現在の状態を更新しています');
      setAttentionError('');
      setAttentionReload((current) => current + 1);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'ATTENTION_ACTION_FAILED';
      setAttentionMutation({key, state: 'failed', error: message});
      setStatus('保存できませんでした。現在の状態は変わっていません');
    }
  };

  const getAttentionMutation = (action: AttentionAction) => selectedAttention && attentionMutation.key === attentionMutationKey(action, selectedAttention) ? attentionMutation.state : 'idle';

  const requestImmediateSend = async () => {
    if (detail === 'moment' && (!selectedAttention || !replyContext || selectedAttention.conversationId !== replyContext.conversationId || selectedAttention.connectedAccountId !== replyContext.connectedAccount.id || replyContext.mode !== replyMode)) return;
    if (!appUser?.id || !draftId) {
      setStatus('下書きの保存を確認してから送信してください');
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setSendOperationStatus('draft');
      setStatus('現在オフラインです。送信されていません。下書きは保持されています。オンラインに戻ってから明示的に送信してください');
      return;
    }
    if (!replyContext?.connectedAccount.sendAuthorized) {
      setSendOperationStatus('draft');
      setStatus('Gmailの送信権限がありません。設定でメールボックスを再接続して送信権限を許可してください');
      return;
    }
    const responsibilityBinding = selectedAttention?.subjectKind === 'RESPONSIBILITY' &&
      selectedAttention.responsibilityId && selectedAttention.conversationId === replyContext.conversationId &&
      selectedAttention.aggregateVersion !== undefined && selectedAttention.acceptedEvidenceRevision !== undefined
      ? {
          responsibilityId: selectedAttention.responsibilityId,
          aggregateVersion: selectedAttention.aggregateVersion,
          evidenceRevision: selectedAttention.acceptedEvidenceRevision
        }
      : undefined;
    const requestBody = JSON.stringify({draftId, ...(responsibilityBinding ? {responsibilityBinding} : {})});
    setSendOperationStatus('request_pending');
    setStatus('送信をリクエストしています');

    // Repeating this same explicit request is safe: the server reuses any
    // non-failed SendOperation for the immutable draft version. For ambiguous
    // or provider-accepted states, dispatch performs reconciliation only and
    // never issues another Gmail send.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      let response: Response;
      try {
        response = await fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/send-operations`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {'Content-Type': 'application/json'},
          body: requestBody
        });
      } catch {
        if (attempt < 4) {
          await new Promise((resolve) => window.setTimeout(resolve, 300));
          continue;
        }
        setSendOperationStatus('provider_ambiguous');
        setStatus('送信結果を確認できません。重複送信を避けるため、再試行せず確認を続けます');
        return;
      }
      const result = await response.json().catch(() => null) as {accepted?: boolean; operation?: {status?: string}} | null;
      if (!response.ok || result?.accepted !== true || !result.operation?.status) {
        if (response.status >= 400 && response.status < 500) {
          setSendOperationStatus('provider_failed');
          setStatus('送信リクエストは受け付けられませんでした。下書きは保持されています');
          return;
        }
        if (attempt < 4) {
          await new Promise((resolve) => window.setTimeout(resolve, 300));
          continue;
        }
        setSendOperationStatus('provider_ambiguous');
        setStatus('送信結果を確認できません。重複送信を避けるため、再試行せず確認を続けます');
        return;
      }

      switch (result.operation.status) {
        case 'FAILED':
          setSendOperationStatus('provider_failed');
          setStatus('送信できませんでした。下書きは保持されています');
          return;
        case 'RECONCILED':
          setSendOperationStatus('provider_reconciled');
          setStatus('送信を確認しました。現在の状態を反映しました');
          setAttentionReload((current) => current + 1);
          return;
        case 'PROVIDER_ACCEPTED':
          setSendOperationStatus('provider_confirmed_reconciling');
          setStatus('送信を確認しました。状態を更新しています');
          break;
        case 'AMBIGUOUS':
        case 'DISPATCHING':
          setSendOperationStatus('provider_ambiguous');
          setStatus('送信結果を確認しています。重複送信を避けるため、再送しません');
          break;
        case 'PENDING':
          setSendOperationStatus('request_pending');
          setStatus('送信をリクエストしています');
          break;
        default:
          setSendOperationStatus('provider_ambiguous');
          setStatus('送信結果を確認できません。重複送信を避けるため、確認を続けます');
          return;
      }
      if (attempt < 4) await new Promise((resolve) => window.setTimeout(resolve, 300));
    }
  };

  const effectiveSendState = replyContext ? sendOperationStatus : sendState;

  return (
    <main className={`app-shell workspace-shell${detail ? ' has-detail' : ''}${surface === 'home' ? ' is-home' : ''}`} data-testid="lunowa-shell" lang={locale}>
      <a className="skip-link" href="#surface-heading">{t('skip')}</a>
      <header className="mobile-header">
        <button
          ref={navTrigger}
          className="icon-button"
          type="button"
          aria-label={t('openNav')}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={22} />
        </button>
        <Image className="workspace-logo" src="/brand/lunowa-logo.png" alt="Lunowa" width={210} height={70} />
      </header>
      <aside ref={drawerPanel} className={drawerOpen ? 'primary-nav open' : 'primary-nav'} aria-label={t('navLabel')} role={drawerOpen ? 'dialog' : undefined} aria-modal={drawerOpen || undefined}>
        <div className="brand workspace-brand"><span className="brand-monogram" aria-hidden="true">L</span><Image className="workspace-logo" src="/brand/lunowa-logo.png" alt="Lunowa" width={210} height={70} /></div><p className="nav-section-label">{t('workspaceLabel')}</p>
        <nav>
          {navigation.filter((item) => item.id !== 'review' || hasReview || surface === 'review').map((item) => (
            <button
              className={surface === item.id ? 'nav-item active' : 'nav-item'}
              key={item.id}
              type="button"
              aria-current={surface === item.id ? 'page' : undefined}
              aria-label={t('show', {name: t(item.id)})}
              onClick={() => selectSurface(item.id)}
            >
              <item.icon className="nav-icon" size={19} strokeWidth={1.7} aria-hidden="true" />
              <span className="nav-label">{t(item.id)}</span>
              <span className="nav-tooltip" aria-hidden="true">{t(item.id)}</span>
              {item.id === 'review' && <span className="nav-count" aria-label={t('itemCount', {count: reviewCount})}>{reviewCount}</span>}
            </button>
          ))}
        </nav>
        <div className="nav-bottom"><p>{t('navFooter')}</p><button className="workspace-profile" onClick={() => selectSurface('settings')} aria-label={t('viewSettings')}><span className="profile-avatar"><UserRound size={18} /></span><span><strong>{appUser?.name || t('previewUser')}</strong><span>{appUser?.email || t('previewTitle')}</span></span><ArrowRight size={15} /></button></div>
      </aside>
      {drawerOpen && <button aria-label={t('closeNav')} className="scrim" onClick={closeDrawer} />}

      <section className="surface-pane" aria-label={t('currentSurface')}>
        {preview && <div className="workspace-preview" role="note"><strong>{t('previewTitle')}</strong><span>{t('previewNotice')}</span><select aria-label={t('language')} value={locale} onChange={(event) => onPreviewLocaleChange(event.target.value === 'en' ? 'en' : 'ja')}><option value="ja">日本語</option><option value="en">English</option></select></div>}
        <SurfaceContent
          selectedOrigin={detail ? detailOrigin : undefined}
          surface={surface}
          onNavigate={selectSurface}
          fixture={fixture}
          attention={liveAttention}
          attentionLoading={liveAttentionLoading}
          attentionError={liveAttentionError}
          appUser={appUser}
          onSignOut={onSignOut}
          signingOut={signingOut}
          sessionActionError={sessionActionError}
          onRefreshData={() => {
            setSourceError('');
            setSourceLoading(true);
            setSourceReload((current) => current + 1);
            setAttentionModel(null);
            setAttentionOwnerId(null);
            setAttentionLoading(true);
            setAttentionError('');
            setAttentionReload((current) => current + 1);
          }}
          search={search}
          searchAccountId={searchAccountId}
          sourceModel={sourceModel}
          sourceLoading={sourceLoading}
          sourceError={sourceError}
          onRetrySource={() => {
            setSourceError('');
            setSourceLoading(true);
            setSourceReload((current) => current + 1);
          }}
          sourceSearchModel={sourceSearchModel}
          sourceSearchLoading={sourceSearchLoading}
          sourceSearchError={sourceSearchError}
          openMoment={(origin = attentionItemStatic.id) => openDetail('moment', origin)}
          openManaged={(origin = 'managed-estimate') => openDetail('managed-detail', origin)}
          openReview={(origin = 'review-condition') => openDetail('review-detail', origin)}
          openDelegation={(origin = 'delegation-candidate') => openDetail('delegation', origin)}
          openConversation={openConversation}
          onLoadMoreSource={loadMoreSource}
          onLoadMoreSourceSearch={loadMoreSourceSearch}
          onSearch={(value) => {
            setSearch(value);
            setSourceSearchModel(null);
            setSourceSearchError('');
            setSourceSearchLoading(Boolean(value.trim()));
          }}
          onSearchAccount={(value) => {
            setSearchAccountId(value);
            setSourceSearchModel(null);
            setSourceSearchError('');
            if (search.trim()) setSourceSearchLoading(true);
          }}
        />
        {!appUser?.id && <FixtureSwitch fixtureId={fixtureId} onChange={changeFixture} />}
      </section>

      <section className="detail-pane" aria-label="詳細" aria-live="off">
        {preview && detail && <p className="workspace-detail-preview">{t('previewNotice')}</p>}
        {detail ? (
          <DetailContent
            detail={detail}
            headingRef={detailHeading}
            draft={draft}
            onDraft={(value) => {
              setDraft(value);
              draftEditRevision.current += 1;
              setDraftSaveState('idle');
              setDraftDirty(true);
            }}
            commonMutations={commonMutations}
            sendState={effectiveSendState}
            fixture={fixture}
            attentionItem={selectedAttention}
            replyContext={replyContext}
            replyContextError={replyContextError}
            replyMode={replyMode}
            onReplyMode={(mode) => {
              setReplyMode(mode);
              draftGeneration.current += 1;
              draftEditRevision.current += 1;
              setReplyContextKey('');
              setDraftId(null);
              setDraftVersion(null);
              setDraftRecipients(null);
              setDraftSaveState('idle');
              setDraftDirty(false);
              setSendOperationStatus('draft');
            }}
            draftSaveState={draftSaveState}
            draftRecipients={draftRecipients}
            onRecipients={(recipients) => {
              setDraftRecipients(recipients);
              draftEditRevision.current += 1;
              setDraftSaveState('idle');
              setDraftDirty(true);
            }}
            sourceConversation={visibleHistory}
            sourceConversationLoading={sourceConversationLoading || Boolean(activeHistoryKey && historyKey !== activeHistoryKey)}
            sourceConversationError={historyKey === activeHistoryKey ? sourceConversationError : ''}
            sourceUserId={appUser?.id}
            getAttentionMutation={getAttentionMutation}
            onAttentionAction={(action, value) => selectedAttention && void performAttentionAction(action, selectedAttention, value)}
            onBack={() => {
              setDetail(null);
              setStatus('一覧に戻りました');
              window.setTimeout(() => document.getElementById(detailOrigin)?.focus(), 0);
            }}
            onCommonMutation={announceMutation}
            onSend={replyContext ? () => void requestImmediateSend() : () => {
              setSendOverride('request_pending');
              setStatus('送信をリクエストしています');
            }}
            onOpenSource={(conversationId) => {
              setSurface('source');
              openConversation(sourceItem.id, conversationId ?? sourceModel?.conversations[0]?.id ?? sourceItem.id);
            }}
          />
        ) : (
          <EmptyDetail />
        )}
      </section>
      <div className="status-region" role="status" aria-live="polite" aria-atomic="true">{status}</div>
    </main>
  );
}

function FixtureSwitch({fixtureId, onChange}: {fixtureId: ShellFixture['id']; onChange: (id: ShellFixture['id']) => void}) {
  const t = useTranslations('Workspace');
  return (
    <label className="fixture-switch">
      <span>{t('fixtureLabel')}</span>
      <select value={fixtureId} onChange={(event) => onChange(event.target.value as ShellFixture['id'])}>
        {shellFixtures.map((fixture) => <option key={fixture.id} value={fixture.id}>{t(`fixtures.${fixture.id}`)}</option>)}
      </select>
    </label>
  );
}

function SurfaceContent({selectedOrigin, surface, onNavigate, fixture, attention, attentionLoading, attentionError, appUser, onSignOut, signingOut, sessionActionError, onRefreshData, search, onSearch, searchAccountId, onSearchAccount, sourceModel, sourceLoading, sourceError, onRetrySource, sourceSearchModel, sourceSearchLoading, sourceSearchError, openMoment, openManaged, openReview, openDelegation, openConversation, onLoadMoreSource, onLoadMoreSourceSearch}: {
  selectedOrigin?: string;
  surface: Surface;
  onNavigate: (surface: Surface) => void;
  fixture: ShellFixture;
  attention: AttentionReadModel | null;
  attentionLoading: boolean;
  attentionError: string;
  appUser?: AppUserSummary;
  onSignOut?: () => Promise<void>;
  signingOut: boolean;
  sessionActionError: string;
  onRefreshData: () => void;
  search: string;
  onSearch: (value: string) => void;
  searchAccountId: string;
  onSearchAccount: (value: string) => void;
  sourceModel: SourcePageReadModel | null;
  sourceLoading: boolean;
  sourceError: string;
  onRetrySource: () => void;
  sourceSearchModel: SourcePageReadModel | null;
  sourceSearchLoading: boolean;
  sourceSearchError: string;
  onLoadMoreSource: () => void;
  onLoadMoreSourceSearch: () => void;
  openMoment: (origin?: string) => void;
  openManaged: (origin?: string) => void;
  openReview: (origin?: string) => void;
  openDelegation: (origin?: string) => void;
  openConversation: (origin: string, conversationId?: string) => void;
}) {
  const t = useTranslations('Workspace');
  const title = t(surface);
  const integrity = attention ? attention.integrity.status === 'degraded' : fixture.integrity === 'degraded';
  const partial = attention ? attention.source.readiness === 'partial' : fixture.sourceReadiness === 'partial';
  const loading = attention ? attention.source.readiness === 'loading' : fixture.sourceReadiness === 'loading';
  const liveCoverageMessage = attention?.integrity.message ?? t('coverageUnknown');
  const attentionSurface = surface === 'home' || surface === 'needs' || surface === 'managed' || surface === 'review';
  if (appUser?.id && attentionSurface && !attention && attentionLoading) return <><div className="surface-header"><h1 id="surface-heading">{title}</h1></div><LoadingState /></>;
  if (appUser?.id && attentionSurface && !attention && attentionError) return <><div className="surface-header"><h1 id="surface-heading">{title}</h1></div><AttentionUnavailable onRetry={onRefreshData} /></>;
  return (
    <>
      <div className="surface-header">
        <div><h1 id="surface-heading">{title}</h1>{surface === 'home' && <p className="workspace-subtitle">{t('subtitle')}</p>}</div><button className="workspace-search" aria-label={t('openSearch')} onClick={() => onNavigate('search')}><SearchIcon size={17} /><span>{t('searchPlaceholder')}</span><kbd>/</kbd></button>
      </div>
      {!attention && integrity && <IntegrityBanner onInspect={() => onNavigate('settings')} />}
      {!attention && partial && <p className="coverage-notice" role="status">{t('partialNotice')}</p>}
      {attention && surface !== 'home' && attention.integrity.status !== 'healthy' && <p className="coverage-notice" role="status">{liveCoverageMessage}</p>}
      {loading && <LoadingState />}
      {!loading && surface === 'home' && <WorkspaceHome selectedOrigin={selectedOrigin} fixture={fixture} attention={attention} sourceModel={sourceModel} live={Boolean(appUser?.id)} sourceLoading={sourceLoading} sourceError={sourceError} openMoment={openMoment} openReview={openReview} openManaged={openManaged} openDelegation={openDelegation} openConversation={openConversation} onNavigate={onNavigate} />}
      {!loading && surface === 'needs' && <NeedsYou fixture={fixture} attention={attention} openMoment={openMoment} openConversation={(origin, conversationId) => openConversation(origin, conversationId ?? sourceModel?.conversations[0]?.id ?? origin)} />}
      {!loading && surface === 'managed' && <Managed fixture={fixture} attention={attention} openManaged={openManaged} />}
      {!loading && surface === 'review' && <Review fixture={fixture} attention={attention} openReview={openReview} />}
      {!loading && surface === 'source' && (appUser?.id
        ? <RealSourceList model={sourceModel} loading={sourceLoading} error={sourceError} onRetry={onRetrySource} onOpenConversation={(conversationId) => openConversation(conversationId, conversationId)} onLoadMore={onLoadMoreSource} />
        : <FixtureSourceList openConversation={openConversation} openMoment={openMoment} />)}
      {!loading && surface === 'search' && (appUser?.id
        ? <RealSourceSearch model={sourceSearchModel ?? sourceModel} loading={sourceSearchLoading} error={sourceSearchError} text={search} accountId={searchAccountId} onText={onSearch} onAccount={onSearchAccount} onOpenConversation={(conversationId) => openConversation(conversationId, conversationId)} onLoadMore={onLoadMoreSourceSearch} />
        : <Search search={search} onSearch={onSearch} openConversation={openConversation} />)}
      {!loading && surface === 'settings' && (
        <Settings
          fixture={fixture}
          appUser={appUser}
          onSignOut={onSignOut}
          signingOut={signingOut}
          sessionActionError={sessionActionError}
          sourceModel={sourceModel}
          attention={attention}
          onRefreshData={onRefreshData}
          onOpenManaged={openManaged}
        />
      )}
    </>
  );
}

function NeedsYou({fixture, attention, openMoment, openConversation}: {fixture: ShellFixture; attention: AttentionReadModel | null; openMoment: (origin?: string) => void; openConversation: (origin: string, conversationId?: string) => void}) {
  if (attention) return <div className="surface-content"><p className="surface-intro">現在のあなたの対応が必要なものだけを表示しています。</p>{attention.needsYou.length > 0 ? attention.needsYou.map((item) => <div key={item.id}><LiveAttentionButton item={item} onClick={openMoment} /><button id={`source-${item.id}`} className="source-link" type="button" onClick={() => openConversation(`source-${item.id}`, item.conversationId)}>元の会話を開く</button></div>) : <p className="empty-state">現在、対応が必要な件はありません。</p>}</div>;
  return <div className="surface-content"><p className="surface-intro">現在のあなたの対応が必要なものだけを表示しています。</p>{fixture.hasNeedsYou ? <><AttentionButton onClick={openMoment} /><button id="needs-open-source" className="source-link" type="button" onClick={(event) => openConversation(event.currentTarget.id)}>元の会話を開く</button></> : <p className="empty-state">現在、対応が必要な件はありません。</p>}</div>;
}

function LiveAttentionButton({item, onClick}: {item: AttentionItemReadModel; onClick: (origin?: string) => void}) {
  return <button id={`attention-${item.id}`} className="list-row attention-row" type="button" onClick={() => onClick(`attention-${item.id}`)}><span className="state-chip action">対応</span><strong>{item.primaryAction ?? item.operationalOutcome}</strong><span>{item.operationalOutcome}</span>{item.nearestRelevantTime && <span className="metadata">{item.overdue ? '期限を過ぎています' : `期限・再確認: ${item.nearestRelevantTime}`}</span>}</button>;
}

function LiveReviewButton({item, onClick}: {item: AttentionItemReadModel; onClick: (origin?: string) => void}) {
  return <button id={`review-${item.id}`} className="list-row review-row" type="button" onClick={() => onClick(`review-${item.id}`)}><span className="state-chip review">確認</span><strong>{item.reviewQuestion ?? item.operationalOutcome}</strong><span>{item.operationalOutcome}</span></button>;
}

function AttentionButton({onClick}: {onClick: () => void}) {
  return <button id={attentionItemStatic.id} className="list-row attention-row" type="button" onClick={onClick}><span className="state-chip action">対応</span><strong>{attentionItemStatic.action}</strong><span>{attentionItemStatic.person} · {attentionItemStatic.topic}</span><span className="metadata">{attentionItemStatic.whyNow}</span></button>;
}

function Managed({fixture, attention, openManaged}: {fixture: ShellFixture; attention: AttentionReadModel | null; openManaged: (origin?: string) => void}) {
  if (attention) {
    const managedSection = attention.managedCount > 0 ? <><section className="managed-summary"><p className="eyebrow">監視中</p><h2>Lunowaが見ています <strong>{attention.managedCount}</strong></h2><p>{attention.integrity.status === 'healthy' ? '監視は正常です。必要になるまで静かに見守ります。' : attention.integrity.message}</p></section>{attention.managed.map((item) => <button id={`managed-${item.id}`} key={item.id} className="list-row" type="button" onClick={() => openManaged(`managed-${item.id}`)}><span className="state-chip waiting">待機中</span><strong>{item.operationalOutcome}</strong><span>{item.awaitedEvent ?? '再確認条件を確認できます'}</span><span className="metadata">{item.returnCondition ?? '条件はSourceとともに確認できます'}</span></button>)}</> : null;
    const laterSection = attention.later.length > 0 ? <section className="managed-summary" aria-labelledby="later-list-heading"><p className="eyebrow">あとで確認するもの</p><h2 id="later-list-heading">委ねた確認 <strong>{attention.later.length}</strong></h2><p>委ねたままの確認を分けて表示しています。監視なしとは扱いません。</p>{attention.later.map((item) => <button id={`later-${item.id}`} key={item.id} className="list-row" type="button" onClick={() => openManaged(`managed-${item.id}`)}><span className="state-chip waiting">あとで</span><strong>{item.operationalOutcome}</strong><span>{item.awaitedEvent ?? '再確認条件を確認できます'}</span><span className="metadata">戻す条件: {item.returnCondition ?? '条件はSourceとともに確認できます'}</span></button>)}</section> : null;
    if (managedSection || laterSection) return <div className="surface-content">{managedSection}{laterSection}</div>;
    return <div className="surface-content"><section className="managed-summary"><p className="eyebrow">監視の状態</p><h2>監視中の会話はありません</h2><p>{attention.integrity.status === 'healthy' ? '任せる操作が確認されるまで、健康な監視件数は表示しません。' : attention.integrity.message}</p></section></div>;
  }
  if (fixture.monitoringPosture !== 'active') return <div className="surface-content"><section className="managed-summary"><p className="eyebrow">監視の状態</p><h2>{fixture.monitoringPosture === 'stopped_by_user' ? '停止した監視があります' : '監視中の会話はありません'}</h2><p>{fixture.monitoringPosture === 'stopped_by_user' ? '停止は、会話の結果を判断したものではありません。' : '任せる操作が確認されるまで、健康な監視件数は表示しません。'}</p></section></div>;
  return <div className="surface-content"><section className="managed-summary"><p className="eyebrow">監視中</p><h2>Lunowaが見ています <strong>4</strong></h2><p>監視は正常です。必要になるまで静かに見守ります。</p></section><button id="managed-estimate" className="list-row" type="button" onClick={() => openManaged()}><span className="state-chip waiting">待機中</span><strong>来期の見積書</strong><span>佐藤ひろ子からの確認を待っています</span><span className="metadata">再確認条件: 9月3日、または返信</span></button></div>;
}

function Review({fixture, attention, openReview}: {fixture: ShellFixture; attention: AttentionReadModel | null; openReview: (origin?: string) => void}) {
  if (attention) return <div className="surface-content"><p className="surface-intro">小さく、判断が必要な確認だけを表示しています。</p>{attention.review.length > 0 ? attention.review.map((item) => <LiveReviewButton key={item.id} item={item} onClick={openReview} />) : <p className="empty-state">現在、確認が必要な事項はありません。</p>}</div>;
  return <div className="surface-content"><p className="surface-intro">小さく、判断が必要な確認だけを表示しています。</p>{fixture.hasReview ? <button id="review-condition" className="list-row review-row" type="button" onClick={() => openReview()}><span className="state-chip review">確認</span><strong>契約更新の条件を確認してください</strong><span>更新日が会話内で一致していません。</span></button> : <p className="empty-state">現在、確認が必要な事項はありません。</p>}</div>;
}

function Search({search, onSearch, openConversation}: {search: string; onSearch: (value: string) => void; openConversation: (origin: string) => void}) {
  return <div className="surface-content"><label className="search-box" htmlFor="source-search">メールを検索<input id="source-search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="送信者、件名、語句を入力" /></label>{search ? <><p className="metadata">「{search}」の認可された完全一致を検索しています。</p><button id="search-result-estimate" className="list-row" type="button" onClick={(event) => openConversation(event.currentTarget.id)}><strong>{sourceItem.subject}</strong><span>{sourceItem.preview}</span></button></> : <p className="empty-state">検索語を入力すると、会話の原文を検索します。</p>}</div>;
}

function Settings({fixture, appUser, onSignOut, signingOut, sessionActionError, sourceModel, attention, onRefreshData, onOpenManaged}: {
  fixture: ShellFixture;
  appUser?: AppUserSummary;
  onSignOut?: () => Promise<void>;
  signingOut: boolean;
  sessionActionError: string;
  sourceModel: SourcePageReadModel | null;
  attention: AttentionReadModel | null;
  onRefreshData: () => void;
  onOpenManaged: (origin?: string) => void;
}) {
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState('');
  const delegatedItems = (accountId: string): AttentionItemReadModel[] => attention
    ? [...attention.needsYou, ...attention.managed, ...attention.later, ...attention.review, ...attention.done]
      .filter((item) => item.connectedAccountId === accountId && item.liveTrackingState === 'TRACKING_ACTIVE')
    : [];
  const delegatedCount = (accountId: string): number | null => attention ? delegatedItems(accountId).length : null;
  const disconnect = async (accountId: string) => {
    if (!appUser?.id) return;
    if (disconnectTarget !== accountId) {
      setDisconnectTarget(accountId);
      setDisconnectError('');
      return;
    }
    setDisconnecting(true);
    setDisconnectError('');
    try {
      const response = await fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/gmail/accounts/${encodeURIComponent(accountId)}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error('DISCONNECT_FAILED');
      setDisconnectTarget(null);
      onRefreshData();
    } catch {
      setDisconnectError('メール連携の解除処理を完了できませんでした。監視状態または接続状態の一部が更新されている可能性があるため、最新状態を再確認しています。必要ならもう一度お試しください。');
      onRefreshData();
    } finally {
      setDisconnecting(false);
    }
  };
  return <div className="surface-content">
    {appUser && <section className="settings-card" aria-labelledby="app-account-heading">
      <h2 id="app-account-heading">アプリのアカウント</h2>
      <p>このLunowaアプリへのサインインです。メールボックスの接続や監視設定とは別です。</p>
      <dl><div><dt>サインイン中</dt><dd>{appUser.name} · {appUser.email}</dd></div></dl>
      {onSignOut && <button className="danger-button" disabled={signingOut} type="button" onClick={() => void onSignOut()}>{signingOut ? 'ログアウトしています' : 'この端末からログアウト'}</button>}
      <p className="metadata">ログアウトしても、メール連携は解除されず、サーバー側の監視設定も変更されません。</p>
      {sessionActionError && <p className="inline-status" role="alert">{sessionActionError}</p>}
    </section>}
    <section className="settings-card" aria-labelledby="mailbox-heading">
      <h2 id="mailbox-heading">接続と監視</h2>
      <p>メールボックスの接続は、アプリへのサインインとは別の状態です。</p>
      {sourceModel?.accounts.length ? sourceModel.accounts.map((account) => {
        const monitored = delegatedCount(account.id);
        const capabilities = account.grantedCapabilities ?? [];
        const disconnected = account.connectionState === 'DISCONNECTED';
        const degraded = !disconnected && (account.monitoring?.status === 'degraded' || account.sync.status === 'ERROR' || account.sync.status === 'RECONCILIATION_REQUIRED');
        return <article className="settings-account" key={account.id}>
          <h3>{account.emailAddress}</h3>
          <dl>
            <div><dt>接続状態</dt><dd>{disconnected ? '意図的に解除済み' : degraded ? '再接続または再同期が必要です' : account.sync.status}</dd></div>
            <div><dt>監視中</dt><dd>{monitored === null ? '確認中' : `${monitored}件`}</dd></div>
            <div><dt>データ確認時点</dt><dd>{account.sync.dataThroughAt ? new Date(account.sync.dataThroughAt).toLocaleString('ja-JP') : '不明'}</dd></div>
            <div><dt>権限</dt><dd>{capabilities.includes('mail_send') ? '読み取り・監視・送信' : '読み取り・監視（送信権限なし）'}</dd></div>
          </dl>
          {degraded && <p className="inline-status" role="alert">このアカウントの最新状態は信頼できません。{account.monitoring?.lastTrustworthyAt ? `最終確認: ${new Date(account.monitoring.lastTrustworthyAt).toLocaleString('ja-JP')}。` : '最終確認時点は不明です。'} 再接続後、未確認期間を同期してから監視を正常に戻します。</p>}
          {account.connectionState !== 'CONNECTED' && !disconnected && <form action={`/api/bff/users/${encodeURIComponent(appUser?.id ?? '')}/gmail/authorize`} method="get"><input name="returnTo" type="hidden" value="/ja" /><button className="primary-button" type="submit">このメールボックスを再接続</button></form>}
          {disconnected && <p className="metadata">解除により新しいメールの監視は停止しています。保存済みのSourceはプロバイダー側のメールとは別に保持されます。</p>}
          {account.connectionState === 'CONNECTED' && <>
            {disconnectTarget === account.id && <>
              <p className="inline-status" role="alert">{monitored === null ? '監視中の項目を確認できていません。' : monitored > 0 ? `この解除で${monitored}件の監視が停止します。完了や対応不要にはなりません。` : 'このメールボックスの新しい監視を停止します。完了や対応不要にはなりません。'} もう一度押すと解除します。</p>
              {monitored !== null && monitored > 0 && <button className="quiet-button" type="button" onClick={() => onOpenManaged(delegatedItems(account.id)[0]?.id)}>影響する監視中の項目を見る</button>}
            </>}
            <button className="danger-button" type="button" disabled={disconnecting} onClick={() => void disconnect(account.id)}>{disconnectTarget === account.id ? '解除を確定する' : 'メール連携を解除する'}</button>
          </>}
        </article>;
      }) : <dl><div><dt>メールボックス</dt><dd>未接続（fixture）</dd></div><div><dt>会話を読む権限</dt><dd>{fixture.sourceRead}</dd></div></dl>}
      {appUser?.id && <form action={`/api/bff/users/${encodeURIComponent(appUser.id)}/gmail/authorize`} method="get">
        <input name="returnTo" type="hidden" value="/ja" />
        <button className="primary-button" type="submit">Gmailを接続 / 再接続</button>
      </form>}
      {appUser?.id && <p className="metadata">Googleの同意画面へ移動します。メールボックス接続はアプリのログインとは別です。</p>}
      {disconnectError && <p className="inline-status" role="alert">{disconnectError}</p>}
    </section>
    <section className="settings-card" aria-labelledby="product-account-deletion-heading">
      <h2 id="product-account-deletion-heading">Lunowaアカウントの削除</h2>
      <p>メール連携の解除とは別の、高い影響を持つProductアカウント操作です。</p>
      <p className="metadata">削除機能を提供する際は、Lunowaの監視・委任を停止します。Gmail側のメールを削除する操作ではありません。</p>
      <p className="inline-status" role="status">現在、この画面から削除処理は実行しません。データ保持・バックアップ・エクスポート・プロバイダー認可の具体的な扱いは、公開前のプライバシー / データ保持方針が確定してから確認内容とともに有効化します。</p>
    </section>
  </div>;
}

function DetailContent({detail, headingRef, draft, onDraft, commonMutations, sendState, fixture, attentionItem, replyContext, replyContextError, replyMode, onReplyMode, draftSaveState, draftRecipients, onRecipients, sourceConversation, sourceConversationLoading, sourceConversationError, sourceUserId, getAttentionMutation, onAttentionAction, onBack, onCommonMutation, onSend, onOpenSource}: {
  detail: Detail;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  draft: string;
  onDraft: (value: string) => void;
  commonMutations: Record<Exclude<CommonMutationTarget, null>, MutationState>;
  sendState: SendLifecycle;
  fixture: ShellFixture;
  attentionItem: AttentionItemReadModel | null;
  replyContext: ReplyContextReadModel | null;
  replyContextError: string;
  replyMode: ReplyMode;
  onReplyMode: (mode: ReplyMode) => void;
  draftSaveState: DraftSaveState;
  draftRecipients: {to: CommunicationParticipant[]; cc: CommunicationParticipant[]} | null;
  onRecipients: (recipients: {to: CommunicationParticipant[]; cc: CommunicationParticipant[]}) => void;
  sourceConversation: SourceConversationReadModel | null;
  sourceConversationLoading: boolean;
  sourceConversationError: string;
  sourceUserId?: string;
  getAttentionMutation: (action: AttentionAction) => MutationState;
  onAttentionAction: (action: AttentionAction, value?: string) => void;
  onBack: () => void;
  onCommonMutation: (target: Exclude<CommonMutationTarget, null>, message: string) => void;
  onSend: () => void;
  onOpenSource: (conversationId?: string) => void;
}) {
  const t = useTranslations('Workspace');
  const matchingMomentContext = !sourceUserId || (attentionItem?.conversationId === replyContext?.conversationId && attentionItem?.connectedAccountId === replyContext?.connectedAccount.id && replyContext?.mode === replyMode);
  const title = detail === 'conversation'
    ? sourceUserId ? sourceConversation?.subject ?? 'Sourceの会話' : sourceItem.subject
    : detail === 'review-detail' ? attentionItem?.reviewQuestion ?? '契約更新の条件を確認してください' : detail === 'delegation' ? attentionItem?.operationalOutcome ?? '任せる候補を確認してください' : detail === 'managed-detail' ? attentionItem?.operationalOutcome ?? '来期の見積書を見守っています' : attentionItem?.operationalOutcome ?? (sourceUserId ? t('selectedWork') : attentionItemStatic.action);
  return <div className="detail-content"><button className="back-button" type="button" onClick={onBack}>‹ {t('backToList')}</button>{detail !== 'moment' && <h2 ref={headingRef} tabIndex={-1}>{title}</h2>}
    {detail === 'moment' && <MomentBody title={sourceUserId ? title : t('sampleAction')} headingRef={headingRef} item={attentionItem} onSource={onOpenSource} history={sourceUserId ? <SourceConversationDetail conversation={sourceConversation} userId={sourceUserId} loading={sourceConversationLoading} error={sourceConversationError} /> : <SampleThread />} person={sourceConversation?.messages.find((message) => message.direction === 'INBOUND')?.sender.displayName ?? sourceConversation?.messages.find((message) => message.direction === 'INBOUND')?.sender.email} draft={draft} onDraft={onDraft} sendState={sendState} fixture={fixture} onSend={onSend} replyContext={matchingMomentContext ? replyContext : null} replyContextError={replyContextError} replyMode={replyMode} onReplyMode={onReplyMode} draftSaveState={draftSaveState} draftRecipients={matchingMomentContext ? draftRecipients : null} onRecipients={onRecipients} liveContextRequired={Boolean(sourceUserId)} />}
    {detail === 'managed-detail' && <ManagedDetail item={attentionItem} live={Boolean(sourceUserId)} mutation={attentionItem ? getAttentionMutation('STOP_TRACKING') : commonMutations['stop-tracking']} returnMutation={attentionItem ? getAttentionMutation('RETURN_ATTENTION') : 'idle'} onMutation={onCommonMutation} onAttentionAction={onAttentionAction} onSource={onOpenSource} />}
    {detail === 'review-detail' && <ReviewDetail item={attentionItem} live={Boolean(sourceUserId)} mutation={attentionItem ? attentionItem.subjectKind === 'ADMISSION_REVIEW' ? getAttentionMutation('RESOLVE_ADMISSION_REVIEW') : getAttentionMutation('CORRECT_OPERATIONAL_OUTCOME') : commonMutations['review-answer']} onMutation={onCommonMutation} onAttentionAction={onAttentionAction} onSource={onOpenSource} />}
    {detail === 'delegation' && <DelegationDetail item={attentionItem} mutation={getAttentionMutation('DELEGATE')} onAttentionAction={onAttentionAction} onSource={onOpenSource} />}
    {detail === 'conversation' && (sourceUserId
      ? <><SourceConversationDetail conversation={sourceConversation} userId={sourceUserId} loading={sourceConversationLoading} error={sourceConversationError} />{sourceConversation && <Composer draft={draft} onDraft={onDraft} sendState={sendState} fixture={fixture} onSend={onSend} replyContext={replyContext?.conversationId === sourceConversation.id ? replyContext : null} replyContextError={replyContextError} replyMode={replyMode} onReplyMode={onReplyMode} draftSaveState={draftSaveState} draftRecipients={draftRecipients} onRecipients={onRecipients} liveContextRequired />}</>
      : <Conversation draft={draft} onDraft={onDraft} sendState={sendState} fixture={fixture} onSend={onSend} replyContext={replyContext} replyContextError={replyContextError} replyMode={replyMode} onReplyMode={onReplyMode} draftSaveState={draftSaveState} draftRecipients={draftRecipients} onRecipients={onRecipients} liveContextRequired={false} />)}
  </div>;
}

type ComposerProps = {
  draft: string;
  onDraft: (value: string) => void;
  sendState: SendLifecycle;
  fixture: ShellFixture;
  onSend: () => void;
  replyContext: ReplyContextReadModel | null;
  replyContextError: string;
  replyMode: ReplyMode;
  onReplyMode: (mode: ReplyMode) => void;
  draftSaveState: DraftSaveState;
  draftRecipients: {to: CommunicationParticipant[]; cc: CommunicationParticipant[]} | null;
  onRecipients: (recipients: {to: CommunicationParticipant[]; cc: CommunicationParticipant[]}) => void;
  liveContextRequired: boolean;
};

function SampleThread() {
  const t = useTranslations('Workspace');
  return <div className="workspace-thread"><p className="thread-heading">{t('conversationHistory')}</p><article className="sample-message"><header><strong>{t('samplePerson')}</strong><time>10:15</time></header><p>{t('sampleMessageOne')}</p></article><article className="sample-message outbound"><header><strong>{t('you')}</strong><time>10:20</time></header><p>{t('sampleMessageTwo')}</p></article><article className="sample-message"><header><strong>{t('samplePerson')}</strong><time>10:24</time></header><p>{t('sampleMessageThree')}</p></article></div>;
}

function MomentBody({item, onSource, history, person, title, headingRef, ...composer}: {title: string; headingRef: React.RefObject<HTMLHeadingElement | null>; item: AttentionItemReadModel | null; onSource: (conversationId?: string) => void; history: React.ReactNode; person?: string | null} & ComposerProps) {
  const t = useTranslations('Workspace');
  return <><div className="moment-person"><span className="conversation-avatar" aria-hidden="true"><UserRound size={23} /></span><div><strong>{person ?? (composer.liveContextRequired ? t('selectedWork') : t('samplePerson'))}</strong><p>{item?.operationalOutcome ?? t(composer.liveContextRequired ? 'loading' : 'sampleSubject')}</p></div></div><section className="moment-action"><p className="moment-action-label"><Sparkles size={15} />{t('nextAction')}</p><div className="moment-action-main"><h2 ref={headingRef} tabIndex={-1} className="moment-action-title">{title}</h2><button className="primary-button" type="button" disabled={composer.liveContextRequired && !composer.replyContext} onClick={() => document.getElementById('reply-body')?.focus()}>{t('writeReply')}</button></div><p className="moment-action-context">{item?.operationalOutcome ?? t(composer.liveContextRequired ? 'loading' : 'sampleWhy')}</p><button className="source-link" type="button" onClick={() => onSource(item?.conversationId)}>{t('viewOriginal')}</button></section><div className="moment-history">{history}</div><Composer {...composer} /></>;
}

function ManagedDetail({item, live, mutation, returnMutation, onMutation, onAttentionAction, onSource}: {item: AttentionItemReadModel | null; live: boolean; mutation: MutationState; returnMutation: MutationState; onMutation: (target: Exclude<CommonMutationTarget, null>, message: string) => void; onAttentionAction: (action: AttentionAction, value?: string) => void; onSource: (conversationId?: string) => void}) {
  const later = item?.surface === 'LATER';
  return <><p className="detail-lead">{item?.awaitedEvent ?? '佐藤ひろ子からの返信'}、または{item?.returnCondition ?? '再確認条件'}を見守っています。</p><section><h3>監視の状態</h3><p><span className="state-chip waiting">{later ? 'あとで' : '待機中'}</span> {item ? later ? '委ねた確認を分けて保持しています。' : '現在のResponsibilityを監視しています。' : live ? '保存後の現在の状態を確認しています。' : '監視は正常です。'}</p></section><section><h3>元の会話</h3><p>{item ? item.conversationId : sourceItem.subject}</p></section>{item && <button className="source-link" type="button" onClick={() => onSource(item.conversationId)}>元の会話を確認する</button>}{later && <button className="choice-button" disabled={returnMutation === 'pending'} type="button" onClick={() => onAttentionAction('RETURN_ATTENTION')}>{returnMutation === 'pending' ? '注意を戻しています' : '今、確認する'}</button>}{(!live || item) && <button className="danger-button" disabled={mutation === 'pending'} type="button" onClick={() => item ? onAttentionAction('STOP_TRACKING') : onMutation('stop-tracking', '監視を停止しています')}>{mutation === 'pending' ? '監視を停止しています' : '監視を停止する'}</button>}{returnMutation === 'confirmed' && <p className="inline-status" role="status">注意を戻しました。現在の対応状態を再確認しています。</p>}{returnMutation === 'failed' && <p className="inline-status" role="status">注意を戻せませんでした。委ねた状態は変わっていません。</p>}{mutation === 'confirmed' && <p className="inline-status" role="status">監視の停止を保存しました。完了とは扱っていません。</p>}{mutation === 'failed' && <p className="inline-status" role="status">監視を停止できませんでした。現在の監視は継続しています。</p>}<p className="metadata">停止は、確認されるまで完了や対応不要を意味しません。</p></>;
}

function ReviewDetail({item, live, mutation, onMutation, onAttentionAction, onSource}: {item: AttentionItemReadModel | null; live: boolean; mutation: MutationState; onMutation: (target: Exclude<CommonMutationTarget, null>, message: string) => void; onAttentionAction: (action: AttentionAction, value?: string) => void; onSource: (conversationId?: string) => void}) {
  const [correction, setCorrection] = useState('');
  const admissionReview = item?.subjectKind === 'ADMISSION_REVIEW';
  return <><p className="detail-lead">{item?.reviewQuestion ?? '会話内で更新日が2つ示されています。正しい条件を選んでください。'}</p><section><h3>対象</h3><p>{item?.operationalOutcome ?? '契約更新の条件'}</p></section><section><h3>根拠</h3><p>{item ? item.projection.primaryReason : '8月29日のメッセージ: 9月30日。8月30日の添付: 10月1日。'}</p></section>{item && <button className="source-link" type="button" onClick={() => onSource(item.conversationId)}>元の会話を確認する</button>}{admissionReview ? <section><h3>判断</h3><p>この候補を追跡しない場合だけ、ここで解決できます。追跡する場合は、受け入れ済み候補を伴う再評価が必要です。</p><button className="choice-button" disabled={mutation === 'pending'} type="button" onClick={() => onAttentionAction('RESOLVE_ADMISSION_REVIEW')}>{mutation === 'pending' ? '確認を保存しています' : 'この依頼を追跡しない'}</button></section> : live && !item ? <p className="inline-status" role="status">保存後の現在の確認状態を再取得しています。</p> : <fieldset disabled={mutation === 'pending'}><legend>対応内容を修正する</legend><label htmlFor="operational-outcome-correction">修正後の対応内容<input id="operational-outcome-correction" value={correction} onChange={(event) => setCorrection(event.target.value)} placeholder="現在の対応内容" /></label><button className="choice-button" disabled={Boolean(item) && !correction.trim()} type="button" onClick={() => item ? onAttentionAction('CORRECT_OPERATIONAL_OUTCOME', correction) : onMutation('review-answer', '回答を保存しています')}>{item ? '内容を修正して保存' : '確認して保存する'}</button></fieldset>}{mutation === 'pending' && <p className="inline-status" role="status">保存しています。確認されるまでこの確認は残ります。</p>}{mutation === 'confirmed' && <p className="inline-status" role="status">{item ? '保存を確認しました。現在の確認状態を更新しています。' : '回答を保存しました。会話の状態を確認しています。'}</p>}{mutation === 'failed' && <p className="inline-status" role="status">{item ? '保存できませんでした。選択や修正はまだ確定していません。' : '回答を保存できませんでした。選択はまだ確定していません。'}</p>}</>;
}

function DelegationDetail({item, mutation, onAttentionAction, onSource}: {item: AttentionItemReadModel | null; mutation: MutationState; onAttentionAction: (action: AttentionAction, value?: string) => void; onSource: (conversationId?: string) => void}) {
  return <><p className="detail-lead">この件を任せると、Lunowaが「{item?.operationalOutcome ?? '選んだ対応'}」を見守ります。</p><section><h3>見守る約束</h3><p>期待する出来事: {item?.awaitedEvent ?? '相手の返信または次の出来事'}</p><p>戻す条件: {item?.returnCondition ?? '条件を確認して再表示します'}</p></section><section><h3>元の会話</h3><p>{item?.conversationId ?? sourceItem.subject}</p></section>{item && <button className="source-link" type="button" onClick={() => onSource(item.conversationId)}>元の会話を確認する</button>}<button className="primary-button" disabled={mutation === 'pending' || !item} type="button" onClick={() => item && onAttentionAction('DELEGATE')}>{mutation === 'pending' ? 'この件を任せています' : 'この件を任せる'}</button>{mutation === 'pending' && <p className="inline-status" role="status">保存を確認するまで、この候補は監視中には表示しません。</p>}{mutation === 'confirmed' && <p className="inline-status" role="status">任せる操作を保存しました。現在の状態を更新しています。</p>}{mutation === 'failed' && <p className="inline-status" role="status">任せる操作を保存できませんでした。この候補はまだ監視されていません。</p>}</>;
}

function Conversation(composer: ComposerProps) {
  return <><div className="message-card"><p className="metadata">佐藤ひろ子 · 10:24</p><p>添付の見積書をご確認いただけますか。明日の打ち合わせで確認できれば助かります。</p></div><p className="metadata">この会話は Source の原文です。要約や判断を必須にはしません。</p><Composer {...composer} /></>;
}

function Composer({draft, onDraft, sendState, fixture, onSend, replyContext, replyContextError, replyMode, onReplyMode, draftSaveState, draftRecipients, onRecipients, liveContextRequired}: ComposerProps) {
  const t = useTranslations('Workspace');
  if (liveContextRequired && !replyContext) {
    return <section className="composer" aria-labelledby="composer-heading"><h3 id="composer-heading">{t('reply')}</h3>{replyContextError ? <p className="inline-status" role="alert">{t('contextError')}</p> : <p className="inline-status" role="status">{t('contextLoading')}</p>}</section>;
  }
  const unavailable = !liveContextRequired && fixture.sourceRead === 'temporarily_unavailable';
  const awaitingResult = sendState === 'request_pending' || sendState === 'provider_ambiguous' || sendState === 'provider_confirmed_reconciling' || sendState === 'provider_reconciled';
  const toRecipients = draftRecipients?.to ?? replyContext?.recipients ?? [];
  const ccRecipients = draftRecipients?.cc ?? replyContext?.cc ?? [];
  const toLabel = toRecipients.map(({displayName, email}) => displayName ? `${displayName} <${email}>` : email).join(', ') || t('samplePerson');
  const toValue = toRecipients.map(({email}) => email).join(', ');
  const ccValue = ccRecipients.map(({email}) => email).join(', ');
  const fromLabel = replyContext ? `${replyContext.sender.displayName ?? ''} <${replyContext.sender.email}>`.trim() : 'work@example.jp';
  const parseRecipients = (value: string): CommunicationParticipant[] => value.split(',').map((email) => email.trim()).filter(Boolean).map((email) => ({email, displayName: null}));
  const feedback = sendState === 'request_pending' ? '送信をリクエストしています。確認されるまで、状態は変わりません。'
    : sendState === 'provider_failed' ? '送信できませんでした。下書きは保持されています。内容を確認して再試行できます。'
      : sendState === 'provider_ambiguous' ? '送信結果を確認しています。重複送信を避けるため、再試行はできません。'
        : sendState === 'provider_confirmed_reconciling' ? '送信を確認しました。状態を更新しています。'
        : sendState === 'provider_reconciled' ? '送信を確認しました。現在の状態へ反映済みです。'
          : null;
  const sendPermissionMissing = Boolean(replyContext && !replyContext.connectedAccount.sendAuthorized);
  const sendDisabled = !draft || awaitingResult || unavailable || sendPermissionMissing || Boolean(replyContextError) || Boolean(replyContext && draftSaveState !== 'saved');
  return <section className="composer" aria-labelledby="composer-heading"><h3 id="composer-heading">{t('reply')}</h3>{replyContext && <label htmlFor="reply-mode">{t('replyType')}<select id="reply-mode" value={replyMode} disabled={awaitingResult} onChange={(event) => onReplyMode(event.target.value as ReplyMode)}><option value="REPLY">{t('reply')}</option><option value="REPLY_ALL">{t('replyAll')}</option></select></label>}{replyContext ? <><label htmlFor="reply-to">{t('to')}<input id="reply-to" value={toValue} disabled={awaitingResult} onChange={(event) => onRecipients({to: parseRecipients(event.target.value), cc: ccRecipients})} /></label><label htmlFor="reply-cc">Cc<input id="reply-cc" value={ccValue} disabled={awaitingResult} onChange={(event) => onRecipients({to: toRecipients, cc: parseRecipients(event.target.value)})} /></label><p className="metadata">宛先の表示名: {toLabel} · From: {fromLabel}</p></> : <p className="metadata">{t('to')}: {toLabel} · From: {fromLabel}</p>}{replyContextError && <p className="inline-status" role="alert">{t('contextError')}</p>}{sendPermissionMissing && <p className="inline-status" role="status">Gmailの送信権限がありません。設定でメールボックスを再接続して送信権限を許可してください。読み取りと監視は継続できます。</p>}<label htmlFor="reply-body">{t('body')}<textarea id="reply-body" value={draft} disabled={awaitingResult} onChange={(event) => onDraft(event.target.value)} placeholder={t('replyPlaceholder')} rows={4} /></label>{unavailable && <p className="inline-status" role="status">現在オフラインです。下書きは保存されていますが、送信されていません。</p>}{replyContext && draftSaveState === 'saving' && <p className="inline-status" role="status">{t('savingDraft')}</p>}{replyContext && draftSaveState === 'conflict' && <p className="inline-status" role="alert">別の編集が保存されたため、下書きを上書きしていません。</p>}{feedback && <p className="inline-status" role="status">{feedback}</p>}<button className="primary-button" disabled={sendDisabled} type="button" onClick={onSend}>{sendState === 'request_pending' ? t('sendRequest') : sendState === 'provider_ambiguous' ? t('sendUnknown') : sendState === 'provider_confirmed_reconciling' ? t('sendUpdating') : sendState === 'provider_reconciled' ? t('sent') : sendState === 'provider_failed' ? t('retrySend') : t('send')}</button><p className="metadata">{t('noEnterSend')}</p></section>;
}

function IntegrityBanner({onInspect}: {onInspect: () => void}) {
  const t = useTranslations('Workspace');
  return <aside className="integrity-banner" aria-labelledby="integrity-title"><strong id="integrity-title">{t('integrityTitle')}</strong><span>{t('integrityBody')}</span><button type="button" onClick={onInspect}>{t('reconnect')}</button></aside>;
}

function LoadingState() {
  const t = useTranslations('Workspace');
  return <div className="loading-state" role="status"><span aria-hidden="true" />{t('loading')}</div>;
}
function AttentionUnavailable({onRetry}: {onRetry: () => void}) {
  const t = useTranslations('Workspace');
  return <div className="surface-content"><section className="managed-summary"><p className="eyebrow">{t('monitoringStatus')}</p><h2>{t('unavailableTitle')}</h2><p>{t('unavailableBody')}</p><button className="quiet-button" type="button" onClick={onRetry}>{t('retry')}</button></section></div>;
}
function EmptyDetail() { return <div className="empty-detail"><p className="eyebrow">詳細</p><h2>項目を選択してください</h2><p>対応、管理中、確認、または会話を選ぶと、ここに必要な文脈を表示します。</p></div>; }
