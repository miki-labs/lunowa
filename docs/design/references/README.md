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

Use this as the strongest **visual** foundation reference. Do not infer Product behavior from decorative examples inside the board.

**Exact token values are never read back from pixels or image text.** Generated hex strings, font-stack text, measurements and sample labels can contain image-generation corruption. Exact colors, typography behavior, target sizes, focus behavior and accessibility constraints come from `V1-UI-IMPLEMENTATION-CONTRACT.md` and executable tokens/tests.

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

Component examples do not authorize features that textual Product scope defers. The board's note that Waiting/Later/Done are filter/projection treatments rather than global destinations is directionally consistent with the textual design contract, but literal copy, status names, shortcut hints and example control behavior still remain non-normative.

## `02-desktop-core-workspace.png`

Primary purpose:

- desktop three-pane workspace proportions;
- sidebar / list / detail spatial relationship;
- middle-pane information density;
- right-side conversation/action workspace;
- surface/background hierarchy and overall density.

This image is a **workspace grammar**, not a canonical Inbox taxonomy or navigation specification.

**Do not copy its left rail literally.** In particular, generated destinations/filters such as `すべて`, `待ち`, `あとで`, `ピン留め` or a prominent generic `新規メール` action do not override the current navigation or v1 scope. The current textual navigation contract and, where a visual example is useful, the main-destination hierarchy shown in `03-moment-conversation-reply.png`, take precedence.

Likewise, multiple-account examples and account/scope controls in this image illustrate layout capacity only. They do not promote broad multi-account/second-provider UX into the current one-provider critical path.

## `03-moment-conversation-reply.png`

Primary purpose:

- current desktop main-destination hierarchy direction (`Home` / `Needs You` / `Managed` / conditional `Review` / `Source Conversations` / Search);
- Moment / minimum-context restoration;
- one recommended primary next action;
- source-grounded conversation history;
- contextual reply composer;
- evidence-first trust hierarchy.

Important boundaries:

- one Moment generally has one primary question/action;
- AI assists but is not the dominant interaction metaphor;
- recommended action must not bypass permission, safe-action or explicit-send boundaries;
- Source remains inspectable;
- Waiting/Later/Done/Pin examples are projection/filter styling, not authority to create permanent global destinations or activate deferred Pin behavior;
- People Context / history shown beside the communication flow is **visual direction for a conditional/strong-candidate communication-restoration aid**, not a current CORE CRM/person-surface requirement and must not block the Minimum Complete Delegation Loop;
- multiple-account samples are layout examples, not current second-provider/multi-account implementation authorization;
- generated send-menu arrows, keyboard-send hints or secondary send modes do not authorize Send Later, generic Undo, implicit send or a shortcut that conflicts with Japanese IME / explicit-Send rules;
- `あとで` must resolve through the accepted defer/return-condition semantics rather than acting as an opaque hide action.

## `04-mobile-core-flow.png`

Primary purpose:

- compact/mobile adaptation of the same Product ontology;
- single-pane navigation and return behavior;
- touch-scale hierarchy;
- Moment/conversation/reply flow;
- mobile density and primary-action placement.

Do not create a different mobile Product model. `RESPONSIVE.md` and the v1 UI contract own adaptation semantics.

The image's account selector, status filters, People/History controls, AI draft affordance and send-menu arrow are **capability/layout illustrations only**. They do not promote broad multi-account, People/CRM, deferred filter destinations or additional send modes into current v1 CORE. Home/true-zero/integrity wording must be driven by trustworthy runtime state, not copied from sample counts or timestamps in the image.

---

# Cross-reference conflict rules

When two current images appear to disagree, use this order for the **visual region at issue**, after applying textual authority first:

| Visual question | Strongest current image guidance | Required guardrail |
|---|---|---|
| logo / brand relationship / overall tone | `00` | exact token/code values come from text/code, never OCR/pixels |
| reusable component appearance | `01` | behavior/accessibility comes from UI contract/tests |
| desktop pane proportions / density / surfaces | `02` | do not copy its old-style left-rail taxonomy |
| desktop primary navigation hierarchy | `03` | textual navigation contract wins; optional filters are not global destinations |
| Moment / recommended action / conversation / reply | `03` | one safe primary action; explicit send; evidence remains inspectable |
| compact/mobile adaptation | `04` | same ontology; preserve place/state across adaptive transitions |

No image can resolve a Product/domain contradiction. Route a real contradiction to the owning textual authority instead.

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
- exact color/font/measurement tokens printed inside an image;
- Product scope;
- Responsibility state/identity semantics;
- provider permissions/capabilities;
- external-action authority;
- AI confidence or reasoning;
- legal/privacy commitments;
- exact runtime behavior;
- keyboard shortcuts or send modes;
- whether a conditional/strong-candidate feature belongs to the current critical path.

Generated-image artifacts, typos and accidental feature suggestions must be ignored when textual authority disagrees.

---

# Implementation workflow

Before pixel-sensitive frontend work:

1. read the current Product/UI task contract;
2. read the relevant textual Product/design/domain authority;
3. inspect `00` and `01` for global visual grammar;
4. inspect `02` for desktop pane/density work, `03` for current desktop navigation + Moment/conversation/reply work, and `04` for compact/mobile work;
5. classify every image-only capability as current CORE / conditional / deferred using textual Product authority before coding it;
6. identify image/spec conflicts before coding;
7. implement reusable tokens/components rather than screenshot-specific duplication;
8. run the real app with realistic data;
9. audit responsive behavior, keyboard/focus, Japanese IME, loading/error/integrity states and WCAG 2.2 AA requirements;
10. tune spacing/density/hierarchy in the executable Product;
11. update visual references only when doing so materially reduces future ambiguity.

Target: **one coherent Product implemented from canonical semantics, guided by a small visual system—not a collection of screenshot replicas.**