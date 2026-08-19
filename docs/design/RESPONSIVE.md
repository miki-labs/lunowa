# Lunowa Responsive Design Specification

## Status

**Current responsive-behavior source of truth.**

This document defines how Lunowa's stable product model adapts across viewport sizes. It does not require pixel-identical layouts across devices. The goal is to preserve orientation, information hierarchy, drafts, selected context, and core interaction semantics while progressively reducing simultaneous panes.

Visual references:

- `docs/design/references/02-desktop-conversation-default.png` — canonical wide desktop shell.
- `docs/design/references/18-tablet-layout.png` — tablet / compact multi-pane direction.
- `docs/design/references/19-mobile-layout.png` — mobile list/detail direction and component scale.

---

## 1. Responsive principles

### 1.1 Same product model, fewer simultaneous panes

Do not invent a different product for mobile. Preserve the same conceptual hierarchy:

```text
Scope / navigation
→ Conversation list
→ Conversation detail
→ 会話 / 今の要点
→ secondary context / preview
```

As width decreases, reduce how many levels are visible simultaneously instead of squeezing the desktop UI until it becomes unreadable.

### 1.2 Preserve the user's place

Responsive transitions and browser resizing should preserve, where practical:

- current scope;
- active state/filter;
- selected conversation;
- selected `会話` / `今の要点` tab;
- list scroll position;
- search query/results state;
- draft text, recipients, attachments, and sending account;
- attachment/person-context state when it can be represented safely;
- user-preferred desktop pane widths.

A viewport change must never silently discard an active draft.

### 1.3 Content-fit over device labels

`desktop`, `tablet`, and `mobile` are useful shorthand, not device detection rules.

The implementation should switch layouts when the content can no longer meet minimum readable widths. Exact CSS breakpoints may be tuned during implementation using the rendered application and reference images.

Do not hard-code behavior based on user-agent or specific device models when CSS/container/layout capability is sufficient.

### 1.4 Responsive collapse is not manual resizing

Manual split-pane resizing is a desktop preference.

Responsive collapse is a safety mechanism that overrides those preferences when the viewport cannot support them.

When the viewport later grows again, restore preferred widths where practical.

---

## 2. Layout stages

Use progressive layout stages rather than one desktop/mobile jump.

### Stage A — Wide three-pane

```text
Sidebar | Conversation List | Detail
```

Characteristics:

- full sidebar;
- full list;
- full Detail;
- splitters/resizable pane boundaries;
- person/company context or attachment preview may appear as an additional side sheet/overlay without replacing core context when enough width exists.

This is the canonical desktop layout.

### Stage B — Compact three-pane

```text
Compact Sidebar | Conversation List | Detail
```

Characteristics:

- narrower sidebar;
- reduced nonessential labels/spacing;
- list remains readable;
- Detail remains the largest pane;
- resize ranges become more constrained.

Do not shrink typography merely to keep all panes visible.

### Stage C — Icon rail + list + detail

```text
Icon Rail | Conversation List | Detail
```

Characteristics:

- navigation reduces to a compact rail;
- workspace/scope/account labels move into popovers/drawers;
- primary compose remains easy to reach;
- list and Detail still coexist.

This is appropriate for narrower laptops and landscape tablet-like widths when content still fits.

### Stage D — Two-pane

```text
Conversation List | Detail
```

Characteristics:

- global navigation moves to a drawer/sheet/top control;
- list and Detail remain side-by-side;
- selected scope/state remains visible in the header/list context;
- search remains accessible without reopening a full navigation page.

This stage is preferable to compressing an icon rail if the remaining width would harm reading.

### Stage E — Single-pane / very narrow

```text
Conversation List  ↔  Detail
```

Only one primary work surface is visible at a time.

Characteristics:

- selecting a conversation moves/pushes/slides into Detail;
- a clear Back control returns to the exact list/search context;
- `会話` / `今の要点` stays available inside Detail;
- compose and reply remain easy to access;
- transitions preserve orientation and should not feel like unrelated full-page websites.

---

## 3. Breakpoint guidance

Do not treat the following numbers as immutable product requirements. They are initial implementation guidance and must be validated against real rendered content.

Possible starting ranges:

```text
Wide desktop:        >= ~1440 CSS px
Compact desktop:     ~1180–1439 CSS px
Narrow multi-pane:   ~900–1179 CSS px
Two-pane:            ~720–899 CSS px
Single-pane:         < ~720 CSS px
```

The actual switch should be driven by the minimum usable widths of the shell components. If Japanese copy, browser zoom, or accessibility text scaling causes overflow sooner, collapse earlier rather than clip or shrink text.

---

## 4. Desktop pane sizing

### 4.1 Sidebar

Initial design target:

- comfortable preferred width roughly 200–260px;
- compact width can reduce substantially before converting to icon rail;
- exact values should be implemented as design tokens/constraints rather than scattered constants.

### 4.2 Conversation list

Initial design target:

- preferred roughly 360–480px;
- must remain wide enough for sender/topic/preview/status without pathological wrapping;
- do not reduce below a practical minimum merely to preserve three panes.

### 4.3 Detail

Detail is the primary reading surface and receives remaining width.

It should generally retain at least enough width for readable Japanese email and composer controls. If not, collapse a less-important pane first.

### 4.4 Splitters

Desktop splitters should:

- have a visually subtle line/handle;
- have a larger invisible hit target than the line itself;
- support pointer dragging;
- respect minimum/maximum sizes;
- expose accessible separator semantics if practical;
- optionally support keyboard resizing;
- double-click reset may be supported as specified in `INTERACTIONS.md`.

---

## 5. Sidebar adaptation

### Wide/compact desktop

Show:

- Lunowa logo;
- `＋ 新規メール`;
- scope switcher;
- primary lifecycle navigation;
- secondary navigation;
- accounts;
- settings.

### Icon-rail stage

Keep high-value controls as icons with tooltips/labels on hover/focus:

- Compose;
- main lifecycle destinations;
- Pin;
- More/navigation drawer;
- account/profile.

Do not depend on icon shape alone for first-time comprehension; tooltips/accessible labels are required.

### Two-pane / single-pane

Global navigation should move into a drawer/sheet or compact header menu.

Opening it must not clear selected conversation or draft state.

---

## 6. Conversation-list adaptation

### Wide desktop

Rows may show:

- avatar;
- sender/organization;
- topic;
- useful preview;
- one primary status chip;
- time/date;
- optional pin/account metadata.

### Compact/narrow

Remove low-value secondary metadata before reducing text readability.

Priority to preserve:

1. sender/organization;
2. topic;
3. state/attention indicator;
4. time/date;
5. preview.

Preview may reduce from two lines to one.

### Single-pane mobile

Rows should remain large enough for touch and scanning.

Recommended content:

- avatar/initial where useful;
- sender;
- topic;
- one-line preview;
- time/date;
- one clear state indicator;
- pin/unread indicators only when useful.

Do not place several tiny row action buttons permanently on mobile. Use swipe/long-press/overflow only if validated and accessible; a normal overflow menu is the safe baseline.

---

## 7. Detail adaptation

### Wide desktop

Detail may include:

- full header;
- tabs;
- timeline/content;
- reply composer;
- optional side sheet/context.

### Compact/two-pane

Move low-frequency header actions into `…` before reducing reading width.

Keep:

- subject/topic;
- sender identity;
- `会話` / `今の要点`;
- core reply/action path.

### Single-pane mobile

Detail uses a clear top bar with:

- Back;
- concise subject/topic;
- Pin where high-value;
- overflow.

`会話` / `今の要点` remains close to the top and easy to switch.

The message body and Moment content should scroll as one coherent detail surface; avoid nested scroll areas unless necessary for a preview/editor.

---

## 8. `今の要点` adaptation

The Moment View becomes **more selective**, not merely smaller, as width decreases.

### Wide desktop

May show:

- state headline;
- primary task;
- deadline/return condition;
- attachment/context;
- additional tasks;
- source link;
- one primary CTA and secondary actions.

### Compact/tablet

Prefer vertical stacking. Avoid side-by-side cards that leave narrow text columns.

### Mobile

Priority order:

1. current state / primary question;
2. primary Action Item;
3. deadline or return/waiting condition;
4. primary CTA if one exists;
5. concise supporting context;
6. collapsed additional tasks/source details.

Do not show all provenance/audit metadata expanded on initial mobile render.

### Multiple tasks on mobile

Show one primary task and a compact `他に2件` section. Selecting it expands or navigates within the same Detail context.

---

## 9. Reply composer adaptation

### Desktop

Inline composer at the bottom of `会話`.

### Tablet/two-pane

Keep inline composer, but collapse low-frequency formatting into a toolbar/menu when width is limited.

### Mobile

Use a bottom composer/input affordance that is always easy to reach.

It may start compact and expand when focused.

Requirements:

- attachment access;
- sender identity available before send;
- Send accessible without horizontal scrolling;
- keyboard/IME should not cover the active input or send action;
- draft must survive orientation/viewport change.

---

## 10. New-compose adaptation

### Wide desktop

New compose replaces the Detail content while Sidebar/List remain visible.

### Two-pane

Compose may occupy the Detail pane and preserve the list.

### Single-pane mobile

Compose becomes a focused single-pane editor with:

- close/back;
- From;
- To;
- Cc/Bcc disclosure;
- Subject;
- body;
- attachment/action toolbar;
- Send.

Returning from compose must preserve the draft unless the user explicitly discards it.

Minimized-draft behavior on very narrow mobile may use a small persistent draft tray rather than a desktop-style floating window.

---

## 11. Search adaptation

### Desktop

Search replaces/filters the center list while the Detail pane remains available.

### Two-pane

Same principle: results in list pane, selected result in Detail.

### Single-pane

Search begins as a dedicated list/results surface. Selecting a result opens Detail; Back returns to the same query, filters, and scroll position.

Result category chips may horizontally scroll on narrow screens rather than wrap into multiple noisy rows.

---

## 12. Person/company context adaptation

### Wide desktop

Prefer a right-side side sheet/secondary column when it does not make the conversation unreadable.

### Compact/two-pane

Use an overlay side sheet.

### Mobile

Use a full-height sheet or dedicated overlay screen with a clear close/back action.

Closing it must return to the same conversation position.

---

## 13. Attachment preview adaptation

### Wide desktop

Preview may occupy a right-side pane/overlay while leaving conversation context partially visible.

### Tablet/two-pane

Use overlay or replace Detail content with an explicit Back/Close path.

### Mobile

Use a focused preview screen/overlay.

Always preserve:

- selected conversation;
- message association;
- ability to return without re-searching;
- download/open-externally actions.

---

## 14. Menus, popovers, and sheets

Use the smallest transient surface that fits the content.

### Desktop

- dropdown/popover for short menus;
- side sheet for context;
- dialog only for decisions requiring focused confirmation.

### Mobile

- bottom sheet or full-height sheet for longer action lists;
- native-feeling popover only where space and platform behavior support it.

Menus must remain reachable with zoom/text scaling and must not render off-screen.

---

## 15. Touch, pointer, and keyboard differences

Do not rely on hover for essential functionality.

### Pointer environments

Hover may reveal quick actions and tooltips.

### Touch environments

Equivalent actions must remain reachable through visible controls or overflow menus.

### Keyboard environments

Primary interactions need logical focus order and visible focus states regardless of viewport.

---

## 16. Text, zoom, and localization resilience

Lunowa may later support English and other languages, so layout must not depend on fixed Japanese label lengths.

Rules:

- allow labels to grow within reasonable bounds;
- truncate only noncritical labels with accessible full text;
- avoid fixed-width buttons sized only for the Japanese screenshot;
- prefer flexible gaps/padding over hard-coded text geometry;
- verify at browser zoom/text scaling beyond 100%;
- never reduce font size automatically to force content into a reference screenshot.

---

## 17. Motion and navigation continuity

Transitions should explain spatial change.

Recommended:

- list → detail: short horizontal push/slide or immediate swap with clear Back context;
- navigation drawer: side slide;
- bottom sheet: vertical rise;
- preview/context overlay: subtle fade/slide.

Avoid long animation. Respect `prefers-reduced-motion` and reduce to immediate/minimal transitions.

---

## 18. Offline/error behavior across layouts

Error and offline states must not consume more screen than the impact warrants.

Examples:

- one account needs reconnect → inline/account-scoped banner/card, not full-app blocking screen;
- background sync → compact indicator;
- send failure → composer-local error preserving draft;
- AI unavailable → hide/soften AI-specific surface and keep mail content usable;
- attachment preview failure → preview-local fallback.

On mobile, banners should not permanently cover navigation or the composer.

---

## 19. Responsive accessibility baseline

At all layout stages:

- touch targets should generally meet modern platform guidance (~44 CSS px target size where applicable);
- critical text must remain readable without horizontal page scrolling;
- icon-only controls require labels;
- focus must not be hidden behind sticky headers/composers;
- color is never the only state cue;
- screen-reader reading order should match visual/logical order;
- orientation change must not discard state.

---

## 20. Verification matrix

Verify responsive behavior with realistic data, not empty shells.

At minimum test:

| Scenario | Wide | Compact | Two-pane | Single-pane |
|---|---:|---:|---:|---:|
| Conversation list + long Japanese subject | ✓ | ✓ | ✓ | ✓ |
| Row click → `会話` | ✓ | ✓ | ✓ | ✓ |
| Status chip → `今の要点` | ✓ | ✓ | ✓ | ✓ |
| Multiple Action Items | ✓ | ✓ | ✓ | ✓ |
| New compose with attachment | ✓ | ✓ | ✓ | ✓ |
| Active reply + IME keyboard | n/a | optional | optional | ✓ |
| Search and return to result list | ✓ | ✓ | ✓ | ✓ |
| Person context open/close | ✓ | ✓ | ✓ | ✓ |
| PDF preview open/close | ✓ | ✓ | ✓ | ✓ |
| Offline/send failure | ✓ | ✓ | ✓ | ✓ |
| 125–200% zoom / text scaling | ✓ | ✓ | ✓ | ✓ |

Also verify at widths just above and below each collapse threshold; breakpoint-edge defects are more important than matching one reference device.

---

## 21. Default responsive decision rule

When the layout does not fit, use this order:

1. remove/defer low-value secondary metadata;
2. tighten nonessential spacing moderately;
3. collapse global navigation;
4. reduce the number of simultaneous panes;
5. move secondary context into sheets/overlays;
6. **never** solve fit by making core text unreadably small or destroying user state.
