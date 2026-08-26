# Lunowa Responsive Design Specification

## Status

**Canonical responsive-behavior source of truth, reconciled with the 2026-08-27 Product/Design/Interaction contract and Responsibility v0.1.**

Responsive design preserves Lunowa's Product model while reducing simultaneous panes as width decreases. It must preserve orientation, source access, current attention state, Moment context, drafts, and safety semantics — not pixel-identical screenshots.

Related authorities:

- `docs/product/PRODUCT.md`;
- `docs/design/DESIGN.md`;
- `docs/design/INTERACTIONS.md`;
- `docs/product/responsibility/`;
- visual references under `docs/design/references/`.

---

# 1. Responsive principles

## 1.1 Same Product, fewer simultaneous panes

The stable spatial pattern is conceptually:

```text
Navigation
-> Surface/List
-> Detail
-> optional secondary context/preview
```

Depending on Product surface:

```text
Needs You -> Attention Items -> Moment
Managed   -> Managed Items   -> Monitoring Detail / Moment
Source    -> Conversations   -> Conversation
Search    -> Results         -> Result Detail
```

As width decreases, collapse simultaneous levels instead of squeezing text.

## 1.2 Preserve the user's place

Viewport/layout changes should preserve where practical:

- active Product surface/filter;
- selected Responsibility/Conversation;
- selected Moment/Source context;
- list/search scroll/query;
- active contextual draft, recipients, attachments, sending account;
- attachment/person context;
- preferred desktop pane widths.

Viewport change never silently discards meaningful input.

## 1.3 Content-fit over device labels

`desktop/tablet/mobile` are shorthand. Switch layouts when minimum usable content widths fail, including Japanese copy, zoom, and accessibility scaling.

## 1.4 Projection semantics do not change by viewport

Responsive code may render My Turn/Waiting/Later/Done/Review differently, but it must not create a separate lifecycle model or simplify away decision-critical safety information.

---

# 2. Layout stages

### Stage A — Wide three-pane

```text
Sidebar | Surface/List | Detail
```

Full navigation/list/detail; resizable boundaries. Optional context/preview may use a secondary side sheet/overlay.

### Stage B — Compact three-pane

```text
Compact Sidebar | Surface/List | Detail
```

Reduce nonessential spacing/navigation width before harming text.

### Stage C — Rail + list + detail

```text
Nav Rail | Surface/List | Detail
```

Keep high-value Product surfaces accessible. Generic fresh Compose is not required to occupy a permanent primary rail action.

### Stage D — Two-pane

```text
Surface/List | Detail
```

Global navigation moves to drawer/sheet/header while current surface remains visible enough for orientation.

### Stage E — Single-pane

```text
Surface/List ↔ Detail
```

Selecting an item opens Detail; Back restores exact surface/search/list context.

---

# 3. Initial breakpoint guidance

Validate against rendered content rather than hard device assumptions:

```text
Wide desktop:        >= ~1440 CSS px
Compact desktop:     ~1180–1439 CSS px
Narrow multi-pane:   ~900–1179 CSS px
Two-pane:            ~720–899 CSS px
Single-pane:         < ~720 CSS px
```

Collapse earlier rather than clip/shrink core content.

---

# 4. Desktop sizing

### Sidebar

Roughly 200–260px before compact/rail adaptation.

### Surface/List

Roughly 360–480px where a list exists. Preserve person/topic/action/status readability.

### Detail

Receives remaining width and must preserve readable Moment/Conversation/composer content.

### Splitters

Use subtle visible line + larger hit target, pointer drag, sensible bounds, accessible separator semantics where practical, optional keyboard resizing/reset.

---

# 5. Navigation adaptation

## Wide/compact

Expose high-value Product jobs such as Home, Needs You, Managed, conditional Review, Source, Pin/Search/Settings according to current Design.

Waiting/Later/Done may appear as filters/details where appropriate; do not require them as permanent top-level destinations at every width.

## Rail

Use icon-only controls only where their meaning remains clear with tooltip/accessible labels.

## Two-/single-pane

Move global nav into drawer/sheet/header without clearing current Detail/draft state.

---

# 6. Needs You / Home adaptation

## Wide

May show attention list and selected Moment simultaneously.

## Compact/two-pane

Preserve:

1. one current action/question;
2. due/delay signal;
3. person/topic;
4. concise why-now.

Remove low-value metadata before text clarity.

## Single-pane

Needs You card opens a focused Moment. Back returns to exact attention list position.

Unread/source volume must not displace current-action hierarchy.

---

# 7. Moment adaptation

Moment becomes **more selective**, not merely smaller.

### Wide

May show current question, material due/return condition, supporting evidence, additional items, source access, and one primary safe action.

### Compact/tablet

Prefer vertical stacking over narrow side-by-side cards.

### Mobile priority

1. why-now/current question;
2. primary obligation/outcome;
3. due/return/waiting/review condition;
4. primary **safe** CTA if one exists;
5. concise supporting context;
6. collapsed additional Responsibilities/source details.

Do not expand raw audit/model data by default.

### Multiple Responsibilities

Show one primary item plus compact `他にN件`. Preserve canonical selection semantics.

### Review

Never hide decision-critical conflict/safety evidence just to simplify mobile layout.

---

# 8. Managed adaptation

### Wide

May show aggregate reassurance + intentional inspection list + selected monitoring detail.

### Compact/mobile

Default to aggregate reassurance. Opening `管理中を見る` reveals items in a focused list/sheet.

Managed counts are not a backlog badge. Avoid tiny permanent controls on every item.

If monitoring integrity is degraded, affected scope/recovery must remain visible at every width.

---

# 9. Source Conversations adaptation

### Wide

Conversation list + selected Conversation.

### Compact/two-pane

Remove low-value metadata before sender/topic/time/source readability.

### Single-pane

Touch-friendly source rows open Conversation detail; Back restores list/search state.

A source status/projection affordance may reach Moment, but the row body remains Source interaction.

---

# 10. Contextual reply adaptation

### Desktop

Reply/composer remains near active Conversation/Moment where practical.

### Tablet/two-pane

Keep in Detail; collapse low-frequency formatting/actions.

### Mobile

Use reachable bottom/focused composer that can expand on focus.

Requirements:

- effective sender identity available before Send;
- Reply All recipients inspectable;
- attachment access for supported flows;
- Send reachable without horizontal scroll;
- IME keyboard does not cover active input/send;
- draft survives orientation/viewport changes;
- ambiguous provider send preserves draft/context.

Generic fresh compose is optional v1 convenience. If present, it follows the same input-preservation/accessibility rules but is not a Product-validation requirement.

---

# 11. Search adaptation

### Desktop/two-pane

Results may occupy the list pane; selected result opens Detail.

### Single-pane

Dedicated results surface; selecting a result opens Detail; Back restores query/filter/scroll.

Operational answers preserve source links and current-state context. Search/account authorization boundaries remain identical across widths.

---

# 12. People/context adaptation

### Wide

Use a right-side sheet/secondary column only if it does not impair reading/Moment width.

### Compact/two-pane

Overlay side sheet.

### Mobile

Full-height sheet/overlay with clear close/back.

Closing returns to the same source/Moment position.

---

# 13. Attachment preview adaptation

Wide: side pane/overlay where useful.

Tablet/two-pane: overlay or focused Detail with explicit return.

Mobile: focused preview.

Always preserve selected Conversation/Message/Moment association and safe download/open-external fallback.

Opening/previewing is not Responsibility completion evidence.

---

# 14. Transient surfaces

Use the smallest surface that fits the job:

- desktop dropdown/popover for short menus;
- side sheet for context/Managed/person details;
- dialog only for focused decisions;
- mobile bottom/full-height sheet for longer decisions.

Do not use modal dialogs for harmless uncertainty or routine monitoring details.

---

# 15. Touch / pointer / keyboard

Do not rely on hover for essential functionality.

Pointer may expose hover quick actions/tooltips. Touch requires visible/overflow equivalents. Keyboard must have logical focus order and visible focus at every viewport stage.

---

# 16. Text / zoom / localization resilience

- allow labels to grow;
- truncate only noncritical labels with accessible full text;
- avoid screenshot-specific fixed button widths;
- prefer flexible spacing;
- test >100% zoom/text scaling;
- never reduce core font size merely to preserve pane count.

---

# 17. Motion and continuity

Motion explains spatial change, not decorates:

- list → detail short push/slide or clear swap;
- navigation drawer side slide;
- sheet vertical/fade transition;
- preview/context subtle transition.

Respect `prefers-reduced-motion`.

---

# 18. Offline/error/integrity across layouts

Error UX matches impact:

- one-account reconnect → scoped banner/card;
- sync/integrity degradation → affected monitoring scope visible;
- send failure/ambiguity → composer/Moment-local state preserving input;
- AI unavailable → Source/basic search/manual contextual communication remains usable where runtime supports it;
- attachment preview failure → local fallback.

Mobile banners must not permanently cover navigation/composer or hide urgent Review/safety information.

---

# 19. Accessibility baseline

At every layout stage:

- appropriate touch targets (~44 CSS px where applicable);
- readable critical text without page-level horizontal scrolling;
- labels for icon-only controls;
- focus not hidden by sticky UI;
- color not sole state cue;
- screen-reader order matches logical/visual order;
- orientation change does not discard state;
- decision-critical Review/integrity information remains reachable.

---

# 20. Verification matrix

Verify with realistic Product-relevant data:

| Scenario | Wide | Compact | Two-pane | Single-pane |
|---|---:|---:|---:|---:|
| Home / Needs You attention hierarchy | ✓ | ✓ | ✓ | ✓ |
| Needs You -> Moment | ✓ | ✓ | ✓ | ✓ |
| Managed reassurance / inspection | ✓ | ✓ | ✓ | ✓ |
| Source row -> Conversation | ✓ | ✓ | ✓ | ✓ |
| Source status affordance -> Moment | ✓ | ✓ | ✓ | ✓ |
| My Turn / Waiting / Later / Done / Review | ✓ | ✓ | ✓ | ✓ |
| Multiple Responsibilities | ✓ | ✓ | ✓ | ✓ |
| Parallel obligation-leg projection | ✓ | ✓ | ✓ | ✓ |
| Contextual reply + attachment | ✓ | ✓ | ✓ | ✓ |
| Active Japanese IME input | n/a | optional | optional | ✓ |
| Search + return continuity | ✓ | ✓ | ✓ | ✓ |
| People/context open-close | ✓ | ✓ | ✓ | ✓ |
| Attachment preview | ✓ | ✓ | ✓ | ✓ |
| Integrity/send ambiguity/error | ✓ | ✓ | ✓ | ✓ |
| 125–200% zoom/text scaling | ✓ | ✓ | ✓ | ✓ |

Fresh native new-compose parity is **not** a required Product-validation row unless a live accepted experiment explicitly adds it.

---

# 21. Default responsive decision rule

When content does not fit:

1. remove/defer low-value secondary metadata;
2. tighten nonessential spacing moderately;
3. collapse global navigation;
4. reduce simultaneous panes;
5. move secondary context into sheet/overlay;
6. never solve fit by making core text unreadable, dropping decision-critical Review/integrity information, changing Responsibility semantics, or destroying user state.