# Product Content Completion — Full Acceptance Audit Round 2

## Status

**FAIL — full cumulative re-audit after the A-01..A-12 correction batch.**

Audit target:

- task contract: GitHub Issue #45 body version identified by `updated_at = 2026-08-27T13:24:54Z`;
- canonical base: `main@7359d227d58ac3e8bc730435a12c2b07d4f4065d`;
- exact audited candidate head: `dbef7098e7cead71e7f77fbadbc801cd70b095b4`;
- scope: entire cumulative branch diff plus all canonical authorities/routing/execution documents that can materially reinterpret that diff.

This is not a latest-patch review.

---

# 1. What passed in Round 2

The corrected Product semantic content now passes the substantive Issue #45 domains:

1. User Control / Correction / Escalation preserves field-scoped authority, immutable source, semantic kind, Return Attention vs actionability, Stop Tracking vs world success, contextual approval, and no permission expansion.
2. Failure/degraded behavior distinguishes provider/source, ingestion, scheduler, AI interpretation, external-action reconciliation, delivery, client/offline, and local capability scope; it uses last-trustworthy/reconciliation boundaries.
3. Account lifecycle distinguishes client sign-out, unexpected authorization loss, intentional mailbox disconnect, reconnect/re-add, permission-scope loss, and Product-account deletion.
4. Disconnect now exposes summary scope plus an inspectable affected-items path and never fabricates successful completion.
5. Product-account deletion has a Product boundary plus a separate public-release privacy/legal/data-contract prerequisite; exact retention values remain UNKNOWN.
6. Settings is capability-conditional and does not imply unsupported autonomy/rule-builder surfaces.
7. Communication edge cases reuse existing Responsibility semantics; cross-thread identity remains OPEN/conservative-split and cross-account semantic merge remains prohibited initially.
8. High-risk source content alone does not create Review; deterministic verification may remain normal Needs You/Moment work where a USER obligation exists.
9. AI/processing failure alone creates neither Needs You nor `No Responsibility`.
10. Healthy Managed excludes a Responsibility with current surfaced material Review; unaffected monitoring may continue.
11. Strict true zero requires no current/surfaced unresolved Review and no Needs You, with trustworthy integrity.
12. v1 offline behavior does not silently queue consequential external effects without a separately accepted delayed-action contract.
13. The Product Golden Scenario Bank now covers 64 Product-level cases and remains subordinate to Responsibility semantic oracles.
14. Final evidence review uses the CHI 2026 and ACL Findings 2026 versions of record where available and preserves evidence/inference/hypothesis/unknown distinctions.
15. No implementation, schema, aggregate, enum, permission object, or Issue #36 conclusion was introduced.

---

# 2. Remaining material blockers

## B-01 — Repository-wide authority routing is still incomplete

**Issue #45 impact:** acceptance criterion 11 and canonical promotion integrity.

`PRODUCT.md`, `docs/product/README.md`, and `docs/continuity/CURRENT.md` now route the new detailed Product authority and Golden Scenario Bank, but other first-class routing/bootstrap artifacts still expose the old authority inventory:

- `AGENTS.md` routes Product questions only to `PRODUCT.md` + historical candidates/research;
- root `README.md` lists only `docs/product/PRODUCT.md` under Product authority;
- `docs/continuity/KNOWLEDGE-MAP.md` routes Product questions only to `PRODUCT.md` and does not distinguish detailed Product operating behavior / Product-level acceptance-bank questions.

A fresh builder can therefore bootstrap without discovering the new accepted detailed authority.

**Required correction:** update these routing artifacts to point to `PRODUCT-CONTENT.md` and `GOLDEN-SCENARIO-BANK.md`, while preserving Responsibility semantic precedence and candidate/research nonauthority.

## B-02 — `IMPLEMENTATION-PLAN.md` still promotes deferred mail-client convenience into required phase scope

**Issue #45 impact:** acceptance criteria 9, 11, 13.

Phase 4 currently says required behavior includes `compose/reply/reply-all/forward` and then says `Undo Send uses real pre-provider delay semantics. Send Later reuses durable scheduling principles...`.

The final Product Feature Matrix and `PRODUCT.md` say:

- contextual Reply / Reply All / explicit Send + reconciliation are the active complete-loop targets;
- arbitrary new Compose and Forward parity are optional/deferred;
- Send Later parity is deferred/provider-owned unless separately accepted;
- v1 offline behavior may not silently turn a local action into delayed consequential execution.

**Required correction:** Phase 4 must make contextual reply/reply-all + explicit Send/reconciliation the required Product path when authorized; generic Compose/Forward/Undo-Send/Send-Later are not phase gates unless a later accepted task contract explicitly promotes them. If future delayed-send capability is accepted, it must receive its own durable delayed-action semantics/authority rather than being inferred from Temporal Contract availability.

Also add `PRODUCT-CONTENT.md` / Product Golden Bank to related sources where appropriate.

## B-03 — Final Feature Matrix attachment row is not cross-source precise enough

**Issue #45 impact:** acceptance criterion 9.

`PRODUCT-CONTENT.md` currently marks `basic attachment open/preview fallback` as `V1 STRONG CANDIDATE`, while `PRODUCT.md` names `relevant attachment preview/open` a `CORE NATIVE target` and canonical Design includes relevant attachment preview/open in current complete-loop design scope.

This is resolvable without broadening attachment intelligence:

**Required correction:** split the boundary:

- **Source attachment access/open/download-or-provider fallback sufficient to inspect material source evidence** — V1 CORE trust/source capability;
- **rich/native in-app attachment preview rendering** — V1 STRONG CANDIDATE;
- **reply attachment add** — V1 STRONG CANDIDATE;
- **full attachment-content understanding** — DEFERRED.

The matrix must make the core evidence-access requirement distinct from optional preview richness.

---

# 3. Non-blocking design finding

Canonical Design shows a Home example with a non-zero Review section followed by a Managed card whose line says `現在、追加対応が必要なものはありません`. Under current Product authority, that copy is interpreted as scoped to the Managed card, not a global all-clear. `PRODUCT-CONTENT.md` and the Golden Bank now explicitly prohibit a strict all-clear while Review exists and prohibit including the Review item in healthy Managed count.

This is **not a blocker** because Product authority is explicit and the screen visibly shows Review. Future copy/usability work should prefer scope-explicit wording (for example, `管理中の件について、追加対応は不要です`) if testing shows ambiguity.

`INTERACTIONS.md` says an **empty Home** may use the strict all-clear copy; that is compatible because a Home with Review is not empty.

---

# 4. Repeated-correction root-cause analysis

This is a repeated correction failure, so do not treat B-01..B-03 as another ad hoc patch list.

## Preventable verification gap 1 — routing inventory was underspecified

Round 1 blocker A-01 said canonical routing must be reconciled, but the correction/audit oracle did not enumerate every repository entry point that a fresh builder actually follows.

The repository's bootstrap path is:

```text
AGENTS.md
-> continuity README
-> CURRENT.md + KNOWLEDGE-MAP.md
-> Product/engineering README/root README as encountered
-> current Issue
-> owning canonical sources
```

Checking only `PRODUCT.md`, `docs/product/README.md`, and `CURRENT.md` was insufficient.

**Preventive fix:** future canonical-promotion audits must enumerate all first-class authority/router surfaces explicitly: at minimum `AGENTS.md`, root `README.md`, `PRODUCT.md`, domain/Product README, `CURRENT.md`, `KNOWLEDGE-MAP.md`, owning design docs when semantics change, and active execution plan.

## Preventable verification gap 2 — Feature Matrix lacked a cross-source scope oracle

The final Feature Matrix was reviewed internally but not cross-checked row-by-row against existing canonical Product action posture, Design current scope, and Implementation Plan phase requirements. That allowed the attachment access/preview ambiguity and stale Forward/Send-Later phase language to survive Round 1.

**Preventive fix:** before PASS, compare each scope-sensitive capability across:

```text
PRODUCT high-level posture
<-> PRODUCT-CONTENT final matrix
<-> DESIGN / INTERACTIONS current scope
<-> IMPLEMENTATION-PLAN phase gates
<-> root/AGENTS/router summaries
```

Any broader lower-authority requirement must either be explicitly capability-only/conditional or be corrected.

## Architecture/specification conclusion

No repeated failure indicates a flaw in FIXED Responsibility architecture or the new Product semantic model. The failure is in **promotion/routing/scope verification coverage**, not Responsibility schema/ontology.

---

# 5. Batch correction rule

Correct B-01 through B-03 as one batch, then perform one more full acceptance audit of the complete candidate against Issue #45.

Do not re-open already-passed semantics unless new evidence reveals a contradiction. Do not create implementation work or execute Issue #36.

Until that audit passes and exact-head verification/CI passes, **Product Content COMPLETE = NOT YET**.
