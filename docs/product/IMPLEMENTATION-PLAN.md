# Lunowa Implementation Plan

## Status

**Active execution plan, reconciled 2026-08-28 after Issue #55 UI freeze and Issue #58 architecture/graph audit.**

This plan is sequencing authority only. Product truth lives in `PRODUCT.md` / `PRODUCT-CONTENT.md`; Product observable regression behavior in `GOLDEN-SCENARIO-BANK.md`; Responsibility semantics/oracles in `responsibility/`; UI behavior in `../design/`; dependency detail in `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

## 1. Execution objective

Build a usable one-provider **Minimum Complete Delegation Loop** before broad client/provider breadth.

```text
real source evidence
-> trustworthy normalized Source
-> accepted Responsibility
-> quiet Managed monitoring
-> durable reconsideration
-> correct return of attention
-> source-grounded Moment
-> contextual Reply / Reply All
-> explicit immediate Send
-> provider reconciliation
-> continue monitoring or truthful closure
```

Implementation completion is not empirical validation. Issue #36 remains open for ICP/problem/behavior/market evidence.

## 2. Already complete

### Mechanical foundation

Established:
- Node 24 / pnpm / strict TypeScript;
- Next.js / React / next-intl / Tailwind bootstrap;
- lint/typecheck/test/build/verify;
- Playwright smoke;
- CI Verify + E2E Smoke;
- repository parallel-execution preflight/isolation harness.

The app itself remains bootstrap-level; stack acceptance != Product activation.

### Product Content

Canonical Product content / Golden Scenarios are complete enough to implement the current Product hypothesis.

### UI/UX implementation readiness

Issue #55 / PR #57 completed with exact-head CI and full cumulative audit.

Canonical implementation input:
- `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`.

## 3. Current planning gate — Issue #58

Issue #58 freezes:
- current implementation-state reconstruction;
- volatile vendor evidence relevant to activation;
- architecture activation boundaries;
- dependency DAG;
- parallel-safety classifications;
- merge/integration order;
- vertical-loop acceptance plan.

No broad production implementation should fan out until #58 passes.

## 4. Pre-wave security gate

First runtime task after #58:

### G00 — patched framework security baseline

Repository `next@16.3.0` must move to the current patched accepted 16.3 Active-LTS security baseline before feature branches fan out.

Scope is deliberately narrow: framework security patch + directly coupled resolution + existing verification. No unrelated upgrade sweep.

## 5. First safe parallel wave

After G00, run isolated:

### P13 — Responsibility L2 PostgreSQL/Drizzle proof
Existing Issue #13.

- real PostgreSQL 18;
- exact stable Drizzle/Kit/driver pin;
- generated SQL inspection;
- acceptance 01–46, 50–60 except 47–49;
- isolated proof only, no production migration.

### P14 — Better Auth UUID proof
Existing Issue #14.

- current stable Better Auth at execution time;
- explicit UUID configuration/generated schema;
- real PostgreSQL 18;
- acceptance 47–49;
- no production OAuth activation.

### V01 — final current visual-reference pass

Runs after textual #58 graph freeze and in parallel with backend proof work.

It blocks final pixel-sensitive UI styling, not provider/domain implementation. Textual Product/UI authority wins over imagery.

### G11 structural UI harness

May start after G00 using frozen Issue #55 screen/state/read-model contracts, but avoid final visual treatment until V01.

## 6. Responsibility persistence gate

P13 + P14 feed:

### P15 — independent L2 freeze
Existing Issue #15.

No production Responsibility migration/runtime is authorized before P15 PASS/FREEZE.

This gate does **not** block every other non-Responsibility task.

## 7. Base production foundation

### G10 — app session + non-Responsibility base persistence

After G00 + P14:
- activate Better Auth application session;
- activate PostgreSQL/Drizzle foundation;
- User / ConnectedAccount / ProviderSyncState / Conversation / Message / Attachment metadata ownership needed by vertical slice;
- authenticated BFF ownership checks;
- committed SQL migrations;
- no production Responsibility-owned tables before P15.

## 8. First real provider / Source

### G20 — Gmail authorization + source synchronization

After G10:
- narrowest implemented OAuth scopes;
- offline authorization for background access;
- encrypted server-side refresh credentials before real-account beta;
- initial sync;
- watch/PubSub signal;
- authenticated quick webhook acknowledgement;
- durable `history.list` reconciliation;
- watch renewal + periodic safety reconciliation;
- stale-history 404/full-sync recovery;
- idempotent Message/Attachment normalization;
- source attachment evidence access.

Provider push is a signal, never accepted Responsibility truth.

### G21 — real Source Conversations

After G20 + structural UI shell:
- Source list/detail;
- provider/account provenance;
- partial/syncing/degraded states;
- safe attachment open/download/provider fallback;
- no Responsibility/Moment requirement to read Source.

## 9. Responsibility production runtime

### G30 — L3 production persistence

After P15 + G10:
- integrate only frozen L2 Responsibility persistence required by vertical slice;
- preserve constraints, ownership, idempotency, evidence revisions and provenance;
- committed SQL migrations;
- no generic workflow engine.

### G31 — deterministic admission / identity / reducer

After G30 + normalized source contract:
- TRACK / DO_NOT_TRACK / NEEDS_REVIEW;
- CREATE/UPDATE/RESOLVE/REOPEN/SUPERSEDE/INVALIDATE/NO_OP;
- field correction/provenance;
- orthogonal state dimensions;
- deterministic projections;
- historical unresolved evidence stays non-live unless activated.

AI is not required for this gate. Trusted/manual deterministic fixtures can prove it first.

## 10. Attention / temporal monitoring

### G32 — attention + Temporal Contract runtime

After G31:
- Needs You / Managed / Review / Later / Done projection;
- Return Attention Now without fake actionability;
- durable defer/expected-event/time reconsideration;
- Trigger.dev adapter if retained;
- PostgreSQL/domain currentness/idempotency as authority;
- stale/overdue trigger reconciliation.

Trigger.dev keys are never the sole guarantee: current v4 scopes/TTL/failure-clearing semantics are explicitly accounted for.

## 11. Product surfaces on real state

### G40 — Home / Needs You / Managed / Review / Moment

After G11 + G21 + G31/G32:
- connect the frozen UI contract to real read models/actions;
- preserve strict zero semantics;
- Managed only when relevant monitoring is trustworthy;
- bounded typed Review;
- source-grounded Moment;
- correct async mutation truth.

## 12. Contextual communication / external-effect reconciliation

### G50 — Reply / Reply All + immediate Send

Current v1 activation:
- contextual Reply/Reply All;
- explicit effective sender;
- inspectable recipients/body;
- manual composer baseline;
- explicit **IMMEDIATE** Send.

Not current gates:
- fresh Compose parity;
- Forward parity;
- Send Later;
- generic Undo/recall;
- silent offline queued send.

### G51 — Send reconciliation + Responsibility re-evaluation

Must preserve:

```text
Send click/request
!= provider acceptance
!= Responsibility outcome satisfied
```

Ambiguous provider result requires reconciliation before retry or state progression.

## 13. Failure / integrity closure

### G60

Integrate:
- auth loss / reconnect / missing interval reconciliation;
- sync lag / data-through boundaries;
- notification channel separation;
- Temporal overdue recovery;
- send ambiguity;
- attachment access degradation;
- intentional disconnect vs app sign-out;
- supported Settings mutation truth;
- Product-account deletion boundary for release.

No infrastructure failure becomes fake Needs You, fake No Responsibility, false zero or healthy reassurance.

## 14. Bounded AI interpretation

### G70

After deterministic reducer input contract is frozen:
- OpenAI Responses API + Structured Outputs;
- minimum authorized context;
- application/source/provenance validation;
- evidence revision freshness;
- layered eval + holdout;
- current model selected from evidence;
- current OpenAI data-control/retention review;
- `store: false` where appropriate, without pretending that means ZDR.

AI never owns authorization, provider facts, accepted Responsibility effects, live tracking, Temporal effects or Send permission.

## 15. Complete-loop integration

### G80 — Minimum Complete Delegation Loop

Full cumulative integration gate, not feature checklist.

Representative mandatory behavior:

```text
request/send
-> provider reconciles
-> Waiting/Managed
-> progress reply stays quiet
-> actionable reply returns to Needs You/Moment
-> user replies/sends
-> ambiguous/accepted provider result reconciles
-> Responsibility continues Waiting or closes only with sufficient evidence
```

Also prove:
- no-reply temporal return;
- provider auth/sync interruption and recovery;
- attachment fallback;
- AI unavailable while Source/manual reply remains usable.

Acceptance binds to:
- Product Golden Scenarios;
- Responsibility transition/high-harm oracles;
- Issue #55 UI acceptance;
- exact-head CI/E2E/provider evidence;
- full independent cumulative audit.

## 16. Public-beta release gate

### R90

Separate from local/private G80 proof.

Before public release where applicable:
- Google OAuth verification/restricted-scope security assessment;
- privacy/retention/deletion policy implementation;
- credential encryption/key rotation/revocation operations;
- production secrets/region/backup/restore/observability;
- current OpenAI data-control/privacy posture;
- release accessibility/device/browser matrix;
- recovery/support runbooks.

Do not hide compliance work; do not serialize all local Product implementation behind it.

## 17. Parallelization rules

Use `IMPLEMENTATION-GRAPH.md` for exact edges/classes.

Safe principle:
- parallelize independent proof/UI/provider work;
- serialize shared authority/schema/reducer/send/Temporal integration;
- every branch runs repository preflight and isolates mutable runtime resources;
- exact-head CI and full acceptance audit before merge;
- FAIL corrections are batched after completing the audit;
- repeated correction failure triggers root-cause review before another patch loop.

## 18. Scope discipline

Do not smuggle into current critical path:
- Microsoft;
- Person/CRM;
- broad multi-account Scope UX;
- Pin;
- generic automation/rules;
- full native email client parity;
- Forward/Send Later/Undo parity;
- autonomous Send;
- rich preview as CORE;
- generic NL Search as CORE.

The target remains one complete, trustworthy behavioral loop.

## 19. Empirical boundary

Issue #36 remains open and can later use the real Product.

Implementation cannot by itself authorize claims about:
- ICP;
- market pain frequency/severity;
- monitoring relinquishment;
- PMF;
- WTP/pricing;
- retention;
- differentiation against real current workflows.