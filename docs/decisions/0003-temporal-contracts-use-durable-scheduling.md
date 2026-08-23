# Decision 0003 — Temporal Contracts Use Durable Scheduling

## Status

Accepted — 2026-08-19  
Amended / reconciled with Responsibility v0.1 — 2026-08-23

## Context

A core Lunowa promise is that communication can leave the user's current attention when appropriate and be reconsidered reliably at the right time or event.

Examples:

- return at a scheduled time;
- reconsider earlier if the other party replies;
- re-evaluate near a source deadline;
- after a waiting threshold, make a USER follow-up action current when the original outcome is still unresolved.

If this behavior is implemented with browser/process-memory timers or best-effort callbacks without durable state, restart/outage can silently break the trust promise.

Responsibility v0.1 also clarified two semantic boundaries:

```text
Temporal Contract / attention defer != communication hold
trigger fires != automatic notification or lifecycle value
```

A hold such as `法務確認が終わるまで止めてください` may keep a Responsibility open while waiting on another party/event. It does not automatically mean `LATER`.

Likewise, a no-reply threshold does not move a Responsibility into a canonical `FOLLOW_UP` lifecycle state. The trigger causes current evidence to be re-evaluated; if renewed user action is appropriate, the Responsibility projects `MY_TURN` with a follow-up action/reason.

## Decision

A Temporal Contract is persisted domain intent with persisted executable triggers.

Time-based and send-later execution use a **durable scheduling/background-work mechanism** satisfying:

- persisted intent;
- idempotent trigger processing;
- contract/trigger version validation;
- current Responsibility/evidence re-check before effects;
- bounded retry;
- cancellation/supersession;
- overdue reconciliation after downtime;
- observable failure state;
- audit evidence explaining why attention/actionability changed.

The scheduler executes current persisted intent. It is infrastructure, not the authority for Responsibility truth.

It must not ask an LLM at wake-up time whether the original promise existed, and it must not mutate Responsibility state ad hoc from stale job payload.

## Initial trigger set

Initial semantic trigger families:

```text
TIME
REPLY_RECEIVED
DEADLINE
```

Additional triggers require validated product need.

A trigger firing means:

```text
load current contract + Responsibility/evidence
→ validate current version/status
→ claim idempotently
→ re-evaluate current semantics
→ apply legitimate attention/actionability/domain effects
→ record resurfacing/audit evidence
→ update/cancel stale sibling triggers
```

It does **not** automatically mean:

```text
send notification
set lifecycle = FOLLOW_UP
set projection = MY_TURN
```

Those outcomes depend on the current Responsibility and separate attention/notification policy.

## Attention/resurfacing distinction

**Resurface does not always mean interrupt.**

The contract determines when an item should be reconsidered. A separate Attention Policy determines whether that produces:

- quiet state update;
- list visibility;
- promotion into an attention list;
- user notification.

`LATER` is an attention projection backed by intentional defer semantics. A passive Waiting Responsibility may have follow-up triggers without being `LATER`.

## Alternatives considered

### Browser / in-memory timers

Rejected for user-visible promises because they fail across tab closure, process restart, deploy, worker crash, and device changes.

### Periodic cron with no persisted per-contract intent

Insufficient as the full contract. Periodic scanning may be an implementation detail, but durable per-contract/trigger state and idempotent processing remain required.

### Persist `FOLLOW_UP` as a lifecycle state because a timer fired

Superseded by Responsibility v0.1. Follow-up is normally a current action/reason produced after re-evaluation of an unresolved waiting loop.

### Treat a communication hold as a Temporal Contract defer

Rejected as a semantic shortcut. Communication hold and product attention defer are orthogonal; both can coexist but neither implies the other.

### General workflow engine from the start

Rejected. Use the smallest mature durable scheduling capability satisfying the reliability contract. Do not introduce generic workflow infrastructure merely because conditional transitions exist.

## Consequences

Positive:

- user-visible return promises survive restarts/outages;
- multi-device behavior has server-side durable intent;
- duplicate trigger delivery can be handled safely;
- support/debug can explain why a Responsibility resurfaced or became actionable;
- Send Later can reuse the same durability principles;
- follow-up/actionability remains aligned with current evidence rather than stale timer assumptions.

Trade-offs:

- durable job/scheduler infrastructure is required before trusting Temporal Contract automation;
- reconciliation/observability tests are necessary;
- implementation must keep Responsibility resolution, attention, trigger state, and notification strength separate.

## Verification implications

At minimum test:

- duplicate trigger delivery;
- trigger cancellation/update before fire;
- contract version race;
- downtime and overdue reconciliation;
- reply arrives before scheduled threshold;
- reply and timer race;
- Responsibility resolves before stale trigger executes;
- historical/stale job payload cannot restore old state;
- waiting threshold creates follow-up action only if current evidence still warrants it;
- trigger firing does not imply notification by itself.

## Revisit when

The concrete scheduler/background technology may change without revisiting this ADR as long as durability, idempotency, current-state validation, reconciliation, and semantic separation remain satisfied.