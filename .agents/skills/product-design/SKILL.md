---
name: product-design
description: Single entry point for Lunowa user-facing Product/UI work. Use when shaping, implementing, reviewing, copying, hardening, or materially changing what a user sees, understands, chooses, or does, including accepted Figma/image references, interaction, responsive behavior, accessibility, and reachable UI states.
---

# Lunowa Product Design

Working code is not enough for user-facing work. Make the interface correct for the user, Lunowa's Product semantics, and the accepted visual direction, then verify the rendered result.

This skill is a router and operating contract. It does not replace the canonical Product/design documents or turn generic design taste into authority.

## 1. Resolve the request mode

Choose the narrowest mode supported by the task:

| Mode | Typical request | Behavior |
| --- | --- | --- |
| Shape | design a flow, choose UX, compare alternatives | frame the job, evidence, states, trade-offs, and open Product decisions before implementation |
| Implement | build/fix/change a user-facing surface | implement the accepted behavior and visual direction in the production code path |
| Review | audit/critique/compare a UI or candidate | remain read-only, inspect source plus rendered evidence, and report prioritized findings |
| Copy | change visible language/accessibility names | keep scope to language and directly required UI wiring; report structural blockers separately |
| Harden | polish/production-ready/responsive/a11y/state coverage | preserve settled Product direction while fixing reachable-state and finish defects |

A URL, screenshot, Figma node, route, or component identifies scope; it does not by itself authorize redesign or edits.

`Review` is broad Product/UX audit. Exact accepted-reference conformance is a separate blocking `design-qa` decision after an implementation has both source and rendered evidence.

## 2. Operating contract

For material Shape, Implement, Harden, or full Review work:

- **Start with the job, not the pixels.** Identify who is acting, what they are trying to accomplish, the Product object involved, and what the system will change.
- **Define the outcome before the output.** State current behavior/problem, desired outcome, success signal, and non-goals before choosing UI structure.
- **Use evidence, not taste.** Trace material decisions to Product behavior, canonical guidance, accepted design evidence, or a verified adjacent pattern.
- **Separate facts from decisions.** Mark unresolved assumptions/Product choices instead of hiding them in styling or implementation.
- **Decide before decorating.** Resolve IA, component semantics, interaction, state behavior, consequence, reversibility, and permissions before polish.
- **Design every reachable state, not every imaginable state.** Map only states the Product can enter, including material loading/empty/sparse/populated/validation/error/permission/pending/ambiguous/responsive variants.
- **Verify the real surface.** Source inspection establishes implementation facts; rendered interaction establishes UI quality. Never claim visual verification from code alone.

For a material Product/flow decision, keep a compact working brief with: user, job, current behavior, desired outcome, success signal, non-goals, object/scope, primary action, consequence, reversibility, permissions, and open decisions. This can live in the Issue/task contract; do not create a second planning artifact when the contract already carries it.

## 3. Use the right authority

Resolve conflicts in this order:

1. explicit accepted user/task goal and constraints;
2. Lunowa Product / Responsibility / interaction semantics and real authorization/data/effect truth;
3. accepted visual reference for visual decisions inside those semantic/safety constraints;
4. repository-canonical design/component/token guidance;
5. verified adjacent shipped patterns;
6. general interface heuristics.

Shipped UI proves what exists, not why it is correct. An obsolete shell is not a veto over a newly accepted visual target. Conversely, a screenshot never authorizes fake data, new permissions, provider effects, or Product semantics.

## 4. Load only the context the surface needs

Before proposing or editing material UI, read the relevant subset of:

- `docs/design/DESIGN.md`;
- `docs/design/INTERACTIONS.md`;
- `docs/design/RESPONSIVE.md`;
- `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`;
- active visual references under `docs/design/references/` when relevant;
- the Product/domain owner for mutations, permissions, state, and effects;
- current production components/tokens/patterns for the touched surface.

Do not duplicate those authorities into this skill. Report which material sources were loaded when that helps review traceability.

## 5. Route accepted-reference implementation explicitly

When the task is to reproduce or integrate an accepted Figma frame, screenshot, mockup, design code, or other visual target:

1. Resolve the exact reference identity/revision and the comparable route/state/data.
2. Record material render conditions: viewport, locale, theme, browser/DPR when relevant, zoom/text scale, and interaction state.
3. If a live Figma node is the source and Figma design context is available, obtain design context **before writing code**. Treat generated React/Tailwind as design representation, not production code.
4. Prefer design-to-code hints in this order when available: Code Connect / mapped production component, component documentation, design annotations, design tokens, then raw values/screenshot inference.
5. Reuse Lunowa components/tokens when they represent the same design intent. Do not preserve an old component/layout merely to minimize diff if it materially misses the accepted target.
6. Use exact supplied/exported assets. Do not replace visible target assets/icons with improvised CSS/SVG/emoji/placeholders merely because they are easier to generate.
7. **Open and inspect the real production code path in a real browser early during implementation.** Capture the first comparable render before the patch is otherwise "done"; do not postpone browser inspection to final handoff.
8. Iterate against that real-browser rendered candidate, then run `.agents/skills/design-qa/SKILL.md` as the blocking visual handoff gate.

If Figma MCP or Code Connect is unavailable, do not fabricate their evidence. Use the strongest actually available reference (for example accepted Make code + screenshot) and state the limitation.

## 6. UI engineering without one exact visual target

For UI changes governed by Lunowa's textual design system rather than one exact reference:

- identify the user's primary job and primary action;
- map only reachable states that matter to the change: loading, empty, sparse, populated, validation, error, permission/disabled, pending/optimistic/ambiguous, compact/wide;
- preserve navigation, focus, draft/input, and state truth across responsive transitions;
- reuse accessible interaction primitives instead of hand-rolling generic controls;
- render and inspect every materially changed state at representative widths;
- do not invent a pixel target that the Product never accepted.

## 7. UX / Product-direction changes require judgment

When the task changes the user's job, IA, default, consequence, navigation, interaction surface, or reachable Product states, treat that as a Product decision rather than a styling patch.

Use repository evidence and explicit owner/Product acceptance. Synthetic-user or LLM critique can surface hypotheses; it is not sole authority for a new Lunowa direction. If the direction is unresolved, stop at options/evidence instead of silently choosing one in code.

For a new visual direction with no accepted visual target, do not claim reference fidelity. Establish/accept a visual direction first when the task materially depends on one.

## 8. Verify the real surface

For material user-facing implementation, verification is multi-axis:

- Product/behavioral correctness and truth;
- rendered visual quality or reference fidelity;
- changed interactions and primary path;
- responsive behavior at relevant canonical widths;
- keyboard/focus and accessibility proportional to the change;
- long/realistic content and localization risk where material;
- browser console/runtime errors when using the browser surface.

Generic CI, build success, HTTP 200, or source inspection cannot prove rendered UI quality. A pretty screenshot cannot prove interaction, authorization, state truth, accessibility, or provider effects.

## 9. Keep the harness evidence-driven

Stable, mechanically checkable decisions belong in tests/lint/types/components when worth the maintenance cost. Judgment stays in canonical prose with evidence and scope.

Do not promote one screenshot, one reviewer comment, or one shipped file into a universal design rule. Record recurring accepted decisions in the narrowest owning artifact; add exemplars/evals only after repeated evidence justifies them.

The trigger itself is part of the harness. Keep a deterministic routing test so future edits do not make the Product Design skill silently undiscoverable.
