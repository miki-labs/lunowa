# Current Project Checkpoint

This is a compact, mutable bootstrap checkpoint. It is not a product, design, architecture, decision, or live-execution source of truth. Summarize only decision-relevant state and link to canonical sources; query GitHub for live Issue/PR/review/CI state.

## Checkpoint metadata

- Last reconciled: `2026-08-25`
- Repository state: default `main` contains the accepted Responsibility/harness/continuity history and the Issue #19 product/current-state baseline through PR #22 merge commit `b97279e91af9d0ba7ab440300afb050190e1aa35`.
- Continuity schema version: `0.1`
- Fresh-session Bootstrap Evaluation v0.1: **PASS WITH NON-BLOCKING FINDINGS**; durable evaluation evidence is in Issue #25.
- Live GitHub state was checked during this reconciliation. Re-query GitHub on every fresh bootstrap when task/review state matters; live execution state may advance beyond this checkpoint.

## Current phase

- Phase 0 application/runtime/verification foundation is mechanically established.
- Phase 1 **high-fidelity fake-data product UI / Product-learning slice** remains materially unimplemented; the current application route is still bootstrap-level rather than the intended three-pane Lunowa product.
- Responsibility semantics/persistence design is ahead of Product implementation: L0/L1 are frozen baselines; exact L2 v0.4 is static-review complete; L2 executable proof is pending; L2 final freeze is blocked; L3 migrations/runtime remain unauthorized.
- Knowledge continuity is no longer a critical-path blocker. The first fresh-context reconstruction succeeded even when `CURRENT.md` itself was stale relative to live GitHub, demonstrating that the authority/routing rules worked under a stale-checkpoint case.

Primary phase/sequence authority: `docs/product/IMPLEMENTATION-PLAN.md`. Product intent/validation authority: `docs/product/PRODUCT.md`.

## Active workstreams

### Product learning — Issue #26 — highest Product priority

The next Product-learning gate is a **comparative high-fidelity fake-data prototype experiment**, not broad integration work.

Primary unresolved question:

> Does the Responsibility / Moment / attention experience create enough recurring comparative value to reduce communication-management burden and plausibly overcome switching + trust cost?

Current differentiation remains a **hypothesis**, including the cross-account/provider Responsibility attention direction. Plain multi-account aggregation and `My Turn` / `Waiting` labels alone are not assumed sufficient differentiation.

Do not let Gmail/OAuth/AI/database/provider breadth substitute for evidence on ICP, demand, differentiation, switching, trust, willingness to pay, distribution, or retention.

### Blueprint ↔ Lunowa reconciliation — Issue #21

The prior ordering prerequisite is now satisfied: Issue #19 / PR #22 is integrated and the Fresh-session Bootstrap Evaluation has passed with non-blocking findings.

Issue #21 may execute from a fresh current `main` when engineering-baseline capacity is allocated. Its pinned Blueprint comparison target remains fixed unless explicitly superseded. It is **engineering-baseline maintenance**, not a reason to block Product learning.

`docs/continuity/BLUEPRINT-ADOPTION.md` remains the adoption-metadata authority. Do not infer “latest Blueprint = current Lunowa policy” before #21 is completed.

### Responsibility L2 executable proof — Issues #13 / #14 / #15

- #13: real PostgreSQL 18 / Drizzle executable acceptance proof for the non-auth matrix.
- #14: Better Auth → PostgreSQL UUID persistence proof for acceptance IDs 47–49.
- #15: independent combined review; only this step may decide L2 PASS/FREEZE vs FAIL/REVISE after #13/#14 evidence exists.

Issue #16 is completed on default `main`. The #13/#14 Issue bodies contain historical launch/base wording that later durable comments supersede. When resumed, create/refresh work from the then-current intended `main`, run the repository/runtime-isolation preflight, and isolate mutable PostgreSQL/Docker/runtime resources.

### Continuity maintenance — Issue #25

Issue #25 records the first Fresh-session Bootstrap Evaluation and owns this small post-#22 checkpoint reconciliation. After its bounded update is reviewed/integrated, continuity should leave the critical path unless a concrete bootstrap/drift failure appears.

### Legacy open candidates

Open does not imply current authority:

- PR #5 / Issue #6 — **DEFERRED HARDENING**; dedicated Guardrail signer is not a Phase-1 blocker while human merge authority + baseline Ruleset remain the accepted boundary.
- PR #7 — **NEEDS RECONCILIATION**; old agent-permission / human-light merge-policy candidate, not safe-to-merge current authority.
- PR #8 — **NEEDS RECONCILIATION**; old security/failure/verification candidate, not safe-to-merge current authority.

## Current blockers / dependencies

### Product blockers / unknowns

- exact early ICP / segment priority and problem severity;
- whether Responsibility / Moment meaningfully reduces reconstruction, rereading, switching, manual task transfer and verification burden vs existing workflows;
- whether the gain is strong enough to overcome switching + trust cost;
- willingness to pay / price / package;
- reachable distribution channel / acquisition efficiency;
- retention after novelty;
- calibrated automation vs explicit control, including Review prominence and resurfacing behavior.

### Technical blockers

- Responsibility L2 final freeze requires direct executable evidence from #13 + #14 and independent #15 review.
- L3 Responsibility production migrations/runtime remain unauthorized until a separate post-L2-PASS implementation decision.

### Resolved blockers that should not be resurrected

- default-entry topology mismatch — resolved by Issue #23 / PR #24;
- Issue #16 execution-harness dependency — completed and closed;
- Issue #18 continuity-structure dependency — completed and closed;
- Issue #19 / PR #22 product/current-state preservation — completed and integrated on default `main`;
- first Fresh-session Bootstrap Evaluation — **PASS WITH NON-BLOCKING FINDINGS**; see Issue #25.

## Decisions currently pending

- Product evidence: exact early ICP/segment priority and problem severity.
- Product differentiation: whether the Responsibility-oriented attention experience, including the cross-account hypothesis where relevant, is materially better than conventional inbox/account-switching/task-tool workflows.
- Product switching/trust: whether recurring value is strong enough for users to change or materially rely less on their existing workflow.
- Commercial evidence: willingness to pay/pricing/package, distribution, acquisition efficiency, retention.
- Product UX: automation/control balance; final Review prominence; resurfacing/notification policy; historical-initial-sync activation policy.
- Platform/product: whether and when native mobile becomes necessary beyond the current responsive-web-first direction.
- Responsibility persistence: L2 PASS/FREEZE vs FAIL/REVISE after #13/#14/#15.
- Engineering baseline: Blueprint classifications/adoptions through #21.

## Hypotheses / needs validation

See `docs/product/PRODUCT.md` for the owning Product-level classification. High-value current hypotheses include:

- early fit among knowledge workers/prosumers/independent professionals with operational email burden, with solo/small-business operators as another candidate segment;
- Responsibility/Moment attention management can reduce repeated rereading, reconstruction, task transfer and re-checking;
- cross-account/provider Responsibility attention can add value while preserving explicit account/scope/provenance/sender boundaries;
- the gain can become strong enough to overcome switching/trust cost;
- paid subscription/prosumer monetization may be viable, but price/package/WTP are undecided;
- trustworthy ongoing attention management can create recurring retention value after novelty fades.

Do not describe the cross-account hypothesis as a proven market advantage or irrevocable feature requirement. Negative Product evidence may narrow, defer, or reject it.

## Important recent supersessions

Detailed rationale lives in the owning canonical sources; this list only prevents bootstrap regressions.

- `ActionItem` / message-level task framing → canonical `Responsibility` model.
- single monolithic lifecycle enum → orthogonal Responsibility state with deterministic `My Turn / Waiting / Later / Done / Review` projections.
- scalar `next_owner/BOTH` as complete truth → zero/one/multiple obligation legs where required.
- follow-up as lifecycle species → renewed My Turn action/reason after the appropriate trigger.
- Ask-AI/chat-first routine workflow → system-led intelligence where AI mostly prepares context behind the interface.
- native-mobile/React-Native-first exploration → current responsive web-first path.
- Gmail/provider/AI-first implementation → high-fidelity fake-data Product validation first; integration breadth follows evidence.
- plain multi-account aggregation as differentiation → table stakes; current cross-account Responsibility thesis remains a hypothesis.
- non-default branch as practical current authority → accepted source history is on default `main`.
- “all open GitHub work is active authority” → live state requires durable classification/supersession/freshness interpretation.

## Next recommended decision / action

Use the smallest experiment that can falsify the highest-impact unresolved Product assumption.

1. **Product lane:** execute Issue #26 as a bounded comparative prototype/validation experiment. Prove or falsify Responsibility/Moment value before provider/AI/persistence breadth.
2. **Continuity lane:** finish Issue #25's bounded checkpoint repair and move continuity out of the critical path unless a real failure appears.
3. **Engineering-baseline lane:** Issue #21 may proceed independently from a fresh current `main`; do not let it block Product learning.
4. **Responsibility technical lane:** execute #13 and #14 from fresh isolated current-main workspaces when capacity permits, then #15. Technical PASS is not Product validation.

For review handoff, `agent:review-ready` means **ready to inspect, never PASS**. Reviewer disposition must be recorded durably before queue clearing; merge remains explicitly human-authorized.

## Deep links to canonical sources

### Product / UX

- `docs/product/PRODUCT.md` — product vision/problem/users-as-hypotheses/differentiation/MVP/validation/commercial unknowns/supersessions.
- `docs/design/DESIGN.md` — accepted product-design model, information architecture, visual/trust principles.
- `docs/design/INTERACTIONS.md` — interaction semantics, Moments, compose/search/context/error flows.
- `docs/design/RESPONSIVE.md` — responsive/pane behavior.
- GitHub Issue #26 — current comparative Product-validation experiment contract; **query live**.

### Responsibility / data / architecture

- `docs/product/responsibility/README.md` — authoritative Responsibility freeze/proof status and semantic routing.
- `docs/product/responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md` — frozen L1 persistence boundary.
- `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — exact current v0.4 L2 candidate.
- `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md` — evidence gate before final L2 freeze.
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`.
- GitHub Issues #13/#14/#15 — L2 executable proof/final-review chain; **query live**.

### Continuity / engineering baseline / live work

- `docs/continuity/README.md` — continuity operating contract.
- `docs/continuity/KNOWLEDGE-MAP.md` — question → authority routing.
- `docs/continuity/BLUEPRINT-ADOPTION.md` — Blueprint adoption metadata; consult live Issue #21.
- GitHub Issue #25 — Fresh-session Bootstrap Evaluation v0.1 evidence + post-#22 checkpoint reconciliation; **query live**.
- GitHub Issue #21 — Blueprint reconciliation; ordering gate is now satisfied; **query live**.
- GitHub PRs #5/#7/#8 — legacy candidates with the classifications above, not automatic merge targets.

## Update lifecycle

Revise this checkpoint only after canonical knowledge and live evidence have been reconciled. If it conflicts with a canonical source, actual code/test/runtime evidence, or live GitHub state, the authoritative/current source wins and this checkpoint must be repaired when appropriate. Keep detailed evaluation/task history in its owning Issue/PR rather than turning this file into a changelog or knowledge dump.
