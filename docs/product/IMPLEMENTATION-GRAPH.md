# Lunowa Minimum Complete Delegation Loop — Implementation Graph

## Status / authority

**Implementation dependency and activation authority candidate for Issue #58, reconciled 2026-08-28 after two full acceptance-audit rounds.**

This graph translates accepted Product / Responsibility / UI / architecture contracts into executable work. It does **not** redefine Product semantics, Responsibility semantics, provider facts, or empirical Product claims.

After merge, this file owns implementation dependency/parallelization questions together with live GitHub Issues. Generic architecture/module presence is not implementation authorization.

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

This is the **Minimum Complete Delegation Loop**.

Current CORE retrieval also includes **authorized exact Source search**.

Not current prerequisites:
- Microsoft provider;
- broad multi-account Scope UX;
- Person/CRM context;
- Pin;
- generic fresh Compose parity;
- Forward parity;
- Send Later parity;
- generic Undo Send / recall;
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

Each zone has one owning node/merge order:

| Collision zone | Owner / ordering |
|---|---|
| framework/package security baseline | G00 before production-feature fanout |
| Better Auth user/session schema | P14 proof -> G10 production activation |
| Source/provider production schema (`ConnectedAccount`, sync, Conversation/Message/Attachment) | G20 after P13 upstream-prerequisite PASS |
| Responsibility physical schema | P13/P14 -> P15 -> G30 |
| Responsibility reducer / accepted state | G31 |
| Temporal intent/trigger schema/currentness | G32 |
| central Product read models | G40 integration over G11/G21/G31/G32 |
| Draft + initial SendOperation schema/request state | G50 |
| provider dispatch/reconciliation transitions | G51 serialized after G50 |
| root shell/global design tokens | G11, final visual fidelity after V01 |
| shared real-provider E2E fixtures | G80 integration owner |

Parallel tasks may consume a frozen contract but may not independently redefine these zones.

---

# 4. Corrected dependency DAG

```text
#58 graph freeze
   |
   +--> G00 patched framework security baseline -------------------------------+
   |                                                                           |
   +--> V01 final visual-reference pass ---------------------------------------|----> final UI visual fidelity
   |                                                                           |
   |     after G00                                                             |
   +--> P13 Responsibility PostgreSQL/Drizzle proof --------+                   |
   +--> P14 Better Auth UUID proof -------------------------+--> P15 L2 freeze  |
             |                                               |                  |
             v                                               v                  |
          G10 app auth/session                           G30 Responsibility L3   |
             |                                               |                  |
             |                                               v                  |
             |                                     G31 deterministic reducer ---+---+
             |                                               |                      |
             |                                               v                      |
             |                                     G32 attention/Temporal           |
             |                                                                      |
P13 PASS ----+--> G20 Gmail + Source persistence/sync ----------------+             |
             |                                                        |             |
             +--> provider protocol/normalization can be prepared     v             |
                                                            G21 Source UI + exact search
                                                                     |              |
G00 + #55 --> G11 structural UI shell/read-model harness ------------+--------------+
                                                                                    |
G20 + G31 --------------------------------------------------> G70 bounded AI lane   |
                                                              |                     |
                                                              |                     v
G11 + G21 + G31 + G32 --------------------------------------> G40 Product surfaces
                                                                                    |
G20 + G40 --------------------------------------------------> G50 Draft + contextual immediate Send
                                                                                    |
G31 + G50 --------------------------------------------------> G51 provider Send reconciliation
                                                                                    |
G20/G21 + G32 + G40 + G51 ---------------------------------> G60 integrity/recovery
                                                                                    |
G21 + G31/G32 + G40 + G51 + G60 + G70 --------------------> G80 complete-loop integration
                                                                                    |
                                                                                    v
                                                                           R90 public-beta release gates
```

Important safe parallelism:
- G31/G32 do **not** wait for live Gmail/Source implementation; they consume the frozen normalized-evidence contract + deterministic fixtures after G30.
- G20/G21 and G31/G32 therefore proceed in parallel once their own gates pass.
- G40 is the integration point where real Source and real domain projections meet.
- G70 can begin after G20 normalized authorized Source contract + G31 candidate/reducer boundary exist; it does not wait for G60.

---

# 5. Node contracts

## G00 — Patched framework security baseline

Class: `SERIAL_GATE`

Why:
- repo baseline pins Next.js 16.3.0 while current 2026-08-25 Active-LTS security guidance requires 16.3.3 for two Critical fixes.

Scope:
- update within accepted patched 16.3 line;
- align directly coupled `eslint-config-next` / lockfile only as required;
- run bootstrap verification + browser smoke;
- record exact versions.

Non-goals:
- Product features;
- unrelated dependency sweep;
- framework-major migration.

Acceptance:
- accepted patched line contains current Critical fixes;
- `pnpm verify` + E2E smoke PASS exact head;
- no bootstrap regression.

Unblocks:
- production-feature write-heavy branches.

## V01 — Final current visual-reference pass

Class: `PARALLEL_SAFE` after #58 merge.

Scope:
- current Home / Needs You / Managed / Review / Moment / Source and lifecycle/integrity visual references;
- representative desktop/compact/mobile direction;
- explicit mapping to textual states.

Boundary:
- textual Product/UI authority wins;
- generated references cannot invent semantics/features.

Acceptance:
- CORE hierarchy/state coverage;
- no contradiction with `V1-UI-IMPLEMENTATION-CONTRACT.md`;
- references README states authority/routing.

Blocks:
- pixel-sensitive final visual fidelity only, not backend/domain/provider work.

## P13 — Responsibility L2 PostgreSQL/Drizzle executable proof

Class: `PARALLEL_SAFE` with P14 after G00; existing Issue #13.

Owns:
- proof IDs 01–46 and 50–60 except 47–49;
- real PostgreSQL 18;
- exact stable Drizzle ORM/Kit/driver pin;
- generated SQL inspection;
- true concurrent transaction evidence;
- upstream ownership/index/evidence-revision prerequisites under the L2 candidate.

No production migration.

PASS also authorizes G20 to implement its independent Source schema **conforming to the proven upstream prerequisites**; P15 still gates Responsibility-owned production tables.

## P14 — Better Auth UUID persistence proof

Class: `PARALLEL_SAFE` with P13 after G00; existing Issue #14.

Owns acceptance 47–49.

At execution:
- current stable Better Auth exact pin;
- explicit supported UUID strategy;
- real PostgreSQL 18;
- exact Drizzle/driver versions;
- generated schema/catalog inspection;
- no production OAuth credentials.

PASS unblocks G10 and contributes to P15.

## P15 — Responsibility L2 independent freeze

Class: `SERIAL_GATE`; existing Issue #15.

Depends:
- P13 concrete PASS evidence;
- P14 concrete PASS/equivalent accepted evidence.

Owns:
- independent review of 01–60;
- exact schema/generated SQL/PostgreSQL/concurrency/UUID evidence;
- explicit `PASS/FREEZE` or `FAIL/REVISE`.

Only PASS/FREEZE unblocks G30 Responsibility production persistence.

## G10 — Application session/auth production activation

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G00;
- P14 PASS.

Single-writer scope:
- activate Better Auth application identity/session;
- auth-owned User/session/account-support tables only as required by Better Auth;
- server-side session validation/protected BFF boundary;
- committed SQL migration for auth-owned schema;
- session revoke/sign-out behavior.

Explicitly **not owned here**:
- ConnectedAccount;
- ProviderSyncState;
- Conversation / Message / Attachment;
- Responsibility;
- Temporal tables;
- Draft / SendOperation.

Acceptance:
- signed-out/signed-in/expiry/re-auth behavior matches UI contract;
- real PostgreSQL UUID ownership contract proven in production-shaped integration;
- authorization isolation tests;
- no provider credential storage/authority through Better Auth social-account records.

## G11 — Product UI shell + read-model/accessibility harness

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G00;
- frozen Issue #55 textual UI contract.

V01 is required only before final pixel-sensitive styling.

Scope:
- global shell/navigation/responsive routing/panes/sheets;
- semantic tokens/primitives;
- typed UI read-model interfaces/fixtures;
- Home/Needs You/Managed/Review/Moment/Source structural surfaces;
- loading/partial/degraded/session/provider/mutation fixture states;
- keyboard/focus/IME/accessibility harness.

No domain/provider authority.

Acceptance:
- Issue #55 state/interaction cases structurally executable;
- WCAG 2.2 AA testable baseline;
- Japanese IME safety where editable input exists;
- fixtures visibly distinguished from canonical state ownership.

## G20 — Gmail authorization + Source persistence/synchronization

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G00;
- G10 authenticated user/session boundary;
- **P13 PASS for current upstream Source-schema prerequisites**.

Provider protocol/normalization fixtures that do not write production schema may be prepared earlier after G00; production schema/integration remains owned here.

Single-writer Source schema scope:
- ConnectedAccount;
- ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- exact upstream uniqueness/index/evidence-revision invariants required by current L2 candidate/proof;
- committed SQL migrations.

Provider scope:
- one Gmail account path;
- minimum scopes for implemented behavior;
- offline OAuth when background access required;
- initial sync;
- `users.watch` / PubSub ingress;
- authenticated quick acknowledgement + durable reconciliation;
- `history.list` cursor reconciliation;
- watch renewal;
- periodic safety reconciliation;
- stale history/404 full-sync recovery;
- normalized idempotent upsert;
- safe attachment evidence access.

### Credential security gate

Before the **first durable persistence of a real Gmail refresh/access token**:
- store token material securely and encrypted at rest/application boundary as appropriate to the server architecture;
- encryption key/secret not committed with app/DB data;
- never log token material;
- token lookup/use scoped to authenticated user + ConnectedAccount ownership;
- revoke/delete token material when access is intentionally removed where provider support permits;
- handle token invalidation/revocation explicitly.

A bounded non-persistent local OAuth protocol spike may avoid durable token storage. Plaintext durable token storage is not an accepted intermediate state.

Core oracles:
- `(connected_account_id, provider_message_id)` uniqueness;
- proven L2 upstream indexes/revision requirements preserved;
- cursor advances only after required local durability;
- push payload never mutates Responsibility;
- duplicate/delayed/dropped push converges through reconciliation;
- source chronology preserved;
- initial history does not auto-activate Responsibilities.

Acceptance Product cases:
- PG-20, 21, 28, 31, 33, 35, 36.

Non-goals:
- Microsoft;
- broad Gmail mailbox-mutation parity;
- public OAuth verification/security assessment completion.

## G21 — Real Source Conversations + exact Source search

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G11 structural UI shell;
- G20 normalized real Source data/read contract.

Scope:
- Source conversation list/detail;
- provider/account/source provenance;
- safe attachment evidence open/download/provider fallback;
- **authorized exact Source search — V1 CORE**;
- partial/syncing/degraded/search-no-match behavior.

Search boundary:
- current user/account/scope authorization always applied;
- no-match remains truthful and preserves query/scope;
- exact search does not advertise natural-language Q&A;
- semantic similarity never merges Responsibilities.

Acceptance:
- Source works without Responsibility/Moment;
- partial/unknown never becomes true zero;
- provider content safely rendered/sanitized;
- exact search retrieves authorized source deterministically;
- PG-22, 23, 28, 31 + UI Search contract.

## G30 — Responsibility L3 production persistence

Class: `SERIAL_GATE`

Depends:
- P15 PASS/FREEZE;
- G10 auth user ownership boundary.

Consumes Source upstream contract proven by P13; live G20 completion is not required to build/test with deterministic fixtures.

Scope:
- smallest frozen Responsibility production schema/migrations;
- provenance/evidence revision/currentness;
- accepted ownership/FK/idempotency constraints;
- migration/evolution harness.

No generic workflow schema/AI/provider behavior.

Acceptance:
- frozen L2 invariants remain executable in production-shaped integration;
- committed SQL migrations;
- tenant/account/FK/idempotency constraints retained;
- no lifecycle-enum collapse.

## G31 — Deterministic Responsibility admission / reducer

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G30;
- frozen normalized Source/evidence contract in `CONTRACTS.md` and canonical Responsibility oracles.

**Does not depend on G20/G21 completion.** Use deterministic normalized fixtures while provider lane runs in parallel.

Scope:
- `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`;
- `CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP`;
- field correction/provenance;
- orthogonal semantic dimensions;
- historical activation policy;
- deterministic projections/read inputs.

Acceptance:
- relevant Tier-0 / transition / high-harm oracles;
- PG-05–19 semantic consequences;
- no historical backlog auto-activation.

## G32 — Attention + Temporal Contract runtime

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G31 accepted Responsibility boundary.

Scope:
- Needs You / Waiting-Managed / Later / Review / Done projections;
- Return Attention Now without fake actionability;
- intentional defer + durable Temporal Contract;
- expected event/time/reply/deadline reconsideration as accepted;
- Temporal persistence/currentness/idempotency;
- Trigger.dev execution adapter if retained;
- overdue/stale/restart reconciliation.

Trigger runtime oracle:
- vendor idempotency scope/TTL/failed-run clearing is never sole guarantee;
- persisted DB/domain intent/version owns currentness;
- each run reloads/re-authorizes/revalidates;
- stale/superseded trigger = audited no-op;
- trigger fire != notification/MY_TURN automatically.

Acceptance:
- PG-01–04, 09–10, 18, 24, 27 + Responsibility temporal/race oracles.

## G40 — Product surfaces on the real domain loop

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G11 shell/read-model harness;
- G21 real Source/exact search;
- G31/G32 real domain projections.

Scope:
- Home;
- Needs You;
- Managed;
- Review;
- Moment;
- onboarding/first delegation;
- relevant Settings/integrity hooks.

Acceptance:
- strict true-zero;
- trustworthy Managed reassurance only;
- bounded typed Review;
- source-grounded Moment;
- session/provider/integrity/domain/mutation axes distinct;
- applicable PG-01–24 + Issue #55 acceptance.

## G50 — Contextual Draft / Reply / Reply All + explicit immediate Send request

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G20 Gmail connected-account/send-capability contract;
- G40 active Moment/Source context.

Single-writer persistence scope:
- minimal durable Draft schema/versioning required by active contextual reply flow;
- minimal SendOperation schema and **request/pending** state contract required for immediate Send;
- explicit operation/idempotency identity;
- no delayed-send scheduling model.

UI/action scope:
- contextual Reply / Reply All;
- explicit effective sender;
- inspectable/editable recipients/body;
- manual text composer baseline;
- explicit **IMMEDIATE** user Send request;
- conditional attachment add only if separately accepted for the active slice.

Reserved/deferred:
- Forward parity;
- Send Later;
- generic Undo/recall;
- silent offline queued send.

Acceptance:
- draft persists through relevant navigation/layout/re-auth recovery boundaries;
- effective sender/recipients visible;
- Japanese IME safe;
- duplicate commit request prevented;
- offline attempt preserves draft and never later sends silently;
- PG-14, 26, 29 manual-fallback portion.

## G51 — Provider Send dispatch/reconciliation + Responsibility re-evaluation

Class: `SERIAL_GATE` for external-effect truth.

Depends:
- G50 accepted Draft/SendOperation schema/request contract;
- G31 reducer.

Owns:
- provider dispatch transitions on the G50 SendOperation schema;
- provider result mapping;
- ambiguous timeout reconciliation;
- no blind duplicate retry;
- sent-message Source reconciliation;
- post-send Responsibility re-evaluation.

Invariant:

```text
request/click != provider acceptance != operational outcome satisfied
```

Acceptance:
- PG-01, 05, 25, 26;
- duplicate/retry/restart/ambiguous-result tests.

## G60 — Integrity / reconnect / failure closure

Class: `INTEGRATION_GATE` for reliance behavior.

Depends:
- G20/G21 provider/source;
- G32 temporal runtime;
- G40 surfaces;
- G51 send path.

Scope:
- auth loss/reconnect/backfill;
- sync lag/data-through;
- notification-delivery separation;
- scheduler overdue recovery;
- send ambiguity;
- attachment access degradation;
- persisted setting/mutation pending/failure;
- intentional mailbox disconnect vs app sign-out;
- Product-account deletion boundary routing for public release.

Acceptance:
- PG-20–38 applicable cases;
- no false healthy reassurance, false zero or infrastructure-generated fake Responsibility.

## G70 — Bounded AI interpretation + contextual draft assistance

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G20 authorized normalized Source/context contract;
- G31 trusted candidate/reducer input boundary;
- current OpenAI data-control/eval gate.

**Does not depend on G60.** It may run in parallel with G32/G40/G50/G60 once shared interfaces are frozen.

Two separate bounded AI contracts:

### A. Responsibility interpretation candidate
- communication acts/claims;
- obligation-bearer/action/event/temporal candidates;
- uncertainty/provenance;
- strict structured output;
- never accepted-state authority.

### B. Contextual AI draft candidate — V1 CORE target
- only inside an active authorized Moment/Conversation reply context;
- editable candidate body, not a send command;
- sender/recipients remain trusted application data;
- no provider action/tool execution;
- manual composer always available.

Shared requirements:
- official OpenAI SDK + Responses API;
- minimum authorized context;
- strict runtime schema/source/provenance validation;
- evidence revision/basis where applicable;
- `store:false` where appropriate without calling it ZDR;
- actual org/project retention mode reviewed;
- no indiscriminate raw mail/prompt/output logging;
- current model chosen by layered eval + holdout;
- high-harm/prompt-injection/ambiguity cases.

Acceptance:
- interpretation layered eval + forbidden outcomes;
- draft quality/safety/recipient-authority tests separately;
- PG-13, 15–19, 22, 23, 29, 30 as applicable;
- AI failure leaves Source/manual Reply functional.

## G80 — Minimum Complete Delegation Loop E2E

Class: `INTEGRATION_GATE`

Depends:
- G21 real Source + exact search;
- G31/G32 domain/temporal;
- G40 Product surfaces;
- G51 external Send truth;
- G60 integrity/recovery;
- **G70 accepted AI-assisted normal path**.

AI is required as an implemented Product assistance path, while G80 must also prove the system remains safe/usable when AI is unavailable.

Mandatory representative loops:
1. user request/send -> provider reconciles -> Waiting/Managed;
2. progress reply -> stays quiet;
3. action-required reply -> Needs You/Moment;
4. no-reply valid trigger -> reload/re-evaluate before return;
5. contextual AI draft candidate -> user edit/explicit send -> provider reconciliation -> Waiting/truthful closure;
6. same action with AI unavailable -> manual reply path succeeds;
7. provider auth/sync loss -> Integrity -> reconnect/backfill -> restored reassurance;
8. ambiguous Send -> guarded reconciliation/no duplicate;
9. exact Source search/source attachment fallback remains available.

Primary oracles:
- PG-01–05, 20–29, 31–36;
- relevant Responsibility transition/high-harm oracles;
- Issue #55 screen/state/accessibility cases.

Exit:
- exact-head CI/browser E2E;
- real Gmail integration evidence;
- complete-loop acceptance evidence;
- full cumulative independent audit;
- no unresolved material blocker.

## R90 — Public-beta release readiness

Class: `RELEASE_GATE`

Does not block local/private G80 proof, but blocks public release where applicable.

Includes:
- Google OAuth verification/restricted-scope security assessment for actual scopes/deployment;
- privacy/retention/deletion commitments implemented/tested;
- production credential key rotation/revocation/operations beyond G20 minimum secure-at-rest requirement;
- production secrets/region/backup/restore/observability;
- current OpenAI data-control/privacy posture;
- release accessibility/browser/device matrix;
- security/abuse review and recovery/support runbooks.

Passing R90 does not establish PMF/ICP/WTP.

---

# 6. Safe parallel waves

## Wave 0 — after #58 merge

- G00 runtime security baseline is first and serial for production-feature code.
- V01 visual-reference work may run immediately because it is non-runtime and uses merged textual authority.

## Wave A — after G00

Parallel isolated proof/structural work:
- P13 Responsibility L2 proof;
- P14 Better Auth UUID proof;
- G11 structural UI harness (no final pixel-sensitive fidelity until V01 completes).

P13/P14 use separate worktrees and PostgreSQL/Docker/runtime namespaces.

Provider protocol/normalization fixtures that do not install conflicting production schema may be prepared under a separately bounded task only after frozen #58 contracts, but G20 production Source schema waits for P13 PASS + G10.

## Wave B — proof-derived foundations

After P14 PASS:
- G10 application auth/session production activation.

After P13 + P14 evidence:
- P15 independent L2 review/freeze runs.

After P13 PASS + G10:
- G20 Gmail + Source production persistence/sync may begin while P15 performs/finishes independent Responsibility review.

## Wave C — parallel provider/domain lanes

After P15 PASS:
- G30 Responsibility L3.

Then:
- G31 -> G32 deterministic domain/temporal lane using normalized fixtures;
- G20 -> G21 real provider/Source lane;
- G11/V01 UI lane;
can progress in parallel subject to their own readiness.

G40 integrates the three lanes.

G70 may begin after G20 authorized normalized context + G31 candidate/reducer contract; it need not wait for G40/G60.

## Wave D — consequential integration

Prefer serialized external-effect/integration order:

```text
G40 -> G50 -> G51 -> G60 -> G80
```

Subcomponent/eval work may parallelize, but central read models, Draft/SendOperation schema, provider dispatch truth and integrity restoration each retain one integration owner.

---

# 7. V1 CORE coverage matrix

Every current `V1 CORE` / `V1 CORE target` row is assigned or explicitly release-gated.

| Product capability | Owning node/gate |
|---|---|
| one-provider Source read | G20/G21 |
| ingestion/reconciliation | G20 |
| Responsibility admission/update | G30/G31 + G70 assistance |
| No Responsibility / abstention | G31/G70 |
| Needs You / Moment / Managed / Review / Source | G40/G21 |
| temporal monitoring/reconsideration | G32 |
| Later / return condition | G32/G40 |
| field correction | G31/G40 |
| Return Attention / Stop Tracking | G32/G40 |
| integrity/degraded UX | G60 |
| reconnect + interval reconciliation | G20/G60 |
| intentional disconnect | G60 |
| Product-account deletion boundary | G60 + R90 exact policy/operation |
| capability-conditional Settings | G40/G60 + R90 release completeness |
| contextual Reply/Reply All | G50 |
| bounded contextual AI draft | G70 + G50 integration/G80 |
| explicit user Send | G50 |
| send reconciliation/ambiguity | G51 |
| exact Source search | G21 |
| operational retrieval sufficient for current cases | G21/G40 |
| authorized attachment evidence access | G20/G21 |

Strong Candidate/Deferred rows are not silently promoted by this graph.

---

# 8. Merge discipline

Every node:

```text
current accepted base
-> isolated branch/worktree + runtime namespace
-> task implementation/evidence
-> local verification
-> PR
-> exact-head CI
-> full cumulative acceptance audit
-> batched corrections if FAIL
-> merge
-> downstream edge READY
```

Builder summaries never substitute for actual merged source/generated artifacts/test evidence/CI.

Repeated correction failure triggers specification/test-oracle/architecture/decomposition/verification root-cause review before another patch loop.

---

# 9. Empirical boundary

Issue #36 remains open.

Graph/G80 completion does not prove:
- exact ICP;
- market problem frequency/severity;
- monitoring relinquishment;
- PMF;
- WTP/pricing;
- retention;
- superiority to users' real current workflows.