# Platform Support / Build / Release Matrix

Use only when platform variation is material. A simple single-surface product does not need this document.

Delete irrelevant rows/columns. Do not create platform commitments merely because a framework can target them.

## Context

- Product/release stage:
- Why a separate platform plan is needed:
- Primary user/device assumptions:

## Supported surfaces

| Platform / surface | Support level | Supported versions if needed | Critical platform-specific behavior | Known exclusions |
| --- | --- | --- | --- | --- |
| | | | | |

Suggested levels: `required`, `best effort`, `unsupported`.

## Build and release

| Artifact / target | Authoritative build environment/workflow | Signing/credential boundary | Production distribution | Recovery from bad release |
| --- | --- | --- | --- | --- |
| | | | | |

Record only contributor-host limitations that materially affect development. A local limitation may be replaced by a supported remote/CI workflow rather than forcing every contributor machine to build every target.

## Verification

| Critical behavior | Automated/common | Simulator/emulator/browser | Physical device/manual release check | Required before release? |
| --- | --- | --- | --- | --- |
| Core user flow | | | | |
| Authentication/account recovery | | | | |
| Permissions/background/push/deep links/files | | | | |
| Accessibility/input behavior | | | | |
| Purchase/restore/entitlement | | | | |
| Other material platform risk | | | | |

Do not fill rows for capabilities the product does not use.

## Current external constraints

Link current primary vendor documentation instead of copying volatile values without a date.

- Toolchain/SDK/submission requirement:
- Store/privacy/payment requirement:
- Checked date:

## Material risks / unresolved gaps

- 

## Completion evidence

For platform-specific changes, state:

- checks actually executed locally,
- checks executed in CI/remote systems,
- simulator/emulator/device checks actually performed,
- anything not verified,
- whether any unsupported/best-effort platform is affected.

Never convert "build succeeded" into a claim that platform behavior was verified.
