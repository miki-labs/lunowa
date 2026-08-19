# Threat Model

Use when security/privacy triggers in `docs/security-privacy.md` apply. Keep it proportional to risk.

## Scope

What feature/system/change is being modeled? What is explicitly out of scope?

## Assets

What must be protected?

Examples: account identity, authorization state, email/message content, tokens, payment state, secrets, tenant data, availability, audit integrity.

## Actors / external entities

List users, admins, providers, webhooks, background workers, external services, attackers, support systems, etc.

## Data flow

Describe or diagram:

- entry points,
- internal components,
- data stores,
- external systems,
- sensitive data flows.

## Trust boundaries

Where does data/authority cross from a less-trusted to a more-trusted context?

## Sensitive data inventory

For each sensitive item, note:

- why it is needed,
- where it is stored/transmitted,
- who can access it,
- retention/deletion,
- logs/analytics/backups/third-party exposure.

## Threats

For each material threat, describe:

### Threat

What can go wrong?

### Preconditions / attack path

How could it happen?

### Impact

What is the user/business/security consequence?

### Mitigation / control

What prevents, detects, contains, or recovers from it?

### Verification

What test, review, static check, monitoring, or manual verification demonstrates the control?

### Residual risk

What remains after the mitigation?

## Abuse / failure cases to consider

Use only those relevant:

- authentication bypass/account takeover,
- broken object/function authorization,
- cross-tenant access,
- token/secret theft,
- replay/duplicate requests,
- injection/untrusted content,
- file upload/parser attacks,
- SSRF/outbound request abuse,
- webhook forgery/replay,
- rate-limit/resource exhaustion,
- provider compromise/outage,
- dependency/supply-chain compromise,
- sensitive-data leakage through logs/analytics/errors,
- malicious or prompt-injected content reaching privileged AI agents,
- destructive/admin actions,
- backup/export leakage.

## Security acceptance criteria

- [ ]

## Incident / recovery notes

How would we detect, contain, rotate/revoke, disable, restore, or recover if the highest-impact threat occurred?

## Review status

- Owner/reviewer:
- Date:
- Status: Draft / Accepted / Superseded
