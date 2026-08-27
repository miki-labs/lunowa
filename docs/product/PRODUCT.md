# Lunowa Product Contract

## Status

**Canonical Product authority for Lunowa, reconciled through 2026-08-27.**

This document owns the highest-level Product contract:

- what Lunowa exists to do;
- what problem/jurisdiction it accepts;
- the current v1 Product direction;
- user-facing attention/surface/daily behavior;
- onboarding/trust progression;
- closure, retrieval/history, communication-action, autonomy, and failure boundaries;
- validation sequencing, commercial status, and explicit unknowns.

Detailed authorities remain separate:

- `docs/product/responsibility/` — canonical Responsibility semantics;
- `docs/product/PRODUCT-CONTENT.md` — detailed canonical Product operating contract for user control/correction/escalation, degraded behavior, account lifecycle, Settings, communication edge cases, complete Managed/Review behavior, zero/unavailable states, and the final Feature Matrix;
- `docs/product/GOLDEN-SCENARIO-BANK.md` — Product-level end-to-end acceptance scenarios, explicitly subordinate to Responsibility semantic oracles;
- `docs/design/DESIGN.md` / `INTERACTIONS.md` / `RESPONSIVE.md` — detailed UX/interaction/responsive behavior consistent with this Product contract;
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md` — engineering boundaries;
- `docs/product/TECH-STACK.md` + ADRs — concrete technology decisions;
- `docs/product/IMPLEMENTATION-PLAN.md` — evidence/implementation sequence;
- GitHub Issues/PRs/CI — live task/candidate/review state;
- `docs/continuity/CURRENT.md` — compact mutable router only;
- `docs/product/research/` — dated evidence/rationale, not Product truth merely by existing.

Historical noncanonical synthesis files remain useful rationale:

- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md`;
- `V1-PRODUCT-SURFACE-CANDIDATE.md`;
- `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md`;
- `PRODUCT-SPEC-V1-CANDIDATE.md`.

When they conflict with this file, **this file wins at Product level**. They do not create schema, aggregates, enums, or permissions.

Within this file's accepted scope, `PRODUCT-CONTENT.md` owns the detailed current operating behavior and final feature-scope matrix. `GOLDEN-SCENARIO-BANK.md` owns Product-level regression acceptance but never redefines Responsibility semantic truth.

### Evidence/decision labels

- **ACCEPTED** — current Product direction/safety principle;
- **V1 DIRECTION** — current v1 Product shape, still revisable by evidence;
- **EXTERNAL EVIDENCE** — research/current market evidence, not proof of Lunowa PMF;
- **INFERENCE** — reasoning from evidence;
- **HYPOTHESIS** — Lunowa-specific choice needing validation;
- **UNKNOWN** — materially unresolved;
- **DEFERRED** — intentionally later;
- **OUT** — outside current core responsibility.

A canonical Product contract may contain explicit hypotheses. **Canonical does not mean empirically proven.** GitHub Issue #36 remains the highest-priority problem/ICP discovery gate.

---

# 1. Product identity

## 1.1 Vision

**ACCEPTED / ASPIRATIONAL:**

> **世界一快適なメール体験**

This is vision, not a measurable market claim.

## 1.2 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

## 1.3 Core value

**ACCEPTED:** Lunowa primarily offers **Attention Delegation**.

Directional user promise:

> **「この件はもう自分で気にしておかなくていい。必要になったらLunowaが戻す。」**

The target behavioral change is **monitoring relinquishment**: users stop parallel manual checking because Lunowa carries the monitoring burden safely enough.

## 1.4 Product definition

> **Lunowa is an email-centered communication-monitoring Product that keeps unresolved communication outcomes under control on the user's behalf, stays quiet while the user is not needed, and returns the right issue with enough source-grounded context when attention is genuinely required again.**

A stricter expression is:

> **Lunowa tries to make heterogeneous email-borne commitments and dependencies safe to stop monitoring manually.**

## 1.5 Experience doctrine

**ACCEPTED:** routine use is **system-led, not prompt-led**.

```text
communication/evidence changes
-> preserve authorized source evidence
-> derive candidate meaning
-> admit/update trusted Responsibility state
-> evaluate attention / expected events / time
-> surface only what matters now
```

AI should mostly prepare and maintain context behind the interface rather than make the user prompt it to organize routine work.

> **Eliminate work, not control.**

Reduce remembering, checking, reconstruction, navigation, and repetitive preparation while preserving source visibility, sender/account identity, user authority, correction, and safe fallback.

## 1.6 What Lunowa is not primarily

Lunowa is not primarily:

- an Inbox Zero tool;
- a unified inbox;
- an AI chat homepage;
- an AI writing assistant;
- a generic task manager/project manager;
- a CRM/ticket system;
- a generic automation/rule builder;
- a relationship-scoring Product;
- a generic long-term memory assistant;
- a general autonomous agent.

These capabilities or adjacent conveniences may exist. None defines the Product.

---

# 2. Problem, jurisdiction, and ICP

## 2.1 Core problem

**ACCEPTED PROBLEM DIRECTION / HYPOTHESIS OF MARKET SEVERITY:** Lunowa focuses on **unresolved email-borne coordination** whose progress depends on the user, another person/organization, time, an external event, approval, document, payment, decision, or changing evidence.

The strongest current wedge is:

> **Open-loop Monitoring Offload**

`Open Coordination Loop` is Product-level vocabulary only. It does not create a domain object. `Responsibility` remains the canonical semantic concept for the smallest communication-bounded operational outcome with coherent closure.

## 2.2 Strong-fit characteristics

A case is a stronger Lunowa fit when several are true:

- it emerges naturally from communication rather than a project plan;
- a material operational outcome remains unresolved;
- another person/event/time/evidence must change before closure;
- waiting is irregular/long enough to create monitoring burden;
- simple one-time snooze is insufficient;
- reply arrival may not equal outcome satisfaction;
- source communication materially evidences state;
- no stronger structured system already monitors the relevant state adequately.

## 2.3 Stewardship modes

### Primary Steward

Lunowa carries monitoring where no stronger structured system adequately owns the heterogeneous communication state.

### Overlay / Monitor

A CRM/ticket/project/accounting system may own domain truth while Lunowa owns only the communication-attention gap.

### Out / Reference

Generic personal tasks, project plans, CRM pipelines, support-ticket lifecycle, accounting truth, deterministic recurring automation, broad goals, and generic knowledge storage do not become Lunowa-owned merely because email mentions them.

**ACCEPTED:**

> **Integrate evidence without automatically absorbing domain ownership.**

## 2.4 ICP status

**UNKNOWN:** exact ICP is not validated or frozen.

**HYPOTHESIS:** first recruitment should prioritize self-managing, asynchronous, email-task-coupled users who personally coordinate several external counterparties, maintain multiple unresolved loops, repeatedly re-check or create reminder scaffolding, face meaningful delay/miss cost, are not already adequately served by a dedicated system of record, and have adoption autonomy.

Independent / small-firm B2B professionals remain a recruitment prior only, not accepted ICP.

---

# 3. Responsibility and semantic authority

Detailed canonical semantics remain in `docs/product/responsibility/`.

## 3.1 Fixed Product dependencies

This Product contract relies on these FIXED semantics:

- Message / Conversation / Responsibility are distinct;
- a Conversation can contain zero, one, or many Responsibilities;
- Responsibility identity follows the smallest communication-bounded operational outcome with coherent closure;
- communication-act detection does not automatically create a Responsibility;
- admission uses `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`;
- `No Responsibility` is a first-class correct outcome;
- Review may represent a pre-admission subject or admitted field uncertainty, with subject type preserved internally;
- multiple obligation legs and expected events are allowed;
- claim and observation are distinct;
- source due, expected-event time, user target, resurface time, and follow-up time are distinct;
- accepted state is evidence-relative and important facts require provenance;
- semantic similarity is candidate retrieval, not identity authority;
- resolution, live tracking, and attention/defer are orthogonal;
- send attempt and provider-reconciled acceptance are distinct;
- historical lack of observed closure does not imply live active Responsibility;
- REOPEN means the same operational outcome was never actually satisfied; genuinely new work after true closure normally creates a new Responsibility;
- AI failure does not block ordinary source reading/reply/search;
- cross-account semantic merge is prohibited initially;
- no generic workflow engine.

## 3.2 Product grammar

Without creating a parent aggregate:

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

## 3.3 Action != Expected Event != Outcome

- **Action** — something an actor does;
- **Expected Event** — a future observation that should cause reconsideration;
- **Outcome** — the state the Responsibility is ultimately trying to reach.

A reply can satisfy an expected event without satisfying the outcome.

---

# 4. Attention Contract and Temporal Contract

## 4.1 Attention Contract

**HYPOTHESIS / PRODUCT-LEVEL LANGUAGE:** `Attention Contract` describes the bounded promise:

> Lunowa monitors a specific unresolved outcome, keeps it out of active attention while the user is not materially needed, and returns it under defined evidence/time/attention conditions.

It may conceptually describe monitored outcome, expected evidence/events, silent/return conditions, delivery urgency, and authority/review boundaries.

**It is not a new persisted object authorized by this document.**

## 4.2 Temporal Contract

`Temporal Contract` remains the accepted durable mechanism for persisted time/event reconsideration where required.

```text
trigger fires
-> reload current evidence/state
-> ignore stale/cancelled condition
-> re-evaluate
-> update attention if warranted
-> notify only if separate delivery policy warrants it
```

Trigger firing is not notification.

## 4.3 Four distinct Product questions

**ACCEPTED:** always separate:

1. **Operational State** — what changed?
2. **Attention Need** — does the user need to know, decide, or act?
3. **Delivery Urgency** — when/how should that attention interrupt?
4. **Authority** — may Lunowa decide/act without explicit approval?

Do not collapse them into one priority/confidence score.

---

# 5. Minimum Complete Delegation Loop

## 5.1 v1 thesis

**V1 DIRECTION:** v1 is the smallest Product that completes Attention Delegation end-to-end, not a reduced Gmail/Outlook clone.

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
-> verify whether outcome is actually satisfied
-> close monitoring only when justified
```

Task extraction, priority classification, no-reply reminders, drafting, natural-language search, and background email automation are already substantial incumbent territory. Lunowa's Product hypothesis is the **complete behavioral outcome**, not one feature.

## 5.2 Golden path

```text
User sends: "金曜までに見積書をお願いします"
-> Lunowa admits/updates the tracked outcome
-> no current user action: quiet Managed monitoring

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

## 6.1 Communication activity is evidence, not closure

**ACCEPTED:**

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

**HYPOTHESIS:** automatic monitoring closure should normally satisfy all relevant:

1. outcome gate;
2. obligation gate;
3. evidence gate;
4. authority gate.

These are Product synthesis only; canonical reducer/oracle semantics remain authoritative.

## 6.4 Silence / stop tracking / reopen

- silence alone never proves successful satisfaction;
- user tracking close does not prove external-world success or cancel counterpart expectations;
- REOPEN keeps the same identity only where the same outcome was never actually satisfied;
- genuinely new work after a truly closed episode normally creates a new Responsibility.

---

# 7. Daily Operating Model

## 7.1 Continuous monitoring, episodic human attention

**ACCEPTED DIRECTION:** Lunowa is continuously active; the user is only intermittently required.

The Product should remain useful even when the user does not open it every day. Authorized ingestion/reconciliation, Waiting evolution, Temporal Contract reconsideration, closure/reopen processing, and integrity observation continue according to actual runtime capability.

## 7.2 New evidence is not a notification

```text
message / reply / time / provider observation
-> evidence changes
-> state re-evaluates
-> attention may or may not change
```

## 7.3 Delivery lanes

**V1 DIRECTION:**

- **Silent** — state changed; no current user action/awareness required;
- **Awareness** — no action required, but knowing is useful/explicitly requested;
- **Normal Attention** — action/judgment required but the next normal review point is safe;
- **Urgent Attention** — delaying to the normal review point creates material delay cost;
- **Integrity Alert** — Lunowa cannot reliably fulfill monitoring.

`Integrity Alert` is system/degraded-state UX, not automatically a Responsibility, Needs You item, or semantic Review subject.

> **Not as soon as possible. As late as safely possible.**

Urgency is primarily **delay cost + actionability**, not sender prestige, recency, or model confidence alone.

## 7.4 App open / start of day / digest

On open, show current attention state rather than requiring arrival-by-arrival triage.

**HYPOTHESIS:** an optional start-of-day brief may summarize current attention and overnight awareness without becoming an Inbox recap or mandatory ritual.

**HYPOTHESIS:** an optional awareness digest may make quiet stewardship legible, but:

> **A digest must never be the only place where actionable work is hidden.**

## 7.5 Quiet hours

Quiet hours suppress interruption, never monitoring. State re-evaluation still occurs; delivery may wait only when the relevant delay cost/Attention Contract permits it.

Initial behavior should use simple user-owned schedules rather than invasive activity/location inference.

## 7.6 Engagement metrics

DAU/session count/unread processing are not North-Star metrics. Repeated opening may indicate distrust; a day with no unnecessary Lunowa open can be a successful day.

---

# 8. Product surfaces

## 8.1 Surface set

**V1 DIRECTION:**

1. **Needs You / 対応が必要** — current actionable USER work;
2. **Moment / 今の要点** — temporal context restoration + safe next action;
3. **Managed / Lunowaが見ています** — delegated-monitoring reassurance + on-demand inspection;
4. **Review / 確認** — material semantic/safety ambiguity;
5. **Source Conversations / 会話** — original communication/provenance fallback;
6. **Home/Landing** — composition of Review, Needs You, Managed reassurance, and Source entry; not a sixth semantic state.

## 8.2 Needs You

Contains only admitted Responsibilities with a material currently actionable USER obligation/judgment.

It does **not** contain generic important/new mail, Waiting, intentionally deferred Later, pre-admission Review, admitted Responsibilities blocked by material Review, or awareness-only updates.

**HYPOTHESIS:** order by explainable attention tiers such as material overdue/delay cost, near due, blocking work, then other actionable work — not newest-message order or one opaque model score.

## 8.3 Moment

Moment restores the minimum trustworthy context needed after offload:

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

Detailed membership, surfaced-Review exclusivity, and healthy-count rules are canonical in `docs/product/PRODUCT-CONTENT.md`.

**HYPOTHESIS:** Waiting/Later remain meaningful projections but normally become filters/details under Managed rather than permanent high-frequency top-level navigation.

## 8.5 Review

Review asks the **smallest material question** blocking safe delegation/action.

It may present pre-admission `NEEDS_REVIEW` or admitted-field uncertainty while preserving internal subject distinction.

Review is not a low-confidence AI dump and is not routine external-action approval. Detailed membership/urgency/zero-state behavior is canonical in `docs/product/PRODUCT-CONTENT.md`.

## 8.6 Source Conversations

> **Source is optional in the happy path and always available in the trust path.**

Source supports ordinary reading, verification, correction, exact retrieval, provider-native fallback where useful, and cases where the user simply wants email rather than an operational Moment.

---

# 9. Onboarding and trust progression

## 9.1 Earn bounded delegation

**ACCEPTED:** onboarding should not ask for general AI trust or Inbox abandonment on day one. It should earn:

> **“I am willing to let Lunowa monitor this kind of communication loop for me.”**

Do not use one global trust score to unlock capabilities.

## 9.2 First-run direction

**V1 DIRECTION:**

1. connect one real mailbox;
2. explain compactly what Lunowa can read/monitor and what it will not autonomously do;
3. keep provider/source state intact;
4. choose one real current communication loop rather than broadly activating historical mail;
5. show a bounded monitoring contract in ordinary language;
6. user explicitly chooses `[この件を任せる]`;
7. remove it from active attention only when accepted semantics justify that.

Thread selection never implies `1 thread = 1 Responsibility`.

## 9.3 Progression

- **A — individual loops:** explicit bounded delegation;
- **B — assisted:** Lunowa proposes candidates; decline is cheap and not automatically “distrust”;
- **C — class-scoped:** after sufficiently reliable experience, Lunowa may offer a narrow ordinary-language class such as `期限つきで相手に依頼した件`;
- **D — quiet default:** for explicitly enabled classes, eligible admitted loops may be monitored without routine per-loop confirmation.

Class-scoped monitoring never bypasses `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`, `No Responsibility`, uncertainty, identity, or safety semantics. It is not a generic rule builder.

## 9.4 Monitoring permission != action permission

A user can permit automatic monitoring while external email send remains explicit approval. Future standing action authorization is separately action/context/scope-specific and revocable.

## 9.5 Source-first to Attention-first

Do not force source abandonment. After credible experience, Lunowa may explicitly offer Needs You/Home as default landing; never silently switch based on an internal trust score.

## 9.6 Source-notification migration

**HYPOTHESIS:** mature Attention Delegation may require reducing redundant provider notifications, but only progressively and explicitly after credible reliability has been experienced.

---

# 10. Retrieval, history, and people context

## 10.1 Operational Retrieval

Natural-language email search, AI summaries, and broad context retrieval are increasingly incumbent capabilities.

Lunowa's Product job is **Operational Retrieval**:

> find evidence **and** explain current unresolved state, material change history, and present attention need.

## 10.2 Retrieval jobs

One search entry may support:

- **Source Find** — exact mail/thread/file retrieval;
- **Fact Answer** — source-grounded answer;
- **Operational Recall** — `この件どうなってる？`;
- **Context Recall** — relevant recent history/person context.

Traditional deterministic search remains available for exact retrieval.

## 10.3 Time-aware current truth

Derived memory must not win merely by semantic similarity.

For changing material facts, prefer current accepted/evidence-relative state and show `as of` / material change when useful.

> **Derived memory is disposable; evidence and accepted state are durable.**

Historical source can be searchable without becoming a live Responsibility.

## 10.4 Retrieval is a read path

Search/answering does not silently mutate Responsibility state. If retrieval exposes a source inconsistency, any accepted mutation still passes ordinary evidence/admission/reducer/authority rules.

Retrieval context is authorization-filtered; semantic similarity is not permission, identity, or cross-account merge authority.

## 10.5 History

Default user-facing history should prefer a meaningful operational timeline (`request -> update -> expected-date change -> result -> user action -> closure`) rather than permanent raw agent/model/tool traces.

## 10.6 People context

People context exists to restore communication context, not to become a Personal CRM.

Useful candidate content:

- authorized identity/organization context;
- current open Responsibilities involving the person;
- recent material communication/topics;
- relevant source Conversations/files.

Relationship scoring, personality profiling, public-enrichment dependence, network graphs, and relationship-health gamification are not v1 core.

---

# 11. Ordinary communication action boundary and Product form

## 11.1 Provider/Lunowa ownership

**ACCEPTED:**

> **Provider remains the primary mailbox/source substrate; Lunowa owns accepted Responsibility state and attention behavior under its own canonical domain authority.**

Provider mailbox state is not authority for Responsibility truth. Lunowa does not need to recreate every provider feature.

## 11.2 Native Action Test

Prefer a native Lunowa action when it:

1. naturally arises from an active Moment/Responsibility;
2. materially advances/closes the Attention loop;
3. would cause meaningful context reconstruction if forced back into the provider;
4. can be represented as a bounded, inspectable, safely authorized action.

Otherwise prefer provider fallback or defer.

## 11.3 Current v1 target action posture

**This is Product direction, not implementation authorization.**

| Action | v1 posture |
| --- | --- |
| browse Source Conversation | **CORE NATIVE target** |
| exact/search retrieval | **CORE NATIVE target** |
| relevant attachment preview/open | **CORE NATIVE target** |
| Moment-bound Reply | **CORE NATIVE target** |
| Reply All with explicit recipients | **CORE NATIVE target** |
| bounded contextual draft | **CORE NATIVE target** |
| basic attachment add for active reply | **STRONG v1 candidate** |
| explicit user Send | **CORE NATIVE target** |
| provider send reconciliation | **CORE semantic requirement** |
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

**ACCEPTED:**

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

**HYPOTHESIS:** v1 should prefer a **companion/hybrid + one-provider complete-loop proof** over immediate full-client parity.

Distinguish:

1. **replacement switching cost** — adopting a new mail client/workflow;
2. **delegation/trust cost** — allowing Lunowa to suppress/carry monitoring.

A companion can reduce the first, not the second.

Full-client replacement remains allowed later if actual use shows provider fallback is a material burden after Attention Delegation is proven.

> **Replacement status is earned by usage, not assumed by roadmap.**

Current responsive-web-first engineering direction remains owned by technical/implementation authority and is not changed by this Product form hypothesis.

---

# 12. Autonomy, authorization, and security

## 12.1 Attention delegation before authority delegation

**ACCEPTED:**

> **Lunowa first delegates attention, not consequential authority.**

Initial autonomous responsibilities may include authorized reading, candidate interpretation, trusted internal-state maintenance, temporal monitoring, attention projection, context restoration, and low-risk draft preparation.

## 12.2 Capability != permission

**ACCEPTED:** a more capable model does not automatically receive more Product permission. Permission belongs to **action + context + scope**, not one global autonomy slider.

## 12.3 Requested action != safe next action

**ACCEPTED:** email requesting payment, deletion, permission change, contract acceptance, credential disclosure, or another high-impact action does not make that action safe/recommended. Lunowa may instead surface verification, identity confirmation, or a bounded decision.

## 12.4 Source text is untrusted data

**ACCEPTED:** prompt/tool-like instructions inside email, attachments, quoted content, or retrieved source never grant application/tool authority. They remain untrusted communication evidence.

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
-> outcome reconciled/verified
```

The model does not choose its own authority.

## 12.6 Bounded standing authorization later

Future pre-authorization requires explicit action schema, account/recipient/scope, durable user intent, revocability, bounded risk, deterministic policy, reconciliation, audit, and stop controls.

Monitoring delegation never silently grants send authority.

---

# 13. Trust, provenance, and failure recovery

## 13.1 Evidence over confidence theater

**ACCEPTED:** model confidence percentages or fluent rationale are not default proof. Prefer source-grounded evidence, explicit current state, and inspectable provenance.

## 13.2 Evidence receipts

**HYPOTHESIS:** early trust-building may show low-stimulation stewardship receipts such as:

```text
ABC社「社内確認中」
-> あなたの対応は不要として監視継続
-> 明日再評価
```

They are inspectable proof, not notifications or an agent activity feed.

## 13.3 Monitoring integrity

**ACCEPTED:** if provider access, source sync, scheduler, or reconciliation is materially degraded, Lunowa must stop stale reassurance and surface affected scope + concrete recovery. Integrity failure is distinct from interpretation error and is not a fake Responsibility state.

Detailed failure/recovery behavior, including AI degradation, permission-scope loss, offline external-effect handling, and `last trustworthy` semantics, is canonical in `docs/product/PRODUCT-CONTENT.md`.

## 13.4 Material miss

A user-discovered material false negative should, when supportable, disclose:

1. what was missed;
2. evidence-backed reason for failure;
3. impact window;
4. whether other delegated loops are affected;
5. what safe state was restored;
6. whether the affected delegation scope was narrowed/returned to confirmation mode.

Any safety-driven narrowing of previously granted scope should be disclosed. Repair should be scope-local unless evidence indicates systemic failure.

---

# 14. v1 scope

## 14.1 Core Product targets

- authorized Source Conversation/message reading;
- one-provider source ingestion/reconciliation sufficient for validated complete-loop behavior;
- Responsibility admission/update under canonical semantics;
- inbound/outbound unresolved-loop recognition sufficient for validated scenarios;
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

The detailed final `V1 CORE / V1 STRONG CANDIDATE / POST-V1 / DEFERRED / OUT` matrix is canonical in `docs/product/PRODUCT-CONTENT.md`.

## 14.2 Strong v1 candidates

- natural-language operational/source search;
- basic attachment preview and reply attachment upload;
- basic person context with current open loops + recent material history;
- optional awareness/digest behavior;
- simple quiet-hours/delivery preferences.

## 14.3 Deferred

- second provider before first-provider complete-loop proof;
- multi-account/cross-account breadth for completeness;
- full generic compose parity;
- broad Drafts/Sent/folder/label administration;
- bulk mailbox actions;
- Send Later parity;
- calendar integration until core-loop evidence justifies it;
- public contact enrichment;
- relationship graph/health scoring;
- travel bundling;
- subscription/billing Product;
- activity/location-based interruptibility;
- generic automation/rule builder;
- broad autonomous external actions;
- full-client/mobile parity not needed for current learning.

## 14.4 Out from core identity

- CRM pipeline ownership;
- project-plan ownership;
- support-ticket lifecycle ownership;
- accounting/payment truth;
- generic personal task management;
- arbitrary workflow engine;
- personality/relationship scoring as core value;
- generic AI chat as primary daily workflow.

---

# 15. Competitive, commercial, and distribution posture

## 15.1 Competitive frontier

**EXTERNAL EVIDENCE:** current Gmail AI Inbox, Outlook Copilot, Superhuman, Shortwave/Tasklet, Microsoft Cowork and adjacent tools already occupy substantial portions of:

- AI to-do/priority extraction;
- summaries/drafting;
- natural-language search;
- Respond/Waiting-style organization;
- no-reply monitoring/follow-up drafts;
- background event-triggered automation;
- outcome/response verification claims;
- scoped approval/automation patterns.

Feature presence does not prove competitor quality/traction, but it prevents unsupported uniqueness claims.

## 15.2 Differentiation standard

**HYPOTHESIS:** Lunowa wins only if the **complete system** produces a better behavioral outcome than the target user's real current workflow:

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

**HYPOTHESIS:** paid subscription/prosumer pricing is plausible if Lunowa removes recurring cognitive/operational burden or costly missed outcomes.

**UNKNOWN:** exact price, free tier, packaging, billing interval, individual/business packaging, and willingness to pay.

Do not treat hypothetical WTP before credible value exposure as strong evidence.

## 15.4 Distribution

**UNKNOWN:** no acquisition channel is proven. Reachability/distribution is part of ICP selection rather than a post-build concern.

---

# 16. Validation and metrics

## 16.1 Current highest-priority gate

**ACCEPTED CURRENT SEQUENCE:** GitHub **Issue #36** remains the highest-priority Product-discovery gate.

It tests whether a reachable segment has recurring, costly, currently under-served communication-monitoring burden. This canonical Product consolidation does **not** authorize write-heavy Issue #28, production persistence, or provider/client breadth.

Issue #26 remains downstream mechanism evidence. Responsibility L2 proof remains separate technical evidence.

## 16.2 Evidence ladder

```text
recent real workflows show recurring under-served monitoring burden
-> coherent candidate segment survives falsification
-> Responsibility/Moment mechanism is understandable
-> immediate reconstruction/decision work improves
-> real/concierge system survives waiting periods
-> parallel self-check/reminder scaffolding decreases
-> user relies on Lunowa across days/weeks
-> value beats real incumbent/workaround
-> credible switching/dependency/payment intent
```

Do not infer a later arrow from an earlier one.

## 16.3 Candidate measures

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

## 16.4 Cheapest falsification

Prefer the smallest experiment capable of falsifying the highest-impact unresolved assumption. Product completeness is not permission to skip the evidence ladder.

---

# 17. Current major unknowns

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
- natural-language Operational Retrieval v1 criticality;
- attachment-content understanding depth;
- calendar integration timing;
- second-provider/multi-account incremental value;
- pricing/WTP/packaging;
- acquisition/distribution;
- long-term retention;
- provider-notification migration acceptance;
- exact legal/privacy retention/deletion/export/billing commitments required before shipping decision-complete Product-account deletion;
- whether Responsibility remains the simplest sufficient mechanism after real data.

Provider/API/platform/legal facts are time-sensitive and must be rechecked when they materially affect a decision.

---

# 18. Product invariants

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
27. **Detailed control/failure/lifecycle/Settings/Managed/Review/zero behavior and the final feature matrix are owned by `PRODUCT-CONTENT.md`; Product Golden scenarios remain subordinate to Responsibility semantic authority.**

---

# 19. Decision rule

When a Product choice is ambiguous, prefer the option that:

1. tests the segment/problem before implementation breadth;
2. reduces monitoring burden before secondary convenience;
3. measures against the user's real current alternative;
4. preserves source/provenance/account identity and human control;
5. returns attention only when justified by state/action/delay cost;
6. keeps AI interpretation separate from accepted state/authorization;
7. requires fewer low-value choices/approvals;
8. avoids full-client/provider/cross-account breadth unsupported by evidence;
9. degrades safely when AI/provider/scheduler components fail;
10. treats Responsibility/Moment/Product form as revisable mechanisms rather than sacred truth;
11. measures actual monitoring relinquishment, error burden, and reliance;
12. uses the cheapest experiment that can falsify the highest-impact unknown.

If stronger Product evidence changes a decision, update this file and the owning canonical design/domain/architecture/implementation artifact in the same accepted change where applicable.
