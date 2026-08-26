# Lunowa v1 Product Surface Candidate

## Status

**Durable Product-surface candidate — NOT canonical design authority and NOT implementation authorization.**

This document converts the current Product Constitution candidate and Golden Flow reasoning into a concrete v1 Product shape. It sits between Product doctrine and detailed UI specification.

Current authority remains:

- `docs/product/PRODUCT.md` — canonical Product intent;
- `docs/product/PRODUCT-CONSTITUTION-V1-CANDIDATE.md` — noncanonical doctrine synthesis;
- `docs/product/responsibility/` — canonical Responsibility semantics;
- `docs/design/DESIGN.md` / `INTERACTIONS.md` / `RESPONSIVE.md` — accepted detailed design behavior;
- `docs/product/IMPLEMENTATION-PLAN.md` — implementation/evidence sequencing.

This candidate does **not** create a domain object, persistence schema, lifecycle enum, implementation phase, or authority to resume write-heavy implementation.

Labels:

- **SURFACE CANDIDATE** — proposed v1 Product behavior/interface direction;
- **SUPPORTED INFERENCE** — strongly motivated by current evidence but not proven for Lunowa;
- **PRODUCT HYPOTHESIS** — requires Lunowa-specific validation;
- **DEFERRED** — intentionally outside the v1 Product-surface contract;
- **OUT** — explicitly outside the Product's core responsibility.

---

# 1. v1 thesis — Minimum Complete Delegation Loop

## 1.1 v1 is not a reduced mail client

**SURFACE CANDIDATE:** v1 should be the smallest Product that completes Attention Delegation end-to-end:

```text
unresolved communication
  -> understand candidate operational outcome
  -> admit/update trusted Responsibility state
  -> decide whether user attention is required
  -> if not required, carry monitoring quietly
  -> re-evaluate on message / time / event / contradiction
  -> return only when user attention is actually required
  -> restore minimum context
  -> enable one safe meaningful action/decision
  -> verify whether the expected outcome is actually satisfied
  -> close monitoring only when justified
```

A Product that stops at `task extraction`, `no-reply reminder`, or `AI draft` is too weak: those capabilities are already substantial incumbent territory.

A Product that waits for broad Gmail/Outlook parity before testing this loop is too broad: client breadth does not establish Attention Delegation.

## 1.2 Directional promise

> **今あなたがやる必要がないメールは、Lunowaが見ておく。必要になったら、分かる状態で戻す。**

This is directional language, not finalized marketing copy or a reliability guarantee.

## 1.3 Product form

**PRODUCT HYPOTHESIS:** v1 should prefer a **companion / hybrid** form over immediate full-client replacement.

The Product needs enough source access, contextual reply/action, search, and provenance to make delegated monitoring trustworthy. It does not need complete folder/label/filter/spam/contact/settings parity with Gmail or Outlook before the core loop is proven.

A full email client remains an open later Product decision.

---

# 2. Surface architecture

The smallest coherent v1 uses five conceptual surfaces:

```text
1. NEEDS YOU
   current actionable user work

2. MOMENT
   temporal context restoration + one safe action

3. MANAGED
   delegated-monitoring reassurance + on-demand inspection

4. REVIEW
   material semantic / authority ambiguity

5. SOURCE CONVERSATIONS
   original communication + provenance fallback
```

A lightweight **Home/Landing composition** may contain summaries/entry points into Needs You, conditional Review, Managed reassurance, and Source. Home is a composition, not a sixth semantic work state.

Supporting surfaces may exist for provider connection, search, contextual compose/reply, settings, permissions, and degraded/error states.

Core separation:

```text
Needs You            != important/new email
Review               != low-confidence AI queue
Managed              != second Inbox
Moment               != thread summary
Source Conversations != primary task model
```

---

# 3. Home / Landing

## 3.1 Job

On open, the user should learn quickly:

1. Do I need to do anything now?
2. Is there a material ambiguity/safety issue requiring judgment?
3. Is Lunowa still carrying the rest?
4. Can I reach the original communication immediately if I want it?

Candidate composition:

```text
Lunowa

確認が必要                 1   # only when non-zero
あなたの対応が必要         3

今日
────────────────────
ABC社
見積書の確認が必要
今日 17:00まで

田中さん
日程候補への返信が必要

────────────────────
Lunowaが見ています        14
現在、追加の対応が必要なものはありません

[会話を見る]
```

Do not require arrival-by-arrival Inbox triage before the user can see current work.

## 3.2 Empty state

Preferred semantic empty state:

> **今、あなたが対応する必要はありません。**

Secondary reassurance may say that Lunowa is monitoring a number of items, but copy must not overclaim world-state certainty.

Do not use Inbox Zero as the central success metaphor.

---

# 4. Needs You

## 4.1 Job

> **What action or decision genuinely belongs to me now?**

Needs You contains admitted Responsibilities with a currently actionable material USER obligation/decision under accepted semantics.

It does **not** contain:

- generic important messages;
- Waiting items;
- Later items whose attention is intentionally deferred;
- pre-admission Review subjects;
- admitted Responsibilities currently blocked by material Review;
- awareness-only updates where no action/judgment is required.

## 4.2 Ordering

Use **attention order**, not newest-message order and not one opaque model score.

Candidate explainable tiers within Needs You:

1. overdue / materially high delay-cost actionable work;
2. actionable work with a near source due or explicit user target;
3. blocking actionable work;
4. other current actionable work.

Within a tier, prefer deterministic factors such as due time and last material state change.

Review is ordered separately at Home because it is a different subject family, not merely a high-priority Needs You item.

The exact ordering policy remains a Product hypothesis.

## 4.3 Card content

Normally show only:

- person/organization or concrete subject;
- one current action/question;
- material due/urgency signal;
- concise `why now` reason when non-obvious.

Do not show by default:

- full thread summary;
- every Responsibility in the Conversation;
- raw model confidence;
- long AI explanations;
- generic high/medium/low importance when delay/actionability is more informative.

Selecting a card opens Moment.

## 4.4 Awareness-only return is not Needs You

If the user explicitly asked to be informed when an outcome occurs but no action/judgment is needed, Lunowa may deliver a passive update, digest entry, or non-actionable Moment-style notification such as:

> `入金を確認しました。何もする必要はありません。`

Do not create durable work in Needs You merely because the user wanted awareness.

Exact awareness delivery remains a Product hypothesis.

---

# 5. Moment

## 5.1 Job

> **Rehydrate the minimum context needed to act safely after the user stopped thinking about the loop.**

Moment is not a generic summary and not an agent trace.

Conceptual questions:

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

Not every Moment needs four explicit headings; the hierarchy should answer them with minimal text.

## 5.2 Primary interaction

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Examples:

- `[返信する]`
- `[見積書を見る]`
- `[変更を確認]`
- `[期限を決める]`
- `[送信者を確認]`

Additional Responsibilities may be shown below without competing equally for visual attention.

## 5.3 Progressive disclosure

Trust ladder:

```text
current conclusion / next action
  -> short material reason
  -> source-grounded evidence/provenance
  -> full Conversation / attachment
```

The user should be able to contest/correct an interpretation without reading a hidden chain-of-thought or agent transcript.

Do not use model confidence percentage as a default substitute for evidence.

## 5.4 Example

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

## 5.5 Contextual draft/reply

**SURFACE CANDIDATE:** contextual reply/follow-up is stronger v1 scope than full generic compose parity because it directly closes the active loop.

```text
Moment
  -> bounded contextual draft
  -> user reviews/edits
  -> sender/recipient/account visible
  -> explicit user send
  -> provider result reconciled
  -> Responsibility re-evaluated
```

Autonomous external send is not the v1 default.

---

# 6. Managed / `Lunowaが見ています`

## 6.1 Job

> **Can I verify that delegated monitoring is still being carried without taking the work back into active attention?**

Managed is assurance + inspection, not a second Inbox and not an agent operations console.

## 6.2 Default presentation

Prefer aggregate reassurance over a permanent wall of Waiting/Later items.

Example:

```text
Lunowaが見ています        14

現在、あなたの追加対応が必要なものはありません
最終同期: 2分前

[管理中を見る]
```

Avoid absolute copy such as `Everything is handled` when the system only has evidence-relative knowledge.

## 6.3 On-demand list

When intentionally opened, each item should answer:

- what tracked operational outcome remains open;
- who/what is currently expected to move;
- next Expected Event;
- time/event return condition when relevant;
- monitoring integrity/degraded state;
- source access.

Example:

```text
見積書取得
ABC社の回答待ち
明日までに回答予定
返信がなければ金曜に再確認
```

## 6.4 Waiting/Later placement

**PRODUCT HYPOTHESIS:** Waiting and Later remain meaningful projections but normally become filters/details under Managed rather than permanent top-level navigation.

Reasoning:

- Waiting usually represents work already delegated away from current user attention;
- a permanent large Waiting count can recreate monitoring burden;
- Later is an attention-defer condition rather than necessarily a daily work destination.

This materially differs from current canonical `DESIGN.md` and requires explicit promotion before design authority changes.

## 6.5 Controls

Allow lightweight control:

- inspect source;
- modify return condition;
- bring a tracked item back to current attention when semantically valid;
- stop tracking;
- correct a material interpretation.

Do not expose routine scheduler/retry/model/tool activity unless a failure requires user action.

## 6.6 Integrity failure

If Lunowa cannot fulfill monitoring because of provider/sync/background failure, Managed must show this honestly.

Examples:

- `Gmailとの同期が停止しています`;
- `この件の返信監視を確認できません`;
- `再接続が必要です`.

Trust requires visible loss of monitoring capability rather than stale reassurance.

---

# 7. Review

## 7.1 Job

> **Resolve the smallest material ambiguity or authority question preventing safe delegation.**

Review may represent either:

- a pre-admission `NEEDS_REVIEW` subject where Responsibility existence/materiality is unresolved; or
- an admitted Responsibility with a decision-critical field/safety conflict.

These subject types remain distinct internally even if one Product surface presents them.

## 7.2 Admission rule

Use Review only when uncertainty is material, for example:

- conflicting deadlines;
- ambiguous obligation bearer;
- completion claim conflicts with provider/source evidence;
- sender/account/identity uncertainty before a consequential action;
- Responsibility existence itself is materially ambiguous;
- high-risk request requires legitimacy/authority verification.

Harmless uncertainty should not be returned to the user merely to make the internal model neat.

## 7.3 Placement

Review should be visible only when materially populated.

On Home it may appear above Needs You because it can block safe projection/action:

```text
確認が必要              1
あなたの対応が必要      3
```

A permanently empty top-level Review destination is unnecessary.

## 7.4 Review card

Show:

- exact question that cannot be decided safely;
- minimum conflicting/material evidence;
- one/few bounded choices;
- source access.

Example:

```text
期限を確認

最新本文   金曜まで
以前の本文 月曜まで

[金曜として扱う]
[月曜として扱う]
[原文を見る]
```

## 7.5 Approval != Review

Routine approval of a prepared external action is an execution-authority boundary. It should not automatically become a semantic Review item unless meaning/authority itself is uncertain.

Keep `review interpretation` and `approve execution` distinct.

---

# 8. Source Conversations

## 8.1 Job

> **Give immediate access to original communication/provider truth without making source triage the primary work model.**

Source remains required for normal mail reading, trust, correction, search, and edge cases.

## 8.2 v1 source capability

Support enough for trustworthy delegation:

- browse normalized Conversations/messages for the connected provider;
- preserve sender/recipient/account identity;
- show timestamps and scenario-relevant attachments/metadata;
- search/find source Conversations;
- open the provider-native item when useful;
- contextual reply/forward where an accepted Product flow requires it;
- expose material provenance from Moment/Review.

## 8.3 Not required for initial proof

Unless Product evidence requires otherwise, initial delegation proof does not require complete parity for:

- every folder/label semantic;
- spam/filter/rule administration;
- extensive bulk management;
- complete contact manager;
- signature/template parity;
- generic advanced compose;
- full offline behavior;
- every attachment workflow;
- every Gmail/Outlook settings surface.

## 8.4 Source is optional in the happy path, always available in the trust path

Do not force source-thread reading for every returned Moment.

Do not hide source when the user wants to verify, correct, or simply read ordinary communication.

---

# 9. Supporting surfaces

## 9.1 Provider connection / onboarding

Establish clearly:

- connected mailbox/account;
- what Lunowa reads/monitors;
- what it does not autonomously send/change;
- what happens if sync/monitoring degrades;
- how original source remains accessible.

Do not begin with a generic feature tour.

## 9.2 Search

Search is source/context retrieval, not the primary work model.

Prefer reliable source retrieval before ambitious cross-domain AI memory.

## 9.3 Settings

Initial Product-relevant settings only:

- provider/account connection;
- delivery/notification preferences;
- supported monitoring/return preferences;
- authorization boundaries where applicable;
- privacy/data controls;
- language/accessibility basics.

No generic rule-builder is required as the default customization model.

---

# 10. Delivery contract

## 10.1 Arrival != notification

A new email/reply/event first changes evidence. Current state is then re-evaluated.

Notification strength follows the resulting attention need and delay cost, not message arrival alone.

## 10.2 Simplified v1 delivery

Keep richer internal semantics but avoid a premature general interruptibility engine.

Candidate external behavior:

- **Silent** — no current user attention required;
- **Needs You** — passive work queue for current action/judgment;
- **Awareness update** — non-work informational return when explicitly promised;
- **Immediate** — push/interruption only when delay cost or explicit user contract warrants it.

A predictable digest may be tested separately. Exact cadence is not frozen.

## 10.3 Immediate delivery

Importance alone does not justify push.

Stronger reasons include:

- near/overdue material deadline;
- explicit immediate-awareness request;
- new obligation with high delay cost;
- material safety/authority issue blocking imminent consequential action.

---

# 11. v1 capability boundary

## 11.1 Core Product contract

The candidate v1 must be able to express/test:

- one real connected mailbox/provider end-to-end when real integration is Product-authorized;
- inbound actionable communication;
- outbound request/wait monitoring;
- `No Responsibility` for FYI/courtesy/noise;
- source-grounded Responsibility admission/update;
- Expected Event tracking;
- quiet intermediate Waiting updates;
- explicit Later/return condition;
- message/time/event re-evaluation;
- incomplete result / `reply != satisfied` handling;
- multiple Responsibilities per Conversation where materially required;
- material Review;
- Moment/context restoration;
- contextual draft/reply + explicit human send confirmation;
- source/provenance access;
- tracking stop / non-success resolution distinction;
- honest provider/sync/monitoring degradation.

### Reopen identity invariant

Later contradictory evidence reopens the **same Responsibility only when it establishes that the same operational outcome was never actually satisfied**.

New work after a genuinely closed episode normally creates a new Responsibility.

This preserves current FIXED Responsibility semantics.

## 11.2 Supported semantic pressure, not broad UI goal

- parallel obligation legs;
- awareness-only return;
- deadline/source temporal correction;
- basic attachment evidence required by representative scenarios.

## 11.3 Deferred

- second provider before one-provider complete-loop proof;
- broad multi-account experience;
- full mail-client replacement;
- generic new-message compose parity;
- calendar time blocking/planning;
- CRM/project/ticket integrations;
- person/company relationship intelligence;
- travel/subscription bundles;
- generic AI chat as Home;
- arbitrary MCP/tool automation;
- autonomous follow-up sequences;
- advanced activity-aware interruption timing;
- broad attachment-content understanding;
- cross-account semantic merging.

## 11.4 Out of core responsibility

- generic task/project management;
- CRM/ticket/pipeline ownership;
- accounting/payment system ownership;
- contract acceptance;
- autonomous money movement;
- permission/security changes on the user's behalf;
- generic BPM/workflow builder.

---

# 12. Golden-flow acceptance set

A representative Product-surface test set should include:

1. inbound quick response;
2. extended user action + Later;
3. outbound request enters quiet Waiting;
4. intermediate reply changes expected state but remains silent;
5. expected result arrives and returns Needs You;
6. reply arrives but required result is incomplete;
7. no reply by threshold creates renewed user attention;
8. material deadline/term changes;
9. one Conversation contains multiple tracked outcomes;
10. FYI/courtesy produces no task spam;
11. material ambiguity routes to Review;
12. high-risk request surfaces safe verification rather than execution;
13. user stops tracking without false success;
14. contradictory evidence reopens only when the same outcome was not actually satisfied;
15. genuinely new work after closure creates a new Responsibility;
16. source Conversation remains inspectable throughout.

Do not call the delegation loop complete if it only passes happy-path no-reply reminders.

---

# 13. Metrics implied by the surfaces

Do not optimize primarily for inbox opens, session time, message throughput, or zero counts.

Candidate Product measures:

- `N_self_check` of source mailbox before correct resurfacing;
- source-fallback/open rate while an item is Managed;
- Managed-list inspection frequency and reason;
- correct Needs You resurfacing;
- material false-negative rate;
- unnecessary Needs You / Review burden;
- context-restoration time after waiting;
- correction/reopen rate;
- time from Moment open to safe meaningful action;
- provider/delegation-integrity failure;
- continued delegated monitoring across real waiting periods.

Do not turn any single signal into a universal score before evidence.

---

# 14. Product anti-patterns

Do not let v1 drift into:

- **Inbox-zero clone** — user still triages every arrival;
- **status taxonomy wall** — every projection becomes permanent navigation;
- **second task manager** — user manually maintains semantic state;
- **agent operations console** — technical trajectories dominate UI;
- **Review inbox** — model ambiguity is routinely pushed back to user;
- **AI-summary reader** — generated prose replaces concise temporal context;
- **full-client parity project** — peripheral mail breadth blocks Product learning;
- **autonomy theatre** — external execution is treated as the main value.

---

# 15. Material tensions with current accepted design

This candidate intentionally records Product-level changes that require later explicit promotion/reconciliation.

## 15.1 Navigation

Current `DESIGN.md` recommends top-level `すべて / 対応が必要 / あとで / 待ち / 確認 / ピン留め`.

This candidate proposes:

- Needs You primary;
- Review conditional when materially populated;
- Waiting/Later normally below Managed inspection/filtering;
- Done/history not necessarily a primary daily destination;
- Source Conversations directly accessible.

## 15.2 Full-client breadth

Current `DESIGN.md` initial scope lists broad compose/folder/search/account/mail-client capabilities.

This candidate proposes a narrower first Product proof:

- source reading/search/provenance sufficient for trust;
- contextual reply/send sufficient for active Moments;
- complete generic client parity deferred unless evidence requires it.

## 15.3 Landing semantics

Current accepted design is conversation-shell oriented.

This candidate proposes an Attention-first **hybrid landing**, not removal of the stable shell: Needs You + conditional Review + Managed reassurance become primary, while Source Conversations remain one direct step away.

`Sidebar | List | Detail` may remain the desktop spatial shell even if the selected list changes from Conversations to Attention items.

---

# 16. Open Product questions before canonical promotion

Material hypotheses still requiring Product evidence:

- Does Needs You as default work surface reduce self-checking without harming orientation?
- Does Managed aggregate reassurance reduce checking or create anxiety?
- What copy communicates delegation without overclaiming reliability/liability?
- How much evidence/context must Moment show before users trust it?
- Should Review have a dedicated destination or only a conditional Home section/detail mode?
- What attention ordering is understandable enough to trust?
- Is contextual compose/reply sufficient for the first real target segment?
- Is one-provider companion/hybrid sufficient for a credible daily workflow?
- What reliability/integrity evidence is required before Attention-first becomes default rather than an optional mode?

These are validation questions, not reasons to re-expand v1 before evidence.
