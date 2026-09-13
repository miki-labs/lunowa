---
name: design-qa
description: Blocking visual QA for Lunowa reference-conformance work. Use after a user-facing implementation has both an accepted source visual target and a rendered candidate to compare before handoff or acceptance.
---

# Lunowa Design QA

Compare the accepted visual source against the **actual rendered candidate**. This is not a broad UX audit and not a substitute for functional review.

A design-QA run needs both:

- an identifiable source visual target (Figma node/frame, accepted screenshot/mockup, or equivalent visual source); and
- a rendered implementation bound to the candidate being judged.

If either cannot be opened/captured/compared, visual acceptance is `blocked` / `NOT_VERIFIED`. Code, file paths, memory, builder prose, generic tests, or deployment success do not substitute.

## 1. Bind the comparison

Before judging, record:

- exact candidate HEAD (or explicitly uncommitted candidate identity while iterating);
- source reference identity/revision;
- route/screen and representative fixture/data state;
- viewport, locale, theme, zoom/text scale and material render conditions;
- interaction state (selected/open/focus/hover/etc.) when relevant.

Source and candidate must represent the same meaningful state. If they do not, fix/capture the state mismatch before making fine-grained fidelity claims.

Never use private mailbox/user content as a durable screenshot artifact. Prefer deterministic synthetic fixtures or sanitized evidence for QA.

## 2. Capture and compare directly

Open/capture both the source target and candidate before writing findings. Put them into the same comparison context when the available visual tool supports it; do not compare from memory or pretend two unrelated views are side-by-side evidence.

Normalize crop, viewport, scale, and device frame enough to avoid false precision.

Use:

- **full-view comparison** for shell geometry, hierarchy, composition, major-region proportions, density, and responsive structure;
- **focused-region comparison** when typography, icons/assets, controls, dense rows, forms, or alignment are too small to judge reliably in the full view.

If a focused region is unnecessary, record why rather than silently skipping it.

## 3. Evaluate required fidelity surfaces

Every substantive reference QA pass must explicitly check:

1. **Typography** — family/fallback, weight, size, line height, letter spacing, wrapping/truncation, hierarchy.
2. **Layout and spacing** — frame/crop, grid tracks, region proportions, alignment, margins, padding, gaps, radii, borders/shadows, vertical rhythm and density.
3. **Colors and tokens** — palette, semantic states, opacity, contrast, gradients/shadows, token mapping.
4. **Assets and icons** — correct asset/glyph, crop, scale, aspect, sharpness, masking/background, alignment; no improvised placeholder/CSS art where the accepted target contains a real asset.
5. **Copy/content** — app-owned visible copy and content structure; dynamic fixture text may differ when semantics require it, but it must preserve comparable layout stress.

Also check interaction states, responsive behavior, and accessibility where the reference/task covers them. Visual similarity never waives keyboard/focus, text scaling, target-size, semantic-control, or Product-truth requirements.

## 4. Severity and disposition

Classify actionable findings by user impact and fidelity risk:

- `P0` — primary task blocked, impossible/broken layout, severe accessibility or dangerous misleading state.
- `P1` — major reference mismatch, task/usability regression, or missing critical state likely to be noticed.
- `P2` — moderate visual drift, responsive/state inconsistency, hierarchy/density defect, or material polish gap.
- `P3` — minor refinement that does not block handoff.

Treat viewport overflow that hides persistent controls, wrong major-region proportions, materially different above-the-fold hierarchy, or substantial wrapping/density drift as `P2` or higher.

For reference-conformance work:

- any actionable `P0/P1/P2` => visual result `blocked` and evaluator conformance `FAIL`;
- missing, stale, **wrong-state**, or otherwise uninspectable source/rendered comparison => visual result `blocked` and evaluator status `NOT_VERIFIED`;
- no actionable `P0/P1/P2` and fresh comparable evidence => visual result `passed` and evaluator conformance `PASS`; remaining `P3` may be follow-up polish.

Do not downgrade a material miss because the diff is small, architecture is clean, or generic CI is green.

## 5. Iterate on evidence, not hope

When a pass finds `P0/P1/P2`:

1. record all material findings from that pass;
2. fix them as one bounded correction batch when implementation authority exists;
3. re-render the **same state and viewport**;
4. compare the revised candidate with the source again;
5. retain a compact comparison history until `passed` or a real blocker is surfaced.

Build/lint/deploy troubleshooting is not a design-QA iteration unless it changes the rendered comparison.

Repeated correction failure is a signal to re-check the reference, specification, state fixture, tool/environment, design-system mapping, or task decomposition rather than continuing random CSS tweaks.

## 6. Evidence receipt

Keep a compact review receipt containing:

```text
candidate:
source visual truth:
state / fixture:
viewport / render conditions:
full-view evidence:
focused-region evidence (or why N/A):
findings:
comparison history:
evaluator status: PASS | FAIL | NOT_VERIFIED
final result: passed | blocked
```

The receipt binds provenance; it does not replace source/candidate artifacts or reviewer judgment. Evidence used for exact-head acceptance must belong to that exact head unless the later movement is proven irrelevant.

## 7. Baselines and independence

Use screenshot baselines primarily for **regression after visual acceptance**, not as self-approval of a new external reference implementation.

- Stabilize browser/OS/font/DPR, time/animation and other nondeterministic inputs before interpreting pixel diffs.
- A candidate must not create/update its own golden and treat the resulting zero diff as independent proof.
- Baseline/oracle changes require independent trust-root review appropriate to the task.
- A fresh reviewer should independently render/inspect the exact candidate when practical. Builder screenshots are evidence, not review authority.

## 8. Report fix-oriented findings

Lead with findings, ordered by severity. Each material finding should identify:

- rendered location/component;
- source evidence vs candidate evidence;
- affected fidelity surface;
- user/fidelity impact;
- concrete correction or missing evidence.

Separate objective mismatches from subjective polish. Do not say the design matches or is done until the required surfaces were actually inspected.
