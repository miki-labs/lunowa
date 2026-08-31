# Issue #63 runtime/browser audit record

## Candidate scope

This record covers the corrected Issue #63 structural shell candidate. Textual
Product/UI authority remains primary; the five active references in
`references/README.md` were used only for brand, component density, desktop
workspace hierarchy, and compact-flow visual direction.

## Corrections made from the audit checklist

- Stage D now gives the compact header an explicit full-width grid row, with
  Surface/List and Detail explicitly placed beneath it.
- Stage C uses distinct destination glyphs, accessible names, and a label
  revealed on keyboard focus as well as pointer hover; it no longer uses an
  indistinguishable bullet rail.
- The shell preserves the calm three-pane / compact single-flow hierarchy from
  references `00` through `04` without importing illustrated Inbox, CRM,
  Compose, send-menu, or deferred-send behavior.
- Monitoring posture, monitoring integrity, common mutation feedback, and the
  external Send lifecycle are represented separately. No non-active posture
  renders healthy Managed reassurance.

## Browser audit matrix

The deterministic browser oracle in `e2e/lunowa-shell.spec.ts` covers:

| Coverage | Oracle |
| --- | --- |
| 1600, 1440, 1180, 900, 768, 720, 430, 390 CSS px | pane count/order, no ordinary horizontal overflow, Stage-D header placement, rail-label discoverability |
| effective 125%, 150%, 200% reflow widths | 1152, 960, 720 CSS px with Source-to-composer flow and focused input not under the compact header |
| compact flow | drawer navigation and draft preservation at 390 px |
| keyboard/IME | normal slash navigation, editable-target suppression, composition middle events, and the `keyCode === 229` composition-end boundary |

## Execution status

`pnpm exec playwright test --list` discovered all five browser checks on this
candidate. Runtime execution is **not verified in this workspace**: the
managed sandbox blocks all loopback access, including Playwright's configured
`127.0.0.1:3000` web server. The attempted `pnpm test:e2e` terminated before
test execution with that policy error. The browser suite and this audit matrix
must be run in an environment that permits the repository's local Playwright
web server before acceptance/merge; this record does not claim screenshot or
runtime visual PASS.
