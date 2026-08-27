# Lunowa Minimum Complete Delegation Loop — Implementation Graph

## Status / authority

**Implementation dependency and activation authority candidate for Issue #58, dated 2026-08-28.**

This graph translates accepted Product / Responsibility / UI / architecture contracts into executable work. It does **not** redefine Product semantics, Responsibility semantics, provider facts, or empirical Product claims.

After merge, this file owns current implementation dependency/parallelization questions together with live GitHub Issues. If a generic architecture/module inventory mentions a broader capability, that mention is **not implementation authorization** unless this graph or a later accepted task activates it.

Primary authorities:

- `PRODUCT.md` / `PRODUCT-CONTENT.md`;
- `GOLDEN-SCENARIO-BANK.md`;
- `../design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design files;
- `responsibility/` semantic and persistence oracles;
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
-> explicit immediate Send
-> provider reconciliation
-> Responsibility re-evaluation
-> truthful healthy/degraded integrity
```

This is the **Minimum Complete Delegation Loop**.

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
- natural-language Search;
- autonomous Send;
- generic workflow/rule engine.

## 2. Parallelization classes

- `SERIAL_GATE` — shared/security/semantic authority that downstream tasks may not bypass.
- `PARALLEL_SAFE` — isolated ownership and acceptance; may run concurrently from the same accepted base using repository runtime-isolation preflight.
- `PARALLEL_AFTER_CONTRACT` — can fan out only after named shared contract/gate is frozen.
- `INTEGRATION_GATE` — cumulative vertical-loop acceptance; no component self-report can substitute.
- `RELEASE_GATE` — required for public release but not for local/private complete-loop proof.

## 3. Collision zones

Treat these as high-conflict ownership zones:

```text
package.json / pnpm-lock.yaml / runtime versions
application auth user-ID contract
production DB schema + migrations
Responsibility physical schema + reducer
provider sync cursor/watch contract
central Product read models
Temporal trigger schema/currentness
Draft / SendOperation state
root app shell / global design tokens
shared E2E fixtures
```

Two concurrent tasks must not independently redefine one collision zone.

---

# 4. Dependency DAG

```text
#58 graph freeze
   |
   +--> G00 Security baseline -----------------------------+
   |                                                       |
   +--> V01 Final visual-reference pass -------------------|----> UI visual implementation
   |                                                       |
   +--> P13 Responsibility L2 PG/Drizzle proof --------+   |
   |                                                   |   |
   +--> P14 Better Auth UUID proof --------------------+--> P15 L2 independent freeze
                                                       |        |
                                                       |        v
G00 + P14 --> G10 App auth + base persistence ---------+--> G30 Responsibility L3 persistence/runtime
       |             |                                           |
       |             +--> G20 Gmail auth/provider/source sync ---+
       |                              |                            |
       |                              +--> G21 Source read UI -----|---+
       |                                                           |   |
G00 + V01 --> G11 Product UI shell/read-model harness -------------+   |
                                                                   v   v
                                                        G31 Deterministic Responsibility reducer
                                                                   |
                                                                   v
                                                        G32 Attention + Temporal runtime
                                                                   |
                                                                   v
                                                        G40 Product surfaces on real loop
                                                                   |
G20 ---------------------------------------------------------------+--> G50 contextual Reply + immediate Send
                                                                        |
                                                                        v
                                                             G51 send reconciliation + domain re-eval
                                                                        |
                                                                        v
                                                             G60 Integrity/recovery closure
                                                                        |
                                                                        +--> G70 bounded AI interpretation
                                                                        |
                                                                        v
                                                             G80 complete-loop integration
                                                                        |
                                                                        v
                                                             R90 public-beta release gates
```

`G70` may begin after the deterministic interpretation/reducer interface is frozen, but AI is not allowed to block Source/manual communication or become the authority for G80.

---

# 5. Node contracts

## G00 — Patched framework security baseline

Class: `SERIAL_GATE`

Why:
- repository currently pins Next.js 16.3.0 while the current Active-LTS security baseline is 16.3.3 as of 2026-08-28.

Scope:
- update Next.js within accepted patched 16.3 line;
- align directly coupled `eslint-config-next` / lockfile only as required;
- re-run bootstrap verification and browser smoke;
- record exact versions.

Non-goals:
- Product UI implementation;
- unrelated dependency upgrades;
- framework-major migration.

Acceptance:
- no known current Critical Next.js advisory left by the pinned accepted line;
- `pnpm verify` + E2E smoke PASS on exact head;
- no bootstrap behavior regression.

Unblocks:
- every production-feature implementation branch.

## V01 — Final current visual-reference pass

Class: `PARALLEL_SAFE` after Issue #58 graph freeze; blocks pixel-sensitive visual implementation only.

Why:
- Product/UI/architecture textual contracts are now sufficiently frozen to avoid regenerating references on every semantic correction.

Scope:
- produce current visual references for the accepted Home / Needs You / Managed / Review / Moment / Source / lifecycle states;
- preserve textual authority over imagery;
- record which reference maps to which screen/state.

Non-goals:
- change Product semantics;
- invent second-provider/full-client features;
- make generated imagery an oracle for hidden states.

Acceptance:
- visual set covers current CORE hierarchy and representative responsive states;
- no contradiction with `V1-UI-IMPLEMENTATION-CONTRACT.md`;
- reference README explicitly states textual authority wins.

Unblocks:
- final UI styling/polish, but not backend/source/domain implementation.

## P13 — Responsibility L2 PostgreSQL/Drizzle executable proof

Class: `PARALLEL_SAFE` with P14 after G00; existing Issue #13.

Ownership:
- isolated proof harness only;
- acceptance IDs 01–46 and 50–60 excluding 47–49.

Required freshness:
- recreate/refresh branch from current post-G00 base;
- pin exact stable Drizzle ORM/Kit/driver versions;
- real PostgreSQL 18;
- generated SQL inspection;
- repository parallel preflight + isolated DB/Docker namespace.

Acceptance:
- exactly as `responsibility/L2-EXECUTABLE-PROOF-GATE.md` + Issue #13;
- no production migration.

## P14 — Better Auth UUID persistence proof

Class: `PARALLEL_SAFE` with P13 after G00; existing Issue #14.

Ownership:
- isolated auth/DB spike;
- acceptance IDs 47–49.

Required freshness:
- exact current stable Better Auth line (1.7.1 evidence as of 2026-08-28, or newer stable if execution occurs later after recheck);
- explicit UUID ID configuration/current generated schema;
- real PostgreSQL 18;
- exact Drizzle/driver versions;
- no production OAuth credentials.

Acceptance:
- actual PostgreSQL user PK is `uuid`;
- session/local account path roundtrip works;
- generated schema does not silently revert UUID to text;
- domain FK to user UUID succeeds without coercion.

Unblocks:
- G10 app auth/base production persistence;
- P15 when combined with P13.

## P15 — Responsibility L2 independent freeze

Class: `SERIAL_GATE`; existing Issue #15.

Depends:
- P13 PASS evidence;
- P14 PASS/equivalent accepted evidence.

Acceptance:
- full independent review of all 01–60 acceptance IDs;
- exact generated SQL / PostgreSQL / concurrency / UUID evidence;
- explicit `PASS/FREEZE` or `FAIL/REVISE`.

Unblocks:
- production Responsibility migrations/runtime (G30).

## G10 — App session + base relational persistence

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G00;
- P14 UUID contract PASS.

Scope:
- activate Better Auth application session only;
- activate PostgreSQL/Drizzle production foundation for non-Responsibility ownership needed by the vertical slice;
- minimum User / ConnectedAccount / ProviderSyncState / Conversation / Message / Attachment metadata ownership skeleton as accepted;
- authenticated BFF ownership checks;
- committed SQL migrations.

Explicit boundary:
- **no production Responsibility-owned tables/migrations before P15**;
- mailbox provider credentials remain Lunowa-owned, not Better Auth social-account authority.

Acceptance:
- signed-out/signed-in session behavior per UI contract;
- ownership isolation tests;
- real PostgreSQL migration up/down/rebuild evidence in disposable test DB;
- no provider token exposed to browser;
- PG-31/32 lifecycle prerequisites are representable but not yet provider-complete.

## G11 — Product UI shell + read-model/accessibility harness

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G00;
- Issue #55 textual UI contract;
- V01 only for final visual fidelity, not structural/component work.

Scope:
- global shell, navigation, responsive panes/routes/sheets;
- semantic design tokens/components;
- state fixtures/read-model interfaces for Home/Needs You/Managed/Review/Moment/Source;
- keyboard/focus/IME/accessibility harness;
- loading/unknown/degraded fixture states.

No authority:
- fixtures never become canonical lifecycle/domain state;
- no provider/DB/AI behavior.

Acceptance:
- Issue #55 acceptance cases structurally executable;
- WCAG 2.2 AA testable baseline;
- Japanese IME safety tests where input exists;
- visual finalization waits for V01.

## G20 — Gmail authorization + provider/source synchronization

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G00;
- G10 authenticated ownership/ConnectedAccount persistence.

Scope:
- one Gmail account path;
- minimum accepted scopes only;
- offline OAuth when background access is required;
- encrypted server-side refresh credential material before real-account beta;
- initial sync;
- `users.watch` / Pub/Sub ingress;
- quick authenticated acknowledgement + durable reconciliation;
- `history.list` cursor reconciliation;
- watch renewal;
- periodic safety reconciliation;
- stale history/404 full-sync recovery;
- normalization/upsert;
- attachment metadata + authorized safe access path.

Core oracles:
- `(connected_account_id, provider_message_id)` uniqueness;
- cursor advances only after required local durability;
- push payload never mutates Responsibility directly;
- dropped/delayed/duplicate notifications converge through reconciliation;
- source chronology retained;
- initial historical sync does not auto-activate Responsibilities.

Acceptance scenarios:
- PG-20, PG-21, PG-31, PG-33, PG-35, PG-36;
- PG-28 for attachment access fallback.

Non-goals:
- Microsoft;
- broad Gmail mailbox mutation parity;
- public OAuth verification completion.

## G21 — Real Source Conversations/read path

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G11 structural UI shell;
- G20 normalized real source read contract.

Scope:
- Source list/detail over real normalized data;
- provenance/account identity;
- attachment evidence access/fallback;
- exact/basic search only if necessary for accepted Source path.

Acceptance:
- Source never requires Responsibility/Moment;
- partial/syncing state never looks like true zero;
- provider content safely rendered/sanitized;
- PG-22/23/28/31 relevant Source behavior.

## G30 — Responsibility L3 production persistence integration

Class: `SERIAL_GATE`

Depends:
- P15 L2 PASS/FREEZE;
- G10 production DB ownership foundation.

Scope:
- smallest production Responsibility persistence/migrations required by current vertical slice;
- exact frozen L2 invariants;
- provenance/evidence revision/currentness;
- migration/evolution path.

Non-goals:
- generic workflow schema;
- unsupported Product features;
- AI interpretation.

Acceptance:
- frozen L2 acceptance remains executable after production integration;
- migrations use committed SQL;
- tenant/account/FK/idempotency constraints retained;
- canonical semantics not collapsed to a lifecycle enum.

## G31 — Deterministic Responsibility reducer / admission

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G30;
- normalized evidence contract from G20/G21.

Scope:
- trusted/manual/deterministic admission path sufficient for vertical proof;
- `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`;
- identity/effects (`CREATE/UPDATE/RESOLVE/REOPEN/SUPERSEDE/INVALIDATE/NO_OP`);
- field correction/provenance;
- orthogonal dimensions and deterministic projection.

Acceptance:
- canonical Responsibility Tier-0 / transition oracles relevant to active slice;
- PG-05–19 semantic Product consequences;
- historical unresolved evidence does not auto-activate live work.

## G32 — Attention + Temporal Contract runtime

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G31 current accepted Responsibility state.

Scope:
- Needs You / Waiting-Managed / Later / Review / Done projections;
- Return Attention Now without fabricated actionability;
- intentional defer + durable Temporal Contract;
- expected events / time/reply reconsideration;
- Trigger.dev execution adapter if retained;
- DB/domain idempotency/currentness as authority;
- overdue/stale trigger reconciliation.

Trigger.dev oracle:
- raw idempotency scope defaults/TTL/failure clearing are never the only guarantee;
- every effect reloads and validates current persisted intent/evidence revision;
- stale/superseded trigger is an audited no-op.

Acceptance scenarios:
- PG-01–04, PG-09–10, PG-18, PG-24, PG-27.

## G40 — Product surfaces on real domain loop

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G11 shell/read-model harness;
- G21 Source;
- G31/G32 real projections.

Scope:
- Home;
- Needs You;
- Managed;
- Review;
- Moment;
- onboarding/delegation path;
- relevant Settings/integrity projection hooks.

Acceptance:
- strict true-zero contract;
- Managed reassurance only for trustworthy relevant monitoring;
- Review is typed/bounded;
- source-grounded Moment;
- UI state axes distinguish session/provider/integrity/domain/mutation;
- PG-01–24 and Issue #55 mapping at the observable layer.

## G50 — Contextual Reply / Reply All + explicit immediate Send

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G20 Gmail send-capable connected account contract;
- G40 Moment/Source active context;
- G10 durable Draft/SendOperation base as required.

Current activation:
- contextual Reply / Reply All;
- inspectable sender/recipients/body;
- manual text path baseline;
- explicit **IMMEDIATE** user Send;
- attachment add only if separately accepted by the active slice.

Reserved/deferred:
- Forward parity;
- Send Later;
- generic Undo Send/recall;
- offline silent queued send.

Acceptance:
- effective sender visible;
- Japanese IME safe;
- double-submit prevented;
- offline attempt preserves draft and does not later send silently;
- PG-14, PG-26, PG-29.

## G51 — Provider Send reconciliation + Responsibility re-evaluation

Class: `SERIAL_GATE` for external-effect truth.

Depends:
- G50;
- G31 reducer.

Scope:
- SendOperation state machine;
- provider result mapping;
- ambiguous timeout reconciliation;
- no blind duplicate retry;
- source sent-message reconciliation;
- post-send Responsibility re-evaluation.

Invariant:

```text
request/click != provider acceptance != operational outcome satisfied
```

Acceptance:
- PG-01, PG-05, PG-25, PG-26;
- duplicate/retry/restart/ambiguous-result tests.

## G60 — Integrity / reconnect / failure closure

Class: `INTEGRATION_GATE` for reliance behavior.

Depends:
- G20/G21 provider/source;
- G32 temporal runtime;
- G40 surfaces;
- G51 Send path.

Scope:
- auth loss/reconnect/backfill;
- sync lag/data-through boundaries;
- scheduler overdue recovery;
- notification-delivery separation;
- send ambiguity;
- attachment access degradation;
- persisted setting/mutation pending/failure truth;
- intentional disconnect vs app sign-out;
- Product-account deletion boundary as accepted for release.

Acceptance:
- PG-20–38 relevant cases;
- no false healthy reassurance, false zero or fake Responsibility on infrastructure failure.

## G70 — Bounded AI interpretation

Class: `PARALLEL_AFTER_CONTRACT`

Depends:
- G31 reducer input contract frozen;
- G20/G21 authorized normalized source path;
- current OpenAI data-control/eval gate.

Scope:
- official OpenAI SDK + Responses API;
- strict structured candidate schema;
- minimum authorized context;
- source/provenance + evidence-revision validation;
- `store: false` where appropriate;
- project/org retention mode reviewed explicitly;
- current model chosen by eval evidence;
- AI failure/manual fallback.

No authority:
- auth, provider truth, admission, identity/effects, live tracking, send permission, trigger effects.

Acceptance:
- layered eval + family-stratified holdout;
- forbidden-outcome/high-harm/prompt-injection cases;
- PG-13, PG-15–19, PG-22, PG-23, PG-29/30 where applicable.

## G80 — Minimum Complete Delegation Loop E2E

Class: `INTEGRATION_GATE`

Depends:
- G20/21;
- G31/32;
- G40;
- G50/51;
- G60;
- AI G70 only for the AI-assisted acceptance path, not manual deterministic source usability.

Must prove representative complete loops on exact candidate:

1. request/send -> reconciled Waiting/Managed;
2. progress reply -> stays quiet;
3. action-required reply -> Needs You/Moment;
4. valid timeout/no-reply -> current evidence re-evaluated before return;
5. explicit reply/send -> provider reconciliation -> Waiting or truthful closure;
6. provider auth/sync interruption -> Integrity -> reconnect/backfill -> restored reassurance;
7. ambiguous send -> guarded reconciliation, no duplicate;
8. AI unavailable -> Source/manual reply remains usable and affected monitoring degrades truthfully.

Primary Product oracles:
- PG-01–05, PG-20–29, PG-31–36;
- relevant Responsibility transition/high-harm oracles;
- Issue #55 screen/state/accessibility acceptance.

Exit:
- exact-head CI + browser E2E + real provider integration evidence;
- full cumulative independent acceptance audit;
- no unresolved material blocker.

## R90 — Public-beta release readiness

Class: `RELEASE_GATE`

Does **not** block local/private G80 proof, but blocks public release where applicable.

Includes:
- Google OAuth verification / restricted-scope eligibility/security assessment as required by actual chosen scopes/deployment;
- privacy/retention/deletion commitments implemented and tested;
- mailbox credential encryption/key rotation/revocation operations;
- production secrets/region/observability/backup/restore decisions;
- abuse/security review;
- current OpenAI data-control/privacy posture;
- release accessibility/browser/device matrix;
- operational support/recovery runbooks.

No claim:
- passing R90 does not establish PMF/ICP/WTP.

---

# 6. Safe parallel waves

## Wave A — after Issue #58 merge

Run only after G00 lands for write-heavy production tasks:

- `P13` Responsibility L2 executable proof;
- `P14` Better Auth UUID proof;
- `V01` visual-reference pass (does not require G00 because it is non-runtime, but should use merged #58 textual authority);
- preparatory G11 structural UI harness may start after G00 and before V01 only if it avoids pixel-sensitive final styling.

P13/P14 must use separate worktrees and PostgreSQL/Docker/runtime namespaces.

## Wave B — after P14 + G00

Potentially parallel with P15/P13 review work when ownership remains isolated:

- G10 app-auth/base persistence;
- G11 Product UI shell/read-model harness;
- provider contract fixtures/preparatory Gmail adapter tests that do not collide with G10 migrations.

Do not add Responsibility production tables until P15 PASS.

## Wave C — after P15 + G10

- G20 Gmail source/sync;
- G30 Responsibility production persistence integration;
- G11/V01 UI work where still outstanding.

Integrate shared DB/read-model contracts before G31/G40 fan-out.

## Wave D — vertical behavior

Prefer serialized integration along:

```text
G31 -> G32 -> G40 -> G50 -> G51 -> G60 -> G80
```

Subcomponents/tests may run in parallel, but accepted state, Temporal semantics, external Send authority and central read models must have one integration owner.

G70 AI may run alongside late deterministic/UI work after the reducer interface freezes.

---

# 7. Merge discipline

Every node follows:

```text
current accepted base
-> isolated branch/worktree + runtime namespace
-> task-specific implementation/evidence
-> local verification
-> PR
-> exact-head CI
-> full cumulative acceptance audit
-> batched corrections if FAIL
-> merge
-> downstream edge becomes READY
```

No downstream task may use a builder summary as evidence for an upstream gate. Use actual merged source, generated artifacts, test evidence and live CI.

If a repeated correction loop occurs, inspect specification/test-oracle/architecture/decomposition/verification gaps before another patch cycle.

---

# 8. Empirical boundary

Issue #36 remains open.

Completing this graph or G80 proves only that Lunowa can implement the accepted Product hypothesis coherently. It does **not** prove:

- exact ICP;
- market frequency/severity;
- monitoring relinquishment in real users;
- PMF;
- WTP/pricing;
- retention;
- superiority to users' real current workflow.

Those remain empirical questions.