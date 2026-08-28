# ADR 0006 — Provider Sync and Durable Background Runtime

## Status

Accepted — 2026-08-19  
Terminology reconciled with Responsibility v0.1 — 2026-08-23  
**Activation routing reconciled with current Product scope / Issue #58 — 2026-08-28**

The durable architecture decision in this ADR remains accepted. Historical phase labels from the original 2026-08-19 roadmap are **not current activation authority**. Current activation order is `docs/product/IMPLEMENTATION-GRAPH.md` + live GitHub Issues after Issue #58 merges.

## Context

Lunowa must synchronize provider mailbox evidence and execute durable Product promises such as Temporal reconsideration while tolerating:

- delayed/duplicated/missed/reordered provider notifications;
- expired provider cursors/subscriptions;
- process/worker restarts;
- races between new evidence and old scheduled work;
- stale AI/job results;
- retries that must not duplicate messages, Responsibility effects, external sends or user handoffs.

A browser timer, request lifetime or in-memory scheduler cannot safely implement those promises.

Responsibility v0.1 adds a critical rule: **processing order is not semantic chronology**, and background runtime is execution infrastructure rather than Responsibility authority.

## Decision

### Background runtime

Use Trigger.dev Cloud as the initial managed durable execution substrate **when the accepted implementation graph actually requires durable background work**.

PostgreSQL/trusted domain state remains authoritative. Trigger.dev executes attempts; it does not own Responsibility state, evidence authority, Temporal truth, semantic chronology, or external-effect idempotency.

Current Issue #58 routing:

- G20 may use durable execution for Gmail reconciliation/background work where it materially helps;
- G32 may use Trigger.dev for Temporal execution after DB/domain currentness contracts exist;
- G51 external Send reconciliation uses durable application/domain state and may use managed execution without granting the job system authority.

### Historical Send Later activation is superseded

The original ADR said a later phase could reuse this execution boundary for **Send Later**. Current canonical Product Feature Matrix now keeps Send Later **DEFERRED**, and Issue #58 does not place it on the Minimum Complete Delegation Loop critical path.

Therefore:

```text
durable execution capability
!= current Send Later Product activation
```

A future Send Later promotion requires a separately accepted Product/task contract covering durable permission, timing, edit/cancel semantics, idempotency and provider behavior. This ADR does not authorize it by itself.

### Gmail synchronization

Use Gmail API with:

- `users.watch`;
- Cloud Pub/Sub notifications;
- persisted Gmail history cursor/state;
- `history.list` reconciliation;
- watch renewal;
- periodic/safety reconciliation;
- stale-history full-sync recovery.

Treat notifications as **signals to reconcile**, not complete/authoritative mailbox events.

### Microsoft synchronization

Microsoft Graph remains an accepted future provider boundary using notification + delta reconciliation patterns where current Graph support warrants it. It is not a current one-provider v1 prerequisite.

Provider-specific details are time-sensitive and must be rechecked against current official documentation when implementation/release depends on them.

## Rationale

### Durable jobs are non-differentiating infrastructure

Building a correct custom queue/scheduler/retry/checkpoint system would consume substantial solo-development and operational effort without differentiating Lunowa. A managed durable runtime fits TypeScript and Temporal execution while avoiding premature custom queue infrastructure.

Revisit the vendor only from concrete reliability/cost/operability evidence.

### Notification + reconciliation is safer than notification-as-truth

Use the pattern:

```text
push/webhook signal
-> validate / acknowledge quickly
-> durable reconciliation task
-> fetch provider changes using current cursor/token
-> normalize/upsert idempotently
-> commit evidence
-> advance cursor only after required durability
-> enqueue relevant interpretation/reduction
```

This tolerates duplicates, delivery gaps, restarts and provider ordering differences better than applying Responsibility changes directly from notification payloads.

### Semantic chronology survives observed-order differences

A worker processing evidence later does not make it semantically newer. Trusted reduction uses source semantic chronology and accepted evidence revision, not queue completion order.

### Temporal execution re-checks current truth

Before a scheduled trigger causes an effect, reload current:

- contract/version/status;
- Responsibility/evidence revision;
- live tracking/attention state where relevant;
- trigger currentness;
- supersession/cancellation;
- relevant provider/external evidence.

A stale trigger becomes a no-op/audited result, not authority that restores old state.

### AI/background freshness

A queued AI interpretation may finish after newer evidence arrives. A stale basis may be retained for diagnostics/eval but cannot mutate current Responsibility state.

Matching evidence revision is necessary, not sufficient; normal authorization/provenance/semantic validation still applies.

## Required invariants

1. Valid webhook endpoints acknowledge quickly and defer non-trivial work.
2. Duplicate provider notifications do not duplicate Messages, Responsibilities, effects, triggers or handoffs.
3. Sync cursor/token advances only after corresponding local evidence is durably committed.
4. Expired/invalid cursor enters explicit recovery/resync, not silent ignore.
5. Vendor task idempotency helps, but domain/database checks remain final guard.
6. Stale/superseded Temporal trigger is a no-op with audit evidence.
7. SendOperation idempotency is separate from task-run idempotency; retries do not blindly duplicate provider sends.
8. Background failure cannot erase drafts or evidence/cursors needed for recovery.
9. Observed/ingestion order never overrides semantic chronology by itself.
10. Provider notification body never directly mutates accepted Responsibility state.
11. Stale AI/job payload cannot roll back a newer evidence revision.
12. Trigger fire does not automatically mean notification, `FOLLOW_UP`, or `MY_TURN`; current evidence is re-evaluated first.
13. Cross-account semantic similarity never auto-merges Responsibilities.
14. A durable execution capability does not activate a deferred Product feature.

## Provider-specific implementation notes

When provider/background nodes activate, follow current official guidance for watch/subscription expiration, offline authorization, delta/history reconciliation, retry/rate limits, missed-notification recovery and external-effect semantics.

Do not treat the provider/runtime details recorded at original acceptance as permanent. The durable architecture decision is:

> **external signal + durable attempt + authoritative reconciliation + domain currentness**.

## Alternatives considered

### Vercel Cron + database polling only

Not selected as primary Temporal runtime. Periodic reconciliation remains useful as a safety net.

### Supabase Queues/Cron / Inngest

Viable alternatives, not selected initially. Do not operate multiple job systems without evidence.

### Custom worker + Redis/BullMQ

Rejected initially. Adds infrastructure/operations before measured need.

### Provider polling without push

Not selected as normal path; periodic reconciliation still remains required as safety recovery.

### Notification payload directly drives Responsibility state

Rejected. Notifications can be duplicated, incomplete, missed, reordered, provider-specific and stale.

## Consequences

Positive:

- one managed durable execution boundary when needed;
- explicit recovery/reconciliation;
- provider adapters remain provider-specific and domain-thin;
- Temporal reliability is independent of browser/request lifetime;
- stale work is explicitly contained;
- deferred capabilities are not silently activated by infrastructure availability.

Costs/risks:

- another managed service once activated;
- service/price/behavior is external and changes;
- provider webhook configuration adds operations;
- reconciliation logic remains necessary;
- durable tasks do not remove domain complexity or stale-result races.

## Evidence posture

Original acceptance used then-current Trigger.dev, Gmail, Google OAuth and Microsoft Graph documentation. Those facts are time-sensitive. Issue #58 contains the current dated evidence snapshot; activation tasks recheck their own material vendor facts.
