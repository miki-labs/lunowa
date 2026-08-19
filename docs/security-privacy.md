# Security and Privacy

Security and privacy are cross-cutting engineering requirements. They are not a final-stage audit and should be integrated into requirements, design, dependencies, implementation, verification, CI/CD, deployment, observability, incident response, and recovery.

This blueprint uses NIST SSDF and OWASP ASVS as major sources of security-engineering guidance, supplemented by platform/provider-specific security guidance.

## Core principles

### Minimize attack surface

Prefer architectures that reduce what must be trusted, exposed, stored, or operated.

- Do not possess sensitive data that the product does not need.
- Prefer mature, scoped services for security-critical capabilities when this reduces risk.
- Keep public endpoints and permissions minimal.
- Remove unused features, credentials, integrations, and privileges.

### Least privilege

Apply least privilege to:

- users and roles,
- application/service identities,
- database access,
- CI/CD tokens,
- cloud/IAM permissions,
- AI coding agents and tools,
- OAuth scopes,
- third-party integrations.

Default-deny is preferred where practical for sensitive access.

### Do not reinvent security-critical primitives

Custom cryptography, password hashing schemes, authentication protocols, session/token protocols, payment-card storage/processing, or secret-management systems require exceptional justification.

Prefer well-maintained standards-compliant implementations and official/mature providers.

## Authentication versus authorization

Authentication answers who the actor is. Authorization answers whether that actor may perform this operation on this specific resource.

Using a managed identity provider does not eliminate application authorization responsibilities.

Authorization SHOULD be enforced server-side at the appropriate resource/action boundary and verified with negative tests, including cross-user/cross-tenant access where applicable.

## Identity and account lifecycle

Authentication is not only a login endpoint. Where accounts or reusable sessions exist, design the identity lifecycle according to product risk.

Consider as applicable:

- account enrollment/verification,
- authenticator/credential binding and replacement,
- account recovery after loss or compromise,
- password/passkey/MFA changes,
- federated identity linking and unlinking,
- session creation, renewal, reauthentication and termination,
- revocation after suspected compromise,
- sensitive account changes such as email or recovery-channel changes,
- account suspension/closure/deletion and its effect on active sessions/authenticators.

Security-sensitive changes SHOULD require recent/repeated authentication when session possession alone is not strong enough evidence for the action.

Recovery MUST NOT silently become an easier path around normal authentication. Recovery and authenticator-change events SHOULD be observable to the user/operator when that materially reduces takeover risk.

Products SHOULD avoid identity transitions that can accidentally leave a legitimate user with no usable sign-in/recovery method unless the user explicitly accepts that outcome.

Use provider/platform lifecycle capabilities where they fit rather than recreating identity recovery or session security without need.

## Sensitive data and privacy

Before storing or transmitting sensitive data, define:

- why it is needed,
- where it flows,
- where it is stored,
- retention/deletion expectations,
- who/what can access it,
- whether it appears in logs, analytics, support tooling, backups, exports, or third-party services.

Collect and retain the minimum data required for the product purpose.

## Payment data

For ordinary SaaS products, prefer payment-provider-hosted/tokenized flows so raw card data does not pass through or persist in application systems unless there is a compelling, reviewed reason.

Do not store card verification codes after authorization.

Payment implementation must follow the current payment provider and PCI requirements applicable to the actual architecture.

See `docs/monetization-engineering.md` for commercial-state, entitlement, reconciliation, and economic-containment requirements.

## Secrets

Secrets MUST NOT be committed to source control.

Use an appropriate secret store/platform environment and:

- minimize secret scope,
- rotate credentials when exposure is suspected,
- prefer short-lived credentials/OIDC federation over long-lived cloud keys where supported,
- avoid exposing production secrets to development agents unless strictly required,
- prevent secrets from entering logs and artifacts.

Secret scanning/push protection or an equivalent control SHOULD be enabled where feasible.

## Dependency and supply-chain security

Treat packages, SDKs, build tools, container images, GitHub Actions, and transitive dependencies as executable supply-chain inputs.

Before adopting a significant dependency, consider:

- necessity and requirement fit,
- maintainer/project health,
- known vulnerabilities and security process,
- transitive dependency surface,
- license,
- provenance/release integrity when relevant,
- update strategy,
- replacement cost.

Use lockfiles and deterministic/versioned inputs where appropriate. Keep dependency vulnerability monitoring and security updates enabled where practical.

Pin third-party CI actions to immutable revisions when the platform supports it and the risk justifies the maintenance cost.

## Input and boundary validation

Validate untrusted or weakly typed input at system boundaries, including:

- HTTP/API input,
- external provider data,
- files/uploads,
- webhooks/events,
- database/generated data crossing trust boundaries,
- model/AI output before privileged actions.

Validation should be schema/contract driven where practical.

Output encoding/escaping must match the sink/context to reduce injection risks.

## Threat modeling

Threat modeling is risk-triggered, not required for every trivial change.

A threat model SHOULD be created or updated when work introduces or materially changes:

- authentication/authorization or account recovery,
- PII or sensitive data,
- payments,
- multi-tenancy,
- file uploads/content parsing,
- secrets/tokens,
- public endpoints,
- new external integrations,
- webhooks or inbound automation,
- new data stores,
- new trust boundaries,
- privileged/admin capabilities,
- major architecture changes.

Use `templates/threat-model.md`.

At minimum ask:

1. What are we building and what assets matter?
2. What can go wrong?
3. What controls/mitigations will we use?
4. How will we verify the controls?
5. What residual risk remains?

## Secure implementation defaults

Where relevant:

- use parameterized database access/ORM features safely rather than string-built queries,
- enforce authorization at trusted server boundaries,
- use secure session/cookie defaults,
- protect state-changing browser requests against applicable CSRF threats,
- use appropriate security headers,
- rate-limit abuse-prone endpoints,
- restrict file types/size/content handling,
- avoid dangerous deserialization/evaluation,
- fail closed for sensitive authorization decisions,
- do not expose stack traces or internal secrets to end users.

Project-specific controls should be mapped to the actual stack and threat model rather than copied blindly.

## Logging and monitoring

Security-relevant events SHOULD be observable when useful, such as repeated authentication failures, account recovery/authenticator changes, authorization denials, suspicious privilege changes, webhook verification failures, or unusual access patterns.

Do not trade privacy for observability. Logs should not contain raw credentials, tokens, payment data, or unnecessary message/content data.

## CI/CD and agent security

CI and coding agents are part of the threat model.

- Use least-privilege repository/cloud permissions.
- Restrict write/admin permissions to workflows that require them.
- Treat untrusted issue/PR content as potentially malicious input to agents.
- Avoid automatically executing arbitrary instructions from external content with privileged tools.
- Keep production credentials outside ordinary agent contexts.
- Review changes that alter workflows, permissions, authentication, authorization, secret handling, or deployment paths more strongly than routine code.

## Security verification

For relevant changes, combine controls such as:

- security-focused unit/integration tests,
- authorization negative tests,
- account/session lifecycle tests when high-risk,
- static application security testing,
- dependency/vulnerability scanning,
- secret scanning,
- config/IaC checks,
- dynamic/manual testing for high-risk flows,
- review against relevant OWASP ASVS requirements.

"Scanner green" is not proof of security. Security verification should reflect the actual threat model and behavior.

## Incident readiness

For material production systems, define how to:

- detect and contain compromise,
- revoke/rotate credentials and sessions,
- disable a compromised integration,
- restore known-good service/data,
- investigate while preserving necessary evidence,
- notify affected stakeholders when legally/contractually required.

Security incidents and near misses should feed improvements back into architecture, tests, permissions, monitoring, runbooks, and the agent harness.
