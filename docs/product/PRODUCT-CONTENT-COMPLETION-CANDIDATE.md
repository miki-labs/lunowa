# Lunowa Product Content Completion Candidate

## Status

**NONCANONICAL cumulative Product candidate — 2026-08-27.**

This document is the full remaining-Product-content candidate for GitHub Issue #45. It is intentionally evaluated as one cumulative contract so that User Control, failure/degradation, account lifecycle, Settings, communication edge cases, Managed/Review, zero states, and final scope boundaries are reconciled together rather than patched through isolated micro-loops.

It does **not** supersede `docs/product/PRODUCT.md` until an explicit canonical promotion passes full acceptance audit. Canonical Responsibility semantics remain under `docs/product/responsibility/`.

Evidence/rationale:

- `docs/product/research/user-control-correction-escalation-evidence-2026-08-27.md`;
- `docs/product/research/product-content-completion-evidence-2026-08-27.md`.

This candidate does not establish ICP/PMF/WTP or production reliability and does not authorize Issue #28, provider activation, persistence, or runtime implementation.

---

# 1. Completion doctrine

Lunowa's Product content is complete only when the happy path and the **control / failure / lifecycle / edge / zero-state boundaries** all preserve the same promise:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The remaining doctrine is:

> **Eliminate work, not control. Control must be local and semantically exact; failure must reduce claims before it reduces honesty; account/settings behavior must preserve delegated intent without inventing authority; and an empty screen must never conceal an unknown state.**

Product-content completeness means the Product contract is coherent enough to test. It does **not** mean the Product hypotheses are empirically validated.

---

# 2. User Control / Correction / Escalation

## 2.1 Control is not constant confirmation

The user must be able to intervene without supervising every inference.

Use local case-level controls for a case-level intent. Use Settings only for persistent cross-case scope/preferences.

Do not make ordinary control depend on AI-debug vocabulary, confidence values, prompts, hidden rules, or a generic workflow editor.

## 2.2 Distinct control meanings

The Product must not collapse these into generic `Fix`, `Undo`, or `Done`:

### A. Correct interpretation

Examples:

- `最新の期限は金曜です`;
- `待っているのは見積書です`;
- `この依頼の担当は私ではありません`.

Rules:

- user input is authorized according to existing field-specific Responsibility authority;
- correction is **field-scoped** unless canonical semantics explicitly justify broader effect;
- source communication remains immutable;
- semantic kind remains truthful: a `USER_TARGET` does not become a `SOURCE_DUE` merely because the user entered the date, and a user preference does not rewrite what another party communicated;
- accepted state is re-evaluated from current evidence + authorized correction;
- material prior state/correction provenance remains reconstructable where needed;
- correction does not permanently freeze unrelated fields and does not silently become standing policy.

### B. Return attention now

The user may cancel a defer, open/focus a Managed item, or request immediate inspection.

Rules:

- this changes attention/defer/focus intent only where semantically valid;
- it does **not** assert external-world change;
- it does **not** create a USER obligation that does not exist;
- therefore a Waiting item with no current USER action does not become `Needs You / MY_TURN` merely because the user wants to inspect it now;
- canonical projection remains derived from current Responsibility semantics.

### C. Modify return condition

Examples:

- `明日ではなく金曜に再確認`;
- `返信が来たら再評価`.

Rules:

- modifies the relevant accepted Temporal/attention contract or user-owned return intent;
- does not alter outcome truth or source deadline;
- trigger firing still causes current-state re-evaluation; it is not automatic notification.

### D. Stop tracking

Rules:

- ends Lunowa monitoring for the affected Responsibility/scope according to existing domain authority;
- does not claim successful satisfaction;
- does not cancel counterpart expectations;
- source/history remains available according to Product/data policy;
- if later tracking is re-enabled, that is a new user monitoring decision, not proof the old world state changed.

### E. Confirm/correct outcome state

A user may supply authoritative evidence such as off-channel completion, cancellation, or a known correction.

Rules:

- treat the input according to field-specific evidence authority;
- canonical reduction still decides the accepted semantic effect;
- user-provided evidence does not erase source/history;
- one correction does not become unrelated future policy.

### F. Approve external action

Rules:

- approval grants only the displayed/bounded action authority;
- monitoring delegation does not imply action authority;
- permission does not imply provider success;
- provider/tool result still reconciles before accepted state changes.

## 2.3 Smallest material correction

When Lunowa is wrong, repair from trusted evidence automatically when safe. If user judgment is required, ask the smallest material question with bounded choices and source access.

Prefer:

```text
期限を確認

最新本文   金曜まで
以前の本文 月曜まで

[金曜として扱う]
[月曜として扱う]
[原文を見る]
```

Avoid asking the user to reconstruct internal `Responsibility`, model confidence, prompt logic, or scheduler state.

## 2.4 Review is a safety valve, not an uncertainty inbox

Semantic Review is justified only when material ambiguity/safety prevents a safe accepted Product contract and cannot be resolved more cheaply/safely.

Potential triggers remain grounded in existing semantics:

- whether a Responsibility exists;
- material current bearer/actionability;
- material temporal/expected-event conflict;
- conflicting closure/satisfaction evidence;
- consequential/irreversible/security/financial/contractual/identity-sensitive requested action;
- sender/account/recipient/attachment ambiguity that materially changes an external action.

Do **not** escalate harmless taxonomy/wording uncertainty, stylistic draft uncertainty, or low model confidence when conservative safe behavior is available.

Monitoring infrastructure degradation routes to Integrity Alert/recovery, not a fabricated semantic Review subject.

## 2.5 Decision-complete approval

Before a consequential external commit, expose the decision-critical effect as relevant:

- effective sender/account;
- recipients/scope;
- content/commitment;
- attachments;
- target object/system;
- meaningful irreversibility/risk when not obvious.

Routine explicit Send approval belongs in the contextual composer/Moment path and does not become a Review backlog merely because it requires a human click.

## 2.6 Repeated error response

Repeated material correction in one class is evidence that current automatic handling is insufficient.

Candidate response:

1. identify/narrow the affected class;
2. preserve conservative monitoring/source behavior;
3. increase confirmation only where material;
4. disclose meaningful scope narrowing;
5. re-expand only after evidence and, for permission expansion, explicit user authorization.

Never silently expand external-action authority from successful corrections, model confidence, or prior approval history.

Correction history does not itself create a standing instruction/preference object. That remains an explicit future Product decision.

## 2.7 True reversibility

Use lightweight Undo/reversal for genuinely reversible internal Product effects such as draft edits, local view state, defer/return-condition edits where the accepted contract can be restored safely.

Do not classify email send, payment, contract acceptance, permission change, calendar mutation, deletion, or another external effect as low-risk merely because the UI can display `Undo`.

External effect flow remains:

```text
preview / explicit bounded commit
-> provider/tool request
-> reconciliation
-> accepted state update
```

---

# 3. Failure / Degraded-State Product Contract

## 3.1 Failure is about affected promises, not one global error state

Do not introduce one global `DEGRADED` Product state or Responsibility lifecycle value.

For every material failure ask:

```text
What capability/promise is affected?
What is the last trustworthy observation?
Which account / delegated loops / actions are affected?
What remains safe and usable?
What must reconcile before normal reassurance resumes?
```

## 3.2 Conceptual failure classes

These are Product reasoning categories, **not an authorized enum/schema**.

### A. Provider authorization / source-visibility loss

Examples: OAuth revoked, admin consent removed, provider outage prevents new evidence.

Behavior:

- affected delegated monitoring is no longer trustworthy;
- stop healthy reassurance for that scope;
- show account identity, affected scope/count where known, and last trustworthy observation;
- offer concrete reconnect/recovery where available;
- cached/source history may remain readable with an `as of` boundary;
- unrelated healthy accounts/capabilities are not degraded merely by association.

### B. Source ingestion lag / completeness uncertainty

Behavior:

- distinguish `data through X` from current truth;
- if the gap can affect delegated monitoring, show Integrity Alert for the affected scope;
- do not treat partial sync as an empty inbox/zero-attention proof;
- reconcile the missing interval before restoring healthy Managed reassurance.

No numeric stale threshold is fixed here.

### C. Temporal Contract / scheduler degradation

Behavior:

- do not pretend promised reconsideration happened;
- on recovery, reconcile overdue/stale triggers against current Responsibility/evidence before effects;
- show the missed/uncertain interval and affected scope when material;
- trigger recovery still does not imply notification or `MY_TURN`.

### D. AI interpretation degradation

Behavior:

- preserve accepted state; do not randomly rewrite because a model is unavailable or changed;
- Source/basic deterministic search/manual contextual reply remain usable where runtime permits;
- if new source evidence cannot be interpreted sufficiently to honor delegated monitoring, the **monitoring promise for that affected scope is degraded**, even though Source remains usable;
- route affected cases to conservative source-first/review/attention fallback according to what user judgment is actually required;
- do not claim `No Responsibility` merely because AI failed to interpret.

### E. External action execution / reconciliation failure

Definite failure:

- preserve draft/action context;
- show retry/edit/cancel paths where safe;
- do not mutate Responsibility as if action succeeded.

Ambiguous outcome:

- do not blind-retry potentially duplicated external effects;
- preserve an explicit pending/reconciliation posture;
- use provider observation before accepted state transition.

### F. Notification / delivery-channel degradation

Monitoring integrity and attention-delivery integrity are separate.

- a broken push channel does not automatically mean source monitoring failed;
- if the channel failure can prevent a promised material attention handoff, disclose the affected delivery capability and use only separately authorized safe fallback channels;
- exact fallback-channel policy remains UNKNOWN until validated.

### G. Client/network offline

If server-side monitoring remains healthy, local offline state is not automatically monitoring failure.

- show cached accepted state with `as of` where material;
- block/queue external actions only according to actual capability;
- never imply a send happened while offline unless the provider later confirms it;
- do not hide a server-side Integrity Alert once connectivity returns.

### H. Local feature failure

Attachment preview, semantic search, person context, or draft assistance may fail independently.

- degrade locally;
- preserve source/open/download/manual path where safe;
- only escalate to monitoring Integrity Alert if that failed capability is actually required to maintain the delegated promise.

## 3.3 Recovery contract

Healthy-looking reassurance may resume only after the affected source/trigger/action interval has been reconciled enough to make the claim trustworthy.

A recovery surface should communicate, when supportable:

1. what failed;
2. affected account/scope/interval;
3. last trustworthy observation;
4. what remained safe/usable;
5. what was reconciled/rechecked;
6. whether delegated scope was narrowed;
7. what the user must do, if anything.

Apology may accompany this but is not the recovery itself.

## 3.4 User-discovered material miss

When the user finds a material false negative:

- restore the affected item to a safe truthful state;
- inspect/reconcile the related affected scope, not only the one visible item;
- disclose impact window/scope when supportable;
- narrow the risky handling class before broader automation;
- do not globally disable unrelated safe behavior without evidence of systemic impact.

---

# 4. Account Lifecycle

## 4.1 Account operations have distinct meanings

The Product must distinguish:

```text
sign out of this Lunowa client/device
!= provider authorization lost/revoked
!= intentionally disconnect mailbox from Lunowa
!= delete Lunowa Product account
```

Do not label all four `Sign out` or make users guess the monitoring consequence.

## 4.2 Connect one mailbox

Current v1 direction remains one-provider complete-loop proof.

Connection flow should disclose in ordinary language:

- which account is being connected;
- what source Lunowa can read/monitor under granted provider permissions;
- what consequential actions still require approval;
- that provider/source mail remains provider-owned;
- that connection alone does not auto-delegate every historical thread.

## 4.3 Initial sync / bootstrap

While source completeness is not established:

- do not claim a trustworthy empty/zero state;
- show sync progress/coverage at a useful level rather than an agent activity feed;
- preserve Source access as data becomes available;
- do not auto-flood Needs You with years-old unresolved-looking history;
- historical source can become searchable without becoming live Responsibility state;
- first delegation should remain a bounded real current loop according to onboarding policy.

## 4.4 Temporary authorization loss / reconnect

If prior user intent to monitor remains but provider authorization is lost unexpectedly:

1. mark the affected account's monitoring integrity degraded;
2. preserve cached accepted/source history with last-trustworthy boundary where safe;
3. request reconnect when user action is needed;
4. after authorization returns, reconcile the missing interval;
5. only then restore healthy reassurance/normal delegated monitoring.

Temporary auth recovery may preserve prior delegation intent because the user did not choose to stop it; state effects still wait for successful reconciliation.

## 4.5 Intentional mailbox disconnect

Disconnect is a deliberate end to Lunowa's provider relationship for that mailbox, not a provider error.

Before commit, show at minimum:

- exact account identity;
- that new source monitoring will stop;
- currently delegated monitoring affected, preferably by count/scope rather than a frightening raw list;
- that Stop Tracking/disconnect does not mean those external outcomes succeeded;
- what source/history remains available in Lunowa under current data policy;
- what provider mail remains in the provider;
- any known draft/permission/notification consequences that materially affect the decision.

On disconnect:

- affected live monitoring ends/is no longer active under existing domain authority;
- relevant Temporal execution that only existed to monitor the disconnected source must not continue pretending it can fulfill the promise;
- Responsibilities are not marked successfully satisfied merely because monitoring stopped;
- Source/history retention follows the separate accepted privacy/data policy.

Exact deletion/retention mechanics are not invented here.

## 4.6 Re-add after intentional disconnect

Re-adding the same mailbox:

- re-establishes provider/source capability after reconciliation;
- must not silently reactivate every previously delegated loop;
- previously stopped delegation may be offered for explicit restoration where useful;
- historical sync still must not auto-create live work;
- duplicate provider evidence must not duplicate Responsibilities/effects under existing idempotency/identity rules.

## 4.7 Scope-specific permission loss

If read access remains while send permission is unavailable, monitoring may remain healthy while contextual Send is unavailable.

If send remains but read/sync is lost, Lunowa must not infer monitoring health merely from its ability to send.

Permission/capability health should match the actual Product function affected.

## 4.8 Delete Lunowa account

Product-account deletion is a high-consequence Product operation distinct from mailbox disconnect.

Before commit, communicate:

- that all Lunowa monitoring/delegation will stop;
- connected provider authorizations will be revoked/disconnected as supported by the implementation/privacy contract;
- provider-owned mail is not deleted merely because Lunowa is deleted;
- drafts, Product state, history, billing/subscription, and retained audit/backup data behavior according to the actual accepted legal/data contract.

The Product must provide an explicit destructive confirmation appropriate to the real consequences.

**UNKNOWN:** exact deletion SLA, backup/audit retention, export guarantees, organization-admin constraints, and billing behavior remain owned by future legal/privacy/commercial implementation decisions.

Do not fabricate those commitments in Product copy before they are accepted.

---

# 5. Settings Product Contract

## 5.1 Settings is a control plane, not the daily workflow

Case-specific controls stay at the affected Moment/Managed/Review surface. Settings is for persistent, cross-case user-owned choices.

Candidate v1 Settings IA:

1. **Accounts & Data**;
2. **Attention & Notifications**;
3. **Delegation**;
4. **Actions & Permissions**;
5. **Privacy & AI/Data use** where actual policy requires user choice/disclosure;
6. **Experience** for lightweight language/landing/accessibility/display choices supported by Product/implementation.

Exact labels/navigation remain usability hypotheses.

## 5.2 Accounts & Data

Should expose:

- connected account identity;
- current integrity/reconnect status;
- intentional disconnect;
- Lunowa-account deletion/data controls according to accepted policy.

Do not mix device sign-out and mailbox disconnect.

## 5.3 Attention & Notifications

May expose:

- notification permission/channel status;
- simple quiet hours;
- optional awareness/digest preferences if validated;
- other bounded delivery choices that preserve Urgency/Integrity semantics.

Rules:

- quiet hours suppress interruption, not monitoring;
- turning off one notification channel does not silently stop monitoring;
- if delivery configuration can no longer honor a material handoff promise, state the limitation rather than silently accepting an impossible contract.

## 5.4 Delegation

Persistent delegation settings may expose only scopes/classes the user explicitly enabled under onboarding/trust progression.

Rules:

- class-scoped monitoring never bypasses admission/No Responsibility/safety/identity;
- disabling a class stops **future automatic delegation for that class by default**;
- it does not silently stop already delegated live Responsibilities;
- if the user also wants existing matching delegated items stopped, offer a separate explicit effect with affected scope shown;
- no generic rule builder is implied.

## 5.5 Actions & Permissions

Initial v1 email Send remains human-approved by default.

If future bounded standing authorization exists, Settings should show/revoke it by action/context/scope. Do not expose one global autonomy slider.

Revoking permission affects future external actions; it does not rewrite historical provider effects or accepted Responsibility state.

## 5.6 Privacy / correction learning

Correction history does not automatically become standing instruction or permission. Any future preference-learning/data-use behavior requires its own clear Product/privacy decision.

Do not expose an `AI confidence` or prompt-debug panel as ordinary user control.

## 5.7 Default landing / Source-first progression

A user may explicitly choose Source/Home landing where Product supports the choice. Lunowa may offer Attention-first after credible successful delegation, but never silently change it from an internal trust score.

---

# 6. Communication Edge Cases

These cases close Product behavior without introducing a new domain taxonomy. Existing Responsibility semantics remain authoritative.

## 6.1 No Responsibility / automated mail

Newsletters, FYI, receipts, notifications, automated sender mail, or machine-generated content may correctly produce `DO_NOT_TRACK / No Responsibility`.

Automation/source type alone is not decisive: an automated message can still create real user work if the communication evidence establishes one.

## 6.2 Multiple Responsibilities in one Conversation

One Conversation may carry multiple independent outcomes. UI keeps one primary Moment and compact secondary items; never collapse them into one giant task or newest-message status.

## 6.3 Quoted / forwarded history

Quoted/forwarded text may provide context/provenance but does not automatically carry current communicative authority. Do not treat a quoted old request as a new current request merely because it appears in the latest message body.

## 6.4 CC / group / ambiguous assignment

CC membership does not imply obligation bearer. Group/shared assignment must preserve real ambiguity or use material Review where required; do not hide ambiguity in `BOTH` or invent team-workflow semantics.

## 6.5 Sender / alias / account ambiguity

Effective sender account and recipients remain explicit for external actions. Semantic similarity does not authorize cross-account identity merge. Cross-account semantic auto-merge remains prohibited initially.

## 6.6 Out-of-office / auto-reply

An automatic acknowledgement/OOO normally does not satisfy the requested outcome.

It may update an expected event or useful temporal context if supported by evidence, but does not become success merely because `a reply arrived`.

## 6.7 Acknowledgement / partial answer / progress update

`Received`, `working on it`, or a partial response is evidence, not automatic closure. Update expected events/material state and remain quiet when no user action is needed.

## 6.8 Bounce / non-delivery

A reconciled send may later receive trusted non-delivery evidence. Re-evaluate whether the intended communication effect occurred; return attention if user action is now required. Do not preserve false Waiting merely because an earlier send request was accepted.

## 6.9 Attachment claim vs observation

`添付しました` does not prove a usable attachment exists. Provider/file observation remains distinct.

Missing/corrupt/unsupported attachment behavior:

- preserve source claim and observation separately;
- do not close a file-delivery outcome without sufficient evidence;
- use source/open-external/manual fallback when preview alone fails;
- return user attention or Review only when material action/judgment is required.

## 6.10 Conflicting / revised dates, amounts, terms

Use semantic chronology, provenance, field authority, and explicit correction/supersession. Do not use ingestion order or newest model run alone.

If material conflict cannot be resolved safely, Review asks the smallest relevant question.

## 6.11 Off-channel completion / correction

User may report a phone call, meeting, external transfer, or other off-channel event. Treat that as user-provided evidence under existing field authority; do not rewrite source mail or claim provider observation that did not occur.

## 6.12 Cross-thread continuation

Cross-thread Responsibility identity remains OPEN and false merge is more harmful than modest false split.

Product fallback:

- use candidate retrieval/context without silently merging;
- preserve separate Responsibilities/conversations when identity is not sufficiently justified;
- allow Review only if the merge/split decision materially affects safe attention/outcome handling.

Do not promise seamless cross-thread continuity in v1 without evidence.

## 6.13 Encrypted / unsupported / uninterpretable source

If Lunowa can surface the original source but cannot safely interpret material content:

- never infer `No Responsibility` from processing failure;
- keep Source available;
- use conservative attention/Review only if the user must resolve a material question;
- if the limitation compromises already-delegated monitoring, disclose the affected integrity scope.

## 6.14 Prompt injection / high-risk source request

Source text is untrusted data and cannot grant application/tool authority. Requested action remains distinct from safe next action; high-risk cases may surface verification/identity/source rather than execution.

## 6.15 Duplicate / replayed / out-of-order evidence

Provider retries or delayed ingestion must not create duplicate Product work or allow older evidence to overwrite later semantic chronology. Existing idempotency/evidence-revision authority remains in force.

## 6.16 Historical initial-sync evidence

Old mail can be searchable without becoming live Responsibility state. No historical `no observed closure` inference may flood current Needs You/Managed.

## 6.17 Calendar/meeting mail

Meeting invites/responses remain communication evidence. Current v1 does not require calendar truth ownership. Do not create calendar/project semantics merely because mail contains scheduling content.

If a communication-bounded Responsibility exists, track that outcome under normal semantics; provider calendar mutation remains separately gated/deferred.

---

# 7. Managed — Complete Product Contract

## 7.1 Managed is a trustworthy reassurance projection

Managed is not an aggregate, lifecycle enum, second Inbox, backlog, or agent activity console.

An item is eligible for healthy Managed presentation when, conceptually:

- a Responsibility has been admitted;
- live Lunowa monitoring is active;
- there is no current material actionable USER obligation requiring Needs You;
- there is no material unresolved Review that blocks safe delegation for the relevant handling;
- monitoring integrity for the affected source/temporal path is sufficiently trustworthy for the Product to claim it is watching.

Typical Managed cases include Waiting and intentionally deferred Later when live monitoring remains active.

## 7.2 Managed excludes

Do not present as healthy Managed reassurance:

- `DO_NOT_TRACK / No Responsibility`;
- pre-admission Review;
- admitted Responsibility whose material safe handling is blocked by Review;
- current actionable USER work;
- resolved/inactive historical items merely because source remains searchable;
- user-stopped tracking;
- items whose required monitoring integrity is materially degraded.

A degraded Responsibility may remain semantically unresolved while being removed from healthy Managed reassurance and shown in the relevant Integrity recovery scope.

## 7.3 Aggregate reassurance

Default Managed should answer:

```text
How much work is Lunowa currently carrying?
Is it currently trustworthy to say that?
Do I need to do anything?
```

Candidate presentation:

```text
Lunowaが見ています 14
現在、追加対応が必要なものはありません
最終同期: 2分前
```

If three items are degraded, do not quietly include them in a green `17 managed` claim. Separate healthy managed work from affected integrity scope.

## 7.4 Managed inspection

On intentional inspection, show only useful stewardship context:

- tracked outcome;
- expected actor/event;
- next return/reconsideration condition;
- latest material evidence / `as of` where useful;
- integrity status;
- Source/provenance;
- local controls: inspect, modify return condition, correct material interpretation, stop tracking, cancel defer/focus now where semantically valid.

Do not expose routine model/tool/scheduler trace as a default user feed.

## 7.5 Managed self-checking is a trust signal

Repeated opening of unchanged Managed items is not engagement success. It is candidate evidence that users do not yet trust the delegation contract enough to stop parallel monitoring.

---

# 8. Review — Complete Product Contract

## 8.1 Review is a question surface, not one canonical state

The user-facing Review surface may contain:

1. a pre-admission `NEEDS_REVIEW` subject where Responsibility existence/relevance itself is unresolved;
2. an admitted Responsibility with a material field/safety ambiguity.

Internal subject distinction remains explicit even if UX is unified.

## 8.2 Membership test

A Review item exists only when all relevant conditions hold:

1. the ambiguity/risk is material to safe admission, actionability, outcome, timing, identity, or consequential action;
2. current evidence/rules cannot resolve it safely enough;
3. user authority/judgment is actually useful or required;
4. asking now or at the appropriate review point creates less harm than conservative fallback.

Low model confidence alone fails this test.

## 8.3 Review is not routine external approval

Ordinary explicit Send approval occurs in the contextual communication flow. It does not create a durable Review item solely because a human must press Send.

Review may be used when the **meaning/safety of the action itself** is materially unresolved, such as recipient identity conflict or a high-risk request.

## 8.4 Review interaction

Show:

- one exact material question;
- minimum conflicting/decision-critical evidence;
- bounded choices where possible;
- source access;
- effect language users can understand without internal ontology.

Review can resolve when:

- new trusted evidence resolves it automatically;
- user makes the bounded authoritative decision;
- user chooses a valid `do not track` path for pre-admission uncertainty;
- the underlying candidate becomes irrelevant/superseded under existing semantics.

Do not fabricate resolution merely because the user leaves the screen.

## 8.5 Review and delivery urgency are separate

A Review subject is not automatically urgent. Delivery follows delay cost/actionability/safety.

An urgent material Review may interrupt; a nonurgent one may wait to the normal review point. The existence of Review does not itself override quiet-hours policy unless delay cost justifies it.

## 8.6 Review load is a Product-quality metric

Excessive Review is failure, not proof of safety. Track unnecessary Review burden and repeated ambiguity classes; narrow automation/scope where needed instead of normalizing a permanent approval queue.

## 8.7 Empty Review is hidden

When there are no material Review subjects, the Product need not show a permanent empty Review destination/badge.

---

# 9. Empty / Zero / Unknown / Unavailable States

## 9.1 True zero attention

Condition:

- no material Review requiring current presentation;
- no current Needs You work.

Behavior:

- say truthfully that the user has nothing to do now;
- if healthy Managed work exists, show quiet reassurance;
- keep Source accessible;
- do not replace this with unread count or Inbox Zero celebration.

Candidate copy:

> **今、あなたが対応する必要はありません。**

## 9.2 Zero Managed

If Source is connected/healthy but the user has delegated no current live loops:

- do not claim `everything handled`;
- say that Lunowa is currently monitoring nothing;
- optionally offer a bounded way to delegate a real current loop;
- keep Source useful without forcing activation.

## 9.3 Zero Review

Hide the Review nav/badge/surface by default. Do not create a congratulatory Review-zero ritual.

## 9.4 Zero Search Results

- say no authorized matching source/current state was found;
- preserve query/filter/account scope visibly enough to correct it;
- allow exact Source search/broader query;
- never fabricate an answer from semantic plausibility.

## 9.5 Zero People/History context

If there is no relevant authorized material history, show none. Do not synthesize a personality/profile to fill space.

## 9.6 Initial-sync unknown is not zero

Before sufficient source reconciliation:

- show `syncing / data through X / partial` honestly;
- do not say no work exists;
- do not infer a clean Managed/Needs You zero.

## 9.7 Degraded unknown is not zero

Provider/scheduler/AI-dependent monitoring degradation must show affected integrity; cached zero counts are not trustworthy current truth unless bounded by `as of` and clear scope.

## 9.8 Intentionally stopped monitoring is not healthy zero

If the user disconnected/stopped all delegation, say that Lunowa is not monitoring anything. Do not visually equate this with a healthy `nothing needs you because Lunowa has it` state.

## 9.9 No AI interpretation is not `No Responsibility`

Abstention/processing failure is distinct from semantic `DO_NOT_TRACK`. Use source/manual/review/integrity fallback according to actual cause/materiality.

---

# 10. Final Feature Matrix Candidate

Status meanings:

- **V1 CORE** — required Product behavior for a credible Minimum Complete Delegation Loop or safe public operation of that loop;
- **V1 STRONG CANDIDATE** — likely high-value v1 breadth but not required until Product evidence/experiment demands it;
- **POST-V1** — plausible next breadth after core proof;
- **DEFERRED** — intentionally not current priority; revisit only with evidence/dependency need;
- **OUT** — outside current core Product identity, not merely postponed engineering.

| Product capability | Final posture | Boundary / reason |
|---|---|---|
| one-provider authorized Source read | V1 CORE | source/provenance trust path |
| source ingestion/reconciliation sufficient for complete loop | V1 CORE | monitoring requires current evidence |
| Responsibility admission/update under canonical semantics | V1 CORE | semantic core |
| `No Responsibility` / abstention-safe handling | V1 CORE | prevents task spam/false work |
| Needs You | V1 CORE | current USER work |
| Moment | V1 CORE | context handoff |
| Managed | V1 CORE | delegated-monitoring assurance/inspection |
| Review | V1 CORE | sparse material ambiguity/safety valve |
| Source Conversations | V1 CORE | original communication fallback |
| Temporal monitoring / durable reconsideration behavior | V1 CORE | core safe-forgetting promise |
| explicit Later/return-condition control | V1 CORE | bounded attention delegation |
| field-scoped correction | V1 CORE | human control/trust |
| Return Attention / inspect now without fabricating actionability | V1 CORE | intervenability |
| Stop Tracking with truthful non-success semantics | V1 CORE | user control |
| monitoring-integrity / degraded-state UX | V1 CORE | dependency grows with reliance |
| reconnect / source reconciliation after auth loss | V1 CORE | safe real-provider operation |
| intentional mailbox disconnect with delegated-scope warning | V1 CORE | user control / lifecycle |
| Product-account deletion boundary | V1 CORE for public release | destructive lifecycle control; exact legal SLA separate |
| minimal Settings control plane | V1 CORE for public release | accounts/attention/delegation/permissions/data |
| contextual Reply / Reply All | V1 CORE target | completes active Moment |
| bounded contextual AI draft | V1 CORE target | lowers action cost; user editable |
| explicit user Send | V1 CORE target | current authority posture |
| send reconciliation / ambiguity handling | V1 CORE | send click != outcome |
| exact source search | V1 CORE | deterministic retrieval/trust |
| operational retrieval sufficient for validated cases | V1 CORE target | restores unresolved state, not generic chat |
| basic attachment open/preview fallback | V1 STRONG CANDIDATE | common communication evidence |
| basic reply attachment add | V1 STRONG CANDIDATE | required by some active loops |
| natural-language operational/source search breadth | V1 STRONG CANDIDATE | incumbent frontier; value must justify cost |
| basic person context | V1 STRONG CANDIDATE | reconstruction aid, not CRM |
| optional awareness/start-of-day digest | V1 STRONG CANDIDATE | must never hide actionable work |
| simple quiet-hours preferences | V1 STRONG CANDIDATE | interruption control; monitoring continues |
| explicit Attention-first default landing choice | V1 STRONG CANDIDATE | only after credible trust progression |
| provider-notification migration assistance | POST-V1 | requires earned reliance and opt-in |
| narrow class-scoped automatic monitoring | POST-V1 / late v1 only if validated | never bypasses admission/safety |
| bounded standing external-action authorization | POST-V1 | action/context/scope-specific and revocable |
| calendar availability read | POST-V1 | useful for communication context if evidence supports |
| second provider | DEFERRED | first-provider complete-loop proof first |
| broad multi-account/unified inbox | DEFERRED | convenience not differentiation; cross-account merge prohibited |
| native arbitrary new Compose parity | DEFERRED / optional convenience | provider fallback acceptable |
| Forward parity | DEFERRED / optional convenience | not core loop requirement |
| full Drafts/Sent/folder/label parity | DEFERRED | provider substrate remains available |
| Send Later parity | DEFERRED | provider-owned unless later evidence |
| bulk mailbox actions | DEFERRED | not core attention model |
| Archive/Delete/Read/Unread/Spam/Block/Unsubscribe parity | DEFERRED / provider-first | mailbox hygiene != Responsibility |
| full attachment-content semantic understanding | DEFERRED | cost/risk/evidence unknown |
| calendar create/modify | DEFERRED | separate approval/authority boundary |
| standing communication instruction/preference memory | DEFERRED / UNKNOWN | correction history must not create it implicitly |
| activity/location-based interruptibility | DEFERRED | privacy/complexity not justified |
| full mobile/client parity before wedge proof | DEFERRED | Product form still empirical |
| CRM pipeline ownership | OUT | not core identity |
| project-plan ownership | OUT | not core identity |
| support-ticket lifecycle ownership | OUT | reference/integration only if useful |
| accounting/payment truth | OUT | high-impact external domain truth |
| generic personal task manager | OUT | Responsibility remains communication-bounded |
| generic automation/rule builder | OUT | not BPM/workflow product |
| relationship/personality scoring | OUT | not communication restoration |
| generic AI chat as primary daily workflow | OUT | system-led routine use |
| autonomous email Send by default | OUT for initial/v1 authority | future only through explicit bounded authorization decision |

No matrix row is implementation authorization by itself.

---

# 11. Product Content COMPLETE boundary

A future canonical promotion may mark **Product Content COMPLETE** when all of the following are true:

1. this cumulative candidate passes full acceptance audit against Issue #45 and all current canonical authorities;
2. material blockers are corrected together, not through latest-patch review;
3. User Control promotion includes the Return-Attention/actionability and semantic-kind corrections above;
4. Failure/account/settings/edge/Managed/Review/zero behavior is durably routed from canonical Product authority;
5. final Feature Matrix is canonical;
6. the Product-level Golden Scenario Bank is canonical and explicitly subordinate to Responsibility semantic oracles;
7. empirical UNKNOWNs remain explicit;
8. Product-content completion does not authorize Product Discovery conclusions or gated implementation;
9. exact-head CI/repository checks pass.

`Product Content COMPLETE` means:

> **The intended Product behavior is sufficiently specified and internally coherent to move its remaining uncertainty into empirical Product Discovery, technical proof, usability testing, legal/privacy decisions, and implementation gates.**

It does **not** mean:

- Product-market fit;
- validated first ICP;
- validated reliability thresholds;
- validated IA/usability;
- validated WTP/retention/distribution;
- production security/provider feasibility;
- Responsibility L2 executable proof;
- permission to skip Issue #36.

---

# 12. Proposed additional Product invariants

If promoted, add/reconcile these with the canonical invariant set:

1. **Control does not require constant confirmation.**
2. **User correction is field-scoped and preserves semantic kind/source provenance.**
3. **Return Attention Now never fabricates world-state change or USER actionability.**
4. **Stop Tracking never proves successful external completion.**
5. **Monitoring delegation never silently grants consequential action authority.**
6. **Review is a sparse safety valve, not an uncertainty/approval inbox.**
7. **Integrity failure is system/degraded-state UX, not semantic Review by default.**
8. **Healthy Managed reassurance excludes work whose required monitoring integrity is materially degraded.**
9. **Recovery must reconcile the affected interval/scope before restoring strong reassurance.**
10. **Temporary provider access loss and intentional mailbox disconnect preserve different user intent.**
11. **Re-adding an intentionally disconnected mailbox never silently reactivates old delegation.**
12. **Settings controls persistent scope/preferences; case-specific intervention stays local.**
13. **Disabling future class-scoped delegation does not silently stop already delegated live loops.**
14. **A true zero state is distinct from unknown, unsynced, degraded, or intentionally unmonitored state.**
15. **Uninterpretable source is never equivalent to `No Responsibility`.**
16. **Routine explicit external-action approval is contextual action UX, not a durable Review item.**
17. **True reversibility must be distinguished from decorative Undo.**
18. **Product Content COMPLETE is specification closure, not empirical validation or implementation authorization.**

---

# 13. Remaining explicit UNKNOWNs after Product-content completion

These are intentionally not documentation blockers:

- exact ICP / first segment;
- prevalence/severity of open-loop monitoring burden;
- real incumbent adequacy;
- attainable material false-negative / unnecessary Review trade-off;
- reliability threshold at which parallel checking stops;
- exact delivery/digest/quiet-hour defaults and alternate-channel behavior;
- exact class-scoped delegation criteria;
- final naming of `Attention Contract` Product language;
- real-world usability of current Home/Needs You/Managed/Review/Source IA;
- mature companion/hybrid vs replacement-client form;
- generic native Compose necessity;
- operational retrieval/attachment understanding depth;
- second-provider/multi-account incremental value;
- pricing/WTP/packaging;
- acquisition/distribution;
- long-term retention;
- provider-notification migration acceptance;
- exact legal/privacy retention/deletion/export commitments;
- standing communication-instruction memory model;
- exact future high-risk verification/authorization policy by action;
- whether Responsibility remains the simplest sufficient mechanism after real field data.

Issue #36 remains the next empirical Product gate after Product-content completion.