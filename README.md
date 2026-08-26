# Lunowa

Lunowa is an email-centered communication-monitoring Product whose North Star is:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The core Product value is **Attention Delegation**: unresolved communication can leave the user's active attention while Lunowa monitors the accepted Responsibility state and returns the issue only when user attention is genuinely required again.

> **Eliminate work, not control.**

The canonical Product contract is `docs/product/PRODUCT.md`. It distinguishes current direction from hypotheses/unknowns; do not infer market validation from this README, screenshots, candidate documents, implementation progress, or old chat history.

---

## Current status

- Phase-0 runtime/verification foundation is mechanically established.
- Product content is canonically reconciled through 2026-08-27, but **Product-market validation is not complete**.
- GitHub **Issue #36** remains the highest-priority Product-discovery gate for the first segment/problem.
- Real Product UI remains materially unimplemented; existing application code is bootstrap/experiment foundation, not proof of the final Product.
- Responsibility L0/L1 semantics/persistence boundary are frozen; L2 exact DDL is static-review complete but executable proof remains pending; L3 migrations/runtime remain unauthorized.

```text
L0 semantic model                         FROZEN v0.1
L1 logical persistence boundary           FROZEN v0.1
L2 exact PostgreSQL/Drizzle DDL            v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 migrations/runtime                     NOT AUTHORIZED
```

Product completeness does not authorize implementation breadth.

---

# Product model

## Attention Delegation loop

```text
material communication/evidence
-> candidate interpretation
-> Responsibility admission/update under trusted rules
-> user attention needed?
   no  -> Managed / quiet monitoring
   yes -> Needs You / Review
-> Moment restores minimum trustworthy context
-> user takes one safe action/decision
-> provider/external effect reconciles
-> Responsibility re-evaluates
-> Waiting / Later / Needs You / closure as justified
```

Message arrival is evidence, not automatically an attention event.

Communication activity/reply/send/read/silence is evidence, not automatic closure.

## Conversation != Responsibility

A Conversation may contain zero, one, or many Responsibilities. My Turn / Waiting / Later / Done / Review are deterministic Product projections, not one canonical lifecycle enum.

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

- Needs You item → **Moment / 今の要点**;
- Source Conversation row → **会話**;
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

Monitoring autonomy does not silently grant external send/action authority.

---

# Current Product form direction

The current v1 Product direction prefers a **companion/hybrid + one-provider complete-loop proof** rather than immediate Gmail/Outlook parity.

Product-critical native targets are actions that complete the current Attention loop, such as Source reading/search, Moment-bound contextual reply/draft/explicit Send, attachment handling sufficient for validated flows, and provider send reconciliation.

Generic fresh Compose, broad Drafts/Sent/folder administration, bulk mailbox hygiene, Send Later parity, second-provider breadth, calendar mutation, and other provider-client features are not current v1 Product-validation gates unless stronger evidence requires them.

Full-client replacement is allowed later if actual usage proves provider fallback itself remains a material burden.

---

# Repository map

Start with `AGENTS.md` for task routing.

## Product authority

```text
docs/product/PRODUCT.md
```

Owns Product identity, scope, surfaces, Daily Operating Model, onboarding/trust, closure, retrieval/history, communication-action boundary, autonomy, v1 direction, validation, commercial status, and unknowns.

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

Architecture/data/contracts may deliberately describe a safe **capability superset** for features that are deferred or optional in the current Product. Capability enumeration is not current scope or implementation authorization; `PRODUCT.md`, `IMPLEMENTATION-PLAN.md`, and the live task contract decide whether/when a capability is activated.

---

# Current evidence / implementation sequence

**Use `docs/product/IMPLEMENTATION-PLAN.md` and the live GitHub Issue as authority.**

Current high-level sequence:

```text
Bootstrap/runtime foundation
-> Issue #36 problem / ICP evidence
-> bounded comparative fake-data mechanism experiment
-> longitudinal safe-forgetting / monitoring-relinquishment proof
-> only then broaden credible client shell as Product evidence requires
-> Responsibility persistence/runtime when its gates justify it
-> one real provider read path
-> contextual real send path when justified
-> deterministic Responsibility / Temporal Contract runtime
-> AI interpretation behind validated contracts/evals
-> search/context quality
-> second provider
-> beta hardening
```

A bounded Responsibility L2 executable proof may run ahead as a technical falsification spike. It does **not** authorize production persistence or reorder Product discovery.

Issue #28 write-heavy prototype work is not authorized merely because Product/design docs are now more complete.

---

# Architecture direction

Current accepted engineering direction at a high level:

- responsive web-first;
- Next.js/TypeScript modular monolith;
- PostgreSQL durable store when persistence activates;
- durable background execution when sync/Temporal Contract behavior activates;
- Gmail technical adapter first, Microsoft Graph later;
- one evaluated AI runtime behind structured/domain contracts;
- PostgreSQL search first; rebuildable derived projections;
- scenario-driven Responsibility persistence, not generic workflow infrastructure.

Technology choice does not imply Product implementation priority.

---

# High-value invariants

1. Conversation can contain multiple independent Responsibilities.
2. `No Responsibility` is valid; every email does not become work.
3. My Turn / Waiting / Later / Done / Review are projections, not canonical state.
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
15. Core Source behavior must degrade safely when AI is unavailable.
16. Product/technical completeness is not Product validation.

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

# Product discipline

Lunowa is a Product, not a code-generation exercise.

Implementation throughput, code volume, feature count, AI usage, client parity, and ontology sophistication are not the objective. The objective is increasing the probability that real users can safely stop manually monitoring communication they should be able to forget.

Current ICP, attainable reliability, PMF, WTP, distribution, retention, notification defaults, and mature Product form remain empirical questions where `PRODUCT.md` says so.