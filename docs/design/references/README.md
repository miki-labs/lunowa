# Lunowa Visual References

This directory contains the **minimal canonical visual-reference set** used to guide Lunowa implementation.

These images are **visual references, not Product/domain specifications**. Normative authority remains:

- `../../product/PRODUCT.md`;
- `../../product/PRODUCT-CONTENT.md`;
- `../DESIGN.md`;
- `../INTERACTIONS.md`;
- `../RESPONSIVE.md`;
- `../V1-UI-IMPLEMENTATION-CONTRACT.md`;
- `../../product/responsibility/` when Responsibility semantics are involved;
- the current live GitHub task contract.

If an image conflicts with textual authority, the image is wrong.

---

## Current strategy

Do **not** maintain one static screenshot for every screen/state before implementation.

The current pre-implementation visual system is intentionally represented by five canonical images. Other contract-defined states are implemented from textual authority, then audited in the real running Product with realistic data, responsive layouts, keyboard/focus/IME behavior, loading/error states and integrity failures.

```text
five canonical references
-> implementation
-> runtime/browser visual audit
-> adjust tokens/density/hierarchy
-> add/replace a reference only when a recurring material visual decision needs one
```

Git history preserves the older 00–19 exploration set. Those historical screenshots are no longer active implementation references.

---

# Canonical reference catalog

## `00-foundation-visual-system.png`

Primary purpose:

- official Lunowa logo treatment;
- Navy / Lunar Gold relationship;
- typography direction;
- spacing/radius/border/elevation grammar;
- semantic foreground/background state treatment;
- overall calm premium productivity tone.

Use this as the strongest visual foundation reference. Do not infer Product behavior from decorative examples inside the board.

## `01-component-system.png`

Primary purpose:

- buttons and secondary actions;
- inputs/search;
- chips/status treatment;
- list rows;
- navigation primitives;
- feedback/loading/error/pending treatments;
- focus/disabled/target-size direction;
- reusable component density.

Component examples do not authorize features that textual Product scope defers.

## `02-desktop-core-workspace.png`

Primary purpose:

- desktop three-pane workspace grammar;
- scope/account switcher direction;
- left navigation hierarchy;
- middle-pane information density;
- right-side conversation/action workspace;
- surface/background hierarchy and overall density.

This image is a **workspace grammar**, not a canonical Inbox taxonomy. `Home`, `Needs You`, `Managed`, `Review`, `Source` and Search keep their textual semantics even when they reuse this shell.

## `03-moment-conversation-reply.png`

Primary purpose:

- Moment / minimum-context restoration;
- one recommended primary next action;
- source-grounded conversation history;
- lightweight People Context inside communication restoration;
- contextual reply composer;
- evidence-first trust hierarchy.

Important boundaries:

- one Moment generally has one primary question/action;
- AI assists but is not the dominant interaction metaphor;
- People Context must not become CRM/personality scoring;
- recommended action must not bypass permission, safe-action or explicit-send boundaries;
- Source remains inspectable.

## `04-mobile-core-flow.png`

Primary purpose:

- compact/mobile adaptation of the same Product ontology;
- single-pane navigation and return behavior;
- touch-scale hierarchy;
- Moment/conversation/reply flow;
- mobile density and primary-action placement.

Do not create a different mobile Product model. `RESPONSIVE.md` and the v1 UI contract own adaptation semantics.

---

# What intentionally has no dedicated pre-implementation screenshot

The following may be implemented without a separate canonical static image when textual contracts are sufficient:

- Waiting;
- Later;
- Done;
- Managed detail;
- Review variants;
- Integrity/reconnect;
- Search/no-match;
- onboarding/initial sync;
- Settings;
- disconnect/account deletion;
- attachment-access failures;
- loading/partial/unknown/mutation states;
- tablet/intermediate-width variants.

A missing screenshot is **not** permission to invent behavior. Use the v1 UI contract and relevant Product/domain oracle.

If implementation reveals a recurring material visual ambiguity that textual contracts cannot resolve efficiently, add or replace the smallest necessary reference after review.

---

# Visual interpretation rules

Use these images primarily for:

- hierarchy;
- composition/layout;
- density;
- relative sizing;
- visual tone;
- component placement;
- surface/background treatment;
- responsive direction.

Do **not** treat literal generated-image details as authority for:

- sample names, dates, counts, amounts or email addresses;
- exact copy when canonical copy differs;
- Product scope;
- Responsibility state/identity semantics;
- provider permissions/capabilities;
- external-action authority;
- AI confidence or reasoning;
- legal/privacy commitments;
- exact runtime behavior.

Generated-image artifacts, typos and accidental feature suggestions must be ignored when textual authority disagrees.

---

# Implementation workflow

Before pixel-sensitive frontend work:

1. read the current Product/UI task contract;
2. read the relevant textual Product/design/domain authority;
3. inspect `00` and `01` for global visual grammar;
4. inspect `02` for desktop workspace work, `03` for Moment/conversation/reply work, and `04` for compact/mobile work;
5. identify image/spec conflicts before coding;
6. implement reusable tokens/components rather than screenshot-specific duplication;
7. run the real app with realistic data;
8. audit responsive behavior, keyboard/focus, Japanese IME, loading/error/integrity states and WCAG 2.2 AA requirements;
9. tune spacing/density/hierarchy in the executable Product;
10. update visual references only when doing so materially reduces future ambiguity.

Target: **one coherent Product implemented from canonical semantics, guided by a small visual system—not a collection of screenshot replicas.**
