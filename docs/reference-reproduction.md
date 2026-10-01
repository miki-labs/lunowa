# Reference reproduction — local visual approval stage

The user's explicit September 18 correction selects faithful reproduction before
production wiring: preserve reference content, three-pane proportions, light
surfaces, navy text, blue-violet glossy controls, and left navigation. Do not
reinterpret this stage as a dashboard redesign. References 00/01 guide reusable
visual treatment; 02/03 are the actual workspace screens, not interchangeable states.

## Routes

With `LUNOWA_UI_PREVIEW=true`:

- `/ja/preview`: reference 02, desktop core workspace.
- `/ja/preview?view=moment`: reference 03, conversation and reply.
- `/en/preview` and `?view=moment`: translated app copy and equivalent samples.
- `/ja/preview?view=runtime`: the existing sessionless runtime fixtures.

The route remains dynamic, noindex, and 404 without opt-in. Ordinary authenticated
routes and all authorization/Send/domain logic are unchanged by this slice.

The rendered samples reproduce the supplied names, messages and counts. They do
not claim connected accounts or accepted Responsibility states. The page title
identifies the design preview; Settings opens preview information and view/language
links. Send, new mail, attachment access and account actions explain that no real
effect occurs. Draft suggestions insert a fixed sample; no AI request occurs.

## Implementation

`reference-workspace.tsx` provides two variants of shared navigation, list, message,
attachment and composer presentation. `reference-workspace.css` scopes its tokens
and styles to `.rf-workspace`, preserving the existing application styling.
Lucide supplies maintained outline icons; the native HTML inputs/buttons preserve
keyboard behavior. The user-requested resizable borders use the maintained
`react-resizable-panels` package (4.12.4) for pointer capture, touch, keyboard
separators, size constraints and collapse/expand behavior.

Logo and portrait regions are clipped from the unchanged supplied reference 03;
provenance is in `public/design-reference/README.md`. Layout and all text are HTML,
not a full-screen image. Noto Sans JP is selected when installed (present in the
verified Windows environment), then system/Yu Gothic fallbacks. Fonts and raster
reference artwork mean cross-platform pixel identity is not claimed.

Reference comparison uses Chromium at 1448×1086, Japanese, 100% scale, initial Q2
conversation, all mail, no hover or focus. Desktop has a user-operated collapse
control; narrow layouts retain an icon rail and switch between list and detail.
Selection, Back and Search move focus explicitly; draft state is per conversation.

Both desktop borders are draggable. Tab focuses each separator; Left/Right adjusts
width and double-click restores the neighboring default size. Expanded sidebar
width is 220–360px (collapsed 76px), list width is 320–640px, and detail retains at
least 420px. Initial 02/03 proportions remain unchanged. Width adjustments are
session-local; reloading restores the reference proportions. At 1000px and below,
the existing compact layout owns sizing and separators are hidden/disabled. Panel
contents stay mounted during transitions, preserving drafts and selection. Detail
and list container queries adapt to dragged widths independently of viewport size.

## Verification

`PLAYWRIGHT_FIDELITY=true` enables `e2e/reference-workspace.spec.ts` against a local
opt-in preview server. It checks pane proportions, collapse, reply focus, per-mail
draft preservation, no real API requests/effects, mobile focus restoration/Search,
and Japanese/English widths down to 320px. Screenshots are comparison evidence,
not self-approved regression baselines. The feature-flag tests retain the default
404 boundary and verify both reference variants and the existing runtime preview.

This work continues the same user-authorized uncommitted Windows frontend worktree.
The parallel-task preflight reports dirty due to this session's existing candidate;
there is one writer, no parallel implementation admission, and no reset/copy bypass.
No commit, push, remote issue write, merge, deployment or live provider effect is
part of this local reference approval stage.
