'use client';

import {useState} from 'react';

import {sanitizeSourceHtml} from '@/lib/source-html';

import type {
  SourceAttachmentReadModel,
  SourceConversationReadModel,
  SourceConversationSummary,
  SourcePageReadModel,
  SourceReadiness
} from './source-types';

function accountLabel(account: SourcePageReadModel['accounts'][number]): string {
  return `${account.provider} · ${account.emailAddress}`;
}

function readinessNotice(readiness: SourceReadiness, dataThroughAt: string | null): React.ReactNode {
  if (readiness === 'partial' || readiness === 'loading') {
    return <p className="coverage-notice" role="status">会話を同期しています。現在の確認範囲のみを表示しています{dataThroughAt ? `（${new Date(dataThroughAt).toLocaleString('ja-JP')}まで）` : ''}。空の結果を全件なしとは扱いません。</p>;
  }
  if (readiness === 'degraded') {
    return <aside className="integrity-banner" aria-label="Sourceの確認範囲"><strong>Sourceの確認範囲に問題があります</strong><span>同期またはメールボックスの再認証が必要です。保存済みの原文は確認できますが、検索結果は全件を表さない可能性があります。{dataThroughAt ? `データ確認時点: ${new Date(dataThroughAt).toLocaleString('ja-JP')}。` : 'データ確認時点は不明です。'}</span></aside>;
  }
  if (readiness === 'unavailable') {
    return <p className="empty-state">メールボックスが接続されていません。Sourceを表示するには、対応するメールボックスを接続してください。</p>;
  }
  return null;
}

function accountReadiness(account: SourcePageReadModel['accounts'][number]): SourceReadiness {
  if (account.monitoring?.status === 'disconnected' || account.sync.errorCode === 'INTENTIONAL_DISCONNECT') return 'partial';
  if (account.monitoring?.status === 'degraded') return 'degraded';
  if (
    account.connectionState === 'ERROR' ||
    account.connectionState === 'RECONNECT_REQUIRED' ||
    account.sync.status === 'ERROR' ||
    account.sync.status === 'RECONCILIATION_REQUIRED'
  ) return 'degraded';
  if (
    account.connectionState !== 'CONNECTED' ||
    !account.sync.lastSuccessAt ||
    account.sync.status === 'PENDING' ||
    account.sync.status === 'SYNCING' ||
    account.sync.status === 'UNKNOWN'
  ) return 'partial';
  return 'ready';
}

function accountCoverageNotice(account: SourcePageReadModel['accounts'][number]): React.ReactNode {
  const coverage = accountReadiness(account);
  return <>
    {readinessNotice(coverage, account.sync.dataThroughAt)}
    {coverage !== 'ready' && <p className="metadata">同期状態: {account.sync.status} · データ確認時点: {account.sync.dataThroughAt ? new Date(account.sync.dataThroughAt).toLocaleString('ja-JP') : '不明'}</p>}
  </>;
}

function continuation(model: SourcePageReadModel, loading: boolean, onLoadMore: () => void): React.ReactNode {
  if (!model.nextCursor) return null;
  return <div className="source-pagination">
    <p className="metadata">{model.conversations.length}件を表示中（全{model.total}件）</p>
    <button className="quiet-button" type="button" onClick={onLoadMore} disabled={loading}>
      {loading ? '次の会話を読み込んでいます' : '次の会話を読み込む'}
    </button>
  </div>;
}

function sourceRow(
  item: SourceConversationSummary,
  onOpenConversation: (conversationId: string) => void,
  onOpenMoment?: (conversationId: string) => void
) {
  const sender = item.latestSender?.displayName || item.latestSender?.email || '送信者不明';
  return <article className="source-row" key={item.id}>
    <button id={item.id} className="source-main" type="button" onClick={() => onOpenConversation(item.id)}>
      <strong>{sender}</strong>
      <span>{item.subject}</span>
      <span>{item.preview || '本文はありません'}</span>
      <span className="metadata">{accountLabel(item.account)}{item.hasAttachments ? ' · 添付あり' : ''}</span>
    </button>
    {onOpenMoment && <button className="status-affordance" type="button" onClick={() => onOpenMoment(item.id)} aria-label="この会話の対応状況を見る">対応</button>}
    <time dateTime={item.lastMessageAt ?? undefined}>{item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleString('ja-JP') : '日時不明'}</time>
  </article>;
}

export function RealSourceList({model, loading, error, onRetry, onOpenConversation, onLoadMore}: {
  model: SourcePageReadModel | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onOpenConversation: (conversationId: string) => void;
  onLoadMore: () => void;
}) {
  if (loading && !model) return <div className="surface-content"><div className="loading-state" role="status">Sourceの会話を確認しています。</div></div>;
  if (error && !model) return <div className="surface-content"><div className="empty-state" role="alert">Sourceを確認できませんでした。接続状態を確認してから、もう一度お試しください。<br /><button className="quiet-button" type="button" onClick={onRetry}>Sourceを再確認</button></div></div>;
  if (!model) return null;
  return <div className="surface-content">
    <p className="surface-intro">元の会話をそのまま確認できます。Sourceは対応や判断とは別の原文です。</p>
    {readinessNotice(model.readiness, model.dataThroughAt)}
    {error && <p className="inline-status" role="alert">追加の会話を読み込めませんでした。表示済みのSourceは保持しています。再試行できます。</p>}
    {model.accounts.length > 0 && <p className="metadata">確認対象: {model.accounts.map(accountLabel).join('、')}</p>}
    {model.conversations.length > 0
      ? model.conversations.map((item) => sourceRow(item, onOpenConversation))
      : model.readiness === 'ready'
        ? <p className="empty-state">認可された会話はありません。</p>
        : <p className="empty-state">現在の確認範囲に表示できる会話はありません。同期が完了するまで、全件なしとは扱いません。</p>}
    {continuation(model, loading, onLoadMore)}
  </div>;
}

export function FixtureSourceList({openConversation, openMoment}: {openConversation: (origin: string) => void; openMoment: (origin?: string) => void}) {
  return <div className="surface-content"><p className="surface-intro">元の会話をそのまま確認できます。</p><article className="source-row"><button id="source-estimate" className="source-main" type="button" onClick={(event) => openConversation(event.currentTarget.id)}><strong>佐藤ひろ子</strong><span>来期の見積書について</span><span>添付の見積書をご確認いただけますか。</span></button><button className="status-affordance" type="button" onClick={() => openMoment('source-estimate')} aria-label="この会話の対応状況を見る">対応</button><time>10:24</time></article></div>;
}

export function RealSourceSearch({model, loading, error, text, accountId, onText, onAccount, onOpenConversation, onLoadMore}: {
  model: SourcePageReadModel | null;
  loading: boolean;
  error: string;
  text: string;
  accountId: string;
  onText: (value: string) => void;
  onAccount: (value: string) => void;
  onOpenConversation: (conversationId: string) => void;
  onLoadMore: () => void;
}) {
  return <div className="surface-content">
    <div className="search-box">
      <label htmlFor="source-search">メールを検索</label>
      <input id="source-search" value={text} onChange={(event) => onText(event.target.value)} placeholder="送信者、件名、語句を入力" />
      <label htmlFor="source-search-account">アカウントの範囲</label>
      <select id="source-search-account" aria-label="検索するアカウント" value={accountId} onChange={(event) => onAccount(event.target.value)}>
        <option value="">すべての接続先</option>
        {model?.accounts.map((account) => <option key={account.id} value={account.id}>{accountLabel(account)}</option>)}
      </select>
    </div>
    {model && readinessNotice(model.readiness, model.dataThroughAt)}
    {error && text.trim() && <p className="empty-state" role="alert">検索を完了できませんでした。検索語とアカウント範囲を保持しています。</p>}
    {loading && <div className="loading-state" role="status">認可されたSourceを検索しています。</div>}
    {!loading && !error && !text.trim() && <p className="empty-state">検索語を入力すると、認可された会話の原文を検索します。</p>}
    {!loading && !error && text.trim() && model?.conversations.length === 0 && <p className="empty-state">「{text}」に一致する認可されたSourceはありません。検索語またはアカウント範囲を変更できます。</p>}
    {!loading && !error && model?.conversations.map((item) => sourceRow(item, onOpenConversation))}
    {model && text.trim() && model.query.text === text.normalize('NFC').trim() && model.query.accountId === (accountId || null) && continuation(model, loading, onLoadMore)}
  </div>;
}

function formatRecipients(message: SourceConversationReadModel['messages'][number]): string {
  const names = [...message.recipients, ...message.cc].map((item) => item.displayName || item.email);
  return names.length > 0 ? names.join('、') : '宛先情報なし';
}

function attachmentSize(sizeBytes: number | null): string {
  if (sizeBytes === null) return 'サイズ不明';
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  return `${Math.round(sizeBytes / 1024)} KB`;
}

function SourceAttachment({attachment, accountId, userId}: {attachment: SourceAttachmentReadModel; accountId: string; userId: string}) {
  const [state, setState] = useState<'idle' | 'downloading' | 'local-failure' | 'provider-blocked' | 'unavailable'>('idle');
  const localPreviewFailed = attachment.previewState === 'LOCAL_RENDER_FAILED';
  const providerBlocked = attachment.previewState === 'PROVIDER_BLOCKED' || attachment.previewState === 'SECURITY_BLOCKED';
  const canFetch = Boolean(attachment.providerAttachmentId) && !providerBlocked;
  const downloadPath = `/api/bff/users/${encodeURIComponent(userId)}/gmail/accounts/${encodeURIComponent(accountId)}/attachments/${encodeURIComponent(attachment.id)}`;

  const download = async () => {
    if (!canFetch) return;
    setState('downloading');
    let response: Response;
    try {
      response = await fetch(downloadPath, {credentials: 'same-origin'});
    } catch {
      setState('unavailable');
      return;
    }
    if (!response.ok) {
      let code = '';
      try { code = String((await response.json()).error ?? ''); } catch { /* provider may return no body */ }
      setState(code === 'PROVIDER_SECURITY_BLOCK' ? 'provider-blocked' : 'unavailable');
      return;
    }
    try {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      link.click();
      URL.revokeObjectURL(url);
      setState('idle');
    } catch {
      setState('local-failure');
    }
  };

  return <li className="attachment-item">
    <div><strong>{attachment.filename}</strong><span className="metadata">{attachment.mimeType} · {attachmentSize(attachment.sizeBytes)}</span></div>
    {localPreviewFailed && <span className="metadata">この画面でのプレビューに失敗しました。安全な取得経路を利用できます。</span>}
    {providerBlocked || state === 'provider-blocked'
      ? <span className="inline-status" role="status">プロバイダーの安全制限により、このファイルは取得できません。制限を回避しません。</span>
      : canFetch
        ? <button className="quiet-button" type="button" disabled={state === 'downloading'} onClick={() => void download()}>{state === 'downloading' ? '取得しています' : state === 'unavailable' ? '再取得する' : '安全にダウンロード'}</button>
        : <span className="metadata">現在、対応するプロバイダー取得経路はありません。</span>}
    {state === 'local-failure' && <span className="inline-status" role="status">この端末でダウンロードを開始できませんでした。原文と添付の存在情報は保持されています。</span>}
    {state === 'unavailable' && <span className="inline-status" role="status">プロバイダーから安全に取得できませんでした。再取得を試せますが、保護を回避する経路は使用しません。</span>}
  </li>;
}

export function SourceConversationDetail({conversation, userId, loading, error}: {conversation: SourceConversationReadModel | null; userId: string; loading: boolean; error: string}) {
  if (loading && !conversation) return <div className="source-detail-state" role="status">Sourceの会話を読み込んでいます。</div>;
  if (error && !conversation) return <div className="source-detail-state" role="alert">このSource会話を確認できませんでした。認可された会話か、接続状態を確認してください。</div>;
  if (!conversation) return null;
  return <div className="source-conversation-body">
    <p className="metadata">原文 · {conversation.account.provider} · {conversation.account.emailAddress} · evidence revision {conversation.evidenceRevision}</p>
    {accountCoverageNotice(conversation.account)}
    {conversation.messages.map((message) => <article className="source-message" key={message.id}>
      <header><strong>{message.sender.displayName || message.sender.email}</strong><span>{message.sender.email}</span><time dateTime={message.occurredAt}>{new Date(message.occurredAt).toLocaleString('ja-JP')}</time></header>
      <p className="metadata">{message.direction === 'INBOUND' ? '受信' : '送信'} · 宛先: {formatRecipients(message)} · provider message: {message.providerMessageId}</p>
      {message.providerDeletedAt && <p className="inline-status" role="status">プロバイダーでは現在確認できませんが、観測済みの原文は保持しています。</p>}
      {message.sanitizedHtmlBody
        ? <div className="source-html" dangerouslySetInnerHTML={{__html: sanitizeSourceHtml(message.sanitizedHtmlBody) ?? ''}} />
        : message.textBody
          ? <p className="source-text">{message.textBody}</p>
          : <p className="empty-state">本文は利用できません。</p>}
      {message.attachments.length > 0 && <section className="attachment-list" aria-label="添付ファイル"><h3>添付ファイル</h3><ul>{message.attachments.map((attachment) => <SourceAttachment key={attachment.id} attachment={attachment} accountId={conversation.account.id} userId={userId} />)}</ul></section>}
    </article>)}
  </div>;
}
