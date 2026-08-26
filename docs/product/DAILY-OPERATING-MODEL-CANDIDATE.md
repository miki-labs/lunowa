# Lunowa Daily Operating Model Candidate

## Status

**Durable Product candidate — NOT canonical design authority and NOT implementation authorization.**

This document defines how Lunowa should behave across an ordinary day once monitoring delegation exists. It is downstream of:

- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md`;
- `V1-PRODUCT-SURFACE-CANDIDATE.md`;
- `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md`;
- canonical Responsibility semantics under `docs/product/responsibility/`.

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
  -> choose delivery lane
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

Do not force the user through a stale 09:00 “still waiting” notification before the current 11:00 result.

Event history remains inspectable, but the work surface answers what is true and material now.

---

# 2. Delivery lanes

The Product should separate semantic state from delivery strength.

```text
Evidence / Responsibility state
           !=
Delivery channel / timing
```

Five conceptual lanes are useful.

## 2.1 Lane A — Silent stewardship

Use when:

- evidence changed;
- monitoring state changed;
- no current user action/judgment is required;
- no explicit promised-awareness condition requires delivery;
- no monitoring-integrity problem needs attention.

Examples:

- counterpart says “legal is reviewing”;
- expected date moves from Thursday to Friday but this does not create user action;
- a reply arrives that only updates waiting state;
- a delegated loop remains healthy and unchanged.

Behavior:

```text
update state
-> no push
-> no Needs You
-> no Review
-> optionally visible in Managed evidence receipt/history
```

This lane should be common. Correct silence is core Product value.

## 2.2 Lane B — Passive awareness

Use when:

- user explicitly asked to know about an outcome/change;
- no action/judgment is currently required;
- delay is acceptable.

Examples:

- payment confirmation received;
- package delivered;
- approval completed where no follow-up is needed;
- requested informational milestone occurred.

Behavior candidate:

- show on next open in a compact `Since you were away` / informational area; and/or
- include in an optional predictable digest;
- do not create durable work in Needs You merely because awareness was promised.

Awareness should age out after being seen/acknowledged according to a simple Product rule; it is not a permanent task queue.

## 2.3 Lane C — Standard attention return

Use when:

- a current user action or judgment is genuinely required;
- delay matters, but not enough to justify immediate interruption.

Behavior:

```text
Needs You becomes current immediately in Product state
-> external notification is grouped / delivered at the next allowed attention window
-> opening Lunowa before that window shows the item immediately
```

Examples:

- quotation arrived and needs review later today;
- reply needs a decision but no imminent deadline;
- a follow-up is due but several hours of delay is acceptable.

The exact batching cadence is **UNKNOWN** and must not be copied mechanically from unrelated notification studies.

## 2.4 Lane D — Urgent attention return

Use only when delaying until the next normal attention window would cause material expected harm or violate an explicit user-owned immediate-return contract.

Possible qualifying evidence:

- explicit imminent source due with required user action;
- a user-configured “tell me immediately when X happens” contract;
- time-sensitive safety/security/financial communication where the safe action is to verify/review now;
- another accepted high-delay-cost condition validated by Product evidence.

Do not equate:

- important sender;
- emotionally urgent wording;
- new message;
- model-assigned high importance

with urgent interruption automatically.

Urgency should be explainable in ordinary language, e.g.:

`今日15:00が回答期限のため、今確認が必要です。`

## 2.5 Lane E — Monitoring-integrity alert

Provider/sync/scheduler/reconciliation failure is a separate Product-level degraded-state lane, not automatically a Responsibility state.

Delivery strength depends on the risk created by the degradation.

Examples:

```text
Gmail sync stale 8 minutes
no time-sensitive delegated loops affected
-> passive / next allowed window
```

```text
Gmail sync stopped
3 delegated loops have return conditions inside 30 minutes
-> immediate integrity alert
```

Do not keep showing generic `Lunowaが見ています` reassurance when monitoring cannot currently be honored.

---

# 3. Opening Lunowa at any time

## 3.1 Home is a current-state briefing, not a chronological feed

On open, Home should answer:

1. Is there any material Review?
2. What user action/judgment is current now?
3. What non-actionable information became relevant since the user last looked?
4. Is delegated monitoring healthy?
5. Can the user reach Source immediately?

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

`前回以降の更新` is a Product hypothesis, not a new domain state.

## 3.2 Home must avoid replaying obsolete events

If an awareness update has been superseded by a later actionable state, show the current actionable state once.

If a Needs You item became resolved before the user opened Lunowa, do not keep a stale actionable card merely because a push was previously queued.

## 3.3 Empty state

Preferred semantic empty state:

> **今、あなたが対応する必要はありません。**

Secondary information can show monitoring integrity and compact awareness.

Do not require Inbox Zero-style processing of Managed items.

---

# 4. Morning behavior

## 4.1 No mandatory morning ritual

**DOCTRINE CANDIDATE:** Lunowa must not require a daily morning triage to remain safe.

The user may open Lunowa in the morning, but the Product's reliability should not depend on it.

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

Current agent products support scheduled daily briefings, so the pattern is familiar. However, making one mandatory would create a new daily review obligation.

**PRODUCT HYPOTHESIS:** allow an optional briefing such as:

```text
9:00
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
-> select delivery lane
```

The user does not need to watch this process.

## 5.2 Do not push intermediate Waiting updates

Example:

```text
10:00 user is working elsewhere
10:12 counterpart: “still checking internally”
```

If no action/awareness promise is triggered:

- update Managed silently;
- do not notify;
- do not create a badge requiring inspection.

## 5.3 Standard Needs You should be grouped predictably

External evidence supports reducing unpredictable interruption and suggests that proactive interventions are better received at natural workflow boundaries than mid-task. Lunowa v1 may not reliably infer such boundaries.

Therefore the safer Product direction is:

> **Predictable grouping beats opaque “AI decides when to interrupt” for normal attention returns.**

The exact implementation remains open. Candidate options for validation:

- user-chosen delivery windows;
- coarse work-hours windows;
- grouped notifications after a short predictable buffer;
- `next app open` for users who disable standard push.

Do not fix `3 times/day` merely because one smartphone experiment found benefits at that cadence.

## 5.4 Multiple normal returns should collapse into one interruption

If three standard Needs You items become current inside one delivery window, prefer:

```text
Lunowa
3件、あなたの対応が必要です
```

rather than three independent pushes.

Opening the notification should land on Needs You ordered by current attention need.

## 5.5 If the user is already in Lunowa

Avoid redundant operating-system push for a state the user has already seen in foreground.

Current state changes may update the UI in place; materially disruptive animations/toasts are unnecessary unless action safety requires explicit acknowledgement.

---

# 6. Awareness-only updates

## 6.1 Awareness is not a task queue

Keep awareness distinct from Needs You and Review.

Examples:

- `入金を確認しました。何もする必要はありません。`
- `承認が完了しました。`
- `予約が確定しました。`

## 6.2 Candidate delivery

**PRODUCT HYPOTHESIS:** awareness can use two lightweight paths:

1. `Since you were away` on next open;
2. optional scheduled digest for users who want one.

Do not create a permanent top-level `Updates` inbox unless Product evidence shows repeated retrieval value.

## 6.3 Awareness should be deduplicated and current

If the user asked to know when a payment is received:

```text
payment pending
-> payment received
-> refund/correction happens before user opens
```

Do not show a stale “payment received, nothing to do” card without the later material state.

---

# 7. Urgent delivery

## 7.1 Urgent must be rare enough to preserve meaning

If “urgent” becomes a synonym for “important”, Lunowa recreates ordinary mail notifications.

Product quality should be judged partly by unnecessary urgent interruption rate.

## 7.2 User-visible reason

Urgent notification should explain the delay-sensitive condition in one line.

Example:

```text
契約確認が必要です
今日15:00が回答期限です
```

Not:

```text
High priority email from ABC Corp
```

## 7.3 Quiet-hours exception requires an explicit policy

Default quiet periods should suppress standard attention and awareness deliveries.

Urgent interruptions during quiet hours should require either:

- an explicit user-configured exception; or
- a narrowly defined high-consequence policy that has been separately accepted and validated.

Do not silently override sleep/weekend boundaries because the model thinks a message is important.

Exact v1 quiet-hours defaults are **UNKNOWN**.

---

# 8. Evening / end of day

## 8.1 No mandatory “close your day” review

A required evening sweep would reintroduce a daily maintenance ritual.

If Needs You remains open, it remains current according to its semantics; Lunowa does not force ritual completion for Product metrics.

## 8.2 Optional end-of-day projection

A user may choose a compact recap such as:

```text
今日
新しく対応が必要になった: 3
対応済み: 2
明日までに必要: 1
Lunowaが静かに処理した更新: 5
```

This is optional and should avoid gamifying counts or implying that all work should hit zero.

## 8.3 Stewardship value may be shown periodically, not continuously

Invisible successful monitoring needs to be legible enough to earn trust, but a daily activity report can become another inbox.

**PRODUCT HYPOTHESIS:** prefer contextual closure receipts and occasional compact stewardship recaps over a mandatory daily report.

Exact cadence is open.

---

# 9. Night, weekends, vacation, and other unavailable periods

## 9.1 Monitoring continues while delivery may pause

The Product should distinguish:

```text
monitoring availability
!=
human availability
```

During user quiet/unavailable periods:

- ingest/reconcile normally where infrastructure allows;
- update internal state normally;
- keep standard Needs You current;
- defer ordinary external notification until an allowed window;
- retain enough context to return correctly later.

## 9.2 When the user returns

Do not deliver every queued historical push.

Recompute from current state and show:

- current Review;
- current Needs You;
- still-relevant awareness;
- monitoring integrity.

## 9.3 Vacation and long absence

Long absence introduces additional uncertainty:

- source deadlines may pass;
- delegated loops may resolve/reopen;
- access tokens/provider permissions may degrade;
- external systems may become authoritative.

Exact vacation mode is **DEFERRED/UNKNOWN** for v1. Do not create a generic out-of-office workflow engine prematurely.

---

# 10. Later / defer behavior

## 10.1 Later changes attention timing, not Responsibility truth

When user defers:

```text
Responsibility remains open
attention intentionally deferred
return condition recorded
```

## 10.2 New evidence during Later

A new message does not automatically cancel the defer.

Re-evaluate whether the new evidence creates a material reason to return earlier.

Examples:

```text
new courtesy reply
-> remain Later
```

```text
new deadline moved to today
-> return early if material
```

This preserves `resurface != interrupt` and avoids source-arrival-driven behavior.

---

# 11. Notification content contract

## 11.1 Notification should represent the user-relevant state

Prefer:

`見積書が届き、今日17:00までに確認が必要です。`

over:

`New email from ABC Corp — Re: 見積書`

## 11.2 Minimum content

A normal/urgent notification generally needs:

- concrete subject/person;
- current user-relevant change/action;
- material timing reason when applicable.

Do not include long summaries.

## 11.3 Privacy

Lock-screen content may contain sensitive communication. Product settings should support reduced-detail previews.

Exact privacy defaults must be reconciled with platform conventions and user testing.

---

# 12. Badge semantics

## 12.1 Do not use unread-mail count as Lunowa's primary badge

Unread count measures source activity, not Attention Need.

## 12.2 Candidate badge

If a badge is used, the strongest candidate is the number of **current user-attention items**, potentially including material Review according to a clear rule.

However Review and Needs You are semantically distinct; one combined numeric badge may hide that distinction.

Exact badge semantics are **UNKNOWN**.

Avoid Managed/Waiting counts on the OS icon by default because they can recreate monitoring burden.

---

# 13. Relationship to current surfaces

```text
HOME
  current-state composition

NEEDS YOU
  standard + urgent actionable user work

MOMENT
  why now / what changed / what remains / safe next action

MANAGED
  delegated loops + reassurance + integrity inspection

REVIEW
  material semantic/authority uncertainty

SOURCE
  original communication / provenance
```

Daily Operating Model does not add a new canonical state.

`Awareness`, `urgent`, `silent`, and `delivery window` are Product-delivery concepts and must not be silently turned into Responsibility lifecycle enums.

---

# 14. What daily operation must not become

Do not build the Product around:

- mandatory morning Inbox triage;
- mandatory evening review;
- every new email generating a notification;
- every reply canceling Waiting and returning attention;
- opaque AI-chosen interruption timing for all normal work;
- a permanent awareness/update inbox unless validated;
- unread count as the success metric;
- Waiting count as a pressure badge;
- AI activity feed;
- “daily streak” or Inbox Zero gamification;
- urgent classification based only on sender importance or wording;
- delivery rules that mutate canonical communicated due dates;
- replaying obsolete notifications after long absence.

---

# 15. Daily operating metrics

Do not optimize primarily for DAU/session count. A successful delegation Product may reduce opens.

Important measures:

## Interruption quality

- external notifications per delegated loop;
- unnecessary immediate interruptions;
- percent of new messages handled silently;
- grouped vs individual notification count;
- user dismissal/open/action after standard and urgent returns;
- urgent false-positive rate.

## Delegation quality

- self-checking of Inbox/Sent while Managed;
- Managed inspection without state change;
- parallel reminder/task creation;
- time delegated loops remain out of active attention.

## Return quality

- missed Attention events;
- lateness of return relative to accepted contract;
- time from Moment open to correct action;
- source expansion required before action;
- stale notification suppression correctness.

## Awareness quality

- awareness items opened/ignored;
- awareness incorrectly promoted to work;
- stale/superseded awareness shown;
- user preference for next-open vs scheduled digest.

## Integrity

- monitorable time vs degraded time;
- time to integrity disclosure;
- affected delegated loops per outage;
- false reassurance during degraded periods (target: zero).

---

# 16. Evidence-backed directions vs Product hypotheses

## Relatively well-supported direction

- frequent unpredictable notifications interrupt attention;
- batching/predictability can reduce interruption burden in some contexts;
- complete notification suppression can create anxiety/FoMO in some populations;
- proactive AI interventions are more acceptable at workflow boundaries than mid-task in a 2026 developer field study;
- passive interventions preserve flow better than active interventions in a 2025 meeting technology probe;
- current agent products notify at meaningful checkpoints such as input/approval/completion rather than requiring continuous monitoring;
- current mail products distinguish action-oriented to-dos from catch-up/informational surfaces;
- current state/provenance needs to remain inspectable.

## Lunowa-specific hypotheses requiring validation

- standard Needs You should normally be externally batched;
- awareness should use `Since you were away` and/or digest rather than a persistent surface;
- no mandatory morning/evening ritual;
- exact delivery-window defaults;
- exact urgent criteria;
- quiet-hours exception behavior;
- whether an optional daily briefing improves relinquishment or merely creates another checking ritual;
- badge semantics;
- stewardship recap cadence.

---

# 17. Candidate Daily Operating Contract

The Product can be summarized as:

> **Lunowa watches continuously, interrupts sparingly, and always returns the current state rather than replaying the inbox.**

More concretely:

```text
ALWAYS
monitor delegated loops
reconcile evidence
maintain current state

SILENTLY
handle non-actionable progress

PASSIVELY
surface awareness the user asked to know

PREDICTABLY
return ordinary user work in grouped attention windows

IMMEDIATELY
interrupt only when delay itself is materially costly or explicitly requested

HONESTLY
surface loss of monitoring integrity

ON RETURN
rebuild from current state, suppress stale events, restore minimum context
```

---

# 18. Open Product questions before canonical promotion

1. What is the exact default for standard external notification timing?
2. Should v1 ship an optional scheduled briefing or rely on next-open current-state Home?
3. What validated criteria allow quiet-hours override?
4. How should weekend/work-hour preferences be collected without a heavy setup flow?
5. Does `Since you were away` improve orientation or become another inbox?
6. Should awareness expire automatically after display, and under what conditions?
7. What exact OS badge semantics best reduce checking?
8. How does mobile foreground behavior differ from desktop without duplicating pushes?
9. What maximum delay is acceptable for standard Needs You in the first validated ICP?
10. Which integrity failures require immediate delivery versus next allowed window?

These questions require Product evidence and must not be resolved solely by intuition or unrelated notification research.
