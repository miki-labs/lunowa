# Lunowa Product Thesis and Product Contract

## Status

**Current durable Product-intent baseline for Lunowa.**

This document owns the highest-level Product contract:

- what problem Lunowa exists to solve;
- what user behavior it tries to change;
- what first wedge is currently strongest;
- who may have the strongest problem;
- what is table stakes versus differentiation;
- how Responsibility / Temporal Contract / Moment relate to the user outcome;
- what evidence is required before implementation breadth;
- what remains unknown.

It deliberately does **not** replace more detailed authorities:

- `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` own detailed UX/interaction behavior;
- `docs/product/responsibility/` owns canonical Responsibility semantics and persistence-proof status;
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md` own engineering boundaries;
- `docs/product/TECH-STACK.md` + accepted ADRs own concrete technology choices;
- `docs/product/IMPLEMENTATION-PLAN.md` owns implementation/evidence sequence;
- GitHub Issues/PRs/CI own live task/candidate/review state;
- `docs/continuity/CURRENT.md` is only the mutable checkpoint/router;
- `docs/product/research/` contains dated evidence artifacts and does not become Product truth merely by existing.

This document distinguishes:

- **ACCEPTED** — current Product direction or safety/authority principle;
- **EXTERNAL EVIDENCE** — supported by cited research/current market evidence, but not proof of Lunowa Product-market fit;
- **INFERENCE** — current reasoning derived from evidence;
- **HYPOTHESIS** — current best Product explanation/direction still requiring validation;
- **UNKNOWN / NEEDS VALIDATION** — material unresolved Product question;
- **DEFERRED** — intentionally outside the current learning target;
- **SUPERSEDED** — prior framing that should not silently return.

A hypothesis is not promoted to market fact merely because it appears in this canonical file.

### Current evidence reviews

The current Product thesis was first reframed around communication monitoring on **2026-08-26**, then tightened the same day after a broader current-market / ICP / agent-reliability review.

Read:

- `docs/product/research/communication-monitoring-evidence-2026-08.md` — first evidence review;
- `docs/product/research/product-frontier-and-icp-evidence-2026-08-26.md` — current competitive-frontier / ICP correction.

The second review materially changes **ICP prioritization and differentiation discipline**, but does not reject the North Star or the `Open-loop Monitoring Offload` problem/wedge hypothesis.

---

# 1. What Lunowa is for

## 1.1 Vision

**ACCEPTED / ASPIRATIONAL:** Lunowa aims to create the most comfortable email experience possible — internally expressed as:

> **世界一快適なメール体験**

This is vision, not a measurable market claim or release acceptance criterion.

## 1.2 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

This remains the highest-level Product direction.

## 1.3 Current one-sentence Product definition

**CURRENT STRONGEST PRODUCT THESIS:**

> **Lunowa is a communication-monitoring product delivered through email: it tries to keep unresolved communication loops under control on the user's behalf so the user can stop repeatedly remembering, checking, and reconstructing them until attention is genuinely required again.**

A slightly stricter expression is:

> **Lunowa tries to make heterogeneous email-borne commitments and dependencies safe to stop monitoring manually.**

`Heterogeneous` matters: the strongest candidate problem is not one rigid sales/support pipeline, but open communication that crosses different people, outcomes, dates, documents, approvals, questions, commitments, and waiting conditions.

## 1.4 What Lunowa is not primarily

Lunowa is not primarily:

- an inbox skin;
- an Inbox Zero tool;
- an AI chat surface;
- an AI writing assistant;
- a generic task manager;
- a CRM;
- a unified-inbox product;
- a collection of `My Turn / Waiting / Done` labels;
- a no-reply follow-up bot;
- an ontology showcase.

Those capabilities may exist. None is enough to justify the Product's existence.

## 1.5 Desired behavior change

The target is stronger than “process email faster.”

```text
before Lunowa
  -> user keeps unresolved communication in prospective memory
  -> checks Inbox / Sent / thread / task tools again
  -> reconstructs what changed and what remains open
  -> creates parallel reminder scaffolding when necessary

with a successful Lunowa
  -> user deliberately or implicitly delegates monitoring of an open loop
  -> stops parallel manual checking
  -> Lunowa preserves evidence and maintains the relevant state/return conditions
  -> nothing demands attention while nothing material requires the user
  -> the loop returns when the user's attention is genuinely needed
  -> enough trustworthy context is restored to act safely
```

**HYPOTHESIS:** the core behavioral outcome is **monitoring relinquishment** — the user genuinely stops carrying/rechecking delegated communication because Lunowa has earned sufficient trust.

---

# 2. Evidence posture after the 2026-08-26 frontier review

The Product must keep three conclusions separate.

## 2.1 Problem plausibility — strengthened

**EXTERNAL EVIDENCE:** email remains highly used and frequently checked; HCI/CSCW research shows email commonly carries collaborative tasks/commitments; prospective-memory research supports the possibility that reliable external reminders reduce internal intention maintenance.

This makes the problem/mechanism plausible.

It does **not** prove that Lunowa's target segment exists at useful scale or will adopt/pay.

## 2.2 Generic email productivity — increasingly incumbent territory

**EXTERNAL EVIDENCE:** a large randomized field experiment across 66 firms / 7,137 knowledge workers found integrated generative AI users spent roughly two fewer hours/week on email in the latter half of the experiment.

**INFERENCE:** `AI makes email faster`, generic summarization, drafting, priority classification, and simple task extraction are weak Product theses and weak differentiation claims.

## 2.3 Feature-space uniqueness — weakened materially

Current products already implement or claim meaningful portions of:

- `Respond` / `Waiting`;
- sent-mail/no-reply tracking;
- automatic follow-up reminders/drafts;
- commitment/task extraction;
- multi-account attention;
- `who owes whom` style queues;
- overdue commitments;
- outcome/response verification;
- richer action/commitment representations.

Therefore:

> **A real problem does not imply Lunowa owns a unique solution category.**

---

# 3. The user problem

## 3.1 The core problem is not raw email volume

**HYPOTHESIS:** Lunowa's highest-value problem is created by **communication open loops** — work that cannot yet be treated as resolved because a meaningful outcome depends on:

- the user;
- another person/organization;
- a future time;
- an expected event;
- a decision/approval;
- a document/payment/information arrival;
- unresolved/conflicting evidence.

High volume may amplify the problem but is neither necessary nor sufficient.

## 3.2 Current causal hypothesis

```text
many unresolved communication loops
  + external/interpersonal dependency
  + irregular or extended waiting
  + meaningful failure/latency cost
  -> ongoing monitoring burden
  -> repeated checking / reminder scaffolding
  -> reconstruction burden when returning
  -> execution overhead from manual organization
  -> verification burden when automation cannot be trusted
```

## 3.3 Communication Management Burden

Lunowa continues to model four Product costs:

1. **Monitoring cost** — remembering what remains open, who/what is pending, and when attention may become necessary.
2. **Interpretation / reconstruction cost** — rebuilding what happened, what changed, who owes what, and what remains unresolved.
3. **Execution cost** — searching, switching views/accounts, reopening threads, creating reminders/tasks, copying information, and repeated low-value operations.
4. **Verification / trust cost** — checking source communication “just in case” because the system may have lost an obligation, state change, source, identity, or timing condition.

**CURRENT PRIORITY HYPOTHESIS:** Monitoring is the strongest wedge-level burden; the other three determine whether monitoring can actually be offloaded.

## 3.4 Representative failure modes

Examples include:

- repeatedly opening Sent to see whether someone replied;
- receiving a reply that does not actually satisfy the awaited outcome;
- remembering that “something is still open” without remembering exactly what;
- forgetting an operational request buried inside ordinary email;
- losing a sent obligation once it leaves the Inbox;
- not knowing whether the next move belongs to the user or counterpart;
- using flags/stars/snooze/tasks/calendar/notes in parallel just to preserve state;
- rebuilding a long thread before acting;
- treating one Conversation as one task even though several independent outcomes remain open;
- hiding a real obligation because an inferred state was wrong;
- creating so much Review/alert noise that the monitoring system becomes another inbox.

## 3.5 Not Inbox Zero

**ACCEPTED:** unread count, archive count, empty inbox, and throughput are not primary outcomes.

A clean inbox can coexist with a high mental monitoring load.

---

# 4. Who may have the strongest problem

The ICP is **not validated or frozen**.

## 4.1 Workflow characteristics outrank job title

**HYPOTHESIS:** prioritize people with the following observable signature:

- tasks/commitments are materially communicated through email;
- they create or maintain tasks/reminders from received/sent email, or repeatedly reopen mail to preserve state;
- relevant work is substantially asynchronous;
- they personally retain responsibility for follow-through rather than routinely delegating it;
- several unresolved loops coexist;
- some loops depend on people outside a shared workflow system;
- waiting periods are irregular/long enough to require monitoring;
- missed/late action has meaningful cost;
- a dedicated CRM/ATS/ticketing/project system does not already track the relevant heterogeneous loop adequately;
- they have sufficient autonomy to adopt a companion or alternate workflow.

## 4.2 Current research prior — self-managing async email-task work

**EXTERNAL EVIDENCE / LIMITED:** A 2024 CSCW study of Microsoft information workers (`N=45` survey, plus interviews) found positive interaction with an AI reminder system associated with:

- communicating about tasks via email;
- creating tasks from email;
- fewer scheduled meetings;
- less task delegation.

**IMPORTANT LIMITATION:** this is a small organization-specific self-assessment study. It is a recruitment prior, not a causal market segmentation result.

**INFERENCE:** `self-managing + asynchronous + email-task-coupled + low-delegation` is a stronger recruitment lens than `high email volume` or `executive`.

## 4.3 Current first recruitment cohort hypothesis

**HYPOTHESIS — NOT ACCEPTED ICP:** begin discovery with independent / small-firm B2B professionals who personally coordinate multiple clients/counterparties, such as:

- independent consultants;
- fractional specialists;
- solo professional-service providers;
- small client-service operators.

Reason for prioritization:

- likely adoption autonomy;
- personal follow-through ownership;
- potentially heterogeneous external work;
- potentially weaker fit with rigid CRM/ATS/ticket flows.

This is a **recruitment prior only**. Do not call `freelancers`, `consultants`, or any occupation the Lunowa ICP until recent real-workflow evidence supports it.

## 4.4 Segmentation lens

Current qualitative lens:

> **Concurrency × Latency × Interdependence × Failure Cost**

moderated by:

- workaround adequacy;
- delegation availability;
- dedicated-system coverage;
- adoption autonomy;
- trust sensitivity.

This is **not** a validated numeric scoring model.

## 4.5 Candidate disqualifiers

A segment/user is weaker when:

- mail is mostly newsletters/notifications;
- important loops resolve immediately;
- CRM/ATS/ticket/project software reliably owns the state already;
- follow-up is routinely delegated to another person;
- most work is synchronous/scheduled and email is incidental;
- the main pain is writing/summarization speed;
- missed/late open loops have little consequence;
- organizational policy prevents adoption.

## 4.6 Current Product-discovery authority

GitHub **Issue #36** is the current highest-priority Product-discovery gate for exact ICP/problem evidence.

Do not freeze an ICP before that evidence exists.

---

# 5. The initial Product wedge

## 5.1 Current strongest problem/wedge hypothesis

> **Open-loop Monitoring Offload**

Operationally:

> When communication remains unresolved, Lunowa should keep track of the relevant outcome, ownership/actionability, and time/event conditions — then return user attention only when it is actually needed.

Directional user language:

> **自分の番になるまで、気にしなくていい。**

This is not finalized marketing copy.

## 5.2 The wedge is not differentiation by itself

**IMPORTANT CURRENT CORRECTION:** `Open-loop Monitoring Offload` describes the problem/value wedge Lunowa wants to prove. It does **not** establish a unique market position.

Current vendors already implement or claim substantial monitoring/follow-up behavior.

## 5.3 Clock reminder versus state/event attention

Simple flow:

```text
user decides mail matters later
  -> picks a date
  -> thread returns
  -> user checks whether anything changed
```

Stronger Lunowa target:

```text
communication establishes an open loop
  -> system preserves what remains unresolved
  -> source/time/event evidence changes the state
  -> no attention while nothing requires the user
  -> attention returns when state warrants it
```

This behavior remains Product-important. It is **not assumed unique**.

## 5.4 Any reply is not necessarily resolution

A reply is evidence, not closure.

Examples:

- “I forwarded it to legal” may preserve Waiting;
- “Can you clarify item 3?” may create My Turn for one obligation while another remains Waiting;
- “Thanks” may not satisfy a requested document/payment/approval;
- a Conversation may contain multiple outcomes.

**CURRENT CORRECTION:** competitors now explicitly claim `response verification` / richer commitment tracking as well. Therefore `reply != outcome satisfied` is a semantic requirement candidate, **not a differentiation claim**.

---

# 6. Competitive frontier in 2026

Detailed current sources/limitations live in the dated research artifacts.

## 6.1 Established overlap

Current Gmail/Superhuman/Fyxer/SaneBox and similar products cover meaningful portions of:

- priority/action classification;
- Respond/Waiting-style status;
- sent-mail tracking;
- no-reply reminders;
- follow-up drafting;
- snooze/defer/done;
- account aggregation or existing-client embedding.

## 6.2 Newer frontier claims

Current early vendors also claim combinations including:

- waiting-on queues;
- overdue commitments;
- relationship/commitment health;
- automatic tracking from CC/forward patterns;
- response verification against the original requested result;
- multiple actions/owners/waiting states per communication context.

**Evidence discipline:** these vendor pages show that the **idea/feature space is occupied**. They do not prove accuracy, adoption, retention, moat, or Product quality.

## 6.3 Consequence

Do not reason:

```text
competitor does not use our word "Responsibility"
  -> Lunowa is differentiated
```

or:

```text
our ontology is deeper
  -> market will switch
```

Feature/ontology novelty is insufficient.

---

# 7. Differentiation is now an empirical outcome threshold

## 7.1 Capabilities that are not differentiation by themselves

Do **not** treat any of these alone as defensible differentiation:

- unified inbox / multiple accounts;
- generic AI summary;
- generic AI drafting;
- generic search;
- task extraction;
- due-date extraction;
- priority classification;
- `My Turn` / `Respond`;
- `Waiting`;
- sent-mail/no-reply tracking;
- automatic follow-up drafting;
- Snooze / Later;
- Done/archive;
- commitment extraction;
- owner/next-move extraction;
- `reply != expected outcome satisfied`;
- stateful/longitudinal tracking as a phrase;
- multiple actions/commitments per thread as a phrase;
- companion/overlay form factor.

They may be necessary. They are not automatically unique.

## 7.2 Current differentiation standard

**HYPOTHESIS:** Lunowa is meaningfully differentiated only if, for a specific target segment and its messy real communication, the complete system can produce a superior **behavioral outcome** versus the user's real alternative.

A candidate success regime is:

```text
materially less parallel self-checking
+ materially less state/context reconstruction
+ correct resurfacing when user attention is needed
+ sufficiently low material false-negative rate
+ sufficiently low unnecessary Review/resurfacing burden
+ preserved source/provenance/account/control
+ enough recurring value to justify trust and switching/dependency
```

No one metric or threshold is frozen yet.

## 7.3 Real comparator, not straw baseline

The market comparator may be:

- Gmail/Outlook native AI/tasks/reminders;
- Superhuman;
- Fyxer;
- SaneBox;
- Quell/Pendingly or another follow-up assistant;
- CRM/ATS/ticketing/project software;
- Todoist/Notion/calendar;
- manual flags/snooze/Sent scanning;
- human assistant/delegation;
- a combination of these.

A conventional plain inbox remains useful as a **controlled experiment condition**, but it is not sufficient by itself to establish market differentiation.

## 7.4 Current strongest differentiation hypothesis

The strongest remaining hypothesis is not a named feature. It is:

> **Lunowa may be able to deliver reliable delegated state continuity across heterogeneous communication cases well enough that the user actually stops self-monitoring, with less reconstruction and acceptable error/review burden compared with their real workflow.**

Whether this is achievable and valuable is **UNKNOWN**.

---

# 8. Product experience thesis

## 8.1 System-led, not prompt-led

**ACCEPTED:** ordinary use should not begin with `Ask AI`.

Conceptual flow:

```text
communication changes
  -> preserve authorized source evidence
  -> derive candidate interpretation
  -> admit/update trusted communication state
  -> evaluate actionability / expected event / time condition
  -> project minimum relevant attention
  -> user acts only when needed
```

AI should mostly prepare/maintain context behind the interface.

## 8.2 AI prepares; human commits

**ACCEPTED:** human final authority remains the default for material external commitments and privileged actions.

Initial Product must not autonomously perform high-impact actions merely because a model inferred intent.

## 8.3 Eliminate work, not control

**ACCEPTED:** remove low-value remembering/checking/reconstruction/navigation/decision work while preserving:

- source visibility;
- account/sender boundaries;
- human authority;
- practical reversibility/correction;
- safe fallback.

## 8.4 Trust is functional

A flow that causes:

```text
Lunowa monitoring
+ old manual checking
```

has failed the core promise even if it is visually elegant or fast.

## 8.5 Trust ladder

Prefer progressive disclosure:

```text
current conclusion / next action
  -> short reason
  -> material provenance
  -> original communication
```

Do not use model-confidence percentages as a default substitute for evidence/authority.

---

# 9. Role of Responsibility, Moment, Temporal Contract

Detailed semantics remain owned by `docs/product/responsibility/`.

## 9.1 Responsibility is a candidate mechanism

**ACCEPTED PRODUCT POSITIONING:** Lunowa needs some reliable representation of unresolved communication state to monitor it over time.

The current best internal model is **Responsibility**.

> Responsibility exists to serve monitoring offload; Lunowa does not exist to serve the ontology.

If Product evidence supports a simpler/better model, Responsibility can be superseded through explicit decision/reconciliation.

## 9.2 Conversation is evidence context, not one task state

A Conversation may contain zero, one, or many Responsibilities.

## 9.3 Current projections

- `対応が必要` / My Turn;
- `待ち` / Waiting;
- `あとで` / Later;
- `完了` / Done;
- `確認` / Review.

These are projections, not canonical lifecycle truth and not differentiation claims.

## 9.4 Moment is context restoration

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

**HYPOTHESIS:** after the user has stopped thinking about a loop, Moment should restore the minimum trustworthy context required to understand why it returned and what safe action/decision is needed.

## 9.5 Temporal Contract

A Temporal Contract is the durable Product promise for when Lunowa will reconsider/resurface an unresolved Responsibility.

Its Product value depends on reliability, not merely UI copy.

## 9.6 Follow-up

Follow-up is normally an action/reason after a waiting trigger; it is not a separate canonical lifecycle species.

---

# 10. Reliability and prospective memory

## 10.1 Human offloading evidence

**EXTERNAL EVIDENCE:** 2026 prospective-memory research supports the possibility that sufficiently trusted/reliable reminders reduce internal intention maintenance. Removing relied-upon support can cause performance costs.

**INFERENCE:** if Lunowa succeeds at making the user stop checking, later false negatives become more consequential precisely because monitoring was successfully delegated.

## 10.2 LLM prospective-memory warning

**EXTERNAL EVIDENCE — CURRENT PREPRINT/BENCHMARK:** TriggerBench (June 2026) and PM-Bench (July 2026) report substantial difficulty for LLM agents on prospective-memory / delayed-intention / latent-trigger tasks, including precision-recall trade-offs and degraded performance under overloaded/implicit triggers. PM-Bench's best reported aggregate method reaches `65.1%` macro Set-F1 in its synthetic setting.

These are **not email-production accuracy estimates**.

## 10.3 Product implication

Do not architect Product trust around:

> `the LLM will remember and notice the future event`

alone.

The current source-grounded Responsibility / reducer / Temporal Contract / durable trigger / reconciliation direction is strengthened as a **reliability requirement**, not as a market moat claim.

---

# 11. Golden flow

**CURRENT PRODUCT HYPOTHESIS:**

```text
1. material communication establishes/changes an unresolved loop
2. Lunowa derives the relevant outcome / obligation / waiting condition
3. material interpretation is source-grounded and correctable
4. no current user action -> loop leaves active attention
5. user stops checking it manually
6. message / deadline / event / contradiction changes the evidence/state
7. Lunowa determines whether user attention is now required
8. loop resurfaces with minimum sufficient context + provenance
9. user takes one safe meaningful action/decision
10. loop resolves or returns to monitored Waiting/Later
```

Step **5** is essential. Without reduced self-monitoring, the North Star has not been demonstrated.

---

# 12. Product form factor remains open

## 12.1 Unknown

Lunowa may ultimately be:

- a full email client;
- a companion/overlay working with Gmail/Outlook;
- a hybrid.

## 12.2 Why full-client ownership is not assumed

Current competitors can deliver significant automation inside existing Gmail/Outlook.

**INFERENCE:** a replacement client adds **replacement switching cost** on top of the unavoidable **delegation/trust cost**.

Therefore:

> Do not require full-client replacement unless evidence shows the unique end-to-end value needs or materially benefits from owning the client.

## 12.3 Current design references

Existing full-client visual references remain design exploration/direction. They are not evidence that Product form is validated or that all surfaces must be implemented before learning.

## 12.4 Current engineering direction

Responsive web-first remains the current accepted engineering path unless Product/distribution evidence reopens it. This is an implementation direction, not proof that web full-client is the final Product form.

---

# 13. Ordinary email / UX direction

Detailed authority is in `docs/design/`.

## 13.1 Familiarity before novelty

Ordinary read/source/reply/compose/search/account concepts should remain understandable from existing mail mental models wherever those capabilities are included.

## 13.2 Current shell hypothesis

```text
Sidebar | Conversation List | Detail
```

with:

- `会話` — source communication;
- `今の要点` — current operational Moment.

This remains a candidate expression of the Product thesis, not validated market value.

## 13.3 “10-second” target

**NEEDS VALIDATION / IMMEDIATE USABILITY HYPOTHESIS:** representative prepared cases should allow a user to identify the next meaningful action/state in roughly 10 seconds or less without rereading the full thread.

This tests reconstruction efficiency only. It does not prove safe forgetting or longitudinal reliance.

---

# 14. Scope classification

## 14.1 KEEP

- North Star;
- Open-loop Monitoring Offload as problem/wedge hypothesis;
- monitoring/reconstruction/execution/verification burden model;
- system-led intelligence;
- source/provenance visibility;
- explicit account/sender/authorization boundaries;
- human final authority for material actions;
- Conversation != Responsibility;
- Responsibility as current candidate open-loop model;
- projections as projections, not lifecycle truth;
- Temporal Contract concept;
- Moment as context restoration / one-primary-question interaction;
- graceful ordinary-email fallback;
- Product evidence before implementation breadth.

## 14.2 CHANGE / CURRENT CORRECTIONS

- `stateful longitudinal communication-loop management` is a **target capability**, not presumed differentiation;
- `reply != outcome satisfied` is a required semantic pressure candidate, not presumed differentiation;
- ontology depth / multiple Responsibilities is not a market moat claim;
- independent B2B professionals are a **recruitment cohort hypothesis**, not accepted ICP;
- differentiation must be demonstrated behaviorally against the user's real current workflow;
- Issue #36 problem/ICP discovery precedes treating #26/#28 as the main Product gate;
- AI prospective-memory capability is not trusted Product authority by default;
- retention should measure delegation/reliance and fallback checking, not open frequency alone.

## 14.3 DEFER as central scope

Until the core problem/wedge is supported:

- relationship/person graph expansion;
- subscription/billing management as a broad product;
- travel/itinerary bundling;
- location/context work/personal switching;
- morning/time-of-day organization rules;
- generic automation/rule builder;
- CRM/project-management expansion;
- multi-provider breadth for completeness;
- broad full-client surface completeness;
- tablet/mobile pixel fidelity beyond validation needs.

## 14.4 REMOVE FROM DIFFERENTIATION CLAIM

Do not market/reason as if these are unique by themselves:

- unified inbox / multi-account;
- AI summary/drafting/search;
- task/due extraction;
- priority classification;
- My Turn/Respond/Waiting;
- snooze/reminders/no-reply follow-up;
- Done/archive;
- commitment extraction;
- owner/waiting-on extraction;
- response/outcome verification;
- stateful tracking;
- multiple actions per thread;
- companion integration.

This does not mean remove every feature. It means remove unsupported uniqueness claims.

---

# 15. Validation strategy

## 15.1 Evidence ladder

```text
real recent workflows show recurring under-served monitoring burden
  -> coherent candidate segment survives falsification
  -> candidate Responsibility/Moment mechanism is understandable
  -> immediate reconstruction/decision work improves
  -> real/concierge system behaves reliably across waiting periods
  -> parallel self-check / manual reminder scaffolding decreases
  -> user relies on Lunowa across days/weeks
  -> value exceeds the user's actual alternative
  -> credible workflow change / dependency / payment intent
```

Do not infer a later arrow from an earlier one.

## 15.2 Current highest-priority gate — Issue #36

**ACCEPTED CURRENT SEQUENCE:** first collect recent-event workflow evidence for the problem/ICP.

The purpose is to establish whether a coherent reachable segment repeatedly self-monitors unresolved communication despite current tools.

Do not lead with Lunowa vocabulary or feature preference.

## 15.3 Issue #26 — downstream mechanism experiment

Issue #26 remains useful for testing:

- reconstruction/decision burden;
- projection comprehension;
- one-Moment interaction;
- provenance/control;
- immediate source rechecking;
- multiple-Responsibility complexity.

But it is **not the current top-level Product-discovery gate** and cannot validate longitudinal monitoring relinquishment.

Its controlled conventional inbox baseline may remain useful scientifically, but market differentiation later requires comparison with participants' actual incumbent workflows/products.

## 15.4 Issue #28 / #32 / PR #34

- #28 is implementation for the mechanism prototype and should not resume write-heavy work merely because its UI/spec path becomes ready;
- #32 / PR #34 may continue as bounded reversible oracle/spec work;
- neither substitutes for #36 problem/ICP evidence;
- if #36 changes target workflow/baseline/scenario materially, the mechanism experiment/oracles must be reconciled before use.

## 15.5 Longitudinal gate

A later real/concierge experiment must test actual waiting periods and whether users stop parallel checking.

A single-session fake-data prototype cannot prove this.

## 15.6 Cheapest falsification rule

**ACCEPTED:** prefer the smallest experiment capable of falsifying the highest-impact unresolved Product assumption.

Current mapping:

- problem / ICP -> recent-event workflow reconstruction/observation;
- mechanism usability -> paired realistic prototype;
- safe forgetting -> narrow real/concierge longitudinal experiment;
- actual competitive superiority -> compare against real incumbent/workaround behavior;
- WTP -> credible payment/pricing test after value exposure;
- full client necessity -> compare form-factor behavior after wedge value exists.

---

# 16. Product success metrics

No single metric or threshold is frozen.

## 16.1 Discovery descriptors

Useful exploratory observations:

- concurrent open loops;
- waiting duration;
- current recheck behavior;
- manual task/reminder scaffolding;
- missed/late consequences;
- cases where reply did not equal resolution;
- current-tool adequacy.

Do not turn exploratory qualitative samples into prevalence estimates.

## 16.2 Immediate mechanism measures

Candidate measures include:

- `T_action` — time to correct next action/state;
- navigation/decision operations;
- thread/message rereads;
- immediate source rechecks;
- operational-state correctness;
- safe-action correctness;
- Review/correction burden;
- provenance comprehension;
- account/sender errors.

## 16.3 Longitudinal North-Star-adjacent measures

Candidate measures:

- `N_self_check` — manual checks of a delegated loop before Lunowa resurfaces it;
- source-inbox fallback frequency;
- parallel task/reminder creation after delegation;
- proportion of loops left unmonitored elsewhere;
- correct resurfacing when attention is needed;
- material false-negative rate;
- unnecessary Review/resurfacing burden;
- context-restoration time after waiting;
- continued delegated monitoring across days/weeks.

## 16.4 Retention must fit the North Star

Success may reduce app/inbox opening frequency.

Therefore DAU/open count alone may be misleading.

A stronger retention signal may be:

> **How much meaningful communication monitoring the user continues to entrust to Lunowa and whether they revert to their old monitoring workflow.**

## 16.5 Safety-quality trade-off

Two symmetric Product failures matter:

```text
false negative -> material obligation disappears
```

and:

```text
defensive over-alerting -> Review / resurfacing becomes a second inbox
```

The target regime requires both sufficiently low material misses **and** sufficiently low unnecessary attention.

---

# 17. Switching and trust cost

## 17.1 Two costs

Distinguish:

1. **replacement switching cost** — moving/learning a new mail client/workflow;
2. **delegation/trust cost** — allowing software to suppress/monitor communication on the user's behalf.

A companion can lower the first but not the second.

## 17.2 Current highest-level Product risk

> **Does a specific reachable self-managing asynchronous segment have enough currently under-served communication-monitoring burden, and can Lunowa outperform that segment's real tools/workarounds on reliable delegated state continuity enough that users actually stop checking for themselves?**

This is the current strongest Product unknown.

---

# 18. Monetization and distribution

## 18.1 Monetization

**HYPOTHESIS:** paid subscription/prosumer pricing is plausible if Lunowa removes recurring cognitive/operational burden or costly missed outcomes.

Exact price, free tier, packaging, billing interval, and individual/business structure remain **UNKNOWN**.

Competitor prices are contextual evidence only, not Lunowa pricing authority.

## 18.2 Distribution

**UNKNOWN:** no acquisition channel is proven.

Distribution/reachability is part of ICP selection, not an afterthought after implementation.

## 18.3 Willingness to pay

Do not treat generic hypothetical WTP questions as strong evidence before users experience credible value.

---

# 19. Trust, safety, autonomy boundaries

These remain accepted Product-level rules:

- requested action is not automatically the safe next action;
- original communication remains inspectable evidence;
- model confidence is not authority;
- user correction does not rewrite original communication;
- sender/account identity is explicit before sending;
- send click is not provider-reconciled acceptance;
- prompt/tool-like email text is untrusted content and gains no system authority;
- retrieval/AI context is authorization-filtered;
- cross-account similarity does not authorize semantic merge;
- high-impact external actions retain human confirmation by default;
- core ordinary-email behavior degrades safely when intelligence is unavailable;
- LLM inference alone does not become durable future-trigger authority.

These are trust prerequisites, not differentiation claims.

---

# 20. Current supersessions — do not regress

## 20.1 `ActionItem` -> `Responsibility`

Responsibility remains current canonical semantic concept unless explicitly superseded.

## 20.2 Single lifecycle -> orthogonal state

My Turn / Waiting / Later / Done / Review are projections over richer canonical state.

## 20.3 Follow-up lifecycle -> action/reason

Follow-up is not a separate lifecycle species.

## 20.4 Ask-AI-centric -> system-led intelligence

Routine users should not need to prompt AI to organize ordinary communication.

## 20.5 Native-first -> responsive-web-first engineering direction

Current implementation direction remains responsive web-first unless Product/distribution evidence changes it.

## 20.6 Provider/AI-first -> Product evidence first

Provider/auth/database/AI breadth must not substitute for Product learning.

## 20.7 Multi-account as differentiation -> possible multiplier only

Plain aggregation is table stakes; cross-account value needs evidence.

## 20.8 Responsibility-centered Product story -> monitoring-offload story

```text
real recurring monitoring problem
  -> safe delegation / forgetting
  -> trustworthy state continuity
  -> Responsibility / Temporal Contract as candidate mechanisms
  -> Moment restores context
  -> projections expose current state/action
```

## 20.9 `stateful/outcome-aware` as presumed differentiation -> empirical differentiation only

**SUPERSEDED:** do not describe Lunowa as differentiated merely because it tracks state over time, distinguishes reply from resolution, models commitments, or supports multiple Responsibilities.

Current rule:

> **Differentiation is earned only by comparative user outcomes against real alternatives.**

## 20.10 `knowledge workers` as sufficient ICP -> behavioral recruitment profile

Generic knowledge-worker framing is too broad.

Current recruitment prior is self-managing / async / email-task-coupled / low-delegation work; exact ICP remains unvalidated.

---

# 21. Current major unknowns

Do not silently convert these into decisions:

- exact early ICP / segment priority;
- prevalence/severity of repeated open-loop monitoring in that segment;
- actual current-workflow/tool adequacy;
- whether independent/small-firm B2B professionals are a coherent first segment;
- whether Responsibility/Moment produces meaningful immediate comparative value;
- whether Lunowa can reduce `N_self_check` across real waiting periods;
- trust/reliability threshold required for delegation;
- attainable false-negative versus Review/resurfacing trade-off;
- whether Lunowa can outperform current Gmail/Superhuman/Fyxer/SaneBox/Quell/Pendingly/other workflows rather than merely resemble them;
- whether Responsibility is the simplest sufficient internal model;
- whether a full client is necessary or companion/hybrid is superior;
- cross-account incremental value;
- willingness to pay / pricing / packaging;
- acquisition/distribution;
- continued reliance/retention;
- notification/resurfacing policy;
- historical initial-sync activation policy;
- whether/when native mobile becomes Product-critical.

Competitor/provider/API/legal/platform facts are time-sensitive and must be rechecked when they affect a decision.

---

# 22. Evidence discipline

Keep the following inequalities explicit:

```text
external evidence says a problem/mechanism exists
  !=
that problem is severe for Lunowa's ICP
```

```text
candidate segment appears plausible
  !=
validated ICP
```

```text
competitor claims a feature
  !=
competitor executes it well
```

```text
Lunowa ontology is sophisticated
  !=
market differentiation
```

```text
prototype is easier/faster than a plain baseline
  !=
better than the participant's actual workflow
```

```text
technical correctness
  !=
Product correctness
```

```text
short-term usability
  !=
monitoring relinquishment / retention / WTP
```

Use research to reduce uncertainty, not manufacture certainty.

---

# 23. Decision rule

When a future Product decision is ambiguous, prefer the option that maximizes the probability of proving or disproving a real recurring communication-monitoring problem while:

1. testing the **segment/problem before implementation breadth**;
2. reducing user monitoring before optimizing secondary convenience;
3. measuring comparative behavior against the **real current alternative**, not only a straw baseline;
4. treating feature/ontology novelty as insufficient evidence of differentiation;
5. reducing reconstruction/execution/verification burden in support of monitoring offload;
6. preserving source visibility, authorization, sender identity, and human control;
7. requiring the fewest low-value choices before meaningful action;
8. avoiding replacement-client scope unless evidence justifies its switching cost;
9. avoiding cross-account/provider breadth unsupported by Product evidence;
10. degrading safely when AI/provider/scheduler components fail;
11. treating Responsibility/Moment as revisable mechanisms, not sacred Product truth;
12. treating LLM prospective memory as untrusted until bounded by reliable state/trigger/reconciliation mechanisms;
13. testing real behavior change — especially self-check reduction, error burden, and reliance;
14. using the **smallest/cheapest experiment that can falsify the highest-impact unresolved assumption** before broad implementation.

If stronger evidence changes a Product-level decision, update this document and the owning canonical design/domain/architecture/implementation artifact in the same accepted change where applicable.
