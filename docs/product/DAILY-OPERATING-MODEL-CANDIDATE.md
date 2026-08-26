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

## 1.2 The Product must still work if the user does not open it today

**DOCTRINE CANDIDATE:** daily app opening is not part of the core reliability contract.

If monitoring integrity is healthy, Lunowa should continue to:

- watch delegated loops;
- reconcile new evidence;
- preserve temporal return conditions;
- create/clear current Attention Need as state changes;
- suppress obsolete delivery artifacts;
- surface current state when the user eventually returns.

A required morning or evening review ritual would partially reintroduce the monitoring burden Lunowa exists to remove.

## 1.3 Current state outranks stale notification history

When a user returns after hours/days away, Home should be reconstructed from **current accepted state**, not from every event that occurred while absent.

Example:

```text
09:00 counterpart says “still checking”
11:00 counterpart sends requested document
14:00 user opens Lunowa
```

Do not force the user through a stale 09:00 “still waiting” event before the current 11:00 result.

Event history remains inspectable, but the work surface answers what is true and material now.

---

# 2. Delivery model

Semantic state, attention need, delivery urgency, and channel remain separate.

```text
Operational state
!= Attention Need
!= delivery urgency
!= notification channel
```

The accepted Temporal Contract ADR already fixes that a trigger firing does not itself imply notification. This candidate extends that distinction into daily Product behavior.

## 2.1 Silent stewardship

Use when:

- evidence changed;
- monitoring state changed;
- no current user action/judgment is required;
- no explicit promised-awareness condition requires delivery;
- no monitoring-integrity problem needs attention.

Examples:

- counterpart says “legal is reviewing”;
- an expected date changes but creates no user action;
- a reply only updates Waiting state;
- a delegated loop remains healthy and unchanged.

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

Use when:

- user explicitly asked to know about an outcome/change;
- no action/judgment is currently required;
- delivery can be delayed without material harm.

Examples:

- payment confirmation received;
- requested approval completed where no follow-up is needed;
- another promised informational milestone occurred.

Candidate behavior:

- show on next open in a compact `前回以降の更新` / informational area; and/or
- include in an optional predictable digest;
- do not create durable work in Needs You merely because awareness was promised.

Awareness is a Product-delivery concept, not a Responsibility lifecycle state or a permanent task queue.

## 2.3 Actionable return — Needs You becomes current now

When a current user action/judgment genuinely becomes necessary, `Needs You` should reflect that state immediately inside Lunowa.

External delivery then depends on delay cost:

### 2.3.1 Next-visit sufficient

Use when the work is current but a push interruption is unnecessary.

```text
Needs You current
-> no external push
-> next intentional Lunowa visit is sufficient
```

This corresponds most closely to the Product Constitution candidate's older `Passive` delivery meaning.

### 2.3.2 Deferred / grouped external delivery

Use when the user should be informed before a likely next natural app open, but immediate interruption is not justified.

```text
Needs You current
-> group until next allowed attention window
-> one external notification can represent multiple current items
```

This corresponds to the Constitution candidate's `Deferred / opportune` direction.

Examples:

- quotation arrived and should be reviewed later today;
- a reply needs a decision but there is no imminent deadline;
- a follow-up is due but several hours of delay is acceptable.

The exact batching cadence is **UNKNOWN**. Do not copy `three times/day` from unrelated smartphone-notification evidence.

## 2.4 Immediate actionable return

Use only when delaying to the next ordinary attention opportunity would cause material expected harm or violate an explicit user-owned immediate-return contract.

Possible qualifying evidence:

- explicit imminent source due with required user action;
- user-configured “tell me immediately when X happens” behavior;
- accepted high-delay-cost conditions validated by Product evidence.

Do not equate:

- important sender;
- emotionally urgent wording;
- new message;
- model-assigned high importance

with immediate interruption automatically.

Urgency should be explainable in ordinary language, e.g.:

`今日15:00が回答期限のため、今確認が必要です。`

Any displayed precision must come from accepted temporal evidence; never invent `15:00` from a source that only says `today` or `Friday`.

## 2.5 Monitoring-integrity alert

Provider/sync/scheduler/reconciliation failure is a separate Product-level degraded-state condition, not automatically a Responsibility, Needs You item, or semantic Review subject.

Delivery strength depends on the risk created by the degradation.

Examples:

```text
Gmail sync stale briefly
no time-sensitive delegated loops affected
-> next allowed/visible integrity notice
```

```text
Gmail sync stopped
multiple delegated loops have near-term return conditions
-> immediate integrity alert may be warranted
```

Do not keep showing generic `Lunowaが見ています` reassurance when monitoring cannot currently be honored.

## 2.6 Known candidate-vocabulary reconciliation

`PRODUCT-CONSTITUTION-V1-CANDIDATE.md` currently uses a draft delivery vocabulary:

```text
Silent
Passive
Deferred / opportune
Immediate
```

`V1-PRODUCT-SURFACE-CANDIDATE.md` later clarified that awareness-only information should not enter Needs You. This Daily Operating Model follows that newer surface distinction and therefore uses `Informational catch-up` for awareness-only delivery rather than overloading `Passive`.

If these candidates are promoted canonically, the vocabulary must be reconciled in one owning source rather than preserving two meanings for `Passive`.

---

# 3. Opening Lunowa at any time

## 3.1 Home is a current-state briefing, not a chronological feed

On open, Home should answer:

1. Is there material Review?
2. What user action/judgment is current now?
3. What non-actionable information became relevant since the user last looked?
4. Is delegated monitoring healthy?
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
前回以降の更新             2   # only when useful
入金を確認しました
何もする必要はありません

────────────────────
Lunowaが見ています        14
監視は正常です

[会話を見る]
```

`前回以降の更新` is a Product hypothesis, not a new canonical domain state.

## 3.2 Home must avoid replaying obsolete events

If an awareness update has been superseded by a later actionable state, show the current actionable state once.

If a Needs You item became resolved before the user opened Lunowa, do not keep a stale actionable card merely because an external notification was previously queued.

## 3.3 Empty state

Preferred semantic empty state:

> **今、あなたが対応する必要はありません。**

Secondary information can show monitoring integrity and compact awareness.

Do not require Inbox Zero-style processing of Managed items.

---

# 4. Morning behavior

## 4.1 No mandatory morning ritual

**DOCTRINE CANDIDATE:** Lunowa must not require a daily morning triage to remain safe.

The user may open Lunowa in the morning, but Product reliability should not depend on it.

## 4.2 Morning open

If the user opens naturally in the morning, Home acts as an on-demand current-state briefing:

```text
Review
-> Needs You
-> relevant awareness since last visit
-> Managed integrity reassurance
```

Do not dump all overnight mail or all Waiting transitions.

## 4.3 Scheduled morning briefing is optional

Current agent products support scheduled daily briefings, so the pattern is familiar. Making one mandatory would create a new daily review obligation.

**PRODUCT HYPOTHESIS:** allow an optional briefing such as:

```text
今日あなたが必要: 2件
確認が必要: 0件
知っておく更新: 1件
監視中: 正常
```

The briefing should summarize current attention state, not reproduce an inbox.

Exact default, time, and whether v1 needs this at all are **UNKNOWN**.

---

# 5. During the workday

## 5.1 Continuous background stewardship

Throughout the day:

```text
mail / sent / time / relevant provider evidence
-> reconcile
-> update state
-> select delivery behavior
```

The user does not need to watch this process.

## 5.2 Do not push intermediate Waiting updates

Example:

```text
10:12 counterpart: “still checking internally”
```

If no action/awareness promise is triggered:

- update Managed silently;
- do not notify;
- do not create a badge requiring inspection.

## 5.3 Prefer predictable delivery to opaque interruption inference for ordinary work

External evidence supports reducing unpredictable interruption and suggests that proactive interventions can be better received at workflow boundaries than mid-task. Lunowa v1 may not reliably infer those boundaries.

Therefore:

> **For normal delay-tolerant returns, predictable grouping is a stronger v1 hypothesis than opaque “AI decides the perfect moment”.**

Candidate options for validation:

- user-chosen delivery windows;
- coarse allowed work-hour windows;
- grouped notifications after a predictable buffer;
- next-app-open only for users who disable standard push.

Do not freeze an exact schedule from unrelated research.

## 5.4 Multiple normal returns should collapse into one interruption

If several delay-tolerant Needs You items become current inside one delivery window, prefer one summary notification such as:

`3件、あなたの対応が必要です。`

Opening it should show current Needs You ordered by current attention need.

## 5.5 Foreground behavior

If Lunowa is already foregrounded and the relevant current state is visible, avoid redundant OS push.

Update the UI calmly; materially disruptive toasts/animations should be reserved for cases requiring explicit acknowledgement.

---

# 6. Awareness-only updates

## 6.1 Awareness is not a task queue

Keep awareness distinct from Needs You and Review.

Examples:

- `入金を確認しました。何もする必要はありません。`
- `承認が完了しました。`

## 6.2 Candidate delivery

**PRODUCT HYPOTHESIS:** awareness can use lightweight paths:

1. `前回以降の更新` on next open;
2. optional scheduled digest for users who want one.

Do not create a permanent top-level `Updates` inbox unless Product evidence shows repeated retrieval value.

## 6.3 Awareness must be deduplicated and current

If later evidence materially changes the meaning before the user sees an awareness card, show the later current state rather than stale reassurance.

---

# 7. Immediate / urgent delivery

## 7.1 Immediate must remain rare enough to preserve meaning

If immediate delivery becomes a synonym for “important”, Lunowa recreates ordinary mail notifications.

Product quality should include unnecessary-immediate-interruption rate.

## 7.2 User-visible reason

Immediate notification should explain the delay-sensitive condition in one line.

Prefer:

`契約確認が必要です — 今日15:00が回答期限です。`

Not:

`High priority email from ABC Corp.`

## 7.3 Quiet-hours exception requires explicit policy

Default quiet/unavailable periods should suppress ordinary grouped action returns and awareness deliveries.

Immediate interruption during quiet hours should require either:

- an explicit user-configured exception; or
- a narrowly defined high-consequence policy separately accepted and validated.

Do not override sleep/weekend boundaries because a model believes a sender/message is important.

Exact v1 quiet-hours defaults are **UNKNOWN**.

---

# 8. Evening / end of day

## 8.1 No mandatory close-of-day review

A required evening sweep would reintroduce daily maintenance.

If Needs You remains open, it remains current according to its semantics; Lunowa does not force ritual completion for engagement metrics.

## 8.2 Optional end-of-day projection

A user may choose a compact recap such as:

```text
今日
新しく対応が必要になった: 3
対応済み: 2
明日までに必要: 1
静かに処理した更新: 5
```

This should not gamify counts or imply that all work must hit zero.

## 8.3 Stewardship value should be legible but not another inbox

**PRODUCT HYPOTHESIS:** contextual closure receipts and occasional compact stewardship recaps are stronger than mandatory daily activity reports.

Exact cadence is open.

---

# 9. Night, weekends, vacation, other unavailable periods

## 9.1 Monitoring continues while delivery may pause

```text
monitoring availability
!= human availability
```

During user quiet/unavailable periods:

- ingest/reconcile normally where infrastructure allows;
- update internal state normally;
- keep Needs You current;
- defer ordinary external interruption until an allowed window;
- preserve context for correct later return.

## 9.2 When the user returns

Do not replay every queued historical push.

Recompute and show current:

- Review;
- Needs You;
- still-relevant awareness;
- monitoring integrity.

## 9.3 Vacation / long absence

Long absence adds product complexity: deadlines pass, loops can resolve/reopen, provider access may degrade, and off-channel state may diverge.

Exact vacation mode is **DEFERRED/UNKNOWN** for v1. Do not create a generic out-of-office workflow engine prematurely.

---

# 10. Later / defer behavior

## 10.1 Later changes attention timing, not Responsibility truth

```text
Responsibility remains open
attention intentionally deferred
return condition recorded
```

## 10.2 New evidence during Later

A new message does not automatically cancel defer.

Re-evaluate whether new evidence creates a material reason for earlier return.

```text
courtesy reply
-> remain Later
```

```text
accepted deadline materially moves earlier
-> earlier return may be justified
```

This preserves `resurface != interrupt` and avoids arrival-driven behavior.

---

# 11. Notification content contract

## 11.1 Represent user-relevant state, not source activity

Prefer:

`見積書が届き、今日17:00までに確認が必要です。`

over:

`New email from ABC Corp — Re: 見積書`.

## 11.2 Minimum content

A normal/immediate notification generally needs:

- concrete subject/person;
- current user-relevant change/action;
- material timing reason when applicable.

Do not include long summaries.

## 11.3 Privacy

Lock-screen content may expose sensitive communication. Product settings should support reduced-detail previews.

Exact privacy defaults require platform/user validation.

---

# 12. Badge semantics

## 12.1 Unread-mail count should not be Lunowa's primary badge

Unread count measures source activity, not Attention Need.

## 12.2 Candidate badge

If an OS/app badge is used, a candidate is current user-attention count. However Review and Needs You are semantically distinct, so one combined number may hide meaning.

Exact badge semantics are **UNKNOWN**.

Avoid Managed/Waiting counts as the default OS badge because they can recreate monitoring burden.

---

# 13. Relationship to current surfaces and domain semantics

```text
HOME
  current-state composition

NEEDS YOU
  current actionable user work

MOMENT
  why now / what changed / what remains / safe next action

MANAGED
  delegated loops + reassurance + integrity inspection

REVIEW
  material semantic/authority uncertainty

SOURCE
  original communication / provenance
```

Daily Operating Model does not add a canonical lifecycle or domain object.

`Informational catch-up`, `immediate delivery`, `grouping`, and `delivery windows` are Product-delivery concepts. They must not be silently persisted as Responsibility resolution/lifecycle enums.

Temporal facts remain distinct: source due, expected-event time, user target, resurface time, and delivery time must not overwrite one another.

---

# 14. What daily operation must not become

Do not build the Product around:

- mandatory morning Inbox triage;
- mandatory evening review;
- every new email generating a notification;
- every reply returning attention;
- opaque AI-chosen interruption timing for all normal work;
- permanent awareness/update inbox without evidence;
- unread count as success metric;
- Waiting count as pressure badge;
- AI activity feed;
- daily streak / Inbox Zero gamification;
- immediate classification based only on sender importance or wording;
- delivery rules that mutate canonical temporal facts;
- replaying obsolete notifications after absence.

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
- preference for next-open vs scheduled digest.

## Integrity

- monitorable vs degraded time;
- time to integrity disclosure;
- affected delegated loops per outage;
- false reassurance during degraded periods (target: zero).

---

# 16. Evidence-backed directions vs Product hypotheses

## Relatively well-supported direction

- frequent unpredictable notifications interrupt attention;
- batching/predictability can reduce interruption burden in some contexts;
- complete notification suppression can create anxiety/FoMO in some populations;
- proactive AI interventions were more acceptable at workflow boundaries than mid-task in a 2026 developer field study;
- passive ambient interventions preserved flow better than active interventions in a 2025 meeting technology probe;
- current agent products can notify at meaningful checkpoints instead of requiring continuous monitoring;
- current mail products distinguish action-oriented to-dos from catch-up/informational surfaces;
- current state/provenance should remain inspectable.

## Lunowa-specific hypotheses requiring validation

- ordinary Needs You should often use next-visit or grouped delivery rather than immediate push;
- awareness should use `前回以降の更新` and/or digest rather than a persistent surface;
- no mandatory morning/evening ritual;
- exact delivery-window defaults;
- exact immediate criteria;
- quiet-hours exception behavior;
- whether optional daily briefing improves relinquishment or creates a checking ritual;
- badge semantics;
- stewardship recap cadence.

---

# 17. Candidate Daily Operating Contract

> **Lunowa watches continuously, interrupts sparingly, and returns current state rather than replaying the inbox.**

```text
ALWAYS
monitor delegated loops
reconcile evidence
maintain current state

SILENTLY
handle non-actionable progress

INFORMATIONALLY
surface promised awareness without turning it into work

AT THE NEXT SUFFICIENT MOMENT
return ordinary actionable work — next visit or grouped delivery depending delay cost

IMMEDIATELY
interrupt only when delay itself is materially costly or explicitly requested

HONESTLY
surface loss of monitoring integrity

ON RETURN
rebuild from current state, suppress stale events, restore minimum context
```

---

# 18. Open Product questions before canonical promotion

1. What is the exact default for ordinary external notification timing?
2. Should v1 ship an optional scheduled briefing or rely on next-open Home?
3. What validated criteria allow quiet-hours override?
4. How should work-hour/weekend preferences be collected without a heavy setup flow?
5. Does `前回以降の更新` improve orientation or become another inbox?
6. How should awareness expire after display?
7. What OS badge semantics reduce checking rather than increase it?
8. How should foreground desktop/mobile behavior suppress duplicate pushes?
9. What maximum delay is acceptable for ordinary Needs You in the first validated ICP?
10. Which integrity failures require immediate delivery versus next allowed visibility?
11. How should the older Product Constitution candidate's `Passive` vocabulary be reconciled with the newer Surface/Daily distinction before canonical promotion?

These require Lunowa-specific Product evidence and must not be resolved solely by intuition or unrelated notification research.
