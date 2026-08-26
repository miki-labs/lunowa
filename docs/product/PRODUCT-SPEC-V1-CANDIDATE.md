# Lunowa Product Spec v1 Candidate

## Status

**Consolidated Product-content candidate — complete enough for canonical promotion audit, but NOT itself market validation, schema authority, or implementation authorization.**

This document consolidates the Product reasoning completed through **2026-08-27** into one coherent Product contract. It is intended to answer:

- what Lunowa exists to do;
- what problem and jurisdiction it accepts;
- what the v1 Product is and is not;
- what the user sees and does;
- how daily attention, monitoring, retrieval, and communication actions work;
- how onboarding/trust progression works;
- how closure, uncertainty, authority, and failures are handled;
- which decisions are current Product candidates versus empirical unknowns.

It consolidates but does **not silently supersede** existing authorities until a separate promotion/reconciliation change explicitly updates them:

- `PRODUCT.md` — current canonical Product authority;
- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md` — noncanonical doctrine synthesis;
- `V1-PRODUCT-SURFACE-CANDIDATE.md` — noncanonical v1 surface/scope candidate;
- `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md` — noncanonical onboarding/trust candidate;
- `responsibility/` — canonical Responsibility semantics;
- `docs/design/` — current accepted detailed UX/interaction design;
- `IMPLEMENTATION-PLAN.md` — implementation/evidence sequence.

This candidate does **not** create a new domain aggregate, lifecycle enum, persistence object, permission model, implementation phase, or automatic Product-hypothesis promotion.

### Decision labels

- **DOCTRINE CANDIDATE** — durable Product principle proposed for canonical promotion;
- **V1 CANDIDATE** — proposed v1 Product behavior/scope;
- **SUPPORTED INFERENCE** — strongly motivated by evidence but not directly proven for Lunowa;
- **PRODUCT HYPOTHESIS** — plausible Lunowa-specific choice requiring validation;
- **UNKNOWN** — materially unresolved by current evidence;
- **DEFERRED** — intentionally later;
- **OUT** — outside the Product's current core responsibility.

A Product spec can be complete while market validation remains incomplete. `Issue #36` remains the highest-priority problem/ICP discovery gate.

---

# 1. Product identity

## 1.1 Vision

> **世界一快適なメール体験**

Aspirational vision, not a measurable market claim.

## 1.2 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

## 1.3 Core value

**DOCTRINE CANDIDATE:** Lunowa primarily sells **Attention Delegation**.

The intended user outcome is:

> **「この件はもう自分で気にしておかなくていい。必要になったらLunowaが戻す。」**

The Product is successful when the user can stop repeatedly remembering, checking, and reconstructing unresolved communication while Lunowa carries the monitoring burden safely enough.

## 1.4 Product definition

> **Lunowa is an email-centered communication-monitoring Product that keeps unresolved communication outcomes under control on the user's behalf, stays quiet while the user is not needed, and returns the right issue with enough source-grounded context when attention is genuinely required again.**

## 1.5 The Product is not primarily

- an Inbox Zero tool;
- a unified inbox;
- an AI writing assistant;
- an AI chat homepage;
- a task manager;
- a CRM;
- a project manager;
- a ticket system;
- a generic automation/rule builder;
- a relationship-scoring system;
- a generic long-term memory assistant;
- a general autonomous agent.

These capabilities or adjacent conveniences may exist. None defines the Product.

---

# 2. Problem and jurisdiction

## 2.1 Product problem

**DOCTRINE CANDIDATE:** Lunowa focuses on **unresolved email-borne coordination** whose progress depends on another person, the user, time, an external event, approval, document, payment, decision, or changing evidence.

The strongest current problem framing is **Open-loop Monitoring Offload**.

`Open Coordination Loop` is Product-level vocabulary only. It does not replace the canonical `Responsibility` semantic concept or authorize a parent aggregate.

## 2.2 Strong-fit characteristics

A loop is a stronger Lunowa fit when several are true:

- it emerges naturally from communication rather than planned project structure;
- a material operational outcome remains unresolved;
- another person/event/time/evidence must change before closure;
- waiting is irregular or long enough to create monitoring burden;
- simple one-time snooze is insufficient;
- reply arrival may not equal outcome satisfaction;
- source communication is important evidence;
- no stronger structured system already monitors the relevant state adequately.

## 2.3 Stewardship modes

### Primary Steward

Lunowa may carry monitoring when no stronger structured system adequately owns the heterogeneous communication state.

### Overlay / Monitor

A CRM/ticket/project/accounting system may own canonical domain state while Lunowa only owns the communication-attention gap.

### Out / Reference only

Lunowa does not absorb generic personal tasks, project plans, CRM pipelines, ticket lifecycle, accounting truth, recurring automation, knowledge storage, or broad goals merely because related email exists.

## 2.4 Anti-scope invariant

> **Integrate evidence without automatically absorbing domain ownership.**

---

# 3. Who the Product is for

## 3.1 ICP status

**UNKNOWN:** exact ICP is not validated or frozen.

Do not call any occupation the accepted ICP before `Issue #36` or stronger evidence establishes it.

## 3.2 Current recruitment prior

**PRODUCT HYPOTHESIS:** prioritize self-managing, asynchronous, email-task-coupled users who:

- personally retain follow-through responsibility;
- coordinate several external counterparties;
- maintain multiple unresolved loops;
- repeatedly check Inbox/Sent/thread/task/calendar/notes to preserve state;
- have meaningful delay/miss cost;
- are not already adequately served by a dedicated system of record;
- have adoption autonomy.

Independent / small-firm B2B professionals are a first recruitment cohort hypothesis only.

---

# 4. Canonical semantic boundary

## 4.1 Responsibility remains canonical

Canonical Responsibility semantics remain owned by `docs/product/responsibility/`.

This Product spec relies on, but does not redefine, these FIXED principles:

- Message / Conversation / Responsibility are distinct;
- a Conversation can contain zero, one, or many Responsibilities;
- Responsibility identity follows the smallest communication-bounded operational outcome with coherent closure;
- `No Responsibility` is a first-class correct outcome;
- admission uses `TRACK / DO_NOT_TRACK / NEEDS_REVIEW` semantics;
- one focal event may affect/create multiple Responsibilities;
- multiple obligation legs and expected events are allowed;
- source due, expected-event time, user target, resurface time, and follow-up time are distinct;
- claim and observation are distinct;
- important accepted facts require provenance;
- AI interpretation is not authority;
- `My Turn / Waiting / Later / Done / Review` are Product projections, not lifecycle truth;
- uncertainty does not automatically imply asking the user;
- cross-account semantic merge is initially prohibited;
- AI failure must not block ordinary source reading/reply/search.

## 4.2 Product grammar

Without creating a new aggregate, the Product reasons conceptually about:

```text
tracked unresolved operational outcome
  -> Responsibility identity / outcome
  -> obligation legs
  -> expected events
  -> evidence
  -> temporal/return conditions
  -> completion/closure criteria
  -> uncertainty / authority
```

## 4.3 Action, expected event, outcome

- **Action** — something an actor does;
- **Expected Event** — a future observation that should cause reconsideration;
- **Outcome** — the state the tracked Responsibility is trying to reach.

A reply can satisfy an expected event without satisfying the outcome.

---

# 5. Minimum Complete Delegation Loop

## 5.1 v1 thesis

**V1 CANDIDATE:** v1 is the smallest Product that completes Attention Delegation end-to-end, not a reduced Gmail/Outlook clone.

```text
material communication / source evidence
  -> candidate interpretation
  -> Responsibility admission/update under trusted rules
  -> decide whether user attention is required
  -> if no: offload and monitor quietly
  -> re-evaluate on message / time / event / contradiction
  -> if yes: return attention
  -> restore minimum context
  -> enable one safe meaningful action/decision
  -> reconcile external effects
  -> verify whether the outcome is actually satisfied
  -> close monitoring only when justified
```

The essential behavior is not merely task extraction, no-reply reminders, summarization, drafting, or AI search. Current major products already cover substantial portions of those capabilities.

## 5.2 Golden path example

```text
User sends:
"金曜までに見積書をお願いします"

Lunowa:
- admits/updates a Responsibility
- monitors for a usable quotation and relevant time/evidence
- removes the loop from active attention when no user action is needed

Counterparty:
"社内確認中です。明日回答します"

Lunowa:
- updates evidence / expected event
- user action remains unnecessary
- stays silent

Quotation arrives:
- current evidence is re-evaluated
- user review is now required
- Needs You + Moment return the issue

User reviews / replies as needed
- external send is reconciled
- Responsibility returns to Waiting or closes only if its outcome/closure condition justifies it
```

The user should genuinely not need to keep checking during the silent interval.

---

# 6. Attention model

## 6.1 Separate four questions

**DOCTRINE CANDIDATE:** always separate:

1. **Operational State** — what changed?
2. **Attention Need** — does the user need to know, decide, or act now?
3. **Delivery Urgency** — when/how should that attention interrupt?
4. **Authority** — may Lunowa decide/act without explicit approval?

Do not collapse these into one importance/confidence score.

## 6.2 Message arrival is evidence, not attention

```text
new message / reply / time / provider observation
  -> evidence changes
  -> accepted state re-evaluates
  -> attention may or may not change
```

Examples:

- `"legal is still reviewing"` may remain silent;
- `"please clarify item 3"` may create Needs You;
- no new mail plus a missed expected event may also create Needs You.

## 6.3 Delivery lanes

**V1 CANDIDATE:** use a simple Product delivery model while keeping richer internal semantics:

- **Silent** — state changed; user action/awareness is unnecessary;
- **Awareness** — no action required, but the user explicitly benefits from knowing;
- **Normal Attention** — action/judgment required but next intentional review point is safe;
- **Urgent Attention** — delaying to the next normal review point has material cost;
- **Integrity Alert** — Lunowa itself cannot reliably fulfill monitoring.

`Integrity Alert` is Product/system degraded-state UX, not automatically a Responsibility, Needs You item, or semantic Review subject.

## 6.4 Delivery principle

> **Not as soon as possible. As late as safely possible.**

Urgency is primarily about **delay cost + actionability**, not VIP status, message recency, or model confidence alone.

---

# 7. Daily Operating Model

## 7.1 Continuous monitoring, episodic human attention

**DOCTRINE CANDIDATE:** Lunowa is continuously active; the user is only intermittently required.

The Product must remain useful even if the user does not open it every day.

```text
while user is away:
- source ingestion/reconciliation continues
- Waiting state can evolve
- temporal triggers continue
- closure/reopen logic continues
- urgent attention can still be delivered
- monitoring integrity is observed
```

## 7.2 App open

On open, show a fresh attention-state view, not an arrival-by-arrival unread backlog.

A successful empty state can be:

> **今、あなたが対応する必要はありません。**

with quiet reassurance that Lunowa is monitoring delegated items.

## 7.3 Start-of-day brief

**PRODUCT HYPOTHESIS:** an optional start-of-day brief may summarize current attention state and overnight awareness, but it must not become an Inbox recap or mandatory ritual.

Do not make unread counts the primary morning unit.

## 7.4 Awareness digest

**PRODUCT HYPOTHESIS:** optional digest may summarize non-actionable progress/reassurance.

Invariant:

> **A digest must never be the only place where actionable work is hidden.**

Needs You / Review / urgent delivery remain independently safe if a digest is ignored.

## 7.5 Quiet hours

Quiet hours suppress interruption, never monitoring.

```text
state changes at night
-> re-evaluate immediately
-> if delay is safe, hold delivery
-> if delay materially violates the Attention Contract, allow the bounded urgent exception policy
```

Initial behavior should use user-owned simple schedules rather than invasive activity/location inference.

## 7.6 No mandatory daily shutdown

End-of-day review may exist as optional ritual, but the Product must remain safe without a `close the day` action.

Waiting/Managed work can correctly remain open across days.

## 7.7 Product metrics must not optimize for compulsive opening

DAU/session count alone is not the North Star. Repeated checking can indicate distrust.

Potentially valuable behavior includes days where Lunowa performs monitoring without unnecessary user opens.

---

# 8. Surface architecture

## 8.1 Conceptual surfaces

**V1 CANDIDATE:** the smallest coherent Product uses five conceptual surfaces plus a lightweight landing composition:

1. **Needs You** — current actionable USER work;
2. **Moment** — temporal context restoration + safe next action;
3. **Managed** — delegated-monitoring reassurance + on-demand inspection;
4. **Review** — material semantic/safety ambiguity;
5. **Source Conversations** — original communication/provenance fallback;
6. **Home/Landing** — composition of Review, Needs You, Managed reassurance, and Source entry; not a sixth semantic state.

## 8.2 Home

Home answers quickly:

1. Do I need to do anything now?
2. Is there a material ambiguity/safety issue?
3. Is Lunowa still carrying the rest?
4. Can I reach the source immediately?

Candidate hierarchy:

```text
確認が必要       1   # only when material/non-zero
あなたの対応     3

[attention items]

Lunowaが見ています 14
現在、追加対応が必要なものはありません

[会話を見る]
```

## 8.3 Needs You

Contains only admitted Responsibilities with a material currently actionable USER obligation/judgment.

It does not contain:

- generic important/new mail;
- Waiting;
- intentionally deferred Later;
- pre-admission Review;
- Responsibilities blocked by material Review;
- awareness-only updates.

Order by explainable attention tiers such as material overdue/delay cost, near due, blocking work, then other actionable work — not newest-message order and not one opaque model score.

## 8.4 Moment

Moment restores the minimum context needed after offload:

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
  -> full original communication/attachment
```

## 8.5 Managed

Managed is assurance + inspection, not a second Inbox or agent operations console.

Default presentation prefers aggregate reassurance. On-demand inspection should explain:

- tracked outcome;
- who/what is expected to move;
- next expected event;
- relevant return condition;
- monitoring integrity;
- source access.

**PRODUCT HYPOTHESIS:** Waiting and Later normally become filters/details under Managed rather than permanent high-frequency top-level navigation.

## 8.6 Review

Review resolves the **smallest material question** preventing safe delegation or action.

It may present:

- pre-admission `NEEDS_REVIEW`; or
- an admitted Responsibility with field-level uncertainty/safety conflict.

The subject types remain distinct internally.

Review is not a low-confidence AI dump and is not routine external-action approval.

## 8.7 Source Conversations

Source is optional in the happy path but always available in the trust path.

Source supports ordinary reading, verification, correction, exact retrieval, and cases where the user simply wants email rather than an operational Moment.

---

# 9. Onboarding and trust progression

## 9.1 Earn delegation; do not demand global trust

**DOCTRINE CANDIDATE:** onboarding should earn a bounded behavior:

> **“I am willing to let Lunowa monitor this kind of communication loop for me.”**

Do not model trust as one scalar that unlocks all capabilities.

Capability, observed reliability, and user delegation permission remain separate.

## 9.2 First-run

**V1 CANDIDATE:**

1. connect one real mailbox;
2. explain compactly what Lunowa reads/monitors and what it will not autonomously do;
3. keep source/provider state intact;
4. choose one real current communication loop rather than auto-activating historical mail broadly;
5. show the bounded monitoring contract in ordinary language;
6. user explicitly chooses `[この件を任せる]`;
7. move it out of active attention when current semantics justify that.

Thread selection must not imply `1 thread = 1 Responsibility`.

## 9.3 Delegation contract

Early Product UX should make legible:

- what outcome Lunowa is watching;
- what it currently believes is pending;
- what events/time should cause reconsideration;
- what it will **not** do automatically.

## 9.4 Trust progression

### Phase A — bounded individual loops

User delegates specific real loops; source/evidence remains easy to inspect.

### Phase B — assisted delegation

Lunowa proposes candidate loops, and the user can delegate or decline cheaply.

Declining a candidate is not automatically evidence of distrust.

### Phase C — optional class-scoped monitoring

After demonstrated sufficiently reliable use, Lunowa may offer a narrow ordinary-language class, for example `期限つきで相手に依頼した件`.

This is not a generic rule builder.

Even inside an opted-in class, ordinary `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`, `No Responsibility`, uncertainty, identity, and safety semantics still apply.

### Phase D — quiet default

For explicitly enabled safe classes, admitted eligible loops may be monitored automatically without routine confirmation.

## 9.5 Monitoring autonomy != action autonomy

A user may permit automatic monitoring while email send remains explicit user approval.

External-action authority has its own action/context/scope-specific permission boundary.

## 9.6 Source-first to Attention-first migration

Do not force Inbox abandonment on day one.

After credible experience, Lunowa may explicitly offer `Needs You` as the default landing. Do not silently switch based on an internal trust score.

## 9.7 Source-notification migration

**PRODUCT HYPOTHESIS:** real Attention Delegation may eventually require reducing redundant source-app notifications.

This must be progressive and explicit:

```text
initial: existing provider notifications remain
-> user observes Lunowa reliability
-> Lunowa offers to reduce normal source notifications
-> user opts in
-> Lunowa becomes the attention-delivery layer for the delegated scope
```

Do not require source notifications off before trust is earned.

---

# 10. Closure and reopening

## 10.1 Activity is not closure

> **A reply, completion claim, attachment, send action, read state, or silence is evidence — not automatic proof that the tracked outcome is satisfied.**

## 10.2 Distinguish

```text
action performed
!= completion claimed
!= outcome satisfied
!= user/Lunowa monitoring close
```

## 10.3 Closure question

The Product-level question is:

> **Is there any material reason the user or Lunowa still needs to monitor this Responsibility?**

## 10.4 Product-level closure gates

**PRODUCT HYPOTHESIS:** automatic monitoring closure should normally satisfy relevant:

1. outcome gate;
2. obligation gate;
3. evidence gate;
4. authority gate.

These are Product-level synthesis only and do not replace canonical reducer/oracle semantics.

## 10.5 Silence

Silence alone never proves successful satisfaction.

A policy may stop tracking after silence, but must not falsely represent that as successful outcome satisfaction.

## 10.6 User stop tracking

User tracking close does not change external-world obligations or prove success.

## 10.7 Reopen

Preserve FIXED Responsibility semantics:

- REOPEN applies when the **same operational outcome was never actually satisfied**;
- prior evidence/history remains;
- genuinely new work after a truly closed episode normally creates a **new Responsibility**.

---

# 11. Retrieval, history, and people context

## 11.1 Search is not the moat

Natural-language email search, AI summaries, past-context retrieval, and multi-source assistant search are increasingly incumbent capabilities.

Lunowa's distinctive Product job is **Operational Retrieval**:

> find source evidence **and** explain the current unresolved state, material change history, and present attention need.

## 11.2 Retrieval jobs

The same search surface may support:

- **Source Find** — exact mail/thread/file retrieval;
- **Fact Answer** — evidence-grounded answer;
- **Operational Recall** — `この件どうなってる？`;
- **Context Recall** — relevant recent history/person context.

Traditional deterministic search remains available for exact retrieval.

## 11.3 Current truth is time-aware

Derived memory must not win merely by semantic similarity.

For time-varying material facts, answers should prefer current accepted/evidence-relative state and expose `as of` / material change when useful.

Example:

```text
現在: 580,000円
8/25に500,000円から変更
[source]
```

## 11.4 Memory principle

> **Derived memory is disposable; evidence and accepted state are durable.**

Do not make an opaque LLM memory store canonical Product truth.

Historical source remains searchable without automatically becoming a live Responsibility.

## 11.5 Retrieval does not mutate state

Search/answering is a read path.

If retrieval exposes new source inconsistency, any state change still passes normal evidence/admission/reducer/authority rules.

## 11.6 Retrieval scope is authorization-filtered

Semantic similarity is candidate retrieval, not permission or identity authority.

Do not leak unrelated personal/work/account context merely because vectors are similar.

Cross-account semantic merge remains prohibited initially.

## 11.7 History

User-facing history should prefer a meaningful Responsibility timeline:

```text
request sent
-> counterpart update
-> expected date changed
-> result arrived
-> user action
-> closure
```

Do not expose a permanent raw agent/tool trace as the default Product history.

## 11.8 People context

People context exists to restore communication context, not to become a Personal CRM.

A person context may show:

- identity/organization from authorized source/provider context;
- current open Responsibilities with that person;
- recent material communication/topics;
- relevant files/source Conversations.

Do not make relationship scoring, personality profiling, network graphs, public enrichment, or relationship-health gamification v1 core.

---

# 12. Ordinary communication action boundary

## 12.1 Principle

> **Native actions exist to complete the Attention loop, not to imitate the provider.**

Provider remains the communication system of record until evidence shows Lunowa has a Product reason to own more client breadth.

## 12.2 Native Action Test

Prefer a native Lunowa action when it:

1. naturally arises from an active Moment/Responsibility;
2. materially advances/closes the Attention Delegation loop;
3. would create significant context reconstruction if forced back into the provider;
4. can be represented as a bounded, inspectable, safely authorized action.

Otherwise prefer provider fallback or defer.

## 12.3 v1 action matrix

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
| Lunowa Pin | **explicit retrieval control; orthogonal to Responsibility** |
| provider Snooze | **distinct from Lunowa Later** |
| bulk mailbox actions | **DEFER** |
| contact management | **OUT** |
| basic recipient lookup | **support contextual communication** |
| calendar availability read | **POST-v1 strong candidate** |
| calendar create/modify | **DEFER; approval boundary** |
| generic automation builder | **OUT** |
| autonomous email send by default | **NO** |

## 12.4 Mailbox state is not Responsibility state

**DOCTRINE CANDIDATE:** provider mailbox hygiene and Lunowa operational state are orthogonal.

```text
Unread   != Needs You
Read     != Done
Archive  != Closed
Trash    != Cancelled
Snooze   != Later
Star     != Responsibility importance
```

Likewise, changing a Responsibility projection must not automatically archive/delete/relabel provider mail unless a separate explicit user policy is later accepted.

## 12.5 Contextual sending

Initial external communication path:

```text
Moment
-> draft prepared
-> user sees sender account / recipients / content / attachments
-> user edits/reviews
-> explicit Send
-> provider call
-> provider result reconciled
-> Responsibility re-evaluated
```

A send attempt is not accepted provider send. A reconciled send resolves only when sending itself satisfies that Responsibility's closure condition.

## 12.6 Generic compose asymmetry

Arbitrary new communication creation does not need to be native v1 Product scope.

The user may send from the provider; Lunowa can observe authorized Sent evidence and offer/admit monitoring afterward.

Existing-loop actions are therefore more Product-critical than generic compose parity.

## 12.7 Full-client status must be earned

**PRODUCT HYPOTHESIS:** v1 should prefer a **companion/hybrid** form with one-provider complete-loop proof rather than immediate provider parity.

A future full client remains allowed if real usage shows provider fallback/context switching is a material remaining burden after Attention Delegation is proven.

Replacement status is earned by usage, not assumed by roadmap.

---

# 13. Autonomy and authority

## 13.1 Attention delegation before authority delegation

> **Lunowa first delegates attention, not consequential authority.**

Initial autonomous responsibilities may include:

- read authorized evidence;
- derive candidate interpretation;
- reconcile permitted internal monitoring state under accepted trusted rules;
- maintain temporal monitoring;
- choose silent/attention projection under accepted policy;
- restore context;
- prepare low-risk drafts/actions.

Consequential external action remains a separate authorization boundary.

## 13.2 Capability != permission

A more capable model does not automatically receive more Product permission.

Permission belongs to **action + context + scope**, not one global autonomy slider.

## 13.3 Default external action posture

| Action | Default posture |
| --- | --- |
| internal monitoring/reconsideration | autonomous where trusted rules permit |
| summary/context/draft preparation | autonomous |
| email Send | human approval by default |
| shared calendar/system mutation | human approval by default |
| speak/commit on user's behalf | explicit bounded authorization or approval |
| destructive delete / permission change / payment / contract acceptance | outside initial autonomous authority |

## 13.4 Policy boundary

Conceptually:

```text
LLM proposes/interprets
-> deterministic Product/policy authority decides allowed state/action
-> approval if required
-> tool/provider executes
-> outcome is reconciled/verified
```

The model does not choose its own authority.

## 13.5 Bounded standing authorization later

Future pre-authorization may exist only when action schema, account/recipient/scope, revocability, risk, deterministic policy, reconciliation, audit, and stop controls are explicit.

Monitoring delegation must never silently grant send authority.

---

# 14. Trust, provenance, and failure recovery

## 14.1 Evidence over confidence theater

Do not use model confidence percentages or fluent rationale as default proof.

Prefer source-grounded facts, current system state, and inspectable provenance.

## 14.2 Evidence receipts

Early trust-building may show low-stimulation stewardship receipts, for example:

```text
ABC社「社内確認中」
-> あなたの対応は不要として監視を継続
-> 明日再評価
```

They are inspectable proof, not notifications or an agent activity feed.

## 14.3 Monitoring integrity

If source sync/provider permission/scheduler/reconciliation is materially degraded, Lunowa must stop showing stale reassurance and surface a concrete integrity alert with affected scope and recovery action.

Integrity failure is distinct from interpretation error.

## 14.4 Material miss

A user-discovered material false negative requires more than apology UX.

The Product should answer, when supported:

1. what was missed;
2. why it was not surfaced — only with evidence-backed causal information;
3. impact window;
4. whether other delegated loops are affected;
5. what safe state was restored;
6. whether the affected delegation scope was narrowed/returned to confirmation mode.

Any safety-driven narrowing of a previously broad delegation scope should be disclosed, not silently changed.

## 14.5 Scope-local repair

A failure in one function does not automatically require disabling unrelated reliable functions. Repair should be bounded to the affected reliability/permission scope unless evidence indicates a systemic failure.

---

# 15. v1 scope

## 15.1 CORE Product capabilities

- authorized source Conversation/message reading;
- one-provider source ingestion/reconciliation sufficient for the loop;
- Responsibility admission/update under canonical semantics;
- inbound and outbound unresolved-loop recognition;
- obligation/expected-event/temporal monitoring sufficient for validated scenarios;
- silent Waiting monitoring;
- time/event/contradiction re-evaluation;
- Needs You;
- Moment;
- Managed reassurance/inspection;
- material Review;
- Source access/provenance;
- explicit Later / return condition where valid;
- closure/stop-tracking/reopen semantics;
- contextual reply/draft/send + provider reconciliation;
- exact source search;
- Responsibility-aware operational retrieval sufficient for validated cases;
- monitoring-integrity UX;
- safe fallback when intelligence is degraded.

## 15.2 Strong v1 candidates

- natural-language source/operational search;
- basic attachment preview and reply attachment upload;
- basic person context showing current open loops + recent material history;
- optional awareness/digest behavior;
- simple quiet-hours/delivery preferences.

## 15.3 DEFERRED

- second provider before first-provider complete-loop proof;
- multi-account/cross-account breadth for completeness;
- full generic compose parity;
- advanced Drafts/Sent/folder/label administration;
- bulk mailbox actions;
- Send Later parity;
- calendar availability integration until core loop is supported;
- event creation/mutation until authority need is proven;
- broad public contact enrichment;
- relationship graph/health scoring;
- travel bundling;
- subscription/billing product;
- location/activity-based interruptibility;
- sophisticated full-client mobile fidelity;
- generic automation/rule builder;
- broad autonomous external actions.

## 15.4 OUT from core Product identity

- CRM pipeline ownership;
- project-plan ownership;
- support-ticket lifecycle ownership;
- accounting/payment truth;
- generic personal task management;
- arbitrary BPM/workflow engine;
- personality/relationship scoring as core value;
- generic AI chat as primary daily workflow.

---

# 16. Competitive position

## 16.1 Do not claim feature-space uniqueness

Do not treat these as differentiation by themselves:

- AI inbox/to-do extraction;
- priority classification;
- summary/drafting;
- natural-language search;
- Respond/Waiting labels;
- sent/no-reply reminders;
- follow-up drafts;
- outcome/response verification as a phrase;
- multiple commitments per thread as a phrase;
- companion/hybrid form;
- background email automation.

Current Gmail, Outlook/Copilot, Superhuman, Shortwave/Tasklet, Microsoft Cowork and adjacent products occupy substantial parts of this feature space.

## 16.2 Differentiation standard

**PRODUCT HYPOTHESIS:** Lunowa wins only if the **complete system outcome** is better for a specific segment than its real current workflow:

```text
less parallel self-checking
+ less context reconstruction
+ correct resurfacing
+ acceptably low material false negatives
+ acceptably low unnecessary Review/resurfacing
+ trustworthy source/provenance/account/control
+ low enough correction/approval burden
+ enough repeated value to justify dependency/switching/payment
```

Differentiation is earned empirically, not by ontology depth.

---

# 17. Measurement and validation

## 17.1 Current highest-priority gate

`Issue #36` remains the highest-priority Product-discovery gate.

It tests whether a reachable segment has recurring, costly, under-served communication-monitoring burden. It does not validate PMF or this full Product spec.

## 17.2 Behavioral measures

Important candidate measures include:

### Delegation

- real loops explicitly delegated;
- continued delegation after success;
- narrow class-scoped delegation opt-in;
- delegation contraction after errors.

### Parallel self-monitoring

- `N_self_check` before Lunowa returns;
- Inbox/Sent/source-thread fallback during delegated periods;
- parallel reminder/task creation;
- repeated Managed inspection without material state change.

### Attention quality

- correct resurfacing;
- material false-negative rate;
- unnecessary resurfacing/Review burden;
- attention-delivery timeliness.

### Context restoration

- time from Moment open to correct safe action;
- source expansion/reread before action;
- reconstruction operations.

### Reliability/integrity

- monitorable vs degraded time;
- integrity-alert latency;
- reconciliation lag;
- impact window of discovered misses.

### Commercial

- switching/dependency behavior;
- retention by delegated monitoring, not opens alone;
- WTP only after credible value exposure.

## 17.3 Success may reduce engagement metrics

DAU/open count/unread processing are not sufficient Product KPIs. A user who safely does **not** open Lunowa because nothing requires attention may be experiencing the intended value.

---

# 18. Current major unknowns

Do not silently convert these into facts:

- exact ICP / first segment;
- prevalence/severity of monitoring burden;
- current-tool adequacy for the eventual ICP;
- actual false-negative / false-positive / Review trade-off attainable in production;
- threshold at which users truly stop parallel checking;
- exact delivery/digest defaults;
- exact quiet-hours/urgent policy;
- exact class-scoped delegation offers/thresholds;
- whether Attention Contract is the final Product term;
- whether the five-surface IA is best in real use;
- whether companion/hybrid remains superior after users trust Lunowa;
- when/if generic native compose becomes Product-critical;
- whether natural-language operational retrieval is v1-critical;
- attachment-content inference depth;
- calendar integration timing;
- second-provider / multi-account incremental value;
- exact pricing/packaging/WTP;
- acquisition/distribution;
- long-term retention;
- whether users accept reducing provider notifications;
- whether Responsibility remains the simplest sufficient internal mechanism after real data.

---

# 19. Product invariants proposed for promotion

1. **Attention Delegation is the core user value.**
2. **Open Coordination Loop is Product vocabulary; Responsibility remains the canonical semantic object.**
3. **Communication activity is evidence, not closure.**
4. **Message arrival is not automatically an attention event.**
5. **State can change immediately while human interruption waits until justified.**
6. **Needs You contains current user work, not generic importance or awareness-only information.**
7. **Managed work is inspectable, not attention-seeking.**
8. **Moment returns minimum trustworthy context, not the whole history.**
9. **Source is optional in the happy path and always available in the trust path.**
10. **Monitoring autonomy and consequential action authority are separate.**
11. **Capability does not grant permission.**
12. **Derived memory is disposable; evidence and accepted state are durable.**
13. **Historical source can be searchable without becoming a live Responsibility.**
14. **Retrieval does not silently mutate accepted state.**
15. **Mailbox state is not Responsibility state.**
16. **Native communication actions exist to complete the Attention loop, not to imitate the provider.**
17. **Provider remains the communication system of record until Product evidence justifies broader ownership.**
18. **Quiet hours suppress interruption, never monitoring.**
19. **Digest/awareness surfaces may never hide actionable work that exists nowhere else.**
20. **Monitoring-integrity failure must be surfaced honestly and is not a fake Responsibility state.**
21. **Trust is earned through bounded successful delegation, not inferred from one scalar score.**
22. **Class-scoped monitoring never bypasses canonical admission or `No Responsibility`.**
23. **A material miss requires transparent impact + concrete recovery, not apology-only UX.**
24. **Full-client replacement is earned by usage; it is not assumed by roadmap.**
25. **Differentiation is a comparative behavioral outcome, not a feature/ontology claim.**

---

# 20. Decision rule

When Product choices conflict, prefer the option that:

1. reduces monitoring burden before secondary convenience;
2. preserves source/provenance/account identity and user control;
3. requires fewer low-value decisions/approvals;
4. returns attention only when justified by state/action/delay cost;
5. keeps AI interpretation separate from accepted authority;
6. avoids generic client/CRM/workflow breadth unsupported by Product evidence;
7. allows safe degraded behavior when AI/provider/background infrastructure fails;
8. tests the cheapest highest-impact unknown before broad implementation;
9. measures real delegation/reliance against the user's real alternative;
10. can be falsified or revised without protecting prior design work from stronger evidence.

---

# 21. Product-content completion criterion

This candidate treats **Product-content design as complete enough for reconciliation** because it now specifies, in one coherent contract:

- purpose/value;
- problem/jurisdiction;
- current ICP uncertainty;
- semantic boundary;
- core loop;
- surface model;
- daily operating rhythm;
- onboarding/trust progression;
- closure/reopen;
- retrieval/history/people context;
- ordinary communication actions;
- autonomy/authority;
- failure recovery;
- v1 scope/non-goals;
- validation/metrics;
- remaining unknowns.

This does **not** mean the Product is empirically validated, implementation-ready in every area, or guaranteed to survive Issue #36. Strong evidence may still revise the spec.
