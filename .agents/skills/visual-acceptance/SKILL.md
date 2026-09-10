---
name: visual-acceptance
description: Implement or evaluate Lunowa visual/UI work with a rendered-browser evidence loop. Use when a task has an accepted Figma/screenshot/reference target, materially changes user-facing presentation or responsive behavior, or asks for UX/product-design judgment that generic code tests cannot certify.
---

# Visual / UI Acceptance

Visual work has a distinct oracle. A green compiler, unit suite, E2E flow, or build can coexist with a materially wrong interface; visual similarity can also coexist with broken behavior. Keep these axes separate.

The caller still owns the work mode. `execute-task` may edit within the accepted contract; `evaluate-change` remains read-only while judging; a UX/Product-design request does not authorize implementation unless the task explicitly asks for it. Do not let a visual-review pass silently become a redesign or repair pass.

## 1. Classify the task before editing or judging

Choose the dominant class and keep mixed tasks explicit:

1. **Reference conformance** — reproduce/integrate an accepted Figma frame, screenshot, design code, or other visual target.
2. **UI engineering** — change presentation, interaction, responsive behavior, or accessibility without one exact visual target.
3. **UX / Product design** — choose or materially change the user journey, information architecture, hierarchy, copy strategy, or interaction model.

Reference conformance and UI engineering may be implemented automatically when their contract is clear. UX/Product-direction choices require accepted Product authority or owner judgment; visual similarity is not a Product decision oracle.

## 2. Keep authority and task objective distinct

Apply this conflict rule:

```text
Product / Responsibility / interaction semantics
> real runtime, authorization, data and effect truth
> accepted visual reference for visual decisions
```

This ordering prevents a screenshot from inventing Product behavior. It does **not** make visual fidelity optional when reference conformance is the accepted task. Inside the semantic/safety guardrails, fidelity to the accepted visual target is the objective. Existing presentation is evidence, not a veto: an obsolete shell/layout does not outrank a newly accepted visual target unless current canonical Product/UI authority explicitly preserves it.

Minimal diff, preservation of an obsolete layout, reuse percentage, and number of passing generic tests are never substitutes for that objective. Prefer the smallest healthy implementation only after required conformance is achieved.

## 3. Establish a usable visual oracle

Before substantial implementation, identify:

- the accepted reference and its provenance/revision when the source is mutable;
- the exact screen/state being reproduced;
- canonical viewport(s), theme, locale, browser/render environment, device-pixel ratio when relevant, zoom/text-scale and other material render conditions;
- the representative data/read-model state needed to make the reference comparable;
- visual anchors that matter: shell geometry, hierarchy, density, spacing, typography, component treatment, selected/focus state and primary-action prominence;
- exact inspectable design values available from Figma/design code (for example dimensions, spacing, typography or tokens) that can serve as deterministic anchors instead of being guessed from pixels.

If the reference cannot be inspected, or the candidate can only be rendered in an unrelated auth/empty/error state, visual conformance is `NOT_VERIFIED`; do not infer it from source code.

Reference screenshots may contain illustrative data. Use clearly synthetic test fixtures or bounded browser stubs when needed to reproduce the visual state, but never copy illustrative counts, people, messages, permissions, provider effects, or AI conclusions into production truth. Do not persist screenshots containing private mailbox/user data as review artifacts; use synthetic or appropriately sanitized evidence.

## 4. Use a closed rendered-browser loop

For material reference/UI work, use this loop rather than a code-only loop:

```text
accepted intent + reference
-> inspect current real implementation
-> implement in the production code path
-> render the actual application
-> capture/inspect the canonical state and viewport
-> compare reference <-> candidate directly
-> correct material mismatches
-> verify interaction / responsive / accessibility / semantics
-> exact-head acceptance
```

When supported, direct visual selection/annotation can reduce ambiguity for spacing, typography, layout and component edits. It does not replace repository authority or exact-head review.

Do not postpone the first real render until after the whole patch is considered "done". For visual work, rendering is part of implementation.

## 5. Require evidence that can falsify the visual claim

For **reference conformance**, PASS requires fresh evidence bound to the candidate state:

- identifiable accepted reference;
- rendered candidate at each contractually material viewport/state;
- direct side-by-side, overlay, diff, or equivalent comparison of reference and candidate;
- inspection of material hierarchy/layout/density/typography/component mismatches;
- deterministic comparison of key geometry/tokens when the accepted reference exposes exact values and that comparison is stable;
- interaction/runtime checks for behavior the visual surface exposes;
- responsive checks where the Product contract requires adaptation;
- accessibility checks proportional to the change, including keyboard/focus and zoom/text scaling when material.

A screenshot of the wrong state, a source-code diff, or builder prose saying "looks close" is not visual evidence.

Keep a compact evidence receipt for review: exact candidate HEAD, reference identity/revision, rendered state/fixture, viewport/render conditions, candidate artifact location, comparison method, and unresolved material mismatches. The receipt proves provenance; it does not replace the artifacts or the reviewer judgment.

For **UI engineering without an exact reference**, require rendered-browser evidence for the changed states and verify against the current design/interaction/responsive authorities rather than inventing a pixel target.

For **UX/Product design**, add scenario/task evidence and explicit Product/owner acceptance of the direction. Synthetic or LLM UX critique is useful discovery evidence, not sole authority for a new Product direction.

## 6. Use pixel baselines for regression, not self-approval

Playwright/visual snapshots are useful after a visual state is accepted. They are not a shortcut for the initial judgment that an external Figma/reference target was faithfully implemented.

- Generate/compare visual baselines in a stable rendering environment; browser/OS/font/DPR differences can create noise. Freeze or await fonts, animations, time and other nondeterministic rendering inputs when they would create false diffs.
- Do not generate a new baseline from the candidate and treat the absence of a prior diff as conformance.
- A candidate that changes a baseline or visual oracle cannot self-certify that same change. The new baseline needs independent/owner approval appropriate to the task.
- Prefer a few representative stable states over screenshotting every transient state.

## 7. Reviewer rules

The independent reviewer must separate at least these questions:

1. **Visual conformance** — does the rendered candidate match the accepted visual intent/reference where required?
2. **Behavioral conformance** — do interaction, state, data and effects still satisfy the contract?
3. **Responsive/accessibility quality** — does adaptation preserve hierarchy, input, focus and legibility?
4. **Product judgment** — did the task introduce a new UX direction that lacks accepted authority?

For a reference-conformance task:

- material reference mismatch => `FAIL`, even when generic CI is green;
- missing/uninspectable fresh rendered comparison => `NOT_VERIFIED`, never PASS;
- visual match with broken behavior/safety/accessibility => `FAIL`;
- do not downgrade a material visual miss to a concern merely because the implementation is small or mechanically clean.

The reviewer must establish that visual evidence belongs to the exact candidate and target state. Independently render/inspect the exact candidate when affordable; if independent rendering is unavailable, verify screenshot provenance tightly enough to bind it to the reviewed head and environment. Builder screenshots are evidence, not review authority.

## 8. Stop or escalate

Stop and surface the gap when:

- Product/domain authority and the visual reference materially conflict;
- the accepted reference identity or target state is ambiguous;
- realistic comparable rendering requires unsafe production data/effects;
- a requested visual change implies new Product semantics, permissions, provider effects or AI capability;
- the only available evidence is from a stale candidate or unrelated state;
- repeated correction fails to converge, indicating a reference/specification/oracle/tooling problem rather than another CSS tweak.

The goal is not pixel worship. The goal is to make the **actual rendered Product** demonstrably satisfy the accepted visual intent while preserving Product truth, behavior and accessibility.
