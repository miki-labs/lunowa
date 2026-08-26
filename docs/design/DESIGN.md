# Lunowa Design Specification

## Status

**Canonical product-design source of truth, reconciled with the 2026-08-27 Product contract and Responsibility v0.1 semantics.**

This document owns Lunowa's accepted high-level information architecture, visual principles, and design guardrails. `docs/product/PRODUCT.md` owns Product purpose/scope; `docs/product/responsibility/` owns Responsibility semantics; `INTERACTIONS.md` owns detailed behavior; `RESPONSIVE.md` owns viewport adaptation.

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

Design must support enough ordinary communication to complete the Attention loop without forcing unnecessary context switching:

- authorized Source Conversation/message browsing;
- exact/search retrieval;
- relevant attachment preview/open;
- Needs You / Moment / Managed / Review / Source behavior;
- contextual Reply / Reply All;
- bounded draft assistance;
- explicit Send with visible sender/recipients/attachments;
- provider send-result reconciliation states;
- explicit Later/return conditions where semantically valid;
- monitoring-integrity/error/degraded states;
- pinning as explicit retrieval control;
- basic person context for communication restoration.

### Not required for initial Product proof

Unless later Product evidence justifies them, design must not make v1 completion depend on:

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

1. **Home / Landing** — current attention summary;
2. **Needs You / 対応が必要** — actionable USER work;
3. **Managed / Lunowaが見ています** — delegated monitoring assurance/inspection;
4. **Review / 確認** — material ambiguity/safety question, shown only when useful;
5. **Source Conversations / 会話** — original communication and ordinary source browsing;
6. **Moment / 今の要点** — context handoff for one active Responsibility/question.

Home is composition, not a semantic state.

## 4.2 Home hierarchy

Home should answer within seconds:

1. Do I need to do anything now?
2. Is there a material uncertainty/safety issue?
3. Is Lunowa still carrying delegated work?
4. Can I reach original communication immediately?

Candidate hierarchy:

```text
確認が必要             1     # only if material/non-zero
あなたの対応           3

[attention items]

Lunowaが見ています    14
現在、追加対応が必要なものはありません

[会話を見る]
```

Do not require Inbox triage before showing current attention.

## 4.3 Primary navigation direction

Exact copy/order remains a usability hypothesis, but high-frequency navigation should be organized around user jobs rather than every domain projection.

Recommended direction:

```text
Lunowa

ホーム
対応が必要
管理中
確認          # conditional/non-zero; need not be permanently visible
会話
ピン留め

検索
設定
```

`待ち` / `あとで` / `完了` remain inspectable projections/filters, but normally do not need permanent high-frequency top-level destinations.

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

On intentional inspection, show tracked outcome, expected actor/event, relevant return condition, integrity status, and source access.

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

## 6.2 Progressive disclosure

```text
current conclusion / safe action
-> short material reason
-> source-grounded evidence/provenance
-> original Conversation / attachment
```

Do not permanently show raw model confidence, chain-of-thought, or agent activity.

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

Primary selection prefers material/overdue actionable USER work, near user source due, blocking work, and other high-attention work rather than newest message.

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
-> provider pending/success/ambiguous result
-> domain re-evaluation after reconciliation
```

## 7.2 Reply composer

Keep near the active Moment/Conversation and closer to modern messaging than a disconnected form page.

Show effective sending identity before send. Reply All must make recipients explicit.

Support the basic text/attachment operations needed by validated flows. Do not make advanced formatting/signature/template parity a v1 acceptance gate.

## 7.3 Fresh compose

Fresh/arbitrary new-mail composition may open the provider or use an optional Lunowa convenience surface.

No Product flow may assume that native fresh compose is required before the core Attention Delegation loop can be tested.

## 7.4 Send safety

A Send click is not provider acceptance.

Ambiguous provider results preserve context and avoid blind duplicate retry. Responsibility state changes only after accepted provider/domain semantics justify it.

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

Integrity Alert is a system/degraded state, not a fake Responsibility/Review item.

## 8.4 Quiet hours

Quiet hours suppress interruption, not monitoring. Never visually imply monitoring paused merely because delivery is quiet.

---

# 9. Search / Operational Retrieval

Search is first-class navigation, not a separate chat Product.

Support:

- exact Source Find;
- source-grounded Fact Answer where implemented;
- Operational Recall (`この件どうなってる？`);
- Context Recall for relevant communication history.

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

People/company context exists for communication restoration, not CRM management.

Candidate content:

- authorized identity/organization context;
- current open Responsibilities involving the person;
- recent material topics/history;
- relevant source Conversations/files.

Do not make relationship scores, personality profiles, public enrichment, network graphs, or deal stages v1 core.

---

# 11. Attachments

Preview safe/useful file types in context where practical. If preview is unreliable, preserve context and offer download/open externally.

Opening/previewing is not automatic completion evidence.

Contextual reply may support basic attachment addition when required by the active loop.

---

# 12. Trust / uncertainty / integrity design

## 12.1 Highest-risk false negative

A true material USER obligation must not be incorrectly hidden as Waiting/Done/Later/NONE without adequate evidence.

But defensive Review/notification spam is also Product failure.

## 12.2 Provenance

Material facts should expose source/trusted observation on demand.

Evidence beats decorative AI confidence.

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
4. what the user can do now.

Do not continue stale `everything handled` reassurance.

---

# 13. Pinning and mailbox hygiene

Pin is explicit user retrieval control and stays orthogonal to Responsibility semantics.

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

Functional projection colors remain separate from brand identity. Initial semantic families:

- My Turn — coral/red;
- Later — amber/orange;
- Waiting — blue;
- Done — mint/green;
- Review — neutral/attention color that does not imply success/failure.

Color must never be the sole signal.

## 14.3 Typography / density

Use a highly readable Japanese-capable sans-serif. Use weight/spacing for hierarchy rather than oversized headings.

Keep useful density without turning surfaces into enterprise dashboards.

## 14.4 Cards / borders / shadows

Prefer light neutral/ivory background, subtle borders, soft radius, restrained shadows, generous-but-efficient spacing.

Avoid glassmorphism, heavy gradients, strong shadows, and dashboard-card overload.

## 14.5 Icons / motion

Use a consistent line-icon family. Motion preserves orientation rather than decorates; respect reduced motion.

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
-> Source remains intact
-> choose one real current loop
-> show what Lunowa will watch / when it returns / what it will not do
-> [この件を任せる]
```

Do not begin with profiles, feature carousel, taxonomy tutorial, generic rule builder, multi-account organization, or broad AI preference setup.

Historical initial sync must not activate years-old unanswered mail as live work by default.

---

# 17. Error/offline/update principles

Keep working where possible; preserve user input/context; explain impact and recovery; use cached source when safe; isolate provider/account failures; preserve draft on send failure/ambiguity; avoid list jumps on new mail; do not destroy active input during app update.

AI failure leaves ordinary Source reading, basic search, reply/manual drafting, and existing accepted state usable where actual runtime supports them.

---

# 18. Accessibility baseline

Support:

- visible keyboard focus;
- logical keyboard navigation;
- semantic labels for icons;
- adequate touch targets;
- non-color-only state meaning;
- readable contrast;
- reduced motion;
- zoom/text resizing without breaking the core flow;
- no hidden safety/review information on narrow screens.

---

# 19. Reference interpretation

Generated screenshots are visual references, not semantic/data authority.

Ignore incidental sample dates/names/amounts/counts/files, legacy state wording, impossible data, provider-specific examples, and accidental color/copy inconsistencies.

Use images for composition, hierarchy, density, scale, visual tone, and reusable component appearance. Use current Markdown for Product semantics, authority, behavior, edge cases, accessibility, and conflict resolution.

---

# 20. Design source-of-truth priority

For design-specific conflicts:

1. `docs/product/PRODUCT.md` for Product scope/value;
2. `docs/product/responsibility/` for Responsibility semantics;
3. current `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` for UX behavior;
4. accepted ADR/architecture contracts for runtime/authority boundaries;
5. visual references for intentional visual treatment only.

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
10. does not add provider/client breadth merely because it is familiar or easy to code.

Do not add a feature merely because AI makes it easy to implement.