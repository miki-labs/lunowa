# Lunowa Product Operating Contract

## Status / authority

**Canonical detailed Product authority when this file is present on `main`. On an unmerged branch, it is a canonical-promotion candidate.**

This document closes the Product-behavior domains required by GitHub Issue #45: User Control / Correction / Escalation, degraded/failure behavior, account lifecycle, Settings, communication edge cases, complete Managed/Review behavior, zero/unknown/unavailable states, and final feature scope.

Authority order remains:

1. `docs/product/PRODUCT.md` — highest-level Product purpose, value, scope, surfaces, sequencing, and invariants;
2. `docs/product/responsibility/` — **FIXED** Responsibility semantic authority;
3. this file — detailed Product operating behavior for the domains above;
4. canonical design files — interaction/presentation realization consistent with Product semantics;
5. architecture/data/runtime contracts — implementation mechanisms, never a source of new Product semantics by accident.

If this file appears to conflict with FIXED Responsibility semantics, Responsibility authority wins and the conflict is a defect.

Product vocabulary here does **not** authorize a new aggregate/table/enum/permission model. In particular, `Managed`, `Review`, `Correction`, `Escalation`, `Integrity Alert`, `Setting`, `Account lifecycle`, and Product-level `Attention Contract` language are not persistence instructions merely because they appear here.

This contract does not establish ICP, PMF, WTP, attainable reliability, production security, legal/privacy retention commitments, or provider feasibility. It does not authorize Issue #28 or Issue #36 conclusions.

---

# 1. Completion doctrine

Lunowa must preserve the same promise across happy path, user intervention, failure, lifecycle transitions, edge cases, and empty states:

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

Operational doctrine:

> **Eliminate work, not control. Control is local and semantically exact. Failure reduces claims before it reduces honesty. Account/settings operations preserve user intent without inventing authority. Empty UI never hides unknown integrity.**

Product content being complete means intended behavior is coherent enough to move unresolved questions into Product Discovery, usability testing, technical proof, legal/privacy work, and implementation gates. It does not mean those questions have been answered.

---

# 2. User Control / Correction / Escalation

## 2.1 Control without constant confirmation

The user must be able to intervene without supervising every inference.

- case-level intent/correction belongs near the affected Moment/Managed/Review context;
- persistent cross-case choices belong in Settings only when the Product actually supports that scope;
- ordinary control never requires prompt/model/debug vocabulary, confidence percentages, or a generic workflow editor.

Lunowa should automatically self-repair from trusted evidence when safe. When user judgment is necessary, ask the smallest material question rather than asking the user to diagnose the system.

## 2.2 Correct interpretation

Examples:

- `最新の期限は金曜です`;
- `待っているのは見積書です`;
- `この依頼の担当は私ではありません`.

Rules:

- user authority remains field-scoped under canonical Responsibility rules;
- source communication remains immutable;
- semantic kind remains truthful: a user-owned target does not become `SOURCE_DUE`, and a user preference does not rewrite another party's communication;
- accepted state is re-evaluated from current evidence + authorized user evidence/correction;
- material provenance remains reconstructable where needed;
- one correction does not freeze unrelated fields;
- correction history does not silently become a standing instruction, class policy, or external-action permission.

Later authoritative evidence may supersede a prior user-corrected field **only where canonical field authority allows that evidence to do so**. That does not revoke the user's general authority or modify unrelated fields.

## 2.3 Return Attention Now

The user may open/focus a Managed item, cancel a defer, or explicitly request immediate inspection.

This changes attention/focus/defer intent only where semantically valid.

It does **not**:

- assert world-state change;
- create a USER obligation that does not exist;
- turn Waiting into `MY_TURN` merely because the user wants to look now;
- imply a new external-action permission.

## 2.4 Modify return condition

Examples:

- `明日ではなく金曜に再確認`;
- `返信が来たら再評価`.

Rules:

- modifies the relevant accepted Temporal/attention return intent;
- does not rewrite outcome truth or communicated source deadline;
- a trigger reloads current evidence and re-evaluates state;
- trigger firing is not automatically a notification or `MY_TURN` transition.

## 2.5 Stop Tracking

Stop Tracking ends Lunowa monitoring for the affected live scope according to canonical domain authority.

It does **not**:

- prove successful external completion;
- cancel counterpart expectations;
- rewrite source history;
- imply that a disconnected provider or stopped loop remains monitored.

Re-enabling tracking later is a new monitoring decision, not proof the world state changed while tracking was off.

## 2.6 Confirm/correct outcome with off-channel evidence

The user may provide evidence from a phone call, meeting, external transfer, cancellation, or other off-channel event.

- treat it according to field-specific authority;
- preserve that it is user-provided evidence rather than provider observation;
- canonical reduction decides the semantic effect;
- source history remains intact.

## 2.7 External-action approval

Approval grants only the displayed/bounded action authority.

Monitoring delegation never implies consequential action permission. Permission never implies provider success.

Before a consequential commit, expose decision-critical effects where relevant:

- effective sender/account;
- recipients/scope;
- content/commitment;
- attachments;
- target object/system;
- meaningful irreversibility/risk when not obvious.

Routine explicit email Send belongs in contextual composer/Moment UX. It is **not** a durable Review backlog item merely because a user click is required.

## 2.8 Review is not “high risk = ask user”

High-risk source content by itself is not a Review condition.

A consequential/security/financial/contractual/identity-sensitive request may still have a deterministic safe Product response such as `依頼を検証`.

Use Review only when a material identity/authority/interpretation/safe-action question:

1. cannot be resolved safely from accepted evidence/rules;
2. genuinely benefits from or requires user judgment;
3. cannot be handled more safely/cheaply by conservative fallback.

If a real actionable USER obligation exists and policy deterministically requires verification, present Needs You/Moment with the safe verification action. External execution remains separately authorized.

## 2.9 Repeated material error

Repeated correction in one material class is evidence that current automatic handling is insufficient.

Preferred response:

1. identify/narrow the affected class;
2. preserve conservative monitoring/source behavior;
3. increase confirmation only where material;
4. disclose meaningful narrowing;
5. re-expand only with evidence and, for permission expansion, explicit authorization.

Do not globally disable unrelated safe behavior by default and never silently increase action authority from successful history.

## 2.10 True reversibility

Use lightweight Undo/reversal for genuinely reversible internal Product effects such as local draft edits, local view state, or return-condition edits when the accepted contract can safely be restored.

Do not call email send, payment, contract acceptance, permission change, calendar mutation, account deletion, or another external effect “low risk” merely because UI can display `Undo`.

External-effect flow remains:

```text
preview / explicit bounded commit
-> provider/tool request
-> reconciliation
-> accepted-state re-evaluation
```

---

# 3. Failure / Degraded-State Contract

## 3.1 Scope the broken promise

Do not introduce a single global `DEGRADED` Responsibility state.

For every material failure answer:

```text
What capability/promise is affected?
What is the last trustworthy observation?
Which account / delegated loops / actions are affected?
What remains safe and usable?
What must reconcile before strong reassurance returns?
```

Degrade the smallest affected scope that evidence justifies.

## 3.2 Provider authorization / source visibility loss

If OAuth/admin consent/provider access loss prevents fresh evidence:

- affected monitoring is no longer trustworthy;
- stop healthy Managed reassurance for that scope;
- show account identity, affected scope/count where known, and last trustworthy observation;
- offer reconnect/recovery where available;
- cached history may remain readable with `as of`/coverage boundary;
- unrelated healthy capabilities remain healthy.

## 3.3 Ingestion lag / completeness uncertainty

- distinguish `data through X` from current truth;
- if the gap can break a delegated monitoring promise, show affected Integrity degradation;
- partial sync is not proof of empty/zero attention;
- reconcile the missing interval before restoring healthy Managed reassurance.

No numeric stale threshold is fixed by Product documentation.

## 3.4 Temporal/scheduler degradation

- do not claim a promised reconsideration happened when it did not;
- on recovery, reconcile overdue/stale triggers against current evidence/version before effects;
- communicate missed/uncertain interval and scope when material;
- trigger recovery still does not automatically imply notification or `MY_TURN`.

## 3.5 AI interpretation degradation

- preserve accepted state rather than randomly rewriting it because a model is unavailable/changed;
- Source, deterministic/basic source search, and manual contextual communication remain usable where runtime permits;
- inability to interpret fresh source may degrade the affected delegated monitoring promise even when Source remains readable;
- processing failure is never semantic `DO_NOT_TRACK / No Responsibility`.

Fallback is exact:

- **Review** only if a material semantic question exists and user judgment is useful/required;
- **Integrity Alert** if monitoring/coverage promise is materially compromised;
- **Source/manual path** if source is readable and no actionable user Responsibility has been established;
- **Needs You** only if canonical evidence establishes current actionable USER work.

A system-generated `please read this because AI failed` must not masquerade as a communication Responsibility.

A successful conservative interpretation may still correctly result in `DO_NOT_TRACK / No Responsibility`; that must remain distinguishable from model abstention/processing failure.

## 3.6 External-action failure / ambiguous result

Definite failure:

- preserve draft/action context;
- show retry/edit/cancel where safe;
- do not mutate Responsibility as though action succeeded.

Ambiguous result:

- do not blind-retry a potentially duplicated external effect;
- preserve explicit pending/reconciliation posture;
- use provider observation before accepted-state transition.

## 3.7 Delivery-channel degradation

Monitoring health and attention-delivery health are separate.

- broken push does not automatically mean provider/source monitoring failed;
- if a channel failure can prevent a promised material handoff, disclose the affected delivery capability;
- alternate channels require separate support/authorization;
- exact fallback-channel policy remains empirical/Product work.

## 3.8 Client/network offline

Local offline state does not automatically mean server-side monitoring failure.

- show cached accepted state with `as of` where material;
- preserve draft/local input when safe;
- **v1 must not silently queue a consequential external effect for later execution** merely because the user pressed an action while offline;
- delayed consequential execution requires a separately accepted durable delayed-action contract; current v1 does not assume one;
- explicit Send is committed/reconciled when connectivity/provider capability is actually available;
- never imply a send happened without provider confirmation;
- surface any server-side Integrity issue once connectivity returns.

This preserves the current posture that generic Send Later is provider-owned/deferred.

## 3.9 Local feature failure

Attachment preview, semantic search, person context, or draft assistance can fail independently.

- degrade locally;
- preserve Source/open/download/manual path where safe;
- AI draft failure must not block manual contextual reply;
- escalate to monitoring Integrity only when that capability is actually required to uphold the delegated promise.

## 3.10 Recovery

Strong reassurance may resume only after the affected source/trigger/action interval has been reconciled enough to make it trustworthy.

Communicate when supportable:

1. what failed;
2. affected account/scope/interval;
3. last trustworthy observation;
4. what remained safe/usable;
5. what was reconciled/rechecked;
6. whether scope was narrowed;
7. what the user must do, if anything.

Apology may accompany recovery but is never the recovery itself.

## 3.11 User-discovered material miss

When the user finds a material false negative:

- restore the item to a safe truthful state;
- inspect/reconcile related affected scope, not only the visible item;
- disclose impact window/scope/cause when supportable;
- narrow the implicated handling class before broader automation;
- keep unrelated safe behavior intact unless evidence indicates systemic failure.

---

# 4. Account Lifecycle

## 4.1 Distinct operations

The Product must distinguish:

```text
sign out of this Lunowa client/device
!= provider authorization lost/revoked
!= intentionally disconnect mailbox from Lunowa
!= delete Lunowa Product account
```

Do not hide materially different monitoring/data consequences behind one ambiguous `Sign out`/`Remove`/`Delete` label.

## 4.2 Connect one mailbox

Current v1 direction remains one-provider complete-loop proof.

Connection flow should disclose in ordinary language:

- exact account being connected;
- what source Lunowa can read/monitor under granted provider permission;
- what consequential actions still require approval;
- provider/source mail remains provider-owned;
- connection alone does not auto-delegate every historical thread.

## 4.3 Initial sync / bootstrap

Until source completeness is sufficient:

- do not claim a trustworthy all-clear;
- show useful sync/coverage state rather than an agent activity feed;
- Source becomes usable as data becomes available;
- do not flood Needs You with years-old unresolved-looking history;
- historical source may become searchable without becoming live Responsibility state;
- first delegation remains a bounded current loop under onboarding policy.

## 4.4 Unexpected authorization loss / reconnect

If the user did not choose to stop monitoring:

1. mark affected monitoring integrity degraded;
2. preserve cached accepted/source history with a last-trustworthy boundary where safe;
3. request reconnect when needed;
4. after authorization returns, reconcile the missing interval;
5. re-evaluate affected Responsibilities;
6. restore healthy reassurance only after reconciliation.

Prior delegation intent may survive temporary capability loss; accepted state effects still wait for current evidence.

## 4.5 Intentional mailbox disconnect

Disconnect deliberately ends Lunowa's provider relationship/monitoring capability for that mailbox; it is not an error and not successful outcome completion.

Before commit, show:

- exact account identity;
- that new source monitoring stops;
- summary count/scope of live delegated monitoring affected;
- **an inspectable affected-items path when live delegated loops will stop**;
- that disconnect does not mean those external outcomes succeeded;
- known source/history/draft/permission/notification consequences from the accepted data/runtime contract;
- provider-owned mail remains at the provider.

The confirmation may stay compact; decision-critical affected loops must still be inspectable rather than hidden behind a count.

After commit:

- affected live monitoring ends/is inactive according to canonical domain authority;
- source-dependent Temporal execution cannot pretend it can still satisfy the monitoring promise;
- Responsibilities are not marked successfully satisfied merely because monitoring stopped;
- Product data follows the separate accepted privacy/data policy.

## 4.6 Re-add after intentional disconnect

Re-adding the same mailbox:

- restores provider/source capability only after appropriate reconciliation;
- does not silently reactivate every previously delegated loop;
- may offer explicit restoration of useful prior delegated loops;
- historical sync remains non-live by default;
- duplicate evidence must not duplicate Responsibilities/effects.

## 4.7 Scope-specific permission loss

Capability health follows actual permission scope.

- read/monitor access healthy + send permission unavailable → monitoring may remain healthy; contextual Send is unavailable/degraded;
- send permission available + read/sync lost → sending capability does not prove monitoring health;
- one permission failure must not globally degrade unrelated safe capabilities.

## 4.8 Sign out of one client

Device/client sign-out ends that local session unless the Product explicitly states otherwise. It does not silently disconnect provider authorization or stop server-side monitoring.

## 4.9 Delete Lunowa Product account

This is a high-consequence Product operation distinct from mailbox disconnect.

Product-content requirement now:

- all Lunowa monitoring/delegation stops;
- provider-owned mail is not represented as deleted merely because Lunowa is deleted;
- connected provider authorizations are revoked/disconnected only according to the actual implementation/privacy contract;
- destructive confirmation states concrete consequences supported by the accepted legal/data contract;
- Product copy must never invent deletion/retention/export/billing guarantees.

**Public-release prerequisite:** before the final deletion interaction ships, an accepted privacy/legal/data-retention contract must define the guarantees required for decision-complete copy/behavior, including whichever deletion SLA, backup/audit retention, export, billing, or organization-admin constraints actually apply.

Those exact values remain **UNKNOWN** at Product-content completion; this means legal/privacy readiness is not complete, not that the Product behavior boundary is undefined.

---

# 5. Settings Product Contract

## 5.1 Settings is a control plane, not daily workflow

Case-specific correction/return/stop/approval controls stay near the affected Product surface. Settings contains persistent cross-case user-owned choices that **actually exist in the current Product**.

Semantic IA direction:

1. Accounts & Data;
2. Attention & Notifications;
3. Delegation;
4. Actions & Permissions;
5. Privacy & AI/Data use where policy requires user choice/disclosure;
6. Experience for lightweight supported language/landing/accessibility/display choices.

**Capability-conditional rule:** these are semantic groups, not a requirement to ship six empty sections. Do not display dead controls or imply class-scoped autonomy/standing-action permissions that v1 does not support.

Exact labels/navigation remain usability hypotheses.

## 5.2 Accounts & Data

Expose only supported controls such as:

- connected account identity;
- integrity/reconnect status;
- intentional disconnect;
- Product-account deletion/data controls according to accepted policy.

Do not mix device sign-out with mailbox disconnect.

## 5.3 Attention & Notifications

May expose supported controls such as:

- notification permission/channel state;
- simple quiet hours;
- optional awareness/digest preference if validated;
- bounded delivery choices that preserve Urgency/Integrity semantics.

Rules:

- quiet hours suppress interruption, not monitoring/re-evaluation;
- turning off a channel does not silently stop monitoring;
- do not accept a delivery configuration while pretending an impossible material handoff promise can still be honored.

## 5.4 Delegation

Only expose scopes/classes the Product actually supports and the user explicitly enabled.

- class-scoped monitoring never bypasses admission/No Responsibility/safety/identity;
- disabling a supported class default stops **future automatic delegation** by default;
- it does not silently stop already delegated live Responsibilities;
- offer a separate explicit action if the user also wants current matching loops stopped;
- no generic rule builder is implied.

Current Feature Matrix keeps broad class-scoped automatic monitoring post-v1/conditional unless evidence promotes it.

## 5.5 Actions & Permissions

Initial v1 email Send remains human-approved by default.

If future bounded standing authorization exists, show/revoke it by action/context/scope. No global autonomy slider.

Revoking a permission changes future authority/capability; it does not rewrite historical provider effects or source truth.

## 5.6 Privacy / correction learning

Correction history does not automatically become standing preference/instruction/permission. Future preference learning or data-use behavior requires explicit Product/privacy decisions.

Do not expose AI confidence, prompt internals, or model tuning as ordinary user controls.

## 5.7 Source-first / Attention-first landing

A user may explicitly choose Source/Home landing where supported. Lunowa may offer Attention-first after credible successful delegation, but must not silently flip the default from an internal trust score.

---

# 6. Communication Edge Cases

These cases use existing Responsibility semantics; they do not create a new Product/domain taxonomy.

## 6.1 Automated/FYI mail

Newsletters, receipts, FYI, notifications, and automated messages may correctly result in `DO_NOT_TRACK / No Responsibility`.

Sender automation alone is not decisive: machine-generated communication can still create real user work when evidence establishes it.

## 6.2 Multiple Responsibilities in one Conversation

One Conversation may contain multiple independent communication-bounded outcomes.

- preserve semantic separation;
- Moment presents one primary current question/action;
- secondary Responsibilities remain compactly accessible;
- never let newest-message status overwrite all outcomes.

## 6.3 Quoted / forwarded history

Quoted or forwarded text can provide context/provenance without automatically carrying current communicative authority. Do not treat a quoted old request as a fresh current request solely because it appears inside the newest message body.

## 6.4 CC / group / ambiguous assignment

CC membership does not imply obligation bearer. Shared/group assignment preserves real ambiguity or uses existing material Review semantics where justified. Do not hide ambiguity in an opaque `BOTH` owner or invent team workflow semantics.

## 6.5 Sender / alias / account ambiguity

Effective sender/account and recipients remain explicit for external actions. Semantic similarity does not authorize identity merge. Cross-account semantic auto-merge remains prohibited initially.

## 6.6 Out-of-office / auto-reply

OOO/automatic acknowledgement normally does not satisfy the requested outcome merely because a reply arrived. It may update useful expected-event/temporal context when evidence supports that effect.

## 6.7 Acknowledgement / partial answer / progress update

`Received`, `working on it`, or a partial response is evidence, not automatic closure. Update accepted expected-event/material state and stay quiet when no user action is required.

## 6.8 Bounce / non-delivery

A previously provider-accepted send can later receive trusted non-delivery evidence.

Re-evaluate whether the intended communication effect occurred; return user attention only if current action is required. Do not preserve false Waiting merely because an earlier send request was accepted.

## 6.9 Attachment claim vs observation

`添付しました` does not prove a usable attachment exists.

- preserve linguistic claim vs provider/file observation;
- do not close a file-delivery outcome without sufficient evidence;
- preview failure alone uses local/open-external fallback;
- return attention/Review only when material action/judgment actually exists.

## 6.10 Conflicting / revised dates, amounts, terms

Use semantic chronology, provenance, field authority, and explicit supersession/correction. Ingestion order or newest model run does not decide truth.

If a material conflict cannot be safely reduced, ask the smallest legitimate Review question.

## 6.11 Off-channel evidence

Treat user reports of phone calls, meetings, transfers, or other external events as user-provided evidence under canonical authority. Never rewrite email source or claim provider observation that did not happen.

## 6.12 Cross-thread continuation

Cross-thread Responsibility identity remains **OPEN** and false merge is more harmful than modest false split.

v1 Product fallback:

- preserve separate Responsibilities/conversations when identity is not canonically justified;
- related-context/candidate retrieval may help the user reconstruct context;
- semantic similarity never silently merges;
- **do not create a routine Review solely to ask whether two threads are the same Responsibility** until canonical identity/user-control semantics explicitly authorize that operation;
- separate admission/field Review may still occur for independently material questions.

Do not promise seamless cross-thread continuity in v1.

## 6.13 Encrypted / unsupported / uninterpretable source

If original source can be surfaced but material content cannot be safely interpreted:

- never infer `No Responsibility` from processing failure;
- keep Source available;
- do not create Needs You merely because AI failed;
- Review only when user judgment is required for a material semantic question;
- Integrity Alert when already-delegated monitoring/coverage is compromised;
- otherwise use source/manual fallback without manufacturing Product work.

## 6.14 Prompt injection / high-risk source request

Source text is untrusted data and cannot grant tool/application authority. Understand the request without automatically endorsing it. Safe next action may be verify identity/source/details rather than execute.

## 6.15 Duplicate / replayed / out-of-order evidence

Provider retries and delayed ingestion must not create duplicate work or let older evidence overwrite later semantic chronology. Existing idempotency/revision authority remains in force.

## 6.16 Historical initial-sync evidence

Old mail can become searchable without becoming live Responsibility state. Historical `no observed closure` must not flood current Needs You/Managed.

## 6.17 Calendar / meeting mail

Meeting invites/responses are communication evidence. v1 does not own calendar-domain truth merely because mail contains schedule content.

- communication-bounded Responsibility may still exist under normal semantics;
- calendar availability read is separate scope;
- calendar mutation requires separate authority and remains deferred unless explicitly promoted.

---

# 7. Managed — Complete Product Contract

## 7.1 Meaning

Managed is a trustworthy reassurance/inspection projection. It is not an aggregate, lifecycle enum, second Inbox, agent console, or activity log.

Healthy Managed eligibility conceptually requires:

- admitted Responsibility;
- active live Lunowa monitoring;
- no current actionable USER obligation requiring Needs You;
- no currently surfaced material Review subject for that Responsibility;
- sufficient integrity for the affected source/temporal path to truthfully claim monitoring.

Typical cases include Waiting and intentionally deferred Later when live monitoring remains active.

## 7.2 Review and Managed are user-facing mutually exclusive at the item level

If an admitted Responsibility has a **currently surfaced material Review**, its primary user-facing projection is Review and it is excluded from healthy Managed reassurance/count until that Review resolves.

This does **not** mean all underlying monitoring must stop. Unaffected monitoring may continue in the background. After Review resolution, re-evaluate the correct projection.

This rule prevents the Product from simultaneously saying `Lunowaが見ています / no action` about an item while asking the user a material question about that same item.

## 7.3 Managed excludes

Do not present as healthy Managed reassurance:

- `DO_NOT_TRACK / No Responsibility`;
- pre-admission Review;
- admitted Responsibility with current surfaced material Review;
- current actionable USER work;
- resolved/inactive history merely because source is searchable;
- user-stopped tracking;
- work whose required monitoring integrity is materially degraded.

A semantically unresolved Responsibility may therefore exist while being excluded from healthy Managed and shown under Integrity recovery.

## 7.4 Aggregate reassurance

Managed should answer:

```text
How much work is Lunowa currently carrying?
Is it trustworthy to say that?
Do I need to do anything?
```

Candidate presentation:

```text
Lunowaが見ています 14
現在、追加対応が必要なものはありません
最終同期: 2分前
```

Do not include degraded or current-Review items inside a healthy count merely to make the number comprehensive.

## 7.5 Inspection

On intentional inspection show useful stewardship context:

- tracked outcome;
- expected actor/event;
- return/reconsideration condition;
- latest material evidence / `as of` where useful;
- integrity;
- Source/provenance;
- local controls such as modify return condition, correct material interpretation, stop tracking, or inspect/focus now where semantically valid.

Do not expose routine model/tool/scheduler traces by default.

## 7.6 Trust signal

Repeated user reopening of unchanged Managed items is not engagement success. It is candidate evidence that users may still be parallel-checking rather than relinquishing monitoring.

---

# 8. Review — Complete Product Contract

## 8.1 Meaning / subject types

Review is a user-facing **question surface**, not one canonical state.

It may contain:

1. pre-admission `NEEDS_REVIEW`, where Responsibility existence/relevance is unresolved;
2. an admitted Responsibility with a material field/safety ambiguity.

The UX may unify them; internal subject type remains explicit.

## 8.2 Membership test

A Review subject exists only when all relevant conditions hold:

1. ambiguity/risk is material to safe admission, actionability, outcome, timing, identity, or consequential action;
2. current evidence/rules cannot resolve it safely enough;
3. user authority/judgment is useful or required;
4. asking at the chosen review point is better than conservative fallback.

Low model confidence alone fails this test. High-risk category alone fails this test.

## 8.3 Not routine approval

Ordinary explicit Send approval stays in contextual communication UX. It does not create a durable Review item solely because a human must press Send.

Use Review only when the meaning/safety/identity/authority question itself remains materially unresolved.

## 8.4 Interaction

Show:

- one exact material question;
- minimum conflicting/decision-critical evidence;
- bounded choices where possible;
- source access;
- understandable effect language rather than internal ontology.

Review can resolve when:

- new trusted evidence resolves it automatically;
- user makes the bounded authoritative decision;
- valid `DO_NOT_TRACK` resolves pre-admission uncertainty;
- the candidate is superseded/irrelevant under canonical semantics.

User leaving the screen does not resolve Review.

## 8.5 Urgency is separate

Review existence and delivery urgency are separate.

- urgent Review may interrupt if delay has material cost;
- nonurgent Review may wait until normal review point;
- nonurgent Review still exists and therefore prevents a strict true-zero/all-clear claim;
- quiet hours affect interruption, not whether Review exists.

## 8.6 Load is a Product-quality metric

Excessive Review is Product failure, not proof of safety. Track unnecessary Review burden and repeated ambiguity classes; narrow handling/scope instead of normalizing a permanent approval queue.

## 8.7 Empty Review

When no Review subjects exist, hide the destination/badge by default. No congratulatory Review-zero ritual is needed.

---

# 9. Empty / Zero / Unknown / Unavailable States

## 9.1 True zero attention

Strict all-clear requires:

- **no current/surfaced unresolved Review subjects**;
- **no current Needs You work**.

Behavior:

- say truthfully that the user has nothing to do now;
- if healthy Managed work exists, show quiet reassurance;
- keep Source accessible;
- do not replace with unread count or Inbox Zero gamification.

Candidate copy:

> **今、あなたが対応する必要はありません。**

A nonurgent Review prevents this strict all-clear even when it does not justify push interruption.

## 9.2 Zero Managed

If source is healthy but no live loops are delegated:

- do not claim `everything handled`;
- say Lunowa is currently monitoring nothing;
- optionally offer bounded delegation of a real current loop;
- keep Source useful without forcing activation.

## 9.3 Zero Review

Hide Review nav/badge/surface by default.

## 9.4 Zero Search Results

- say no authorized matching source/current state was found;
- preserve query/filter/account scope sufficiently to correct it;
- allow exact Source search/broader query;
- never fabricate from semantic plausibility.

## 9.5 Zero People/History

If no relevant authorized context exists, show none. Do not synthesize a personality/profile to fill space.

## 9.6 Initial-sync unknown != zero

Before sufficient source reconciliation:

- show syncing/coverage/data-through boundary;
- do not say no work exists;
- do not infer clean Managed/Needs You zero.

## 9.7 Degraded unknown != zero

Provider/scheduler/AI-dependent monitoring degradation must expose affected integrity. Cached zero counts are not trustworthy current truth except with explicit `as of`/scope limits.

## 9.8 User intentionally stopped all monitoring != healthy all-clear

If the user disconnected or stopped all delegation, say Lunowa is currently monitoring nothing. Do not visually equate this with `nothing needs you because Lunowa has it`.

## 9.9 No AI candidate != No Responsibility by itself

A successful canonical interpretation can legitimately produce `DO_NOT_TRACK / No Responsibility`. Model abstention/processing failure is different and routes according to §3.5.

---

# 10. Final Feature Matrix

Status meanings:

- **V1 CORE** — required for a credible Minimum Complete Delegation Loop or safe public operation of it;
- **V1 STRONG CANDIDATE** — likely high-value breadth, not required until evidence/experiment needs it;
- **POST-V1** — plausible next breadth after core proof;
- **DEFERRED** — intentionally not current priority;
- **OUT** — outside current Product identity, not merely postponed engineering.

| Product capability | Posture | Boundary / reason |
|---|---|---|
| one-provider authorized Source read | V1 CORE | trust/provenance path |
| ingestion/reconciliation sufficient for complete loop | V1 CORE | monitoring needs current evidence |
| Responsibility admission/update under canonical semantics | V1 CORE | semantic core |
| `No Responsibility` / safe abstention | V1 CORE | prevents false work |
| Needs You | V1 CORE | current USER work |
| Moment | V1 CORE | context handoff |
| Managed | V1 CORE | monitoring reassurance/inspection |
| Review | V1 CORE | sparse material ambiguity valve |
| Source Conversations | V1 CORE | original communication fallback |
| temporal monitoring / durable reconsideration | V1 CORE | safe-forgetting promise |
| explicit Later / return-condition control | V1 CORE | bounded attention delegation |
| field-scoped correction | V1 CORE | human control/trust |
| Return Attention / inspect now | V1 CORE | intervenability without fake actionability |
| Stop Tracking truthful non-success | V1 CORE | user control |
| integrity/degraded-state UX | V1 CORE | reliance requires honest degradation |
| auth reconnect + interval reconciliation | V1 CORE | safe real-provider operation |
| intentional mailbox disconnect + affected-items inspection | V1 CORE | lifecycle control |
| Product-account deletion **boundary** | V1 CORE for public release | exact legal/data guarantees separately release-gated |
| minimal capability-conditional Settings | V1 CORE for public release | accounts/attention/current delegation/permissions/data as supported |
| contextual Reply / Reply All | V1 CORE target | completes active Moment |
| bounded contextual AI draft | V1 CORE target | lowers action cost; editable; manual fallback required |
| explicit user Send | V1 CORE target | current authority posture |
| send reconciliation / ambiguity handling | V1 CORE | send click != provider outcome |
| exact Source search | V1 CORE | deterministic retrieval/trust |
| operational retrieval sufficient for validated cases | V1 CORE target | state restoration, not generic chat |
| basic attachment open/preview fallback | V1 STRONG CANDIDATE | common evidence path |
| basic reply attachment add | V1 STRONG CANDIDATE | required by some active loops |
| natural-language operational/source search | V1 STRONG CANDIDATE | frontier feature; value/cost must be validated |
| basic person context | V1 STRONG CANDIDATE | reconstruction aid, not CRM |
| optional awareness/start-of-day digest | V1 STRONG CANDIDATE | never sole actionable-work channel |
| simple quiet hours | V1 STRONG CANDIDATE | interruption control only |
| explicit Attention-first landing choice | V1 STRONG CANDIDATE | earned/opt-in trust progression |
| provider-notification migration help | POST-V1 | requires earned reliance and opt-in |
| narrow class-scoped automatic monitoring | POST-V1 / late v1 only if validated | never bypass admission/safety |
| bounded standing external-action authorization | POST-V1 | action/context/scope-specific + revocable |
| calendar availability read | POST-V1 | communication context only if useful |
| second provider | DEFERRED | complete-loop proof first |
| broad multi-account/unified inbox | DEFERRED | convenience, not moat; no cross-account merge initially |
| arbitrary new Compose parity | DEFERRED / optional | provider fallback acceptable |
| Forward parity | DEFERRED / optional | not core loop gate |
| full Drafts/Sent/folder/label parity | DEFERRED | provider remains substrate |
| Send Later parity | DEFERRED | provider-owned unless separately accepted |
| bulk mailbox actions | DEFERRED | not core attention model |
| Archive/Delete/Read/Unread/Spam/Block/Unsubscribe parity | DEFERRED / provider-first | mailbox hygiene != Responsibility |
| full attachment-content understanding | DEFERRED | cost/risk/evidence unknown |
| calendar create/modify | DEFERRED | separate authority boundary |
| standing communication preference memory | DEFERRED / UNKNOWN | correction history cannot imply it |
| activity/location interruptibility | DEFERRED | privacy/complexity unjustified |
| full client/mobile parity before wedge proof | DEFERRED | form remains empirical |
| CRM pipeline ownership | OUT | not core identity |
| project-plan ownership | OUT | not core identity |
| support-ticket lifecycle ownership | OUT | integration/reference only if useful |
| accounting/payment truth | OUT | external high-impact domain truth |
| generic personal task manager | OUT | Responsibility is communication-bounded |
| generic automation/rule builder | OUT | not BPM/workflow Product |
| relationship/personality scoring | OUT | not communication restoration |
| generic AI chat as primary workflow | OUT | system-led routine use |
| autonomous email Send by default | OUT for initial/v1 authority | future requires explicit bounded authorization decision |

No matrix row is implementation authorization by itself.

---

# 11. Additional Product invariants

These detailed invariants apply when this file is canonical, without replacing the higher-level `PRODUCT.md` invariant set:

1. Control does not require constant confirmation.
2. User correction is field-scoped and preserves semantic kind/source provenance.
3. Return Attention Now never fabricates world-state change or USER actionability.
4. Stop Tracking never proves successful external completion.
5. Monitoring delegation never silently grants consequential action authority.
6. High-risk source content alone does not create Review.
7. Review is a sparse safety valve, not an uncertainty/approval inbox.
8. Integrity failure is degraded-system UX, not semantic Review by default.
9. Processing failure alone never creates Needs You or `No Responsibility`.
10. Healthy Managed excludes a Responsibility with a currently surfaced material Review.
11. Healthy Managed excludes work whose required monitoring integrity is materially degraded.
12. Recovery reconciles affected interval/scope before strong reassurance returns.
13. Temporary provider access loss and intentional disconnect preserve different user intent.
14. Disconnect with live delegated work has an inspectable affected-items path.
15. Re-adding an intentionally disconnected mailbox never silently reactivates old delegation.
16. Settings expose only supported persistent user-owned controls; no dead autonomy surface.
17. Disabling future class-scoped delegation does not silently stop existing live loops.
18. True zero excludes both Needs You and unresolved surfaced Review.
19. Unknown, unsynced, degraded, or intentionally unmonitored states are not healthy zero.
20. Routine explicit external-action approval is contextual action UX, not durable Review.
21. True reversibility is distinct from decorative Undo.
22. v1 does not silently queue offline consequential external effects without a separately accepted delayed-action contract.
23. Cross-thread identity remains conservative-split/related-context until canonical semantics decide otherwise.
24. Product Content COMPLETE is specification closure, not empirical/legal/technical validation or implementation permission.

---

# 12. Explicit UNKNOWNs after Product-content closure

These are evidence targets, not documentation defects:

- exact ICP / first segment;
- prevalence/severity of open-loop monitoring burden;
- incumbent adequacy;
- attainable material false-negative / unnecessary Review trade-off;
- reliability level at which users stop parallel checking;
- exact delivery/digest/quiet-hour defaults and alternate-channel behavior;
- exact class-scoped delegation criteria;
- final user-facing naming of Product-level attention contract language;
- validated Home/Needs You/Managed/Review/Source IA;
- mature companion/hybrid/replacement-client form;
- generic native Compose necessity;
- operational retrieval/attachment understanding depth;
- second-provider/multi-account incremental value;
- pricing/WTP/packaging;
- acquisition/distribution;
- long-term retention;
- provider-notification migration acceptance;
- exact legal/privacy retention/deletion/export/billing commitments;
- standing communication-instruction memory model;
- exact future high-risk verification/authorization policy by action;
- whether Responsibility remains the simplest sufficient mechanism after real field evidence.

---

# 13. Product Content COMPLETE boundary

`Product Content COMPLETE` may be declared only after:

1. Issue #45 current contract and the entire final cumulative candidate receive a full acceptance PASS;
2. material blockers are corrected in batch rather than latest-patch micro-review;
3. this detailed contract and Product-level Golden Scenario Bank are durably routed from canonical Product authority;
4. any canonical design/router text that could imply obsolete behavior is reconciled;
5. empirical UNKNOWNs stay explicit;
6. Product-content closure does not authorize Issue #28 or manufacture Issue #36 conclusions;
7. exact-head repository/CI checks pass before merge.

When those hold, `Product Content COMPLETE` means:

> **The intended Product behavior is sufficiently specified and internally coherent to move remaining uncertainty into empirical Product Discovery, technical proof, usability testing, legal/privacy decisions, and implementation gates.**

It does **not** mean PMF, validated ICP, validated reliability thresholds, validated usability, validated WTP/retention, production security/provider feasibility, legal/privacy readiness, Responsibility L2 executable proof, or permission to skip Issue #36.
