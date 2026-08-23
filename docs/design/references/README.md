# Lunowa Visual References

This directory contains the committed visual references used to implement Lunowa.

These images are **visual design references, not semantic specifications**. Read them together with:

- `../DESIGN.md`;
- `../INTERACTIONS.md`;
- `../RESPONSIVE.md`;
- `../../product/responsibility/README.md` when Responsibility meaning is involved.

All `00`–`19` reference images remain committed.

---

## Naming convention

Use lowercase English `kebab-case` names with a two-digit numeric prefix.

If a reference is replaced, update the canonical path rather than adding `final2`-style variants; Git history preserves prior versions.

Some filenames retain historical terms such as `action-required`, `deferred`, `follow-up`, and `completed`. **The filename is not current canonical domain terminology.** Interpret those screens through the current projections:

```text
action-required -> My Turn visual treatment
deferred        -> Later visual treatment
waiting         -> Waiting visual treatment
follow-up       -> My Turn with follow-up reason/action
completed       -> Done visual treatment
```

Review/ambiguity visuals may require a textual-spec-driven state even if no old screenshot is named for it.

---

## Critical interaction rule

- normal Conversation-row body click → `会話`;
- Responsibility/status chip click → `今の要点`.

`今の要点` must not become an unavoidable gate for ordinary mail reading.

See `../INTERACTIONS.md` for normative behavior.

---

## Reference authority

1. Current Markdown specifications define semantics, behavior, edge cases, accessibility, responsive behavior, and conflict resolution.
2. `00-brand-system.png` is strongest for brand identity/overall visual direction.
3. `01-component-system.png` is strongest for reusable component appearance.
4. `02-desktop-conversation-default.png` is strongest for desktop shell/default layout.
5. State/feature images are visual references for the state/feature they intentionally demonstrate.

A screenshot must not redefine the Responsibility model, global shell, typography, brand palette, spacing system, component language, or interaction semantics.

---

## Generated-image caveat

Do not implement something merely because it appears literally in a generated screenshot.

Non-authoritative details include:

- sample names/companies/email addresses/dates/counts/amounts/files;
- accidental wording/typos;
- legacy labels such as `スター付き` or old lifecycle wording;
- small color inconsistencies;
- provider-specific examples not otherwise specified;
- impossible/fake sample data;
- image-generation spacing artifacts.

Use images primarily for:

- visual hierarchy;
- composition/layout;
- density;
- relative sizing;
- visual tone;
- component placement;
- projection-specific treatment.

---

# Reference catalog

## Foundation

### `00-brand-system.png`

Purpose: brand identity, lunar-rabbit logo, Navy/Lunar Gold relationship, functional-state color direction, typography, border/radius/shadow/icon tone.

Authority: strongest visual brand reference; does not override semantic/interaction specs.

### `01-component-system.png`

Purpose: buttons, status chips, search/input, tabs, dropdowns, checkboxes, avatars, rows, attachment chips, composer, popovers/tooltips, empty/error examples, resize handles, hover/focus/disabled states.

Normalize repeated components toward this system when screenshots differ slightly.

---

## Desktop core and Moment View

### `02-desktop-conversation-default.png`

Purpose: canonical three-pane shell, sidebar/list/detail hierarchy, ordinary thread presentation, inline reply composer, `会話` / `今の要点` relationship.

Critical note: ordinary row click opens `会話`.

### `03-moment-action-required.png`

Visual purpose: **My Turn / 対応が必要** Moment — one primary question, one visually primary safe action, relevant due/file emphasis.

Do not infer a canonical `ACTION_REQUIRED` domain enum from the filename.

### `04-moment-deferred.png`

Visual purpose: **Later / あとで** Moment — intentional attention defer backed by a clear return promise/Temporal Contract.

Do not interpret a communication hold/waiting state as Later merely because this image exists.

### `05-moment-waiting.png`

Visual purpose: **Waiting / 待ち** Moment — who/what is pending, what the user already did, what/when Lunowa will re-check.

### `06-moment-follow-up.png`

Visual purpose: **My Turn with follow-up reason/action** — elapsed-no-reply context, prepared follow-up, Send/Edit hierarchy.

`FOLLOW_UP` is not a required canonical lifecycle state.

### `07-moment-completed.png`

Visual purpose: **Done / 完了** Moment — quiet resolution confirmation with little/no primary action.

Do not infer that every Done means successful satisfaction; cancellation/decline/user-close/supersession may need different copy.

### `08-moment-multiple-tasks.png`

Visual purpose: one Conversation with multiple Responsibilities, one primary Moment plus subordinate additional items, mixed projections.

Canonical semantic note: Responsibility state belongs to operational loops, not one Conversation lifecycle.

---

## Everyday mail functions

### `09-compose-new-email.png`

New-message compose within workspace: From/To/Cc/Bcc/Subject/body/formatting/signature/attachments/autosave/Send/Send Later/minimize/close.

### `10-search-mode.png`

Search results in center pane, categories, highlighted matches, selected result in Detail while search context remains.

Search defaults to current Scope and must not silently cross account/scope authorization boundaries.

### `11-person-context-panel.png`

Person/company context side sheet: current relevant issue, recent topics, evidence-backed facts, organization/role, files, related Conversations.

Not a CRM pipeline.

### `12-attachment-preview.png`

Preview a supported attachment without losing Conversation context.

Opening a file is not automatically completion evidence.

---

## Navigation and account management

### `13-navigation-and-action.png`

Sidebar `その他`, Conversation/message menus, desktop hover actions, keyboard/menu affordance direction.

### `14-scope-account-management.png`

Multiple provider accounts, user-understandable Scopes, add/reconnect, explicit sender account, combined/separate viewing.

Semantic note:

```text
Scope = where to look
Responsibility projection/filter = what needs attention
```

Cross-account semantic similarity does not authorize Responsibility merge.

---

## Entry, settings, and system states

### `15-onboarding-multi-account.png`

Minimal Google/Microsoft connection, immediate usability, optional second account, `一緒に見る / 分けて使う` choice.

Historical initial sync must not imply every old unanswered message becomes live My Turn work.

### `16-settings.png`

Settings information architecture and account/privacy/display direction. Screenshot may include non-v1 settings; textual scope decides shipment.

### `17-system-states.png`

Loading, syncing, offline, send failure/ambiguity, reconnect, empty state, attachment-preview failure, lightweight inline states.

Preserve user input and usable existing content whenever possible.

---

## Responsive

### `18-tablet-layout.png`

Compact multi-pane/tablet direction. Follow `RESPONSIVE.md` content-fit rules rather than physical-device assumptions.

### `19-mobile-layout.png`

Mobile list/detail, `会話` / `今の要点`, composer/action scale, touch/density direction.

Do not copy sample bottom-nav taxonomy unless current specs agree.

---

## Implementation workflow with references

Before non-trivial frontend work:

1. read relevant Markdown specs;
2. inspect `00`, `01`, `02` when global shell/styling is involved;
3. inspect only relevant state/feature references;
4. identify screenshot/spec conflicts before coding;
5. implement reusable components/tokens, not screenshot-specific duplication;
6. run the app and compare render against reference;
7. verify behavior, responsive states, keyboard/focus, loading/error states, and realistic data;
8. never derive canonical Responsibility semantics from legacy screenshot labels.

Target: one coherent product, not individually hard-coded screenshot replicas.