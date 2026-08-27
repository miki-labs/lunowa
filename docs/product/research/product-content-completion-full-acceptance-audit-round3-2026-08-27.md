# Product Content Completion — Full Acceptance Audit Round 3 — 2026-08-27

## Disposition

**FAIL / REVISE**

Candidate audited: `17b127a8851d7673b798728b83b03b473f169fac`

Task contract equivalent durable identifier: GitHub Issue #45 body as of `updated_at=2026-08-27T13:24:54Z`.

Base/main audited: `7359d227d58ac3e8bc730435a12c2b07d4f4065d` (unchanged during audit).

This is a **full acceptance audit of Issue #45 + the entire cumulative candidate**, not a review of the latest attachment patch only.

---

## Why this is another FAIL rather than a micro-patch

Round 1 found semantic/product-boundary blockers and corrected them as one batch.

Round 2 found a verification-process gap: repository-wide routing and Feature-Matrix-to-plan cross-checking were too narrow. That root cause was recorded before correction.

Round 3 re-ran the cumulative audit and then re-checked the remaining attachment-scope ambiguity against current 2026 Gmail, Outlook, and Superhuman documentation. That evidence forced a finer capability decomposition:

```text
attachment source/evidence access
!= rich native in-app preview
!= reply attachment add
!= full attachment-content semantic understanding
!= provider/security-blocked access
```

The previous oracle treated these as one broad `attachment preview/open` capability, so it could not detect every cross-artifact mismatch. This is the preventable verification gap behind this round.

### Corrected verification rule before another patch

For every material Feature Matrix capability—especially a split capability—trace all of:

1. highest-level Product action/scope shorthand;
2. detailed Product matrix/boundary;
3. Product Golden regression consequence if safety/meaning can regress;
4. implementation-plan phase that eventually carries the core requirement;
5. design wording, ensuring it does not force broader Product scope;
6. Responsibility authority, ensuring no ontology/schema promotion occurs.

Do not declare PASS until those six views are coherent.

---

# Full Issue #45 acceptance audit

## AC-1 User control / correction / escalation

**PASS except for no issue in this round.**

- source remains immutable;
- user authority is field-scoped;
- USER_TARGET does not become SOURCE_DUE;
- Return Attention changes attention, not world state/actionability;
- Stop Tracking does not prove success;
- approval is action-bounded;
- high-risk category alone does not create Review;
- repeated correction does not silently create standing policy or permission.

No conflict found with FIXED Responsibility semantics.

## AC-2 Failure/degraded behavior

**PASS.**

Affected capability/scope, last trustworthy observation, reconciliation, AI/source fallback, delivery-vs-monitoring separation, offline consequential-action boundary, local-feature degradation, and material-miss recovery are specified.

## AC-3 Temporary auth vs intentional disconnect vs Product deletion

**PASS.**

The operations preserve distinct user intent and recovery semantics.

## AC-4 Account removal/deletion decision completeness

**PASS at Product-content level.**

Intentional disconnect exposes account + affected live delegated scope and an inspectable affected-items path, and never fabricates completion. Product-account deletion stops Lunowa monitoring and requires actual accepted privacy/legal/data guarantees for shipped decision-complete copy. Exact retention/deletion/export/billing values remain an explicit release prerequisite/UNKNOWN rather than fabricated Product truth.

## AC-5 Minimal Settings IA

**PASS.**

Settings is capability-conditional and persistent-scope oriented. No global autonomy slider, prompt/model debug controls, or generic rules engine is introduced.

## AC-6 Material communication edge cases

**PASS at semantic Product level, with one attachment regression-bank routing blocker below.**

Automated/FYI, multiple Responsibilities, quote/forward authority, CC/group assignment, aliases/accounts, OOO, acknowledgement/partial response, bounce, attachment claim-vs-observation, revised terms, off-channel evidence, cross-thread conservative split, uninterpretable source, prompt injection, duplicate/out-of-order evidence, historical sync, and calendar mail are covered without new ontology.

## AC-7 Managed / Review complete boundary

**PASS.**

Current surfaced material Review is user-facing mutually exclusive with healthy Managed at item/count level while unaffected background monitoring may continue. Review subject types remain distinct internally, Review requires material unresolved user-useful judgment, and routine explicit Send is not Review.

## AC-8 Empty/zero/unavailable states

**PASS.**

Strict all-clear requires no current Needs You and no unresolved surfaced Review. Initial-sync/degraded/unknown/intentionally-unmonitored states cannot masquerade as healthy zero.

## AC-9 Final Feature Matrix

**PASS in `PRODUCT-CONTENT.md` after attachment split; FAIL in cross-authority routing until C-01/C-03 are fixed.**

The detailed matrix now correctly separates:

- authorized attachment evidence access = V1 CORE;
- rich native in-app preview = V1 STRONG CANDIDATE;
- reply attachment add = V1 STRONG CANDIDATE;
- full attachment-content understanding = DEFERRED.

The matrix itself is coherent; higher-level Product shorthand and the future provider implementation gate still need exact reconciliation.

## AC-10 Product Golden Scenario Bank

**PASS broadly, but FAIL completeness for the newly split attachment security boundary until C-02 is fixed.**

64 scenarios already cover the complete delegation loop, control, failure, account lifecycle, settings, communication edge cases, Managed/Review/zero/retrieval/delivery and remain subordinate to Responsibility oracles. Add one explicit provider/security-blocked attachment case so the new core-access boundary cannot be implemented as a security bypass.

## AC-11 Canonical artifact reconciliation

**FAIL only for C-01/C-03 below.**

`PRODUCT.md`, `PRODUCT-CONTENT.md`, Product README, root README, AGENTS, CURRENT, KNOWLEDGE-MAP, design, and IMPLEMENTATION-PLAN routing were re-read. The remaining stale/underspecified attachment wording is isolated below.

## AC-12 Preserve empirical UNKNOWNs

**PASS.**

ICP/PMF/WTP/reliability/validated IA/delivery defaults/class criteria/form/retrieval breadth/multi-provider/pricing/distribution/retention/legal exact values and other empirical/technical questions remain explicit.

## AC-13 Sequencing / no implementation authorization

**PASS.**

Issue #45 closes Product content only. Issue #36 is the next empirical Product gate. Issue #28/production persistence/provider/AI/broad client implementation remains gated.

## AC-14 Full cumulative audit

**PASS as process for this round; final disposition remains FAIL because three material corrections remain.**

The audit covered the complete diff and all current authorities instead of the latest patch only.

---

# Batched material blockers

## C-01 — Highest-level PRODUCT action table still conflates access and preview

`docs/product/PRODUCT.md` still says:

```text
relevant attachment preview/open -> CORE NATIVE target
```

while the same file later lists basic attachment preview as a strong v1 candidate and the detailed final matrix now correctly distinguishes source evidence access from rich native preview.

### Required correction

Replace the shorthand with explicit rows/wording that preserve:

- authorized attachment evidence access via safe open/download/provider fallback as V1 CORE Product behavior;
- rich native in-app preview as V1 STRONG CANDIDATE;
- provider/security restrictions as capability boundaries.

Do not require universal native rendering for Product completion.

## C-02 — Golden Bank lacks the new provider/security-blocked attachment regression

The bank covers local renderer failure (`PG-28`) and claim-vs-observation (`PG-45`) but does not separately test provider/platform security denial.

### Required correction

Add one scenario where an attachment exists as source evidence but the provider/platform blocks access as unsafe/unsupported. Expected behavior must preserve existence/provenance, show the access limitation honestly, avoid bypassing the protection, and apply affected-scope Integrity/attention only if the unavailable evidence actually breaks a delegated promise or creates real user work.

Add a bank-level forbidden invariant preventing security/protection bypass for feature parity.

## C-03 — IMPLEMENTATION-PLAN Phase 3 does not carry the newly explicit V1 CORE attachment-access requirement

Phase 3 currently requires attachment metadata/provider observations but does not explicitly require the safe user evidence-access path. This can allow a builder to complete the provider read phase while a detailed V1 CORE capability falls through the execution plan.

### Required correction

In the authorized Gmail read-only/provider phase, require safe authorized attachment evidence access sufficient for the accepted Product scope through supported open/download/provider fallback while preserving provider/security restrictions. Explicitly state that rich native preview is not the Phase-3 exit gate.

---

# Non-blocking observations

- Exact native preview file types, sandboxing, platform behavior, size limits, and semantic extraction remain implementation/security/usability UNKNOWNs and should stay out of Product-content freeze.
- Current Design wording `relevant attachment preview/open` is acceptable only as a presentation shorthand once highest-level Product scope is corrected, because detailed Product authority explicitly defines the core obligation as evidence access and rich preview as a candidate. If a later design task makes universal preview mandatory, it must be reconciled then.

---

# Next audit condition

After C-01/C-02/C-03 are corrected as one batch, perform a fresh full acceptance audit of Issue #45 + entire cumulative candidate. Do not review only those three changes.

A final PASS must bind to the exact new candidate head and Issue #45 body at `updated_at=2026-08-27T13:24:54Z`, then exact-head repository/CI checks must pass before merge.