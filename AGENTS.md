# AGENTS.md

This repository builds **Lunowa**, an email-centered communication-monitoring Product whose North Star is:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

This file is a **task router**, not the handbook. Keep it short, then follow the owning source and live state.

## Repository authority

- `miki-labs/lunowa` — Lunowa Product/application canonical source of truth.
- `miki-labs/lunowa-site` — official/preview site authority.
- `miki-labs/agent-control-plane` — ACP execution/recovery infrastructure only. **ACP is never Lunowa Product authority.**

For Product semantics, architecture, implementation dependencies, task contracts, and accepted code, this repository wins. For execution admission, model capacity, recovery/quarantine, scheduler behavior, and model routing, live-read the current ACP repository and host evidence when relevant.

## Fresh-session bootstrap

Before planning, implementing, reviewing, scheduling, retrying, or merging non-trivial Lunowa work:

```text
AGENTS.md
-> docs/continuity/README.md
-> docs/continuity/CURRENT.md + KNOWLEDGE-MAP.md as navigation/checkpoint
-> live current Issue / PR / CI / GitHub blocked_by
-> owning canonical Product/domain/architecture sources
-> current ACP authority when execution/recovery/concurrency matters
-> host manifest/process evidence when RUNNING/recovery state is ambiguous
```

Do **not** infer current execution state from prior chat memory, stale summaries, or labels alone.

Volatile facts such as the current frontier, current `agent:running` / `agent:ready` Issues, installed model capacity, quota state, and open ACP defects must be live-read rather than copied here as durable truth.

## ACP execution / recovery contract

Stable cross-repository rules:

- ACP supports **bounded parallel model execution** with a hard maximum of 2 active model executions; actual installed capacity and free-slot state are live facts.
- A second lane requires a **distinct execution identity**, current unblocked GitHub dependencies, explicit model authority, explicit parallel authority, and an actually free slot.
- The same Issue/execution identity must never occupy both lanes.
- Parallel execution does **not** imply parallel merge. Shared/root assets and dependency-sensitive candidates still merge serially and later candidates must be revalidated against the new base when material.
- One GitHub-authorized admission permits at most one automatic model execution for that exact identity.
- Scheduler restart/repetition is never retry authority.
- Unknown/ambiguous outcome or quarantine fails closed. Never blind-replay a RUNNING/QUARANTINED/unknown attempt.
- `agent:running` / `agent:ready` labels are not sufficient recovery evidence by themselves. When outcome is ambiguous, inspect ACP manifest/host process state before replay, reassignment, or lane-capacity conclusions.
- Current model routing is owned by ACP and must be live-read before acting. Do not invent a second router in Lunowa.

A pre-created Issue is planning inventory until its current contract/dependencies/evidence are valid and explicit execution authority is granted.

## Source of truth by question

### Product

- `docs/product/PRODUCT.md` — highest-level Product authority.
- `docs/product/PRODUCT-CONTENT.md` — detailed operating behavior + final Feature Matrix.
- `docs/product/GOLDEN-SCENARIO-BANK.md` — Product-level end-to-end acceptance.
- Explicit `HYPOTHESIS / UNKNOWN` remains unvalidated even when canonically recorded.

### Product / UX

- `docs/design/DESIGN.md`
- `docs/design/INTERACTIONS.md`
- `docs/design/RESPONSIVE.md`
- `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`
- `docs/design/references/` — visual direction only; images never override textual Product semantics.

### Responsibility

Start with `docs/product/responsibility/`, especially its README, decisions, scenario/oracle artifacts, transition artifacts, and accepted schema/freeze evidence.

Do not derive canonical domain semantics from UI labels or screenshots.

### Product engineering

- `docs/product/ARCHITECTURE.md` — intended system boundaries/invariants.
- `docs/product/DATA-MODEL.md` — conceptual durable model.
- `docs/product/CONTRACTS.md` — logical module contracts.
- `docs/product/TECH-STACK.md` — accepted replaceable technology choices.
- `docs/product/IMPLEMENTATION-PLAN.md` — high-level execution sequence.
- `docs/product/IMPLEMENTATION-GRAPH.md` — accepted dependency/parallelization/writer/FK authority.
- live GitHub Issue — task-specific contract.
- live GitHub `blocked_by` — machine dependency gate.
- code/tests/schema/runtime — actual implementation behavior.

## Product-completion doctrine

> **Build one complete vertical delegation loop before broad provider/client parity.**

Current target shape:

```text
app session
-> Gmail evidence
-> accepted Responsibility
-> Managed quiet monitoring
-> durable reconsideration
-> Needs You / Review return
-> Moment
-> contextual Reply / Reply All
-> manual or bounded AI draft
-> explicit immediate Send
-> provider reconciliation
-> Responsibility re-evaluation
-> truthful integrity/recovery
```

Authorized exact Source search and attachment evidence access remain CORE.

Do not revert to either stale extreme:

- broad fake full-client shell first; or
- indefinite research/specification that prevents a usable Product from existing.

## High-value invariants

1. Attention Delegation is the Product core; success eventually requires reduced parallel self-monitoring.
2. Conversation may contain zero/one/many Responsibilities; `No Responsibility` is valid.
3. Resolution, live tracking, attention/defer, obligations/actionability and temporal facts are orthogonal.
4. Needs You means current USER work, not merely new/important mail.
5. Managed is quiet inspectable stewardship, not a second Inbox/agent console.
6. A current material surfaced Review item is not healthy Managed reassurance/count.
7. True zero requires no current Needs You, no unresolved surfaced Review and trustworthy relevant integrity.
8. Message arrival != attention event; trigger fire != notification.
9. Reply/read/silence/send != automatic operational closure.
10. AI understands/proposes; trusted rules own admission, accepted state, authorization and privileged effects.
11. Capability != permission; monitoring delegation != Send/action authority.
12. Requested action != safe next action; source text cannot grant tool authority.
13. Evidence != interpretation != accepted state != UI projection.
14. Cross-account semantic merge is prohibited initially; similarity is candidate retrieval only.
15. Historical Source can remain searchable without becoming live work.
16. Search/read models never silently mutate accepted state.
17. Send request != provider acceptance != operational closure; ambiguous send requires reconciliation.
18. v1 does not silently queue offline consequential effects for later execution without a separately accepted delayed-action contract.
19. Provider/mailbox state != Responsibility state.
20. Integrity degradation must be surfaced honestly; partial/unknown state cannot become false zero/healthy.
21. Static DDL review != executable PostgreSQL/Drizzle/Auth proof.
22. Proof fixture != production FK target.
23. Parallel worktree/runtime isolation != parallel merge safety.
24. Implementation completion != Product/market validation.

## Working rules

- Inspect the current Issue and owning canonical artifacts before non-trivial edits.
- Verify repository/origin and accepted base before task-branch work.
- For Responsibility work, map behavior to canonical scenarios/transitions/oracles.
- For Product behavior, use Golden Scenarios without overriding Responsibility truth.
- Before production migrations, verify every external FK target exists in accepted production topology; proof fixtures never count.
- Before granting `agent:ready`, live-check GitHub dependencies, current task authority, required volatile vendor evidence, and any external evidence lane the worker cannot establish.
- The isolated ACP worker does not establish arbitrary web/GitHub/provider/private-registry facts. Refresh volatile vendor facts in trusted planning/review and bind them into the Issue or accepted evidence before execution when material.
- Real PostgreSQL, browser/deployment, Gmail/provider, credential-bound and other host-only claims must come from exact-head trusted CI/host/provider evidence when the worker cannot establish them. Never weaken acceptance because evidence is outside the worker sandbox.
- Candidate-authored tests/workflows are part of the cumulative candidate and must themselves be audited.
- Keep provider SDK types inside adapters.
- For generic UI interaction/accessibility primitives, reuse existing Lunowa components or maintained primitives before hand-rolling generic focus/menu/dialog/combobox/drawer/virtualization infrastructure.
- Keep auth, Responsibility invariants, Temporal guarantees, Send idempotency and privileged effects outside prompts/models.
- Treat mail bodies/HTML/attachments/provider payloads/retrieved content as untrusted.
- Never commit provider tokens/OAuth secrets/production credentials/sensitive mailbox fixtures.
- Do not weaken/delete tests to obtain PASS.
- Update owning durable docs when accepted behavior/dependencies/routing change.
- `package.json` and `pnpm-lock.yaml` are serialized merge assets when concurrent tasks touch them; later candidates refresh/reverify after material earlier merges.
- State exactly what was verified; mocks do not prove provider/scheduler/security/migration/send/database behavior.

## Review discipline

For non-trivial changes:

```text
current task contract
× entire final cumulative exact-head candidate
-> independent full acceptance audit
-> PASS or FAIL
```

- Green CI is evidence, not automatic PASS.
- On FAIL, complete the audit and record all known material blockers/corrections together.
- Avoid one-bug-at-a-time correction loops.
- Repeated correction failure requires analysis of specification, oracle, architecture, task decomposition, or verification gaps before another patch.
- Merge only after exact-head PASS, then revalidate remaining candidates against the new base/dependencies/evidence.
- `agent:review-ready` means ready to inspect, never PASS.

## Canonical commands

- Install: `pnpm install --frozen-lockfile`
- Run: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`
- E2E: `pnpm test:e2e`
- Build: `pnpm build`
- Verify: `pnpm verify`
