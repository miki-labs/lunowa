# Decision 0003 — Temporal Contracts Use Durable Scheduling

## Status

Accepted — 2026-08-19

## Context

A core Lunowa promise is that a communication can leave the user's active attention and reliably return at the right time or event.

Examples:

- return at 9:00 on a specified date;
- return earlier if the other party replies;
- re-evaluate near a deadline;
- move from waiting to follow-up after a condition.

If this behavior is implemented with browser timers, process-memory timers, or best-effort callbacks without durable state, a restart/outage could silently break the product's trust promise.

## Decision

A Temporal Contract is persisted domain state with persisted executable triggers.

Time-based and send-later execution must use a **durable scheduling/background-work mechanism** with:

- persisted intent;
- idempotent trigger processing;
- contract/trigger version validation;
- bounded retry;
- cancellation/supersession;
- overdue reconciliation after downtime;
- observable failure state;
- audit evidence for why resurfacing occurred.

The scheduler executes current persisted intent. It must not rely on an LLM at wake-up time to decide whether the original promise existed.

## Initial trigger set

MVP contract types:

- `TIME`
- `REPLY_RECEIVED`
- `DEADLINE`

Additional triggers should be added only when they solve validated product needs.

## Alternatives considered

### Browser / in-memory timers

Rejected for user-visible promises because they fail across tab closure, device changes, process restarts, deploys, and worker crashes.

### Simple periodic cron with no persisted per-contract state

Insufficient as the full model. Periodic scanning may be a valid implementation detail for a durable scheduler/reconciler, but persisted trigger state and idempotent processing remain required.

### General workflow engine from the start

Not required. Use the smallest mature durable job/scheduling capability that satisfies the reliability contract. Do not introduce a complex workflow platform solely for architectural fashion.

## Consequences

Positive:

- Temporal Contract promises survive restarts/outages;
- multi-device behavior has a server-side authority;
- duplicate trigger delivery can be handled safely;
- support/debug can explain why an item resurfaced;
- Send Later can reuse the same reliability principles.

Trade-offs:

- requires durable job/scheduler infrastructure earlier than a purely visual prototype;
- needs reconciliation and observability tests;
- implementation must distinguish trigger firing from notification strength.

## Critical distinction

**Resurface does not always mean interrupt.**

The contract determines when the item should be reconsidered. A separate Attention Policy determines whether that results in a quiet state update, list promotion, attention-list placement, or notification.

## Revisit when

The concrete scheduler technology can change without revisiting this decision as long as the durability/idempotency/reconciliation contract remains satisfied.