# Lunowa Implementation Plan

## Status

**Active initial execution plan.**

This plan sequences implementation to reduce the largest product/technical risks without building production infrastructure or feature breadth before the core interaction model is proven.

It is a living execution artifact. Durable product behavior belongs in the design/product architecture documents, not here.

Related sources:

- `../design/DESIGN.md`
- `../design/INTERACTIONS.md`
- `../design/RESPONSIVE.md`
- `ARCHITECTURE.md`
- `DATA-MODEL.md`
- `CONTRACTS.md`

---

## 1. Execution principle

Build in vertical slices that can be visually and behaviorally verified.

Do not begin by implementing every provider, AI feature, mailbox action, scheduler feature, and responsive edge case at once.

The intended sequence is:

```text
Bootstrap
  -> High-fidelity fake-data product shell
  -> Domain/data foundations
  -> One real provider read path
  -> Real compose/send path
  -> Deterministic lifecycle + Temporal Contract
  -> AI interpretation behind the contract
  -> Second provider
  -> hardening / beta readiness
```

The key rule is:

> **Prove the user experience and core domain contracts before expanding integration breadth.**

---

## 2. Phase 0 — Bootstrap and stack decision

### Goal

Create the smallest reproducible repository/runtime foundation that can support the canonical desktop UI and later durable background work.

### Required work

1. Inspect the repository engineering baseline:
   - `AGENTS.md`
   - `docs/greenfield-bootstrap.md`
   - `docs/reuse-dependencies.md`
   - `docs/security-privacy.md`
   - `docs/verification-review.md`
   - product/design docs.
2. Choose the initial frontend/runtime stack deliberately.
3. Prefer framework/platform defaults and mature official SDKs.
4. Establish canonical commands:
   - install;
   - local run;
   - typecheck;
   - lint;
   - unit/integration test;
   - build;
   - one `verify` command/path if practical.
5. Establish environment handling without committing secrets.
6. Establish a relational database/migration mechanism if Phase 1 needs persistence immediately; otherwise create it before Phase 2.
7. Establish browser/runtime inspection for UI verification.

### Decision criteria for stack

Evaluate only what materially changes Lunowa success/maintenance:

- high-quality responsive web UI;
- fast local development with Codex;
- server-side OAuth/provider API support;
- durable background jobs/scheduling path;
- relational persistence/migrations;
- deployment simplicity/cost;
- security/session support;
- official/mature Gmail and Microsoft API integration ecosystem;
- agent/human legibility;
- low operational burden for one developer.

### Non-goals

Do not choose infrastructure because it is fashionable. Do not introduce microservices, Kubernetes, a vector DB, a search cluster, or multi-provider AI during bootstrap.

### Exit criteria

- app boots locally from documented command;
- canonical verification command/path exists;
- a trivial route/page renders;
- environment/secrets pattern is documented;
- stack choices that materially constrain the product are recorded in `ARCHITECTURE.md` or an ADR;
- no production credentials required for ordinary UI development.

---

## 3. Phase 1 — High-fidelity fake-data product shell

### Goal

Validate and implement the interaction model from the 20 visual references without coupling UI construction to Gmail/Microsoft/AI complexity.

### Primary references

Start with:

- `00-brand-system.png`
- `01-component-system.png`
- `02-desktop-conversation-default.png`
- `03-moment-action-required.png`
- `04-moment-deferred.png`
- `05-moment-waiting.png`
- `06-moment-follow-up.png`
- `07-moment-completed.png`
- `08-moment-multiple-tasks.png`
- `09-compose-new-email.png`

Then add:

- search/context/preview/actions/settings/system/responsive references `10`–`19`.

### Required behavior

#### Shell

- desktop 3-pane layout;
- sidebar, conversation list, detail;
- resizable panes with safe min/max;
- persisted local pane widths;
- normal row click -> `会話`;
- status chip click -> `今の要点`;
- stable selected state.

#### Conversation list

- person-first/topic-aware hierarchy;
- status chips;
- unread treatment;
- pin treatment;
- source account indicator;
- representative long/short previews.

#### Conversation detail

- thread timeline;
- long-message readability;
- quoted/signature collapse treatment;
- attachment cards;
- reply composer.

#### Moment View

Implement representative fake scenarios for:

- ACTION_REQUIRED;
- DEFERRED;
- WAITING;
- FOLLOW_UP;
- COMPLETED;
- multiple Action Items.

#### Compose

- new message screen;
- From / To / Cc / Bcc / subject;
- body;
- attachment UI;
- basic formatting affordance;
- send dropdown visual states;
- autosave indicator using fake/local state;
- minimize/preserve behavior if in design.

#### Supporting surfaces

- search mode;
- Person Context side sheet;
- attachment preview;
- navigation/actions menus;
- scope/account switcher;
- onboarding;
- settings;
- system states;
- responsive tablet/mobile behavior.

### Important constraint

Use fake data through a domain-shaped fixture/repository interface, not hard-coded arbitrary JSX scattered across components. The fake layer should make it easy to replace data sources later.

### Visual verification

For canonical screens:

1. run the real app;
2. capture screenshots at target viewport sizes;
3. compare to visual references;
4. fix large hierarchy/spacing/component mismatches;
5. verify interaction behavior separately because generated images are not executable specs.

### Exit criteria

- all core screenshots can be represented by real app states;
- user can navigate list -> conversation and chip -> Moment View without confusion;
- multiple Action Items do not produce multiple competing primary CTAs;
- compose/search/context/preview flows preserve context;
- desktop/tablet/mobile transitions preserve selected conversation/draft state where specified;
- no real provider or AI dependency is required to demo the experience.

### Stop condition

If the real rendered UI demonstrates that the current information hierarchy is materially confusing, change the design/spec before wiring expensive provider/runtime integrations.

---

## 4. Phase 2 — Domain and persistence foundation

### Goal

Implement the smallest server/domain model needed to replace fake fixtures without yet solving every provider feature.

### Required entities

At minimum, implement schema/domain equivalents for:

- User;
- Scope;
- ConnectedAccount;
- ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- ActionItem;
- ProvenanceReference or a minimal extensible equivalent;
- TemporalContract / TemporalTrigger skeleton;
- Pin;
- Draft;
- SendOperation skeleton.

### Required domain rules

- one Conversation can have multiple Action Items;
- state dimensions remain separate;
- conversation aggregate is derived;
- Pin is orthogonal to lifecycle;
- provider identifiers are unique per account;
- ActionItem mutations go through domain services/reducer;
- Temporal Contract records are durable even before full scheduler implementation.

### API boundary

Expose product-shaped API contracts needed by the UI. Avoid provider SDK types in UI-facing responses.

### Exit criteria

- fake fixture interfaces can be backed by database repositories without large UI rewrite;
- schema migrations run reproducibly;
- core ownership/uniqueness constraints are enforced;
- representative lifecycle reducer unit tests exist;
- no provider integration yet needs to bypass domain boundaries.

---

## 5. Phase 3 — Gmail read-only vertical slice

### Goal

Prove one real mailbox can connect, sync, normalize, and render through Lunowa's domain without adding AI or write breadth first.

### Why Gmail first

Use one provider first to validate the boundary. The choice is implementation sequencing, not a permanent product preference.

### Required behavior

- Google account authorization using current official provider guidance;
- minimum scopes needed for the implemented read slice;
- ConnectedAccount creation;
- initial bounded sync;
- incremental sync path where practical;
- conversation/message normalization;
- attachment metadata;
- account-specific sync state;
- real conversations render in the existing UI;
- user can manually refresh/reconnect;
- duplicate sync does not duplicate messages.

### Security requirements

- provider credentials server-side only;
- no secrets in repository/browser bundle;
- account ownership enforced on every read;
- HTML sanitized before rendering;
- untrusted message content never treated as privileged instructions.

### Reliability tests

- duplicate changes;
- invalid/expired cursor;
- reconnect;
- provider rate limit/transient failure;
- stale cached content shown with appropriate sync state rather than blank UI where safe.

### Non-goals

- Outlook;
- AI classification;
- full mailbox mutation parity;
- provider-native drafts;
- semantic search infrastructure.

### Exit criteria

A real Gmail account can connect and its representative conversations can be read in Lunowa through the normalized domain model.

---

## 6. Phase 4 — Real compose/reply/send

### Goal

Make Lunowa a credible minimal email client for one real provider.

### Required behavior

- new compose;
- reply;
- reply-all;
- forward;
- explicit sender account;
- To/Cc/Bcc;
- subject;
- basic body formatting;
- attachments;
- draft autosave;
- send operation;
- Sent state/reconciliation;
- send failure preserves draft;
- double-submit/worker retry does not duplicate sends.

### Undo Send

If implemented now, use a Lunowa-controlled delay before provider dispatch. Keep the delay short and user-configurable only if that complexity is justified.

Do not claim recall after provider delivery unless verified provider capability is separately implemented.

### Send Later

Can be implemented in this phase if the durable scheduler primitive selected for Temporal Contracts is already ready. Otherwise postpone until Phase 5 rather than create two scheduling mechanisms.

### Exit criteria

User can perform the primary email loop:

```text
read -> compose/reply -> attach -> send -> see reconciled result
```

without AI.

---

## 7. Phase 5 — Deterministic lifecycle and Temporal Contract

### Goal

Implement the core differentiated behavior without depending on AI quality yet.

Use deterministic fixtures/manual user actions to exercise lifecycle rules first.

### Required behavior

- ActionItem lifecycle reducer;
- conversation aggregate projection;
- user state correction/override;
- manual/action-driven transition to DEFERRED;
- passive WAITING state after known completed outbound action;
- TemporalContract persistence;
- durable TIME trigger;
- reply-trigger path from normalized inbound event;
- deadline/safety trigger if included in MVP;
- overdue reconciliation;
- idempotent trigger fire;
- cancellation/supersession;
- ResurfacingEvent/audit evidence;
- `今の要点` reflects actual domain state.

### Required failure tests

- scheduler process restarts before trigger time;
- scheduler restarts after trigger time;
- same trigger delivered twice;
- contract changed before old trigger fires;
- reply arrives before timer;
- reply and timer race;
- ActionItem completed before trigger;
- stale trigger does nothing;
- account temporarily disconnected.

### Exit criteria

A user-visible promise such as:

> `8月21日 9:00に戻します。田中さんから返信が来れば、それより先に戻します。`

can be demonstrated end to end with durable persisted execution and evidence of why it returned.

### Stop condition

Do not add AI-powered automatic hiding until deterministic Temporal Contract reliability is proven locally/in integration tests. A smart classification on top of unreliable resurfacing would damage the core trust proposition.

---

## 8. Phase 6 — AI interpretation behind deterministic rules

### Goal

Use AI to reduce interpretation burden while preserving lifecycle authority outside the model.

### Required work

- versioned structured interpretation schema from `CONTRACTS.md`;
- authorized conversation context builder;
- one initial evaluated model/provider;
- schema validation;
- field-level provenance/message IDs;
- abstention/uncertainty;
- lifecycle reducer consumes validated candidates;
- no automatic privileged provider action from model output;
- fallback when AI unavailable;
- small representative eval set.

### Initial eval cases

Include at least:

- explicit action request;
- explicit deadline;
- ambiguous date;
- user already completed action;
- waiting on other party;
- no action required;
- multiple tasks in one thread;
- completion signal;
- new request after completion;
- quoted old request that is no longer active;
- signature/footer noise;
- Japanese business email phrasing;
- English email if multilingual support is already enabled;
- malicious/prompt-like instructions inside email content;
- low-confidence/ambiguous case where abstention is correct.

Measure observable extraction/state outcome, not model self-report.

### Automation policy

Initial rollout should be conservative:

- AI may propose/highlight Action Items;
- user correction always available;
- active obligations should not be silently hidden from low/medium-confidence inference;
- passive waiting automation can be introduced earlier if evidence supports safety.

### Exit criteria

AI materially improves action/deadline/waiting understanding on the eval set without increasing missed-obligation risk beyond the accepted threshold, and core mail remains usable when AI is disabled.

---

## 9. Phase 7 — Search/context quality

### Goal

Improve retrieval only after real mailbox data demonstrates actual search/context needs.

### Start simple

Implement:

- lexical/full-text search over normalized authorized data;
- result types: Conversation, Message, Person, File;
- current Scope default;
- explicit All broadening;
- exact result jump/highlight where practical.

Only add semantic/vector retrieval when observed user queries are poorly served by simpler search and the incremental benefit is demonstrated.

### Person Context

Build from:

- participant identity;
- recent conversations;
- active Action Items;
- recent files;
- evidence-backed derived facts only when useful.

Do not turn it into a CRM.

---

## 10. Phase 8 — Microsoft/Outlook adapter

### Goal

Prove the provider boundary by adding the second intended provider without rewriting core domain/UI.

### Required behavior

- Microsoft account authorization using current official guidance;
- normalization to existing provider contracts;
- sync/read;
- send/reply/attachments for supported v1 behavior;
- account reconnect/failure semantics;
- capability differences handled behind/provider-capability boundary;
- mixed Gmail + Outlook accounts in one user and separate Scopes;
- explicit sender account safety.

### Architecture success criterion

Adding Microsoft should mostly add/extend adapter and provider contract tests, not duplicate lifecycle/search/UI implementations.

If major core rewrites are required, inspect whether the provider abstraction was too Gmail-shaped before proceeding.

---

## 11. Phase 9 — Beta hardening

Before inviting real external users to depend on Lunowa for important email, apply the relevant reusable production-readiness/security/privacy guidance.

### Required categories

- provider OAuth/security review;
- token/storage protection;
- account deletion/removal lifecycle;
- sync reconciliation and health;
- scheduler health and overdue-job recovery;
- send idempotency/ambiguous result handling;
- backups/migrations/restore path for Lunowa-owned state;
- error reporting/support evidence;
- AI eval regression path;
- cost/usage bounds;
- privacy/retention decisions;
- responsive/browser verification;
- accessibility baseline;
- analytics for core product hypotheses;
- incident-safe feature disable/degraded mode for AI and Temporal Contract automation.

### Product metrics to instrument when real users begin

Do not optimize raw clicks alone. Candidate measures:

- Attention Recall Rate;
- Unnecessary Attention Rate;
- Re-check Rate (`念のため` inbox/original/sent verification);
- manual memory actions (manual snooze/task/calendar/self-forward/pin used as memory proxy);
- processing time + correctness;
- original-view rate for AI-derived facts;
- undo/correction rate;
- missed communication rate;
- Temporal Contract fire success/latency;
- Communication Management Burden per completed outcome where measurable.

---

## 12. Feature deferrals unless validation changes priority

Do not allow these to delay the core slice:

- graph/tree conversation visualization;
- complex calendar product;
- CRM pipelines;
- generic automation builder;
- multi-agent user-facing architecture;
- multiple AI provider fallback;
- native apps;
- advanced analytics dashboard;
- team/shared mailbox collaboration unless demand validates it;
- custom search infrastructure before need;
- full provider feature parity.

---

## 13. Codex task slicing

Do not give Codex one giant task: `build Lunowa`.

For each non-trivial phase/slice, provide a task contract containing:

- Goal;
- Why;
- current source-of-truth docs;
- exact visual references relevant to the slice;
- Scope;
- Non-goals;
- invariants to preserve;
- reuse requirements;
- acceptance criteria;
- verification commands/browser checks;
- stop/escalation conditions.

Example frontend slice:

```text
Goal:
Implement the canonical desktop shell and conversation-default interaction.

Read first:
- AGENTS.md
- docs/design/DESIGN.md
- docs/design/INTERACTIONS.md
- docs/design/RESPONSIVE.md
- docs/design/references/README.md

Visual authority:
- 00-brand-system.png
- 01-component-system.png
- 02-desktop-conversation-default.png

Critical invariant:
- row body opens 会話
- status chip opens 今の要点

Non-goals:
- real Gmail API
- AI
- database

Verify:
- run app
- inspect desktop render in browser
- test pane resize
- test row/chip click semantics
- capture screenshot for comparison
```

---

## 14. Completion definition per phase

A phase is not complete merely because:

- code was generated;
- build passed;
- unit tests are green.

Completion requires the behavior/acceptance criteria to be actually exercised using the appropriate combination of:

- browser/runtime interaction;
- screenshot comparison;
- unit tests;
- integration tests;
- provider sandbox/real-account test where required;
- failure injection/retry tests for reliability-critical flows;
- accessibility checks;
- logs/state inspection for background workflows.

Never claim a provider/scheduler/send behavior is verified if it was only mocked.

---

## 15. First concrete implementation task

Once Phase 0 stack/bootstrap is decided, the first product task should be:

> **Implement `02-desktop-conversation-default.png` as the canonical responsive desktop shell using fake domain-shaped data, together with the row-body -> `会話` and status-chip -> `今の要点` interaction invariant.**

Then add Moment states `03`–`08` before wiring a real mailbox.

This sequence gives the fastest path to a product that can be visually judged and keeps integration complexity from dictating the UX.