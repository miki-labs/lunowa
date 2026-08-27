# Lunowa

Lunowa is an email-centered communication-monitoring Product whose North Star is:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The core Product value is **Attention Delegation**: unresolved communication can leave the user's active attention while Lunowa monitors the accepted Responsibility state and returns the issue only when user attention is genuinely required again.

> **Eliminate work, not control.**

Canonical Product authority is split deliberately:

- `docs/product/PRODUCT.md` — highest-level Product contract;
- `docs/product/PRODUCT-CONTENT.md` — detailed operating contract and final Feature Matrix;
- `docs/product/GOLDEN-SCENARIO-BANK.md` — Product-level acceptance bank, subordinate to Responsibility semantic oracles.

These authorities distinguish accepted direction from hypotheses/unknowns; do not infer market validation from this README, screenshots, candidate documents, implementation progress, or old chat history.

---

## Current status

- Phase-0 runtime/verification foundation is mechanically established.
- Canonical Product content is reconciled through 2026-08-27; **Product Content COMPLETE means specification closure only, not Product-market validation**.
- Current owner-directed execution priority is **Product completion first**: Issue #55 UI/UX implementation readiness -> implementation dependency graph -> Minimum Complete Delegation Loop.
- GitHub **Issue #36** remains open as the highest-priority empirical problem/ICP discovery gate, but is currently deferred in execution order and is no longer a prerequisite for beginning the owner-directed product-completion lane.
- Real Product UI/runtime remains materially unimplemented; existing application code is bootstrap foundation, not proof of the final Product.
- Responsibility L0/L1 semantics/persistence boundary are frozen; L2 exact DDL is static-review complete but executable proof remains pending. Production persistence that depends on L2 must still satisfy its executable/freeze gate.

```text
L0 semantic model                         FROZEN v0.1
L1 logical persistence boundary           FROZEN v0.1
L2 exact PostgreSQL/Drizzle DDL            v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 migrations/runtime                     NOT AUTHORIZED until its own gate passes
```

Implementation authorization and empirical-claim authorization are separate. Building the accepted Product does not validate ICP, PMF, WTP, retention, or monitoring relinquishment.

---

# Product model

## Attention Delegation loop

```text
material communication/evidence
-> candidate interpretation
-> Responsibility admission/update under trusted rules
-> evaluate current Product consequence
   current actionable USER work -> Needs You -> Moment
   material unresolved semantic/safety question -> Review
   no current user work/review and live monitoring is trustworthy -> Managed / quiet monitoring
-> user acts/decides only where actually required
-> provider/external effect reconciles where applicable
-> Responsibility re-evaluates
-> Waiting / Later / Needs You / Review / closure as justified
```

Message arrival is evidence, not automatically an attention event.

Communication activity/reply/send/read/silence is evidence, not automatic closure.

## Conversation != Responsibility

A Conversation may contain zero, one, or many Responsibilities. My Turn / Waiting / Later / Done are projections; Review is a Product question surface with explicit internal subject type, not one canonical lifecycle enum.

## Mailbox state != Responsibility state

```text
Unread  != Needs You
Read    != Done
Archive != Closed
Trash   != Cancelled
Snooze  != Later
Star    != Responsibility importance
```

Provider remains the mailbox/source substrate. Lunowa's accepted Responsibility state follows its canonical domain/evidence authority, not folder/read status.

## Source and Moment

- Needs You item -> **Moment / 今の要点**;
- Source Conversation row -> **会話**;
- source evidence remains directly inspectable;
- Moment is not a mandatory gate to ordinary mail.

## AI / authority boundary

> **AI understands; trusted Product/domain rules decide accepted state and privileged effects.**

Important inequalities:

```text
Evidence != Interpretation != Accepted State
Requested action != Safe next action
Capability != Permission
Send attempt != Reconciled provider acceptance
```

Prompt/tool-like text inside email/attachments/retrieved content remains untrusted data and gains no application authority.

Monitoring autonomy does not silently grant external send/action authority. High-risk source content alone does not create Review, and AI/processing failure alone does not create fake Needs You or `No Responsibility`.

---

# Current Product form direction

The current v1 Product direction prefers a **companion/hybrid + one-provider complete-loop proof** rather than immediate Gmail/Outlook parity.

Product-critical native targets are actions that complete the current Attention loop, such as Source reading/search, source attachment access sufficient to inspect material evidence, Moment-bound contextual reply/draft/explicit Send, and provider send reconciliation.

Rich native attachment preview, reply attachment add, natural-language search, person context, optional digest, and simple quiet-hours behavior remain strong candidates rather than automatic breadth gates unless accepted scenarios require them.

Generic fresh Compose, Forward parity, broad Drafts/Sent/folder administration, bulk mailbox hygiene, Send Later parity, second-provider breadth, calendar mutation, and other provider-client features are not current v1 completion gates unless stronger evidence/task scope requires them.

Full-client replacement is allowed later if actual usage proves provider fallback itself remains a material burden.

---

# Repository map

Start with `AGENTS.md` for task routing.

## Product authority

```text
docs/product/PRODUCT.md
docs/product/PRODUCT-CONTENT.md
docs/product/GOLDEN-SCENARIO-BANK.md
```

`PRODUCT.md` owns highest-level Product identity, scope, surfaces, Daily Operating Model, onboarding/trust, closure, retrieval/history, communication-action boundary, autonomy, validation, commercial status, and unknowns.

`PRODUCT-CONTENT.md` owns detailed control/failure/lifecycle/Settings/edge/Managed/Review/zero behavior and the final Product Feature Matrix.

`GOLDEN-SCENARIO-BANK.md` owns Product-level end-to-end consequences and forbidden outcomes while remaining subordinate to Responsibility semantic truth.

Historical candidate synthesis files under `docs/product/*CANDIDATE.md` remain noncanonical rationale/history.

## Design

```text
docs/design/
├── DESIGN.md
├── INTERACTIONS.md
├── RESPONSIVE.md
└── references/
```

Current Markdown owns Product/interaction semantics. Generated images are visual references only.

Current implementation-readiness work is routed by GitHub **Issue #55**.

## Responsibility semantics

```text
docs/product/responsibility/
```

Start with `README.md`, `DECISIONS.md`, `CONSISTENCY-AUDIT.md`, then relevant annotation/scenario/transition/oracle/persistence-proof files.

## Engineering

```text
docs/product/
├── ARCHITECTURE.md
├── DATA-MODEL.md
├── CONTRACTS.md
├── TECH-STACK.md
├── IMPLEMENTATION-PLAN.md
└── README.md
```

ADRs under `docs/decisions/` record durable costly-to-change architecture choices.

Architecture/data/contracts may deliberately describe a safe **capability superset** for features deferred or optional in the current Product. Capability enumeration is not scope/permission; current Product authorities, `IMPLEMENTATION-PLAN.md`, and the live task contract decide activation.

---

# Current implementation sequence

**Use `PRODUCT.md` + `PRODUCT-CONTENT.md` for Product scope, `IMPLEMENTATION-PLAN.md` for execution sequencing, `docs/design/` for UX realization, and the live GitHub Issue for task authority.**

```text
Phase-0 runtime foundation
-> Issue #55 UI/UX implementation readiness
-> implementation graph / dependency + safety partitioning
-> required Responsibility executable/persistence gates
-> one-provider source/read path
-> deterministic Responsibility + attention/Temporal Contract loop
-> Home / Needs You / Managed / Review / Moment / Source
-> contextual Reply/Reply All + explicit Send + reconciliation where required
-> bounded AI interpretation behind trusted contracts/evals
-> failure/reconnect/integrity + attachment-source-access closure
-> end-to-end Minimum Complete Delegation Loop
-> beta/early-access hardening
-> Issue #36 / longitudinal empirical validation and evidence-driven scope expansion
```

A bounded Responsibility L2 executable proof may run as a technical falsification spike. It does not itself validate the Product and its production gate still applies where persistence depends on it.

Issue #28 remains its bounded comparative fake-data experiment lane unless explicitly reconciled; its `BLOCKED by #36` state does **not** mean every new Product-completion implementation task is blocked by #36.

---

# Architecture direction

Current accepted engineering direction at a high level:

- responsive web-first;
- Next.js/TypeScript modular monolith;
- PostgreSQL durable store when accepted persistence gates pass;
- durable background execution when sync/Temporal Contract behavior activates;
- Gmail technical adapter first, Microsoft Graph later;
- one evaluated AI runtime behind structured/domain contracts;
- PostgreSQL search first; rebuildable derived projections;
- scenario-driven Responsibility persistence, not generic workflow infrastructure.

Technology choice does not imply Product breadth.

---

# High-value invariants

1. Conversation can contain multiple independent Responsibilities.
2. `No Responsibility` is valid; every email does not become work.
3. My Turn / Waiting / Later / Done are projections; Review is not one canonical lifecycle state.
4. Resolution / live tracking / attention are orthogonal.
5. AI interpretation does not own accepted state or authorization.
6. Temporal Contracts require durable/reconcilable execution where activated.
7. Source due / expected event / user target / resurface / follow-up are distinct.
8. Claim != provider/external observation.
9. Send attempt != provider acceptance.
10. Cross-account similarity does not authorize merge.
11. Retrieval context is authorization-filtered and does not silently mutate accepted state.
12. Prompt-like source content has no system/tool authority.
13. Requested action != safe next action.
14. Monitoring integrity failures must be surfaced honestly.
15. Core Source/manual behavior must degrade safely when AI is unavailable; AI failure alone does not manufacture user work.
16. Current surfaced Review excludes the same item from healthy Managed reassurance/count.
17. Strict true zero requires no Needs You and no current/surfaced unresolved Review with trustworthy integrity.
18. Offline v1 does not silently queue consequential external effects without a separately accepted delayed-action contract.
19. Product/technical completeness is not Product validation.

---

# Development commands

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

`pnpm verify` runs repository verification; GitHub Actions independently runs `Verify` and `E2E Smoke`.

---

# Durable repository update rule

Do not leave a material accepted priority, behavior, dependency, blocker, or completion state only in chat.

Update the owning GitHub Issue/docs in the same workstream when omission would cause a future agent to act incorrectly. Do not create noisy repository churn for tentative brainstorming or every conversation turn.

---

# Product discipline

Lunowa is a Product, not a code-generation exercise.

Implementation throughput, code volume, feature count, AI usage, client parity, and ontology sophistication are not the objective. The objective is increasing the probability that real users can safely stop manually monitoring communication they should be able to forget.

Current ICP, attainable reliability, PMF, WTP, distribution, retention, notification defaults, legal/privacy retention guarantees, and mature Product form remain empirical/legal questions where canonical Product authorities say so.
