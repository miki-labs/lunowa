# Decision 0001 — Modular Monolith as the Default Architecture

## Status

Accepted — 2026-08-19

## Context

Lunowa needs a responsive web application, provider integrations, durable background work, relational state, AI interpretation, and Temporal Contract scheduling. These concerns create clear logical modules, but the product is being built by a solo/small-team workflow and has not demonstrated a need for independent service deployment or scaling.

Splitting the product into microservices early would add deployment, networking, observability, consistency, testing, and coding-agent context cost before it solves a measured product problem.

## Decision

Use a **modular monolith** as the default architecture.

Logical modules such as provider integration, sync, lifecycle, AI interpretation, search, compose/send, and scheduling should have explicit contracts and dependency directions, but they remain in one product codebase and one coherent domain.

Background work may run in a separate worker process/runtime where required. Process separation does not imply service/domain separation.

## Alternatives considered

### Microservices from the start

Rejected because current scale/team/deployment needs do not justify distributed-system overhead.

### Fully serverless function-per-feature architecture

Not adopted as a domain architecture. Individual platform functions may be used as deployment mechanics if they preserve the product contracts, durable jobs, transactions, and operational simplicity.

### Single unstructured application module

Rejected because provider, lifecycle, AI, scheduler, and send boundaries are important enough that uncontrolled coupling would make correctness and future provider expansion difficult.

## Consequences

Positive:

- simpler deployment/operations;
- easier transactions and consistency;
- lower solo-developer maintenance cost;
- easier Codex/human repository reasoning;
- explicit module boundaries remain possible;
- services can be extracted later only with evidence.

Negative/trade-off:

- modules are not independently deployable/scalable by default;
- discipline/tests may be needed to prevent cross-module reach-through;
- later extraction could require migration work if scale genuinely demands it.

## Revisit when

Reconsider only when measured evidence shows a component needs independent deployment/scaling/failure isolation/team ownership that is cheaper than continued monolith operation.