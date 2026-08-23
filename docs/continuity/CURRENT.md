# Current Project Checkpoint

This is a compact, mutable bootstrap checkpoint. It is not a product, design, architecture, decision, or live-execution source of truth. Summarize only decision-relevant state and link to canonical sources; query GitHub for live Issue/PR/review/CI state.

## Checkpoint metadata

- Last reconciled: `2026-08-24`
- Repository ref / reconciliation provenance: Issue #19 / PR #22 on branch `chatgpt/issue-19-product-knowledge-preservation`, originally based on post-#18 integration commit `c03174a22f22090e878bb48dd8388c8bb47760ce`. The candidate has changed after the first independent review, so **re-query the exact PR head before using any prior CI/review result**.
- Continuity schema version: `0.1`
- Live GitHub state checked during this reconciliation: PR #22; Issue #23 / PR #24; Issues #13/#14/#15/#16/#18/#19/#21; PRs #5/#7/#8; repository default branch/topology and current CI for the topology candidate. Re-query GitHub on every fresh bootstrap when task/review state matters.

## Current phase

- Phase 0 application/runtime/verification foundation is mechanically established.
- Phase 1 **high-fidelity fake-data product UI** remains the first product implementation/validation slice and has not yet been implemented. The current application route is still bootstrap-level rather than the intended three-pane mail product.
- Responsibility semantics/persistence design has advanced farther than the product UI: L0/L1 are frozen baselines and exact L2 v0.4 is static-review complete, but this is a **bounded technical proof stream**, not a product-priority reorder or production-persistence authorization.
- Issue #19 / PR #22 is the current product/current-state preservation stream. Its first independent handoff-fidelity review returned **FAIL / CHANGES REQUIRED**. The semantic/current-state remediation has since been applied, but the candidate cannot pass the fresh-bootstrap claim until the default-entry topology blocker is resolved and the retargeted exact head receives fresh verification + independent review.
- Issue #23 / PR #24 is the isolated prerequisite that converges the already accepted `docs/responsibility-guideline-v0-1` history into default `main`; it is an integration/topology repair, not a new product/domain change.
- Issue #21 Blueprint reconciliation is the next planned **engineering-baseline** task after #19 continuity is safely integrated, but it is not the next Product-learning decision and must not displace ICP/demand/differentiation/switching/WTP/distribution/retention validation.

Primary phase/sequence authority: `docs/product/IMPLEMENTATION-PLAN.md`. Product intent/validation authority: `docs/product/PRODUCT.md`.

## Active workstreams

### Product/current-state preservation — Issue #19 / PR #22

Current durable state: **candidate open; first independent review = FAIL / CHANGES REQUIRED; semantic remediation applied; topology/final-gate work pending**.

The current candidate now preserves/reconciles:

- cross-account/provider Responsibility differentiation as a hypothesis without turning competitor history into timeless fact;
- credible product/v1 design direction vs a still-unvalidated market/release MVP;
- differentiation strength + switching/trust cost as a first-class Product risk;
- a staged product-validation evidence ladder instead of equating implementation completeness with validation;
- current Responsibility L0/L1/L2/L3 proof status;
- the conceptual Data Model with the frozen L1 `DomainEvent[]` boundary rather than `ResponsibilityTransition` as a competing persistence authority;
- legacy-open-candidate classifications;
- the current default-entry/topology and Issue-state ambiguity.

After the topology prerequisite is integrated, PR #22 must be retargeted/rebased onto converged `main`, confirmed to remain a bounded seven-file product/current-state diff, rerun on the exact head, and independently reviewed again.

Do not confuse this with transcript archiving: the objective is recoverable decision-relevant product understanding, not full conversation retention.

### Repository default-entry / branch convergence — Issue #23 / PR #24

Current topology candidate:

- default `main`: `9e2f7cdb4b7cf0bcfdb2b9098cb26d6bb4979a87`;
- accepted source `docs/responsibility-guideline-v0-1`: `c03174a22f22090e878bb48dd8388c8bb47760ce`;
- latest checked relationship: **94 commits ahead / 0 behind**, with current `main` as the exact merge base.

PR #24 proposes only that already accepted source history → default-main convergence. Its changed-file audit excludes PR #22-only Product/current-state remediation and excludes legacy PR #5/#7/#8 candidate files.

Exact-head GitHub CI for PR #24 at the latest check:

- `Verify` — PASS;
- `E2E Smoke` — PASS.

The integration pre-review audit also spot-checked `AGENTS.md`, continuity routing, CI, canonical `pnpm verify`, the 12-case parallel-preflight test harness, and the prior #16/#18 merged evidence. However:

- literal `git diff --check main...docs/responsibility-guideline-v0-1` command provenance is still **NOT_VERIFIED** from the connected GitHub environment;
- an independent integration disposition is still required;
- no merge is authorized by the pre-review audit.

### Blueprint ↔ Lunowa reconciliation — Issue #21

Issue #21 is intentionally deferred until the Issue #19 product/current-state baseline is safely integrated. Its older body text says #19 should wait for #21, but a later durable Issue comment explicitly supersedes that order. Use the later ordering decision.

`docs/continuity/BLUEPRINT-ADOPTION.md` remains the adoption metadata authority. Do not infer “latest Blueprint = current Lunowa policy” before #21 is actually completed.

### Responsibility L2 executable proof — Issues #13 / #14 / #15

- #13: real PostgreSQL 18 / Drizzle executable acceptance proof for the non-auth matrix.
- #14: Better Auth → PostgreSQL UUID persistence proof for acceptance IDs 47–49.
- #15: independent combined review; only this step may decide L2 PASS/FREEZE vs FAIL/REVISE after #13/#14 evidence exists.

The #13/#14 Issue bodies still contain historical “blocked by #16” wording. Durable correction comments state that #16 has been integrated into the current non-default source branch. Do **not** treat the stale sentence as the current blocker, but also do **not** start from the old pre-created execution branches/worktrees: refresh/recreate them from the intended current integration base and run the repository/runtime isolation preflight before editing.

### Legacy open candidates requiring classification

These are not current authority merely because GitHub shows them open:

- PR #5 / Issue #6 — dedicated Guardrail signer hardening. Current durable direction defers this while human merge authority + baseline Ruleset remain sufficient; treat as **DEFERRED HARDENING**, not a Phase-1 blocker.
- PR #7 — agent-permission / human-light merge-gate candidate created against old `main`. It contains potentially useful operating-policy material but predates the current Responsibility/harness/continuity baseline. Treat as **NEEDS RECONCILIATION**, not safe-to-merge current authority.
- PR #8 — security/failure/verification-contract candidate created against old `main`. It contains potentially useful material but predates the current Responsibility/harness/continuity baseline. Treat as **NEEDS RECONCILIATION**, not safe-to-merge current authority.

## Current blockers / dependencies

- **Default-entry prerequisite — Issue #23 / PR #24:** PR #22 cannot satisfy fresh-session handoff fidelity while default `main` remains materially stale. PR #24 has green GitHub CI but still needs literal diff-check evidence where available, independent integration review, and explicit merge authorization.
- **PR #22 final handoff gate:** its first independent review is FAIL / CHANGES REQUIRED. Semantic remediation is applied, but it needs post-#24 retarget/rebase, current exact-head verification, and a new independent review before integration.
- **Issue-state ambiguity from non-default integration:** Issues #16 and #18 remain `open` even though PR #17/#20 were reviewed and merged into `docs/responsibility-guideline-v0-1`. Until default-branch convergence is resolved, interpret them as **implemented/integrated on the current source branch but still live-open because the default branch has not converged**. After safe convergence, reconcile/close their durable Issue state.
- **Exact final diff-checks:** literal `git diff --check` is not currently executable through the connected GitHub tool. Do not replace command provenance with an invented PASS claim for PR #24 or the later retargeted PR #22.
- **Fresh-session proof:** continuity is not proven until the repaired/integrated default repository is tested from a genuinely fresh context.
- **Responsibility L2:** final freeze remains blocked on direct executable evidence from #13 + #14 and the fresh independent #15 review. Static DDL review is not sufficient.
- **L3 Responsibility migrations/runtime:** remain unauthorized until a separate post-L2-PASS implementation decision.

## Decisions currently pending

- Product evidence: exact early ICP/segment priority and problem severity.
- Product differentiation: whether the Responsibility-oriented **cross-account/provider attention workspace** is materially better than conventional unified inbox/account-switching/task-tool workflows.
- Product switching: whether the value/trust improvement is strong enough to change or materially replace users' existing workflow behavior.
- Commercial evidence: willingness to pay/pricing/package, distribution channel, acquisition efficiency, and retention after novelty.
- Product UX: calibrated balance between automatic attention management and explicit user control; final prominence of Review; resurfacing/notification policy; historical-initial-sync activation policy.
- Platform/product: whether and when native mobile becomes necessary beyond the current responsive-web-first direction.
- Responsibility persistence: executable L2 PASS/FREEZE vs FAIL/REVISE after #13/#14/#15.
- Engineering baseline: Blueprint classifications/adoptions through Issue #21 after #19 is safely integrated.
- Repository integration: independent PASS/FAIL disposition for PR #24, then the retargeted PR #22 handoff gate.

## Hypotheses / needs validation

See `docs/product/PRODUCT.md` for the owning product-level classification. High-value current hypotheses include:

- early fit among knowledge workers/prosumers/independent professionals with operational email burden, with solo/small-business operators as another candidate segment;
- a cross-account/provider Responsibility attention layer can reduce account switching, rereading, manual task transfer, and “what do I need to do now?” reconstruction more than a plain unified inbox;
- the gain can become strong enough to overcome switching/trust cost;
- paid subscription/prosumer monetization may be viable, but price/package/WTP are not decided;
- representative users should be able to identify the next meaningful action/state very quickly (the current “~10 second” target is an internal usability hypothesis, not an SLA or validated market fact);
- trustworthy attention management can create recurring retention value after novelty fades.

## Important recent supersessions

Detailed domain rationale lives in the owning canonical sources; this list exists only to prevent bootstrap regressions.

- `ActionItem` / message-level task framing → canonical `Responsibility` model.
- single monolithic lifecycle enum → orthogonal Responsibility state with deterministic `My Turn / Waiting / Later / Done / Review` projections.
- scalar `next_owner/BOTH` as complete truth → zero/one/multiple obligation legs where required.
- follow-up as its own lifecycle species → renewed My Turn action/reason after the appropriate trigger.
- Ask-AI/chat-first routine workflow → system-led intelligence where AI mostly prepares context behind the interface.
- native-mobile/React-Native-first exploration → current accepted responsive web-first implementation path.
- Gmail/provider/AI-first implementation → high-fidelity fake-data UX first; provider/AI integration follows after the interaction model is validated.
- plain multi-account aggregation as the main differentiation → baseline capability; the current unvalidated differentiation thesis is Responsibility/attention/trust across accounts/providers while preserving explicit boundaries.
- “all open GitHub work is active current authority” → live PR/Issue state must be interpreted against current source branch, superseding decisions, and candidate freshness.

## Next recommended decision / action

Resolve from live state rather than replaying stale chronology:

1. **Complete Issue #23 / PR #24 verification**: record literal `git diff --check` from a real repository execution environment, then obtain a genuinely independent integration review. `agent:review-ready` means ready to inspect, never PASS.
2. If PR #24 receives an independent PASS and explicit merge authorization, integrate the accepted source history into `main`; then verify default-main ancestry/state and reconcile stale live Issue states such as #16/#18.
3. Retarget/rebase PR #22 onto the converged `main`. Confirm it remains the intended bounded seven documentation/routing files and does not absorb unrelated history.
4. On the resulting exact PR #22 head, run/record `pnpm verify`, literal `git diff --check`, GitHub `Verify` + `E2E Smoke`, final changed-file/scope inspection, path/authority checks, then obtain a fresh independent handoff-fidelity review.
5. If that gate passes, integrate only with explicit authorization and run the genuinely Fresh-session Bootstrap Evaluation.
6. After continuity is stable, resume Issue #21 for reusable engineering-baseline reconciliation. In parallel/separately, the next Product-learning work should attack the highest-value ICP/demand/differentiation/switching/WTP/distribution/retention uncertainties with the smallest adequate validation experiment rather than waiting for all engineering-baseline work to finish.

## Deep links to canonical sources

### Product / UX

- `docs/product/PRODUCT.md` — product vision/problem/users-as-hypotheses/differentiation/MVP/validation/commercial unknowns/supersessions.
- `docs/design/DESIGN.md` — accepted product-design model, IA, visual/trust principles, first high-fidelity slice.
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
- GitHub Issue #19 / PR #22 — current product/current-state preservation/remediation candidate; **query live**.
- GitHub Issue #23 / PR #24 — default-main convergence prerequisite; **query live**.
- GitHub Issue #21 — Blueprint reconciliation; later ordering comment supersedes the older body ordering; **query live**.
- GitHub Issues #13/#14/#15 — Responsibility L2 proof/review chain; **query live**.
- GitHub Issues #16/#18 — underlying work is integrated on the current non-default source branch but live Issue state remains open pending branch-state reconciliation; **query live**.
- GitHub PRs #5/#7/#8 — legacy candidates requiring the classifications above, not automatic merge targets.

## Update lifecycle

Revise this checkpoint only after canonical knowledge and live evidence have been reconciled. If it conflicts with a canonical source, code/test/runtime evidence for actual behavior, or live GitHub state, the authoritative/current source wins and this checkpoint must be repaired when appropriate. Keep it small; move substantive knowledge to its proper canonical artifact.
