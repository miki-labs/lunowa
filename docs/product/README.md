# Lunowa Product Engineering Map

## Status

This directory contains Lunowa-specific durable Product and Product-engineering knowledge.

Do not treat raw chat history, an open PR, or a generated visual as Product authority when a current accepted repository artifact exists. Live Issue/PR/CI state must be re-queried when execution/review status matters.

---

## Authority map

### `PRODUCT.md` — Product intent authority

Owns:

- Vision / North Star;
- current **Attention Delegation** Product thesis;
- evidence-backed problem framing and current WHO hypothesis;
- initial wedge / Golden Flow;
- differentiation vs table stakes;
- switching/trust/form-factor reasoning;
- KEEP / CHANGE / DEFER / remove-from-differentiation scope classification;
- Product-validation evidence ladder;
- candidate metrics including longitudinal self-check/reliance signals;
- monetization/distribution/retention unknowns;
- important supersessions/refinements.

It distinguishes accepted internal direction from external evidence, inference, hypothesis, and unknowns.

### `research/` — external evidence inputs

Research is **not Product authority by itself**. It preserves primary/peer-reviewed/current-market evidence used to challenge and update `PRODUCT.md`.

Current research artifacts:

- `research/COMMUNICATION-ATTENTION-DELEGATION-EVIDENCE-2026-08.md` — communication monitoring, cognitive offloading, trust/reliability, WHO/wedge/validation evidence;
- `research/CURRENT-COMPETITOR-CONVERGENCE-2026-08.md` — Gmail, Outlook, Superhuman, Shortwave, Spark, HEY, Front, Salesforce, HubSpot, form-factor and fast-convergence audit;
- `research/README.md` — evidence/authority rules.

Before making an external differentiation claim, re-check current competitor primary sources. Feature absence in an old research artifact is not durable evidence of absence.

### `IMPLEMENTATION-PLAN.md` — living execution sequence

Owns the current ordering from Product-learning gates into later technical/product slices.

Current sequence is **not** “finish a credible mail client before learning.” The active path is:

```text
mechanical foundation
  -> bounded comparative Responsibility/Moment mechanism experiment
  -> real workflow / longitudinal Attention Delegation evidence
  -> smallest real-provider slice required by stronger evidence
  -> reliable state/reconsideration/reconciliation
  -> AI/runtime behavior only behind accepted Product/domain evidence
  -> evidence-supported send/search/provider/client breadth
```

The separate Responsibility L2 proof lane may proceed as bounded technical risk retirement but does not authorize production persistence or prove Product value.

### `ARCHITECTURE.md`

Owns Product-specific architecture and module boundaries, including provider, Responsibility/domain authority, AI, Temporal Contract, send/search/security/failure boundaries.

### `DATA-MODEL.md`

Owns the conceptual durable model: User/Scope/ConnectedAccount, Conversation/Message/Attachment, Responsibility and supporting semantic concepts, provenance/correction, TemporalContract/TemporalTrigger, Draft/SendOperation, and derived projections.

### `CONTRACTS.md`

Owns logical module contracts across provider/sync, AI interpretation, Responsibility reduction/effects, attention/resurfacing, Temporal Contract scheduling, drafts/send, search/context, background execution, versioning and failure semantics.

### `TECH-STACK.md`

Owns accepted concrete technology direction unless superseded by an accepted ADR/decision. Current baseline includes Node 24, pnpm, strict TypeScript, Next.js 16/React 19, Tailwind 4, next-intl, PostgreSQL/Drizzle, Better Auth, durable background execution direction, Gmail first/Microsoft later, and current verification tooling.

Technology capability does not authorize Product scope.

---

## Responsibility authority

`responsibility/` is the primary authority for canonical Responsibility semantics, annotation/evaluation behavior, accepted logical persistence boundary, exact L2 candidate, and executable proof gate.

Recommended entry point: `responsibility/README.md`.

Current freeze/proof status:

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle DDL            v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 migrations/runtime                     NOT AUTHORIZED
```

Conceptual accepted aggregate boundary:

```text
Responsibility
ObligationLeg[]
ExpectedEvent[]
TemporalFact[]
FieldDecision[]
ProvenanceReference[]
DomainEvent[]
SemanticDetails
AdmissionReview[]
```

Evidence/inference systems and operational authorities such as Message/Attachment/provider observations, AIInterpretationRun, TemporalContract/TemporalTrigger, and Draft/SendOperation remain separated as defined in the owning sources.

**Important Product hierarchy:** Responsibility is the current best candidate semantic mechanism for representing an unresolved communication obligation/expected-outcome loop. The existence or sophistication of that model is not evidence that users need Lunowa, that Attention Delegation is validated, or that the model is a moat.

---

## Design routing

Detailed UX authority remains in:

- `../design/DESIGN.md`;
- `../design/INTERACTIONS.md`;
- `../design/RESPONSIVE.md`;
- `../design/references/README.md` and committed visual references.

The design corpus can intentionally cover a **credible future client** more broadly than the current Product-validation MVP. `PRODUCT.md` owns Product scope and `IMPLEMENTATION-PLAN.md` owns active sequencing; a design screen does not become current implementation scope merely because it exists.

Current interaction semantics such as row-body -> `会話`, Responsibility chip -> `今の要点`, one-primary-Moment behavior, and My Turn / Waiting / Later / Done / Review projections remain valid unless an accepted Product/design decision supersedes them.

---

## Current Product-learning execution routing

Always query GitHub for live state. At the 2026-08-25 reconciliation the intended chain is:

```text
Issue #26 — Product/mechanism validation contract
  -> Issue #32 / PR #34 — deterministic S1-S7 oracle
  -> Issue #29 / PR #30 — reconciled bounded execution plan
  -> Issue #28 — bounded fake-data implementation
  -> Issue #31 — independent browser/visual/mechanical verification
  -> Issue #26 — participant/comparative evidence
```

Issue #28 also contains a separate unattended implementation-harness resume gate. Do not infer authorization from this static map.

A positive #26 fake-data comparison is **mechanism evidence**, not proof of longitudinal Attention Delegation. Stronger subsequent evidence must observe real waiting periods and whether users actually reduce self-checking.

---

## Separate technical lane

Responsibility L2 proof remains:

```text
Issue #13 — PostgreSQL/Drizzle executable matrix
Issue #14 — Better Auth -> PostgreSQL UUID proof
Issue #15 — independent combined acceptance review
```

Technical PASS/FREEZE is not Product validation and does not automatically activate L3 production migrations/runtime.

---

## Current high-level Product distinctions

Do not regress these boundaries:

- message/thread != Responsibility;
- My Turn / Waiting / Later / Done / Review are projections, not one lifecycle enum;
- follow-up is normally a renewed My Turn reason/action, not a lifecycle species;
- AI prepares; human commits for material external action;
- original communication remains source evidence;
- multi-account/unified inbox is table stake, not differentiation;
- generic AI summary/drafting/search, task extraction, priority classification, Waiting labels, Snooze/Later, Done and no-reply reminders are not standalone differentiation claims;
- cross-account value is segment-dependent, not assumed core wedge;
- state-aware Attention Delegation is a **wedge hypothesis, not a moat claim**;
- full-client replacement is a form-factor hypothesis; responsive web remains the current build/experiment direction;
- Product learning precedes broad provider/AI/persistence/client breadth.

---

## Fresh-session reading order for Product work

Use the smallest relevant context:

1. `docs/continuity/CURRENT.md` for the mutable checkpoint/router;
2. `PRODUCT.md` for Product truth/classification;
3. relevant `research/` artifact if the question depends on external evidence/current competitors;
4. `IMPLEMENTATION-PLAN.md` only when sequencing work;
5. relevant `docs/design/` source for UX behavior;
6. `responsibility/README.md` and only the minimum deeper semantic source needed for the task;
7. re-query live GitHub Issue/PR/CI state before execution or review.

Do not load the entire Responsibility corpus or all design references by default when the question is only Product positioning/validation.
