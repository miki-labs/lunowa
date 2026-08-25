# Current Project Checkpoint

This is a compact, mutable bootstrap checkpoint. It is **not** a Product, design, architecture, decision, research, or live-execution source of truth. Summarize only decision-relevant state and route to canonical sources; query GitHub for live Issue/PR/review/CI state.

## Checkpoint metadata

- Last reconciled: `2026-08-25`.
- Default `main` at reconciliation: `770d3dc8a80efe68a3b8e3d0a72ebd1763e5478b` (PR #27 merge).
- Continuity schema version: `0.1`.
- Fresh-session Bootstrap Evaluation v0.1: **PASS WITH NON-BLOCKING FINDINGS**; durable evidence is in Issue #25.
- This checkpoint is being reconciled with the Product-thesis evidence audit that recenters Lunowa on **Attention Delegation**. If the candidate is not yet merged, default `main` remains the accepted authority; re-query GitHub before acting.

## Current phase

- Phase 0 application/runtime/verification foundation is mechanically established.
- Phase 1 high-fidelity fake-data Product-learning slice remains materially unimplemented; the current application route is still bootstrap-level rather than the intended Product surface.
- Responsibility semantics/persistence design remains ahead of Product implementation: L0/L1 are frozen baselines; exact L2 v0.4 is static-review complete; L2 executable proof is pending; L2 final freeze is blocked; L3 migrations/runtime remain unauthorized.
- Product learning remains ahead of broad provider/AI/persistence integration.
- Knowledge continuity is not a current critical-path blocker.

Primary Product authority: `docs/product/PRODUCT.md`.  
Primary external-evidence inputs: `docs/product/research/`.  
Implementation sequence authority: `docs/product/IMPLEMENTATION-PLAN.md`.

---

## Current Product thesis

Current Product-level synthesis, when accepted:

> **Lunowa is an email-first Attention Delegation Product for asynchronous communication. It should maintain unresolved communication state on the user's behalf and return it only when the user's attention is meaningfully required, with enough source-grounded context and control to act safely.**

The North Star remains:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The current leading problem hypothesis is not generic email volume or Inbox Zero. It is the attention/monitoring burden created by multiple unresolved, other-party-dependent communication loops across delays and context changes.

Responsibility, Temporal Contract, My Turn / Waiting / Later / Done / Review, and Moment remain important current mechanisms. They are **not themselves proof of Product value** and the user-facing labels are not assumed differentiation.

Current strongest wedge hypothesis:

> **State-aware Attention Delegation** — keep monitoring an unresolved communication outcome and resurface it when evidence, expected events, time, risk, or responsibility state has changed enough that the user meaningfully needs attention again.

This is a hypothesis, not proof that current competitors lack equivalent semantic monitoring. It is also **not a moat claim**; defensibility remains a separate unknown under rapid 2026 incumbent/agent convergence.

---

## Active Product-learning workstream

### Issue #26 — comparative Responsibility/Moment mechanism test

Issue #26 remains useful and open, but its epistemic boundary is now explicit:

- it can test immediate comparative reconstruction/navigation/state-comprehension/source-trust/One-Moment value;
- it cannot by itself prove longitudinal “safe forgetting”, real monitoring delegation, switching, retention, or WTP;
- cross-account H4 may be de-scoped if the first wedge/participant class does not require it;
- success must not be described as full Attention Delegation validation.

The stronger evidence ladder is:

```text
real workflow/problem evidence
  -> comparative mechanism prototype
  -> longitudinal concierge / limited real-inbox monitoring delegation
  -> reliability/freshness/recovery evidence
  -> form-factor/switching behavior
  -> continued reliance / retention / WTP
```

### Issue #32 / PR #34 — deterministic S1–S7 experiment oracle

Live state at reconciliation:

- Issue #32 remains open.
- PR #34 remains open, draft, mergeable but **not accepted/merged**.
- exact revised head: `4a64f6d147ac0ef223b2ce6e99a296587b92cb01`.
- exact-head CI and local `git diff --check` have passed.
- latest independent **full acceptance audit is FAIL / REVISE**.
- the prior five blocker classes were addressed; the current recorded material blocker is localized to **S4 baseline timed-start security evidence**, which still leaves sender-address/security-warning visibility non-deterministic and can confound `T_action`, `N_nav`, and `Source_recheck`.
- No PR #34 merge and no Issue #28 write-heavy implementation are authorized by that audit.

Always re-query PR #34 before acting; this checkpoint may become stale.

### Issue #29 / PR #30 — bounded execution-plan gate

Live state at reconciliation:

- Issue #29 / PR #30 remain open.
- PR #30 is draft, mergeable, and planning-only at head `d02768e37450cd7b55a989d34f6fed393518b5da`.
- the plan is **not current implementation authority** merely because its mechanical checks have run;
- Issue #32 / PR #34 exists specifically to close the deterministic scenario/oracle gap identified during plan review;
- after an oracle is accepted, PR #30 still requires reconciliation against that accepted oracle/current Product contract and a durable plan-review disposition before it may authorize #28 implementation.

Do not skip this gate by moving directly from an oracle candidate to write-heavy UI work.

### Issue #28 — bounded fake-data implementation

Issue #28 remains the implementation target for the comparative prototype, not full Phase 1. It is downstream of:

1. an accepted deterministic scenario/oracle;
2. a reconciled/accepted bounded execution plan;
3. the separate unattended implementation-harness resume gate recorded in Issue #28's durable discussion.

Do not broaden #28 into Gmail/Microsoft/auth/DB/AI/send/provider parity.

### Issue #31 — independent browser/visual/mechanical verification

Remains downstream of an actual #28 implementation candidate. `agent:review-ready` means ready to inspect, never PASS.

---

## Other active/parallel workstreams

### Blueprint ↔ Lunowa reconciliation — Issue #21

Engineering-baseline maintenance, not a Product-learning prerequisite. It may proceed independently from fresh current `main`. Do not infer “latest Blueprint = current Lunowa policy” before reconciliation is accepted.

### Responsibility L2 executable proof — Issues #13 / #14 / #15

- #13: PostgreSQL 18 / Drizzle executable non-auth acceptance proof.
- #14: Better Auth -> PostgreSQL UUID persistence proof for acceptance IDs 47–49.
- #15: independent combined review; only this step may decide L2 PASS/FREEZE vs FAIL/REVISE after #13/#14 evidence exists.

This is a technical-evidence lane and must not be presented as Product validation.

### Legacy open candidates

Open does not imply current authority:

- PR #5 / Issue #6 — deferred hardening;
- PR #7 — needs reconciliation;
- PR #8 — needs reconciliation.

---

## Current Product blockers / unknowns

Highest-impact unresolved Product question:

> **Can Lunowa become reliable and context-correct enough that a coherent, reachable user segment actually stops self-monitoring important email-mediated communication loops — and is that relief valuable enough to adopt and pay for despite incumbent alternatives?**

Material unknowns include:

- exact early ICP / segment concentration and problem severity;
- real frequency of concurrent externally dependent communication loops and current self-check behavior;
- whether state-aware reconsideration is materially more useful than timer/no-reply workflows;
- whether Responsibility/Moment meaningfully reduces immediate reconstruction/decision burden;
- whether Lunowa can keep false-negative, stale, duplicate, and Review burden low enough to earn delegation trust;
- what reliability/freshness threshold causes users to stop manual re-checking;
- standalone client vs companion/in-client/other form factor;
- whether cross-account attention is central, a multiplier, or unnecessary for the winning segment;
- switching behavior, WTP/pricing/package, reachable distribution, acquisition efficiency, and continued reliance/retention;
- defensibility if incumbents/agents reproduce the same surface behavior.

Do not describe a polished prototype, technical proof, positive comment, or current architecture as evidence that these are solved.

---

## Current Product scope interpretation

### Keep

- North Star;
- `Eliminate work, not control`;
- system-led rather than prompt-led intelligence;
- source/provenance and explicit identity/scope;
- human final authority for material external action;
- Conversation != Responsibility;
- Responsibility as current candidate semantic mechanism;
- Temporal Contract;
- Moment as re-entry/context-restoration interface;
- My Turn / Waiting / Later / Done / Review as projections/mechanisms;
- safe degraded/reconciliation behavior;
- Product validation before integration breadth;
- responsive web-first as the current build/experimentation direction;
- Japanese-first Product copy/validation with internationalizable UI.

### Changed emphasis

- Product identity -> email-first **Attention Delegation**, not “new full mail client” as the reason to exist;
- Monitoring/attention maintenance -> leading causal problem hypothesis;
- Responsibility/Moment -> mechanisms serving the thesis, not the thesis itself;
- differentiation -> trusted state-aware attention transfer, not labels/reminders/unified inbox;
- state-aware Attention Delegation -> wedge hypothesis, **not** moat proof;
- cross-account -> segment-dependent multiplier/hypothesis rather than core differentiation;
- full-client parity -> form-factor hypothesis rather than a pre-validation requirement;
- retention -> include self-check reduction/delegated reliance, not raw DAU alone.

### Deferred unless evidence requires them

- second-provider breadth;
- full mailbox/provider parity;
- cross-account centrality;
- broad person/company context;
- broad settings/onboarding;
- full native-mobile/tablet fidelity;
- production AI/persistence breadth before Product gates;
- generic automation/CRM/workflow expansion;
- travel/subscription/location/time-of-day convenience ideas.

### Not differentiation by itself

Unified/multi-account inbox, generic AI summary/drafting/search, task/due extraction, priority labels, My Turn/Waiting labels, Snooze/Later, Done, no-reply reminders, and email-to-task transfer may be useful but are no longer standalone differentiation claims.

---

## Current technical blockers

- Responsibility L2 final freeze still requires direct executable evidence from #13 + #14 and independent #15 review.
- L3 Responsibility production migrations/runtime remain unauthorized until a separate post-L2-PASS implementation decision.
- #28 write-heavy prototype implementation remains downstream of accepted experiment-oracle + reconciled plan gates plus the separate harness resume gate.

---

## Important recent supersessions / refinements

- `ActionItem` / message-level task framing -> canonical `Responsibility` model.
- Responsibility as Product raison d'être -> Responsibility as current mechanism serving Attention Delegation.
- flat Communication Management Burden -> monitoring-led causal model while retaining interpretation/execution/verification dimensions.
- single monolithic lifecycle enum -> orthogonal Responsibility state with deterministic My Turn / Waiting / Later / Done / Review projections.
- scalar `next_owner/BOTH` as complete truth -> zero/one/multiple obligation legs where required.
- follow-up as lifecycle species -> renewed My Turn action/reason after the appropriate trigger.
- Ask-AI/chat-first routine workflow -> system-led intelligence.
- plain multi-account/unified inbox as differentiation -> table stake; cross-account value remains a segment hypothesis.
- implicit full-client requirement -> delivery form remains falsifiable; responsive web is current build substrate, not market proof.
- feature wedge as moat -> state-aware Attention Delegation is a testable wedge; defensibility remains separate and unproven.
- Gmail/provider/AI-first implementation -> bounded Product evidence first.
- non-default branch as practical current authority -> accepted history lives on default `main`; candidates remain candidates until accepted.
- “all open GitHub work is active authority” -> live state requires durable classification and current re-query.

---

## Next recommended Product decision/action

Do not broaden implementation from this Product-thesis revision.

1. **Product research lane:** continue narrowing WHO/problem concentration using external evidence and, when external evidence reaches its limit, recent-event/workflow evidence rather than opinion-only interviews.
2. **Current prototype-spec lane:** finish #32/PR #34's oracle gate, then reconcile/review #29/PR #30; do not silently reinterpret #26 as longitudinal Attention Delegation proof.
3. **After mechanism test:** the next stronger Product evidence must eventually include real waiting periods and measure whether users actually reduce self-checking (`N_self_check`) before broad provider/client parity.
4. **Engineering/Responsibility lanes:** #21 and #13/#14/#15 may proceed independently but must not substitute for Product evidence.

Use the smallest experiment that can falsify the highest-impact unresolved Product assumption.

---

## Deep links to canonical sources

### Product / research / UX

- `docs/product/PRODUCT.md` — Product thesis/problem/users/wedge/differentiation/switching/trust/scope/validation/unknowns.
- `docs/product/research/README.md` — research-evidence authority boundary.
- `docs/product/research/COMMUNICATION-ATTENTION-DELEGATION-EVIDENCE-2026-08.md` — communication-monitoring/cognitive-offloading evidence audit.
- `docs/product/research/CURRENT-COMPETITOR-CONVERGENCE-2026-08.md` — current competitor/alternative/form-factor convergence audit.
- `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` — detailed UX/interaction behavior.
- Issue #26 — comparative mechanism-level Product validation; query live.
- Issue #32 / PR #34 — current deterministic scenario-oracle gate; query live.
- Issue #29 / PR #30 — bounded execution-plan gate; query live.
- Issue #28 — bounded prototype implementation; query live.

### Responsibility / data / architecture

- `docs/product/responsibility/README.md` — Responsibility freeze/proof status and semantic routing.
- `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — exact current L2 candidate.
- `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md` — evidence gate before final L2 freeze.
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`.
- Issues #13/#14/#15 — L2 technical proof/review chain; query live.

### Continuity / engineering baseline

- `docs/continuity/README.md` — continuity operating contract.
- `docs/continuity/KNOWLEDGE-MAP.md` — question -> authority routing.
- `docs/continuity/BLUEPRINT-ADOPTION.md` — Blueprint adoption metadata; consult live Issue #21.
- Issue #25 — Fresh-session Bootstrap Evaluation evidence.
- Issue #21 — Blueprint reconciliation; query live.

## Update lifecycle

Revise this checkpoint only after canonical knowledge and live evidence have been reconciled. If it conflicts with a canonical source, actual code/test/runtime evidence, or current GitHub state, the authoritative/current source wins. Keep detailed evaluation/task history in its owning Issue/PR rather than turning this file into a changelog.
