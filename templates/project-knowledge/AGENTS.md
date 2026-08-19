# AGENTS.md

This file is a map, not an encyclopedia. Keep it concise and point to deeper project-local sources of truth.

## Project

Briefly state what this repository builds and the primary product/system goal.

## Source of truth

List only documents that actually exist in this project, for example:

- Product intent: `docs/PRODUCT.md`
- UX/design: `docs/DESIGN.md`
- Architecture: `docs/ARCHITECTURE.md`
- Quality / Definition of Done: `docs/QUALITY.md`
- Feature specs: `docs/specs/`
- Durable decisions: `docs/decisions/`
- Active plans: `docs/plans/active/`

## Canonical commands

Replace with the real project commands:

- Install: `<command>`
- Run: `<command>`
- Verify: `<command>`

Humans, agents, and CI SHOULD use the same authoritative verification path where practical.

## Working rules

- Read relevant source-of-truth documents and nearby implementation before non-trivial edits.
- Do not infer durable product or architecture decisions only from chat history or issue text when repository sources exist.
- Reuse existing repository/framework/platform/official capabilities before adding custom implementations or dependencies.
- Keep changes small, coherent, reviewable, and independently verifiable where practical.
- Update durable repository knowledge in the same change when product behavior, public contracts, architecture, security/privacy constraints, or another durable decision changes materially.
- Do not weaken/delete tests merely to make verification pass.
- Do not silently resolve material conflicts between source-of-truth documents and implementation; report/escalate when the correct state is not safely inferable.
- State material assumptions and anything that could not be verified.

## Verification

Follow `docs/QUALITY.md` and the canonical verification command. Add targeted runtime/browser/device/security/performance checks when the change requires them.

## Done

Implementation alone is not completion. The accepted behavior, required verification, and affected durable documentation must be consistent.

For reusable engineering defaults, see the upstream software-engineering blueprint used to bootstrap this repository.