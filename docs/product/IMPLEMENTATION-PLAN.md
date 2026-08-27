# Lunowa Implementation Plan

## Status

**Active execution plan, reconciled 2026-08-28 for the owner-directed Product-completion priority.**

This plan sequences implementation toward a **usable Minimum Complete Delegation Loop** while preserving unvalidated Product/market assumptions as explicit unknowns.

It is a living execution artifact. Durable Product truth belongs in `PRODUCT.md` and `PRODUCT-CONTENT.md`; Product-level regression consequences live in `GOLDEN-SCENARIO-BANK.md`; Responsibility semantics belong in `responsibility/`; detailed design/architecture/contracts remain in their owning sources.

Related sources:

- `PRODUCT.md`;
- `PRODUCT-CONTENT.md`;
- `GOLDEN-SCENARIO-BANK.md`;
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
- `CONTRACTS.md`;
- `TECH-STACK.md`;
- current live GitHub Issue/task graph.

Current Product scope authorities constrain this plan. A phase may sequence a capability only after that capability is accepted for the relevant Product/task scope; a broader capability example here is never permission to override `PRODUCT.md`, `PRODUCT-CONTENT.md`, Responsibility authority, or a live Issue contract.

---

# 1. Execution doctrine

## 1.1 Current owner priority

The current owner priority is:

> **Complete Lunowa as a usable Product first, then return to formal empirical Product Discovery with the real Product available where useful.**

This is an **execution-order decision**, not empirical evidence.

Therefore implementation may proceed against accepted Product hypotheses without waiting for Issue #36 to validate ICP/problem severity first.

The following remain explicitly **UNKNOWN** until measured:

- exact ICP / first segment;
- problem prevalence/severity;
- switching behavior;
- WTP/pricing;
- retention;
- PMF;
- reliability threshold required for users to stop parallel checking;
- whether users actually relinquish monitoring;
- mature Product-form preference.

Implementation completion must never be used as evidence that these are true.

## 1.2 Optimize for one complete vertical loop

Do **not** build Lunowa horizontally by completing every inbox, settings, provider, search, AI, and compose feature independently.

Build the smallest end-to-end path that realizes the accepted Product promise:

```text
provider/source evidence
-> normalize + persist trustworthy source state
-> interpret/admit/update Responsibility through trusted boundaries
-> decide attention / Managed / Review / Needs You
-> preserve durable temporal monitoring where needed
-> surface the right Moment with source-grounded context
-> let the user inspect/correct/defer/stop tracking
-> contextual Reply/Reply All + explicit Send when required
-> reconcile provider outcome
-> continue monitoring or close only when evidence supports closure
```

The target is **Minimum Complete Delegation Loop**, not broad provider/client parity.

## 1.3 Two separate authorization questions

Keep these distinct:

### Implementation authorization

May we build an accepted Product behavior safely against the current canonical specification?

### Empirical-claim authorization

May we claim that the behavior solves a frequent market problem, wins an ICP, changes user behavior, retains users, or supports a price?

The first may be YES while the second remains UNKNOWN.

## 1.4 Avoid both stale extremes

Do not revert to:

1. **broad fake full-client shell first** — lots of UI, no complete real delegation loop; or
2. **indefinite research/specification first** — no usable Product exists because every implementation step waits for perfect validation.

Current strategy is a complete, safety-bounded vertical Product followed by empirical correction.

---

# 2. Phase 0 — Mechanical foundation

## Status

**Mechanically established.**

Existing repository foundation includes:

- Node.js 24 / pnpm;
- strict TypeScript;
- Next.js 16 / React 19;
- next-intl;
- Tailwind CSS 4;
- lint/typecheck/test/build/verify;
- Playwright E2E smoke;
- CI Verify + E2E Smoke;
- environment/secrets pattern;
- bootstrap route/component.

This phase does not mean the Product runtime exists. Current app UI remains essentially a bootstrap proof.

---

# 3. Phase 1 — UI/UX implementation readiness

## Current authority

GitHub **Issue #55 — `[Design]: Make Lunowa v1 UI/UX implementation-ready`**.

## Goal

Convert the accepted Product/design contract into a complete implementation specification before broad write-heavy UI coding.

The implementation agent must not need to invent material Product behavior.

## Required outputs

### 3.1 Screen inventory

Account for current v1 CORE surfaces, at minimum:

- Home / Landing;
- Needs You;
- Managed;
- Review;
- Moment;
- Source Conversation;
- contextual Reply / Reply All / explicit Send path;
- one-provider connect/reconnect/onboarding surfaces required by the loop;
- capability-conditional Settings required by current Product scope;
- integrity/degraded/recovery surfaces.

### 3.2 State inventory

For every implementation-significant screen define material variants, including as applicable:

- healthy/populated;
- true zero/empty;
- initial loading/sync;
- partial/unknown;
- provider disconnected/auth lost;
- AI unavailable;
- monitoring integrity degraded;
- material Review;
- send pending/succeeded/failed/ambiguous;
- attachment unavailable/blocked/provider fallback.

### 3.3 Interaction contract

Decision-complete behavior for:

- Moment vs Source navigation;
- Managed inspection;
- Review/correction;
- Return Attention Now;
- Stop Tracking;
- Later/defer/return;
- contextual Reply/Reply All;
- explicit Send + reconciliation feedback;
- source attachment evidence access;
- reconnect/recovery;
- keyboard/focus behavior.

### 3.4 Responsive contract

One Product model across desktop/tablet/mobile/compact widths. Define what collapses, moves, becomes a detail route/sheet/drawer, and what remains always reachable.

### 3.5 Visual implementation contract

Resolve material typography, spacing, hierarchy, projection/status treatment, trust/provenance/integrity affordances, density, non-color redundancy, and motion behavior.

### 3.6 Accessibility

Make keyboard, focus, semantic labeling, contrast, reduced motion, and async status feedback testable.

### 3.7 Component + data contract map

For each material component identify:

```text
owning Product/domain projection
minimum inputs
loading/error/unknown form
source/provenance requirement
user events/actions emitted
provider evidence vs accepted state vs derived projection vs transient UI state
```

Component convenience must not create domain/schema authority.

## Exit criteria

Issue #55 receives a full cumulative acceptance audit and exact-head verification. Only then should broad implementation tasks be decomposed.

---

# 4. Phase 2 — Implementation graph and safe parallelization

## Goal

Transform the implementation-ready UI/UX + architecture/domain/provider contracts into an explicit dependency graph before launching many coding agents.

Do not give an agent `build Lunowa`.

## Required graph properties

Each node must specify:

- Goal / Why;
- exact owning sources;
- dependencies/preconditions;
- Scope / Non-goals;
- invariants;
- required fixtures/oracles;
- acceptance criteria;
- verification;
- failure/stop conditions;
- merge/integration boundary.

## Parallelization doctrine

Parallelize only tasks with genuinely separable write/runtime boundaries.

Good parallel candidates may include, after contracts are stable:

- UI component primitives independent from runtime authority;
- provider adapter spike vs deterministic domain reducer tests;
- accessibility/visual acceptance harness;
- independent executable L2 proof work;
- failure-state UI fixtures;
- read-only provider normalization tests.

Avoid parallel branches that independently redefine:

- Responsibility semantics;
- shared schema;
- provider contract;
- send authority;
- Temporal Contract semantics;
- canonical Product state.

Every parallel wave needs an integration owner/oracle.

## Exit criteria

- dependency DAG exists;
- critical path is explicit;
- merge order is explicit;
- high-conflict/shared-authority tasks are serialized;
- first implementation wave is small enough for full independent audit.

---

# 5. Phase 3 — Responsibility executable persistence gate

## Goal

Activate only the physical persistence required for the complete loop, without weakening accepted Responsibility semantics.

## Current proof state

```text
L0 semantic model                         FROZEN v0.1
L1 logical persistence boundary           FROZEN v0.1
L2 exact PostgreSQL/Drizzle candidate      v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 production migrations/runtime           NOT AUTHORIZED until L2 gate passes
```

## Required pre-migration proof

Before production Responsibility migrations are accepted:

1. complete Issue #13 against real PostgreSQL 18;
2. complete Issue #14 for Better Auth UUID persistence prerequisite;
3. complete Issue #15 independent combined review;
4. account for required acceptance IDs in `responsibility/L2-EXECUTABLE-PROOF-GATE.md`;
5. inspect actual Drizzle-generated/reviewed SQL;
6. leave no unresolved CRITICAL/HIGH integrity blocker;
7. update canonical DDL if executable evidence falsifies it;
8. record explicit L2 PASS/FREEZE before L3 migration integration.

Product-completion priority does **not** waive this gate.

## Minimum persistence responsibilities when activated

Only what the vertical loop requires, potentially including:

- User;
- Scope / ScopeAccount;
- ConnectedAccount / ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- Responsibility;
- provenance/correction evidence;
- TemporalContract / TemporalTrigger skeleton;
- Draft;
- SendOperation skeleton.

Do not build a generic workflow engine.

---

# 6. Phase 4 — One-provider Gmail source/read vertical slice

## Goal

Prove one real mailbox can authorize, sync, normalize, persist trustworthy evidence, and render Source Conversations.

Issue #36 is **not** a prerequisite for this phase under the current owner-directed product-completion plan.

## Required behavior

- current official Google authorization/scopes rechecked at implementation time;
- ConnectedAccount creation;
- bounded initial sync;
- incremental/history reconciliation;
- Conversation/Message normalization;
- attachment metadata/provider observations;
- authorized source attachment evidence access through a supported safe open/download/provider-native fallback path;
- account-specific sync state;
- duplicate/out-of-order ingestion safety;
- manual refresh/reconnect;
- real source rendering.

## Security/reliability invariants

- credentials server-side;
- authorization on reads;
- provider payloads/HTML/attachments untrusted;
- provider/platform unsafe-content restrictions preserved;
- duplicate changes idempotent;
- invalid cursor/reconnect/rate-limit/transient failure handled;
- source chronology/evidence preserved truthfully.

## Historical activation boundary

Initial sync must not automatically convert every old message/thread into a live Responsibility merely because it looks unfinished.

## Exit criteria

A real Gmail mailbox can be read through accepted provider/evidence boundaries and source attachment evidence can be reached safely without requiring rich native preview.

---

# 7. Phase 5 — Deterministic Responsibility + attention + Temporal Contract runtime

## Goal

Make the differentiated monitoring loop work deterministically before AI interpretation becomes a dependency.

## Required behavior

- Responsibility admission/identity/effects boundary;
- `TRACK / DO_NOT_TRACK / NEEDS_REVIEW` behavior where applicable;
- zero Responsibility valid;
- canonical orthogonal state dimensions;
- field-scoped correction;
- live tracking separate from resolution;
- Needs You / Managed / Review / Later / Done projection rules;
- intentional defer -> durable Temporal Contract;
- passive Waiting after user leg completion where another dependency remains;
- expected events;
- follow-up return;
- completion criteria;
- REOPEN vs new episode;
- historical live-activation policy;
- durable time/reply/deadline triggers where included;
- trigger reconciliation/idempotency;
- provenance/evidence revision;
- source-grounded Moment projection.

## Mandatory verification

Use canonical Responsibility transition/scenario oracles, including races/restarts/stale triggers/parallel obligations/out-of-order evidence where applicable.

## Exit criteria

A deterministic fixture or trusted manually admitted real case can be:

```text
tracked
-> safely Managed
-> returned at an expected event/time/material change
-> surfaced as Needs You/Review when justified
-> explained by source-grounded Moment
-> corrected/deferred/stopped by the user
```

without AI authority.

---

# 8. Phase 6 — Product surfaces on the real domain loop

## Goal

Implement the Issue #55 accepted UI/UX against real domain interfaces rather than static lifecycle-shaped mock state.

## Core surfaces

- Home / Landing;
- Needs You;
- Managed;
- Review;
- Moment;
- Source Conversation;
- required onboarding/reconnect/settings/integrity states.

## Critical semantics

- Needs You means current USER work;
- Managed means healthy quiet monitoring;
- current surfaced Review is excluded from healthy Managed reassurance/count;
- true zero requires no Needs You + no surfaced unresolved Review + trustworthy relevant integrity;
- Source remains available and does not require Moment;
- mailbox unread/archive state does not redefine Responsibility state;
- failure/integrity is not a fake Responsibility state.

## Verification

Map UI consequences to `GOLDEN-SCENARIO-BANK.md` and relevant Responsibility oracles. Add design-specific tests without creating new domain truth.

---

# 9. Phase 7 — Contextual Reply / Reply All + explicit Send

## Goal

Provide the communication path required to complete an active attention loop.

## Current v1 scope

Required when the accepted vertical loop needs it:

- Moment/Conversation-bound Reply and Reply All;
- explicit effective sender account;
- visible/inspectable recipients/content;
- supported reply attachment add only where current Product scope/test requires it;
- draft preservation/autosave sufficient for the flow;
- explicit user Send;
- durable SendOperation where required;
- provider result + reconciliation;
- ambiguous/failure state preserves draft/context;
- retry/double-submit idempotency.

Not current exit gates unless separately promoted:

- arbitrary fresh Compose parity;
- Forward parity;
- Undo Send parity;
- Send Later parity.

## Canonical invariant

```text
send attempt != provider-reconciled acceptance
```

Even provider-reconciled acceptance closes a Responsibility only when it actually proves its completion condition.

## Offline boundary

v1 must not silently queue a consequential external effect for later execution without a separately accepted durable delayed-action contract.

---

# 10. Phase 8 — Bounded AI interpretation

## Goal

Reduce interpretation burden while keeping model output outside state/authorization authority.

## Required behavior

- versioned structured interpretation contract;
- authorized context builder;
- one initial evaluated model/provider;
- Structured Outputs/application validation;
- evidence revision/basis handling;
- communication act/claim/temporal/uncertainty extraction as accepted;
- trusted admission/identity/reducer consumes validated candidate output;
- no privileged provider action directly from model output;
- fallback/source usability with AI unavailable.

## Eval requirements

Use canonical Responsibility corpus + transition/contrast/mutant/metamorphic/high-harm/ambiguity/holdout cases at the appropriate layer.

Track layered correctness rather than one aggregate accuracy score.

## Exit criteria

AI reduces manual interpretation on the accepted loop without violating forbidden outcomes or becoming necessary for basic source access/manual communication.

---

# 11. Phase 9 — Failure, reconnect, integrity, recovery closure

## Goal

Make the complete loop trustworthy when dependencies fail.

## Must cover

- provider auth loss;
- provider sync lag/failure;
- reconnect/resync;
- partial/unknown state;
- AI unavailable;
- scheduler/Temporal trigger failure/overdue recovery;
- send failure/ambiguity/reconciliation;
- source attachment blocked/unavailable/fallback;
- monitoring-integrity degradation;
- stale evidence/revision races;
- user correction after automation/model error.

No failure should create fake Needs You, fake `No Responsibility`, or false healthy reassurance.

---

# 12. Phase 10 — Minimum Complete Delegation Loop acceptance

## Goal

Prove the Product works as one coherent system, not a pile of separately completed features.

## Required end-to-end acceptance shape

At least representative cases must demonstrate:

```text
real provider evidence
-> accepted/inspectable Responsibility decision
-> quiet Managed monitoring
-> durable wait/expected event where applicable
-> material change/time/reply
-> correct return to user
-> source-grounded Moment
-> safe user action/correction/defer/stop
-> contextual communication when required
-> send/provider reconciliation
-> continued monitoring or evidence-supported closure
-> recoverable degraded behavior
```

Also prove negative/control cases:

- `No Responsibility`;
- high-risk source content that does not automatically become Review;
- reply that does not satisfy awaited outcome;
- source available while AI is down;
- provider/integrity failure that prevents false all-clear;
- blocked attachment access that is represented truthfully;
- ambiguous send that does not duplicate or falsely close;
- cross-account lookalikes remain separate.

## Completion definition

The loop is not complete because code exists, tests are green, or screenshots look good.

Require the accepted combination of:

- unit/domain tests;
- database/runtime tests where applicable;
- provider integration evidence;
- browser/E2E verification;
- failure injection;
- accessibility checks;
- persisted-state/log inspection;
- exact-head CI;
- full cumulative independent acceptance audit.

---

# 13. Phase 11 — Beta / early-access hardening

Required categories to the extent activated by the accepted Product form:

- OAuth/token/storage security;
- account disconnect/deletion behavior;
- sync reconciliation/health;
- scheduler health/overdue recovery;
- send idempotency/ambiguous reconciliation;
- migrations/backups/restore;
- support/audit evidence;
- AI regression pipeline;
- cost/usage bounds;
- privacy/retention;
- responsive/browser/accessibility verification;
- analytics needed for later Product hypotheses;
- incident-safe disable/degraded mode.

Do not expand provider/client breadth merely to look complete.

---

# 14. Empirical Product validation lane — deferred in execution order, not removed

GitHub Issue #36 remains open.

Once a usable Product exists—or sooner if the owner explicitly reprioritizes fieldwork—run empirical Product Discovery without promoting implementation facts into market facts.

Later evidence should test at minimum:

- actual repeated monitoring burden;
- real current alternatives/workarounds;
- whether users delegate monitoring;
- `N_self_check` / source fallback after delegation;
- material false negatives;
- unnecessary Review/attention burden;
- context-restoration cost;
- willingness to continue/pay;
- retention;
- acquisition/segment reachability.

If valid evidence weakens/falsifies the wedge, change the Product even if implementation already exists.

Issue #26/#28 may still be useful as bounded mechanism experiments, but they are not automatically the current Product-completion critical path.

---

# 15. Deferred breadth

Do not let these delay the complete loop unless separately accepted evidence/task scope promotes them:

- graph/tree conversation visualization;
- complex calendar Product;
- CRM pipelines;
- generic automation/workflow builder;
- multi-agent user-facing architecture;
- multiple AI provider fallback;
- native apps;
- advanced analytics dashboard;
- team/shared mailbox collaboration;
- custom search infrastructure before need;
- full provider parity;
- full-client surface completeness;
- arbitrary fresh Compose / Forward parity;
- Undo Send / Send Later parity;
- second provider before the first provider loop is complete;
- full attachment-content semantic understanding;
- rich native preview parity across all formats.

---

# 16. Search/context expansion

Start with exact/source navigation and authorized PostgreSQL lexical/full-text capabilities only when the complete loop needs them.

Add semantic/vector retrieval only after actual use demonstrates incremental value. Similarity remains retrieval, never Responsibility identity/merge/permission authority.

Person/context views must not silently become CRM/product-domain ownership.

---

# 17. Second provider

Microsoft/Outlook comes only after the one-provider loop is genuinely complete and current demand/evidence or explicit owner scope justifies it.

Success means adapter/provider-contract work, not a duplicate Responsibility/UI implementation.

Cross-account semantic lookalikes remain separate Responsibilities initially.

---

# 18. Codex / agent task slicing

Never issue `build Lunowa` as one task.

Each non-trivial task must include:

- Goal / Why;
- current task contract;
- exact owning sources;
- dependencies;
- Scope / Non-goals;
- invariants;
- required reuse;
- fixtures/oracles;
- acceptance criteria;
- verification;
- stop/escalation conditions;
- durable completion evidence.

Product-behavior tasks must reference relevant `PRODUCT.md` / `PRODUCT-CONTENT.md` + Product Golden Scenario consequences without using Product UI scenarios to redefine Responsibility semantics.

Responsibility-domain tasks must route to Responsibility canonical authorities and executable oracles.

UI tasks must route to the accepted Issue #55 outputs; implementation agents must not invent material screen/state behavior ad hoc.

---

# 19. Repository update timing

This plan is a living execution artifact. Update it—or the more specific owning Issue/router—when a material accepted change occurs to:

- critical path/owner priority;
- phase ordering/dependencies;
- implementation scope/non-goals;
- a technical gate;
- a blocker/unblocker;
- Product scope relevant to sequencing;
- integration/completion evidence.

Do not rewrite this file for tentative brainstorming or ordinary chat. The test is whether a future execution agent would act incorrectly if the durable update were omitted.

---

# 20. Universal completion discipline

A phase is not complete because code exists, build passes, or tests are green.

Independent review must audit the **current task contract + entire final cumulative candidate**, not only the latest patch.

On FAIL, finish the audit and batch all known material blockers before correction except immediate security/data-loss/destructive-risk cases.

On repeated correction failure, analyze preventable gaps in specification, test oracle, architecture, task decomposition, or verification process before another patch loop.

Never claim provider/scheduler/send/security/database behavior verified when only mocked.

Never claim monitoring relinquishment, ICP, WTP, retention, or PMF from implementation completion alone.
