# Lunowa Minimum Complete Delegation Loop — Implementation Graph

## Status / authority

**Issue #58 final-candidate dependency and activation authority. Reconciled 2026-08-28 after repeated full acceptance audits.**

This graph translates accepted Product / Responsibility / UI / architecture contracts into executable work. It does **not** redefine Product semantics, Responsibility semantics, empirical Product claims, or provider facts.

After accepted merge, this file + live GitHub Issues own implementation dependency, parallelization, single-writer and production-FK topology questions.

Primary authorities:

- `PRODUCT.md`, `PRODUCT-CONTENT.md`, `GOLDEN-SCENARIO-BANK.md`;
- `../design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design files;
- `responsibility/` semantic/persistence oracles;
- `ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md`, `TECH-STACK.md`;
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

Not current prerequisites: Microsoft, broad multi-account Scope UX, Person/CRM Product features, Pin, generic Compose/Forward parity, Send Later/generic Undo, rich native attachment preview, natural-language Search, autonomous Send, or a generic workflow engine.

## 2. Parallelization classes

- `SERIAL_GATE` — downstream work may not bypass the shared/security/semantic authority.
- `PARALLEL_SAFE` — execution and merge ownership are isolated.
- `PARALLEL_AFTER_CONTRACT` — execution may fan out only after the named shared interface/oracle freezes.
- `PARALLEL_EXECUTION_SERIAL_MERGE` — isolated work may run concurrently, but shared repository assets merge one at a time.
- `INTEGRATION_GATE` — cumulative vertical-loop acceptance.
- `RELEASE_GATE` — public-release obligation, not local/private complete-loop prerequisite.

### 2.1 Parallel execution != parallel merge

`package.json` and `pnpm-lock.yaml` are repository-wide serialized merge assets.

If concurrent tasks touch either file:

1. work may execute in isolated worktrees/runtime namespaces;
2. PRs merge serially;
3. every later PR refreshes/rebases onto latest accepted main;
4. regenerate lockfile with pnpm rather than hand-merging it;
5. rerun repository verification;
6. rerun any task proof whose dependency/version basis changed materially.

The same rule applies to any other shared root/config asset proven to be a real collision zone. Worktree/runtime isolation alone does not establish merge independence.

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

## 4. Production persistence topology oracle

A production FK/reference target must exist as an accepted production table **before** a referencing table is created. Proof-only fixture tables never satisfy production dependencies.

### 4.1 Exhaustive current external FK closure for Responsibility L2 v0.4

| Target required by L2 | Production owner/order |
|---|---|
| application `User` | G10 |
| `connected_accounts (id,user_id)` | G19 |
| `conversations (id,connected_account_id)` | G19 |
| `participant_identities (id,user_id)` | G19 |
| `messages (id,connected_account_id)` | G19 |
| `ai_interpretation_runs (id,user_id)` | G30 prelude, before Responsibility tables |

G19 also owns monotonic non-negative `Conversation.semantic_evidence_revision`.

G30 orders its migration so the minimal `AIInterpretationRun` prerequisite exists before any Responsibility table referencing it. Table existence does **not** activate a model or authorize AI effects; G70 owns runtime AI activation.

Audit rule: every future L2 external FK addition must enter this closure table or the graph fails.

### 4.2 Writer order

```text
G10 User/session
  -> G19 provider-neutral evidence foundation
      -> G30 prelude AIInterpretationRun prerequisite
          -> G30 frozen Responsibility tables
              -> G31 reducer
                  -> G32 Temporal runtime

G50 Draft + initial SendOperation request state
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
Gmail Send / Reply threading / provider result
Trigger.dev
OpenAI Responses / Structured Outputs / data controls
WCAG 2.2 accessibility
```

Version/date facts are evidence, not Product semantics. Activation tasks recheck facts that materially govern their execution.

## 6. Product-scope coverage oracle

Every current `PRODUCT-CONTENT.md` V1 CORE / CORE-target capability must map to an implementation owner and executable acceptance path. The dated Issue #58 evidence file contains the current mechanical Feature Matrix mapping.

An ownerless current CORE capability is a graph FAIL.

Conditional/strong-candidate/post-v1 Product scenarios remain explicit regression boundaries but do not become critical-path implementation merely because they exist in the canonical Golden bank.

Stable IDs owned by canonical authorities are reference keys, not labels this graph may reinterpret. Any mapping using a stable Product/UI/Responsibility ID must preserve the owning artifact's exact meaning; cross-cutting requirements are referenced by section/name instead of borrowing an unrelated stable ID.

## 7. Dependency DAG

```text
#58 accepted merge
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

- P13, P14 and G11 may execute concurrently after G00, subject to serialized root-manifest/lockfile merge;
- after G19 + P15, provider and deterministic Responsibility lanes may proceed independently;
- G31 uses frozen normalized fixtures and does not wait for live Gmail completion;
- G40 integrates live Source and accepted domain projections;
- G70 may begin fixture/eval work after G31; G80 proves real-provider AI integration.

---

# 8. Node contracts

The prose below defines purpose/prerequisites/behavior. Section 9 supplies the mandatory repository/runtime boundary, external/live evidence, non-goal and merge/unblock fields for **every** node so contract completeness is mechanically auditable.

## G00 — Patched framework security baseline

Class: `SERIAL_GATE`.

Depends: accepted #58 merge.

Purpose/scope: update current accepted Next 16.3 line to the current patched security baseline with directly coupled Next config/lock resolution only.

Acceptance: current security fixes present; `pnpm verify`; E2E smoke; exact-head CI; no bootstrap regression.

## V01 — Final current visual-reference pass

Class: `PARALLEL_SAFE` after #58 merge.

Purpose/scope: current CORE Home / Needs You / Managed / Review / Moment / Source plus lifecycle/integrity visual references across representative widths.

Acceptance: each reference maps to textual Product/UI state; no image invents behavior; textual authority wins.

## P13 — Responsibility L2 PostgreSQL/Drizzle executable proof

Class: `PARALLEL_EXECUTION_SERIAL_MERGE`; existing Issue #13.

Depends: G00.

Purpose/scope: acceptance 01–46 and 50–60 except 47–49; real PostgreSQL 18; exact stable Drizzle/Kit/driver versions; generated SQL; real concurrency; all current external prerequisite/index/evidence contracts using proof-only fixtures.

Acceptance: current Issue #13 + canonical `L2-EXECUTABLE-PROOF-GATE.md`, exact versions/environment, no silent SKIP.

## P14 — Better Auth UUID persistence proof

Class: `PARALLEL_EXECUTION_SERIAL_MERGE`; existing Issue #14.

Depends: G00.

Purpose/scope: acceptance 47–49 using current stable Better Auth, explicit PostgreSQL UUID strategy, exact Drizzle/driver versions and real PostgreSQL 18.

Acceptance: generated schema/catalog proves UUID; local user/session/account relationship + domain FK roundtrip; exact versions/config recorded.

## P15 — Responsibility L2 independent freeze

Class: `SERIAL_GATE`; existing Issue #15.

Depends: concrete final P13 + P14 evidence.

Purpose/scope: independent full 01–60 audit of generated SQL/real PostgreSQL/concurrency/UUID evidence and current external prerequisite coverage.

Acceptance: explicit `PASS/FREEZE` or `FAIL/REVISE`; only PASS/FREEZE unblocks production Responsibility migration.

## G10 — Application session/auth production activation

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G00 + P14 PASS.

Purpose/scope: Better Auth app identity/session; auth-owned User/session schema; protected BFF/session validation; committed auth migration; expiry/re-auth/revoke/sign-out.

Acceptance: PostgreSQL UUID remains true; authorization isolation; UI session semantics; no mailbox credential authority through Better Auth social-account rows.

## G11 — Product UI shell + read-model/accessibility harness

Class: `PARALLEL_EXECUTION_SERIAL_MERGE` when root dependencies change; otherwise `PARALLEL_AFTER_CONTRACT`.

Depends: G00 + accepted Issue #55 UI contract. V01 only blocks final pixel fidelity.

Purpose/scope: shell/navigation/responsive panes/sheets; semantic tokens/primitives; typed state/read-model fixtures; structural Home/Needs You/Managed/Review/Moment/Source states; loading/partial/degraded/session/provider/mutation fixtures; keyboard/focus/IME/accessibility harness.

Acceptance: UI contract structural cases, WCAG 2.2 AA baseline, Japanese IME safety, no provider/domain authority invented in UI.

## G19 — Provider-neutral evidence foundation

Class: `SERIAL_GATE` for shared evidence schema, then fan-out enabler.

Depends: G10 + P13 PASS.

Purpose/scope:

```text
ConnectedAccount
ProviderSyncState
Conversation
Message
Attachment metadata
ParticipantIdentity
provider-neutral repositories/normalized fixtures
```

Required invariants:

```text
connected_accounts UNIQUE(id,user_id)
conversations UNIQUE(id,connected_account_id)
participant_identities UNIQUE(id,user_id)
messages UNIQUE(id,connected_account_id)
(connected_account_id,provider_message_id) uniqueness
Conversation.semantic_evidence_revision >= 0 and monotonic
```

Acceptance: clean real PostgreSQL migration/rebuild; tenant/account/evidence FK/uniqueness tests; evidence revision tests; normalized fixtures usable without Gmail; all P13-proven upstream prerequisites represented in production.

## G20 — Gmail authorization / watch / history / sync

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G19 + G00.

Purpose/scope: one Gmail account; minimum scopes; offline OAuth where needed; secure real-token persistence; initial sync; `users.watch`/Pub/Sub; quick authenticated acknowledgement; durable `history.list` reconciliation; renewal; periodic safety reconciliation; stale-history 404/full-sync recovery; idempotent normalization through G19; attachment evidence access.

Credential gate before first durable real token: encrypted at rest, key/secret separated from ordinary DB/repo data, no token logging, user+ConnectedAccount-scoped use, explicit reconnect/invalidation, revoke/delete when intentionally removed where supported.

Provider oracle: push is signal not truth; cursor advances only after required durability; duplicate/delayed/dropped signals converge; historical sync does not auto-activate Responsibilities.

Acceptance: named Product/provider cases in Section 10 + real Gmail evidence for claims mocks cannot prove.

## G21 — Real Source + exact Source search

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G11 + G20.

Purpose/scope: Source list/detail; provider/account provenance; authorized attachment access/fallback; authorized exact deterministic Source search; partial/sync/degraded/no-match states.

Acceptance: Source independent from Responsibility/Moment; safe rendering; authorization isolation; partial != zero; deterministic exact search; named Product/UI cases in Section 10.

## G30 — Responsibility L3 production persistence

Class: `SERIAL_GATE`.

Depends: P15 PASS/FREEZE + G19.

Prelude: create the smallest production `AIInterpretationRun` prerequisite required by frozen L2 references, including `UNIQUE(id,user_id)` and accepted User/Conversation/Message basis FKs. It is provenance/evidence infrastructure only and performs no model call.

Then: create frozen L2 Responsibility production tables/migrations in valid FK order with real G10/G19/prelude targets.

Acceptance: clean migration; every external FK target resolves to production table; proof fixtures never count; migration order inspected/tested; frozen L2 invariants true; no obsolete lifecycle enum; no AI runtime side effect.

## G31 — Deterministic Responsibility admission/reducer

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G30 + frozen normalized evidence contract; does not depend on G20/G21 completion.

Purpose/scope: `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`; `CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP`; field correction/provenance; orthogonal semantics; historical activation; deterministic projections.

Acceptance: named Responsibility oracle families + Product cases in Section 10 using deterministic fixtures.

## G32 — Attention + Temporal runtime

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G31.

Purpose/scope: Needs You/Waiting-Managed/Later/Review/Done projection; Return Attention; durable defer/expected-event/time/reply/deadline reconsideration; Temporal persistence/currentness/idempotency; Trigger.dev adapter if retained; overdue/stale/restart reconciliation.

Acceptance: named temporal/transition oracles + Product/UI cases in Section 10; DB/domain currentness remains final authority if vendor idempotency expires/fails.

## G40 — Product surfaces on real domain loop

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G11 + G21 + G31 + G32.

Purpose/scope: Home, Needs You, Managed, Review, Moment, onboarding/first delegation, supported Settings/integrity hooks.

Acceptance: strict zero; trustworthy Managed; bounded Review; source-grounded Moment; separate session/provider/integrity/domain/mutation axes; named Product/UI cases in Section 10.

## G50 — Contextual Draft / Reply / Reply All + immediate Send request

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G20 + G40.

Purpose/scope: minimal durable Draft/versioning + initial SendOperation request/pending identity; trusted connected-account sender; inspectable Reply/Reply-All recipients/body; preserved trusted reply context; manual text baseline; explicit immediate Send request. No provider dispatch in this node.

Acceptance: draft preservation; sender/recipient visibility; Japanese IME; idempotent request; offline attempt never silently sends later; manual path works without AI; trusted reply context required for G51 threading.

## G51 — Provider Send reconciliation + Responsibility re-evaluation

Class: `SERIAL_GATE` for external-effect truth.

Depends: G50 + G31 (and transitively G20/G40).

Purpose/scope: Gmail provider dispatch/reconciliation transitions on existing SendOperation; RFC-2822 MIME/base64URL serialization; correct Gmail thread intent (`threadId` + compliant `References` / `In-Reply-To` + matching Subject); ambiguous timeout handling; no blind retry; sent-message Source reconciliation; post-send reducer evidence.

Invariant:

```text
request/click != provider acceptance != operational outcome satisfied
```

Acceptance:

- current Gmail Send/threading contract rechecked at execution;
- real Gmail Reply/Reply All remains in intended thread;
- successful `messages.send` provider `Message` is reconciled into Source;
- duplicate/retry/restart/unknown-acceptance behavior is safe;
- later bounce/non-delivery evidence can re-enter reduction (PG-44);
- provider success never directly closes an unrelated operational outcome.

## G60 — Integrity / reconnect / failure closure

Class: `INTEGRATION_GATE` for reliance behavior.

Depends: G20/G21 + G32 + G40 + G51.

Purpose/scope: auth loss/reconnect/backfill; sync lag/data-through; notification delivery separation; Temporal overdue recovery; Send ambiguity; attachment degradation; mutation pending/failure; intentional disconnect vs sign-out/account deletion routing.

Acceptance: no false healthy reassurance; affected scope/last-trustworthy observation visible; reconnect healthy only after reconciliation; named failure/lifecycle cases in Section 10.

## G70 — Bounded AI interpretation + contextual AI draft

Class: `PARALLEL_AFTER_CONTRACT`.

Depends: G31 + frozen normalized evidence contract. Real-provider integration closes at G80.

Purpose/scope: two separate model schemas/evals: Responsibility interpretation candidate and editable contextual draft candidate. Uses G30-created AIInterpretationRun provenance substrate; compatible evolution only through explicit reviewed migration.

Authority: AI never owns auth/provider facts, admission/identity/effects, accepted state, tracking/defer, Temporal effects, sender/recipient authority, Send permission, or provider actions.

Acceptance: runtime schema validation; authorization/source/provenance checks; evidence-revision freshness; prompt-injection/high-harm evals; manual fallback; current model/config/data-control basis recorded; named Responsibility/Product cases in Section 10.

## G80 — Complete-loop integration

Class: `INTEGRATION_GATE`.

Depends: G21 + G31/G32 + G40 + G51 + G60 + G70.

Purpose/scope: cumulative real-provider acceptance + shared E2E fixtures.

Must prove representative real loop:

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

Also prove exact Source search, attachment evidence access, AI-unavailable manual path and restart/idempotency/ambiguity behavior.

Acceptance: Section 10 cumulative mapping + exact-head CI + real-provider evidence for claims mocks cannot establish.

## R90 — Public-beta release readiness

Class: `RELEASE_GATE`.

Depends: G80.

Purpose/scope: only public-release obligations actually required by deployment: Google OAuth verification/restricted-scope assessment where applicable, production credential/key rotation/recovery, privacy/retention/deletion commitments, current AI data controls, operational monitoring/recovery and release security/hardening.

Acceptance: release obligations have current evidence/runbooks/tests where applicable. This does not establish ICP, PMF, WTP, retention or monitoring relinquishment.

---

# 9. Execution-contract completeness matrix

This matrix is normative together with Section 8. A node is not implementation-ready if its row is absent or contradicted by the live Issue.

| Node | Owned repository/runtime boundary | Required external/live evidence | Non-goals | Merge / unblock condition |
|---|---|---|---|---|
| G00 | root Next dependency/config/lock only | current official Next security guidance | Product features; unrelated upgrade sweep; major migration | exact-head Verify+E2E PASS -> P13/P14/G11 |
| V01 | `docs/design/references/` + mapping docs only | no volatile vendor evidence required | Product/domain semantics; runtime code | textual mapping review PASS -> final pixel fidelity only |
| P13 | task-specific proof harness/tests; root deps only if proof needs them; isolated PostgreSQL namespace | current stable Drizzle/Kit/driver + real PostgreSQL 18 | production schema/routes/provider/UI; production ownership | final refreshed proof PASS -> G19 prerequisite conformance + P15 |
| P14 | task-specific auth proof/tests; root deps only if proof needs them; isolated PostgreSQL namespace | execution-time stable Better Auth + exact Drizzle/driver + real PostgreSQL 18 | production auth; Gmail OAuth; general auth UX | final refreshed 47–49 PASS -> G10 + P15 |
| P15 | review/evidence/freeze artifacts only | direct final P13/P14 evidence and exact versions | implementation; production migrations | independent PASS/FREEZE -> G30 |
| G10 | app-auth modules/routes + auth-owned migration/tests; root deps if needed | current Better Auth behavior from P14/activation | ConnectedAccount/Source; mailbox OAuth; Responsibility; Send | auth isolation/migration/session acceptance + CI -> G19 |
| G11 | app shell/layout/components/tokens/read-model fixtures/UI tests; root UI deps if needed | WCAG 2.2 current target; accepted UI contract | provider/domain truth; final pixel fidelity before V01 | structural UI/accessibility/IME + CI -> G21/G40 |
| G19 | production DB schema/migrations + provider-neutral evidence repositories/fixtures | real PostgreSQL 18 + P13-proven prerequisites | live Gmail; Responsibility tables; CRM Product; AI runtime | clean migration/invariant PASS -> G20 and, after P15, G30 |
| G20 | Gmail OAuth/provider adapter, sync ingress/jobs, credential service, provider integration tests | current Google OAuth/Gmail watch/history/PubSub docs + real provider proof where needed | redefine G19 schema except reviewed bounded migration; Responsibility; public OAuth verification | sync/security/recovery acceptance -> G21/G50/G60 |
| G21 | Source UI/BFF/read model, exact search, attachment-access path/tests | authorized real G19/G20 evidence; no new vendor fact unless provider behavior is exercised | NL/semantic Q&A; Responsibility mutation | Source/search/attachment/UI acceptance -> G40/G60/G80 |
| G30 | production AIInterpretationRun prerequisite + frozen Responsibility migrations/integration tests | P15 frozen schema + real PostgreSQL | model calls; reducer behavior; new L0/L1 semantics | all FK/migration/L2 persistence tests PASS -> G31 |
| G31 | trusted Responsibility reducer/admission/domain tests | no external vendor; current Responsibility oracle corpus | provider calls; model authority; UI-owned state | named semantic/transition oracles PASS -> G32/G40/G51/G70 |
| G32 | attention/Temporal domain modules, persistence, scheduler adapter/tests | current Trigger.dev behavior only if adapter activated | scheduler as domain authority; fake MY_TURN from timer; deferred feature activation | temporal/race/currentness acceptance -> G40/G60/G80 |
| G40 | Product page/read-model/action integration over accepted domain/provider contracts | no new vendor fact; accepted UI/Product oracles | domain/provider schema invention; broad mailbox parity | named PG/UI acceptance + CI -> G50/G60/G80 |
| G50 | Draft/SendOperation request persistence, contextual composer/action API/tests | accepted G20 capability; no provider send proof claimed here | provider dispatch; fresh Compose/Forward; Send Later/Undo; autonomous Send | draft/request/IME/offline acceptance -> G51 |
| G51 | Gmail send adapter, SendOperation dispatch/reconciliation, sent-Source reconciliation/tests | current Gmail `messages.send`, MIME/threading/scopes/quota behavior + real Gmail proof | blind retries; request=success; operational closure inference | real send/thread/reconciliation + ambiguity tests -> G60/G80 |
| G60 | integrity/reconnect/recovery application flows/read models/tests | real/simulated provider faults as claim requires; current provider recovery contract | false global failure; false healthy/zero; invented legal commitments | named failure/lifecycle PG/UI acceptance -> G80 |
| G70 | OpenAI adapter, schemas/context builder/eval corpus/run evidence; compatible AI run schema migration if proven necessary | current OpenAI Responses/Structured Outputs/data controls + selected model/config eval | accepted-state/recipient/Send/tool authority; multiple provider framework | eval/data-control/fallback PASS -> G80 |
| G80 | shared real-provider E2E fixtures/integration acceptance only | current live Gmail + all activated vendor behaviors | new Product features; broad refactor; bypass of component gates | cumulative current-v1 acceptance + exact-head CI -> R90 |
| R90 | production release config/runbooks/compliance evidence/hardening only | current Google release requirements, OpenAI data controls, deployment/privacy/security facts | Product-discovery claims; deferred Product feature activation | explicit release-readiness PASS -> public beta decision |

### Merge-asset override

Any row touching `package.json` / `pnpm-lock.yaml` inherits Section 2.1. A stale proof/test result from before another dependency-changing merge is not automatically valid.

---

# 10. Vertical-slice acceptance mapping

## 10.1 Product Golden Scenario mapping

`GOLDEN-SCENARIO-BANK.md` currently contains PG-01..PG-65. The table below maps observable responsibility without promoting conditional scenarios into v1 scope.

| Golden cases | Primary implementation owner(s) | Current disposition |
|---|---|---|
| PG-01..PG-06 core delegation / closure / multiplicity | G31/G32/G40/G51; cumulative G80 | CURRENT CORE GATE |
| PG-07..PG-13 correction/control/review | G31/G32/G40 | CURRENT CORE GATE |
| PG-14 explicit Send approval | G50/G40 | CURRENT CORE GATE |
| PG-15..PG-19 safety/review/correction evolution | G31/G40/G70 | CURRENT CORE safety gate |
| PG-20..PG-24 provider/AI/Temporal degradation | G20/G21/G32/G60/G70 | CURRENT CORE reliance gate |
| PG-25 ambiguous Send | G51/G60 | CURRENT CORE external-effect gate |
| PG-26 offline Send attempt | G50/G60 | CURRENT CORE authority-over-time gate |
| PG-27 notification channel failure | G32/G60 | CURRENT CORE integrity/delivery-separation gate |
| PG-28 attachment preview failure with access fallback | G21/G60 | CORE attachment access; native preview itself not required |
| PG-29 AI draft failure | G50/G70 | CURRENT CORE manual-fallback gate |
| PG-30 material miss / trust repair | G60 | CURRENT CORE reliance gate |
| PG-31 initial sync incomplete | G20/G21/G40/G60 | CURRENT CORE bootstrap-integrity gate |
| PG-32 intentional disconnect | G40/G60 | CURRENT CORE lifecycle gate |
| PG-33 unexpected auth loss/reconnect | G20/G60 | CURRENT CORE recovery gate |
| PG-34 re-add after intentional disconnect | G20/G60 | CURRENT CORE intent-boundary gate |
| PG-35/36 permission-scope separation | G20/G50/G60 | CURRENT CORE capability/integrity gate |
| PG-37 class-scoped delegation toggle | future owner G32/G40/G60 | **NOT CURRENT GATE**; Feature Matrix keeps class-level automation late/post-v1 unless validated |
| PG-38 unsupported post-v1 controls absent | G40 | CURRENT v1 negative-scope gate |
| PG-39 app sign-out != provider disconnect | G10/G40 | CURRENT CORE session-boundary gate |
| PG-40 Product-account deletion | G40/G60 + R90 exact release commitments | CURRENT boundary; exact legal/retention commitments only at release authority |
| PG-41 intentionally monitoring nothing | G31/G32/G40 | CURRENT CORE truthful-zero gate |
| PG-42..PG-51 communication/evidence edge cases | G19/G20/G31/G51/G70 as applicable | CURRENT semantic/provider regression gate; no extra UI breadth implied |
| PG-52 calendar mail boundary | G31/G70 | CURRENT negative-authority regression; no calendar Product activation |
| PG-53..PG-58 Managed/Review/zero/search | G21/G31/G32/G40/G60 | CURRENT CORE projection/retrieval gate |
| PG-59 People/History no-context restraint | future/conditional G21/G40/G70 | **NOT CURRENT GATE**; People/relationship context remains V1 STRONG CANDIDATE |
| PG-60 valid No Responsibility | G31/G70 + Source G21 | CURRENT CORE admission/failure-separation gate |
| PG-61/62 unknown/degraded != zero | G20/G21/G40/G60 | CURRENT CORE epistemic-integrity gate |
| PG-63/64 quiet-hours behavior | future/conditional G32/G60/R90 | **NOT CURRENT GATE**; quiet-hours remains V1 STRONG CANDIDATE unless promoted |
| PG-65 provider/security attachment block | G20/G21/G60 | CURRENT CORE attachment-security/integrity gate |

G80 does **not** require every current semantic case to use a costly live-provider setup. It requires a representative real-provider cross-boundary subset plus all relevant deterministic component/oracle suites. At minimum G80 real-provider integration includes PG-01..05, PG-20/21, PG-25/26 where practical, PG-31/33/35/36, PG-44, PG-51, PG-55/58/60/61/62 and PG-65 as provider behavior permits. Other current semantic scenarios may close through deterministic trusted-domain/UI evidence where that is the stronger oracle.

## 10.2 Responsibility oracle mapping

Named sources avoid ambiguous “relevant oracle” wording:

| Node | Responsibility evidence authority |
|---|---|
| P13 | `L2-EXECUTABLE-PROOF-GATE.md` acceptance 01–46 and 50–60 except 47–49; current DDL/freeze review |
| P14 | `L2-EXECUTABLE-PROOF-GATE.md` 47–49 + ADR 0005 UUID premise |
| P15 | complete `L2-EXECUTABLE-PROOF-GATE.md` 01–60 + generated SQL/direct P13/P14 evidence |
| G30 | frozen `POSTGRESQL-DRIZZLE-DDL-DESIGN.md` after P15 + `PHYSICAL-SCHEMA-FREEZE-REVIEW.md` |
| G31 | `COVERAGE-PLAN.md`, `TIER-0-SCENARIO-MATRIX.md`, `TIER-0-CRITICAL-ORACLES.md`, detailed Tier-0 oracle batches, `TRANSITION-SCHEMA.md`, `TRANSITION-ORACLES.md` |
| G32 | `TRANSITION-SCHEMA.md`, `TRANSITION-ORACLES.md`, temporal/currentness scenarios from Tier-0 corpus |
| G40 | deterministic projection consequences from G31/G32 + Product Golden/UI oracles; never a new semantic authority |
| G51 | transition/oracle cases involving send evidence/re-evaluation; Product PG-01/25/44 supply user-facing consequence |
| G70 | `COVERAGE-PLAN.md`, Tier-0 scenario/oracle corpus and `TRANSITION-ORACLES.md` **only for the model-owned interpretation layer**; model eval alone never proves reducer/send/scheduler behavior |
| G80 | cumulative Product Golden mapping + direct Responsibility component evidence from G31/G32/G51; no semantic truth is redefined in E2E |

## 10.3 UI implementation acceptance mapping

`docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` owns the stable UI-01..UI-20 meanings. This graph **must not rename or reinterpret those IDs**. Cross-cutting keyboard/focus/IME/accessibility/status requirements are owned by UI-contract Sections 25–26 and 34, not by an invented UI screen ID.

| Canonical UI ID | Canonical surface | Primary implementation owner(s) |
|---|---|---|
| UI-01 | App sign-in / session | G10 + G11/G40 presentation |
| UI-02 | Home | G40; G60 supplies integrity state |
| UI-03 | Needs You | G40 |
| UI-04 | Moment | G40 |
| UI-05 | Managed summary/list | G40; G60 supplies integrity state |
| UI-06 | Managed detail | G32/G40; G60 supplies integrity state |
| UI-07 | Review | G31/G40 |
| UI-08 | Source list | G21 |
| UI-09 | Source Conversation | G21 |
| UI-10 | Contextual Reply / Reply All / Send | G50/G51; G70 supplies optional bounded draft candidate |
| UI-11 | Search / retrieval | G21 |
| UI-12 | Attachment evidence access | G20/G21; G60 handles degraded/security boundary |
| UI-13 | Connect mailbox | G20 + G40 presentation |
| UI-14 | Initial sync | G20/G21 + G40 presentation; G60 for degraded failure |
| UI-15 | First delegation | G31/G32/G40; G70 interpretation candidate where activated |
| UI-16 | Integrity / reconnect | G20/G32/G40/G60 |
| UI-17 | Settings | G40/G60; G10 for app-session action semantics |
| UI-18 | Intentional disconnect | G20/G31/G32/G40/G60 |
| UI-19 | Product-account deletion | G40/G60 boundary + R90 release commitments |
| UI-20 | Scoped system/fallback presentation | G21/G32/G40/G50/G60/G70 as the affected capability requires |

V01 supplies visual references only; it does not replace any UI-ID behavioral acceptance.

Cross-cutting UI acceptance additionally binds all affected owners to:

- UI contract Sections 25–26: keyboard, focus, IME, WCAG 2.2 AA;
- Section 31: material state matrix;
- Section 33: Product Golden routing;
- Section 34: static/component, interaction, keyboard/accessibility, responsive and visual verification.

## 10.4 Provider/auth/integrity acceptance

- G10: signed-out/signed-in/expiry/re-auth isolation and app sign-out != monitoring stop; PG-39 + UI-01/UI-17.
- G20: mailbox connect/token security, initial sync, watch/history renewal/recovery, reconnect/disconnect provider effects and permission split; PG-20/21/31/32/33/34/35/36/44/51/61/65 as applicable + UI-13/UI-14/UI-16/UI-18.
- G51: real Gmail MIME/threading/send response, unknown acceptance/no blind retry and sent-Source reconciliation; PG-01/25/44 + UI-10.
- G60: affected-scope degradation/reconnect/backfill/no-false-zero/no-false-healthy plus lifecycle failure integration; PG-20..30, PG-32..36, PG-40, PG-61/62/65 + UI-02/UI-05/UI-06/UI-12/UI-14/UI-16/UI-18/UI-19/UI-20 as applicable.
- G80: cross-boundary evidence verifies component claims still compose correctly on the exact candidate.

---

# 11. Actual Issue creation rule

After #58 itself passes full cumulative audit + exact-head CI and merges, create/reconcile implementation Issues from these nodes. Each executable Issue must copy enough of its Section 8 + Section 9 + Section 10 contract to execute without chat-only interpretation:

- stable purpose and owned files/boundaries;
- prerequisites and exact accepted base;
- acceptance tests/oracles;
- required current external/live evidence;
- non-goals;
- parallel class + collision assets;
- merge/unblock condition.

Do not launch broad implementation from chat-only descriptions.

Existing #13/#14/#15 are reconciled ahead of that creation wave because they predate #58 and are already durable proof/freeze nodes.

# 12. Final graph acceptance oracle

Issue #58 may pass only if all are true:

1. main baseline/current implementation fact is correct;
2. current Product/UI/Responsibility authorities are preserved;
3. every current CORE capability has an owner;
4. conditional Golden cases are explicitly non-gates rather than scope creep;
5. every production external FK target has a topological owner/order;
6. proof fixtures are never production dependencies;
7. P13/P14/P15 gates are not waived;
8. every node has purpose/scope/boundary, prerequisites, acceptance, external/live evidence, non-goals, parallel class and merge/unblock condition;
9. Product Golden / Responsibility / UI/provider/integrity mappings are explicit;
10. every stable canonical ID used by the graph preserves the exact meaning in its owning artifact; cross-cutting requirements do not hijack unrelated IDs;
11. shared root manifest/lockfile parallel-merge collisions are controlled;
12. vendor evidence coverage includes both Gmail sync **and Send/threading** and is date-scoped;
13. provider/AI/scheduler capabilities do not become authority or activate deferred features;
14. conceptual capability-superset documents explicitly distinguish deferred/future capability from current graph activation where ambiguity could create work;
15. no second-provider/full-client scope is smuggled in;
16. all current routing/ADRs/live pre-existing proof Issues materially affected by this graph are reconciled;
17. final candidate receives a full cumulative acceptance audit;
18. exact-head Verify/E2E CI passes before merge.
