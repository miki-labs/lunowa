# Lunowa

Lunowa is a communication-management email product designed around a simple goal:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

Instead of optimizing for inbox feature count, visible AI, or dashboard density, Lunowa aims to reduce **Communication Management Burden**:

- **Monitoring cost / 時間** — users should not remember when to check again.
- **Execution cost / 操作** — reduce searching, switching, copying, manual task creation, repeated clicks.
- **Interpretation cost / 視覚・理解** — reduce reconstruction of what matters from long threads.
- **Verification cost / 信頼** — reduce repeated `念のため` checking without hiding source/control.

Internal principle:

> **Eliminate work, not control.**

The durable product-level “what/why/for whom” baseline — including audience hypotheses, differentiation, MVP/validation logic, monetization/distribution unknowns, and important supersessions — lives in `docs/product/PRODUCT.md`. Do not infer market validation from this README or from old chat history.

---

## Current status

The Phase-0 runtime/bootstrap foundation is mechanically verified. Product/UX sources, architecture/contracts, technology stack, verification commands, and CI exist. Phase-1 product UI has not yet been implemented.

Responsibility v0.1 semantics are an accepted versioned baseline and have been reconciled across Architecture, Data Model, Contracts, Design, Interactions, Implementation Plan, and repository routing docs.

Current Responsibility proof level:

```text
L0 semantic model                         FROZEN v0.1
L1 logical persistence boundary           FROZEN v0.1
L2 exact PostgreSQL/Drizzle DDL            v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 migrations/runtime                     NOT AUTHORIZED
```

This does **not** mean the physical Responsibility schema or AI runtime behavior is implemented/passed. Static review is not executable PostgreSQL/Drizzle/Auth proof.

Later-phase Gmail/persistence/auth/jobs/AI services remain intentionally unactivated until their implementation phase or bounded proof task requires them.

---

## Core product model

### Familiar email, different Responsibility/attention model

Conceptually:

```text
receive communication
 -> preserve/normalize authorized evidence
 -> understand communication acts/claims
 -> admit zero/one/many Responsibilities
 -> match/reduce evidence into accepted Responsibility state
 -> apply safety/actionability policy
 -> deterministically project My Turn / Waiting / Later / Done / Review
 -> Temporal Contract may reconsider/resurface at time/reply/deadline condition
```

### Conversation is not the workflow state

A Conversation may contain several independent Responsibilities.

```text
Conversation
├─ Communication evidence
└─ Responsibilities
   ├─ R1 -> My Turn projection
   ├─ R2 -> Waiting projection
   └─ R3 -> Later projection
```

The projections are user-facing/derived. They are not one canonical lifecycle enum.

### Canonical Responsibility semantics

The stable v0.1 semantic vector is orthogonal across:

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

Important non-equivalences:

```text
Message != Conversation != Responsibility
Evidence != Interpretation
Claim != provider/external observation
Proposal != agreement
Hold != snooze
Send attempt != reconciled provider acceptance
Requested action != safe next action
Ingestion order != semantic chronology
```

### `会話` and `今の要点`

- normal Conversation-row body click -> **`会話`**;
- Responsibility/status projection chip click -> **`今の要点`**.

Contextual intelligence must not become a mandatory gate for ordinary mail reading.

### Temporal Contract

A Temporal Contract is a persisted product promise governing when a Responsibility is reconsidered/resurfaced.

```text
8月27日 9:00に戻します

田中さんから返信が来れば、
それより先に再確認します。
```

This requires durable triggers, idempotency, and overdue reconciliation. Communication hold/pause is separate from attention defer.

### AI boundary

> **AI understands. Trusted product rules decide accepted Responsibility state.**

AI may interpret communication acts, owners, requested actions, temporal expressions, completion/correction signals, proposals, and uncertainty. Trusted product/domain logic owns admission, identity/effects, accepted state, safety policy, authorization, and privileged side effects.

Core mail remains usable when AI is unavailable. Model confidence is not authority; material uncertainty should be explained through evidence/provenance rather than default confidence-percentage UI.

---

## Repository map

Start with `AGENTS.md`; it is the concise map for humans/coding agents.

### Product thesis / validation state

```text
docs/product/PRODUCT.md
```

Use this for product vision/problem, current audience and differentiation hypotheses, MVP/validation logic, commercial unknowns, product-level non-goals, and superseded product directions. It deliberately distinguishes accepted product direction from hypotheses/needs-validation.

### Product / UX

```text
docs/design/
├── DESIGN.md
├── INTERACTIONS.md
├── RESPONSIVE.md
└── references/
```

Generated images are visual references, not semantic specifications. Historical filenames such as `moment-follow-up` do not imply a current canonical lifecycle enum.

### Product-specific engineering

```text
docs/product/
├── PRODUCT.md
├── README.md
├── ARCHITECTURE.md
├── DATA-MODEL.md
├── CONTRACTS.md
├── TECH-STACK.md
├── IMPLEMENTATION-PLAN.md
└── responsibility/
    ├── README.md
    ├── DECISIONS.md
    ├── CONSISTENCY-AUDIT.md
    ├── ANNOTATION-GUIDELINES.md
    ├── SCENARIO-SCHEMA.md
    ├── TRANSITION-SCHEMA.md
    ├── COVERAGE-PLAN.md
    ├── TIER-0-SCENARIO-MATRIX.md
    ├── TIER-0-CRITICAL-ORACLES.md
    └── TRANSITION-ORACLES.md
```

`docs/product/responsibility/` is the primary semantic/evaluation/persistence-proof authority for Responsibility work.

### Durable decisions

`docs/decisions/` records costly/high-value architecture rationale, including the AI/domain authority boundary, durable Temporal Contracts, runtime stack, persistence/auth, provider/background runtime, initial AI runtime, Responsibility orthogonal state, and the logical persistence boundary.

### Reusable engineering baseline

Generic guidance remains under `docs/*.md`. These are defaults, not a second Lunowa product spec. Lunowa's explicit adoption relationship is recorded through `docs/continuity/BLUEPRINT-ADOPTION.md` after a dedicated reconciliation.

---

## Architecture direction

Current accepted direction at a high level:

- responsive web-first;
- Next.js/TypeScript modular monolith;
- PostgreSQL durable store when persistence activates;
- durable background execution for sync/Temporal Contracts/send scheduling;
- Gmail first, Microsoft Graph later behind provider contracts;
- one initial evaluated AI runtime;
- PostgreSQL search first, rebuildable projections;
- scenario-driven minimal Responsibility persistence rather than generic workflow infrastructure.

Exact current technology choices live in `docs/product/TECH-STACK.md` and ADRs.

Earlier native-mobile/React-Native-first exploration is not current implementation authority; reopen it only with new product/platform evidence.

---

## Implementation sequence

High-level order:

```text
0. Bootstrap/runtime + verification foundation        [mechanically established]
1. High-fidelity fake-data UI using Responsibility projections
2. Minimal physical Responsibility model + persistence
3. Gmail read-only vertical slice
4. Real compose/reply/send
5. Deterministic Responsibility reducer + durable Temporal Contract
6. AI interpretation behind validated contracts/evals
7. Search / Person Context quality
8. Microsoft/Outlook adapter
9. Beta hardening
```

The first product slice is deliberately not Gmail OAuth or AI. It is the canonical desktop shell with fake domain-shaped data and browser verification.

A bounded Responsibility L2 executable proof may run ahead as a falsification spike, but it does **not** authorize production persistence or reorder the product-validation sequence.

Before Phase-2 schema implementation, use the canonical Responsibility oracles and executable proof gate to choose/prove the **smallest physical representation** that preserves fixed semantics.

---

## High-value engineering invariants

1. Conversation is not one workflow-state owner; a Conversation can contain multiple Responsibilities.
2. Responsibility state is orthogonal; do not restore the superseded seven-value lifecycle enum as canonical truth.
3. AI interpretation does not directly own accepted Responsibility state or authorization.
4. Temporal Contract execution is durable/idempotent/reconcilable.
5. Provider observations, immutable communication evidence, and Lunowa product state have distinct authority scopes.
6. Core email remains usable when AI degrades.
7. Scope/account authorization applies before search/retrieval/AI context exposure.
8. Send retries/double-submit must not duplicate mail; ambiguous provider acceptance requires reconciliation.
9. Derived search/summaries/embeddings are not sole critical authorities.
10. A real material user obligation must not be silently hidden because interpretation is missing/uncertain.
11. Cross-account semantic similarity does not authorize Responsibility merge.
12. Prompt-like email content has no system/tool authority.
13. User-facing My Turn/Waiting/Later/Done/Review are deterministic projections, not canonical state.
14. Requested action and safe next action are separate for high-risk requests.

---

## Development commands

Requirements:

- Node.js 24 LTS
- pnpm 11.20.0

```text
Install: pnpm install --frozen-lockfile
Run:     pnpm dev
Verify:  pnpm verify
E2E:     pnpm test:e2e
Build:   pnpm build
```

`pnpm verify` runs strict typecheck, ESLint, deterministic Vitest tests, and production build. Browser smoke is separate through Playwright/GitHub `E2E Smoke`.

Phase 0 requires no external provider/application secret.

---

## Coding-agent workflow

For non-trivial work:

1. read `AGENTS.md`;
2. inspect only relevant durable sources;
3. read `docs/product/PRODUCT.md` when a product/ICP/differentiation/validation assumption can change the task;
4. for Responsibility work, read `docs/product/responsibility/README.md`, `DECISIONS.md`, `CONSISTENCY-AUDIT.md`, and relevant oracles;
5. inspect current code/tests;
6. follow the current Issue and any deliberately linked plan/design artifact;
7. scope Goal / Why / Scope / Non-goals / invariants / acceptance / verification / stop conditions;
8. implement a small coherent slice;
9. run real verification at the owning layer;
10. update durable docs when accepted semantics/architecture/product decisions change;
11. report exactly what was and was not verified.

Do not use a prompt, old chat, or legacy screenshot filename as the only place a durable product constraint exists.

---

## Product discipline

Lunowa is a product, not a code-generation exercise.

Implementation throughput, AI usage, code volume, feature count, and technical novelty are not the objective. The objective is increasing the probability that real users can trust Lunowa enough to stop manually managing communication they should be able to forget.

Current audience, willingness-to-pay, distribution, retention, and differentiation claims remain hypotheses where `docs/product/PRODUCT.md` marks them as such. Do not let engineering completeness masquerade as product validation.
