# ADR 0007 — Initial AI Runtime

## Status

Accepted — 2026-08-19  
Amended / reconciled with Responsibility v0.1 — 2026-08-23

## Context

Lunowa uses AI to reduce interpretation burden inside ordinary email communication. The model is useful for probabilistic language understanding, not for owning authorization, provider facts, accepted Responsibility state, Temporal Contract execution, or privileged side effects.

Responsibility v0.1 refined the interpretation target. The model should not merely emit `next_owner`, one `deadline`, or a lifecycle-state guess. It should produce structured candidate interpretation that preserves distinctions such as:

```text
communication act
speaker vs obligation bearer
requested action/event/object
modality / obligation strength
proposal vs agreement
communicated claim vs provider observation
source temporal expression
correction/cancellation/completion signal
uncertainty
provenance
```

The trusted application then performs admission, identity/effect reduction, safety/actionability policy, and deterministic projection.

Email content is sensitive and untrusted. The implementation should prove one useful evaluated interpretation path before adding provider abstraction, agent tool orchestration, or multiple fallback models.

## Decision

Use:

- the official OpenAI SDK;
- the Responses API;
- Structured Outputs / JSON Schema for interpretation candidates;
- application-side runtime/source/provenance validation;
- a thin Lunowa-owned `ConversationInterpreter` or equivalent interface;
- `store: false` as the accepted initial interpretation default, subject to current official OpenAI data-control requirements at implementation/release time;
- model/config selection through configuration + eval evidence rather than a permanently hard-coded model name.

Do **not** add user-facing agent/tool autonomy to the initial Responsibility interpreter.

The accepted boundary remains:

> **AI understands; trusted rules decide accepted Responsibility state.**

## Interpretation pipeline

```text
authorized normalized communication/context
    -> context builder
    -> OpenAI Responses request
    -> strict structured interpretation candidate
    -> runtime schema validation
    -> source/provenance/material-value validation
    -> evidence-revision freshness validation
    -> Responsibility admission + identity/effect reducer
    -> safety/actionability policy
    -> accepted evidence-relative Responsibility state
    -> deterministic product projection
```

A schema-conformant AI result is still only candidate interpretation. It never becomes authoritative database state solely because JSON validation succeeded.

## Initial output expectations

The exact runtime DTO lives in `docs/product/CONTRACTS.md` and may evolve, but semantic output should remain bounded around concepts such as:

```text
focal message / zoning candidates
communication_acts[]
  type
  speaker
  obligation_bearer candidate(s)
  assignment shape candidate
  action/event/object
  modality / obligation strength
  polarity
  condition / constraints
  temporal expressions
  source message IDs / locators

communicated_claims[]
proposed_terms[]
uncertainty[]
no_responsibility_signal?
basis_evidence_revision
```

The model should **not** be required to output the canonical Responsibility state vector itself.

Missing/ambiguous facts are represented explicitly rather than guessed.

## Runtime validation outside the model

Structured Outputs reduce syntax/parser ambiguity but do not establish semantic correctness.

Lunowa still validates, outside the model:

- current user/account/scope authorization;
- message/participant identifiers;
- source message existence;
- provider observations such as attachment presence;
- material values such as dates/amounts/identities/URLs where deterministic validation is practical;
- source locators/provenance;
- evidence revision freshness;
- cross-account identity boundaries;
- Responsibility admission/identity invariants;
- high-risk safety/actionability constraints.

`basis_evidence_revision == current_revision` is necessary for applying an interpretation result when revisions matter, but is not sufficient for authority.

## Rationale

### Structured output gives a narrow interface

A versioned JSON Schema is safer and more testable than free-form prose parsing. It also makes AI provider/model changes easier to evaluate against the same semantic contract.

### One provider first reduces operational variance

The product risk is whether AI interpretation actually reduces Communication Management Burden without introducing missed obligations, false completion, false merge, or unsafe actionability. Multiple model providers do not answer that question.

A thin interface preserves replaceability without building a generic AI gateway.

### Model selection follows eval evidence

Model availability, latency, price, and behavior change. Durable architecture specifies behavior/evaluation gates, not a permanent model name.

At AI activation time, compare current viable candidates on the same canonical/holdout corpus and select the lowest-cost option that satisfies the required quality/safety thresholds.

## Data/privacy requirements

Email can contain personal, financial, employment, education, contractual, and organizational data.

Requirements:

- build model context only after User/ConnectedAccount/Scope authorization;
- send the minimum context required for the interpretation task;
- use the accepted no-storage request behavior where current provider controls support it and verify current official policy at implementation/release time;
- do not log full email bodies/prompts/model outputs by default;
- retain Lunowa-owned accepted interpretation/provenance only under explicit product retention/privacy policy;
- never expose one user's/account's content to another user's retrieval/model context;
- treat email-body instructions as untrusted data, not system/tool instructions.

Provider/API retention behavior is time-sensitive and must be rechecked against current official documentation before production activation rather than assumed indefinitely from this ADR.

## Authority and action limits

The model must not directly decide or execute:

- user authentication/authorization;
- mailbox token scope;
- account/scope ownership;
- destructive provider actions;
- sending without the trusted application action boundary;
- payment/contract/approval compliance;
- Temporal Contract trigger effects;
- final Responsibility admission/identity/effects;
- live tracking/defer/hiding;
- billing/entitlement/cost controls.

Any later tool/action capability requires separate permission, idempotency, confirmation, safety, and eval review.

## Initial eval gate

The AI runtime MUST use the canonical Responsibility evaluation artifacts rather than a small ad-hoc happy-path set.

Primary sources:

```text
docs/product/responsibility/COVERAGE-PLAN.md
docs/product/responsibility/TIER-0-SCENARIO-MATRIX.md
docs/product/responsibility/TIER-0-CRITICAL-ORACLES.md
docs/product/responsibility/TRANSITION-ORACLES.md
```

Evaluation should include, as applicable to the AI layer:

- direct inbound/outbound Request/Commitment contrasts;
- firm vs plan/intention/capability;
- proposal vs agreement;
- indirect Japanese business requests;
- `DO_NOT_TRACK` cases;
- quoted/forwarded content;
- multiple Responsibilities and obligation-bearer ambiguity;
- source due vs expected-event time vs user target;
- explicit correction vs unresolved conflict;
- attachment claim vs provider observation;
- completion strength;
- high-risk payment/contract/login requests;
- prompt-injection/tool-like text;
- typo/IME/noise invariance and meaning-changing sensitivity;
- stale evidence revision;
- cross-account lookalikes;
- genuine AMBIGUOUS / USER_DEPENDENT cases.

Transition oracles are tested at the runtime layer that owns them; a model prompt eval alone cannot prove send reconciliation, scheduler, sync ordering, authorization, or stale-job safety.

### Evaluation views

Do not reduce quality to one overall accuracy number. Track at least relevant layers separately:

```text
zoning
communication-act / claim extraction
obligation-bearer correctness
material temporal extraction
provenance coverage
uncertainty behavior
typo invariance
semantic sensitivity
run stability
```

Then separately evaluate downstream:

```text
admission
identity/effects
resolution safety
safe-action policy
projection
```

### Holdout discipline

Model/prompt development must not repeatedly tune on the complete golden corpus and report that same corpus as evidence of generalization. Maintain family-stratified holdout and later organic/production regression cases.

## Failure/degraded behavior

If the model/API is unavailable, rate-limited, times out, or returns unusable output:

- ordinary mail reading/composing/sending/basic search/navigation continues;
- do not invent a safe-to-hide state;
- preserve last accepted state until new valid evidence/reduction changes it;
- surface Review/ordinary mail only where material uncertainty warrants it;
- use bounded retry/background reprocessing where justified;
- do not rerun/reclassify merely because a user opened a screen.

## Alternatives considered

### Multiple AI providers from day one

Rejected. It adds integration/eval/behavior variance before validating the product need.

### LangChain/general agent framework

Rejected initially. The required path is bounded interpretation plus trusted application logic, not a generic autonomous agent.

### Model directly manages Responsibility state

Rejected. This would make probabilistic output authoritative for hiding/resurfacing/identity/safety.

### Legacy `next_owner + deadline + lifecycle` output contract

Superseded by Responsibility v0.1 because it cannot faithfully represent parallel/conditional obligations, negotiation, historical activation, field-level uncertainty, or safe-action separation.

### Legacy JSON mode / prose parser

Rejected where strict Structured Outputs are available and suitable; runtime/source validation is still required afterward.

## Consequences

Positive:

- small bounded AI surface;
- stronger eval/rollback discipline;
- model replacement without rewriting domain authority;
- better prompt-injection containment;
- explicit stale-result handling;
- source-grounded material facts;
- no need for the model to imitate a generic workflow engine.

Costs/risks:

- trusted Responsibility reducer/domain code remains necessary;
- schema-conformant output can still be semantically wrong;
- evidence/provenance validation adds implementation work;
- email-data privacy/cost/latency need monitoring;
- model/config changes require regression evidence.

## Evidence checked when originally accepted

- OpenAI Responses API / Structured Outputs documentation;
- OpenAI data controls;
- reusable local AI runtime rules in `../ai-product-runtime.md`.

These external facts are time-sensitive. Re-check current official OpenAI documentation at implementation/release time rather than treating the 2026-08-19 snapshot as permanent.