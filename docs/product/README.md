# Lunowa Product Engineering Map

## Status

This directory contains Lunowa-specific durable product-engineering knowledge.

It complements the reusable engineering baseline in `docs/*.md` and the visual/interaction design sources in `docs/design/`.

Do not treat raw chat history as product source of truth when a current repository artifact exists.

---

## Documents

### `ARCHITECTURE.md`

Current product-specific architecture:

- modular-monolith default;
- module ownership;
- provider boundaries;
- sync/async architecture;
- Responsibility/domain authority;
- AI boundary;
- Temporal Contract reliability;
- send/search/security/failure architecture;
- architectural invariants.

The Responsibility-related architecture is reconciled to v0.1 semantics.

### `DATA-MODEL.md`

Conceptual durable model:

- User / Scope / ConnectedAccount;
- Conversation / Message / Attachment;
- Responsibility and scenario-required semantic concepts;
- provenance / user field corrections;
- TemporalContract / TemporalTrigger;
- Draft / SendOperation;
- derived search/audit projections;
- concurrency/versioning invariants.

Responsibility L1 persistence boundaries are now accepted by ADR 0009 / `responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md`; exact PostgreSQL/Drizzle DDL remains open.

### `CONTRACTS.md`

Logical contracts between modules:

- provider adapter;
- sync/ingestion;
- AI structured interpretation;
- Responsibility reduction/effects;
- conversation aggregate projection;
- Temporal Contract scheduler;
- attention/resurfacing;
- drafts/send;
- search/context/preview;
- background jobs;
- error/versioning/testing semantics.

### `responsibility/`

Primary authority for canonical Responsibility semantics, annotation/evaluation behavior, and the accepted L1 persistence boundary.

Recommended reading order:

1. `responsibility/README.md` — scope/status/freeze levels/current implementation gate;
2. `responsibility/DECISIONS.md` — FIXED/OPEN/SUPERSEDED semantic decisions;
3. `responsibility/CONSISTENCY-AUDIT.md` — reconciliation findings/errata;
4. `responsibility/ANNOTATION-GUIDELINES.md` — evidence/communication/admission/identity semantics;
5. `responsibility/SCENARIO-SCHEMA.md` — canonical focal-event oracle contract;
6. `responsibility/TRANSITION-SCHEMA.md` — multi-event trace contract;
7. `responsibility/COVERAGE-PLAN.md` — mandatory corpus coverage inventory;
8. `responsibility/TIER-0-SCENARIO-MATRIX.md` — base-oracle assignments/variants;
9. detailed Tier-0 oracle files — 44/44 full layered base semantic contracts;
10. `responsibility/TRANSITION-ORACLES.md` — all 20 mandatory transition traces;
11. physical-model audit files — adversarial persistence-boundary pressure;
12. `responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md` — accepted L1 boundary and L2 requirements.

### Responsibility freeze levels

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle DDL            OPEN
L3 migrations/runtime                     NOT STARTED
```

The current L1 boundary is conceptually:

```text
# Accepted Responsibility aggregate
Responsibility
ObligationLeg[]
ExpectedEvent[]
TemporalFact[]
FieldDecision[]
ProvenanceReference[]
DomainEvent[]
SemanticDetails (typed/versioned local document)

# Accepted unresolved pre-admission product state
AdmissionReview[]

# Separate evidence/inference systems
Message / Attachment / provider observations
AIInterpretationRun

# Separate durable operational authorities
TemporalContract / TemporalTrigger
Draft / SendOperation
```

Exact table names, columns, enums, indexes, JSON field names, and Drizzle definitions are still L2 decisions.

### Responsibility source-of-truth reconciliation

The prior conflict between Responsibility v0.1 and older lifecycle-specific text has been reconciled across the durable routing/design/engineering sources that could otherwise steer implementation:

```text
AGENTS.md
README.md
docs/design/DESIGN.md
docs/design/INTERACTIONS.md
docs/design/RESPONSIVE.md
docs/design/references/README.md
docs/product/ARCHITECTURE.md
docs/product/DATA-MODEL.md
docs/product/CONTRACTS.md
docs/product/IMPLEMENTATION-PLAN.md
docs/product/TECH-STACK.md
docs/decisions/0001-modular-monolith-default.md
docs/decisions/0002-ai-understands-rules-decide-state.md
docs/decisions/0003-temporal-contracts-use-durable-scheduling.md
docs/decisions/0004-web-runtime-and-ui-stack.md
docs/decisions/0005-auth-and-persistence-stack.md
docs/decisions/0006-provider-sync-and-background-runtime.md
docs/decisions/0007-initial-ai-runtime.md
docs/decisions/0008-responsibility-state-is-orthogonal.md
docs/decisions/0009-responsibility-persistence-boundary.md
```

Current semantic direction is orthogonal across:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
uncertainty/risk
provenance
```

The former single lifecycle enum, scalar `next_owner/BOTH`, one `deadline_at`, and follow-up-as-lifecycle model are not canonical truth.

### `TECH-STACK.md`

Accepted initial implementation stack and activation policy:

- Node.js 24 LTS / pnpm / TypeScript strict;
- Next.js 16.x App Router / React 19.x;
- Tailwind CSS 4 / shadcn/ui / next-intl;
- PostgreSQL 18 / Neon / Drizzle;
- Better Auth for Lunowa application sessions, separated from mailbox authorization;
- Trigger.dev for durable background execution once real sync/scheduling begins;
- Gmail API first, Microsoft Graph second;
- OpenAI Responses API + Structured Outputs for initial AI runtime;
- PostgreSQL full-text search first;
- Vitest / React Testing Library / Playwright verification stack.

Re-check current official provider/runtime facts whenever they materially affect implementation/release.

### `IMPLEMENTATION-PLAN.md`

Active staged execution plan:

- bootstrap;
- fake-data high-fidelity UI using current Responsibility projections;
- exact L2 Responsibility DDL design/review, then persistence implementation;
- Gmail read slice;
- real send;
- deterministic Responsibility/Temporal Contract behavior;
- AI interpretation behind canonical evals;
- search/context;
- Microsoft adapter;
- beta hardening.

This is a living plan, not permanent product semantics.

### Current task-specific execution

Implementation handoff is **Issue-driven**.

Use the current GitHub Issue for task-specific Goal / Why / Scope / Acceptance / Verification. Use repository documents for durable constraints. A repository-local plan/design/task artifact is required only when the Issue explicitly links one or the work is too complex/high-risk for the Issue contract alone.

Do not invent a missing `docs/plans/active/*` artifact or infer current task intent from an obsolete path.

---

## Durable architecture decisions

Material choices that should not silently change during ordinary implementation live under `docs/decisions/`.

Current high-value ADRs include:

- `0001-modular-monolith-default.md`;
- `0002-ai-understands-rules-decide-state.md` — AI interpretation vs trusted Responsibility authority;
- `0003-temporal-contracts-use-durable-scheduling.md` — durable/reconcilable attention promises;
- `0004-web-runtime-and-ui-stack.md`;
- `0005-auth-and-persistence-stack.md`;
- `0006-provider-sync-and-background-runtime.md`;
- `0007-initial-ai-runtime.md` — initial bounded Structured Outputs runtime/eval boundary;
- `0008-responsibility-state-is-orthogonal.md` — orthogonal canonical state + deterministic UI projections;
- `0009-responsibility-persistence-boundary.md` — accepted hybrid L1 persistence boundary; exact DDL remains L2.

A decision may be superseded by stronger evidence, but rationale/consequences should be recorded.

---

## Related product/UX sources

- `../design/DESIGN.md`;
- `../design/INTERACTIONS.md`;
- `../design/RESPONSIVE.md`;
- visual references under `../design/references/`.

`DESIGN.md` / `INTERACTIONS.md` are reconciled with Responsibility v0.1: `My Turn / Waiting / Later / Done / Review` are interaction projections, not the old canonical lifecycle enum. Legacy visual filenames are interpreted through `references/README.md`.

---

## Reusable engineering sources

Read when relevant:

- `../core-principles.md`;
- `../implementation-workflow.md`;
- `../greenfield-bootstrap.md`;
- `../architecture-design.md`;
- `../reuse-dependencies.md`;
- `../reliability-operability.md`;
- `../security-privacy.md`;
- `../verification-review.md`;
- `../platform-development.md`;
- `../production-readiness.md`;
- `../product-operations.md`;
- `../monetization-engineering.md`;
- `../ai-product-runtime.md`;
- `../coding-agent-harness.md`;
- `../repository-knowledge.md`;
- `../references.md`.

---

## Authority by question

| Question | Primary authority |
| --- | --- |
| Canonical Responsibility semantics / annotation/eval rules? | `docs/product/responsibility/*` + ADR 0008 |
| Responsibility logical persistence boundary? | ADR 0009 + `responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md` |
| Exact Responsibility PostgreSQL/Drizzle schema? | future accepted L2 DDL artifact; until then **OPEN** |
| Product-level Responsibility architecture/module boundary? | `ARCHITECTURE.md` + ADRs 0002/0008/0009 |
| Conceptual Responsibility persistence/ownership? | `DATA-MODEL.md` + ADRs 0008/0009 |
| Module/API/job Responsibility semantics? | `CONTRACTS.md` + Responsibility semantic baseline |
| User-facing Responsibility interaction/projection behavior? | `docs/design/INTERACTIONS.md` + `docs/design/DESIGN.md` |
| AI interpretation authority/runtime? | ADRs 0002/0007 + `CONTRACTS.md` + canonical eval artifacts |
| Temporal Contract durability/attention semantics? | ADR 0003 + `ARCHITECTURE.md` + `CONTRACTS.md` |
| Other product-specific technical boundary/invariant? | `ARCHITECTURE.md` + accepted relevant ADR |
| Technology/runtime choice? | `TECH-STACK.md` + relevant ADR |
| Current implementation sequence? | `IMPLEMENTATION-PLAN.md`; current GitHub Issue supplies task-specific intent |
| What is actually implemented now? | current code/schema/migrations/tests/runtime evidence |
| Generic engineering rule? | relevant reusable `docs/*.md` baseline |
| Current Gmail/Microsoft/AI/platform fact? | current official provider documentation at implementation time |

If sources materially conflict again, do not silently guess. Treat the contradiction as a spec defect and reconcile it before durable implementation.

---

## High-value product invariants

1. Normal row click opens `会話`; Responsibility/status chip opens `今の要点`.
2. Conversation can contain multiple Responsibilities; Conversation is not one workflow-state owner.
3. One Moment generally presents one primary current question/action.
4. Evidence, interpretation, admission, accepted Responsibility state, safe action, and UI projection are distinct.
5. AI interprets; trusted product/domain logic owns accepted Responsibility state and privileged effects.
6. Resolution, live tracking activation, and attention/defer are orthogonal.
7. Parallel/contingent work may require multiple obligation legs; scalar `BOTH` is not canonical truth.
8. Temporal facts remain distinct: source due, expected-event time, user target, resurface, follow-up.
9. Temporal Contracts are durable/reconcilable promises.
10. Communication hold is not automatically Later/snooze.
11. Provider observations and Lunowa domain facts have field-scoped authorities.
12. Send attempt is not provider-reconciled acceptance; reconciliation closes only the appropriate operational outcome.
13. Core reading/composing remains usable when AI is unavailable.
14. Scope/account boundaries apply before search/retrieval/AI context exposure.
15. Cross-account semantic similarity does not authorize Responsibility merge.
16. Admission `NEEDS_REVIEW` may exist before a Responsibility; durable surfaced Review must not be modeled as a fake Responsibility.
17. Determinate `DO_NOT_TRACK` normally produces no Responsibility or durable AdmissionReview product-state row.
18. Projection equality does not imply semantic equality.
19. Pin is independent of Responsibility semantics.
20. App auth and connected-mailbox authorization are separate boundaries.