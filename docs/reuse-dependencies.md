# Reuse and Dependency Policy

The default is to avoid rebuilding solved, non-differentiating capabilities. The goal is not maximum reuse; it is the lowest safe lifecycle cost for the required behavior.

## Default search order

Before substantial custom implementation, evaluate in this order when relevant:

1. existing implementation in the repository,
2. framework/platform standard capability,
3. official SDK/API,
4. existing design-system component/template,
5. mature maintained OSS,
6. appropriate managed service,
7. thin adapter around an existing solution,
8. custom implementation.

This order is a heuristic, not a rule that forces a worse solution.

## Distinguish reuse modes

Do not collapse all external-code use into "use the library."

Possible choices include:

- **Install/Use** — depend directly on the project/package/service.
- **Adapt** — add a thin compatibility/configuration layer.
- **Extend** — use supported extension/plugin points while retaining upstream behavior.
- **Reference** — learn from an implementation/specification without depending on it.
- **Reimplement** — independently implement the required behavior when direct use is unsuitable and legally/technically appropriate.
- **Build custom** — create product-owned implementation because it is core differentiation or has a better lifecycle trade-off.

When a task explicitly requires a particular OSS/component/template, do not silently replace it with a similar custom implementation.

## Dependency decision criteria

A non-trivial dependency or managed service SHOULD be evaluated for:

### Requirement fit

- Does it solve the actual problem rather than an adjacent one?
- How much unused complexity does it introduce?
- Can the needed behavior be achieved by existing platform capabilities?

### Maintenance and maturity

- Is it actively maintained?
- Is the API reasonably stable?
- Are releases/security fixes timely?
- Is the project dependent on one abandoned maintainer or fragile infrastructure?

### Security and supply chain

- Known vulnerabilities/security process,
- transitive dependency surface,
- release/provenance integrity where material,
- permissions and network/filesystem capabilities,
- vulnerability/update monitoring.

### Privacy/data

- What data leaves the product boundary?
- What retention/subprocessor/region implications exist?
- Can sensitive data be minimized?

### License/legal

- Is the license compatible with intended distribution/commercial use?
- Are attribution/source/distribution obligations understood?

### Integration complexity

- Does adoption require large adapters, workarounds, or framework coupling?
- Does it fit existing architecture and operational model?

### Reliability and operations

- Availability/SLA characteristics when relevant,
- timeout/rate-limit/failure behavior,
- observability/support,
- backup/export/data portability,
- incident dependency on a vendor/community.

### Cost

Consider more than purchase price:

`integration + runtime spend + upgrades + security + operations + migration/replacement + developer/agent cognitive cost`

### Lock-in and reversibility

Lock-in is not automatically bad. It is acceptable when benefits outweigh realistic migration risk.

Know which data/contracts are portable and whether an exit path is economically plausible.

## Prefer official and mature paths

For security-sensitive or protocol-heavy areas, prefer official SDKs, standards-compliant libraries, or mature providers rather than custom protocol implementations.

Examples include:

- OAuth/OIDC,
- authentication/session primitives,
- cryptography,
- payment processing,
- cloud-provider signing/authentication,
- complex file/format parsers.

## When custom implementation is appropriate

Custom implementation can be correct when:

- the capability is core product differentiation,
- existing solutions do not fit requirements,
- the required subset is very small and external dependencies add disproportionate complexity,
- transparency/testability/security are materially better with a small owned implementation,
- vendor/service cost or lock-in is unacceptable,
- a stable standard is simple enough to implement safely with strong tests,
- the implementation is intentionally a thin domain-specific layer.

Do not use "AI can write it quickly" as justification. Generation cost is only a small part of lifecycle cost.

## Wrong abstraction vs temporary duplication

Do not create a shared utility/package merely because two implementations look similar today.

Wait when needed until shared knowledge and change reasons are understood. A wrong common dependency can create more coupling than duplicated local code.

## Dependency minimization

Every dependency adds attack surface and maintenance surface. Remove unused dependencies and avoid packages for trivial operations that are clearer and safer to implement locally.

Conversely, do not replace mature security-critical libraries with handwritten code merely to reduce dependency count.

## Updates

Dependencies should have an update strategy.

Use automated update/security PRs where they reduce toil, but do not blindly auto-merge all updates without sufficient tests and risk controls.

Significant major-version upgrades SHOULD be treated as behavior changes with migration notes and regression verification.

## CI and build dependencies

GitHub Actions, reusable workflows, build plugins, container base images, code generators, and installer scripts are dependencies too.

Prefer trusted sources, least privilege, immutable/versioned references where practical, and automated update visibility.

## Decision record threshold

Record a dependency/service decision when it is:

- difficult or expensive to replace,
- security/privacy sensitive,
- a major architecture constraint,
- a material recurring cost,
- likely to be questioned/reconsidered later.

Use `templates/decision-record.md`.
