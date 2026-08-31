'use client';

import {useEffect, useRef, useState} from 'react';

export type AppSession =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'session_expired'
  | 'auth_error'
  | 'signing_out';
export type SourceReadiness = 'loading' | 'partial' | 'ready' | 'unavailable';
export type MonitoringIntegrity = 'unknown' | 'healthy' | 'degraded';
export type CapabilityAvailability =
  | 'available'
  | 'partially_available'
  | 'permission_missing'
  | 'temporarily_unavailable'
  | 'unsupported';
export type MutationState = 'idle' | 'pending' | 'confirmed' | 'failed';

export type ShellFixture = {
  id: 'normal' | 'zero' | 'loading' | 'partial' | 'degraded' | 'session-expired';
  label: string;
  session: AppSession;
  sourceReadiness: SourceReadiness;
  integrity: MonitoringIntegrity;
  sourceRead: CapabilityAvailability;
  mutation: MutationState;
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
    sourceRead: 'available',
    mutation: 'idle',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'zero',
    label: '対応なし（信頼できる範囲）',
    session: 'authenticated',
    sourceReadiness: 'ready',
    integrity: 'healthy',
    sourceRead: 'available',
    mutation: 'idle',
    hasNeedsYou: false,
    hasReview: false
  },
  {
    id: 'loading',
    label: '読み込み中',
    session: 'authenticated',
    sourceReadiness: 'loading',
    integrity: 'unknown',
    sourceRead: 'available',
    mutation: 'pending',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'partial',
    label: '一部のみ',
    session: 'authenticated',
    sourceReadiness: 'partial',
    integrity: 'healthy',
    sourceRead: 'partially_available',
    mutation: 'idle',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'degraded',
    label: '監視の問題',
    session: 'authenticated',
    sourceReadiness: 'ready',
    integrity: 'degraded',
    sourceRead: 'temporarily_unavailable',
    mutation: 'failed',
    hasNeedsYou: true,
    hasReview: true
  },
  {
    id: 'session-expired',
    label: 'セッション期限切れ',
    session: 'session_expired',
    sourceReadiness: 'ready',
    integrity: 'healthy',
    sourceRead: 'available',
    mutation: 'idle',
    hasNeedsYou: true,
    hasReview: true
  }
];

type Surface = 'home' | 'needs' | 'managed' | 'review' | 'source' | 'search' | 'settings';
type Detail = 'moment' | 'managed-detail' | 'review-detail' | 'conversation' | null;

const navigation: readonly {id: Surface; label: string}[] = [
  {id: 'home', label: 'ホーム'},
  {id: 'needs', label: '対応が必要'},
  {id: 'managed', label: '管理中'},
  {id: 'review', label: '確認'},
  {id: 'source', label: '会話'},
  {id: 'search', label: '検索'},
  {id: 'settings', label: '設定'}
];

const attentionItem = {
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

export function LunowaShell() {
  const [surface, setSurface] = useState<Surface>('home');
  const [detail, setDetail] = useState<Detail>(null);
  const [detailOrigin, setDetailOrigin] = useState(attentionItem.id);
  const [fixtureId, setFixtureId] = useState<ShellFixture['id']>('normal');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [mutation, setMutation] = useState<MutationState>('idle');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const navTrigger = useRef<HTMLButtonElement>(null);
  const drawerPanel = useRef<HTMLElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const fixture = shellFixtures.find(({id}) => id === fixtureId) ?? shellFixtures[0];

  const openDetail = (next: Detail, origin = attentionItem.id) => {
    setDetail(next);
    setDetailOrigin(origin);
    window.setTimeout(() => {
      if (window.matchMedia?.('(max-width: 719px)').matches) detailHeading.current?.focus();
    }, 0);
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

  if (fixture.session === 'session_expired') {
    return (
      <main className="session-panel" data-testid="session-expired">
        <p className="eyebrow">LUNOWA</p>
        <h1>セッションの期限が切れました</h1>
        <p>アプリへのアクセスを続けるには、もう一度サインインしてください。</p>
        <button className="primary-button" type="button">サインインする</button>
        <FixtureSwitch fixtureId={fixtureId} onChange={setFixtureId} />
      </main>
    );
  }

  const announceMutation = (message: string) => {
    setMutation('pending');
    setStatus(message);
  };

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
        <div className="brand"><span aria-hidden="true">◐</span> LUNOWA</div>
        <nav>
          {navigation.filter((item) => item.id !== 'review' || fixture.hasReview || surface === 'review').map((item) => (
            <button
              className={surface === item.id ? 'nav-item active' : 'nav-item'}
              key={item.id}
              type="button"
              aria-current={surface === item.id ? 'page' : undefined}
              onClick={() => selectSurface(item.id)}
            >
              {item.label}
              {item.id === 'review' && <span className="nav-count" aria-label="確認が1件">1</span>}
            </button>
          ))}
        </nav>
        <div className="nav-bottom"><span>監視はアプリのサインアウトとは別です</span></div>
      </aside>
      {drawerOpen && <button aria-label="ナビゲーションを閉じる" className="scrim" onClick={closeDrawer} />}

      <section className="surface-pane" aria-label="現在の画面">
        <SurfaceContent
          surface={surface}
          fixture={fixture}
          search={search}
          onSearch={setSearch}
          openMoment={(origin) => openDetail('moment', origin)}
          openManaged={() => openDetail('managed-detail', 'managed-estimate')}
          openReview={() => openDetail('review-detail', 'review-condition')}
          openConversation={() => openDetail('conversation', sourceItem.id)}
        />
        <FixtureSwitch fixtureId={fixtureId} onChange={setFixtureId} />
      </section>

      <section className="detail-pane" aria-label="詳細" aria-live="off">
        {detail ? (
          <DetailContent
            detail={detail}
            headingRef={detailHeading}
            draft={draft}
            onDraft={setDraft}
            mutation={mutation}
            fixture={fixture}
            onBack={() => {
              setDetail(null);
              setStatus('一覧に戻りました');
              window.setTimeout(() => document.getElementById(detailOrigin)?.focus(), 0);
            }}
            onMutation={announceMutation}
            onOpenSource={() => {
              setSurface('source');
              openDetail('conversation', sourceItem.id);
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

function SurfaceContent({surface, fixture, search, onSearch, openMoment, openManaged, openReview, openConversation}: {
  surface: Surface;
  fixture: ShellFixture;
  search: string;
  onSearch: (value: string) => void;
  openMoment: (origin?: string) => void;
  openManaged: () => void;
  openReview: () => void;
  openConversation: () => void;
}) {
  const title = navigation.find((item) => item.id === surface)?.label ?? 'ホーム';
  const integrity = fixture.integrity === 'degraded';
  const partial = fixture.sourceReadiness === 'partial';
  const loading = fixture.sourceReadiness === 'loading';
  return (
    <>
      <div className="surface-header">
        <div><p className="eyebrow">LUNOWA</p><h1 id="surface-heading">{title}</h1></div>
        <button className="quiet-button" type="button" onClick={() => openConversation()}>会話を見る</button>
      </div>
      {integrity && <IntegrityBanner />}
      {partial && <p className="coverage-notice" role="status">一部の会話のみを表示しています。最新の確認範囲: 10:15。</p>}
      {loading && <LoadingState />}
      {!loading && surface === 'home' && <Home fixture={fixture} openMoment={openMoment} openReview={openReview} openManaged={openManaged} />}
      {!loading && surface === 'needs' && <NeedsYou fixture={fixture} openMoment={openMoment} openConversation={openConversation} />}
      {!loading && surface === 'managed' && <Managed openManaged={openManaged} />}
      {!loading && surface === 'review' && <Review fixture={fixture} openReview={openReview} />}
      {!loading && surface === 'source' && <SourceList openConversation={openConversation} openMoment={openMoment} />}
      {!loading && surface === 'search' && <Search search={search} onSearch={onSearch} openConversation={openConversation} />}
      {!loading && surface === 'settings' && <Settings fixture={fixture} />}
    </>
  );
}

function Home({fixture, openMoment, openReview, openManaged}: {fixture: ShellFixture; openMoment: () => void; openReview: () => void; openManaged: () => void}) {
  if (!fixture.hasNeedsYou && !fixture.hasReview && fixture.integrity === 'healthy' && fixture.sourceReadiness === 'ready') return <div className="surface-content"><section className="true-zero"><p className="eyebrow">現在の状態</p><h2>今、あなたが対応する必要はありません。</h2><p>会話の確認範囲は信頼でき、Lunowaが4件を見守っています。</p><button className="quiet-button" type="button" onClick={openManaged}>管理中を見る</button></section></div>;
  return <div className="surface-content">
    <section aria-labelledby="attention-heading"><div className="section-heading"><h2 id="attention-heading">今、確認が必要なこと</h2><span>2件</span></div>
      {fixture.hasNeedsYou && <AttentionButton onClick={openMoment} />}
      {fixture.hasReview && <button id="review-condition" className="list-row review-row" type="button" onClick={openReview}><span className="state-chip review">確認</span><strong>契約更新の条件を確認してください</strong><span>佐藤ひろ子との会話に、異なる更新日があります。</span></button>}
    </section>
    {fixture.integrity === 'healthy' ? <section className="managed-summary" aria-labelledby="managed-heading"><p className="eyebrow">安心して任せていること</p><h2 id="managed-heading">Lunowaが見ています <strong>4</strong></h2><p>今、追加対応が必要なものはありません。</p><p className="metadata">最終確認 2分前</p><button id="managed-estimate" className="quiet-button" type="button" onClick={openManaged}>管理中を見る</button></section> : <p className="coverage-notice">監視の状態を確認するまで、管理中の安心表示は保留しています。</p>}
  </div>;
}

function NeedsYou({fixture, openMoment, openConversation}: {fixture: ShellFixture; openMoment: () => void; openConversation: () => void}) {
  return <div className="surface-content"><p className="surface-intro">現在のあなたの対応が必要なものだけを表示しています。</p>{fixture.hasNeedsYou ? <><AttentionButton onClick={openMoment} /><button className="source-link" type="button" onClick={openConversation}>元の会話を開く</button></> : <p className="empty-state">現在、対応が必要な件はありません。</p>}</div>;
}

function AttentionButton({onClick}: {onClick: () => void}) {
  return <button id={attentionItem.id} className="list-row attention-row" type="button" onClick={onClick}><span className="state-chip action">対応</span><strong>{attentionItem.action}</strong><span>{attentionItem.person} · {attentionItem.topic}</span><span className="metadata">{attentionItem.whyNow}</span></button>;
}

function Managed({openManaged}: {openManaged: () => void}) {
  return <div className="surface-content"><section className="managed-summary"><p className="eyebrow">監視中</p><h2>Lunowaが見ています <strong>4</strong></h2><p>監視は正常です。必要になるまで静かに見守ります。</p></section><button id="managed-estimate" className="list-row" type="button" onClick={openManaged}><span className="state-chip waiting">待機中</span><strong>来期の見積書</strong><span>佐藤ひろ子からの確認を待っています</span><span className="metadata">再確認条件: 9月3日、または返信</span></button></div>;
}

function Review({fixture, openReview}: {fixture: ShellFixture; openReview: () => void}) {
  return <div className="surface-content"><p className="surface-intro">小さく、判断が必要な確認だけを表示しています。</p>{fixture.hasReview ? <button id="review-condition" className="list-row review-row" type="button" onClick={openReview}><span className="state-chip review">確認</span><strong>契約更新の条件を確認してください</strong><span>更新日が会話内で一致していません。</span></button> : <p className="empty-state">現在、確認が必要な事項はありません。</p>}</div>;
}

function SourceList({openConversation, openMoment}: {openConversation: () => void; openMoment: (origin?: string) => void}) {
  return <div className="surface-content"><p className="surface-intro">元の会話をそのまま確認できます。</p><article className="source-row"><button id={sourceItem.id} className="source-main" type="button" onClick={openConversation}><strong>{sourceItem.sender}</strong><span>{sourceItem.subject}</span><span>{sourceItem.preview}</span></button><button className="status-affordance" type="button" onClick={() => openMoment(sourceItem.id)} aria-label="この会話の対応状況を見る">対応</button><time>{sourceItem.time}</time></article></div>;
}

function Search({search, onSearch, openConversation}: {search: string; onSearch: (value: string) => void; openConversation: () => void}) {
  return <div className="surface-content"><label className="search-box" htmlFor="source-search">メールを検索<input id="source-search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="送信者、件名、語句を入力" /></label>{search ? <><p className="metadata">「{search}」の認可された完全一致を検索しています。</p><button className="list-row" type="button" onClick={openConversation}><strong>{sourceItem.subject}</strong><span>{sourceItem.preview}</span></button></> : <p className="empty-state">検索語を入力すると、会話の原文を検索します。</p>}</div>;
}

function Settings({fixture}: {fixture: ShellFixture}) {
  return <div className="surface-content"><section className="settings-card"><h2>接続と監視</h2><p>アプリへのサインインとメールボックスの接続は別の状態です。</p><dl><div><dt>メールボックス</dt><dd>未接続（fixture）</dd></div><div><dt>会話を読む権限</dt><dd>{fixture.sourceRead}</dd></div></dl></section></div>;
}

function DetailContent({detail, headingRef, draft, onDraft, mutation, fixture, onBack, onMutation, onOpenSource}: {
  detail: Detail;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  draft: string;
  onDraft: (value: string) => void;
  mutation: MutationState;
  fixture: ShellFixture;
  onBack: () => void;
  onMutation: (message: string) => void;
  onOpenSource: () => void;
}) {
  const title = detail === 'conversation' ? sourceItem.subject : detail === 'review-detail' ? '契約更新の条件を確認してください' : detail === 'managed-detail' ? '来期の見積書を見守っています' : attentionItem.action;
  return <div className="detail-content"><button className="back-button" type="button" onClick={onBack}>‹ 一覧に戻る</button><h2 ref={headingRef} tabIndex={-1}>{title}</h2>
    {detail === 'moment' && <MomentBody onSource={onOpenSource} draft={draft} onDraft={onDraft} mutation={mutation} fixture={fixture} onMutation={onMutation} />}
    {detail === 'managed-detail' && <ManagedDetail mutation={mutation} onMutation={onMutation} />}
    {detail === 'review-detail' && <ReviewDetail mutation={mutation} onMutation={onMutation} />}
    {detail === 'conversation' && <Conversation draft={draft} onDraft={onDraft} mutation={mutation} fixture={fixture} onMutation={onMutation} />}
  </div>;
}

function MomentBody({onSource, draft, onDraft, mutation, fixture, onMutation}: {onSource: () => void; draft: string; onDraft: (value: string) => void; mutation: MutationState; fixture: ShellFixture; onMutation: (message: string) => void}) {
  return <><p className="detail-lead">{attentionItem.whyNow}</p><section className="trust-block"><h3>いま行うこと</h3><p>見積書を確認して、必要な点を返信してください。</p><button className="primary-button" type="button" onClick={() => document.getElementById('reply-body')?.focus()}>返信を書く</button></section><section><h3>変わったこと</h3><p>佐藤さんから、打ち合わせ前の確認依頼が届きました。</p></section><section><h3>残っていること</h3><p>見積書の条件について、あなたからの確認を待っています。</p></section><button className="source-link" type="button" onClick={onSource}>元の会話を確認する</button><Composer draft={draft} onDraft={onDraft} mutation={mutation} fixture={fixture} onMutation={onMutation} /></>;
}

function ManagedDetail({mutation, onMutation}: {mutation: MutationState; onMutation: (message: string) => void}) {
  return <><p className="detail-lead">佐藤ひろ子からの返信、または9月3日の再確認条件を見守っています。</p><section><h3>監視の状態</h3><p><span className="state-chip waiting">待機中</span> 監視は正常です。</p></section><section><h3>元の会話</h3><p>{sourceItem.subject}</p></section><button className="danger-button" disabled={mutation === 'pending'} type="button" onClick={() => onMutation('監視を停止しています')}>{mutation === 'pending' ? '監視を停止しています' : '監視を停止する'}</button><p className="metadata">停止は、確認されるまで完了や対応不要を意味しません。</p></>;
}

function ReviewDetail({mutation, onMutation}: {mutation: MutationState; onMutation: (message: string) => void}) {
  return <><p className="detail-lead">会話内で更新日が2つ示されています。正しい条件を選んでください。</p><section><h3>根拠</h3><p>8月29日のメッセージ: 9月30日。8月30日の添付: 10月1日。</p></section><fieldset disabled={mutation === 'pending'}><legend>採用する更新日</legend><button className="choice-button" type="button" onClick={() => onMutation('回答を保存しています')}>9月30日</button><button className="choice-button" type="button" onClick={() => onMutation('回答を保存しています')}>10月1日</button></fieldset>{mutation === 'pending' && <p className="inline-status" role="status">回答を保存しています。確認されるまでこの確認は残ります。</p>}</>;
}

function Conversation({draft, onDraft, mutation, fixture, onMutation}: {draft: string; onDraft: (value: string) => void; mutation: MutationState; fixture: ShellFixture; onMutation: (message: string) => void}) {
  return <><div className="message-card"><p className="metadata">佐藤ひろ子 · 10:24</p><p>添付の見積書をご確認いただけますか。明日の打ち合わせで確認できれば助かります。</p></div><p className="metadata">この会話は Source の原文です。要約や判断を必須にはしません。</p><Composer draft={draft} onDraft={onDraft} mutation={mutation} fixture={fixture} onMutation={onMutation} /></>;
}

function Composer({draft, onDraft, mutation, fixture, onMutation}: {draft: string; onDraft: (value: string) => void; mutation: MutationState; fixture: ShellFixture; onMutation: (message: string) => void}) {
  const unavailable = fixture.sourceRead === 'temporarily_unavailable';
  return <section className="composer" aria-labelledby="composer-heading"><h3 id="composer-heading">返信</h3><p className="metadata">宛先: 佐藤ひろ子 · From: work@example.jp</p><label htmlFor="reply-body">本文<textarea id="reply-body" value={draft} onChange={(event) => onDraft(event.target.value)} placeholder="返信を入力" rows={4} /></label>{unavailable && <p className="inline-status" role="status">現在オフラインです。下書きは保存されていますが、送信されていません。</p>}<button className="primary-button" disabled={!draft || mutation === 'pending' || unavailable} type="button" onClick={() => onMutation('送信をリクエストしています')}>{mutation === 'pending' ? '送信をリクエストしています' : '送信する'}</button><p className="metadata">Enterだけでは送信されません。</p></section>;
}

function IntegrityBanner() {
  return <aside className="integrity-banner" aria-labelledby="integrity-title"><strong id="integrity-title">一部の監視を確認できていません</strong><span>会話の更新を再確認するまで、管理中の安心表示には含めません。</span><button type="button">再接続を確認</button></aside>;
}

function LoadingState() { return <div className="loading-state" role="status"><span aria-hidden="true" />会話の状態を確認しています。完了するまで、対応なしとは表示しません。</div>; }
function EmptyDetail() { return <div className="empty-detail"><p className="eyebrow">詳細</p><h2>項目を選択してください</h2><p>対応、管理中、確認、または会話を選ぶと、ここに必要な文脈を表示します。</p></div>; }
