# Production Readiness

Production readiness asks whether a product can be operated safely and sustainably at its intended release stage. A successful build, test run, deploy, or store submission is not enough.

This document is primarily a **launch gate and router** to the specialist policies in this blueprint. Do not duplicate their full implementation guidance here.

## Core questions

Before meaningful public or paid usage, have explicit answers appropriate to the product risk:

- Can the product be deployed/released reproducibly and traced to a source revision?
- Are production credentials/data separated from ordinary development and coding-agent contexts?
- Which platforms/versions are actually supported and verified?
- Can material failures be detected and tied to an affected release/operation?
- Can harmful changes be contained, rolled back, or forward-recovered?
- Can authoritative non-reconstructable data be restored?
- Can inconsistent/stuck operational state be repaired safely?
- Can the solo operator recover access to critical control planes after device/authenticator/account loss?
- Can users reach support when the product is public or paid?
- Are external/provider failure and state-drift risks handled where material?
- Are legal/privacy/commercial interfaces consistent with actual product behavior?
- Are financially dangerous resource/AI/API paths bounded before public exposure?

Unknown answers to material questions are launch risks, not implicit acceptance.

## Delivery and environment baseline

For production-oriented repositories:

- application and important non-secret configuration SHOULD be versioned where practical,
- the integration branch SHOULD be protected by the canonical automated verification appropriate to repository risk,
- production credentials MUST remain outside source control,
- deployments/releases SHOULD be traceable to a revision/build identifier,
- production secrets and sensitive production data MUST be separated from ordinary development,
- direct ad-hoc production changes SHOULD be avoided where a safer reproducible path exists.

Use the fewest environments that reduce real risk. Local/development plus production may be enough for a simple product; preview/staging is conditional, not a maturity badge.

See `greenfield-bootstrap.md`, `verification-review.md`, and `platform-development.md`.

## Release, rollback, and compatibility

Material releases SHOULD be small enough to diagnose and contain.

For changes that can harm users, data, availability, money, or supported platforms, define a rollback, disable, or forward-recovery path before release.

Database/API/client changes should avoid unnecessary synchronized cutovers when backward-compatible or expand-migrate-contract evolution is practical.

Packaged/store releases may not support instant rollback. Their production plan SHOULD include the realistic recovery path: staged rollout, feature disable, server-side containment, replacement build, store withdrawal, or another platform-supported mechanism as appropriate.

## Platform and distribution readiness

If a product claims support for a browser, OS, device class, app store, or other distribution channel, production readiness includes that commitment.

Before material release:

- supported surfaces/versions SHOULD be explicit where ambiguity creates support or compatibility risk,
- the authoritative build/release path MUST be known,
- required signing/store credentials MUST be controlled and recoverable,
- platform-critical behavior SHOULD be verified on realistic environments/devices proportional to risk,
- current vendor SDK/store/payment/privacy requirements MUST be re-checked when they affect the release.

Do not claim a platform is verified merely because a framework can compile for it.

See `platform-development.md` and `monetization-engineering.md`.

## Critical control-plane access and solo-founder recovery

Treat these as production control planes when they can disable, compromise, bill, or block the product:

- source control,
- cloud/hosting/deployment,
- database,
- secrets/identity provider,
- domain registrar/DNS,
- payment provider,
- app-store/developer/signing accounts,
- email/notification provider,
- monitoring/analytics/support systems when operationally critical.

Apply least privilege and strong authentication/MFA where supported.

For a material public or paid product operated by one person, critical control planes **MUST have a recovery path that does not depend on possession of one ordinary device/authenticator or undocumented memory**, where the provider makes such recovery possible.

The minimum practical control may include:

- securely stored recovery codes or backup authenticators,
- provider-supported account recovery methods,
- current recovery email/phone/contact details,
- safe custody/recovery of signing or other non-replaceable credentials,
- an inventory of the few accounts whose loss could stop production or revenue,
- renewal/billing ownership for domains, developer programs, or other expiring critical resources.

Do not weaken account security by sharing root credentials merely to create redundancy.

Recovery material itself is sensitive and SHOULD be stored outside routine coding-agent/development contexts.

## Observability and actionable alerts

Before meaningful production traffic, material failures SHOULD be centrally visible enough to diagnose and act on.

At minimum, make the relevant subset observable:

- unhandled application failures,
- critical request/user-flow failures,
- failed/stuck background work,
- critical dependency/provider failures,
- affected release/build/configuration,
- commercial or AI-runtime failures when those are material domains.

Alerts SHOULD correspond to user/business impact or a plausible operator action. A solo operator should not be trained to ignore the system by low-value alert volume.

See `reliability-operability.md`, `monetization-engineering.md`, and `ai-product-runtime.md`.

## Data recovery

Identify authoritative, non-reconstructable production data.

When loss would be material:

- backups MUST or SHOULD exist according to risk,
- retention/protection SHOULD be defined,
- the restore procedure MUST be knowable,
- recovery SHOULD be exercised at a frequency appropriate to the loss impact.

A backup is not trusted merely because a provider reports that it exists.

Deletion/privacy semantics must also account for backups, replay/import, and downstream processors where required or promised.

See `reliability-operability.md` and `security-privacy.md`.

## Operational repairability

Public or paid systems that can enter materially harmful inconsistent/stuck states SHOULD have a constrained repair path before such incidents become common support work.

Examples include:

- stuck jobs,
- failed external synchronization,
- partial migration state,
- inconsistent account/access state,
- corrupted derived state,
- commercial/entitlement drift.

The repair mechanism may be a narrow script, internal endpoint, provider workflow, replay/reconciliation job, or other minimal tool. Broad direct production-database editing should not be the normal support strategy.

See `reliability-operability.md`; money/access repair has additional requirements in `monetization-engineering.md`.

## Security, privacy, and abuse readiness

Before public exposure, apply the controls required by the actual attack/data surface rather than a generic enterprise checklist.

At minimum when relevant:

- authenticate/authorize at trusted boundaries,
- protect secrets and production access,
- validate untrusted input,
- constrain abuse-prone endpoints/actions,
- threat-model high-risk changes,
- define account/session/data lifecycle,
- keep disclosures consistent with actual collection/use/retention,
- know the emergency action for compromised credentials/integrations.

See `security-privacy.md`.

## Cost and capacity readiness

Identify paths where legitimate use, abuse, bugs, retries, jobs, external APIs, managed builds, storage, or AI/model execution can create material cost faster than a human can respond.

Use budgets/alerts for visibility, but use quotas, bounds, concurrency/rate limits, circuit breakers, or hard execution limits where after-the-fact alerts would be too slow.

See `reliability-operability.md`, `monetization-engineering.md`, and `ai-product-runtime.md`.

## Support readiness

A public or paid product SHOULD expose a user-visible support path. Initially this can be a simple support email.

Support should be able to gather the minimum diagnostic evidence and invoke safe repair/containment paths without requiring routine broad administrative access or collection of unnecessary personal data.

Commercial incidents require the additional inspection/repair capabilities in `monetization-engineering.md`.

## Stage gates

### Prototype

Minimum intent:

- reproducible local execution,
- minimal verification sufficient for the hypothesis,
- no unnecessary real sensitive data,
- no production-grade platform/operations machinery unless the hypothesis requires it,
- no unsupported platform commitments merely because the stack can target them.

Real billing, durable accounts, production data, or expensive AI execution should be omitted unless they are part of what is being validated.

### Internal alpha

Add according to the tested surface:

- canonical verification/CI,
- controlled access,
- separation of production-like secrets/data,
- useful logs/errors,
- explicit build/test path,
- basic AI behavior/tool/cost controls if AI is material.

### Private beta

Before external users depend on the product, usually require:

- HTTPS/production distribution appropriate to the surface,
- centralized error visibility,
- backup strategy for authoritative data,
- support path,
- realistic verification of critical flows,
- understood account/session recovery when reusable accounts matter,
- basic product analytics for the critical value hypothesis,
- privacy disclosure consistent with actual data handling,
- constrained cost/abuse exposure where material.

### Public free

Require according to product risk:

- security/privacy hardening for the real attack/data surface,
- actionable production monitoring,
- incident containment/recovery path,
- account/data lifecycle behavior,
- current platform/store requirements checked,
- critical control-plane recovery,
- safe repair for material stuck/inconsistent state,
- hard bounds on economically dangerous public execution.

### Paid production

In addition to Public Free readiness:

- current payment/distribution constraints checked,
- explicit commercial-state authorities,
- correct entitlement/usage behavior,
- verified/idempotent asynchronous provider events,
- reconciliation and constrained repair,
- cancellation/payment-failure/refund/revocation semantics,
- revenue-critical observability,
- authoritative metering when money/access depends on usage,
- support capable of resolving commercial incidents,
- verified restore for material non-reconstructable data,
- critical control-plane/account recovery,
- repeatable supported-platform release paths.

See `monetization-engineering.md` for the full paid-product gate.

### Growth

Add only when scale/risk produces evidence for them:

- broader SLOs/observability,
- more automated reconciliation/repair,
- expanded device/browser matrices,
- advanced fraud/abuse controls,
- richer AI evaluation/safety infrastructure,
- experimentation/data infrastructure,
- stronger supply-chain assurance,
- operational specialization.

Growth is not a requirement to adopt microservices, Kubernetes, multi-region active-active, a SIEM, 24/7 formal on-call, or enterprise governance.

## Final launch review

Before a material release, answer the relevant subset:

- Can we detect a material failure and identify the affected release/configuration?
- Can we contain, roll back, disable, or forward-recover?
- Can we restore authoritative data?
- Can we safely repair likely harmful stuck/inconsistent states?
- Can the operator recover access to critical control planes?
- Are supported platforms/releases actually reproducible and verified?
- Are current external/store/provider constraints checked where necessary?
- Are security/privacy/account lifecycle controls proportional to the real risk?
- Can users reach support?
- Are material commercial states and external drift reconcilable?
- Are materially dangerous resource/AI/API costs bounded?

If the answer to a material question is unknown, either resolve it, explicitly accept the risk, or reduce the release scope.
