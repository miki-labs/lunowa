# Lunowa Design Specification

## Status

**Current product-design source of truth, reconciled with Responsibility v0.1.**

This document defines Lunowa's accepted product-design model, visual principles, information architecture, and implementation guardrails. It is more authoritative than any single generated screenshot.

Visual references under `docs/design/references/` remain required implementation context, but screenshots can contain incidental inconsistencies/sample data/artifacts. When a screenshot conflicts with current Markdown semantics, follow the current textual specification.

Related sources:

- `docs/design/INTERACTIONS.md` — interaction/projection behavior, Moment View, Temporal Contract, menus, compose/search/context/error behavior;
- `docs/design/RESPONSIVE.md` — pane/responsive adaptation;
- `docs/design/references/README.md` — visual-reference authority/caveats;
- `docs/product/responsibility/README.md` — canonical Responsibility semantic source map.

---

## 1. Product intent

Lunowa is a communication-management layer built around ordinary email workflows.

It should not win by maximizing features, visible AI, dashboard density, or provider parity. It should reduce Communication Management Burden.

### North Star

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

### Internal principle

> **Eliminate work, not control.**

Remove unnecessary management work while preserving source visibility, user authority, reversibility, and safe fallback.

### Communication Management Burden

Reduce:

1. **Monitoring cost / 時間** — user should not remember when to check again.
2. **Execution cost / 操作** — reduce searching, navigation, switching, copying, manual task creation, repeated clicks.
3. **Interpretation cost / 視覚・理解** — reduce reconstruction of what matters from threads.
4. **Verification cost / 信頼** — reduce `念のため` re-checking without hiding evidence/control.

A feature is justified when it materially reduces one/more burdens without creating greater trust/complexity/operational cost.

---

## 2. Product scope

### 2.1 Initial product

Lunowa should support credible daily-email capabilities plus its differentiated Responsibility/attention layer:

- Gmail + Microsoft/Outlook connection through supported authorization;
- one/multiple accounts and optional user-understandable Scopes;
- browse Conversations/messages;
- compose/reply/reply-all/forward;
- explicit sender account;
- To/Cc/Bcc, subject, attachments, formatting, signatures;
- autosaved drafts;
- Sent/Drafts/Archive/Trash/Spam/Block/Read-Unread;
- search;
- pinning;
- Undo Send where backed by Lunowa's real send pipeline;
- Send Later;
- recipient/contact autocomplete;
- basic bulk actions where practical;
- attachment preview;
- person/company context;
- `My Turn / Waiting / Later / Done / Review` Responsibility projections + Moment View;
- Temporal Contract/resurfacing;
- responsive desktop/tablet/mobile;
- explicit error/offline/reconnect/sync/AI-degraded states.

### 2.2 Not a v1 goal

Do not turn the first product into:

- full CRM;
- project-management suite;
- calendar-first productivity system;
- graph explorer as primary nav;
- generic automation/rule builder;
- replacement mail transport;
- feature-complete Gmail/Outlook clone;
- chat-first AI that makes users prompt routine work;
- generic workflow/BPMN engine.

---

## 3. Core product model

### 3.1 Conversation is not Responsibility state

A Conversation can contain zero/one/many independent Responsibility loops.

```text
Conversation
├── Communication Evidence
│   ├── received messages
│   ├── sent messages
│   ├── provider observations
│   └── trusted external/user events
└── Responsibilities
    ├── Responsibility A
    ├── Responsibility B
    └── Responsibility C
```

A Responsibility is the smallest communication-bounded operational outcome with a coherent closure condition.

The Conversation row may display one aggregate state, but it is a deterministic projection and must not destroy underlying Responsibility structure.

### 3.2 Canonical semantics are orthogonal

Do **not** use the former monolithic internal lifecycle enum as canonical truth.

The stable semantic dimensions include:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
uncertainty/risk
provenance
```

UI buckets are projections over these dimensions.

### 3.3 User-facing projection vocabulary

Primary surfaces:

- `すべて`
- `対応が必要` / My Turn
- `あとで` / Later
- `待ち` / Waiting
- `完了` / Done
- `確認` / Review where material ambiguity/safety requires it

`フォローアップ` is normally a reason/current action within `対応が必要`, not a separate canonical lifecycle species.

### 3.4 Projection meanings

#### `対応が必要` / My Turn

At least one currently actionable USER obligation leg exists.

Examples: reply, submit document, decide/confirm, review, follow-up.

For high-risk requests, the safe action may be `確認する`/`検証する` rather than blindly executing the sender's requested action.

#### `あとで` / Later

The Responsibility is intentionally outside current attention under an explicit/validated return condition.

```text
communication hold != Later
```

#### `待ち` / Waiting

No current user action is required; another party/external event is expected.

A communication hold awaiting legal clearance/resume normally belongs here unless separately snoozed.

#### `完了` / Done

The tracked Responsibility is resolved. Resolution is not always successful satisfaction; cancellation/decline/user-close/supersession must be represented truthfully where relevant.

#### `確認` / Review

A decision-critical semantic/safety question cannot be safely collapsed into a normal bucket.

Examples: conflicting due dates, ambiguous assignment, completion claim vs provider contradiction, high-risk unverified request.

Review should not become a dumping ground for harmless uncertainty.

---

## 4. Information architecture

### 4.1 Canonical desktop shell

```text
Sidebar | Conversation List | Detail
```

**Stable Shell / Adaptive Content:** spatial model stays predictable while Detail content adapts.

### 4.2 Sidebar

Recommended high-frequency order:

```text
Lunowa

[ ＋ 新規メール ]

[ Current scope ▾ ]

すべて
対応が必要
あとで
待ち
確認  (only if useful enough to deserve a surface)
ピン留め

その他 ▾

Accounts
＋ アカウント追加

設定
```

`完了`, Drafts, Sent, Scheduled, Archive, Spam, Trash may live under `その他` when top-level density is too high.

Scope labels should be concrete (`仕事`, `個人`, `大学`, `全体`).

### 4.3 Conversation list

Information hierarchy:

1. who/organization;
2. topic/subject;
3. useful preview;
4. one primary projection/status when useful;
5. time/date;
6. account/provider context when useful.

A row represents a topic/thread, not every message and not all history for a person.

Target desktop density: roughly 8–12 useful rows in a typical laptop viewport without cramped text.

### 4.4 Detail

Primary modes:

- `会話`
- `今の要点`

Ordinary row open defaults to `会話`. `今の要点` is contextual, not a mandatory gate.

### 4.5 Reply composer

Keep near conversation bottom; feel closer to modern messaging than a disconnected form page.

AI is assistive, not dominant.

---

## 5. Moment View / `今の要点`

### 5.1 Purpose

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Complex canonical state should project into a simple immediate decision.

### 5.2 Projection-specific questions

- `MY_TURN` → **今、何をすればいい？**
- `LATER` → **いつ戻る？**
- `WAITING` → **今は誰/何を待っている？**
- `DONE` → **もう何もしなくていい？**
- `REVIEW` → **何を確認すれば安全に進められる？**

Follow-up uses the My Turn question.

### 5.3 Multiple Responsibilities

Do not render multiple equal-priority CTAs.

```text
Primary Responsibility
[ primary safe action ]

────────
Other items
- item/status 1
- item/status 2
```

Primary selection should prefer critical/overdue actionable USER work, nearest material user due, blocking work, and other high-attention unresolved user work rather than newest message.

### 5.4 Parallel obligation legs

One Responsibility may contain multiple required legs.

Example:

```text
USER + Tanaka both must sign
USER not signed -> My Turn
USER signed, Tanaka pending -> Waiting
```

Do not collapse this into an opaque `BOTH` owner.

### 5.5 Progressive disclosure/provenance

Normal Moment shows only current-decision information.

Do not permanently show large AI/audit cards. Make source one click/tap away when material:

```text
締切 8/28    原文 ↗
```

Source inspection should jump/highlight originating evidence when practical.

---

## 6. Temporal Contract

A Temporal Contract is Lunowa's persisted promise describing when a Responsibility is reconsidered/resurfaced.

Plain-language UI example:

```text
8月27日 9:00に戻します

田中さんから返信が来れば、
それより先に再確認します。

[条件を変更]
```

### 6.1 Initial triggers

- scheduled time;
- deadline threshold;
- relevant reply received.

### 6.2 Active work vs passive waiting

- actionable USER obligation: automatic hiding is riskier;
- passive Waiting: more automatic attention management may be safer.

### 6.3 Hold is not snooze

If communication says `法務確認まで止めて`, the semantic state may be Waiting on legal/resume.

Only a separate attention defer decision produces Later.

### 6.4 Product promise implies reliability

If UI says `9:00に戻します`, runtime must eventually support durable persistence, idempotency, retries, missed-event recovery, reconciliation, timezone correctness, and auditability.

---

## 7. Temporal information UX

Do not visually conflate:

```text
source due
expected-event time
user target
resurface time
follow-up time
```

Examples:

- `金曜までに提出` = source due;
- `明日修正版を送ります` from counterpart = expected-event time;
- user chooses `木曜にやる` = user target;
- snooze until Thursday = resurface time.

`Friday` must not be rendered as an invented `17:00` deadline unless justified by source/reference context.

---

## 8. Search

Search is first-class navigation, not a separate AI product.

Support useful retrieval across Conversation/Message/Person/File and intentionally represented Responsibility/action results.

Default current Scope; broadening to `全体` is explicit.

Categories may be:

```text
すべて | 会話 | 人 | ファイル
```

Search/semantic similarity never becomes Responsibility merge authority.

---

## 9. Person/company context

May show current relevant issues, recent topics, evidence-backed remembered facts, basic organization/contact context, recent files, related Conversations.

Not CRM pipeline/deal management.

Material AI-inferred facts expose provenance on demand.

---

## 10. Attachments and links

Preview safe/useful file types in context when practical.

If unreliable, offer download/open externally rather than generic embedded browser complexity.

Attachment preview preserves Conversation context.

Opening/previewing a file is not automatically completion evidence.

---

## 11. Visual system

### 11.1 Brand direction

Calm, trustworthy, warm, slightly soft, modern, consumer-friendly without childishness, cleaner than dense enterprise dashboards.

Lunar-rabbit symbol is primary brand character.

### 11.2 Core brand colors

- **Lunowa Navy:** `#0F1B3D`
- **Lunar Gold:** `#F2D9A6`

Functional projection colors are separate from brand identity. Initial direction:

- My Turn / `対応が必要` — coral/red family;
- Later / `あとで` — amber/orange family;
- Waiting / `待ち` — blue family;
- Done / `完了` — mint/green family;
- Review / `確認` — neutral/attention color chosen to avoid implying success/failure.

Normalize exact tokens in implementation rather than copying random screenshot shades.

### 11.3 State/projection color consistency

Same projection meaning should use consistent semantic color across sidebar, chips, Moment accents, and relevant icons.

Color must not be the sole signal.

### 11.4 Brand usage

Logo recognizable but quiet; working attention belongs to mail content.

### 11.5 Typography

Highly readable Japanese-capable UI sans-serif. Use weight/spacing for hierarchy rather than oversized headings.

### 11.6 Cards/borders/shadows

Prefer light neutral/ivory background, subtle 1px borders, soft radius, restrained shadows, generous-not-wasteful spacing.

Avoid glassmorphism/heavy gradients/strong shadows/dashboard-card overload.

### 11.7 Icons

Use a consistent line-icon family where possible.

### 11.8 Motion

Use motion to preserve orientation, not decorate. Prefer subtle pane/sheet transitions/local fades; respect reduced motion.

---

## 12. Visual grammar by information type

Use visualization only when better than text:

- date/time change → before/after diff;
- deadline → date + appropriate remaining-time emphasis;
- Waiting → actor/event + waiting state;
- multiple Responsibilities/criteria → concise list/checklist;
- file submission → file + safe primary action;
- meeting → compact brief;
- temporal sequence → timeline only when genuinely useful;
- amount change → old → new;
- schedule proposals → candidate slots until agreement.

Do not turn proposed time into visually “confirmed” time before acceptance evidence.

---

## 13. Compose experience

Desktop compose stays in workspace.

Expected fields/actions: From, To, progressive Cc/Bcc, Subject, body, attachments, formatting, signature, autosave state, Send, Send Later, minimize/restore, safe close.

No Moment is required for fresh compose.

### Inline completion

Never interfere during active Japanese IME composition. Suggest only after commit/pause/context. Repeated rejection should suppress aggressive suggestions.

Material dates/amounts/recipients/commitments should not be silently strengthened/rewritten.

---

## 14. Pinning

Pin is explicit user retrieval control, orthogonal to Responsibility semantics.

```text
Responsibility projection = derived product state
Pin = explicit user control
```

Pin stays until user unpins.

---

## 15. Onboarding

> **使い方を教える前に、使えるようにする。**

Preferred:

```text
Googleで始める / Microsoftで始める
→ Provider authorization/account picker
→ Inbox usable
```

Do not require profiles/carousels/rule-builders/AI preference setup before mail.

Second account may offer `一緒に見る / 分けて使う`; organization remains reversible.

Historical initial sync must not interpret every old unanswered request as live My Turn work.

---

## 16. Trust and safety UX

### 16.1 Highest-risk false negative

A true material USER obligation must not be incorrectly hidden as Waiting/Done/Later/NONE.

### 16.2 Provenance

Material extracted facts should link to source/trusted observation where practical.

### 16.3 Uncertainty-aware fallback

Do not treat model confidence alone as truth.

When a decision-critical question is unresolved, use Review/ordinary mail and allow minimal correction. Harmless uncertainty should not automatically prompt the user.

### 16.4 High-risk requests

```text
requested action != safe next action
```

Payment/contract/login/destructive/high-impact requests may surface verification/decision as the primary action even when the source request is clear.

### 16.5 Sender identity

Exact sending account visible before send. Cross-account mistakes should be mechanically prevented.

### 16.6 Core app survives AI failure

Reading, basic search, compose/reply/send, attachments, and normal navigation remain available.

---

## 17. Loading/error/offline/update principles

Keep working where possible; preserve input/context; explain impact/recovery; use cached data rather than blank screen when safe; recover quietly when practical; do not unexpectedly jump list on new mail; preserve draft on send failure/ambiguity; isolate reconnect issue to relevant account; do not destroy active draft during app update.

---

## 18. Accessibility baseline

Support visible keyboard focus, logical keyboard navigation, semantic icon labels, adequate touch targets, non-color-only state meaning, readable contrast, reduced motion, and zoom/text resizing without breaking core flow.

---

## 19. Reference interpretation rules

Generated screenshots are visual references, not literal semantic/data specs.

Do not treat sample dates/names/amounts/counts/files, accidental wording/typos, legacy labels/state terminology, color inconsistencies, provider-specific examples, or impossible sample data as requirements.

Use images for composition, hierarchy, density, scale, visual tone, component placement, projection-specific visual treatment.

Use Markdown specs for semantics, behavior, edge cases, accessibility, responsive behavior, authority, and conflict resolution.

---

## 20. Source-of-truth priority

For design-specific conflicts:

1. current accepted `docs/design/*.md` + `docs/product/responsibility/*` for Responsibility semantics;
2. `00-brand-system.png` for brand direction;
3. `01-component-system.png` for reusable component appearance;
4. `02-desktop-conversation-default.png` for canonical desktop shell;
5. state/feature references for intentional visual treatment only.

A screenshot must not redefine global shell/brand/typography/component semantics or revive a superseded lifecycle model.

---

## 21. First high-fidelity slice acceptance criteria

With realistic fake data demonstrate:

- canonical three-pane desktop shell;
- resizable panes;
- row click → `会話`;
- status/projection chip → `今の要点`;
- representative My Turn / Later / Waiting / Done / Review Moments;
- follow-up as My Turn reason/action;
- multiple Responsibilities with one primary Moment;
- parallel obligation-leg visual behavior where needed;
- new compose/reply;
- pinning;
- account/scope surface;
- search;
- attachment preview;
- person context;
- loading/error/offline;
- tablet/mobile adaptation;
- keyboard/focus and no major overflow.

The slice validates interaction/visual model before expensive provider/AI/scheduler integration.

---

## 22. Product guardrails

When ambiguous, prefer the option that:

1. reduces Communication Management Burden;
2. preserves control/source visibility;
3. keeps ordinary email familiar;
4. avoids unnecessary configuration/questions;
5. avoids hidden cross-account/scope behavior;
6. is reversible/correctable;
7. is simpler to implement/maintain for equal product value;
8. does not confuse projection with canonical Responsibility truth.

Do not add a feature merely because AI makes it easy to code.