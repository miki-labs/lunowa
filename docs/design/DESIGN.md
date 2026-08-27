# Lunowa Design Specification

## Status

**Canonical product-design source of truth, reconciled through 2026-08-28 with the Product contract, Responsibility v0.1 semantics, and the v1 UI implementation-readiness contract.**

This document owns Lunowa's accepted high-level information architecture, visual principles, and design guardrails. `docs/product/PRODUCT.md` owns Product purpose/scope; `docs/product/responsibility/` owns Responsibility semantics; `INTERACTIONS.md` owns detailed behavior; `RESPONSIVE.md` owns viewport adaptation; `V1-UI-IMPLEMENTATION-CONTRACT.md` owns implementation-facing screen/state/component/read-model decisions that realize these authorities without redefining them.

Generated screenshots under `docs/design/references/` remain visual references only. When a screenshot conflicts with current Markdown Product/domain semantics, current Markdown wins.

---

# 1. Design intent

Lunowa should not win by maximizing features, visible AI, Inbox density, dashboards, or provider parity.

### North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

### Core design principle

> **Eliminate work, not control.**

Reduce monitoring, reconstruction, navigation, and repeated decisions while preserving source visibility, user authority, correction, and safe fallback.

### Surface obligations, not activity

The primary UI should emphasize **current user attention obligations**, not message arrival, unread count, or generic importance.

```text
mail/evidence changes
!=
user must see something now
```

---

# 2. Current v1 Product-design scope

The current Product direction is a **companion/hybrid, one-provider complete-loop proof**, not immediate Gmail/Outlook parity.

Design must support the **V1 CORE** capabilities needed to complete the Attention loop without unnecessary context switching:

- authorized Source Conversation/message browsing;
- exact Source search and Product-required operational retrieval;
- authorized attachment evidence access through a supported safe path;
- Needs You / Moment / Managed / Review / Source behavior;
- contextual Reply / Reply All;
- bounded draft assistance with manual fallback;
- explicit Send with visible sender/recipients/attachments where supported;
- provider send-result reconciliation states;
- explicit Later/return conditions where semantically valid;
- monitoring-integrity/error/degraded states;
- account connect/reconnect/disconnect controls required by the one-provider loop;
- capability-conditional Settings required for safe operation.

### Strong candidates / optional breadth

The following may improve v1 but are **not automatic Product-completion gates** unless a later accepted task promotes them:

- rich native attachment preview beyond the CORE evidence-access path;
- basic person context for communication restoration;
- natural-language search beyond the accepted CORE retrieval job;
- reply attachment add where no validated core scenario requires it;
- pinning as an explicit retrieval convenience;
- optional digest / simple quiet-hours preference UI.

### Not required for initial complete-loop implementation

Unless later Product evidence/task authority justifies them, design must not make v1 completion depend on:

- second provider or broad multi-account parity;
- full generic new-compose parity;
- full Drafts/Sent/folder/label administration;
- Send Later parity;
- bulk mailbox actions;
- provider spam/block/unsubscribe administration;
- full contact manager;
- CRM/project/calendar-first surfaces;
- relationship graph/health scoring;
- generic automation/rule builder;
- generic AI chat homepage;
- broad autonomous external actions.

Arbitrary new Compose may use provider fallback or exist as optional convenience. Existing-loop contextual communication is more Product-critical.

---

# 3. Core Product model in the UI

## 3.1 Conversation != Responsibility

A Conversation may contain zero, one, or many independent Responsibilities.

```text
Conversation
├─ immutable/authorized communication evidence
└─ 0..N Responsibilities
```

Responsibility identity and accepted state come from canonical domain semantics, not UI buckets.

## 3.2 Projection vocabulary

The UI may use:

- `対応が必要` / My Turn;
- `待ち` / Waiting;
- `あとで` / Later;
- `完了` / Done;
- `確認` / Review.

They are projections, not one lifecycle enum.

`Review` may display either a pre-admission subject or an admitted Responsibility with material uncertainty; internal subject distinction remains preserved.

## 3.3 Mailbox state is orthogonal

```text
Unread  != Needs You
Read    != Done
Archive != Closed
Trash   != Cancelled
Snooze  != Later
Star    != Responsibility importance
```

Never visually imply otherwise.

---

# 4. Product surface architecture

## 4.1 Conceptual surfaces

The current v1 design direction uses:

1. **Home / Landing** — current attention composition;
2. **Needs You / 対応が必要** — actionable USER work;
3. **Managed / Lunowaが見ています** — delegated monitoring assurance/inspection;
4. **Review / 確認** — material ambiguity/safety question, shown only when useful;
5. **Source Conversations / 会話** — original communication and ordinary source browsing;
6. **Moment / 今の要点** — context handoff for one active Responsibility/question.

Home is composition, not a semantic state.

## 4.2 Home hierarchy

Home should answer within seconds:

1. Do I need to act or decide on anything now?
2. Is a material monitoring/integrity promise degraded?
3. Is Lunowa still carrying delegated work when I am not needed?
4. Can I reach original communication immediately?

Implementation direction:

```text
[material scoped Integrity status, only if needed]

今、あなたに必要なこと
  [typed Needs You / Review items]

Lunowaが見ています    14
[truthful quiet reassurance when permitted]

[会話 / 検索]
```

Needs You and Review remain semantically distinct even when Home composes them into one attention region. Every item carries its type and routes to its owning interaction.

**Do not enforce a fixed `Review always before Needs You` order.** Presentation follows explicit Product attention/delay tiers and decision relevance; a nonurgent Review does not outrank urgent/current user work merely because it is Review. An urgent/blocking Review may legitimately rank first. Ordering must not come from one opaque AI priority score.

A nonurgent unresolved Review still prevents strict true-zero/all-clear copy even when it does not justify interruption.

Do not require Inbox triage before showing current attention.

## 4.3 Primary navigation direction

Exact copy/order remains a usability hypothesis, but high-frequency navigation should be organized around user jobs rather than every domain projection.

Recommended default direction:

```text
Lunowa

ホーム
対応が必要
管理中
確認          # conditional/non-zero; need not be permanently visible
会話

検索
設定
```

`待ち` / `あとで` / `完了` remain inspectable projections/filters, but normally do not need permanent high-frequency top-level destinations.

`ピン留め` may be exposed as a secondary retrieval convenience when activated; its existence is not a current CORE navigation requirement.

Generic `＋ 新規メール` is optional convenience rather than a required primary Product action.

---

# 5. Stable shell / adaptive content

## 5.1 Desktop shell

The accepted spatial model remains:

```text
Sidebar | List / Surface | Detail
```

The shell is stable; the **object in the middle pane changes** by Product surface.

Examples:

```text
Needs You
Sidebar | Attention Items | Moment

Managed
Sidebar | Managed Items | Monitoring Detail / Moment

Source
Sidebar | Conversations | Conversation Detail

Search
Sidebar | Results | Result Detail
```

On very wide windows a user-opened contextual supporting pane may show Source/provenance/attachment/person context, but extra width must not automatically create a permanent fourth dashboard column.

This preserves orientation without making Source Inbox the only primary work model.

## 5.2 Source Conversation list

Source rows prioritize:

1. person/organization;
2. topic/subject;
3. useful preview;
4. time/date;
5. one projection/account signal only when useful.

Source list is not an unread-debt dashboard.

## 5.3 Attention list

Needs You items prioritize:

1. person/organization/topic;
2. one current action/question;
3. material due/delay signal;
4. concise `why now` when non-obvious.

Order by explainable attention tiers, not newest message and not an opaque AI score.

## 5.4 Managed list

Default Managed view should reassure rather than advertise backlog.

```text
Lunowaが見ています 14
現在、追加対応が必要なものはありません
最終同期: 2分前

[管理中を見る]
```

Use reassurance copy only when current integrity and membership actually justify it. On intentional inspection, show tracked outcome, expected actor/event, relevant return condition, integrity status, and source access.

---

# 6. Moment View / 今の要点

## 6.1 Purpose

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Moment is a temporal handoff after offload, not a generic AI thread summary.

It should answer with minimum text:

```text
WHY NOW?      なぜ今戻った？
WHAT CHANGED? 何が変わった？
WHAT REMAINS? 何がまだ未完了？
WHAT NEXT?    今何をすればいい？
```

Not every screen needs these literal headings.

## 6.2 Progressive disclosure / trust

Default trust hierarchy:

```text
current conclusion / safe action
-> short material reason
-> source/provider/user-origin evidence receipt
-> original Conversation / attachment
```

Evidence/source is the trust path. Do not permanently show model confidence, generated chain-of-thought, verbose model rationale, or agent activity as proof.

## 6.3 Multiple Responsibilities

Do not render multiple equal-priority CTAs.

```text
Primary item
[ one safe primary action ]

────────
Other items
- item/status
- item/status
```

Primary selection prefers material/overdue actionable USER work, near material USER due, blocking work, and other high-attention work rather than newest message.

## 6.4 Projection-specific meanings

- `MY_TURN` → **今、何をすればいい？**
- `WAITING` → **今は誰/何を待っている？**
- `LATER` → **いつ/何で戻る？**
- `DONE` → **なぜもう見張らなくてよい？**
- `REVIEW` → **何を確認すれば安全に進められる？**

Follow-up normally appears as a My Turn reason/action, not separate lifecycle species.

---

# 7. Contextual communication design

## 7.1 Reply is Product-critical; generic compose is not

When a Moment requires communication, the user should normally be able to finish it without reconstructing context in another client.

Candidate flow:

```text
Moment
-> [返信する]
-> bounded contextual composer
-> sender / recipients / content / attachments visible
-> explicit Send
-> request pending
-> provider acceptance / failure / ambiguity
-> reconciliation
-> domain re-evaluation
```

## 7.2 Reply composer

Keep near the active Moment/Conversation and closer to modern messaging than a disconnected form page.

Show effective sending identity before Send. Reply All must make recipients explicit.

Support the basic text/attachment operations required by the accepted flow. Do not make advanced formatting/signature/template parity a v1 acceptance gate.

Japanese IME behavior is acceptance-critical: composing text must not accidentally trigger Send or another shortcut, and Enter in the multiline editor is not implicit Send.

## 7.3 Fresh compose

Fresh/arbitrary new-mail composition may open the provider or use an optional Lunowa convenience surface.

No Product flow may assume that native fresh compose is required before the core Attention Delegation loop can be completed.

## 7.4 Send safety / async truth

A Send click/request is not provider acceptance, and provider acceptance is not automatically Responsibility closure.

While pending, preserve composer context and prevent duplicate commit. Ambiguous provider results preserve context, avoid blind retry and remain in an explicit reconciliation posture. Responsibility projection changes only after accepted provider/domain evidence justifies it.

Routine success feedback stays local/low-stimulation; failed or ambiguous consequential effects must never rely on a transient toast alone.

---

# 8. Temporal and delivery UX

## 8.1 Temporal Contract

A Temporal Contract is the accepted durable promise describing when a Responsibility is reconsidered.

Example:

```text
8月27日 9:00に再確認します

田中さんから返信が来れば、
それより先に再評価します。

[条件を変更]
```

Do not conflate source due, expected-event time, user target, resurface time, or follow-up time.

A user request to modify the return condition remains visibly pending until the durable contract change is accepted; UI copy must not claim the new promise prematurely.

## 8.2 Trigger != notification

A trigger causes current evidence/state re-evaluation. Notification follows separate delivery policy.

## 8.3 Delivery visibility

Product-level lanes are:

- Silent;
- Awareness;
- Normal Attention;
- Urgent Attention;
- Integrity Alert.

Awareness-only information does not create durable Needs You work.

Integrity Alert is a system/degraded state, not a fake Responsibility/Review item. Its delivery severity follows actual monitoring-promise impact rather than the label alone.

## 8.4 Quiet hours

Quiet hours suppress interruption, not monitoring. Never visually imply monitoring paused merely because delivery is quiet.

---

# 9. Search / Operational Retrieval

Search is first-class navigation, not a separate chat Product.

CORE supports exact Source Find and the minimum accepted operational-retrieval job. Additional natural-language breadth remains conditional on the current Product/task scope.

Potential supported jobs include:

- exact Source Find;
- source-grounded Fact Answer where implemented;
- Operational Recall (`この件どうなってる？`) where implemented;
- Context Recall for relevant communication history where implemented.

Traditional exact/operator-style retrieval remains available when more reliable.

Material changing answers should show current/as-of state and material supersession when useful.

Search/semantic similarity never becomes Responsibility identity, permission, merge, or mutation authority.

Search result progressive disclosure:

```text
answer/current state
-> material change/why
-> relevant source
-> full original communication
```

---

# 10. People context

People/company context is a **strong candidate**, not a current CORE implementation gate. If activated, it exists for communication restoration, not CRM management.

Candidate content:

- authorized identity/organization context;
- current open Responsibilities involving the person;
- recent material topics/history;
- relevant source Conversations/files.

Do not make relationship scores, personality profiles, public enrichment, network graphs, or deal stages v1 core.

---

# 11. Attachments

The CORE obligation is **authorized attachment evidence access**, not universal native preview.

Where provider/security/runtime capability permits, preserve attachment existence/provenance and let the user reach evidence through a supported safe path such as open, download or provider-native fallback without losing Moment/Conversation context.

Rich native preview is a strong candidate. If local preview fails while safe source access remains available, degrade locally. If the provider/platform blocks unsafe/unsupported content, represent the block truthfully and do not bypass it.

Opening/previewing is not automatic completion evidence.

Contextual reply may support basic attachment addition when required by the accepted active-loop scope.

---

# 12. Trust / uncertainty / integrity design

## 12.1 Highest-risk false negative

A true material USER obligation must not be incorrectly hidden as Waiting/Done/Later/NONE without adequate evidence.

But defensive Review/notification spam is also Product failure.

## 12.2 Provenance

Material facts should expose source/trusted observation on demand.

Evidence beats decorative AI confidence or explanation theater.

## 12.3 Review

Ask the user only about material decision-critical ambiguity/safety issues that cannot be resolved more cheaply/safely.

Show the exact question, minimum conflicting evidence, bounded choices, and source access.

## 12.4 High-risk request

```text
requested action != safe next action
```

Payment/contract/login/destructive/high-impact requests may surface verification/identity/decision rather than blind execution.

Prompt/tool-like content inside source mail never grants application authority.

## 12.5 Monitoring integrity

If source/provider/scheduler/reconciliation monitoring cannot be trusted, surface:

1. what failed;
2. what delegated scope is affected;
3. last trustworthy observation if known;
4. what remains safe/usable;
5. what the user can do now.

Do not continue stale `everything handled` reassurance. Integrity state stays separate from Needs You/Review unless canonical user work or material user judgment independently exists.

---

# 13. Pinning and mailbox hygiene

Pin is an optional explicit retrieval control and stays orthogonal to Responsibility semantics.

Provider Archive/Delete/Read/Unread/Snooze/Star may be available as secondary/manual conveniences or provider fallback, but do not automatically mutate Responsibility state.

Do not make bulk Inbox hygiene a central Lunowa interaction model.

---

# 14. Visual system

## 14.1 Brand direction

Calm, trustworthy, warm, slightly soft, modern, consumer-friendly without childishness, cleaner than dense enterprise dashboards.

Lunar-rabbit symbol remains primary brand character.

## 14.2 Core brand colors

- **Lunowa Navy:** `#0F1B3D`
- **Lunar Gold:** `#F2D9A6`

`Lunar Gold` is a brand/accent surface color, not body text on a light surface.

Functional projection colors remain separate from brand identity. Initial semantic families:

- My Turn — coral/red;
- Later — amber/orange;
- Waiting — blue;
- Done — mint/green;
- Review — neutral/purple-attention family that does not imply success/failure.

Implementation must separate **foreground, surface and border** tokens for these families. A soft accent color that works as a background is not automatically a contrast-safe text color. Exact implementation token defaults and contrast targets live in `V1-UI-IMPLEMENTATION-CONTRACT.md`.

Color must never be the sole signal.

## 14.3 Typography / density

Use a highly readable Japanese-capable sans-serif. Prefer a resilient system Japanese sans stack initially rather than adding a network-font dependency without measured need.

Use weight/spacing for hierarchy rather than oversized headings. Japanese content must remain legible under user font substitution and browser/text scaling; long Japanese copy should not rely on synthetic italic styling for hierarchy.

Keep useful density without turning surfaces into enterprise dashboards.

## 14.4 Cards / borders / shadows

Prefer light neutral/ivory background, subtle borders, soft radius, restrained shadows, generous-but-efficient spacing.

Avoid glassmorphism, heavy gradients, strong shadows, and dashboard-card overload.

## 14.5 Icons / motion

Use a consistent line-icon family. Motion preserves orientation rather than decorates; respect `prefers-reduced-motion`.

---

# 15. Visual grammar

Use visualization only when better than text:

- date/time change → before/after diff;
- deadline → date + appropriate urgency;
- Waiting → actor/event + waiting condition;
- multiple criteria → concise list/checklist;
- file request → file + safe action;
- temporal sequence → timeline only when materially useful;
- amount change → old → new;
- schedule proposals → candidate slots until agreement.

Never render proposed/unverified information as confirmed merely because AI inferred it.

---

# 16. Onboarding design

> **使い方を教える前に、価値を実際に経験できる状態にする。**

Current first-run direction:

```text
connect one mailbox
-> explain bounded monitoring/authority
-> initial sync with truthful coverage
-> Source remains available as data arrives
-> choose one real current loop
-> show what Lunowa will watch / when it returns / what it will not do
-> [この件を任せる]
```

Do not begin with profiles, feature carousel, taxonomy tutorial, generic rule builder, multi-account organization, or broad AI preference setup.

Historical initial sync must not activate years-old unanswered mail as live work by default, and incomplete sync must never be displayed as a trustworthy zero state.

---

# 17. Error/offline/update principles

Keep working where possible; preserve user input/context; explain **what happened, affected scope, what remains safe, and recovery**; use cached source when safe; isolate provider/account failures; preserve draft on send failure/ambiguity; avoid list jumps on new mail; do not destroy active input during app update.

AI failure leaves ordinary Source reading, deterministic/basic search, manual contextual reply, and existing accepted state usable where actual runtime supports them. It does not create fake Needs You or `No Responsibility`.

Feedback prominence follows consequence:

- routine local success -> local/polite feedback;
- failed/ambiguous external effect -> persistent object-local feedback preserving context;
- monitoring integrity loss -> scoped persistent integrity UI;
- destructive account action -> decision-complete confirmation.

Toasts may supplement low-risk feedback but cannot be the sole carrier of a material failure, ambiguity, Review question, permission loss or integrity issue.

---

# 18. Accessibility baseline

**WCAG 2.2 AA is the current web release baseline.**

Support at minimum:

- visible keyboard focus, with robust high-contrast focus treatment;
- focus not obscured by sticky UI;
- logical keyboard navigation and focus return;
- semantic labels for icon-only controls;
- no essential hover-only or drag-only interaction;
- WCAG 2.2 target-size minimums, with larger touch targets for primary compact-layout controls;
- non-color-only state meaning;
- readable text contrast;
- programmatic async status announcements without unnecessary focus movement;
- reduced motion;
- zoom/text resizing through at least the required standards without breaking the core flow;
- user font substitution / longer Japanese text resilience;
- no hidden safety/Review/integrity information on narrow screens;
- Japanese IME-safe keyboard handling for composer and global shortcuts.

Implementation-testable details live in `V1-UI-IMPLEMENTATION-CONTRACT.md`.

---

# 19. Reference interpretation

Generated screenshots are visual references, not semantic/data authority.

Ignore incidental sample dates/names/amounts/counts/files, legacy state wording, impossible data, provider-specific examples, and accidental color/copy inconsistencies.

Use images for composition, hierarchy, density, scale, visual tone, and reusable component appearance. Use current Markdown for Product semantics, authority, behavior, edge cases, accessibility, and conflict resolution.

---

# 20. Design source-of-truth priority

For design-specific questions:

1. `docs/product/PRODUCT.md` + `PRODUCT-CONTENT.md` for Product scope/value/operating behavior;
2. `docs/product/responsibility/` for Responsibility semantic truth;
3. `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` for canonical UX meaning;
4. `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` for implementation-facing screen/state/component/read-model realization consistent with 1–3;
5. accepted ADR/architecture contracts for runtime/authority boundaries;
6. visual references for intentional visual treatment only.

`V1-UI-IMPLEMENTATION-CONTRACT.md` resolves implementation-level ambiguity but cannot override a higher-level Product/Responsibility semantic rule. A discovered conflict is reconciled in the owning authority rather than hidden in frontend code.

A screenshot must not revive obsolete full-client scope or superseded lifecycle semantics.

---

# 21. Product-design guardrails

When ambiguous, prefer the option that:

1. reduces monitoring/reconstruction burden;
2. preserves source/control/provenance;
3. surfaces current user obligations rather than activity volume;
4. keeps delegated Waiting inspectable but quiet;
5. avoids unnecessary configuration/questions/approval queues;
6. avoids surprising account/provider behavior;
7. is reversible/correctable where practical;
8. keeps AI out of the core-availability path where possible;
9. does not confuse UI projection/mailbox state with canonical Responsibility truth;
10. does not add provider/client breadth merely because it is familiar or easy to code;
11. does not use fluent AI explanation/confidence as a substitute for source-grounded evidence;
12. distinguishes async request, provider result, reconciliation and resulting domain state rather than showing premature success.

Do not add a feature merely because AI makes it easy to implement.