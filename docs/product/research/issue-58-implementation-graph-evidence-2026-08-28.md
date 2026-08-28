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

Repo package evidence at the Issue #58 baseline includes Next.js `16.3.0`, React/React DOM `19.2.7`, pnpm `11.20.0`, Node `>=24 <25`.

## 2. Vendor/platform coverage oracle

Issue #58 may pass only if every changing external dependency explicitly required by the contract has current dated evidence or an explicit bounded deferral.

| Area | 2026-08-28 evidence | Graph consequence |
|---|---|---|
| Next.js / React | official Aug-25 security release: Active-LTS 16.3 -> `16.3.3` for two Critical fixes; repo remains 16.3.0 | G00 security pre-wave |
| Better Auth | changelog latest stable `1.7.2` on 2026-08-26; UUID DB strategy documented | P14 execution-time recheck + generated schema |
| PostgreSQL / Drizzle | PostgreSQL 18 current; Drizzle GitHub Releases latest stable evidence `0.45.2`; unreleased main is not release evidence | P13/P14 exact pins + generated SQL + real PostgreSQL 18 |
| Gmail sync / OAuth | watch/history reconciliation, stale history 404/full sync, offline authorization, encrypted-at-rest token policy | G20 provider/security oracles |
| Gmail Send / threading | `messages.send`, MIME/base64URL, threadId + RFC headers + Subject match, current send scopes, current quota/recipient limits | G50/G51 reply/send/reconciliation oracles |
| Trigger.dev | current changelog v4.5 line, `4.5.12` on 2026-08-20 | G32 adapter only; DB/domain authority |
| OpenAI | Responses/structured output + organization/feature-dependent data controls | G70 data-control/eval gate; `store:false` != ZDR proof |
| Accessibility | WCAG 2.2 current W3C Recommendation; relevant AA requirements include Focus Not Obscured, Target Size, Accessible Authentication and Status Messages | G11 executable baseline |

Primary sources:

- https://nextjs.org/blog
- https://better-auth.com/changelog
- https://better-auth.com/docs/concepts/database
- https://www.postgresql.org/docs/18/
- https://github.com/drizzle-team/drizzle-orm/releases
- https://developers.google.com/workspace/gmail/api/guides/push
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list
- https://developers.google.com/workspace/gmail/api/guides/sending
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send
- https://developers.google.com/workspace/gmail/api/reference/quota
- https://developers.google.com/identity/protocols/oauth2/policies
- https://trigger.dev/changelog
- https://trigger.dev/docs/idempotency
- https://platform.openai.com/docs/models/default-usage-policies-by-endpoint
- https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/

## 3. Next.js / React

Observed:

- official 2026-08-25 Next.js security release directs Active-LTS 16.3 users to `16.3.3` for two Critical vulnerabilities;
- repo pins `16.3.0`;
- repo React/React DOM are 19.2.7.

Consequence:

- G00 is a narrow serial security update before write-heavy fanout;
- directly coupled Next config/lock updates only;
- build/E2E/exact-head CI reprove compatibility.

## 4. Better Auth

Observed:

- Better Auth changelog latest stable: `1.7.2`, 2026-08-26;
- the 1.7 line includes storage/schema changes, so older v1.6/v1.7.1 evidence is historical only;
- current DB docs support explicit UUID generation strategies for PostgreSQL.

Consequence:

- P14 rechecks/pins current stable at execution;
- intended UUID strategy is explicit;
- generated schema/database catalog and real PostgreSQL decide the proof.

## 5. PostgreSQL / Drizzle

Observed:

- PostgreSQL major 18 remains the accepted real-DB target;
- Drizzle GitHub Releases latest stable evidence remains `0.45.2`;
- repository-main/package versions are not stable-release evidence;
- current migration/introspection defects reinforce executable proof.

Consequence:

- no automatic RC/unreleased-main adoption;
- P13/P14 pin exact ORM/Kit/driver versions, inspect generated SQL and execute on real PostgreSQL 18;
- production uses committed SQL migrations rather than `push` as final authority.

## 6. Gmail synchronization / recovery

Current Google documentation establishes:

- a Gmail watch has an expiration and must be renewed before it expires;
- incremental history IDs are increasing but not necessarily contiguous;
- invalid/out-of-date `startHistoryId` typically produces HTTP 404 and requires full sync;
- notification delivery is not sufficient as sole mailbox truth.

Consequence:

```text
push/watch signal
-> authenticated quick acknowledgement
-> durable reconciliation
-> history.list
-> normalized Source durability
-> cursor advance
```

G20 must periodically reconcile and prove duplicate/delay/drop recovery.

## 7. Gmail Send / contextual Reply / threading

Current Google primary documentation checked 2026-08-28 establishes:

- `users.messages.send` sends the supplied Gmail `Message` and, on success, returns a `Message` resource;
- the Gmail sending guide requires an RFC-2822-compliant MIME email encoded as base64URL in the `raw` message field;
- to keep a Reply in the intended Gmail thread, the supplied `Message`/`Draft.Message` must include the target `threadId`, `References` and `In-Reply-To` headers compliant with RFC 2822, and a matching `Subject`;
- `users.messages.send` currently accepts one of `mail.google.com`, `gmail.modify`, `gmail.compose`, or `gmail.send` scopes;
- current Gmail quota documentation lists `messages.send` at 100 quota units and a maximum of 500 recipients per message; quota policy changed in 2026 and must be treated as volatile operational evidence.

Consequence for Lunowa:

- G50 owns trusted construction of the intended sender/recipient/body/reply context and durable SendOperation request identity;
- G51 serializes the trusted MIME/threading intent and performs provider dispatch;
- Reply/Reply All acceptance must prove `threadId` + headers + subject behavior on real Gmail evidence, not merely unit-test a local DTO;
- a successful `messages.send` response is **provider acceptance evidence**, not proof that the communication-bounded operational outcome is satisfied;
- later bounce/non-delivery/provider evidence must still be ingested and can re-open/return attention as Product Golden Scenario PG-44 requires;
- timeout/unknown provider acceptance still forbids blind duplicate retry;
- current quota/recipient constraints are operational provider limits, not Product-domain state.

## 8. Google OAuth token handling

Current Google OAuth policy says user OAuth tokens must not be transmitted in plaintext, must be stored encrypted at rest, and should be revoked and permanently deleted when no longer needed.

Consequence:

- secure token-at-rest handling is required **before first durable persistence of a real token**;
- a bounded non-persistent OAuth spike may avoid long-lived storage;
- token lookup/use is user + ConnectedAccount scoped;
- no token logging;
- R90 owns broader production rotation/recovery/public compliance, not permission to defer baseline storage security.

## 9. Trigger.dev

Observed current changelog line: v4.5, with `4.5.12` released 2026-08-20. Runtime/queue/idempotency behavior continues to change.

Consequence:

- use Trigger.dev only as execution infrastructure when G32/G20/G51 actually require it;
- PostgreSQL/domain owns semantic currentness and duplicate prevention;
- actual key scope/TTL/failure semantics are rechecked at activation.

## 10. OpenAI runtime/data controls

Current architecture uses bounded Responses/structured-output candidates only after trusted contracts exist.

Consequence:

- interpretation and drafting remain separate schemas/evals;
- AI output never owns accepted state or Send authority;
- production email AI records actual org/project retention/data-control basis;
- `store:false` is not represented as equivalent to Zero Data Retention;
- manual Source/Reply remains available if AI fails.

## 11. WCAG 2.2

WCAG 2.2 remains a W3C Recommendation/current target. Material AA concerns for Lunowa include visible/non-obscured focus, minimum target sizing/spacing, accessible authentication behavior and programmatically determinable status messages.

Consequence:

- G11 keeps WCAG 2.2 AA as an executable baseline;
- responsive overlays, keyboard focus, async status and auth UX receive tests.

## 12. Exhaustive Responsibility L2 external-FK closure

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

Production ownership decision:

| Target | Owner/order |
|---|---|
| User | G10 |
| ConnectedAccount / Conversation / Message | G19 |
| ParticipantIdentity | G19 |
| AIInterpretationRun minimal prerequisite | G30 prelude, before Responsibility referencing tables |
| Responsibility-owned tables | G30 after prelude and P15 PASS/FREEZE |

`ParticipantIdentity` is provider-neutral evidence normalization/ownership infrastructure, not Person/CRM Product activation.

`AIInterpretationRun` is Responsibility-adjacent provenance substrate; table creation does not activate a model. G70 owns model runtime/schema evolution.

Audit oracle:

> Every production external FK in the current frozen candidate maps to a production owner/order. Proof fixtures never satisfy production topology.

## 13. Parallel execution vs merge collision

Worktree/Docker/PostgreSQL isolation does not prove Git merge independence.

```text
parallel execution != parallel merge
```

`package.json` and `pnpm-lock.yaml` are serialized merge assets.

If concurrent branches touch them, later PRs refresh/rebase onto current accepted main, regenerate the lockfile with pnpm, rerun repository verification, and rerun materially dependency-sensitive proof.

This rule is now explicit in the graph and existing P13/P14 task contracts.

## 14. Routing / promotion audit

Round 4 found stale #55 routing in `AGENTS.md`, Product README and Knowledge Map. Round 5 found the repository root `README.md` was also stale.

Current correct transition:

- Issue #55 / PR #57 = completed UI/UX implementation-readiness authority;
- Issue #58 = current implementation-graph gate until full audit + exact-head CI + merge;
- after accepted #58 merge, G00 is the first runtime gate and V01 may run independently;
- `IMPLEMENTATION-GRAPH.md` becomes dependency/parallelization authority after merge.

Promotion checklist for future critical-path changes includes:

```text
AGENTS.md
root README.md
continuity CURRENT / KNOWLEDGE-MAP when routing changed
Product README / implementation plan when engineering routing changed
relevant accepted ADR activation wording
live pre-existing executable Issues
```

Detailed graph semantics remain in the graph rather than duplicated in routers.

## 15. Product CORE coverage oracle

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
| contextual Reply / Reply All | G50/G51 |
| manual draft fallback | G50 |
| bounded contextual AI draft | G70 |
| explicit immediate Send request | G50 |
| provider Send / reconciliation | G51 |
| exact Source search | G21 |
| attachment evidence access | G20/G21 |
| cumulative real delegated loop | G80 |

An ownerless current CORE capability is a graph FAIL.

## 16. Golden/UI/Responsibility mapping rule

The current Product Golden bank is PG-01..PG-65. Not every canonical scenario is a current v1 feature gate: some are regression boundaries for conditional/future capabilities.

The Implementation Graph must therefore map:

- current CORE scenarios to owning implementation nodes;
- conditional/strong-candidate/post-v1 scenarios to explicit `NOT CURRENT GATE / regression if activated` dispositions;
- Responsibility-heavy behavior to named Responsibility oracle families;
- UI-visible behavior to UI implementation-contract IDs.

This prevents both under-testing and accidental scope expansion.

## 17. Repeated-correction root cause analysis

### Round 4 gaps

- partial FK oracle -> exhaustive external-FK closure;
- runtime isolation mistaken for merge isolation -> serialized merge-asset oracle;
- incomplete router promotion -> expanded bootstrap/promotion checklist.

### Round 5 gaps

1. **Contract-completeness gap:** compacting the graph removed explicit node-to-oracle and per-node required-field coverage.
2. **Promotion gap:** root README was omitted from the first routing correction.
3. **Architecture-history gap:** ADR 0006 retained old Send Later activation wording after Product scope changed.
4. **Vendor-coverage gap:** Gmail sync was researched more deeply than Gmail Send/threading despite the Issue contract explicitly naming send.
5. **Live-task reconciliation gap:** #13 received the new serialized merge rule before #14, leaving asymmetric executable contracts.

Prevention: use explicit graph completeness matrices and a fixed authority/vendor/task reconciliation checklist during the final audit.

## 18. Architecture conclusions

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
provider Send success != delivery/outcome satisfaction
infrastructure capability != deferred Product activation
implementation completion != Product validation
```
