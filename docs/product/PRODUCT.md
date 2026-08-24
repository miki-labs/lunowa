# Lunowa Product Thesis and Product Contract

## Status

**Current durable product-intent baseline for Lunowa.**

This document captures the product-level decisions and hypotheses that must survive ChatGPT/Codex session changes: the user problem, product promise, intended experience, differentiation thesis, current audience hypotheses, MVP/validation logic, commercial unknowns, and important supersessions.

It deliberately does **not** replace the more detailed authorities for UX, Responsibility semantics, architecture, persistence, implementation, or live task state:

- `docs/design/DESIGN.md` + `INTERACTIONS.md` + `RESPONSIVE.md` own detailed UX/interaction behavior;
- `docs/product/responsibility/` owns canonical Responsibility semantics/evaluation/persistence-proof status;
- `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, and `CONTRACTS.md` own product-engineering boundaries;
- `docs/product/TECH-STACK.md` + accepted ADRs own concrete technology choices;
- `docs/product/IMPLEMENTATION-PLAN.md` owns the living implementation sequence;
- GitHub Issues/PRs/CI own current task/candidate/review state;
- `docs/continuity/CURRENT.md` is only the mutable current checkpoint/router.

The product-intent sections below distinguish **ACCEPTED / CURRENT DIRECTION** from **HYPOTHESIS / NEEDS VALIDATION / DEFERRED**. A hypothesis is not promoted to market fact merely because it appears in this repository.

Reconciled from the current repository plus the long-running product/architecture session on **2026-08-24**, using repository base `c03174a22f22090e878bb48dd8388c8bb47760ce` before this capture change. A second semantic-fidelity audit on the Issue #19 candidate tightened differentiation, switching-risk, MVP-scope, and validation wording without promoting additional market claims to accepted fact.

---

## 1. Product identity

### 1.1 Vision

**ACCEPTED / ASPIRATIONAL:** Lunowa aims to create the most comfortable email experience possible — internally often expressed as **「世界一快適なメール体験」**.

That phrase is a vision, not a measurable market claim or release acceptance criterion.

### 1.2 North Star

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

Lunowa is not primarily an inbox skin, visible-AI assistant, dashboard, CRM, or generic task manager. It is a **communication-management email product** whose job is to reduce the ongoing cognitive and operational burden of keeping communication obligations under control.

### 1.3 Internal product principle

> **Eliminate work, not control.**

The system should eliminate low-value monitoring, reconstruction, navigation, and decision work while preserving:

- source visibility;
- human final authority;
- reversibility/correction where practical;
- explicit sending/account boundaries;
- safe fallback when intelligence is unavailable.

### 1.4 The core optimization target

**ACCEPTED:** reduce the number of low-value things the user must remember, inspect, choose, and manually organize before reaching a meaningful action.

This is stronger than “make email faster.” A flow can be fast in clicks while still imposing repeated interpretation/decision work. Lunowa should reduce both.

---

## 2. The user problem

### 2.1 Communication Management Burden

Lunowa currently models the burden in four product dimensions:

1. **Monitoring cost / 時間** — remembering what must be checked again, when to follow up, and what may be becoming urgent.
2. **Execution cost / 操作** — searching, switching views/accounts, copying information, creating manual tasks, reopening threads, and repeated clicks.
3. **Interpretation cost / 視覚・理解** — reconstructing the current operational meaning of a thread: who owes what, what changed, what is waiting, and what matters now.
4. **Verification cost / 信頼** — repeatedly checking source mail “just in case” because the system cannot be trusted to preserve obligations, evidence, sender identity, or timing correctly.

A feature is valuable when it materially reduces one or more of these costs **without creating a larger trust, safety, complexity, or operating cost**.

### 2.2 The product is not optimizing for Inbox Zero

**ACCEPTED:** message count, unread count, archive rate, or Inbox Zero are not the primary product outcomes.

The important question is whether the user can safely stop manually carrying communication state in their head while still discovering the right work at the right time.

### 2.3 Failure modes Lunowa is intended to reduce

Representative user failures include:

- forgetting a material request hidden inside ordinary email;
- rereading a long thread to reconstruct “what am I supposed to do now?”;
- not knowing whether the user or the counterpart currently owns the next move;
- forgetting to follow up after sending something;
- snoozing/archiving something and later distrusting whether it will return;
- confusing a sender request with a safe/authorized action;
- sending from the wrong connected account;
- repeatedly checking mail that contains no current user action;
- manually duplicating email state into a separate task system merely to avoid forgetting it.

---

## 3. User / customer hypotheses

The market/ICP is **not yet considered validated or frozen**. Preserve these as hypotheses, not facts.

### 3.1 Primary early-user hypothesis

**HYPOTHESIS:** the strongest initial fit is likely among individual knowledge workers / prosumers / independent professionals whose email contains frequent operational obligations and whose current workflow requires substantial remembering, rereading, follow-up, or manual task transfer.

Useful candidate characteristics are more important than job title:

- email is operational, not merely newsletters/notifications;
- several conversations can require action or waiting at once;
- missing/late replies have real cost;
- the person revisits threads to remember state;
- multiple accounts/scopes may exist;
- the person values lower cognitive burden enough to change mail client/workflow.

### 3.2 Secondary early-user hypothesis

**HYPOTHESIS:** solo operators and small-business owners may have strong pain when booking, customer, supplier, document, invoice, or other operational commitments are carried through email but a full CRM/project-management system is too heavy.

This does **not** make Lunowa a CRM. The product should first prove that the same communication-management model solves the problem without B2B workflow sprawl.

### 3.3 Business model orientation

**CURRENT DIRECTION / HYPOTHESIS:** product design is primarily individual/prosumer-oriented, while light professional/small-business use may be supported naturally. A team/enterprise collaboration model is not a current v1 assumption.

### 3.4 What still needs validation

Before treating an ICP as established, collect evidence for:

- problem frequency and severity;
- current workaround and switching friction;
- whether Responsibility/attention behavior is materially better than existing mail + task tools;
- whether a cross-account/provider Responsibility workspace is materially more useful than a conventional unified inbox or repeated account switching;
- reachable distribution channel;
- willingness to pay;
- retention after novelty disappears;
- trust threshold for letting Lunowa manage attention.

Prior conversational discovery should not be treated as sufficient validation unless the evidence is promoted into an explicit research/decision artifact.

### 3.5 Primary product risk

**NEEDS VALIDATION:** the highest-level product risk is not whether Lunowa can be engineered. It is whether the differentiated experience is sufficiently better to overcome **switching cost and trust cost**.

The critical question is:

> Can the Responsibility-oriented, cross-account communication-management experience create enough recurring value that a real user changes or materially relies on their existing mail/workflow behavior?

This is intentionally stronger than “do users like the UI?”. Positive aesthetic or feature feedback does not establish switching willingness, repeated reliance, or willingness to pay.

---

## 4. Core jobs to be done

The user should be able to use Lunowa to accomplish these jobs with less mental bookkeeping:

### 4.1 “Tell me what actually needs me now”

The system should surface current user obligations rather than forcing the user to derive them from inbox order or unread state.

### 4.2 “Let me forget safely until the right condition”

Waiting/deferred work should be represented with a reliable return condition rather than relying on memory or transient client timers.

### 4.3 “Tell me who/what I am waiting for”

A sent message should not disappear into a generic Sent folder when the operational outcome remains pending.

### 4.4 “Give me the minimum context needed for the next decision”

One Moment should normally answer one primary current question and expose one primary safe action.

### 4.5 “Let me verify why the system believes this”

Source/evidence must remain accessible without forcing a permanent audit dashboard into the normal flow.

### 4.6 “Let ordinary email remain ordinary email”

Reading, composing, replying, searching, attachments, and basic navigation must remain familiar and usable even if AI/interpretation is unavailable.

---

## 5. Product experience thesis

### 5.1 System-led, not prompt-led

**ACCEPTED:** routine use should not begin with “Ask AI.”

Preferred flow:

```text
mail arrives / communication changes
  -> Lunowa preserves and normalizes authorized evidence
  -> AI/deterministic mechanisms understand candidate meaning
  -> trusted domain rules update accepted Responsibility state
  -> UI projection changes automatically
  -> user sees the prepared next context/action
```

AI should mostly work behind the interface. The user should not have to repeatedly ask the system to summarize, classify, or decide what needs attention.

### 5.2 AI prepares; human commits

**ACCEPTED:** human final authority remains the default for material external commitments and privileged actions.

The normal initial product must not autonomously send/delete mail, approve contracts, make payments, accept high-impact commitments, or perform other destructive/privileged actions merely because the model inferred intent.

A future narrowly validated automation mode would require a separate product/safety decision.

### 5.3 No default confidence-percentage UI

**ACCEPTED:** do not show model confidence percentages by default as a substitute for evidence or product logic. They add false precision and cognitive burden.

When uncertainty is material, surface the smallest useful uncertainty/question and the relevant evidence. When uncertainty is harmless, do not bother the user merely to make the model internally neat.

### 5.4 Trust ladder

When explanation is needed, prefer progressive disclosure in roughly this order:

```text
current conclusion/action
  -> short reason
  -> material source/provenance
  -> original communication
```

The original sent/received communication remains immutable evidence of what was communicated. AI summaries/interpretations are derived and may be corrected without rewriting the source.

### 5.5 Manual correction

**ACCEPTED:** explicit user correction can override the applicable Lunowa-derived field/state under the domain authority model, but it does not rewrite original communication or silently freeze unrelated fields forever.

---

## 6. Core product model

Detailed semantics are owned by `docs/product/responsibility/`; this section records only the product-level meaning.

### 6.1 Conversation is evidence context, not one task state

A Conversation may contain zero, one, or many independent Responsibilities.

### 6.2 Responsibility

A Responsibility is the smallest communication-bounded operational obligation / expected-outcome loop with a coherent closure condition.

### 6.3 User-facing projections

The primary product vocabulary is:

- `対応が必要` / My Turn;
- `待ち` / Waiting;
- `あとで` / Later;
- `完了` / Done;
- `確認` / Review when decision-critical ambiguity/safety requires it.

These are deterministic projections, not canonical lifecycle truth.

### 6.4 One Moment

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

When several Responsibilities exist, the interface should still avoid presenting several equal-priority CTAs. Selection favors material actionable user work, urgency/deadline/blocking, and safety rather than simply newest message.

### 6.5 Follow-up

Follow-up is normally a current reason/action inside My Turn after a waiting condition or trigger. It is not a separate canonical lifecycle species.

### 6.6 Temporal Contract

A Temporal Contract is a durable product promise describing when Lunowa will reconsider/resurface a Responsibility. The UI promise must eventually be backed by durable scheduling, idempotency, missed-event recovery, reconciliation, timezone correctness, and auditability.

---

## 7. Information architecture / UX direction

Detailed behavior remains in `docs/design/`.

### 7.1 Desktop/web shell

Current canonical high-level layout:

```text
Sidebar | Conversation List | Detail
```

Detail has two primary modes:

- `会話` — original communication/thread;
- `今の要点` — current operational Moment.

Normal row body opens `会話`; an interactive Responsibility/projection chip opens `今の要点`.

### 7.2 Stable shell, adaptive content

The spatial model should remain predictable while the Detail content adapts to the selected conversation/current need.

### 7.3 Familiarity before novelty

Do not make a user learn a new workflow language before ordinary mail works. Compose/reply/search/account identity should remain understandable from existing email mental models.

### 7.4 “10-second” usability target

**NEEDS VALIDATION / INTERNAL USABILITY HYPOTHESIS:** in representative prepared cases, a user should be able to open Lunowa and determine the next meaningful action/attention state in roughly **10 seconds or less**, without rereading the entire thread.

This is a design-validation target, **not a production SLA or proven market metric**. It should be tested with realistic scenarios rather than treated as true by declaration.

---

## 8. What is differentiation vs table stakes

### 8.1 Table-stakes capabilities

The following may be necessary for a credible email product but are not, by themselves, the differentiation thesis:

- multiple connected email accounts;
- Gmail/Microsoft provider support;
- normal compose/reply/forward/search;
- attachments;
- sent/drafts/archive/trash;
- responsive access;
- generic AI summarization/drafting.

In particular, **multi-account unification by itself is a baseline capability, not the core differentiator**.

Likewise, labels/workflow primitives such as `My Turn` or `Waiting` are useful parts of the experience but are **not assumed to be defensible differentiation on their own**.

### 8.2 Current differentiation hypothesis

**HYPOTHESIS:** the defensible product value is the combination of:

1. system-led communication understanding rather than prompt-led AI;
2. trustworthy Responsibility identity/state instead of message-level inbox status;
3. an **authorization-preserving cross-account/provider attention workspace** where the user can see what requires attention across connected accounts/scopes without repeatedly switching inboxes, while account/scope provenance and sender identity remain explicit;
4. deterministic My Turn / Waiting / Later / Done / Review projections over that Responsibility state;
5. durable “forget safely” Temporal Contracts;
6. one-question/one-action Moment interaction that reduces decision work;
7. source/provenance visibility and conservative safety boundaries;
8. graceful degradation where ordinary email still works without AI.

The cross-account hypothesis does **not** authorize cross-account semantic auto-merge. Multiple accounts may feed a unified attention experience while Responsibility identity, authorization, scope, and sending boundaries remain explicit; semantic similarity alone never collapses account ownership.

This is a **market differentiation hypothesis**, not proof that current competitors lack similar capabilities. Prior competitor research supports the internal conclusion that a unified inbox or My Turn/Waiting-style labels alone are not enough to assume differentiation, but current competitor functionality/pricing must be re-checked against current primary sources before any external positioning claim is made.

### 8.3 Differentiation must survive switching-cost evidence

A feature or prototype should not be called differentiated merely because it is novel inside Lunowa. The relevant test is comparative behavior/value:

- does it reduce real monitoring/reconstruction/manual task-transfer burden compared with the user's current workflow?;
- does the cross-account Responsibility view reduce repeated account/inbox switching without obscuring account boundaries?;
- does the user trust it enough to stop repeatedly re-checking the source inbox?;
- is the gain strong enough to justify changing or depending less on the existing workflow?

Until evidence exists, these remain product hypotheses rather than validated advantage.

---

## 9. Initial product scope

Detailed UI scope is in `docs/design/DESIGN.md`.

### 9.1 Current v1 direction

A credible initial product direction includes ordinary daily-email capability plus the differentiated Responsibility/attention layer, including:

- Gmail first; Microsoft/Outlook behind the same product/provider boundaries later;
- one or multiple accounts/scopes;
- Conversation/message reading;
- compose/reply/reply-all/forward with explicit From identity;
- drafts/attachments/search/basic mailbox operations;
- My Turn / Waiting / Later / Done / Review projections;
- Moment View;
- Temporal Contract/resurfacing;
- trust/error/AI-degraded states;
- responsive layouts.

**Important scope classification:** this is the accepted **design/product direction for a credible client**, not evidence that every listed capability belongs in a market-validated MVP or must ship before learning. The exact release MVP remains adjustable as product evidence arrives. The next accepted product-validation slice is still the high-fidelity fake-data UI in Section 10, not full provider/AI/runtime breadth.

### 9.2 Platform direction

**CURRENT ACCEPTED ENGINEERING/PRODUCT DIRECTION:** responsive **web-first** implementation using the accepted Next.js/TypeScript stack. Native mobile is not required before the web interaction model is validated.

Earlier native-mobile/React-Native-first exploration is **not current implementation authority**.

### 9.3 Language direction

**CURRENT DIRECTION:** optimize initial product copy/validation for Japanese users while keeping Lunowa-owned UI internationalizable from the beginning (`next-intl`). English expansion is a later product/distribution option, not a current release promise.

### 9.4 Explicit v1 non-goals

Do not turn the first product into:

- a full CRM;
- a project-management suite;
- a calendar-first productivity system;
- a graph explorer as primary navigation;
- a generic automation/rule builder;
- a replacement mail transport;
- a feature-complete Gmail/Outlook clone;
- a chat-first AI product;
- a generic BPM/workflow engine;
- an autonomous high-impact action agent.

---

## 10. MVP and validation logic

### 10.1 The first product slice

**ACCEPTED:** the first product slice is the high-fidelity fake-data UI, not Gmail OAuth, AI, or production persistence.

Why:

- it tests whether the differentiated interaction model is understandable before expensive integrations;
- it prevents provider/AI complexity from hiding UX flaws;
- fake fixtures can represent the intended Responsibility projections without prematurely freezing physical schema assumptions.

### 10.2 Product questions the fake-data slice should answer

The slice is valuable only if it helps test questions such as:

- Can a user understand `対応が必要 / 待ち / あとで / 完了 / 確認` without extensive instruction?
- Does `今の要点` reduce reconstruction and decision work compared with opening/re-reading the thread?
- Does one primary action feel helpful rather than controlling?
- Can users understand why something is Waiting or Later?
- Does source/provenance access create enough trust without visual overload?
- Can several Responsibilities exist without making the UI complex?
- Can users understand and benefit from a cross-account attention view while still knowing which account/scope/source an item belongs to?
- Is the ordinary email path still familiar enough?

### 10.3 Technical proof is not product validation

Responsibility L2 PostgreSQL/Drizzle executable proof is important engineering risk retirement, but it does not prove demand, usability, willingness to pay, retention, switching willingness, or differentiation.

Likewise, a visually polished fake-data UI does not prove the semantic reducer/provider runtime, and a technically correct runtime does not prove that users will switch or keep using the product.

Keep these evidence classes separate.

### 10.4 Product-validation evidence ladder

**NEEDS VALIDATION:** the current product-learning target is a progressively stronger evidence chain, not one binary “MVP complete” event.

A representative path is:

```text
representative target user understands the workflow
  -> can use it on realistic communication without extensive instruction
  -> reaches the next meaningful action/state with less reconstruction/decision work
  -> reduces repeated inbox/thread re-checking or manual task-transfer behavior
  -> returns and relies on it across subsequent days/weeks
  -> expresses credible continued-use / switching / payment intent
```

Each arrow requires evidence. Do not infer later-stage retention/payment/switching from an earlier-stage prototype-usability result.

Use the cheapest experiment that can falsify the highest-impact open product assumption: interview/workflow observation, high-fidelity prototype, concierge/manual operation, limited real-inbox slice, payment-intent test, or another smaller experiment before broad implementation when appropriate.

---

## 11. Product success and candidate metrics

No single metric is frozen yet. Use metrics that test the product promise rather than implementation throughput.

### 11.1 Candidate experience metrics

**NEEDS VALIDATION:**

- time-to-next-meaningful-action/state recognition;
- number of user decisions/navigation steps before the meaningful action;
- thread rereads / manual re-check frequency;
- account/inbox switching frequency where multiple accounts matter;
- rate of missed/late material obligations;
- proportion of Waiting work that returns at an appropriate time;
- correction/review burden caused by wrong interpretation;
- user ability to explain “why is this here now?”;
- successful task/outcome completion with fewer management steps.

### 11.2 Critical quality metric direction

A particularly dangerous failure is a **false negative on a real material user obligation**: something truly requiring the user is hidden as Done/Waiting/Later/NONE or silently omitted.

This safety/quality concern must be balanced against the opposite product failure of sending harmless uncertainty into Review and forcing the user to manage the model.

### 11.3 Business/product metrics

**NEEDS VALIDATION:** retention, repeated weekly/daily use, switching/dependency behavior, conversion/willingness to pay, acquisition efficiency, and support burden matter more than code volume, AI call count, or number of features.

---

## 12. Monetization / distribution status

### 12.1 Monetization

**HYPOTHESIS:** a paid subscription/prosumer model is plausible because the product aims to save recurring cognitive/operational time and reduce missed obligations.

**NOT DECIDED:** exact price, free tier, trial shape, billing interval, packaging, and individual-vs-business plans.

Do not freeze a price from old competitor comparisons. Validate willingness to pay with target users/payment intent before treating pricing as accepted.

### 12.2 Distribution

**OPEN / NEEDS VALIDATION:** no distribution channel is considered proven yet.

Future product work must test how target users are actually reached; “build first, find users later” is not the operating assumption.

### 12.3 Retention

**OPEN / NEEDS VALIDATION:** the key retention hypothesis is that trustworthy ongoing attention management is recurring enough to become habitual and valuable after novelty fades.

---

## 13. Trust, safety, and autonomy boundaries

Product-level rules that should not be weakened casually:

- requested action is not automatically the safe next action;
- original communication/source remains inspectable;
- model confidence is not authority;
- user corrections are explicit and field-scoped where relevant;
- sender account is explicit before sending;
- send click is not provider-reconciled acceptance;
- core reading/composing/search/navigation remains usable when AI fails;
- prompt/tool-like text in email is untrusted content and gains no system authority;
- search/retrieval/AI context is authorization-filtered before exposure;
- cross-account semantic similarity does not authorize Responsibility merge;
- high-impact external actions retain human confirmation by default.

---

## 14. Important supersessions / directions not to resurrect by accident

These distinctions materially affect future product/engineering reasoning.

### 14.1 `ActionItem` -> `Responsibility`

`Responsibility` is the current canonical semantic concept. Older `ActionItem` framing is superseded.

### 14.2 Single lifecycle state -> orthogonal state

The old monolithic lifecycle model is superseded. `My Turn / Waiting / Later / Done / Review` are product projections over orthogonal canonical state.

### 14.3 Follow-up as lifecycle -> follow-up as action/reason

Follow-up normally becomes renewed My Turn work after a trigger; it is not a separate canonical workflow species.

### 14.4 Ask-AI-centric experience -> system-led intelligence

Routine users should not need to prompt AI to organize ordinary communication. AI is mostly an invisible interpretation/preparation layer.

### 14.5 Native-mobile-first -> responsive web-first

Earlier mobile-native/React-Native-first exploration is superseded by the current accepted responsive web-first implementation path. Reopen native-first only with new product/distribution evidence.

### 14.6 Provider/AI-first implementation -> fake-data UX first

The current implementation plan deliberately validates the high-fidelity interaction model before Gmail/AI integration breadth.

### 14.7 Multi-account aggregation as differentiation -> cross-account Responsibility hypothesis

Plain account aggregation/unified inbox is treated as baseline capability. The remaining unvalidated differentiation hypothesis is that Lunowa can organize attention **across connected accounts/providers by Responsibility** while preserving explicit account/scope/provenance/sender boundaries.

---

## 15. Deferred exploratory directions — not current scope

Earlier product exploration has included ideas such as:

- relationship/person-history maps beyond the current lightweight context panel;
- subscription/billing-email management;
- travel/itinerary bundling from email;
- location/context-aware work/personal switching;
- morning/time-of-day organization rules.

These are **DEFERRED / NOT VALIDATED**. They are recorded only so they are not mistaken for forgotten commitments or current roadmap items. Reintroduce one only after the core product is validated and the feature addresses a demonstrated user problem better than simpler alternatives.

---

## 16. Current major unknowns

Do not let future sessions silently convert these into decisions:

- exact early ICP and segment priority;
- demand strength;
- whether the Responsibility-oriented cross-account experience is materially better than existing inbox/task workflows;
- switching willingness and switching/trust cost;
- willingness to pay and pricing/package;
- distribution channel;
- retention after initial novelty;
- exact balance between automatic attention management and explicit user control;
- how prominent `Review` should be in navigation;
- notification policy/strength on resurfacing;
- historical-initial-sync activation policy;
- whether/when native mobile becomes necessary;
- which later convenience features deserve scope after the core Responsibility experience is validated.

Provider/API/legal/platform facts are also time-sensitive and must be re-checked from current authoritative sources when they affect a decision.

---

## 17. Current technical/domain state — routing, not duplication

To preserve the product without creating a second technical source of truth:

- **Responsibility L0/L1/L2 state:** `docs/product/responsibility/README.md`;
- **exact L2 candidate:** `docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md`;
- **executable freeze gate:** `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md`;
- **conceptual data model:** `docs/product/DATA-MODEL.md`;
- **architecture:** `docs/product/ARCHITECTURE.md`;
- **module contracts:** `docs/product/CONTRACTS.md`;
- **technology stack:** `docs/product/TECH-STACK.md`;
- **implementation order:** `docs/product/IMPLEMENTATION-PLAN.md`;
- **UX:** `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md`;
- **live task/review state:** current GitHub Issues/PRs/CI.

Do not copy detailed schemas/Responsibility oracles into this product thesis.

---

## 18. Decision rule

When a future product decision is ambiguous, prefer the option that maximizes the probability of solving a real recurring communication-management problem while:

1. reducing monitoring/execution/interpretation/verification burden;
2. reducing low-value user choices before meaningful action;
3. preserving source visibility and human control;
4. keeping ordinary email familiar;
5. avoiding hidden cross-account/scope behavior while testing the value of a cross-account Responsibility view;
6. degrading safely when AI/provider/scheduler components fail;
7. avoiding feature/infrastructure breadth unsupported by evidence;
8. keeping the change reversible where possible;
9. distinguishing accepted evidence from market/product hypotheses;
10. improving validated user value rather than optimizing code/AI novelty;
11. when several next actions are possible, preferring the **smallest/cheapest experiment that can falsify the highest-impact unresolved product assumption** before broad implementation.

If stronger evidence changes a product-level decision, update this document and the owning canonical design/domain/architecture artifact in the same accepted change where applicable.
