# Lunowa Interaction Specification

## Status

**Current interaction source of truth, reconciled with Responsibility v0.1 semantics.**

This document defines behavior screenshots cannot reliably specify: click semantics, Responsibility projection/Moment behavior, Temporal Contract behavior, context preservation, compose/reply flows, search, pinning, menus, account/scope switching, trust fallbacks, and uncertainty handling.

Responsibility/domain semantics come from:

- `docs/product/responsibility/README.md`;
- `docs/product/responsibility/DECISIONS.md`;
- `docs/product/responsibility/CONSISTENCY-AUDIT.md`.

Related UX sources:

- `docs/design/DESIGN.md`;
- `docs/design/RESPONSIVE.md`;
- visual references under `docs/design/references/`.

This document may use simple user-facing buckets such as `My Turn / Waiting / Later / Done / Review`. Those are **projections**, not one canonical lifecycle enum.

---

## 1. Core interaction invariants

### 1.1 Ordinary conversation open

Clicking the normal body of a conversation row opens that Conversation in `会話`.

Do not force the user through `今の要点` before they can read the source thread.

### 1.2 Responsibility/status-chip open

Clicking an interactive responsibility/status chip opens the same Conversation in `今の要点`.

Examples:

- row body → `会話`;
- `対応が必要` / My Turn chip → `今の要点`;
- `あとで` / Later chip → `今の要点`;
- `待ち` / Waiting chip → `今の要点`;
- `完了` / Done chip → `今の要点`;
- `確認` / Review chip → `今の要点`.

Chip is interactive, keyboard-focusable, and exposes an accessible name such as `今の要点を見る`.

### 1.3 One Moment, one main question

`今の要点` optimizes for one current decision. It generally has one visually primary action even when the Conversation contains multiple Responsibilities or one Responsibility contains multiple obligation legs.

### 1.4 Preserve context

Navigation should preserve, where practical:

- selected Scope;
- selected list/filter;
- search query/filters;
- selected Conversation;
- list scroll position;
- draft contents;
- pane widths;
- open secondary panel/preview.

### 1.5 Do not make AI a gate

AI failure/absence never blocks ordinary reading, composing, replying, sending, basic search, or navigation.

---

## 2. Conceptual interaction model

### 2.1 Conversation

A Conversation groups related communication evidence/messages.

It may contain zero, one, or many Responsibilities.

### 2.2 Responsibility

A Responsibility is a communication-bounded operational obligation/expected-outcome loop.

The UI does not need to expose the internal term `Responsibility` everywhere; user copy may say `対応`, `要点`, `待ち`, etc.

Conceptually relevant dimensions include:

```text
operational outcome
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
uncertainty/risk
provenance
```

Do not rebuild a single internal lifecycle state from the user-facing buckets.

### 2.3 Event/evidence history

Important decisions remain explainable from durable evidence/events, for example:

- message received/sent;
- provider send reconciled/ambiguous;
- attachment/provider fact observed;
- user field correction;
- user tracking close/reopen;
- counterpart reply/closure;
- source due corrected;
- Temporal Contract trigger fired;
- follow-up sent;
- Responsibility reopened/superseded.

The UI should be able to answer `なぜ今これが出ているのか` when needed.

---

## 3. User-facing Responsibility projections

The main interaction buckets are deterministic projections over canonical Responsibility state:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

These are not persisted lifecycle truth.

### 3.1 MY_TURN / 対応が必要

Use when at least one currently actionable material USER obligation leg exists and no higher-priority review/safety condition should take over.

Examples:

- explicit document submission request;
- confirmation/decision needed;
- follow-up action becomes due;
- conditional user action becomes actionable after trusted condition evidence.

### 3.2 WAITING / 待ち

Use when the Responsibility remains open but no current user action is required and the next meaningful work/event belongs to another party/external event.

Examples:

- user sent required draft; counterpart confirmation is expected;
- legal approval/resume event is pending;
- user completed one parallel leg and another required signer remains.

A communication hold blocked on another party/event ordinarily projects `WAITING`.

### 3.3 LATER / あとで

Use only when the item is intentionally deferred from current attention under an explicit/validated return condition.

```text
communication hold != product defer
```

Do not use `LATER` merely because current action is blocked on someone else.

### 3.4 DONE / 完了

Use when the tracked Responsibility is resolved.

`Done` does not mean every resolution was successful satisfaction. Reasons may include satisfied, declined, cancelled, superseded, user-closed, invalidated, or duplicate.

The UI may show different explanatory copy when the reason matters.

### 3.5 REVIEW / 確認

Use when a decision-critical field/identity/safety question cannot be resolved safely enough for a normal deterministic projection.

Examples:

- conflicting material due dates with unknown override authority;
- ambiguous assignment;
- completion claim conflicts with provider evidence;
- high-risk request whose legitimacy/authority is unverified;
- decision-critical sarcasm/pragmatic ambiguity.

`REVIEW` does not necessarily mean Responsibility admission itself was uncertain. A definitely tracked Responsibility may project Review because one critical field is conflicted.

### 3.6 NONE

Use when there is no admitted live Responsibility to surface.

Historical apparent open loops may remain semantically unresolved but inactive, producing `NONE` or conservative review rather than automatic `MY_TURN`.

---

## 4. Projection changes and transition interaction semantics

Projection may change as evidence/state dimensions change; do not treat the bucket itself as the domain transition record.

Examples:

```text
USER leg actionable
-> MY_TURN

USER send reconciled; OTHER confirmation remains
-> WAITING

follow-up trigger; no reply
-> MY_TURN (reason = follow up)

reminder send reconciled; OTHER reply expected
-> WAITING

user intentionally snoozes actionable work
-> LATER

return trigger fires; work still actionable
-> MY_TURN

Responsibility resolves
-> DONE
```

Do not transition merely because a message/attachment was opened/read.

One evidence event may affect multiple Responsibilities. UI should render the resulting projections; it must not assume “one message changes one item.”

---

## 5. AI interpretation boundary

Preferred principle:

> **AI understands; trusted product rules decide accepted Responsibility state.**

AI may propose/extract:

```text
communication acts
speaker / obligation bearer candidates
requested action/event/object
modality / obligation strength
proposed terms
source temporal expressions
completion/correction/cancellation signals
uncertainty
provenance
```

Trusted product/domain logic decides admission, identity/effects, actionability, safety policy, and projection.

Hard invariants such as authorization, sending identity, scheduler guarantees, retries, provider facts, and high-impact side effects never depend solely on free-form/model output.

### 5.1 Safety bias without review spam

The dangerous failure is a real material user obligation being hidden as Done/Waiting/Later/NONE without adequate evidence.

However, sending everything to Review is also product failure. Ask the user only when uncertainty is decision-critical/material and cannot be resolved more cheaply/safely.

---

## 6. Conversation list interactions

### 6.1 Row body

1. select Conversation;
2. render Detail;
3. select `会話`;
4. preserve list scroll position.

Ordinary row semantics remain `会話` even if the user previously viewed `今の要点` for another row.

### 6.2 Status/projection chip

1. select Conversation;
2. render Detail;
3. select `今の要点`;
4. focus/scroll primary Moment content if needed.

### 6.3 Pin quick action

Available from Detail header, desktop hover action, and Conversation menu where appropriate.

Pin never mutates Responsibility state.

### 6.4 Hover actions

Desktop may expose a restrained set such as Pin, Archive, Delete, More.

Do not render a permanent wall of icons.

### 6.5 Multi-select

Bulk operations may include read/unread, archive, delete, pin/unpin where clear.

Avoid bulk Responsibility inference/state changes that could hide material work without explicit trustworthy semantics.

---

## 7. `会話` view

### 7.1 Thread presentation

Show chronological communication with sender, recipient context, timestamp, body, attachments, and per-message menu.

Short mail may feel chat-like; long/HTML content should remain readable document-like mail.

### 7.2 Quoted history

Collapse/de-emphasize repeated quoted history/signatures where practical while preserving access to original content.

### 7.3 Reply composer

Keep reply composer near thread bottom when user can reply.

```text
From: account ▾

[ reply input ]

attachment / formatting / optional AI assist        Send ▾
```

`From` is explicit in multi-account contexts.

### 7.4 Reply / Reply All / Forward

- default ordinary single-recipient reply to Reply;
- keep Reply All available when relevant;
- Forward available from message/conversation menu;
- never silently switch sender identity.

---

## 8. `今の要点` / Moment View

### 8.1 General structure

Typical order:

1. current question/projection;
2. primary Responsibility/obligation;
3. due/return/waiting condition when relevant;
4. one primary action when user action exists;
5. safety/review explanation when material;
6. supporting context;
7. additional Responsibilities;
8. source/provenance disclosure.

Do not reproduce every block in every state.

### 8.2 MY_TURN

Primary question: `今、何をすればいい？`

Example:

```text
今日まで

本人確認書類の裏面を提出

📄 license.pdf

[提出する]

他に2件 >
```

Behavior:

- show source due prominently when known;
- primary action is tied to the **safe product action**, not blindly the sender's requested external action;
- source/provenance remains accessible;
- external hand-off is explained when action cannot occur inside Lunowa.

For high-risk requests, the primary action may be `確認する` / `依頼を検証` rather than `支払う` or `承認する`.

### 8.3 LATER

Primary question: `いつ戻る？`

Example:

```text
8月27日 9:00に戻します

返信が先に来れば、その時点で再確認します。

[条件を変更]
```

UI communicates the actual return condition.

Source due remains separate from user target/resurface time.

### 8.4 WAITING

Primary question: `今は誰/何を待っている？`

Example:

```text
田中さんの確認待ち

8月24日 10:14に資料を送信済み

返信がなければ 8月27日に再確認
```

Usually no visually dominant work CTA. Secondary `予定を変更` is acceptable but must not imply the user currently owes the underlying work.

### 8.5 Follow-up inside MY_TURN

`FOLLOW_UP` is not a canonical lifecycle bucket.

When a waiting trigger makes renewed user action appropriate, `MY_TURN` may render:

```text
3日返信がありません

確認メールを準備しました

[送信]
[編集]
```

Sending still requires normal human confirmation unless a separately validated automation mode exists.

After reconciled follow-up send, if the original outcome remains with the counterpart, projection returns to `WAITING`.

### 8.6 DONE

Primary question: `もう何もしなくていい？`

Example satisfied case:

```text
✓ 完了
契約書提出
8/24 送信
8/25 受領確認
```

If resolution reason is cancellation/decline/user-close/superseded, use truthful explanatory copy rather than pretending successful completion.

### 8.7 REVIEW

Do not invent certainty.

Preferred behavior:

- keep `会話` accessible;
- state the minimal decision-critical uncertainty;
- show relevant conflicting/source evidence;
- offer one minimal correction/decision when needed;
- avoid auto-hiding.

Examples:

```text
期限が2つ記載されています
金曜 — Aさん
月曜 — Bさん

[原文を見る]
```

or high-risk:

```text
100万円の支払い依頼
送信者の権限を確認できません

[依頼を確認]
```

Do not ask about harmless non-critical uncertainty merely to make the model internally neat.

---

## 9. Multiple Responsibilities / obligation legs

### 9.1 Primary Moment selection

When multiple unresolved Responsibilities exist, prefer:

1. critical/overdue actionable USER obligation;
2. nearest material USER source due;
3. blocking USER obligation;
4. highest-attention unresolved USER work;
5. material Review condition when it blocks safe action;
6. otherwise appropriate Waiting/Later state.

Do not simply choose newest message.

### 9.2 Multiple obligation legs inside one Responsibility

If both USER and another party must sign:

```text
USER leg open + Tanaka leg open
-> MY_TURN

USER leg satisfied + Tanaka leg open
-> WAITING
```

Do not show `BOTH` as if it fully explains the state.

### 9.3 Additional-item presentation

Example:

```text
今日まで
本人確認書類を提出

[提出する]

────────
他に2件
◷ 契約署名    田中さん待ち
◷ 勤務希望日  8/27に戻る
```

Selecting a secondary item may expand it/make it active Moment while keeping default screen simple.

---

## 10. Temporal Contract interactions

### 10.1 Create/modify

User may explicitly defer a Responsibility or Lunowa may propose an attention/waiting contract according to validated policy.

UI states the real return condition before relying on it.

### 10.2 Initial trigger types

Start with:

- exact/scheduled time;
- relevant reply received;
- deadline approaching/threshold.

Do not expose a generic rule builder in v1.

### 10.3 Trigger semantics

When a trigger fires:

1. reload/re-evaluate current Responsibility/evidence;
2. ignore stale/cancelled contract state;
3. update actionability/attention/projection if warranted;
4. surface in relevant list;
5. notify only if separate notification policy warrants it.

### 10.4 Resurfacing strength

```text
Level 0 — state update only
Level 1 — quiet visibility
Level 2 — attention list
Level 3 — notification
```

### 10.5 Missed execution

If a promised return was missed due to downtime/sync/provider problems, show recovery honestly rather than pretending the promise was met.

---

## 11. Compose new mail

### 11.1 Entry

`＋ 新規メール` is a prominent sidebar action.

Desktop keeps Sidebar/Conversation List visible and switches Detail into compose mode rather than navigating to a disconnected page.

### 11.2 Fields

Include From, To, progressive Cc/Bcc, Subject, body, attachments, formatting, signature, Send, Send Later, draft state, minimize/restore, safe close.

### 11.3 Draft autosave

Begin quickly and continue while composing.

Closing/minimizing never silently discards meaningful input. Surface autosave failure before destructive navigation when practical.

### 11.4 Minimize

Draft remains recoverable while user inspects mail.

### 11.5 Send Later

Clearly distinguish:

```text
Send Later = schedule outgoing mail
Later = defer Responsibility attention
```

### 11.6 Undo Send

Undo affordance must be backed by real pre-provider delay/cancellation semantics, not fictional recall after irreversible provider acceptance.

---

## 12. Send-result interaction

A click on Send is not authoritative evidence that provider accepted the message.

During ambiguous provider result:

- preserve draft/send context;
- avoid blind duplicate retry;
- show guarded pending/reconciliation state when necessary;
- do not move a Responsibility to Done solely from the send click.

After provider reconciliation, Responsibility projection changes only if that send satisfies the relevant obligation leg/closure condition.

---

## 13. Inline completion / AI assist

### 13.1 Ghost text

- never interrupt active Japanese IME composition;
- appear only after composition commit and sufficient pause/context;
- acceptance gesture is clear;
- ignored suggestions do not block typing;
- repeated rejection reduces frequency;
- suggestions do not obscure text.

### 13.2 Full AI assist

AI may draft/rewrite, but ordinary writing remains primary. Do not turn composer into a mandatory chatbot.

Material dates/amounts/recipients/commitments must not be silently rewritten from ambiguous source intent.

---

## 14. Search interactions

### 14.1 Enter search

Search updates center pane while preserving Detail/pre-search state where practical.

### 14.2 Categories

Potential categories:

```text
すべて | 会話 | 人 | ファイル
```

Responsibility/action search result may exist only when intentionally designed and must resolve to authorized source records.

### 14.3 Result click

- Conversation → open `会話`;
- Message hit → open/jump/highlight in Conversation;
- Person → context panel;
- File → attachment preview in context;
- explicit Responsibility/action result → may open `今の要点`.

### 14.4 Exit

Restore previous Scope/filter/scroll/selection where practical.

### 14.5 Scope

Search defaults to current Scope. Broadening to `全体` is visible/user-directed.

---

## 15. Person/company context panel

Entry from avatar/name/company/person search result.

Desktop may use right-side sheet when width permits; do not replace selected Conversation by default.

Useful sections: current relevant issues, recent topics, evidence-backed remembered facts, organization/role, recent files, related Conversations.

AI-inferred material facts expose provenance on demand.

No CRM pipeline/stage/deal semantics without separate product decision.

---

## 16. Attachment preview

Click supported attachment to open in-app preview while preserving thread context.

Controls may include close, page nav, zoom, download, open externally.

If preview fails, keep Conversation and offer safe alternatives.

Opening/previewing an attachment is not automatically Responsibility completion evidence.

---

## 17. Navigation and menus

### 17.1 Sidebar `その他`

Recommended secondary destinations:

- 下書き;
- 送信済み;
- 送信予定;
- アーカイブ;
- 迷惑メール;
- ゴミ箱;
- 完了 if not top-level.

### 17.2 Conversation `…`

Potential commands: unread/read, pin/unpin, forward, print, archive, delete, spam, block sender.

### 17.3 Message `…`

Potential commands: show original, forward message, print, headers/details.

Do not conflate thread-level and single-message operations where provider semantics differ.

### 17.4 Destructive actions

Confirm only when accidental-cost justifies it. Prefer reliable undo for reversible operations.

---

## 18. Scope/account interactions

### 18.1 Scope means WHERE

Scope answers **where**. Responsibility/search filters answer **what**.

### 18.2 Scope switcher

```text
💼 仕事 ✓
🏠 個人
🎓 大学
────────
◎ 全体
＋ 新しく分ける
```

One-account user should not be forced to understand grouping.

### 18.3 Second account

Offer lightweight `一緒に見る / 分けて使う / 後で` rather than requiring organization decisions during OAuth.

### 18.4 Account problem

Reconnect/error isolates to affected account where possible.

### 18.5 Sending identity

Compose/reply shows effective sending account. Changing it updates recipients/signature/provider behavior before send and prevents ambiguity.

Cross-account semantic lookalikes do not auto-merge Responsibilities.

---

## 19. Onboarding interactions

Preferred first-run:

```text
Googleで始める / Microsoftで始める
→ provider authorization/account picker
→ initial sync
→ Inbox usable as soon as practical
```

Use progressive permissions; do not ask for unrelated access/preferences up front.

### Historical initial sync

Years-old apparent unresolved requests must not automatically flood live `My Turn`.

Historical candidates may be ignored, quietly surfaced, or explicitly activated according to validated product policy; user tracking-close does not imply objective satisfaction.

---

## 20. System/error/offline interactions

Communicate:

1. what happened;
2. what is affected;
3. what user can do now.

### Loading/sync

Prefer existing cached content plus sync status over replacing everything with a spinner.

### New mail

Do not unexpectedly jump list position; use `新しいメールN件` or equivalent.

### Offline

When supported, allow cached reading/browsing and draft preparation. Network-required actions queue/fail according to actual runtime capability.

### Send failure/ambiguity

Preserve draft/recipient/attachment context. Distinguish known failure from ambiguous acceptance; avoid blind duplicate retry.

### AI failure

Fall back to raw Conversation/basic mail. Existing accepted Responsibility state should not randomly rewrite on view-open.

### App update

Never destroy active draft through forced reload.

---

## 21. Pane resizing

Desktop boundaries support horizontal drag with sensible min/max widths, persistence of preferred widths, optional double-click reset, and responsive collapse independent of stored preference.

---

## 22. Keyboard and accessibility

Primary controls must be keyboard reachable with visible focus, logical Tab order, Enter/Space activation where appropriate, Escape for transient surfaces when safe, accessible icon labels/tooltips, and interactive status chips implemented as real controls.

Optional productivity shortcuts can come later.

---

## 23. Interaction verification checklist

Before a high-fidelity slice is considered complete, verify at least:

- row body opens `会話`;
- status/projection chip opens `今の要点`;
- tab switching preserves context;
- My Turn / Waiting / Later / Done / Review Moments render correctly from projection semantics;
- follow-up renders as a My Turn action, not a separate canonical lifecycle requirement;
- communication hold renders Waiting unless separately deferred;
- multiple Responsibilities still produce one primary Moment;
- parallel obligation legs move My Turn → Waiting after user leg completion without resolving prematurely;
- Review can represent field-level conflict while the Responsibility remains tracked;
- high-risk requested action can surface a safer verify/decide CTA;
- source due, user target, and resurface time are visually distinguishable where relevant;
- historical initial-sync candidates do not auto-flood My Turn;
- pin stays independent of Responsibility state;
- compose draft survives minimize/restore;
- sending account is explicit;
- ambiguous send preserves safe pending/reconciliation behavior;
- search returns to previous context;
- attachment preview returns to same thread and does not imply completion;
- person panel preserves selected Conversation;
- send failure preserves draft;
- AI failure leaves core mail usable;
- pane resizing respects bounds;
- keyboard focus is visible/logical.

---

## 24. Default decision rule

When behavior is unspecified, choose the simplest familiar interaction that:

1. preserves the user's place;
2. reduces Communication Management Burden;
3. keeps source mail/evidence accessible;
4. is reversible where practical;
5. avoids surprising cross-account/scope behavior;
6. does not require AI for core mail access;
7. does not turn uncertainty into unnecessary user questioning;
8. does not confuse UI projection with canonical Responsibility truth.