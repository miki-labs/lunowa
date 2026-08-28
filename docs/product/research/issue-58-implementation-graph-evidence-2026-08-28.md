# Issue #58 — Implementation Graph Evidence — 2026-08-28

## Status

Dated external/repository evidence for Issue #58. **Evidence/rationale, not timeless Product truth.** Volatile facts must be rechecked when the actual activation/release gate executes.

Baseline after PR #57: `9869d7cdee2559b00d73203dec40d92bc90f537f`.

## 1. Current repository implementation fact

Production dependencies remain essentially bootstrap-only. Next.js/React/next-intl/Tailwind/test tooling exist, but Better Auth production auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev runtime and OpenAI runtime are not activated.

```text
accepted doc/ADR
!= installed package
!= configured integration
!= implemented Product behavior
```

Repo package evidence at Issue #58 baseline includes Next.js `16.3.0`, React/React DOM `19.2.7`, pnpm `11.20.0`, Node `>=24 <25`.

## 2. Vendor/platform coverage oracle

Issue #58 may pass only if every changing external dependency explicitly required by the contract has current dated evidence or an explicit bounded deferral.

| Area | 2026-08-28 evidence | Graph consequence |
|---|---|---|
| Next.js / React | Next official Aug-25 security release: Active-LTS 16.3 -> `16.3.3` for two Critical fixes; repo remains 16.3.0 | G00 security pre-wave; no speculative React major change |
| Better Auth | changelog latest stable `1.7.2` on 2026-08-26; UUID DB strategy documented | P14 pins/rechecks execution-time stable and generated schema |
| PostgreSQL / Drizzle | PostgreSQL 18 current; Drizzle GitHub Releases latest stable evidence `0.45.2`; unreleased main is not release evidence | P13/P14 exact pins + generated SQL + real PostgreSQL 18 |
| Gmail / Google OAuth | watch/history reconciliation, stale history 404/full sync, offline authorization, token-at-rest policy | G20 provider/security oracles |
| Trigger.dev | changelog current v4.5 line, `4.5.12` on 2026-08-20; runtime/idempotency details continue changing | G32 adapter only; DB/domain remains authority |
| OpenAI | Responses/structured JSON patterns + organization/feature-dependent data controls | G70 data-control/eval gate; `store:false` is not ZDR proof |
| Accessibility | WCAG 2.2 remains current W3C Recommendation; relevant AA requirements include Focus Not Obscured, Target Size, Accessible Authentication, status-message semantics | G11 test baseline |

Primary sources:

- https://nextjs.org/blog
- https://better-auth.com/changelog
- https://better-auth.com/docs/concepts/database
- https://www.postgresql.org/docs/18/
- https://github.com/drizzle-team/drizzle-orm/releases
- https://developers.google.com/workspace/gmail/api/guides/push
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list
- https://developers.google.com/identity/protocols/oauth2/policies
- https://trigger.dev/changelog
- https://trigger.dev/docs/idempotency
- https://platform.openai.com/docs/models/default-usage-policies-by-endpoint
- https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/

## 3. Next.js / React

Observed:

- official 2026-08-25 Next.js security release directs Active-LTS 16.3 users to `16.3.3` for two Critical vulnerabilities;
- repo pins `16.3.0`;
- current repo React/React DOM are 19.2.7.

Consequence:

- G00 is a narrow serial security update before write-heavy feature fanout;
- directly coupled Next config/lock updates only;
- build/E2E/exact-head CI reprove compatibility.

## 4. Better Auth

Observed:

- Better Auth changelog latest stable: `1.7.2`, 2026-08-26;
- the 1.7 line includes storage/schema changes, so old v1.6/v1.7.1 evidence is historical only;
- current DB documentation supports explicit UUID generation strategies for PostgreSQL.

Consequence:

- P14 rechecks and pins current stable at execution;
- configure intended UUID strategy explicitly;
- generated schema/database catalog and real PostgreSQL decide the proof, not documentation/type inference.

## 5. PostgreSQL / Drizzle

Observed:

- PostgreSQL major 18 remains the accepted real-DB target;
- Drizzle GitHub Releases latest stable evidence remains `0.45.2`;
- repository-main/package versions are not stable-release evidence;
- recent migration/introspection defects reinforce executable proof.

Consequence:

- no automatic RC/unreleased-main adoption;
- P13/P14 pin exact ORM/Kit/driver versions, inspect generated SQL and execute on real PostgreSQL 18;
- production uses committed SQL migrations rather than `push` as final authority.

## 6. Gmail synchronization / recovery

Current Google documentation establishes:

- a Gmail watch has an expiration and must be renewed before it expires;
- incremental history uses increasing but non-contiguous `historyId` values;
- invalid/out-of-date `startHistoryId` typically produces HTTP 404 and requires full sync;
- notification delivery is not sufficient as sole source of mailbox truth.

Consequence:

```text
push/watch signal
-> authenticated quick acknowledgement
-> durable reconciliation
-> history.list
-> normalized Source durability
-> cursor advance
```

G20 must also periodically reconcile and prove duplicate/delay/drop recovery.

## 7. Google OAuth token handling

Current Google OAuth policy says user OAuth tokens must not be transmitted in plaintext, must be stored encrypted at rest, and should be revoked and permanently deleted when no longer needed.

Consequence:

- secure token-at-rest handling is required **before first durable persistence of a real token**;
- a bounded non-persistent OAuth spike may avoid long-lived storage;
- token lookup/use is user + ConnectedAccount scoped;
- no token logging;
- R90 owns broader production rotation/recovery/public compliance, not permission to defer baseline storage security.

## 8. Trigger.dev

Observed current changelog line: v4.5, with `4.5.12` released 2026-08-20. The service continues to change runtime, queue and idempotency behavior.

Consequence:

- use Trigger.dev only as execution infrastructure when G32 actually requires it;
- PostgreSQL/domain owns semantic currentness and duplicate prevention;
- actual key scope/TTL/failure semantics are rechecked at activation.

## 9. OpenAI runtime/data controls

Current architecture continues to use bounded Responses/structured-output candidates only after trusted contracts exist.

Consequence:

- interpretation and drafting remain separate schemas/evals;
- AI output never owns accepted state or Send authority;
- production email AI records actual org/project retention/data-control basis;
- `store:false` is not represented as equivalent to Zero Data Retention;
- manual Source/Reply remains available if AI fails.

## 10. WCAG 2.2

WCAG 2.2 remains a W3C Recommendation/current target. Material AA concerns for Lunowa include visible/non-obscured focus, minimum target sizing/spacing, accessible authentication behavior and programmatically determinable status messages.

Consequence:

- G11 keeps WCAG 2.2 AA as an executable baseline, not a visual-review checkbox;
- responsive overlays, keyboard focus, async status and auth UX receive tests.

## 11. Exhaustive Responsibility L2 external-FK closure

Round 4 audit enumerated the current L2 v0.4 external targets instead of checking only a partial Source list.

Required production targets:

```text
User
connected_accounts (id,user_id)
conversations (id,connected_account_id)
participant_identities (id,user_id)
messages (id,connected_account_id)
ai_interpretation_runs (id,user_id)
```

Current production ownership decision:

| Target | Owner/order |
|---|---|
| User | G10 |
| ConnectedAccount / Conversation / Message | G19 |
| ParticipantIdentity | G19 |
| AIInterpretationRun minimal prerequisite | G30 prelude, before Responsibility referencing tables |
| Responsibility-owned tables | G30 after prelude and P15 PASS/FREEZE |

Why `AIInterpretationRun` is not G19:

- it is not provider Source persistence;
- it is a Responsibility-adjacent provenance prerequisite;
- G30 can create the minimal target in valid migration order without activating AI;
- G70 later owns actual model runtime/schema evolution.

Why `ParticipantIdentity` is G19:

- current L2 expected-event/obligation references require it;
- it is provider-neutral evidence normalization/ownership infrastructure;
- creating it does not activate Person/CRM Product behavior.

Audit oracle:

> Every production external FK in the current frozen candidate must map to a production owner/order. Proof fixtures never satisfy production topology.

## 12. Parallel execution vs merge collision

Round 4 also found that worktree/Docker/PostgreSQL isolation did not prove Git merge independence.

Current root package state means P13, P14 and G11 may all need dependency changes.

Therefore:

```text
parallel execution != parallel merge
```

`package.json` and `pnpm-lock.yaml` are serialized merge assets.

If multiple concurrent branches touch them, later PRs must refresh/rebase onto current accepted main, regenerate the lockfile using pnpm, rerun repository verification, and rerun materially dependency-sensitive proof.

This preserves useful parallel proof execution without inventing unsafe parallel merge authority.

## 13. Fresh-session routing audit

Round 4 found `AGENTS.md`, `docs/product/README.md` and `docs/continuity/KNOWLEDGE-MAP.md` still routing a fresh agent through the already-completed Issue #55 sequence.

Required correction:

- Issue #55 / PR #57 = completed UI/UX implementation-readiness authority;
- Issue #58 = current implementation-graph gate until merge;
- after accepted #58 merge, G00 is the first runtime gate and V01 can run independently;
- `IMPLEMENTATION-GRAPH.md` becomes the dependency/parallelization authority after merge.

The routing files must not become a second copy of the graph; they should point to it.

## 14. Product CORE coverage oracle

Current V1 CORE / CORE-target capability mapping:

| Capability | Owner |
|---|---|
| application session | G10 |
| one-provider authorized Source evidence | G19/G20/G21 |
| ingestion/reconciliation | G19/G20 |
| Responsibility admission/update / No Responsibility | G30/G31 |
| Needs You / Managed / Review / Moment | G31/G32/G40 |
| temporal monitoring / Later / return | G32 |
| correction / Return Attention / Stop Tracking | G31/G32/G40 |
| integrity / reconnect / lifecycle consequences | G60 (+ R90 public obligations) |
| minimal Settings | G40/G60 |
| contextual Reply / Reply All | G50 |
| manual draft fallback | G50 |
| bounded contextual AI draft | G70 |
| explicit immediate Send | G50 |
| provider send reconciliation | G51 |
| exact Source search | G21 |
| attachment evidence access | G20/G21 |
| cumulative real delegated loop | G80 |

An ownerless current CORE capability is a graph FAIL.

## 15. Repeated-correction root cause analysis

Round 4 was the fourth full audit/correction cycle. The preventable gaps were:

### A. Verification-process gap — partial FK oracle

Earlier review checked only ConnectedAccount/Conversation/Message prerequisites. It did not enumerate every `REFERENCES` target in L2 v0.4.

Correction: exhaustive external-FK closure table + production-owner/order oracle.

### B. Task-decomposition gap — runtime isolation mistaken for merge isolation

Earlier parallelism analysis covered worktrees/runtime namespaces but not shared root manifest/lockfile merge behavior.

Correction: explicit `PARALLEL_EXECUTION_SERIAL_MERGE` rule and serialized root dependency assets.

### C. Promotion/routing gap — mutable checkpoint updated without all bootstrap routers

`CURRENT.md` was corrected while `AGENTS.md`, Product README and Knowledge Map retained old Issue #55 routing.

Correction: final task/authority promotion checklist covers all bootstrap routers, while keeping detailed graph semantics in the owning graph rather than duplicating them.

## 16. Architecture conclusions

Current evidence does not justify a new Product architecture. It strengthens these boundaries:

```text
notification != Source truth
provider fact != Responsibility truth
AI table existence != AI runtime authority
AI output != accepted state / Send authority
task-run idempotency != domain idempotency
Send request != provider acceptance != operational closure
proof fixture != production FK target
parallel execution != parallel merge
implementation completion != Product validation
```
