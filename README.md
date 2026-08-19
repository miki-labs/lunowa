# Lunowa

Lunowa is a communication-management email product designed around a simple goal:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

Instead of optimizing for more inbox features, more AI visibility, or more dashboard density, Lunowa aims to reduce **Communication Management Burden**:

- **Monitoring cost / 時間** — users should not have to remember when to check again.
- **Execution cost / 操作** — reduce searching, page/app switching, copying, manual task creation, and repeated clicks.
- **Interpretation cost / 視覚・理解** — reduce the work required to reconstruct what matters from long communication threads.
- **Verification cost / 信頼** — reduce repeated `念のため` checking without hiding the evidence/control required for trust.

Internal principle:

> **Eliminate work, not control.**

---

## Current status

**Phase 0 runtime bootstrap is mechanically verified; `main` protection is the immediate next step.**

The repository now contains:

- the accepted Lunowa product/interaction/responsive design specification;
- 20 visual UI references;
- the initial product architecture;
- conceptual data model;
- integration/domain contracts;
- staged implementation plan;
- durable architecture decisions;
- the accepted initial technology stack;
- a real Next.js/TypeScript application scaffold;
- locked pnpm dependencies with explicit dependency-build policy;
- next-intl Japanese/English locale plumbing;
- Vitest + React Testing Library verification;
- Playwright browser smoke verification;
- GitHub Actions with stable `Verify` and `E2E Smoke` checks;
- a reusable software-engineering baseline inherited from the bootstrap blueprint.

The initial framework/runtime/database/hosting direction remains governed by `docs/product/TECH-STACK.md`. Only the Phase 0 runtime/testing portion is active now; Gmail, production persistence/auth/jobs/AI and other later-phase services remain intentionally unactivated.

Before normal Phase 1 product implementation, the `main` Ruleset should require the established `Verify` and `E2E Smoke` checks.

---

## Core product model

### Familiar email, different attention model

Lunowa keeps familiar email reading/composing behavior but adds a lifecycle/attention layer.

Conceptually:

```text
receive
 -> understand context
 -> identify Action Items
 -> determine lifecycle state
 -> decide whether attention is needed now
 -> if safe, create a Temporal Contract
 -> resurface on time/reply/deadline condition
 -> re-evaluate
```

### Conversation is not the workflow state

A Conversation may contain several independent Action Items.

```text
Conversation
├─ Message / Communication Events
└─ Action Items
   ├─ Task A — ACTION_REQUIRED
   ├─ Task B — WAITING
   └─ Task C — DEFERRED
```

The UI may show one primary conversation status, but that status is a derived projection of current Action Items rather than the sole source of truth.

### `会話` and `今の要点`

A high-value interaction invariant:

- normal conversation-row body click -> **`会話`**;
- lifecycle/status chip click -> **`今の要点`**.

Lunowa's contextual intelligence must not become an unavoidable intermediate screen for ordinary mail reading.

### Temporal Contract

A Temporal Contract is a persisted promise about when an item can leave the user's attention and when it will return.

Example:

```text
8月21日 9:00に戻します

田中さんから返信が来れば、
それより先に戻します。
```

This is not merely UI copy. The architecture treats it as durable domain state with persisted triggers, idempotent execution, and overdue reconciliation.

### AI boundary

> **AI understands. Rules decide state.**

AI may extract candidate facts such as requested actions, deadlines, waiting/completion signals, and provenance. Deterministic application logic owns authoritative lifecycle transitions, Temporal Contract policy, authorization, and privileged side effects.

Core mail must remain usable when AI is unavailable.

---

## Repository map

Start with `AGENTS.md`; it is the concise map for humans and coding agents.

### Product / UX

```text
docs/design/
├── DESIGN.md
├── INTERACTIONS.md
├── RESPONSIVE.md
└── references/
    ├── README.md
    ├── 00-brand-system.png
    ├── 01-component-system.png
    ├── 02-desktop-conversation-default.png
    ├── ...
    └── 19-mobile-layout.png
```

The generated images are visual references, not self-sufficient specifications. `docs/design/references/README.md` explains authority and caveats.

### Product-specific engineering

```text
docs/product/
├── README.md
├── ARCHITECTURE.md
├── DATA-MODEL.md
├── CONTRACTS.md
├── TECH-STACK.md
└── IMPLEMENTATION-PLAN.md
```

Key responsibilities:

- `ARCHITECTURE.md` — system shape, modules, authorities, provider/AI/scheduler boundaries, failure behavior, invariants.
- `DATA-MODEL.md` — conceptual entities and ownership.
- `CONTRACTS.md` — normalized provider/sync/AI/lifecycle/scheduler/search/send/job contracts.
- `TECH-STACK.md` — accepted initial implementation stack and activation phases.
- `IMPLEMENTATION-PLAN.md` — staged implementation sequence.

### Durable decisions

```text
docs/decisions/
├── 0001-modular-monolith-default.md
├── 0002-ai-understands-rules-decide-state.md
├── 0003-temporal-contracts-use-durable-scheduling.md
└── ...
```

### Reusable engineering baseline

The repository was bootstrapped from a reusable engineering blueprint. Generic engineering guidance remains under `docs/*.md`, including:

- architecture/design defaults;
- greenfield bootstrap;
- reuse/dependencies;
- reliability/operability;
- security/privacy;
- verification/review;
- platform/production readiness;
- user-facing AI runtime engineering;
- coding-agent harness/repository knowledge.

These are **defaults**, not a second Lunowa product spec. Product-specific sources under `docs/design/` and `docs/product/` define Lunowa's accepted behavior/boundaries.

---

## Visual references

The current design-reference set covers:

1. brand system;
2. component system;
3. canonical desktop conversation view;
4. Action Required Moment View;
5. Deferred Moment View;
6. Waiting Moment View;
7. Follow-up Moment View;
8. Completed Moment View;
9. multiple Action Items;
10. new compose;
11. search;
12. person context;
13. attachment preview;
14. navigation/actions;
15. scope/account management;
16. multi-account onboarding;
17. settings;
18. system/error states;
19. tablet layout;
20. mobile layout.

When screenshots conflict with accepted Markdown behavior, follow the relevant text specification. Generated-image sample names, dates, colors, wording, and accidental artifacts are not automatically requirements.

---

## Architecture direction

Accepted initial direction is recorded in `docs/product/TECH-STACK.md`. At a high level it is:

- **responsive web-first**;
- **Next.js/TypeScript modular monolith** initially;
- **PostgreSQL** as the durable relational store when persistence activates;
- **durable background execution** when provider sync/Temporal Contracts activate;
- **Gmail first, Microsoft Graph later** behind provider contracts;
- **one initial evaluated AI provider/runtime** rather than premature multi-provider infrastructure;
- **PostgreSQL search first** with rebuildable derived projections where practical.

The accepted stack is not permission to activate every later-phase dependency during bootstrap. Phase-specific plans control when services and dependencies become real implementation requirements.

---

## Implementation sequence

See `docs/product/IMPLEMENTATION-PLAN.md` and `docs/plans/active/` for acceptance criteria, stop conditions, and the current execution artifact.

High-level order:

```text
0. Bootstrap / runtime + verification + CI establishment   [done]
1. High-fidelity fake-data UI
2. Domain + persistence foundation
3. Gmail read-only slice
4. Real compose/reply/send
5. Deterministic lifecycle + durable Temporal Contract
6. AI interpretation behind deterministic rules
7. Search / Person Context quality
8. Microsoft/Outlook adapter
9. Beta hardening
```

The first product slice after repository protection is deliberately **not** Gmail OAuth or AI.

It is:

> Implement the canonical desktop shell (`00`–`02`) with fake domain-shaped data, browser verification, pane resizing, and the `row body -> 会話` / `status chip -> 今の要点` invariant.

Then implement Moment states `03`–`08` before expensive integrations dictate the UX.

---

## High-value engineering invariants

1. Conversation is not the single lifecycle-state owner; ActionItem is.
2. AI interpretation does not directly own authoritative lifecycle state.
3. Temporal Contract execution must survive restarts/outages and be idempotent/reconcilable.
4. Provider-specific types stay behind provider adapters.
5. Provider mailbox facts and Lunowa workflow facts have distinct authorities.
6. Core email remains usable when AI degrades.
7. Scope/authorization boundaries apply before search/retrieval/AI context exposure.
8. Send retries/double-submit must not duplicate mail.
9. Derived search/summaries/embeddings are not sole authorities for critical facts.
10. Uncertain AI output must not silently hide a likely user obligation.

---

## Development commands

Requirements:

- Node.js 24 LTS
- pnpm 11.20.0 (declared by `packageManager`)

```text
Install: pnpm install --frozen-lockfile
Run:     pnpm dev
Verify:  pnpm verify
E2E:     pnpm test:e2e
Build:   pnpm build
```

`pnpm verify` runs strict typechecking, ESLint, deterministic Vitest tests, and a production Next.js build. Browser smoke remains an explicit separate layer through Playwright and the GitHub `E2E Smoke` check.

Phase 0 requires no external application/provider secret.

---

## Coding-agent workflow

For non-trivial work:

1. read `AGENTS.md`;
2. inspect only the relevant design/product sources;
3. inspect current code/tests once they exist;
4. follow the relevant active plan under `docs/plans/active/`;
5. scope the task with Goal / Why / Scope / Non-goals / invariants / visual references / acceptance criteria / verification / stop conditions;
6. implement a small coherent slice;
7. run real verification (browser/runtime/provider/integration as required);
8. update durable docs if accepted behavior/architecture changed;
9. report what was and was not actually verified.

Do not use the prompt as the only place a durable product constraint exists.

---

## Product discipline

Lunowa is being treated as a product, not a code-generation exercise.

Implementation throughput, AI usage, code volume, feature count, and technical novelty are not the objective. The objective is increasing the probability that real users can trust Lunowa enough to stop manually managing communication they should be able to forget.
