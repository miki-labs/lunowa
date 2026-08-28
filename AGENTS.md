# AGENTS.md

This repository builds **Lunowa**, an email-centered communication-monitoring Product whose North Star is:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

This file is a **task router**, not the handbook. Read only the owning source needed for the current task.

## Current repository stage

- Phase-0 application/runtime/verification foundation exists.
- Product Content / Golden Scenarios are specification-ready for the current implementation hypothesis; this is **not** Product-market validation.
- Issue #55 / PR #57 completed the implementation-facing v1 UI/UX contract.
- Issue #58 / PR #59 completed the implementation-graph / architecture-activation freeze.
- Issue #61 / PR #76 completed the minimal five-reference visual freeze; runtime/browser audit owns final state-specific/pixel-sensitive fidelity.
- **Issue #60 / G00 is the current runtime `SERIAL_GATE`: patch the accepted Next.js 16.3 line to the current security baseline before the first write-heavy fanout.**
- `docs/product/IMPLEMENTATION-GRAPH.md` + live GitHub Issues now own exact dependency, schema-writer, FK-topology and parallelization authority.
- After G00 PASS/merge, P13 / P14 / G11 are the first safe parallel execution wave, subject to serialized `package.json` / `pnpm-lock.yaml` merge ownership.
- Issue #36 remains open empirical Product Discovery but is deferred in execution order; implementation cannot turn ICP/PMF/WTP/retention/reliability into facts.
- Issue #28 remains its bounded comparative fake-data experiment unless explicitly reconciled; do not repurpose it as the Product-completion lane.

Responsibility proof routing remains:

```text
#13 PostgreSQL 18 / Drizzle executable L2 proof
#14 Better Auth UUID persistence proof
#15 independent combined review + L2 freeze decision
```

L0/L1 are frozen baselines. L2 v0.4 is static-review complete but executable proof/final freeze remain pending. Production Responsibility persistence cannot bypass those gates.

For fresh-session bootstrap:

```text
AGENTS.md
-> docs/continuity/README.md
-> docs/continuity/CURRENT.md + KNOWLEDGE-MAP.md
-> live current Issue/PR/CI
-> only the canonical sources relevant to the decision
```

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
- `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` — accepted implementation-facing contract from #55/#57.
- `docs/design/references/` — accepted minimal visual-reference set; visual direction only, and images never override textual Product semantics.

### Responsibility

Start with `docs/product/responsibility/` and especially:

- `README.md`;
- `DECISIONS.md`;
- `CONSISTENCY-AUDIT.md`;
- scenario/transition/oracle artifacts;
- `PHYSICAL-SCHEMA-FREEZE-REVIEW.md`;
- `POSTGRESQL-DRIZZLE-DDL-DESIGN.md`;
- `L2-EXECUTABLE-PROOF-GATE.md`.

Do not derive canonical domain semantics from UI labels or screenshots.

### Product engineering

- `docs/product/ARCHITECTURE.md` — intended system boundaries/invariants.
- `docs/product/DATA-MODEL.md` — conceptual durable model.
- `docs/product/CONTRACTS.md` — logical module contracts.
- `docs/product/TECH-STACK.md` — accepted replaceable technology choices.
- `docs/product/IMPLEMENTATION-PLAN.md` — high-level execution sequence.
- `docs/product/IMPLEMENTATION-GRAPH.md` — accepted exact dependency/parallelization/writer/FK authority.
- live GitHub Issue — task-specific contract.
- code/tests/schema/runtime — actual implementation behavior.

## Current Product-completion doctrine

> **Build one complete vertical delegation loop before broad provider/client parity.**

Current target:

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
- Verify `origin`/repository and accepted base before task-branch work.
- For Responsibility work, map behavior to canonical scenarios/transitions/oracles.
- For Product behavior, use Golden Scenarios without overriding Responsibility truth.
- For L2 proof, use real PostgreSQL/generated SQL/concurrency/auth evidence required by the gate.
- Before production migrations, verify every external FK target exists in accepted production topology; proof fixtures never count.
- Keep provider SDK types inside adapters.
- Keep auth, Responsibility invariants, Temporal guarantees, Send idempotency and privileged effects outside prompts/models.
- Treat mail bodies/HTML/attachments/provider payloads/retrieved content as untrusted.
- Never commit provider tokens/OAuth secrets/production credentials/sensitive mailbox fixtures.
- Do not weaken/delete tests to obtain PASS.
- Update all affected owning durable docs together when accepted behavior/dependencies/routing change.
- `package.json` and `pnpm-lock.yaml` are serialized merge assets when concurrent tasks touch them: later PRs refresh onto current main, regenerate lockfile with pnpm and rerun affected verification/proof.
- State exactly what was verified; mocks do not prove provider/scheduler/security/migration/send/database behavior.

## Review discipline

For non-trivial changes:

```text
current accepted base
-> isolated worktree/runtime namespace
-> implementation/evidence
-> PR
-> exact-head CI
-> full cumulative acceptance audit
-> batch all material corrections on FAIL
-> merge only after PASS
```

Repeated correction failure requires root-cause analysis of specification, oracle, architecture, decomposition or verification process before another patch loop.

`agent:review-ready` means ready to inspect, never PASS.

## Canonical commands

- Install: `pnpm install --frozen-lockfile`
- Run: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`
- E2E: `pnpm test:e2e`
- Build: `pnpm build`
- Verify: `pnpm verify`
