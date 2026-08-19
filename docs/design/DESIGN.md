# Lunowa Design Specification

## Status

**Current product-design source of truth.**

This document defines Lunowa's accepted product-design model, visual principles, information architecture, and implementation guardrails. It is intentionally more authoritative than any single generated screenshot.

The visual reference set under `docs/design/references/` is required implementation context, but generated screenshots can contain incidental inconsistencies, sample data, or visual artifacts. When a screenshot conflicts with this document, follow this document unless a later explicit decision supersedes it.

Related sources:

- `docs/design/INTERACTIONS.md` — interaction semantics, lifecycle behavior, Moment View, Temporal Contract, menus, compose/search/context behavior.
- `docs/design/RESPONSIVE.md` — pane behavior and responsive adaptation.
- `docs/design/references/README.md` — reference-image catalog and authority rules.

---

## 1. Product intent

Lunowa is a communication-management layer built around ordinary email workflows.

It is not trying to win by maximizing features, AI visibility, dashboard density, or provider parity. The product should reduce the amount of communication-management work the user must perform.

### North Star

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

### Internal product principle

> **Eliminate work, not control.**

The product should remove unnecessary management burden while preserving user control, reversibility, source visibility, and safe fallback behavior.

### Communication Management Burden

Lunowa should reduce four kinds of burden:

1. **Monitoring cost / 時間** — the user should not need to remember when to check again.
2. **Execution cost / 操作** — reduce searching, navigation, app switching, copying, manual task creation, and repeated clicks.
3. **Interpretation cost / 視覚・理解** — reduce the work required to reconstruct what matters from long threads.
4. **Verification cost / 信頼** — reduce repeated checking of the original message, sent state, account identity, and AI correctness without hiding the evidence needed to verify when desired.

A feature is justified when it materially reduces one or more of these burdens without creating a larger trust, complexity, or operational cost.

---

## 2. Product scope

### 2.1 In scope for the initial product

Lunowa should support the ordinary mail capabilities required to function as a credible daily email client, plus the differentiated lifecycle/attention layer.

Core capabilities:

- connect Gmail and Microsoft/Outlook accounts through provider-supported authorization flows;
- support one or multiple accounts;
- optionally group accounts into user-understandable scopes such as `仕事`, `個人`, or `大学`;
- browse conversations/threads;
- compose, reply, reply-all, and forward;
- select sender account;
- To / Cc / Bcc;
- subject editing for new messages and forwards;
- attachments;
- basic formatting;
- signatures;
- autosaved drafts;
- Sent, Drafts, Archive, Trash, Spam/Block, Read/Unread;
- search;
- pinning;
- Undo Send where technically supported by Lunowa's send pipeline;
- Send Later;
- recipient/contact autocomplete;
- multi-select and basic bulk actions where practical;
- attachment/file preview;
- person/company context surface;
- lifecycle state and Moment View;
- Temporal Contract / resurfacing behavior;
- responsive desktop/tablet/mobile UI;
- explicit error, offline, reconnect, sync, and AI-degraded states.

### 2.2 Not a v1 goal

Do not expand the first implementation into:

- a full CRM;
- a project-management suite;
- a calendar-first productivity system;
- a visual graph explorer as a primary navigation mode;
- a generic automation/rule-builder platform;
- a replacement mail transport protocol;
- a feature-complete reimplementation of every Gmail or Outlook setting;
- a chat-first AI product that requires users to prompt the system for routine work.

Those ideas may be revisited only if product evidence shows they materially improve retention, willingness to pay, or the North Star behavior.

---

## 3. Core product model

### 3.1 Conversation is not the lifecycle state

A conversation can contain multiple independent obligations. Therefore Lunowa **must not** model a thread as having one irreversible lifecycle state.

Conceptually:

```text
Conversation
├── Communication Events
│   ├── received message
│   ├── sent message
│   ├── attachment
│   ├── provider/calendar/time event
│   └── other relevant event
└── Action Items
    ├── Action Item A
    ├── Action Item B
    └── Action Item C
```

Each Action Item may have its own state, owner, deadline, confidence, risk, provenance, and Temporal Contract.

The conversation row presents an **aggregate user-facing status** derived from the active Action Items. The aggregate must not destroy the underlying task-level structure.

### 3.2 Internal Action Item states

Accepted internal state vocabulary:

```text
OPEN
ACTION_REQUIRED
DEFERRED
WAITING
FOLLOW_UP
COMPLETED
UNCERTAIN
```

These are internal product semantics. User-facing Japanese labels should remain simple and need not expose the enum names.

### 3.3 Orthogonal properties

State is not urgency and is not ownership. Keep these concepts separate.

Recommended properties include:

```text
next_owner
attention_level
confidence
risk
Temporal Contract
provenance
related_messages
related_files
```

Example `next_owner` values:

```text
USER
OTHER_PARTY
BOTH
EXTERNAL_EVENT
NONE
UNKNOWN
```

Example attention levels:

```text
NONE
LOW
NORMAL
HIGH
CRITICAL
```

Do not create exploding combined states such as `URGENT_WAITING` or `HIGH_PRIORITY_DEFERRED`.

---

## 4. User-facing lifecycle vocabulary

The primary state surfaces are:

- `すべて`
- `対応が必要`
- `あとで`
- `待ち`
- `完了`

`フォローアップ` may appear when an expected reply or event has not arrived and user action is again useful. It can be a surfaced condition/state without necessarily becoming a permanent top-level navigation item in every layout.

### 4.1 `対応が必要`

The user currently owes an action, for example:

- reply;
- submit a requested document;
- confirm a choice;
- choose a schedule;
- review and approve.

### 4.2 `あとで`

The item is not worth current attention and is safe to hold under an explicit resurfacing promise.

This state is not merely cosmetic snooze. It should be backed by a Temporal Contract when Lunowa removes the item from current attention.

### 4.3 `待ち`

The user has already done the relevant action and is now waiting on another person or external event.

### 4.4 `完了`

No current action or follow-up is needed. Completion should be inferred conservatively and must be reversible when a new relevant event arrives.

### 4.5 `フォローアップ`

An expected reply/event has not arrived by the relevant threshold or deadline, so the item should regain attention and Lunowa may prepare a follow-up action.

---

## 5. Information architecture

### 5.1 Canonical desktop shell

The canonical wide-screen structure is a stable three-pane workspace:

```text
Sidebar | Conversation List | Detail
```

This shell is the primary visual and spatial model of Lunowa.

**Stable Shell / Adaptive Content:** pane placement and core controls remain predictable while content inside Detail adapts to the selected conversation and context.

### 5.2 Sidebar

The sidebar should remain calm and limited to high-frequency navigation.

Recommended order:

```text
Lunowa brand

[ ＋ 新規メール ]

[ Current scope ▾ ]

すべて
対応が必要
あとで
待ち
ピン留め

その他 ▾

Accounts
＋ アカウント追加

設定
```

`完了`, Drafts, Sent, Scheduled, Archive, Spam, and Trash may live under `その他` when top-level density would become excessive.

Do not expose internal terminology such as `Space` merely because the implementation uses that concept. User-facing scope names should be concrete (`仕事`, `個人`, `大学`, `全体`).

### 5.3 Conversation list

The list should optimize for fast identification rather than maximum raw metadata density.

Information hierarchy:

1. who / organization;
2. topic/subject;
3. useful preview;
4. one primary status when useful;
5. time/date;
6. secondary account/provider context when useful.

A row represents a **topic/thread**, not every message and not an entire person's history.

Target desktop density should generally allow roughly 8–12 useful conversation rows in a typical laptop viewport without making text cramped.

### 5.4 Detail pane

The Detail pane is the reading/action workspace.

Its two primary modes are:

- `会話`
- `今の要点`

**`会話` is the default for an ordinary conversation-row open.**

`今の要点` is contextual and should not become a mandatory intermediate screen before reading mail.

### 5.5 Reply composer

The reply composer stays available near the bottom of the conversation view and should feel closer to a modern messaging composer than to a separate form page.

AI is an assistive control, not the dominant interaction.

---

## 6. Moment View / `今の要点`

### 6.1 Purpose

`今の要点` exists to answer one immediate question with minimal interpretation cost.

Core rule:

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

The conversation may be complex. The moment should remain simple.

### 6.2 State-specific primary questions

- `ACTION_REQUIRED` → **今、何をすればいい？**
- `DEFERRED` → **いつ戻る？**
- `WAITING` → **今は誰の番？**
- `FOLLOW_UP` → **今、何をすればいい？**
- `COMPLETED` → **もう何もしなくていい？**

### 6.3 Multiple tasks

When a conversation has multiple Action Items, do not render several equal-priority CTAs.

Preferred structure:

```text
Primary task
[ primary action ]

────────
Other items
- task/status 1
- task/status 2
```

Primary-task selection should prefer the most attention-worthy unresolved user obligation. Additional items remain visible but subordinate.

### 6.4 Progressive disclosure

Normal `今の要点` should show only what is needed for the current decision.

Do not permanently show large AI-explanation or audit cards. Instead expose provenance progressively, for example:

```text
締切 8/22 17:00   原文 ↗
```

Selecting the source should jump to or highlight the exact originating message when feasible.

---

## 7. Temporal Contract

### 7.1 Definition

A Temporal Contract is Lunowa's explicit promise describing when a communication can leave the user's current attention and under which conditions it will return.

It is an internal product concept; the UI should express the promise in plain language rather than forcing the term itself on users.

Preferred deferred copy pattern:

```text
8月21日 9:00に戻します

田中さんから返信が来れば、
それより先に戻します。

[条件を変更]
```

Avoid verbose combinations such as `今は忘れて大丈夫`, multiple competing task descriptions, and many trigger explanations in the same card.

### 7.2 Initial trigger set

MVP should prioritize high-value, explainable triggers:

- scheduled time;
- deadline threshold;
- reply received.

Richer triggers can be added later only when reliability and user comprehension are strong.

### 7.3 Active vs passive contracts

- **Active obligation:** user still owes work. Auto-hiding is riskier; conservative defaults and explicit user approval are preferred initially.
- **Passive waiting:** user has completed their action and is waiting on another party/event. Lunowa may manage attention more automatically because false hiding is less dangerous.

### 7.4 Product promise implies reliability

If the UI says `8月21日 9:00に戻します`, that is a real product promise, not decorative AI copy.

Implementation must eventually support durable execution semantics such as persistence, idempotency, retries, missed-event recovery, reconciliation, timezone correctness, provider-outage recovery, and auditability. These reliability details belong in architecture/runtime docs, but design must not promise behavior the runtime cannot honor.

---

## 8. Search

Search is a first-class navigation mode, not a separate AI feature.

Search should support useful retrieval across:

- conversations/messages;
- people;
- files;
- sender/recipient;
- subject;
- attachment names;
- message content;
- semantic/fuzzy meaning where confidence is acceptable.

Default search scope is the current user-selected scope. Broadening to `全体` should be explicit; Lunowa should not silently cross personal/work boundaries.

The UI may use result categories such as:

```text
すべて | 会話 | 人 | ファイル
```

Selecting a result should update the Detail pane while preserving search context. Exact message hits should be highlighted or scrolled into view where possible.

Do not brand ordinary retrieval as `AI Search` unless there is a user-understandable reason.

---

## 9. Person/company context

Selecting a person/avatar/company may open a context side sheet or secondary panel containing only information that helps understand the communication relationship.

Useful content:

- current active issue(s);
- recent topics;
- remembered facts with provenance;
- basic contact/organization information;
- recent files;
- related conversations.

This surface must **not** evolve into a CRM pipeline by default. No deals, stages, custom sales fields, or heavy account-management workflow without product evidence.

---

## 10. Attachments and links

Preview safe, useful file types inside Lunowa when practical:

- PDF;
- images;
- simple text/document previews where reliable.

If internal rendering is not reliable, expose download/open-externally actions rather than building a generic embedded browser.

External web links should normally open in a new browser tab so the Lunowa state remains intact.

Attachment preview should preserve conversation context rather than navigating the entire application away.

---

## 11. Visual system

### 11.1 Brand direction

Lunowa should feel:

- calm;
- trustworthy;
- warm;
- slightly soft;
- modern;
- consumer-friendly without becoming childish;
- cleaner than a dense enterprise dashboard.

The lunar-rabbit symbol is the primary brand character. Avoid introducing a second competing mascot identity.

### 11.2 Core brand colors

Canonical brand tokens derived from the accepted logo system:

- **Lunowa Navy:** `#0F1B3D`
- **Lunar Gold:** `#F2D9A6`

Functional state colors are semantically separate from brand identity. Initial intended direction:

- `対応が必要` — coral/red family;
- `あとで` — amber/orange family;
- `待ち` — blue family;
- `完了` — mint/green family.

The exact implementation tokens should be normalized once in code/design tokens; individual screenshots must not introduce random shades for the same state.

### 11.3 State color consistency

The same state should have the same semantic color across:

- sidebar markers;
- conversation chips;
- Moment View accents;
- relevant icons;
- system status surfaces.

Do not let generated screenshots create inconsistent color meaning.

### 11.4 Brand usage

The top-left logo should be recognizable but not dominate the working UI. The accepted direction is slightly smaller and quieter than early concepts.

Primary working attention belongs to mail content, not the logo.

### 11.5 Typography

Use a highly readable Japanese-capable UI sans-serif. The reference direction is close to `Noto Sans JP` / modern system sans typography.

Typography should use weight and spacing for hierarchy rather than very large headings.

### 11.6 Cards, borders, shadows

Preferred direction:

- light neutral/ivory background;
- subtle 1px borders;
- soft radius;
- restrained shadows;
- generous but not wasteful spacing.

Avoid glassmorphism, heavy gradients throughout the app, strong drop shadows, or dashboard-card overload.

### 11.7 Icons

Use a consistent line-icon family where possible. Do not mix unrelated filled, 3D, emoji, and line styles for equivalent controls.

### 11.8 Motion

Motion should preserve orientation, not decorate.

Prefer subtle:

- pane/sheet transitions;
- local fades;
- in-place content changes.

Avoid slow page-turn or full-screen theatrical transitions.

Respect reduced-motion preferences.

---

## 12. Visual grammar by information type

Use visualization only when it beats plain text.

Examples:

- time/date change → before/after diff;
- deadline → date + remaining-time emphasis;
- waiting → person/owner + waiting state;
- multiple tasks → checklist/list;
- file submission → file + primary action;
- meeting → compact brief;
- temporal sequence → timeline only when sequence is genuinely useful;
- amount change → old → new;
- schedule candidates → calendar/time slots.

A complex thread graph/tree is not a default tab. If later validated, it should be optional progressive disclosure such as `… → 会話の流れを見る`.

---

## 13. Compose experience

New mail is mandatory foundational functionality.

Desktop new compose should preserve the surrounding workspace rather than replacing the entire app with a separate page.

Expected fields/actions:

- From account selector;
- To;
- Cc/Bcc progressive disclosure;
- Subject;
- body;
- attachments / drag-and-drop;
- basic formatting;
- signature;
- draft autosave indicator;
- Send;
- Send Later;
- minimize/restore draft;
- close with safe draft preservation.

No `今の要点` is required for a fresh compose.

### Inline completion

Lunowa may provide context-aware inline completion/ghost text while typing.

For Japanese input, **never interfere during active IME composition**. Suggestions should appear only after composition confirmation and an appropriate pause/context threshold.

Repeated rejection should suppress aggressive suggestions.

---

## 14. Pinning

Prefer user-facing `ピン留め` semantics over ambiguous `重要` automation.

Pin is a **user override** and is orthogonal to lifecycle state.

```text
Lifecycle state = Lunowa interpretation
Pin = explicit user control
```

A pinned conversation remains pinned until the user unpins it, even if lifecycle state changes.

---

## 15. Onboarding

Onboarding goal:

> **使い方を教える前に、使えるようにする。**

Preferred first-run path:

```text
Googleで始める / Microsoftで始める
↓
Provider OAuth/account picker
↓
Inbox usable
```

Do not require profile questionnaires, feature carousels, rules, AI-preference configuration, or workspace setup before the user can see mail.

When a second account is added, Lunowa may ask whether to:

- `一緒に見る`
- `分けて使う`

Organization can be changed later. Do not auto-classify personal/work irreversibly with AI.

---

## 16. Trust and safety UX

### 16.1 Highest-risk false negative

The most dangerous classification error is:

> an actually required user action is incorrectly classified as waiting/completed/deferred and hidden.

Initial product behavior should therefore be conservative about hiding unresolved obligations.

### 16.2 Provenance

For extracted facts such as deadline, requested action, or completion signal, source inspection should be one click/tap away where practical.

### 16.3 Confidence-aware fallback

When interpretation confidence is too low:

- prefer ordinary mail presentation;
- avoid silently hiding the thread;
- show a lightweight uncertainty indicator only when useful;
- allow user correction.

### 16.4 Sender identity

The exact sending account must be clearly visible before sending. Cross-account mistakes are trust-destroying and should be mechanically prevented where possible.

### 16.5 Core app survives AI failure

If summarization/classification/AI drafting fails, the user must still be able to:

- read mail;
- search basic data;
- compose/reply;
- send;
- access attachments;
- change folders/views.

AI degradation must not make the mail client unusable.

---

## 17. Loading, error, offline, and update principles

System-state design follows these rules:

- keep working where possible;
- preserve user input;
- preserve context;
- explain impact and next action rather than surfacing technical error jargon first;
- use cached/stale data rather than blank screens when safe;
- recover quietly when possible;
- do not unexpectedly reorder/jump the list because new mail arrived; surface a `新しいメール` affordance instead;
- sending failure must preserve the draft;
- account reconnect problems should affect only the relevant account;
- application updates must not destroy an active draft.

---

## 18. Accessibility baseline

The visual implementation must support at least:

- keyboard focus visibility;
- usable keyboard navigation for primary desktop flows;
- semantic labels for icon-only controls;
- touch targets appropriate for mobile/tablet;
- state meaning not conveyed by color alone;
- readable contrast;
- reduced-motion support;
- zoom/text resizing without breaking core flow.

Accessibility is part of product quality, not a later decorative pass.

---

## 19. Reference interpretation rules

Generated screenshots are **visual references**, not literal data specifications.

Codex/implementers must not treat the following as requirements merely because they appear in an image:

- sample dates;
- sample names/companies;
- example email addresses;
- counts/badges;
- accidental typos;
- obsolete labels such as `スター付き` where current text specifies `ピン留め`;
- inconsistent state colors introduced by generation;
- provider-specific features not otherwise specified;
- fake numeric values or sample documents.

Use screenshots for:

- composition;
- hierarchy;
- density;
- relative scale;
- visual tone;
- component placement;
- state-specific presentation.

Use Markdown specifications for:

- behavior;
- semantics;
- state transitions;
- exact interaction rules;
- edge cases;
- accessibility;
- responsive behavior;
- conflict resolution.

---

## 20. Source-of-truth priority

Authority depends on the question being answered, but for **design-specific conflicts** use the following practical order:

1. current explicit accepted product/design decision in `docs/design/*.md`;
2. `references/00-brand-system.png` for logo/brand direction;
3. `references/01-component-system.png` for reusable component styling/states;
4. `references/02-desktop-conversation-default.png` for canonical desktop shell/layout;
5. state/feature-specific references for the specific state/feature they demonstrate.

A state-specific screenshot must not silently redefine the global shell, brand palette, typography, or component system.

---

## 21. Implementation acceptance criteria for the first high-fidelity slice

Before the UI is considered faithful enough to continue into provider/runtime integration, the implementation should demonstrate with realistic fake data:

- canonical desktop three-pane shell;
- resizable panes with safe minimums;
- normal row click → `会話`;
- status-chip click → `今の要点`;
- all key Moment View states;
- multiple Action Items with one primary task;
- new compose;
- reply composer;
- pinning;
- account/scope surface;
- search mode;
- attachment preview;
- person context surface;
- representative loading/error/offline states;
- tablet/mobile adaptation;
- keyboard focus and no major visual overflow at intended reference widths.

The purpose of this slice is to validate the interaction model and visual system before expensive Gmail/Microsoft/AI/scheduler integration locks in the wrong experience.

---

## 22. Product guardrails

When an implementation decision is ambiguous, prefer the option that:

1. reduces communication-management burden;
2. preserves user control and source visibility;
3. keeps ordinary email behavior familiar;
4. avoids unnecessary configuration;
5. avoids hidden cross-scope behavior;
6. is reversible and easy to correct;
7. is simpler to implement and maintain when product value is equivalent.

Do not add a feature merely because AI makes it easy to code.