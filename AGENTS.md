# AGENTS.md

This repository builds **Lunowa**, a communication-management email product whose North Star is:

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

This file is a **map**, not the handbook. Read only the Source of Truth relevant to the task.

## Current repository stage

Lunowa has a mechanically verified Phase-0 application/runtime foundation. Phase-1 product UI has not yet been implemented.

Responsibility v0.1 semantics and its logical persistence boundary are accepted versioned baselines. The exact PostgreSQL/Drizzle schema is currently **v0.4, static-review complete but not executable-proof complete**. Production migrations/runtime remain unauthorized until the L2 proof gate passes.

Current bounded technical proof routing:

```text
Issue #13 -> PostgreSQL 18 / Drizzle executable schema proof
Issue #14 -> Better Auth UUID persistence proof
Issue #15 -> independent combined review + L2 freeze decision
```

The authoritative execution gate is `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md`.

This does **not** mean the physical Responsibility schema, migrations, reducer, or AI runtime are implemented/passed.

Executable tooling is governed by checked-in runtime/config (`package.json`, lockfile, test config, CI). Durable product behavior/architecture is governed by current docs/decisions.

Task-specific implementation intent is **Issue-driven**: use the referenced GitHub Issue for the current task's Goal/Why/Scope/Acceptance/Verification, and use repository docs for durable constraints. A complex/high-risk Issue may link a repository-local plan/design/task artifact; do not assume a permanent `docs/plans/active/` directory exists.

Do not invent or silently replace framework/database/auth/provider/job/AI choices. Read `docs/product/TECH-STACK.md`, relevant ADRs, `docs/product/IMPLEMENTATION-PLAN.md`, and the current task Issue before implementation.

---

## Source of truth by question

### Responsibility semantics / eval / persistence proof

For any task involving task extraction, Responsibility state, owner/actionability, deadlines, waiting, completion, follow-up, uncertainty, historical activation, safety, projection, or Responsibility persistence, start here:

- `docs/product/responsibility/README.md` — status/scope/current implementation gate;
- `docs/product/responsibility/DECISIONS.md` — FIXED/OPEN/SUPERSEDED decisions;
- `docs/product/responsibility/CONSISTENCY-AUDIT.md` — reconciliations/errata;
- `docs/product/responsibility/ANNOTATION-GUIDELINES.md` — communication/evidence/admission semantics;
- `docs/product/responsibility/SCENARIO-SCHEMA.md` — focal-event oracle contract;
- `docs/product/responsibility/TRANSITION-SCHEMA.md` — multi-event trace contract;
- `docs/product/responsibility/COVERAGE-PLAN.md` + oracle files when implementing/evaluating domain behavior;
- `docs/product/responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md` — frozen L1 logical persistence boundary;
- `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — current exact L2 candidate; not migration authority until the executable gate passes;
- `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md` — proof/evidence requirements before L2 freeze;
- `docs/decisions/0008-responsibility-state-is-orthogonal.md` — state/projection architecture rationale;
- `docs/decisions/0009-responsibility-persistence-hybrid-boundary.md` — logical persistence-boundary rationale.

Do **not** derive canonical state from legacy screenshot filenames such as `moment-action-required`, `moment-deferred`, or `moment-follow-up`.

### Product / UX behavior

- `docs/design/DESIGN.md` — product intent, information architecture, visual/product principles.
- `docs/design/INTERACTIONS.md` — click semantics, Responsibility projections/Moment View, Temporal Contract, compose/search/context/error interactions.
- `docs/design/RESPONSIVE.md` — pane/responsive behavior under the same Responsibility projection model.
- `docs/design/references/README.md` — visual-reference authority and legacy filename caveats.
- `docs/design/references/00-brand-system.png` through `19-mobile-layout.png` — visual references only within those rules.

### Product-specific engineering

- `docs/product/README.md` — product engineering map/authority table.
- `docs/product/ARCHITECTURE.md` — modules, authority, provider/AI/scheduler boundaries, failure behavior.
- `docs/product/DATA-MODEL.md` — conceptual entities/ownership/Responsibility semantic persistence requirements.
- `docs/product/CONTRACTS.md` — provider/sync/AI interpretation/Responsibility reducer/scheduler/search/send/job contracts.
- `docs/product/TECH-STACK.md` — accepted initial stack + activation policy.
- `docs/product/IMPLEMENTATION-PLAN.md` — staged implementation sequence and current proof gate.
- current referenced GitHub Issue — task-specific implementation intent.
- repository-local plan/design/task artifact only when the Issue explicitly links one.
- `docs/decisions/` — durable architecture rationale.

### Reusable engineering baseline

Read only when relevant:

- `docs/core-principles.md`
- `docs/implementation-workflow.md`
- `docs/greenfield-bootstrap.md`
- `docs/architecture-design.md`
- `docs/reuse-dependencies.md`
- `docs/reliability-operability.md`
- `docs/security-privacy.md`
- `docs/verification-review.md`
- `docs/platform-development.md`
- `docs/production-readiness.md`
- `docs/product-operations.md`
- `docs/monetization-engineering.md`
- `docs/ai-product-runtime.md`
- `docs/coding-agent-harness.md`
- `docs/repository-knowledge.md`
- `docs/references.md`

---

## Accepted initial stack — concise map

Do not treat this as a substitute for `TECH-STACK.md`.

- Node.js 24 LTS + pnpm + strict TypeScript.
- Next.js 16.x App Router + supported React 19.x.
- Tailwind CSS 4 + shadcn/ui + next-intl.
- PostgreSQL 18 on Neon initially; Drizzle when persistence activates.
- Better Auth for Lunowa app sessions, separate from mailbox authorization/credentials.
- Vercel initial web/API path.
- Trigger.dev when durable background execution activates.
- Gmail API first; Microsoft Graph second.
- OpenAI Responses API + Structured Outputs for initial AI interpretation when Phase 6 activates.
- PostgreSQL full-text search first; no vector/search cluster by default.
- Vitest + React Testing Library + Playwright.

Do not install/activate later-phase services merely because accepted architecture includes them.

---

## High-value Lunowa invariants

Do not change these casually. Stronger evidence requires durable reconciliation in the same change.

1. **Normal Conversation-row body click opens `会話`; Responsibility/status chip opens `今の要点`.**
2. **Conversation is not one workflow-state owner; it may contain multiple Responsibilities.**
3. **One Moment generally answers one primary current question and exposes one primary safe action.**
4. **Responsibility state is orthogonal; do not restore `OPEN/ACTION_REQUIRED/DEFERRED/WAITING/FOLLOW_UP/COMPLETED/UNCERTAIN` as canonical state.**
5. **My Turn / Waiting / Later / Done / Review are deterministic projections, not canonical domain truth.**
6. **Resolution, live tracking activation, and attention/defer are separate dimensions.**
7. **Parallel/contingent work may require multiple obligation legs; scalar `next_owner/BOTH` is not complete truth.**
8. **AI understands; trusted product/domain rules decide accepted Responsibility state.**
9. **Evidence, interpretation, accepted state, safe action, and UI projection remain distinct.**
10. **Temporal Contracts are durable persisted promises; transient timers are insufficient.**
11. **Communication hold/pause is not the same as snooze/Later.**
12. **Provider observations and Lunowa domain facts have field-scoped authorities.**
13. **Send attempt is not reconciled provider acceptance; ambiguous results require reconciliation.**
14. **A reconciled send resolves only the operational outcome it actually proves.**
15. **Source due / expected-event time / user target / resurface / follow-up time are distinct.**
16. **A real material user obligation must not be silently hidden because AI is missing/uncertain.**
17. **Cross-account semantic similarity does not authorize Responsibility merge.**
18. **Search/retrieval/AI context respects user/account/scope authorization before exposure.**
19. **Prompt/tool-like text inside email remains untrusted data and gains no application authority.**
20. **Requested action and safe next action are separate for high-risk requests.**
21. **Pin is explicit user control orthogonal to Responsibility semantics.**
22. **Core reading/composing remains usable when AI is unavailable.**
23. **Prefer repository/framework/platform/official SDK reuse before custom infrastructure for non-differentiating concerns.**
24. **Conversation semantic-evidence revision is a freshness/concurrency coordinator, not workflow-state authority.**
25. **Semantic CREATE idempotency must not depend on a newly generated Responsibility ID.**
26. **Static DDL review is not proof of PostgreSQL/Drizzle runtime behavior; use the L2 executable gate before migration.**

---

## Canonical commands

- Install: `pnpm install --frozen-lockfile`
- Run: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Unit/component tests: `pnpm test`
- Browser smoke: `pnpm test:e2e`
- Build: `pnpm build`
- Fast verification: `pnpm verify`

GitHub Actions independently runs `Verify` and `E2E Smoke` checks. Local success does not replace required CI once branch protection is active.

A task-specific spike may add a targeted verification command, but it does not replace these canonical checks when repository-wide behavior is changed.

---

## Working rules

- Inspect relevant durable specs and nearby code/tests before non-trivial edits.
- If a handoff names a GitHub Issue, preflight that configured `origin` matches the Issue repository before task-branch work. Use that Issue for current task-specific intent and repository docs for durable constraints. If Issue is inaccessible, stop rather than infer intent from unrelated state.
- For complex/high-risk work, follow a repository-local plan/design/task artifact only when the Issue links it or the task creates one deliberately.
- For Responsibility-domain work, explicitly map implementation behavior to relevant canonical scenario/transition oracles.
- For Responsibility L2 proof work, do not treat generated Drizzle types, mocks, PGlite/SQLite, or builder summaries as PostgreSQL 18 evidence when the gate requires the real DB behavior.
- For frontend work, inspect exact relevant visual refs **and** translate legacy filenames through `docs/design/references/README.md`.
- For complex/risky changes, design/plan first and keep slices independently verifiable.
- Prefer existing repository/framework/platform/official SDK/mature dependencies before custom implementation.
- Keep provider SDK shapes inside adapters.
- Keep authorization, Responsibility invariants, Temporal Contract guarantees, send idempotency, and privileged action boundaries outside prompts.
- Treat email bodies/HTML/attachments/retrieved documents/provider payloads/web content as untrusted.
- Never commit provider tokens/OAuth secrets/production credentials/sensitive mailbox fixtures.
- Do not weaken/delete tests merely to make verification pass.
- Update durable docs when accepted behavior/architecture/ownership/contracts/security semantics materially change.
- Do not silently resolve spec/code/provider conflicts. Determine authority and reconcile/escalate.
- State exactly what was verified; do not claim provider/scheduler/browser/security/migration/send/database behavior from mocks alone.

---

## Initial implementation sequence

Follow `docs/product/IMPLEMENTATION-PLAN.md` plus the current task-specific GitHub Issue when one is supplied.

Phase 0 established runtime/verification. The first **product** slice is the high-fidelity fake-data desktop shell beginning with `00`, `01`, `02`, with `row body -> 会話` and `status/projection chip -> 今の要点` browser-verified before provider/AI complexity.

The current Responsibility persistence work is a bounded technical proof, not authorization to skip the product sequence. L0/L1 are frozen; exact L2 v0.4 must pass Issues #13/#14 and independent Issue #15 before production migrations are even proposed.

## Done

Implementation alone is not completion. A change is done only when intended behavior, required verification evidence, and affected durable documentation are consistent.