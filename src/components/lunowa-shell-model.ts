// G11 presentation/read-model fixture contract. This module owns no provider or domain authority.

export type AppSession =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'session_expired'
  | 'auth_error'
  | 'signing_out';
export type SourceReadiness = 'loading' | 'partial' | 'ready' | 'unavailable';
export type MonitoringIntegrity = 'unknown' | 'healthy' | 'degraded';
export type MonitoringPosture = 'not_delegated' | 'active' | 'stopped_by_user';
export type CapabilityAvailability =
  | 'available'
  | 'partially_available'
  | 'permission_missing'
  | 'temporarily_unavailable'
  | 'unsupported';
export type MutationState = 'idle' | 'pending' | 'confirmed' | 'failed';
export type CommonMutationTarget = 'stop-tracking' | 'review-answer' | null;
export type SendLifecycle = 'draft' | 'request_pending' | 'provider_failed' | 'provider_ambiguous' | 'provider_confirmed_reconciling';

export type ShellFixture = {
  id: 'normal' | 'zero' | 'not-delegated' | 'stopped' | 'loading' | 'partial' | 'degraded' | 'mutation-pending' | 'mutation-confirmed' | 'mutation-failed' | 'send-pending' | 'send-failed' | 'send-ambiguous' | 'send-reconciling' | 'session-expired';
  label: string;
  session: AppSession;
  sourceReadiness: SourceReadiness;
  integrity: MonitoringIntegrity;
  monitoringPosture: MonitoringPosture;
  sourceRead: CapabilityAvailability;
  mutation: MutationState;
  mutationTarget: CommonMutationTarget;
  send: SendLifecycle;
  hasNeedsYou: boolean;
  hasReview: boolean;
};

export const shellFixtures: readonly ShellFixture[] = [
  {
    id: 'normal',
    label: '通常',
    session: 'authenticated',
    sourceReadiness: 'ready',
    integrity: 'healthy',
    monitoringPosture: 'active',
    sourceRead: 'available',
    mutation: 'idle',
    mutationTarget: null,
    send: 'draft',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'zero',
    label: '対応なし（信頼できる範囲）',
    session: 'authenticated',
    sourceReadiness: 'ready',
    integrity: 'healthy',
    monitoringPosture: 'active',
    sourceRead: 'available',
    mutation: 'idle',
    mutationTarget: null,
    send: 'draft',
    hasNeedsYou: false,
    hasReview: false
  },
  {
    id: 'not-delegated', label: '任せていない', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'not_delegated', sourceRead: 'available', mutation: 'idle', mutationTarget: null, send: 'draft', hasNeedsYou: false, hasReview: false
  },
  {
    id: 'stopped', label: '監視を停止した', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'stopped_by_user', sourceRead: 'available', mutation: 'idle', mutationTarget: null, send: 'draft', hasNeedsYou: false, hasReview: false
  },
  {
    id: 'loading',
    label: '読み込み中',
    session: 'authenticated',
    sourceReadiness: 'loading',
    integrity: 'unknown',
    monitoringPosture: 'active',
    sourceRead: 'available',
    mutation: 'idle',
    mutationTarget: null,
    send: 'draft',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'partial',
    label: '一部のみ',
    session: 'authenticated',
    sourceReadiness: 'partial',
    integrity: 'healthy',
    monitoringPosture: 'active',
    sourceRead: 'partially_available',
    mutation: 'idle',
    mutationTarget: null,
    send: 'draft',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'degraded',
    label: '監視の問題',
    session: 'authenticated',
    sourceReadiness: 'ready',
    integrity: 'degraded',
    monitoringPosture: 'active',
    sourceRead: 'temporarily_unavailable',
    mutation: 'idle',
    mutationTarget: null,
    send: 'draft',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'mutation-pending', label: '停止を処理中', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'active', sourceRead: 'available', mutation: 'pending', mutationTarget: 'stop-tracking', send: 'draft', hasNeedsYou: true, hasReview: true
  },
  {
    id: 'mutation-confirmed', label: '確認の保存を確認', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'active', sourceRead: 'available', mutation: 'confirmed', mutationTarget: 'review-answer', send: 'draft', hasNeedsYou: true, hasReview: true
  },
  {
    id: 'mutation-failed', label: '確認の保存に失敗', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'active', sourceRead: 'available', mutation: 'failed', mutationTarget: 'review-answer', send: 'draft', hasNeedsYou: true, hasReview: true
  },
  {
    id: 'send-pending', label: '送信を要求中', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'active', sourceRead: 'available', mutation: 'idle', mutationTarget: null, send: 'request_pending', hasNeedsYou: true, hasReview: true
  },
  {
    id: 'send-failed', label: '送信に失敗', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'active', sourceRead: 'available', mutation: 'idle', mutationTarget: null, send: 'provider_failed', hasNeedsYou: true, hasReview: true
  },
  {
    id: 'send-ambiguous', label: '送信結果を確認中', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'active', sourceRead: 'available', mutation: 'idle', mutationTarget: null, send: 'provider_ambiguous', hasNeedsYou: true, hasReview: true
  },
  {
    id: 'send-reconciling', label: '送信後の状態を更新中', session: 'authenticated', sourceReadiness: 'ready', integrity: 'healthy', monitoringPosture: 'active', sourceRead: 'available', mutation: 'idle', mutationTarget: null, send: 'provider_confirmed_reconciling', hasNeedsYou: true, hasReview: true
  },
  {
    id: 'session-expired',
    label: 'セッション期限切れ',
    session: 'session_expired',
    sourceReadiness: 'ready',
    integrity: 'healthy',
    monitoringPosture: 'active',
    sourceRead: 'available',
    mutation: 'idle',
    mutationTarget: null,
    send: 'draft',
    hasNeedsYou: true,
    hasReview: true
  }
];
