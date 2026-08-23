# Current Project Checkpoint

This is a compact, mutable bootstrap checkpoint. It is not a product, design, architecture, decision, or live-execution source of truth. Summarize only decision-relevant state and link to canonical sources; query GitHub for live Issue/PR/review/CI state.

## Checkpoint metadata

- Last reconciled: `2026-08-24`
- Repository ref / reconciliation provenance: Issue #19 / PR #22 on branch `chatgpt/issue-19-product-knowledge-preservation`, originally based on post-#18 integration commit `c03174a22f22090e878bb48dd8388c8bb47760ce`. The candidate has changed after the first independent review, so **re-query the exact PR head before using any prior CI/review result**.
- Continuity schema version: `0.1`
- Live GitHub state checked during this reconciliation: PR #22; Issues #13/#14/#15/#16/#18/#19/#21; PRs #5/#7/#8; repository default branch/topology. Re-query GitHub on every fresh bootstrap when task/review state matters.

## Current phase

- Phase 0 application/runtime/verification foundation is mechanically established.
- Phase 1 **high-fidelity fake-data product UI** remains the first product implementation/validation slice and has not yet been implemented. The current application route is still bootstrap-level rather than the intended three-pane mail product.
- Responsibility semantics/persistence design has advanced farther than the product UI: L0/L1 are frozen baselines and exact L2 v0.4 is static-review complete, but this is a **bounded technical proof stream**, not a product-priority reorder or production-persistence authorization.
- Issue #19 / PR #22 is the immediate continuity-repair stream. Its first independent handoff-fidelity review returned **FAIL / CHANGES REQUIRED**. The current candidate is being remediated; the earlier PASSing CI/review evidence applies only to the older reviewed head and becomes stale after candidate changes.
- Issue #21 Blueprint reconciliation is the next planned **engineering-baseline** task after #19 continuity is safely integrated, but it is not the next Product-learning decision and must not displace ICP/demand/differentiation/switching/WTP/distribution/retention validation.

Primary phase/sequence authority: `docs/product/IMPLEMENTATION-PLAN.md`. Product intent/validation authority: `docs/product/PRODUCT.md`.

## Active workstreams

### Product/current-state preservation — Issue #19 / PR #22

Current durable state: **candidate open; first independent review = FAIL / CHANGES REQUIRED**.

The remediation must preserve the strong existing product capture while correcting handoff-fidelity gaps discovered by review/audit:

- sharpen the cross-account/provider Responsibility differentiation hypothesis without turning competitor history into timeless fact;
- distinguish credible product/v1 design direction from a market-validated release MVP;
- make differentiation + switching/trust cost a first-class Product risk;
- preserve a staged product-validation evidence ladder rather than equating implementation completeness with validation;
- reconcile stale current-state/workstream text;
- reconcile the conceptual Data Model with the frozen L1 `DomainEvent[]` boundary rather than leaving `ResponsibilityTransition` as an apparently competing persistence authority;
- resolve the repository default-entry/topology problem before claiming a fresh session can bootstrap normally;
- classify legacy open candidates instead of treating every open PR/Issue as active current work;
- obtain new exact-head verification and independent review after remediation.

Do not confuse this with transcript archiving: the objective is recoverable decision-relevant product understanding, not full conversation retention.

### Repository default-entry / branch convergence

The repository default branch is currently `main`, while `docs/responsibility-guideline-v0-1` contains the accepted Responsibility/harness/continuity history and is **94 commits ahead of `main`, 0 behind** at the latest topology check.

This is a material continuity blocker: opening the repository normally on default `main` can expose materially stale `AGENTS.md`/product semantics and fail to route a fresh session into `docs/continuity/`.

Do not solve this by rewriting history or merging a stale legacy PR blindly. Preserve the accepted source history and converge the authoritative state into the intended default entry through a separately reviewed, evidence-backed integration step.

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

- **PR #22 handoff gate:** first independent review is FAIL / CHANGES REQUIRED. Prior exact-head CI success does not approve the remediated head.
- **Default-entry continuity:** default `main` is materially stale relative to the accepted non-default source branch; a normal fresh bootstrap can therefore start from stale authority.
- **Issue-state ambiguity from non-default integration:** Issues #16 and #18 remain `open` even though PR #17/#20 were reviewed and merged into `docs/responsibility-guideline-v0-1`. Until default-branch convergence is resolved, interpret them as **implemented/integrated on the current source branch but still live-open because the default branch has not converged**. After safe convergence, reconcile/close their durable Issue state.
- **Exact final diff-check:** literal `git diff --check` for the final remediated PR #22 head is not verified yet. Do not replace command provenance with an invented PASS claim.
- **Fresh-session proof:** continuity is not proven until the repaired/integrated repository is tested from a genuinely fresh context.
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
- Repository integration: safe convergence of the accepted non-default source history into the repository default entry without losing review/decision history or accidentally integrating stale legacy candidates.

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

1. **Complete PR #22 remediation on its current candidate branch**: product-thesis corrections, current-state refresh, Data Model authority reconciliation, and explicit legacy/topology classification.
2. **Resolve default-entry continuity safely** so a normal repository bootstrap reaches the accepted Responsibility/harness/continuity state instead of stale `main` authority. Do not merge old PRs blindly as part of this step.
3. On the resulting exact candidate head, run/record the required verification: `pnpm verify`, literal `git diff --check`, GitHub `Verify` + `E2E Smoke`, final changed-file/scope inspection, and path/authority checks.
4. Reapply `agent:review-ready` only after current evidence exists; obtain a genuinely fresh independent handoff-fidelity review. The queue label means ready to inspect, never PASS.
5. If the independent gate passes, integrate only with explicit authorization; then reconcile stale live Issue states such as #16/#18 and run the Fresh-session Bootstrap Evaluation.
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
- GitHub Issue #19 / PR #22 — current preservation/remediation candidate; **query live**.
- GitHub Issue #21 — Blueprint reconciliation; later ordering comment supersedes the older body ordering; **query live**.
- GitHub Issues #13/#14/#15 — Responsibility L2 proof/review chain; **query live**.
- GitHub Issues #16/#18 — underlying work is integrated on the current non-default source branch but live Issue state remains open pending branch-state reconciliation; **query live**.
- GitHub PRs #5/#7/#8 — legacy candidates requiring the classifications above, not automatic merge targets.

## Update lifecycle

Revise this checkpoint only after canonical knowledge and live evidence have been reconciled. If it conflicts with a canonical source, code/test/runtime evidence for actual behavior, or live GitHub state, the authoritative/current source wins and this checkpoint must be repaired when appropriate. Keep it small; move substantive knowledge to its proper canonical artifact.
