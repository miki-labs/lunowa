# Lunowa Minimum Complete Delegation Loop — Implementation Graph

## Status / authority

**Implementation dependency and activation authority candidate for Issue #58, reconciled 2026-08-28 after repeated full acceptance audits and root-cause correction.**

This graph translates accepted Product / Responsibility / UI / architecture contracts into executable work. It does **not** redefine Product semantics, Responsibility semantics, provider facts, or empirical Product claims.

After merge, this file owns implementation dependency/parallelization questions together with live GitHub Issues. Generic module presence is not implementation authorization.

Primary authorities:

- `PRODUCT.md` / `PRODUCT-CONTENT.md`;
- `GOLDEN-SCENARIO-BANK.md`;
- `../design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design files;
- `responsibility/` semantic/persistence oracles;
- `ARCHITECTURE.md`, `CONTRACTS.md`, `TECH-STACK.md`;
- dated Issue #58 evidence;
- live GitHub Issue/PR/CI state.

## 1. Target

Build the smallest real one-provider loop that demonstrates:

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

Current CORE retrieval also includes **authorized exact Source search** and authorized attachment evidence access.

Not current prerequisites:

- Microsoft provider;
- broad multi-account Scope UX;
- Person/CRM context;
- Pin;
- generic fresh Compose / Forward parity;
- Send Later / generic Undo or recall;
- native rich attachment preview;
- natural-language/semantic Q&A Search;
- autonomous Send;
- generic workflow/rule engine.

## 2. Parallelization classes

- `SERIAL_GATE` — shared/security/semantic authority downstream work may not bypass.
- `PARALLEL_SAFE` — isolated ownership/acceptance; may run concurrently with repository/runtime isolation.
- `PARALLEL_AFTER_CONTRACT` — may fan out only after named shared interface/oracle freezes.
- `INTEGRATION_GATE` — cumulative vertical-loop acceptance.
- `RELEASE_GATE` — public-release obligation, not local/private complete-loop prerequisite.

## 3. Single-writer collision zones

| Collision zone | Single owner / merge order |
|---|---|
| framework/package security baseline | G00 |
| Better Auth User/session schema | P14 proof -> G10 |
| provider-neutral Source schema (`ConnectedAccount`, sync, Conversation/Message/Attachment) | P13 prerequisite proof -> G19 |
| Gmail OAuth/watch/history adapter | G20 consumes G19 |
| Responsibility physical schema | P13/P14 -> P15 -> G30 |
| Responsibility reducer / accepted state | G31 |
| Temporal intent/trigger persistence/currentness | G32 |
| central Product read models | G40 integration over G11/G21/G31/G32 |
| Draft + initial SendOperation request schema | G50 |
| provider dispatch/reconciliation transitions | G51 after G50 |
| root shell/global design tokens | G11; pixel fidelity after V01 |
| shared real-provider E2E fixtures | G80 integration owner |

Parallel tasks may consume a frozen interface but may not independently redefine these zones.

## 4. Persistence topological-order oracle

Every production FK/reference target must exist before the referencing production migration can pass.

| Production writer | May start after | Creates / owns | Required downstream by |
|---|---|---|---|
| G10 | G00 + P14 PASS | app-auth User/session schema | G19, authenticated BFF |
| G19 | G10 + P13 PASS | ConnectedAccount, ProviderSyncState, Conversation, Message, Attachment metadata + proven upstream indexes/revision | G20, G30, G21 |
| G30 | P15 PASS + G19 | Responsibility L2-frozen production schema with real Source FKs | G31 |
| G32 | G31 | Temporal durable intent/trigger persistence required by active loop | G40/G60 |
| G50 | G20 + G40 | Draft + initial SendOperation request/pending schema | G51 |
| G51 | G50 + G31 | dispatch/reconciliation transitions on existing SendOperation | G60/G80 |

Audit rule: a production migration may not depend on proof-only fixture tables. If its FK target is not already an accepted production table, the DAG is invalid.

## 5. Vendor-evidence coverage oracle

Before graph acceptance, every volatile external dependency named by Issue #58 must have current dated evidence in `research/issue-58-implementation-graph-evidence-2026-08-28.md` or an explicit bounded deferral.

Coverage required here:

```text
Next.js / React
Better Auth
PostgreSQL / Drizzle
Gmail OAuth / watch / history / push
Trigger.dev
OpenAI Responses / Structured Outputs / data controls
WCAG 2.2 web accessibility
```

Version/date facts remain evidence, not timeless Product semantics. Execution tasks recheck the facts that materially govern their own activation.

## 6. Product-scope coverage oracle

Every current `PRODUCT-CONTENT.md` V1 CORE / CORE-target capability must map to at least one implementation owner and executable acceptance path. The dated Issue #58 evidence file carries the current mechanical mapping.

A graph that leaves a current CORE capability ownerless fails even if its happy-path DAG is otherwise valid.

---

# 7. Dependency DAG

```text
#58 graph freeze
   |
   +--> G00 patched framework security baseline
   +--> V01 final visual-reference pass

After G00:
   P13 Responsibility PostgreSQL/Drizzle proof ----+
   P14 Better Auth UUID proof ---------------------+--> P15 independent L2 freeze
   G11 structural UI shell/read-model harness

P14 PASS -> G10 app auth/session
P13 PASS + G10 -> G19 provider-neutral Source persistence foundation

G19 -> G20 Gmail OAuth/watch/history/sync -------> G21 Source UI + exact search
  |
  +---- P15 PASS -> G30 Responsibility L3 -> G31 deterministic reducer -> G32 attention/Temporal

G11 + G21 + G31 + G32 ---------------------------------------------> G40 Product surfaces

G31 + frozen normalized Source contract ---------------------------> G70 bounded AI lane

G20 + G40 ----------------------------------------------------------> G50 Draft + contextual immediate Send
G31 + G50 ----------------------------------------------------------> G51 provider Send reconciliation
G20/G21 + G32 + G40 + G51 ----------------------------------------> G60 integrity/recovery

G21 + G31/G32 + G40 + G51 + G60 + G70 ---------------------------> G80 complete-loop integration
                                                                            |
                                                                            v
                                                                   R90 public-beta release gates
```

Safe-parallel result:

- after G19 + P15, **G20/G21 provider lane** and **G30/G31/G32 deterministic domain lane** proceed independently;
- G31 consumes the frozen normalized Source contract + deterministic fixtures, not live Gmail completion;
- G40 is where live Source and real domain projections integrate;
- G70 can begin after G31 using deterministic/authorized fixture context and does not wait for G60; real-provider AI integration is proven at G80.

---

# 8. Node contracts

## G00 — Patched framework security baseline

Class: `SERIAL_GATE`

Scope:

- update repo Next.js from current 16.3.0 to current patched accepted 16.3 Active-LTS baseline (16.3.3 evidence as of 2026-08-28);
- directly coupled `eslint-config-next`/lock resolution only as required;
- run existing verification/browser smoke.

Non-goals: Product features, unrelated dependency sweep, framework-major migration.

Acceptance:

- current known Critical fixes included;
- `pnpm verify` + E2E smoke + exact-head CI PASS;
- no bootstrap regression.

## V01 — Final current visual-reference pass

Class: `PARALLEL_SAFE` after #58 merge.

Scope:

- current CORE Home / Needs You / Managed / Review / Moment / Source plus lifecycle/integrity visual references;
- representative desktop/compact/mobile direction;
- map each reference to textual state.

Textual Product/UI authority wins; imagery may not invent behavior. Blocks final pixel-sensitive fidelity only.

## P13 — Responsibility L2 PostgreSQL/Drizzle executable proof

Class: `PARALLEL_SAFE` with P14 after G00; existing Issue #13.

Owns:

- acceptance 01–46 and 50–60 except 47–49;
- real PostgreSQL 18;
- exact stable Drizzle ORM/Kit/driver pin;
- generated SQL inspection;
- real concurrency;
- candidate upstream Source prerequisites including ownership indexes and `Conversation.semantic_evidence_revision`.

No production migration.

PASS unblocks G19's production Source schema to conform to those proven prerequisites and contributes to P15.

## P14 — Better Auth UUID persistence proof

Class: `PARALLEL_SAFE` with P13 after G00; existing Issue #14.

Owns acceptance 47–49 using the current stable Better Auth version at execution, explicit UUID strategy, exact Drizzle/driver versions, real PostgreSQL 18 and generated schema inspection. No production OAuth.

PASS unblocks G10 and contributes to P15.

## P15 — Responsibility L2 independent freeze

Class: `SERIAL_GATE`; existing Issue #15.

Depends P13 + P14 concrete evidence. Independently reviews 01–60 and records `PASS/FREEZE` or `FAIL/REVISE`.

Only PASS/FREEZE unblocks G30.

## G10 — Application session/auth production activation

Class: `PARALLEL_AFTER_CONTRACT`

Depends G00 + P14 PASS.

Owns only:

- Better Auth app identity/session;
- auth-owned User/session schema;
- protected BFF/session validation;
- committed auth migration;
- expiry/re-auth/revoke/sign-out.

Does not own ConnectedAccount/Source, Responsibility, Temporal, Draft or SendOperation.

Acceptance:

- signed-out/signed-in/expiry/re-auth semantics match UI contract;
- real PostgreSQL UUID contract remains true;
- authorization isolation tests;
- no mailbox credential authority through Better Auth social accounts.

## G11 — Product UI shell + read-model/accessibility harness

Class: `PARALLEL_AFTER_CONTRACT`

Depends G00 + frozen Issue #55 UI contract. V01 is needed only before final pixel fidelity.

Scope:

- shell/navigation/responsive routing/panes/sheets;
- semantic tokens/primitives;
- typed UI state/read-model fixtures;
- Home/Needs You/Managed/Review/Moment/Source structural surfaces;
- loading/partial/degraded/session/provider/mutation fixtures;
- keyboard/focus/IME/accessibility harness.

No provider/domain authority.

Acceptance includes WCAG 2.2 AA baseline, Japanese IME safety and Issue #55 structural cases.

## G19 — Provider-neutral Source persistence foundation

Class: `SERIAL_GATE` for shared Source schema, then fan-out enabler.

Depends:

- G10 production User/session schema;
- P13 PASS for current L2 upstream Source prerequisites.

Single-writer scope:

- `ConnectedAccount`;
- `ProviderSyncState`;
- `Conversation`;
- `Message`;
- `Attachment` metadata;
- provider-neutral repositories/ownership boundaries;
- proven `UNIQUE (id,user_id)` / `UNIQUE (id,connected_account_id)` prerequisites;
- monotonic non-negative `Conversation.semantic_evidence_revision`;
- `(connected_account_id, provider_message_id)` uniqueness;
- committed SQL migrations.

No live Gmail OAuth/watch/history API calls. No Responsibility tables.

Acceptance:

- clean real PostgreSQL migration/rebuild;
- tenant/account/source FK/uniqueness tests;
- evidence revision rules executable;
- production schema directly satisfies P13-proven upstream prerequisites;
- normalized Source fixtures/repositories usable without Gmail.

Unblocks in parallel:

- G20 real Gmail adapter/sync;
- after P15, G30 Responsibility production migration.

## G20 — Gmail authorization / watch / history / sync

Class: `PARALLEL_AFTER_CONTRACT`

Depends G19 + G00.

Consumes G19 Source persistence; does not redefine its schema independently except through an explicit reviewed migration if real provider evidence proves a bounded field is required.

Scope:

- one Gmail account;
- minimum scopes;
- offline OAuth when background access required;
- initial sync;
- `users.watch` / Pub/Sub ingress;
- authenticated quick acknowledgement;
- durable `history.list` reconciliation;
- watch renewal;
- periodic safety reconciliation;
- stale history/404 full-sync recovery;
- idempotent normalization/upsert through G19 repositories;
- attachment evidence access.

Credential gate before first durable real token persistence:

- secure/encrypt token at rest;
- cryptographic key/secret separated from ordinary DB/repo data;
- no token logging;
- authenticated user + ConnectedAccount ownership on lookup/use;
- explicit invalidation/reconnect;
- revoke/delete when intentionally no longer needed where supported.

A bounded non-persistent OAuth spike may avoid durable token storage; plaintext durable storage is never accepted.

Provider oracles:

- cursor advance after required Source durability;
- push payload never mutates Responsibility;
- duplicate/delayed/dropped push converges through reconciliation;
- initial historical sync never auto-activates Responsibilities.

Acceptance Product cases: PG-20, 21, 28, 31, 33, 35, 36.

Public OAuth verification/security assessment is R90, not local-proof prerequisite.

## G21 — Real Source Conversations + exact Source search

Class: `PARALLEL_AFTER_CONTRACT`

Depends G11 + G20.

Scope:

- real Source list/detail;
- provider/account/source provenance;
- attachment evidence open/download/provider fallback;
- authorized **exact Source search — V1 CORE**;
- truthful partial/sync/degraded/no-match behavior.

No NL/semantic Q&A unless separately activated.

Acceptance:

- Source independent of Responsibility/Moment;
- partial != zero;
- safe content rendering;
- exact search authorized/deterministic;
- PG-22,23,28,31 + UI Search contract.

## G30 — Responsibility L3 production persistence

Class: `SERIAL_GATE`

Depends P15 PASS/FREEZE + G19 production Source schema.

Scope:

- smallest frozen L2 Responsibility production schema/migrations;
- real FKs to accepted G19 Source tables;
- provenance/evidence revision/currentness;
- accepted tenant/idempotency constraints.

Acceptance:

- no proof-only fixture FK targets;
- frozen L2 tests/invariants remain true in production-shaped integration;
- committed migrations;
- no lifecycle-enum collapse.

## G31 — Deterministic Responsibility admission/reducer

Class: `PARALLEL_AFTER_CONTRACT`

Depends G30 + frozen normalized Source/evidence contract. **Does not depend on G20/G21 completion.**

Use deterministic normalized fixtures.

Scope:

- `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`;
- `CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP`;
- field correction/provenance;
- orthogonal semantics;
- historical activation policy;
- deterministic projections.

Acceptance: relevant Tier-0/transition/high-harm oracles + PG-05–19.

## G32 — Attention + Temporal Contract runtime

Class: `PARALLEL_AFTER_CONTRACT`

Depends G31.

Scope:

- Needs You/Waiting-Managed/Later/Review/Done projections;
- Return Attention without fake actionability;
- durable defer/expected-event/time/reply/deadline reconsideration as accepted;
- Temporal persistence/currentness/idempotency;
- Trigger.dev adapter if retained;
- overdue/stale/restart reconciliation.

Vendor idempotency keys are secondary; DB/domain intent/currentness is final authority.

Acceptance: PG-01–04,09–10,18,24,27 + Responsibility temporal/race oracles.

## G40 — Product surfaces on real domain loop

Class: `PARALLEL_AFTER_CONTRACT`

Depends G11 + G21 + G31/G32.

Scope: Home, Needs You, Managed, Review, Moment, onboarding/first delegation and supported Settings/integrity hooks.

Acceptance: strict zero, trustworthy Managed, bounded Review, source-grounded Moment, distinct session/provider/integrity/domain/mutation axes, applicable Product Golden Scenarios + Issue #55.

## G50 — Contextual Draft / Reply / Reply All + immediate Send request

Class: `PARALLEL_AFTER_CONTRACT`

Depends G20 + G40.

Single-writer persistence:

- minimal durable Draft/versioning;
- minimal SendOperation request/pending schema;
- operation/idempotency identity;
- no delayed-send scheduling model.

User path:

- contextual Reply / Reply All;
- explicit sender;
- inspectable recipients/body;
- manual text baseline;
- explicit **IMMEDIATE** Send request.

Deferred: Forward, Send Later, generic Undo/recall, silent offline queued Send.

Acceptance: draft preservation, sender/recipient visibility, Japanese IME, no duplicate commit, offline attempt does not later send silently, PG-14/26/29 manual path.

## G51 — Provider Send reconciliation + Responsibility re-evaluation

Class: `SERIAL_GATE` for external-effect truth.

Depends G50 + G31.

Owns provider dispatch/reconciliation transitions on G50's existing SendOperation schema, ambiguous timeout handling, no blind retry, sent-message Source reconciliation and post-send reducer input.

Invariant:

```text
request/click != provider acceptance != operational outcome satisfied
```

Acceptance: PG-01,05,25,26 + duplicate/retry/restart/ambiguity tests.

## G60 — Integrity / reconnect / failure closure

Class: `INTEGRATION_GATE` for reliance behavior.

Depends G20/G21 + G32 + G40 + G51.

Covers auth loss/reconnect/backfill, sync lag/data-through, notification-delivery separation, Temporal overdue recovery, Send ambiguity, attachment-access degradation, mutation pending/failure, intentional disconnect vs app sign-out and Product-account deletion boundary routing.

Acceptance: applicable PG-20–38; no false healthy reassurance, false zero or fake domain state from infrastructure failure.

## G70 — Bounded AI interpretation + contextual draft assistance

Class: `PARALLEL_AFTER_CONTRACT`

May begin after G31 freezes the trusted candidate/reducer boundary and the normalized Source contract exists. It does not require live Gmail completion for fixture/eval work and does not wait for G60.

Two independent model contracts/evals:

1. Responsibility interpretation candidates;
2. editable contextual reply-draft candidates.

Requirements:

- official OpenAI SDK + Responses API;
- Structured Outputs / JSON Schema where suitable;
- runtime/source/currentness validation;
- minimum authorized context;
- current org/project data-control review;
- `store:false` where appropriate without equating it to ZDR;
- family-stratified holdout, prompt-injection/high-harm cases;
- manual Source/Reply fallback.

AI never gains Send or accepted-state authority.

## G80 — Complete-loop integration

Class: `INTEGRATION_GATE`

Depends G21 + G31/G32 + G40 + G51 + G60 + G70.

Must prove representative real-provider loops including:

- request/send -> Waiting/Managed;
- progress reply stays quiet;
- action reply returns Needs You/Moment;
- no-reply trigger re-evaluates current evidence;
- contextual AI draft -> edit -> explicit Send -> reconciliation;
- same communication path succeeds manually if AI unavailable;
- auth/sync loss -> Integrity -> reconnect/backfill;
- ambiguous Send -> no duplicate;
- exact Source search + attachment fallback.

Acceptance uses Product Golden Scenarios, Responsibility oracles, Issue #55 UI cases, real provider evidence, exact-head CI/E2E and a full cumulative independent audit.

## R90 — Public-beta release readiness

Class: `RELEASE_GATE`

Does not block local/private G80 proof.

Includes as applicable:

- Google OAuth verification/restricted-scope assessment;
- exact privacy/retention/deletion commitments;
- production credential rotation/recovery beyond G20 minimum secure storage;
- production secrets/region/backup/restore/observability;
- current AI data-control/privacy posture;
- release accessibility/device/browser matrix;
- security/abuse/recovery/support runbooks.

---

# 9. Parallel-wave plan

### Wave 0

- merge #58;
- G00 security baseline.

### Wave 1 after G00

Parallel:

- P13 (#13);
- P14 (#14);
- G11;
- V01 may run independently after #58 merge.

### Wave 2

- P14 PASS -> G10;
- P13 + P14 -> P15;
- G11 continues;
- visual work continues if needed.

### Wave 3

- P13 PASS + G10 -> G19;
- P15 PASS waits independently for G30 authorization.

### Wave 4 after G19 + P15

Parallel lanes:

```text
Provider: G20 -> G21
Domain:   G30 -> G31 -> G32
UI:       G11/V01 completion
AI:       G70 after G31 contract freeze
```

### Wave 5

- G40 integration;
- G50/G51 Send path;
- G60 recovery;
- G80 full loop;
- R90 release only after local/private product proof reaches the required maturity.

## 10. Critical path

Ignoring optional visual parallel work, the dependency chain controlling the first complete loop is approximately:

```text
#58
-> G00
-> P14 -> G10
-> P13 -> G19
-> P15 -> G30 -> G31 -> G32
-> G20 -> G21
-> G40
-> G50 -> G51
-> G60
-> G70
-> G80
```

Several branches overlap; this is not a mandate to serialize independent work.

## 11. Final complete-loop acceptance

G80 is PASS only when the system proves behavior, not component completion:

```text
real provider evidence
-> authorized Source state
-> accepted Responsibility decision
-> quiet reliable monitoring
-> durable return condition
-> current event/time causes re-evaluation
-> correct Needs You/Review/Managed outcome
-> source-grounded Moment
-> contextual manual/AI-assisted reply
-> explicit immediate Send
-> provider reconciliation
-> correct Responsibility continuation/closure
-> trustworthy integrity during failure/recovery
```

All evidence must bind to the exact candidate head/CI execution. Component builders do not self-approve the integrated behavior.

## 12. Non-goals / deferred scope

Do not pull into the current critical path merely because architecture can support them:

- Microsoft;
- broad multi-account Scope UX;
- Person/CRM;
- Pin;
- generic fresh Compose / Forward;
- Send Later / generic Undo;
- rich native attachment preview;
- natural-language Search;
- autonomous Send;
- generic workflow/rule engine.

## 13. Review discipline

Every node requires its own current contract, executable acceptance and independent cumulative review before merge.

For parallel waves:

- start from the same accepted fresh base;
- run repository preflight;
- isolate worktree/runtime resources;
- avoid overlapping single-writer zones;
- integrate only after upstream contract heads are accepted.

On FAIL, audit the entire candidate and batch all known material corrections. Repeated correction failure triggers spec/oracle/architecture/decomposition/verification root-cause analysis before another patch loop.

## 14. Empirical boundary

Issue #36 remains open. Building G80 cannot prove ICP, market prevalence, monitoring relinquishment, PMF, WTP, retention or differentiation against real workflows.
