# Lunowa Product Engineering Map

## Status

This directory contains Lunowa-specific durable product-engineering knowledge.

It complements the reusable engineering baseline in `docs/*.md` and the visual/interaction design sources in `docs/design/`.

Do not treat raw chat history as the product source of truth when the relevant repository artifact exists.

---

## Documents

### `ARCHITECTURE.md`

Current product-specific architecture:

- modular-monolith default;
- module ownership;
- provider boundaries;
- sync/async architecture;
- responsibility/domain authority;
- AI boundary;
- Temporal Contract reliability;
- send/search/security/failure architecture;
- architectural invariants.

### `DATA-MODEL.md`

Conceptual durable data model for broader product entities and ownership:

- User / Scope / ConnectedAccount;
- Conversation / Message / Attachment;
- provenance;
- TemporalContract / TemporalTrigger;
- Draft / SendOperation;
- derived search/audit projections;
- concurrency and persistence invariants.

**Responsibility-specific ActionItem lifecycle/scalar-owner/deadline details in this older document are not current semantic authority.** See `responsibility/` and the stop condition below before implementing them.

### `CONTRACTS.md`

Logical contracts between modules:

- provider adapter;
- sync/ingestion;
- AI interpretation;
- domain reduction;
- conversation aggregate;
- Temporal Contract scheduler;
- attention/resurfacing;
- drafts/send;
- search/context/preview;
- background jobs;
- error semantics.

**Older single-lifecycle `ActionItem` reducer/output shapes in this document predate the Responsibility v0.1 semantic model.** They must be reconciled before responsibility-domain implementation.

### `responsibility/`

Primary authority for canonical Responsibility semantics and their annotation/evaluation contract.

Read in this order for responsibility work:

1. `responsibility/README.md` — scope, precedence, status, and implementation stop condition;
2. `responsibility/DECISIONS.md` — fixed/open/superseded semantic decisions;
3. `responsibility/CONSISTENCY-AUDIT.md` — cross-document reconciliation, compatibility aliases, errata, and migration guardrails;
4. `responsibility/ANNOTATION-GUIDELINES.md` — communication/evidence/admission/identity semantics;
5. `responsibility/SCENARIO-SCHEMA.md` — canonical focal-event oracle contract;
6. `responsibility/TRANSITION-SCHEMA.md` — multi-event trace contract;
7. `responsibility/COVERAGE-PLAN.md` — mandatory corpus coverage inventory;
8. `responsibility/TIER-0-SCENARIO-MATRIX.md` — first base-oracle assignment matrix;
9. `responsibility/TIER-0-CRITICAL-ORACLES.md` — first detailed critical oracles;
10. `responsibility/TRANSITION-ORACLES.md` — all 20 mandatory transition traces.

### Responsibility implementation stop condition

Until `DATA-MODEL.md`, `CONTRACTS.md`, and the relevant `design/INTERACTIONS.md` responsibility sections are explicitly reconciled against the v0.1 Responsibility semantics:

> **Do not implement the legacy single lifecycle enum, scalar `next_owner`, `BOTH`, one `deadline_at`, or whole-item override model merely because they appear in older accepted/current documents.**

Current canonical Responsibility semantics are evidence-relative and orthogonal across at least:

```text
resolution
live tracking activation
attention/defer
obligation legs/actionability
expected events/completion criteria
temporal facts
uncertainty/risk
provenance
```

Physical schema remains open.

### `TECH-STACK.md`

Accepted initial implementation stack and activation policy:

- Node.js 24 LTS / pnpm / TypeScript strict;
- Next.js 16.x App Router / React 19.x;
- Tailwind CSS 4 / shadcn/ui / next-intl;
- PostgreSQL 18 / Neon / Drizzle;
- Better Auth for Lunowa application sessions, separated from mailbox authorization;
- Trigger.dev for durable background execution once real sync/scheduling begins;
- Gmail API first, Microsoft Graph second;
- OpenAI Responses API + Structured Outputs for the initial AI interpretation runtime;
- PostgreSQL full-text search first;
- Vitest / React Testing Library / Playwright verification stack.

`TECH-STACK.md` also records activation phases, current externally verified constraints, deliberate deferrals, and launch-sensitive provider constraints. Re-check external provider/runtime facts when they materially affect implementation or release.

### `IMPLEMENTATION-PLAN.md`

Active staged execution plan:

- bootstrap;
- fake-data high-fidelity UI;
- domain/persistence;
- Gmail read slice;
- real send;
- deterministic responsibility/Temporal Contract behavior;
- AI interpretation;
- search/context;
- Microsoft adapter;
- beta hardening.

This is a living plan, not permanent product semantics.

### Active execution plan

- `../plans/active/phase-0-bootstrap.md` — current Codex-ready bootstrap task contract. It establishes the real application scaffold and canonical verification commands without prematurely activating database/provider/AI/background infrastructure.

---

## Durable architecture decisions

Material choices that should not be silently re-litigated during ordinary implementation live under `docs/decisions/`.

Current high-value decisions include:

- `0001-modular-monolith-default.md`
- `0002-ai-understands-rules-decide-state.md`
- `0003-temporal-contracts-use-durable-scheduling.md`
- `0004-web-runtime-and-ui-stack.md`
- `0005-auth-and-persistence-stack.md`
- `0006-provider-sync-and-background-runtime.md`
- `0007-initial-ai-runtime.md`

A decision can be superseded by stronger evidence, but the reason and consequences should be recorded rather than silently changing architecture through an implementation task.

---

## Related product/UX sources

- `../design/DESIGN.md`
- `../design/INTERACTIONS.md`
- `../design/RESPONSIVE.md`
- `../design/references/README.md`
- visual references under `../design/references/`.

`INTERACTIONS.md` remains the interaction source for click/compose/search/layout behavior, but its older “internal lifecycle state” section is not current Responsibility-domain semantic authority until reconciled.

---

## Reusable engineering sources

Read only when relevant:

- `../core-principles.md`
- `../implementation-workflow.md`
- `../greenfield-bootstrap.md`
- `../architecture-design.md`
- `../reuse-dependencies.md`
- `../reliability-operability.md`
- `../security-privacy.md`
- `../verification-review.md`
- `../platform-development.md`
- `../production-readiness.md`
- `../product-operations.md`
- `../monetization-engineering.md`
- `../ai-product-runtime.md`
- `../coding-agent-harness.md`
- `../repository-knowledge.md`
- `../references.md`

---

## Authority by question

Do not use one total precedence list for every issue.

| Question | Primary authority |
| --- | --- |
| What are the canonical Responsibility semantics / annotation/eval rules? | `docs/product/responsibility/README.md`, `DECISIONS.md`, `CONSISTENCY-AUDIT.md`, and the relevant responsibility artifact |
| What should the user experience/interaction be outside conflicting legacy Responsibility state semantics? | `docs/design/*.md` + relevant visual reference |
| What product-specific technical boundary/invariant applies? | `docs/product/ARCHITECTURE.md` + accepted relevant ADR |
| What data concept/ownership applies outside Responsibility semantics? | `docs/product/DATA-MODEL.md` |
| What module/API/job semantics apply outside conflicting legacy Responsibility reducer shapes? | `docs/product/CONTRACTS.md` |
| What technology/runtime choice is currently accepted? | `docs/product/TECH-STACK.md` + relevant ADR |
| How should the current implementation effort be sequenced? | `docs/product/IMPLEMENTATION-PLAN.md` + current `docs/plans/active/` artifact |
| What is actually implemented now? | current code/schema/migrations/tests/runtime evidence |
| What generic engineering rule applies? | relevant reusable `docs/*.md` baseline |
| What is currently true about Gmail/Microsoft/AI/platform APIs? | current official provider documentation, checked at implementation time |

When sources materially conflict, do not silently guess. Identify the question, use the appropriate authority, and reconcile before implementation when the conflict affects durable domain behavior.

---

## High-value product invariants

Keep these visible when planning/implementing:

1. Normal conversation-row click opens `会話`; status/action chip opens `今の要点`.
2. Conversation can contain multiple Responsibilities; Conversation is not the single workflow state owner.
3. One Moment should generally present one primary current question/action.
4. AI interprets; deterministic/trusted product logic owns accepted Responsibility/domain state.
5. Original evidence, interpretation, canonical Responsibility state, safe action, and UI projection are distinct layers.
6. Resolution, live tracking activation, and attention/defer are orthogonal semantics.
7. Temporal Contracts are durable promises with persisted triggers/reconciliation.
8. Provider mailbox facts and Lunowa-specific domain facts have distinct authorities.
9. Core reading/composing remains usable when AI is unavailable.
10. Scope/account boundaries apply before search/retrieval/AI context exposure.
11. Pin is a user override orthogonal to Responsibility semantics.
12. Lunowa application authentication and connected-mailbox authorization are separate security/domain boundaries.
13. Durable background execution is not the authority for Responsibility state; trusted persisted domain/evidence state is authoritative.
14. Do not optimize feature count; reduce Communication Management Burden while preserving control/trust.

---

## Change discipline

Update durable documents only when accepted knowledge changes.

Do not duplicate transient debugging notes or every implementation detail here. Prefer code/tests for local mechanics, active plans for current execution, and decision records for costly-to-reverse rationale.

If a stronger scenario, transition, production failure, or external fact changes a prior decision, update the durable source and record why rather than preserving stale consistency.