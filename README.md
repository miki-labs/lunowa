# Lunowa

Lunowa is an email-centered communication-monitoring Product whose North Star is:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The core Product value is **Attention Delegation**: unresolved communication may leave the user's active attention while Lunowa monitors accepted Responsibility state and returns the issue only when user attention is genuinely required again.

> **Eliminate work, not control.**

## Canonical Product authority

- `docs/product/PRODUCT.md` — highest-level Product contract;
- `docs/product/PRODUCT-CONTENT.md` — detailed operating contract + final Feature Matrix;
- `docs/product/GOLDEN-SCENARIO-BANK.md` — Product-level acceptance bank, subordinate to Responsibility semantic oracles.

Canonical direction can still contain explicit hypotheses/unknowns. Do not infer market validation from implementation progress, screenshots, candidates or this README.

## Current status — 2026-08-29

- Phase-0 runtime/verification foundation exists.
- Product Content / Golden Scenarios are specification-ready for the current implementation hypothesis; this is **not** Product-market validation.
- Issue #55 / PR #57 completed the implementation-facing v1 UI/UX contract.
- Issue #58 / PR #59 completed the implementation graph / architecture activation freeze.
- Issue #61 / PR #76 completed the minimal five-reference visual freeze; textual Product/UI authority remains normative and runtime/browser audit owns final fidelity.
- `docs/product/IMPLEMENTATION-GRAPH.md` + live GitHub Issues now own exact dependency/parallelization/schema-writer/FK topology.
- **Issue #60 / G00 is the current runtime `SERIAL_GATE`.** Current repo remains `next@16.3.0`; the execution-time 2026-08-29 recheck confirms `16.3.3` as the current accepted Active-LTS security baseline for the 16.3 line.
- After G00 PASS/merge, P13 / P14 / G11 form the first safe parallel execution wave, with serialized root dependency/lockfile merge ownership.
- Issue #36 remains open empirical Product Discovery, deferred in current execution order. Implementation cannot turn ICP/PMF/WTP/retention/reliability into facts.
- Real Product runtime remains materially unimplemented; current application code is bootstrap foundation.

Responsibility persistence status:

```text
L0 semantics                               FROZEN v0.1
L1 logical persistence                     FROZEN v0.1
L2 exact PostgreSQL/Drizzle candidate       v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING (#13/#14)
L2 final freeze                            BLOCKED (#15)
L3 production Responsibility runtime       NOT AUTHORIZED
```

## Product model

```text
communication/source evidence
-> candidate interpretation
-> trusted Responsibility admission/reduction
-> Product consequence
   actionable USER work -> Needs You -> Moment
   material unresolved judgment -> Review
   no current user work/review + trustworthy monitoring -> Managed / quiet
-> user acts/decides only where required
-> external/provider effect reconciles
-> Responsibility re-evaluates
```

Important separations:

```text
Evidence != Interpretation != Accepted State != UI Projection
Message arrival != attention event
Reply/read/silence/send != operational closure
Capability != Permission
Monitoring delegation != Send authority
Mailbox state != Responsibility state
Send request != provider acceptance != operational outcome satisfied
```

A Conversation may contain zero, one or many Responsibilities. `No Responsibility` is valid. Cross-account semantic auto-merge is prohibited initially.

## Current v1 direction

Build one **Gmail-first Minimum Complete Delegation Loop**, not immediate full-client parity:

```text
app session
-> Gmail evidence
-> Responsibility
-> Managed quiet monitoring
-> durable reconsideration
-> Needs You / Review
-> Moment
-> contextual Reply / Reply All
-> manual or bounded AI draft
-> explicit immediate Send
-> provider reconciliation
-> correct Responsibility consequence
-> truthful integrity/recovery
```

Current CORE also includes authorized exact Source search and attachment evidence access.

Not current critical-path prerequisites:

- Microsoft provider;
- broad multi-account/unified-inbox parity;
- Person/CRM Product features;
- generic fresh Compose/Forward parity;
- Send Later/generic Undo;
- rich native attachment preview;
- natural-language Search;
- autonomous Send;
- generic workflow/rule engine.

## Repository map

Start with `AGENTS.md` for current task routing.

```text
docs/product/
├── PRODUCT.md
├── PRODUCT-CONTENT.md
├── GOLDEN-SCENARIO-BANK.md
├── ARCHITECTURE.md
├── DATA-MODEL.md
├── CONTRACTS.md
├── TECH-STACK.md
├── IMPLEMENTATION-PLAN.md
├── IMPLEMENTATION-GRAPH.md
└── responsibility/

docs/design/
├── DESIGN.md
├── INTERACTIONS.md
├── RESPONSIVE.md
└── V1-UI-IMPLEMENTATION-CONTRACT.md

docs/continuity/
├── README.md
├── CURRENT.md
└── KNOWLEDGE-MAP.md
```

`docs/decisions/` contains durable ADR rationale. Live GitHub Issues/PRs/CI own current execution/review state.

## Current implementation routing

```text
G00 / Issue #60 framework security baseline
-> full current-contract implementation
-> clean frozen install + pnpm verify + E2E
-> exact-head GitHub CI
-> full cumulative acceptance audit
-> merge only on PASS

After G00:
P13 / #13  +  P14 / #14  +  G11 / #63   (parallel execution)
-> serialized merge for shared package/lock assets
-> downstream graph according to IMPLEMENTATION-GRAPH.md
-> G80 complete-loop integration
-> R90 public-beta readiness
```

Use `IMPLEMENTATION-GRAPH.md` rather than this summary for exact edges and collision ownership.

## High-value engineering constraints

- Application session != mailbox authorization.
- Provider credentials stay server-side and are encrypted at rest before durable persistence.
- Push/webhook notification is a reconciliation signal, not mailbox/domain truth.
- Proof fixture != production FK target.
- Production FK/reference targets must exist before referencing migrations.
- AI table existence != AI runtime authority.
- Job/vendor idempotency != domain idempotency.
- Worktree/runtime isolation != merge isolation.
- `package.json` / `pnpm-lock.yaml` are serialized merge assets when concurrent tasks touch them.
- Static DDL review != executable PostgreSQL/Drizzle/Auth proof.
- Implementation completion != Product/market validation.

## Development commands

Requirements:

- Node.js 24 LTS
- pnpm 11.20.0

```text
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
pnpm test:e2e
```

GitHub Actions independently runs Verify and E2E Smoke. Exact-head evidence is required for accepted integration work.
