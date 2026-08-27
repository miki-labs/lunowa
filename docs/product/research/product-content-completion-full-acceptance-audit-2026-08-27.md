# Product Content Completion — Full Acceptance Audit

## Status

**FAIL — cumulative candidate audit, 2026-08-27.**

This is a full acceptance audit of GitHub Issue #45 against the entire cumulative candidate at exact head:

- task contract: Issue #45, body version identified by `updated_at = 2026-08-27T13:24:54Z`;
- canonical base: `main@7359d227d58ac3e8bc730435a12c2b07d4f4065d`;
- audited candidate head: `3864f3cc8810f7c17867ce3d4e0d707c0eb8cda7`;
- compare scope: exactly three added files, 2,200 additions, no deletions/modifications:
  - `docs/product/PRODUCT-CONTENT-COMPLETION-CANDIDATE.md`;
  - `docs/product/GOLDEN-SCENARIO-BANK-CANDIDATE.md`;
  - `docs/product/research/product-content-completion-evidence-2026-08-27.md`.

This audit is not limited to the latest patch. It evaluates the current Issue #45 contract, all candidate content, current `PRODUCT.md`, Responsibility FIXED semantics/decision ledger, canonical design interactions, implementation sequencing, and dated external evidence.

No implementation or Issue #36 field discovery is authorized by this audit.

---

# 1. Audit disposition

The candidate is directionally strong and preserves most FIXED Responsibility boundaries, but it is **not acceptable for canonical promotion yet**.

The blockers below are recorded together to avoid a micro-correction loop. Corrections should be made as one batch and then the **whole resulting candidate** must be re-audited.

---

# 2. Material blockers / required corrections

## A-01 — Canonical routing is still absent

**Contract impact:** Issue #45 acceptance criteria 9, 10, 11, 14.

The audited branch only adds noncanonical candidate/research files. `docs/product/PRODUCT.md`, canonical design/router artifacts, and a canonical Product-level Golden Scenario Bank have not yet been reconciled. The candidate itself explicitly says promotion is future work.

**Required correction:** after semantic blockers below are corrected, promote the accepted behavior into a clearly discoverable canonical Product authority and reconcile any canonical design/router text that would otherwise permit obsolete interpretations. Golden scenarios must become canonical while remaining subordinate to Responsibility semantic oracles.

Do not mark Product Content COMPLETE merely because the noncanonical candidate is comprehensive.

---

## A-02 — Managed and surfaced Review can double-count the same user-facing case

**Contract impact:** criteria 7 and 8; existing Managed/Review semantics.

Current candidate allows healthy Managed eligibility when there is no Review that "blocks safe delegation for the relevant handling." This leaves room for a Responsibility with a currently surfaced material Review on one field to remain inside the healthy Managed reassurance/count because unaffected monitoring can continue.

That is unsafe UX semantics: the underlying monitoring may continue, but the Product should not simultaneously reassure the user that the same item is fully "Managed" while asking them a material Review question.

**Required correction:** when a material Review subject is currently surfaced for an admitted Responsibility, its primary user-facing projection is Review and it is excluded from healthy Managed reassurance/count until that Review is resolved. Unaffected background monitoring may continue. Re-evaluate projection after Review resolution.

This does not create a new lifecycle state or alter canonical Responsibility truth.

---

## A-03 — “True zero attention” incorrectly permits unresolved nonurgent Review

**Contract impact:** criteria 7 and 8; Review urgency separation.

Current condition says:

> no material Review requiring current presentation; no current Needs You work.

A nonurgent Review can still require user judgment while not warranting interruption. Delivery urgency and the existence of Review are separate dimensions. Calling that state true zero risks telling the user there is nothing to do while a real Product question remains.

**Required correction:** true zero attention requires **no current/surfaced unresolved Review subjects and no Needs You work**. A Review may be nonurgent and wait for the normal review point, but it still prevents a strict all-clear claim. Quiet hours affect interruption, not existence of Review.

---

## A-04 — High-risk source content is too close to being a Review trigger by category alone

**Contract impact:** criterion 1; FIXED `requested action != safe/recommended next action`; Review sparsity.

Section 2.4 lists "consequential/irreversible/security/financial/contractual/identity-sensitive requested action" among Review triggers, while section 8.3 says Review may be used for a high-risk request.

Risk class alone does not imply semantic ambiguity. Existing canonical interaction behavior already allows a high-risk source request to produce a safe user action such as `[依頼を検証]` in a normal Moment when a real USER obligation exists.

**Required correction:** high risk by itself is not Review. Review is used only when a material identity/authority/interpretation/safe-action question cannot be resolved and user judgment is required. If policy deterministically requires verification and the user has a current actionable obligation, use Needs You/Moment with the safe verification action. External execution remains separately authorized.

---

## A-05 — Offline “queue” wording can accidentally authorize deferred consequential effects

**Contract impact:** criteria 2 and 5; external-action authority; current Send Later posture.

Section 3.2.G says to "block/queue external actions only according to actual capability." In v1 this is underspecified and can be read as permission to silently queue an explicit Send while offline and execute it later when connectivity returns.

That would create a new durable delayed-action contract and blur explicit Send/reconciliation with deferred execution. Current Product scope treats Send Later as provider-owned/deferred.

**Required correction:** v1 may preserve drafts and pending local intent, but must not silently queue a consequential external effect for later execution unless a separately accepted durable delayed-action contract explicitly exists. Explicit Send is committed/reconciled when connectivity/provider capability is available.

---

## A-06 — Uninterpretable-source fallback must not create fake user work

**Contract impact:** criteria 2, 6, 7, 8; FIXED AI-failure/source fallback and `No Responsibility` semantics.

Sections 3.2.D and 6.13 correctly reject `AI failure -> No Responsibility`, but the phrase "source-first/review/attention fallback" remains broad enough to let processing failure become Needs You merely because the system cannot interpret a message.

**Required correction:** processing/interpretation failure alone never creates Needs You. Use:

- **Review** only when a material semantic question exists and user judgment is actually useful/required;
- **Integrity Alert** when the failure compromises a delegated monitoring promise or coverage;
- **Source/manual path** when the source is readable and no current user Responsibility has been established;
- **Needs You** only when canonical evidence establishes actionable USER work.

A system-generated request to "read this because AI failed" must not masquerade as a communication Responsibility.

---

## A-07 — Cross-thread identity is OPEN; candidate should not introduce routine merge/split Review

**Contract impact:** criterion 6; FIXED false-merge ordering; open cross-thread identity question.

Section 6.12 says Review may be used if a merge/split decision materially affects safe attention/outcome handling. The canonical decision ledger deliberately leaves cross-thread Responsibility identity OPEN and states semantic similarity is candidate retrieval, not identity authority.

Making merge/split itself a user-facing Review job implicitly promotes an unresolved identity mechanism into Product behavior.

**Required correction:** v1 fallback is conservative split plus related-context/candidate retrieval with no silent merge. Do not create a routine Review solely to ask whether two threads are "the same Responsibility" until canonical identity/user-control semantics explicitly authorize that behavior. Separate admission/field Review can still occur for independently material questions.

---

## A-08 — Mailbox disconnect is not decision-complete if only a count/scope is shown

**Contract impact:** criteria 3 and 4; destructive lifecycle control.

The candidate prefers affected count/scope over a "frightening raw list." Counts are appropriate for summary, but an intentional disconnect that stops live monitoring is consequential. A user may need to inspect which delegated loops will lose monitoring before committing.

**Required correction:** show a compact count/scope summary **plus an inspectable affected-items path** when live delegated loops will stop. Do not force a full list into the confirmation screen, but do not make the decision opaque.

---

## A-09 — Product-account deletion boundary needs an explicit release gate for privacy/legal semantics

**Contract impact:** criteria 3, 4, 9, 12.

The candidate correctly keeps exact deletion SLA, backup retention, audit retention, export, billing, etc. UNKNOWN, yet marks Product-account deletion boundary as `V1 CORE for public release`.

The Product specification can be complete while those legal/data values remain outside Product discovery, but the shipped destructive interaction cannot be decision-complete if the actual retention/deletion contract is still unknown.

**Required correction:** distinguish:

- Product-content requirement now: define the operation boundary and prohibit fabricated guarantees;
- public-release prerequisite: accepted privacy/legal/data-retention behavior must exist before final deletion copy/behavior ships.

Product Content COMPLETE must not be misread as legal/privacy readiness.

---

## A-10 — Settings IA must be capability-conditional rather than imply unavailable controls

**Contract impact:** criteria 5 and 9.

The candidate names a v1 Settings IA including Delegation and Actions & Permissions while class-scoped automatic monitoring and standing external-action authorization are post-v1/conditional.

**Required correction:** the semantic categories are acceptable as an information architecture direction, but only supported user-owned controls appear. Do not ship empty/dead sections or imply a class-autonomy/standing-action capability that v1 does not have. Minimal v1 Settings remains accounts/data, actual attention/notification controls, current delegation controls that truly exist, current action permissions, and required privacy/experience choices.

---

## A-11 — External evidence should cite final 2026 publications where available

**Contract impact:** evidence discipline; acceptance criterion 14.

The evidence file cites the 2025 arXiv preprint for `Dark Patterns Meet GUI Agents` even though the final CHI 2026 paper is published at DOI `10.1145/3772318.3791568`. It also cites the preprint for `AI, Take the Wheel` even though the ACL 2026 Findings version is now available at DOI `10.18653/v1/2026.findings-acl.422`.

**Required correction:** cite final peer-reviewed/version-of-record sources as primary evidence, with preprints optional as history. Preserve the distinction between empirical paper, standard/framework, product documentation, inference, hypothesis, and unknown.

---

## A-12 — Golden Scenario Bank needs regression cases for the corrected boundaries

**Contract impact:** criterion 10 and full-candidate verification.

The 46-case bank is broad but does not yet pin several material boundaries introduced by this audit.

**Required additions:** Product-level scenarios for at least:

1. Review auto-resolves from new trusted evidence without user action;
2. later authoritative evidence supersedes a prior field correction where canonical field authority permits, without freezing unrelated fields;
3. read/monitor permission healthy while send permission is lost (scope-local degradation);
4. user intentionally stops all monitoring (must not look like healthy all-clear);
5. cross-account similar evidence never auto-merges;
6. meeting/calendar mail does not silently grant calendar-domain truth/mutation;
7. AI draft assistance fails while manual contextual reply remains usable;
8. valid semantic `DO_NOT_TRACK / No Responsibility` after successful interpretation versus processing failure/abstention.

Update existing high-risk, zero, cross-thread, offline, and uninterpretable-source cases to encode A-02 through A-07.

---

# 3. Non-blocking findings / accepted direction

The following parts are accepted directionally and should be retained unless the batch correction reveals a contradiction:

- field-scoped user correction preserving semantic kind/provenance;
- Return Attention Now distinct from world-state/actionability;
- Stop Tracking distinct from success;
- monitoring permission distinct from consequential action permission;
- true reversibility distinguished from decorative Undo;
- scoped failure/degradation rather than one global Responsibility state;
- last-trustworthy/as-of boundaries and reconciliation before restoring reassurance;
- account sign-out vs auth loss vs intentional disconnect vs Product-account deletion;
- initial-sync unknown != zero;
- re-add after intentional disconnect does not silently resurrect old delegation;
- quiet hours affect delivery, not monitoring;
- correction history does not create standing policy;
- communication edge cases use existing Responsibility semantics instead of ontology inflation;
- Review remains sparse and routine explicit Send is contextual approval, not Review backlog;
- Product Feature Matrix remains strongly centered on the Minimum Complete Delegation Loop rather than mail-client parity;
- Product Content COMPLETE remains specification closure, not PMF/ICP/WTP/runtime validation or implementation authorization.

---

# 4. External evidence re-check used in this audit

The audit re-checked current 2025–2026 evidence including:

- Google Gmail AI Inbox / Workspace 2026: proactive task surfacing, contextual drafts, done/dismiss controls, relevant file surfacing;
- Outlook Copilot 2026: priority/explanation/customization and explicit coverage exclusions (including OOO/meeting/encrypted classes for Prioritize);
- Microsoft Cowork 2026: previewed action-specific approval, user hand-back, scoped permission patterns;
- Superhuman 2026: reminders/auto-drafts and explicit send/action confirmation/permission modes;
- Shortwave/Tasklet 2026: background email automation frontier;
- NIST AI RMF Core: post-deployment monitoring, appeal/override, incident response, recovery, change management;
- CHI 2026 `Dark Patterns Meet GUI Agents`: oversight can improve avoidance but can also create attentional tunneling, cognitive load, and reduced control; supports lightweight/contextual handoff rather than constant supervision;
- ACL 2026 `AI, Take the Wheel`: delegation and adoption/reliance are distinct decisions and both over-/under-reliance occur;
- 2026 trust-repair research: explanation/state repair can support continuance; apology alone is not sufficient recovery;
- Google/Microsoft third-party access documentation: provider permission revocation is separable from third-party Product-account deletion and may remove only capability, not third-party stored data.

Competitor/product behavior remains frontier evidence, not Lunowa truth.

---

# 5. Required correction process

1. Correct **all A-01 through A-12 as one batch**.
2. Do not change FIXED Responsibility semantics or create new aggregates/enums/tables from Product language.
3. Re-run a full acceptance audit against Issue #45 and the entire resulting cumulative candidate.
4. If another FAIL repeats the same class of issue, inspect specification/oracle/decomposition/verification gaps before another patch loop.
5. Only after semantic PASS: reconcile canonical Product/design/router artifacts, create PR, bind review evidence to exact head + Issue #45 contract version, require exact-head repository/CI pass, then merge.

Until then, **Product Content COMPLETE = NOT YET**.
