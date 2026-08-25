# Communication Attention Delegation — External Evidence Audit

**Research cutoff:** 2026-08-25  
**Purpose:** Re-evaluate what problem Lunowa should exist to solve, what initial value it should try to make unusually strong, which parts of the current Product model are evidence-aligned versus solution assumptions, and what current competitors have already commoditized.

This artifact is an **evidence input**, not Product authority. `docs/product/PRODUCT.md` owns the current synthesis.

---

## 1. Evidence classification

Use these labels strictly:

- **EXTERNAL EVIDENCE** — directly supported by a cited external source.
- **REPOSITORY FACT** — current Lunowa repository state/decision, not market evidence.
- **INFERENCE** — conclusion derived from multiple evidence points; plausible but not directly observed as a Lunowa outcome.
- **PRODUCT HYPOTHESIS** — a falsifiable bet Lunowa may test.
- **UNKNOWN** — material question not established by available evidence.

No source below proves Lunowa-specific demand, product-market fit, willingness to pay, switching, or retention.

---

## 2. What the research supports about the problem

### 2.1 Email has long been used as an unintended task/reminder system

**EXTERNAL EVIDENCE.** Whittaker & Sidner's CHI 1996 study documented email being used not only for communication but also task management and personal information management; outstanding tasks remained in the inbox and could be overlooked or lost after filing.

Source: Steve Whittaker & Candace Sidner, *Email Overload: Exploring Personal Information Management of Email* (CHI 1996), https://dl.acm.org/doi/10.1145/238386.238530

**EXTERNAL EVIDENCE.** Bellotti et al. found that overload was not only a quantity problem. Email became especially difficult when tasks involved other people: work could not be completed until a response arrived, multiple incomplete tasks became interleaved, and users had to keep track of them, often with an email in an inbox/folder as the practical reminder.

Source: Victoria Bellotti et al., *Quality Versus Quantity: E-Mail-Centric Task Management and Its Relation With Overload* (Human-Computer Interaction, 2005), https://doi.org/10.1080/07370024.2005.9667362

**INFERENCE.** The more useful abstraction for Lunowa is therefore not “many messages” but **many incomplete asynchronous communication loops whose state must remain recoverable over time**.

### 2.2 Modern AI reminders confirm the problem but also expose the failure mode

**EXTERNAL EVIDENCE.** Morrison, Iqbal & Horvitz studied Microsoft knowledge workers using an AI-powered email reminder system. Their 2024 CSCW paper explicitly treats email as a continuing medium for managing collaboration and commitments embedded in free-flowing communication. Participants valued reminders for tasks they had forgotten or missed, but inaccurate/out-of-date recommendations and tasks already completed or already tracked elsewhere reduced value. The paper also reports that interaction with the system was associated with work styles that communicate about tasks via email and create tasks from received/sent emails; the authors explicitly caution that more work is needed to characterize value and call for longitudinal study.

Primary source: Katelyn Morrison, Shamsi T. Iqbal, Eric Horvitz, *AI-Powered Reminders for Collaborative Tasks: Experiences and Futures* (PACM HCI, CSCW1, 2024), https://doi.org/10.1145/3653701

**INFERENCE.** A reminder system does not win merely by finding more possible tasks. It has to maintain **freshness, state correctness, and non-duplication** well enough that the reminder layer does not become another inbox to manage.

### 2.3 Cognitive-offloading research supports “safe forgetting” as a mechanism — with strict limits

**EXTERNAL EVIDENCE.** Prospective-memory research finds that external reminders can improve delayed-intention performance, especially under higher cognitive load. Peper et al. found greater reminder benefit under high load and found target-plus-action reminders effective where partial reminders were not.

Source: Phil Peper, Durna Alakbarova, B. Hunter Ball, *Benefits from prospective memory offloading depend on memory load and reminder type* (JEP:LMC, 2023), https://doi.org/10.1037/xlm0001191

**EXTERNAL EVIDENCE.** Dupre & Ball (published 2026-08-18) tested reminder reliability in a student laboratory population (N=320). In the first session, reminders improved performance without reducing thoughts about the future intention. After participants experienced reliable external support, the 100%-reliable condition showed reduced intention-related thought and greater attention to the ongoing task; performance worsened when the reliable reminders were unexpectedly withdrawn.

Source: Connor Dupre & B. Hunter Ball, *Let it go: How trusted reminders alter intention maintenance* (Psychonomic Bulletin & Review, 2026), https://doi.org/10.3758/s13423-026-02985-6

**EXTERNAL EVIDENCE.** Fellers & Storm (2026) similarly found that offloading improved performance while reminders were available, but previously offloaded prospective-memory performance fell below the no-reminder baseline after reminder removal.

Source: Craig Fellers & Benjamin C. Storm, *Offloading reduces prospective memory learning* (JEP:LMC, 2026), https://doi.org/10.1037/xlm0001630

**LIMITATION.** These are prospective-memory laboratory findings, not direct evidence that professionals will delegate email monitoring to Lunowa. They support a cognitive mechanism; they do not prove market demand or the exact UX.

**INFERENCE.** “Safe forgetting” should not mean “a reminder exists.” The stronger mechanism is:

```text
reliable external monitoring experienced over time
  -> trust in the external store
  -> less internal maintenance / less self-checking
  -> attention available for current work
```

The same evidence also makes failure after trust especially dangerous. Recovery, reconciliation, provenance, and graceful degradation are therefore Product-level promises, not merely backend quality concerns.

---

## 3. Current alternatives already cover much of the obvious solution space

The following are **current feature facts as of 2026-08-25**, not evidence that the products solve Lunowa's full hypothesized problem.

### 3.1 Gmail

**EXTERNAL EVIDENCE / CURRENT PRODUCT FACT.** Gmail AI Inbox is in beta and surfaces Suggested to-dos from high-priority incoming email, explains what needs to be done, can expose due-date-like information, links to relevant sources, and supports View/Reply/Mark done. It also summarizes topics across messages.

Source: Google Gmail Help, *Manage to-dos & topics with AI Inbox*, https://support.google.com/mail/answer/16845247

**IMPLICATION.** Priority detection, task extraction, due-date extraction, summary, source linking, reply entry points, and “Done” are not credible standalone differentiation claims.

### 3.2 Superhuman Mail / Email Assistant

**EXTERNAL EVIDENCE / CURRENT PRODUCT FACT.** Superhuman supports automatic reminders for sent messages that have not received a reply and can use AI to determine which outgoing messages need follow-up. Its Email Assistant can operate directly in existing Gmail/Outlook rather than requiring a user to adopt the full Superhuman client. It also applies labels such as Respond/Waiting and prepares follow-up/reply drafts.

Sources:
- https://help.superhuman.com/hc/en-us/articles/46005792082445-Follow-Up-Faster
- https://help.superhuman.com/hc/en-us/articles/46005854346893-Email-Assistant-by-Superhuman-Mail-Gmail
- https://help.superhuman.com/hc/en-us/articles/46183302401933-Email-Assistant-by-Superhuman-Mail-Outlook

**IMPLICATION.** `Respond`, `Waiting`, AI follow-up detection, no-reply resurfacing, and automatic follow-up drafts are already direct competitive territory. A full-client requirement also creates a switching cost that an in-client assistant can avoid.

### 3.3 Shortwave

**EXTERNAL EVIDENCE / CURRENT PRODUCT FACT.** Shortwave supports follow-up reminders that can return a sent thread when a response arrives or at a scheduled reminder time, todos inside email, AI organization, and Tasklet-based background email automation.

Sources:
- https://www.shortwave.com/docs/migrations/migrating-from-superhuman/
- https://www.shortwave.com/docs/guides/ai-assistant/
- https://www.shortwave.com/changelog/

**IMPLICATION.** Email-to-task conversion, AI triage, generic reminders, and simple event-or-time resurfacing are crowded.

### 3.4 Spark

**EXTERNAL EVIDENCE / CURRENT PRODUCT FACT.** Spark's current product includes unlimited accounts, Unified Inbox, Smart Inbox, Snooze, Set Aside, Reminders, and Mark as Done; paid tiers add AI features.

Sources:
- https://sparkmailapp.com/pricing
- https://sparkmailapp.com/features

**IMPLICATION.** Multi-account unification, Snooze/Later-like behavior, reminders, and Done are table stakes rather than a wedge.

### 3.5 Front

**EXTERNAL EVIDENCE / CURRENT PRODUCT FACT.** Front's 2026 inbox organizes individual work into `Open`, `Later`, and `Done`; `Later` includes snoozed and waiting conversations. Front also supports send-and-snooze follow-up flows.

Sources:
- https://help.front.com/en/articles/3889728
- https://help.front.com/en/articles/2088

**IMPLICATION.** User-facing state vocabulary close to My Turn/Later/Done/Waiting is not unique. Team/shared-inbox segments also face mature specialized competition.

### 3.6 Notion Mail form-factor signal

**EXTERNAL EVIDENCE / CURRENT PRODUCT FACT.** Notion states that the Notion Mail inbox will shut down on 2026-09-22, while Gmail AI Connector and agent email tools continue.

Source: https://www.notion.com/help/notion-mail-inbox-is-going-away-what-to-do-next

**LIMITATION.** This does **not** establish why Notion made that decision and does not prove that assistant/agent form factors outperform standalone clients. It is only a current market fact that reinforces the need to treat Lunowa's delivery surface as a Product hypothesis rather than an article of faith.

---

## 4. What should no longer be treated as differentiation by itself

**INFERENCE, based on the current competitor audit:** the following may remain useful features or mechanisms but should not carry Lunowa's differentiation claim individually:

- generic AI summary;
- generic drafting/reply assistance;
- task or due-date extraction from mail;
- `My Turn` / `Respond` labels;
- `Waiting` labels;
- generic “if no reply by X” reminders;
- simple Snooze / Later;
- Done/archive semantics;
- email-to-task transfer;
- unified inbox / multiple accounts;
- generic priority classification;
- generic AI search.

This list is not a removal list. It separates **table stakes/mechanisms** from the Product wedge.

---

## 5. Strongest current problem synthesis

### 5.1 Causal model

**INFERENCE:** the best evidence-consistent causal model is:

```text
asynchronous, interdependent communication
  -> multiple unresolved communication loops
  -> delay + interruptions + context changes
  -> user must preserve “who owes what / what are we waiting for / when do I care again?”
  -> mental monitoring + inbox/sent re-checking + flags/snoozes/tasks/manual notes
  -> repeated reconstruction and navigation when the item is revisited
  -> verification burden when automation cannot be trusted
```

The four existing Lunowa burdens remain useful, but they should not be treated as causally flat. **Monitoring/attention maintenance is the current leading problem hypothesis; reconstruction, execution, and verification interact with it.**

### 5.2 Strongest current Product purpose hypothesis

**PRODUCT HYPOTHESIS:**

> Lunowa exists to let people delegate the monitoring of unresolved asynchronous communication, so they can stop carrying those open loops in working memory and stop repeatedly checking them, while still regaining the right context and control when their attention is genuinely needed.

Short internal name: **Attention Delegation** / **Open-loop Monitoring Offload**.

### 5.3 Strongest current first-value/wedge hypothesis

Generic waiting/no-reply management is too weak. The sharper candidate is:

> **State-aware Attention Delegation:** maintain the expected communication outcome over time and resurface only when the evidence, expected event, timing, risk, or responsibility state has changed enough to require the user.

This is intentionally different from only:

```text
wait X days -> remind
```

or:

```text
any reply arrives -> return thread
```

An intermediate reply can update the loop without necessarily creating user work. Example: “Legal has it; expect an answer Friday” may update the expected event while keeping attention delegated.

**UNKNOWN / CRITICAL CAUTION:** this research did not establish that no current competitor can implement or already implements equivalent semantic monitoring. Custom agents/automation systems may converge quickly. Treat this as a differentiation hypothesis to benchmark, not a uniqueness claim.

---

## 6. WHO — strongest characteristic-based hypothesis

**PRODUCT HYPOTHESIS:** likely early fit is determined more by workflow characteristics than job title.

Higher-fit characteristics:

- email carries real work commitments rather than mostly notifications/newsletters;
- many tasks depend on replies, approvals, confirmations, documents, decisions, or actions by other people;
- several such loops remain unresolved concurrently;
- waiting periods are variable enough that “remember it later” is non-trivial;
- missing or late action has meaningful cost;
- the user personally tracks the loops rather than delegating them to an assistant;
- the user already rechecks Inbox/Sent, flags/stars/snoozes, or creates tasks from email;
- no CRM/ATS/ticketing/project system already provides an adequate system of record for the loop;
- the user has enough autonomy to try an assistant/companion/client.

Candidate examples may include hands-on independent professionals, consultants, agency/client-service operators, business-development/partnership work, and operational coordinators. These examples are **not validated ICPs**.

Lower-priority/disqualifying characteristics:

- high mail volume but little actionable/interdependent work;
- newsletters/automated notifications dominate;
- a CRM/ATS/ticketing system already owns the relevant workflow reliably;
- work is mostly synchronous or already coordinated in a shared structured tool;
- most tracking is delegated to an assistant/team process;
- third-party mail access cannot be authorized.

**UNKNOWN:** exact segment concentration, reachable distribution, severity, willingness to switch, and willingness to pay remain unvalidated.

---

## 7. The Golden Flow implied by the evidence

**PRODUCT HYPOTHESIS:** the core experience should eventually prove this loop, not merely a faster first-read UI:

```text
1. communication creates or changes an unresolved commitment / expected outcome
2. Lunowa derives the current state from authorized evidence
3. only material uncertainty asks for correction/confirmation
4. user acts or delegates the waiting/monitoring to Lunowa
5. the item leaves active attention
6. days may pass without the user manually re-checking it
7. intermediate evidence may update state without unnecessary alerting
8. a meaningful state/time/risk condition requires the user again
9. Lunowa resurfaces: what this is / what changed / why now / source / safest next action
10. user acts, continues waiting, corrects, or closes
11. state is reconciled so stale/duplicate reminders do not accumulate
```

The differentiating moment, if this thesis is correct, is **Step 6**: the user really did not need to monitor the communication themselves.

---

## 8. Implications for Responsibility, Temporal Contract, and Moment

### Responsibility

**REPOSITORY FACT:** Responsibility is the current canonical semantic model in `docs/product/responsibility/`.

**PRODUCT SYNTHESIS:** Responsibility should be treated as the current best internal mechanism for representing an unresolved communication obligation/expected-outcome loop — **not as the reason the Product exists**. Negative Product evidence must be allowed to narrow or supersede the mechanism without protecting it as sunk cost.

### Temporal Contract

A Temporal Contract aligns with the Product promise only if it means more than a local timer: it must describe when Lunowa will reconsider/resurface responsibility, with durable execution/reconciliation sufficient to justify user trust.

### Moment

Moment is most compelling as a **context-restoration interface after attention has been delegated**. Its value is not “pretty summary”; it should minimize reconstruction at the moment the system gives the loop back to the user.

---

## 9. Switching cost has two independent parts

**INFERENCE:**

1. **Surface/replacement switching cost** — learning/adopting another mail client, changing habits, provider parity, mobile availability, etc. This may be reduced by an in-client/companion/overlay form factor.
2. **Delegation/trust switching cost** — believing the system enough to stop self-monitoring. This cannot be designed away because it is the core value transfer.

Therefore the Product must not optimize only for “convince the user to open Lunowa.” The harder bar is “convince the user they no longer need the old checking behavior for delegated loops.”

**PRODUCT HYPOTHESIS:** standalone mail client vs companion/in-client assistant vs other surface should remain an empirical form-factor decision until the core value requires one form.

---

## 10. Retention implication: reliance can matter more than activity

**INFERENCE:** raw DAU/number of opens can conflict with the North Star. If Lunowa succeeds, users may check email **less**.

Candidate outcome/retention concepts:

- share of eligible communication loops intentionally delegated to Lunowa;
- `N_self_check`: manual source/inbox checks before Lunowa's expected resurfacing;
- proportion of delegated loops that resurface correctly;
- false/obsolete/duplicate resurfacing rate;
- missed material obligation rate;
- correction/Review burden;
- time/context reconstruction after resurfacing;
- continued reliance across real waiting periods;
- non-reversion to previous manual monitoring behavior.

Internal shorthand: **Reliance without vigilance**.

This does not eliminate standard commercial retention metrics; it prevents optimizing engagement in a way that contradicts the Product promise.

---

## 11. Validation implications

### Current prototype test

GitHub Issue #26 remains useful for testing **mechanism-level comparative value** such as reconstruction, navigation, source trust, state comprehension, and Moment interaction. A fake-data session cannot establish days/weeks of safe forgetting.

### Stronger evidence ladder

```text
A. recent-event/workflow evidence that the monitoring problem is frequent and costly in a coherent segment
  -> B. comparative prototype: state/Moment reduces immediate reconstruction and decision burden
  -> C. longitudinal concierge or limited real-inbox pilot: user actually stops self-checking delegated loops
  -> D. reliability/freshness/recovery survives enough real cases to earn trust
  -> E. form-factor/switching behavior
  -> F. repeated reliance, retention, WTP/payment behavior
```

Do not infer C–F from a PASS at B.

### Biggest current unknown

> **Can Lunowa become reliable and context-correct enough that a coherent, reachable user segment actually stops self-monitoring important email-mediated communication loops — and is that relief valuable enough to adopt and pay for despite incumbent alternatives?**

This is more decision-relevant than “Can Responsibility/Moment be implemented?” or “Do users like the UI?”.

---

## 12. Scope implications from this audit

### KEEP

- North Star: “必要になるまで安心して忘れられ…”;
- `Eliminate work, not control`;
- source/provenance visibility;
- human final authority for material external action;
- safe degradation/reconciliation;
- Conversation != Responsibility;
- Responsibility as the current candidate semantic mechanism;
- Temporal Contract concept;
- Moment as context-restoration/action interface;
- Product validation before broad provider/AI/persistence integration.

### CHANGE

- Product identity: from primarily “communication-management email client” toward **email-first attention delegation for asynchronous communication**;
- problem hierarchy: Monitoring/attention maintenance becomes the leading causal burden hypothesis rather than one flat burden among four;
- Responsibility/Moment: mechanism serving the thesis, not the thesis itself;
- differentiation: state-aware trusted attention delegation, not the mere presence of labels/reminders/cross-account UI;
- full-client scope: delivery form is a hypothesis, not a prerequisite for validating core value;
- validation: explicitly separate immediate comparative UX proof from longitudinal safe-forgetting/reliance proof;
- retention: measure reliance/self-check reduction as well as normal business retention.

### DEFER

Until core attention delegation is supported by evidence:

- cross-account/provider centrality unless the chosen segment proves it essential;
- full mailbox/provider parity beyond what a test requires;
- broad person/company context surfaces;
- broad settings/onboarding completeness;
- full mobile/tablet fidelity;
- production AI/persistence/runtime breadth;
- generic automation/CRM/workflow expansion;
- travel/subscription/context-aware convenience expansions.

### REMOVE FROM DIFFERENTIATION CLAIM — not necessarily from the product

- generic AI summarization/drafting/search;
- generic task/due extraction;
- My Turn/Respond label;
- Waiting label;
- no-reply reminder;
- Snooze/Later;
- Done;
- unified/multi-account inbox;
- email-to-task transfer;
- generic priority classification.

---

## 13. Evidence limitations / reasons not to overclaim

- Bellotti/Whittaker establish enduring problem structure but are old studies; contemporary workflows include Slack/Teams/CRMs/agents unavailable then.
- Morrison et al. studies one Microsoft reminder system with a small validation sample and self-assessed work-style measures; it is evidence about mechanism/workflow, not population-level ICP sizing.
- Prospective-memory findings support cognitive offloading mechanisms but are not email-product trials.
- Vendor documentation establishes current feature availability, not competitor effectiveness or user satisfaction.
- Absence of a documented competitor feature is not proof of absence; agentic products are changing rapidly in 2026.
- Notion Mail's shutdown is a fact, not evidence of its cause.
- No source reviewed here proves that users will pay Lunowa, abandon existing checking behavior, or prefer a standalone client.

---

## 14. Research-derived decision rule

Do not ask whether a feature looks advanced. Ask whether it contributes to this causal outcome:

> **The user delegates a real unresolved communication loop, stops spending attention on monitoring it, and receives it back at the correct moment with enough evidence/context to act safely — without creating a new review/reminder burden.**

If a proposed feature does not materially improve that outcome, satisfy necessary email table stakes, or retire a safety/trust blocker, it should not be allowed to expand initial scope without new evidence.
