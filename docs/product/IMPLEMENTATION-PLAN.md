# Lunowa Implementation Plan

## Status

**Active execution plan, reconciled 2026-08-29 after Issue #58 / PR #59 implementation-graph freeze and Issue #61 / PR #76 visual-reference freeze.**

This is sequencing authority, not Product truth. Product truth lives in `PRODUCT.md` / `PRODUCT-CONTENT.md`; Product regressions in `GOLDEN-SCENARIO-BANK.md`; Responsibility semantics/oracles in `responsibility/`; UI behavior in `../design/`; exact dependency/parallelization/writer detail in `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

## 1. Objective

Build one trustworthy **Minimum Complete Delegation Loop**:

```text
real Gmail Source
-> accepted Responsibility
-> quiet Managed monitoring
-> durable reconsideration
-> correct Needs You / Review return
-> source-grounded Moment
-> contextual Reply / Reply All
-> bounded contextual AI draft with manual fallback
-> explicit immediate Send
-> provider reconciliation
-> continue monitoring or truthful closure
```

Keep authorized exact Source search and attachment evidence access available.

Implementation completion does not prove ICP/PMF/WTP/retention/monitoring relinquishment. Issue #36 remains open.

## 2. Completed specification/design gates

- Product Content / Golden Scenarios: complete enough for current implementation hypothesis.
- Issue #55 / PR #57: UI/UX implementation-readiness **COMPLETE** after full cumulative audit + exact-head CI.
- Canonical implementation-facing UI input: `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`.
- Issue #58 / PR #59: implementation graph / architecture activation topology **COMPLETE** after repeated full cumulative audit + exact-head CI.
- `docs/product/IMPLEMENTATION-GRAPH.md` is now the accepted exact dependency/parallelization authority together with live GitHub Issues.
- Issue #61 / PR #76: minimal five-reference visual freeze **COMPLETE**; runtime/browser audit owns final state-specific/pixel-sensitive fidelity.
- Current accepted main after PR #76: `9f7209928578c8b84a09649ea8112b4c6c2a8c9f`.
- Runtime remains bootstrap-level; frozen contracts != implemented Product.

## 3. Current gate — G00 / Issue #60

G00 is the first runtime `SERIAL_GATE`.

Current repo still pins:

```text
next                16.3.0
eslint-config-next  16.3.0
```

Execution-time vendor evidence was rechecked on `2026-08-29` as required by Issue #60:

- Next.js official August 25, 2026 security release identifies `16.3.3` as the current Active LTS security baseline for the accepted 16.3 line;
- official `v16.3.3` is a stable/non-prerelease release and fixes two Critical unauthenticated RCE advisories:
  - `GHSA-p293-qw3h-jr36` — Windows-hosted servers;
  - `GHSA-2xp9-vwfh-vxw4` — AVIF Image Optimization path;
- npm currently exposes `16.3.3` as `latest`; the 16.4 line is canary/pre-release at this checkpoint.

Therefore no Issue-contract version change is required. Patch narrowly inside the accepted 16.3 line before the first write-heavy fanout.

Do not launch P13/P14/G11 production-wave work from a stale pre-G00 dependency basis.

## 4. G00 — framework security pre-wave

Scope:

- update Next.js from `16.3.0` to `16.3.3` unless newer execution-time official security guidance supersedes this dated evidence;
- update directly coupled `eslint-config-next` / lock resolution only as required;
- preserve Node 24 / React 19 accepted compatibility unless actual official/install/build evidence requires a bounded correction;
- clean `pnpm install --frozen-lockfile`;
- `pnpm verify`;
- Playwright E2E smoke;
- exact-head GitHub CI;
- full cumulative acceptance audit of current Issue #60 contract × final candidate.

No unrelated dependency sweep, Product feature implementation, framework-major/minor migration, Better Auth/Drizzle/Gmail/AI activation or UI redesign.

`package.json` and `pnpm-lock.yaml` are serialized merge assets across this gate.

## 5. First execution wave after G00

The following may execute concurrently in isolated worktrees/runtime namespaces after G00 PASS/merge:

### P13 — Responsibility L2 PostgreSQL/Drizzle proof

Existing Issue #13.

- real PostgreSQL 18;
- current exact stable Drizzle/Kit/driver pin;
- generated SQL inspection;
- acceptance 01–46 and 50–60 except 47–49;
- prove all current upstream ownership/index/evidence prerequisites, including ParticipantIdentity prerequisites;
- isolated proof only, no production migration.

### P14 — Better Auth UUID proof

Existing Issue #14.

- current stable Better Auth at execution;
- explicit UUID configuration/generated schema;
- real PostgreSQL 18;
- acceptance 47–49;
- no production OAuth/auth rollout.

### G11 — structural UI shell/read-model harness

Existing Issue #63.

- shell/navigation/responsive structure;
- semantic tokens/components;
- typed fixture/read-model state axes;
- accessibility/focus/IME harness;
- use the accepted five-reference visual grammar where visually material;
- no provider/domain authority.

V01 is already complete and is not a remaining execution-wave task. Missing state-specific screenshots do not block structural implementation; textual Product/UI authority plus runtime/browser visual audit governs those states.

## 6. Parallel execution != parallel merge

P13/P14/G11 may all need root dependency changes.

`package.json` and `pnpm-lock.yaml` are serialized merge assets:

1. work may execute concurrently;
2. PRs touching these files merge one at a time;
3. every later PR refreshes/rebases onto latest accepted main;
4. regenerate lockfile using pnpm, never a blind manual lockfile merge;
5. rerun repository verification;
6. rerun task proof materially affected by changed dependency/version basis.

This preserves useful parallelism without treating worktree/runtime isolation as merge isolation.

## 7. P15 — Responsibility L2 independent freeze

After P13 + P14 concrete evidence.

No production Responsibility-owned migrations/runtime before explicit P15 `PASS/FREEZE`.

## 8. G10 — application session/auth activation

After G00 + P14 PASS.

Own only:

- Better Auth application identity/session;
- auth-owned User/session schema;
- protected BFF/session validation;
- committed auth migration;
- expiry/re-auth/revoke/sign-out behavior.

Do not put ConnectedAccount/Conversation/Message/ParticipantIdentity/Responsibility/Draft/SendOperation into G10.

## 9. G19 — provider-neutral evidence foundation

After:

- G10 production User/session schema;
- P13 PASS for upstream L2 prerequisites.

G19 is the single production writer for:

- ConnectedAccount;
- ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- ParticipantIdentity;
- required ownership/uniqueness indexes;
- monotonic non-negative `Conversation.semantic_evidence_revision`;
- provider-neutral repositories/fixtures;
- committed SQL migrations.

Required current L2 production keys include:

```text
connected_accounts UNIQUE(id,user_id)
conversations UNIQUE(id,connected_account_id)
participant_identities UNIQUE(id,user_id)
messages UNIQUE(id,connected_account_id)
```

G19 contains no live Gmail API behavior and no Responsibility-owned tables. `ParticipantIdentity` here is evidence infrastructure, not Person/CRM Product scope.

Acceptance includes clean real PostgreSQL migration/rebuild, tenant/account/evidence FK/uniqueness tests and direct satisfaction of P13-proven upstream prerequisites.

Fan-out:

```text
G19
  +-> G20 live Gmail lane
  +-> after P15, G30 production persistence lane
```

## 10. G20 — Gmail OAuth / watch / history / sync

After G19 + G00.

G20 consumes G19 persistence rather than owning that shared schema.

Implement:

- one Gmail account path;
- minimum scopes;
- offline OAuth when background access requires it;
- initial sync;
- authenticated Pub/Sub ingress;
- quick acknowledgement + durable `history.list` reconciliation;
- watch renewal;
- periodic safety reconciliation;
- stale-history HTTP 404/full-sync recovery;
- idempotent normalization/upsert through G19;
- attachment evidence access.

Before first durable real Google token persistence:

- encrypted at rest;
- key/secret separate from ordinary DB/repository data;
- no token logging;
- user + ConnectedAccount-scoped lookup/use;
- explicit invalidation/reconnect;
- revoke/delete when intentionally no longer needed where supported.

A bounded non-persistent OAuth spike may avoid durable storage. Plaintext durable token storage is never accepted.

Public OAuth verification/restricted-scope assessment remains R90 release work where required.

## 11. G21 — real Source + exact search

After G20 + G11.

Implement:

- Source list/detail;
- account/source provenance;
- safe attachment open/download/provider fallback;
- authorized exact Source search — **V1 CORE**;
- truthful partial/sync/degraded/no-match states.

Natural-language/semantic Q&A remains conditional.

## 12. G30 — production persistence with complete external-FK closure

After P15 PASS/FREEZE + G19.

Current frozen L2 v0.4 references these external production targets:

```text
User
connected_accounts
conversations
participant_identities
messages
ai_interpretation_runs
```

G10/G19 create the first five target families. G30 begins with a **minimal production AIInterpretationRun provenance/basis prerequisite** satisfying `UNIQUE(id,user_id)` and accepted User/Conversation/Message basis references, then creates Responsibility-owned tables in valid FK order.

Important boundary:

```text
AIInterpretationRun table existence != model execution != accepted AI authority
```

G70 owns runtime AI activation.

Acceptance:

- clean production-shaped migration;
- every external FK targets an accepted production table;
- no proof-only fixture FK target;
- migration ordering directly inspected/tested;
- frozen L2 invariants preserved;
- no AI runtime side effect.

G30 does not wait for live Gmail completion.

## 13. Parallel provider/domain lanes

After G19 + P15:

### Provider lane

```text
G20 Gmail -> G21 Source/read/search
```

### Deterministic domain lane

```text
G30 persistence
-> G31 deterministic reducer
-> G32 attention/Temporal runtime
```

G31 consumes frozen normalized evidence fixtures, not live Gmail completion.

### G31 — deterministic Responsibility reducer

Implement/test:

- TRACK / DO_NOT_TRACK / NEEDS_REVIEW;
- CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP;
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

G40 integrates provider/UI/domain lanes.

## 14. G40 — Product surfaces on real state

After G11 + G21 + G31 + G32.

Connect real state to:

- Home;
- Needs You;
- Managed;
- Review;
- Moment;
- onboarding/first delegation;
- supported Settings/integrity hooks.

Preserve strict zero, trustworthy Managed, bounded Review, source-grounded Moment and distinct session/provider/integrity/domain/mutation axes.

## 15. G50 — Draft + contextual immediate Send request

After G20 + G40.

G50 is the single writer for minimal:

- Draft persistence/version contract;
- initial SendOperation schema/request/pending state;
- operation idempotency identity.

User path:

- contextual Reply / Reply All;
- explicit sender;
- inspectable recipients/body;
- manual composer baseline;
- explicit immediate Send request.

Not current gates: Forward, Send Later, generic Undo/recall, silent offline queued Send.

## 16. G51 — provider Send reconciliation

After G50 + G31.

Implement:

- provider accepted/unknown/failed transitions;
- ambiguous timeout reconciliation;
- no blind duplicate retry;
- sent-message Source reconciliation;
- post-send Responsibility re-evaluation.

Invariant:

```text
request/click != provider acceptance != operational closure
```

## 17. G60 — integrity/reconnect/failure closure

After G20/G21 + G32 + G40 + G51.

Integrate:

- provider auth loss/reconnect/missing interval;
- sync lag/data-through;
- notification delivery separation;
- Temporal overdue recovery;
- Send ambiguity;
- attachment-access degradation;
- mutation pending/failure;
- intentional disconnect vs app sign-out;
- Product-account deletion boundary routing.

No infrastructure failure may create fake Needs You, fake No Responsibility, false zero or healthy reassurance.

## 18. G70 — bounded AI interpretation + contextual draft

May start after G31 freezes trusted candidate/reducer boundaries and normalized evidence contract is available. It need not wait for live Gmail completion for fixture-based eval work.

Own two separate model contracts:

1. Responsibility interpretation candidate;
2. contextual editable draft candidate.

Use G30-created AIInterpretationRun provenance substrate. Any schema evolution must preserve frozen Responsibility FK compatibility or use an explicit reviewed migration.

Require:

- official OpenAI SDK + Responses API;
- Structured Outputs/JSON Schema where suitable;
- strict runtime/source/currentness validation;
- minimum authorized context;
- current org/project data-control review;
- `store:false` where appropriate without equating it to ZDR;
- layered eval + holdout;
- prompt-injection/high-harm cases;
- manual fallback.

AI never gains Send or accepted-state authority.

## 19. G80 — complete-loop integration

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

Use Product Golden Scenarios, Responsibility oracles, Issue #55 UI cases, real provider evidence, exact-head CI/E2E and full cumulative independent audit.

## 20. R90 — public-beta release readiness

Separate release gate; does not block local/private G80 proof.

Includes as applicable:

- Google OAuth verification/restricted-scope assessment;
- privacy/retention/deletion commitments;
- production credential rotation/recovery beyond G20 minimum storage security;
- production secrets/region/backup/restore/observability;
- current OpenAI privacy/data-control posture;
- release accessibility/device/browser matrix;
- security/abuse/recovery/support runbooks.

## 21. Scope discipline

Do not smuggle into the critical path:

- Microsoft;
- Person/CRM Product features;
- broad multi-account Scope UX;
- Pin;
- generic automation/rules;
- full mail-client parity;
- Forward/Send Later/Undo parity;
- autonomous Send;
- rich native attachment preview as CORE;
- natural-language Search as CORE.

## 22. Review discipline

Every write-heavy task follows:

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

If repeated correction failure occurs, analyze specification/oracle/architecture/decomposition/verification gaps before another patch loop.

## 23. Empirical boundary

Issue #36 remains open. Implementation cannot by itself authorize claims about ICP, market pain, monitoring relinquishment, PMF, WTP, retention or comparative differentiation.
