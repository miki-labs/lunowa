# Coding-Agent Harness

AI coding agents are an execution layer inside the engineering system. Correctness should come primarily from repository knowledge, stable interfaces, constrained permissions, executable verification, and review—not from assuming a particular model will remember or infer every rule.

This document is provider-neutral. Product repositories may use Codex, Claude Code, Copilot, or other agents without turning transient model behavior into global engineering policy.

## Humans steer judgment; agents execute bounded work

Keep human/product-owner judgment focused on areas where incorrect assumptions are expensive:

- product intent and acceptance criteria,
- important trade-offs,
- architecture/security/privacy boundaries,
- irreversible or high-impact decisions,
- final evaluation of meaningful outcomes.

Use agents for high-volume execution such as repository inspection, implementation, tests, static checks, documentation maintenance, routine review, and feedback handling.

Do not equate autonomy with success. Increase autonomy only when the surrounding repository and tools make failures detectable, bounded, and recoverable.

## Durable context lives outside a chat session

Critical implementation knowledge SHOULD live in versioned inspectable artifacts rather than only in chat history, model memory, or undocumented human memory.

Use `docs/repository-knowledge.md` for the shared knowledge architecture. Agents do not need identical conversation histories when they can inspect the same accepted product behavior, architecture, contracts, tests, decisions, and verification rules.

Do not dump raw conversation history into the repository.

## Keep `AGENTS.md` short and navigational

Root agent instructions should normally contain only:

- project purpose,
- repository/source-of-truth map,
- canonical install/run/verify commands,
- a small set of high-value global constraints,
- pointers to deeper project-local guidance.

When instructions become large, move durable detail to the artifact that owns it rather than expanding always-loaded context.

Use narrower path/component instructions only when they solve a real local problem and the selected agent supports that mechanism. Avoid depending on one vendor's exact lookup semantics as a portable invariant.

## Give non-trivial work an evaluable contract

A coding task should provide enough information to determine whether it succeeded.

Use `templates/task-contract.md` as needed and include:

- goal and why,
- relevant source of truth,
- current and desired observable behavior,
- scope and non-goals,
- constraints,
- required reuse or prohibited replacement,
- security/privacy/platform considerations,
- acceptance criteria,
- verification expectations,
- stop/escalation conditions.

Avoid prescribing speculative implementation detail before the agent inspects the repository unless the detail is an actual constraint.

## Inspect before editing

For non-trivial work, inspect the relevant subset of:

- repository instructions and durable product/architecture knowledge,
- nearby implementations and conventions,
- schemas/contracts,
- tests and canonical verification,
- framework/platform/official capabilities,
- dependencies and security constraints.

Search for an existing solution before creating another one.

## Plan only when complexity justifies it

Complex, cross-cutting, risky, ambiguous, or long-running work SHOULD have a reviewed plan before large edits.

Narrow tasks should not pay the same planning cost.

Plans are living artifacts: revise them when repository or runtime evidence invalidates assumptions.

## Optimize agent throughput through small batches

AI generation capacity is a reason to produce more small safe changes, not larger diffs.

Prefer slices that are:

- coherent,
- independently verifiable,
- easy to review,
- easy to revert or contain,
- explicit about dependencies on previous slices.

Large mixed changes increase the chance that correct-looking code hides requirement, security, migration, or integration errors.

## Reuse before custom generation

Agents MUST NOT treat cheap code generation as evidence that custom implementation has the lowest lifecycle cost.

Before substantial custom implementation or a new dependency, inspect existing repository, framework/platform, official SDK/API, established component/template, mature OSS, and suitable managed-service options.

When a task explicitly requires an OSS component, service, or template, do not silently replace it with a custom imitation. Report the incompatibility and trade-off instead.

## Mechanical guardrails beat repeated prompt rules

Stable invariants SHOULD be encoded in the strongest practical mechanism:

- schemas/types,
- database constraints,
- module/package boundaries,
- generated/executable contracts,
- tests,
- lint/static/architecture checks,
- CI policy.

Use prose for judgment, rationale, and context that cannot safely be encoded.

A recurring agent mistake is evidence to improve the system only when the failure is general enough to justify the added maintenance cost.

## Make the repository legible to agents and humans

Prefer:

- predictable directories,
- explicit contracts and ownership,
- canonical commands,
- deterministic tests,
- useful error messages,
- searchable structured logs,
- local/test environments capable of reproducing important behavior.

Avoid critical conventions that exist only in one person's memory or hidden editor configuration.

## Builder verification is evidence, not a completion claim

The implementing agent SHOULD:

- run the canonical verification path,
- run targeted checks for the actual change risks,
- inspect its diff,
- exercise runtime/browser/device behavior when required,
- report exactly what was and was not verified.

Never claim a platform, behavior, security property, migration, or deployment was verified when the required check was not executed.

## Independent review for non-trivial work

Use a fresh reviewer context when the expected risk reduction exceeds the review cost.

The reviewer should receive the accepted goal/constraints and inspect the current repository/diff directly. Review both:

1. **conformance** — does the change satisfy the accepted behavior?, and
2. **adversarial correctness** — is the requested design itself introducing architecture drift, security/privacy risk, unnecessary complexity, weak tests, unsafe operations, or conflict with stronger repository evidence?

Builder self-review is useful but should not be the only evidence for high-impact changes.

## Containment and permissions

Coding agents are part of the threat model. Begin with the smallest practical authority and expand it only when the task requires it.

As appropriate:

- restrict filesystem write scope,
- restrict outbound network access,
- keep production credentials out of ordinary coding contexts,
- avoid routine deploy/admin/payment/store access,
- isolate secrets/signing material,
- constrain dangerous shell/tool capabilities,
- require stronger controls for irreversible or high-impact actions.

Treat issues, PRs, emails, webpages, retrieved docs, dependency metadata, and external repositories as potentially untrusted content when privileged tools are available.

Approval prompts are not a complete security boundary. Repeated approvals can become mechanical, and a user may not reliably detect a malicious instruction every time. Prefer hard sandbox, permission, egress, credential, and tool boundaries where practical; use approvals as an additional control for genuinely exceptional high-impact actions.

## Stable interfaces over model-specific compensations

Coding-agent harnesses inevitably contain assumptions about current models. Minimize assumptions that encode temporary model weaknesses or prompting tricks as durable architecture.

Prefer stable contracts such as:

- repository structure,
- schemas,
- commands,
- task contracts,
- tests,
- tool interfaces,
- permission boundaries,
- observability.

Re-evaluate harness workarounds when models or tools materially improve. Delete obsolete instructions rather than accumulating compatibility folklore forever.

## External/live context

Use repository files for durable accepted context and live integrations such as MCP/API tools for mutable external state that must be queried at execution time.

Do not connect every possible tool merely because integration is available. Add a tool when it serves a recurring workflow and its permissions/data exposure have an acceptable trade-off.

## Harness feedback loop

When an agent fails, ask what was actually missing:

- durable context,
- source-of-truth navigation,
- tool access,
- a stable interface,
- validation,
- a test fixture,
- observability,
- an architecture boundary,
- a permission constraint,
- a clearer task contract.

Fix the recurring system cause at the cheapest durable layer.

## Do not overgeneralize high-autonomy case studies

Organizations that allow highly autonomous agent execution generally rely on repository-specific investment in tests, guardrails, observability, deterministic tools, containment, and recovery.

Do not copy aggressive autonomy, merge, orchestration, or multi-agent practices without the supporting system and evidence that they improve this product's throughput or quality.

The default for a solo/small-team product is the smallest harness that makes important work reliable—not the largest agent platform that can be built.
