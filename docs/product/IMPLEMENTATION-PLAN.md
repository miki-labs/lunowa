# Lunowa Implementation Plan

## Status

**Active execution plan, reconciled 2026-08-28 after Issue #55 and Issue #58 acceptance-audit Round 2.**

This is sequencing authority, not Product truth. Product truth lives in `PRODUCT.md` / `PRODUCT-CONTENT.md`; Product regression behavior in `GOLDEN-SCENARIO-BANK.md`; Responsibility semantics/oracles in `responsibility/`; UI behavior in `../design/`; exact dependency/parallelization detail in `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

## 1. Objective

Build one trustworthy **Minimum Complete Delegation Loop**:

```text
real Gmail Source
-> accepted Responsibility
-> quiet Managed monitoring
-> durable reconsideration
-> correct Needs You / Review return
-> source-grounded Moment
-> contextual Reply/Reply All
-> bounded contextual AI draft with manual fallback
-> explicit immediate Send
-> provider reconciliation
-> continue monitoring or truthful closure
```

Also keep authorized exact Source search and attachment evidence access available.

Implementation completion does not prove ICP/PMF/WTP/retention/monitoring relinquishment. Issue #36 remains open.

## 2. Completed specification gates

- Product Content / Golden Scenarios: complete enough for current implementation hypothesis.
- Issue #55 / PR #57: UI/UX implementation-readiness complete with full audit + exact-head CI.
- Canonical implementation-facing UI input: `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`.

Runtime remains bootstrap-level.

## 3. Current gate — Issue #58

Issue #58 freezes:
- actual implementation-state reconstruction;
- volatile vendor evidence relevant to activation;
- architecture activation boundaries;
- implementation DAG;
- single-writer collision zones;
- safe parallel waves;
- Product/Responsibility/UI/provider acceptance mapping.

No broad production fanout before #58 PASS + merge.

## 4. G00 — framework security pre-wave

First runtime task after #58.

Current repo `next@16.3.0` is below the current patched accepted 16.3 security baseline (`16.3.3` as of 2026-08-28).

Scope:
- narrow Next.js security patch within accepted line;
- directly coupled lock/config only as required;
- full bootstrap verify + Playwright smoke + exact-head CI.

No unrelated upgrade sweep.

## 5. First safe parallel wave after G00

### P13 — Responsibility L2 PostgreSQL/Drizzle proof
Existing Issue #13.
- real PostgreSQL 18;
- exact stable Drizzle/Kit/driver pin;
- generated SQL inspection;
- acceptance 01–46 and 50–60 except 47–49;
- proves current upstream Source ownership/index/evidence-revision prerequisites as part of candidate;
- isolated proof only.

### P14 — Better Auth UUID proof
Existing Issue #14.
- current stable Better Auth at execution;
- explicit UUID configuration/generated schema;
- real PostgreSQL 18;
- acceptance 47–49;
- no production OAuth.

### G11 — structural UI shell/read-model harness
- root shell/navigation/responsive structure;
- semantic tokens/components;
- typed fixture/read-model state axes;
- accessibility/focus/IME harness;
- no provider/domain authority.

### V01 — final visual-reference pass
May run immediately after #58 because it is non-runtime. It blocks final pixel-sensitive UI fidelity only, not backend/domain work.

## 6. P15 — Responsibility L2 independent freeze

After P13 + P14 concrete evidence.

No production Responsibility-owned migrations/runtime before explicit P15 PASS/FREEZE.

## 7. G10 — app session/auth activation

After G00 + P14 PASS.

Own only:
- Better Auth application identity/session;
- auth-owned User/session schema;
- protected BFF/session validation;
- committed auth SQL migration;
- expiry/re-auth/revoke/sign-out behavior.

Do **not** put ConnectedAccount/Conversation/Message/Responsibility/Draft/SendOperation into G10.

## 8. G20 — Gmail + Source persistence/sync

After:
- G00;
- G10;
- **P13 PASS** for current upstream Source-schema prerequisites.

This is the single production writer for:
- ConnectedAccount;
- ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- required Source uniqueness/index/evidence-revision invariants.

Provider behavior:
- minimum scopes;
- offline OAuth when background access required;
- initial sync;
- authenticated PubSub push ingress;
- quick acknowledgement + durable `history.list` reconciliation;
- watch renewal;
- periodic safety reconciliation;
- stale-history 404/full-sync recovery;
- idempotent normalization;
- attachment evidence access.

### Credential boundary

Before first durable persistence of a real Gmail token:
- secure/encrypt token at rest/application boundary;
- key/secret separate from repository/data;
- no token logging;
- lookup scoped by authenticated user + ConnectedAccount;
- revoke/delete when intentionally disconnected where supported.

A bounded non-persistent OAuth spike may avoid durable storage. Plaintext durable token storage is never an accepted intermediate state.

Public OAuth verification/restricted-scope assessment remains R90 release work, not a blocker to all local/private proof.

## 9. G21 — real Source + exact search

After G20 + G11.

Implement:
- Source list/detail;
- account/source provenance;
- safe attachment open/download/provider fallback;
- **authorized exact Source search — V1 CORE**;
- truthful partial/sync/degraded/no-match states.

Natural-language Q&A remains Strong Candidate and is not advertised unless separately activated.

## 10. G30 — Responsibility production persistence

After P15 PASS/FREEZE + G10.

Implement smallest frozen L2 production schema/migrations, preserving ownership/FK/idempotency/provenance/evidence-revision invariants.

G30 can use deterministic Source fixtures matching the frozen normalized evidence contract; it does not wait for live Gmail implementation.

## 11. Parallel provider/domain lanes

After G30:

### G31 — deterministic Responsibility reducer
Depends on G30 + frozen normalized Source/evidence contract, **not G20/G21 completion**.

Implement/test against deterministic normalized fixtures:
- TRACK / DO_NOT_TRACK / NEEDS_REVIEW;
- CREATE/UPDATE/RESOLVE/REOPEN/SUPERSEDE/INVALIDATE/NO_OP;
- field correction/provenance;
- orthogonal state;
- historical activation policy;
- canonical transition/high-harm oracles.

### G32 — attention + Temporal runtime
After G31:
- Needs You/Managed/Review/Later/Done projection;
- Return Attention without fake actionability;
- durable defer/expected-event/time/reply reconsideration;
- DB/domain currentness/idempotency;
- Trigger.dev adapter if retained;
- stale/overdue/restart reconciliation.

Meanwhile G20 -> G21 proceeds as the real provider/Source lane, and G11/V01 proceeds as UI lane.

G40 is the integration point.

## 12. G40 — Product surfaces on real state

After G11 + G21 + G31/G32.

Connect real state to:
- Home;
- Needs You;
- Managed;
- Review;
- Moment;
- onboarding/first delegation;
- supported Settings/integrity hooks.

Preserve strict zero, trustworthy Managed, bounded Review, source-grounded Moment and distinct async axes.

## 13. G50 — Draft + contextual immediate Send request

After G20 + G40.

G50 is the single writer for the minimal:
- Draft persistence/version contract;
- initial SendOperation schema/request/pending state;
- explicit operation idempotency identity.

User path:
- contextual Reply/Reply All;
- explicit sender;
- inspectable recipients/body;
- manual composer baseline;
- explicit **IMMEDIATE** Send request.

Not current gates:
- Forward;
- Send Later;
- generic Undo/recall;
- silent offline queued send.

## 14. G51 — provider Send reconciliation

After G50 + G31.

Implement provider dispatch/reconciliation transitions on G50's accepted SendOperation schema:
- provider accepted/unknown/failed states;
- ambiguous timeout reconciliation;
- no blind duplicate retry;
- sent-message Source reconciliation;
- post-send Responsibility re-evaluation.

Invariant:

```text
request/click != provider acceptance != operational closure
```

## 15. G60 — integrity/reconnect/failure closure

After G20/G21 + G32 + G40 + G51.

Integrate:
- provider auth loss/reconnect/missing interval;
- sync lag/data-through;
- notification delivery separation;
- Temporal overdue recovery;
- send ambiguity;
- attachment-access degradation;
- persisted mutation failure/pending truth;
- intentional disconnect vs app sign-out;
- Product-account deletion boundary routing.

No infrastructure failure may create fake Needs You, fake No Responsibility, false zero or healthy reassurance.

## 16. G70 — bounded AI interpretation + contextual draft assistance

May start once:
- G20 provides authorized normalized Source context contract;
- G31 freezes the trusted candidate/reducer input boundary.

It does **not** wait for G60.

Two separate model contracts:
1. Responsibility interpretation candidate;
2. contextual AI draft candidate inside an authorized active reply context.

Both require:
- official OpenAI SDK + Responses API;
- strict structured/runtime validation;
- minimum authorized context;
- provenance/currentness checks;
- current organization/project data-control review;
- `store:false` where appropriate without equating it to ZDR;
- layered eval + holdout;
- prompt-injection/high-harm cases;
- manual fallback.

AI never gains Send authority or accepted-state authority.

## 17. G80 — complete-loop integration

Depends on G21 + G31/G32 + G40 + G51 + G60 + G70.

Must prove representative real-provider loops including:
- request/send -> Waiting/Managed;
- progress reply stays quiet;
- action reply returns to Needs You/Moment;
- no-reply trigger re-evaluates current evidence;
- contextual AI draft -> edit -> explicit Send -> reconciliation;
- same communication path succeeds manually when AI unavailable;
- auth/sync loss -> Integrity -> reconnect/backfill;
- ambiguous Send -> no duplicate;
- exact Source search + attachment fallback.

Use Product Golden Scenarios, Responsibility oracles, Issue #55 UI cases, real provider evidence, exact-head CI/E2E, and full cumulative independent audit.

## 18. R90 — public-beta release readiness

Separate release gate; does not block local/private G80 proof.

Includes as applicable:
- Google OAuth verification/restricted-scope assessment;
- privacy/retention/deletion guarantees;
- production credential rotation/revocation operations beyond G20 minimum secure storage;
- production secrets/region/backup/restore/observability;
- current OpenAI privacy/data-control posture;
- release accessibility/device/browser matrix;
- security/abuse/recovery/support runbooks.

## 19. Scope discipline

Do not smuggle into the critical path:
- Microsoft;
- Person/CRM;
- broad multi-account Scope UX;
- Pin;
- generic automation/rules;
- full mail-client parity;
- Forward/Send Later/Undo parity;
- autonomous Send;
- native rich attachment preview as CORE;
- natural-language Search as CORE.

## 20. Review/parallel discipline

Use `IMPLEMENTATION-GRAPH.md` for exact edges and single-writer zones.

Every write-heavy task:

```text
current accepted base
-> isolated worktree/runtime namespace
-> implementation + executable evidence
-> PR
-> exact-head CI
-> full cumulative acceptance audit
-> batched corrections if FAIL
-> merge
```

Repeated correction failure triggers spec/oracle/architecture/decomposition/verification root-cause review before another patch cycle.

## 21. Empirical boundary

Issue #36 remains open. Implementation cannot by itself authorize claims about ICP, market pain, monitoring relinquishment, PMF, WTP, retention or differentiation against real workflows.