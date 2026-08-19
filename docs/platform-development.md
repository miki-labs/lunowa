# Platform Support, Build, Test, and Release

Platform support is a product, engineering, QA, release, security, and support commitment. Treat it as an explicit decision rather than an accidental consequence of framework capability.

## Keep five platform concerns distinct

1. **Target platform** — where users are officially supported.
2. **Development host** — where contributors edit/run local tooling.
3. **Build environment** — where deployable artifacts are produced.
4. **Test environment** — browsers, simulators/emulators, devices, OS versions, and services used to verify behavior.
5. **Release environment** — distribution, signing, submission, store, hosting, and platform-specific commercial requirements.

These environments do not need to be the same machine or operating system.

A contributor workstation may legitimately rely on a supported remote/CI builder for a target artifact. Conversely, successful remote compilation does not prove that platform behavior was adequately tested or can be diagnosed.

## Core rules

- SHOULD support the smallest platform set justified by product evidence.
- MUST distinguish "can technically run/build" from "officially supported and verified."
- MUST make authoritative build/release paths explicit when they differ materially from ordinary local development.
- MUST use vendor-supported and legally/licensably valid production toolchains.
- MUST NOT claim a platform behavior was verified when the relevant check was not performed.
- SHOULD choose verification depth according to platform-specific failure risk rather than requiring every environment/device for every change.
- MUST re-check current vendor/store/toolchain/privacy/payment requirements before a material release when those rules can change release acceptance or product behavior.

Each additional supported platform is continuing QA, dependency, release, compatibility, and support cost. Framework target count is not product strategy.

## Support policy

When platform variation is material, record the minimum useful support policy, such as:

- supported platform/surface and version range where needed,
- required vs best-effort vs unsupported status,
- critical platform-specific capabilities,
- known exclusions,
- verification/release path.

A dedicated support matrix is conditional. A single-platform web product does not need a multi-page platform document merely to state that it supports its tested browsers.

Choose support floors from user need, dependency/toolchain support, security update availability, test cost, and support burden—not only compiler defaults.

## Reproducible build and release

Production artifacts SHOULD be reproducible from repository state plus controlled configuration/secrets closely enough to diagnose and repeat releases.

Make explicit where relevant:

- authoritative runtime/SDK/toolchain,
- package/dependency resolution,
- canonical build command/workflow,
- signing/credential boundary,
- artifact/release identifier,
- production distribution path.

Do not make undocumented local-machine state the only way to create a production artifact.

Remote/cloud/managed builders are first-class when they provide supported toolchains, controlled credentials, useful logs/artifacts, acceptable security, and a workable feedback loop.

Do not adopt remote infrastructure merely for sophistication. Likewise, do not reject it solely because the contributor workstation cannot perform the target build locally.

## Platform verification

Verification is proportional to actual platform-sensitive behavior.

Possible evidence includes:

- common unit/component/integration tests,
- browser/runtime tests,
- simulator/emulator checks,
- physical-device checks,
- release-build checks,
- accessibility/input-mode checks,
- store purchase/restore flows,
- permissions/background/push/deep-link/file/lifecycle behavior.

Physical-device testing is valuable when device behavior materially differs from simulator/browser behavior. It is not a mandatory step for every change.

Likewise, a simulator or physical spot check does not replace automated verification for behavior that can be tested deterministically.

For every platform-specific completion report, distinguish:

1. checks actually executed locally,
2. checks executed in CI/remote build/test systems,
3. checks performed on simulator/emulator/device,
4. checks not performed.

## Cross-platform architecture

Shared code does not eliminate platform differences.

When relevant, make differences explicit for:

- authentication/session and secure storage,
- permissions,
- push/background execution,
- offline/cache behavior,
- deep links,
- files/sharing,
- accessibility and input methods,
- layout/device classes,
- application lifecycle,
- privacy/security declarations,
- purchase restoration and cross-platform entitlement behavior.

Do not force materially different behavior behind one abstraction merely to maximize the percentage of shared code.

A cross-platform framework SHOULD be chosen because its total lifecycle trade-off fits required capabilities, ecosystem maturity, native escape hatches, security, debugging, upgrade cadence, build/release workflow, dependency quality, and replacement cost—not merely because it promises one codebase.

## Platform-specific hardware and local tooling

Hardware ownership is an implementation/resource choice, not a global engineering requirement.

Use supported remote builders, simulators/emulators, physical devices, or local platform hardware according to the feedback and verification needs of the actual product.

Acquire additional hardware or tooling when evidence shows that the current setup materially blocks debugging, verification, iteration speed, release reliability, or support for an important product surface. Keep this decision in the product repository rather than the global blueprint.

## Store and distribution rules are live constraints

SDK minimums, signing requirements, privacy declarations, review rules, payment programs, purchase-restoration requirements, external-link programs, reporting obligations, and other store policies change over time and may differ by region/product/channel.

The reusable rule is therefore:

> Re-check current primary vendor documentation before implementation or release when current platform policy can change the permitted architecture, payment flow, disclosure, or submission result.

Do not encode today's Apple, Google, framework, CI, or store-specific version as a timeless blueprint MUST.

See `monetization-engineering.md` when distribution affects payment/entitlement state.

## Development-environment legibility

A product repository SHOULD make the workflows humans and agents actually need easy to discover:

- canonical install/run/verify commands,
- required runtime/toolchain versions,
- supported contributor hosts where differences matter,
- remote/CI build workflow when local build is unavailable,
- required simulator/emulator/device checks,
- secrets/signing boundaries the coding agent must not cross.

Avoid undocumented shell/host assumptions when they repeatedly break supported contributor workflows.

## Review triggers

Revisit the platform plan when a change materially affects:

- supported platform/version scope,
- native/cross-platform framework,
- native modules/extensions,
- signing/build/submission infrastructure,
- store/payment/distribution behavior,
- push/background/biometric/file/deep-link or other platform-sensitive capability,
- critical device/browser behavior,
- build/test cost or feedback latency,
- current vendor requirements,
- repeated platform-specific incidents.

## Anti-patterns

Avoid:

- supporting every target a framework can compile,
- treating build success as platform verification,
- claiming device behavior from a test never performed,
- hard-coding a personal workstation as the release system,
- adding platform infrastructure or hardware without a real bottleneck,
- optimizing shared-code percentage over user experience/reliability,
- embedding current vendor/store policy as timeless architecture,
- keeping obsolete platform commitments because removing them feels like regression.

Current primary sources and time-sensitive platform notes belong in `references.md` and should be re-checked before material release decisions.
