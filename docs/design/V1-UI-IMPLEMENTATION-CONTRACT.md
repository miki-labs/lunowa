# Lunowa v1 UI Implementation Contract

## Status / authority

**Canonical implementation-facing UI/UX contract for the current v1 Minimum Complete Delegation Loop when present on `main`.**

This file makes accepted Product/design behavior implementation-ready. It is subordinate to:

1. `docs/product/PRODUCT.md` — highest-level Product authority;
2. `docs/product/PRODUCT-CONTENT.md` — detailed Product operating authority;
3. `docs/product/responsibility/` — FIXED Responsibility semantic authority;
4. `docs/product/GOLDEN-SCENARIO-BANK.md` — Product-level observable acceptance consequences;
5. `DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` — canonical design/interaction/responsive meaning.

This file owns implementation-facing **screen inventory, material view states, navigation/focus behavior, async-feedback truth, visual tokens, accessibility requirements, UI read-model/event boundaries and acceptance mapping**.

It does **not** create a Responsibility lifecycle, persistence schema/table, authorization model, provider contract or empirical Product finding.

If UI convenience conflicts with Product/Responsibility truth, UI convenience loses and the owning authority is reconciled.

Evidence/rationale: `../product/research/issue-55-ui-ux-evidence-2026-08-28.md` plus the Issue #55 audit/evidence trail.

---

# 1. Objective

Lunowa should make this promise legible:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The UI should reduce monitoring, repeated source checks, reconstruction, unnecessary navigation and routine approval while preserving source/provenance, monitoring integrity, sender/action authority, correction, stop controls and truthful recovery.

Do not optimize primarily for unread processing, visible AI activity, dashboard density, automation spectacle or provider parity.

---

# 2. Non-negotiable separations

The UI must preserve these distinctions:

```text
Source evidence
!= AI interpretation
!= accepted Responsibility state
!= safe next action
!= UI projection

message arrival
!= attention event

monitoring posture
!= monitoring integrity
!= notification/delivery state

provider mailbox state
!= Responsibility state

user request/click
!= accepted internal mutation

Send request
!= provider result
!= reconciled provider evidence
!= Responsibility closure

Lunowa app session
!= connected-mailbox authorization
```

No component name, badge, color, animation or optimistic state may silently redefine those boundaries.

---

# 3. v1 implementation scope

## 3.1 CORE UI jobs

The current implementation graph must be able to realize:

- Lunowa application sign-in/session boundary;
- one mailbox connect + authorization + initial sync;
- Source Conversation/message browsing;
- exact Source search and accepted CORE operational retrieval;
- authorized attachment evidence access through a safe supported path;
- Home / Needs You / Moment / Managed / Review / Source;
- one current-loop delegation;
- Later / return-condition control where semantically valid;
- contextual Reply / Reply All;
- editable bounded draft assistance with manual fallback;
- explicit Send + provider/reconciliation states;
- account reconnect/integrity recovery;
- intentional mailbox disconnect;
- capability-conditional Settings;
- public-release Product-account deletion boundary;
- loading/zero/unknown/degraded/offline/local-failure states.

## 3.2 Conditional / strong-candidate UI

Do not make first complete-loop implementation depend on these unless a later task promotes them:

- rich native attachment preview;
- person context;
- natural-language search/Q&A beyond accepted CORE retrieval;
- reply attachment add where no accepted scenario needs it;
- pinning;
- digest;
- quiet-hours controls beyond required delivery behavior.

## 3.3 Explicit non-goals

Not current completion gates:

- full fresh Compose;
- Forward parity;
- broad Drafts/Sent/folder/label administration;
- bulk mailbox hygiene;
- second provider / broad multi-account parity;
- generic workflow/rule builder;
- CRM/personality/network views;
- public enrichment;
- full native attachment renderer;
- calendar mutation;
- standing autonomous Send;
- generic AI-chat homepage;
- power-user shortcut parity.

---

# 4. Navigation and route model

## 4.1 Primary jobs after sign-in/account setup

Primary navigation:

1. **ホーム**;
2. **対応が必要**;
3. **管理中**;
4. **確認** — conditional/non-zero;
5. **会話**;
6. **検索**;
7. **設定** — secondary.

`待ち` / `あとで` / `完了` are projections/filters/details, not required permanent top-level destinations.

`ピン留め` is optional secondary retrieval when activated.

Unread counts do not become the primary navigation model. Managed counts are reassurance/inspection information, not red attention badges.

## 4.2 Suggested route families

```text
/[locale]/sign-in
/[locale]/home
/[locale]/needs-you
/[locale]/needs-you/[ui-key]
/[locale]/managed
/[locale]/managed/[ui-key]
/[locale]/review
/[locale]/review/[ui-key]
/[locale]/source
/[locale]/source/[conversation-key]
/[locale]/search?q=...
/[locale]/settings/...
```

Identifiers are implementation details. A route must never imply `Conversation == Responsibility`.

Deep-link access remains authorization-checked by the owning application/domain boundary; navigation structure is not authorization.

## 4.3 Review visibility

Review is globally visible when current Review subjects exist. If the last subject resolves while the user is already inside Review, keep enough orientation to explain the state change; do not strand the user on an unexplained 404/empty route.

---

# 5. Global shell / adaptive layout

## 5.1 Spatial model

```text
Navigation | Surface/List | Detail | optional supporting context
```

Supporting context is user-opened/contextual for Source/provenance/attachment/person context. It is not a permanent fourth dashboard pane merely because width exists.

## 5.2 Surface/List role

Depending on current Product job:

- Home composition;
- Needs You items;
- Managed inspection list;
- Review questions;
- Source Conversations;
- Search results.

## 5.3 Detail role

- Moment;
- Managed monitoring detail;
- Review interaction;
- Source Conversation;
- search result detail;
- contextual composer.

## 5.4 Initial width guidance

Content-fit first, not device sniffing:

```text
>= 1440px       wide three-pane
1180–1439px     compact three-pane
900–1179px      rail + list + detail
720–899px       two-pane
< 720px         single-pane
```

At approximately `>=1600px`, supporting context may be shown on demand if Detail remains readable.

Collapse earlier when Japanese copy, browser zoom, text scaling, split-screen or browser chrome makes content widths fail.

## 5.5 Preserve place

Across resize/orientation/layout transitions preserve where practical:

- current Product surface;
- selected item/detail;
- list/search query/filter/scroll;
- source/Moment association;
- draft body/recipients/attachments/from account;
- async Send/reconciliation state;
- open attachment/provenance context;
- desktop pane width.

A layout transition never discards meaningful input.

When Detail is active and layout collapses, keep Detail active. Back restores the exact prior list/query/scroll context.

---

# 6. Complete screen/surface inventory

| ID | Surface | Core job / boundary | Main Product oracle |
|---|---|---|---|
| UI-01 | App sign-in / session | Lunowa identity/session, distinct from mailbox authorization | PG-39 + auth contract |
| UI-02 | Home | current attention + integrity + Managed reassurance | PG-54/55/61/62 |
| UI-03 | Needs You | current actionable USER work | PG-03/04 |
| UI-04 | Moment | why now / changed / remains / safe next action | PG-01..19 |
| UI-05 | Managed summary/list | quiet delegated-monitoring reassurance/inspection | PG-01/02/41/53/55/56 |
| UI-06 | Managed detail | what is carried / expected / return condition / integrity | PG-01/09/10 |
| UI-07 | Review | smallest material user judgment question | PG-12/13/16/18/53/54/57 |
| UI-08 | Source list | ordinary authorized communication browsing | PG-22/58/60 |
| UI-09 | Source Conversation | original messages/provenance/manual communication | Source contract |
| UI-10 | Contextual Reply / Reply All / Send | complete an active Attention loop safely | PG-14/25/26/29/35 |
| UI-11 | Search / retrieval | exact Source find; capability-conditional operational retrieval | PG-58/59 |
| UI-12 | Attachment evidence access | inspect material source evidence safely | PG-28/45/65 |
| UI-13 | Connect mailbox | mailbox authorization separate from app session | PG-31/35/36 |
| UI-14 | Initial sync | truthful source coverage; no fake zero/backlog activation | PG-31/61 |
| UI-15 | First delegation | one real current loop; bounded monitoring promise | onboarding contract |
| UI-16 | Integrity / reconnect | scoped monitoring recovery | PG-20/21/24/27/30/33/35/36/62 |
| UI-17 | Settings | supported persistent controls only | PG-37/38/39 |
| UI-18 | Intentional disconnect | stop provider monitoring capability without fake completion | PG-32/34 |
| UI-19 | Product-account deletion | public-release-gated destructive boundary | PG-40 |
| UI-20 | Scoped system/fallback presentation | offline/AI/local feature failure without false global state | PG-22..30 |

Optional/conditional Product features are not missing screens simply because historical references exist.

---

# 7. Cross-cutting UI state model

Do **not** create one giant persisted frontend lifecycle. These axes are read-model/presentation concepts only.

## 7.1 App session

```text
unauthenticated
authenticating
authenticated
session_expired
auth_error
signing_out
```

App sign-out affects the local/application session. It does not imply provider disconnect or server-side monitoring stop.

## 7.2 Source data readiness

```text
loading
partial
ready
stale / data-through boundary
unavailable
```

Empty data while `partial/unknown` is not a trustworthy zero state.

## 7.3 Monitoring posture — user/domain intent

```text
not_delegated
active
stopped_by_user
```

This answers whether Lunowa is intended to carry the loop. It is **not** system health.

## 7.4 Monitoring integrity — ability to keep the promise

```text
unknown / not yet established
healthy
degraded for explicit scope
```

Intentional `not_delegated` / `stopped_by_user` is not `degraded`.

Unexpected provider/scheduler/source failure can be `degraded`; deliberate Stop Tracking is not.

## 7.5 Capability availability

Track material capabilities independently where needed:

```text
source_read
source_sync
send
exact_search
intelligence
notification_delivery
attachment_access
```

Each capability can be:

```text
available
partially_available
permission_missing
temporarily_unavailable
unsupported
```

Do not convert one capability failure into a global account failure without evidence.

## 7.6 Common accepted-mutation state

For user intents that require authoritative persistence but are not ambiguous external effects:

```text
idle
-> pending
-> confirmed
   or failed
```

Applies conceptually to:

- Review answer;
- return-condition change;
- Return Attention/focus intent where persisted;
- Stop Tracking;
- first delegation;
- supported Settings save;
- app sign-out;
- mailbox connect/disconnect commands where the result is unambiguous.

Rules:

- UI may show `保存中/変更中` while pending;
- success copy/projection appears only after the owning server/domain boundary confirms acceptance;
- failure preserves prior accepted state and user input where relevant;
- low-risk local visual optimism is allowed only if rollback is truthful and cannot imply a monitoring promise or external effect that has not been accepted.

## 7.7 External Send effect state

Send requires a stronger model:

```text
draft/local intent
-> send request pending
-> provider outcome
      accepted evidence
      definite failure
      ambiguous / unknown
-> reconciliation as required
-> Responsibility re-evaluation
-> resulting UI projection
```

A click is never `sent=true`. An ambiguous result never exposes blind duplicate retry.

---

# 8. Home — UI-02

## 8.1 Purpose

Home answers:

1. Does the user need to act or decide?
2. Is a material monitoring promise degraded?
3. If no attention is required, what is Lunowa truthfully carrying?
4. Can the user reach Source/search immediately?

## 8.2 Composition

```text
[scoped Integrity banner if material]

[Needs You / Review attention region]

[Lunowaが見ています reassurance]

[会話 / 検索]
```

Needs You and Review may be composed into one attention region, but they remain **typed subgroups/items**, never one untyped task queue.

Do not enforce `Review always first`. Section/item prominence follows explicit attention/delay cost and decision relevance, not a hidden AI score. A nonurgent Review does not outrank urgent/current USER work merely by type; an urgent/blocking Review may.

Dedicated Needs You and Review surfaces remain distinct.

## 8.3 Attention row minimum

- person/org/topic;
- type: `対応` or `確認`;
- one current action/question;
- real due/delay/why-now only when material;
- account/source cue only when safety needs it.

## 8.4 True zero

Only when:

- no Needs You;
- no surfaced unresolved Review;
- relevant integrity is trustworthy.

Then:

> **今、あなたが対応する必要はありません。**

If healthy Managed work exists, follow with quiet reassurance.

Nonurgent Review prevents strict all-clear without automatically requiring push interruption.

Initial sync/degraded/unknown coverage replaces all-clear with truthful coverage/integrity state.

---

# 9. Needs You — UI-03

## 9.1 Membership

Only current admitted actionable USER work. Never generic new/important mail, Waiting, intentional Later, awareness-only, or surfaced Review-blocked items.

## 9.2 Row hierarchy

1. person/org/topic;
2. one current user action/question;
3. material due/delay;
4. concise why-now when useful;
5. text/icon/color-redundant projection cue.

Unread status is not dominant.

## 9.3 Ordering

Use deterministic/explainable attention tiers such as:

1. material overdue/high delay cost;
2. near material USER due;
3. blocking current USER work;
4. other actionable work.

Within a tier use stable secondary ordering (e.g. due time then material state-change time), not opaque model score.

## 9.4 Background update stability

New evidence may change truth immediately, but list rendering must preserve orientation:

- stable keyed rows;
- do not unexpectedly move keyboard focus;
- avoid reordering the actively focused/edited row under the user;
- when a meaningful reorder occurs, preserve the focused item or defer visual reorder until a safe boundary where practical.

## 9.5 Selection / empty

Row -> Moment. Separate Source affordance -> Source.

Empty text: `現在、対応が必要な件はありません`.

If Review exists, this is **not** global all-clear.

---

# 10. Moment — UI-04

## 10.1 Hierarchy

Render only useful blocks:

1. current question / why now;
2. one safe primary action if current user action exists;
3. what materially changed;
4. what remains unresolved;
5. due / expected event / return condition where material;
6. minimal evidence receipt;
7. compact additional Responsibilities;
8. Source/provenance access.

No generic AI-summary card merely because AI exists.

## 10.2 Trust stack

```text
current conclusion / safe action
-> concise material reason
-> source/provider/user-origin evidence receipt
-> original Source
```

Do not display chain-of-thought, verbose model rationale or confidence percentage as proof.

## 10.3 Projection-specific behavior

### MY_TURN

One dominant safe CTA where one exists: `返信する`, `見積書を見る`, `変更を確認`, `依頼元を確認`, etc.

Source-requested high-impact action is not automatically the safe CTA.

### WAITING

Usually reached through Managed inspection. Show awaited actor/event, latest material progress, return condition, integrity and Source. No dominant work CTA unless actionability actually changed.

### LATER

Show user-owned return condition and distinguish it from source due / expected event. A change request stays `保存中` until authoritative acceptance.

### DONE/history

Explain why monitoring ended; do not imply all Done is successful outcome satisfaction.

### Multiple Responsibilities

One primary item/action; secondary items compactly accessible. Never several equal visual-primary CTAs.

---

# 11. Managed — UI-05 / UI-06

## 11.1 Default summary

```text
Lunowaが見ています 14
今、追加対応が必要なものはありません
最終確認 2分前

[管理中を見る]
```

Use reassurance only when the relevant scope is healthy.

## 11.2 Healthy count excludes

- surfaced Review;
- Needs You;
- degraded monitoring scope;
- stopped-by-user/not-delegated;
- No Responsibility;
- resolved inactive history.

## 11.3 Inspection row/detail

Show outcome/topic, awaited actor/event, return/reconsideration condition, integrity and Source.

Managed detail answers: `何をLunowaが見ていて、何で再確認するのか`.

Controls may include inspect/focus now, modify return condition, Stop Tracking and material correction. Inspecting/focusing does not fabricate MY_TURN.

## 11.4 Stop Tracking async truth

```text
request stop
-> pending (`監視を停止しています`)
-> confirmed -> posture `stopped_by_user`
   or failed -> previous active monitoring remains accepted
```

Never say monitoring stopped, Done succeeded, or outcome completed while the request is only pending.

## 11.5 Zero

> `現在、Lunowaが監視している件はありません。`

Source remains useful. Do not claim `everything handled`.

---

# 12. Review — UI-07

## 12.1 Presentation

List/detail shows:

- exact material question;
- affected person/topic/outcome;
- real urgency/due only when material;
- minimum conflicting/decision-critical evidence;
- bounded choices/input;
- Source;
- ordinary-language effect of the answer.

No confidence percentage or AI-debug panel.

## 12.2 Answer mutation

```text
answer intent
-> pending
-> confirmed -> accepted state/projection re-evaluates
   or failed -> question remains; answer/input preserved where safe
```

Do not dismiss Review merely because the user clicked a choice.

## 12.3 Background auto-resolution

If new trusted evidence resolves a Review while the user is viewing it:

- do **not** unexpectedly navigate or move focus solely because background state changed;
- preserve the current place;
- replace/update the content with a compact `新しい情報でこの確認は解決しました` state and current resulting status;
- provide an explicit route to resulting Moment/Managed/Source as appropriate;
- navigation occurs when the user chooses it, unless the resolving transition was caused by that user's explicit action.

## 12.4 Empty

Hide Review nav/badge when no subjects exist, except transiently preserve orientation for a user already on the just-resolved route.

---

# 13. Source — UI-08 / UI-09

## 13.1 Source list

Priority:

1. sender/person/org;
2. subject/topic;
3. useful source preview;
4. date/time;
5. account/projection cue only when useful.

Row body -> Source Conversation.

Distinct Responsibility/status affordance may -> Moment.

## 13.2 Conversation

Readable chronological messages with sender/recipients/time, attachment observations, account identity when material, contextual reply entry, optional compact Responsibility affordance, and direct Source truth without mandatory AI summary.

Provider mailbox-hygiene actions, if later exposed, remain secondary and do not automatically mutate Responsibility state.

---

# 14. Contextual Reply / Send — UI-10

## 14.1 Placement / commit information

Composer stays inside/adjacent to active Moment/Source context.

Before Send, user can inspect:

- effective From account;
- To/Cc recipients;
- body;
- supported attachments;
- material commitments/dates/amounts as ordinary content.

AI draft is editable assistance; manual editor remains usable if AI draft fails.

## 14.2 Send states

### Draft / idle

Explicit Send enabled only when required fields/capability are valid.

### Request pending

- preserve visible composer;
- disable duplicate commit;
- local progress near Send;
- polite status announcement;
- no Waiting/Done/domain transition yet.

### Definite failure

Preserve draft/context; show recoverable error near composer; permit safe retry/edit; no fake send history.

### Ambiguous provider outcome

Show `送信結果を確認しています`; preserve context; no blind Retry while duplicate delivery is possible; no Waiting/Done until reconciliation provides sufficient evidence.

### Provider evidence confirmed / domain re-evaluating

If provider acceptance evidence is sufficient but Product projection has not yet been recomputed, copy may say `送信を確認しました。状態を更新しています` without claiming the Responsibility outcome.

### Resulting Product state

Only accepted domain/reducer evidence changes the Moment/Managed projection.

## 14.3 Offline

No hidden later Send queue. Preserve draft; state explicitly that it has **not been sent**.

## 14.4 Japanese IME safety

Explicit Send button is default commit. Enter in multiline editor does not Send.

Keyboard command handling must conservatively exclude IME input:

- track `compositionstart` / `compositionend` session state;
- ignore global/Send/destructive keyboard shortcuts while composition is active;
- ignore command handling when `KeyboardEvent.isComposing` is true;
- defensively treat the browser compatibility edge `keyCode === 229` as IME-processed input where applicable, despite `keyCode` being deprecated;
- test the first/last composition key edge in current Chrome/Firefox/Safari-family targets before accepting a keyboard Send shortcut.

Any future Ctrl/Cmd+Enter Send shortcut requires a separate accepted implementation task and this IME oracle.

---

# 15. Search / retrieval — UI-11

## 15.1 Capability-aware entry copy

If only CORE exact search is active:

> `メールを検索`

Only when natural-language Q&A/operational question capability is actually active may broader copy such as:

> `検索、または質問`

be used.

Do not advertise a disabled/not-implemented AI capability.

## 15.2 Results

May represent Source Conversation/message/file, current operational state where supported, and conditional person/context. Type must be explicit enough not to confuse generated answer with Source evidence.

Progressive disclosure:

```text
current answer/state
-> material change/as-of if needed
-> source links
-> original communication
```

Retrieval never silently mutates Responsibility state.

## 15.3 Zero

Say no authorized match was found; preserve query/scope; never fabricate a plausible answer.

---

# 16. Attachment evidence — UI-12

CORE = attachment existence/provenance + a supported safe evidence-access path.

States:

```text
available + native preview supported
available + safe open/download/provider fallback
local preview failed but source access works
provider/security blocked
permission/capability unavailable
```

Provider/security blocks are represented truthfully and never bypassed.

Local renderer failure is local degradation. If inaccessible evidence materially breaks an already delegated promise, surface affected-scope Integrity.

Opening/previewing is not completion evidence.

---

# 17. App sign-in / session — UI-01

## 17.1 Boundary

Lunowa app authentication answers `who is using Lunowa?` and is separate from `which mailbox granted which capabilities?`.

Do not duplicate provider OAuth semantics into the sign-in screen.

The exact Better Auth/provider/login method is an implementation/auth task, not a Product UI invention in this contract.

## 17.2 States

```text
signed out
authenticating
authenticated
session expired
auth failed
signing out
```

Session-expired UI preserves safe local unsent draft input where architecture permits, explains re-authentication, and never represents mailbox monitoring as stopped solely because this client session expired.

## 17.3 Device/app sign-out

After confirmed sign-out, return to signed-out entry. Where useful, make the consequence clear:

> `この端末からログアウトしました。Lunowaの監視設定は変更されていません。`

Do not disconnect provider authorization or stop server-side monitoring merely from app/device sign-out.

---

# 18. Mailbox connect / initial sync — UI-13 / UI-14

## 18.1 Connect states

```text
not connected
-> authorization starting
-> provider authorization external step
-> callback/pending verification
-> connected
   or denied/cancelled
   or failed
```

Do not claim connected until callback/server authorization is accepted.

Explain in ordinary language:

- what source Lunowa may read/monitor under granted capability;
- what external actions still require explicit authority;
- provider mail remains provider-owned;
- connection alone does not delegate all history.

## 18.2 Initial sync states

```text
not started
syncing / partial coverage
usable Source with incomplete coverage
coverage sufficient for accepted onboarding step
ready
failed / degraded
```

Show coverage/data-through only when truthful. Incomplete coverage is not zero.

Years-old unanswered source does not auto-flood live Needs You/Managed.

---

# 19. First delegation — UI-15

## 19.1 Normal flow

```text
choose one real current loop
-> show bounded monitoring promise
-> [この件を任せる]
-> pending
-> confirmed -> first truthful Managed/appropriate projection
   or failed -> no delegation claim
```

The user-facing promise shows only what matters:

- outcome being watched;
- expected actor/event;
- return/reconsideration condition;
- what still requires explicit user action.

Do not expose Responsibility schema.

## 19.2 No suitable current loop / skip

If no suitable current live loop exists:

- do not manufacture a Responsibility from old mail;
- do not force historical unanswered source into live monitoring;
- show that Source is ready/useful;
- allow the user to finish/skip onboarding and delegate a current item later;
- optional copy: `今は任せる件がなくても大丈夫です。会話はいつでも確認できます。`.

Valid `No Responsibility` / no current delegation is a legitimate state, not onboarding failure.

---

# 20. Integrity / reconnect — UI-16

## 20.1 Integrity anatomy

For material monitoring degradation show:

1. affected capability/account/scope;
2. what is no longer trustworthy;
3. last trustworthy observation/as-of if known;
4. affected delegated-item count/path if known;
5. what remains safe/usable;
6. recovery action.

Example:

```text
Gmailとの同期が停止しています
管理中3件の最新状態を確認できません
最終確認 8:04

[再接続]
[影響する件を見る]
```

## 20.2 Reconnect states

```text
degraded
-> reconnecting
-> provider access restored
-> reconciling missing interval
-> healthy restored
   or failed / still degraded
```

Provider access restoration alone is not healthy Managed. Reconcile the missing interval first.

A send-permission loss does not make read monitoring unhealthy; AI draft failure does not make Source unavailable; attachment preview failure is not global Integrity.

---

# 21. Settings — UI-17

## 21.1 Capability-conditional IA

Only render groups backed by real current capability:

- **アカウントとデータ**;
- **通知と注意** when supported;
- **任せる範囲** when persistent delegation scope exists;
- **操作の権限** for actual supported permissions;
- **プライバシー / AI・データ利用** where policy requires control/disclosure;
- **表示 / 言語 / アクセシビリティ** for supported choices.

No empty autonomy sections, `AIに全部任せる`, global `Always allow send`, or generic workflow builder.

## 21.2 Save state

Each persisted setting uses the common mutation truth:

```text
current accepted value
-> pending new value
-> confirmed
   or failed -> accepted value remains; failure is visible
```

Do not silently display an unsaved toggle as authoritative when failure would change monitoring/notification/permission behavior.

## 21.3 Distinct account actions

Device/app sign-out, provider reconnect, intentional mailbox disconnect and Product-account deletion use separate labels and consequences.

---

# 22. Intentional mailbox disconnect — UI-18

When live delegated loops exist, confirmation includes:

- exact account;
- new source monitoring will stop;
- affected live delegated count/scope;
- inspect affected items;
- stopping monitoring != successful external completion;
- only actual known data/source consequences.

Commit wording is precise, e.g. `このメール連携を解除`.

States:

```text
confirmation
-> disconnect pending
-> confirmed -> source capability/monitoring ends per accepted contract
   or failed -> prior accepted connection/monitoring remains until evidence says otherwise
```

After confirmation do not turn affected loops into successful Done.

---

# 23. Product-account deletion — UI-19

This final public-release flow is gated by the accepted privacy/legal/data-retention contract.

Do not invent deletion SLA, backup retention, export, billing or provider-revocation guarantees.

When that contract exists, the destructive flow uses:

```text
impact review
-> explicit final confirmation
-> deletion pending
-> confirmed according to actual contract
   or failed with recoverable status/support path
```

The implementation graph may create the navigation/boundary before legal values exist, but release acceptance cannot ship decision-incomplete copy.

---

# 24. Feedback / background-update stability

## 24.1 Place feedback with the object

- draft/send -> composer;
- return-condition/Stop Tracking -> Moment/Managed;
- Review answer -> Review;
- reconnect -> integrity/account area;
- attachment failure -> attachment area.

Toasts may supplement low-risk success but are never the sole carrier of send ambiguity/failure, monitoring-integrity loss, Review, destructive account consequence or permission loss requiring action.

## 24.2 Dialogs

Use for focused consequential decisions such as disconnect/account deletion. Do not modalize ordinary Source opening, Managed inspection or harmless uncertainty.

## 24.3 Background updates

Background state changes must not unexpectedly steal focus, discard input or cause uncontrolled list jumps.

Use stable keys. Preserve the currently focused/edited item. Apply reordering with orientation-preserving behavior; when necessary, signal `更新があります` / apply at a safe boundary rather than moving the user's target underneath them.

Truth can update immediately in the data model without making the visual interface disorienting.

---

# 25. Keyboard / focus / IME

Every Product-critical flow works without a mouse.

Required:

- Tab / Shift+Tab logical order;
- native Enter/Space semantics;
- Escape closes popover/sheet/dialog and returns focus to trigger;
- compact Detail opening moves focus to a meaningful heading/action;
- Back returns focus to originating row where possible;
- resolving/removing an item moves focus predictably only when caused by user action;
- background updates do not steal focus;
- visible focus throughout.

A `/` search shortcut is allowed only when no editable/composition target is active.

If pane splitters ship, drag is not the only mechanism; provide keyboard/non-drag resizing/reset.

IME handling follows §14.4.

---

# 26. Accessibility contract

## 26.1 Baseline

**WCAG 2.2 AA is the release baseline for the web UI.**

Applicable content/controls **must meet** relevant WCAG 2.2 AA success criteria; only standards-defined exceptions apply.

## 26.2 Focus

- visible focus indicator at least ~2 CSS px in robust implementation;
- target focus contrast >=3:1 against adjacent background;
- focus not obscured by sticky nav/banner/composer;
- dialog/sheet focus containment and return;
- no background focus theft.

The 2px/3:1 focus target is intentionally stronger than the minimum AA requirement where practical.

## 26.3 Target / dragging

- WCAG 2.2 AA Target Size (Minimum): >=24×24 CSS px or valid standard exception;
- touch/compact primary controls target roughly >=44×44 CSS px;
- no essential drag-only action;
- small icon glyphs receive adequate hit area.

## 26.4 Contrast / non-color

- normal text must satisfy WCAG 2.2 AA contrast requirements where applicable (generally 4.5:1);
- large text follows the standard threshold;
- UI components/non-text contrast meet the applicable AA criterion;
- color is never the sole state signal;
- functional foreground/surface/border tokens are distinct;
- truncation never removes decision-critical meaning without an accessible full label.

## 26.5 Motion / text scaling / Japanese

- respect `prefers-reduced-motion`;
- no essential information only in animation;
- preserve core flow at required text zoom/reflow conditions;
- tolerate user font substitution;
- avoid relying on long/synthetic italic Japanese text for hierarchy;
- test Japanese expansion and IME.

## 26.6 Programmatic status

Use native semantics and appropriate live regions without unnecessary focus movement:

- polite status for send-start/success, sync/reconnect progress, local save completion;
- assertive alert only when immediate user attention is actually warranted;
- never announce every background monitoring update.

Prefer native links/buttons/lists. Do not create a complex ARIA grid solely to imitate an email client if simpler semantics satisfy the interaction.

---

# 27. Visual implementation system

These are implementation defaults; rendered contrast/visual testing may tune them without changing Product semantics.

## 27.1 Foundation

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

Lunar Gold is not body text on a light surface.

## 27.2 Functional families

Separate foreground/surface/border. Initial contrast-safe foreground directions on white:

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

State chips include text/icon/shape; color alone is insufficient.

## 27.3 Typography

Initial system Japanese sans strategy:

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

Direction:

```text
12–13px  metadata only
14px     secondary/support
15–16px  default body/list
18px     local heading
22–24px  page/Moment heading
```

Japanese body line-height generally ~1.5–1.7 depending on density/context. Do not reduce core text just to preserve pane count.

## 27.4 Spacing / shape / density

4px-derived scale:

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48
```

- chips/small controls radius ~8–10px;
- cards/panels ~12–16px;
- dialog/sheet ~16–20px;
- shadows restrained, mainly overlays;
- Source rows roughly 60–68px starting target;
- attention rows roughly 68–80px as content needs;
- touch hit areas satisfy §26.

Whitespace/typography hierarchy beats dashboard-card nesting.

---

# 28. UI read-model boundary

Frontend consumes purpose-built read models/projections. It does not reconstruct canonical Responsibility truth from raw provider messages.

## 28.1 Common envelope

Material screens need enough data to express:

```text
content payload
source/provenance links
source data readiness / as-of
affected monitoring posture
monitoring integrity
capability availability
pending mutation/effect state
```

## 28.2 Attention item

```text
stable UI key
kind: NEEDS_YOU | REVIEW_SUBJECT   # UI discriminator only
person/org/topic
one current action/question
material due/delay tier?
why-now?
source link
material integrity/capability exception?
```

## 28.3 Moment

```text
primary question
projection display
safe primary action descriptor?
what changed
what remains
expected event / return condition?
material temporal display?
evidence receipts
source links
additional Responsibility summaries
monitoring posture + integrity
available controls/capabilities
pending mutation/effect state
```

Client never infers safe action from source text.

## 28.4 Managed

```text
healthy monitored count
integrity summary
inspection items when opened
last trustworthy observation / data-through?
```

Healthy count already excludes Review/Needs You/degraded/stopped/non-delegated.

## 28.5 Review

```text
exact question
subject display
minimal decision evidence
bounded choices/safe input
source links
real urgency/delay metadata?
pending answer state
```

Internal Review subject type remains explicit at server/domain boundary even when presentation is unified.

## 28.6 Source

```text
conversation/message evidence
provider/account identity
attachments/provider observations
optional projection links
reply capability
source freshness
```

## 28.7 Session/account

```text
app session state
connected mailbox identity
per-capability availability
sync coverage
monitoring integrity
reconnect/disconnect mutation state
```

App session and mailbox authorization remain separate.

## 28.8 Send operation

Expose enough state to distinguish:

```text
local draft
request pending
provider definite failure / ambiguous / acceptance evidence
reconciliation status
resulting current projection
```

No boolean `success` substitutes for these boundaries.

---

# 29. UI event boundary

UI emits **intent**, never canonical state mutation.

Examples:

```text
sign in / sign out
open Moment / Source / Managed
answer Review
request Return Attention Now
request return-condition change
request Stop Tracking
request first delegation
start/edit contextual reply
request Send
request connect/reconnect/disconnect mailbox
request Settings change
request Product-account deletion
```

Server/domain/provider boundaries validate authority, persist/reconcile, then return accepted read models.

Components do not set Responsibility state because a button label suggests it.

---

# 30. Reusable component map

Suggested components, not API/schema authority:

### Shell
- `AppShell`
- `PrimaryNav`
- `SurfaceListPane`
- `DetailPane`
- `SupportingPane`
- `IntegrityBanner`

### Rows
- `AttentionRow`
- `ManagedRow`
- `ReviewRow`
- `SourceConversationRow`
- `SearchResultRow`

### Moment / trust
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

### Communication
- `ContextualComposer`
- `RecipientEditor`
- `AttachmentTray`
- `SendStatus`

### Review
- `ReviewQuestion`
- `EvidenceComparison`
- `BoundedChoiceGroup`

### Source/search
- `MessageThread`
- `MessageCard`
- `AttachmentEvidence`
- `SearchBox`
- `SearchScope`

### Session/account/system
- `SignInPanel`
- `SessionExpiredPanel`
- `ConnectAccountCard`
- `SyncCoverageStatus`
- `ReconnectPanel`
- `AffectedMonitoringList`
- `CapabilityStatus`
- `MutationStatus`

---

# 31. Material state matrix

Use shared axes rather than one screen-specific enum.

| Surface | Normal | Empty / intentional none | Pending | Partial / unknown | Failed / degraded |
|---|---|---|---|---|---|
| App session | authenticated | signed out | authenticating/signing out | session expiring/expired | auth error |
| Home | typed attention + Managed truth | strict zero only when valid | refresh preserves current view | sync/data-through; no false all-clear | scoped Integrity |
| Needs You | actionable rows | no Needs You (Review may still exist) | user mutation stays object-local | incomplete coverage explicit | affected scope not falsely hidden |
| Moment | accepted projection | n/a/history as appropriate | return/stop/etc. shows pending | source/integrity uncertainty explicit | mutation/capability failure local/scoped |
| Managed | healthy reassurance | no delegated monitoring | Stop/return change pending | integrity not established | exclude degraded scope from healthy reassurance |
| Review | current question | hidden when none | answer pending | evidence still unresolved | answer failure keeps question |
| Source | current source | no source/match | refresh/sync local | partial/data-through | cached/as-of or unavailable |
| Composer | editable draft | n/a | Send pending | ambiguous provider state | failure preserves draft |
| Search | exact/active capability | honest no result | query progress preserves prior | source scope/data-through explicit | capability-scoped unavailable |
| Connect mailbox | connected | not connected | authorizing/verifying | n/a | denied/cancelled/error |
| Initial sync | ready | no source yet is not all-clear | syncing | partial coverage | sync degraded/failed |
| First delegation | accepted live loop | skip/no suitable loop is valid | delegation pending | semantic Review as separately justified | failure means not delegated |
| Reconnect | healthy after reconciliation | n/a | reconnecting/reconciling | missing interval known/unknown | remains degraded |
| Settings | accepted values | unsupported control absent | save pending | n/a | save failed; accepted value remains |
| Disconnect | connected | already disconnected | disconnect pending | n/a | failure leaves prior accepted connection |
| Account deletion | active account | n/a | deletion pending | release contract may be unavailable | failure/support state |
| Attachment | safe access | no attachment | preview/load pending | local preview unsupported | local failure / provider-security block distinguished |

AI unavailable never automatically creates Review/Needs You/No Responsibility. Deterministic Source/manual paths remain where capability supports them.

---

# 32. Attention delivery / notifications

Opening the app shows current accepted state regardless of notification history.

Mapping direction:

```text
Silent
  -> no interruptive notification

Awareness
  -> passive/in-app/digest only by policy

Normal Attention
  -> ordinary delivery at a safe review point

Urgent Attention
  -> time-sensitive interruption only when actual delay cost warrants

Integrity Alert
  -> severity based on monitoring-promise impact, not label alone
```

Notification tap deep-links to the relevant Moment/Review/integrity recovery. Do not open generic Inbox merely because the trigger originated from email.

Message arrival alone never determines delivery.

---

# 33. Acceptance-oracle routing

## 33.1 Minimum Complete Delegation Loop

- UI-04/05/10 -> `PG-01` through `PG-06`.

## 33.2 Control / Review

- UI-04/06/07 -> `PG-07` through `PG-19`.

## 33.3 Failure / degraded

- UI-02/10/12/16/20 -> `PG-20` through `PG-30`.

## 33.4 Account / lifecycle / Settings

- UI-01 and UI-13 through UI-19 -> `PG-31` through `PG-41`.

In particular:

- PG-39 binds app sign-out != monitoring stop;
- PG-41 binds stopped/no delegated monitoring != healthy Managed all-clear.

## 33.5 Communication edges

- Source/Moment/Review/Attachment -> `PG-42` through `PG-52`.

## 33.6 Managed / Review / zero / retrieval

- Home/Managed/Review/Search -> `PG-53` through `PG-65`.

## 33.7 Responsibility semantic truth

When UI consequence depends on semantic classification, implementation tests use the relevant canonical Responsibility decision/oracle/transition plus Product Golden Scenario consequence. UI fixtures never become semantic authority merely because they are convenient.

---

# 34. Verification contract before UI implementation acceptance

## 34.1 Static/component

- applicable WCAG contrast checks;
- icon controls have accessible names;
- state not conveyed by color alone;
- core screens have normal/empty/pending/unknown/degraded fixtures;
- unsupported controls/capabilities absent.

## 34.2 Product interaction

Verify at minimum:

- app sign-out does not imply monitoring stop;
- Home typed Needs You/Review route correctly;
- true zero only under PG-55 conditions;
- Needs You row -> Moment;
- Source row -> Source;
- Source status affordance -> Moment;
- Managed inspection does not create MY_TURN;
- Stop Tracking pending/confirmed/fail semantics;
- Review answer pending/fail/auto-resolution focus behavior;
- return-condition pending/confirmed/fail truth;
- exact-only Search does not advertise Q&A;
- first onboarding may finish with no suitable loop;
- Send pending/fail/ambiguous/provider-evidence/domain-result boundaries;
- AI draft failure leaves manual reply;
- attachment preview failure leaves safe evidence access when available;
- provider/security block is not bypassed;
- reconnect stays degraded until missing interval reconciliation;
- Settings save failure does not leave false accepted toggle;
- disconnect pending/failure/confirmed behavior;
- Product-account deletion copy remains release-gated to actual legal/data contract.

## 34.3 Keyboard / accessibility

- full core flow keyboard-operable;
- visible focus and focus return;
- no focus obscured by sticky UI;
- no background focus theft;
- status updates programmatically announced;
- no essential drag-only splitter;
- reduced motion;
- Japanese IME first/middle/last composition keys cannot trigger Send/global/destructive shortcuts;
- 200% scaling/reflow behavior checked where WCAG requires.

## 34.4 Responsive

At minimum test representative content at:

```text
~1600+ very wide
1440
1180
900
768
720 boundary
390 / 430 compact
```

Also test 125%, 150%, 200% zoom/text scaling. Use content fit, not screenshot-only pixel similarity.

## 34.5 Visual

Compare rendered implementation against relevant references:

- `00` brand;
- `01` component system;
- `02` shell;
- applicable Moment `03`–`08`;
- `10` Search when active;
- `17` system states;
- `18`/`19` responsive.

Current text authority wins screenshot conflicts.

---

# 35. Open usability hypotheses

Implementation readiness is not empirical proof of optimal presentation.

Still test later:

- exact Japanese microcopy;
- Home attention section density/order within semantic constraints;
- row density;
- final breakpoint tuning;
- default landing after trust is earned;
- notification defaults;
- promotion of NL search/person context/digest/quiet hours;
- full-client vs companion/hybrid mature form;
- optional power-user shortcut set.

These remain hypotheses, not blockers to implementing a coherent complete loop unless real implementation/testing exposes a contradiction.

---

# 36. Issue #55 completion criterion

UI/UX is implementation-ready only when:

1. this contract and canonical Design/Interaction/Responsive docs have no material contradiction;
2. every v1 CORE/release-required surface is accounted for, including app session vs mailbox authorization;
3. every material surface has normal/empty-or-none/pending/unknown/degraded behavior as applicable;
4. monitoring posture, monitoring integrity, capability and delivery remain distinct;
5. internal mutations and external effects never show premature accepted state;
6. responsive behavior preserves place/draft/source/safety semantics;
7. WCAG 2.2 AA/testable accessibility and Japanese IME oracles are explicit;
8. component/read-model/event boundaries do not create domain authority;
9. Product Golden Scenarios and Responsibility oracles route acceptance;
10. visual references remain subordinate to current semantics;
11. repository authority routing points future implementation work to this file;
12. a full cumulative acceptance audit passes;
13. exact-head repository CI passes before merge.

After Issue #55, the next Product-completion task is **Implementation Graph decomposition**, not more open-ended UI brainstorming.