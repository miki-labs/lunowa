# Greenfield Bootstrap

Before substantial feature work in a repository intended to reach production, establish the **smallest foundation that makes changes reproducible, verifiable, secure enough for the current risk, and legible to humans and coding agents**.

Do not confuse a foundation with installing a mature-company tool stack on day one.

## Bootstrap objective

A new repository should quickly make these answers obvious:

- How do I install dependencies?
- How do I run the product?
- How do I run the canonical verification path?
- Which runtime/toolchain/package manager is authoritative?
- Which product platform(s) are currently intended?
- Where do durable product/architecture constraints live, if they are complex enough to need documentation?
- What prevents obviously broken changes from entering the integration branch?

The first bootstrap change SHOULD avoid mixing large product functionality with foundation setup when separation makes the result easier to inspect and verify.

## Typical minimum baseline

For a production-oriented application repository, establish only the applicable subset:

- Git repository and primary integration branch,
- concise `README.md`,
- concise `AGENTS.md` when coding agents are used,
- explicit runtime/toolchain/package-manager policy,
- deterministic dependency resolution such as a lockfile where the ecosystem supports it,
- `.gitignore`,
- environment-variable/config documentation without real secrets,
- formatter,
- useful lint/static/type/compiler checks supported by the stack,
- a test runner with at least one meaningful behavior test,
- one canonical verification command/workflow,
- CI running the canonical baseline,
- branch/merge protection appropriate to the repository risk,
- explicit build/release path when the shipped artifact cannot be produced by the ordinary contributor workflow.

Add initial architecture, threat/security, platform, or product-knowledge artifacts only when the system is already complex enough that their absence would cause guessing.

Do not create empty documentation trees merely to appear mature.

## Canonical commands

Humans, coding agents, and CI SHOULD share obvious authoritative paths for the common workflows.

Conceptually:

```text
install
run/dev
verify
```

Exact command names are stack-specific. The invariant is that every actor should not invent a different setup/test procedure.

The fast canonical verification path often combines the useful subset of:

- format check,
- lint/static analysis,
- type/compiler check,
- tests,
- build/package verification.

Heavy device/E2E/security/performance checks can live in targeted or release workflows when running them on every local change would produce more cost than signal.

## Reproducible inputs

Version or otherwise make explicit the non-secret inputs needed to build/test the product, such as:

- runtime/toolchain versions,
- dependency versions/lockfile,
- build configuration,
- migration definitions,
- CI configuration,
- important non-secret environment/deployment configuration.

Avoid dependence on undocumented local-machine state.

## CI and integration

For repositories expected to reach production, establish automated verification early enough that new code grows on top of a trusted baseline.

A minimal pipeline is conceptually:

`checkout -> deterministic setup/install -> verify -> build when required`

Keep the integration branch working. A persistently broken required check destroys the value of later automation and coding-agent verification.

For a solo repository:

- prefer short-lived branches/changes,
- run automated verification before merge,
- do not require ceremonial human approval when no independent reviewer exists,
- add CODEOWNERS, merge queues, or stronger approval rules only when team/concurrency/risk creates a real need.

## Secrets and agent permissions

From the beginning:

- never commit real secrets,
- keep examples/placeholders non-sensitive,
- minimize CI token permissions,
- prefer short-lived/federated credentials over long-lived cloud keys where supported and worthwhile,
- keep production credentials/signing/store/payment access outside ordinary coding-agent contexts,
- enable available secret scanning/push protection when its cost is low relative to the risk.

Treat CI actions/plugins/install scripts as executable dependencies. Prefer trusted sources and immutable references where practical; use the current platform security guidance rather than freezing one provider-specific mechanism into the blueprint.

See `security-privacy.md` and `coding-agent-harness.md`.

## Initial production concerns are conditional

Do not install production machinery before the product creates the risk.

When authoritative user/business data begins to matter, add backup/restore behavior before data loss becomes existential.

When external users depend on the product, add actionable error visibility/support/security/privacy/platform controls according to `production-readiness.md`.

When payment is introduced, apply `monetization-engineering.md`.

When user-facing AI behavior becomes material, apply `ai-product-runtime.md`.

When multiple platforms/build environments become meaningful, apply `platform-development.md`.

The bootstrap should create a path to these controls, not pre-install all of them.

## What not to bootstrap by default

Usually avoid without a concrete requirement:

- microservices,
- Kubernetes/service mesh,
- elaborate IaC for trivial managed infrastructure,
- dedicated staging solely because mature companies have one,
- full observability stacks,
- enterprise SBOM/provenance/GRC machinery,
- merge queues for one developer,
- internal frameworks/plugin architectures,
- support for every platform the framework can target,
- complex agent orchestration or memory infrastructure,
- platform-specific hardware before it solves a measured development/verification bottleneck.

## Foundation evolution

The bootstrap is not a finished perfect harness.

Use this loop:

`observed friction/failure -> root cause -> smallest missing guardrail/capability -> verify improvement`

Examples:

- repeated compatibility regressions -> targeted platform CI,
- repeated auth boundary mistakes -> negative tests/static architecture rule,
- slow diagnosis -> better error context/observability,
- repeated agent misunderstanding -> clearer durable source-of-truth map,
- remote platform workflow becomes the measured bottleneck -> change tooling/hardware.

Do not continuously synchronize every global-blueprint experiment into every product. Promote only stable improvements that solve a real recurring problem.
