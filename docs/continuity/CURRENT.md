# Current Project Checkpoint

This is a compact, mutable bootstrap checkpoint. It is not a product, design, architecture, decision, or live-execution source of truth. Summarize only decision-relevant state and link to canonical sources; query GitHub for live Issue/PR/review/CI state.

## Checkpoint metadata

- Last reconciled: `2026-08-26`
- Repository base before the current Product-thesis candidate: default `main` at `770d3dc8a80efe68a3b8e3d0a72ebd1763e5478b`.
- Continuity schema version: `0.1`
- Fresh-session Bootstrap Evaluation v0.1: **PASS WITH NON-BLOCKING FINDINGS**; durable evaluation evidence is in Issue #25.
- Live GitHub state must be re-queried whenever task/review/CI state matters; this checkpoint may lag live execution.

## Current phase

- Phase 0 application/runtime/verification foundation is mechanically established.
- Phase 1 **high-fidelity fake-data Product-learning slice** remains materially unimplemented; the current application route is bootstrap-level rather than the intended Lunowa Product.
- Responsibility semantics/persistence design is ahead of Product implementation: L0/L1 are frozen baselines; exact L2 v0.4 is static-review complete; L2 executable proof is pending; L2 final freeze is blocked; L3 migrations/runtime remain unauthorized.
- Product reasoning has now been reassessed against current 2026 external evidence. The strongest current Product hypothesis is **Open-loop Monitoring Offload**: Lunowa should try to let users stop manually monitoring unresolved communication until attention is genuinely needed again.
- Responsibility / Temporal Contract / Moment remain candidate mechanisms for delivering that outcome; they are not the reason the Product exists.

Primary phase/sequence authority: `docs/product/IMPLEMENTATION-PLAN.md`. Product intent/validation authority: `docs/product/PRODUCT.md`.

## Active Product learning

### Highest-level Product unknown

Current strongest unresolved question:

> **Is communication monitoring painful and frequent enough for a specific reachable segment that they will delegate it to Lunowa, and can Lunowa earn enough trust that they actually stop re-checking?**

Current Product evidence supports the plausibility of communication/task-monitoring burden and trusted cognitive offloading, but does **not** establish Lunowa ICP, demand, switching, longitudinal reliance, willingness to pay, or product-market fit.

### Issue #26 — comparative mechanism validation

Issue #26 remains an important Product-learning contract for a **comparative high-fidelity fake-data prototype experiment**.

Its proper interpretation is narrower than the whole Product thesis:

- it can test immediate reconstruction/decision work, projection comprehension, provenance/trust cues, and Responsibility/Moment comparative behavior;
- it cannot by itself prove safe forgetting, monitoring relinquishment, days/weeks reliance, switching, retention, or willingness to pay.

Do not close or interpret #26 as Product-thesis validation merely because a prototype performs well in a single session.

### Product-discovery lane — problem/ICP evidence

Before freezing an ICP or broadening implementation, collect recent real-workflow evidence around:

- number and kind of simultaneous communication open loops;
- other-person/external dependency;
- waiting duration;
- repeated Inbox/Sent/thread self-checking;
- manual flags/snooze/task/calendar/note workarounds;
- consequence of missed/late follow-up;
- whether an existing CRM/ATS/ticketing/project system already solves the tracking problem.

The cheapest current evidence is recent-event workflow observation/interview. This can proceed without provider/auth/database/AI implementation.

### Longitudinal lane — safe forgetting / monitoring relinquishment

If the immediate mechanism remains credible, a later real or concierge longitudinal experiment must test whether users actually reduce parallel checking across waiting periods.

Candidate—not frozen—measures include `N_self_check`, source-inbox fallback, parallel manual reminders, correct resurfacing, false-negative burden, Review burden, and continued delegated monitoring.

## Current differentiation boundary

Do **not** assume defensible differentiation from any one of:

- unified inbox / multiple accounts;
- AI summary/drafting/search;
- task/due-date extraction;
- `My Turn` / `Respond`;
- `Waiting`;
- no-reply reminders;
- Snooze/Later;
- Done/archive.

Current 2026 competitors already cover substantial portions of those behaviors.

The stronger current **HYPOTHESIS** is stateful, longitudinal communication-loop management: track the unresolved outcome/obligation across messages and time, distinguish a reply from actual satisfaction of the awaited outcome, resurface on meaningful state/time/event conditions, and restore minimal context when attention returns.

Cross-account/provider support may amplify value for some users but is not the current wedge.

## Product form-factor status

A full email client is **not considered validated Product truth**.

Current design and engineering may continue to explore a responsive web client, but Product form remains open among:

- full client;
- companion/overlay working with existing Gmail/Outlook;
- hybrid.

This is material because current competitors can provide meaningful automation directly inside Gmail/Outlook, lowering their replacement switching cost.

## Other active workstreams

### Blueprint ↔ Lunowa reconciliation — Issue #21

Issue #21 remains engineering-baseline maintenance, not a reason to block Product learning. `docs/continuity/BLUEPRINT-ADOPTION.md` remains the adoption-metadata authority. Do not infer “latest Blueprint = current Lunowa policy” before the issue is completed.

### Responsibility L2 executable proof — Issues #13 / #14 / #15

- #13: real PostgreSQL 18 / Drizzle executable acceptance proof for the non-auth matrix.
- #14: Better Auth → PostgreSQL UUID persistence proof for acceptance IDs 47–49.
- #15: independent combined review; only this step may decide L2 PASS/FREEZE vs FAIL/REVISE after #13/#14 evidence exists.

Issue #16 is completed on default `main`. When the L2 proof lane resumes, use fresh intended-main workspaces and current isolation/preflight rules.

### Continuity maintenance — Issue #25

Issue #25 records the first Fresh-session Bootstrap Evaluation and the post-#22 checkpoint reconciliation. Continuity is not a critical-path Product blocker unless a concrete reconstruction/drift failure appears.

### Legacy open candidates

Open does not imply current authority:

- PR #5 / Issue #6 — **DEFERRED HARDENING**;
- PR #7 — **NEEDS RECONCILIATION**;
- PR #8 — **NEEDS RECONCILIATION**.

## Current blockers / dependencies

### Product blockers / unknowns

- exact early ICP / segment priority;
- frequency/severity of communication monitoring and current workaround adequacy;
- whether Responsibility/Moment improves immediate reconstruction/decision work versus current workflows;
- whether Lunowa can cause actual reduction in self-checking across real waiting periods;
- whether reliability/trust can be high enough without creating a large Review/resurfacing burden;
- whether stateful longitudinal loop management is materially better than Gmail/Superhuman/Shortwave/Spark/current user workflows;
- whether the differentiated gain overcomes replacement switching cost and delegation/trust cost;
- whether a full client is needed at all;
- willingness to pay / price / package;
- reachable distribution / acquisition efficiency;
- retention/reliance after novelty.

### Technical blockers

- Responsibility L2 final freeze requires executable evidence from #13 + #14 and independent #15 review.
- L3 Responsibility production migrations/runtime remain unauthorized until a separate post-L2-PASS implementation decision.

## Decisions currently pending

- Product evidence: exact early ICP/segment priority and problem severity.
- Product wedge: whether Open-loop Monitoring Offload causes meaningful behavioral offloading in real workflows.
- Product mechanism: whether current Responsibility / Temporal Contract / Moment model is the simplest trustworthy way to deliver the wedge.
- Product differentiation: whether stateful longitudinal communication-loop management is materially better than existing workflows/products.
- Product switching/trust: whether users reduce parallel checking enough to justify reliance.
- Product form: full client vs companion/overlay vs hybrid.
- Commercial evidence: willingness to pay/pricing/package, distribution, acquisition efficiency.
- Product UX: automation/control balance; Review prominence; resurfacing/notification policy; historical activation policy.
- Platform/product: whether/when native mobile becomes necessary beyond responsive web-first implementation.
- Responsibility persistence: L2 PASS/FREEZE vs FAIL/REVISE after #13/#14/#15.
- Engineering baseline: Blueprint classifications/adoptions through #21.

## Current supersessions that must not regress

- `ActionItem` / message-level task framing → canonical `Responsibility` model.
- single monolithic lifecycle enum → orthogonal Responsibility state with deterministic projections.
- follow-up as lifecycle species → action/reason after appropriate trigger.
- Ask-AI/chat-first routine workflow → system-led intelligence.
- native-mobile/React-Native-first exploration → current responsive web-first engineering path.
- Gmail/provider/AI-first implementation → Product-learning before integration breadth.
- plain multi-account aggregation as differentiation → table stakes / possible multiplier only.
- **Responsibility-centered Product story → monitoring-offload-centered Product story.** Responsibility/Moment remain candidate mechanisms beneath the Product outcome.
- full-client shape as implicit Product truth → Product form remains open until switching/value evidence justifies it.

## Next recommended Product actions

Use the smallest experiment that can falsify the highest-impact unresolved Product assumption.

1. **Problem/ICP lane:** collect recent-event workflow evidence for communication open-loop monitoring burden and current workaround adequacy.
2. **Mechanism lane:** continue Issue #26 / its scenario-oracle gate as the bounded comparative test of immediate Responsibility/Moment value; do not treat it as longitudinal North-Star proof.
3. **Longitudinal lane:** only after a credible immediate mechanism exists, test real/concierge monitored loops over days/weeks and measure self-check reduction/reliance.
4. **Implementation breadth:** provider/auth/database/AI/client breadth follows Product evidence rather than substituting for it.
5. **Engineering lanes:** Issue #21 and Responsibility #13/#14/#15 may proceed independently when capacity permits; technical PASS is not Product validation.

For review handoff, `agent:review-ready` means **ready to inspect, never PASS**. Reviewer disposition must be recorded durably before queue clearing; merge remains explicitly authorized by the acting reviewer/maintainer.

## Deep links to canonical sources

### Product / research / UX

- `docs/product/PRODUCT.md` — highest-level Product contract.
- `docs/product/research/communication-monitoring-evidence-2026-08.md` — dated evidence review; evidence artifact, not Product truth by itself.
- `docs/design/DESIGN.md` — accepted detailed design model.
- `docs/design/INTERACTIONS.md` — interaction semantics and flows.
- `docs/design/RESPONSIVE.md` — responsive/pane behavior.
- GitHub Issue #26 — comparative mechanism-validation experiment; query live.

### Responsibility / data / architecture

- `docs/product/responsibility/README.md` — authoritative Responsibility freeze/proof status and semantic routing.
- `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — exact current L2 candidate.
- `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md` — evidence gate before final L2 freeze.
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`.
- GitHub Issues #13/#14/#15 — L2 executable proof/final-review chain; query live.

### Continuity / engineering baseline / live work

- `docs/continuity/README.md` — continuity operating contract.
- `docs/continuity/KNOWLEDGE-MAP.md` — question → authority routing.
- `docs/continuity/BLUEPRINT-ADOPTION.md` — Blueprint adoption metadata; consult live Issue #21.
- GitHub Issue #25 — Fresh-session Bootstrap Evaluation evidence.
- GitHub Issue #21 — Blueprint reconciliation; query live.

## Update lifecycle

Revise this checkpoint only after canonical knowledge and live evidence have been reconciled. If it conflicts with a canonical source, actual code/test/runtime evidence, or live GitHub state, the authoritative/current source wins and this checkpoint must be repaired when appropriate. Keep detailed evaluation/task history in its owning Issue/PR rather than turning this file into a changelog or knowledge dump.
