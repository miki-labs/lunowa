# Lunowa Product Constitution v1 Candidate

## Status

**Durable Product-doctrine candidate — NOT yet the canonical replacement for `PRODUCT.md`.**

This document consolidates the strongest Product reasoning reached on 2026-08-26 after reviewing:

- email / CSCW / prospective-memory evidence;
- current 2026 email and agentic-product behavior;
- case-management and commitment semantics;
- current agent autonomy / governance / security guidance;
- current long-horizon productivity-agent reliability evidence.

`docs/product/PRODUCT.md` remains the canonical detailed Product contract until an explicit promotion/reconciliation decision is made.

This candidate is intentionally narrower than a feature specification. It defines **what Lunowa is trying to be, what it refuses to become, what responsibility it accepts, when that responsibility ends, and how authority may or may not be delegated to AI/agents.**

Labels used below:

- **DOCTRINE CANDIDATE** — proposed durable Product principle;
- **SUPPORTED INFERENCE** — synthesis strongly supported by external evidence but not itself a published standard;
- **PRODUCT HYPOTHESIS** — plausible Lunowa-specific design still requiring validation;
- **UNKNOWN** — material unresolved question.

---

# 1. Product purpose

## 1.1 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

## 1.2 Core user value

**DOCTRINE CANDIDATE:** Lunowa primarily offers **Attention Delegation**.

The user is not buying a richer ontology, a better label system, or merely a faster inbox. The intended value is:

> **「この件はもう自分で気にしておかなくていい。必要になったらLunowaが戻す。」**

The desired behavioral change is **monitoring relinquishment**: the user stops parallel manual checking because Lunowa has earned enough trust to carry the monitoring burden.

## 1.3 Internal managed object

**SUPPORTED INFERENCE / PRODUCT HYPOTHESIS:** the strongest current internal managed object is an **Open Coordination Loop** — an unresolved communication-borne outcome whose progress depends on the user, another person/organization, future time, an external event, approval, document, payment, decision, or other changing evidence.

This is an internal model, not required user-facing vocabulary.

---

# 2. Jurisdiction: what Lunowa owns

## 2.1 Primary stewardship boundary

**DOCTRINE CANDIDATE:** Lunowa should primarily steward:

> **email-originated or email-evidenced unresolved coordination that is externally dependent, temporally open, insufficiently served by a stronger structured system of record, and valuable enough that continued human monitoring creates real burden.**

A loop is a stronger Lunowa fit when several of these are true:

- it emerges naturally from communication rather than explicit project planning;
- an outcome remains materially unresolved;
- progress depends on another person, organization, time, or external event;
- the next sequence cannot be fully predetermined;
- waiting spans enough time to create monitoring burden;
- email/thread/document changes are important evidence;
- a simple reminder timestamp does not fully represent the state;
- closure requires interpreting whether the expected result actually occurred;
- no dedicated system already owns the relevant state adequately.

## 2.2 Primary Steward / Overlay / Out

**DOCTRINE CANDIDATE:** Lunowa should not assume ownership merely because communication appears in email.

### Primary Steward

Lunowa may be the principal monitor when no stronger structured system owns the relevant heterogeneous coordination state.

Examples:

- waiting for a client/vendor response where the requested outcome matters;
- waiting for a document, approval, confirmation, decision, or information;
- negotiation/clarification that changes state unpredictably;
- one conversation containing several independent obligations/outcomes;
- a deferred communication loop that must return on an event/time condition.

### Overlay / Monitor

When a dedicated system already owns canonical business state, Lunowa may monitor only the communication-attention gap.

Examples:

- CRM owns deal stage; Lunowa may notice a client email that creates a new unresolved question;
- ticket system owns support case; Lunowa may surface a communication requiring the user's personal attention;
- project system owns tasks; Lunowa may monitor an external stakeholder loop that falls outside the project workflow.

### Out / Reference only

Lunowa should not become the canonical owner of:

- generic personal to-dos;
- long-term goals;
- project plans/dependency graphs;
- CRM sales pipelines;
- support-ticket lifecycle;
- deterministic recurring workflow automation;
- generic knowledge storage;
- domain systems such as accounting merely because related email exists.

## 2.3 Anti-scope invariant

> **Lunowa does not become a Task Manager, Project Manager, CRM, ticket system, workflow engine, or domain system of record merely because related communication appears in email.**

## 2.4 Evidence integration without domain absorption

**DOCTRINE CANDIDATE:** future integrations may contribute evidence without transferring domain ownership.

Example:

```text
email says "payment sent"
  + payment provider later confirms receipt
  -> stronger evidence for the coordination loop
```

This does not require Lunowa to become the accounting system.

---

# 3. The Attention Contract

## 3.1 Product promise

**PRODUCT HYPOTHESIS:** the Product contract can be modeled as an **Attention Contract**:

> Lunowa agrees to monitor a specific unresolved outcome and keep the user silent from it while no material user attention is required, then return it under defined conditions.

An Attention Contract may include:

- what outcome/state Lunowa is monitoring;
- what evidence/expected events matter;
- conditions under which Lunowa should remain silent;
- conditions under which user attention is required again;
- escalation/time conditions;
- delivery urgency;
- authority boundaries and required human review.

`Temporal Contract` remains the durable time/event reconsideration mechanism beneath this broader Product-level concept.

## 3.2 Attention Need is not Notification

**DOCTRINE CANDIDATE:** separate:

1. **Operational state** — what changed in the world?
2. **Attention need** — does the user now need to know, decide, or act?
3. **Delivery urgency** — when should that attention actually interrupt the user?
4. **Authority** — may Lunowa decide/act without human approval?

Do not collapse these into one generic priority/confidence score.

## 3.3 New message is not an attention event

A message/reply is evidence. It may or may not change the coordination state.

Examples:

- `"legal is still reviewing"` may update evidence but remain silent;
- a new clarification request may create `Needs You`;
- no new message plus a missed expected deadline may also create `Needs You`.

## 3.4 Delivery principle

**SUPPORTED INFERENCE / PRODUCT HYPOTHESIS:** delivery should be driven primarily by **delay cost and actionability**, not importance alone.

Candidate delivery levels:

- **Silent** — state changes internally; no user attention required;
- **Passive** — enters `Needs You`; next intentional visit is sufficient;
- **Deferred / opportune** — batch or deliver at a lower-interruption boundary;
- **Immediate** — interrupt when delay cost becomes materially high.

Directional principle:

> **Not as soon as possible. As late as safely possible.**

This is not yet a frozen algorithm or threshold model.

---

# 4. Coordination semantics

## 4.1 Conversation is evidence context, not the work state

A Conversation may contain zero, one, or many unresolved coordination objects / Responsibilities.

`1 thread = 1 task` is not accepted semantics.

## 4.2 Minimal conceptual grammar

Current strongest synthesis:

```text
Open Coordination Loop
  -> Outcome
  -> Responsibilities[]
  -> Expected Events[]
  -> Evidence[]
  -> Return Triggers[]
  -> Closure Criteria
  -> Uncertainty / Authority
```

`My Turn / Waiting / Later / Review / Done` remain projections, not canonical lifecycle truth.

## 4.3 Outcome != action != expected event

- **Action** — something an actor does;
- **Expected Event** — a future observation that should cause reconsideration;
- **Outcome** — the state the loop is ultimately trying to reach.

An expected reply can occur without satisfying the outcome.

## 4.4 Expected Event is first-class

`Who's turn?` alone is insufficient.

Example:

```text
counterparty says: "I sent it to legal"
owner-like interpretation: counterparty side
expected event: legal approval OR revision request
```

The expected event explains what Lunowa should continue monitoring.

---

# 5. Closure semantics

## 5.1 Closure is not reply arrival

**DOCTRINE CANDIDATE:**

> **Communication activity is evidence, not closure.**

A reply, completion claim, sent attachment, or executed action does not automatically prove that the user's expected outcome has been satisfied.

## 5.2 Performed != satisfied != closed

Distinguish at least conceptually:

```text
action performed
!= claimed completion
!= outcome satisfied
!= monitoring closed
```

The core Product question is not "did something happen?" but:

> **Is there any material reason the user or Lunowa still needs to monitor this loop?**

## 5.3 Closure gates

**PRODUCT HYPOTHESIS:** automatic monitoring closure should normally require all relevant gates:

1. **Outcome gate** — the relevant expected outcome is satisfied or otherwise no longer required;
2. **Obligation gate** — no material Responsibility remains open;
3. **Evidence gate** — sufficient source-grounded evidence supports the conclusion;
4. **Authority gate** — Lunowa/system has authority to make this determination without user judgment.

If a material gate fails, stay open or route to Review.

## 5.4 Silence does not prove satisfaction

> **Lunowa never treats communication silence alone as proof that the desired outcome was satisfied.**

A policy may intentionally stop tracking after a period of silence, but its semantic result should be something like expiration/abandonment, not false satisfaction.

## 5.5 Candidate terminal dispositions

Rich internal semantics may distinguish:

- **Satisfied** — desired outcome actually satisfied;
- **Cancelled / Waived** — user no longer requires the outcome;
- **Superseded** — replaced by a new loop/condition;
- **Expired** — purpose ceased due to time/event;
- **Abandoned** — user intentionally stops pursuing it.

A missed promise / violation usually creates a new attention condition rather than automatically closing the loop.

User-facing UI may still project several dispositions simply as `Done` where appropriate.

## 5.6 Satisfied != Closed

Outcome disposition and monitoring responsibility are separate axes.

A result may be provisionally satisfied while Lunowa retains short-lived monitoring where evidence can reasonably be invalidated. This should be risk-based, not universal.

## 5.7 Closure is reversible in history

Closing monitoring must not destroy evidence/history.

New contradictory evidence may reactivate a previously closed loop while preserving the prior decision trail.

---

# 6. Autonomy philosophy

## 6.1 Attention delegation before authority delegation

**DOCTRINE CANDIDATE:**

> **Lunowa first delegates attention, not authority.**

Initial Product responsibility should emphasize:

```text
observe
-> interpret candidate meaning
-> maintain/reconcile trusted internal state
-> monitor
-> resurface
-> restore context
-> prepare low-risk next actions
```

Consequential external action is a separate authorization boundary.

## 6.2 Capability != permission

**DOCTRINE CANDIDATE:** model/agent capability never automatically increases Product permission.

Allowed autonomy should be determined separately from technical capability.

A more capable future model may remain intentionally constrained if risk, reversibility, authorization, verification, or Product trust does not justify greater authority.

## 6.3 Autonomy is action-specific, not a global agent level

Avoid a single setting such as `AI autonomy = high`.

Permission belongs to an **action + context + scope**.

Conceptually:

| Action | Candidate default posture |
| --- | --- |
| read authorized source evidence | allowed within scope |
| derive candidate interpretation | allowed; never canonical merely because AI said so |
| reconcile internal monitored state under deterministic rules | allowed where acceptance contract permits |
| internal low-risk resurfacing/scheduling | allowed |
| prepare summary/context | allowed |
| prepare draft | allowed |
| send external email | human approval by default |
| create/modify shared calendar/system state | human approval by default |
| speak/commit on user's behalf | explicit bounded authorization required; otherwise approval |
| destructive delete / permission change / money movement / contract acceptance | outside initial autonomous authority; require stronger explicit transaction semantics or remain out |

This table is a Product-doctrine candidate, not a finalized implementation permission matrix.

## 6.4 Default deny and least privilege

**DOCTRINE CANDIDATE:** external tools/actions should be granted only the minimum scope required.

The model must not decide whether its own requested action is authorized.

Conceptually:

```text
LLM proposes
-> deterministic policy/authorization mediates
-> approval if required
-> tool executes
-> outcome is verified/reconciled
```

## 6.5 Reversibility matters, but apparent undo is not enough

An action should not be treated as low-risk merely because the UI advertises an undo window.

Email delivery, external commitments, payments, publishing, permission changes, and shared-system mutations can have effects that are not reliably retractable.

## 6.6 Human approval is a boundary, not the default workflow for everything

**SUPPORTED INFERENCE:** requiring human approval for every internal inference/state update would recreate an approval inbox and defeat Attention Delegation.

Human review should concentrate at **material authority boundaries**:

- consequential external action;
- ambiguous user intent;
- material uncertainty that can hide/close an obligation;
- high-impact or difficult-to-reverse state change;
- cross-account/identity-sensitive action;
- policy/security boundary.

Low-risk internal monitoring should not require routine approval merely to claim `human-in-the-loop`.

## 6.7 Bounded pre-authorization may exist later

Current frontier products show session/action/recipient-scoped pre-authorization is feasible.

**PRODUCT HYPOTHESIS:** future Lunowa may allow narrowly bounded standing authorization only when:

- the action schema is explicit;
- recipient/account/scope is explicit;
- user intent is durable and revocable;
- risk is bounded;
- deterministic policy constrains execution;
- outcome can be reconciled;
- audit history exists;
- failure modes and stop controls are clear.

This is **not** initial default permission for autonomous email sending.

## 6.8 Autonomy must degrade safely

When evidence, authorization, or confidence in the accepted state is insufficient:

```text
autonomous action
-> prepare only
or
-> Review
or
-> remain silent/open
```

Do not compensate for uncertainty by silently expanding authority.

## 6.9 Verification follows execution

Action execution does not close a loop merely because the tool call succeeded.

```text
attempted action
!= provider/system acceptance
!= desired real-world outcome
!= verified closure
```

This extends the existing Lunowa `send attempt != reconciled provider acceptance` invariant to agentic action generally.

---

# 7. Responsibility split

## 7.1 User owns

The user remains the default owner of:

- goals and final intent;
- material judgment;
- consequential commitments;
- sensitive identity/account choice;
- approval where required by risk/authority policy.

## 7.2 Lunowa owns

Within accepted scope, Lunowa aims to own:

- remembering;
- monitoring;
- state continuity;
- event/time reconsideration;
- appropriate resurfacing;
- context restoration;
- low-risk preparation;
- clear provenance and correction paths.

## 7.3 External systems own

Dedicated systems remain canonical for structured domain truth they already own well:

- CRM deal state;
- support-ticket state;
- project/task graph;
- payment/accounting state;
- other authoritative domain records.

Lunowa may consume authorized evidence without silently replacing those authorities.

## 7.4 LLM owns no canonical truth by itself

> **AI interpretation is evidence-producing/candidate-producing computation, not automatic Product truth or authorization.**

Accepted state and privileged effects require the relevant evidence, policy, domain logic, and authority boundary.

---

# 8. Safety/trust doctrine

## 8.1 Trust is a functional Product requirement

If users continue to check the original inbox/task system `just in case`, core Attention Delegation has failed.

## 8.2 Trust success raises false-negative cost

The more successfully users offload prospective monitoring, the more consequential a missed return condition can become.

Therefore false-negative control is not a cosmetic quality metric.

## 8.3 Over-alerting is also failure

Defensive over-alerting that creates a large `Review`/`Needs You` burden recreates a second inbox and prevents monitoring relinquishment.

## 8.4 Explain with evidence, not authority theater

Prefer:

```text
current conclusion / requested action
-> why now / what changed
-> material provenance
-> original communication
```

Do not use unvalidated model-confidence percentages as default authority signals.

## 8.5 Pause, revoke, inspect

Any later autonomous authority should support user-visible scope, revocation, history, and safe stop controls appropriate to its risk.

---

# 9. Product surface implications

These are **PRODUCT HYPOTHESES**, not frozen UX.

## 9.1 `Needs You` may be more central than Inbox

The Product model suggests a surface oriented around user attention rather than raw arrival order.

## 9.2 `Waiting` is system-owned work when delegation succeeds

`Waiting` should not necessarily become a large daily queue the user must manage.

Conceptually:

```text
Needs You
= user attention currently required

Managed by Lunowa
= Lunowa is actively carrying monitoring responsibility
```

## 9.3 Moment is context rehydration

When a loop returns after being forgotten, Moment should answer:

- why now?
- what materially changed?
- what remains open?
- what safe decision/action is now needed?

The Product should not force a full-thread reread merely because the user successfully forgot the loop.

---

# 10. Jurisdiction test for future features

Before adding a Product capability, ask in order:

```text
Did unresolved work materially emerge through communication/evidence Lunowa observes?
  no -> normally OUT

Is there a material unresolved outcome?
  no -> normally OUT

Does it depend on another person/event/time or changing external state?
  no -> likely task/project domain

Does future monitoring materially matter?
  no -> ordinary mail/task handling may be sufficient

Does a stronger dedicated system already own the state?
  yes -> Overlay or OUT

Can Lunowa durably represent and reconcile the return/closure conditions?
  no -> do not promise stewardship

Does completion require consequential external authority?
  yes -> user approval / bounded explicit authorization; do not silently expand autonomy

otherwise -> candidate for Lunowa Primary Stewardship
```

---

# 11. What this Constitution candidate does not claim

It does **not** prove:

- validated ICP;
- Product-market fit;
- willingness to pay;
- acceptable real-world false-negative/false-positive rates;
- that Open Coordination Loop is the final optimal ontology;
- that Attention Contract is the final user-facing or internal terminology;
- that a full email client is required;
- that Lunowa can outperform current alternatives;
- that autonomous external action should be a near-term feature;
- that richer semantics are a market moat.

Differentiation remains an empirical comparative outcome, not doctrine depth.

---

# 12. Promotion criteria

Before promoting this candidate into canonical Product authority, perform a full acceptance audit against at least:

- `docs/product/PRODUCT.md`;
- `docs/product/responsibility/*` canonical semantics;
- `docs/design/*` accepted interaction rules;
- `docs/product/IMPLEMENTATION-PLAN.md`;
- live Product-discovery contracts, especially Issue #36;
- dated evidence artifact supporting this candidate.

Promotion must explicitly resolve conflicts rather than silently allowing two Product authorities.

High-value falsifiers include:

- target users do not materially self-monitor external communication loops;
- simple reminders/current products already eliminate the burden sufficiently;
- reliable stewardship requires Review burden comparable to checking the inbox;
- users refuse to delegate monitoring even under credible controls;
- the state model is too complex to infer/reconcile safely;
- a dedicated system of record already owns most high-value target loops;
- Product value depends principally on autonomous execution rather than monitoring offload.

---

# 13. Compact Product Constitution candidate

> **Lunowa exists to let people stop carrying unresolved email-borne coordination in their heads. It primarily stewards externally dependent, temporally open communication loops that are not already better owned by a structured system of record. Lunowa should preserve evidence, maintain state continuity, stay silent while the user is not needed, and return attention only when a material action, decision, promised awareness, or delay risk requires it. A reply or completion claim is evidence, not closure; monitoring ends only when the relevant outcome and obligations are sufficiently resolved under adequate evidence and authority, or when the user intentionally cancels, supersedes, expires, or abandons the loop. Lunowa first delegates attention, not consequential authority: AI may interpret, monitor, prepare, and propose, while external actions are mediated by explicit action-specific policy, least privilege, verification, and human approval where impact, ambiguity, or irreversibility warrants it. Lunowa does not become a task manager, project manager, CRM, ticket system, or autonomous general agent merely because it can.**
