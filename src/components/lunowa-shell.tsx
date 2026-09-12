'use client';

import {useEffect, useRef, useState} from 'react';

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
import type {SourceConversationReadModel, SourceConversationSummary, SourcePageReadModel} from './source-types';
import type {CommunicationParticipant, DraftSaveState, ReplyContextReadModel, ReplyMode} from '@/lib/communication-types';

export * from './lunowa-shell-model';

type Surface = 'home' | 'needs' | 'managed' | 'review' | 'source' | 'search' | 'settings';
type Detail = 'moment' | 'managed-detail' | 'review-detail' | 'delegation' | 'conversation' | null;
type AttentionAction = 'STOP_TRACKING' | 'RETURN_ATTENTION' | 'DELEGATE' | 'RESOLVE_ADMISSION_REVIEW' | 'CORRECT_OPERATIONAL_OUTCOME';
type AttentionMutation = {key: string; state: MutationState; error: string};

const navigation: readonly {id: Surface; label: string; icon: string}[] = [
  {id: 'home', label: 'ホーム', icon: 'home'}, {id: 'needs', label: '対応が必要', icon: 'alert'},
  {id: 'managed', label: '管理中', icon: 'briefcase'}, {id: 'review', label: '確認', icon: 'check'},
  {id: 'source', label: '会話', icon: 'message'}, {id: 'search', label: '検索', icon: 'search'},
  {id: 'settings', label: '設定', icon: 'settings'}
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

function LunowaIcon({name, size = 18}: {name: string; size?: number}) {
  const paths: Record<string, string> = {
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    alert: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z',
    briefcase: 'M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm-6 0h-4V4h4v2Zm6 13H4v-7h6v1h4v-1h6v7Zm-6-8h-4V9h4v2Z',
    check: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2 15-5-5 1.4-1.4 3.6 3.57 7.6-7.58L19 8l-9 9Z',
    message: 'M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z',
    search: 'M9.5 3a6.5 6.5 0 1 0 3.92 11.68L19 20.27 20.27 19l-5.59-5.58A6.5 6.5 0 0 0 9.5 3Zm0 2A4.5 4.5 0 1 1 5 9.5 4.5 4.5 0 0 1 9.5 5Z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7.1 7.1 0 0 0-1.62-.94L14.4 2.8a.49.49 0 0 0-.48-.41h-3.84a.49.49 0 0 0-.47.41l-.36 2.55c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.73 8.87a.5.5 0 0 0 .12.61l2.03 1.58c-.05.3-.08.62-.08.94s.03.64.08.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.55c.04.24.23.41.47.41h3.84c.24 0 .44-.17.48-.41l.36-2.55c.59-.24 1.12-.56 1.62-.94l2.39.96c.22.07.47 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.02-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z',
    chevron: 'm9 18 6-6-6-6 1.4-1.4L17.8 12l-7.4 7.4L9 18Z'
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={paths[name] ?? paths.message} /></svg>;
}

function LunowaMark() {
  return <svg className="lunowa-mark" aria-hidden="true" width="36" height="36" viewBox="0 0 40 40" fill="none"><path d="M29.5 5.5A15 15 0 1 0 30 33a13.2 13.2 0 1 1-.5-27.5Z" fill="#F5A623" /><path d="M7 28.5c5-4 8.5-5.2 12.1-2.9 3.1 2 6.4 1.5 13.9-3.4-5.3 6.6-10.9 9.5-16.2 7.4-3.2-1.3-6.1-.9-9.8 1.1v-2.2Z" fill="#17327C" /><path d="M16.1 20.7c2.2-3.6 5.1-4.9 8.2-3.5-2.1.6-3.3 1.5-3.6 2.8 2.8-1 5-.4 6.5 1.7-4.2-.9-7.6-.4-11.1 1.9v-2.9Z" fill="#17327C" /></svg>;
}

function attentionForOrigin(model: AttentionReadModel | null, origin: string): AttentionItemReadModel | null {
  if (!model) return null;
  return [...model.needsYou, ...model.managed, ...model.later, ...model.review, ...model.done, ...(model.delegationCandidates ?? [])]
    .find((item) => origin === item.id || origin === `attention-${item.id}` || origin === `managed-${item.id}` || origin === `review-${item.id}` || origin === `delegation-${item.id}`) ?? null;
}

function userInitial(user?: AppUserSummary) {
  return user?.name?.trim().charAt(0) || user?.email?.trim().charAt(0).toUpperCase() || 'L';
}

export function isImeKeyboardEvent(event: Pick<KeyboardEvent, 'isComposing' | 'keyCode'>) {
  return event.isComposing || event.keyCode === 229;
}

export type AppUserSummary = {id?: string; name: string; email: string};

export function LunowaShell({appUser, onSignOut, signingOut = false, sessionActionError = ''}: {
  appUser?: AppUserSummary;
  onSignOut?: () => Promise<void>;
  signingOut?: boolean;
  sessionActionError?: string;
} = {}) {
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
  const previewAttentionModel = appUser?.id && attentionOwnerId === appUser.id ? attentionModel : null;
  const homePreviewAttention = surface === 'home' ? previewAttentionModel?.needsYou[0] ?? null : null;
  const activeDataDetail: Detail = detail ?? (homePreviewAttention ? 'moment' : null);
  const activeDataOrigin = detail ? detailOrigin : homePreviewAttention ? `attention-${homePreviewAttention.id}` : detailOrigin;
  const activeDataAttention = attentionForOrigin(previewAttentionModel, activeDataOrigin);
  const activeConversationId = activeDataDetail === 'conversation'
    ? selectedConversationId
    : activeDataDetail === 'moment'
      ? activeDataAttention?.conversationId ?? ''
      : '';

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
    setStatus(`${navigation.find((item) => item.id === next)?.label}を表示しました`);
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
    if (!appUser?.id || !activeConversationId || (detail !== 'conversation' && detail !== 'moment')) return;
    const controller = new AbortController();
    void fetch(`/api/bff/users/${encodeURIComponent(appUser.id)}/source/conversations/${encodeURIComponent(activeConversationId)}`, {
      credentials: 'same-origin',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('SOURCE_CONVERSATION_FAILED');
        return response.json() as Promise<SourceConversationReadModel>;
      })
      .then((result) => setSourceConversation(result))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setSourceConversationError(error instanceof Error ? error.message : 'SOURCE_CONVERSATION_FAILED');
      })
      .finally(() => {
        if (!controller.signal.aborted) setSourceConversationLoading(false);
      });
    return () => controller.abort();
  }, [activeConversationId, appUser?.id, detail]);

  useEffect(() => {
    if (!appUser?.id || (activeDataDetail !== 'moment' && activeDataDetail !== 'conversation')) return;
    const attentionItem = attentionForOrigin(previewAttentionModel, activeDataOrigin);
    const conversationId = activeDataDetail === 'moment' ? attentionItem?.conversationId : sourceConversation?.id ?? replyContext?.conversationId;
    const accountId = activeDataDetail === 'moment' ? attentionItem?.connectedAccountId : sourceConversation?.account.id ?? replyContext?.connectedAccount.id;
    if (!conversationId || !accountId || (activeDataDetail === 'conversation' && !sourceConversation)) return;
    const latestInboundMessage = sourceConversation?.id === conversationId ? [...sourceConversation.messages].reverse().find((message) => message.direction === 'INBOUND') : undefined;
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
  }, [activeDataDetail, activeDataOrigin, appUser?.id, draft, previewAttentionModel, replyContext, replyContextKey, replyMode, sourceConversation]);

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

  const liveAttention = appUser?.id && attentionOwnerId === appUser.id ? attentionModel : null;
  const liveAttentionLoading = Boolean(appUser?.id) && (attentionOwnerId !== appUser?.id || attentionLoading);
  const liveAttentionError = attentionOwnerId === appUser?.id ? attentionError : '';
  const hasReview = liveAttention ? liveAttention.review.length > 0 : fixture.hasReview;
  const reviewCount = liveAttention?.review.length ?? (fixture.hasReview ? 1 : 0);
  const selectedAttention = attentionForOrigin(liveAttention, detailOrigin);
  const homeDisplayAttention = surface === 'home' ? liveAttention?.needsYou[0] ?? null : null;
  const displayedDetail: Detail = detail ?? ((surface === 'home' && (homeDisplayAttention || !appUser?.id)) ? 'moment' : null);
  const displayedAttention = detail ? selectedAttention : homeDisplayAttention;
  const displayedSourceSummary = displayedAttention ? sourceModel?.conversations.find((item) => item.id === displayedAttention.conversationId) ?? null : null;
  const needsCount = liveAttention?.needsYou.length ?? (fixture.hasNeedsYou ? 1 : 0);
  const managedCount = liveAttention?.managedCount ?? (fixture.monitoringPosture === 'active' && fixture.integrity === 'healthy' ? 4 : 0);

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
    const responsibilityBinding = displayedAttention?.subjectKind === 'RESPONSIBILITY' &&
      displayedAttention.responsibilityId && displayedAttention.conversationId === replyContext.conversationId &&
      displayedAttention.aggregateVersion !== undefined && displayedAttention.acceptedEvidenceRevision !== undefined
      ? {
          responsibilityId: displayedAttention.responsibilityId,
          aggregateVersion: displayedAttention.aggregateVersion,
          evidenceRevision: displayedAttention.acceptedEvidenceRevision
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
    <main className={detail ? 'app-shell has-detail' : 'app-shell'} data-testid="lunowa-shell">
      <a className="skip-link" href="#surface-heading">本文へ移動</a>
      <header className="mobile-header">
        <button
          ref={navTrigger}
          className="icon-button"
          type="button"
          aria-label="ナビゲーションを開く"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          ☰
        </button>
        <span className="wordmark">LUNOWA</span>
      </header>
      <aside ref={drawerPanel} className={drawerOpen ? 'primary-nav open' : 'primary-nav'} aria-label="主なナビゲーション" role={drawerOpen ? 'dialog' : undefined} aria-modal={drawerOpen || undefined}>
        <div className="brand"><LunowaMark /><span className="brand-word">lunowa</span></div>
        <nav className="nav-main">
          {navigation.filter((item) => item.id !== 'settings' && (item.id !== 'review' || hasReview || surface === 'review')).map((item) => {
            const count = item.id === 'needs' ? needsCount : item.id === 'managed' ? managedCount : item.id === 'review' ? reviewCount : null;
            return <button
              className={surface === item.id ? 'nav-item active' : 'nav-item'}
              key={item.id}
              type="button"
              aria-current={surface === item.id ? 'page' : undefined}
              aria-label={`${item.label}を表示`}
              onClick={() => selectSurface(item.id)}
            >
              <span className={`nav-icon nav-icon-${item.id}`}><LunowaIcon name={item.icon} /></span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-tooltip" aria-hidden="true">{item.label}</span>
              {count !== null && count > 0 && <span className={`nav-count nav-count-${item.id}`} aria-label={`${item.label}が${count}件`}>{count}</span>}
            </button>;
          })}
        </nav>
        <div className="nav-spacer" />
        {(managedCount > 0 || liveAttention?.integrity.status === 'healthy') && <button className="nav-monitor-card" type="button" onClick={() => selectSurface('managed')} aria-label="Lunowaが見ている項目を表示">
          <span className="monitor-card-label"><LunowaIcon name="briefcase" size={15} /> Lunowaが見ています</span>
          <strong>{managedCount}<small>件</small></strong>
          <span>{managedCount > 0 ? '必要になるまで静かに見守ります。' : '現在、監視中の項目はありません。'}</span>
        </button>}
        <div className="nav-secondary">
          <button className={surface === 'settings' ? 'nav-item active' : 'nav-item'} type="button" aria-current={surface === 'settings' ? 'page' : undefined} aria-label="設定を表示" onClick={() => selectSurface('settings')}>
            <span className="nav-icon"><LunowaIcon name="settings" /></span><span className="nav-label">設定</span><span className="nav-tooltip" aria-hidden="true">設定</span>
          </button>
        </div>
        {appUser && <div className="nav-account"><span className="account-avatar">{userInitial(appUser)}</span><span className="account-copy"><strong>{appUser.name}</strong><small>{appUser.email}</small><em><i />オンライン</em></span></div>}
      </aside>
      {drawerOpen && <button aria-label="ナビゲーションを閉じる" className="scrim" onClick={closeDrawer} />}

      <section className={`surface-pane surface-${surface}`} aria-label="現在の画面">
        <SurfaceContent
          surface={surface}
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
          onOpenSearch={() => {
            setSurface('search');
            setDetail(null);
            window.setTimeout(() => document.getElementById('source-search')?.focus(), 0);
          }}
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
        {displayedDetail ? (
          <DetailContent
            detail={displayedDetail}
            preview={!detail}
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
            attentionItem={displayedAttention}
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
            sourceConversation={appUser?.id && activeConversationId && sourceConversation?.id !== activeConversationId ? null : sourceConversation}
            sourceSummary={displayedSourceSummary}
            sourceConversationLoading={sourceConversationLoading || Boolean(detail && appUser?.id && activeConversationId && sourceConversation?.id !== activeConversationId)}
            sourceConversationError={sourceConversationError}
            sourceUserId={appUser?.id}
            getAttentionMutation={getAttentionMutation}
            onAttentionAction={(action, value) => displayedAttention && void performAttentionAction(action, displayedAttention, value)}
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
  return (
    <label className="fixture-switch">
      <span>表示状態</span>
      <select value={fixtureId} onChange={(event) => onChange(event.target.value as ShellFixture['id'])}>
        {shellFixtures.map((fixture) => <option key={fixture.id} value={fixture.id}>{fixture.label}</option>)}
      </select>
    </label>
  );
}

function SurfaceContent({surface, fixture, attention, attentionLoading, attentionError, appUser, onSignOut, signingOut, sessionActionError, onRefreshData, search, onSearch, searchAccountId, onSearchAccount, sourceModel, sourceLoading, sourceError, onRetrySource, sourceSearchModel, sourceSearchLoading, sourceSearchError, onOpenSearch, openMoment, openManaged, openReview, openDelegation, openConversation, onLoadMoreSource, onLoadMoreSourceSearch}: {
  surface: Surface;
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
  onOpenSearch: () => void;
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
  const title = navigation.find((item) => item.id === surface)?.label ?? 'ホーム';
  const integrity = attention ? attention.integrity.status === 'degraded' : fixture.integrity === 'degraded';
  const partial = attention ? attention.source.readiness === 'partial' : fixture.sourceReadiness === 'partial';
  const loading = attention ? attention.source.readiness === 'loading' : fixture.sourceReadiness === 'loading';
  const liveCoverageMessage = attention?.integrity.message ?? '会話の確認範囲がまだ十分ではありません。対応なしとは表示しません。';
  const attentionSurface = surface === 'home' || surface === 'needs' || surface === 'managed' || surface === 'review';
  if (appUser?.id && attentionSurface && !attention && attentionLoading) return <LoadingState />;
  if (appUser?.id && attentionSurface && !attention && attentionError) return <AttentionUnavailable />;
  return (
    <>
      <div className="surface-header">
        <div><p className="eyebrow">LUNOWA</p><h1 id="surface-heading">{title}</h1></div>
      </div>
      {!attention && integrity && <IntegrityBanner />}
      {!attention && partial && <p className="coverage-notice" role="status">一部の会話のみを表示しています。最新の確認範囲: 10:15。</p>}
      {attention && surface !== 'home' && attention.integrity.status !== 'healthy' && <p className="coverage-notice" role="status">{liveCoverageMessage}</p>}
      {loading && <LoadingState />}
      {!loading && surface === 'home' && <Home fixture={fixture} attention={attention} appUser={appUser} sourceModel={sourceModel} onOpenSearch={onOpenSearch} openMoment={openMoment} openReview={openReview} openManaged={openManaged} openDelegation={openDelegation} />}
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

function Home({fixture, attention, appUser, sourceModel, onOpenSearch, openMoment, openReview, openManaged, openDelegation}: {
  fixture: ShellFixture;
  attention: AttentionReadModel | null;
  appUser?: AppUserSummary;
  sourceModel: SourcePageReadModel | null;
  onOpenSearch: () => void;
  openMoment: (origin?: string) => void;
  openReview: (origin?: string) => void;
  openManaged: (origin?: string) => void;
  openDelegation: (origin?: string) => void;
}) {
  const needsCount = attention?.needsYou.length ?? (fixture.hasNeedsYou ? 1 : 0);
  const reviewCount = attention?.review.length ?? (fixture.hasReview ? 1 : 0);
  const managedCount = attention?.managedCount ?? (fixture.monitoringPosture === 'active' && fixture.integrity === 'healthy' ? 4 : 0);
  const doneCount = attention?.done.length ?? 0;
  const firstName = appUser?.name?.trim().split(/\s+/)[0];
  const dateLabel = new Intl.DateTimeFormat('ja-JP', {month: 'numeric', day: 'numeric', weekday: 'short'}).format(new Date());
  const sourceByConversation = new Map((sourceModel?.conversations ?? []).map((item) => [item.id, item]));
  const header = <>
    <button className="home-search-trigger" type="button" onClick={onOpenSearch} aria-label="メールを検索">
      <LunowaIcon name="search" size={18} /><span>メール・人・件名・キーワードで検索</span><span className="search-filter-glyph" aria-hidden="true">⌘</span>
    </button>
    <div className="home-greeting"><div><h2>{firstName ? `おはようございます、${firstName}さん` : 'おはようございます'}</h2><p>今日も大切なやり取りを、Lunowaが見守っています。</p></div><time>{dateLabel}</time></div>
    <HomeSummary needsCount={needsCount} managedCount={managedCount} reviewCount={reviewCount} doneCount={doneCount} />
  </>;

  if (attention) {
    const candidates = attention.delegationCandidates ?? [];
    if (attention.strictZero) return <div className="home-content">{header}<section className="true-zero"><p className="eyebrow">現在の状態</p><h2>今、あなたが対応する必要はありません。</h2><p>{attention.managedCount > 0 ? `会話の確認範囲は信頼でき、Lunowaが${attention.managedCount}件を見守っています。` : '現在、Lunowaが監視している件はありません。'}</p>{attention.managedCount > 0 && <button className="quiet-button" type="button" onClick={() => openManaged(attention.managed[0] ? `managed-${attention.managed[0].id}` : undefined)}>管理中を見る</button>}</section>{candidates.length > 0 && <DelegationCandidates items={candidates} openDelegation={openDelegation} />}</div>;

    const managedItems = [...attention.managed, ...attention.later];
    return <div className="home-content">{header}
      {attention.integrity.status !== 'healthy' && <p className="coverage-notice" role="status">{attention.integrity.message}</p>}
      <section className="home-section home-attention-section" aria-labelledby="attention-heading">
        <div className="home-section-heading"><div><span className="section-icon section-icon-alert"><LunowaIcon name="alert" size={18} /></span><div><h2 id="attention-heading">今、あなたに必要なこと</h2><p>期限が近いものや、あなたの判断・返信が必要な項目です。</p></div></div>{needsCount + reviewCount > 0 && <span>{needsCount + reviewCount}件</span>}</div>
        <div className="home-work-list">
          {attention.needsYou.map((item, index) => <HomeWorkRow key={item.id} item={item} source={sourceByConversation.get(item.conversationId)} kind="needs" selected={index === 0} onClick={() => openMoment(`attention-${item.id}`)} />)}
          {attention.review.map((item) => <HomeWorkRow key={item.id} item={item} source={sourceByConversation.get(item.conversationId)} kind="review" selected={false} onClick={() => openReview(`review-${item.id}`)} />)}
        </div>
      </section>
      <section className="home-section home-managed-section" aria-labelledby="home-managed-heading">
        <div className="home-section-heading"><div><span className="section-icon"><LunowaIcon name="briefcase" size={18} /></span><div><h2 id="home-managed-heading">Lunowaが見ています</h2><p>対応のタイミングを見て、必要なときにお知らせします。</p></div></div>{managedItems.length > 0 && <span>{attention.managedCount}件</span>}</div>
        {attention.integrity.status === 'healthy' && managedItems.length > 0
          ? <div className="home-managed-list">{managedItems.slice(0, 5).map((item) => <HomeManagedRow key={item.id} item={item} source={sourceByConversation.get(item.conversationId)} onClick={() => openManaged(`managed-${item.id}`)} />)}</div>
          : attention.integrity.status === 'healthy'
            ? <p className="home-inline-empty">現在、Lunowaが監視している件はありません。</p>
            : <p className="coverage-notice">監視の状態を確認するまで、管理中の安心表示は保留しています。</p>}
      </section>
      {candidates.length > 0 && <DelegationCandidates items={candidates} openDelegation={openDelegation} />}
    </div>;
  }

  if (!fixture.hasNeedsYou && !fixture.hasReview && fixture.integrity === 'healthy' && fixture.sourceReadiness === 'ready' && fixture.monitoringPosture === 'active') return <div className="home-content">{header}<section className="true-zero"><p className="eyebrow">現在の状態</p><h2>今、あなたが対応する必要はありません。</h2><p>会話の確認範囲は信頼でき、Lunowaが{managedCount}件を見守っています。</p><button className="quiet-button" type="button" onClick={() => openManaged()}>管理中を見る</button></section></div>;
  if (fixture.monitoringPosture !== 'active') return <div className="home-content">{header}<section className="managed-summary"><p className="eyebrow">監視の設定</p><h2>{fixture.monitoringPosture === 'stopped_by_user' ? '監視はあなたが停止しました' : '現在、任せている監視はありません'}</h2><p>{fixture.monitoringPosture === 'stopped_by_user' ? '停止は、会話が完了したことや対応不要を意味しません。' : '会話を確認しても、監視の約束はまだ作成されません。'}</p><button className="quiet-button" type="button" onClick={() => openManaged()}>監視の状態を見る</button></section></div>;
  return <div className="home-content">{header}<section className="home-section"><div className="home-section-heading"><div><span className="section-icon section-icon-alert"><LunowaIcon name="alert" size={18} /></span><div><h2>今、あなたに必要なこと</h2><p>期限が近いものや、あなたの判断・返信が必要な項目です。</p></div></div></div>{fixture.hasNeedsYou && <AttentionButton onClick={() => openMoment()} />}{fixture.hasReview && <button id="review-condition" className="list-row review-row" type="button" onClick={() => openReview()}><span className="state-chip review">確認</span><strong>契約更新の条件を確認してください</strong><span>佐藤ひろ子との会話に、異なる更新日があります。</span></button>}</section>{fixture.integrity === 'healthy' && fixture.monitoringPosture === 'active' ? <section className="home-section"><div className="home-section-heading"><div><span className="section-icon"><LunowaIcon name="briefcase" size={18} /></span><div><h2>Lunowaが見ています</h2><p>対応のタイミングを見て、必要なときにお知らせします。</p></div></div></div><button id="managed-estimate" className="home-managed-row" type="button" onClick={() => openManaged()}><span className="row-avatar"><LunowaIcon name="briefcase" size={16} /></span><span className="row-copy"><strong>来期の見積書</strong><span>佐藤ひろ子からの確認を待っています</span></span><span className="row-status waiting">待ち</span><LunowaIcon name="chevron" size={14} /></button></section> : <p className="coverage-notice">監視の状態を確認するまで、管理中の安心表示は保留しています。</p>}</div>;
}

function HomeSummary({needsCount, managedCount, reviewCount, doneCount}: {needsCount: number; managedCount: number; reviewCount: number; doneCount: number}) {
  const cards = [
    {label: '対応が必要', count: needsCount, kind: 'needs', icon: 'alert'},
    {label: '管理中', count: managedCount, kind: 'managed', icon: 'briefcase'},
    {label: '確認', count: reviewCount, kind: 'review', icon: 'check'},
    {label: '完了', count: doneCount, kind: 'done', icon: 'check'}
  ];
  return <section className="home-summary" aria-label="現在の状態の概要">{cards.map((card) => <div className={`home-summary-card ${card.kind}`} key={card.kind}><span className="summary-label"><LunowaIcon name={card.icon} size={16} />{card.label}</span><span className="summary-value"><strong>{card.count}</strong><LunowaIcon name="chevron" size={14} /></span></div>)}</section>;
}

function HomeWorkRow({item, source, kind, selected, onClick}: {item: AttentionItemReadModel; source?: SourcePageReadModel['conversations'][number]; kind: 'needs' | 'review'; selected: boolean; onClick: () => void}) {
  const sender = source?.latestSender?.displayName || source?.latestSender?.email || (kind === 'review' ? '確認が必要な会話' : '対応が必要な会話');
  const subject = source?.subject || item.operationalOutcome;
  const badge = kind === 'review' ? '確認が必要' : item.overdue ? '期限超過' : item.nearestRelevantTime ? '期限あり' : '対応';
  return <button id={`${kind === 'review' ? 'review' : 'attention'}-${item.id}`} className={selected ? 'home-work-row selected' : 'home-work-row'} type="button" onClick={onClick}>
    <span className="row-avatar"><LunowaIcon name="user" size={17} /></span>
    <span className="row-copy"><span className="row-sender">{sender}</span><strong>{kind === 'review' ? item.reviewQuestion ?? item.operationalOutcome : item.primaryAction ?? item.operationalOutcome}</strong><span>{subject}</span></span>
    <span className="row-side"><span className={`row-status ${kind}`}>{badge}</span>{item.nearestRelevantTime && <time>{new Date(item.nearestRelevantTime).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})}</time>}</span>
    <LunowaIcon name="chevron" size={14} />
  </button>;
}

function HomeManagedRow({item, source, onClick}: {item: AttentionItemReadModel; source?: SourcePageReadModel['conversations'][number]; onClick: () => void}) {
  const sender = source?.latestSender?.displayName || source?.latestSender?.email || source?.subject || '監視中の会話';
  const detail = item.awaitedEvent ?? item.returnCondition ?? item.operationalOutcome;
  const isLater = item.surface === 'LATER';
  return <button id={`home-managed-${item.id}`} className="home-managed-row" type="button" onClick={onClick}><span className="row-avatar"><LunowaIcon name={source?.latestSender ? 'user' : 'briefcase'} size={16} /></span><span className="row-copy"><span className="row-sender">{sender}</span><strong>{item.operationalOutcome}</strong><span>{detail}</span></span><span className={`row-status ${isLater ? 'later' : 'waiting'}`}>{isLater ? 'あとで' : '待ち'}</span><LunowaIcon name="chevron" size={14} /></button>;
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

function DelegationCandidates({items, openDelegation}: {items: AttentionItemReadModel[]; openDelegation: (origin?: string) => void}) {
  return <section className="managed-summary" aria-labelledby="delegation-candidates-heading"><p className="eyebrow">任せる候補</p><h2 id="delegation-candidates-heading">現在のループを選んで任せる</h2><p>過去の会話を自動で監視対象にはしません。確認したい1件を選んでください。</p>{items.map((item) => <button id={`delegation-${item.id}`} key={item.id} className="list-row" type="button" onClick={() => openDelegation(`delegation-${item.id}`)}><span className="state-chip waiting">候補</span><strong>{item.operationalOutcome}</strong><span>{item.awaitedEvent ?? '相手の応答または次の条件'}</span><span className="metadata">戻す条件: {item.returnCondition ?? '条件を確認して決めます'}</span></button>)}</section>;
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

function DetailContent({detail, preview, headingRef, draft, onDraft, commonMutations, sendState, fixture, attentionItem, replyContext, replyContextError, replyMode, onReplyMode, draftSaveState, draftRecipients, onRecipients, sourceConversation, sourceSummary, sourceConversationLoading, sourceConversationError, sourceUserId, getAttentionMutation, onAttentionAction, onBack, onCommonMutation, onSend, onOpenSource}: {
  detail: Detail;
  preview: boolean;
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
  sourceSummary: SourceConversationSummary | null;
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
  const title = detail === 'conversation'
    ? sourceUserId ? sourceConversation?.subject ?? 'Sourceの会話' : sourceItem.subject
    : detail === 'review-detail' ? attentionItem?.reviewQuestion ?? '契約更新の条件を確認してください' : detail === 'delegation' ? attentionItem?.operationalOutcome ?? '任せる候補を確認してください' : detail === 'managed-detail' ? attentionItem?.operationalOutcome ?? '来期の見積書を見守っています' : attentionItem?.operationalOutcome ?? attentionItemStatic.action;
  return <div className={preview ? 'detail-content detail-preview' : 'detail-content'}>{!preview && <button className="back-button" type="button" onClick={onBack}>‹ 一覧に戻る</button>}{detail !== 'moment' && <h2 ref={headingRef} tabIndex={-1}>{title}</h2>}
    {detail === 'moment' && <MomentBody item={attentionItem} onSource={onOpenSource} sourceConversation={sourceConversation} sourceSummary={sourceSummary} sourceConversationLoading={sourceConversationLoading} sourceConversationError={sourceConversationError} sourceUserId={sourceUserId} draft={draft} onDraft={onDraft} sendState={sendState} fixture={fixture} onSend={onSend} replyContext={replyContext} replyContextError={replyContextError} replyMode={replyMode} onReplyMode={onReplyMode} draftSaveState={draftSaveState} draftRecipients={draftRecipients} onRecipients={onRecipients} liveContextRequired={Boolean(sourceUserId)} />}
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

function MomentBody({item, onSource, sourceConversation, sourceSummary, sourceConversationLoading, sourceConversationError, sourceUserId, ...composer}: {
  item: AttentionItemReadModel | null;
  onSource: (conversationId?: string) => void;
  sourceConversation: SourceConversationReadModel | null;
  sourceSummary: SourceConversationSummary | null;
  sourceConversationLoading: boolean;
  sourceConversationError: string;
  sourceUserId?: string;
} & ComposerProps) {
  const outcome = item?.operationalOutcome ?? attentionItemStatic.action;
  const messages = sourceConversation?.messages ?? [];
  const latestMessage = messages.at(-1);
  const latestInbound = [...messages].reverse().find((message) => message.direction === 'INBOUND');
  const person = latestInbound?.sender.displayName || latestInbound?.sender.email || sourceSummary?.latestSender?.displayName || sourceSummary?.latestSender?.email || attentionItemStatic.person;
  const recentSourceTime = latestMessage?.occurredAt ?? sourceSummary?.lastMessageAt ?? null;
  const recentAt = recentSourceTime ? new Date(recentSourceTime).toLocaleString('ja-JP', {month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'}) : null;
  const subject = sourceConversation?.subject ?? sourceSummary?.subject ?? sourceItem.subject;
  const explanation = item?.nearestRelevantTime
    ? `${new Date(item.nearestRelevantTime).toLocaleString('ja-JP')}までに、${outcome}。`
    : item ? `${outcome}。` : attentionItemStatic.whyNow;

  return <>
    <header className="moment-person-header">
      <span className="moment-person-avatar"><LunowaIcon name="user" size={21} /></span>
      <span className="moment-person-copy"><strong>{person}</strong><span>{subject}</span>{recentAt && <small>直近のやり取り · {recentAt}</small>}</span>
      <button className="moment-source-button" type="button" onClick={() => onSource(item?.conversationId)}><LunowaIcon name="message" size={14} /> 元の会話</button>
    </header>
    <section className="moment-card" aria-labelledby="moment-action-heading">
      <div className="moment-card-label"><span aria-hidden="true">✦</span> 今すること</div>
      <div className="moment-card-main"><div><h3 id="moment-action-heading">{outcome}</h3><p>{explanation}</p></div><button className="primary-button moment-primary" type="button" onClick={() => document.getElementById('reply-body')?.focus()}>↩ 返信を書く</button></div>
      <div className="moment-reason-grid"><div><span>現在のゴール</span><strong>{outcome}</strong></div>{item?.returnCondition && <div><span>戻す条件</span><strong>{item.returnCondition}</strong></div>}</div>
    </section>
    <section className="moment-thread" aria-labelledby="moment-thread-heading">
      <header><div><LunowaIcon name="message" size={17} /><h3 id="moment-thread-heading">メールのやり取り</h3>{messages.length > 0 && <span className="thread-count">{messages.length}</span>}</div>{recentAt && <small>{recentAt}</small>}</header>
      {sourceUserId && sourceConversation
        ? <SourceConversationDetail conversation={sourceConversation} userId={sourceUserId} loading={sourceConversationLoading} error={sourceConversationError} />
        : sourceUserId && sourceSummary
          ? <div className="source-conversation-body"><article className="source-message"><header><strong>{sourceSummary.latestSender?.displayName || sourceSummary.latestSender?.email || '会話'}</strong>{sourceSummary.lastMessageAt && <time>{new Date(sourceSummary.lastMessageAt).toLocaleString('ja-JP', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</time>}</header><p className="source-text">{sourceSummary.preview}</p><p className="metadata">原文を開くと、この会話の全メッセージと添付を確認できます。</p></article></div>
          : sourceUserId
            ? <p className="source-detail-state">会話の原文は「元の会話」から確認できます。</p>
            : <div className="source-conversation-body"><article className="source-message"><header><strong>{attentionItemStatic.person}</strong><time>10:24</time></header><p className="source-text">添付の見積書をご確認いただけますか。明日の打ち合わせで確認できれば助かります。</p></article></div>}
    </section>
    <Composer {...composer} />
  </>;
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
  if (liveContextRequired && !replyContext) {
    return <section className="composer" aria-labelledby="composer-heading"><h3 id="composer-heading">返信</h3>{replyContextError ? <p className="inline-status" role="alert">返信の宛先を確認できないため、送信できません。</p> : <p className="inline-status" role="status">返信の送信元と宛先を確認しています。</p>}</section>;
  }
  const unavailable = !liveContextRequired && fixture.sourceRead === 'temporarily_unavailable';
  const awaitingResult = sendState === 'request_pending' || sendState === 'provider_ambiguous' || sendState === 'provider_confirmed_reconciling' || sendState === 'provider_reconciled';
  const toRecipients = draftRecipients?.to ?? replyContext?.recipients ?? [];
  const ccRecipients = draftRecipients?.cc ?? replyContext?.cc ?? [];
  const toLabel = toRecipients.map(({displayName, email}) => displayName ? `${displayName} <${email}>` : email).join(', ') || '佐藤ひろ子';
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
  return <section className="composer" aria-labelledby="composer-heading"><h3 id="composer-heading">返信</h3>{replyContext && <label htmlFor="reply-mode">種類<select id="reply-mode" value={replyMode} disabled={awaitingResult} onChange={(event) => onReplyMode(event.target.value as ReplyMode)}><option value="REPLY">返信</option><option value="REPLY_ALL">全員に返信</option></select></label>}{replyContext ? <><label htmlFor="reply-to">宛先<input id="reply-to" value={toValue} disabled={awaitingResult} onChange={(event) => onRecipients({to: parseRecipients(event.target.value), cc: ccRecipients})} /></label><label htmlFor="reply-cc">Cc<input id="reply-cc" value={ccValue} disabled={awaitingResult} onChange={(event) => onRecipients({to: toRecipients, cc: parseRecipients(event.target.value)})} /></label><p className="metadata">宛先の表示名: {toLabel} · From: {fromLabel}</p></> : <p className="metadata">宛先: {toLabel} · From: {fromLabel}</p>}{replyContextError && <p className="inline-status" role="alert">返信の宛先を確認できないため、送信できません。</p>}{sendPermissionMissing && <p className="inline-status" role="status">Gmailの送信権限がありません。設定でメールボックスを再接続して送信権限を許可してください。読み取りと監視は継続できます。</p>}<label htmlFor="reply-body">本文<textarea id="reply-body" value={draft} disabled={awaitingResult} onChange={(event) => onDraft(event.target.value)} placeholder="返信を入力" rows={4} /></label>{unavailable && <p className="inline-status" role="status">現在オフラインです。下書きは保存されていますが、送信されていません。</p>}{replyContext && draftSaveState === 'saving' && <p className="inline-status" role="status">下書きを保存しています。</p>}{replyContext && draftSaveState === 'conflict' && <p className="inline-status" role="alert">別の編集が保存されたため、下書きを上書きしていません。</p>}{feedback && <p className="inline-status" role="status">{feedback}</p>}<button className="primary-button" disabled={sendDisabled} type="button" onClick={onSend}>{sendState === 'request_pending' ? '送信をリクエストしています' : sendState === 'provider_ambiguous' ? '送信結果を確認しています' : sendState === 'provider_confirmed_reconciling' ? '状態を更新しています' : sendState === 'provider_reconciled' ? '送信済み' : sendState === 'provider_failed' ? '再試行する' : '送信する'}</button><p className="metadata">Enterだけでは送信されません。</p></section>;
}

function IntegrityBanner() {
  return <aside className="integrity-banner" aria-labelledby="integrity-title"><strong id="integrity-title">一部の監視を確認できていません</strong><span>会話の更新を再確認するまで、管理中の安心表示には含めません。</span><button type="button">再接続を確認</button></aside>;
}

function LoadingState() { return <div className="loading-state" role="status"><span aria-hidden="true" />会話の状態を確認しています。完了するまで、対応なしとは表示しません。</div>; }
function AttentionUnavailable() { return <div className="surface-content"><section className="managed-summary"><p className="eyebrow">監視の状態</p><h2>監視の状態を確認できません</h2><p>最新の対応・確認・管理中の状態を取得できないため、対応なしとは表示していません。Sourceは引き続き確認できます。</p><button className="quiet-button" type="button" onClick={() => window.location.reload()}>再確認する</button></section></div>; }
function EmptyDetail() { return <div className="empty-detail"><p className="eyebrow">詳細</p><h2>項目を選択してください</h2><p>対応、管理中、確認、または会話を選ぶと、ここに必要な文脈を表示します。</p></div>; }
