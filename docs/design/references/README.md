# Lunowa Visual References

This directory contains committed visual references used to implement Lunowa.

These images are **visual design references, not Product-scope or semantic specifications**. Read them together with:

- `../../product/PRODUCT.md` — canonical Product purpose/scope;
- `../DESIGN.md` — canonical high-level Product design;
- `../INTERACTIONS.md` — canonical interaction behavior;
- `../RESPONSIVE.md` — canonical viewport adaptation;
- `../../product/responsibility/README.md` when Responsibility meaning is involved.

All `00`–`19` reference images remain committed because they preserve useful composition, component, state, and responsive design work. Their presence does **not** mean every depicted feature belongs to current v1 scope.

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

## Product-scope guardrail

A screenshot may show a capability that is now deferred, optional, provider-owned, or only a later Product possibility.

Examples include:

- broad native fresh Compose;
- Send Later;
- full Drafts/Sent/folder administration;
- broad mailbox hygiene actions;
- second-provider/multi-account breadth;
- permanent Waiting/Later top-level navigation;
- source-first landing as the only Product workflow.

Do **not** implement or restore those capabilities merely because an image exists. Current Product scope comes from `../../product/PRODUCT.md` and the live accepted experiment/Issue.

The current v1 direction is Attention-first and may use the same visual shell with different middle/detail objects:

```text
Needs You -> Attention Items -> Moment
Managed   -> Managed Items   -> Monitoring Detail / Moment
Source    -> Conversations   -> Conversation
Search    -> Results         -> Result Detail
```

---

## Critical interaction rule

Interaction depends on **which Product surface the user is in**.

- **Needs You item** → opens `今の要点` / Moment for the current user question.
- **Managed item** → opens monitoring detail / relevant Moment according to current interaction spec.
- **Source Conversation row body** → opens original `会話`.
- **Source Responsibility/status affordance** → may open the relevant `今の要点` without changing row-body Source semantics.

There is no longer one global rule saying every ordinary list row must open Conversation. `今の要点` must also never become an unavoidable gate to original source mail.

See `../INTERACTIONS.md` for normative behavior.

---

## Reference authority

1. `../../product/PRODUCT.md` defines Product value/scope/jurisdiction.
2. Current Markdown design/domain specifications define semantics, behavior, edge cases, accessibility, responsive behavior, and conflict resolution.
3. `00-brand-system.png` is strongest for brand identity/overall visual direction.
4. `01-component-system.png` is strongest for reusable component appearance.
5. `02-desktop-conversation-default.png` is strongest for the reusable desktop shell/composition pattern, **not** for Product landing/scope.
6. State/feature images are visual references for the state/feature they intentionally demonstrate, only when that feature is in current accepted scope.

A screenshot must not redefine the Responsibility model, Product scope, global typography/brand/component system, authority boundary, implementation sequence, or revive a superseded lifecycle/full-client assumption.

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
- image-generation spacing artifacts;
- feature breadth that current Product authority has deferred or made optional.

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

Authority: strongest visual brand reference; does not override Product/semantic/interaction specs.

### `01-component-system.png`

Purpose: buttons, status chips, search/input, tabs, dropdowns, checkboxes, avatars, rows, attachment chips, composer, popovers/tooltips, empty/error examples, resize handles, hover/focus/disabled states.

Normalize repeated components toward this system when screenshots differ slightly.

---

## Desktop core and Moment View

### `02-desktop-conversation-default.png`

Purpose: reusable three-pane shell, sidebar/list/detail hierarchy, ordinary Source-thread presentation, inline reply composition, and `会話` / `今の要点` visual relationship.

Critical note: this image is strongest for shell/composition, **not** for asserting that Source Inbox is Home or that every middle-pane row is a Conversation.

### `03-moment-action-required.png`

Visual purpose: **My Turn / 対応が必要** Moment — one primary question, one visually primary safe action, relevant due/file emphasis.

Do not infer a canonical `ACTION_REQUIRED` domain enum from the filename.

### `04-moment-deferred.png`

Visual purpose: **Later / あとで** Moment — intentional attention defer backed by a clear return promise/Temporal Contract.

Do not interpret a communication hold/waiting state as Later merely because this image exists.

### `05-moment-waiting.png`

Visual purpose: **Waiting / 待ち** Moment — who/what is pending, what the user already did, what/when Lunowa will re-check.

Current Product direction normally keeps Waiting quiet under Managed rather than requiring it as a permanent top-level work queue.

### `06-moment-follow-up.png`

Visual purpose: **My Turn with follow-up reason/action** — elapsed-no-reply context, prepared follow-up, Send/Edit hierarchy.

`FOLLOW_UP` is not a required canonical lifecycle state.

### `07-moment-completed.png`

Visual purpose: **Done / 完了** Moment — quiet monitoring-end/resolution explanation with little/no primary action.

Do not infer that every Done means successful satisfaction; cancellation/decline/user-close/supersession may need different copy.

### `08-moment-multiple-tasks.png`

Visual purpose: one Conversation with multiple Responsibilities, one primary Moment plus subordinate additional items, mixed projections.

Canonical semantic note: Responsibility state belongs to operational loops, not one Conversation lifecycle.

---

## Everyday mail functions

### `09-compose-new-email.png`

Historical visual exploration for native fresh-message compose: From/To/Cc/Bcc/Subject/body/formatting/signature/attachments/autosave/Send/Send Later/minimize/close.

**Current Product scope note:** broad native fresh Compose and Send Later are not current v1 Product-validation gates. Use this image only if a live accepted Product/Issue later includes native fresh compose, or for reusable composer/component ideas that also apply to contextual reply.

### `10-search-mode.png`

Search/Operational Retrieval visual direction: results in center pane, categories, highlighted matches, selected result in Detail while search context remains.

Search must respect current authorization and must not silently mutate accepted Responsibility state or authorize cross-account semantic merge.

### `11-person-context-panel.png`

Person/company context side sheet: current relevant issue, recent topics, evidence-backed facts, organization/role, files, related Conversations.

Current Product boundary: communication restoration only, not CRM pipeline/relationship scoring/personality profiling.

### `12-attachment-preview.png`

Preview a supported attachment without losing Conversation/Moment context.

Opening a file is not automatically completion evidence.

---

## Navigation and account management

### `13-navigation-and-action.png`

Historical navigation/action visual material: sidebar secondary destinations, Conversation/message menus, desktop hover actions, keyboard/menu affordance direction.

Current Product scope/navigation from `PRODUCT.md` / `DESIGN.md` wins. Do not restore permanent provider mailbox administration or old projection navigation merely because this image contains it.

### `14-scope-account-management.png`

Multiple provider accounts, user-understandable Scopes, add/reconnect, explicit sender account, combined/separate viewing.

Semantic note:

```text
Scope = where to look
Responsibility projection/filter = what needs attention
```

Cross-account semantic similarity does not authorize Responsibility merge.

**Current scope note:** second-provider/multi-account breadth is deferred until one-provider complete-loop/Product evidence justifies it. This image remains useful future visual material, not current v1 breadth authority.

---

## Entry, settings, and system states

### `15-onboarding-multi-account.png`

Historical visual exploration of Google/Microsoft connection and optional multi-account organization.

**Current onboarding direction:** connect one mailbox, preserve Source, choose one real current communication loop, explain the bounded monitoring contract, then let the user explicitly delegate that loop. Multi-account organization is not required before first value.

Historical initial sync must not imply every old unanswered message becomes live My Turn work.

### `16-settings.png`

Settings information architecture and account/privacy/display direction. Screenshot may include non-v1 settings; textual Product scope decides shipment.

### `17-system-states.png`

Loading, syncing, offline, send failure/ambiguity, reconnect, empty state, attachment-preview failure, lightweight inline states.

Current Product additionally requires monitoring-integrity degradation to be surfaced honestly when delegated scope can no longer be monitored reliably.

Preserve user input and usable existing content whenever possible.

---

## Responsive

### `18-tablet-layout.png`

Compact multi-pane/tablet direction. Follow `RESPONSIVE.md` content-fit rules rather than physical-device assumptions.

### `19-mobile-layout.png`

Mobile list/detail, Moment/Source, composer/action scale, touch/density direction.

Do not copy sample bottom-nav taxonomy or assume Source-first list semantics unless current Product/Interaction specs agree.

---

## Implementation workflow with references

Before non-trivial frontend work:

1. read `../../product/PRODUCT.md` plus the relevant current Issue/experiment contract;
2. read relevant Markdown design/domain specs;
3. inspect `00`, `01`, `02` when global shell/styling is involved;
4. inspect only relevant state/feature references;
5. classify screenshot-only feature breadth as visual history, not Product scope;
6. identify screenshot/spec conflicts before coding;
7. implement reusable components/tokens, not screenshot-specific duplication;
8. run the app and compare render against the relevant reference;
9. verify behavior, responsive states, keyboard/focus, loading/error/integrity states, and realistic data;
10. never derive canonical Responsibility semantics or Product implementation breadth from legacy screenshot labels/images.

Target: one coherent Product, not individually hard-coded screenshot replicas.