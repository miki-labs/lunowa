# Current Project Checkpoint

This is a compact, mutable bootstrap checkpoint. It is not a product, design, architecture, decision, or live-execution source of truth. Summarize only decision-relevant state and link to canonical sources; query GitHub for live Issue/PR/review/CI state.

## Checkpoint metadata

- Last reconciled: `2026-08-24`
- Repository / candidate state: default `main` has been converged through Issue #23 / PR #24 at merge commit `b50418db0565f6fd4029c3390ebda0b2fe9571db`. Issue #19 / PR #22 is retargeted to `main` and its candidate branch has been refreshed from that converged base.
- Continuity schema version: `0.1`
- Live GitHub state checked during this reconciliation: PR #22; Issues #13/#14/#15/#19/#21; completed Issues #16/#18/#23; PRs #5/#7/#8; default `main`; current review queue. Re-query GitHub on every fresh bootstrap when task/review state matters.

## Current phase

- Phase 0 application/runtime/verification foundation is mechanically established.
- Phase 1 **high-fidelity fake-data product UI** remains the first product implementation/validation slice and has not yet been implemented. The current application route is still bootstrap-level rather than the intended three-pane mail product.
- Responsibility semantics/persistence design has advanced farther than the product UI: L0/L1 are frozen baselines and exact L2 v0.4 is static-review complete, but this is a **bounded technical proof stream**, not a product-priority reorder or production-persistence authorization.
- Issue #19 / PR #22 is the immediate continuity/product-knowledge preservation stream. Its first independent handoff-fidelity review returned **FAIL / CHANGES REQUIRED** on an older head. The semantic/current-state remediation has since been applied, the default-entry topology blocker has been resolved, and the candidate now requires exact-head mechanical/CI evidence plus a fresh independent handoff-fidelity review.
- Issue #21 Blueprint reconciliation is the next planned **engineering-baseline** task after #19 is safely integrated. It is not the next Product-learning decision and must not displace ICP/demand/differentiation/switching/WTP/distribution/retention validation.

Primary phase/sequence authority: `docs/product/IMPLEMENTATION-PLAN.md`. Product intent/validation authority: `docs/product/PRODUCT.md`.

## Active workstreams

### Product/current-state preservation — Issue #19 / PR #22

Current durable state: **candidate open on `main`; first independent review = FAIL / CHANGES REQUIRED on older head; remediation applied; final exact-head gate pending**.

The current candidate preserves/reconciles:

- product vision, problem/JTBD and system-led/invisible-AI direction;
- audience/ICP, demand, differentiation, switching, WTP, distribution and retention claims with explicit hypothesis/validation status;
- cross-account/provider Responsibility attention-workspace differentiation as a hypothesis, not a proven market fact;
- credible product/v1 design direction vs a still-unvalidated market/release MVP;
- differentiation strength + switching/trust cost as a first-class Product risk;
- a staged product-validation evidence ladder instead of equating implementation completeness with demand/retention/WTP evidence;
- current Responsibility L0/L1/L2/L3 proof status;
- the conceptual Data Model with the frozen L1 `DomainEvent[]` boundary rather than `ResponsibilityTransition` as a competing persistence authority;
- legacy-open-candidate classifications and current engineering work routing.

The intended PR diff remains bounded to seven documentation/routing files. No product runtime, migration, provider, auth, AI runtime, or Blueprint-adoption implementation is part of this candidate.

### Blueprint ↔ Lunowa reconciliation — Issue #21

Issue #21 is intentionally deferred until Issue #19 / PR #22 is safely integrated. Its older Issue-body ordering says #19 should wait for #21, but a later durable Issue comment supersedes that order. Use the later ordering decision.

`docs/continuity/BLUEPRINT-ADOPTION.md` remains adoption metadata authority. Do not infer “latest Blueprint = current Lunowa policy” before #21 is actually completed.

### Responsibility L2 executable proof — Issues #13 / #14 / #15

- #13: real PostgreSQL 18 / Drizzle executable acceptance proof for the non-auth matrix.
- #14: Better Auth → PostgreSQL UUID persistence proof for acceptance IDs 47–49.
- #15: independent combined review; only this step may decide L2 PASS/FREEZE vs FAIL/REVISE after #13/#14 evidence exists.

Issue #16 is now completed on default `main`. The #13/#14 Issue bodies still contain historical “blocked by #16” wording, but durable correction evidence and live #16 state supersede it. Do **not** start from the old pre-created execution branches/worktrees: recreate/refresh from the intended current base and run the repository/runtime isolation preflight before editing.

### Legacy open candidates requiring classification

These are not current authority merely because GitHub shows them open:

- PR #5 / Issue #6 — dedicated Guardrail signer hardening: **DEFERRED HARDENING**, not a Phase-1 blocker while human merge authority + baseline Ruleset remain the accepted operating boundary.
- PR #7 — agent-permission / human-light merge-gate candidate created against old `main`: **NEEDS RECONCILIATION**, not safe-to-merge current authority.
- PR #8 — security/failure/verification-contract candidate created against old `main`: **NEEDS RECONCILIATION**, not safe-to-merge current authority.

## Current blockers / dependencies

- **PR #22 exact-head gate:** rerun/record the current candidate’s required mechanical verification (`pnpm verify`, literal `git diff --check`) and exact-head GitHub `Verify` + `E2E Smoke` after the latest refresh/current-state update.
- **PR #22 independent handoff review:** the earlier FAIL belongs to an older head; no new PASS may be inferred from remediation or CI. A fresh reviewer must inspect the current diff/canonical sources/live state and write the disposition durably before integration.
- **Fresh-session proof:** continuity is not proven merely because the docs exist. After #22 integration, run a genuinely fresh ChatGPT bootstrap evaluation from default `main` + live GitHub.
- **Responsibility L2:** final freeze remains blocked on direct executable evidence from #13 + #14 and the independent #15 review. Static DDL review is not sufficient.
- **L3 Responsibility migrations/runtime:** remain unauthorized until a separate post-L2-PASS implementation decision.

Resolved blockers that should not be resurrected:

- default-entry topology mismatch — resolved by PR #24 / Issue #23; accepted Responsibility/harness/continuity history is now reachable from default `main`;
- Issue #16 execution-harness dependency — completed and closed after default-main convergence;
- Issue #18 continuity-structure dependency — completed and closed after default-main convergence.

## Decisions currently pending

- Product evidence: exact early ICP/segment priority and problem severity.
- Product differentiation: whether the Responsibility-oriented **cross-account/provider attention workspace** is materially better than conventional unified inbox/account-switching/task-tool workflows.
- Product switching: whether value/trust improvement is strong enough to change or materially replace users’ existing workflow behavior.
- Commercial evidence: willingness to pay/pricing/package, distribution channel, acquisition efficiency, and retention after novelty.
- Product UX: calibrated balance between automatic attention management and explicit user control; final prominence of Review; resurfacing/notification policy; historical-initial-sync activation policy.
- Platform/product: whether and when native mobile becomes necessary beyond the current responsive-web-first direction.
- Responsibility persistence: executable L2 PASS/FREEZE vs FAIL/REVISE after #13/#14/#15.
- Engineering baseline: Blueprint classifications/adoptions through Issue #21 after #19 is safely integrated.

## Hypotheses / needs validation

See `docs/product/PRODUCT.md` for the owning product-level classification. High-value current hypotheses include:

- early fit among knowledge workers/prosumers/independent professionals with operational email burden, with solo/small-business operators as another candidate segment;
- a cross-account/provider Responsibility attention layer can reduce account switching, rereading, manual task transfer, and “what do I need to do now?” reconstruction more than a plain unified inbox;
- the gain can become strong enough to overcome switching/trust cost;
- paid subscription/prosumer monetization may be viable, but price/package/WTP are not decided;
- representative users should be able to identify the next meaningful action/state very quickly (the current “~10 second” target is an internal usability hypothesis, not an SLA or validated market fact);
- trustworthy attention management can create recurring retention value after novelty fades.

## Important recent supersessions

Detailed rationale lives in the owning canonical sources; this list exists only to prevent bootstrap regressions.

- `ActionItem` / message-level task framing → canonical `Responsibility` model.
- single monolithic lifecycle enum → orthogonal Responsibility state with deterministic `My Turn / Waiting / Later / Done / Review` projections.
- scalar `next_owner/BOTH` as complete truth → zero/one/multiple obligation legs where required.
- follow-up as its own lifecycle species → renewed My Turn action/reason after the appropriate trigger.
- Ask-AI/chat-first routine workflow → system-led intelligence where AI mostly prepares context behind the interface.
- native-mobile/React-Native-first exploration → current accepted responsive web-first implementation path.
- Gmail/provider/AI-first implementation → high-fidelity fake-data UX first; provider/AI integration follows after the interaction model is validated.
- plain multi-account aggregation as the main differentiation → baseline capability; current unvalidated differentiation thesis is Responsibility/attention/trust across accounts/providers while preserving explicit boundaries.
- non-default branch as practical current authority → accepted source history is now converged into default `main`; fresh sessions should bootstrap from default `main` plus live GitHub.
- “all open GitHub work is active current authority” → live PR/Issue state must be interpreted against durable classification, supersession, and candidate freshness.

## Next recommended decision / action

Resolve from live state rather than replaying stale chronology:

1. Finalize the exact current PR #22 head against `main` and keep the changed-file scope bounded to the intended seven documentation/routing files.
2. Run/record `pnpm verify`, literal `git diff --check`, GitHub `Verify` + `E2E Smoke`, final changed-file/scope inspection, and path/authority checks for that exact head.
3. Apply `agent:review-ready` only when the exact-head evidence is current; obtain a genuinely fresh independent handoff-fidelity review. The label means ready to inspect, never PASS.
4. If the independent gate passes, integrate only with explicit user authorization; then run the Fresh-session Bootstrap Evaluation from default `main` + live GitHub.
5. After continuity is stable, resume Issue #21 for reusable engineering-baseline reconciliation. Separately, Product-learning work should attack ICP/demand/differentiation/switching/WTP/distribution/retention uncertainties with the smallest adequate validation experiment rather than waiting for all engineering-baseline work to finish.

## Deep links to canonical sources

### Product / UX

- `docs/product/PRODUCT.md` — product vision/problem/users-as-hypotheses/differentiation/MVP/validation/commercial unknowns/supersessions.
- `docs/design/DESIGN.md` — accepted product-design model, information architecture, visual/trust principles, first high-fidelity slice.
- `docs/design/INTERACTIONS.md` — click semantics, Moments, compose/search/context/error flows.
- `docs/design/RESPONSIVE.md` — responsive/pane behavior.

### Responsibility / data / architecture

- `docs/product/responsibility/README.md` — authoritative Responsibility freeze/proof status and semantic routing.
- `docs/product/responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md` — authoritative frozen L1 persistence boundary.
- `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — exact current v0.4 L2 candidate.
- `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md` — evidence gate before final L2 freeze.
- `docs/product/ARCHITECTURE.md` — modules/authority/provider/AI/scheduler/failure boundaries.
- `docs/product/DATA-MODEL.md` — conceptual durable entities/ownership/concurrency; must stay reconciled with the frozen L1 boundary.
- `docs/product/CONTRACTS.md` — module/provider/domain/scheduler/send/search contracts.
- `docs/product/TECH-STACK.md` — accepted initial stack + activation policy.
- `docs/product/IMPLEMENTATION-PLAN.md` — living product/technical sequence.

### Durable decisions / continuity / live work

- `docs/decisions/0008-responsibility-state-is-orthogonal.md`.
- `docs/decisions/0009-responsibility-persistence-boundary.md`.
- `docs/continuity/README.md` — continuity operating contract.
- `docs/continuity/KNOWLEDGE-MAP.md` — question → authority routing.
- `docs/continuity/BLUEPRINT-ADOPTION.md` — Blueprint adoption relationship; consult with live Issue #21.
- GitHub Issue #19 / PR #22 — current product/current-state preservation candidate; **query live**.
- GitHub Issue #21 — Blueprint reconciliation; later ordering comment supersedes the older body ordering; **query live**.
- GitHub Issues #13/#14/#15 — Responsibility L2 proof/review chain; **query live**.
- GitHub Issues #16/#18/#23 — completed prerequisites/history; not active blockers.
- GitHub PRs #5/#7/#8 — legacy candidates requiring the classifications above, not automatic merge targets.

## Update lifecycle

Revise this checkpoint only after canonical knowledge and live evidence have been reconciled. If it conflicts with a canonical source, code/test/runtime evidence for actual behavior, or live GitHub state, the authoritative/current source wins and this checkpoint must be repaired when appropriate. Keep it small; move substantive knowledge to its proper canonical artifact.
