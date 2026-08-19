# Architecture and Design

Architecture exists to make important qualities and change boundaries explicit. It is not a goal to maximize layers, patterns, or distributed components.

## Design to the risk

The amount of design work should scale with blast radius, reversibility, security sensitivity, uncertainty, longevity, and operational cost.

- Trivial/local changes need little ceremony.
- Normal features need enough design to make boundaries, contracts, and failure behavior clear.
- Security-critical, data-critical, irreversible, or cross-system changes deserve explicit alternatives, threat/risk analysis, migration/rollback, and review before implementation.

## Prefer the simplest architecture that preserves important boundaries

Do not introduce microservices, event buses, CQRS, elaborate dependency-injection layers, generic plugin systems, or clean/hexagonal layering solely because they are recognized patterns.

Use a pattern when it materially improves one or more of:

- change isolation,
- domain clarity,
- security/trust separation,
- testing,
- independent scaling,
- reliability/failure isolation,
- team/ownership boundaries,
- deployment needs.

A modular monolith is a strong default for many small/medium products when independent deployment is not required.

## Boundaries before internals

For non-trivial features, identify:

- actors/external entities,
- components/modules,
- data stores,
- external providers,
- trust boundaries,
- ownership of state and invariants,
- API/event contracts,
- allowed dependency directions.

Agents and humans reason more reliably when boundaries are explicit and predictable.

## Cohesion, coupling, and dependency direction

Prefer high cohesion and low unnecessary coupling.

A module should contain closely related responsibilities and expose a small contract. Dependencies should flow in intentional directions rather than form cycles or ad-hoc reach-through.

When a dependency rule is stable and important, prefer mechanical enforcement through module/package visibility, architecture tests, lint/static rules, or build constraints rather than documentation alone.

## Data ownership and invariants

Critical business/data invariants should have one clear owner.

Do not scatter the same business rule across UI, API handlers, workers, and database code without a canonical enforcement point.

Use database constraints and transactions when the database is the correct enforcement boundary. Use domain/service logic when the rule spans behaviors that the database cannot express cleanly.

## External systems are boundaries

Wrap or isolate external systems when their API, failure modes, data shapes, or replacement likelihood create meaningful volatility.

Examples include email providers, payment providers, identity providers, object storage, AI providers, and third-party webhooks.

Do not add wrappers around stable local libraries without a concrete reason.

At external boundaries:

- validate weakly trusted data,
- make timeout/retry semantics explicit,
- map provider errors into meaningful internal failures,
- keep provider-specific details from unnecessarily leaking through the domain,
- test using realistic fakes/contract tests where practical.

## Contracts and compatibility

API/schema/event changes should consider current consumers and deployment order.

Prefer backward-compatible evolution when components are deployed independently or rolling deployment makes mixed versions possible.

For risky schema changes, favor staged approaches such as expand → migrate/backfill → switch → contract rather than destructive one-step changes.

## State and concurrency

For shared mutable state, explicitly consider:

- ownership,
- transaction boundaries,
- races/lost updates,
- ordering,
- duplicate delivery,
- idempotency,
- optimistic/pessimistic locking where justified,
- retry interaction with side effects.

Avoid distributed consistency mechanisms unless the actual system requires them.

## Failure and degradation are architecture decisions

Architecture should define what happens when each important dependency is slow, unavailable, inconsistent, or rate limited.

Decide which functions:

- fail immediately,
- retry within a bound,
- queue for later,
- use stale data,
- degrade partially,
- require operator intervention.

## Security and privacy architecture

For sensitive systems, architecture should make trust and data boundaries visible.

Identify:

- authentication authority,
- authorization enforcement points,
- sensitive data stores/flows,
- secret ownership,
- tenant isolation,
- public attack surface,
- third parties receiving data,
- logging/analytics exposure.

Use the threat-model template when triggers in `security-privacy.md` apply.

## Operability architecture

Architecture should leave the system diagnosable and recoverable.

For material components, determine how operators/agents can observe:

- health,
- user-impacting errors,
- latency,
- dependency failures,
- background work state,
- migration state.

Do not create architectures that require hidden human knowledge for routine recovery.

## Decision records

Record decisions when the reason will matter later, especially when:

- alternatives were credible,
- the choice is costly to reverse,
- the choice creates a long-lived constraint,
- security/privacy is materially affected,
- future contributors/agents may otherwise "simplify" away an intentional constraint.

Do not create an ADR for every trivial implementation choice.

A useful decision record states:

- context/problem,
- decision,
- key alternatives,
- rationale/trade-offs,
- consequences,
- status/date.

## Avoid architecture by fashion

New technology or architecture is not automatically superior. Evaluate:

- product fit,
- reliability and maturity,
- security,
- operational burden,
- maintenance/ecosystem,
- cost,
- portability/lock-in,
- human and agent legibility.

Prefer boring, well-understood technology when it satisfies the requirement with less lifecycle risk.
