# Decision 0002 — AI Understands; Rules Decide Lifecycle State

## Status

Accepted — 2026-08-19

## Context

Lunowa's product value depends on interpreting ordinary email into actions, deadlines, waiting states, follow-up needs, and completion signals. AI/LLMs are useful for this interpretation, but they are probabilistic and can be affected by ambiguous language, quoted history, prompt-like content inside email, provider formatting, and model/config changes.

A false negative is particularly dangerous: a real user obligation could be classified as safe to hide, completed, or waiting.

## Decision

AI is an **interpretation component**, not the authoritative lifecycle state machine.

The accepted flow is:

```text
Normalized communication
 -> AI extraction / deterministic parsing
 -> schema validation
 -> candidate facts + confidence + provenance
 -> deterministic lifecycle/domain rules
 -> authoritative ActionItem state
 -> attention / Temporal Contract policy
```

The AI may propose:

- requested action;
- owner;
- deadline;
- waiting/completion/follow-up signals;
- topic/preview;
- provenance references;
- uncertainty.

It may not directly own:

- authorization;
- provider mutation permission;
- authoritative lifecycle state;
- automatic hiding without policy validation;
- irreversible send/delete/archive actions;
- Temporal Contract execution guarantees.

## Alternatives considered

### Let the model directly output lifecycle state

Rejected as the sole authority because it makes state changes difficult to reason about, test, audit, and bound across model updates.

The model may still emit a state *candidate* for debugging/evaluation, but deterministic domain logic remains authoritative.

### No AI; only deterministic parsing

Not accepted as the long-term product approach because ordinary human communication is too varied for purely deterministic extraction to deliver the intended interpretation benefit.

However deterministic/manual fixtures should be used before AI integration to validate domain/lifecycle behavior.

## Consequences

Positive:

- lifecycle behavior can be unit/integration tested;
- user corrections can be preserved;
- model/provider changes are less likely to silently alter state authority;
- provenance and uncertainty can be explicit;
- core email remains usable when AI is unavailable.

Trade-offs:

- requires a structured extraction schema and lifecycle reducer;
- deterministic rules need ongoing refinement;
- borderline cases may remain `UNCERTAIN` rather than appearing magically resolved.

## Safety bias

During early product stages, uncertainty should bias against hiding a likely user obligation. A visible uncertain item is generally less harmful than a missed required action.

## Revisit when

This boundary can be refined as evaluation evidence improves, but any proposal to give a model direct privileged lifecycle/action authority requires explicit risk analysis, eval evidence, and an updated decision record.