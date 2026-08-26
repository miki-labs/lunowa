# Lunowa Product Spec v1 Candidate

## Status

**Consolidated Product-content candidate — complete enough for canonical promotion audit, but NOT itself market validation, schema authority, implementation authorization, or Product-market-fit evidence.**

This document consolidates the Product reasoning completed through **2026-08-27** into one coherent Product contract. It specifies purpose, jurisdiction, v1 shape, surfaces, daily operation, onboarding/trust progression, closure, retrieval/history, ordinary communication actions, autonomy, failure recovery, validation, and remaining unknowns.

Current authority remains unchanged until an explicit promotion/reconciliation change updates it:

- `PRODUCT.md` — canonical Product authority;
- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md` — noncanonical doctrine synthesis;
- `V1-PRODUCT-SURFACE-CANDIDATE.md` — noncanonical v1 surface/scope candidate;
- `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md` — noncanonical onboarding/trust candidate;
- `responsibility/` — canonical Responsibility semantics;
- `docs/design/` — accepted detailed UX/interaction behavior;
- `IMPLEMENTATION-PLAN.md` — implementation/evidence sequence.

This candidate does **not** create an `OpenCoordinationLoop` aggregate, `AttentionContract` table, lifecycle enum, global trust score, global autonomy level, permission model, implementation phase, or production authorization.

### Decision labels

- **DOCTRINE CANDIDATE** — durable Product principle proposed for promotion;
- **V1 CANDIDATE** — proposed v1 Product behavior/scope;
- **SUPPORTED INFERENCE** — strongly motivated by evidence but not directly proven for Lunowa;
- **PRODUCT HYPOTHESIS** — Lunowa-specific choice requiring validation;
- **UNKNOWN** — materially unresolved;
- **DEFERRED** — intentionally later;
- **OUT** — outside the Product's current core responsibility.

A Product specification may be complete while its market hypotheses remain unvalidated. **Issue #36 remains the highest-priority problem/ICP discovery gate.**

---

# 1. Product identity

## 1.1 Vision

> **世界一快適なメール体験**

Aspirational vision, not a measurable market claim.

## 1.2 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

## 1.3 Core value

**DOCTRINE CANDIDATE:** Lunowa primarily offers **Attention Delegation**.

> **「この件はもう自分で気にしておかなくていい。必要になったらLunowaが戻す。」**

The target behavioral change is **monitoring relinquishment**: the user stops parallel manual checking because Lunowa carries the monitoring burden safely enough.

## 1.4 Product definition

> **Lunowa is an email-centered communication-monitoring Product that keeps unresolved communication outcomes under control on the user's behalf, stays quiet while the user is not needed, and returns the right issue with enough source-grounded context when attention is genuinely required again.**

## 1.5 Experience doctrine

**DOCTRINE CANDIDATE:** ordinary use is **system-led, not prompt-led**. AI should mostly maintain/prepare context behind the interface rather than require the user to ask an assistant to organize routine communication.

> **Eliminate work, not control.**

Reduce remembering, checking, reconstructing, navigation, and repetitive preparation while preserving source visibility, account/sender identity, user authority, correction, and safe fallback.

## 1.6 Not the Product identity

Lunowa is not primarily:

- Inbox Zero;
- unified inbox;
- AI writing assistant;
- AI chat homepage;
- task manager / project manager;
- CRM / ticket system;
- generic automation/rule builder;
- relationship-scoring Product;
- generic long-term memory assistant;
- general autonomous agent.

---

# 2. Problem, jurisdiction, and ICP status

## 2.1 Problem

**DOCTRINE CANDIDATE:** Lunowa focuses on **unresolved email-borne coordination** whose progress depends on the user, another person/organization, time, an external event, approval, document, payment, decision, or changing evidence.

The strongest current wedge is **Open-loop Monitoring Offload**.

`Open Coordination Loop` is Product-level vocabulary only. `Responsibility` remains the canonical semantic concept for the smallest communication-bounded operational outcome with coherent closure.

## 2.2 Strong-fit characteristics

A case is a stronger fit when several are true:

- it emerges naturally from communication rather than a planned project graph;
- a material outcome remains unresolved;
- another person/event/time/evidence must change before closure;
- waiting is irregular/long enough to create monitoring burden;
- simple snooze is insufficient;
- reply arrival may not equal outcome satisfaction;
- source communication materially evidences state;
- no stronger structured system already monitors the relevant state adequately.

## 2.3 Stewardship modes

- **Primary Steward** — Lunowa carries monitoring where no stronger system adequately owns the heterogeneous communication state.
- **Overlay / Monitor** — another system owns domain truth; Lunowa owns only the communication-attention gap.
- **Out / Reference** — generic tasks, project plans, CRM pipelines, ticket lifecycle, accounting truth, recurring automation, knowledge storage, and broad goals do not become Lunowa-owned merely because email mentions them.

> **Integrate evidence without automatically absorbing domain ownership.**

## 2.4 ICP status

**UNKNOWN:** exact ICP is not validated or frozen.

**PRODUCT HYPOTHESIS:** recruit first from self-managing, asynchronous, email-task-coupled users who personally coordinate several external counterparties, maintain multiple unresolved loops, repeatedly re-check or create reminder scaffolding, face meaningful delay/miss cost, are not already adequately served by a dedicated system of record, and have adoption autonomy.

Independent / small-firm B2B professionals remain a recruitment prior only.

---

# 3. Semantic and authority boundary

## 3.1 Canonical Responsibility semantics remain external authority

This spec relies on, but does not redefine, these FIXED principles from `responsibility/DECISIONS.md`:

- Message / Conversation / Responsibility are distinct;
- a Conversation can contain zero, one, or many Responsibilities;
- Responsibility identity follows the smallest communication-bounded operational outcome with coherent closure;
- `No Responsibility` is a first-class correct outcome;
- admission uses `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`;
- Review may represent pre-admission or admitted-field uncertainty, with subject type preserved;
- multiple obligation legs and expected events are allowed;
- claim and observation are distinct;
- source due, expected-event time, user target, resurface time, and follow-up time are distinct;
- accepted state is evidence-relative;
- important accepted facts require provenance;
- semantic similarity is candidate retrieval, not identity authority;
- resolution, live tracking, and attention/defer are orthogonal;
- send attempt and provider-reconciled acceptance are distinct;
- historical lack of observed closure does not imply live active Responsibility;
- REOPEN applies when the same operational outcome was never actually satisfied; genuinely new work after a truly closed episode normally creates a new Responsibility;
- AI failure must not block ordinary source reading/reply/search;
- no generic workflow engine;
- cross-account semantic auto-merge is prohibited initially.

## 3.2 Product grammar

Without creating a new aggregate:

```text
tracked unresolved operational outcome
  -> Responsibility identity / outcome
  -> obligation legs
  -> expected events
  -> evidence / provenance
  -> temporal / return conditions
  -> completion / closure criteria
  -> uncertainty / authority
```

## 3.3 Action / Expected Event / Outcome

- **Action** — something an actor does;
- **Expected Event** — a future observation that should cause reconsideration;
- **Outcome** — the state the Responsibility is ultimately trying to reach.

A reply can satisfy an expected event without satisfying the outcome.

---

# 4. Attention Contract and Temporal Contract

## 4.1 Attention Contract

**PRODUCT HYPOTHESIS:** `Attention Contract` is Product-level language for the bounded promise:

> Lunowa monitors a specific unresolved outcome, keeps it out of active attention while the user is not materially needed, and returns it under defined evidence/time/attention conditions.

It may describe conceptually:

- monitored outcome/state;
- evidence/expected events;
- silent conditions;
- return conditions;
- delivery urgency;
- authority/review boundaries.

**Attention Contract is not a new persisted object authorized by this spec.**

## 4.2 Temporal Contract

`Temporal Contract` remains the accepted durable mechanism for persisted time/event reconsideration where required. Trigger firing causes re-evaluation of current evidence/state; it does not mechanically imply notification.

## 4.3 Four distinct questions

Always separate:

1. **Operational State** — what changed?
2. **Attention Need** — does the user need to know, decide, or act?
3. **Delivery Urgency** — when/how should attention interrupt?
4. **Authority** — may Lunowa decide/act without explicit approval?

Do not collapse these into one priority/confidence score.

---

# 5. Minimum Complete Delegation Loop

## 5.1 v1 thesis

**V1 CANDIDATE:** v1 is the smallest Product that completes Attention Delegation end-to-end, not a reduced Gmail/Outlook clone.

```text
material source evidence
  -> candidate interpretation
  -> Responsibility admission/update under trusted rules
  -> evaluate current attention need
  -> if no: offload and monitor quietly
  -> re-evaluate on message / time / event / contradiction
  -> if yes: return attention
  -> restore minimum context
  -> enable one safe meaningful action/decision
  -> reconcile external effects
  -> verify whether the outcome is actually satisfied
  -> close monitoring only when justified
```

Task extraction, priority, no-reply reminders, drafting, natural-language search, and background email automation are already substantial incumbent territory. The Product hypothesis is the **complete behavioral outcome**, not one feature.

## 5.2 Golden path

```text
User sends: "金曜までに見積書をお願いします"
-> Lunowa admits/updates the tracked outcome
-> no current user action: Managed / quiet monitoring

Counterparty: "社内確認中です。明日回答します"
-> evidence / expected event update
-> no user action: remain silent

Usable quotation arrives
-> user review becomes necessary
-> Needs You
-> Moment restores why-now / change / remaining work
-> user acts
-> provider effects reconcile
-> Responsibility becomes Waiting again or closes only if justified
```

The decisive Product proof is that the user genuinely did not need to keep checking during the silent interval.

---

# 6. Closure and reopening

## 6.1 Activity is evidence, not closure

> **Reply arrival, completion claim, attachment arrival, send action, read state, or silence does not automatically prove successful satisfaction.**

```text
action performed
!= completion claimed
!= outcome satisfied
!= user/Lunowa monitoring close
```

## 6.2 Closure question

> **Is there any material reason the user or Lunowa still needs to monitor this Responsibility?**

## 6.3 Product-level gates

**PRODUCT HYPOTHESIS:** automatic monitoring closure should normally satisfy all relevant:

1. outcome gate;
2. obligation gate;
3. evidence gate;
4. authority gate.

These gates are Product synthesis only; canonical reducer/oracle semantics remain authoritative.

## 6.4 Silence / stop tracking / reopen

- silence alone never proves successful satisfaction;
- user tracking close does not prove external-world success or cancel counterpart obligations;
- REOPEN keeps the same identity only where the same operational outcome was never actually satisfied;
- genuinely new work after a truly closed episode normally creates a new Responsibility.

---

# 7. Daily attention and delivery model

## 7.1 Continuous monitoring, episodic human attention

**DOCTRINE CANDIDATE:** Lunowa is continuously active; the user is only intermittently required.

The Product should remain useful when the user does not open it every day. Authorized ingestion/reconciliation, Waiting evolution, temporal reconsideration, closure/reopen processing, and integrity observation continue according to actual runtime capability.

## 7.2 New evidence is not a notification

```text
message / reply / time / provider observation
-> evidence changes
-> state re-evaluates
-> attention may or may not change
```

## 7.3 Delivery lanes

**V1 CANDIDATE:**

- **Silent** — state changed; no current user action/awareness required;
- **Awareness** — no action required, but knowing is useful/explicitly requested;
- **Normal Attention** — action/judgment required but next normal review point is safe;
- **Urgent Attention** — delaying to the normal review point creates material delay cost;
- **Integrity Alert** — Lunowa cannot reliably fulfill monitoring.

`Integrity Alert` is system/degraded-state UX, not automatically a Responsibility, Needs You item, or semantic Review subject.

> **Not as soon as possible. As late as safely possible.**

Urgency is about **delay cost + actionability**, not sender prestige, recency, or model confidence alone.

## 7.4 App open / morning / digest

On open, show current attention state rather than requiring arrival-by-arrival triage.

An optional start-of-day brief may summarize current attention and overnight awareness, but it is not a mandatory Inbox recap.

An optional awareness digest may make quiet stewardship legible, but:

> **A digest must never be the only place where actionable work is hidden.**

## 7.5 Quiet hours

Quiet hours suppress interruption, never monitoring. State re-evaluation still occurs; delivery may wait only when the relevant delay cost/Attention Contract permits it.

Initial Product behavior should use simple user-owned schedules rather than invasive activity/location inference.

## 7.6 Engagement metrics

DAU/session count/unread processing are not North-Star metrics. Repeated opening can indicate distrust; a day with no unnecessary Lunowa open can be a successful day.

---

# 8. Product surfaces

## 8.1 Conceptual surface set

**V1 CANDIDATE:**

1. **Needs You** — current actionable USER work;
2. **Moment** — temporal context restoration + safe next action;
3. **Managed** — delegated-monitoring reassurance + on-demand inspection;
4. **Review** — material semantic/safety ambiguity;
5. **Source Conversations** — original communication/provenance fallback;
6. **Home/Landing** — composition of Review, Needs You, Managed reassurance, and Source entry; not a sixth semantic state.

## 8.2 Needs You

Contains only admitted Responsibilities with a material currently actionable USER obligation/judgment.

It does **not** contain:

- generic important/new mail;
- Waiting;
- intentionally deferred Later;
- pre-admission Review;
- an admitted Responsibility currently blocked by material Review;
- awareness-only updates.

Ordering should use explainable attention tiers such as material overdue/delay cost, near due, blocking work, then other actionable work — not newest-message order or one opaque model score.

## 8.3 Moment

Moment answers with minimum trustworthy context:

```text
WHY NOW?      なぜ今戻った？
WHAT CHANGED? 何が変わった？
WHAT REMAINS? 何がまだ未完了？
WHAT NEXT?    今何をすればいい？
```

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Progressive disclosure:

```text
current conclusion/action
-> short material reason
-> source-grounded evidence
-> original Conversation / attachment
```

## 8.4 Managed

Managed is assurance + inspection, not a second Inbox or agent console.

Default presentation should be quiet/aggregate. Intentional inspection explains tracked outcome, expected actor/event, return condition, integrity status, and source.

**PRODUCT HYPOTHESIS:** Waiting/Later remain meaningful projections but normally become filters/details under Managed rather than permanent high-frequency top-level navigation.

## 8.5 Review

Review asks the **smallest material question** blocking safe delegation/action.

It may present pre-admission `NEEDS_REVIEW` or admitted-field uncertainty, while preserving internal subject distinction.

Review is not a low-confidence AI dump and is not routine external-action approval.

## 8.6 Source Conversations

> **Source is optional in the happy path and always available in the trust path.**

Source supports ordinary reading, verification, correction, exact retrieval, provider-native fallback where useful, and cases where the user simply wants email rather than an operational Moment.

---

# 9. Onboarding and trust progression

## 9.1 Earn bounded delegation

**DOCTRINE CANDIDATE:** onboarding should not ask the user to trust a general AI system or stop checking email on day one. It should earn:

> **“I am willing to let Lunowa monitor this kind of communication loop for me.”**

Do not use one global trust score to unlock capabilities.

## 9.2 First-run candidate

1. connect one real mailbox;
2. explain compactly what Lunowa can read/monitor and what it will not autonomously do;
3. keep provider/source state intact;
4. choose one real current communication loop instead of broadly activating historical mail;
5. show the bounded monitoring contract in ordinary language;
6. user explicitly chooses `[この件を任せる]`;
7. remove it from active attention only when current semantics justify that.

Thread selection never implies `1 thread = 1 Responsibility`.

## 9.3 Progression

- **A — individual loops:** explicit bounded delegation;
- **B — assisted:** Lunowa proposes candidate loops; decline is cheap and not automatically interpreted as distrust;
- **C — class-scoped:** after sufficiently reliable experience, Lunowa may offer a narrow ordinary-language class such as `期限つきで相手に依頼した件`;
- **D — quiet default:** for explicitly enabled classes, eligible admitted loops may be monitored without routine per-loop confirmation.

Class-scoped monitoring never bypasses `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`, `No Responsibility`, uncertainty, identity, or safety semantics. It is not a generic rule builder.

## 9.4 Monitoring permission != action permission

A user can permit automatic monitoring while external email send remains explicit approval. Any future standing action permission is separately action/context/scope-specific and revocable.

## 9.5 Source-first to Attention-first

Do not force Inbox abandonment. After credible experience, Lunowa may explicitly offer Needs You as default landing; never silently switch because an internal model says the user is “trusted”.

## 9.6 Source-notification migration

**PRODUCT HYPOTHESIS:** mature Attention Delegation may require reducing redundant provider notifications, but only progressively and explicitly after the user has experienced credible Lunowa reliability.

---

# 10. Retrieval, history, and people context

## 10.1 Search is not the moat

Natural-language email search, AI summaries, and broad context retrieval are increasingly incumbent capabilities.

Lunowa's Product job is **Operational Retrieval**: find evidence **and** explain current unresolved state, material change history, and present attention need.

## 10.2 Retrieval jobs

One search entry may support:

- **Source Find** — exact mail/thread/file retrieval;
- **Fact Answer** — source-grounded answer;
- **Operational Recall** — `この件どうなってる？`;
- **Context Recall** — relevant recent history/person context.

Traditional deterministic search remains available for exact retrieval.

## 10.3 Time-aware current truth

Derived memory must not win merely because it is semantically similar.

For changing material facts, prefer current accepted/evidence-relative state and show `as of` / material change when useful.

> **Derived memory is disposable; evidence and accepted state are durable.**

Historical source can be searchable without becoming a live Responsibility.

## 10.4 Retrieval is read-only with respect to accepted state

Search/answering does not silently mutate Responsibility state. If retrieval exposes new source inconsistency, any accepted mutation still passes ordinary evidence/admission/reducer/authority rules.

Retrieval scope is authorization-filtered; semantic similarity is not permission, identity, or cross-account merge authority.

## 10.5 History

Default user-facing history should prefer meaningful operational timeline (`request -> update -> expected-date change -> result -> user action -> closure`) rather than permanent raw model/tool traces.

## 10.6 People context

People context exists to restore communication context, not to become a Personal CRM.

Useful v1 candidate content:

- authorized identity/organization context;
- current open Responsibilities involving the person;
- recent material communication/topics;
- relevant source Conversations/files.

Relationship scoring, personality profiling, public-enrichment dependence, network graphs, and relationship-health gamification are not v1 core.

---

# 11. Ordinary communication action boundary

## 11.1 Provider / Lunowa ownership

> **Provider remains the primary mailbox/source substrate; Lunowa owns accepted Responsibility state and attention behavior under its own canonical domain authority.**

Do not imply that provider mailbox state is authority for Responsibility truth, or that Lunowa should recreate every provider mailbox feature.

## 11.2 Native Action Test

Prefer a native Lunowa action when it:

1. naturally arises from an active Moment/Responsibility;
2. materially advances/closes the Attention loop;
3. would cause meaningful context reconstruction if forced back into the provider;
4. can be represented as a bounded, inspectable, safely authorized action.

Otherwise prefer provider fallback or defer.

## 11.3 v1 target action posture

**This table is a Product target, not implementation authorization or a reason to bypass Issue #36 / accepted implementation gates.**

| Action | v1 Product posture |
| --- | --- |
| browse Source Conversation | **CORE NATIVE** |
| exact/search retrieval | **CORE NATIVE** |
| relevant attachment preview/open | **CORE NATIVE** |
| Moment-bound Reply | **CORE NATIVE** |
| Reply All with explicit recipients | **CORE NATIVE** |
| bounded contextual draft | **CORE NATIVE** |
| basic attachment add for active reply | **STRONG v1** |
| explicit user Send | **CORE NATIVE** |
| provider send reconciliation | **CORE SEMANTIC REQUIREMENT** |
| arbitrary new Compose | **provider fallback / optional native convenience** |
| Forward | **provider fallback / optional convenience** |
| Send Later | **provider-owned / not core** |
| full Drafts/Sent parity | **not core; source access where needed** |
| Archive | **manual convenience / provider-owned** |
| Delete/Trash | **provider-first / not core** |
| Spam/Block/Unsubscribe | **provider-owned** |
| Read/Unread management | **secondary source feature** |
| provider Star | **not Responsibility semantics** |
| Lunowa Pin | **explicit retrieval control; orthogonal** |
| provider Snooze | **distinct from Lunowa Later** |
| bulk mailbox actions | **DEFER** |
| contact management | **OUT** |
| basic recipient lookup | **support contextual communication** |
| calendar availability read | **POST-v1 strong candidate** |
| calendar create/modify | **DEFER; approval boundary** |
| generic automation builder | **OUT** |
| autonomous email Send by default | **NO** |

## 11.4 Mailbox state is not Responsibility state

**DOCTRINE CANDIDATE:**

```text
Unread  != Needs You
Read    != Done
Archive != Closed
Trash   != Cancelled
Snooze  != Later
Star    != Responsibility importance
```

Responsibility changes must not automatically archive/delete/relabel provider mail unless a separate explicit Product policy is later accepted.

## 11.5 Contextual send path

```text
Moment
-> draft prepared or user writes manually
-> sender account / recipients / content / attachments visible
-> explicit user Send
-> provider call
-> provider result reconciled
-> Responsibility re-evaluated
```

A send attempt is not accepted provider send. A reconciled send resolves only when sending itself satisfies that Responsibility's closure condition.

## 11.6 Generic compose asymmetry

Arbitrary new communication creation does not need to be native v1 scope. The user may compose in the provider; Lunowa can observe authorized Sent evidence and offer/admit monitoring afterward.

Existing-loop actions are more Product-critical than generic compose parity.

## 11.7 Product form

**PRODUCT HYPOTHESIS:** v1 should prefer a **companion/hybrid + one-provider complete-loop proof** over immediate full-client parity.

Two switching costs must remain distinct:

1. **replacement switching cost** — adopting a new mail client/workflow;
2. **delegation/trust cost** — allowing Lunowa to suppress/carry monitoring on the user's behalf.

A companion can reduce replacement cost but cannot eliminate delegation/trust cost.

Full-client replacement remains allowed later if actual use shows provider fallback is a material remaining burden after Attention Delegation is proven.

> **Replacement status is earned by usage, not assumed by roadmap.**

Current responsive-web-first implementation direction remains owned by the existing technical/implementation authorities; this Product form candidate does not silently change the runtime/platform decision.

---

# 12. Autonomy, authorization, and security

## 12.1 Attention delegation before authority delegation

> **Lunowa first delegates attention, not consequential authority.**

Initial autonomous Product responsibilities may include authorized reading, candidate interpretation, trusted internal state maintenance, temporal monitoring, attention projection, context restoration, and low-risk draft preparation.

## 12.2 Capability != permission

A more capable model does not automatically receive more Product permission. Permission belongs to **action + context + scope**, not one global autonomy slider.

## 12.3 Requested action != safe next action

An email requesting payment, deletion, permission change, contract acceptance, or another high-impact action does not make that action safe/recommended. Lunowa may instead surface verification, identity confirmation, or a bounded decision.

## 12.4 Email/source text is untrusted data

Prompt/tool-like instructions inside email, attachment text, quoted content, or retrieved source **never grant application/tool authority**. They remain untrusted communication evidence.

## 12.5 Default action posture

| Action | Default posture |
| --- | --- |
| trusted internal monitoring/reconsideration | autonomous where accepted policy permits |
| summary/context/draft preparation | autonomous |
| email Send | human approval by default |
| shared calendar/system mutation | human approval by default |
| speak/commit on user's behalf | explicit bounded authorization or approval |
| destructive delete / permission change / payment / contract acceptance | outside initial autonomous authority |

Conceptually:

```text
LLM proposes/interprets
-> deterministic Product/domain/policy authority mediates
-> approval if required
-> provider/tool executes
-> outcome is reconciled/verified
```

The model does not decide its own authority.

## 12.6 Bounded standing authorization later

Future pre-authorization requires explicit action schema, account/recipient/scope, durable user intent, revocability, bounded risk, deterministic policy, reconciliation, audit, and stop controls.

Monitoring delegation never silently grants send authority.

---

# 13. Trust, provenance, and failure recovery

## 13.1 Evidence over confidence theater

Do not use model confidence percentages or fluent rationale as default proof. Prefer source-grounded evidence, explicit current system state, and inspectable provenance.

## 13.2 Evidence receipts

Early trust-building may show low-stimulation stewardship receipts such as:

```text
ABC社「社内確認中」
-> あなたの対応は不要として監視継続
-> 明日再評価
```

These are inspectable proof, not notifications or an agent activity feed.

## 13.3 Monitoring integrity

If provider access, source sync, scheduler, or reconciliation is materially degraded, Lunowa must stop stale reassurance and surface affected scope + concrete recovery. Integrity failure is distinct from interpretation error.

## 13.4 Material miss

A user-discovered material false negative requires, when supportable:

1. what was missed;
2. evidence-backed reason for the failure;
3. impact window;
4. whether other delegated loops are affected;
5. what safe state was restored;
6. whether the affected delegation scope was narrowed/returned to confirmation mode.

Any safety-driven narrowing of an already granted scope should be disclosed.

Repair should be scope-local unless evidence indicates a systemic failure.

---

# 14. v1 scope

## 14.1 CORE Product capabilities

- authorized source Conversation/message reading;
- one-provider source ingestion/reconciliation sufficient for validated complete-loop behavior;
- Responsibility admission/update under canonical semantics;
- inbound and outbound unresolved-loop recognition sufficient for validated scenarios;
- obligation / expected-event / temporal monitoring;
- silent Waiting management;
- time/event/contradiction re-evaluation;
- Needs You / Moment / Managed / material Review / Source;
- explicit Later/return condition where valid;
- closure / stop-tracking / reopen semantics;
- contextual reply/draft/send + provider reconciliation;
- exact source search;
- Responsibility-aware operational retrieval sufficient for validated cases;
- monitoring-integrity UX;
- safe fallback when intelligence is degraded.

## 14.2 Strong v1 candidates

- natural-language operational/source search;
- basic attachment preview and reply attachment upload;
- basic person context with current open loops + recent material history;
- optional awareness/digest behavior;
- simple quiet-hours/delivery preferences.

## 14.3 DEFERRED

- second provider before first-provider complete-loop proof;
- multi-account/cross-account breadth for completeness;
- full generic compose parity;
- broad Drafts/Sent/folder/label administration;
- bulk mailbox actions;
- Send Later parity;
- calendar integration until core loop evidence justifies it;
- public contact enrichment;
- relationship graph/health scoring;
- travel bundling;
- subscription/billing Product;
- activity/location-based interruptibility;
- generic automation/rule builder;
- broad autonomous external actions;
- full-client/mobile parity not needed for current learning.

## 14.4 OUT from core identity

- CRM pipeline ownership;
- project-plan ownership;
- support-ticket lifecycle ownership;
- accounting/payment truth;
- generic personal task management;
- arbitrary workflow engine;
- personality/relationship scoring as core value;
- generic AI chat as primary daily workflow.

---

# 15. Competitive and commercial posture

## 15.1 Feature overlap is not differentiation

Do not treat AI Inbox/to-do extraction, priority, summary/drafting, natural-language search, Respond/Waiting, no-reply reminders, follow-up drafts, response verification as a phrase, multiple commitments per thread as a phrase, companion integration, or background email automation as unique by themselves.

Current Gmail, Outlook/Copilot, Superhuman, Shortwave/Tasklet, Microsoft Cowork and adjacent products already occupy substantial parts of this feature space.

## 15.2 Differentiation standard

**PRODUCT HYPOTHESIS:** Lunowa wins only if the **complete system** produces a better behavioral outcome than the target user's real current workflow:

```text
less parallel self-checking
+ less context reconstruction
+ correct resurfacing
+ acceptably low material false negatives
+ acceptably low unnecessary Review/resurfacing
+ trustworthy source/provenance/account/control
+ low correction/approval burden
+ enough repeated value to justify dependency/switching/payment
```

Differentiation is earned empirically, not by ontology depth.

## 15.3 Monetization

**PRODUCT HYPOTHESIS:** paid subscription/prosumer pricing is plausible if Lunowa removes recurring cognitive/operational burden or costly missed outcomes.

**UNKNOWN:** exact price, free tier, packaging, billing interval, individual/business packaging, and willingness to pay.

Do not treat hypothetical WTP before credible value exposure as strong evidence.

## 15.4 Distribution

**UNKNOWN:** no acquisition channel is proven. Reachability/distribution is part of ICP selection rather than a post-build concern.

---

# 16. Validation, metrics, and remaining unknowns

## 16.1 Current highest-priority gate

**Issue #36 remains highest priority.** It tests whether a reachable segment has recurring, costly, currently under-served communication-monitoring burden. This Product-content consolidation does not authorize write-heavy prototype work, provider breadth, or production persistence.

## 16.2 Behavioral measures

Candidate measures include:

### Delegation
- real loops delegated;
- continued delegation after success;
- class-scoped opt-in;
- delegation contraction/recovery after errors.

### Parallel monitoring
- `N_self_check` before Lunowa returns;
- Inbox/Sent/source fallback during delegated periods;
- parallel task/reminder creation;
- repeated Managed inspection without material state change.

### Attention quality
- correct resurfacing;
- material false-negative rate;
- unnecessary resurfacing/Review burden;
- delivery timeliness.

### Context restoration
- time from Moment open to correct safe action;
- source expansion/reread before action;
- reconstruction operations.

### Reliability
- monitorable vs degraded time;
- integrity-alert latency;
- reconciliation lag;
- impact window of discovered misses.

### Commercial
- switching/dependency behavior;
- retention by delegated monitoring rather than opens alone;
- credible WTP after value exposure.

## 16.3 Major unknowns

Do not silently convert these into facts:

- exact ICP / first segment;
- prevalence/severity of monitoring burden;
- real incumbent adequacy;
- production false-negative / false-positive / Review trade-off;
- threshold at which users stop parallel checking;
- exact delivery/digest/quiet-hours defaults;
- exact class-scoped delegation criteria;
- whether `Attention Contract` remains the final Product term;
- whether the five-surface IA wins real testing;
- whether companion/hybrid remains superior in mature usage;
- whether/when native generic compose becomes Product-critical;
- natural-language operational retrieval v1 criticality;
- attachment-content understanding depth;
- calendar integration timing;
- second-provider/multi-account incremental value;
- pricing/WTP/packaging;
- acquisition/distribution;
- long-term retention;
- provider-notification migration acceptance;
- whether Responsibility remains the simplest sufficient mechanism after real data.

---

# 17. Promotion invariants

Proposed Product invariants:

1. **Attention Delegation is the core user value.**
2. **Open Coordination Loop is Product vocabulary; Responsibility remains canonical semantic authority.**
3. **Communication activity is evidence, not closure.**
4. **Message arrival is not automatically an attention event.**
5. **State can change immediately while interruption waits until justified.**
6. **Needs You contains current user work, not generic importance or awareness-only information.**
7. **Managed work is inspectable, not attention-seeking.**
8. **Moment returns minimum trustworthy context, not whole history.**
9. **Source is optional in the happy path and always available in the trust path.**
10. **Monitoring autonomy and consequential action authority are separate.**
11. **Capability does not grant permission.**
12. **Requested action is not automatically the safe next action; source text never grants tool authority.**
13. **Derived memory is disposable; evidence and accepted state are durable.**
14. **Historical source can be searchable without becoming a live Responsibility.**
15. **Retrieval does not silently mutate accepted state.**
16. **Mailbox state is not Responsibility state.**
17. **Native communication actions exist to complete the Attention loop, not imitate the provider.**
18. **Provider is the mailbox/source substrate; Responsibility authority remains Lunowa's accepted domain semantics.**
19. **Quiet hours suppress interruption, never monitoring.**
20. **Digest/awareness may never hide actionable work that exists nowhere else.**
21. **Monitoring-integrity failure is surfaced honestly and is not a fake Responsibility state.**
22. **Trust is earned through bounded successful delegation, not one scalar score.**
23. **Class-scoped monitoring never bypasses canonical admission or `No Responsibility`.**
24. **Material misses require transparent impact + concrete recovery, not apology-only UX.**
25. **Full-client replacement is earned by usage, not assumed by roadmap.**
26. **Differentiation is a comparative behavioral outcome, not a feature/ontology claim.**

---

# 18. Product-content completion criterion

This candidate treats **Product-content design as complete enough for full reconciliation** because it now specifies, in one coherent contract:

- purpose/value/experience doctrine;
- problem/jurisdiction and ICP uncertainty;
- canonical semantic boundaries;
- Attention/Temporal Contract relationship;
- Minimum Complete Delegation Loop;
- closure/reopen;
- Daily Operating Model and delivery;
- surfaces;
- onboarding/trust progression;
- retrieval/history/people context;
- ordinary communication action boundary and Product form;
- autonomy/security/authority;
- failure recovery;
- v1 core/deferred/out scope;
- competitive/commercial posture;
- validation/metrics;
- remaining empirical unknowns.

This does **not** mean the Product is empirically validated, implementation-ready in every area, or guaranteed to survive Issue #36. Strong evidence may revise the spec.
