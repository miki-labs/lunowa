# Reliability and Operability

Reliable software assumes that dependencies, networks, messages, configuration, deployments, humans, and code will sometimes fail. Operable software makes those failures observable, diagnosable, containable, recoverable, and safely repairable.

## Failure is part of the contract

Do not treat every failure as a generic exception. Where relevant, distinguish categories such as:

- invalid input,
- unauthenticated/unauthorized access,
- expected absence/not-found,
- conflicts and concurrency,
- transient network/dependency failure,
- rate limiting and overload,
- permanent dependency rejection,
- invariant violation/internal bug,
- data corruption/inconsistency.

Callers and operators should be able to distinguish failures that require user correction, retry, degradation, repair, escalation, or incident response.

## Remote calls require known bounds

Remote calls can hang. Define explicit timeout/cancellation behavior when the underlying stack does not already provide a safe known bound.

Timeouts should reflect expected latency, user experience, dependency characteristics, and downstream resource cost rather than arbitrary large constants.

## Retries must be bounded, selective, and owned

Retries can improve resilience for transient faults, but can also amplify outages, duplicate side effects, and multiply cost.

A retry policy SHOULD define:

- which failures are retryable,
- maximum attempts and/or elapsed time,
- backoff strategy,
- jitter where synchronized retries can create load spikes,
- retry ownership so multiple layers do not multiply retries invisibly,
- final-failure behavior.

Do not retry validation errors, authorization failures, or clearly permanent failures merely because an operation failed.

## Idempotency and duplicate delivery

Before retrying or replaying a side-effecting operation, determine whether repetition is safe.

Use the smallest suitable mechanism, such as:

- idempotency keys,
- deduplication identifiers,
- unique constraints,
- compare-and-set/version checks,
- explicit operation state,
- transactional outbox/inbox patterns when their complexity is justified.

At-least-once delivery, webhook redelivery, client retry after a lost response, queue replay, support-triggered repair, and worker retry can all produce duplicates.

## Backpressure and bounded work

Where material, bound:

- queue depth,
- concurrent work,
- batch size,
- retry volume,
- request/payload/file size,
- memory/cache growth,
- fan-out,
- external API/model/tool usage.

Prefer controlled rejection, load shedding, deferred work, or degraded functionality over uncontrolled resource exhaustion or runaway spend.

## Background and asynchronous work lifecycle

Background jobs, queues, schedulers, event handlers, and long-running workflows need an explicit lifecycle when failure can affect users, money, data integrity, or material cost.

Define as applicable:

- job/work identity and deduplication semantics,
- who owns retries and how they are bounded,
- idempotency of repeated execution,
- timeout/cancellation behavior,
- visibility into queued/running/succeeded/failed/stuck work,
- poison-message/permanent-failure handling,
- dead-letter/quarantine/manual-intervention behavior when useful,
- restart/crash behavior,
- ordering/concurrency requirements,
- safe replay/backfill behavior and bounds,
- cleanup/retention of job state.

A queue existing is not evidence that work will eventually succeed. Material stuck or permanently failing work SHOULD become visible within a response window appropriate to its impact.

Do not add a dedicated queue, workflow engine, or dead-letter infrastructure merely because asynchronous processing exists. Use the smallest mechanism that makes the actual lifecycle correct and recoverable.

## Graceful degradation

A dependency outage should not automatically destroy unrelated product behavior.

When valuable and safe, preserve unaffected capabilities using stale/last-known data, partial functionality, delayed work, or explicit degraded states.

Degradation MUST NOT bypass authorization, corrupt data, silently violate commercial entitlements, or create misleading success.

## Data integrity and partial failure

Multi-step and distributed operations can partially succeed. Consider:

- transaction boundaries,
- ordering,
- compensating actions where required,
- duplicate events,
- concurrent updates,
- crash/restart behavior,
- migration compatibility,
- recovery from partially completed operations.

Prefer invariant-preserving failure to silently inconsistent success.

## Configuration is production input

Configuration can break a product as effectively as code.

Important configuration SHOULD have, as appropriate:

- validation/schema,
- safe defaults,
- documented ownership,
- controlled rollout for high-risk changes,
- version control for non-secret configuration where useful,
- a known-good fallback or recovery path for critical settings.

Secrets require separate controls and MUST NOT be committed to the repository.

For critical provider/dashboard configuration that cannot reasonably be represented as code, document enough ownership and recovery information that one person's memory is not the only reconstruction path.

## Observability

A production system should make it possible to answer the questions that matter to its failure modes:

- Is it healthy enough for users?
- Which users/operations are affected?
- What changed?
- Which dependency, job, release, or operation is failing?
- Is latency/error/queue/cost behavior abnormal?
- Can a specific request/job/operation be correlated far enough to diagnose it?

Use the smallest useful combination of:

- structured logs,
- error reporting,
- health/readiness signals,
- metrics,
- correlation/request/job/operation identifiers,
- distributed tracing when complexity justifies it.

Do not log secrets, credentials, payment data, or unnecessary sensitive content. Treat telemetry as data with access, privacy, retention, and cost implications.

Alerts SHOULD correspond to material impact or a plausible operator action. Avoid alerting on every internal anomaly simply because it can be measured.

## Operationally useful errors

Errors should contain enough context to diagnose the failure without exposing secrets or sensitive internals to end users.

Separate user-facing messages from operator/debug context where necessary.

## Operational repairability

Some failures leave state inconsistent or stuck even after the underlying bug or provider outage is fixed. If such states can materially harm users, money, access, or data, production readiness requires a practical repair path.

A material repair mechanism SHOULD or MUST according to risk:

- target the smallest possible scope/account/object,
- validate the object and preconditions before mutation,
- avoid broad unrestricted production access when a narrower path is feasible,
- be idempotent or safely repeatable when practical,
- support preview/dry-run/diff when destructive ambiguity is material,
- verify postconditions after repair,
- retain enough evidence of high-impact repairs to diagnose mistakes or disputes,
- fail safely when the expected state has changed concurrently.

Suitable implementations may be a constrained script, authenticated internal endpoint, provider-dashboard workflow, admin action, replay/reconciliation job, or another minimal tool appropriate to the risk.

Do not make broad ad-hoc production database edits the normal recovery path. Emergency direct edits may occasionally be necessary, but they should be exceptional, narrowly scoped, backed up or reversible where practical, and followed by verification.

Common repair cases include:

- stuck background work,
- inconsistent derived state,
- partial migrations,
- failed external synchronization,
- orphaned resources,
- account/access inconsistencies,
- commercial/entitlement mismatches handled more specifically by `monetization-engineering.md`.

## Deployment and reversibility

Design changes with rollout and recovery in mind.

Prefer:

- small releases,
- backward-compatible schema/API evolution,
- expand-migrate-contract for risky schema changes,
- feature flags only when they genuinely reduce rollout risk and have cleanup ownership,
- staged rollout/canary only when blast radius warrants it,
- automated rollback or clear manual rollback/forward-recovery for important systems.

Do not delete old schema/data paths before the new path is sufficiently proven when reversibility is valuable.

## Backup and restore

For valuable, non-reconstructable user/business data, define according to risk:

- what is backed up,
- retention,
- recovery-point expectations,
- recovery-time expectations when useful,
- restoration procedure,
- periodic restore verification.

A backup that has never been restored is an unverified assumption. Recovery confidence comes from exercising the recovery path, not from backup existence alone.

## Runbooks and playbooks

Document the few operational procedures that are difficult or risky to reconstruct during an incident, such as:

- rollback/forward recovery,
- database restore,
- credential/key rotation,
- disabling a compromised integration or runaway feature,
- provider outage handling,
- recovering stuck background processing,
- invoking a high-impact repair tool.

Automate frequent deterministic procedures when automation reduces error and maintenance cost. Do not import large-team incident ceremony merely to have a process document.

## Incident learning

After a material incident or near miss, ask:

- What allowed the failure?
- Why was it not detected earlier?
- What made diagnosis, containment, recovery, or repair slow?
- Which type/schema/test/alert/runbook/permission/architecture/tool/harness change would prevent recurrence?

Only add durable process when the failure mode is sufficiently general to justify its ongoing cost.
