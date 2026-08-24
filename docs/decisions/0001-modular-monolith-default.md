# Decision 0001 — Modular Monolith as the Default Architecture

## Status

Accepted — 2026-08-19
Terminology reconciled with Responsibility v0.1 — 2026-08-23

## Context

Lunowa needs a responsive web application, provider integrations, durable background work, relational state, AI interpretation, Responsibility-domain reduction, and Temporal Contract scheduling.

These concerns create clear logical modules, but the product is being built through a solo/small-team workflow and has not demonstrated a need for independently deployed/scaled services.

Splitting the product into microservices early would add deployment, networking, observability, distributed consistency, testing, and coding-agent context cost before solving a measured product problem.

## Decision

Use a **modular monolith** as the default architecture.

Logical modules such as:

```text
provider integration
sync / ingestion
communication / Conversation
Responsibility domain / reduction
AI interpretation
Temporal Contract / scheduling
compose / send
search
context / audit
```

should have explicit contracts/dependency directions while remaining in one product codebase and one coherent domain unless measured evidence justifies extraction.

Background work may execute in a separate worker/runtime where needed. Process/runtime separation does not imply service/domain separation.

Responsibility v0.1 specifically requires the domain boundary to preserve evidence → interpretation → accepted state → safety → projection semantics; modular-monolith implementation must not collapse those concerns merely because they share one deployment.

## Alternatives considered

### Microservices from the start

Rejected because current scale/team/deployment needs do not justify distributed-system overhead.

### Fully serverless function-per-feature as the domain architecture

Not adopted. Platform functions may be deployment mechanics if they preserve product contracts, durable jobs, transactions, authorization, idempotency, and semantic authority.

### Single unstructured application module

Rejected because provider, Responsibility, AI, scheduler, send, authorization, and search boundaries are important enough that uncontrolled coupling would make correctness and future provider expansion difficult.

## Consequences

Positive:

- simpler deployment/operations;
- easier transactions/consistency;
- lower solo-developer maintenance cost;
- easier Codex/human repository reasoning;
- explicit module boundaries remain possible;
- services can be extracted later only with evidence.

Trade-offs:

- modules are not independently deployable/scalable by default;
- discipline/tests may be needed to prevent cross-module reach-through;
- later extraction could require migration work if measured scale/failure-isolation needs arise.

## Revisit when

Reconsider only when measured evidence shows a component needs independent deployment, scaling, failure isolation, security boundary, or team ownership that is cheaper/safer than continued monolith operation.

Do not use Responsibility-model complexity alone as a reason to create services; first preserve the domain boundary inside the monolith.
