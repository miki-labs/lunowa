# Lunowa v1 Product Surface Candidate

## Status

**Durable Product-surface candidate — NOT canonical design authority and NOT implementation authorization.**

This document converts the current Product Constitution candidate and Golden Flow reasoning into a concrete v1 Product shape. It deliberately sits between Product doctrine and detailed UI specification.

Current authority remains:

- `docs/product/PRODUCT.md` for canonical Product intent;
- `docs/product/PRODUCT-CONSTITUTION-V1-CANDIDATE.md` for the current noncanonical doctrine synthesis;
- `docs/product/responsibility/` for canonical Responsibility semantics;
- `docs/design/DESIGN.md` / `INTERACTIONS.md` / `RESPONSIVE.md` for accepted detailed design behavior;
- `docs/product/IMPLEMENTATION-PLAN.md` for implementation/evidence sequencing.

This candidate does **not** create a new domain object, persistence schema, lifecycle enum, or implementation phase. It proposes the smallest complete Product surface that could express the current Attention Delegation thesis if later accepted.

Labels:

- **SURFACE CANDIDATE** — proposed v1 Product behavior/interface direction;
- **SUPPORTED INFERENCE** — strongly motivated by evidence/current products but not externally proven for Lunowa;
- **PRODUCT HYPOTHESIS** — requires Lunowa-specific validation;
- **DEFERRED** — intentionally outside the v1 surface contract;
- **OUT** — explicitly not part of the Product's core responsibility.

---

# 1. v1 thesis: Minimum Complete Delegation Loop

## 1.1 v1 is not a reduced mail client

**SURFACE CANDIDATE:** v1 should be the smallest Product that completes the full Attention Delegation loop end-to-end:

```text
unresolved communication
  -> understand candidate operational outcome
  -> admit/update trusted Responsibility state
  -> decide whether user attention is required
  -> if not required, carry monitoring quietly
  -> re-evaluate on message / time / event / contradiction
  -> return only when attention is actually required
  -> restore minimum context
  -> enable one safe meaningful action/decision
  -> verify whether the expected outcome is actually satisfied
  -> close monitoring only when justified
```

A v1 that stops at `task extraction`, `no-reply reminder`, or `AI draft` is too weak because current products already cover those capabilities substantially.

A v1 that attempts broad Gmail/Outlook feature parity before proving this loop is too broad because client breadth does not establish Attention Delegation.

## 1.2 Primary v1 Product promise

> **今あなたがやる必要がないメールは、Lunowaが見ておく。必要になったら、分かる状態で戻す。**

This is directional Product language, not finalized marketing copy.

## 1.3 Product form candidate

**PRODUCT HYPOTHESIS:** v1 should prefer a **companion / hybrid** form over immediate full-client replacement.

The v1 Product must provide enough source access, contextual reply/action, and provenance to make delegated monitoring trustworthy. It does **not** need complete folder/label/filter/spam/contact/settings parity with Gmail or Outlook.

A full client remains a later Product decision, not a prerequisite for proving the core loop.

---

# 2. Surface architecture

The smallest coherent v1 uses five conceptual surfaces:

```text
1. NEEDS YOU
   current attention/work surface

2. MOMENT
   context-restoration + action surface

3. MANAGED
   delegated-monitoring reassurance/inspection surface

4. REVIEW
   material ambiguity / authority boundary

5. SOURCE CONVERSATIONS
   original communication / provenance fallback
```

Supporting surfaces may exist for account connection, search, contextual compose/reply, settings, and degraded/error states. They are not primary Product destinations.

The central separation is:

```text
Attention work        != source browsing
Managed monitoring    != attention queue
Review                 != generic uncertainty inbox
Moment                 != thread summary
```

---

# 3. Landing / Needs You

## 3.1 Job

> **What actually needs me now?**

Needs You is not a list of important emails and not a filtered Inbox. It represents current user attention obligations derived from accepted Responsibility semantics.

A new message enters Needs You only when current evidence makes user knowledge, judgment, or action materially necessary.

## 3.2 Candidate landing structure

```text
Lunowa

あなたの対応が必要        3

今日
────────────────────
ABC社
見積書が届きました
今日 17:00まで

田中さん
日程候補への返信が必要

────────────────────

Lunowaが見ています       14
現在、追加の対応はありません

[会話を見る]
```

The landing surface should give the user three answers quickly:

1. Do I need to do anything?
2. Is anything urgent or blocked?
3. Is Lunowa still carrying the rest?

It should **not** require triaging every newly arrived message.

## 3.3 Ordering

**SURFACE CANDIDATE:** Needs You should use **attention order**, not message-arrival order.

Do not use one opaque AI priority score.

Prefer explainable tiers such as:

1. material Review/safety condition that blocks safe action;
2. overdue / high delay-cost actionable work;
3. actionable work with a near source due or explicit user target;
4. other current actionable work;
5. awareness-only items when the Attention Contract explicitly requires awareness.

Within a tier, use deterministic factors such as due time and last material state change rather than generic newest-first ordering.

The exact ranking policy remains a Product hypothesis and requires scenario/behavior validation.

## 3.4 Card content

Each Needs You card should normally show only:

- person / organization or concrete subject;
- one current action/question;
- relevant due/urgency signal when material;
- a concise `why now` reason when not obvious.

Do not show by default:

- the entire thread summary;
- every Responsibility in the Conversation;
- model confidence percentages;
- long AI explanations;
- generic `high/medium/low` importance labels when delay/actionability is more informative.

Selecting the card opens its Moment.

## 3.5 Quick actions

Quick actions should be restricted to low-ambiguity actions whose semantics are already clear, such as:

- `あとで戻す` where a safe explicit return condition can be set;
- `追跡を終了` where the user intentionally stops monitoring;
- a prepared simple reply only when sender/account/meaning are unambiguous and normal send confirmation remains intact.

The default is to enter Moment rather than proliferate row controls.

## 3.6 Empty state

Preferred semantic empty state:

> **今、あなたが対応する必要はありません。**

Optional secondary reassurance:

> `Lunowaが14件を見ています。`

Do not make `Inbox Zero` or clearing a count the Product success metaphor.

---

# 4. Moment

## 4.1 Job

> **Rehydrate the minimum context needed to act safely after the user stopped thinking about the loop.**

Moment is not a generic email summary and not a full agent transcript.

The stable conceptual questions are:

```text
WHY NOW?
なぜ今戻った？

WHAT CHANGED?
何が変わった？

WHAT REMAINS?
何がまだ未完了？

WHAT NEXT?
今何をすればいい？
```

Not every Moment needs four visible headings; the content hierarchy should answer them with minimal prose.

## 4.2 Primary interaction rule

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Examples:

- `[返信する]`
- `[見積書を見る]`
- `[変更を確認]`
- `[期限を決める]`
- `[送信者を確認]`

Multiple Responsibilities may be summarized below the primary Moment without competing equally for visual priority.

## 4.3 Progressive disclosure

Use a trust ladder:

```text
current conclusion / action
  -> material reason
  -> material evidence/provenance
  -> full source conversation / attachment
```

The user should be able to contest/correct Lunowa's interpretation without first reading an AI reasoning transcript.

## 4.4 Example

```text
ABC社との見積

見積書が届きました
今日 17:00までに確認

8/24  あなたが見積書を依頼
今日   quote.pdf を受領

残っていること
内容確認

[見積書を見る]

原文を見る
```

## 4.5 Contextual reply/draft

**SURFACE CANDIDATE:** v1 should strongly support reply/follow-up drafts **inside Moment** because this directly closes the active loop.

It does not require a complete generic compose client.

Flow:

```text
Moment
  -> Lunowa prepares bounded contextual draft
  -> user reviews/edits
  -> explicit sender/recipient visible
  -> user sends
  -> provider result reconciled
  -> Responsibility re-evaluated
```

Autonomous send is not the v1 default.

---

# 5. Managed / `Lunowaが見ています`

## 5.1 Job

> **Can I trust that delegated work is still being carried without taking it back into active attention?**

Managed is an assurance and inspection surface, not a second Inbox and not an agent operations console.

## 5.2 Default presentation

Default landing should prefer aggregate reassurance over a permanent wall of Waiting/Later items.

Example:

```text
Lunowaが見ています        14

現在、あなたの追加対応が必要なものはありません
最終同期: 2分前

[管理中を見る]
```

Avoid stronger claims such as `Everything is handled` unless the underlying evidence genuinely warrants them.

## 5.3 On-demand managed list

When the user intentionally opens Managed, each item should answer:

- what outcome is still open;
- what/who Lunowa is currently waiting for;
- next expected event or return condition;
- when the next time-based reconsideration occurs, if any;
- whether monitoring integrity is degraded;
- source access.

Example:

```text
見積書取得
ABC社の回答待ち
明日までに回答予定
返信がなければ金曜に再確認
```

## 5.4 Waiting / Later as filters, not necessarily primary navigation

**PRODUCT HYPOTHESIS:** `Waiting` and `Later` remain meaningful projections but should normally live as Managed filters/details rather than permanent top-level navigation.

Reason:

- `Waiting` usually represents work already delegated away from the user;
- repeatedly exposing a large Waiting count can recreate monitoring burden;
- `Later` is an attention-defer condition, not necessarily a daily work destination.

This is a material change candidate from current `DESIGN.md` and requires explicit promotion before canonical design is changed.

## 5.5 Managed controls

Allow lightweight ownership/control actions:

- inspect source;
- change a return condition;
- bring back to current attention when appropriate;
- stop tracking;
- correct a material interpretation.

Do not expose routine scheduler/retry/LLM-agent internals unless a failure requires user action.

## 5.6 Integrity/degraded state

If Lunowa cannot safely fulfill monitoring because of provider/sync/background failure, Managed must surface that honestly.

Examples:

- `Gmailとの同期が停止しています`;
- `この件の返信監視を確認できません`;
- `再接続が必要です`.

Trust requires showing loss of monitoring capability, not silently retaining a reassuring count.

---

# 6. Review

## 6.1 Job

> **Resolve the smallest material ambiguity or authority question that prevents safe Attention Delegation.**

Review is not a queue for all model uncertainty.

## 6.2 Admission rule

Use Review only when uncertainty is decision-critical, for example:

- conflicting material deadlines;
- ambiguous obligation bearer;
- completion claim conflicts with source/provider evidence;
- sender/account/identity uncertainty before a consequential action;
- Responsibility existence itself is materially ambiguous;
- high-risk requested action requires legitimacy/authority verification.

Harmless uncertainty should remain hidden or be resolved automatically through cheaper evidence.

## 6.3 Surface placement

**SURFACE CANDIDATE:** Review should be visible only when it has material items.

On Home, it may appear above or alongside Needs You when it blocks safe action:

```text
確認が必要              1
あなたの対応が必要      3
```

A permanent empty Review navigation item is unnecessary.

## 6.4 Review card

A Review card should show:

- the exact question the system cannot safely decide;
- the minimum conflicting evidence;
- one/few bounded choices;
- original source access.

Example:

```text
期限を確認

最新本文   金曜まで
以前の本文 月曜まで

[金曜として扱う]
[月曜として扱う]
[原文を見る]
```

Do not use raw model confidence as the user's authority signal.

## 6.5 Approval is not Review by default

Routine approval of a prepared external action is an authority boundary, but it should not automatically populate a semantic Review queue unless the underlying meaning/authority itself is uncertain.

Keep `review interpretation` and `approve execution` conceptually distinct.

---

# 7. Source Conversations

## 7.1 Job

> **Give the user immediate access to the original communication and provider truth without making source triage the primary work model.**

Source remains essential for trust, normal mail use, search, corrections, and edge cases.

## 7.2 v1 source capability

The v1 Source surface should support enough to make the delegation loop trustworthy:

- browse normalized Conversations/messages for the connected provider;
- preserve sender/recipient/account identity;
- show timestamps and attachments/attachment metadata needed by the scenario;
- search/find source conversations;
- open the original provider item where useful;
- contextual reply/forward where required by an accepted Product flow;
- expose material provenance from Moment/Review.

## 7.3 Not required for v1 proof

Unless later evidence shows otherwise, the initial delegation Product does not require complete parity for:

- every provider folder/label semantic;
- spam/filter/rule administration;
- extensive bulk-mail management;
- complete contact manager;
- signatures/templates parity;
- generic advanced compose;
- offline-first full-client behavior;
- every attachment workflow;
- every settings surface in Gmail/Outlook.

These may become necessary if a full-client Product form is later supported by evidence.

## 7.4 Source is not a mandatory gate

A user should not be forced to open the full source thread for every returned Moment.

Likewise, a user must always be able to inspect source when trust, context, or ordinary mail reading requires it.

---

# 8. Supporting surfaces

## 8.1 Onboarding / provider connection

v1 onboarding should establish:

- which mailbox is connected;
- what Lunowa can read/monitor;
- what it will not autonomously send/change;
- monitoring limitations/degraded-state behavior;
- source/provenance accessibility.

Do not begin with a generic feature tour.

## 8.2 Search

Search is source/context retrieval, not the central work model.

Initial search should prioritize reliable source retrieval over ambitious cross-domain AI memory.

## 8.3 Settings

Keep only Product-relevant controls initially:

- provider/account connection;
- notification/delivery preferences;
- explicit monitoring/return preferences where supported;
- authorization boundaries where supported;
- privacy/data controls;
- language/accessibility basics.

Do not ship a generic automation rule-builder as the default customization model.

---

# 9. Delivery / notification contract

## 9.1 Arrival is not notification

A new email/reply/event updates evidence first.

Only after re-evaluating accepted state should Lunowa decide whether user attention is needed.

## 9.2 v1 delivery simplification

Keep rich internal semantics but avoid an overbuilt interruptibility engine in initial v1.

Candidate user-facing delivery:

- **Silent** — no current user attention required;
- **Needs You** — passive queue for current action/judgment;
- **Immediate** — push/interruption only when delay cost or explicit user contract warrants it.

A predictable low-frequency summary/digest may be tested separately. Exact cadence is not frozen.

## 9.3 No importance-only push

`important` does not imply `interrupt now`.

Immediate delivery should require a stronger reason such as:

- near/overdue material deadline;
- explicit user request to be told immediately;
- a newly created obligation whose delay cost is high;
- material safety/authority problem that blocks imminent action.

---

# 10. v1 scope by capability

## 10.1 Core

The v1 Product contract should be able to express/test:

- one real connected mailbox/provider end-to-end;
- inbound actionable communication;
- outbound request/wait monitoring;
- `No Responsibility` for FYI/courtesy/noise;
- source-grounded Responsibility admission/update;
- Expected Event tracking;
- quiet intermediate Waiting updates;
- explicit Later/return condition;
- message/time/event re-evaluation;
- incomplete-result / `reply != satisfied` handling;
- multiple Responsibilities per Conversation where materially required;
- material Review;
- Moment/context restoration;
- contextual draft/reply + explicit human send confirmation;
- source/provenance access;
- tracking stop / non-success resolution distinction;
- closure and later reactivation on contradictory evidence;
- honest provider/sync/monitoring degradation.

## 10.2 Supported but not broad UI goal

- parallel obligation legs;
- awareness-only return when user explicitly asked to know;
- deadline/source temporal correction;
- basic attachment evidence needed by representative scenarios.

## 10.3 Deferred

- second provider before one-provider complete-loop proof;
- broad multi-account experience;
- full mail-client replacement;
- generic new-message compose parity;
- calendar time blocking/planning;
- CRM/project/ticket integrations;
- person/company relationship intelligence;
- travel/subscription bundles;
- generic AI chat as home;
- arbitrary MCP/tool automation;
- automatic follow-up sequences;
- advanced activity-aware interruption timing;
- broad attachment-content understanding;
- cross-account semantic merging.

## 10.4 Out of core responsibility

- generic task/project management;
- CRM/ticket/pipeline ownership;
- accounting/payment system ownership;
- contract acceptance;
- autonomous money movement;
- permission/security changes on the user's behalf;
- generic BPM/workflow builder.

---

# 11. Golden-flow acceptance set

A minimum representative Product-surface test set should include:

1. inbound quick response;
2. extended user action + Later;
3. outbound request enters quiet Waiting;
4. intermediate reply changes expected state but remains silent;
5. expected result arrives and returns Needs You;
6. reply arrives but required result is missing/incomplete;
7. no reply by threshold creates renewed user attention;
8. material deadline/term changes;
9. one Conversation contains multiple tracked outcomes;
10. FYI/courtesy produces no task spam;
11. material ambiguity routes to Review;
12. high-risk request surfaces safe verification rather than execution;
13. user stops tracking without false success;
14. contradictory post-closure evidence reactivates the loop;
15. source conversation remains inspectable throughout.

Do not call the Product loop complete if it only passes happy-path no-reply reminders.

---

# 12. Metrics implied by the surface contract

Do not optimize primarily for inbox opens, session time, message throughput, or zero counts.

Candidate Product metrics:

- `N_self_check` of source mailbox before correct resurfacing;
- source-fallback/open rate while an item is Managed;
- Managed-list inspection frequency and reason;
- correct Need-You resurfacing rate;
- material false-negative rate;
- unnecessary Needs You / Review rate;
- context-restoration time after waiting;
- correction/reopen rate;
- time from Moment open to safe meaningful action;
- provider/delegation integrity failures;
- continued delegated monitoring across real waiting periods.

Interpretation matters: frequent Managed inspection may indicate mistrust, but can also reflect legitimate browsing. Do not turn one behavioral signal into a universal score without evidence.

---

# 13. Product anti-patterns

Do not let v1 drift into:

- **Inbox-zero clone** — user still triages every arrival;
- **status taxonomy wall** — every semantic projection becomes permanent navigation;
- **second task manager** — user manually maintains every Responsibility field;
- **agent operations console** — trajectory/retry/tool activity dominates the UI;
- **Review inbox** — every uncertain inference is delegated back to the user;
- **AI-summary reader** — long generated summaries replace direct progress/context;
- **full-client parity project** — Product learning waits on peripheral mail features;
- **autonomy theatre** — more external execution is treated as better Product value.

---

# 14. Material conflicts with current accepted design

This candidate intentionally surfaces Product-level tensions that require later promotion/reconciliation rather than silent drift.

## 14.1 Sidebar / projection navigation

Current `DESIGN.md` recommends top-level `すべて / 対応が必要 / あとで / 待ち / 確認 / ピン留め`.

This candidate proposes that:

- Needs You remains primary;
- Review appears only when materially populated;
- Waiting/Later normally move beneath Managed inspection/filtering;
- Done/history need not be a primary daily destination;
- Source Conversations remains directly accessible.

This is not canonical until explicitly accepted.

## 14.2 Full-client breadth

Current `DESIGN.md` initial product lists broad compose/folder/search/account/mail-client capabilities.

This candidate proposes a narrower v1 Product proof:

- source reading/provenance/search sufficient for trust;
- contextual reply/send sufficient for active Moments;
- complete generic client parity deferred unless Product evidence requires it.

## 14.3 Default landing semantics

Current accepted design is conversation-shell oriented.

This candidate proposes a hybrid Attention-first landing where Needs You and Managed reassurance are primary while Source Conversations remain one direct navigation step away.

---

# 15. Open Product questions before canonical promotion

The surface direction is coherent but not externally proven for Lunowa. Material remaining questions include:

- Does `Needs You` as the default work surface reduce self-checking without harming orientation?
- Does aggregate Managed reassurance reduce checking, or does it create new anxiety?
- What copy (`対応が必要`, `あなたが必要`, `Lunowaが見ています`, `監視中`) communicates delegation without overclaiming reliability/liability?
- How much source context must Moment show before users trust it?
- Should Review be a separate destination or a conditional section inside Needs You?
- What exact attention ordering is understandable enough to trust?
- Is contextual compose/reply sufficient, or does the initial target require a full compose client?
- Is one-provider companion/hybrid sufficient to produce a credible daily workflow?
- What minimum reliability/integrity evidence is required before Attention-first becomes the default landing rather than an optional mode?

These are Product-validation questions, not reasons to re-expand v1 before evidence.
