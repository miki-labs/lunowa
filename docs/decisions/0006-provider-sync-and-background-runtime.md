# ADR 0006 — Provider Sync and Durable Background Runtime

## Status

Accepted — 2026-08-19
Terminology reconciled with Responsibility v0.1 — 2026-08-23

## Context

Lunowa must keep provider mailbox evidence synchronized while also executing durable product promises such as Temporal Contracts and Send Later.

The failure modes matter more than raw throughput:

- webhook/push notifications can be delayed, duplicated, missed, or reordered;
- provider cursors/subscriptions can expire;
- worker processes can restart;
- one trigger can race with new communication/evidence;
- a scheduled trigger can become stale after the user/evidence changes the Responsibility;
- AI results/jobs can complete against an older evidence revision;
- retries must not duplicate messages, sends, Responsibility effects, or resurfacing.

A browser timer, request lifetime, or in-memory scheduler cannot safely implement these promises.

Responsibility v0.1 adds another critical requirement: **processing order is not semantic chronology**, and background runtime is execution infrastructure rather than Responsibility authority.

## Decision

### Background runtime

Use Trigger.dev Cloud as the initial durable task/scheduling runtime once real background work begins.

Activation:

- Phase 1 fake UI: do not add it;
- Phase 3 Gmail: use for bounded sync/reconciliation/background work where useful;
- Phase 5: use durable scheduling/waits for Temporal Contracts and reuse the same durable execution boundary for Send Later when appropriate.

PostgreSQL/trusted domain state remains authoritative. Trigger.dev executes work; it does not own Responsibility state, evidence authority, Temporal Contract truth, or semantic chronology.

### Gmail synchronization

Use Gmail API with:

- `users.watch`;
- Cloud Pub/Sub notifications;
- persisted Gmail history cursor/state;
- `history.list` reconciliation;
- watch renewal and safety reconciliation.

Treat notifications as **signals to reconcile**, not complete/authoritative mailbox events.

### Microsoft synchronization

Use Microsoft Graph production APIs with:

- change notifications/webhooks for near-real-time signals;
- persisted delta state;
- message delta queries for authoritative reconciliation;
- lifecycle/missed-notification recovery where current Graph support warrants it.

Treat notifications as signals, not the only source of mailbox truth.

Provider-specific external details are time-sensitive and must be rechecked against current official documentation when implementation/release depends on them.

## Rationale

### Durable jobs are non-differentiating infrastructure

Building a correct custom queue/scheduler/retry/checkpoint system would consume substantial solo-development/operational effort without differentiating Lunowa.

The selected durable runtime fits TypeScript and Temporal Contract execution while avoiding premature custom queue infrastructure. Revisit the vendor only from real reliability/cost/operability evidence.

### Notification + reconciliation is safer than notification-as-truth

Use the pattern:

```text
push/webhook signal
    -> validate / acknowledge quickly
    -> durable sync task
    -> fetch provider changes using current cursor/token
    -> normalize/upsert idempotently
    -> commit evidence + new cursor
    -> advance evidence revision / enqueue relevant interpretation/reduction
```

This tolerates duplicates, delivery gaps, process restarts, and provider ordering differences better than applying Responsibility changes directly from notification payloads.

### Semantic chronology survives observed-order differences

A worker processing an event later does not make that evidence semantically newer.

For example:

```text
10:00 Friday due
10:05 explicit correction -> Monday
```

must remain Monday even if the 10:00 message is ingested after the correction.

Background work therefore preserves source semantic time/relation evidence and lets trusted reduction determine current state.

### Temporal Contract execution re-checks current truth

Before a scheduled trigger causes an effect, reload:

- contract version/status;
- current Responsibility/evidence revision;
- live tracking/attention state where relevant;
- trigger state;
- supersession/cancellation;
- relevant new provider/external evidence.

A stale trigger becomes a no-op/audited result, not an authority that restores old state.

### AI/background freshness

A queued/running AI interpretation may finish after newer evidence arrives.

If:

```text
AIResult.basis_evidence_revision != current evidence revision
```

it may be retained for diagnostics/eval but cannot mutate current Responsibility state.

Matching revision is necessary, not sufficient; normal validation/authority rules still apply.

## Required invariants

1. Valid webhook endpoints acknowledge quickly and defer non-trivial work.
2. Duplicate provider notifications do not duplicate Messages, Responsibilities, effects, triggers, or notifications.
3. Sync cursor/token advances only after corresponding local evidence is durably committed.
4. Expired/invalid cursor enters explicit recovery/resync, not silent ignore.
5. Task idempotency helps, but domain/database checks remain final guard.
6. Stale/superseded Temporal Contract trigger is a no-op with audit evidence.
7. SendOperation idempotency is separate from task-run idempotency; retries do not duplicate provider sends.
8. Background failure cannot erase drafts or evidence/cursors needed for recovery.
9. Observed/ingestion order never overrides semantic chronology by itself.
10. Provider notification body never directly mutates accepted Responsibility state.
11. Stale AI/job payload cannot roll back a newer evidence revision.
12. A trigger firing does not automatically mean notification, `FOLLOW_UP`, or `MY_TURN`; current evidence is re-evaluated first.
13. Cross-account processing never uses semantic similarity to merge Responsibilities across ConnectedAccounts automatically.

## Provider-specific implementation notes

When Gmail/Microsoft phases activate, follow current official provider guidance for watch/subscription expiration, offline authorization, delta/history reconciliation, retry/rate limits, and missed-notification recovery.

Do not treat the provider details recorded in the 2026-08-19 decision snapshot as permanent. The durable architecture decision is the **notification-signal + authoritative reconciliation** pattern.

## Alternatives considered

### Vercel Cron + database polling only

Not selected as primary Temporal Contract runtime. Periodic reconciliation can be a safety net, but custom per-user scheduling/retry/idempotency over cron adds orchestration work.

### Supabase Queues/Cron

Viable but not selected initially. Revisit only on actual reliability/cost/operability evidence.

### Inngest

Viable. Not selected initially; do not operate multiple job systems without evidence.

### Custom worker + Redis/BullMQ

Rejected initially. Adds Redis, worker hosting, queue operations, and custom scheduling before scale requires them.

### Provider polling without push

Not selected as normal path because latency/API usage is worse. Periodic polling/reconciliation remains a required safety mechanism, not sole architecture.

### Notification payload directly drives Responsibility state

Rejected. Notifications can be duplicated, incomplete, missed, reordered, provider-specific, and stale relative to current product state.

## Consequences

Positive:

- one durable background-execution model for sync/scheduling;
- explicit recovery/reconciliation paths;
- provider adapters remain thin/provider-specific;
- Temporal Contract reliability is independent of browser/server request lifetime;
- out-of-order/stale work is explicitly contained;
- Responsibility authority remains in trusted persisted evidence/domain state.

Costs/risks:

- another managed service once real background work activates;
- service/price behavior is an external dependency;
- provider webhook configuration adds operational work;
- reconciliation logic remains necessary;
- durable tasks do not eliminate domain complexity or stale-result races automatically.

## Evidence checked when originally accepted

Primary references included Trigger.dev durable waits/idempotency, Gmail push/history, Google offline OAuth, Microsoft Graph change notifications/delta/lifecycle notification guidance.

Those external capabilities are time-sensitive. Re-check official documentation at the relevant implementation/release gate rather than treating the original snapshot as permanent.
