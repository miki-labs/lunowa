'use client';

import {useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode} from 'react';
import {Group, Panel, Separator, usePanelRef} from 'react-resizable-panels';
import {ArrowLeft, BriefcaseBusiness, CalendarDays, Check, CheckCheck, ChevronDown, Circle, CircleCheck, CircleHelp, ClipboardCheck, ClipboardList, Clock3, Download, Ellipsis, EllipsisVertical, FileText, Home, Mail, MessageSquare, PanelLeftClose, PanelLeftOpen, Paperclip, Pin, Plus, Reply, Search, Send, Settings, SlidersHorizontal, Sparkles, Star, UserRound, X, type LucideIcon} from 'lucide-react';
import './reference-workspace.css';

type Locale = 'ja' | 'en';
type Variant = 'desktop' | 'moment';
const compactQuery = '(max-width: 1000px)';
function subscribeToCompactLayout(onChange: () => void) {
  const query = window.matchMedia(compactQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const getCompactLayout = () => window.matchMedia(compactQuery).matches;
const getServerCompactLayout = () => false;
type Status = 'action' | 'later' | 'waiting' | 'done' | 'review';
type MailFixture = {id: string; name: string; subject: string; excerpt: string; time: string; status: Status; pinned?: boolean; unread?: boolean; portrait?: 'tanaka' | 'suzuki' | 'sato'; initials?: string};
const statusLabels: Record<Status, [string, string]> = {action: ['対応が必要', 'Needs you'], later: ['あとで', 'Later'], waiting: ['待ち', 'Waiting'], done: ['完了', 'Done'], review: ['確認が必要', 'Review']};
const fixtures = (en: boolean, moment: boolean): MailFixture[] => [
  {id:'q2', name:en ? 'Taro Tanaka' : moment ? '田中 太郎' : '山田 太郎', subject:en ? 'Q2 project progress meeting' : moment ? 'Q2 プロジェクト進捗共有ミーティング' : 'Q2 プロジェクト進捗共有のお願い', excerpt:en ? 'Please let me know which time works for you…' : moment ? '候補日時をお送りします。ご都合の良い日…' : 'お疲れ様です。Q2 の進捗共有ミーティングについて…', time:'11:30', status:'action', pinned:true, portrait:'tanaka'},
  {id:'release', name:en ? 'Lunowa Inc.' : '株式会社ルノワ', subject:en ? 'Introducing our latest release' : '新機能リリースのお知らせ', excerpt:en ? 'Lunowa v1.0 is here. Discover what’s new…' : 'Lunowa v1.0 をリリースしましたのでお知らせします…', time:'10:15', status:moment ? 'review' : 'waiting', pinned:true, unread:true, initials:'ルノワ'},
  {id:'design', name:en ? 'Hanako Suzuki' : '鈴木 花子', subject:en ? 'Invitation to a design review' : 'デザインレビューのご案内', excerpt:en ? 'Join us for this Friday’s design review…' : '今週金曜のデザインレビューについてご連絡です…', time:'09:42', status:'later', portrait:'suzuki'},
  {id:'estimate', name:en ? 'Kenichi Sato' : '佐藤 健一', subject:en ? 'Please review the estimate' : '見積書のご確認依頼', excerpt:en ? 'Could you review the estimate I sent earlier?' : '先日お送りした見積書について、ご確認をお願いいた…', time:en ? 'Yesterday' : '昨日', status:moment ? 'review' : 'action', portrait:'sato'},
  {id:'support', name:en ? 'Customer Support' : 'カスタマーサポート', subject:en ? 'Thank you for contacting us' : 'お問い合わせありがとうございます', excerpt:en ? 'Thank you for getting in touch with our team…' : 'このたびはお問い合わせいただき、ありがとうござい…', time:en ? 'Yesterday' : '昨日', status:'waiting', initials:'S'},
  {id:'contract', name:en ? 'Growth Inc.' : '株式会社グロース', subject:en ? 'Contract renewal information' : '契約更新のお手続きについて', excerpt:en ? 'Your contract is coming up for renewal…' : '契約更新の時期が近づいております。お手続きをお願…', time:moment ? (en ? 'May 19' : '5月19日') : (en ? 'Yesterday' : '昨日'), status:'done', initials:'グ'},
  {id:'minutes', name:en ? 'Taro Tanaka' : '田中 太郎', subject:en ? 'Meeting minutes (2025/05/17)' : `会議議事録（${moment ? '2025' : '2024'}/05/17）`, excerpt:en ? 'Here are the minutes from our regular meeting.' : moment ? '昨日の定例会議の議事録を共有します。' : '来年度の定例会議の議事録を共有します。', time:en ? 'May 17' : '5月17日', status:'done', portrait:'tanaka'},
  {id:'schedule', name:en ? 'Project team' : 'プロジェクトチーム', subject:en ? 'Next week’s schedule' : '来週のスケジュールについて', excerpt:en ? 'Please find the updated schedule attached.' : '更新したスケジュールをご確認ください。', time:en ? 'May 16' : '5月16日', status:'later', initials:'P'}
];

export function ReferenceBadge({status, locale = 'ja'}: {status: Status; locale?: Locale}) {
  return <span className={`rf-badge rf-${status}`}>{statusLabels[status][locale === 'en' ? 1 : 0]}</span>;
}

function Avatar({portrait, initials, generic = false, size = 40}: {portrait?: MailFixture['portrait']; initials?: string; generic?: boolean; size?: number}) {
  // Exact supplied reference portraits, clipped in CSS; no invented substitute faces.
  const positions = {tanaka:[720,24,58], suzuki:[289,442,50], sato:[289,678,50]} as const;
  const source = portrait && !generic ? positions[portrait] : null;
  const style: CSSProperties = source ? {width:size, height:size, backgroundImage:'url(/design-reference/moment-assets.png)', backgroundSize:`${1448 * size / source[2]}px ${1086 * size / source[2]}px`, backgroundPosition:`${-source[0] * size / source[2]}px ${-source[1] * size / source[2]}px`} : {width:size, height:size};
  return <span aria-hidden="true" style={style} className={`rf-avatar ${source ? 'rf-portrait' : ''} ${initials === 'A' ? 'rf-gold' : ''} ${initials === 'ルノワ' || initials === 'グ' ? 'rf-navy' : ''}`}>{source ? null : initials || <UserRound size={size * .62} strokeWidth={1.7}/>}</span>;
}

export function ReferenceWorkspace({locale, variant}: {locale: Locale; variant: Variant}) {
  const en = locale === 'en';
  const t = (ja: string, english: string) => en ? english : ja;
  const moment = variant === 'moment';
  const [collapsed, setCollapsed] = useState(false);
  const compact = useSyncExternalStore(subscribeToCompactLayout, getCompactLayout, getServerCompactLayout);
  const sidebarPanelRef = usePanelRef();
  const toggleSidebar = () => {
    if (compact) setCollapsed(value => !value);
    else if (sidebarPanelRef.current?.isCollapsed()) sidebarPanelRef.current.expand();
    else sidebarPanelRef.current?.collapse();
  };
  const [mobileDetail, setMobileDetail] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('action');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('q2');
  const [starred, setStarred] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string,string>>({});
  const [notice, setNotice] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [reverse, setReverse] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pendingFocus = useRef<'detail' | 'list' | 'search' | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === 'detail') headingRef.current?.focus();
    if (target === 'list') (rowRefs.current[selected] ?? searchRef.current)?.focus();
    if (target === 'search') searchRef.current?.focus();
  }, [mobileDetail, selected]);
  const showSearch = () => {
    if (mobileDetail) {pendingFocus.current = 'search'; setMobileDetail(false);}
    else searchRef.current?.focus();
  };
  const mails = fixtures(en, moment);
  if (moment) [mails[3], mails[4]] = [mails[4], mails[3]];
  const current = mails.find(mail => mail.id === selected)!;
  let visible = mails.filter(mail => (filter === 'all' || (filter === 'pinned' ? mail.pinned : mail.status === filter)) && (tab === 'all' || (tab === 'unread' ? mail.unread : starred.includes(mail.id))) && `${mail.name} ${mail.subject} ${mail.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  if (reverse) visible = [...visible].reverse();
  const previewNotice = () => setNotice(t('デザインプレビューです。実際のメール送信やアカウント接続は行いません。', 'Design preview. No real mail is sent and no accounts are connected.'));
  const focusReply = () => replyRef.current?.focus();
  const isActive = (value: string) => moment && ['home', 'action', 'managed', 'review'].includes(value) ? activeSection === value : filter === value;
  const nav = (label: string, Icon: LucideIcon, value: string, count?: number, color?: string) => <button key={value} className={`rf-nav-item ${isActive(value) ? 'is-active' : ''}`} onClick={() => {setActiveSection(value); setFilter(value === 'home' || value === 'managed' ? 'all' : value); setMobileDetail(false);}} title={label} aria-label={label} aria-pressed={isActive(value)}><Icon className={color || ''} size={20}/><span className="rf-nav-label">{label}</span>{count !== undefined && <span className="rf-nav-count">{count}</span>}</button>;
  const toggleStar = () => setStarred(previous => previous.includes(selected) ? previous.filter(id => id !== selected) : [...previous,selected]);

  return <main lang={locale}><Group style={{height:'100dvh'}} orientation="horizontal" disabled={compact} resizeTargetMinimumSize={{fine:10,coarse:28}} className={`rf-workspace rf-${variant} ${collapsed ? 'rf-collapsed' : ''} ${mobileDetail ? 'rf-mobile-detail' : ''}`}>
    <a href="#rf-mail-list" className="rf-skip">{t('メール一覧へ', 'Skip to mail list')}</a>
    <Panel id="rf-sidebar-panel" className="rf-panel rf-panel-sidebar" panelRef={sidebarPanelRef} defaultSize={moment ? '18.3%' : '19.05%'} minSize={compact ? 0 : 220} maxSize={compact ? '100%' : 360} collapsible={!compact} collapsedSize={76} onResize={size => {if (!compact) setCollapsed(size.inPixels < 100);}}>
    <aside className="rf-sidebar" aria-label={t('ナビゲーション', 'Navigation')}>
      <div className="rf-brand-row"><span role="img" aria-label="Lunowa" className="rf-logo"/><button className="rf-collapse rf-icon-button" aria-label={collapsed ? t('左パネルを展開', 'Expand sidebar') : t('左パネルを折り畳む', 'Collapse sidebar')} aria-expanded={!collapsed} onClick={toggleSidebar}>{collapsed ? <PanelLeftOpen/> : <PanelLeftClose/>}</button></div>
      <button className="rf-primary rf-compose-new" onClick={previewNotice} title={t('新規メール', 'New message')}><Plus size={19}/><span>{t('新規メール', 'New message')}</span></button>
      <button className="rf-workspace-select rf-outline" onClick={previewNotice} title={t('仕事', 'Work')}><BriefcaseBusiness size={19}/><strong>{t('仕事', 'Work')}</strong><ChevronDown size={16}/></button>
      <nav className="rf-main-nav">
        {moment ? <>{nav(t('ホーム','Home'),Home,'home')}{nav(t('対応が必要','Needs you'),CircleCheck,'action',3,'rf-red-icon')}{nav(t('管理中','Managed'),ClipboardCheck,'managed',5)}{nav(t('確認','Review'),ClipboardCheck,'review',8)}<button aria-label={t('会話','Conversations')} className="rf-nav-item" onClick={() => {setFilter('all'); setMobileDetail(false);}}><MessageSquare size={20}/><span className="rf-nav-label">{t('会話','Conversations')}</span></button><button aria-label={t('検索','Search')} className="rf-nav-item" onClick={showSearch}><Search size={20}/><span className="rf-nav-label">{t('検索','Search')}</span></button></> : <>{nav(t('すべて','All'),CircleCheck,'all',12)}{nav(t('対応が必要','Needs you'),CircleCheck,'action',3,'rf-red-icon')}{nav(t('あとで','Later'),Circle,'later',4,'rf-orange-icon')}{nav(t('待ち','Waiting'),Circle,'waiting',3,'rf-blue-icon')}{nav(t('ピン留め','Pinned'),Pin,'pinned',2,'rf-red-icon')}<button aria-label={t('その他','More')} className="rf-nav-item" onClick={() => setShowTools(!showTools)}><Ellipsis size={20}/><span className="rf-nav-label">{t('その他','More')} <ChevronDown size={13}/></span></button></>}
      </nav>
      {moment && <div className="rf-filter-group"><h2>{t('フィルター','Filters')}</h2>{nav(t('すべて','All'),CircleCheck,'all',24)}{nav(t('待ち','Waiting'),CircleCheck,'waiting',3)}{nav(t('あとで','Later'),Circle,'later',4,'rf-orange-icon')}{nav(t('完了','Done'),Check,'done',undefined,'rf-green-icon')}{nav(t('ピン留め','Pinned'),Pin,'pinned',2,'rf-red-icon')}</div>}
      <div className="rf-account-group"><h2>{t('アカウント','Accounts')}</h2>{[['A',t('田中さん','Tanaka'),'tanaka@lunowa.jp','12'],['S',t('サポート','Support'),'support@lunowa.jp','4'],...(moment ? [['P',t('プロジェクト','Project'),'proj@lunowa.jp','8']] : [])].map(([initial,name,email,count]) => <button className="rf-account" key={email} onClick={previewNotice} title={email}><Avatar initials={initial} size={30}/><span className="rf-account-text"><strong>{name}</strong><small>{email}</small></span><span className="rf-account-count">{count}</span></button>)}<button aria-label={t('アカウントを追加','Add account')} className="rf-add-account" onClick={previewNotice}><Plus size={19}/><span>{t('アカウントを追加','Add account')}</span></button></div>
      <div className="rf-settings-group"><button className="rf-nav-item" onClick={() => setShowTools(!showTools)} title={t('設定','Settings')}><Settings size={21}/><span className="rf-nav-label">{t('設定','Settings')}</span></button><button className="rf-nav-item" onClick={previewNotice} title={t('ヘルプ・サポート','Help & support')}><CircleHelp size={19}/><span className="rf-nav-label">{t('ヘルプ・サポート','Help & support')}</span></button></div>
      {!moment && <button aria-label={t('プロフィールとプレビュー設定','Profile and preview settings')} className="rf-profile" onClick={() => setShowTools(!showTools)}><Avatar initials="A" size={38}/><span><strong>{t('田中さん','Tanaka')}</strong><small><i/>{t('オンライン','Online')}</small></span><ChevronDown size={16}/></button>}
    </aside></Panel>
    <Separator className="rf-resize-handle" aria-label={t('左メニューの幅を調整', 'Resize sidebar')} title={t('ドラッグで幅を調整・ダブルクリックで元に戻す', 'Drag to resize · Double-click to reset')}/>
    <Panel id="rf-list-panel" className="rf-panel rf-panel-list" defaultSize={moment ? '29.6%' : '33.02%'} minSize={compact ? 0 : 320} maxSize={compact ? '100%' : 640}>
    <section className="rf-mail-pane" id="rf-mail-list" aria-label={t('メール一覧','Mail list')}>
      <div className="rf-search"><Search size={20}/><input ref={searchRef} aria-label={t('メールやタスクを検索','Search mail and tasks')} placeholder={t('メールやタスクを検索','Search mail and tasks')} value={query} onChange={event => setQuery(event.target.value)}/><button className="rf-icon-button" aria-label={t('検索フィルター','Search filters')} onClick={() => setShowTools(!showTools)}><SlidersHorizontal size={20}/></button></div>
      <div className="rf-list-toolbar"><div className="rf-tabs">{[['all',t('すべて','All')],['unread',t('未読','Unread')],['starred',t('スター付き','Starred')]].map(([value,label]) => <button key={value} className={tab === value ? 'is-active' : ''} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</button>)}</div><button className="rf-sort" onClick={() => setReverse(!reverse)}>{reverse ? t('古い順','Oldest') : t('最新','Latest')}<ChevronDown size={14}/></button></div>
      <div className="rf-mail-rows">{visible.map(mail => <button ref={element => {rowRefs.current[mail.id] = element;}} key={mail.id} className={`rf-mail-row ${selected === mail.id ? 'is-selected' : ''}`} aria-current={selected === mail.id ? 'true' : undefined} onClick={() => {pendingFocus.current = 'detail'; setSelected(mail.id); setMobileDetail(true);}}>
        <span className="rf-row-avatar">{moment ? <Avatar portrait={mail.portrait} initials={mail.initials} size={50}/> : mail.pinned ? <Pin size={17} fill="currentColor"/> : <UserRound size={15}/>}</span>
        <span className="rf-row-content"><span className="rf-row-heading"><strong>{mail.name}</strong>{moment && <ReferenceBadge status={mail.status} locale={locale}/>}<time>{mail.time}</time></span><strong className="rf-subject">{mail.subject}</strong><span className="rf-excerpt">{mail.excerpt}</span>{moment && mail.id === 'q2' && <span className="rf-row-extra"><span><Paperclip size={14}/> 2</span><span className="rf-badge rf-action">{t('返信が必要','Reply needed')}</span></span>}</span>
        {(!moment || (mail.id !== 'q2' && mail.status !== 'review')) && <span className="rf-row-status"><ReferenceBadge status={mail.status} locale={locale}/></span>}{moment && mail.unread && <span className="rf-row-status"><span className="rf-badge rf-waiting">{t('未読','Unread')}</span></span>}
      </button>)}{visible.length === 0 && <p className="rf-empty">{t('該当するメールはありません。','No matching messages.')}</p>}</div>
    </section></Panel>
    <Separator className="rf-resize-handle" aria-label={t('メール一覧と本文の幅を調整', 'Resize message list and detail')} title={t('ドラッグで幅を調整・ダブルクリックで元に戻す', 'Drag to resize · Double-click to reset')}/>
    <Panel id="rf-detail-panel" className="rf-panel rf-panel-detail" minSize={compact ? 0 : 420}>
    <section className="rf-detail" aria-label={t('メールの内容と返信','Message and reply')}>
      <header className="rf-contact-header"><button className="rf-mobile-back rf-icon-button" aria-label={t('一覧へ戻る','Back to list')} onClick={() => {pendingFocus.current = 'list'; setMobileDetail(false);}}><ArrowLeft/></button><Avatar portrait={current.portrait || 'tanaka'} generic={!moment} size={moment ? 58 : 52}/><div className="rf-contact-info"><h1 ref={headingRef} tabIndex={-1}>{selected === 'q2' ? t('田中 太郎','Taro Tanaka') : current.name}{moment && <button onClick={toggleStar} aria-label={t('スターを切り替え','Toggle star')} aria-pressed={starred.includes(selected)} className="rf-star rf-icon-button"><Star fill={starred.includes(selected) ? 'currentColor' : 'none'} size={19}/></button>}</h1><p>{t('株式会社ルノワ / プロジェクト担当','Lunowa Inc. / Project manager')}</p><div><CalendarDays size={14}/>{t('直近のやり取り：5月20日（今日）','Last conversation: May 20 (today)')}</div><div><Mail size={14}/>{t('Q2進捗共有の件でメール４往復','4 email exchanges about Q2 progress')}</div></div><div className="rf-contact-actions"><button className="rf-outline" onClick={() => historyRef.current?.scrollIntoView({block:'nearest'})}><BriefcaseBusiness size={14}/>{t('履歴を見る','History')}</button><button className="rf-outline" onClick={() => setShowDetails(!showDetails)}><UserRound size={14}/>{t('人物情報','Contact')}</button><button className="rf-outline rf-icon-button" aria-label={t('その他の操作','More actions')} onClick={() => setShowTools(!showTools)}><EllipsisVertical size={18}/></button></div></header>
      <section className="rf-next-action" aria-label={t('今すること','Next action')}><div><p className="rf-action-eyebrow"><Sparkles size={17}/>{t('今すること','Next action')}</p><h2>{selected === 'q2' ? t('返信して日程を確定する','Reply to confirm a time') : current.subject}</h2><ul><li><Check/>{t('相手が候補日を送っています','They have sent proposed dates')}</li><li><Check/>{t(moment ? '会議はまだ確定していません' : '会議目的がまだ未確定です','The meeting is not confirmed yet')}</li><li><Check/>{t('次の停滞要因はあなたの返答です','Your reply is the next step')}</li></ul></div><div className="rf-action-buttons"><button className="rf-primary" onClick={focusReply}><Reply size={19}/>{t('返信する','Reply')}</button><div><button onClick={() => historyRef.current?.scrollIntoView({block:'nearest'})}><ClipboardList size={18}/>{t('ソースを見る','View source')}</button><button onClick={previewNotice}><Clock3 size={18}/>{t('あとで','Later')}</button></div></div></section>
      <div ref={historyRef} className="rf-thread" tabIndex={0} aria-label={t('メール履歴','Email history')}>
        {moment && <div className="rf-day-divider"><span>{t('今日','Today')}</span></div>}
        {selected === 'q2' ? moment ? <>
          <Message en={en} moment time="11:28"><p>{t('お疲れ様です。','Hello,')}<br/>{t('Q2プロジェクト進捗共有ミーティングの日程候補をお送りします。','Here are some proposed times for our Q2 progress meeting.')}<br/>{t('ご都合の良い日時を教えてください。','Please let me know what works for you.')}<br/>{t('候補：5/23(金) 13:00-14:00、5/26(月) 10:00-11:00、5/27(火) 15:00-16:00','May 23, 13:00–14:00; May 26, 10:00–11:00; May 27, 15:00–16:00')}<br/>{t('よろしくお願いいたします。','Thank you.')}</p><Attachment en={en} moment onClick={previewNotice}/></Message>
          <Message en={en} moment outbound time="11:30"><p>{t('ありがとうございます。','Thank you.')}<br/>{t('内容を確認のうえ、改めてご連絡いたします。','I’ll review the dates and get back to you.')}</p></Message>
          <Message en={en} moment time="11:31"><p>{t('承知しました。お待ちしております！','Sounds good. I look forward to your reply!')}</p></Message>
        </> : <>
          <Message en={en} time="11:30"><p>{t('お疲れ様です。','Hello,')}<br/>{t('Q2 の進捗共有ミーティングについて、ご都合の良い日時を教えてください。','Could you let me know a good time for our Q2 progress meeting?')}<br/>{t('来週の火曜〜木曜で調整しようと思います。','I’m looking at next Tuesday through Thursday.')}</p></Message>
          <Message en={en} outbound time="11:42"><p>{t('ご連絡ありがとうございます。','Thank you for reaching out.')}<br/>{t('火曜の午後でしたら可能です。','Tuesday afternoon works for me.')}<br/>{t('15:00〜16:00はいかがでしょうか？','Would 15:00–16:00 work for you?')}</p></Message>
          <Message en={en} time="11:45"><p>{t('ありがとうございます！','Thank you!')}<br/>{t('では、火曜の15:00〜16:00で確定しましょう。','Let’s confirm Tuesday, 15:00–16:00.')}<br/>{t('場所はいつもの会議室Ａで大丈夫です。','Our usual meeting room A will be fine.')}</p></Message>
          <Message en={en} outbound time="11:47"><p>{t('承知しました。','Confirmed.')}<br/>{t('アジェンダも事前に共有いただけると助かります。','Could you also share the agenda in advance?')}<br/>{t('よろしくお願いいたします！','Thank you!')}</p></Message>
          <Message en={en} time="10:28" attachment><p>{t('アジェンダ案をお送りします。','Here is the proposed agenda.')}</p><Attachment en={en} onClick={previewNotice}/></Message>
        </> : <Message en={en} moment={moment} time={current.time} name={current.name}><p>{current.subject}<br/>{current.excerpt.replace('…','。')}</p></Message>}
      </div>
      <div className="rf-reply-area"><div className="rf-recipient-line"><span>{t('宛先:','To:')} {selected === 'q2' ? t('田中 太郎','Taro Tanaka') : current.name}〈tanaka@lunowa.jp〉 <span className="rf-recipient-subject">　{t('件名:','Subject:')} {current.subject}</span></span><button className="rf-outline" onClick={() => setShowDetails(!showDetails)} aria-expanded={showDetails}>{t('詳細','Details')}<ChevronDown size={13}/></button></div>{showDetails && <div className="rf-recipient-details">{t('差出人：田中さん〈me@example.com〉 · サンプル宛先です','From: Tanaka <me@example.com> · Sample recipient')}</div>}
        <div className="rf-composer"><textarea onKeyDown={event => {if (moment && event.shiftKey && event.key === 'Enter' && !event.nativeEvent.isComposing) {event.preventDefault(); previewNotice();}}} ref={replyRef} aria-label={t('返信本文','Reply message')} placeholder={moment ? t('田中 太郎さんに返信…','Reply to Taro Tanaka…') : t('返信を入力してください…','Write your reply…')} value={drafts[selected] || ''} onChange={event => setDrafts(previous => ({...previous,[selected]:event.target.value}))}/><div className="rf-composer-tools"><button onClick={previewNotice} aria-label={t('添付','Attach')}><Paperclip size={20}/>{!moment && <span>{t('添付','Attach')}</span>}</button><button className={moment ? 'rf-outline' : ''} onClick={() => {setDrafts(previous => ({...previous,[selected]:t('ご連絡ありがとうございます。候補日時を確認し、改めてご連絡いたします。','Thank you for the proposed dates. I will review them and get back to you.')})); setNotice(t('サンプルの下書きを入力しました。AIへの送信は行っていません。','Inserted a sample draft. No AI request was made.')); focusReply();}}><Sparkles className="rf-gold-icon" size={17}/>{t('下書きを提案','Suggest a draft')}</button><div className="rf-send-group"><button className="rf-primary" onClick={previewNotice}><Send size={17}/>{t('送信','Send')}</button><button className="rf-primary" aria-label={t('送信オプション','Send options')} onClick={previewNotice}><ChevronDown size={18}/></button></div></div></div>{moment && <small className="rf-shortcut">{t('Shift + Enter で送信','Shift + Enter to send')} <CircleHelp size={13}/></small>}</div>
    </section></Panel>
    {showTools && <aside className="rf-preview-tools" aria-label={t('プレビュー設定','Preview settings')}><button className="rf-icon-button" aria-label={t('閉じる','Close')} onClick={() => setShowTools(false)}><X/></button><strong>{t('デザインプレビュー','Design preview')}</strong><p>{t('サンプルデータ・実際には送信しません','Sample data · No real messages are sent')}</p><a href={`/${locale}/preview`}>02 · {t('デスクトップ','Desktop')}</a><a href={`/${locale}/preview?view=moment`}>03 · {t('会話と返信','Conversation & reply')}</a><a href={`/${en ? 'ja' : 'en'}/preview?view=${variant}`}>{en ? '日本語' : 'English'}</a></aside>}
    {notice && <div className="rf-toast" role="status"><span>{notice}</span><button className="rf-icon-button" aria-label={t('閉じる','Dismiss')} onClick={() => setNotice('')}><X size={18}/></button></div>}
  </Group></main>;
}

function Message({children, outbound, time, en, moment, attachment, name}: {children:ReactNode; outbound?:boolean; time:string; en:boolean; moment?:boolean; attachment?:boolean; name?:string}) {
  return <article className={`rf-message ${outbound ? 'rf-outbound' : 'rf-inbound'} ${attachment ? 'rf-attachment-message' : ''}`}>
    {!outbound && <Avatar portrait="tanaka" generic={!moment} size={moment ? 38 : 36}/>}
    <div className="rf-message-body"><header><strong>{name || (outbound ? (en ? 'You' : moment ? 'あなた' : '田中さん') : (en ? 'Taro Tanaka' : '田中 太郎'))}</strong><time>{moment ? time : `${en ? 'May 20 (Mon)' : '5月20日（月）'} ${time}`}</time>{!moment && (outbound ? <CheckCheck size={15}/> : !attachment && <Star size={14}/>)}</header>{children}{moment && outbound && <CheckCheck className="rf-read-receipt" size={16}/>}</div>
  </article>;
}
function Attachment({en, moment, onClick}: {en:boolean; moment?:boolean; onClick:()=>void}) {
  return <button className="rf-attachment" onClick={onClick}><FileText size={25}/><span><strong>{en ? 'Q2-meeting-agenda.pdf' : moment ? '候補日時のご案内.pdf' : 'Q2進捗共有_アジェンダ案.pdf'}</strong><small>{moment ? '256 KB' : 'PDF · 236 KB'}</small></span><Download size={19}/></button>;
}
