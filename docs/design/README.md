# Lunowa Design Authority Map

This directory contains Lunowa's Product-design authorities and visual references.

## Read by question

| Question | Primary source |
|---|---|
| Product scope/value/jurisdiction | `../product/PRODUCT.md` + `../product/PRODUCT-CONTENT.md` |
| High-level IA / visual principles / design guardrails | `DESIGN.md` |
| Detailed interaction meaning | `INTERACTIONS.md` |
| Responsive/adaptive behavior | `RESPONSIVE.md` |
| **Implementation-ready v1 screen/state/component/read-model contract** | **`V1-UI-IMPLEMENTATION-CONTRACT.md`** |
| Product observable acceptance | `../product/GOLDEN-SCENARIO-BANK.md` |
| Responsibility semantic truth | `../product/responsibility/` |
| Visual composition/component references | `references/README.md` + relevant images |
| Issue #55 external/current evidence | `../product/research/issue-55-ui-ux-evidence-2026-08-28.md` |

## Authority boundary

`V1-UI-IMPLEMENTATION-CONTRACT.md` makes the existing Product/design behavior implementation-ready. It may resolve implementation-level ambiguity such as screen inventory, material view states, feedback/focus behavior, visual tokens and UI read-model/event boundaries, but it **does not override Product or Responsibility semantic truth**.

If a visual reference conflicts with current Markdown authority, current Markdown wins. If the implementation contract exposes a Product/Responsibility contradiction, reconcile the owning authority rather than allowing a UI convenience to redefine semantics.

## Implementation reading order

For a Product UI implementation task, prefer selective reading:

```text
current GitHub Issue
-> relevant Product authority
-> V1-UI-IMPLEMENTATION-CONTRACT.md
-> relevant DESIGN / INTERACTIONS / RESPONSIVE sections
-> relevant Golden Scenario / Responsibility oracle
-> only relevant visual references
```

Do not load all visual references or the entire Responsibility corpus merely because they exist.

## Scope warning

The presence of historical reference screens for fresh Compose, multi-account, broad mailbox administration or other features does not make them current v1 implementation requirements. Current Product scope and live task authority decide activation.
