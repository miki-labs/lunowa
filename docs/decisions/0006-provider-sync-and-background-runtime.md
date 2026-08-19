# ADR 0006 — Provider sync and durable background runtime

## Status

Accepted — 2026-08-19

## Context

Lunowa must keep provider mailbox state synchronized while also executing durable product promises such as Temporal Contracts and Send Later.

The failure modes matter more than raw throughput:

- webhook/push notifications can be delayed, duplicated, or missed;
- provider cursors/subscriptions can expire;
- worker processes can restart;
- one trigger can race with another event;
- a scheduled trigger can become stale after the user changes/completes the Action Item;
- retries must not duplicate messages or state transitions.

A browser timer, Vercel request lifetime, or in-memory scheduler cannot safely implement these promises.

## Decision

### Background runtime

Use Trigger.dev Cloud as the initial durable task/scheduling runtime once real background work begins.

Activation:

- Phase 1 fake UI: do not add it.
- Phase 3 Gmail: use it for bounded sync/reconciliation/background work where needed.
- Phase 5: use durable scheduling/waits for Temporal Contracts and reuse the same durable execution boundary for Send Later if appropriate.

The PostgreSQL database remains authoritative for product state. Trigger.dev runs execute work; they do not own lifecycle or Temporal Contract truth.

### Gmail synchronization

Use the Gmail API with:

- `users.watch`;
- Google Cloud Pub/Sub push notifications;
- persisted Gmail `historyId` cursor/state;
- `history.list` for incremental reconciliation;
- periodic watch renewal and safety reconciliation.

Treat Pub/Sub notifications as signals to reconcile, not as complete/authoritative mailbox events.

### Microsoft synchronization

Use Microsoft Graph **v1.0** with:

- change notifications/webhooks for near-real-time signals;
- persisted delta state tokens;
- message delta queries for incremental authoritative reconciliation;
- lifecycle notifications for missed/removed/reauthorization cases where supported.

Treat Microsoft notifications as signals to reconcile, not the only source of mailbox truth.

## Rationale

### Durable jobs are non-differentiating infrastructure

Building a correct custom queue/scheduler/retry/checkpoint system would consume substantial implementation and operational effort without differentiating Lunowa.

Trigger.dev currently provides durable waits and task-level idempotency in the TypeScript ecosystem. This directly matches the Temporal Contract execution problem while preserving an open-source/self-host option later if justified.

### Notification + reconciliation is safer than notification-as-truth

Both Gmail and Microsoft provide change-notification mechanisms, but their official guidance includes expiration/missed-notification recovery paths and incremental reconciliation APIs.

Lunowa therefore uses:

```text
push/webhook signal
    -> acknowledge quickly
    -> durable sync task
    -> fetch provider authoritative changes using cursor/token
    -> normalize idempotently
    -> commit data + new cursor
```

This pattern tolerates duplicates, retries, webhook delivery gaps, and process restarts better than applying state directly from the notification body.

### Temporal Contract execution re-checks database truth

A scheduled job can become obsolete.

Before firing a Temporal Contract transition/resurface action, the job must re-read:

- contract version/status;
- Action Item state;
- trigger status;
- supersession/cancellation;
- relevant new provider event state.

Only current authoritative state may cause the transition.

## Required invariants

1. Webhook endpoints acknowledge valid provider notifications quickly and defer non-trivial work.
2. Duplicate provider notifications do not create duplicate messages/transitions.
3. Sync cursor/token is advanced only after the corresponding normalized changes are durably committed.
4. An expired/invalid cursor enters an explicit recovery/full-resync path; it is not silently ignored.
5. Trigger/job idempotency keys reduce duplicate execution, but domain/database checks remain the final guard.
6. A stale/superseded Temporal Contract trigger is a no-op with audit evidence, not an error that mutates current state.
7. Send-operation idempotency is separate from task-run idempotency; worker retries must not produce duplicate provider sends.
8. Background-run failure cannot erase user drafts or provider cursor evidence required for recovery.

## Gmail-specific current constraints

Current Google documentation states:

- `watch` returns the current `historyId` and expiration;
- `watch` must be renewed at least every 7 days;
- Google recommends daily renewal;
- server-side/background access requires OAuth offline access/refresh handling.

The implementation should therefore maintain explicit per-account watch expiration and renewal state and a periodic reconciliation path.

## Microsoft-specific current constraints

Current Microsoft Graph documentation supports message delta on v1.0 and lifecycle notifications for Outlook message subscriptions, including missed notifications and removed subscriptions.

On missed-notification recovery, resynchronize using delta/full resource synchronization as required by current Microsoft guidance.

## Alternatives considered

### Vercel Cron + database polling only

Not selected as the primary Temporal Contract runtime. It can be useful as a periodic reconciliation safety net, but building all durable per-user scheduling/retries/idempotency on top of cron would add custom orchestration work.

### Supabase Queues/Cron

Viable, but not selected. The current Trigger.dev fit provides durable TypeScript task/wait semantics with less custom consumer/scheduler glue for Lunowa's use case.

### Inngest

Viable. Trigger.dev was selected because its explicit durable wait/checkpoint and idempotency model maps cleanly to Temporal Contracts. Revisit only on real reliability/cost/operability evidence.

### Custom worker + Redis/BullMQ

Rejected initially. It introduces Redis, worker hosting, deployment, queue operations, and custom scheduling before scale requires them.

### Provider polling without push

Not selected as the normal path because it increases latency/API usage. Periodic polling/reconciliation remains a required safety mechanism, not the sole synchronization architecture.

## Consequences

Positive:

- one durable background execution model for sync/scheduling;
- explicit recovery paths;
- provider adapters remain thin and provider-specific;
- Temporal Contract reliability does not depend on browser/server process lifetime.

Costs/risks:

- another managed service once Phase 3 begins;
- Trigger.dev service/price changes are an external dependency;
- provider webhook setup and verification add operational configuration;
- reconciliation logic is still required; durable tasks do not eliminate domain complexity.

## Evidence checked

- Trigger.dev durable wait: https://trigger.dev/docs/wait-until
- Trigger.dev idempotency: https://trigger.dev/docs/idempotency
- Trigger.dev pricing: https://trigger.dev/pricing
- Gmail push/watch: https://developers.google.com/workspace/gmail/api/guides/push
- Google OAuth offline access: https://developers.google.com/identity/protocols/oauth2/web-server
- Microsoft Graph change notifications: https://learn.microsoft.com/en-us/graph/change-notifications-overview
- Microsoft Graph message delta v1.0: https://learn.microsoft.com/en-us/graph/api/message-delta?view=graph-rest-1.0
- Microsoft Graph lifecycle notifications: https://learn.microsoft.com/en-us/graph/change-notifications-lifecycle-events
