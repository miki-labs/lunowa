# Lunowa Visual References

This directory contains the committed visual references used to implement Lunowa.

These images are **design references**, not self-sufficient specifications. They should always be read together with:

- `../DESIGN.md`
- `../INTERACTIONS.md`
- `../RESPONSIVE.md`

All `00`–`19` reference images are currently committed.

---

## Naming convention

Use lowercase English `kebab-case` file names with a two-digit numeric prefix.

Do not use temporary names such as `final`, `new`, `latest`, dates, or generated names such as `imagegen.png`.

If a visual reference is replaced, update the existing canonical path rather than creating `final2` variants. Git history already preserves prior versions.

---

## Critical interaction rule

The most important behavior that screenshots alone can be misread about is:

- **normal conversation-row body click → open `会話`**;
- **status-chip click → open `今の要点`**.

`今の要点` is contextual and must not become an unavoidable intermediate screen for ordinary conversation reading.

See `../INTERACTIONS.md` for the normative behavior.

---

## Reference authority

For design questions, use the following practical interpretation rules:

1. Current accepted textual specifications in `docs/design/*.md` define behavior, semantics, state transitions, exact rules, edge cases, accessibility, responsive behavior, and conflict resolution.
2. `00-brand-system.png` is canonical for brand identity and overall visual direction.
3. `01-component-system.png` is canonical for reusable component appearance and component states.
4. `02-desktop-conversation-default.png` is canonical for the desktop shell and default layout.
5. State/feature-specific images are canonical for the state/feature they intentionally demonstrate.

A state-specific screenshot must not silently redefine the global shell, typography, brand palette, spacing system, component language, or interaction semantics.

---

## Generated-image caveat

These references were generated/iterated as design artifacts. They may contain incidental inconsistencies that are **not requirements**.

Do not implement something merely because it appears literally in a screenshot if it conflicts with the Markdown specs.

Examples of non-authoritative screenshot details:

- sample names, companies, email addresses, dates, counts, amounts, and filenames;
- accidental wording/typos;
- legacy labels such as `スター付き` when the current design uses `ピン留め`;
- small color inconsistencies between generated screens;
- provider-specific actions that were included as visual examples but are not otherwise specified;
- impossible/fake sample data;
- minor spacing artifacts caused by image generation.

Use the images primarily for:

- visual hierarchy;
- composition/layout;
- density;
- relative sizing;
- visual tone;
- component placement;
- state-specific visual treatment.

---

# Reference catalog

## Foundation

### `00-brand-system.png`

Purpose:

- Lunowa brand identity;
- lunar-rabbit logo direction;
- Navy / Lunar Gold relationship;
- functional state-color direction;
- typography direction;
- border/radius/shadow/icon tone.

Authority:

- strongest visual reference for brand identity;
- does not override interaction semantics.

### `01-component-system.png`

Purpose:

- buttons;
- status chips;
- search/input fields;
- segmented/tabs;
- dropdowns;
- checkboxes;
- avatars;
- conversation rows;
- attachment chips;
- composer;
- popovers/tooltips;
- empty/error examples;
- resize handles;
- hover/focus/disabled direction.

Authority:

- reusable component language;
- normalize repeated components from other screenshots toward this system when there is a small visual discrepancy.

---

## Desktop core and Moment View

### `02-desktop-conversation-default.png`

Purpose:

- canonical three-pane desktop shell;
- sidebar/list/detail proportions and hierarchy;
- normal conversation thread presentation;
- inline reply composer;
- `会話` / `今の要点` relationship.

Critical semantic note:

- normal row click opens `会話` even if another screenshot happens to show `今の要点` selected.

### `03-moment-action-required.png`

Purpose:

- `ACTION_REQUIRED` / `対応が必要` Moment View;
- one primary question;
- one visually primary action;
- deadline/file/task emphasis.

### `04-moment-deferred.png`

Purpose:

- `DEFERRED` / `あとで` Moment View;
- Temporal Contract presentation;
- explicit return time and earlier reply trigger;
- `条件を変更` behavior direction.

Important:

- do not copy unnecessarily verbose reassurance text if it conflicts with the concise Temporal Contract rules in `INTERACTIONS.md`.

### `05-moment-waiting.png`

Purpose:

- `WAITING` / `待ち` Moment View;
- make clear whose turn it is;
- show what the user already did;
- show what Lunowa will check next.

### `06-moment-follow-up.png`

Purpose:

- `FOLLOW_UP` state;
- elapsed-no-reply context;
- prepared follow-up draft;
- Send/Edit hierarchy.

### `07-moment-completed.png`

Purpose:

- `COMPLETED` state;
- quiet completion confirmation;
- minimal/no primary action.

### `08-moment-multiple-tasks.png`

Purpose:

- one conversation with multiple Action Items;
- one primary task plus subordinate additional tasks;
- visual separation of mixed states.

Critical semantic note:

- Action Item state belongs to the task, not as one destructive state attached to the entire Conversation.

---

## Everyday mail functions

### `09-compose-new-email.png`

Purpose:

- new-message compose inside the existing workspace;
- From / To / Cc/Bcc / Subject / body;
- formatting;
- signature;
- attachments;
- draft autosave;
- Send / Send Later;
- minimize/close.

### `10-search-mode.png`

Purpose:

- search results in the center pane;
- categories such as conversation/person/file;
- highlighted matches;
- selected result shown in Detail while search context is retained.

Semantic note:

- search defaults to current scope and must not silently cross personal/work scopes.

### `11-person-context-panel.png`

Purpose:

- person/company context side sheet;
- current issue;
- recent topics;
- remembered facts;
- organization/role;
- recent files/related conversations.

Non-goal:

- this is not a CRM pipeline UI.

### `12-attachment-preview.png`

Purpose:

- preview a supported attachment without losing conversation context;
- page/zoom/download/open-external controls;
- association between file and source message.

---

## Navigation and account management

### `13-navigation-and-action.png`

Purpose:

- sidebar `その他` expansion;
- conversation-level `…` menu;
- individual-message `…` menu;
- desktop hover quick actions;
- keyboard/menu affordance direction.

Note:

- this repository currently uses the singular canonical filename `13-navigation-and-action.png`.

### `14-scope-account-management.png`

Purpose:

- multiple provider accounts;
- user-understandable scopes such as Work/Personal/University/All;
- add/reconnect account;
- default sending account;
- combined vs separated viewing.

Semantic note:

- Scope answers **where to look**. Lifecycle/search filters answer **what to look at**.

---

## Entry, settings, and system states

### `15-onboarding-multi-account.png`

Purpose:

- minimal first-run Google/Microsoft connection;
- immediate usability after account connection;
- optional second-account connection;
- `一緒に見る / 分けて使う` progressive choice.

### `16-settings.png`

Purpose:

- settings information architecture;
- account details;
- general/display/privacy-related settings direction;
- reconnect/remove account treatment.

The screenshot may show settings that are not required for v1. `DESIGN.md` and product scope decide what ships.

### `17-system-states.png`

Purpose:

- initial loading;
- syncing;
- offline;
- send failure;
- account reconnect;
- empty state;
- attachment-preview failure;
- lightweight inline state examples.

Critical behavior:

- preserve user input and existing usable content whenever possible.

---

## Responsive

### `18-tablet-layout.png`

Purpose:

- compact multi-pane/tablet direction;
- reduced navigation rail;
- list + Detail coexistence where space permits;
- component density at intermediate widths.

Do not assume the depicted physical device is a hard breakpoint. Follow `RESPONSIVE.md` content-fit rules.

### `19-mobile-layout.png`

Purpose:

- mobile conversation list and Detail;
- `会話` / `今の要点` switching;
- mobile composer/action scale;
- touch-target and visual-density direction.

Do not copy any sample bottom-navigation taxonomy unless it matches the current product specification.

---

## Implementation workflow with these references

Before a non-trivial frontend implementation task:

1. read the relevant `docs/design/*.md` files;
2. inspect `00`, `01`, and `02` when global styling/shell is involved;
3. inspect only the state/feature references relevant to the task;
4. identify any screenshot/spec conflict before coding;
5. implement with reusable components/design tokens rather than per-screen duplication;
6. run the application and compare the rendered result against the relevant reference;
7. verify behavior, responsive states, keyboard/focus, loading/error states, and realistic data—not just a static screenshot match.

The target is a coherent product implementation, not a collection of individually hard-coded screenshot replicas.
