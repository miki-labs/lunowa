'use client';

import {useState} from 'react';
import {useLocale} from 'next-intl';
import {Download, FileText, Mail, Paperclip, UserRound} from 'lucide-react';

import {sanitizeSourceHtml} from '@/lib/source-html';

import type {
  SourceAccountReadModel,
  SourceAttachmentReadModel,
  SourceConversationReadModel,
  SourceConversationSummary,
  SourcePageReadModel,
  SourceReadiness
} from './source-types';

function accountLabel(account: SourcePageReadModel['accounts'][number]): string {
  return `${account.provider} · ${account.emailAddress}`;
}

function readinessNotice(readiness: SourceReadiness, dataThroughAt: string | null, en = false): React.ReactNode {
  if (readiness === 'partial' || readiness === 'loading') {
    return <p className="coverage-notice" role="status">{en ? `Conversations are syncing. Only verified coverage is shown${dataThroughAt ? ` (through ${new Date(dataThroughAt).toLocaleString('en-US')})` : ''}. An empty result is not treated as complete.` : `会話を同期しています。現在の確認範囲のみを表示しています${dataThroughAt ? `（${new Date(dataThroughAt).toLocaleString('ja-JP')}まで）` : ''}。空の結果を全件なしとは扱いません。`}</p>;
  }
  if (readiness === 'degraded') {
    return <aside className="integrity-banner" aria-label={en ? 'Source coverage' : 'Sourceの確認範囲'}><strong>{en ? 'Source coverage needs attention' : 'Sourceの確認範囲に問題があります'}</strong><span>{en ? `Sync or mailbox authorization needs attention. Saved originals remain available, but search may be incomplete. ${dataThroughAt ? `Data through ${new Date(dataThroughAt).toLocaleString('en-US')}.` : 'The coverage time is unknown.'}` : `同期またはメールボックスの再認証が必要です。保存済みの原文は確認できますが、検索結果は全件を表さない可能性があります。${dataThroughAt ? `データ確認時点: ${new Date(dataThroughAt).toLocaleString('ja-JP')}。` : 'データ確認時点は不明です。'}`}</span></aside>;
  }
  if (readiness === 'unavailable') {
    return <p className="coverage-notice" role="status">{en ? 'No mailbox is connected. Saved Source remains available, but new conversations will not sync. Connect the matching mailbox to resume.' : '現在接続中のメールボックスはありません。保存済みのSourceは引き続き確認できますが、新しい会話は同期されません。再開するには対応するメールボックスを接続してください。'}</p>;
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

function accountCoverageNotice(account: SourcePageReadModel['accounts'][number], en = false): React.ReactNode {
  const coverage = accountReadiness(account);
  if (account.monitoring?.status === 'disconnected' || account.sync.errorCode === 'INTENTIONAL_DISCONNECT') {
    return <>
      <p className="coverage-notice" role="status">{en ? 'This mailbox is disconnected. Saved Source remains available, but new conversations will not sync.' : 'このメール連携は解除済みです。保存済みのSourceは確認できますが、新しい会話は同期されません。'}</p>
      <p className="metadata">{en ? 'Data through' : 'データ確認時点'}: {account.sync.dataThroughAt ? new Date(account.sync.dataThroughAt).toLocaleString(en ? 'en-US' : 'ja-JP') : (en ? 'unknown' : '不明')}</p>
    </>;
  }
  return <>
    {readinessNotice(coverage, account.sync.dataThroughAt, en)}
    {coverage !== 'ready' && <p className="metadata">{en ? 'Sync status' : '同期状態'}: {account.sync.status} · {en ? 'Data through' : 'データ確認時点'}: {account.sync.dataThroughAt ? new Date(account.sync.dataThroughAt).toLocaleString(en ? 'en-US' : 'ja-JP') : (en ? 'unknown' : '不明')}</p>}
  </>;
}

function continuation(model: SourcePageReadModel, loading: boolean, onLoadMore: () => void, en = false): React.ReactNode {
  if (!model.nextCursor) return null;
  return <div className="source-pagination">
    <p className="metadata">{en ? `Showing ${model.conversations.length} of ${model.total}` : `${model.conversations.length}件を表示中（全${model.total}件）`}</p>
    <button className="quiet-button" type="button" onClick={onLoadMore} disabled={loading}>
      {loading ? (en ? 'Loading more conversations' : '次の会話を読み込んでいます') : (en ? 'Load more conversations' : '次の会話を読み込む')}
    </button>
  </div>;
}

function sourceRow(
  item: SourceConversationSummary,
  onOpenConversation: (conversationId: string, accountId: string) => void,
  onOpenMoment?: (conversationId: string) => void,
  en = false,
  selectedId = ''
) {
  const sender = item.latestSender?.displayName || item.latestSender?.email || (en ? 'Unknown sender' : '送信者不明');
  return <article className={`source-row${selectedId === item.id ? ' is-selected' : ''}`} key={item.id} data-account-id={item.account.id}>
    <span className="source-avatar" aria-hidden="true"><UserRound size={17} /></span>
    <button id={item.id} className="source-main" type="button" onClick={() => onOpenConversation(item.id, item.account.id)}>
      <span className="source-row-heading"><strong>{sender}</strong><time dateTime={item.lastMessageAt ?? undefined}>{item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleString(en ? 'en-US' : 'ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : (en ? 'Unknown time' : '日時不明')}</time></span>
      <strong className="source-subject">{item.subject}</strong>
      <span>{item.preview || (en ? 'No message body' : '本文はありません')}</span>
      <span className="source-row-meta"><span>{item.account.emailAddress}</span><span><Mail size={12} />{item.messageCount}</span>{item.hasAttachments && <span><Paperclip size={12} />{en ? 'Attachment' : '添付あり'}</span>}</span>
    </button>
    {onOpenMoment && <button className="status-affordance" type="button" onClick={() => onOpenMoment(item.id)} aria-label={en ? 'View work status for this conversation' : 'この会話の対応状況を見る'}>{en ? 'Work' : '対応'}</button>}
  </article>;
}

export function RealSourceList({model, loading, error, selectedId = '', onRetry, onOpenConversation, onLoadMore}: {
  model: SourcePageReadModel | null;
  loading: boolean;
  error: string;
  selectedId?: string;
  onRetry: () => void;
  onOpenConversation: (conversationId: string, accountId: string) => void;
  onLoadMore: () => void;
}) {
  const en = useLocale() === 'en';
  if (loading && !model) return <div className="surface-content"><div className="loading-state" role="status">{en ? 'Loading Source conversations.' : 'Sourceの会話を確認しています。'}</div></div>;
  if (error && !model) return <div className="surface-content"><div className="empty-state" role="alert">{en ? 'Source could not be loaded. Check the connection, then try again.' : 'Sourceを確認できませんでした。接続状態を確認してから、もう一度お試しください。'}<br /><button className="quiet-button" type="button" onClick={onRetry}>{en ? 'Retry Source' : 'Sourceを再確認'}</button></div></div>;
  if (!model) return null;
  return <div className="surface-content">
    <p className="surface-intro">{en ? 'Read the original conversation here. Source stays separate from work status and decisions.' : '元の会話をそのまま確認できます。Sourceは対応や判断とは別の原文です。'}</p>
    {readinessNotice(model.readiness, model.dataThroughAt, en)}
    {error && <p className="inline-status" role="alert">{en ? 'More conversations could not be loaded. The visible Source is preserved and you can retry.' : '追加の会話を読み込めませんでした。表示済みのSourceは保持しています。再試行できます。'}</p>}
    {model.accounts.length > 0 && <p className="metadata">{en ? 'Scope' : '確認対象'}: {model.accounts.map(accountLabel).join(en ? ', ' : '、')}</p>}
    {model.conversations.length > 0
      ? model.conversations.map((item) => sourceRow(item, onOpenConversation, undefined, en, selectedId))
      : model.readiness === 'ready'
        ? <p className="empty-state">{en ? 'No authorized conversations.' : '認可された会話はありません。'}</p>
        : <p className="empty-state">{en ? 'No conversations are visible in the verified coverage. This is not treated as a complete empty result until sync finishes.' : '現在の確認範囲に表示できる会話はありません。同期が完了するまで、全件なしとは扱いません。'}</p>}
    {continuation(model, loading, onLoadMore, en)}
  </div>;
}

export function FixtureSourceList({openConversation, openMoment}: {openConversation: (origin: string) => void; openMoment: (origin?: string) => void}) {
  return <div className="surface-content"><p className="surface-intro">元の会話をそのまま確認できます。</p><article className="source-row"><button id="source-estimate" className="source-main" type="button" onClick={(event) => openConversation(event.currentTarget.id)}><strong>佐藤ひろ子</strong><span>来期の見積書について</span><span>添付の見積書をご確認いただけますか。</span></button><button className="status-affordance" type="button" onClick={() => openMoment('source-estimate')} aria-label="この会話の対応状況を見る">対応</button><time>10:24</time></article></div>;
}

export function RealSourceSearch({model, accounts, loading, error, text, accountId, selectedId = '', onText, onAccount, onOpenConversation, onLoadMore}: {
  model: SourcePageReadModel | null;
  accounts?: SourceAccountReadModel[];
  loading: boolean;
  error: string;
  text: string;
  accountId: string;
  selectedId?: string;
  onText: (value: string) => void;
  onAccount: (value: string) => void;
  onOpenConversation: (conversationId: string, accountId: string) => void;
  onLoadMore: () => void;
}) {
  const en = useLocale() === 'en';
  return <div className="surface-content">
    <div className="search-box">
      <label htmlFor="source-search">{en ? 'Search mail' : 'メールを検索'}</label>
      <input id="source-search" value={text} onChange={(event) => onText(event.target.value)} placeholder={en ? 'Sender, subject, or phrase' : '送信者、件名、語句を入力'} />
      <label htmlFor="source-search-account">{en ? 'Account scope' : 'アカウントの範囲'}</label>
      <select id="source-search-account" aria-label={en ? 'Account to search' : '検索するアカウント'} value={accountId} onChange={(event) => onAccount(event.target.value)}>
        <option value="">{en ? 'All connected accounts' : 'すべての接続先'}</option>
        {(accounts ?? model?.accounts ?? []).map((account) => <option key={account.id} value={account.id}>{accountLabel(account)}</option>)}
      </select>
    </div>
    {model && readinessNotice(model.readiness, model.dataThroughAt, en)}
    {error && text.trim() && <p className="empty-state" role="alert">{en ? 'Search could not be completed. Your query and account scope are preserved.' : '検索を完了できませんでした。検索語とアカウント範囲を保持しています。'}</p>}
    {loading && <div className="loading-state" role="status">{en ? 'Searching authorized Source.' : '認可されたSourceを検索しています。'}</div>}
    {!loading && !error && !text.trim() && <p className="empty-state">{en ? 'Enter a query to search original authorized conversations.' : '検索語を入力すると、認可された会話の原文を検索します。'}</p>}
    {!loading && !error && text.trim() && model?.conversations.length === 0 && <p className="empty-state">{en ? `No authorized Source matches “${text}”. Change the query or account scope.` : `「${text}」に一致する認可されたSourceはありません。検索語またはアカウント範囲を変更できます。`}</p>}
    {!loading && !error && text.trim() && model?.conversations.map((item) => sourceRow(item, onOpenConversation, undefined, en, selectedId))}
    {model && text.trim() && model.query.text === text.normalize('NFC').trim() && model.query.accountId === (accountId || null) && continuation(model, loading, onLoadMore, en)}
  </div>;
}

function formatRecipients(message: SourceConversationReadModel['messages'][number], en: boolean): string {
  const names = [...message.recipients, ...message.cc].map((item) => item.displayName || item.email);
  return names.length > 0 ? names.join(en ? ', ' : '、') : (en ? 'No recipient information' : '宛先情報なし');
}

function attachmentSize(sizeBytes: number | null, en: boolean): string {
  if (sizeBytes === null) return en ? 'Unknown size' : 'サイズ不明';
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  return `${Math.round(sizeBytes / 1024)} KB`;
}

function SourceAttachment({attachment, accountId, userId, en}: {attachment: SourceAttachmentReadModel; accountId: string; userId: string; en: boolean}) {
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
    <FileText size={23} aria-hidden="true" />
    <div className="attachment-copy"><strong>{attachment.filename}</strong><span className="metadata">{attachment.mimeType} · {attachmentSize(attachment.sizeBytes, en)}</span>{localPreviewFailed && <span className="metadata">{en ? 'Preview failed on this device. The protected download path remains available.' : 'この画面でのプレビューに失敗しました。安全な取得経路を利用できます。'}</span>}</div>
    {providerBlocked || state === 'provider-blocked'
      ? <span className="inline-status" role="status">{en ? 'Provider security restrictions block this file. Lunowa will not bypass them.' : 'プロバイダーの安全制限により、このファイルは取得できません。制限を回避しません。'}</span>
      : canFetch
        ? <button className="quiet-button attachment-download" type="button" disabled={state === 'downloading'} onClick={() => void download()}><Download size={16} />{state === 'downloading' ? (en ? 'Downloading' : '取得しています') : state === 'unavailable' ? (en ? 'Try download again' : '再取得する') : (en ? 'Download safely' : '安全にダウンロード')}</button>
        : <span className="metadata">{en ? 'No matching provider download path is available.' : '現在、対応するプロバイダー取得経路はありません。'}</span>}
    {state === 'local-failure' && <span className="inline-status" role="status">{en ? 'Download could not start on this device. The original and attachment record remain available.' : 'この端末でダウンロードを開始できませんでした。原文と添付の存在情報は保持されています。'}</span>}
    {state === 'unavailable' && <span className="inline-status" role="status">{en ? 'The provider download failed. You can retry without bypassing its protections.' : 'プロバイダーから安全に取得できませんでした。再取得を試せますが、保護を回避する経路は使用しません。'}</span>}
  </li>;
}

export function SourceConversationDetail({conversation, userId, loading, error}: {conversation: SourceConversationReadModel | null; userId: string; loading: boolean; error: string}) {
  const en = useLocale() === 'en';
  if (loading && !conversation) return <div className="source-detail-state" role="status">{en ? 'Loading Source conversation.' : 'Sourceの会話を読み込んでいます。'}</div>;
  if (error && !conversation) return <div className="source-detail-state" role="alert">{en ? 'This Source conversation could not be loaded. Check authorization and connection state.' : 'このSource会話を確認できませんでした。認可された会話か、接続状態を確認してください。'}</div>;
  if (!conversation) return null;
  const firstInbound = conversation.messages.find((message) => message.direction === 'INBOUND');
  return <div className="source-conversation-body">
    <header className="source-contact-header"><span className="source-contact-avatar" aria-hidden="true"><UserRound size={24} /></span><div><strong>{firstInbound?.sender.displayName || firstInbound?.sender.email || conversation.subject}</strong><span>{conversation.account.displayName || 'Gmail'} · {conversation.account.emailAddress}</span><small>{en ? `${conversation.messages.length} ${conversation.messages.length === 1 ? 'message' : 'messages'} · Original source` : `${conversation.messages.length}通 · Sourceの原文`}</small></div></header>
    <details className="source-provenance"><summary>{en ? 'Source details' : 'Sourceの詳細'}</summary><p className="metadata">{conversation.account.provider} · {conversation.account.emailAddress} · evidence revision {conversation.evidenceRevision}</p></details>
    {accountCoverageNotice(conversation.account, en)}
    {conversation.messages.map((message) => <article className={`source-message ${message.direction === 'OUTBOUND' ? 'outbound' : 'inbound'}`} key={message.id}>
      <header><strong>{message.sender.displayName || message.sender.email}</strong><span>{message.sender.email}</span><time dateTime={message.occurredAt}>{new Date(message.occurredAt).toLocaleString(en ? 'en-US' : 'ja-JP')}</time></header>
      <p className="metadata">{message.direction === 'INBOUND' ? (en ? 'Received' : '受信') : (en ? 'Sent' : '送信')} · {en ? 'To' : '宛先'}: {formatRecipients(message, en)}</p>
      {message.providerDeletedAt && <p className="inline-status" role="status">{en ? 'The provider no longer exposes this message, but the observed original is preserved.' : 'プロバイダーでは現在確認できませんが、観測済みの原文は保持しています。'}</p>}
      {message.sanitizedHtmlBody
        ? <div className="source-html" dangerouslySetInnerHTML={{__html: sanitizeSourceHtml(message.sanitizedHtmlBody) ?? ''}} />
        : message.textBody
          ? <p className="source-text">{message.textBody}</p>
          : <p className="empty-state">{en ? 'Message body is unavailable.' : '本文は利用できません。'}</p>}
      {message.attachments.length > 0 && <section className="attachment-list" aria-label={en ? 'Attachments' : '添付ファイル'}><h3>{en ? 'Attachments' : '添付ファイル'}</h3><ul>{message.attachments.map((attachment) => <SourceAttachment key={attachment.id} attachment={attachment} accountId={conversation.account.id} userId={userId} en={en} />)}</ul></section>}
    </article>)}
  </div>;
}
