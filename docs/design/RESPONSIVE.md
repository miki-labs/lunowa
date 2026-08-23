# Lunowa Responsive Design Specification

## Status

**Current responsive-behavior source of truth, reconciled with Responsibility v0.1.**

This document defines how Lunowa's stable product/interaction model adapts across viewport sizes. The goal is not pixel-identical layouts. Preserve orientation, information hierarchy, drafts, selected context, Responsibility projections, and core interaction semantics while reducing simultaneous panes as width decreases.

Related sources:

- `docs/design/DESIGN.md`;
- `docs/design/INTERACTIONS.md`;
- `docs/product/responsibility/README.md`;
- `docs/design/references/02-desktop-conversation-default.png`;
- `docs/design/references/18-tablet-layout.png`;
- `docs/design/references/19-mobile-layout.png`.

Historical reference filenames do not define canonical Responsibility lifecycle semantics.

---

## 1. Responsive principles

### 1.1 Same product model, fewer simultaneous panes

Preserve:

```text
Scope / navigation
→ Conversation list
→ Conversation detail
→ 会話 / 今の要点
→ secondary context / preview
```

As width decreases, reduce simultaneous levels instead of squeezing desktop UI until unreadable.

### 1.2 Preserve the user's place

Responsive transitions/browser resizing should preserve where practical:

- current Scope;
- active filter/projection surface;
- selected Conversation;
- selected `会話` / `今の要点` tab;
- list scroll position;
- search query/results;
- draft text/recipients/attachments/sending account;
- attachment/person-context state when safely representable;
- preferred desktop pane widths.

Viewport change must never silently discard an active draft.

### 1.3 Content-fit over device labels

`desktop`, `tablet`, `mobile` are shorthand, not device-detection rules.

Switch layouts when minimum usable content widths fail. Tune CSS breakpoints against real rendered Japanese content, zoom, and accessibility scaling.

### 1.4 Responsive collapse is not manual resizing

Manual pane resizing is a desktop preference. Responsive collapse is a fit/safety override. Restore preferred widths when the viewport grows where practical.

### 1.5 Projection is not canonical state

Responsive UI may render:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

but viewport/layout code must never create a separate lifecycle model. Projection semantics stay identical across widths.

---

## 2. Layout stages

### Stage A — Wide three-pane

```text
Sidebar | Conversation List | Detail
```

Full sidebar/list/detail; resizable boundaries; secondary context/preview may use side sheet/overlay when width permits.

### Stage B — Compact three-pane

```text
Compact Sidebar | Conversation List | Detail
```

Narrower sidebar/reduced nonessential spacing, readable list, Detail remains largest. Do not shrink typography merely to preserve panes.

### Stage C — Icon rail + list + detail

```text
Icon Rail | Conversation List | Detail
```

Scope/account labels move into popovers/drawers; compose remains easy to reach; list + Detail coexist.

### Stage D — Two-pane

```text
Conversation List | Detail
```

Global navigation moves to drawer/sheet/header control. Selected Scope/filter remains visible enough to preserve orientation.

### Stage E — Single-pane

```text
Conversation List ↔ Detail
```

Selecting a Conversation opens Detail; Back restores exact list/search context. `会話` / `今の要点` remains available. Compose/reply stays accessible.

---

## 3. Breakpoint guidance

Initial guidance only; validate against rendered content:

```text
Wide desktop:        >= ~1440 CSS px
Compact desktop:     ~1180–1439 CSS px
Narrow multi-pane:   ~900–1179 CSS px
Two-pane:            ~720–899 CSS px
Single-pane:         < ~720 CSS px
```

Collapse earlier rather than clip/shrink text when Japanese copy, zoom, or text scaling requires it.

---

## 4. Desktop pane sizing

### Sidebar

Preferred roughly 200–260px; may compact before icon rail. Exact values belong in tokens/constraints.

### Conversation list

Preferred roughly 360–480px; preserve sender/topic/preview/status readability. Collapse panes before pathological wrapping.

### Detail

Receives remaining width and must preserve readable mail/composer content.

### Splitters

Use subtle visible line + larger hit target, pointer drag, min/max constraints, accessible separator semantics where practical, optional keyboard resizing, and optional reset.

---

## 5. Sidebar adaptation

### Wide/compact desktop

Show logo, compose, Scope switcher, primary Responsibility-projection destinations, secondary navigation, accounts, settings.

Do not call these destinations a canonical `lifecycle` in implementation; they are filters/projections such as My Turn/Waiting/Later/Done/Review.

### Icon rail

Keep high-value icons with tooltip/accessible labels:

- Compose;
- main projection/filter destinations;
- Pin;
- More/navigation drawer;
- account/profile.

### Two-/single-pane

Move global nav into drawer/sheet/header. Opening it must not clear Conversation/draft state.

---

## 6. Conversation-list adaptation

### Wide desktop

Rows may show avatar, sender/organization, topic, preview, one primary Responsibility/status projection, time/date, optional pin/account metadata.

### Compact/narrow

Remove low-value metadata before harming text readability.

Priority:

1. sender/organization;
2. topic;
3. projection/attention indicator;
4. time/date;
5. preview.

### Single-pane mobile

Keep touch-friendly rows with sender/topic/one-line preview/time and one clear projection indicator. Avoid permanent tiny action-button walls.

---

## 7. Detail adaptation

### Wide

Full header, tabs, timeline/content, reply composer, optional context sheet.

### Compact/two-pane

Move low-frequency header actions into overflow before reducing reading width. Preserve subject/topic, sender identity, `会話` / `今の要点`, and core reply/action path.

### Single-pane

Top bar: Back, concise topic, high-value Pin, overflow. `会話` / `今の要点` remains near top.

Avoid nested scroll areas unless preview/editor requires them.

---

## 8. `今の要点` adaptation

Moment becomes **more selective**, not merely smaller.

### Wide desktop

May show projection headline, primary Responsibility/obligation, source due/return/waiting condition, attachment/context, secondary Responsibilities, source link, one primary safe action.

### Compact/tablet

Prefer vertical stacking over narrow side-by-side cards.

### Mobile priority

1. current projection / primary question;
2. primary Responsibility/obligation;
3. due/return/waiting/review condition;
4. primary **safe** CTA if one exists;
5. concise supporting context;
6. collapsed additional Responsibilities/source details.

Do not expand audit/provenance metadata by default.

### Multiple Responsibilities

Show one primary item plus compact `他にN件` section. Use the same deterministic primary-selection rule as desktop.

### Parallel obligation legs

If one Responsibility requires multiple actors, mobile must preserve projection behavior:

```text
USER leg open -> MY_TURN
USER leg satisfied + OTHER required leg open -> WAITING
```

Do not solve narrow layout by collapsing semantics into `BOTH`.

### REVIEW

A Review Moment should show the minimum decision-critical uncertainty/source context. Narrow screens must not hide the conflict merely to simplify the card.

---

## 9. Reply composer adaptation

### Desktop

Inline at Conversation bottom.

### Tablet/two-pane

Keep inline, collapse low-frequency formatting into menu when needed.

### Mobile

Use reachable bottom composer that can expand on focus.

Requirements:

- attachment access;
- sending identity available before send;
- Send accessible without horizontal scroll;
- IME keyboard does not cover active input/send;
- draft survives orientation/viewport changes.

An ambiguous provider send result preserves draft/context and does not automatically project Done merely because Send was tapped.

---

## 10. New-compose adaptation

Wide: compose occupies Detail while Sidebar/List remain.

Two-pane: compose occupies Detail, list remains.

Single-pane: focused compose with close/back, From, To, progressive Cc/Bcc, Subject, body, attachments/actions, Send.

Back/close preserves draft unless explicitly discarded. Very narrow minimize may use a persistent draft tray instead of desktop floating window.

---

## 11. Search adaptation

Desktop/two-pane: search results in list pane; selected result in Detail.

Single-pane: dedicated results surface; selecting result opens Detail; Back restores query/filter/scroll.

Result category chips may horizontally scroll rather than create noisy wrapping.

Search/account/scope behavior remains authorization-safe at every width.

---

## 12. Person/company context adaptation

Wide: right-side secondary sheet/column only if reading remains usable.

Compact/two-pane: overlay side sheet.

Mobile: full-height sheet/overlay with clear close/back.

Closing returns to same Conversation position.

---

## 13. Attachment preview adaptation

Wide: side pane/overlay while retaining context where possible.

Tablet/two-pane: overlay or Detail replacement with explicit Back/Close.

Mobile: focused preview.

Always preserve selected Conversation/message association/return path and safe download/open-external actions.

Opening/previewing is not automatic Responsibility completion evidence.

---

## 14. Menus, popovers, sheets

Use the smallest transient surface that fits content.

Desktop: dropdown/popover for short menus, side sheet for context, dialog only for focused decisions.

Mobile: bottom/full-height sheets for longer actions.

Menus remain reachable under zoom/text scaling.

---

## 15. Touch, pointer, keyboard

Do not rely on hover for essential functionality.

Pointer may expose hover quick actions/tooltips. Touch gets visible/overflow equivalents. Keyboard gets logical focus order/visible focus across viewport sizes.

---

## 16. Text, zoom, localization resilience

- allow labels to grow;
- truncate only noncritical labels with accessible full text;
- avoid Japanese-screenshot-specific fixed button widths;
- prefer flexible gaps/padding;
- test >100% zoom/text scaling;
- never auto-reduce core font size to match a reference.

---

## 17. Motion and navigation continuity

Motion explains spatial change:

- list→detail short push/slide or clear immediate swap;
- nav drawer side slide;
- bottom sheet vertical rise;
- preview/context subtle fade/slide.

Avoid long decoration. Respect `prefers-reduced-motion`.

---

## 18. Offline/error behavior across layouts

Error/offline surfaces should match impact:

- one account reconnect -> scoped banner/card;
- sync -> compact indicator;
- send failure/ambiguity -> composer-local state preserving draft;
- AI unavailable -> ordinary mail remains usable and accepted state does not randomly reclassify;
- attachment preview failure -> preview-local fallback.

On mobile, banners must not permanently cover navigation/composer.

---

## 19. Responsive accessibility baseline

At all stages:

- appropriate touch targets (~44 CSS px where applicable);
- readable critical text without page-level horizontal scrolling;
- labels for icon-only controls;
- focus not hidden by sticky UI;
- color not sole state cue;
- screen-reader order matches logical/visual order;
- orientation change does not discard state.

---

## 20. Verification matrix

Verify with realistic data:

| Scenario | Wide | Compact | Two-pane | Single-pane |
|---|---:|---:|---:|---:|
| Conversation list + long Japanese subject | ✓ | ✓ | ✓ | ✓ |
| Row click → `会話` | ✓ | ✓ | ✓ | ✓ |
| Responsibility/status chip → `今の要点` | ✓ | ✓ | ✓ | ✓ |
| My Turn / Waiting / Later / Done / Review | ✓ | ✓ | ✓ | ✓ |
| Multiple Responsibilities | ✓ | ✓ | ✓ | ✓ |
| Parallel obligation-leg projection change | ✓ | ✓ | ✓ | ✓ |
| New compose with attachment | ✓ | ✓ | ✓ | ✓ |
| Active reply + IME keyboard | n/a | optional | optional | ✓ |
| Search and return to result list | ✓ | ✓ | ✓ | ✓ |
| Person context open/close | ✓ | ✓ | ✓ | ✓ |
| PDF preview open/close | ✓ | ✓ | ✓ | ✓ |
| Offline/send ambiguity/failure | ✓ | ✓ | ✓ | ✓ |
| 125–200% zoom/text scaling | ✓ | ✓ | ✓ | ✓ |

Also test just above/below collapse thresholds; breakpoint-edge defects matter more than matching one reference device.

---

## 21. Default responsive decision rule

When layout does not fit:

1. remove/defer low-value secondary metadata;
2. tighten nonessential spacing moderately;
3. collapse global navigation;
4. reduce simultaneous panes;
5. move secondary context into sheet/overlay;
6. never solve fit by making core text unreadable, dropping decision-critical Review/safety information, changing Responsibility semantics, or destroying user state.