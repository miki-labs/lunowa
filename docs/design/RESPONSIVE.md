# Lunowa Responsive Design Specification

## Status

**Canonical responsive/adaptive-behavior source of truth, reconciled through 2026-08-28 with the Product contract, Responsibility v0.1 semantics, canonical Design/Interaction behavior, and the v1 UI implementation-readiness contract.**

Responsive design preserves Lunowa's Product model while changing how many surfaces are visible at once. It must preserve orientation, source access, attention truth, monitoring integrity, pending operations, drafts, focus, and safety semantics — not pixel-identical screenshots.

Related authorities:

- `docs/product/PRODUCT.md` + `PRODUCT-CONTENT.md` — Product scope/behavior;
- `docs/product/responsibility/` — Responsibility semantic truth;
- `docs/design/DESIGN.md` — high-level IA/visual guardrails;
- `docs/design/INTERACTIONS.md` — interaction meaning;
- `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` — implementation-facing screen/state/component/read-model details;
- visual references under `docs/design/references/` — subordinate visual direction only.

If a screenshot or historical responsive example conflicts with current textual Product scope, current textual authority wins.

---

# 1. Responsive invariants

## 1.1 Same Product, fewer simultaneous panes

Conceptual spatial hierarchy:

```text
Global Navigation
-> Product Surface / List
-> Detail
-> optional supporting context
```

Examples:

```text
Needs You -> Attention Items -> Moment
Managed   -> Managed Items   -> Monitoring Detail
Review    -> Review Subjects -> Review Detail
Source    -> Conversations   -> Conversation
Search    -> Results         -> Result Detail
```

As width decreases, collapse simultaneous levels instead of shrinking core text or deleting decision-critical information.

## 1.2 Viewport never changes semantic truth

Responsive code may alter layout, density, disclosure, sheet/dialog form, or whether list/detail are simultaneous. It must **not**:

- change Responsibility semantics;
- turn Waiting into Needs You;
- collapse Review into generic tasks;
- convert stopped-by-user into Integrity degradation;
- turn capability absence into Product state;
- hide provider/send ambiguity;
- change account/session authority;
- fabricate a zero state.

## 1.3 Preserve place and work-in-progress

Across resize, orientation, browser zoom, split-screen, drawer/sheet transitions and breakpoint changes preserve where practical:

- active Product surface/filter;
- selected Responsibility/Review/Conversation/result;
- list/search query/filter/scroll position;
- current Moment/Source association;
- active draft body/recipients/attachments/from account;
- Japanese IME composition/input state where the platform permits;
- pending mutation/effect status;
- provider reconciliation state;
- selected attachment/provenance context;
- desktop pane widths.

A viewport/layout change never silently discards meaningful input or changes an accepted monitoring/action promise.

## 1.4 Content-fit, not device identity

`desktop`, `tablet`, `mobile` are shorthand only. Switch layouts when actual usable content width fails, accounting for:

- Japanese text length;
- browser zoom/text scaling;
- user font substitution;
- split-screen/window resizing;
- sticky browser/OS chrome;
- accessibility needs.

Never branch Product semantics on user-agent device labels.

---

# 2. Layout stages

Initial implementation guidance:

### Stage A — Wide three-pane

```text
Sidebar | Surface/List | Detail
```

Typical `>= ~1440 CSS px` where content actually fits.

### Stage B — Compact three-pane

```text
Compact Sidebar | Surface/List | Detail
```

Typical `~1180–1439 CSS px`.

### Stage C — Rail + list + detail

```text
Nav Rail | Surface/List | Detail
```

Typical `~900–1179 CSS px`.

### Stage D — Two-pane

```text
Surface/List | Detail
```

Typical `~720–899 CSS px`. Global navigation moves to drawer/sheet/header.

### Stage E — Single-pane

```text
Surface/List <-> Detail
```

Typical `< ~720 CSS px`. Selecting an item opens Detail; Back restores exact prior list/query/scroll/focus context.

These numbers are starting thresholds, not semantic constants. Collapse earlier rather than clip text, hide controls or reduce core font sizes.

## 2.1 Very large windows

At approximately `>=1600 CSS px`, a **user-invoked/contextual** supporting pane may show Source/provenance/attachment/person context when that capability is active and Detail remains readable.

Do not turn extra width into a permanent fourth dashboard column.

---

# 3. Desktop sizing / pane mechanics

### Navigation

Full Sidebar roughly `200–260px` before compact/rail adaptation.

### Surface/List

Roughly `360–480px` when a list exists, preserving person/topic/action/status readability.

### Detail

Receives remaining width and preserves readable Moment/Conversation/composer content.

### Splitters

If resizable panes ship:

- visible divider + larger hit target;
- sensible min/max bounds;
- no drag-only requirement;
- keyboard-accessible resizing and/or non-drag reset/size controls;
- visible focus;
- pane resize does not discard selection/draft.

---

# 4. Navigation adaptation

## Wide / compact / rail

Keep current high-value Product jobs reachable:

- Home;
- Needs You;
- Managed;
- Review only when materially populated;
- Source;
- Search;
- Settings.

Waiting/Later/Done remain projections/filters/details, not required permanent top-level destinations.

Pin is shown only when that optional capability is activated.

Generic fresh Compose is not required as a permanent primary navigation action.

## Two-/single-pane

Move global navigation into drawer/sheet/header without clearing active Detail, draft, query or pending operation.

Icon-only rail controls require accessible names and a discoverable visible/tooltip label treatment; essential meaning cannot depend on hover.

---

# 5. Home / Needs You adaptation

## 5.1 Home

At every width preserve the same question order:

1. does the user need to act/decide now?;
2. is a material monitoring promise degraded?;
3. if nothing needs attention, what is Lunowa truthfully carrying?;
4. can Source/Search be reached immediately?

A scoped Integrity message must remain visible when it invalidates reassurance.

Needs You and Review may share one attention region, but retain explicit type and routing. Do not enforce `Review always first`; attention/delay cost governs prominence.

Strict all-clear copy is allowed only under the canonical true-zero conditions. Narrow layouts must not simplify partial/degraded/Review states into false `nothing to do` copy.

## 5.2 Needs You list

Information priority at all widths:

1. current action/question;
2. person/org/topic;
3. material due/delay;
4. concise why-now when useful.

Remove low-value metadata before core meaning.

### Single-pane

Row -> focused Moment. Back restores exact attention list position and, where possible, focus to the originating row.

Background updates must not cause uncontrolled list jumps or focus theft.

---

# 6. Moment adaptation

Moment becomes **more selective**, not merely smaller.

## Wide

May show:

- current question / why now;
- one safe primary action;
- material change;
- remaining outcome;
- due/expected/return condition;
- evidence receipts;
- compact additional Responsibilities;
- Source access.

## Compact / two-pane

Prefer vertical stacking over narrow side-by-side cards. Keep one primary action visually dominant.

## Single-pane priority

1. current question / why now;
2. primary outcome/obligation;
3. due/return/waiting/Review condition;
4. one safe CTA if current action exists;
5. concise material change/context;
6. evidence/source access;
7. additional Responsibilities collapsed behind `他にN件`.

Do not expand raw AI/debug/audit data merely because there is less room.

Decision-critical Review/safety evidence is never hidden solely to simplify mobile layout.

---

# 7. Managed adaptation

## Wide

May show aggregate reassurance + intentional inspection list + selected monitoring detail.

## Compact / single-pane

Default to aggregate reassurance. `管理中を見る` opens a focused list/sheet/detail path.

Managed counts are not red backlog badges.

If monitoring integrity is degraded, affected scope/recovery remains visible at every width. Do not render healthy reassurance for degraded/stopped/non-delegated items.

Pending Stop Tracking/return-condition changes remain object-local and visible through layout changes.

---

# 8. Review adaptation

## Wide

Review list + selected bounded question may be simultaneous.

## Two-/single-pane

Selecting a Review opens a focused Detail/sheet with:

- exact question;
- minimum decision-critical evidence;
- bounded choices/input;
- Source;
- ordinary-language effect.

A pending answer remains visibly pending. If background evidence auto-resolves the Review, preserve the user's place/focus and show the resolved state rather than automatically navigating away.

When Review becomes empty, global nav/badge may disappear, but a user already on the just-resolved route keeps enough context to understand what happened.

---

# 9. Source Conversations adaptation

## Wide

Conversation list + selected Conversation.

## Compact / two-pane

Drop low-value metadata before sender/topic/time/source readability.

## Single-pane

Touch-friendly rows open Conversation Detail; Back restores list/search state and originating focus where possible.

Row body always means Source. A separate Responsibility/status affordance may open Moment without changing Source semantics.

---

# 10. Contextual Reply / Send adaptation

The **text/manual contextual reply path is CORE**. Reply attachment-add is conditional unless an accepted implementation task/scenario promotes it.

## Desktop / wide

Keep composer in/adjacent to active Moment/Conversation Detail.

## Two-pane

Keep composer in Detail; collapse low-frequency formatting/actions before core recipient/body/send information.

## Single-pane

Use a focused/reachable composer that expands with input without hiding the active context.

At every applicable layout:

- effective sender identity is inspectable before Send;
- Reply All recipients are inspectable/editable;
- Send is reachable without horizontal scrolling;
- active input is not covered by sticky UI/virtual keyboard where the platform permits avoidance;
- draft survives resize/orientation/layout transitions;
- pending/failed/ambiguous Send preserves draft/context;
- duplicate commit is prevented while Send is pending/ambiguous;
- no viewport change converts pending provider effect into Waiting/Done.

## 10.1 Japanese IME — all applicable layouts

IME safety applies **wherever an editable composer/global shortcut exists**, including desktop web, not only compact/mobile.

Verify:

- composition session tracked;
- `isComposing` handled;
- IME-processed compatibility edge such as `keyCode === 229` defensively excluded where applicable;
- first/middle/last composition key does not trigger Send/global/destructive shortcut;
- Enter in multiline editor does not implicitly Send;
- explicit Send button remains baseline commit.

---

# 11. Search adaptation

## Desktop / two-pane

Results may occupy list pane; selected result opens Detail.

## Single-pane

Dedicated result surface; Detail selection + Back restores query/filter/scroll.

## Capability-aware copy

Exact-only implementation advertises search only, e.g. `メールを検索`.

Only when NL/Q&A capability is active may copy advertise `質問`.

Search authorization/source boundaries are identical at every width. No responsive treatment may turn retrieval into mutation authority.

---

# 12. Attachment evidence access — CORE

CORE responsive obligation:

- preserve attachment existence/provenance;
- provide a safe supported access path where authorized;
- preserve the associated Conversation/Moment;
- distinguish provider/security block from local preview failure;
- never bypass provider/platform security restrictions.

Possible responsive access patterns:

- wide: inline/open-external control or optional supporting pane;
- two-pane: focused Detail/overlay;
- single-pane: focused evidence view or provider/open/download fallback with clear return path.

Opening/previewing is never completion evidence.

## 12.1 Rich native preview — conditional

Only if native rich preview capability is activated:

- wide: optional supporting pane/overlay;
- two-pane: overlay/focused Detail;
- single-pane: focused preview with explicit return.

Rich preview is not a current v1 completion gate.

## 12.2 Reply attachment add — conditional

If an accepted flow activates reply attachment-add, it must remain reachable and input-preserving at all supported widths. Its absence must not block CORE contextual text Reply unless the specific accepted scenario requires attachment submission.

---

# 13. Person context — conditional

Person/company context is not a current CORE completion gate.

If activated:

- wide: user-opened right supporting pane only if Moment/Source remains readable;
- two-pane: side/overlay sheet;
- single-pane: full-height sheet/detail with clear close/back.

Closing returns to the same Source/Moment position. Do not create CRM/navigation ontology from extra screen space.

---

# 14. App sign-in / session adaptation — CORE

Application authentication is separate from mailbox authorization.

## Wide / compact

Use a bounded centered sign-in/session card or equivalent focused surface; do not place the user inside the email shell before an authenticated application session exists.

## Single-pane

Use a full-width focused sign-in surface with readable margins and platform-appropriate keyboard behavior.

Session expiry while the user has safe local unsent input must preserve that input where architecture permits and route re-authentication without claiming server-side monitoring stopped.

Confirmed app/device sign-out returns to signed-out entry; it never visually implies mailbox disconnect or monitoring completion.

---

# 15. Mailbox connect / initial sync adaptation — CORE

## Connect mailbox

Treat connection as a focused setup step, not a dashboard pane.

- wide: bounded card/step inside setup shell;
- compact/single-pane: stacked full-width step;
- external provider authorization may leave the app; return restores setup context;
- callback/verification pending remains visible until authoritative connection is confirmed.

Do not claim connected merely because an external provider page closed.

## Initial sync

At every width:

- show truthful coverage/data-through only when known;
- incomplete coverage != zero;
- Source becomes usable as data safely arrives;
- historical unanswered mail is not auto-promoted into live work;
- failure/degradation explains affected scope and recovery.

Progress UI must fit without obscuring Source navigation once Source is usable.

---

# 16. First delegation / onboarding adaptation — CORE

The normal setup flow remains linear and bounded:

```text
connect
-> sync/Source usable
-> choose suitable current loop
-> inspect bounded monitoring promise
-> explicit delegate request
-> pending
-> confirmed appropriate state
```

## Wide

Source/list and selected candidate may be shown together only if it improves comprehension without implying all mail is candidate work.

## Compact / single-pane

Use list -> focused delegation detail -> Back with exact source position.

Pending delegation survives breakpoint/orientation changes and never displays confirmed Managed reassurance until accepted.

## No suitable loop

At every width provide a truthful skip/finish path:

- no fabricated Responsibility;
- no forced historical activation;
- Source remains usable;
- user can delegate later.

---

# 17. Integrity / reconnect adaptation — CORE

Material Integrity UI must remain visible without becoming a permanent screen-blocking alarm.

## Wide

Use scoped banner/card near affected account/surface, with optional affected-item list/detail.

## Compact / single-pane

Use a compact persistent banner/card that does not permanently cover global navigation, Review, Moment CTA or active composer.

Must expose as applicable:

- affected capability/account/scope;
- what is not trustworthy;
- last trustworthy observation/as-of;
- affected live delegation scope/count;
- what remains safe/usable;
- recovery action.

Reconnect state persists through layouts:

```text
degraded
-> reconnecting
-> provider access restored
-> reconciling missed interval
-> healthy
```

Do not restore healthy Managed reassurance before reconciliation is complete.

---

# 18. Settings adaptation — CORE/release-required as capability exists

Render only supported controls.

## Wide

May use left section navigation + readable settings detail or a bounded two-column layout where useful.

## Compact / single-pane

Stack sections vertically; section navigation may become list -> detail. Do not force dense multi-column controls.

For persisted settings:

- accepted value remains distinguishable from pending change;
- save/pending/failure stays near the control;
- viewport changes preserve pending user input;
- failed persistence cannot leave a false accepted toggle.

Keep app sign-out, reconnect, mailbox disconnect, and Product-account deletion visually and semantically distinct at every width.

---

# 19. Intentional mailbox disconnect adaptation — CORE lifecycle

Disconnect with live delegated work is decision-consequential.

## Wide / desktop

Use a focused dialog or dedicated confirmation detail containing:

- exact account;
- monitoring consequence;
- affected count/scope;
- inspect affected items;
- explicit `stop monitoring != outcome completed` meaning;
- precise commit label.

## Single-pane

Use a full-height or sufficiently large sheet/detail so decision-critical consequences are not clipped. Avoid tiny bottom sheets for long destructive copy.

Pending disconnect state must remain visible if layout changes. Failure leaves prior accepted connection state until evidence says otherwise.

---

# 20. Product-account deletion adaptation — release-gated

The final release flow is gated by accepted legal/privacy/data-retention behavior.

## Wide

Use dedicated destructive settings detail + explicit final confirmation dialog where appropriate.

## Single-pane

Use dedicated full-page/full-height confirmation with readable consequence hierarchy.

Do not truncate or hide legal/data consequences merely to fit compact UI.

Pending deletion must be persistent and non-toast-only. Do not invent SLA/retention/export/billing/provider-revocation behavior.

---

# 21. Transient surfaces

Use the smallest surface that fits the job **without clipping decision-critical content**:

- dropdown/popover: short low-risk menus;
- side sheet: supporting context/Managed/person where appropriate;
- dialog: focused consequential decisions on wide layouts;
- full-height/focused sheet/detail: long decisions or compact destructive flows.

Do not modalize routine Source opening, Managed inspection, or harmless uncertainty.

---

# 22. Background updates / focus continuity

Truth may update immediately in the data/read model; presentation must preserve orientation.

- stable keys for rows;
- do not steal focus on background update;
- do not reorder the active/focused/edited row underneath the user where avoidable;
- if Review auto-resolves in background, preserve current route/focus and show resolved state before user chooses navigation;
- when a user action removes/resolves an item, move focus predictably to next logical item/heading;
- opening/closing drawer/sheet/dialog returns focus appropriately.

These rules apply at every breakpoint.

---

# 23. Touch / pointer / keyboard

- no essential hover-only behavior;
- touch gets visible/overflow equivalents for pointer hover actions;
- full Product-critical flow keyboard-operable;
- logical Tab/Shift+Tab order;
- visible focus;
- Escape closes safe transient surface and returns focus;
- sticky UI never obscures focused control;
- splitter drag has keyboard/non-drag alternative if splitters ship.

---

# 24. Text / zoom / Japanese resilience

WCAG 2.2 AA is the web release baseline.

At every layout stage:

- allow labels to grow;
- preserve critical content under user font substitution;
- test at least 125%, 150%, 200% browser zoom/text scaling and required WCAG reflow conditions;
- avoid screenshot-specific fixed button widths;
- do not reduce core font size solely to preserve pane count;
- avoid long/synthetic italic Japanese as hierarchy;
- no page-level horizontal scroll for ordinary core reading at required reflow conditions, except standards-permitted content cases;
- truncation never removes decision-critical meaning without accessible full text.

---

# 25. Accessibility across layouts

At every stage:

- applicable WCAG 2.2 AA criteria must be met;
- target minimum >=24×24 CSS px unless a standards-defined exception applies;
- compact/touch primary controls generally target ~44×44 CSS px;
- normal text/non-text contrast meets applicable AA requirements;
- color is never sole state signal;
- focus is visible and not obscured;
- screen-reader order follows logical/visual order;
- programmatic status updates do not require focus movement;
- reduced motion honored;
- orientation/layout change does not discard state;
- decision-critical Review/integrity/account consequences remain reachable.

---

# 26. Motion

Motion explains spatial continuity, not status truth:

- list -> detail may use short push/slide/clear swap;
- nav drawer side transition;
- sheet/dialog subtle transition;
- supporting context subtle transition.

Respect `prefers-reduced-motion`. No semantic state is conveyed only by animation.

---

# 27. Verification matrix

`CORE` rows are mandatory wherever the capability exists in current v1 scope. `CONDITIONAL` rows become mandatory only if a later accepted implementation task activates that capability.

| Scenario | Scope | Wide | Compact | Two-pane | Single-pane |
|---|---|---:|---:|---:|---:|
| App sign-in / session / sign-out | CORE | ✓ | ✓ | ✓ | ✓ |
| Home attention + strict-zero/integrity truth | CORE | ✓ | ✓ | ✓ | ✓ |
| Needs You -> Moment | CORE | ✓ | ✓ | ✓ | ✓ |
| Managed reassurance / inspection | CORE | ✓ | ✓ | ✓ | ✓ |
| Review list/detail + background auto-resolution | CORE | ✓ | ✓ | ✓ | ✓ |
| Source row -> Conversation | CORE | ✓ | ✓ | ✓ | ✓ |
| Source status affordance -> Moment | CORE | ✓ | ✓ | ✓ | ✓ |
| My Turn / Waiting / Later / Done / Review projection | CORE | ✓ | ✓ | ✓ | ✓ |
| Multiple Responsibilities / one primary Moment | CORE | ✓ | ✓ | ✓ | ✓ |
| Contextual text/manual Reply | CORE | ✓ | ✓ | ✓ | ✓ |
| Send pending / failure / ambiguity / reconciliation | CORE | ✓ | ✓ | ✓ | ✓ |
| Japanese IME in every applicable editable composer/shortcut context | CORE | ✓ | ✓ | ✓ | ✓ |
| Exact Search + return continuity | CORE | ✓ | ✓ | ✓ | ✓ |
| Attachment evidence safe access/fallback | CORE | ✓ | ✓ | ✓ | ✓ |
| Connect mailbox + callback verification | CORE | ✓ | ✓ | ✓ | ✓ |
| Initial sync / partial coverage / no false zero | CORE | ✓ | ✓ | ✓ | ✓ |
| First delegation + no-suitable-loop skip | CORE | ✓ | ✓ | ✓ | ✓ |
| Integrity / reconnect / interval reconciliation | CORE | ✓ | ✓ | ✓ | ✓ |
| Settings accepted/pending/failure state | CORE | ✓ | ✓ | ✓ | ✓ |
| Intentional disconnect decision/pending/failure | CORE | ✓ | ✓ | ✓ | ✓ |
| Product-account deletion boundary | RELEASE-GATED | ✓ | ✓ | ✓ | ✓ |
| 125–200% zoom/text scaling + required reflow | CORE | ✓ | ✓ | ✓ | ✓ |
| Rich native attachment preview | CONDITIONAL | if active | if active | if active | if active |
| Reply attachment add | CONDITIONAL | if active | if active | if active | if active |
| Person/context panel | CONDITIONAL | if active | if active | if active | if active |
| Natural-language Search/Q&A | CONDITIONAL | if active | if active | if active | if active |
| Pin/digest/quiet-hours preference UI | CONDITIONAL | if active | if active | if active | if active |

Fresh native new-Compose parity, Forward parity, second provider, broad mailbox administration and generic automation are **not** responsive acceptance rows for the current Minimum Complete Delegation Loop.

---

# 28. Default responsive decision rule

When content does not fit:

1. remove/defer low-value secondary metadata;
2. tighten nonessential spacing moderately;
3. collapse global navigation;
4. reduce simultaneous panes;
5. move **activated** supporting context into sheet/overlay/detail;
6. preserve pending input/effect state;
7. never solve fit by making core text unreadable, dropping decision-critical Review/integrity/account information, changing Responsibility semantics, advertising unsupported capability, or destroying user state.

When a feature is conditional, responsive documentation describes how it behaves **if activated**; it does not promote that feature into v1 CORE scope.
