# Lunowa Minimum Complete Delegation Loop — Implementation Graph

## Status / authority

**Issue #58 final-candidate dependency and activation authority. Reconciled 2026-08-28 after repeated full acceptance audits.**

This graph translates accepted Product / Responsibility / UI / architecture contracts into executable work. It does **not** redefine Product semantics, Responsibility semantics, empirical Product claims, or provider facts.

After merge, this file + live GitHub Issues own implementation dependency/parallelization questions.

Primary authorities:

- `PRODUCT.md`, `PRODUCT-CONTENT.md`, `GOLDEN-SCENARIO-BANK.md`;
- `../design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design files;
- `responsibility/` semantic/persistence oracles;
- `ARCHITECTURE.md`, `CONTRACTS.md`, `TECH-STACK.md`;
- `research/issue-58-implementation-graph-evidence-2026-08-28.md`;
- live GitHub Issue/PR/CI state.

## 1. Target

Build the smallest real one-provider loop that proves:

```text
real Gmail evidence
-> trustworthy Source state
-> accepted Responsibility state
-> quiet Managed monitoring
-> durable reconsideration
-> correct return to Needs You / Review
-> source-grounded Moment
-> contextual Reply / Reply All
-> bounded contextual AI draft with manual fallback
-> explicit immediate Send
-> provider reconciliation
-> Responsibility re-evaluation
-> truthful healthy/degraded integrity
```

Current CORE retrieval also includes authorized exact Source search and authorized attachment evidence access.

Not current prerequisites: Microsoft, broad multi-account Scope UX, Person/CRM, Pin, generic Compose/Forward parity, Send Later/generic Undo, rich native attachment preview, natural-language Search, autonomous Send, or a generic workflow engine.

## 2. Parallelization classes

- `SERIAL_GATE` — downstream work may not bypass the shared/security/semantic authority.
- `PARALLEL_SAFE` — execution and merge ownership are isolated.
- `PARALLEL_AFTER_CONTRACT` — execution may fan out only after the named interface/oracle freezes.
- `PARALLEL_EXECUTION_SERIAL_MERGE` — isolated work may run concurrently, but shared repository assets must merge one at a time.
- `INTEGRATION_GATE` — cumulative vertical-loop acceptance.
- `RELEASE_GATE` — public-release obligation, not local/private complete-loop prerequisite.

### 2.1 Parallel execution != parallel merge

`package.json` and `pnpm-lock.yaml` are repository-wide serialized merge assets.

If two concurrent tasks touch either file:

1. they may execute in isolated worktrees/runtime namespaces;
2. their PRs must merge serially;
3. every later PR refreshes/rebases onto the latest accepted main;
4. regenerate the lockfile using pnpm rather than hand-merging it;
5. rerun repository verification;
6. rerun any task proof whose dependency graph/version basis changed materially.

The same rule applies to another shared root/config asset when a task proves it is a real collision zone. Worktree/runtime isolation alone does not establish merge independence.

## 3. Single-writer collision zones

| Collision zone | Single owner / merge order |
|---|---|
| framework security baseline | G00 |
| root dependency manifest/lockfile | serial merge across actual writers |
| Better Auth User/session schema | P14 proof -> G10 |
| provider-neutral evidence schema | P13 prerequisite proof -> G19 |
| Gmail OAuth/watch/history adapter | G20 consumes G19 |
| AIInterpretationRun minimal production prerequisite | G30 prelude; runtime activation G70 |
| Responsibility physical schema | P13/P14 -> P15 -> G30 |
| Responsibility reducer / accepted state | G31 |
| Temporal intent/currentness | G32 |
| central Product read models | G40 over G11/G21/G31/G32 |
| Draft + initial SendOperation schema | G50 |
| provider dispatch/reconciliation transitions | G51 |
| root shell/global design tokens | G11; final fidelity after V01 |
| shared real-provider E2E fixtures | G80 |

Parallel tasks may consume a frozen interface but may not independently redefine these zones.

## 4. Persistence topological-order oracle

A production FK/reference target must exist as an accepted production table **before** a referencing table is created. Proof-only fixture tables never satisfy production dependencies.

### 4.1 Exhaustive external FK closure for Responsibility L2 v0.4

Current L2 external targets are:

| Target required by L2 | Production owner/order |
|---|---|
| application `User` | G10 |
| `connected_accounts (id,user_id)` | G19 |
| `conversations (id,connected_account_id)` | G19 |
| `participant_identities (id,user_id)` | G19 |
| `messages (id,connected_account_id)` | G19 |
| `ai_interpretation_runs (id,user_id)` | G30 prelude, before Responsibility tables |

G19 also owns `Conversation.semantic_evidence_revision` as monotonic non-negative evidence versioning.

G30 must order its migration internally so the minimal `AIInterpretationRun` prerequisite exists before any Responsibility table referencing it. Creating this table does **not** activate a model or authorize AI effects; G70 owns runtime AI activation.

Audit rule: every future L2 external FK addition must be added to this closure table or the graph fails.

### 4.2 Writer order

```text
G10 User/session
  -> G19 evidence foundation
      -> G30 prelude AIInterpretationRun prerequisite
          -> G30 frozen Responsibility tables
              -> G31 reducer
                  -> G32 Temporal runtime

G50 Draft + initial SendOperation
  -> G51 provider dispatch/reconciliation transitions
```

## 5. Vendor-evidence coverage oracle

Every volatile external dependency named by Issue #58 must have current dated evidence in the Issue #58 evidence file or an explicit bounded deferral.

Required coverage:

```text
Next.js / React
Better Auth
PostgreSQL / Drizzle
Gmail OAuth / watch / history / push
Trigger.dev
OpenAI Responses / Structured Outputs / data controls
WCAG 2.2 accessibility
```

Version/date facts are evidence, not Product semantics. Activation tasks recheck facts that materially govern their execution.

## 6. Product-scope coverage oracle

Every current `PRODUCT-CONTENT.md` V1 CORE / CORE-target capability must map to an implementation owner and executable acceptance path. The dated Issue #58 evidence file contains the mechanical mapping.

An ownerless CORE capability is a graph FAIL even if the happy-path DAG is valid.

## 7. Dependency DAG

```text
#58 merge
  |
  +-> G00 patched framework security baseline
  +-> V01 final visual-reference pass

After G00:
  P13 Responsibility PostgreSQL/Drizzle proof ----+
  P14 Better Auth UUID proof ---------------------+-> P15 independent L2 freeze
  G11 structural UI shell/read-model harness

P14 PASS -> G10 app auth/session
P13 PASS + G10 -> G19 provider-neutral evidence foundation

G19 -> G20 Gmail OAuth/watch/history/sync -> G21 Source UI + exact search
  |
  +-> P15 PASS -> G30 L3 persistence -> G31 reducer -> G32 attention/Temporal

G11 + G21 + G31 + G32 -> G40 Product surfaces
G31 + frozen normalized evidence contract -> G70 bounded AI lane
G20 + G40 -> G50 contextual Draft/immediate Send request
G31 + G50 -> G51 provider Send reconciliation
G20/G21 + G32 + G40 + G51 -> G60 integrity/recovery

G21 + G31/G32 + G40 + G51 + G60 + G70 -> G80 complete-loop integration
G80 -> R90 public-beta release gates
```

Safe-parallel result:

- P13, P14 and G11 may execute concurrently after G00, subject to the serialized root-manifest/lockfile merge rule;
- after G19 + P15, provider and deterministic Responsibility lanes may proceed independently;
- G31 uses frozen normalized fixtures and does not wait for live Gmail completion;
- G40 integrates live Source and accepted domain projections;
- G70 may start after G31 using deterministic/authorized context; G80 proves real-provider AI integration.

## 8. Node contracts

### G00 — Patched framework security baseline

Class: `SERIAL_GATE`.

Depends: #58 merge.

Owns: update current accepted Next 16.3 line to the current patched security baseline, directly coupled Next config/lock resolution only.

Acceptance: current security fix present; `pnpm verify`; E2E smoke; exact-head CI; no bootstrap regression.

Freshness: recheck official Next.js security guidance immediately before execution.

Non-goals: feature work, unrelated dependency sweep, framework-major migration.

Unblocks: P13, P14, G11.

### V01 — Final current visual-reference pass

Class: `PARALLEL_SAFE` after #58 merge.

Owns: current CORE Home / Needs You / Managed / Review / Moment / Source plus lifecycle/integrity references across representative widths.

Acceptance: every reference maps to textual Product/UI state; no image invents behavior; textual authority wins.

Non-goals: Product-semantic changes.

Unblocks: final pixel-sensitive fidelity only.

### P13 — Responsibility L2 PostgreSQL/Drizzle executable proof

Class: `PARALLEL_EXECUTION_SERIAL_MERGE` with P14/G11 after G00; existing Issue #13.

Owns: acceptance 01–46 and 50–60 except 47–49; real PostgreSQL 18; exact stable Drizzle/Kit/driver versions; generated SQL review; real concurrency; upstream ownership indexes/revision including `participant_identities` prerequisite.

No production migration.

Acceptance: current Issue #13 + canonical proof gate, exact version/environment evidence, no silent SKIP.

Freshness: recheck stable Drizzle/driver versions at execution.

Unblocks: G19 prerequisite conformance and P15.

### P14 — Better Auth UUID persistence proof

Class: `PARALLEL_EXECUTION_SERIAL_MERGE` with P13/G11 after G00; existing Issue #14.

Owns: acceptance 47–49 using current stable Better Auth, explicit PostgreSQL UUID strategy, exact Drizzle/driver versions and real PostgreSQL 18.

No production OAuth/auth rollout.

Acceptance: generated schema/catalog proves UUID; local user/session/account relationship and domain FK roundtrip; exact versions recorded.

Freshness: recheck current stable Better Auth at execution.

Unblocks: G10 and P15.

### P15 — Responsibility L2 independent freeze

Class: `SERIAL_GATE`; existing Issue #15.

Depends: concrete P13 + P14 evidence.

Acceptance: independent full 01–60 review of generated SQL/real PostgreSQL/concurrency/UUID evidence; explicit `PASS/FREEZE` or `FAIL/REVISE`.

Only PASS/FREEZE unblocks G30.

### G10 — Application session/auth production activation

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G00 + P14 PASS.

Owns only: Better Auth application identity/session; auth-owned User/session schema; protected BFF/session validation; committed auth migration; expiry/re-auth/revoke/sign-out.

Acceptance: real PostgreSQL UUID remains true; auth isolation; UI session semantics; no mailbox credential authority through Better Auth social-account rows.

Non-goals: ConnectedAccount/Source, Responsibility, Temporal, Draft/Send.

Unblocks: G19.

### G11 — Product UI shell + read-model/accessibility harness

Class: `PARALLEL_EXECUTION_SERIAL_MERGE` when root dependencies change; otherwise `PARALLEL_AFTER_CONTRACT`.

Depends: G00 + accepted Issue #55 UI contract. V01 only blocks final pixel fidelity.

Owns: shell/navigation/responsive panes/sheets; semantic tokens/primitives; typed fixture/read models; structural Home/Needs You/Managed/Review/Moment/Source states; loading/partial/degraded/session/provider/mutation cases; keyboard/focus/IME/accessibility harness.

Acceptance: Issue #55 structural cases, WCAG 2.2 AA baseline, Japanese IME safety, no domain/provider authority invented in UI.

Unblocks: G21/G40 UI integration.

### G19 — Provider-neutral evidence foundation

Class: `SERIAL_GATE` for shared evidence schema, then fan-out enabler.

Depends: G10 + P13 PASS.

Single-writer production scope:

```text
ConnectedAccount
ProviderSyncState
Conversation
Message
Attachment metadata
ParticipantIdentity
provider-neutral repositories/normalized fixtures
```

Required invariants include:

```text
connected_accounts UNIQUE (id,user_id)
conversations UNIQUE (id,connected_account_id)
participant_identities UNIQUE (id,user_id)
messages UNIQUE (id,connected_account_id)
(connected_account_id, provider_message_id) uniqueness
Conversation.semantic_evidence_revision >= 0 and monotonic
```

Acceptance: clean real PostgreSQL migration/rebuild; tenant/account/evidence FK/uniqueness tests; evidence-revision tests; exact normalized fixtures usable without Gmail; all P13-proven upstream prerequisites represented in production.

Non-goals: live Gmail OAuth/watch/history; Responsibility tables; Person/CRM Product behavior; AI runtime.

Unblocks: G20; after P15, G30.

### G20 — Gmail authorization / watch / history / sync

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G19 + G00.

Owns: one Gmail account; minimum scopes; offline OAuth where background access needs it; secure real-token persistence; initial sync; `users.watch`/Pub/Sub ingress; quick authenticated acknowledgement; durable `history.list` reconciliation; renewal; periodic safety reconciliation; stale-history 404/full-sync recovery; idempotent normalization through G19; attachment evidence access.

Credential gate before first durable real token: encrypted at rest, key/secret separated from ordinary DB/repo data, no token logging, user+ConnectedAccount-scoped use, explicit reconnect/invalidation, revoke/delete when intentionally removed where supported.

Provider oracles: push is signal not truth; cursor advances only after required durability; duplicate/delayed/dropped signals converge; historical sync does not auto-activate Responsibilities.

Acceptance: applicable Product Golden Scenarios/provider failure cases + real provider evidence where required.

Freshness: current Google OAuth/Gmail/Pub/Sub docs at execution.

Non-goals: public OAuth verification/security assessment, which belongs to R90 where actually required.

Unblocks: G21/G50/G60.

### G21 — Real Source + exact Source search

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G11 + G20.

Owns: Source list/detail; provider/account provenance; authorized attachment access/fallback; authorized exact deterministic Source search; partial/sync/degraded/no-match states.

Acceptance: Source remains accessible independently of Responsibility/Moment; safe content rendering; authorization isolation; partial != zero; deterministic exact search.

Non-goals: natural-language/semantic Q&A.

Unblocks: G40/G60/G80.

### G30 — Responsibility L3 production persistence

Class: `SERIAL_GATE`.

Depends: P15 PASS/FREEZE + G19.

Prelude ownership: create the smallest production `AIInterpretationRun` prerequisite needed by frozen L2 references, including `UNIQUE(id,user_id)` and any accepted user/conversation/message basis FKs. This is provenance/evidence infrastructure only; it does not call a model.

Then own: frozen L2 Responsibility production tables/migrations in valid FK order, with real G10/G19/prelude targets.

Acceptance:

- clean migration from accepted prior state;
- every external FK target resolves to a production table, never a proof fixture;
- migration ordering itself is inspected/tested;
- frozen L2 invariants remain true;
- no obsolete lifecycle-enum collapse;
- no AI runtime side effect.

Unblocks: G31.

### G31 — Deterministic Responsibility admission/reducer

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G30 + frozen normalized evidence contract; does not depend on G20/G21 completion.

Owns: `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`; `CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP`; field correction/provenance; orthogonal semantics; historical activation policy; deterministic projections.

Acceptance: relevant Tier-0/transition/high-harm Responsibility oracles + applicable Product Golden Scenarios with deterministic fixtures.

Unblocks: G32/G40/G51/G70.

### G32 — Attention + Temporal runtime

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G31.

Owns: Needs You/Waiting-Managed/Later/Review/Done projection; Return Attention; durable defer/expected-event/time/reply/deadline reconsideration; Temporal persistence/currentness/idempotency; Trigger.dev adapter if retained; overdue/stale/restart reconciliation.

Acceptance: relevant temporal/race oracles and Product scenarios; DB/domain currentness remains final authority if vendor idempotency expires/fails.

Freshness: recheck Trigger.dev behavior if activated.

Unblocks: G40/G60/G80.

### G40 — Product surfaces on real domain loop

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G11 + G21 + G31 + G32.

Owns: Home, Needs You, Managed, Review, Moment, onboarding/first delegation, supported Settings/integrity hooks.

Acceptance: strict zero; trustworthy Managed; bounded Review; source-grounded Moment; separate session/provider/integrity/domain/mutation axes; applicable Product Golden Scenarios + Issue #55 acceptance.

Unblocks: G50/G60/G80.

### G50 — Contextual Draft / Reply / Reply All + immediate Send request

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G20 + G40.

Single-writer persistence: minimal durable Draft/versioning + initial SendOperation request/pending identity; no delayed-send model.

User path: contextual Reply/Reply All, explicit sender, inspectable recipients/body, manual text baseline, explicit immediate Send request.

Acceptance: draft preservation; sender/recipient visibility; Japanese IME; idempotent request; offline attempt does not silently send later; manual path works without AI.

Non-goals: generic fresh Compose, Forward, Send Later, generic Undo/recall.

Unblocks: G51.

### G51 — Provider Send reconciliation + Responsibility re-evaluation

Class: `SERIAL_GATE` for external-effect truth.

Depends: G50 + G31.

Owns: provider dispatch/reconciliation transitions on existing SendOperation; ambiguous timeout handling; no blind retry; sent-message Source reconciliation; post-send reducer evidence.

Invariant:

```text
request/click != provider acceptance != operational outcome satisfied
```

Acceptance: duplicate/retry/restart/ambiguity tests; provider evidence and Responsibility consequences are separately proven.

Unblocks: G60/G80.

### G60 — Integrity / reconnect / failure closure

Class: `INTEGRATION_GATE` for reliance behavior.

Depends: G20/G21 + G32 + G40 + G51.

Owns: auth loss/reconnect/backfill; sync lag/data-through; notification delivery separation; Temporal overdue recovery; Send ambiguity; attachment degradation; mutation pending/failure; intentional disconnect vs sign-out/account deletion routing.

Acceptance: no false healthy reassurance; degraded scope and last-trustworthy observation are visible; reconnect restores healthy only after reconciliation; applicable Product failure Golden Scenarios pass.

Unblocks: G80.

### G70 — Bounded AI interpretation + contextual AI draft

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G31 + frozen normalized evidence contract. Real-provider integration closes at G80.

Owns two separate model schemas/evals:

1. Responsibility interpretation candidate;
2. editable contextual draft candidate.

Uses G30-created AIInterpretationRun provenance substrate and may evolve it only through an explicit reviewed migration compatible with frozen Responsibility references.

Authority: AI never owns auth/provider facts, admission/identity/effects, accepted state, tracking/defer, Temporal effects, sender/recipient authority, Send permission, or provider actions.

Acceptance: runtime schema validation; evidence-revision freshness; prompt-injection/high-harm evals; manual Source/Reply fallback; model/config/data-control evidence recorded.

Freshness: current OpenAI Responses/Structured Outputs/data controls immediately before activation.

Unblocks: G80.

### G80 — Complete-loop integration

Class: `INTEGRATION_GATE`.

Depends: G21 + G31/G32 + G40 + G51 + G60 + G70.

Owns cumulative real-provider acceptance and shared E2E fixtures.

Must prove at least:

```text
real Gmail evidence
-> admitted Responsibility
-> Managed quiet monitoring
-> durable reconsideration
-> Needs You / Review return
-> source-grounded Moment
-> contextual manual/AI draft
-> explicit immediate Send
-> provider reconciliation
-> correct Responsibility consequence
-> truthful failure/recovery behavior
```

Also prove exact Source search, attachment evidence access, AI-unavailable manual path, restart/idempotency/ambiguity behavior, and current Golden Scenario coverage.

Acceptance: exact-head CI + real-provider evidence for claims that mocks cannot establish.

Unblocks: R90.

### R90 — Public-beta release readiness

Class: `RELEASE_GATE`.

Depends: G80.

Owns only obligations actually required for public release: Google OAuth verification/restricted-scope assessment where applicable, production credential/key rotation/recovery, privacy/retention/deletion commitments, current AI data controls, operational monitoring/recovery, release security/hardening.

Does not establish ICP, PMF, WTP, retention, or monitoring relinquishment.

## 9. Actual Issue creation rule

After #58 itself passes full cumulative audit + exact-head CI and merges, create/reconcile implementation Issues from these nodes. Each executable Issue must include:

- stable purpose and owned files/boundaries;
- prerequisites and exact accepted base;
- acceptance tests/oracles;
- required live/vendor evidence;
- non-goals;
- parallel class and collision assets;
- merge/unblock condition.

Do not launch broad implementation from chat-only descriptions.

## 10. Final graph acceptance oracle

#58 may pass only if all are true:

1. main baseline/current implementation fact is correct;
2. current Product/UI/Responsibility authorities are preserved;
3. every CORE capability has an owner;
4. every production FK target has a topological owner/order;
5. proof fixtures are never production dependencies;
6. P13/P14/P15 gates are not waived;
7. shared root manifest/lockfile parallel-merge collisions are controlled;
8. vendor evidence coverage is current and date-scoped;
9. provider/AI/scheduler capabilities do not become authority;
10. no second-provider/full-client scope is smuggled in;
11. final candidate receives a full cumulative acceptance audit;
12. exact-head Verify/E2E CI passes before merge.
