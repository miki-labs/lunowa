# Lunowa Product Thesis and Product Contract

## Status

**Current durable Product-intent baseline for Lunowa when this change is accepted.**

This document owns the Product-level synthesis that must survive session changes: why Lunowa should exist, what user burden it is trying to remove, the strongest current initial-value hypothesis, who may experience that problem, what is differentiation versus table stakes, switching/trust/retention logic, validation logic, scope boundaries, and major unknowns.

It deliberately does **not** replace the more detailed authorities for UX, Responsibility semantics, architecture, persistence, implementation, or live task state:

- `docs/design/DESIGN.md` + `INTERACTIONS.md` + `RESPONSIVE.md` own detailed UX/interaction behavior;
- `docs/product/responsibility/` owns canonical Responsibility semantics/evaluation/persistence-proof status;
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, and `CONTRACTS.md` own Product-engineering boundaries;
- `docs/product/TECH-STACK.md` + accepted ADRs own concrete technology choices;
- `docs/product/IMPLEMENTATION-PLAN.md` owns the living implementation sequence;
- `docs/product/research/` preserves material external evidence inputs, but is not Product authority by itself;
- GitHub Issues/PRs/CI own current task/candidate/review state;
- `docs/continuity/CURRENT.md` is only the mutable current checkpoint/router.

### Evidence discipline

Product reasoning in this file uses these classes:

- **ACCEPTED / CURRENT DIRECTION** — an internal Product decision or operating direction. It is not automatically a market fact.
- **EXTERNAL EVIDENCE** — supported by cited research/current market evidence preserved under `docs/product/research/`.
- **INFERENCE** — a conclusion derived from evidence but not directly established as a Lunowa outcome.
- **HYPOTHESIS / NEEDS VALIDATION** — a falsifiable Product bet.
- **UNKNOWN** — material question not established by current evidence.
- **DEFERRED** — intentionally outside the current learning scope.

A hypothesis is never promoted to fact because code, schema, design references, or a polished prototype already exist.

This revision reconciles the repository with a fresh external evidence audit through **2026-08-25**. The detailed research record is `docs/product/research/COMMUNICATION-ATTENTION-DELEGATION-EVIDENCE-2026-08.md`.

---

## 1. Product identity

### 1.1 Vision

**ACCEPTED / ASPIRATIONAL:** Lunowa aims to create the most comfortable email experience possible — internally often expressed as **「世界一快適なメール体験」**.

That phrase is a vision, not a measurable market claim or release acceptance criterion.

### 1.2 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

The 2026 evidence audit strengthens the internal coherence of this North Star, but does not validate Lunowa as a market solution.

### 1.3 Current Product thesis

**CURRENT DIRECTION / HYPOTHESIS:**

> **Lunowa is an email-first Attention Delegation Product for asynchronous communication. It should maintain unresolved communication state on the user's behalf and return it only when the user's attention is meaningfully required, with enough source-grounded context and control to act safely.**

Japanese working expression:

> **Lunowaは、未完了の非同期コミュニケーションをユーザーの代わりに継続監視し、自分の注意が本当に必要になった時だけ、根拠と最小限の文脈とともに戻すProductである。**

Short internal shorthand:

- **Attention Delegation** — the broader value transfer;
- **Open-loop Monitoring Offload** — the current initial-wedge shorthand.

Lunowa is therefore not primarily an inbox skin, AI chat box, generic task manager, CRM, or a collection of message labels. Email is the first evidence/action surface; the intended value is reducing the user's need to continuously carry unresolved communication in their own attention.

### 1.4 Surface is not the Product thesis

**CURRENT DIRECTION:** do not equate Lunowa's Product value with “a standalone replacement mail client.”

A standalone client, an assistant embedded in an existing inbox, a companion/overlay, or another surface can in principle deliver parts of Attention Delegation. Which surface creates the best value/cost trade-off is a **Product/form-factor hypothesis** until evidence requires one.

Current responsive-web implementation direction remains valid as the present experimentation/build substrate; it is not proof that full-client replacement is required for Product-market fit.

### 1.5 Internal Product principle

> **Eliminate work, not control.**

The system should eliminate low-value monitoring, reconstruction, navigation, and decision work while preserving:

- source visibility;
- human final authority for material external commitments;
- reversibility/correction where practical;
- explicit sending/account/scope boundaries;
- reliable recovery/reconciliation;
- safe fallback when intelligence is unavailable.

### 1.6 Core optimization target

**ACCEPTED:** reduce the low-value attention the user must spend remembering, checking, reconstructing, choosing, and manually organizing communication before reaching meaningful work.

A flow can be fast in clicks yet still fail if the user must keep remembering “I need to check that later.” Lunowa should optimize for **reduced vigilance**, not only faster inbox processing.

---

## 2. Evidence-backed problem framing

### 2.1 What external evidence establishes

**EXTERNAL EVIDENCE:** email has repeatedly been observed functioning as an informal task/reminder system rather than communication alone. Classic HCI field studies found that collaborative email tasks become difficult when work cannot complete until another person responds, causing multiple incomplete tasks to interleave and forcing users to keep track of them, often through messages left in inboxes/folders.

**EXTERNAL EVIDENCE:** a 2024 CSCW study of AI-powered email reminders found real value in surfacing forgotten/missed commitments, but also found that inaccurate, stale, already-completed, or already-tracked recommendations reduce value. The same work cautions that more longitudinal research is needed.

**EXTERNAL EVIDENCE:** prospective-memory research shows external reminders can improve delayed-intention performance, particularly under higher load. A 2026 study further found that after participants experienced highly reliable reminders, they reduced conscious maintenance of the intention and shifted attention to ongoing work; unexpected reminder withdrawal then harmed retrieval. A separate 2026 study also found post-offloading impairment when reminders were removed.

These findings support the **mechanism plausibility** of trusted cognitive offloading. They do **not** prove that Lunowa will earn such trust, that email users will adopt it, or that its current UX/model is correct.

Detailed sources/limitations: `docs/product/research/COMMUNICATION-ATTENTION-DELEGATION-EVIDENCE-2026-08.md`.

### 2.2 Current causal model of Communication Management Burden

**INFERENCE:** Lunowa should no longer treat its four burden dimensions as a flat list. The strongest current causal hypothesis is:

```text
asynchronous + interdependent communication
  -> multiple unresolved communication loops
  -> delays / interruptions / context changes
  -> user must preserve “who owes what / what are we waiting for / when do I care again?”
  -> mental monitoring + Inbox/Sent re-checking + flags/snoozes/tasks/notes
  -> reconstruction/navigation when the loop returns to attention
  -> verification burden when automation cannot be trusted
```

The four burden dimensions remain useful:

1. **Monitoring / attention-maintenance cost** — remembering what must be checked again, what is waiting, what may become urgent, and when a communication loop should return to attention.
2. **Interpretation / reconstruction cost** — recovering the operational meaning: who owes what, what changed, what remains open, what matters now.
3. **Execution / coordination cost** — searching, switching views/accounts, copying information, creating manual tasks, reopening threads, and repeated mechanical actions.
4. **Verification / trust cost** — rechecking original email “just in case” because the attention system may be wrong, stale, incomplete, or operating under the wrong identity/scope.

**CURRENT STRONGEST PROBLEM HYPOTHESIS:** Monitoring/attention maintenance is the leading causal burden Lunowa should initially target. Interpretation, execution, and verification are not secondary in importance, but they become especially costly around repeated monitoring/re-entry.

### 2.3 The Product is not optimizing for Inbox Zero

**ACCEPTED:** unread count, archive rate, inbox size, or Inbox Zero are not primary Product outcomes.

The stronger outcome is whether the user can **safely stop manually monitoring delegated communication** while still regaining the right work at the right moment.

### 2.4 Representative failure modes

Lunowa is intended to reduce failures such as:

- keeping a reply/follow-up obligation in one's head for days;
- scanning Inbox or Sent repeatedly to see whether anything changed;
- receiving a reply that changes context but does not yet require user action, and having to decide that manually again;
- forgetting an important but non-urgent/ad-hoc commitment;
- rereading a long thread after days of waiting to reconstruct the current state;
- manually creating a task/reminder/flag merely so the communication is not forgotten;
- being reminded about something already completed or no longer relevant;
- distrusting automation enough to continue the old checking behavior in parallel;
- missing a material obligation because the system silently hid or misclassified it;
- acting from the wrong account/scope or on unsafe inferred intent.

---

## 3. WHO — current customer hypothesis

The exact ICP is **not validated or frozen**. Characterize candidate users by problem structure before job title.

### 3.1 Strongest current early-user characteristics

**HYPOTHESIS:** higher fit is likely where most of the following are true:

- email carries real operational commitments, not mainly newsletters/notifications;
- work frequently depends on replies, approvals, confirmations, documents, decisions, or actions by other people;
- several such communication loops remain unresolved concurrently;
- waiting periods are variable enough that the user cannot simply finish the work now;
- missing or late action has meaningful cost;
- the user personally owns follow-up/monitoring rather than delegating most of it to an assistant;
- the user revisits Inbox/Sent, uses flags/stars/snoozes, or creates tasks from sent/received email;
- no CRM/ATS/ticketing/project system already provides an adequate system of record for the relevant loop;
- the person has enough autonomy to adopt a companion/assistant/client.

Candidate examples may include hands-on independent professionals, consultants, client-service/agency operators, partnership/business-development work, and operational coordinators. These examples are **search hypotheses, not ICP declarations**.

### 3.2 Lower-priority / possible disqualifiers

Likely weaker initial fit:

- high mail volume but little interdependent/actionable work;
- newsletter/automated-notification-heavy inboxes;
- workflows already well-owned by CRM/ATS/ticketing/shared PM systems;
- work coordinated primarily synchronously or inside a structured shared system;
- users whose monitoring is already delegated to an assistant/team process;
- environments where third-party mail access cannot be authorized.

### 3.3 Important contemporary work-style signal

**EXTERNAL EVIDENCE / LIMITED:** the 2024 Microsoft/CSCW reminder study found positive interaction associated with communicating about tasks via email and creating tasks from email, while many scheduled meetings and task delegation were negatively associated in its small self-report model. The authors explicitly limit the generalizability.

**INFERENCE:** “executive with lots of email” should not be assumed to be the best first ICP. A hands-on operator who personally carries asynchronous commitments may be a stronger candidate than a high-status manager whose task monitoring is already delegated.

### 3.4 What still needs validation before ICP freeze

- frequency and severity of open-loop monitoring;
- number/type/duration of concurrent externally dependent loops;
- current self-checking and workaround behavior;
- cost of missed/late follow-up;
- whether current tools already solve the problem adequately;
- trust threshold for delegating attention;
- adoption/form-factor friction;
- reachable distribution channel;
- willingness to pay;
- repeated reliance across real days/weeks.

---

## 4. Current behavior and alternatives

### 4.1 Typical workaround classes

Current users can already approximate pieces of the job through:

- keeping messages unread/in inbox;
- starring/flagging;
- checking Sent;
- Snooze / reminders;
- folders/labels such as Waiting/Follow-up;
- copying an email into a task manager/calendar/notes;
- CRM/ATS/ticketing systems for structured vertical workflows;
- AI triage/reminder assistants.

The Product question is not whether Lunowa can replicate these controls. It is whether it can remove more monitoring work than the workaround stack while preserving trust.

### 4.2 Current competitive convergence — 2026-08-25

Current primary-source audit shows:

- **Gmail AI Inbox** can surface prioritized Suggested to-dos, explain what needs action, expose related source/context, and support View/Reply/Mark done;
- **Superhuman** can classify Respond/Waiting-like states, detect outbound messages needing follow-up, resurface unanswered sent email, draft follow-ups, and offer an Email Assistant that works directly in Gmail/Outlook;
- **Shortwave** supports todos, AI organization, no-reply follow-up reminders, reply-or-time resurfacing, and background automation through Tasklet;
- **Spark** already offers unified multi-account inbox, Snooze, Set Aside, Reminders, and Mark as Done;
- **Front** currently organizes work into Open/Later/Done, with Later including waiting and snoozed conversations, and supports send-and-snooze follow-up;
- **Notion Mail** will shut down its standalone inbox on 2026-09-22 while preserving Gmail connector/agent email workflows. This is a market fact, **not evidence of why the Product was shut down**.

Detailed source links are preserved in the research artifact.

---

## 5. Initial Product wedge

### 5.1 What the wedge is not

The first wedge is **not** merely:

- “AI tells you what to do”;
- “email becomes tasks”;
- My Turn / Waiting labels;
- a unified inbox;
- a no-reply timer;
- a better Snooze;
- a faster summary;
- a new Done button.

Those are already represented in incumbent/adjacent products.

### 5.2 Strongest current wedge hypothesis

**HYPOTHESIS:**

> **State-aware Attention Delegation:** Lunowa maintains the unresolved communication outcome over time and returns it only when evidence, expected events, timing, risk, or responsibility state has changed enough that the user meaningfully needs attention again.

The important distinction is not simply:

```text
wait X days -> remind
```

or:

```text
any reply -> reopen thread
```

but potentially:

```text
communication changes
  -> update expected state
  -> if user still does not need to act: keep monitoring delegated
  -> if state/time/risk now requires the user: resurface with context and evidence
```

Example hypothesis: if a counterpart replies “Legal has it; we expect approval Friday,” that message may update the expected event without returning the whole loop to active user attention.

**CRITICAL UNKNOWN:** current research does not establish that competitors lack equivalent semantic/stateful monitoring, and rapidly evolving agent products may converge. This is therefore a **differentiation hypothesis to benchmark**, never a uniqueness claim.

### 5.3 The value test

The wedge is meaningful only if the user can say, behaviorally rather than rhetorically:

> “I gave this open communication to Lunowa, I did not keep checking it myself, and it came back when I actually needed it.”

---

## 6. Golden Flow

**HYPOTHESIS:** the end-to-end core loop should eventually prove this behavior:

```text
1. communication creates or changes an unresolved commitment / expected outcome
2. Lunowa derives the current state from authorized evidence
3. only material uncertainty asks the user for correction/confirmation
4. the user acts or delegates waiting/monitoring to Lunowa
5. the loop leaves active attention
6. time passes; the user does not manually re-check it
7. intermediate evidence may update state without unnecessary alerting
8. a meaningful state/time/risk condition makes user attention necessary
9. Lunowa resurfaces: what this is / what changed / why now / evidence / safest next action
10. the user acts, continues waiting, corrects, or closes
11. state reconciles so stale/duplicate reminders do not accumulate
```

**The decisive step is Step 6.** A prototype that makes Step 9 beautiful but never earns Step 6 has not achieved the North Star.

---

## 7. Core jobs to be done

### 7.1 “Know when I actually need to care”

Surface current user obligations rather than requiring the user to infer them from inbox order, unread state, or every incoming reply.

### 7.2 “Hold this for me until it is truly mine again”

Waiting/deferred communication should have a reliable reconsideration/return condition so the user does not carry it mentally.

### 7.3 “Keep track of what outcome we are waiting for”

A sent message should not become operationally invisible merely because it moved to Sent. `Any reply` is not necessarily the same as `the expected outcome happened`.

### 7.4 “When you give it back, restore context immediately”

After the user has genuinely forgotten the loop, the Product should restore enough context to answer: what is this, what changed, why now, what evidence supports it, and what is the safest useful next action?

### 7.5 “Let me verify without making me audit everything”

Source/evidence must remain accessible through progressive disclosure. Verification must not become a permanent parallel inbox.

### 7.6 “Keep ordinary email possible”

Reading, composing, replying, searching, attachments, and navigation should remain familiar where the chosen Product surface requires them, including degraded-intelligence states.

---

## 8. Product experience principles

### 8.1 System-led, not prompt-led

**ACCEPTED:** routine use should not begin with “Ask AI.”

Preferred conceptual flow:

```text
authorized communication evidence changes
  -> candidate meaning/state is interpreted
  -> trusted domain rules update accepted Responsibility state
  -> attention projection changes
  -> user receives prepared context/action only when needed
```

AI should mostly prepare the experience behind the interface rather than turning the user into the prompt engineer for every thread.

### 8.2 AI prepares; human commits

**ACCEPTED:** human final authority remains the default for material external commitments and privileged actions.

The initial Product must not autonomously send/delete mail, approve contracts, make payments, accept high-impact commitments, or perform other destructive/privileged actions merely because a model inferred intent.

### 8.3 No confidence-percentage theater

**ACCEPTED:** do not show model confidence percentages by default as a substitute for evidence or Product logic.

When uncertainty is decision-critical, surface the smallest useful uncertainty/question plus relevant evidence. When harmless, avoid creating model-management work for the user.

### 8.4 Trust ladder

Prefer progressive disclosure:

```text
current conclusion / why attention is needed
  -> short reason / what changed
  -> material provenance
  -> original communication
```

Original sent/received communication remains immutable evidence of what was communicated; interpretations may be corrected without rewriting source evidence.

### 8.5 Manual correction

**ACCEPTED:** explicit user correction can override applicable Lunowa-derived state under the domain authority model without rewriting original communication or silently freezing unrelated fields forever.

---

## 9. Responsibility, Temporal Contract, and Moment — correct Product hierarchy

Detailed semantics remain owned by `docs/product/responsibility/`.

### 9.1 Responsibility is a mechanism, not the raison d'être

**REPOSITORY FACT / CURRENT DIRECTION:** Responsibility is the current canonical semantic concept for a communication-bounded operational obligation / expected-outcome loop.

**PRODUCT RULE:** do not reverse the causal hierarchy.

Wrong:

```text
Responsibility exists -> therefore users need Lunowa
```

Current intended hierarchy:

```text
users need to stop manually monitoring unresolved communication
  -> Product needs a reliable representation of open operational state
  -> Responsibility is the current best candidate model
```

The semantic investment is not proof of Product value. Strong negative Product evidence may narrow, revise, or supersede the model.

### 9.2 Conversation != Responsibility

**ACCEPTED:** a Conversation is evidence context and may contain zero, one, or many Responsibilities. Thread equality is not task/state equality.

### 9.3 User-facing projections

Current vocabulary remains:

- `対応が必要` / My Turn;
- `待ち` / Waiting;
- `あとで` / Later;
- `完了` / Done;
- `確認` / Review when decision-critical ambiguity/safety requires it.

These are deterministic projections, not canonical lifecycle truth, and **the labels themselves are not differentiation**.

### 9.4 Temporal Contract

A Temporal Contract is a durable promise describing when Lunowa will reconsider/resurface a Responsibility. It matters to the Product thesis only if the promise is reliable enough to support delegation, including reconciliation, missed-event recovery, idempotency/timezone correctness, and auditability appropriate to the risk.

### 9.5 Moment

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Moment should be understood primarily as the **context-restoration and safe-action interface at re-entry**. Its value is highest after Lunowa successfully allowed the user not to think about the communication for some period.

Follow-up normally appears as renewed My Turn work after a waiting trigger/condition; it is not a separate canonical lifecycle species.

---

## 10. Differentiation vs table stakes

### 10.1 Remove these from standalone differentiation claims

As of the 2026-08-25 competitor audit, none of the following should be treated as defensible differentiation by itself:

- multiple connected accounts / unified inbox;
- Gmail/Outlook support;
- ordinary compose/reply/forward/search/attachments;
- generic AI summarization;
- generic AI drafting;
- generic AI search;
- task/due-date extraction;
- priority classification;
- `My Turn` / Respond labels;
- `Waiting` labels;
- simple Snooze / Later;
- Done/archive semantics;
- email-to-task transfer;
- generic no-reply follow-up reminders.

They can still be useful, necessary, or table stakes.

### 10.2 Current differentiation hypothesis

**HYPOTHESIS:** differentiation, if it exists, comes from the **quality of trusted stateful attention transfer**, not the existence of individual workflow primitives.

The candidate combination is:

1. system-led understanding of unresolved communication rather than prompt-led processing;
2. a stable Responsibility/expected-outcome representation that can survive multiple messages and time;
3. state-aware reconsideration rather than only message/time triggers;
4. the ability to keep irrelevant/intermediate state changes out of active attention while still updating the loop;
5. reliable resurfacing with `what changed / why now / evidence / next safe action`;
6. provenance, identity/scope clarity, conservative action boundaries, and correction;
7. sufficiently low stale/duplicate/false Review burden to avoid creating a second inbox;
8. recovery/degradation behavior strong enough that reliance is not reckless.

Cross-account/provider aggregation may multiply value for some segments, but it is no longer placed inside the core differentiation definition by default.

### 10.3 Differentiation must survive actual alternatives

The comparison baseline must eventually include the participant's **real workaround stack**, not an artificially weak inbox:

```text
Gmail/Outlook/Spark/etc.
+ Snooze/flag/star
+ Sent-folder checking
+ task/calendar/notes
+ current AI/reminder features
+ CRM/ATS/ticketing where applicable
```

A Lunowa feature is not differentiated because it looks novel in Lunowa. It must materially reduce a behavior/cost relative to what the target user actually does today.

---

## 11. Switching cost and form-factor strategy

### 11.1 Two different switching costs

**INFERENCE:** separate:

1. **surface/replacement switching cost** — adopting another mail client, learning UI, provider parity, mobile availability, migration/habit cost;
2. **delegation/trust switching cost** — allowing Lunowa to decide when the user does or does not need to monitor a communication loop.

A companion/in-client surface can reduce (1). It cannot eliminate (2), because (2) is the core value transfer.

### 11.2 Current form-factor rule

**HYPOTHESIS / OPEN:** do not freeze full-client replacement as a Product requirement before evidence shows it is needed.

The standalone responsive-web shell remains a valid experimental/implementation direction, and a credible full client remains a possible long-term Product. But Product validation should be able to change the surface strategy if Attention Delegation is better delivered with lower replacement friction.

### 11.3 Notion Mail is a signal, not a causal lesson

Notion's announced 2026-09-22 shutdown of the Notion Mail inbox while preserving connector/agent email workflows reinforces the need to keep form factor falsifiable. **Do not infer the cause of the shutdown from this fact.**

---

## 12. Trust, reliability, and failure economics

### 12.1 Trust is not a supporting feature; it gates the core value

**INFERENCE from external cognitive evidence:** users may continue internal monitoring until external support earns reliability. Therefore:

```text
reasonable-looking automation
+ user still checks “just in case”
= Product failure for Attention Delegation
```

### 12.2 The trust paradox

Two failures can destroy value:

- **false negative / missed obligation:** Lunowa hides or omits something that truly required user attention;
- **false positive / stale burden:** Lunowa resurfaces irrelevant, already-completed, outdated, or low-value items so often that the user must manage Lunowa itself.

A giant Review queue is not a safe solution if it recreates the monitoring burden.

### 12.3 Reliability creates dependency

Prospective-memory research suggests that after reliable offloading, sudden removal can impair performance. Product implications include:

- durable scheduling/reconsideration;
- missed-event recovery;
- reconciliation with provider truth;
- clear degraded states;
- preserving source evidence;
- avoiding silent loss during outages/model failures;
- making boundaries explicit before the user is encouraged to rely.

These remain implementation-dependent promises, but the *need for them* is Product-level.

---

## 13. Initial Product scope

### 13.1 Scope objective

Initial scope should be the smallest surface capable of falsifying the Attention Delegation thesis and its necessary trust/context-restoration mechanisms — not the smallest credible Gmail clone.

### 13.2 KEEP

Keep as current Product direction / important mechanisms:

- North Star and `Eliminate work, not control`;
- system-led intelligence;
- source/provenance visibility;
- explicit sender/account/scope identity;
- human final authority for material external action;
- Conversation != Responsibility;
- Responsibility as current candidate semantic model;
- My Turn / Waiting / Later / Done / Review projections as UX mechanisms;
- Temporal Contract concept;
- Moment as re-entry/context-restoration interface;
- safe degraded behavior/reconciliation;
- validation before broad provider/AI/persistence integration;
- ordinary email familiarity where the chosen surface needs ordinary mail behavior.

### 13.3 CHANGE

Change the previous emphasis:

- Product identity -> **email-first Attention Delegation**, not “new email client” as the reason to exist;
- problem hierarchy -> Monitoring/attention maintenance leads the causal hypothesis;
- Responsibility/Moment -> mechanisms serving the Product thesis, not evidence the thesis is true;
- differentiation -> trusted state-aware attention delegation, not labels/reminders/unified view;
- cross-account -> optional multiplier/segment hypothesis rather than core differentiation;
- full-client parity -> delivery/form-factor hypothesis rather than pre-validation requirement;
- retention -> reliance/self-check reduction in addition to conventional business retention;
- validation -> immediate comparative UX and longitudinal safe-forgetting are separate gates.

### 13.4 DEFER

Unless a direct validation need proves otherwise:

- Microsoft/second-provider breadth;
- cross-account centrality if the chosen segment does not need it;
- full provider/mailbox parity;
- broad person/company/relationship context;
- broad settings/onboarding completeness;
- full native-mobile/tablet fidelity;
- production AI/persistence/runtime breadth before the relevant Product gate;
- generic automation/rule-builder/CRM/workflow expansion;
- travel/subscription/location/time-of-day convenience directions.

### 13.5 REMOVE FROM DIFFERENTIATION CLAIM — not necessarily Product removal

Remove as standalone differentiation claims:

- unified inbox / multi-account;
- AI summary/drafting/search;
- task/due extraction;
- priority classification;
- My Turn/Waiting labels;
- Snooze/Later;
- Done;
- generic no-reply reminder;
- email-to-task transfer.

---

## 14. MVP and Product-validation logic

### 14.1 Current fake-data prototype remains useful — with a narrower claim

**CURRENT DIRECTION:** the high-fidelity fake-data comparative prototype remains a rational early experiment because it can cheaply test whether the current Responsibility/Moment UX reduces immediate reconstruction/navigation/decision burden and whether provenance/control are understandable.

It does **not** validate the full North Star or Attention Delegation thesis because a short fake-data session cannot prove that the user stopped monitoring something for real days/weeks.

### 14.2 Relationship to GitHub Issue #26

Issue #26 remains the current mechanism-level comparative Product-learning gate. Interpret its result correctly:

- it can support/weaken the Responsibility/Moment interaction model;
- it can test state comprehension, source trust, reconstruction, navigation, and one-primary-action behavior;
- it cannot by itself establish longitudinal safe forgetting, reliance, switching, retention, or WTP;
- H4/cross-account may be de-scoped if not needed for the first wedge.

Do not close the epistemic gap from “prototype is better” to “users will delegate monitoring” by assertion.

### 14.3 Stronger evidence ladder

**NEEDS VALIDATION:**

```text
A. recent-event/workflow evidence
   real segment has frequent/costly monitoring loops and identifiable workarounds
  ->
B. comparative mechanism prototype
   Responsibility/Moment/state UX reduces immediate reconstruction/decision burden
  ->
C. longitudinal concierge / limited real-inbox pilot
   user actually delegates loops and reduces manual self-checking across days/weeks
  ->
D. reliability/freshness/recovery proof in realistic use
   stale/duplicate/missed-state burden stays below the value created
  ->
E. form-factor/switching evidence
   user adopts the surface and reduces dependence on old workflow
  ->
F. continued reliance / retention / WTP/payment evidence
```

Each arrow requires evidence. Do not infer later rungs from earlier success.

### 14.4 Cheapest-test rule

When Product uncertainty blocks a large implementation decision, prefer the smallest experiment that can falsify the highest-impact assumption: recent-event interview/artifact walkthrough, prototype, concierge/manual operation, limited live-inbox slice, form-factor test, or payment-intent behavior before integration breadth.

---

## 15. Product success and metrics

No single metric is frozen. Optimize for the Product promise rather than engagement theater.

### 15.1 Immediate mechanism metrics

Useful for comparative prototype/scenario tests:

- `T_action`: time to correct next meaningful action/state;
- `N_reread`: thread/message rereads/backtracking;
- `N_nav`: meaningful navigation/account-switch operations;
- `N_transfer`: manual transfer/copy-to-task behavior;
- `Correct_state`;
- `Source_recheck`;
- comprehension of `why here now?`;
- correction/Review burden.

### 15.2 Longitudinal Attention Delegation metrics

Candidate stronger metrics:

- `N_self_check` — manual source/inbox/Sent checks before expected Lunowa resurfacing;
- proportion of eligible loops the user is willing to delegate;
- proportion of delegated loops manually rechecked before resurfacing;
- correct-resurfacing rate;
- false/obsolete/duplicate-resurfacing burden;
- missed material obligation rate;
- correction/Review burden per delegated loop;
- context-restoration time after a real waiting period;
- continued delegation across later days/weeks;
- reversion to previous manual monitoring behavior.

### 15.3 Retention concept: Reliance without vigilance

**HYPOTHESIS:** the most Product-aligned retention state is not necessarily “opens Lunowa every day.” A successful system may reduce unnecessary inbox checking.

Internal shorthand:

> **Reliance without vigilance** — the user repeatedly entrusts eligible communication to Lunowa without maintaining a parallel checking habit.

Standard retention/conversion/revenue metrics still matter. This principle only prevents optimizing DAU in a way that contradicts the North Star.

### 15.4 Safety-quality balance

A false negative on a material obligation is especially dangerous, but indiscriminately routing uncertainty to Review can recreate an inbox. Validation must characterize both sides instead of optimizing one metric blindly.

---

## 16. Biggest current unknown

The highest-impact unresolved Product question is now:

> **Can Lunowa become reliable and context-correct enough that a coherent, reachable user segment actually stops self-monitoring important email-mediated communication loops — and is that relief valuable enough to adopt and pay for despite incumbent alternatives?**

Sub-unknowns:

- Which segment has the highest combination of concurrent open loops, other-party dependency, variable waiting latency, and failure cost without an adequate system of record?
- Is semantic/state-aware reconsideration materially more useful than timer/no-reply workflows?
- Can Lunowa keep stale/duplicate/false Review burden low enough to earn trust?
- How much of the value requires a full mail client versus a lower-friction companion/assistant surface?
- Does cross-account attention materially amplify value for the winning segment?
- What level of reliability/freshness is required before users stop checking manually?
- Is the resulting value strong enough for continued reliance and payment?

---

## 17. Monetization and distribution

### 17.1 Monetization

**HYPOTHESIS:** a paid individual/prosumer/professional subscription remains plausible if Lunowa measurably reduces recurring monitoring/reconstruction cost or material follow-up failures.

**UNKNOWN:** exact price, free tier, trial shape, packaging, individual-vs-business plan, and willingness to pay.

Do not derive price from competitor price matching alone. Payment behavior/value evidence from the chosen segment is required.

### 17.2 Distribution

**UNKNOWN:** no acquisition/distribution channel is proven.

The ICP must be reachable, not merely theoretically painful. Segment research should therefore evaluate both problem density and reachable distribution.

### 17.3 Retention

**UNKNOWN:** repeated reliance across real waiting periods is not yet demonstrated. Novelty, attractive UI, or a one-session burden reduction is not retention evidence.

---

## 18. Trust, safety, and autonomy boundaries

Product-level rules not to weaken casually:

- requested action is not automatically the safe next action;
- original communication/source remains inspectable;
- model confidence is not authority;
- user correction remains explicit/scoped where relevant;
- sending account/scope is explicit before sending;
- send click is not provider-reconciled acceptance;
- ordinary reading/composing/search/navigation remains usable where required when intelligence fails;
- prompt/tool-like text in email is untrusted content and gains no system authority;
- search/retrieval/AI context is authorization-filtered before exposure;
- cross-account semantic similarity does not authorize Responsibility merge;
- high-impact external actions retain human confirmation by default;
- missed-event/reconciliation/degraded-state behavior must be designed consistently with any promise that users can stop monitoring themselves.

---

## 19. Important supersessions / refinements

### 19.1 `ActionItem` -> `Responsibility`

`Responsibility` remains the current canonical semantic concept; older message-level `ActionItem` framing is superseded.

### 19.2 Responsibility as Product thesis -> Responsibility as mechanism

The Product no longer centers “Responsibility exists” as the reason to adopt Lunowa. Responsibility is the current candidate internal model serving **Attention Delegation**.

### 19.3 Flat burden model -> monitoring-led causal model

Monitoring, interpretation, execution, and verification remain valid dimensions, but current evidence puts ongoing attention maintenance/open-loop monitoring at the leading causal position for the first wedge.

### 19.4 Single lifecycle state -> orthogonal state

The old monolithic lifecycle model remains superseded. My Turn / Waiting / Later / Done / Review are projections over orthogonal canonical state.

### 19.5 Follow-up as lifecycle -> follow-up as action/reason

Follow-up normally becomes renewed My Turn after the appropriate trigger/condition.

### 19.6 Ask-AI-centric -> system-led intelligence

Routine users should not need to prompt AI to organize ordinary communication.

### 19.7 Unified inbox/cross-account as differentiation -> table stake / segment multiplier

Plain aggregation is table stakes. Cross-account Attention Delegation may matter for some segments but is not assumed to be the core wedge.

### 19.8 Full mail client as implicit Product requirement -> form-factor hypothesis

Current web/client work remains useful, but full-client replacement must earn its switching cost through evidence.

### 19.9 Provider/AI-first implementation -> Product evidence first

Provider/AI/persistence breadth remains downstream of the smallest Product tests able to retire the highest uncertainty.

---

## 20. Deferred exploratory directions

Earlier exploration has included:

- relationship/person-history maps beyond lightweight context;
- subscription/billing-email management;
- travel/itinerary bundling;
- location/context-aware work/personal switching;
- morning/time-of-day organization rules;
- generic automation/workflow expansion.

These remain **DEFERRED / NOT VALIDATED**. Reintroduce only if core Attention Delegation is supported and the direction solves a demonstrated problem better than simpler alternatives.

---

## 21. Technical/domain routing — do not duplicate authority

- Responsibility status/semantics: `docs/product/responsibility/README.md`;
- exact L2 candidate: `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md`;
- executable freeze gate: `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md`;
- conceptual data model: `docs/product/DATA-MODEL.md`;
- architecture: `docs/product/ARCHITECTURE.md`;
- module contracts: `docs/product/CONTRACTS.md`;
- technology stack: `docs/product/TECH-STACK.md`;
- implementation order: `docs/product/IMPLEMENTATION-PLAN.md`;
- detailed UX: `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md`;
- external Product evidence: `docs/product/research/`;
- live task/review state: current GitHub Issues/PRs/CI.

Do not copy detailed schemas/Responsibility oracles into this Product thesis.

---

## 22. Decision rule

When a future Product decision is ambiguous, prefer the option that most increases the probability of this observable outcome:

> **A real user delegates a real unresolved communication loop, stops spending attention monitoring it, and receives it back at the correct moment with enough evidence/context to act safely — without Lunowa creating a new reminder/review burden.**

Evaluate proposed work by asking whether it:

1. reduces manual monitoring/self-checking;
2. reduces reconstruction at re-entry;
3. preserves source/provenance and user authority;
4. improves state freshness/correctness enough to increase trust;
5. avoids stale/duplicate/Review burden;
6. reduces rather than adds switching cost where possible;
7. supports safe recovery/degradation once users rely on it;
8. addresses a real problem in a coherent/reachable segment;
9. is supported by evidence rather than sunk-cost protection;
10. keeps differentiation claims current against 2026 competitors;
11. avoids infrastructure/feature breadth unsupported by the current learning need;
12. uses the **smallest/cheapest experiment that can falsify the highest-impact unresolved Product assumption** before broad implementation.

If stronger evidence changes a Product-level decision, update this document and the owning canonical design/domain/architecture artifact in the same accepted change where applicable.
