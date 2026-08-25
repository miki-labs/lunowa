# Lunowa Implementation Plan

## Status

**Active living execution plan, reconciled with the 2026-08-25 Product thesis and the current Responsibility L2 proof boundary.**

This plan sequences work to retire the highest-value Product and technical uncertainties without letting a broad mail-client build substitute for evidence.

Durable Product semantics belong in `PRODUCT.md`; detailed UX belongs in `docs/design/`; canonical Responsibility semantics/proof status belong in `responsibility/`; architecture/technology authority belongs in their owning documents; GitHub Issues/PRs/CI own live candidate/gate state.

### Current Product premise

The current Product thesis is **Attention Delegation**: Lunowa should let a user stop manually monitoring unresolved asynchronous communication and return the loop when the user's attention is genuinely needed.

Responsibility, Temporal Contract, My Turn / Waiting / Later / Done / Review, and Moment are current mechanisms for testing/delivering that thesis. They are not Product validation by themselves.

### Scope precedence

`PRODUCT.md` owns market/MVP scope. Existing `docs/design/DESIGN.md` §2.1 and visual references can describe **credible future client design coverage**; they do not authorize implementing every screen before the current Product-learning gates pass.

---

## 1. Execution principles

### 1.1 Retire the highest uncertainty first

> **Use the smallest/cheapest experiment that can falsify the highest-impact unresolved Product assumption before broad implementation.**

Do not build provider parity, AI breadth, full compose/settings/search/mobile surfaces, or production persistence merely because they are likely to exist in a future client.

### 1.2 Separate evidence classes

```text
Product problem evidence
!= interaction/prototype evidence
!= runtime/technical proof
!= longitudinal reliance evidence
!= switching/WTP/retention evidence
```

A PASS in one lane must not be promoted into another.

### 1.3 Implementation is downstream of Product need

A new subsystem or feature enters the active sequence only when it:

- directly enables the current falsification experiment;
- retires a costly technical blocker without activating premature production scope; or
- is supported by accepted Product evidence.

### 1.4 One coherent candidate, independent review

Write-heavy Product slices should have one clear candidate owner/branch. Independent review audits the **whole current task contract and whole candidate**, not only the latest patch.

On FAIL, record all known material blockers together before returning for correction. Avoid micro-correction loops.

---

## 2. Current high-level sequence

The active sequence is no longer “complete a credible mail client, then learn.”

```text
Phase 0 mechanical foundation                           DONE enough to proceed
  ->
Phase 1A deterministic comparative mechanism experiment CURRENT
  ->
Phase 1B real workflow / longitudinal Attention Delegation evidence
  ->
Minimal real-provider slice needed for stronger evidence
  ->
Reliable state/reconsideration/reconciliation slice
  ->
AI interpretation behind accepted semantics/evals where needed
  ->
Only evidence-supported client breadth / send / search / provider expansion
  ->
Beta/commercial hardening after switching/retention/WTP evidence grows
```

A separate Responsibility L2 executable-proof lane may proceed in parallel as bounded technical risk retirement. It does **not** authorize production migrations/runtime or substitute for Product evidence.

---

## 3. Phase 0 — Mechanical foundation

### Goal

Provide the smallest reproducible runtime/repository/verification foundation required for Product experiments and later production slices.

### Current status

The repository already has the mechanical Phase-0 foundation:

- Node.js 24 / pnpm / strict TypeScript;
- Next.js 16 / React 19 / Tailwind 4 / next-intl direction;
- verification/browser smoke foundation;
- current application route is still bootstrap-level rather than the Lunowa Product.

### Rule

Do not expand foundation work unless a concrete experiment/runtime need exposes a blocker.

---

## 4. Phase 1A — Comparative Responsibility/Moment mechanism experiment

### Purpose

Test whether current Responsibility/Moment preparation reduces **immediate** reconstruction, navigation, decision, and source-verification burden compared with a competent conventional workflow.

This phase tests mechanisms. It does not prove days/weeks of safe forgetting.

### Current live gate chain

Always re-query GitHub before acting. At the 2026-08-25 checkpoint, the intended chain is:

```text
Issue #26 Product-learning contract
  -> Issue #32 / PR #34 deterministic S1-S7 oracle acceptance
  -> Issue #29 / PR #30 plan reconciliation + independent plan acceptance
  -> Issue #28 bounded fake-data implementation
  -> Issue #31 exact-head browser/visual/mechanical independent verification
  -> Issue #26 participant/comparative evidence
```

A separate unattended implementation-harness resume gate recorded in Issue #28 must also be satisfied before write-heavy implementation resumes.

### 4.1 Oracle gate

The deterministic scenario/oracle must freeze Product-significant evidence, expected decisions, baseline fairness, timing/measurement boundaries, and scenario-specific falsifiers so the builder cannot invent an experimental advantage.

Current PR #34 state is live GitHub authority; do not infer PASS from this document.

### 4.2 Plan gate

After an oracle is accepted, the bounded execution plan must be reconciled against the accepted oracle and current Product contract. PR #30's historical candidate is not implementation authority merely because it exists or passes mechanical checks.

### 4.3 Bounded prototype scope

The prototype should contain only what is needed to run the comparative scenarios over the same synthetic evidence.

Required conceptual contrast:

```text
same realistic communication evidence
        ├── competent conventional baseline
        └── Lunowa Responsibility projection + Moment preparation
```

Likely required Lunowa interaction:

```text
Sidebar / attention projection
        -> Conversation List
        -> row body: 会話
        -> Responsibility/status chip: 今の要点
```

Representative projections:

- My Turn;
- Waiting;
- Later;
- Done;
- Review;
- multiple Responsibilities;
- cross-account pressure **only where the active hypothesis requires it**.

### 4.4 Explicit non-goals for Phase 1A

Unless a direct experiment blocker proves otherwise:

- no Gmail OAuth/API;
- no Microsoft integration;
- no real provider sync;
- no production database/migrations;
- no Responsibility L2 runtime activation;
- no production AI interpretation;
- no real send;
- no full search/indexing;
- no broad settings/onboarding;
- no full compose parity;
- no full mailbox parity;
- no generic automation engine;
- no full mobile/tablet fidelity;
- no implementation of visual references 09–19 merely for completeness.

Visual references remain design context, not a checklist.

### 4.5 Evidence boundary

Useful immediate measures include:

- `T_action`;
- `N_reread`;
- `N_nav`;
- `N_transfer`;
- `Correct_state`;
- `Source_recheck`;
- `why here now?` comprehension;
- trust/control/Review observations.

A positive result may support the mechanism for the next test. It cannot establish monitoring delegation, switching, retention, or WTP.

---

## 5. Phase 1B — Real problem and longitudinal Attention Delegation evidence

### Purpose

Prove or falsify the part of the North Star a short prototype cannot test:

> Does a real user actually stop manually monitoring an important unresolved communication loop because they rely on Lunowa?

### 5.1 Segment/problem evidence

Before expensive integration breadth, gather recent-event/workflow evidence from candidate users with the problem characteristics in `PRODUCT.md`.

Prefer actual recent examples/artifact walkthroughs over abstract preference questions. Characterize:

- concurrent open loops;
- other-party dependency;
- waiting latency;
- failure cost;
- Inbox/Sent rechecking;
- flags/snoozes/tasks/notes/CRM workarounds;
- whether an existing system of record already solves the loop;
- form-factor/adoption constraints.

### 5.2 Longitudinal test

Use the smallest technically credible method capable of observing real waiting periods. Depending on evidence and safety, that may be concierge/manual operation, a limited real-inbox read slice, or another bounded prototype.

Primary Product signal:

- `N_self_check` before expected resurfacing;
- willingness to delegate eligible loops;
- correct vs missed/stale/duplicate resurfacing;
- correction/Review burden;
- context-restoration cost after waiting;
- reversion to the old checking habit.

### 5.3 Stop condition

If users continue rechecking source mail “just in case,” or if stale/Review burden becomes a second inbox, do not compensate by adding feature breadth. Diagnose trust/state-quality/product-fit first.

---

## 6. Minimal real-provider slice — only when required by stronger Product evidence

### Goal

Introduce the smallest provider capability needed to test real Attention Delegation rather than “start Gmail integration because the roadmap says so.”

### Default first provider

Gmail remains the current first-provider engineering direction. Microsoft/Outlook remains a later adapter unless evidence changes priority.

### Possible minimum read boundary

When longitudinal validation requires real communication evidence, prefer the narrowest authorization/read/sync boundary that can safely support the test:

- one provider;
- minimum scopes;
- explicit account/scope identity;
- source preservation;
- bounded history/sync semantics;
- no autonomous external action;
- no second provider merely for parity.

The exact slice must be specified when the experiment requires it; this document does not pre-authorize OAuth/runtime activation.

---

## 7. Responsibility L2 executable proof — parallel technical lane

### Current status

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle DDL            v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 migrations/runtime                     NOT AUTHORIZED
```

### Gate

Before production Responsibility migration/runtime is accepted:

1. Issue #13 must provide real PostgreSQL 18 / Drizzle executable acceptance evidence;
2. Issue #14 must provide the Better Auth -> PostgreSQL UUID prerequisite evidence;
3. Issue #15 must independently audit the combined result;
4. all required acceptance IDs in `responsibility/L2-EXECUTABLE-PROOF-GATE.md` must be accounted for;
5. actual generated/reviewed SQL and relevant concurrency/delete/privacy/tenancy/Auth behavior must be verified;
6. an explicit L2 PASS/FREEZE decision must exist before production migrations are proposed.

### Product boundary

The proof lane may run before longitudinal Product validation because it is isolated technical risk retirement. **L2 PASS still does not authorize production persistence activation or prove Product value.**

---

## 8. Reliable state / reconsideration / Temporal Contract slice

### Goal

If Attention Delegation survives earlier Product tests, build the smallest runtime that makes the promise operationally credible.

The important system is not a timer alone. It must be able to reconsider a communication loop as evidence/time/risk changes and distinguish “state changed” from “user attention now needed.”

### Required properties when this phase is activated

As applicable to the accepted semantics/product evidence:

- evidence-relative Responsibility state;
- expected events and return/reconsideration conditions;
- idempotent durable scheduling;
- provider/state reconciliation;
- missed-event recovery;
- stale-version protection;
- timezone correctness;
- provenance/auditability appropriate to risk;
- explicit degraded state;
- low stale/duplicate resurfacing burden.

Do not build a generic workflow engine.

---

## 9. AI interpretation — after Product/domain boundaries are testable

### Goal

Use AI only where it materially improves evidence interpretation or state preparation that survived earlier Product tests.

### Rules

- AI proposes/structures interpretation; accepted domain rules/authority decide canonical state;
- production behavior is gated by representative eval/oracle coverage;
- prompt/tool-like text in mail remains untrusted evidence;
- no default confidence-percentage theater;
- false negatives and Review overload are both measured;
- user correction/provenance remain first-class;
- do not add multiple AI providers/models merely for breadth.

The accepted initial OpenAI runtime direction remains owned by `TECH-STACK.md`/ADR unless a later evidence-backed decision supersedes it.

---

## 10. Real external actions / send

Real send is **not** required merely to prove the first Attention Delegation mechanism.

When a validated Product slice requires real compose/reply/send:

- explicit From/account identity;
- draft before send;
- idempotency/reconciliation;
- provider-accepted state distinguished from click intent;
- human confirmation for material external commitments;
- safe retry/failure UX;
- no hidden cross-account sending.

Activation requires a bounded task/spec at that time.

---

## 11. Search/context and broader client surfaces

Search, person/company context, attachment preview, richer compose, settings, onboarding, bulk actions, and other visual references can be valuable for a credible mail client.

They enter the active implementation sequence **only** if one of the following becomes true:

- the current Product experiment requires them;
- evidence shows they are necessary table stakes for the chosen form factor/segment;
- they directly improve validated Attention Delegation/context restoration;
- their absence blocks a credible switching test.

Do not implement the design catalog simply because it exists.

---

## 12. Second provider / cross-account expansion

### Current classification

- multi-account/unified inbox: table stake, not differentiation;
- cross-account Attention Delegation: segment-dependent hypothesis/multiplier;
- Microsoft/Outlook: later provider direction, not current pre-validation scope.

Add provider/account breadth only after the chosen segment or switching test demonstrates material value that cannot be learned with the current narrower surface.

Cross-account semantic similarity never authorizes automatic Responsibility merge.

---

## 13. Responsive/native platform expansion

**CURRENT DIRECTION:** responsive web-first using the accepted Next.js/TypeScript stack.

For the current comparative mechanism test, desktop is the primary viewport with only bounded compact-layout sanity where required. Full tablet/mobile fidelity is not a Phase-1A completion condition.

Native mobile should be reopened only with Product/distribution evidence that native behavior materially affects adoption/value.

---

## 14. Commercial/beta hardening

Do not label the Product beta-ready merely because provider/runtime/client breadth exists.

Before serious release hardening, accumulate evidence for:

- a coherent/reachable ICP;
- real monitoring/self-check reduction;
- acceptable missed/stale/Review burden;
- repeated reliance across waiting periods;
- form-factor switching behavior;
- WTP/payment intent;
- distribution feasibility;
- privacy/security/provider compliance appropriate to the actual release surface.

Then harden only the architecture/surfaces required by the evidence-supported release plan.

---

## 15. Current next action

At the 2026-08-25 checkpoint, do **not** jump to Gmail/provider/AI/database/full-shell implementation.

The current Product/prototype sequence is:

1. finish independent full acceptance of Issue #32 / PR #34's deterministic oracle;
2. reconcile Issue #29 / PR #30 against the accepted oracle/current Product thesis and obtain independent plan acceptance;
3. satisfy Issue #28's separate implementation-harness resume gate;
4. implement only the bounded #28 comparative prototype;
5. independently verify the exact implementation candidate through #31;
6. run/record #26 mechanism-level participant evidence;
7. choose the smallest next experiment against the remaining **Attention Delegation** unknown rather than automatically continuing into provider breadth.

Always re-query live GitHub state before execution; this document owns sequence, not current PR/CI disposition.
