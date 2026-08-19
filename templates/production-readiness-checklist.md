# Production Readiness Gate

Use before a material external/public/paid release. This is a router to the specialist blueprint documents, not a checklist requiring every capability for every product.

## Release context

- Product / release:
- Stage: Prototype / Internal Alpha / Private Beta / Public Free / Paid Production / Growth
- Major user/business/engineering risks:
- Accepted risks / explicit non-applicable areas:

## Delivery / platform

- [ ] Release/deployment is traceable to a source revision/build.
- [ ] Production secrets/data are separated from ordinary development and coding-agent contexts.
- [ ] Supported platforms/surfaces and authoritative build/release paths are explicit where material.
- [ ] Current vendor/store/toolchain/payment/privacy rules were re-checked when they can affect this release.
- [ ] Platform-critical behavior was actually verified on the required environment/device; unverified claims are explicit.

See `docs/platform-development.md`.

## Detect / contain / recover / repair

- [ ] Material user-impacting failures are observable enough to diagnose.
- [ ] Harmful releases/configuration can be rolled back, disabled, or forward-recovered.
- [ ] Authoritative non-reconstructable data has backup/restore behavior proportional to its value, and restore is tested when loss would be material.
- [ ] Material stuck/inconsistent state has a constrained repair path rather than routine broad database edits.
- [ ] Background/async work that can harm users/money/data has bounded retry and visible failure/stuck behavior.
- [ ] Alerts are actionable enough that a solo operator will not be trained to ignore them.

See `docs/reliability-operability.md`.

## Critical control planes

- [ ] Source/cloud/database/domain/payment/store/signing/identity/notification control planes use appropriate MFA/least privilege.
- [ ] A material solo-operated product can recover critical control-plane access without depending on one ordinary device/authenticator or undocumented memory where provider recovery mechanisms exist.
- [ ] Recovery codes/backup authenticators/non-replaceable signing material are stored outside routine development/agent contexts.
- [ ] Critical renewals/billing ownership (for example domain/developer program) will not silently expire.

See `docs/production-readiness.md` and `docs/security-privacy.md`.

## Security / privacy / account lifecycle

- [ ] Authentication/authorization and high-risk negative cases are verified where applicable.
- [ ] Account/session/recovery/link-unlink/deletion behavior is defined for durable accounts when relevant.
- [ ] Sensitive data, logs/analytics/support/backups/third parties, retention, and deletion behavior match the actual product promise/obligation.
- [ ] A threat model/security review was performed if the change introduces a material trust boundary or high-impact security risk.
- [ ] Abuse/resource limits exist where public actions can create material damage or cost.

See `docs/security-privacy.md`.

## Product operations

- [ ] Users have an appropriate support path for the release stage.
- [ ] Critical product analytics/events have explicit enough semantics to support the decision they are used for.
- [ ] Transactional communication is reliable enough when access/security/payment depends on it.
- [ ] Critical public user flows have accessibility expectations and relevant verification appropriate to platform/audience/stage.
- [ ] Legal/privacy/commercial review triggers were evaluated from actual product behavior; generated/template legal text was not accepted as proof of compliance.

See `docs/product-operations.md`.

## Monetization — only when taking money or controlling paid access

- [ ] Current distribution/payment constraints were checked.
- [ ] Payment/invoice, commercial/subscription, entitlement, and usage state authorities are explicit where independently meaningful.
- [ ] Provider events/webhooks/notifications are authenticated and safe under duplicate, delayed, stale, or out-of-order delivery.
- [ ] Cancellation/payment failure/refund/revocation/restore behavior is defined and testable according to product policy.
- [ ] Provider/internal commercial drift can be reconciled and repaired safely.
- [ ] Revenue-critical failures are observable/actionable.
- [ ] Metering is authoritative/reconcilable when money/access depends on usage.

See `docs/monetization-engineering.md`.

## AI product runtime — only when AI is part of delivered product behavior

- [ ] Material AI behavior has an evaluation/regression path appropriate to user/risk impact.
- [ ] Model output is validated before privileged/typed side effects.
- [ ] Tool/data access is least-privilege and authorization is enforced outside model instructions.
- [ ] Retrieval/memory respects user/tenant access, privacy, provenance, and deletion constraints where relevant.
- [ ] Material token/tool/iteration/time/concurrency/API cost is bounded outside prompts where practical.
- [ ] Provider/model failure and rollback/degraded behavior are understood.

See `docs/ai-product-runtime.md`.

## Stage decision

### Prototype

Do not block on production machinery unless it is required to validate the hypothesis. Prefer fake/manual/limited flows over prematurely operating real money, sensitive data, stores, or expensive autonomous AI.

### Private/Public

The relevant detect/recover/security/support/control-plane/cost boundaries above should be real, not aspirational.

### Paid Production

Commercial correctness, reconciliation/repair, support, critical control-plane recovery, and material restore/cost controls are release requirements where applicable.

### Growth

Do not add enterprise observability, SLOs, fraud platforms, multi-region, device farms, or advanced AI/eval infrastructure unless measured scale/risk earns their maintenance cost.

## Decision

- [ ] Material blockers resolved.
- [ ] Remaining material risks explicitly accepted or release scope reduced.

Decision: READY / NOT READY / READY WITH ACCEPTED RISKS

Notes:
