# Lunowa Interaction Specification

## Status

**Current interaction source of truth.**

This document defines behavior that screenshots cannot reliably specify: click semantics, lifecycle transitions, Moment View behavior, Temporal Contract behavior, context preservation, compose/reply flows, search, pinning, menus, account/scope switching, trust fallbacks, and uncertainty handling.

Related sources:

- `docs/design/DESIGN.md` — product/visual design and information architecture.
- `docs/design/RESPONSIVE.md` — layout adaptation across widths.
- `docs/design/references/` — visual references.

---

## 1. Core interaction invariants

These are high-value invariants and should not be changed casually.

### 1.1 Ordinary conversation open

**Clicking the normal body of a conversation row opens that conversation in `会話`.**

Do not force the user through `今の要点` before they can read the thread.

### 1.2 Status-chip open

**Clicking a lifecycle/status chip opens the same conversation in `今の要点`.**

Examples:

- click row body → `会話`
- click `対応が必要` chip → `今の要点`
- click `あとで` chip → `今の要点`
- click `待ち` chip → `今の要点`
- click `完了` chip → `今の要点`

A chip is therefore interactive, not decorative. It must be keyboard focusable and expose an accessible name such as `今の要点を見る`.

### 1.3 One Moment, one main question

`今の要点` should optimize for one current decision. It should generally have one visually primary action, even when the conversation contains multiple Action Items.

### 1.4 Preserve context

Navigation should preserve as much current context as practical:

- selected scope;
- selected list/filter;
- search query and filters;
- selected conversation;
- list scroll position;
- draft contents;
- pane widths;
- whether a secondary panel/preview was open when appropriate.

### 1.5 Do not make AI a gate

Failure or absence of AI interpretation must never block ordinary mail reading, composing, replying, sending, or basic search/navigation.

---

## 2. Conceptual data/interaction model

### 2.1 Conversation

A Conversation groups related communication events/messages.

### 2.2 Action Item

A Conversation can contain zero, one, or many Action Items.

Recommended conceptual shape:

```text
ActionItem {
  id
  goal
  state
  next_owner
  next_action
  deadline
  attention_level
  temporal_contract
  confidence
  risk
  provenance
  related_messages
  related_files
}
```

This is a behavioral contract, not necessarily the exact persistence schema.

### 2.3 Event history

Important lifecycle decisions should be explainable from durable events, for example:

- message received;
- message sent;
- attachment sent;
- user marked complete;
- reply arrived;
- deadline changed;
- scheduled resurfacing fired;
- follow-up sent.

The UI should be able to answer `なぜ今これが出ているのか` from this history when needed.

---

## 3. Lifecycle state semantics

Internal Action Item states:

```text
OPEN
ACTION_REQUIRED
DEFERRED
WAITING
FOLLOW_UP
COMPLETED
UNCERTAIN
```

### 3.1 OPEN

A newly interpreted or insufficiently resolved Action Item before a stronger state is established.

### 3.2 ACTION_REQUIRED

The user currently owes an action.

Typical evidence:

- explicit request directed at the user;
- deadline plus required user action;
- request for confirmation/approval;
- required response not yet performed.

### 3.3 DEFERRED

A known Action Item is intentionally outside current attention because an explicit Temporal Contract defines when/why it returns.

DEFERRED without a reliable return condition is invalid for a meaningful obligation.

### 3.4 WAITING

The user's relevant action has been completed and the next meaningful event is owned by another party or external system.

### 3.5 FOLLOW_UP

The expected reply/event did not arrive by the relevant trigger or threshold and renewed user action is appropriate.

### 3.6 COMPLETED

The current obligation/loop has strong evidence of completion and no active follow-up is required.

Completion must be reversible when new relevant communication reopens the work.

### 3.7 UNCERTAIN

Lunowa cannot safely decide the lifecycle state with enough confidence.

Behavior should fall back toward ordinary mail presentation rather than aggressively hiding or completing the item.

---

## 4. State transitions

These transitions describe intended semantics; implementation may have intermediate technical states.

```text
OPEN
├─> ACTION_REQUIRED
├─> WAITING
├─> COMPLETED
└─> UNCERTAIN

ACTION_REQUIRED
├─> DEFERRED
├─> WAITING
├─> COMPLETED
└─> UNCERTAIN

DEFERRED
├─ trigger fires -> ACTION_REQUIRED
├─ user completes action -> WAITING or COMPLETED
└─ interpretation becomes unsafe -> UNCERTAIN

WAITING
├─ expected positive reply/event -> COMPLETED or ACTION_REQUIRED
├─ timeout/deadline/no-response -> FOLLOW_UP
└─ new request -> ACTION_REQUIRED

FOLLOW_UP
├─ follow-up sent -> WAITING
├─ resolved without send -> COMPLETED
└─ new required action -> ACTION_REQUIRED

COMPLETED
└─ new relevant event -> OPEN / ACTION_REQUIRED / WAITING
```

Do not make state transition merely because a message was opened/read.

---

## 5. AI interpretation boundary

Preferred principle:

> **AI understands; product rules decide state.**

The model should primarily extract structured facts such as:

```text
requested_action
action_owner
deadline
latest_message_intent
completion_signal
reply_expectation
related_event
confidence
provenance
```

Then deterministic/product logic should decide lifecycle state whenever practical.

Hard invariants such as authorization, sending identity, guaranteed scheduler execution, retry semantics, and irreversible/destructive behavior must not depend solely on free-form model output.

### 5.1 Safety bias

The dangerous false negative is:

> real ACTION_REQUIRED → incorrectly hidden as DEFERRED / WAITING / COMPLETED.

Initial behavior should therefore prefer conservative visibility when confidence or completion evidence is weak.

---

## 6. Conversation list interactions

### 6.1 Row body

Click/tap normal row body:

1. select conversation;
2. render Detail;
3. select `会話` tab;
4. preserve the list scroll position.

If the user previously selected `今の要点` manually for that same conversation and then navigates away, do **not** assume the next ordinary row click should inherit `今の要点`. The row-body semantic remains `会話`.

### 6.2 Status chip

Click/tap status chip:

1. select conversation;
2. render Detail;
3. select `今の要点`;
4. focus/scroll to the primary Moment content if needed.

Hover/focus affordance should make interactivity discoverable without making the chip look like a large button.

### 6.3 Pin quick action

Pin is available from:

- Detail header;
- row hover quick action where pointer input exists;
- conversation menu.

Pin toggling must not mutate lifecycle state.

### 6.4 Hover actions

Desktop row hover may expose a small set of high-frequency actions such as:

- Pin;
- Archive;
- Delete;
- More.

Do not show a permanent wall of icons on every row.

### 6.5 Multi-select

If implemented in the initial client, selecting multiple rows enables bulk operations appropriate to mail management, for example:

- mark read/unread;
- archive;
- delete;
- pin/unpin where semantics are clear.

Avoid bulk lifecycle inference changes that could hide required actions without explicit confirmation.

---

## 7. `会話` view

### 7.1 Thread presentation

Display the chronological communication thread with:

- sender;
- recipient context where relevant;
- date/time;
- message body;
- attachments;
- per-message action menu.

Short conversational messages may feel chat-like, but long/HTML mail should render as readable document content rather than tiny speech bubbles.

### 7.2 Quoted history

Because the timeline already shows previous messages, quoted history/signatures should be collapsed or visually de-emphasized when possible.

Users must still be able to expand the original message content.

### 7.3 Reply composer

Keep a reply composer at the bottom of the thread when the user has permission to reply.

Core elements:

```text
From: account ▾

[ reply input ]

attachment / formatting / optional AI assist        Send ▾
```

`From` identity must be explicit in multi-account contexts.

### 7.4 Reply / Reply All / Forward

- normal single-recipient reply should default to Reply;
- Reply All must remain available when multiple relevant recipients exist;
- Forward can be exposed in the message or conversation menu;
- do not silently choose a different sender identity than the account/context indicates.

---

## 8. `今の要点` / Moment View

### 8.1 General structure

A Moment should generally use this order:

1. current state / immediate question;
2. primary Action Item;
3. deadline/return/waiting condition if relevant;
4. one primary action when user action exists;
5. secondary relevant context;
6. additional Action Items;
7. source/provenance disclosure.

Do not blindly reproduce every block in every state. Different states need different density.

### 8.2 ACTION_REQUIRED

Primary question: `今、何をすればいい？`

Example presentation:

```text
今日 17:00まで

銀行口座確認書類を提出

📄 bank-account.pdf

[提出する]

他に2件の対応 >
```

Required behavior:

- deadline visually prominent when known;
- primary action tied to the actual task;
- source available without making provenance the main card;
- if action cannot be performed inside Lunowa, clearly state what opening/hand-off will occur.

### 8.3 DEFERRED

Primary question: `いつ戻る？`

Preferred content:

```text
8月21日 9:00に戻します

田中さんから返信が来れば、
それより先に戻します。

[条件を変更]
```

Do not add a second headline such as `今は忘れて大丈夫` if it competes with the actual return promise.

### 8.4 WAITING

Primary question: `今は誰の番？`

Example:

```text
田中さんの確認待ち

8月21日 10:14に
銀行口座確認書類を送信しました。

返信がなければ
8月24日 9:00に確認します。
```

Usually there is no visually dominant primary CTA.

Secondary action such as `予定を変更` may be available but should not imply the user currently owes work.

### 8.5 FOLLOW_UP

Primary question: `今、何をすればいい？`

Example:

```text
3日返信がありません

最後の送信
8月21日 10:14

確認メールを準備しました

「先日お送りした...」

[送信]
[編集]
```

Sending must still require normal user confirmation unless a separately validated automation mode is explicitly introduced later.

After the follow-up is successfully sent, transition the relevant Action Item to WAITING and update the Temporal Contract/history.

### 8.6 COMPLETED

Primary question: `もう何もしなくていい？`

Example:

```text
✓ 完了

銀行口座書類の提出

8/21 提出
8/22 田中さん確認

対応はありません。
```

Completed presentation should be quiet, reassuring, and low-action.

### 8.7 UNCERTAIN

Do not invent certainty.

Preferred behavior:

- retain access to ordinary `会話`;
- explain minimally that Lunowa could not determine the next action safely;
- offer `原文を見る` / `状態を設定` or similar user correction;
- do not auto-hide.

---

## 9. Multiple Action Items

### 9.1 Primary selection

When multiple unresolved Action Items exist, choose one primary Moment based on product rules such as:

1. critical/overdue user-owned obligation;
2. nearest user-owned deadline;
3. blocking obligation;
4. otherwise highest-attention unresolved user obligation.

Do not simply choose the newest message.

### 9.2 Additional-item presentation

Example:

```text
今日まで
本人確認書類を提出

📄 license.pdf

[提出する]

────────
他に2件
✓ 銀行口座書類    田中さん待ち
◷ 勤務希望日      8/25に戻る
```

Selecting a secondary item may expand its details or make it the active Moment, but the default screen should remain simple.

---

## 10. Temporal Contract interactions

### 10.1 Create/modify

A user may explicitly defer an Action Item/conversation or Lunowa may propose a defer/waiting contract.

The UI must communicate the actual return condition before relying on it.

### 10.2 Initial trigger types

Supported product semantics should begin with:

- exact/scheduled time;
- reply received;
- deadline approaching/threshold.

Do not expose a complex rule builder in v1.

### 10.3 Trigger semantics

When any active return trigger fires:

1. re-evaluate the relevant Action Item;
2. update lifecycle state;
3. determine the appropriate attention level;
4. surface it in the relevant list/state;
5. optionally notify only if notification policy requires it.

A trigger does not automatically mean `send a notification`.

### 10.4 Resurfacing strength

Use a conceptual attention ladder:

```text
Level 0 — state update only
Level 1 — quiet visibility in relevant list
Level 2 — move into attention-required list
Level 3 — user notification
```

Notification policy is a separate concern from lifecycle state. Do not make every return event a disruptive alert.

### 10.5 Missed execution

If Lunowa detects that a promised return time was missed because of downtime/sync/provider issues, surface recovery clearly rather than pretending the promise was met.

---

## 11. Compose new mail

### 11.1 Entry

`＋ 新規メール` must be a prominent sidebar action.

Desktop behavior:

- keep Sidebar and Conversation List visible;
- switch Detail into new-compose mode;
- do not navigate to a disconnected full-page form.

### 11.2 Fields

New compose includes:

- From;
- To;
- Cc/Bcc progressive disclosure;
- Subject;
- body;
- attachments;
- formatting;
- signature;
- Send;
- Send Later;
- draft state;
- minimize/restore;
- safe close.

### 11.3 Draft autosave

Draft persistence should begin quickly and continue while composing.

Closing/minimizing must never silently discard meaningful input.

If autosave fails, inform the user before destructive navigation when possible.

### 11.4 Minimize

A compose draft can be minimized so the user can inspect mail without losing the draft. The minimized draft should remain recoverable until sent/discarded.

### 11.5 Send Later

The send dropdown may expose:

- common suggested times;
- choose date/time.

The UI must clearly distinguish **Send Later** from `あとで` lifecycle deferral; one schedules outgoing mail, the other manages attention on a communication/action.

### 11.6 Undo Send

If supported, after send show a transient undo affordance for the configured window.

Undo behavior must be backed by actual send-delay semantics, not a fake UI after the provider has irreversibly accepted the mail.

---

## 12. Inline completion / AI assist

### 12.1 Ghost text

Inline completion may show a lightweight continuation at the cursor.

Rules:

- never trigger during active Japanese IME composition;
- only appear after composition commit and sufficient pause/context;
- user can accept with a clear action/keyboard gesture;
- typing continues normally when ignored;
- repeated rejection reduces suggestion frequency;
- suggestions must not obscure existing text.

### 12.2 Full AI assist

AI assist may provide drafting/rewrite actions, but ordinary typing remains primary.

Do not make the composer a chatbot.

---

## 13. Search interactions

### 13.1 Enter search mode

Focusing/typing into search updates the center pane into search results while Detail remains available.

Search should not destroy the pre-search list/filter state.

### 13.2 Result categories

Potential categories:

```text
すべて | 会話 | 人 | ファイル
```

### 13.3 Result click

- Conversation result → open `会話` by default.
- Message hit → open conversation and scroll/highlight the matched message.
- Person result → open person context panel/sheet.
- File result → open attachment preview in context.

### 13.4 Exit search

Closing/clearing search restores the previous:

- scope;
- filter;
- list scroll position where practical;
- selected conversation when still valid.

### 13.5 Scope

Search defaults to current scope. Broadening to `全体` must be visible and user-directed.

---

## 14. Person/company context panel

### 14.1 Entry

Possible entry points:

- avatar;
- sender/person name;
- company link;
- person search result.

### 14.2 Behavior

Desktop: open as a right-side side sheet/secondary panel when width allows.

It must not replace the selected conversation by default.

### 14.3 Sections

Useful sections can include:

- current status/issues;
- recent topics;
- remembered facts;
- organization/role;
- recent files;
- related conversations.

Facts inferred by AI should expose provenance on demand.

### 14.4 Non-goal

Do not introduce CRM pipeline/stage/deal management unless explicitly designed later.

---

## 15. Attachment preview

### 15.1 Entry

Clicking a supported attachment opens an in-app preview while preserving thread context.

### 15.2 Controls

For PDF/image-like previews, provide relevant controls such as:

- close;
- page navigation;
- zoom;
- download;
- open externally/new tab.

### 15.3 Unsupported/failed preview

If preview fails:

- keep the conversation available;
- offer download/open externally;
- do not blank the entire Detail pane.

---

## 16. Navigation and menus

### 16.1 Sidebar `その他`

Recommended secondary destinations:

- 下書き;
- 送信済み;
- 送信予定;
- アーカイブ;
- 迷惑メール;
- ゴミ箱;
- 完了 if not top-level.

### 16.2 Conversation-level `…`

Recommended commands:

- 未読にする / 既読にする;
- ピン留め / ピンを外す;
- 転送;
- 印刷;
- アーカイブ;
- 削除;
- 迷惑メールとして報告;
- 送信者をブロック.

### 16.3 Individual-message `…`

Recommended commands:

- 原文を表示;
- このメッセージを転送;
- 印刷;
- ヘッダー詳細.

Do not conflate thread-level deletion/archive with single-message actions where provider semantics differ.

### 16.4 Destructive actions

Use confirmation only where the cost of accidental action justifies it. Prefer undo for reversible operations such as archive/delete when reliable.

---

## 17. Scope/account interactions

### 17.1 Scope means WHERE

Scope answers **where to look**.

Lifecycle/search filters answer **what to look at**.

Do not mix these concepts in the same control.

### 17.2 Scope switcher

User-facing examples:

```text
💼 仕事 ✓
🏠 個人
🎓 大学
────────
◎ 全体
＋ 新しく分ける
```

A one-account user should not be forced to understand scope/grouping concepts.

### 17.3 Second account

After connecting a second account, offer a lightweight choice such as:

- `一緒に見る`
- `分けて使う`
- decide later.

Do not require organization decisions during each OAuth flow.

### 17.4 Account problems

Reconnect/error state should be isolated to the affected account. Other connected accounts should remain usable.

### 17.5 Sending identity

Compose/reply must show the effective sending account. If changing sender identity changes recipients/signature/provider behavior, the UI should update before send and prevent ambiguous state.

---

## 18. Onboarding interactions

### 18.1 Minimal first run

Preferred path:

```text
Googleで始める / Microsoftで始める
→ provider authorization/account picker
→ initial sync begins
→ Inbox becomes usable as soon as practical
```

### 18.2 Progressive permission

Do not ask for unrelated permissions or preferences up front merely because they may be useful later.

Ask contextually when a feature actually needs them.

### 18.3 Background sync

After an account connects, synchronization can proceed in background while the shell becomes usable. Use visible but non-blocking sync status.

---

## 19. System/error/offline interactions

### 19.1 General rule

Communicate:

1. what happened;
2. what is affected;
3. what the user can do now.

Technical error codes belong in details/logging, not the primary message.

### 19.2 Loading

Before cached data exists, show a restrained loading state.

After cached data exists, prefer showing existing content with a syncing indicator over replacing it with a giant spinner.

### 19.3 New incoming mail

Do not unexpectedly jump the list and cause the user to lose position.

Prefer a small affordance such as `新しいメール3件` that lets the user refresh/scroll intentionally.

### 19.4 Offline

When possible, offline mode should allow:

- reading cached mail;
- browsing cached conversations;
- editing drafts;
- preparing replies.

Actions requiring network should clearly queue or fail safely according to runtime support.

### 19.5 Send failure

A failed send must preserve the draft and recipient/attachment context.

Offer retry and safe draft save. Never clear the composer merely because a request failed.

### 19.6 AI failure

Fall back to raw conversation/basic mail UI. Do not block the user's work.

### 19.7 App update

Do not force a reload that destroys an active draft. Defer reload/update prompts until user work is safe.

---

## 20. Pane resizing

Desktop pane boundaries should support horizontal dragging.

Expected behavior:

- minimum widths prevent unusable layouts;
- maximums prevent one pane from swallowing the application;
- preferred widths persist locally/user-preference storage where appropriate;
- double-clicking a resize handle may reset to defaults;
- responsive collapse can temporarily override stored widths;
- when space returns, restore the user's preferred widths where practical.

Resizable panes and responsive collapse are separate mechanisms.

---

## 21. Keyboard and accessibility behavior

Primary desktop controls must be reachable by keyboard.

At minimum:

- visible focus states;
- Enter/Space activation where semantically appropriate;
- Escape closes transient popovers/sheets/previews when safe;
- Tab order follows visual/logical order;
- status chips are actual interactive controls;
- icon-only controls expose accessible names/tooltips.

Optional productivity shortcuts can be added later, but should not be required for ordinary use.

---

## 22. Interaction verification checklist

Before considering the high-fidelity interaction slice complete, verify at least:

- row body opens `会話`;
- status chip opens `今の要点`;
- user can switch tabs without losing thread state;
- all lifecycle Moment states render correctly;
- multiple Action Items retain one primary action;
- pin remains independent of lifecycle state;
- compose draft survives minimize/restore;
- send account is explicit;
- search exits back to previous list context;
- attachment preview closes back to the same thread;
- person panel does not destroy selected conversation;
- send failure preserves draft;
- AI failure leaves core mail usable;
- pane resizing respects minimums;
- keyboard focus is visible and logical.

---

## 23. Default decision rule

When behavior is not explicitly specified, choose the simplest familiar interaction that:

1. preserves the user's place;
2. reduces management burden;
3. keeps the source mail accessible;
4. is reversible where practical;
5. avoids surprising cross-account/scope behavior;
6. does not require AI to function.