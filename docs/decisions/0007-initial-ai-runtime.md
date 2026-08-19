# ADR 0007 — Initial AI runtime

## Status

Accepted — 2026-08-19

## Context

Lunowa uses AI to reduce interpretation burden: identify possible actions, owners, deadlines, waiting/completion signals, and evidence inside email conversations.

The model is probabilistic and email content is untrusted/sensitive. AI output therefore cannot own lifecycle state, authorization, provider actions, send authority, or Temporal Contract execution.

The implementation should prove one useful, evaluated extraction path before adding provider abstraction, agents, tool orchestration, or multiple fallback models.

## Decision

Use:

- the official OpenAI SDK;
- the Responses API;
- Structured Outputs / JSON Schema for interpretation results;
- application-side runtime validation of the result;
- a thin Lunowa-owned `ConversationInterpreter` interface;
- `store: false` by default for email interpretation requests;
- model/config selection through configuration and eval evidence rather than a hard-coded permanent model name.

Do **not** add user-facing agent/tool autonomy for the initial lifecycle interpreter.

The deterministic lifecycle reducer remains authoritative:

> **AI understands; rules decide state.**

## Interpretation pipeline

```text
authorized normalized conversation
    -> context builder
    -> OpenAI Responses request
    -> strict structured interpretation candidate
    -> runtime schema validation
    -> provenance/source validation
    -> deterministic lifecycle reducer
    -> ActionItem/lifecycle proposal or transition
```

The AI result is evidence/candidate input. It is not authoritative database state merely because it matches the JSON schema.

## Initial output expectations

The exact schema lives in `docs/product/CONTRACTS.md`, but the model should produce bounded structured facts such as:

- requested action / goal;
- action owner / next owner;
- deadline/date candidate;
- completion signal;
- waiting signal;
- follow-up expectation;
- confidence/uncertainty;
- supporting message/provenance identifiers.

Missing/ambiguous facts are represented explicitly rather than guessed.

## Rationale

### Structured output reduces parser ambiguity

OpenAI's current Responses API supports Structured Outputs with JSON Schema. This is a better boundary than parsing prose or relying on legacy JSON-object mode.

Structured output does not eliminate semantic mistakes, so Lunowa still validates identifiers, authorization scope, dates, ownership, provenance, and lifecycle invariants outside the model.

### One provider first reduces operating complexity

Lunowa's product risk is whether AI interpretation is accurate/trustworthy enough to reduce communication burden — not whether the system can route between many model vendors.

A thin interface preserves replaceability without building a generic AI gateway prematurely.

### Model choice should follow evals

Model availability, quality, latency, and price change. Durable architecture should specify the behavior contract and eval threshold rather than permanently encoding today's favored model.

At Phase 6, compare current candidate models on the same representative email set and choose the cheapest candidate that passes the required quality/trust thresholds.

## Data/privacy requirements

Email content can contain personal, confidential, financial, employment, education, or organizational data.

Requirements:

- build model context only after user/ConnectedAccount/Scope authorization;
- send only the minimum conversation context required for the extraction task;
- use `store: false` by default;
- do not log complete email bodies/prompts/outputs by default;
- retain Lunowa-owned interpretation/provenance only according to the product's retention/privacy policy;
- never expose one user's/provider account's content to another user's retrieval/model context;
- treat email body instructions as untrusted content, not system/tool instructions.

OpenAI's current data-control documentation states that Responses API application state is retained by default unless controls such as `store: false`/eligible retention settings are used. Therefore `store: false` is the normal Lunowa interpretation default.

## Authority and action limits

The model must not directly decide or execute:

- user authentication/authorization;
- provider token scope;
- hidden vs visible access permissions;
- destructive provider actions;
- sending an email without the trusted application action boundary;
- Temporal Contract trigger fire;
- final lifecycle state when deterministic policy rejects/abstains;
- billing/entitlement/cost controls.

Any later model tool/action capability requires a separate review of permissions, idempotency, confirmation, and evals.

## Initial eval gate

Before AI controls material lifecycle behavior, maintain representative cases including:

- explicit user action request;
- explicit deadline;
- ambiguous relative date;
- waiting on another party;
- action already completed;
- no action required;
- multiple tasks in one thread;
- quoted historical request that is no longer active;
- follow-up request after prior completion;
- signature/footer noise;
- Japanese business email;
- English email when enabled;
- prompt-like/malicious text inside email content;
- low-confidence case where abstention is correct.

Measure observable structured extraction and resulting reducer behavior, not the model's self-description of success.

## Failure/degraded behavior

If the provider is unavailable, rate-limited, invalid, or returns unusable output:

- ordinary mail reading/composing/search/navigation continues;
- do not silently infer a safe-to-hide state;
- preserve the last trustworthy deterministic state;
- show a quiet degraded/uncertain state only where relevant;
- bounded retry/background reprocessing may occur where justified.

## Alternatives considered

### Multiple AI providers from day one

Rejected. It doubles integration/eval/behavior variance without validating that provider failure warrants the cost.

### LangChain/general agent framework

Rejected initially. The interpretation pipeline is a bounded structured extraction call plus deterministic application logic. A general agent framework adds abstraction and tool authority without current need.

### Model directly manages lifecycle state

Rejected. This would make probabilistic output the authority for hiding/resurfacing obligations, which conflicts with Lunowa's trust proposition.

### Legacy JSON mode / prose parser

Rejected where Structured Outputs is available. Strict schema generation is a better boundary, followed by normal application validation.

## Consequences

Positive:

- small AI surface;
- easier evals and rollback;
- predictable application contract;
- reduced prompt/tool-injection authority;
- model can be replaced without rewriting lifecycle rules.

Costs/risks:

- deterministic reducer/domain code remains necessary;
- schema-conformant output can still be semantically wrong;
- email-data privacy/provider cost must be monitored;
- model changes require regression evidence.

## Evidence checked

- OpenAI quickstart / Responses API: https://platform.openai.com/docs/quickstart
- OpenAI API model/Structured Outputs documentation: https://developers.openai.com/api/docs/models
- OpenAI data controls: https://platform.openai.com/docs/models/default-usage-policies-by-endpoint
- Reusable local AI-runtime rules: `../ai-product-runtime.md`
