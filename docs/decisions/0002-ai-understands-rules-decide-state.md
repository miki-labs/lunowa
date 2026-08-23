# Decision 0002 — AI Understands; Trusted Rules Decide Accepted Responsibility State

## Status

Accepted — 2026-08-19  
Amended / reconciled with Responsibility v0.1 — 2026-08-23

## Context

Lunowa's product value depends on understanding ordinary communication well enough to identify possible Responsibility loops, obligation bearers, requested actions/events, temporal expressions, proposals, completion/correction signals, and uncertainty.

AI/LLMs are useful for language interpretation, but they remain probabilistic and can be affected by:

- ambiguous/indirect language;
- quoted/forwarded history;
- typo/IME noise;
- conflicting evidence;
- prompt/tool-like text inside email;
- missing context;
- model/config changes;
- asynchronous stale results.

A dangerous failure is not merely a wrong label. A real material user obligation could be hidden as Done/Waiting/Later/NONE, a false completion could be accepted, or a high-risk sender request could be treated as authorized action.

Responsibility v0.1 also established that the domain cannot be represented faithfully by one canonical lifecycle enum. Resolution, live tracking, attention/defer, obligation/actionability, expected events, temporal facts, uncertainty/risk, and provenance are orthogonal semantic dimensions.

## Decision

AI is an **interpretation component**, not the authority for accepted Responsibility state, authorization, or privileged effects.

The accepted flow is:

```text
Authorized communication / trusted observations
 -> normalization + message zoning
 -> AI interpretation + deterministic parsing/observations
 -> structured candidate acts/claims/temporal expressions + provenance
 -> schema/source/context validation
 -> stale-basis / evidence-revision validation
 -> Responsibility admission
 -> identity matching + deterministic/trusted reduction
 -> safety/actionability policy
 -> accepted evidence-relative Responsibility state
 -> deterministic My Turn / Waiting / Later / Done / Review projection
 -> Temporal Contract / attention policy where applicable
```

The model may propose/interpret, when relevant:

- communication acts;
- speaker vs obligation-bearer candidates;
- requested action/event/object;
- modality / obligation strength;
- proposed terms;
- temporal expressions;
- completion/correction/cancellation signals;
- communicated claims;
- uncertainty;
- source message IDs / locators / provenance.

It may **not** directly own:

- authentication/authorization;
- ConnectedAccount ownership or sending identity;
- provider mutation permission;
- accepted Responsibility admission/identity/effects;
- live tracking/defer/hiding without validated product policy;
- irreversible send/delete/archive/payment/approval actions;
- provider-observed facts that should come from trusted provider state;
- Temporal Contract execution guarantees;
- cost/entitlement/security policy.

### Orthogonal-state consequence

“Rules decide state” does **not** mean a deterministic reducer chooses one value from the superseded enum:

```text
OPEN / ACTION_REQUIRED / DEFERRED / WAITING / FOLLOW_UP / COMPLETED / UNCERTAIN
```

Instead, trusted domain logic reduces evidence into the accepted Responsibility semantic vector and derives the user-facing projection.

`FOLLOW_UP` is normally a current user action/reason after re-evaluation, not a canonical lifecycle species. `LATER` is an attention projection, not the same thing as communication hold. `REVIEW` may arise from a field-level decision-critical conflict even when Responsibility admission is definitely `TRACK`.

## Alternatives considered

### Let the model directly output the canonical product state

Rejected as authority because probabilistic output is difficult to reason about, audit, safely migrate across model updates, and bound under stale/ambiguous/high-risk evidence.

A model may emit diagnostic candidates, but accepted domain state still passes through trusted validation/reduction.

### Keep the old deterministic seven-state lifecycle reducer and only improve extraction

Superseded by Responsibility v0.1. Scenario/transition stress testing showed that one enum conflates independent concepts such as resolution, attention defer, follow-up action, uncertainty, parallel obligations, and historical activation.

### No AI; only deterministic parsing

Not accepted as the long-term product approach because real communication is too varied for purely deterministic extraction to deliver the intended interpretation benefit.

Deterministic/manual fixtures remain valuable for validating the domain before AI integration.

### Repeated model voting as authority

Rejected. Consensus is an uncertainty signal, not evidence authority; correlated models can agree on the same wrong interpretation.

## Consequences

Positive:

- Responsibility behavior is testable independently of model/provider changes;
- user corrections and source provenance can be preserved;
- stale model results can be rejected by evidence revision;
- high-risk requests can be understood without being authorized;
- AI degradation does not disable ordinary email;
- model/prompt upgrades need not silently rewrite accepted history;
- scenario/transition oracles can distinguish extraction failures from reducer/safety/projection failures.

Trade-offs:

- requires structured interpretation contracts and a real domain reducer;
- deterministic/trusted domain logic needs ongoing scenario-driven refinement;
- ambiguous cases may remain Review/ordinary mail rather than appearing magically certain;
- more semantic dimensions must be represented than in a simplistic lifecycle enum.

## Safety bias

During early product stages:

```text
fake completion >> visible uncertainty
missed material user obligation > unnecessary review
false merge > modest false split
```

But routing everything to Review is also product failure. Review should be used for decision-critical ambiguity/risk, not harmless uncertainty.

## Revisit when

The interpretation/reducer boundary may be refined as evaluation evidence improves, but any proposal to give a model direct privileged authority over accepted Responsibility state or high-impact side effects requires:

- explicit threat/risk analysis;
- canonical/holdout eval evidence;
- high-harm forbidden-outcome testing;
- authorization/idempotency/confirmation design;
- an updated durable decision record.