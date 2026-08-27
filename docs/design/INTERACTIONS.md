# Lunowa Interaction Specification

## Status

**Canonical interaction source of truth, reconciled through 2026-08-28 with the Product contract, Responsibility v0.1 semantics, and the v1 UI implementation-readiness contract.**

This document owns behavior screenshots cannot reliably define: navigation, Home/Needs You/Managed/Review/Source/Moment behavior, monitoring-control interactions, contextual communication, search/retrieval, onboarding, integrity/recovery, session/account distinctions, and interaction-level accessibility/focus rules.

Authority boundaries:

- Product scope/value/operating behavior: `docs/product/PRODUCT.md` + `PRODUCT-CONTENT.md`;
- Responsibility semantic truth: `docs/product/responsibility/`;
- implementation-facing screen/state/component/read-model detail: `V1-UI-IMPLEMENTATION-CONTRACT.md`;
- viewport adaptation: `RESPONSIVE.md`.

User-facing `My Turn / Waiting / Later / Done / Review` are projections, not one canonical lifecycle enum.

---

# 1. Core interaction invariants

1. **Source is always directly accessible.** Moment/AI is never a mandatory gate to original communication.
2. **Needs You items open Moment.** They are current USER work, not generic importance/new mail.
3. **Source Conversation rows open Source Conversation.** Row-body source semantics do not become tasks.
4. **Managed is reassurance/inspection, not a second Inbox or backlog dashboard.**
5. **Review asks only the smallest material user judgment question.**
6. **Awareness-only information is not durable Needs You work.**
7. **Integrity failure is system UX, not fake Responsibility/Review.**
8. **AI failure does not block Source/basic deterministic retrieval/manual contextual reply where runtime capability permits.**
9. **Mailbox hygiene state never substitutes for Responsibility semantics.**
10. **Monitoring posture, monitoring integrity, capability and delivery state remain distinct.**
11. **A user click/request is not an accepted mutation until the owning authoritative boundary confirms it.**
12. **Send request != provider result != reconciliation != Responsibility consequence.**
13. **Lunowa app session != mailbox authorization.**
14. **Preserve place, focus and unfinished input across navigation/responsive/background updates.**
15. **No interaction may manufacture a Responsibility merely to make the UI feel complete.**

---

# 2. Surface navigation

## 2.1 Home

Home is composition, not semantic state.

Selecting a Home item:

- Needs You item -> its Moment;
- Review item -> bounded Review interaction;
- Managed reassurance -> Managed inspection;
- `会話` -> Source Conversations;
- `検索` -> active supported retrieval surface.

Home may compose Needs You and Review into one attention region, but every item remains explicitly typed and routes to its owner.

Do **not** enforce `Review always first`. Presentation follows accepted attention/delay cost and decision relevance, not one opaque AI score.

Strict all-clear copy is allowed **only** when all are true:

- no current Needs You;
- no surfaced unresolved Review;
- relevant monitoring/source integrity is trustworthy.

Then Home may say:

> **今、あなたが対応する必要はありません。**

If healthy Managed work exists, follow with quiet reassurance.

If Review exists, source coverage is partial, or monitoring integrity is degraded/unknown, do not use strict all-clear copy.

Unread count/Inbox Zero gamification never substitutes for this truth.

## 2.2 Needs You

Selecting an item opens Moment focused on one primary Responsibility/question.

Needs You excludes:

- Waiting;
- intentional Later;
- awareness-only updates;
- pre-admission Review;
- admitted Responsibilities blocked by surfaced material Review;
- generic new/important mail.

Ordering is explainable/deterministic from accepted Product attention information. Do not rank solely by newest message or opaque model score.

Background evidence can update truth without stealing focus or unexpectedly moving the active row under the user. Preserve the focused/edited item and apply visual reordering at an orientation-safe boundary where practical.

## 2.3 Managed

Managed defaults to aggregate quiet reassurance, not an expanded item ledger.

Intentional inspection may show:

- tracked operational outcome;
- expected actor/event;
- relevant return/reconsideration condition;
- monitoring integrity;
- Source/provenance;
- bounded controls such as inspect/focus now, change return condition, Stop Tracking, or correct a material interpretation.

`今確認する` / focus does not fabricate MY_TURN.

Healthy Managed counts exclude surfaced Review, Needs You, degraded scope, stopped/not-delegated loops, No Responsibility and inactive resolved history.

## 2.4 Review

Review may contain:

- pre-admission `NEEDS_REVIEW`; or
- admitted Responsibility field/safety uncertainty.

Presentation may be unified while internal subject kind remains explicit at the authoritative boundary.

Review is globally discoverable only while material subjects exist; an empty permanent approval inbox is not required.

## 2.5 Source Conversations

Source browsing behaves like ordinary authorized email reading.

- row body -> Source Conversation;
- distinct Responsibility/status affordance -> relevant Moment when available.

Source is not an unread-debt dashboard and does not require passing through AI summary.

---

# 3. Moment interaction

## 3.1 One primary question

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Render only material blocks:

1. why now / current question;
2. one safe primary action when current user action exists;
3. what materially changed;
4. what remains unresolved;
5. relevant due/expected event/return condition;
6. minimum evidence receipt;
7. compact additional Responsibilities;
8. Source/provenance.

Do not add a generic AI-summary card merely because AI exists.

## 3.2 Trust stack

Preferred trust path:

```text
current conclusion / safe action
-> concise material reason
-> source/provider/user-origin evidence receipt
-> original Source
```

Do not use chain-of-thought, verbose generated rationale or confidence percentage as proof.

## 3.3 MY_TURN

Question: `今、何をすればいい？`

Examples:

- `返信する`;
- `見積書を見る`;
- `変更を確認`;
- `依頼元を確認`.

The CTA is the safe Product action, not blindly the source-requested action.

## 3.4 WAITING

Question: `今は誰/何を待っている？`

Normally Managed/quiet. Show awaited actor/event, last material progress, return condition, integrity and Source.

No dominant work CTA unless actionability actually changed.

## 3.5 LATER

Question: `いつ/何で戻る？`

Distinguish user-owned return condition from source due/expected event.

A requested return-condition change stays visibly pending until accepted; do not claim the new monitoring promise prematurely.

Communication hold/waiting is not automatically Later.

## 3.6 Follow-up

Follow-up is ordinarily a My Turn reason/action after current evidence + valid temporal condition, not a canonical lifecycle species.

After a reconciled follow-up Send, if the original outcome remains with the counterpart, projection normally returns to Waiting according to canonical semantics.

## 3.7 DONE / history

Explain why monitoring ended. Satisfaction, cancellation, decline, user-close and supersession are not interchangeable success meanings.

## 3.8 REVIEW

Show:

- exact material question;
- minimum conflicting/decision-critical evidence;
- bounded choices/input;
- ordinary-language consequence;
- Source.

Do not ask harmless questions solely to tidy internal model uncertainty.

---

# 4. Multiple Responsibilities / obligation legs

A Conversation may contain zero, one or many Responsibilities.

When several matter, show one primary Moment and compact additional items.

Primary selection prefers accepted attention consequences such as:

1. critical/overdue actionable USER work;
2. near material USER due;
3. blocking USER obligation;
4. other high-attention actionable work;
5. material Review when it blocks safe action;
6. otherwise relevant Waiting/Later context.

Do not choose merely by newest message.

Parallel obligation example:

```text
USER leg open + counterpart leg open -> MY_TURN
USER leg satisfied + counterpart leg open -> WAITING
```

Do not collapse this into an opaque `BOTH` owner.

---

# 5. Evidence / AI interpretation boundary

> **AI understands; trusted Product/domain rules own accepted state and authority.**

AI may propose communication acts, bearers, requested actions/events, temporal expressions, completion/correction signals and provenance candidates.

Trusted domain/policy authority owns admission, identity/effects, accepted state, actionability, safety, authorization and privileged side effects.

Model confidence/repetition is not authority.

Original communication remains immutable source evidence. Prompt/tool-like source text never grants application authority.

---

# 6. Contextual reply / Send

## 6.1 Moment-bound communication

When communication is the safe next action, open a bounded composer without losing Moment/Source context.

Before Send, user can inspect:

- effective From account;
- To/Cc recipients;
- body;
- supported attachments;
- material content as ordinary text.

Reply All makes recipients inspectable/editable.

## 6.2 AI draft

AI draft is editable assistance only. Manual editor remains usable when draft assistance fails.

Do not silently strengthen ambiguous dates, amounts, recipients or commitments.

## 6.3 Explicit Send truth

```text
draft/local intent
-> explicit Send request
-> pending
-> provider outcome: accepted evidence | definite failure | ambiguous/unknown
-> reconciliation when required
-> Responsibility re-evaluation
-> resulting projection
```

Monitoring delegation never grants Send authority.

A click is not provider acceptance. Provider acceptance is not automatically Responsibility closure.

### Pending

Preserve visible composer/input; disable duplicate commit; show local progress; no false Waiting/Done transition.

### Definite failure

Preserve draft/context; show recoverable object-local error; allow safe retry/edit; no fake send history.

### Ambiguous result

Preserve context; show guarded reconciliation state; do not expose blind Retry while duplicate delivery remains possible; no Waiting/Done until evidence resolves ambiguity.

### Offline

Do not silently queue consequential Send for later. Preserve draft and state that it was not sent unless a separately accepted delayed-action contract exists.

## 6.4 Japanese IME

Explicit Send button is the default commit mechanism. Enter in multiline editor does not Send.

Keyboard command handling conservatively excludes IME input:

- track `compositionstart` / `compositionend` state;
- ignore Send/global/destructive shortcuts while composing;
- ignore command handling when `KeyboardEvent.isComposing` is true;
- defensively treat IME-processed keyboard events such as the compatibility `keyCode === 229` edge as non-command input where applicable;
- test first/middle/last composition-key behavior on supported browser families before accepting a keyboard Send shortcut.

A future Ctrl/Cmd+Enter Send shortcut requires separate acceptance; it is not a v1 completion requirement.

## 6.5 Fresh new mail

Fresh arbitrary compose is optional Product convenience. It may use provider-native compose or a later Lunowa surface. Core Attention Delegation does not depend on full compose parity.

---

# 7. Common mutation truth

For authoritative internal/user-owned changes that are not ambiguous external effects:

```text
accepted current state
-> user intent/request
-> pending
-> confirmed
   or failed
```

Applies conceptually to:

- Review answer;
- return-condition change;
- Stop Tracking;
- first delegation;
- supported Settings save;
- application sign-out;
- mailbox connect/disconnect commands where result is unambiguous.

Rules:

- pending UI uses truthful `保存中/変更中/...` language;
- projection/promise changes only after authoritative confirmation;
- failure preserves prior accepted state and user input where relevant;
- optimistic visual feedback is allowed only when rollback is truthful and cannot imply an unaccepted monitoring promise/external effect.

---

# 8. Attachments

CORE interaction = preserve attachment existence/provenance and a safe supported evidence-access path.

Rich native preview is conditional breadth, not universal gate.

States include:

- native preview supported;
- safe open/download/provider fallback;
- local preview failure while source access works;
- provider/security blocked;
- capability/permission unavailable.

Never bypass provider/platform security restriction. Opening/previewing is not completion evidence.

---

# 9. Temporal Contract interactions

## 9.1 Create/modify

User may defer attention or accept a bounded return condition according to current Product/domain authority.

State the real accepted return condition before relying on it.

## 9.2 Initial trigger types

Start with bounded triggers such as:

- exact/scheduled time;
- relevant reply/event observed;
- deadline threshold.

Do not expose a generic rule builder.

## 9.3 Trigger semantics

When a trigger fires:

1. reload current evidence/Responsibility;
2. reject stale/cancelled condition;
3. re-evaluate accepted state/actionability;
4. update projection if warranted;
5. apply separate delivery policy.

Trigger != notification.

## 9.4 Missed execution

If a promised reconsideration was missed due to background/provider failure, disclose/reconcile honestly. Do not pretend it ran.

---

# 10. Delivery interactions

Product lanes:

- Silent;
- Awareness;
- Normal Attention;
- Urgent Attention;
- Integrity Alert.

Message arrival != notification.

Awareness does not become Needs You merely because the user wanted to know.

Urgency is determined by actual delay cost, not by projection label alone.

Push communicates an **attention handoff** and deep-links to current Moment/Review/integrity recovery, not generic Inbox.

Optional digest may summarize attention/reassurance but is never the only place containing actionable work.

Quiet hours defer interruption where safe; monitoring/re-evaluation continues.

---

# 11. Managed / integrity interactions

## 11.1 Reassurance

Prefer truthful aggregate reassurance such as:

```text
Lunowaが見ています 14
現在、追加対応が必要なものはありません
最終確認: 2分前
```

Only show the second line when relevant membership/integrity makes it true.

## 11.2 Integrity degradation

When provider/sync/scheduler/reconciliation prevents reliable monitoring, show:

1. affected capability/account/scope;
2. what is no longer trustworthy;
3. last trustworthy observation/as-of;
4. affected delegated scope/count when known;
5. what remains safe/usable;
6. recovery action.

Integrity failure is not automatically Review/Needs You.

## 11.3 Intentional stop is not failure

`not delegated` / `stopped by user` is user/domain posture, not system degradation.

Stop Tracking:

```text
request stop
-> pending
-> confirmed -> monitoring posture stopped
   or failed -> prior active monitoring remains accepted
```

Never claim successful external completion merely because tracking stopped.

## 11.4 Material miss recovery

Where supportable, disclose what was missed, evidence-backed cause, impact interval/scope, restored safe state and any narrowed monitoring policy. Apology-only UX is insufficient.

---

# 12. Search / Operational Retrieval

Search is first-class navigation, not a generic AI-chat homepage.

## 12.1 Capability-aware entry

If only exact deterministic Source search is active, entry copy must advertise only search, e.g.:

> `メールを検索`

Only when natural-language Q&A/operational-question capability is actually enabled may broader copy such as:

> `検索、または質問`

be used.

Do not advertise an unsupported AI capability.

## 12.2 Exact retrieval

Support deterministic authorized source retrieval for person/subject/file/date/content where practical.

## 12.3 Natural-language retrieval

Where implemented, answer only from authorized evidence/current accepted state and expose Source/as-of context when material.

## 12.4 Retrieval is not mutation

Search/semantic similarity never silently creates/merges/closes/updates a Responsibility or authorizes cross-account semantic merge.

No match -> honest no result, preserve query/scope, no synthetic plausible answer.

---

# 13. People context

Person/company context is conditional breadth. If activated, it exists only for communication restoration:

- authorized identity/organization;
- current open Responsibilities;
- recent material topics;
- relevant Source/files.

Do not introduce CRM pipeline, relationship score, personality profile or network graph without a separate Product decision.

---

# 14. Application session / mailbox authorization

Lunowa application authentication is separate from provider mailbox authorization.

App session states may include signed out, authenticating, authenticated, expired/error, signing out.

Device/app sign-out does **not** imply provider disconnect or server-side monitoring stop. After confirmed sign-out, copy may clarify that monitoring settings were not changed.

Mailbox connect:

```text
not connected
-> authorization starting
-> external provider step
-> callback/verification pending
-> connected
   or denied/cancelled/failed
```

Do not claim connected until the authoritative callback/server state confirms it.

Read/sync/send capabilities may degrade independently; capability != permission != monitoring health.

---

# 15. Onboarding

Preferred normal path:

```text
sign in
-> connect one mailbox
-> explain bounded capability/authority
-> initial sync with truthful coverage
-> Source becomes usable as evidence arrives
-> choose one suitable current live loop
-> show bounded monitoring promise
-> explicit [この件を任せる]
-> pending
-> confirmed Managed/appropriate projection
```

Do not require profiles, taxonomy lessons, multi-account organization, broad AI preferences or generic rules before first value.

Historical sync must not auto-flood live My Turn/Managed from old unanswered mail.

## 15.1 No suitable current loop

If no suitable current live loop exists:

- do not manufacture a Responsibility;
- do not activate historical unanswered mail merely to complete onboarding;
- keep Source useful;
- allow setup to finish/skip delegation;
- let the user delegate a real current item later.

No current delegation is a valid state, not onboarding failure.

## 15.2 Trust migration

Do not silently switch default landing to Attention-first or reduce provider notifications before trust is earned. Such changes remain explicit/opt-in Product hypotheses.

---

# 16. Settings / lifecycle

Settings render only controls backed by current capability. No dead autonomy/rule-builder surface.

Persisted settings use common mutation truth: pending != accepted.

Keep these actions distinct:

- app/device sign-out;
- provider reconnect;
- intentional mailbox disconnect;
- Product-account deletion.

Intentional disconnect with live delegated loops requires decision-complete confirmation including account, monitoring consequence, affected scope/count, inspect path and `stop monitoring != outcome completed` meaning.

Product-account deletion UI must not invent deletion SLA, backup retention, export, billing or provider-revocation guarantees before the accepted legal/data contract exists.

---

# 17. Background updates / navigation continuity

Preserve where practical:

- active Product surface/filter;
- selected Conversation/Responsibility/Review;
- search query/results/scroll;
- Moment/Source position;
- active draft/recipients/attachments;
- pane widths;
- async mutation/effect state;
- open provenance/attachment context.

Background updates must not steal focus, discard input or cause uncontrolled list jumps.

If a Review auto-resolves from new trusted evidence while the user is viewing it:

- do not automatically navigate/focus-jump solely because background state changed;
- preserve current place;
- show that new information resolved the question and expose the resulting current state;
- let the user choose navigation unless their explicit action caused the transition.

Back from compact/mobile Detail returns to exact prior list/query/scroll and returns focus to the originating item where possible.

---

# 18. Error/offline behavior

Communicate:

1. what happened;
2. what is affected;
3. what remains safe/usable;
4. what the user can do now.

Prefer safe cached/accepted content over blank UI.

- session expiry -> re-authenticate without falsely implying monitoring stopped;
- account reconnect -> isolate affected account/capability;
- sync degradation -> show monitoring integrity impact;
- send failure/ambiguity -> preserve composer/context;
- AI unavailable -> Source/basic deterministic retrieval/manual contextual reply remain when supported;
- attachment preview failure -> local fallback;
- app update -> never destroy active draft/input.

Toasts may supplement low-risk success but are never the sole carrier of material failure/ambiguity/integrity/Review/destructive consequences.

---

# 19. Keyboard / accessibility interaction

Primary controls are keyboard reachable with visible focus and logical order.

Required interaction behavior:

- native Enter/Space activation where appropriate;
- Escape closes transient surface and returns focus to trigger;
- opening compact Detail moves focus to meaningful heading/action;
- Back returns focus to origin where possible;
- background updates do not move focus;
- focus remains visible/not obscured by sticky UI;
- no essential hover-only or drag-only behavior;
- color is not sole state cue;
- async status can be announced programmatically without forcing focus;
- reduced motion is respected;
- Japanese IME behavior follows §6.4;
- longer Japanese text/font substitution/zoom do not hide decision-critical safety/Review/integrity content.

WCAG 2.2 AA is the current web release baseline; implementation-testable requirements live in `V1-UI-IMPLEMENTATION-CONTRACT.md`.

---

# 20. Interaction verification checklist

A Product-relevant implementation slice verifies as applicable:

- strict Home all-clear only under valid zero/integrity conditions;
- Home preserves typed Needs You/Review and attention-aware ordering;
- Needs You row -> Moment;
- Source row -> Source;
- Source status affordance -> Moment;
- My Turn / Waiting / Later / Done / Review match canonical projection semantics;
- awareness-only update != Needs You;
- follow-up is My Turn reason/action, not lifecycle species;
- communication hold remains Waiting unless separately deferred;
- multiple Responsibilities still produce one primary Moment;
- high-risk request surfaces safe verification rather than blind execution;
- Source due / user target / return time remain distinct;
- trigger re-evaluates before delivery;
- Managed inspection/focus does not fabricate MY_TURN;
- intentional Stop Tracking != Integrity failure != successful closure;
- Review answer pending/failure/auto-resolution preserves truth/focus;
- return-condition change pending != accepted promise;
- app sign-out != provider disconnect/monitoring stop;
- mailbox capability failures remain scope-local;
- contextual reply preserves sender/recipients/input;
- Send pending/failure/ambiguity/reconciliation remain distinct;
- exact-only Search does not advertise Q&A;
- no suitable onboarding loop can finish without fabricated Responsibility;
- historical initial sync does not auto-flood live work;
- AI failure leaves supported core Source/manual behavior usable;
- attachment security blocks are not bypassed;
- Settings/disconnect/deletion pending state does not display premature accepted consequence;
- keyboard/focus/IME/accessibility remain sound.

Do **not** make full fresh-Compose/provider mailbox parity a Product-validation gate unless a live accepted task explicitly requires it.

---

# 21. Default interaction decision rule

When behavior is unspecified, choose the simplest familiar interaction that:

1. preserves the user's place/input;
2. reduces monitoring/reconstruction burden;
3. keeps source evidence accessible;
4. surfaces only real user attention needs;
5. is reversible/correctable where practical;
6. avoids surprising account/provider behavior;
7. does not require AI for Source availability;
8. does not ask about harmless uncertainty;
9. does not confuse mailbox/projection state with canonical Responsibility truth;
10. does not advertise unsupported capability;
11. does not show a user request as accepted state before confirmation;
12. does not expand Product authority merely because a model/tool can technically do more.
