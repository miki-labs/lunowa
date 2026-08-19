# AI Product Runtime Engineering

This document applies when AI/model behavior is part of the product delivered to users or can take actions, access data, or create material variable cost.

It is separate from `coding-agent-harness.md`, which governs AI agents used to build the product.

Do not add AI-specific machinery to products that do not need it. Where AI is only a low-risk assistive feature, use the minimum controls justified by the actual failure modes.

## Treat the model as a probabilistic component

Model output is not an authoritative security, policy, billing, or data-integrity decision merely because the model sounds confident.

Keep critical controls outside model instructions when practical:

- authentication and authorization,
- tool/action permissions,
- data-access boundaries,
- commercial entitlement,
- hard usage/cost limits,
- destructive-action constraints,
- schema/invariant enforcement.

A prompt that says "do not do X" is weaker than a system that cannot perform X without crossing an explicit trusted control.

## Define the AI behavior contract

For a material AI feature, define enough product behavior to evaluate whether it works.

As applicable, specify:

- user outcome and failure tolerance,
- inputs/context the model may use,
- outputs/actions it may produce,
- tools and data it may access,
- unacceptable behaviors,
- latency and availability expectations,
- privacy/data-retention constraints,
- variable-cost bounds,
- fallback/degraded behavior,
- conditions requiring human confirmation or escalation.

Avoid pretending inherently probabilistic behavior can be completely described by deterministic examples.

## Version the configuration that changes behavior

Treat material changes to the following as behavior changes rather than invisible implementation details:

- model/provider,
- system/developer prompts,
- tool definitions/permissions,
- retrieval/indexing strategy,
- memory policy,
- structured-output schema,
- safety/policy middleware,
- major inference parameters when they materially affect output.

Keep enough configuration/version evidence to associate production regressions with what changed. Do not build a custom model registry if source control and provider configuration already provide the needed traceability.

## Evals are the AI regression test layer

When AI behavior is important to product value or risk, maintain a small representative evaluation set before public or paid dependence on that behavior.

An eval SHOULD measure observable outcomes rather than trusting the model's self-report that it completed a task.

Use cases may include:

- representative successful user tasks,
- known historical failures,
- difficult boundary cases,
- authorization/tool constraints,
- prompt-injection/adversarial cases when untrusted content is processed,
- retrieval/memory correctness when these components are material,
- refusal or escalation behavior where required.

Because model behavior can vary across runs, use repeated trials or statistical comparison only when variance is large enough to change the decision. Do not build a large eval platform before a smaller regression set provides value.

Material model, prompt, tool, retrieval, memory, or provider changes SHOULD run the relevant eval suite before release when a regression could materially affect users, security, money, or operating cost.

## Validate outputs at trusted boundaries

Treat model output as untrusted input before it reaches a privileged or strongly typed system boundary.

Where applicable:

- use structured outputs/schemas,
- validate type, range, identity, resource scope, and business invariants,
- normalize or reject malformed output,
- do not concatenate model-generated content into unsafe SQL/shell/code/templates without an appropriate safe boundary,
- re-check authorization using trusted application state immediately before the side effect.

Never rely on the model to remember the user's true authorization scope from conversation context alone.

## Tool and action security

Expose the smallest tool set and permissions required for the feature.

Prefer tools that are:

- narrowly scoped,
- explicit about read versus write authority,
- schema validated,
- bounded in resource/cost impact,
- auditable enough for high-impact actions,
- capable of rejecting unauthorized resource access regardless of model instructions.

Avoid wildcard administration tools when narrower actions can serve the product.

Treat retrieved webpages, documents, messages, third-party APIs, tool descriptions, and user-provided content as potentially adversarial instructions. Untrusted content MUST NOT gain authority merely because it appears in the model context.

For destructive, irreversible, financially material, privacy-sensitive, or privilege-changing actions, use a stronger trusted confirmation/authorization boundary appropriate to the risk. Human confirmation can be useful, but approval fatigue means repeated "click allow" prompts are not a substitute for least privilege and hard limits.

## Retrieval and memory

Retrieval and memory improve capability but create additional correctness, privacy, and security surfaces.

As applicable:

- isolate users/tenants at the retrieval boundary,
- enforce access control before retrieved data reaches the model,
- avoid storing secrets or unnecessary sensitive content in long-lived memory,
- define retention/deletion when memory persists user data,
- prevent retrieved text from being treated as privileged system instruction,
- preserve provenance when important claims/actions need an authoritative source,
- consider poisoning/stale-data failure modes for shared or writable memory.

A vector database or memory store is not automatically a source of truth. Resolve critical facts back to the authoritative system when correctness matters.

## Bound runtime, recursion, and economic exposure

If AI execution can create material resource or financial exposure, enforce hard limits outside model instructions where practical.

Depending on the product, bound:

- tokens/input/output size,
- tool calls,
- reasoning/iteration/step count,
- wall-clock duration,
- concurrent runs,
- queued runs,
- external API calls,
- file/data volume,
- per-user/account/time-window usage,
- total task/session budget.

Provide cancellation and emergency-disable/circuit-breaker paths when runaway behavior could become financially or operationally material before a person can respond.

Budget alerts are useful but are not a sufficient control for rapidly accumulating cost.

## Provider and model failure

Model providers can become slow, unavailable, rate-limited, behaviorally inconsistent, deprecated, or more expensive.

Define the smallest failure strategy justified by product value:

- fail clearly,
- retry only within a bound,
- queue for later,
- degrade to non-AI functionality,
- switch to a pre-evaluated fallback model/provider,
- require user retry or operator intervention.

Do not add multi-provider abstraction solely for theoretical portability. A fallback is valuable only when its integration, evaluation, and operating cost are justified by the expected failure impact.

## Observability without indiscriminate logging

For material AI behavior, capture enough evidence to diagnose quality, safety, reliability, and cost regressions.

Useful signals may include:

- model/config/release identifier,
- latency and provider errors,
- token/tool/external API usage,
- task success/failure outcome when measurable,
- tool/action failures and policy rejections,
- eval trends,
- cost per operation or user cohort when decision-relevant.

Do not default to storing complete prompts, retrieved content, tool payloads, or model outputs indefinitely. Telemetry must follow the same privacy, sensitive-data, access-control, and retention rules as other production data.

## Release and rollback

When an AI configuration change can materially alter product behavior, keep a practical rollback path such as reverting prompt/tool configuration, selecting the previous evaluated model/configuration, disabling the feature, or degrading to a safer mode.

Before a material release, ask:

- Did relevant eval behavior regress?
- Did permissions/data exposure change?
- Did tool/action scope change?
- Did latency/cost change materially?
- Did a model/provider change invalidate assumptions?
- Is rollback/degradation still possible?

## Stage-based adoption

### Prototype

Usually keep controls minimal. Use fake/manual flows where possible when AI feasibility is not the core hypothesis. Avoid real sensitive data and expensive autonomous execution unless necessary for validation.

### Internal alpha

Add basic behavior examples/evals, explicit tool/data boundaries, usage limits, and enough logging to diagnose failures.

### Private beta

For AI-critical features, maintain a representative regression set, validate privileged outputs, define provider failure behavior, and protect user/tenant data boundaries.

### Public free

Bound abuse and variable cost, monitor material AI failures, protect retrieval/memory, and run relevant security/adversarial cases before high-impact changes.

### Paid production

When users pay for AI capability or AI affects money/access/important work, require a reliable evaluation/release path, economic containment, observable provider/tool failures, safe rollback/degradation, and support-visible evidence sufficient to diagnose material failures.

### Growth

Add larger eval suites, automated quality gates, richer cost attribution, specialized safety testing, multiple models/providers, or advanced agent infrastructure only when measured scale/risk justifies their lifecycle cost.

## Anti-patterns

Avoid:

- prompt-only authorization or spending limits,
- trusting model self-reports as completion evidence,
- unrestricted general-purpose tools for narrow product needs,
- treating retrieved content as trusted instruction,
- storing unlimited conversation/memory by default,
- logging every prompt/output without a privacy/retention reason,
- adding multi-agent orchestration merely because the framework supports it,
- model-specific prompt tricks as permanent architecture,
- automatic fallback to an unevaluated model for high-impact behavior,
- shipping a major model/prompt/tool change without regression evidence when the behavior materially matters.

The objective is not maximum AI autonomy. It is useful AI behavior whose authority, cost, failure, and uncertainty are bounded by ordinary software-engineering controls.
