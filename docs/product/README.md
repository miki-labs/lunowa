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
- lifecycle authority;
- AI boundary;
- Temporal Contract reliability;
- send/search/security/failure architecture;
- architectural invariants.

### `DATA-MODEL.md`

Conceptual durable data model:

- User / Scope / ConnectedAccount;
- Conversation / Message / Attachment;
- ActionItem;
- lifecycle dimensions;
- provenance;
- TemporalContract / TemporalTrigger;
- Draft / SendOperation;
- derived search/audit projections;
- concurrency and persistence invariants.

### `CONTRACTS.md`

Logical contracts between modules:

- provider adapter;
- sync/ingestion;
- AI structured extraction;
- lifecycle reducer;
- conversation aggregate;
- Temporal Contract scheduler;
- attention/resurfacing;
- drafts/send;
- search/context/preview;
- background jobs;
- error semantics.

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
- deterministic lifecycle/Temporal Contract;
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
- `../design/references/00-brand-system.png` through `19-mobile-layout.png`

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
| What should the user experience/interaction be? | `docs/design/*.md` + relevant visual reference |
| What product-specific technical boundary/invariant applies? | `docs/product/ARCHITECTURE.md` + accepted relevant ADR |
| What data concept/ownership applies? | `docs/product/DATA-MODEL.md` |
| What module/API/job semantics apply? | `docs/product/CONTRACTS.md` |
| What technology/runtime choice is currently accepted? | `docs/product/TECH-STACK.md` + relevant ADR |
| How should the current implementation effort be sequenced? | `docs/product/IMPLEMENTATION-PLAN.md` + current `docs/plans/active/` artifact |
| What is actually implemented now? | current code/schema/migrations/tests/runtime evidence |
| What generic engineering rule applies? | relevant reusable `docs/*.md` baseline |
| What is currently true about Gmail/Microsoft/AI/platform APIs? | current official provider documentation, checked at implementation time |

When sources materially conflict, do not silently guess. Identify the question, inspect the appropriate authority/current code, and reconcile or escalate.

---

## High-value product invariants

Keep these visible when planning/implementing:

1. Normal conversation-row click opens `会話`; status chip opens `今の要点`.
2. Conversation can contain multiple Action Items; Conversation is not the single workflow state owner.
3. One Moment should generally present one primary current question/action.
4. AI interprets; deterministic rules own authoritative lifecycle state.
5. Temporal Contracts are durable promises with persisted triggers/reconciliation.
6. Provider mailbox facts and Lunowa-specific workflow facts have distinct authorities.
7. Core reading/composing remains usable when AI is unavailable.
8. Scope boundaries apply before search/retrieval/AI context exposure.
9. Pin is a user override orthogonal to lifecycle state.
10. Lunowa application authentication and connected-mailbox authorization are separate security/domain boundaries.
11. Durable background execution is not the authority for lifecycle/Temporal Contract state; PostgreSQL/domain state remains authoritative.
12. Do not optimize feature count; reduce Communication Management Burden while preserving control/trust.

---

## Change discipline

Update these documents only when durable accepted knowledge changes.

Do not duplicate transient debugging notes or every implementation detail here. Prefer code/tests for local mechanics, active plans for current execution, and decision records for costly-to-reverse rationale.