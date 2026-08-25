# Lunowa Product Thesis and Product Contract

## Status

**Current durable product-intent baseline for Lunowa.**

This document owns the highest-level Product contract: what problem Lunowa exists to solve, what user behavior it tries to change, what initial wedge is currently strongest, what is table stakes versus differentiation hypothesis, which product mechanisms are candidates rather than ends in themselves, and what evidence is still missing.

It deliberately does **not** replace more detailed authorities:

- `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` own detailed UX/interaction behavior;
- `docs/product/responsibility/` owns canonical Responsibility semantics and persistence-proof status;
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md` own engineering boundaries;
- `docs/product/TECH-STACK.md` + accepted ADRs own concrete technology choices;
- `docs/product/IMPLEMENTATION-PLAN.md` owns implementation sequence;
- GitHub Issues/PRs/CI own live task/candidate/review state;
- `docs/continuity/CURRENT.md` is only the mutable checkpoint/router;
- `docs/product/research/` contains evidence artifacts and does not become Product truth merely by existing.

This document distinguishes:

- **ACCEPTED** — current Product direction or safety/authority principle;
- **HYPOTHESIS** — current best Product explanation that still needs validation;
- **EXTERNAL EVIDENCE** — supported by research/current market evidence but not itself proof of Lunowa product-market fit;
- **UNKNOWN / NEEDS VALIDATION** — material unresolved Product question;
- **DEFERRED** — intentionally outside the current learning target.

A hypothesis is not promoted to market fact merely because it is canonical repository text.

Reassessed on **2026-08-26** against the then-current repository and current external evidence, including Gmail AI Inbox, Superhuman Mail Email Assistant, Shortwave, Spark, email/task-management HCI research, and 2026 prospective-memory/cognitive-offloading research. Supporting source detail is recorded in `docs/product/research/communication-monitoring-evidence-2026-08.md`.

---

## 1. What Lunowa is for

### 1.1 Vision

**ACCEPTED / ASPIRATIONAL:** Lunowa aims to create the most comfortable email experience possible — internally expressed as **「世界一快適なメール体験」**.

That phrase is vision, not a measurable market claim or release acceptance criterion.

### 1.2 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

### 1.3 Current one-sentence Product definition

**CURRENT STRONGEST PRODUCT THESIS:**

> **Lunowa is a communication-monitoring product delivered through email: it tries to keep unresolved communication loops under control on the user's behalf so the user can stop repeatedly remembering, checking, and reconstructing them until attention is genuinely required again.**

Lunowa is therefore not primarily:

- an inbox skin;
- an Inbox Zero tool;
- an AI chat surface;
- an AI writing assistant;
- a generic task manager;
- a CRM;
- a unified-inbox product;
- a collection of `My Turn / Waiting / Done` labels.

Those capabilities may exist, but none is the reason the Product should deserve to exist.

### 1.4 The behavior change Lunowa ultimately wants

The desired user behavior is not merely “process email faster.”

The stronger target is:

```text
before Lunowa
  -> user keeps open communication in working/prospective memory
  -> repeatedly checks Inbox / Sent / thread / flags / task tools
  -> reconstructs current state each time

with successful Lunowa
  -> user delegates monitoring of an open communication loop
  -> stops parallel manual checking
  -> Lunowa observes relevant state/time/event changes
  -> only when attention is required does the loop return
  -> enough context is restored to act safely with minimal reconstruction
```

**HYPOTHESIS:** the most important behavioral outcome is **monitoring relinquishment** — the user genuinely stops carrying and manually rechecking communication state because Lunowa has earned sufficient trust.

---

## 2. The user problem

### 2.1 The core problem is not raw email volume

**EXTERNAL EVIDENCE:** HCI/CSCW research has long documented email being used as a task-management substrate, with unresolved/interleaved work and coordination burden extending beyond simple message count. Current workplace telemetry also shows communication remains interruption-heavy. See the research artifact for sources and limitations.

**HYPOTHESIS:** Lunowa's highest-value problem is created by **communication open loops**: work that cannot yet be considered resolved because the next meaningful move depends on the user, another person, a future event, an agreed condition, or unresolved evidence.

### 2.2 Current strongest causal model

The existing Communication Management Burden model remains useful, but the dimensions are not assumed to be co-equal at the wedge level.

Current strongest causal hypothesis:

```text
many unresolved communication loops
  + external/interpersonal dependency
  + irregular or extended waiting time
  + meaningful failure cost
  -> ongoing monitoring burden
  -> repeated checking / reminder scaffolding
  -> reconstruction burden when returning
  -> execution overhead from manual organization
  -> verification burden when the system cannot be trusted
```

### 2.3 Communication Management Burden

Lunowa continues to model four Product costs:

1. **Monitoring cost** — remembering what remains open, what must be checked again, who/what is being waited on, and when attention may become necessary.
2. **Interpretation / reconstruction cost** — rebuilding the operational meaning of communication: what changed, who owes what, what remains unresolved, and what matters now.
3. **Execution cost** — searching, switching inboxes/views, creating manual tasks/reminders, reopening threads, copying information, and repeated low-value operations.
4. **Verification / trust cost** — rechecking source communication “just in case” because the user does not trust the system to preserve obligations, evidence, identity, timing, or state correctly.

**CURRENT PRIORITY HYPOTHESIS:** Monitoring is the strongest candidate wedge; interpretation, execution, and verification support that wedge.

### 2.4 Representative failure modes

Lunowa is intended to reduce failures such as:

- forgetting an operational request buried in ordinary email;
- repeatedly checking whether someone replied or whether an expected outcome happened;
- losing track of sent communication once it leaves the Inbox;
- not knowing whether the next move belongs to the user or counterpart;
- using flags, stars, snooze, calendar reminders, task apps, notes, or memory as parallel tracking systems;
- reopening a long thread and reconstructing “what is this about and what do I need to do now?”;
- letting a snoozed/archived item disappear but still distrusting whether it will come back appropriately;
- receiving a reply that does **not** satisfy the outcome actually being waited for;
- missing one of several independent obligations inside one conversation;
- trusting an inferred action too much when source/provenance/identity is ambiguous.

### 2.5 The Product is not optimizing for Inbox Zero

**ACCEPTED:** unread count, archive count, empty inbox, or mail-processing throughput are not primary outcomes.

A cleaner inbox can coexist with high monitoring burden. The relevant question is whether the user can safely stop manually carrying communication state while still regaining attention at the correct moment.

---

## 3. Who has the problem

The ICP is **not validated or frozen**.

### 3.1 Problem-characteristic hypothesis

**HYPOTHESIS:** the strongest early user is characterized more by workflow structure than by job title.

Candidate characteristics:

- many simultaneous asynchronous communication open loops;
- a meaningful share depends on people outside the user's immediate/shared workflow system;
- waiting periods are irregular or long enough to require deliberate monitoring;
- missed/late action or follow-up has real cost;
- communication state is currently kept alive through Inbox/Sent scanning, flags, snooze, reminders, task tools, calendar, notes, or memory;
- the user repeatedly revisits communication primarily to check state rather than to perform new work;
- a CRM/ATS/ticketing/project system does not already track the relevant loop adequately;
- the user has enough autonomy to adopt a companion or alternative workflow.

### 3.2 Current segmentation lens

**HYPOTHESIS:** a useful qualitative segmentation model is:

> **Concurrency × Latency × Interdependence × Failure Cost**, moderated by workaround adequacy and adoption autonomy.

This is not a validated numeric scoring model.

### 3.3 Candidate occupations are secondary

Consulting, agency/client service, independent professional work, operations, business development, recruiting, sales, and similar external-coordination work may fit the above characteristics.

But **job title must not substitute for problem evidence**. Some apparently painful segments may be poor early targets because CRM/ATS/ticketing systems already solve the monitoring problem better.

### 3.4 Current strongest ICP hypothesis

**HYPOTHESIS:** Lunowa may fit best where work is materially email-mediated and externally dependent, but too heterogeneous or individual to be fully captured by a dedicated workflow system.

This is intentionally narrower than “knowledge workers with lots of email.”

### 3.5 What must still be established

Before freezing an ICP, collect evidence for:

- frequency of real open loops;
- waiting duration/distribution;
- repeated self-check behavior;
- missed/late outcome cost;
- current workaround adequacy;
- trust threshold for delegating monitoring;
- adoption/switching autonomy;
- willingness to pay;
- reachable distribution;
- continued reliance after novelty disappears.

---

## 4. The initial Product wedge

### 4.1 Current strongest wedge

**HYPOTHESIS:** the first disproportionately valuable Product wedge is:

> **Open-loop Monitoring Offload**

Operationally:

> When communication is unresolved, Lunowa should keep track of the relevant outcome, who/what currently owns the next move, and the time/event conditions that matter — then return it only when the user's attention is actually needed.

The user-facing promise is closer to:

> **自分の番になるまで、気にしなくていい。**

This wording is directional Product language, not finalized marketing copy.

### 4.2 What the wedge is not

It is not merely:

- `Remind me in 3 days`;
- `Waiting` label;
- no-reply detection;
- an AI summary;
- a task extracted from email;
- a due date shown in a card;
- a unified list of accounts.

Those are existing market capabilities.

### 4.3 Clock-driven reminder versus state/event-driven attention

Conventional reminder flow often approximates:

```text
user decides this mail matters later
  -> chooses a time
  -> same thread returns at that time
  -> user checks whether the situation changed
```

Lunowa's stronger hypothesis is:

```text
communication establishes an open loop
  -> Lunowa represents what outcome remains unresolved
  -> relevant message / time / event changes the loop state
  -> no user attention while nothing material changed
  -> user attention returns only when state requires it
```

The distinction is **not guaranteed to be unique in the market**. It is the current target behavior that must be compared against competitors and current user workflows.

### 4.4 Why “any reply” is not enough

A reply is evidence, not necessarily resolution.

Examples:

- “I forwarded it to legal” may keep the user in Waiting;
- “Can you clarify item 3?” may move one obligation back to My Turn while another remains Waiting;
- “Thanks” may not satisfy an expected document/approval/payment;
- one conversation may contain several independent outcomes.

This is where a stateful communication model may create value beyond no-reply reminders.

---

## 5. Product experience thesis

### 5.1 System-led, not prompt-led

**ACCEPTED:** ordinary use should not begin with “Ask AI.”

Preferred conceptual flow:

```text
communication changes
  -> preserve authorized source evidence
  -> derive candidate meaning
  -> admit/update trusted communication-loop state
  -> evaluate actionability / expected events / time conditions
  -> project the minimum relevant attention state
  -> user acts only when needed
```

AI should mostly prepare and maintain context behind the interface rather than requiring repeated prompts.

### 5.2 AI prepares; human commits

**ACCEPTED:** human final authority remains the default for material external commitments and privileged actions.

The initial Product must not autonomously send/delete mail, approve contracts, make payments, accept high-impact commitments, or perform similarly consequential actions merely because a model inferred intent.

### 5.3 Eliminate work, not control

**ACCEPTED:** Lunowa should remove low-value remembering, checking, reconstruction, navigation, and repeated decision work while preserving:

- original source visibility;
- explicit account/sender boundaries;
- human authority;
- practical reversibility/correction;
- safe fallback when intelligence is unavailable.

### 5.4 Trust is part of the mechanism

**EXTERNAL EVIDENCE:** 2026 prospective-memory research supports the possibility that sufficiently trusted reminders reduce internal intention maintenance, while reliance can create costs when the external support disappears. This is cognitive plausibility, not direct email-product validation.

**PRODUCT IMPLICATION:** “usually correct” may be insufficient if the user still checks the old inbox in parallel.

A Product that causes:

```text
Lunowa monitoring
+ old manual checking
```

has failed the core offloading promise even if its UI is fast.

### 5.5 Trust ladder

When explanation is needed, prefer progressive disclosure:

```text
current conclusion / next action
  -> short reason
  -> material provenance
  -> original communication
```

Do not use model confidence percentages as a default substitute for evidence or Product logic.

---

## 6. Role of Responsibility, Moment, and Temporal Contract

Detailed semantics remain owned by `docs/product/responsibility/`.

### 6.1 Responsibility is a candidate mechanism, not the reason the Product exists

**ACCEPTED PRODUCT POSITIONING:** Lunowa needs a reliable representation of unresolved communication state if it is to monitor open loops on behalf of the user.

The current best internal model is **Responsibility**.

A Responsibility is the smallest communication-bounded operational obligation / expected-outcome loop with a coherent closure condition.

However:

> Lunowa does not exist because Responsibility is an elegant ontology. Responsibility exists because the Product needs a trustworthy way to deliver monitoring offload.

If future evidence shows a simpler or different model delivers the user outcome better, the semantic model may be superseded through an explicit decision.

### 6.2 Conversation is evidence context, not one task state

A Conversation may contain zero, one, or many Responsibilities.

### 6.3 User-facing projections

Current vocabulary:

- `対応が必要` / My Turn;
- `待ち` / Waiting;
- `あとで` / Later;
- `完了` / Done;
- `確認` / Review for decision-critical uncertainty/safety.

These are projections, not canonical lifecycle truth.

### 6.4 Moment is context restoration

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

The strongest Product reason for Moment is not “AI summary card.”

**HYPOTHESIS:** after the user has safely stopped thinking about a loop for hours/days/weeks, Moment should restore the minimum context required to understand why the loop returned and what safe decision/action is now needed.

Moment therefore supports **context restoration after monitoring offload**.

### 6.5 Temporal Contract

A Temporal Contract is the durable Product promise for when Lunowa will reconsider/resurface a Responsibility.

It is valuable only if the user can rely on it. The UI promise must eventually be backed by robust scheduling/reconciliation/timezone/idempotency/audit behavior, but those engineering details do not themselves prove Product value.

### 6.6 Follow-up

Follow-up is normally an action/reason after a waiting condition or trigger; it is not a separate canonical lifecycle species.

---

## 7. Golden flow

**CURRENT PRODUCT HYPOTHESIS:** the differentiated experience should eventually resemble:

```text
1. material communication establishes or changes an unresolved loop
2. Lunowa identifies the relevant outcome / obligation / waiting condition
3. user can verify/correct material interpretation when needed
4. the loop leaves active attention while no user action is needed
5. user does not manually recheck it during the waiting interval
6. reply / deadline / expected event / contradiction changes the state
7. Lunowa decides whether user attention is now required
8. the loop resurfaces with minimal restored context and provenance
9. user takes one safe meaningful action or verifies the state
10. the loop resolves or returns to monitored Waiting/Later
```

Step **5** is crucial. Without actual reduction in parallel self-monitoring, the North Star has not been demonstrated.

---

## 8. Differentiation versus table stakes in 2026

### 8.1 Current market reality

**EXTERNAL EVIDENCE:** as of 2026-08, major/current products already provide significant overlap:

- Gmail AI Inbox surfaces suggested to-dos, priority items, actions, and Mark done;
- Gemini in Gmail can manage tasks/suggested to-dos in supported contexts;
- Superhuman Mail provides automatic `Respond` / `Waiting`, Auto Reminders, Auto Drafts, and can operate directly inside Gmail/Outlook without forcing a client switch;
- Shortwave provides follow-up reminders and task/todo-oriented workflows;
- Spark provides unified inbox, snooze, Set Aside, Reminders, Done, and related workflow mechanics.

See the current research artifact for primary sources.

### 8.2 Capabilities that are not core differentiation by themselves

Do **not** treat any of the following alone as defensible Product differentiation:

- multi-account / unified inbox;
- generic AI summary;
- generic AI drafting;
- task extraction;
- due-date extraction;
- priority classification;
- `My Turn` / `Respond`;
- `Waiting`;
- no-reply reminder;
- Snooze / Later;
- Done/archive;
- ordinary search/attachments/compose/reply.

They may remain necessary or useful, but external positioning must not imply uniqueness without current evidence.

### 8.3 Current strongest differentiation hypothesis

**HYPOTHESIS:** the potentially defensible combination is:

1. **stateful longitudinal communication-loop management** rather than message-level categorization;
2. tracking the expected outcome / obligation state across multiple messages and time;
3. distinguishing “a reply happened” from “the awaited outcome was satisfied”;
4. representing multiple independent Responsibilities inside one Conversation when required;
5. durable state/time/event-driven resurfacing;
6. trust sufficient for the user to relinquish parallel monitoring;
7. Moment-based context restoration when attention returns;
8. source/provenance and authorization boundaries strong enough to make that delegation safe;
9. graceful ordinary-email fallback when intelligence fails.

This is still **not proof that competitors cannot do the same thing**. Competitor depth must be continuously rechecked.

### 8.4 Cross-account is a multiplier, not the current wedge

Multiple accounts/providers may amplify value for users whose open loops span identities.

But **cross-account aggregation is not the primary differentiation thesis** and should not drive scope before the monitoring-offload problem is validated.

Semantic similarity never authorizes cross-account Responsibility merge; account/scope/provenance/sender boundaries remain explicit.

---

## 9. Product form factor remains open

### 9.1 Full client is not part of the validated wedge

**UNKNOWN:** Lunowa may ultimately be:

- a full email client;
- a companion/overlay working with Gmail/Outlook;
- a hybrid.

### 9.2 Why this is now a first-class Product question

Superhuman currently delivers meaningful AI labeling/reminder/drafting behavior directly inside Gmail/Outlook, reducing the need for users to switch clients.

**INFERENCE:** a full-client Lunowa imposes **replacement switching cost** on top of the unavoidable **delegation/trust cost** of letting software manage attention.

Therefore:

> Do not assume a full-client replacement unless evidence shows the unique monitoring-offload value requires or strongly benefits from owning the client experience.

Current design references may continue to explore a full-client direction, but they are not evidence that the form factor is settled.

---

## 10. Ordinary email and UX direction

Detailed behavior remains in `docs/design/`.

### 10.1 Familiarity before novelty

Ordinary read/compose/reply/search/source/account behavior should remain understandable from existing email mental models.

### 10.2 Stable shell, adaptive operational context

Current high-level desktop direction remains:

```text
Sidebar | Conversation List | Detail
```

with `会話` for source conversation and `今の要点` for current operational Moment.

This UX remains a candidate expression of the Product thesis; it is not itself validated Product value.

### 10.3 “10-second” target

**NEEDS VALIDATION / IMMEDIATE USABILITY HYPOTHESIS:** in prepared representative cases, the user should determine the next meaningful action/state in roughly 10 seconds or less without rereading the full thread.

This tests reconstruction efficiency. It does **not** test safe forgetting or longitudinal reliance.

---

## 11. Scope classification

### 11.1 KEEP — important to the current Product thesis

- North Star: safely forget until needed, then finish with minimal understanding/operation;
- monitoring/reconstruction/execution/verification burden model;
- Open-loop Monitoring Offload as the strongest wedge hypothesis;
- system-led intelligence rather than prompt-led AI;
- original source/provenance visibility;
- explicit account/sender/authorization boundaries;
- human final authority for material external actions;
- Conversation != Responsibility;
- Responsibility as current candidate internal open-loop model;
- My Turn / Waiting / Later / Done / Review as projections, not lifecycle truth;
- Temporal Contract concept;
- Moment as context restoration / one-primary-question interaction;
- graceful ordinary-email degradation;
- Product validation before provider/AI/runtime breadth.

### 11.2 CHANGE — reframe from previous Product wording

- Responsibility/Moment are **mechanisms serving the user outcome**, not the Product thesis itself;
- Monitoring is the current strongest wedge-level burden, not merely one of four equal dimensions;
- cross-account is a possible value multiplier, not the central wedge;
- full-client replacement is an open Product question, not assumed Product truth;
- immediate fake-data prototype evidence must not be interpreted as proof of safe forgetting;
- retention should measure reliance/delegation and reduced fallback checking, not only habitual opens.

### 11.3 DEFER

Until the core monitoring-offload hypothesis is supported, defer as central Product scope:

- relationship/person-history graph expansion;
- subscription/billing management;
- travel/itinerary bundling;
- location/context-aware work/personal switching;
- morning/time-of-day organization rules;
- broad automation/rule builder;
- CRM/project-management expansion;
- production multi-provider breadth solely for completeness;
- tablet/mobile pixel fidelity beyond what current validation requires.

### 11.4 REMOVE FROM DIFFERENTIATION CLAIM

Do not market or reason as if these are unique by themselves:

- unified inbox / multiple accounts;
- AI summaries/drafts/search;
- AI task extraction;
- due-date extraction;
- My Turn / Respond;
- Waiting;
- snooze;
- reminders/no-reply follow-up;
- Done/archive mechanics.

This does **not** mean remove the features from the Product. It means remove unsupported uniqueness claims.

---

## 12. Validation strategy

### 12.1 Technical proof is not Product validation

Responsibility persistence/reducer correctness does not prove demand, trust, switching, retention, or willingness to pay.

Likewise, a polished fake-data UI does not prove the longitudinal monitoring-offload promise.

### 12.2 Immediate comparative prototype value

The current comparative fake-data validation path remains useful for questions such as:

- can users understand the projections;
- can Moment reduce reconstruction/decision work;
- does one primary action help;
- can Waiting/Later/Review be understood;
- can provenance create trust without audit overload;
- can multiple Responsibilities be represented without unacceptable complexity;
- can account/source identity remain clear.

### 12.3 What a one-session prototype cannot prove

It cannot establish:

- that users stop checking for days/weeks;
- trust earned from repeated correct resurfacing;
- longitudinal false-negative burden;
- continued reliance after novelty;
- switching willingness;
- payment willingness;
- replacement-client necessity.

### 12.4 Stronger evidence ladder

```text
recent real workflows show a recurring monitoring problem
  -> candidate Product model is understandable
  -> immediate reconstruction / decision work improves
  -> real or concierge system behaves reliably through waiting periods
  -> parallel self-check / manual reminder behavior decreases
  -> user relies on Lunowa across days/weeks
  -> user changes workflow / depends on it / shows credible payment intent
```

Do not infer a later arrow from an earlier one.

### 12.5 Cheapest falsification rule

**ACCEPTED:** prefer the smallest/cheapest experiment that can falsify the highest-impact unresolved Product assumption before broad implementation.

For current top-level questions:

- problem severity / ICP -> recent-event workflow observation/interview;
- immediate mechanism value -> paired realistic prototype;
- safe forgetting / monitoring relinquishment -> longitudinal concierge or narrow real-inbox experiment;
- willingness to pay -> credible pricing/payment-intent test after meaningful value evidence;
- client replacement necessity -> compare companion versus replacement behavior once wedge value exists.

---

## 13. Product success metrics

No single metric is frozen.

### 13.1 Immediate experience measures

Candidate measures include:

- time-to-next-meaningful-action/state;
- number of navigation/decision steps;
- thread rereads;
- source rechecks during immediate tasks;
- state-correctness / safe-action correctness;
- correction/Review burden;
- ability to explain “why is this here now?”;
- account/source identity errors.

### 13.2 Longitudinal North-Star-adjacent measures

**HYPOTHESIS:** the more important measures for the wedge include:

- `N_self_check`: manual rechecks of a loop delegated to Lunowa before Lunowa resurfaces it;
- source-inbox fallback frequency;
- parallel manual reminder/task creation after delegation;
- proportion of tracked loops the user is willing to leave unmonitored elsewhere;
- correct resurfacing at the point attention is actually needed;
- false-negative rate on material obligations;
- unnecessary Review/resurfacing burden;
- context-restoration time after a waiting interval;
- continued delegated monitoring across days/weeks.

### 13.3 Retention must fit the North Star

**IMPORTANT PRODUCT IMPLICATION:** success may reduce how often the user opens the app or inbox. Therefore DAU/open frequency alone may be a misleading retention metric.

A stronger retention signal may be:

> **How much important communication monitoring the user continues to entrust to Lunowa, and whether they revert to old checking/workaround behavior.**

Repeated weekly/daily use can still be useful, but should not override the Product promise.

### 13.4 Safety-quality trade-off

A material false negative is particularly dangerous: a real user obligation is hidden/omitted as if no attention is needed.

But sending all ambiguity to Review can also destroy the wedge by creating a second inbox.

The Product must eventually find a regime where false negatives are sufficiently rare **and** Review/resurfacing burden remains low enough for genuine offloading.

---

## 14. Switching cost and trust cost

### 14.1 Two distinct costs

Current Product reasoning should distinguish:

1. **replacement switching cost** — learning/moving to a different mail client/workflow;
2. **delegation/trust cost** — allowing software to hide/deprioritize/monitor communication on the user's behalf.

A companion product can reduce the first but not the second.

### 14.2 Primary Product risk

**NEEDS VALIDATION:** the highest-level risk is whether the value of monitoring offload is strong enough to overcome the relevant switching + trust cost.

The critical question is now:

> **Is communication monitoring painful and frequent enough for a specific reachable segment that they will delegate it to Lunowa, and can Lunowa earn enough trust that they actually stop re-checking?**

This is stronger and more specific than “do users like Responsibility/Moment?”

---

## 15. Monetization and distribution

### 15.1 Monetization

**HYPOTHESIS:** subscription/prosumer pricing is plausible because the Product targets recurring cognitive/operational burden and missed-outcome risk.

Exact price, free tier, packaging, billing interval, and individual/business plans remain **UNKNOWN**.

Do not freeze price from competitor comparisons.

### 15.2 Distribution

**UNKNOWN:** no acquisition channel is considered proven.

Distribution must be tested alongside ICP rather than postponed until after broad implementation.

### 15.3 Willingness to pay

Payment intent should be tested only after users experience a sufficiently credible form of the core value. Generic willingness-to-pay questions before value exposure are weak evidence.

---

## 16. Trust, safety, and autonomy boundaries

These Product-level rules remain accepted:

- requested action is not automatically the safe next action;
- original communication remains inspectable evidence;
- model confidence is not authority;
- explicit user correction does not rewrite original communication;
- sender/account identity is explicit before sending;
- send click is not provider-reconciled acceptance;
- prompt/tool-like text in email is untrusted content and gains no system authority;
- search/retrieval/AI context is authorization-filtered before exposure;
- cross-account similarity does not authorize semantic merge;
- high-impact external actions retain human confirmation by default;
- core read/compose/search/navigation remains usable when intelligence fails.

These are not differentiation claims. They are prerequisites for safely earning delegation trust.

---

## 17. Current supersessions / decisions not to regress

### 17.1 `ActionItem` -> `Responsibility`

Responsibility remains the current canonical semantic concept unless explicitly superseded.

### 17.2 Single lifecycle -> orthogonal state

My Turn / Waiting / Later / Done / Review remain Product projections over richer canonical state.

### 17.3 Follow-up lifecycle -> follow-up action/reason

Follow-up is normally renewed My Turn work after a trigger, not a separate lifecycle species.

### 17.4 Ask-AI-centric -> system-led intelligence

Routine users should not need to prompt AI to organize ordinary communication.

### 17.5 Native-first -> responsive web-first implementation direction

Current engineering direction remains responsive web-first unless new Product/distribution evidence reopens it.

### 17.6 Provider/AI-first -> Product-learning slice first

Current implementation reasoning still validates Product interaction before provider/AI/runtime breadth.

### 17.7 Multi-account as differentiation -> cross-account as possible multiplier

Unified inbox is table stakes. Cross-account value must be demonstrated as an amplifier for users whose monitored loops genuinely span accounts.

### 17.8 Responsibility-centered Product story -> monitoring-offload-centered Product story

**SUPERSEDED PRODUCT HIERARCHY:** Do not describe Lunowa as valuable primarily because it has Responsibility/Moment semantics.

Current hierarchy is:

```text
real recurring open-loop monitoring problem
  -> user needs safe delegation / forgetting
  -> system must maintain trustworthy state over time
  -> Responsibility / Temporal Contract are candidate internal mechanisms
  -> Moment restores context when attention returns
  -> projections expose the minimum current state/action
```

---

## 18. Current major unknowns

Do not silently convert these into decisions:

- exact early ICP / segment priority;
- prevalence/severity of repeated communication monitoring in that segment;
- current workaround adequacy;
- whether the wedge causes real reduction in self-checking;
- trust threshold required for monitoring relinquishment;
- longitudinal false-negative/Review burden;
- whether stateful communication-loop management is materially better than current Gmail/Superhuman/Shortwave/Spark/user workflows;
- whether a full client is necessary or a companion/hybrid is superior;
- cross-account incremental value;
- willingness to pay / pricing / packaging;
- acquisition channel;
- reliance/retention after novelty;
- notification strength/policy;
- historical activation/initial-sync policy;
- whether/when native mobile becomes Product-critical.

Provider/API/legal/platform facts and competitor functionality are time-sensitive and must be rechecked from authoritative current sources when they affect a decision.

---

## 19. Evidence discipline

The repository must keep these evidence levels distinct:

```text
external research supports a problem/mechanism
  !=
that problem is severe for Lunowa's target segment
  !=
Lunowa's candidate UX solves it
  !=
users trust Lunowa enough to delegate monitoring
  !=
users retain / switch / pay
```

Likewise:

```text
technical correctness
  !=
Product correctness
```

and:

```text
visual polish
  !=
market validation
```

Use research to reduce uncertainty, not to manufacture certainty.

---

## 20. Decision rule

When a future Product decision is ambiguous, prefer the option that maximizes the probability of proving or disproving a real recurring communication-monitoring problem while:

1. reducing user monitoring before optimizing secondary convenience;
2. reducing reconstruction/execution/verification burden in support of that monitoring offload;
3. preserving source visibility, authorization, sender identity, and human control;
4. requiring the fewest low-value user choices before meaningful action;
5. keeping ordinary email understandable;
6. avoiding replacement-client scope unless evidence justifies the switching cost;
7. avoiding cross-account/provider breadth unsupported by Product evidence;
8. degrading safely when AI/provider/scheduler components fail;
9. keeping hypotheses explicitly labeled as hypotheses;
10. treating Responsibility/Moment as revisable mechanisms, not sacred Product truth;
11. testing real behavior change — especially self-check reduction and reliance — rather than feature preference;
12. using the **smallest/cheapest experiment that can falsify the highest-impact unresolved assumption** before broad implementation.

If stronger evidence changes a Product-level decision, update this document and the owning canonical design/domain/architecture artifact in the same accepted change where applicable.
