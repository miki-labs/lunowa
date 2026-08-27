# Lunowa Implementation Plan

## Status

**Active initial execution plan, reconciled with the current Product thesis and Responsibility v0.1 / L2 executable-proof gate.**

This plan sequences implementation to reduce Product and technical risk without activating production infrastructure or feature breadth before the core user problem, interaction, and domain model are sufficiently supported.

It is a living execution artifact. Durable Product truth belongs in `PRODUCT.md` and `PRODUCT-CONTENT.md`; Product-level regression consequences live in `GOLDEN-SCENARIO-BANK.md`; Responsibility semantics belong in `responsibility/`; detailed design/architecture/contracts remain in their owning sources.

Related sources:

- `PRODUCT.md`;
- `PRODUCT-CONTENT.md`;
- `GOLDEN-SCENARIO-BANK.md`;
- `research/communication-monitoring-evidence-2026-08.md`;
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

Current Product scope authorities constrain this plan. A phase may sequence a capability only after that capability is accepted for the relevant Product/task scope; a broader capability example here is never permission to override `PRODUCT.md`, `PRODUCT-CONTENT.md`, or the live Issue contract.

---

## 1. Execution principle

Build the smallest evidence-producing vertical slice that can falsify the highest-impact current assumption.

Do not implement every provider, AI feature, mailbox action, scheduler feature, design reference, and responsive edge case merely because the eventual Product may need them.

Current high-level sequence:

```text
Bootstrap
  -> Problem / ICP evidence for communication-monitoring burden
  -> Minimal comparative fake-data wedge prototype
  -> Longitudinal safe-forgetting / monitoring-relinquishment proof
  -> only then broaden the credible-client shell as Product evidence requires
  -> Responsibility persistence foundation when its Product/runtime use is justified
  -> One real provider read path
  -> Real contextual reply/send path when client ownership is justified
  -> Deterministic Responsibility reduction + Temporal Contract
  -> AI interpretation behind validated domain contracts/evals
  -> Search/context quality
  -> Second provider only when demand/evidence promotes it
  -> Beta hardening
```

These are evidence/implementation gates, not a requirement that all research work be serialized. Bounded technical spikes may run ahead when they retire a costly-to-reverse uncertainty without activating production infrastructure. The current Responsibility L2 executable proof is such a spike; it does **not** authorize production persistence or broad client implementation before Product evidence warrants it.

Key rules:

> **Prove the real user problem and smallest differentiated behavior before integration or client breadth.**

> **A polished full shell is not a substitute for evidence that users delegate monitoring and reduce self-checking.**

---

## 2. Phase 0 — Bootstrap and stack decision

### Goal

Create the smallest reproducible runtime/repository foundation supporting Product experiments and later durable background work.

### Required work

- inspect `AGENTS.md`, relevant reusable engineering docs, Product/design docs;
- choose stack deliberately;
- prefer framework/platform defaults + mature official SDKs;
- establish install/run/typecheck/lint/test/build/verify paths;
- establish environment/secrets pattern;
- establish browser/runtime inspection;
- activate persistence only when a later accepted phase requires it.

### Non-goals

No microservices, Kubernetes, vector DB, search cluster, multi-provider AI, Gmail/AI activation, or broad mail-client implementation merely because the stack supports them.

### Exit criteria

- app boots from documented command;
- verification path exists;
- trivial route renders;
- secrets/environment handling documented;
- material stack choices recorded in `TECH-STACK.md`/ADRs;
- no production credentials needed for ordinary Product experimentation.

Current repository status indicates the mechanical Phase-0 foundation already exists; repository/branch protection is a separate safety follow-up.

---

## 3. Phase 1 — Product-learning before broad client construction

### 3.1 Phase 1A — Problem / ICP evidence

#### Goal

Determine whether communication open-loop monitoring is frequent and painful enough in a reachable segment to justify a Product wedge.

#### Evidence to collect

Use recent real-workflow observation/interview rather than abstract preference questions. Look for:

- concurrent unresolved communication loops;
- external/interpersonal dependency;
- waiting duration and irregularity;
- repeated Inbox/Sent/thread self-checking;
- flags/stars/snooze/reminders/task/calendar/note workarounds;
- missed/late follow-up consequences;
- whether CRM/ATS/ticketing/project software already solves the problem;
- adoption autonomy and current switching constraints.

#### Exit / stop logic

Do not freeze an ICP from job title or email volume alone.

If repeated monitoring burden is weak, rare, already solved, or insufficiently costly in the candidate segment, narrow or reject the wedge before broad implementation.

### 3.2 Phase 1B — Minimal comparative fake-data wedge prototype

#### Goal

Test whether the current Responsibility/Moment candidate mechanism produces immediate comparative value on realistic communication scenarios without provider/AI/database breadth.

This is the implementation purpose of the current Product-validation path (#26/#28 and their live prerequisite/review state). Re-query GitHub before execution.

#### Required scenario coverage

Use a bounded set of domain-shaped fake scenarios sufficient to test the current hypotheses, including:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
multiple Responsibilities
parallel obligation-leg behavior where material
follow-up as a MY_TURN reason/action
```

Scenario evidence and expected outcomes must be deterministic enough for a fair baseline-vs-Lunowa comparison. Do not let the implementation agent invent the experimental oracle. Product-level consequences should also be checked against `GOLDEN-SCENARIO-BANK.md` where the scenario falls within that bank; Responsibility semantic truth remains owned by Responsibility oracles.

#### Minimum interaction surface

Implement only the surfaces needed to compare the wedge credibly:

- a conventional baseline inbox condition using the same underlying synthetic evidence;
- a Lunowa condition with the minimum list/conversation/Moment behavior needed by the accepted scenario oracle;
- enough source/provenance/account identity to test trust and fairness;
- desktop primary viewport plus only the compact sanity coverage required by the accepted experiment contract.

Do **not** require the full visual reference set or broad client completeness for this experiment.

#### What is specifically deferred from this gate

Unless a live accepted experiment contract requires it, do not make Phase 1B depend on:

- full compose feature completeness;
- production search;
- person-history/context product;
- account onboarding/settings breadth;
- attachment feature breadth beyond scenario evidence;
- tablet/mobile pixel fidelity;
- Gmail/Microsoft integration;
- production persistence;
- production AI;
- real send.

Existing visual references remain design direction; they are not a mandate to build all surfaces before wedge evidence.

#### Measures this phase can support

Examples:

- time-to-next-meaningful-action/state;
- navigation/decision count;
- reread/reconstruction behavior;
- immediate source rechecks;
- state/safe-action correctness;
- comprehension of Waiting/Later/Review;
- provenance/account identity errors;
- qualitative control/trust reactions after the timed task.

#### What this phase cannot prove

A single-session prototype cannot establish:

- safe forgetting over days/weeks;
- monitoring relinquishment;
- longitudinal reliability;
- switching/retention;
- willingness to pay;
- necessity of a full mail client.

### 3.3 Phase 1C — Longitudinal monitoring-offload proof

#### Goal

Test the North-Star mechanism: whether a user actually stops parallel self-monitoring when Lunowa is responsible for bringing an unresolved loop back at the right time.

#### Preferred scope

Use the smallest real or concierge setup that can observe actual waiting periods without requiring broad client implementation.

Possible candidate measures—not frozen metrics—include:

- `N_self_check` before Lunowa resurfacing;
- source-inbox fallback frequency;
- parallel manual reminder/task creation;
- correct resurfacing rate;
- material false-negative rate;
- unnecessary Review/resurfacing burden;
- context-restoration time after waiting;
- continued delegated monitoring across days/weeks.

#### Exit / stop logic

If users keep checking the original inbox “just in case,” the core offloading promise is not proven even if the immediate prototype is fast.

If reliability can only be achieved by forcing large Review/notification burden, the wedge must be revised rather than hidden behind model accuracy metrics.

### 3.4 Phase 1D — Credible client breadth only after evidence

The broader full-client design may be implemented after the wedge and Product form justify it.

Potential later surfaces include the existing 3-pane shell, compose/reply/search/context/preview/onboarding/settings/system states/responsive layouts from `docs/design/` and visual references `00`–`19`.

Do not assume all are required if a companion/overlay or hybrid proves to be the better Product form.

---

## 4. Phase 2 — Responsibility physical model + persistence foundation

### Goal

Implement the **smallest physical model** that satisfies validated Responsibility semantics and core Product ownership without building a generic workflow engine.

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

The L2 spike may run before Phase-1 Product evidence because it is an isolated falsification experiment. **Production persistence activation remains a separate Product/implementation decision and must not silently reorder the evidence sequence.**

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

Prove one real mailbox can authorize, sync, normalize, persist evidence, and render through Lunowa without AI/write breadth **after Product evidence justifies a real-inbox path**.

### Required behavior

- current official Google authorization guidance/scopes;
- ConnectedAccount creation;
- bounded initial sync + incremental/reconciliation path;
- Conversation/Message normalization;
- attachment metadata/provider observations;
- **authorized attachment evidence access sufficient for the accepted Product scope through a supported safe open/download/provider-native fallback path**;
- account-specific sync state;
- real Conversations render in current UI;
- manual refresh/reconnect;
- duplicate/out-of-order ingestion safe.

### Security/reliability

- credentials server-side;
- authorization every read;
- HTML/message/attachment content untrusted;
- provider/platform unsafe or unsupported attachment restrictions are preserved; feature parity never bypasses those protections;
- duplicate changes idempotent;
- invalid cursor/reconnect/rate-limit/transient failures handled;
- semantic chronology preserved when observed order differs.

### Historical initial sync

Do not automatically activate every old apparent open loop as My Turn. Historical Responsibility activation policy remains conservative/open until validated with real inbox distributions.

### Attachment scope gate

Phase 3 must prove the **CORE source-evidence-access job**, not universal native rendering.

- a user can reach authorized attachment evidence through the accepted safe path while retaining the relevant source/context;
- blocked/unsafe/unsupported provider content is represented truthfully rather than bypassed;
- **rich native in-app attachment preview is not a Phase-3 exit gate**;
- exact native preview formats, sandboxing, and platform behavior remain separate Product/security/usability work.

### Exit criteria

A real Gmail mailbox can be read through normalized evidence/domain boundaries without AI, and authorized source attachment evidence can be reached through the accepted safe access path without requiring rich native preview or weakening provider security restrictions.

---

## 6. Phase 4 — Real contextual reply/send

### Goal

Provide the real communication path needed to complete an active Attention loop only when the chosen Product form and accepted task scope require Lunowa to own that client behavior.

### Required behavior when this phase is authorized

- Moment/Conversation-bound Reply and Reply All for the accepted flow;
- explicit effective sender account;
- recipients/content and supported attachments visible/inspectable before Send;
- draft preservation/autosave sufficient for the accepted flow;
- durable SendOperation where required by the accepted contracts;
- explicit user Send under current v1 authority posture;
- provider send result + reconciliation;
- send failure/ambiguity preserves draft/context;
- retries/double-submit do not duplicate.

Arbitrary fresh Compose and Forward parity are **not Phase-4 exit gates** unless a later accepted Product/task contract explicitly promotes them. Provider fallback remains valid for non-core communication jobs.

### Canonical send invariant

```text
send attempt != reconciled provider acceptance
```

Even reconciled acceptance closes a Responsibility only when sending is sufficient for that operational closure condition.

### Undo Send / Send Later / delayed execution

Undo Send and Send Later parity are **not current Phase-4 requirements**.

If a future accepted Product/task contract adds delayed consequential send behavior:

- the delay must be a real pre-provider/durable execution contract, not decorative UI;
- authority over later execution must be explicit and revocable as required;
- idempotency/cancel/reconcile/recovery semantics must be defined;
- do not infer permission merely because Temporal Contract infrastructure exists;
- current v1 offline behavior must not silently queue a consequential effect for later execution.

### Exit criteria

If a client/hybrid communication path is selected for the accepted scope:

```text
read -> contextual reply/reply-all -> explicit send -> reconcile result
```

works without AI. Attachment add is an exit criterion only when the accepted Product/test scenario requires it; source attachment access remains governed by Product scope.

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

Reduce interpretation/monitoring burden without giving the model state/authorization authority.

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

AI measurably reduces interpretation/monitoring burden on canonical + holdout cases without violating critical forbidden outcomes, and core mail remains usable with AI disabled.

---

## 9. Phase 7 — Search/context quality

Start with lexical/full-text authorized search across Conversation/Message/Person/File and exact source jump/highlight **only when real usage shows it is required by the selected Product form**.

Default current Scope; explicit All broadening.

Add semantic/vector retrieval only after real queries show meaningful incremental value. Similarity remains retrieval, never Responsibility merge authority.

Person Context uses participant identity, recent Conversations, active/live Responsibilities, files, and evidence-backed remembered facts; do not make CRM.

---

## 10. Phase 8 — Microsoft/Outlook adapter

Goal: prove provider boundary without rewriting domain/UI once second-provider demand is justified.

Required when authorized:

- current official Microsoft authorization;
- normalization to existing contracts;
- sync/read/send/reply/attachments for supported behavior;
- reconnect/failure semantics;
- capability differences behind adapter boundary;
- mixed Gmail + Outlook accounts/Scopes if Product evidence requires them;
- explicit sender-account safety;
- cross-account semantic lookalikes remain separate Responsibilities initially.

Success: mostly adapter/provider-contract work, not duplicate Responsibility/search/UI implementation.

---

## 11. Phase 9 — Beta hardening

Required categories, to the extent activated by the accepted Product form:

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
- analytics for Product hypotheses;
- incident-safe disable/degraded mode for AI/automation.

Candidate Product measures:

- `N_self_check` / Re-check Rate;
- source-inbox fallback;
- parallel manual memory/reminder actions;
- correct resurfacing rate and latency;
- false-negative material obligation rate;
- unnecessary Attention/Review rate;
- context-restoration time + correctness;
- correction/undo rate;
- missed communication rate;
- Temporal Contract success/latency;
- delegated-monitoring retention/reliance across days/weeks;
- Communication Management Burden per completed outcome where measurable.

Do not optimize DAU/open frequency at the expense of the North Star; a successful offloading Product may intentionally reduce unnecessary opens.

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
- full provider parity;
- full-client surface completeness before client form is justified;
- arbitrary fresh Compose / Forward parity;
- Undo Send / Send Later parity unless separately accepted.

---

## 13. Codex task slicing

Do not give Codex `build Lunowa`.

Each non-trivial slice should specify:

- Goal / Why;
- current Source of Truth;
- exact relevant visual refs only when required by the slice;
- Scope / Non-goals;
- invariants;
- reuse requirements;
- acceptance criteria;
- verification;
- stop/escalation conditions.

Product-behavior tasks must include the relevant current `PRODUCT.md` / `PRODUCT-CONTENT.md` contract and Product Golden Scenario(s) without using Product scenarios to redefine Responsibility semantics.

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

Exercise intended behavior with the required combination of Product evidence, browser/runtime inspection, screenshot comparison, unit/domain tests, integration/provider tests, failure injection, accessibility checks, persisted-state/log inspection, and database/concurrency proof where applicable.

Never claim provider/scheduler/send/security/database behavior verified when only mocked.

Never claim safe forgetting / monitoring relinquishment verified from a single-session fake-data usability result.