# Lunowa Daily Operating Model Candidate

## Status

**Durable Product candidate — NOT canonical design authority and NOT implementation authorization.**

This document defines how Lunowa should behave across an ordinary day once monitoring delegation exists. It is downstream of:

- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md`;
- `V1-PRODUCT-SURFACE-CANDIDATE.md`;
- `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md`;
- canonical Responsibility semantics under `docs/product/responsibility/`;
- accepted Temporal Contract semantics in `docs/decisions/0003-temporal-contracts-use-durable-scheduling.md`.

It does not change schema, provider scope, implementation sequencing, current Product-discovery gates, or accepted notification policy.

Labels:

- **DOCTRINE CANDIDATE** — durable Product principle;
- **SUPPORTED INFERENCE** — strongly motivated by current external evidence;
- **PRODUCT HYPOTHESIS** — Lunowa-specific behavior requiring validation;
- **UNKNOWN** — deliberately unresolved.

---

# 1. Core operating principle

## 1.1 Event-driven internally, attention-windowed externally

**DOCTRINE CANDIDATE:** Lunowa should continuously maintain delegated communication state without continuously demanding human attention.

```text
external evidence changes
  -> ingest/reconcile
  -> update accepted/candidate state
  -> re-evaluate Responsibility / Expected Event / attention need
  -> choose delivery behavior
```

The internal system may react immediately. Human interruption is a separate decision.

> **State change immediately. Human interruption only when justified.**

A new email, reply, attachment, timer firing, or provider event is evidence. None is automatically a notification.

## 1.2 Daily app opening must not be the monitoring mechanism

**DOCTRINE CANDIDATE:** ordinary monitoring should not depend on the user opening Lunowa every day.

If monitoring infrastructure is healthy, Lunowa should continue to:

- watch delegated loops;
- reconcile new evidence;
- preserve temporal return conditions;
- create/clear current Attention Need as state changes;
- suppress obsolete delivery artifacts;
- reconstruct current state when the user returns.

However, **monitoring and delivery are separate promises**. A time-sensitive return can reach the user while the app is closed only if an accepted delivery path exists and is available (for example push permission/device delivery where the Product relies on it).

Therefore:

```text
Monitoring Integrity
= can Lunowa continue observing/reconciling the delegated contract?

Delivery Integrity
= can Lunowa reach the user within the accepted delivery contract?
```

If the user disables external notifications, Lunowa may still monitor correctly, but it must not pretend it can satisfy an `immediate while app closed` return promise. The UI must either weaken the return contract explicitly (`アプリを開いた時に表示`) or ask for the delivery capability needed for the stronger promise.

A required morning/evening review ritual would reintroduce part of the monitoring burden Lunowa exists to remove.

## 1.3 Current state outranks stale notification history

When a user returns after hours/days away, Home should be reconstructed from **current accepted state**, not from every intermediate event while absent.

Example:

```text
09:00 counterpart says “still checking”
11:00 counterpart sends requested document
14:00 user opens Lunowa
```

Do not force the user through the stale 09:00 waiting event before the current 11:00 result.

Event history remains inspectable, but the work surface answers what is true and material now.

---

# 2. Delivery model

Operational state, Product projection, delivery urgency, and channel remain separate.

```text
Operational state
!= Product projection (Needs You / Review / Managed / ...)
!= delivery urgency
!= delivery channel/capability
```

The accepted Temporal Contract ADR already fixes that trigger firing does not imply notification. This candidate extends that distinction into daily Product behavior.

## 2.1 Silent stewardship

Use when evidence/state changes but no user action/judgment, promised awareness, or integrity warning needs delivery.

Examples:

- counterpart says `legal is reviewing`;
- an expected date changes without creating current user work;
- a reply only updates Waiting state.

Behavior:

```text
update state
-> no push
-> no Needs You
-> no Review
-> optionally inspectable in Managed evidence/history
```

Correct silence is core Product value.

## 2.2 Informational catch-up — awareness without work

This is **not** the same use of `Passive` found in the older Product Constitution candidate delivery vocabulary.

Use when the user explicitly asked to know about an outcome/change but no action or judgment is currently required.

Examples:

- payment confirmation received;
- approval completed where no follow-up is needed;
- another promised informational milestone occurred.

Candidate behavior:

- show on next open in a compact `前回以降の更新` area; and/or
- include in an optional predictable digest;
- do not create durable work in Needs You merely because awareness was promised.

Awareness is a Product-delivery concept, not a Responsibility lifecycle state or permanent task queue.

## 2.3 User-attention return is separate from projection family

When the user genuinely must engage, first determine the correct Product projection under accepted semantics.

### Normal actionable work

An admitted Responsibility with a currently actionable material USER obligation normally projects **Needs You**.

### Material ambiguity / authority boundary

Decision-critical semantic, identity, or authority uncertainty remains **Review**, not Needs You.

Examples:

- conflicting material deadlines;
- ambiguous obligation bearer;
- completion claim contradicts trusted evidence;
- high-risk request legitimacy/authority is unresolved.

A Review item may be urgent to deliver, but urgency does not convert it into Needs You.

> **Delivery urgency is orthogonal to Needs You vs Review.**

## 2.4 Delivery strength for current user-attention items

Once the correct Product projection exists, external delivery depends on delay cost and available delivery capability.

### 2.4.1 Next-visit sufficient

```text
Needs You or Review current
-> no external push required
-> next intentional Lunowa visit is sufficient
```

This corresponds most closely to the older Product Constitution candidate's `Passive` delivery meaning.

### 2.4.2 Deferred / grouped external delivery

Use when the user should be informed before a likely next natural app open, but immediate interruption is not justified and an external channel is allowed.

```text
current Needs You / Review
-> group until next allowed attention window
-> one external notification may represent multiple current items
```

This corresponds to the Constitution candidate's `Deferred / opportune` direction.

The exact batching cadence is **UNKNOWN**. Do not copy `three times/day` from unrelated smartphone-notification evidence.

### 2.4.3 Immediate delivery

Use only when delaying to the next ordinary opportunity would cause material expected harm or violate an explicit immediate-return contract.

Possible qualifying evidence:

- explicit imminent source due with required user action;
- user-configured `tell me immediately when X happens` behavior;
- separately validated high-delay-cost conditions.

Do not equate important sender, emotional wording, new message, or model-assigned importance with immediate interruption automatically.

Immediate delivery while the app is closed requires an available authorized delivery path. If that path is absent/degraded, the Product must disclose the limitation rather than represent the immediate-return promise as healthy.

Any displayed temporal precision must come from accepted evidence; never invent `15:00` from a source that only says `today` or `Friday`.

## 2.5 Integrity conditions

Provider/sync/scheduler/reconciliation failure is a Product-level **Monitoring Integrity** condition. Notification permission/device-delivery failure can be a **Delivery Integrity** condition where the accepted return contract depends on that path.

Neither is automatically a Responsibility, Needs You item, or semantic Review subject.

Delivery strength depends on the risk created by the degradation.

```text
sync briefly stale
no near-term delegated contract affected
-> next allowed/visible integrity notice
```

```text
sync stopped
multiple near-term delegated return conditions affected
-> immediate integrity alert may be warranted if deliverable
```

```text
push permission disabled
contract says “next app open”
-> no integrity violation
```

```text
push permission disabled
accepted contract says “notify immediately even if app is closed”
-> delivery contract cannot be represented as healthy
```

Do not keep showing generic reassurance while the relevant monitoring/delivery promise cannot currently be honored.

## 2.6 Known candidate-vocabulary reconciliation

`PRODUCT-CONSTITUTION-V1-CANDIDATE.md` currently uses draft delivery labels `Silent / Passive / Deferred-opportune / Immediate`. `V1-PRODUCT-SURFACE-CANDIDATE.md` later clarified that awareness-only information should not enter Needs You.

This Daily Operating Model follows the newer surface distinction and uses `Informational catch-up` for awareness-only delivery rather than overloading `Passive`.

If the candidates are promoted canonically, one owning source must reconcile this vocabulary explicitly.

---

# 3. Opening Lunowa at any time

## 3.1 Home is a current-state briefing, not a chronological feed

On open, Home should answer:

1. Is there material Review?
2. What user action is current now?
3. What non-actionable information became relevant since the user last looked?
4. Are monitoring and relevant delivery capabilities healthy?
5. Can Source be reached immediately?

Candidate composition:

```text
Lunowa

確認が必要                1   # conditional
あなたの対応が必要        2

今日
────────────────────
ABC社
見積書の確認が必要
今日 17:00まで

────────────────────
前回以降の更新             2   # conditional hypothesis
入金を確認しました
何もする必要はありません

────────────────────
Lunowaが見ています        14
監視は正常です

[会話を見る]
```

`前回以降の更新` is a Product hypothesis, not a domain state.

## 3.2 Suppress obsolete events

If an awareness update is superseded by later actionable state, show current actionable state once.

If a Needs You/Review item is resolved before the user opens Lunowa, do not keep a stale card merely because a push was previously queued.

## 3.3 Empty state

> **今、あなたが対応する必要はありません。**

Secondary information can show integrity and compact awareness. Managed items do not require Inbox Zero processing.

---

# 4. Morning behavior

## 4.1 No mandatory morning ritual

**DOCTRINE CANDIDATE:** daily morning triage is not required for safe monitoring operation.

If the user opens naturally, Home is an on-demand current-state briefing:

```text
Review
-> Needs You
-> relevant awareness since last visit
-> Managed integrity reassurance
```

Do not dump all overnight mail or Waiting transitions.

## 4.2 Scheduled morning briefing is optional

Current agent products support scheduled daily briefings, but making one mandatory creates a new daily review obligation.

**PRODUCT HYPOTHESIS:** optional briefing:

```text
今日あなたが必要: 2件
確認が必要: 0件
知っておく更新: 1件
監視中: 正常
```

It summarizes current attention state, not an inbox.

Exact default, timing, and whether v1 needs this are **UNKNOWN**.

---

# 5. During the workday

## 5.1 Continuous background stewardship

```text
mail / sent / time / relevant provider evidence
-> reconcile
-> update state
-> choose projection + delivery behavior
```

The user does not watch this process.

## 5.2 Intermediate Waiting updates stay quiet

A non-actionable progress reply updates Managed state without push or badge pressure unless an explicit awareness contract says otherwise.

## 5.3 Prefer predictable delivery over opaque “perfect moment” inference for ordinary work

External evidence suggests unpredictable interruption is costly and proactive assistance can be better received at workflow boundaries than mid-task. Lunowa v1 may not reliably infer those boundaries.

Therefore:

> **For delay-tolerant returns, predictable grouping is a stronger v1 hypothesis than opaque AI-chosen interruption timing.**

Candidate options for validation:

- user-chosen delivery windows;
- coarse allowed work-hour windows;
- grouped notifications after a predictable buffer;
- next-app-open only when standard push is disabled.

Do not freeze an exact schedule from unrelated research.

## 5.4 Collapse multiple ordinary returns into one interruption

If several delay-tolerant attention items become current inside one delivery window, prefer one summary notification rather than one notification per email/event.

Opening it should render current state, not a chronological queue of source events.

## 5.5 Foreground behavior

If Lunowa is foregrounded and relevant state is already visible, avoid redundant OS push. Update calmly; disruptive toasts should be reserved for cases requiring explicit acknowledgement.

---

# 6. Awareness-only updates

## 6.1 Awareness is not a task queue

Examples:

- `入金を確認しました。何もする必要はありません。`
- `承認が完了しました。`

## 6.2 Candidate delivery

**PRODUCT HYPOTHESIS:** use lightweight paths:

1. `前回以降の更新` on next open;
2. optional scheduled digest.

Do not create a permanent top-level `Updates` inbox unless Product evidence shows repeated retrieval value.

## 6.3 Deduplicate and show current meaning

If later evidence changes the meaning before the user sees the awareness item, show the later current state rather than stale reassurance.

---

# 7. Immediate delivery and quiet hours

## 7.1 Immediate must remain rare

If immediate becomes a synonym for important, Lunowa recreates ordinary mail notifications.

Track unnecessary-immediate-interruption rate.

## 7.2 Explain why now

Prefer:

`契約確認が必要です — 今日15:00が回答期限です。`

Not:

`High priority email from ABC Corp.`

## 7.3 Quiet-hours exception requires explicit policy

Quiet/unavailable periods should suppress ordinary grouped delivery and awareness.

Immediate interruption during quiet hours should require either:

- an explicit user-configured exception; or
- a narrowly defined, separately accepted high-consequence policy.

Do not override sleep/weekend boundaries because a model thinks a sender/message is important.

Exact v1 quiet-hours defaults are **UNKNOWN**.

## 7.4 Delivery capability is part of the promise shown to the user

If an immediate-return contract depends on push while the app is closed, the Product should make that dependency visible during setup/permission loss.

Example:

```text
この件は「すぐ通知」に設定されています。
現在プッシュ通知が無効なため、アプリを開くまでお知らせできません。

[通知を有効にする]
[アプリを開いた時でよい]
```

Do not convert OS permission state into a communication Responsibility.

---

# 8. Evening / end of day

## 8.1 No mandatory close-of-day review

A required evening sweep reintroduces maintenance. Open Needs You/Review remains current according to semantics; Lunowa does not require ritual completion for engagement metrics.

## 8.2 Optional end-of-day projection

A user may choose a compact recap, but it should not gamify counts or imply everything must reach zero.

## 8.3 Make invisible stewardship legible without an activity inbox

**PRODUCT HYPOTHESIS:** contextual closure receipts and occasional compact stewardship recaps are stronger than mandatory daily reports.

Exact cadence is open.

---

# 9. Night, weekends, vacation, other unavailable periods

## 9.1 Monitoring continues while delivery may pause

```text
monitoring availability
!= human availability
!= external delivery availability
```

During quiet/unavailable periods:

- ingest/reconcile normally where infrastructure allows;
- update internal state normally;
- preserve current projections;
- defer ordinary external interruption until an allowed window;
- retain context for correct later return.

## 9.2 On return, recompute

Do not replay every queued historical push. Show current Review, Needs You, still-relevant awareness, and integrity state.

## 9.3 Vacation mode

Long absence adds complexity and is **DEFERRED/UNKNOWN** for v1. Do not create a generic out-of-office workflow engine prematurely.

---

# 10. Later / defer behavior

`Later` changes attention timing, not Responsibility truth.

```text
Responsibility remains open
attention intentionally deferred
return condition recorded
```

New evidence does not automatically cancel defer. Re-evaluate whether it materially justifies earlier return.

This preserves `resurface != interrupt`.

---

# 11. Notification content contract

## 11.1 Represent user-relevant state, not source activity

Prefer:

`見積書が届き、今日17:00までに確認が必要です。`

over:

`New email from ABC Corp — Re: 見積書`.

## 11.2 Minimum content

Usually:

- concrete subject/person;
- current user-relevant change/question/action;
- material timing reason when applicable.

Do not include long summaries.

## 11.3 Privacy

Lock-screen content may be sensitive. Support reduced-detail previews; exact defaults require platform/user validation.

---

# 12. Badge semantics

Unread-mail count measures source activity, not Attention Need, and should not be Lunowa's primary badge.

A candidate is current user-attention count, but Review and Needs You are distinct; one combined number may hide meaning.

Exact badge semantics are **UNKNOWN**. Avoid Managed/Waiting counts as the default OS badge because they can recreate monitoring burden.

---

# 13. Relationship to current surfaces and semantics

```text
HOME
  current-state composition

NEEDS YOU
  current actionable user work

MOMENT
  why now / what changed / what remains / safe next action

MANAGED
  delegated loops + reassurance + monitoring/delivery integrity inspection

REVIEW
  material semantic/authority uncertainty

SOURCE
  original communication / provenance
```

Daily Operating Model adds no canonical lifecycle/domain object.

`Informational catch-up`, grouping, immediate delivery, delivery windows, Monitoring Integrity, and Delivery Integrity are Product-level behavior concepts. They must not be silently persisted as Responsibility resolution/lifecycle enums.

Temporal facts remain distinct: source due, expected-event time, user target, resurface time, follow-up time, and delivery time must not overwrite one another.

---

# 14. What daily operation must not become

Do not build around:

- mandatory morning Inbox triage;
- mandatory evening review;
- every new email notifying;
- every reply returning attention;
- Review being folded into Needs You;
- opaque AI-chosen interruption timing for all normal work;
- permanent awareness inbox without evidence;
- unread count as success metric;
- Waiting count as pressure badge;
- AI activity feed;
- daily streak / Inbox Zero gamification;
- immediate classification based only on sender importance or wording;
- delivery rules that mutate canonical temporal facts;
- replaying obsolete notifications after absence;
- accepting an immediate-return promise without an available delivery path.

---

# 15. Daily operating metrics

Do not optimize primarily for DAU/session count. A successful delegation Product may reduce opens.

## Interruption quality

- external notifications per delegated loop;
- unnecessary immediate interruptions;
- percent of evidence changes handled silently;
- grouped vs individual notification count;
- dismissal/open/action after delivery;
- immediate false-positive rate.

## Delegation quality

- Inbox/Sent self-checking while Managed;
- Managed inspection without state change;
- parallel reminder/task creation;
- time delegated loops remain outside active attention.

## Return quality

- missed Attention events;
- return lateness relative to accepted contract;
- Moment-to-correct-action time;
- source expansion required before action;
- stale delivery suppression correctness.

## Awareness quality

- informational updates opened/ignored;
- awareness incorrectly promoted to work;
- stale/superseded awareness shown;
- preference for next-open vs digest.

## Integrity

- monitorable vs monitoring-degraded time;
- deliverable vs delivery-degraded time for contracts requiring external reach;
- time to integrity disclosure;
- affected delegated loops per outage/permission loss;
- false reassurance during degraded periods (target: zero).

---

# 16. Evidence-backed directions vs Product hypotheses

## Relatively well-supported direction

- frequent unpredictable notifications interrupt attention;
- batching/predictability can reduce interruption burden in some contexts;
- complete notification suppression can create anxiety/FoMO in some populations;
- proactive AI interventions were better received at workflow boundaries than mid-task in a 2026 developer field study;
- passive ambient interventions preserved flow better than active interventions in a 2025 meeting technology probe;
- current agent products can notify at meaningful checkpoints rather than requiring continuous monitoring;
- current mail products distinguish action-oriented to-dos from catch-up/informational surfaces;
- current state/provenance should remain inspectable.

## Lunowa-specific hypotheses requiring validation

- ordinary attention returns should often use next-visit or grouped delivery rather than immediate push;
- awareness should use `前回以降の更新` and/or digest rather than a persistent surface;
- no mandatory morning/evening ritual;
- exact delivery-window defaults;
- exact immediate criteria;
- quiet-hours exception behavior;
- whether optional briefing improves relinquishment or creates checking ritual;
- badge semantics;
- stewardship recap cadence.

---

# 17. Candidate Daily Operating Contract

> **Lunowa watches continuously, interrupts sparingly, and returns current state rather than replaying the inbox.**

```text
ALWAYS
monitor delegated loops when monitoring integrity is healthy
reconcile evidence
maintain current state

SILENTLY
handle non-actionable progress

INFORMATIONALLY
surface promised awareness without turning it into work

AT THE NEXT SUFFICIENT MOMENT
return Needs You or Review — next visit or grouped delivery depending delay cost and available channel

IMMEDIATELY
interrupt only when delay is materially costly / explicitly requested AND a valid immediate delivery path exists

HONESTLY
surface loss of monitoring or delivery integrity

ON RETURN
rebuild from current state, suppress stale events, restore minimum context
```

---

# 18. Open Product questions before canonical promotion

1. What is the default for ordinary external notification timing?
2. Should v1 ship an optional scheduled briefing or rely on next-open Home?
3. What validated criteria allow quiet-hours override?
4. How should work-hour/weekend preferences be collected without heavy setup?
5. Does `前回以降の更新` improve orientation or become another inbox?
6. How should awareness expire after display?
7. What OS badge semantics reduce checking rather than increase it?
8. How should foreground desktop/mobile behavior suppress duplicate pushes?
9. What maximum delivery delay is acceptable for ordinary Needs You/Review in the first validated ICP?
10. Which Monitoring/Delivery Integrity failures require immediate delivery versus next allowed visibility?
11. How should the older Product Constitution candidate's `Passive` vocabulary be reconciled with newer Surface/Daily distinctions before canonical promotion?
12. Which return contracts should be disallowed or weakened when the user has no reliable external delivery channel enabled?

These require Lunowa-specific Product evidence and must not be resolved solely by intuition or unrelated notification research.
