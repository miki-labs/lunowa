# Lunowa v1 UI Implementation Contract

## Status / authority

**Implementation-facing UI/UX contract for the current v1 Minimum Complete Delegation Loop.**

This file makes the accepted Product/design behavior sufficiently concrete for implementation. It is subordinate to:

1. `docs/product/PRODUCT.md` — highest-level Product authority;
2. `docs/product/PRODUCT-CONTENT.md` — detailed Product operating authority;
3. `docs/product/responsibility/` — FIXED Responsibility semantic authority;
4. `docs/product/GOLDEN-SCENARIO-BANK.md` — Product-level observable acceptance consequences;
5. `DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` — canonical design/interaction/responsive meaning.

This contract owns **implementation-facing composition, screen inventory, material view states, navigation/focus behavior, visual tokens, accessibility requirements, UI read-model boundaries and acceptance mapping**.

It does not create a domain lifecycle, schema/table, authorization model, provider contract or empirical Product finding.

If implementation convenience conflicts with Product/Responsibility truth, implementation convenience loses.

Evidence/rationale: `../product/research/issue-55-ui-ux-evidence-2026-08-28.md`.

---

# 1. Design objective

Lunowa's interface should make one promise legible:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The UI is successful when it reduces:

- monitoring;
- repeated source checking;
- context reconstruction;
- unnecessary navigation;
- routine approval/questions;

while preserving:

- source/provenance;
- current system integrity;
- explicit sender/action authority;
- correction and stop controls;
- truthful failure/recovery.

Do not optimize the UI for unread processing, visible AI activity, dashboard density, or feature discovery at the expense of this promise.

---

# 2. Non-negotiable presentation separations

The UI must preserve these distinctions visibly enough that implementation cannot collapse them:

```text
Source evidence
!= AI interpretation
!= accepted Responsibility state
!= safe next action
!= UI projection

message arrival
!= attention event

monitoring state
!= delivery/notification state

provider mailbox state
!= Responsibility state

local user intent/request pending
!= server/domain accepted change

Send click/request
!= provider-reconciled acceptance
!= Responsibility closure
```

No badge, color, animation or component name may silently redefine those boundaries.

---

# 3. Current v1 navigation model

## 3.1 Primary jobs

Primary navigation exposes Product jobs, not every projection:

1. **ホーム** — current attention composition;
2. **対応が必要** — admitted current USER work;
3. **管理中** — quiet delegated monitoring inspection;
4. **確認** — material Review, only when populated/materially useful;
5. **会話** — Source Conversations;
6. **検索** — exact Source search / accepted operational retrieval capability;
7. **設定** — supported persistent controls only.

`待ち`, `あとで`, `完了` are filters/details/projections, not required permanent top-level destinations.

`ピン留め` may exist as secondary retrieval if activated by a later implementation task, but it is not a Product-completion blocker solely because historical visual references show it.

## 3.2 Navigation visibility

- Home, Needs You, Managed, Source remain always reachable after account connection.
- Review is visible in global navigation only when one or more current Review subjects exist, or when the user is already inside Review and needs stable orientation.
- Search remains globally reachable; it need not consume a permanent full-width nav row on compact layouts.
- Settings is secondary and should not compete with daily attention surfaces.
- unread/source counts never become the primary global badge.
- Managed count is reassurance/inspection information, not a red attention badge.

## 3.3 URL/deep-link direction

The selected Product surface and selected detail should be representable in navigation history/deep link where practical.

Recommended route families:

```text
/[locale]/home
/[locale]/needs-you
/[locale]/needs-you/[id]
/[locale]/managed
/[locale]/managed/[id]
/[locale]/review
/[locale]/review/[id]
/[locale]/source
/[locale]/source/[conversationId]
/[locale]/search?q=...
/[locale]/settings/...
```

The exact internal identifier shape is not authorized here. The route must not imply `Conversation id == Responsibility id`.

Browser Back on compact layouts restores the exact prior surface/query/list selection/scroll position where practical.

---

# 4. Global shell

## 4.1 Wide model

```text
Navigation | Surface/List | Detail | optional contextual supporting pane
```

The fourth supporting pane is **never permanent by default**. It is user-opened/contextual for Source/provenance, attachment or person context on sufficiently large windows.

## 4.2 Pane roles

### Navigation

Stable Product orientation.

### Surface/List

Object depends on current job:

- Home attention composition or compact summary;
- Needs You attention items;
- Managed items when intentionally inspecting;
- Review questions;
- Source Conversations;
- Search results.

### Detail

- Moment;
- Managed monitoring detail;
- Review interaction;
- Source Conversation;
- search result detail;
- contextual composer embedded with relevant context.

### Supporting pane

Optional contextual evidence only. It must never steal the minimum width needed to read/act on Detail.

## 4.3 Empty detail placeholder

When list + detail are simultaneously visible and nothing is selected, show a quiet job-specific placeholder rather than an arbitrary first item if automatic selection would surprise the user.

Examples:

- Needs You: `対応する項目を選んでください`;
- Source: `会話を選んでください`;
- Search before query: no empty detail required.

Home may directly select the first high-attention item only if the task contract later proves that behavior is preferable; it is not required by this contract.

---

# 5. Responsive/adaptive layout contract

## 5.1 Content-fit first

Use available application window width and actual content fit. Do not branch on `isTablet`, user-agent device class or screenshot labels.

Initial implementation thresholds remain guidance, not semantic truth:

```text
>= 1440px       Wide three-pane
1180–1439px     Compact three-pane
900–1179px      Rail + list + detail
720–899px       Two-pane
< 720px         Single-pane
```

Collapse earlier when Japanese copy, zoom, text scaling, split-screen or browser chrome makes minimum content widths fail.

## 5.2 Very large windows

At approximately `>= 1600px`, the implementation may allow a **user-invoked** supporting context pane while retaining readable Detail width.

Do not convert extra pixels into a permanent fourth dashboard column.

## 5.3 State preservation

Across resize/orientation/layout-stage changes preserve where practical:

- current Product surface;
- selected Responsibility/Review/Conversation/result;
- list/query/filter/scroll state;
- open Moment/Source association;
- active draft body/recipients/attachments/from account;
- async send/reconciliation state;
- open attachment/person/provenance context;
- user-adjusted desktop pane width.

A layout transition must never discard meaningful draft/input.

## 5.4 Compact-detail priority

When a multi-pane layout collapses while Detail is active, keep Detail active and make Back return to the prior list.

When a list-only compact view expands, show list + either the previously selected Detail or a quiet placeholder.

---

# 6. Screen inventory

Current v1 CORE / release-required UI surfaces are accounted for by the following screen families.

| ID | Screen / surface | Core job | Primary authority |
|---|---|---|---|
| UI-01 | Home | What needs me now; can I trust what is being carried? | Product/Home + PG-54/55/61/62 |
| UI-02 | Needs You list | Current actionable USER work | Product/Needs You + PG-03/04 |
| UI-03 | Moment | Why now; what changed/remains; safe next action | Product/Moment + PG-01..19 |
| UI-04 | Managed summary/list | Quiet assurance + intentional inspection | Product/Managed + PG-01/02/41/53/55/56 |
| UI-05 | Managed detail | What Lunowa is carrying and when it rechecks | Product/Managed/Temporal |
| UI-06 | Review list/detail | Smallest material user judgment question | Product/Review + PG-12/13/16/18/53/54/57 |
| UI-07 | Source list | Ordinary authorized communication browsing | Source contract + PG-22/58/60 |
| UI-08 | Source Conversation | Original messages/provenance/manual communication | Source contract |
| UI-09 | Contextual Reply/Reply All composer | Complete active Attention loop safely | Product communication + PG-14/25/26/29/35 |
| UI-10 | Search / retrieval | Exact source find; supported operational recall | Retrieval + PG-58/59 |
| UI-11 | Attachment evidence access | Inspect relevant source evidence safely | Attachments + PG-28/45/65 |
| UI-12 | First-run / Connect mailbox | Establish capability without fake trust | Onboarding + PG-31 |
| UI-13 | First delegation | Choose one current loop and understand monitoring promise | Onboarding / Attention Delegation |
| UI-14 | Account integrity / reconnect | Restore affected monitoring honestly | Failure + PG-20/21/24/33/35/36 |
| UI-15 | Settings | Supported persistent controls only | Product Settings + PG-37/38/39 |
| UI-16 | Intentional disconnect | Decision-complete mailbox disconnect | Account lifecycle + PG-32/34 |
| UI-17 | Product account deletion | Release-gated destructive operation | PG-40 / privacy-data contract |
| UI-18 | Generic system/fallback presentation | scoped offline/AI/local failures | PG-22..30/61/62 |

Optional/deferred UI such as full fresh Compose, Forward parity, broad Drafts/Sent/folder admin, second-provider account matrix, generic rule builder and CRM views are **not missing screens**.

---

# 7. Global view-state axes

Do not create a Cartesian-product screen for every possible failure. Screens derive presentation from independent state axes.

These are **UI read-model concepts only**, not persistence/domain enums.

## 7.1 Data readiness

```text
loading
partial
ready
stale / data-through boundary
unavailable
```

## 7.2 Monitoring integrity

```text
healthy
unknown / not yet established
degraded for explicit scope
not monitored by user choice
```

## 7.3 Intelligence capability

```text
available
partially unavailable
unavailable
```

AI capability does not determine Source availability or semantic `No Responsibility`.

## 7.4 External action capability

```text
available
permission missing
offline
provider unavailable
```

## 7.5 Async operation

For operations that require server/provider confirmation:

```text
idle
-> pending
-> confirmed
   or failed
   or unknown/reconciling   # only where outcome can be ambiguous
```

The UI must not skip directly from `pending` to a semantic success projection unless accepted domain/provider evidence exists.

---

# 8. Home — UI-01

## 8.1 Purpose

Home answers:

1. Is there something I need to act/decide on now?
2. Is a monitoring promise materially degraded?
3. If nothing needs me, is Lunowa actually carrying anything?
4. Can I reach Source immediately?

## 8.2 Composition

Preferred implementation:

```text
[scoped Integrity banner if material]

今、あなたに必要なこと
  [Needs You and Review subjects as typed cards/rows]

[Lunowaが見ています reassurance]

[会話 / 検索 entry]
```

The Home attention composition may include both Needs You and Review, but every item retains explicit type/meaning and routes to its owning surface.

Do **not** use a permanent `Review always above Needs You` rule. Ordering is by explicit Product attention/delay tier and decision relevance, not a hidden model score. Within otherwise equal normal attention, current actionable USER work is not demoted merely because a separate nonurgent Review exists.

Dedicated Needs You and Review surfaces remain distinct.

## 8.3 Populated state

Each Home attention row shows at most:

- person/org/topic;
- type label: `対応` or `確認`;
- one current action/question;
- due/delay/why-now only when material;
- source/account cue only when needed for safety.

No raw thread preview wall.

## 8.4 True zero

Only when no current Needs You, no surfaced unresolved Review, and relevant integrity is trustworthy:

> **今、あなたが対応する必要はありません。**

If healthy Managed work exists, follow with quiet reassurance such as:

> `Lunowaが14件を見ています`

Do not show Inbox Zero celebration, streak or unread debt.

## 8.5 Review-with-no-Needs-You state

A nonurgent Review prevents strict all-clear. Show the Review question without pretending urgency. Do not push solely because it exists.

## 8.6 Initial/partial/degraded state

If source coverage is not trustworthy, replace all-clear with exact status:

- `メールを同期しています`;
- `8:40までのデータを確認済みです`;
- `Gmailとの同期が停止しています`.

Never render cached zero as current truth.

---

# 9. Needs You list — UI-02

## 9.1 Row anatomy

Required information priority:

1. person/org + topic;
2. one current user action/question;
3. material due/delay signal;
4. concise why-now if not obvious;
5. projection/type label using text + icon/color redundancy.

Do not show unread status as the dominant leading cue.

## 9.2 Sorting

Sort by deterministic/explainable attention tiers from accepted Product data, e.g.:

1. material overdue / highest delay cost;
2. near material user due;
3. blocking current user work;
4. other actionable work.

Within a tier, use stable deterministic secondary ordering such as due time then last material state change. Do not use one opaque AI ranking score.

## 9.3 Selection

Row activation opens Moment, not Source.

A separate Source affordance may open the original Conversation without changing row-body semantics.

## 9.4 Empty state

If Needs You is empty but Review exists, do **not** say `nothing requires you`. Say `現在、対応が必要な件はありません` and leave Review discoverable.

---

# 10. Moment — UI-03

## 10.1 Required hierarchy

Render only blocks that add decision value:

1. **current question / why now**;
2. **one safe primary action** if current user action exists;
3. what materially changed;
4. what remains unresolved;
5. due/return/expected event where material;
6. minimal supporting evidence;
7. compact additional Responsibilities;
8. Source/provenance access.

Do not add a generic AI summary block merely because AI exists.

## 10.2 Trust presentation

Default evidence hierarchy:

```text
Conclusion / safe action
-> concise reason
-> evidence receipt/source label
-> original Source
```

Do not display chain-of-thought, model reasoning transcript or confidence percentage as proof.

Example evidence labels:

- `根拠: 8/28 田中さんのメール`;
- `送信確認: Gmail`;
- `あなたが期限を修正`;
- `最終同期: 8:42`.

## 10.3 MY_TURN

Show one dominant safe CTA when one exists.

Examples:

- `返信する`;
- `見積書を見る`;
- `変更を確認`;
- `依頼元を確認`.

Source-requested high-impact action is never automatically the CTA.

## 10.4 WAITING

Usually reached from Managed inspection, not Needs You.

Show:

- awaited actor/event;
- last material progress;
- expected/return condition;
- integrity;
- Source.

No visually dominant work CTA unless actionability changed.

Secondary controls may include:

- `今確認する` / focus inspection;
- `戻す条件を変更`;
- `監視を停止`;
- `会話を見る`.

`今確認する` must not fabricate MY_TURN.

## 10.5 LATER

Show the user-owned return condition clearly and distinguish it from source due/expected event.

A persistence request remains visually `保存中` until the durable change is confirmed. Do not say `この日時に戻します` before the relevant monitoring contract is accepted.

## 10.6 DONE/history

Explain why monitoring ended. Do not assume all Done is successful outcome satisfaction.

The active UI need not keep Done as a daily top-level queue.

## 10.7 Multiple Responsibilities

One primary item; others compactly accessible:

```text
[Primary current question]
[Primary action]

他に2件
- 見積書待ち
- 契約日の確認
```

Do not render several equal visual-primary CTAs.

---

# 11. Managed — UI-04 / UI-05

## 11.1 Default summary

Managed starts with reassurance, not a backlog table:

```text
Lunowaが見ています 14
今、追加対応が必要なものはありません
最終確認 2分前

[管理中を見る]
```

Only say the second line when true for the managed scope and relevant integrity.

## 11.2 Healthy count

Exclude:

- surfaced Review items;
- current Needs You;
- degraded monitoring scope;
- intentionally stopped tracking;
- No Responsibility;
- resolved inactive history.

## 11.3 Inspection list row

Show:

- outcome/topic;
- current awaited actor/event;
- return/reconsideration condition;
- integrity cue;
- source access.

Avoid unread/newest-message visual dominance.

## 11.4 Detail

Managed detail may reuse Moment primitives but must preserve quiet semantics. It answers `what is Lunowa carrying and what will make it reconsider?` rather than creating a work queue.

## 11.5 Zero Managed

> `現在、Lunowaが監視している件はありません。`

Keep Source useful. Do not claim everything is handled.

---

# 12. Review — UI-06

## 12.1 List row

Show:

- exact material question;
- affected person/topic/outcome;
- urgency/due only if real;
- type/provenance cue if useful.

No confidence percentage.

## 12.2 Detail

Required structure:

1. one exact question;
2. minimum conflicting or decision-critical evidence;
3. bounded choices/action;
4. Source;
5. effect language in ordinary terms.

Example:

```text
期限を確認

最新のメール: 金曜まで
以前のメール: 月曜まで

[金曜として扱う]
[月曜として扱う]
[原文を見る]
```

## 12.3 Resolution

When new evidence resolves Review automatically, remove/resolve the stale question without forcing user action and preserve navigation gracefully.

If the user is viewing the now-resolved Review, show a compact current-state transition and route to the resulting Moment/Managed/Source as appropriate rather than a dead error page.

## 12.4 Empty

Hide global Review destination/badge when empty.

---

# 13. Source — UI-07 / UI-08

## 13.1 Source list row

Priority:

1. sender/person/org;
2. subject/topic;
3. useful source preview;
4. date/time;
5. account/projection cue only when useful.

Row body opens Source Conversation.

A distinct status/Responsibility affordance may open Moment.

## 13.2 Conversation detail

Show original messages in readable chronological form with:

- sender/recipient/time;
- attachment observations;
- account identity where material;
- contextual reply entry;
- optional compact Responsibility affordance;
- no requirement to pass through AI summary.

## 13.3 Mailbox hygiene

Archive/read/unread/delete/etc., if later exposed, remain visually secondary provider actions and do not mutate Responsibility state automatically.

---

# 14. Contextual reply / send — UI-09

## 14.1 Composer placement

Open inside or immediately adjacent to active Moment/Source detail so context is preserved.

## 14.2 Required visible commit information

Before Send, the user can inspect:

- effective From account;
- To/Cc recipients;
- body;
- supported attachments;
- material commitment/date/amount in the content as ordinary text.

No separate generic AI-chat interaction is required to edit the draft.

## 14.3 AI draft state

AI draft preparation is assistance only:

```text
draft preparing -> draft ready
                 -> draft unavailable (manual editor still usable)
```

Do not block manual reply on AI failure.

## 14.4 Send operation states

### Idle

Explicit Send button enabled when required fields are valid and capability available.

### Pending

- preserve visible composer content;
- disable duplicate commit action;
- show local progress near Send;
- announce `送信しています` politely to assistive tech;
- do not transition Responsibility to Waiting/Done yet.

### Provider accepted / reconciling

If provider accepted but downstream reconciliation/domain update is still pending, copy may say `送信を確認しました。状態を更新しています` rather than immediately claim outcome state.

### Confirmed domain consequence

Only after accepted evidence/reducer result should Moment/Managed projection update.

### Failed

- preserve draft;
- show exact recoverable failure near composer;
- permit edit/retry where safe;
- do not create fake send history.

### Ambiguous

- preserve context;
- show `送信結果を確認しています`;
- do not expose blind Retry while duplicate delivery remains possible;
- offer status refresh/source inspection according to provider contract;
- do not switch to Waiting/Done until evidence resolves ambiguity.

## 14.5 Offline

Do not silently queue consequential Send. Preserve draft and explain that it has not been sent.

## 14.6 Japanese IME

- while `isComposing`, keyboard shortcuts cannot trigger Send or destructive actions;
- Enter in multiline editor never means Send;
- explicit Send button is the default commit mechanism;
- any future Ctrl/Cmd+Enter shortcut must be separately accepted and guarded from composition.

---

# 15. Search / retrieval — UI-10

## 15.1 Entry

Use one search field. Placeholder direction:

> `検索、または質問`

Exact deterministic search remains usable without natural-language intelligence.

## 15.2 Result types

A result may represent:

- Source Conversation/message/file;
- current Responsibility/operational state where supported;
- person/context where activated.

Type must be visually explicit enough to avoid confusing AI answer with Source evidence.

## 15.3 Answer/result progressive disclosure

```text
current answer/state
-> material change/as-of if needed
-> source links
-> original communication
```

No result may mutate accepted Responsibility state just from retrieval.

## 15.4 Zero

Say no authorized match was found and preserve query/scope. Never fill with a plausible synthetic answer.

---

# 16. Attachment evidence — UI-11

## 16.1 Core obligation

The UI must preserve attachment existence/provenance and a supported safe evidence-access path.

Native rich preview is not a universal gate.

## 16.2 States

```text
available + native preview supported
available + open/download/provider fallback
local preview failed but source access works
provider/security blocked
permission/capability unavailable
```

## 16.3 Security blocked

Show exact unavailable boundary and safe alternatives only. Never provide a bypass UI.

If the inaccessible evidence breaks an existing delegated promise, surface affected-scope Integrity; do not turn local preview failure into global Integrity automatically.

---

# 17. Onboarding / connect / first delegation — UI-12 / UI-13

## 17.1 First-run sequence

```text
Welcome/value in one screen
-> connect one mailbox
-> provider account selection/authorization
-> initial sync with truthful coverage
-> Source becomes usable
-> choose one current loop
-> show bounded monitoring promise
-> explicit [この件を任せる]
-> first Managed state
```

Do not require taxonomy lesson, profile completion, generic AI preferences, multi-account organization or rule builder before first value.

## 17.2 Permission explanation

Use plain-language capability/authority separation:

- what Lunowa can read/monitor;
- what it does not autonomously send/do;
- provider mail remains in the provider;
- account connection does not delegate all historical mail.

## 17.3 Initial sync

Show coverage, not fake zero:

- `メールを確認しています`;
- approximate progress only if reliable;
- `8/1以降を確認済み` / data-through wording where useful.

Years-old unanswered mail does not flood live Needs You.

## 17.4 First delegation contract

Before acceptance show only user-relevant promise:

- what outcome Lunowa is watching;
- who/what is expected next;
- when/event on which Lunowa will reconsider;
- what still requires explicit user action.

Do not expose internal Responsibility schema.

---

# 18. Integrity / reconnect — UI-14 / UI-18

## 18.1 Integrity banner anatomy

For material monitoring degradation show:

1. affected capability/account/scope;
2. what is no longer trustworthy;
3. last trustworthy observation/as-of if known;
4. affected delegated-item count/path if known;
5. recovery action.

Example:

```text
Gmailとの同期が停止しています
管理中3件の最新状態を確認できません
最終確認 8:04

[再接続]
[影響する件を見る]
```

## 18.2 Scope locality

A send-permission loss must not falsely make read monitoring unhealthy. AI draft failure must not make Source unavailable. Attachment preview failure must not become global system degradation.

## 18.3 Recovery

Do not restore healthy Managed reassurance immediately after reconnect. Reconcile the missing interval first.

While reconciling:

> `再接続しました。停止中の変更を確認しています。`

Only then restore healthy state.

---

# 19. Settings — UI-15

## 19.1 Information architecture

Render only groups backed by current capability:

- **アカウントとデータ**;
- **通知と注意** when supported;
- **任せる範囲** only when a real persistent delegation scope exists;
- **操作の権限** only for actual supported permissions;
- **プライバシー / AI・データ利用** where current policy requires control/disclosure;
- **表示 / 言語 / アクセシビリティ** for supported experience choices.

Do not render empty sections to imply future autonomy.

## 19.2 Device sign-out vs mailbox disconnect

Use separate labels/actions and consequence copy. Never use one generic `ログアウト/削除` action for both.

## 19.3 Unsupported autonomy

No global `AIに全部任せる`, `Always allow send`, generic workflow builder or false future controls.

---

# 20. Intentional mailbox disconnect — UI-16

When live delegated loops exist, confirmation must contain:

- exact account;
- `新しいメールの監視が止まる` consequence;
- number/scope of affected live delegated loops;
- **inspect affected items** action;
- explicit statement that stopping monitoring does not mean those outcomes completed;
- only actual known data/source consequences.

Commit button should use precise destructive wording such as `このメール連携を解除` rather than generic `削除`.

After commit, do not show those loops as successful Done.

---

# 21. Product account deletion — UI-17

This UI is **public-release gated** by the accepted privacy/legal/data-retention contract.

Design can reserve the information architecture but must not invent:

- deletion SLA;
- backup retention period;
- export guarantee;
- billing consequence;
- provider revocation behavior.

The final confirmation must be generated from actual accepted implementation/legal guarantees.

---

# 22. Feedback and transient UI

## 22.1 Feedback placement

Prefer feedback at the location of the affected object/action.

- draft/send failures -> composer;
- return-condition save -> Moment/Managed detail;
- reconnect -> account/integrity region;
- attachment failure -> attachment region.

## 22.2 Toasts

Toasts may supplement low-risk success but are never the sole carrier of:

- send ambiguity/failure;
- monitoring integrity loss;
- Review question;
- destructive account consequence;
- permission loss requiring action.

## 22.3 Modal/dialog use

Use dialogs for focused consequential decisions, not routine monitoring information.

Good uses:

- disconnect with live monitoring;
- account deletion;
- bounded destructive confirmation.

Avoid modal confirmation for ordinary Source opening, Managed inspection or harmless uncertainty.

---

# 23. Keyboard / focus interaction

## 23.1 Baseline

Every Product-critical action works without a mouse.

Required behavior:

- Tab / Shift+Tab traverses interactive controls in logical order;
- Enter/Space activates controls according to native semantics;
- Escape closes popover/sheet/dialog and returns focus to trigger;
- opening Detail on compact layouts moves focus to a meaningful Detail heading or first action without losing return context;
- Back returns focus to the originating row when possible;
- deleting/resolving an item moves focus predictably to next logical item/heading;
- focus never moves merely because background state updated.

## 23.2 Search shortcut

A `/` shortcut may focus Search only when no editable/composition target is active. It must not override Japanese IME composition.

## 23.3 Power-user shortcuts

Do not make a large shortcut vocabulary an Issue #55 completion gate. Shortcuts may be layered later after accessible base interactions exist.

## 23.4 Pane resizing

If draggable splitters ship, drag cannot be the only mechanism.

Provide keyboard-accessible separator adjustment and/or non-drag reset/size controls. Focus indicator must remain visible.

---

# 24. Accessibility contract

## 24.1 Conformance target

**WCAG 2.2 AA** is the release baseline for web UI.

Adopt stronger focus visibility where cheap.

## 24.2 Focus

- visible 2px minimum focus ring/indicator;
- target contrast >=3:1 against adjacent background;
- focus not obscured by sticky header/banner/composer;
- modal/sheet focus containment and return;
- no focus theft for background updates.

## 24.3 Target size

- WCAG 2.2 minimum 24×24 CSS px or valid spacing/equivalent exception;
- compact/touch primary controls target ~44×44 CSS px;
- icon-only control receives adequate hit area even if glyph is smaller.

## 24.4 Color / text

- color is never the only state signal;
- normal essential text aims for >=4.5:1 contrast;
- large text follows WCAG ratio rules;
- functional accent and functional foreground are distinct tokens;
- truncation does not remove decision-critical meaning; accessible full label remains available.

## 24.5 Motion

Respect `prefers-reduced-motion`.

Motion explains spatial continuity only; no essential information conveyed only by animation.

## 24.6 Status messages

Use programmatic status messaging for async updates without unnecessary focus movement.

Direction:

- `role="status"` / polite live behavior for send-start/success, sync/reconnect progress, local save completion;
- assertive alert behavior only for immediate user-actionable failures/safety states where interruption is warranted;
- do not announce every background monitoring update.

## 24.7 Semantic structure

Use native/ARIA semantics appropriate to the job:

- `nav` for global navigation;
- `main` for active surface;
- headings with logical hierarchy;
- links for navigation;
- buttons for actions;
- dialogs/sheets labelled with clear title;
- lists as lists unless a true grid/table interaction is necessary.

Do not implement email rows as a complex ARIA grid merely for visual similarity if ordinary links/buttons provide a more robust accessible model.

---

# 25. Visual system implementation tokens

These tokens are implementation-facing defaults. Rendered contrast/testing may require small adjustment without changing Product semantics.

## 25.1 Foundation

```text
--background          #F7F8FB
--surface             #FFFFFF
--surface-subtle      #F1F3F7
--foreground          #172033
--muted-foreground    #687184
--border              #E2E6EF
--brand-navy          #0F1B3D
--lunar-gold          #F2D9A6
--focus               #315E9C
```

`Lunar Gold` is not light-surface body text.

## 25.2 Projection families

Use separate surface/foreground/border tokens.

Recommended foreground defaults:

```text
--action-fg   #A83B36
--later-fg    #8A5A00
--waiting-fg  #315E9C
--done-fg     #2F7156
--review-fg   #705A9A
```

Suggested pale surfaces:

```text
--action-bg   #FCECEB
--later-bg    #FFF4DD
--waiting-bg  #EAF1FB
--done-bg     #E9F5EF
--review-bg   #F2EEFA
```

State chips always include text/icon/shape; color alone is insufficient.

## 25.3 Typography

Initial web font strategy: use a high-quality **system Japanese sans stack** before adding a network-font dependency.

Direction:

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Hiragino Sans",
  "Yu Gothic UI",
  "Yu Gothic",
  "Noto Sans JP",
  sans-serif;
```

Typography scale direction:

```text
12–13px  metadata only
14px     secondary/supporting text
15–16px  default body/list text
18px     strong local heading
22–24px  page/Moment heading
```

Japanese body line-height generally ~1.5–1.65. Do not reduce core text to preserve pane count.

## 25.4 Spacing

Use a restrained 4px-derived scale:

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48
```

Prefer whitespace + typography hierarchy over nested dashboard cards.

## 25.5 Radius / shadow

Direction:

- small controls/chips: 8–10px;
- cards/panels: 12–16px;
- dialogs/sheets: 16–20px;
- shadows restrained and primarily for overlays/floating surfaces;
- normal list hierarchy relies on background/border/spacing rather than heavy cards.

## 25.6 Density

Initial target:

- Source rows roughly 60–68px minimum in ordinary desktop density;
- attention rows roughly 68–80px depending on why-now/due information;
- compact touch rows >=44px hit height, usually larger for readable Japanese two-line content.

Exact density remains render-tested, not a market fact.

---

# 26. UI read-model boundary

The frontend should consume **purpose-built read models/projections**, not reconstruct canonical Responsibility truth from raw provider messages.

These examples are conceptual contracts only.

## 26.1 Common envelope

Each material screen needs enough data to express:

```text
content/read-model payload
+ source/provenance links
+ data freshness / as-of boundary
+ relevant monitoring integrity
+ capability availability
+ pending operation state
```

## 26.2 Attention item read model

Minimum fields conceptually:

```text
stable UI key
kind: Needs You or Review subject
person/org/topic display
one current action/question
material due/delay tier if any
why-now summary if needed
source link
integrity/capability exception if material
```

The `kind` here is a UI discriminator, not a persisted Responsibility lifecycle.

## 26.3 Moment read model

Conceptually:

```text
primary question
projection display
safe primary action descriptor if any
what changed summary
what remains summary
expected event / return condition display
material due/temporal display
supporting evidence receipts
source link(s)
additional Responsibility summaries
integrity
available controls
```

Do not ask the client to infer safe action from source text.

## 26.4 Managed read model

```text
healthy monitored count
integrity summary
managed item summaries when inspection opened
last trustworthy observation / data-through where useful
```

Healthy count must already respect surfaced-Review/degraded exclusions.

## 26.5 Source read model

```text
conversation/message evidence
provider/account identity
attachments/provider observations
optional projection links
reply capability
```

Source evidence is not silently converted into accepted Responsibility truth in the component layer.

## 26.6 Review read model

```text
exact question
subject display
minimal decision evidence
bounded answer choices or safe input
source links
material urgency/delay metadata if any
```

Internal subject type remains available to the server/domain boundary even if presentation is unified.

## 26.7 Operation result read model

Async provider/domain operations expose enough state to distinguish:

```text
request accepted locally
server operation pending
provider result unknown/failed/accepted
reconciliation pending/completed
resulting current projection
```

Do not collapse this into one boolean `success` for Send.

---

# 27. UI event boundary

UI emits user **intent**, not authoritative state mutation.

Examples:

```text
open Moment
open Source
open Managed detail
answer Review
request Return Attention Now
request return-condition change
request Stop Tracking
start contextual reply
edit draft
request Send
request reconnect
request mailbox disconnect
```

The server/domain/provider layer validates authority, persists/reconciles, then returns accepted read-model state.

Components must not set canonical Responsibility state because a button label suggests it.

---

# 28. Component map

Recommended reusable implementation components:

## Shell

- `AppShell`
- `PrimaryNav`
- `SurfaceListPane`
- `DetailPane`
- `SupportingPane`
- `IntegrityBanner`

## Lists/rows

- `AttentionRow`
- `ManagedRow`
- `ReviewRow`
- `SourceConversationRow`
- `SearchResultRow`

## Moment / state

- `MomentHeader`
- `PrimaryQuestion`
- `PrimaryAction`
- `ChangeSummary`
- `RemainingOutcome`
- `TemporalCondition`
- `EvidenceReceipt`
- `AdditionalResponsibilityList`
- `ProjectionChip`
- `IntegrityStatus`

## Communication

- `ContextualComposer`
- `RecipientEditor`
- `AttachmentTray`
- `SendStatus`

## Review

- `ReviewQuestion`
- `EvidenceComparison`
- `BoundedChoiceGroup`

## Source / retrieval

- `MessageThread`
- `MessageCard`
- `AttachmentEvidence`
- `SearchBox`
- `SearchScope`

## Account/system

- `ConnectAccountCard`
- `SyncCoverageStatus`
- `ReconnectPanel`
- `AffectedMonitoringList`
- `CapabilityStatus`

Names are implementation suggestions, not API/schema authority.

---

# 29. Loading / empty / degraded presentation matrix

| Surface | Loading | Empty/zero | Partial/unknown | Degraded | AI unavailable |
|---|---|---|---|---|---|
| Home | skeleton only for known regions; retain cached state if safe | strict all-clear only under PG-55 conditions | syncing/data-through, no all-clear | Integrity banner + affected truth | Source/manual remains; monitoring may degrade by scope |
| Needs You | retain stable rows while refreshing | `対応が必要な件はありません` only, not global zero if Review exists | distinguish incomplete coverage | affected rows/scope not falsely hidden | accepted existing rows stable; fresh interpretation impact scoped |
| Managed | summary skeleton/last known with as-of | `監視中の件はありません` | no healthy count claim if coverage unknown | exclude affected scope from healthy reassurance | scope-specific integrity if interpretation required |
| Review | preserve current question during refresh | hide nav/badge | pending evidence may keep question | exact affected capability | no automatic fake Review from AI failure |
| Source | standard list/thread loading | no messages/results | show data-through if sync incomplete | cached Source may remain with as-of | still available if provider data healthy |
| Composer | preserve local draft | n/a | n/a | capability-local error | manual editor remains |
| Search | preserve query/results during refresh | honest no results | scope/data-through explicit | exact/search availability scoped | deterministic source search remains |

---

# 30. Notification / attention-delivery UI mapping

The UI never treats notification as the source of truth. Opening the app shows current state even if a notification was missed.

Mapping direction:

```text
Silent
  -> no interruptive UI outside app

Awareness
  -> passive/in-app/digest only by policy

Normal Attention
  -> ordinary notification at safe review point

Urgent Attention
  -> time-sensitive interruption only when delay cost warrants it

Integrity Alert
  -> delivery severity based on actual monitoring-promise impact
```

Notification tap deep-links to Moment, Review or integrity recovery as appropriate.

Do not open generic Inbox just because the event originated from email.

---

# 31. Acceptance oracle mapping

## 31.1 Minimum Complete Delegation Loop

- UI-03/04/09: `PG-01` through `PG-06`.
- key forbidden: Send != closure; progress reply != attention; one Conversation may contain multiple Responsibilities.

## 31.2 User control / Review

- UI-03/05/06: `PG-07` through `PG-19`.
- use relevant Responsibility Tier-0/transition oracle when the field/owner/identity/temporal semantic truth matters.

## 31.3 Failure / degraded

- UI-01/09/11/14/18: `PG-20` through `PG-30`.
- exact provider/scheduler/send proof belongs to integration/runtime tests; UI tests verify observable consequence only.

## 31.4 Account lifecycle / Settings

- UI-12 through UI-17: `PG-31` through `PG-41`.

## 31.5 Communication edges

- Source/Moment/Review/Attachment: `PG-42` through `PG-52`.
- cross-thread/account identity remains conservative; UI never offers silent merge authority.

## 31.6 Managed / Review / zero / retrieval

- Home/Managed/Review/Search: `PG-53` through `PG-65`.

## 31.7 Responsibility semantic oracle routing

When observable UI behavior depends on semantic classification, tests reference the owning Responsibility oracle/transition rather than snapshotting arbitrary fixture states as truth.

At minimum implementation tasks must consult:

- `responsibility/DECISIONS.md`;
- applicable `TIER-0-DETAILED-ORACLES-*`;
- applicable `TRANSITION-ORACLES.md`;
- Product `GOLDEN-SCENARIO-BANK.md` for final user-facing consequence.

---

# 32. Required UI verification before broad implementation acceptance

## 32.1 Static/component

- token/contrast checks for critical text/state chips;
- semantic labels for icon controls;
- no state distinction by color alone;
- loading/zero/degraded fixture coverage.

## 32.2 Interaction

- Home typed attention items route correctly;
- Needs You row -> Moment;
- Source row -> Source;
- Source status affordance -> Moment;
- Managed inspection does not create My Turn;
- Review resolution applies only bounded intent;
- return-condition pending/confirmed state truthful;
- Stop Tracking copy never claims outcome success;
- Send pending/failed/ambiguous/confirmed behavior preserves context;
- AI draft failure leaves manual reply;
- attachment preview failure leaves safe evidence access;
- reconnect does not restore healthy state before reconciliation.

## 32.3 Keyboard/accessibility

- all core flows keyboard-operable;
- visible focus throughout;
- focus return after dialogs/sheets/details;
- no focus hidden by sticky UI;
- async status programmatically announced;
- no drag-only splitter requirement;
- reduced motion verified;
- Japanese IME composition cannot trigger Send.

## 32.4 Responsive

Verify at minimum:

- ~1600+ very wide;
- 1440;
- 1180;
- 900;
- 768;
- 720 boundary;
- 390/430 compact widths;
- 125%, 150%, 200% browser zoom/text scaling where practical.

Test content-fit rather than screenshot-only pixel similarity.

## 32.5 Visual

Compare rendered implementation against relevant refs:

- `00` brand;
- `01` component system;
- `02` shell;
- relevant Moment ref `03`–`08`;
- `10` Search;
- `17` system states;
- `18`/`19` responsive.

Resolve screenshot/spec conflicts in favor of current textual authority.

---

# 33. Explicit non-goals for UI implementation decomposition

Do not make the first implementation graph depend on:

- full fresh Compose;
- Forward parity;
- broad Drafts/Sent/folder/label admin;
- bulk mailbox hygiene;
- second provider;
- generic rule/automation builder;
- CRM/personality/network surfaces;
- public enrichment;
- full native attachment renderer;
- calendar mutation;
- standing autonomous Send;
- relationship scoring;
- generic AI-chat homepage;
- perfect power-user shortcut parity.

---

# 34. Open usability hypotheses after this contract

Implementation readiness does not mean every presentation preference is empirically validated.

Still test later:

- exact Japanese copy;
- exact Home attention-card density/order;
- optimal row density;
- final breakpoint tuning;
- default landing after trust is earned;
- notification defaults;
- promotion of NL search/person context/digest/quiet hours;
- full-client vs companion/hybrid mature form.

These do not block building the coherent v1 Product slice unless a concrete implementation contradiction appears.

---

# 35. Completion criterion for Issue #55

UI/UX is implementation-ready only when:

1. this contract and canonical Design/Interaction/Responsive docs contain no material contradiction;
2. every v1 CORE surface has a defined healthy/empty/loading/unknown/degraded path;
3. consequential async operations preserve request/provider/reconciliation/domain distinctions;
4. responsive behavior preserves place/draft/source/safety semantics;
5. WCAG 2.2 AA/testable accessibility requirements are explicit;
6. component/read-model/event boundaries do not create domain authority;
7. Product Golden Scenarios and Responsibility oracles route acceptance;
8. current visual references are explicitly subordinate to current semantics;
9. a full cumulative acceptance audit of the final candidate passes;
10. exact-head repository CI passes before merge.

After that, the next task is **Implementation Graph decomposition**, not more open-ended UI brainstorming.