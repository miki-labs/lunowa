# Monetization Engineering

Monetization engineering covers the software and operational capabilities that keep money, commercial state, product access, usage, and provider state consistent. It is a high-risk domain because failures can charge users incorrectly, deny paid access, leak paid access, create financial disputes, or make variable-cost products economically unsafe.

This document defines reusable engineering defaults. Provider-specific states, store programs, retry schedules, tax rules, prices, and product-specific commercial policy belong in the product repository and current provider documentation.

Normative requirements in this document apply when the corresponding capability/risk exists. A product without subscriptions does not need subscription machinery; a fixed-cost product without meaningful variable-cost exposure does not need agent-style cost controls.

## 1. Commercial state is a first-class domain

Do not collapse all monetization into one `subscription_status` or provider object.

Where relevant, explicitly distinguish at least:

- **payment / invoice state** — whether money is due, attempted, paid, failed, refunded, disputed, or otherwise adjusted,
- **subscription / commercial agreement state** — the lifecycle of the recurring or contracted relationship,
- **entitlement state** — what capabilities, limits, seats, storage, models, or other product access the user is currently allowed,
- **usage / quota state** — measured consumption and remaining allowance when usage affects access or money.

Trials, offers, credits, grace periods, refunds, disputes, revocations, upgrades, downgrades, cancellations, suspensions, and similar concepts may cause transitions in one or more of these domains. They are not automatically interchangeable with any one domain.

For material monetization flows, the product repository MUST define:

- which system is authoritative for each state,
- how external/provider identifiers map to internal accounts and commercial objects,
- which transitions affect entitlement or usage,
- expected propagation delay and temporary-state behavior,
- how conflicting or stale state is resolved.

Do not copy provider-specific state machines into the global blueprint. Model the product's required commercial invariants and map current provider states to them.

## 2. Distribution channel and payment rail are product constraints

Before implementing or materially changing paid functionality, determine the payment and distribution constraints of each supported channel.

For web, mobile stores, marketplaces, enterprise distribution, or other channels, MUST re-check current primary provider/platform documentation when rules can affect:

- permitted or required payment rails,
- external purchase/linking programs,
- transaction reporting,
- purchase restoration,
- refund/revocation handling,
- subscription disclosures,
- store review or submission requirements,
- fees or operational responsibilities.

Do not encode "always use provider X" or a time-sensitive store policy as a durable global rule.

If the same account can purchase through multiple channels, the product SHOULD define how those purchases map to one internal entitlement model and how duplicate/conflicting commercial identities are handled.

## 3. Prefer mature payment capabilities

For ordinary SaaS and consumer products, SHOULD use mature payment/store capabilities rather than implementing payment-card processing or subscription infrastructure from first principles.

Prefer hosted/tokenized flows that keep raw card data outside application systems when practical.

Before building commodity billing UI or retry logic, evaluate provider capabilities such as hosted checkout, customer portals, subscription management, payment retries, tax integrations, refunds, and purchase restoration.

Provider reuse does not remove application responsibility for entitlement correctness, data mapping, failure handling, reconciliation, support, and observable product behavior.

## 4. Events are triggers, not always complete truth

Billing and store systems are asynchronous. Webhooks, server notifications, Pub/Sub messages, callbacks, and client redirects can be duplicated, delayed, reordered, retried, or missed.

Handlers for money/access-changing events MUST address as applicable:

- authenticity/signature/source verification,
- duplicate delivery and idempotency,
- out-of-order or stale events,
- delayed/retried delivery,
- safe retry behavior,
- observable processing failure,
- provider/API retrieval when the event does not contain authoritative complete state.

Do not grant or revoke high-value access solely from an unverified client-side redirect or weakly trusted client assertion.

When the provider documents notifications as change signals rather than complete purchase state, retrieve the authoritative current state before applying critical entitlement changes.

## 5. Reconciliation and repairability

Event-driven synchronization is not sufficient by itself for financial or entitlement-critical state when missed events, operator actions, provider-side changes, migrations, or bugs can create drift.

Paid products MUST have a practical way to detect and correct material disagreement between authoritative provider state and internal commercial/entitlement state.

The mechanism MAY be event-triggered, scheduled, on-demand, support-triggered, or a combination. Choose the smallest approach justified by risk and provider behavior.

A reconciliation design SHOULD define:

- the compared identifiers and authoritative fields,
- mismatch classes that matter,
- whether repair is automatic or requires review,
- idempotent recomputation/replay behavior,
- how destructive or ambiguous repair is prevented,
- what evidence/audit trail is retained when material.

Solo/small-team products do not need a large admin console by default. A safe provider dashboard workflow, constrained script, internal endpoint, or job can be sufficient if it is authenticated, auditable enough for the risk, and difficult to misuse.

Do not make direct production database edits the normal recovery path for billing/entitlement incidents.

## 6. Subscription, trial, cancellation, and payment-failure semantics

If subscriptions, trials, grace periods, or payment recovery are used, define product behavior rather than inheriting accidental provider defaults.

Where relevant, specify:

- when a trial begins and ends,
- whether payment method collection is required,
- what happens when a trial cannot convert,
- cancellation effective time (immediate vs period end or other policy),
- upgrade/downgrade effective time,
- payment-failure behavior,
- grace/access behavior during provider retry or recovery,
- user communication when action is required,
- final entitlement state after unrecovered failure.

Use provider-managed retry/recovery capabilities where they fit rather than recreating complex dunning logic without product need.

The global blueprint does not prescribe one grace period, retry schedule, proration rule, or cancellation policy.

## 7. Refunds, disputes, reversals, and revocations

Paid products MUST define how post-purchase financial changes affect internal access and records where those events are possible.

Consider:

- refunds and partial refunds,
- chargebacks/disputes,
- provider/store revocation,
- refund or dispute reversal/recovery,
- voided or fraudulent purchases,
- credits or compensation.

The required response may be revoke, preserve through a period, restore, reduce quota/credits, escalate to support, or another product-specific action. The important requirement is explicit, testable consistency rather than one universal policy.

## 8. Entitlements

Entitlement knowledge SHOULD have one clear evaluation boundary rather than being scattered as plan-name checks across unrelated code.

Entitlements may include:

- feature access,
- storage or message limits,
- usage allowance,
- seats/accounts,
- model/API access,
- priority/support level.

Plan/catalog changes SHOULD preserve existing-customer behavior or have an explicit migration strategy.

Feature flags and entitlements are different concepts: feature flags control rollout/availability; entitlements represent a user's product rights. Do not use one as an accidental substitute for the other.

## 9. Usage metering

If usage affects money or entitlement, metering is business-critical data, not ordinary analytics.

Define:

- billable/limited unit,
- authoritative measurement point,
- account/tenant attribution,
- duplicate handling,
- late-arriving events,
- reset/period boundaries,
- reconciliation,
- user-visible usage state when needed,
- enforcement behavior at or beyond the limit.

Prefer mechanically enforced invariants and stronger verification when incorrect usage can charge users or create material cost.

## 10. Revenue-critical observability

Paid production MUST make material monetization failures detectable within a response window appropriate to their user/revenue impact.

Signals may include:

- checkout or payment failure anomalies,
- billing/store notification processing failures,
- payment/subscription state that failed to propagate into entitlement,
- reconciliation mismatches,
- usage-meter ingestion or accounting failures,
- refund/revocation events that failed to propagate,
- abnormal commercial-state transition failures.

Do not require a dedicated billing observability vendor. Use the smallest combination of logs, metrics, error reporting, provider alerts, synthetic checks, queries, or scheduled verification that makes material failure visible and actionable.

Alerts SHOULD map to an operator action or runbook rather than merely report noise.

## 11. Economic containment and variable-cost safety

A product whose user actions, AI/model calls, external APIs, storage, jobs, or autonomous agents can create material variable cost MUST bound economically dangerous execution before public exposure.

Depending on the risk, use one or more of:

- per-user/account quotas,
- rate and concurrency limits,
- maximum request/job size,
- provider service limits,
- per-task/session/time-window budgets,
- token/tool/iteration limits for agentic workflows,
- automatic cutoffs or circuit breakers,
- anomaly detection and emergency disable paths.

Budget alerts alone are insufficient when cost can grow materially before a human can respond.

For AI/agent systems, hard controls SHOULD be enforced outside the model's own instructions when practical. A prompt that says "stop after N steps" is not equivalent to an externally enforced execution bound.

Limits SHOULD protect the business without making legitimate product use arbitrarily fail. Tune them using real usage and unit economics rather than copying enterprise thresholds.

## 12. Verification of commercial invariants

Changes affecting money, entitlement, or billable usage are high-risk and SHOULD receive stronger verification than ordinary UI changes.

Verify observable invariants such as:

- one economic event cannot accidentally grant duplicate value,
- paid access is granted when the accepted commercial state requires it,
- access changes correctly after cancellation, failure, refund, revoke, or recovery according to product policy,
- retries/redelivery do not duplicate side effects,
- stale/out-of-order events do not overwrite newer authoritative state,
- reconciliation converges safely,
- usage cannot be trivially bypassed or double-counted.

Use the strongest practical mechanism for the stack: database constraints, explicit state transitions, table/state-machine tests, integration/contract tests, provider sandbox tests, or end-to-end purchase flows where justified.

No single testing technique is universally required.

## 13. Support and remediation

Before meaningful paid usage, support SHOULD be able to identify the account, commercial object, relevant provider state, entitlement state, and recent processing failures without requiring broad production access.

Collect only the diagnostic context necessary to resolve the problem.

High-impact manual remediation SHOULD be constrained and documented enough to prevent accidental cross-user or destructive changes.

## 14. Stage-based adoption

### Prototype

Usually omit real billing unless payment intent, willingness to pay, or the payment flow itself is the hypothesis being validated.

### Private beta

If real payment is used, establish the minimum commercial state model and support/recovery path before taking money.

### Public free product

Bound economically dangerous variable-cost paths and abuse before scale makes them incidents.

### Paid production

Require, as applicable:

- current payment/distribution policy check,
- secure payment/store integration,
- explicit commercial state ownership,
- entitlement correctness,
- payment-failure/cancellation/refund behavior,
- idempotent event handling,
- reconciliation and safe repair,
- revenue-critical observability,
- authoritative usage metering when money/access depends on usage,
- variable-cost containment where material,
- support path for commercial incidents.

### Growth

Add deeper fraud controls, automated reconciliation breadth, formal service objectives, advanced cost attribution, experimentation, and operational specialization only when traffic/revenue/risk justifies them.

## 15. Anti-patterns

Avoid:

- treating a provider subscription object as the application's complete commercial model,
- scattered `if plan == "pro"` authorization logic,
- granting paid access from an unverified client redirect,
- assuming webhook delivery is exactly-once or complete,
- direct database edits as the routine billing repair process,
- building custom dunning/payment infrastructure before evaluating provider capabilities,
- using feature flags as the source of truth for paid entitlement,
- relying only on monthly cloud/provider bills to detect runaway variable cost,
- embedding current Apple/Google/Stripe policy details as timeless global rules,
- demanding complex billing machinery before the product actually accepts money.

## References

Current primary references and time-sensitive provider/platform notes are maintained in `docs/references.md`. Re-check them before implementation and release decisions.