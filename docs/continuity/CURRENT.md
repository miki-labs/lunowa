# Current Project Checkpoint

This is a compact, mutable bootstrap checkpoint. It is not a product, design, architecture, decision, or live-execution source of truth. Summarize only decision-relevant state and link to canonical sources; query GitHub for live Issue/PR/review/CI state.

## Checkpoint metadata

- Last reconciled: `2026-08-24`
- Repository ref / reconciliation provenance: this checkpoint was prepared in Issue #19 / PR #22 from branch `chatgpt/issue-19-product-knowledge-preservation`, based on post-#18 integration commit `c03174a22f22090e878bb48dd8388c8bb47760ce`. **Query live GitHub to determine whether PR #22 is still a candidate or has since been integrated; do not infer live status from this snapshot.**
- Continuity schema version: `0.1`
- Live GitHub state checked during reconciliation: `2026-08-24` for PR #22, Issues #13/#14/#15/#19/#21, and the preceding #16/#18 integration chain. **Re-query GitHub on every fresh bootstrap when task/review state matters.**

## Current phase

- Phase 0 application/runtime/verification foundation is mechanically established.
- Phase 1 **high-fidelity fake-data product UI** is still the first product slice and has not yet been implemented.
- Responsibility semantics/persistence design has advanced farther than the product UI: L0/L1 are frozen baselines and exact L2 v0.4 is static-review complete, but this is a **bounded technical proof stream**, not a product-priority reorder or production-persistence authorization.
- Product/domain preservation is represented by Issue #19 / PR #22. While #22 remains open, validating/integrating it is the immediate continuity priority. Once #22 is integrated, the planned next engineering-knowledge task is Issue #21 Blueprint reconciliation.

Primary phase/sequence authority: `docs/product/IMPLEMENTATION-PLAN.md`. Product intent/validation authority: `docs/product/PRODUCT.md`.

## Active workstreams

### Product/current-state preservation — Issue #19 / PR #22

The canonical promotion/routing/checkpoint change is represented by PR #22. **Query live GitHub:**

- if PR #22 is open, it still requires current evidence and independent handoff-fidelity review/integration;
- if PR #22 is merged/Issue #19 closed, treat this preservation pass as integrated and continue from the next live dependency rather than repeating it.

Do not confuse this with transcript archiving: the objective is recoverable product understanding, not full conversation retention.

### Blueprint ↔ Lunowa reconciliation — Issue #21

Designed as the next engineering-baseline task **after the Issue #19 preservation baseline is safely integrated**. `docs/continuity/BLUEPRINT-ADOPTION.md` remains the adoption metadata authority; query Issue #21 and the file itself for live reconciliation status rather than assuming it has run.

### Responsibility L2 executable proof — Issues #13 / #14 / #15

- #13: real PostgreSQL 18 / Drizzle executable acceptance proof for the non-auth matrix.
- #14: Better Auth → PostgreSQL UUID persistence proof for acceptance IDs 47–49.
- #15: independent combined review; only this step may decide L2 PASS/FREEZE vs FAIL/REVISE after #13/#14 evidence exists.

The #13/#14 Issue bodies contain historical wording saying “blocked by #16”. That prerequisite has since been integrated, and durable correction comments record this. **Do not treat the stale sentence as a current blocker or start from the pre-created stale branches:** when those tasks resume, refresh/recreate their execution branches/worktrees from the intended current integration base and run the repository/runtime isolation preflight.

## Current blockers / dependencies

- The continuity migration is not fully demonstrated until Issue #19 / PR #22 is integrated **and** a later **Fresh-session Bootstrap Evaluation** shows that a new context can recover the correct product/project state without hidden chat memory. Query #22 live before deciding which half remains.
- Responsibility L2 final freeze is blocked on direct executable evidence from #13 + #14 and the fresh independent #15 review. Static DDL review is not sufficient.
- L3 Responsibility migrations/runtime remain unauthorized until a separate post-L2-PASS implementation decision.
- Blueprint adoption status is not established merely by this checkpoint. Use `BLUEPRINT-ADOPTION.md` plus live Issue #21; do not infer “latest Blueprint = current Lunowa policy”.

## Decisions currently pending

- Product evidence: exact early ICP/segment priority, demand strength, willingness to pay/pricing/package, distribution channel, and retention after novelty.
- Product UX: calibrated balance between automatic attention management and explicit user control; final prominence of Review; resurfacing/notification policy; historical-initial-sync activation policy.
- Platform/product: whether and when native mobile becomes necessary beyond the current responsive-web-first direction.
- Responsibility persistence: executable L2 PASS/FREEZE vs FAIL/REVISE after #13/#14/#15.
- Engineering baseline: Blueprint classifications/adoptions through Issue #21 until a completed reconciliation is recorded.

## Hypotheses / needs validation

See `docs/product/PRODUCT.md` for the owning product-level classification. High-value current hypotheses include:

- early fit among knowledge workers/prosumers/independent professionals with operational email burden, with solo/small-business operators as another candidate segment;
- paid subscription/prosumer monetization may be viable, but price/package/WTP are not decided;
- the differentiation is Responsibility/attention/trust + system-led intelligence, not multi-account aggregation or generic AI alone;
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
- multi-account unification as the main differentiation → baseline capability; current differentiation hypothesis is Responsibility/attention/trust.

## Next recommended decision / action

Resolve from live state rather than blindly replaying this list:

1. **If PR #22 is open:** verify its exact current head (`pnpm verify`, CI `Verify`/`E2E Smoke`, diff/scope integrity), place it in `agent:review-ready` only when complete, and obtain a fresh independent handoff-fidelity review before integration.
2. **If PR #22 is integrated:** resume Issue #21 Blueprint ↔ Lunowa reconciliation from the integrated product-preservation baseline; update only the engineering-baseline portion of this checkpoint if that result changes current routing/state.
3. After the relevant baseline work is integrated, run a genuinely fresh-session bootstrap evaluation. A broader cross-chat Knowledge Delta Audit may follow separately.

## Deep links to canonical sources

### Product / UX

- `docs/product/PRODUCT.md` — product vision/problem/users-as-hypotheses/differentiation/MVP/validation/commercial unknowns/supersessions.
- `docs/design/DESIGN.md` — accepted product-design model, IA, visual/trust principles, first high-fidelity slice.
- `docs/design/INTERACTIONS.md` — click semantics, Moments, compose/search/context/error flows.
- `docs/design/RESPONSIVE.md` — responsive/pane behavior.

### Responsibility / data / architecture

- `docs/product/responsibility/README.md` — authoritative Responsibility freeze/proof status and semantic routing.
- `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — exact current v0.4 L2 candidate.
- `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md` — evidence gate before final L2 freeze.
- `docs/product/ARCHITECTURE.md` — modules/authority/provider/AI/scheduler/failure boundaries.
- `docs/product/DATA-MODEL.md` — conceptual durable entities/ownership/concurrency.
- `docs/product/CONTRACTS.md` — module/provider/domain/scheduler/send/search contracts.
- `docs/product/TECH-STACK.md` — accepted initial stack + activation policy.
- `docs/product/IMPLEMENTATION-PLAN.md` — living product/technical sequence.

### Durable decisions / continuity / live work

- `docs/decisions/0008-responsibility-state-is-orthogonal.md`.
- `docs/decisions/0009-responsibility-persistence-boundary.md`.
- `docs/continuity/README.md` — continuity operating contract.
- `docs/continuity/KNOWLEDGE-MAP.md` — question → authority routing.
- `docs/continuity/BLUEPRINT-ADOPTION.md` — Blueprint adoption relationship; consult with live Issue #21.
- GitHub Issue #19 / PR #22 and Issue #21 — preservation/reconciliation task/candidate state; **query live**.
- GitHub Issues #13/#14/#15 — Responsibility L2 proof/review chain; **query live**.

## Update lifecycle

Revise this checkpoint only after canonical knowledge and live evidence have been reconciled. If it conflicts with a canonical source, code/test/runtime evidence for actual behavior, or live GitHub state, the authoritative/current source wins and this checkpoint must be repaired when appropriate. Keep it small; move substantive knowledge to its proper canonical artifact.
