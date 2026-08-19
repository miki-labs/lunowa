# Core Principles and Governance

This document contains the durable defaults for the blueprint and the rules for evolving them. It should remain more stable than framework, language, provider, product, or model-specific guidance.

## Normative language

- **MUST** — required by default. Deviation needs a concrete, material justification.
- **SHOULD** — strong default. Deviation is acceptable when another option has a better evidence-backed trade-off for the project.
- **MAY** — optional technique selected by context.

Do not inflate preferences into MUSTs. A durable rule is useful only when it prevents a relevant failure mode or materially improves delivery, safety, operability, or maintainability.

## 1. Build the right behavior

Code is a means, not the objective. Define the user/system outcome, observable behavior, constraints, and acceptance criteria before optimizing implementation details.

Engineering velocity is not product success. Do not use implementation speed to justify building unvalidated scope.

## 2. Prefer simplicity over cleverness

Use the simplest design that satisfies current requirements and relevant quality attributes.

Avoid speculative generality, unnecessary layers, premature distribution, generic frameworks for hypothetical use, and complexity added merely because AI can generate it cheaply.

Prefer understandable, boring technology when it solves the problem with lower lifecycle risk.

## 3. Optimize for readers and future change

Prefer clear naming, explicit data flow, local reasoning, predictable conventions, and comments that explain non-obvious intent, invariants, or trade-offs rather than restating code.

Make invalid or ambiguous API usage difficult where practical. Keep important contracts, state ownership, and failure semantics explicit.

Hard-to-test code can signal hidden dependencies, excessive responsibility, global state, or weak boundaries. Use testability as design feedback without creating abstractions solely for tests.

## 4. Reuse before reinventing, but price dependencies honestly

Search in this order by default when relevant:

1. existing repository implementation,
2. platform/framework capability,
3. official SDK/API,
4. existing design-system/component/template,
5. mature maintained OSS,
6. appropriate managed service,
7. thin adapter,
8. custom implementation.

This is a heuristic, not an obligation to choose a worse solution.

Evaluate requirement fit, maintenance, security, privacy, license, transitive dependencies, operational cost, portability, platform compatibility, failure modes, lock-in, and replacement cost.

## 5. Abstract shared knowledge, not accidental similarity

DRY means avoiding multiple authoritative representations of the same knowledge or business rule. It does not mean eliminating every repeated line.

Before extracting an abstraction, ask:

- Do these uses represent the same concept?
- Will they change for the same reason?
- Does one owner reduce inconsistency?
- Does the abstraction make the system easier to understand?

Wrong abstractions can cost more than temporary duplication. Tests may intentionally be DAMP when local readability is more valuable than deduplication.

## 6. Design cohesive modules with explicit boundaries

Group things that change together. Keep unrelated responsibilities independently changeable. Hide implementation details behind stable contracts where doing so reduces meaningful coupling.

Prefer high cohesion and low unnecessary coupling. Modularity does not imply microservices.

Critical data/business invariants should have one clear owner and should be mechanically enforced at the strongest appropriate boundary when practical.

## 7. Keep changes small, reversible, and independently verifiable

Small changes are easier to understand, review, test, roll back, diagnose, and redirect when evidence changes.

Separate broad refactoring, product behavior, dependency upgrades, and migrations when practical. Treat irreversible or expensive-to-reverse changes as a reason for stronger design, review, and recovery planning.

AI-assisted development increases the importance of small batches rather than reducing it.

## 8. Treat security and privacy as pervasive constraints

Security and privacy apply to requirements, architecture, dependencies, implementation, CI/CD, deployment, observability, support, analytics, monetization, incident response, and recovery.

Minimize attack surface, privilege, and data possession. Do not invent security-critical primitives such as cryptography, authentication protocols, account recovery, or payment-card handling when mature appropriate solutions exist.

## 9. Treat failure as normal and bound dangerous work

Networks time out, dependencies fail, messages duplicate, data becomes stale, users race, jobs get stuck, configuration breaks, deployments regress, and external state changes independently.

Define relevant failure semantics deliberately: validation, timeout, bounded retry, idempotency, concurrency/conflict handling, degradation, final failure, observability, repair, and recovery.

Do not leave materially dangerous resource or economic growth unbounded: retries, queues, fan-out, concurrency, payloads, memory, storage, external API calls, model/tool execution, or other variable-cost paths.

## 10. Make correctness mechanically verifiable

Prefer enforceable constraints to prose-only intentions. Use the strongest appropriate mechanism available:

1. data/model design and type systems,
2. compiler/static analysis,
3. tests and executable contract checks,
4. lint/policy/CI gates,
5. documentation for judgment, rationale, and constraints that cannot be encoded safely.

Verification must demonstrate required behavior, not merely that code compiled or a test command returned green.

## 11. Design for production operability and repair

A production system should be observable, diagnosable, containable, recoverable, and safely repairable at the level justified by its risk.

Consider deployment, configuration, logs/metrics/tracing where useful, background work, migrations, rollback/forward recovery, backup/restore, external-state reconciliation, constrained repair paths, and high-value runbooks.

Do not make undocumented human memory or routine broad production-database editing a required operational capability.

## 12. Turn recurring mistakes into system improvements

When humans or agents repeatedly make the same mistake, do not rely on reminders alone. Identify the missing capability and improve the repository through types, schemas, tests, lint, CI, scripts, docs, architecture constraints, tooling, observability, or harness changes.

Prefer small continuous corrections over periodic giant cleanup projects.

## Risk-proportional rigor

Engineering process scales with risk, not ceremony.

Relevant factors include:

- blast radius,
- security/privacy sensitivity,
- data-loss or corruption potential,
- financial/commercial impact,
- reversibility,
- operational complexity,
- expected lifetime,
- uncertainty,
- platform/release impact,
- number of consumers/dependencies.

Do not apply production-critical machinery to throwaway experiments. Do not apply prototype discipline to systems handling valuable user data, money, privileged actions, or materially expensive execution.

## Evidence and decision discipline

For important engineering rules and decisions, prefer evidence roughly in this order:

1. current explicit product/project requirements and validated user/business constraints,
2. current repository and runtime evidence,
3. current standards, official documentation, primary research, and authoritative engineering guidance,
4. well-maintained ecosystem practice and high-quality operational case studies,
5. community experience and secondary material.

Newer evidence can supersede older guidance. Novelty alone is not stronger evidence.

Distinguish facts, evidence, inference, assumptions, hypotheses, and unknowns when the difference can change a decision.

## Rule lifecycle

Before adding or strengthening a durable rule, ask:

1. What concrete failure mode does it prevent?
2. Is the risk recurring or independently well established?
3. Can the invariant be enforced mechanically instead of documented?
4. What maintenance, cognitive, context, and delivery cost does the rule add?
5. Is it reusable across products, or does it belong in the product repository?
6. How will we know when it becomes stale?

Prefer deletion, merging, or simplification of stale and duplicate rules over endless accumulation.

## Stable versus volatile knowledge

Keep stable principles and reusable decision rules in this blueprint.

Keep product-specific or rapidly changing state in the product repository or authoritative external system, including exact stack versions, provider configuration, product requirements, current architecture implementation, active plans, deployment topology, incidents, prices, platform policies, and model/provider details.

Time-sensitive external facts that materially affect a decision MUST be re-checked against current primary sources rather than copied into durable policy as timeless truth.

## Exceptions and living artifacts

A project may override a blueprint default when project evidence supports a better trade-off. Material deviations affecting architecture, security, privacy, data integrity, commercial correctness, production safety, platform compatibility, or long-term maintainability SHOULD be recorded in the product repository.

Design documents, plans, threat models, and decisions are living artifacts. Mark or remove superseded guidance when its current status could be misunderstood.

## Success criterion

The blueprint succeeds when it helps a small team ship and operate correct, secure, maintainable products with less repeated reasoning and fewer recurring mistakes.

It fails when maintaining the blueprint becomes more important than delivering products and learning from real users and production evidence.
