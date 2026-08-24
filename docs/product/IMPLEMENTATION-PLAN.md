# Lunowa Implementation Plan

## Status

**Active initial execution plan, reconciled with Responsibility v0.1 and the current L2 executable-proof gate.**

This plan sequences implementation to reduce product/technical risk without activating production infrastructure or feature breadth before the core interaction/domain model is proven.

It is a living execution artifact. Durable semantics belong in `docs/product/responsibility/`, design, architecture, data-model, contracts, and ADRs.

Related sources:

- `../design/DESIGN.md`;
- `../design/INTERACTIONS.md`;
- `../design/RESPONSIVE.md`;
- `responsibility/README.md`;
- `responsibility/DECISIONS.md`;
- `responsibility/CONSISTENCY-AUDIT.md`;
- `responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md`;
- `responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md`;
- `responsibility/L2-EXECUTABLE-PROOF-GATE.md`;
- `ARCHITECTURE.md`;
- `DATA-MODEL.md`;
- `CONTRACTS.md`.

---

## 1. Execution principle

Build vertical slices that can be behaviorally/visually verified.

Do not implement every provider, AI feature, mailbox action, scheduler feature, and responsive edge case at once.

Current high-level product sequence:

```text
Bootstrap
  -> High-fidelity fake-data product shell using Responsibility projections
  -> Responsibility persistence foundation
  -> One real provider read path
  -> Real compose/send path
  -> Deterministic Responsibility reduction + Temporal Contract
  -> AI interpretation behind validated domain contracts/evals
  -> Search/context quality
  -> Second provider
  -> Beta hardening
```

Bounded technical spikes may run ahead of their production phase when they retire a costly-to-reverse uncertainty without activating production infrastructure. The current Responsibility L2 executable proof is such a spike; it does **not** authorize production persistence before the relevant product/phase gates.

Key rule:

> **Prove the user experience, semantic oracles, and core domain contracts before integration breadth.**

---

## 2. Phase 0 — Bootstrap and stack decision

### Goal

Create the smallest reproducible runtime/repository foundation supporting canonical UI and later durable background work.

### Required work

- inspect `AGENTS.md`, relevant reusable engineering docs, product/design docs;
- choose stack deliberately;
- prefer framework/platform defaults + mature official SDKs;
- establish install/run/typecheck/lint/test/build/verify paths;
- establish environment/secrets pattern;
- establish browser/runtime inspection;
- activate persistence only when Phase 2 requires it.

### Non-goals

No microservices, Kubernetes, vector DB, search cluster, multi-provider AI, Gmail/AI activation merely because the stack supports them.

### Exit criteria

- app boots from documented command;
- verification path exists;
- trivial route renders;
- secrets/environment handling documented;
- material stack choices recorded in `TECH-STACK.md`/ADRs;
- no production credentials needed for ordinary UI development.

Current repository status indicates the mechanical Phase-0 foundation already exists; repository/branch protection is a separate safety follow-up.

---

## 3. Phase 1 — High-fidelity fake-data product shell

### Goal

Validate the interaction/visual model without coupling UI construction to provider/AI complexity.

### Primary visual references

Use `00`–`02` for global brand/component/shell, then relevant state/feature references `03`–`19`.

Historical filenames such as `moment-action-required`, `moment-deferred`, and `moment-follow-up` are **visual filenames**, not canonical domain lifecycle enums. Read `docs/design/references/README.md` before implementation.

### Required behavior

#### Shell

- desktop 3-pane layout;
- resizable panes with safe min/max;
- persistent local pane widths;
- normal row click -> `会話`;
- Responsibility/status chip -> `今の要点`;
- stable selection/context.

#### Conversation list

- person/topic hierarchy;
- projection/status chip;
- unread/pin/account treatment;
- representative long/short data.

#### Detail

- thread timeline;
- readable long mail;
- quote/signature treatment;
- attachment cards;
- reply composer.

#### Moment View

Implement fake domain-shaped scenarios for:

```text
MY_TURN
LATER
WAITING
DONE
REVIEW
multiple Responsibilities
parallel obligation-leg behavior where useful
follow-up as a MY_TURN reason/action
```

Do not recreate a canonical `FOLLOW_UP`, `DEFERRED`, or `ACTION_REQUIRED` lifecycle enum in UI fixtures.

#### Compose/supporting surfaces

New message, From/To/Cc/Bcc/subject/body/attachments/formatting/autosave/minimize, search, person context, preview, menus, Scope/account, onboarding, settings, system states, responsive layouts.

### Fixture constraint

Use domain-shaped fake fixtures through a repository/interface boundary. Fake state should reflect the **projection semantics** needed by UI while avoiding premature assumptions about final SQL schema.

### Visual verification

Run the real app, capture target viewports, compare hierarchy/component placement, and verify interactions separately from static screenshot matching.

### Exit criteria

- canonical views are representable;
- list→conversation and chip→Moment interactions are clear;
- one primary Moment persists with multiple Responsibilities;
- Review/safe-action behavior can be demonstrated;
- compose/search/context/preview preserve context;
- responsive behavior works;
- no real provider/AI required.

### Stop condition

If real rendered interaction hierarchy is materially confusing, change design/spec before expensive integration.

---

## 4. Phase 2 — Responsibility physical model + persistence foundation

### Goal

Implement the **smallest physical model** that satisfies validated Responsibility semantics and core product ownership without building a generic workflow engine.

### Current design/proof state

```text
L0 semantic model                         FROZEN v0.1
L1 logical persistence boundary           FROZEN v0.1
L2 exact PostgreSQL/Drizzle candidate      v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 production migrations/runtime           NOT AUTHORIZED
```

All 44 Tier-0 base cases are fully layered and all 20 mandatory transition traces are designed. Three exact-DDL static adversarial audits have already been incorporated into v0.4.

The remaining pre-migration uncertainty is executable PostgreSQL/Drizzle/Auth behavior, not more speculative semantic-table design.

### Current pre-implementation proof gate

Before a production Responsibility migration is accepted:

1. complete GitHub Issue #13 against real PostgreSQL 18 for the Drizzle/schema acceptance matrix;
2. complete GitHub Issue #14 for the Better Auth UUID persistence prerequisite;
3. run GitHub Issue #15 as an independent combined review;
4. account for all acceptance IDs `01–60` under `responsibility/L2-EXECUTABLE-PROOF-GATE.md`;
5. inspect actual Drizzle-generated/reviewed SQL rather than trusting TypeScript types;
6. leave no unresolved CRITICAL/HIGH schema-integrity finding;
7. if executable evidence changes v0.4, update the canonical DDL design and rerun all affected tests;
8. record an explicit L2 PASS/FREEZE decision before any production migration task.

The L2 spike may run before Phase-1 UI completion because it is an isolated falsification experiment. **Production persistence activation remains a separate implementation decision and must not silently reorder the product sequence.**

### Minimum broader entities when production persistence activates

- User;
- Scope / ScopeAccount;
- ConnectedAccount / ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- Responsibility;
- provenance/correction mechanism;
- TemporalContract / TemporalTrigger skeleton;
- Pin;
- Draft;
- SendOperation skeleton.

### Responsibility semantic requirements

The physical representation must support, only as needed by validated scenarios:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
field-level uncertainty/risk
provenance/evidence revision
composite effects where one event touches multiple Responsibilities
AdmissionReview before Responsibility existence is accepted
```

Do not assume each bullet requires a table. L1 already freezes the accepted hybrid boundary; a new table/aggregate now requires executable/production evidence that falsifies it.

### Required database/runtime proof

The exact schema/protocol must demonstrate at minimum:

- one Conversation -> zero/one/many Responsibilities;
- zero Responsibility valid;
- multiple obligation legs where required;
- historical evidence-relative OPEN != live tracking activation;
- Pin independent;
- provider IDs unique per account;
- field-scoped correction/authority without whole-item freeze;
- derived Conversation projection rebuildable;
- Responsibility mutations through domain/reducer boundary;
- Conversation semantic-evidence revision guards admission/matching freshness;
- stale evidence/AI basis cannot create or overwrite accepted state;
- global semantic application/effect idempotency prevents duplicate CREATE even with different generated target UUIDs;
- cross-account semantic auto-merge prohibited;
- same-user/account/Responsibility references are mechanically constrained where PostgreSQL can cheaply enforce them;
- conflict temporal candidates coexist while duplicate accepted-current facts are rejected;
- delete/privacy order is proven against the actual FK graph.

### Exit criteria

For the L2 design-proof substage:

- Issues #13/#14 provide direct executable evidence;
- Issue #15 independently records PASS/FREEZE or FAIL/REVISE;
- generated SQL and actual PostgreSQL behavior are reviewed;
- exact schema has no unresolved required acceptance failure;
- L3 remains a separate later task.

For the production Phase-2 implementation itself:

- UI domain interfaces can be backed by DB repositories without semantic rewrite;
- reproducible reviewed migrations exist;
- ownership/uniqueness constraints are enforced;
- representative reducer/domain tests are built from canonical oracles;
- no old lifecycle model is introduced as canonical truth;
- no provider integration bypasses the domain boundary.

### Stop conditions

Do not create/accept production migrations if:

- the L2 executable gate has not passed;
- Better Auth actual ID type conflicts with the DDL assumption;
- Drizzle emission weakens a required PostgreSQL invariant without an explicitly accepted fallback;
- a failing executable test reveals an unresolved L1 falsifier;
- passing requires production credentials or irreversible external state.

---

## 5. Phase 3 — Gmail read-only vertical slice

### Goal

Prove one real mailbox can authorize, sync, normalize, persist evidence, and render through Lunowa without AI/write breadth.

### Required behavior

- current official Google authorization guidance/scopes;
- ConnectedAccount creation;
- bounded initial sync + incremental/reconciliation path;
- Conversation/Message normalization;
- attachment metadata/provider observations;
- account-specific sync state;
- real Conversations render in current UI;
- manual refresh/reconnect;
- duplicate/out-of-order ingestion safe.

### Security/reliability

- credentials server-side;
- authorization every read;
- HTML/message content untrusted;
- duplicate changes idempotent;
- invalid cursor/reconnect/rate-limit/transient failures handled;
- semantic chronology preserved when observed order differs.

### Historical initial sync

Do not automatically activate every old apparent open loop as My Turn. Historical Responsibility activation policy remains conservative/open until validated with real inbox distributions.

### Exit criteria

A real Gmail mailbox can be read through normalized evidence/domain boundaries without AI.

---

## 6. Phase 4 — Real compose/reply/send

### Goal

Make Lunowa a credible minimal client for one provider.

### Required behavior

- compose/reply/reply-all/forward;
- explicit sender account;
- recipients/subject/body/attachments;
- draft autosave;
- durable SendOperation as needed;
- provider send result + reconciliation;
- send failure/ambiguity preserves draft/context;
- retries/double-submit do not duplicate.

### Canonical send invariant

```text
send attempt != reconciled provider acceptance
```

Even reconciled acceptance closes a Responsibility only when sending is sufficient for that operational closure condition.

### Undo / Send Later

Undo Send uses real pre-provider delay semantics. Send Later reuses durable scheduling principles rather than creating a second unreliable scheduler.

### Exit criteria

```text
read -> compose/reply -> attach -> send -> reconcile result
```

works without AI.

---

## 7. Phase 5 — Deterministic Responsibility reducer + Temporal Contract

### Goal

Implement differentiated domain behavior using deterministic/manual fixtures before AI quality becomes a dependency.

### Required behavior

- Responsibility admission/identity/effects reducer;
- canonical orthogonal state dimensions;
- Conversation aggregate projection;
- field-scoped user correction;
- intentional defer -> `LATER` + durable TemporalContract;
- passive Waiting after user leg completion when other work remains;
- follow-up trigger -> actionable USER follow-up within same Responsibility;
- hold vs defer vs cancellation distinction;
- conditional activation relation;
- completion criteria;
- REOPEN vs new episode;
- supersede old + create replacement effect set;
- historical live activation behavior;
- durable TIME/reply/deadline triggers as included;
- overdue reconciliation/idempotent fire;
- audit/provenance;
- `今の要点` derived from actual domain projection.

### Required failure/transition tests

Use `responsibility/TRANSITION-ORACLES.md` as semantic truth, including:

- restart before/after trigger;
- duplicate trigger;
- contract version race;
- reply/time race;
- stale trigger;
- send ambiguity/reconciliation;
- out-of-order ingestion;
- stale AI basis placeholder path;
- parallel obligations;
- conditional activation;
- historical activation.

### Exit criteria

A real persisted promise such as:

> `8月27日 9:00に戻します。返信が先に来れば、その時点で再確認します。`

can be demonstrated end-to-end with evidence explaining why projection changed.

### Stop condition

Do not activate AI-powered automatic attention/hiding before deterministic reduction + Temporal Contract reliability is proven.

---

## 8. Phase 6 — AI interpretation behind validated domain contracts

### Goal

Reduce interpretation burden without giving the model state/authorization authority.

### Required work

- versioned structured interpretation schema based on `CONTRACTS.md`;
- authorized context builder;
- one initial evaluated model/provider;
- schema/runtime/source/provenance validation;
- `basis_evidence_revision` handling;
- communication acts/claims/temporal expressions/uncertainty extraction;
- deterministic admission/identity/reducer consumes validated candidates;
- high-risk safety/actionability boundary;
- no privileged provider action from model output;
- core fallback when AI unavailable.

### Eval corpus

Do **not** replace the canonical responsibility corpus with a tiny happy-path list.

Use:

- Tier-0 base/critical oracles;
- 20 transition oracles at the owning test layer;
- mandatory contrasts;
- semantic mutants;
- typo/IME metamorphic variants;
- high-harm forbidden outcomes;
- ambiguity/user-dependent cases;
- sealed holdout and later organic/production regressions.

Track layered metrics rather than one accuracy number:

```text
zoning
communication-act/claim extraction
admission
identity/effects
obligation/actionability
temporal facts
resolution safety
provenance
safe-action policy
projection
run stability
metamorphic invariance/sensitivity
```

### Automation policy

Initial rollout remains conservative:

- AI interprets/proposes;
- accepted state changes go through trusted reducer/safety policy;
- user correction remains available;
- active material obligations are not hidden from unsupported inference;
- passive waiting automation may be expanded only with evidence;
- model confidence/consensus never alone authorizes high-impact action.

### Exit criteria

AI measurably reduces interpretation burden on canonical + holdout cases without violating critical forbidden outcomes, and core mail remains usable with AI disabled.

---

## 9. Phase 7 — Search/context quality

Start with lexical/full-text authorized search across Conversation/Message/Person/File and exact source jump/highlight.

Default current Scope; explicit All broadening.

Add semantic/vector retrieval only after real queries show meaningful incremental value. Similarity remains retrieval, never Responsibility merge authority.

Person Context uses participant identity, recent Conversations, active/live Responsibilities, files, and evidence-backed remembered facts; do not make CRM.

---

## 10. Phase 8 — Microsoft/Outlook adapter

Goal: prove provider boundary without rewriting domain/UI.

Required:

- current official Microsoft authorization;
- normalization to existing contracts;
- sync/read/send/reply/attachments for supported v1 behavior;
- reconnect/failure semantics;
- capability differences behind adapter boundary;
- mixed Gmail + Outlook accounts/Scopes;
- explicit sender-account safety;
- cross-account semantic lookalikes remain separate Responsibilities initially.

Success: mostly adapter/provider-contract work, not duplicate Responsibility/search/UI implementation.

---

## 11. Phase 9 — Beta hardening

Required categories:

- OAuth/token/storage security;
- account deletion/removal;
- sync reconciliation/health;
- scheduler health/overdue recovery;
- send idempotency/ambiguous reconciliation;
- migrations/backups/restore for Lunowa state;
- support/audit evidence;
- AI regression pipeline;
- cost/usage bounds;
- privacy/retention;
- responsive/browser/accessibility verification;
- analytics for product hypotheses;
- incident-safe disable/degraded mode for AI/automation.

Candidate product measures:

- Attention Recall Rate;
- Unnecessary Attention Rate;
- Re-check Rate;
- manual memory actions;
- processing time + correctness;
- source/original-view rate;
- correction/undo rate;
- missed communication rate;
- Temporal Contract success/latency;
- Communication Management Burden per completed outcome where measurable.

---

## 12. Feature deferrals

Do not let these delay core validation:

- graph/tree conversation visualization;
- complex calendar product;
- CRM pipelines;
- generic automation/workflow builder;
- multi-agent user-facing architecture;
- multiple AI provider fallback;
- native apps;
- advanced analytics dashboard;
- team/shared mailbox collaboration without demand;
- custom search infrastructure before need;
- full provider parity.

---

## 13. Codex task slicing

Do not give Codex `build Lunowa`.

Each non-trivial slice should specify:

- Goal / Why;
- current Source of Truth;
- exact relevant visual refs;
- Scope / Non-goals;
- invariants;
- reuse requirements;
- acceptance criteria;
- verification;
- stop/escalation conditions.

Responsibility-domain tasks must explicitly point to:

```text
docs/product/responsibility/README.md
DECISIONS.md
CONSISTENCY-AUDIT.md
relevant SCENARIO/TRANSITION oracles
```

and must not infer a lifecycle enum from legacy visual filenames.

Complex/high-risk tasks should use the Issue-driven handoff plus a repository-local artifact only when that artifact materially reduces guessing. The current L2 proof uses Issues #13/#14/#15 and `responsibility/L2-EXECUTABLE-PROOF-GATE.md`.

---

## 14. Completion definition per phase

A phase is not complete because code exists/build passes/tests are green.

Exercise intended behavior with the required combination of browser/runtime inspection, screenshot comparison, unit/domain tests, integration/provider tests, failure injection, accessibility checks, persisted-state/log inspection, and database/concurrency proof where applicable.

Never claim provider/scheduler/send/security/database behavior verified when only mocked.

---

## 15. Current next work

### Product implementation

The first product slice remains:

> implement the canonical `00`–`02` desktop shell using fake domain-shaped data with `row body -> 会話` and `status/projection chip -> 今の要点`, then implement the projection-specific Moment visuals before real mailbox/AI integration.

When `03`–`08` images are used, translate their legacy filenames into current projections using `docs/design/references/README.md`.

### Parallel bounded technical proof

The currently authorized persistence work is **not production Phase-2 implementation**. It is the bounded L2 falsification sequence:

```text
Issue #13 PostgreSQL/Drizzle executable proof
Issue #14 Better Auth UUID proof
Issue #15 independent combined review/freeze decision
```

Do not proceed from these spikes directly into migrations without a separate post-PASS task.