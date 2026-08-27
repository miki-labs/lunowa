# Issue #36 Fieldwork Protocol — 2026-08-27

## Status

**NONCANONICAL PRODUCT-DISCOVERY RESEARCH PROTOCOL.**

This document operationalizes GitHub Issue #36, `[Product Discovery]: Validate the first ICP and real communication-monitoring burden`, against current `main` after Product Content COMPLETE.

Baseline at creation:

- current-main baseline: `d569d8f1a61b45a0d733a53dc2b90ccc37e67bb9`;
- Issue #36 body: current as of `updated_at=2026-08-26T17:19:39Z`;
- Issue #45: complete/closed;
- Issue #36 is the current highest Product-discovery gate;
- no implementation is authorized by this protocol.

Current Product authorities constrain researcher interpretation but are **not participant-facing hypotheses**:

1. `docs/product/PRODUCT.md` — highest-level Product contract;
2. `docs/product/PRODUCT-CONTENT.md` — detailed Product operating contract / final Feature Matrix;
3. `docs/product/GOLDEN-SCENARIO-BANK.md` — Product-level regression bank, subordinate to Responsibility semantics;
4. `docs/product/responsibility/` — fixed Responsibility semantic authority.

Do not teach participants Lunowa ontology, Golden Scenarios, `Responsibility`, `Managed`, `Review`, `Needs You`, `Moment`, `Waiting`, or the current Feature Matrix before problem evidence is collected.

The study validates a **problem/segment hypothesis**, not Product semantics, UI, market size, pricing, PMF, WTP, retention, production reliability, or implementation readiness.

---

# 1. Decision this study must make

Determine whether a **coherent and reachable segment** repeatedly carries unresolved email-borne coordination through manual attention, repeated rechecking, or parallel reminder scaffolding, despite its actual current tools, strongly enough to justify the next bounded delegated-monitoring mechanism test.

Primary question:

> **Does a specific reachable cohort have recurring, consequential, currently under-served communication-monitoring behavior?**

A positive Issue #36 result is **not**:

- participants liking Lunowa;
- generic email stress;
- high email volume;
- interest in AI;
- enthusiasm for summaries/drafts;
- hypothetical purchase intent;
- preference for a new inbox;
- a claim that most workers have the problem.

A positive result requires recent-event evidence that a coherent cohort repeatedly experiences monitoring burden **after accounting for the tools it actually uses**.

---

# 2. Evidence classes

Use Issue #36 evidence classes exactly.

## `DIRECT OBSERVED`

The researcher directly observes a current artifact/tool state or behavior during the session.

Examples:

- participant shows a currently selected redacted reminder/task state;
- participant demonstrates how a specific workflow is tracked.

A verbal description of a past action is not direct observation.

## `RECENT-EVENT RECALL`

Participant reconstructs a specific recent event/workflow, ideally from the last 7–14 days, with concrete sequence/details.

Artifact-aided recall remains `RECENT-EVENT RECALL` unless the researcher directly observes a current state/behavior.

## `SELF-REPORT`

General beliefs, estimates, preferences, satisfaction claims, hypothetical delegation responses, and adoption statements.

## `EXTERNAL EVIDENCE`

Published/current external source evidence.

External evidence shapes method/recruitment priors but never substitutes for participant evidence.

## `INFERENCE`

Researcher conclusion derived from evidence.

Every material inference should point to supporting and contradicting cases/evidence classes in the protected research record.

## `UNKNOWN`

Not established. Do not force an answer where data do not support one.

---

# 3. Methodological posture

## 3.1 Recent-event / event-centered interviewing

Anchor interviews in participant-selected recent events rather than abstract opinions.

For each valid interview, reconstruct 2–4 communication matters from roughly the last 7–14 days where possible:

- at least one multi-step/unresolved matter;
- at least one contrasting case that was simple, already handled well, or did not require monitoring.

Build a timeline:

```text
initial communication
-> unresolved outcome
-> expected next event / next-move belief
-> participant action/scaffolding
-> waiting / continued work
-> self-check(s), if any
-> meaningful state change
-> completion / still open / abandonment
```

The goal is to recover sequence, monitoring behavior, tool use, and consequence—not to map the participant into Lunowa ontology.

## 3.2 Human moderation for the exploratory wave

The first exploratory wave is **human-moderated**.

Current 2025–2026 evidence supports this boundary:

- AI interviewers can provide consistency and scalable adaptive follow-up;
- model-to-model interviewing quality differs materially;
- deployed multimodal AI interviewing still shows probe-light behavior, multi-question turns, information loss, premature termination, latency/interruption, and shallower disclosure in some settings;
- qualitative researchers continue to report privacy, ethics, bias, and methodological-intent concerns around LLM use.

AI may assist with:

- guide rehearsal;
- recruitment-copy critique;
- de-identified structure checking;
- coding suggestions;
- contradiction/counterexample search;
- synthesis drafts.

AI is not an independent validator of:

- participant eligibility;
- fraud adjudication;
- evidence classification;
- segment support;
- Product promotion.

Raw client/email content and participant-identifying material must not be sent to an external LLM unless an explicitly approved research data-handling decision covers that processor/use.

## 3.3 Gate before later AI-moderated breadth

Do not silently change interviewer mode and pool results.

If later AI-moderated interviews are considered after the human guide stabilizes:

1. label every case with interviewer mode/model/orchestration version;
2. pre-specify a **bridge/compatibility evaluation** against the stable human guide;
3. audit at minimum:
   - event concreteness reached;
   - deepening-probe behavior;
   - one-question-at-a-time adherence;
   - leadingness;
   - premature termination/information loss;
   - ability to surface contrasting/negative cases;
   - evidence-class yield;
   - participant comprehension/trust concerns;
   - case-level classification consequences;
4. do not pool AI- and human-moderated evidence until compatibility is explicitly accepted for the Issue #36 decision;
5. if compatibility is not supported, analyze AI-moderated data as a separate evidence stream.

The bridge is a methodological comparability test, not a competition to prove AI is better or worse.

## 3.4 Founder-expectancy controls

Assume the founder/moderator has a strong incentive to find the Product problem.

Required controls:

- do not pitch Lunowa before event reconstruction;
- use the same neutral core guide for positive and negative-control participants;
- require one `already handled well / did not need monitoring` case where possible;
- record structured event evidence before Product interpretation;
- preserve counterexamples beside confirming cases;
- after each valid interview record:
  - `What evidence weakens the current cohort hypothesis?`
  - `What did I ask or assume that may have led the participant?`;
- after each batch recruit the highest-information case most likely to contradict the emerging explanation;
- arrange independent second-pass review where feasible for the first few interviews and at least one case in any cohort considered for support;
- AI adversarial review may find errors but is not labeled independent human validation.

---

# 4. Sampling strategy

## 4.1 Unit of support

`SUPPORTED FOR NEXT TEST` is **cohort/segment-specific**.

Do not combine heterogeneous consultants, agency operators, founders, recruiters, accountants, lawyers, etc. into one sample and then claim overall saturation or support.

The analysis unit is the coherent workflow-defined cohort that could plausibly become the first segment.

## 4.2 Information power

Use information power rather than a magic interview count.

Sample adequacy depends on:

1. narrowness of the study aim;
2. specificity/homogeneity of the cohort;
3. relevant prior theory/evidence;
4. quality/depth of dialogue;
5. analysis strategy, including within-case vs cross-cohort comparison.

A broad heterogeneous comparative design requires more information than one narrow homogeneous cohort.

## 4.3 Planning envelope

Use **adaptive blocks**, not fixed quotas.

Planning reference:

- initial total envelope: approximately **15–24 valid interviews** if information value continues;
- typical batch: **4–6 valid interviews** before analysis/redirect;
- this is a resourcing reference, not a pass threshold.

Do not mechanically complete 5–6 people in every cohort.

If one cohort rapidly shows a coherent high-information pattern, deepen it rather than spending equal quota on low-value cohorts. If it is weak, redirect before exhausting a nominal quota.

## 4.4 Primary positive-search priors

These remain **recruitment priors, not accepted ICPs**.

### Cohort A — independent / fractional / solo professional services

Look for:

- multiple external counterparties;
- asynchronous email-borne requests/approvals/documents/decisions;
- personal responsibility for follow-up;
- multiple unresolved matters concurrently;
- waiting lasting overnight or longer;
- no single strong system of record that adequately owns heterogeneous communication state;
- practical autonomy to try a companion workflow.

### Cohort B — small agency / client-service operator

Use primarily to test whether project/CRM/shared-inbox structure already removes enough monitoring burden.

### Cohort C — small B2B owner/operator

Use to discover which workflow characteristics—not title—predict burden.

## 4.5 Negative-control / boundary cohorts

Intentionally include cases where stronger structured systems may solve the problem:

- recruiter with mature ATS;
- accountant/practice user with client-request/workflow software;
- lawyer/practice user with matter/case tooling;
- sales/service operator with disciplined CRM;
- participant with a human assistant/operations function that reliably owns follow-up.

Negative controls test Product jurisdiction and baseline adequacy. They do **not** count toward saturation of a positive cohort.

---

# 5. Recruitment

## 5.1 Preferred channel order

1. direct/warm professional-network outreach for early high-context recruiting;
2. a materially independent professional network/source to counter homophily;
3. verified B2B research panels as a supplement;
4. Japanese panel/recruiting vendors when needed;
5. open social recruitment only with stronger fraud controls.

Do not let support rest entirely on one personal network or one panel source. Cross-source recruiting is a robustness check, not statistical representativeness.

## 5.2 Neutral public recruitment copy

Recommended framing:

> **仕事上のメールや他のツールをまたいで、途中の案件・やり取りをどのように把握しているかを調べています。最近の具体的な仕事の流れについて45分ほどお話を伺います。現在のツールで十分うまくいっている例も重要です。**

Do not publicly advertise:

- `waiting/open loops`;
- `rechecking` as the desired pain;
- Lunowa feature concepts;
- exact qualification rules.

## 5.3 Incentive reference

Current Macromill 2026 operational guidance gives broad Japanese reference ranges around:

- 60–90 minute 1:1 depth interview: roughly ¥3,000–¥15,000;
- B2B/expert 60+ minute interview: roughly ¥10,000–¥30,000, with scarce experts sometimes higher.

Practical pilot:

- standard 45-minute professional interview: **¥8,000–¥10,000**;
- scarce/high-opportunity-cost B2B participant: up to roughly **¥12,000–¥15,000** if fill-rate evidence requires it.

This is an operational starting point, not a market truth.

Compensation rules:

- compensate eligible participant time, not Product-supportive answers;
- never withhold payment because evidence is disconfirming;
- define suspected-fraud/ineligibility handling before recruitment;
- do not over-emphasize incentive in public copy;
- keep payment/admin records separate from analytical evidence.

---

# 6. Recruitment screener

Target 8–12 substantive questions. Do not mention Lunowa or the desired monitoring hypothesis.

Before scaled recruitment, run **2–3 target-like pilot comprehension checks** to catch gross ambiguity. This is **not screener validation or saturation**. Continue revising if live recruiting shows misinterpretation.

## Q1 — Work arrangement

Which best describes your current work situation?

- self-employed / independent professional;
- founder/owner of a small business;
- employee at a small company;
- employee at a medium/large company;
- other.

Context/quota only. Title never qualifies by itself.

## Q2 — External coordination

In a typical week, with which groups do you personally communicate to move work forward?

- clients/customers;
- prospects;
- vendors/suppliers;
- contractors/freelancers;
- professional advisers;
- partner companies;
- internal coworkers only;
- other.

## Q3 — Channels used in the last 2 weeks

Which did you personally use for work coordination?

- email;
- Slack/Teams/Chatwork/other chat;
- LINE/other messaging;
- phone;
- scheduled meetings;
- CRM/ATS/ticketing/client portal;
- project/task system;
- other.

Record approximate use/context; email need not be the only channel.

## Q4 — Recent multi-step email work

Thinking only about the last 14 days, about how many work matters involving email took more than one step or remained in progress beyond the initial send/receive?

- none;
- 1;
- 2–3;
- 4–7;
- 8+;
- not sure.

This estimate is screening context, not measured prevalence.

## Q5 — What they actually did while work stayed in progress

During the last 14 days, which did you personally do at least once for an email-related matter that did not finish immediately?

- reopened Inbox/thread;
- searched Sent;
- used star/flag/label/folder;
- snoozed an email;
- set a mail-client reminder/follow-up;
- created a calendar reminder;
- created a task;
- wrote a note/spreadsheet entry;
- relied on CRM/ATS/ticket/project/practice software;
- asked another person to track it;
- did nothing / simply continued work;
- other.

## Q6 — Existing systems

Which tools currently track client/candidate/case/project/work status for you?

Open text + categories. Do not assume feature availability means feature use.

## Q7 — Personal ownership

When an external matter communicated through email is unfinished, who normally remains responsible for noticing progress/stall?

- mostly me;
- shared with coworkers;
- assistant/operations role;
- structured software reliably handles it;
- varies substantially.

## Q8 — Recent concrete example

Without names/confidential content/message text, briefly describe one work matter from the last 14 days involving email that took more than one step or did not finish immediately. What happened after the first message?

Manual review required. Concrete but Product-disconfirming answers are valid.

## Q9 — Already-solved contrast

In the last 14 days, was there a work matter you did **not** need to remember or manually recheck because another system/person handled it well? If yes, briefly describe how.

## Q10 — Interview/privacy logistics

Would you be comfortable discussing 2–4 recent examples in a 45-minute call if names/content can be redacted and you never need to expose private client email?

- yes;
- verbal reconstruction only;
- no.

Artifact display is optional.

---

# 7. Qualification logic

## Strong primary-cohort signals

Look for a pattern across several criteria:

- email materially carries external coordination;
- participant personally owns monitoring/follow-up;
- specific recent multi-step events can be reconstructed;
- unresolved matters persist overnight or longer;
- manual self-checking or parallel scaffolding occurs, **or** meaningful miss/latency consequence exists;
- progress/reply does not always equal final outcome;
- current structured system does not fully own the heterogeneous loop;
- participant is practically reachable/autonomous enough for a later test.

Do not require every signal.

## Negative-control eligibility

Preserve participants with similar coordination work whose important loops are reliably handled by a stronger structured system/person.

## Deprioritize/reject primary-cohort recruitment when

- no concrete recent event can be provided;
- work is almost entirely synchronous/non-email;
- monitoring is routinely delegated away from participant;
- every material loop is already reliably handled by another system;
- screening answers are materially inconsistent/fabricated after review.

Rejection is a sampling decision, not market evidence.

---

# 8. Fraud / professional-participant integrity

Online incentivized qualitative research has a documented imposter/fraud risk. Use layered controls.

## Prevention

- keep exact qualification logic private;
- manually review open-text event detail;
- use verified/professional recruitment sources where practical;
- for unverified sources use a short pre-call/secondary confirmation;
- optionally confirm professional context with consent without storing unnecessary PII in GitHub;
- do not make camera-on the only verification method.

## In-session checks

- casually re-ask one or two screener facts;
- probe concrete event sequence;
- inspect whether tool/workflow details remain coherent;
- watch for a **cluster** of red flags rather than one signal.

Potential red flags:

- generic/scripted descriptions;
- inability to elaborate a supposedly recent event;
- contradictory employer/tool/workflow facts;
- duplicate/contact-pattern anomalies;
- unusual recruitment bursts;
- repeated incentive-focused communication.

## Adjudication

Before recruitment starts, define:

- who reviews suspected fraud/ineligibility;
- what data are excluded/quarantined;
- what compensation rule applies;
- how decision is logged;
- how accessibility/privacy alternatives are preserved.

Do not accuse/exclude from one ambiguous flag.

Maintain a separate recruitment-integrity log outside Product evidence. Never place raw identity documents, contact details, IP addresses, or private messages in public GitHub.

---

# 9. Interview guide — 45 minutes

## 0–3 min — consent / neutral framing

> **仕事上のメールや他のツールをまたいで、途中の仕事をどう把握しているかを調べています。最近実際に起きた例を中心に伺います。現在のツールで十分うまくいっている例も同じくらい重要です。商品を売るための面談ではなく、正解はありません。機密名・認証情報・メール本文は共有しないでください。**

Recording is only used under the pre-fieldwork data-handling decision and explicit consent. Do not introduce Lunowa solution concepts.

## 3–7 min — factual work context

- Who do you coordinate with externally?
- Which channels/tools are involved?
- Is there an official place where work status lives?
- Who notices when something stalls?

## 7–22 min — Event A: recent multi-step matter

Opening:

> **最近の仕事で、メールが関わっていて、一度の送受信だけでは終わらなかった件を1つ思い出してください。最初から順に教えてください。**

Neutral probes:

1. What outcome were you trying to reach?
2. What started it?
3. At that point, who/what did you think had the next move?
4. What did you expect to happen next?
5. What did you do immediately afterward?
6. When did you next think about it? What triggered that?
7. Did you look anywhere for status? Where?
8. Did you create any reminder/task/note/calendar/flag? Why that method?
9. Did a message arrive before the actual outcome was finished?
10. If so, what changed and what remained open?
11. How did you decide when to look again?
12. What counted as truly finished?
13. What would happen if you forgot/were late?
14. What did your current tools handle well?
15. What, if anything, still required your own memory/checking?

For every remembered self-check, ask **why the check occurred**. If there was no self-check, preserve that as disconfirming evidence.

## 22–32 min — Event B: deliberate contrast

Ask for a recent case that differed materially:

- another system/person handled it well;
- reply = completion;
- it resolved quickly;
- participant did not need to recheck;
- or it failed/was forgotten.

Prompt:

> **逆に、似ているように見えるけれど、自分で気にしておく必要がなかった最近の件はありますか？**

Goal: discover the boundary.

## 32–38 min — actual baseline workflow

- Across these examples, how do you know what needs you now?
- Is there one place you trust or do you reconstruct across several places?
- Which existing tool solves this best?
- Which exact function do you actually use?
- Is that function enabled/automatic/manual?
- When did it last save you from checking?
- When did it fail to cover the case?
- Have you stopped using a reminder/follow-up tool? Why?

If the participant names Gmail/Outlook/Superhuman/Fyxer/Shortwave/CRM/etc., ask about the **feature actually used**, not what the researcher knows the product can do.

## 38–43 min — delegation boundary only after behavior

This is `SELF-REPORT` and secondary to problem evidence.

Neutral bounded scenario:

> **仮に、1つの未完了のメール上の件について、元のやり取りをいつでも確認でき、指定した出来事や時点で必要なときだけ戻してくれる仕組みがあるとします。外部へのメール送信はあなたの承認なしには行いません。その場合でも、自分で確認し続ける必要があると感じるのはどんな点ですか？**

Probe:

- What kind of miss would break reliance?
- What evidence would you need to know it is still monitoring?
- What would you never delegate?
- Which current tool would it replace/coexist with?

Do not ask `Would you use/buy Lunowa?` in Issue #36.

A cautious hypothetical answer does not erase observed recent problem evidence. A categorical structural reason safe monitoring could never be delegated may weaken the wedge, but remains self-report until behavior is tested.

## 43–45 min — close

- Is there an example that contradicts what we discussed?
- Who has a materially different workflow we should interview?
- Follow-up permission only if needed.

---

# 10. Participant-led artifact use

Artifact use is optional and controlled by participant.

Preferred hierarchy:

1. verbal reconstruction;
2. participant-created redacted timeline;
3. selected/redacted artifact screen-share if comfortable.

Never require:

- inbox login/access;
- credentials;
- raw client email transfer;
- unrelated messages;
- screenshot upload to GitHub.

Moderator should interrupt unnecessary exposure of names/client details.

Optional pre-task:

> **面談前に、直近2週間から2件だけ思い出しておいてください。①一度では終わらなかったメール関連の仕事、②他の仕組みや人が十分うまく管理してくれた仕事。メールそのものを送る必要はありません。**

---

# 11. Research data model and storage boundary

## 11.1 Public GitHub is publication, not working-data storage

This repository is public. Removing names/emails does not automatically make a participant/loop record safe for public release.

A combination of profession, event date, tool stack, relationship type, unusual incident, quote, or recruitment context can permit re-identification.

Therefore participant/loop-level working evidence is **not stored in public GitHub by default**.

## 11.2 Storage tiers

### `R0 — Public durable GitHub`

Allowed:

- protocol/method;
- aggregated cohort findings;
- disclosure-safe counts/ranges;
- synthesized supporting and contradicting patterns;
- high-level limitations;
- final Issue #36 disposition;
- next experiment;
- minimal paraphrases/quotes only after public-disclosure review.

Not allowed by default:

- participant-code rows;
- loop-level matrix rows;
- exact dates tied to rare events;
- detailed rare profession/tool/event combinations;
- raw/verbatim transcripts;
- raw quotes that may identify speaker/context;
- contact/recruitment/admin data;
- screenshots/raw artifacts.

### `R1 — Protected research working store`

Contains:

- pseudonymous participant records;
- structured loop-level matrix;
- interview notes;
- coding/claim-evidence mapping;
- disclosure-sensitive detail needed for audit/reanalysis.

R1 requires access control and is not public.

### `R2 — Identity / admin mapping`

Contains only what is operationally required for:

- contact/scheduling;
- participant-code mapping;
- consent status;
- compensation administration;
- follow-up permission.

R2 is stored separately from R1 and has stricter/minimal access.

### `R3 — Raw media/transcript`

Default for first exploratory wave: **not collected**.

If later enabled:

- explicit approval in the data-handling decision;
- explicit participant consent;
- protected storage;
- shortest defensible retention;
- deletion after structured extraction/quality review according to the declared schedule;
- no automatic upload to an unapproved AI/transcription processor.

## 11.3 Public disclosure review: R1 -> R0

Before moving a finding to public GitHub:

1. remove direct identifiers;
2. generalize/suppress rare quasi-identifiers;
3. remove unnecessary exact dates/company/client details;
4. inspect combinations for re-identification risk;
5. avoid verbatim quotes by default; prefer paraphrase;
6. if a quote is necessary, use only the minimum text and confirm it is appropriate under the participant notice/consent and disclosure review;
7. ensure the published artifact preserves the analytical conclusion without exposing unnecessary participant detail.

Do not call ordinary pseudonymization `anonymous` or legally anonymous processed information unless the applicable standard is actually satisfied.

---

# 12. Protected evidence matrix

The following belongs in **R1**, not public GitHub.

## Participant-level fields

- participant code;
- cohort hypothesis;
- recruitment source class;
- broad work arrangement;
- external counterparty types;
- primary communication channels;
- actual baseline tools/features;
- personal monitoring ownership;
- validity/limitations note.

## Loop-level fields

| Field | Record |
|---|---|
| evidence class | observed / recent-event recall / self-report |
| non-sensitive outcome | operational description |
| external dependency | person/org/event/time/document/etc. |
| approximate start | date/range |
| open duration | range |
| next-move belief | participant wording; do not force ontology |
| expected event | participant wording |
| any reply sufficient? | yes/no/context |
| `N_self_check` | reconstructed count/range/unknown |
| self-check triggers | why each remembered check occurred |
| scaffolding | star/snooze/reminder/task/calendar/CRM/note/person/etc. |
| reconstruction episode | whether reread/reconstruction occurred |
| meaningful progress | what changed |
| closure | what counted as finished |
| failure/latency | forgotten/late/duplicate/unnecessary check |
| consequence | operational/economic/relationship if supportable |
| current solution | exact tool/feature actually used |
| current solution adequacy | what it handles |
| residual gap | what remains manual/under-served |
| contrast | already-solved/no-monitoring case if applicable |

Do not collapse this into one weighted pain score.

## Baseline-capability rule

For named tools distinguish:

```text
feature exists externally
!= participant has access
!= feature is enabled
!= participant actually uses it
!= participant trusts it
!= feature solves this loop
```

This is critical because incumbent email/AI capability changes rapidly.

---

# 13. Analysis process

## 13.1 Within-case first

For each loop produce a compact factual sequence before theme coding.

Separate:

- what happened;
- participant explanation;
- researcher inference.

## 13.2 Cohort-specific cross-case analysis

Within each candidate cohort compare:

- number/types of unresolved dependencies;
- manual rechecking;
- parallel reminder scaffolding;
- reply != outcome;
- reconstruction cost;
- delay/miss consequences;
- current-tool adequacy;
- conditions where monitoring is already relinquished;
- conditions that prevent relinquishment.

Do not pool heterogeneous cohorts to manufacture one theme count.

## 13.3 Claim-evidence grid

Maintain in R1:

| Claim | Supporting cases | Contradicting cases | Evidence class | Baseline alternative | Current confidence language | What would falsify/redirect? |
|---|---|---|---|---|---|---|

Use qualitative language rather than fake probabilities.

## 13.4 Batch review

After each 4–6 valid interviews, or sooner if a blocker emerges:

1. update within-case summaries;
2. update cohort claim-evidence grid;
3. list strongest disconfirming evidence;
4. inspect moderator leading/probe failures;
5. inspect recruitment-source/fraud concerns;
6. assess current information power;
7. choose highest-information next participant/cohort;
8. decide `continue / deepen / redirect / stop`.

Do not wait until the end to analyze.

---

# 14. Stop / redirect rules

These are resource-allocation rules, not population statistics.

## Deprioritize/stop a cohort when repeated valid cases show

- no material recent email-dependent unresolved matters;
- waiting is rare/brief;
- manual monitoring is genuinely unnecessary;
- a stronger current system/person reliably owns state/attention;
- miss/latency consequence is trivial;
- real pain is mostly drafting/summarization/triage already addressed by incumbents;
- examples are too heterogeneous for a coherent first wedge;
- recruitment repeatedly fails to find hypothesized behavior.

## Deepen a cohort when repeated independent cases show

- multiple recent externally dependent matters;
- participant remains personally responsible for monitoring;
- repeated self-checking or parallel scaffolding persists despite current tools;
- progress/reply often does not equal final outcome;
- meaningful miss/latency cost exists;
- a common residual gap appears across actual baselines;
- a coherent workflow-defined segment becomes clearer.

No universal numeric `N_self_check` or pain threshold is accepted.

---

# 15. Final Issue #36 disposition

Exactly one disposition:

- `SUPPORTED FOR NEXT TEST`;
- `REVISE`;
- `WEAK`;
- `FALSIFIED`.

## `SUPPORTED FOR NEXT TEST` requires

A **specific cohort** with a coherent explanatory pattern across:

1. recent concrete multi-step email-borne matters;
2. personal monitoring ownership;
3. recurring monitoring/scaffolding/reconstruction burden;
4. meaningful consequence or sufficient repeated cost;
5. actual current baseline tools/features;
6. residual gap not adequately owned by a stronger system;
7. practical reachability/adoption autonomy for a next experiment;
8. disconfirming cases/boundaries understood well enough to define who is **not** the wedge;
9. support not resting entirely on one recruitment source/network.

Hypothetical delegation responses are secondary boundary evidence, not observed adoption.

## `REVISE`

A real problem exists but the current cohort definition, workflow boundary, baseline comparator, or mechanism hypothesis is materially wrong/too broad.

## `WEAK`

Some burden exists but frequency/consequence/residual gap/coherence is insufficient for the next mechanism test relative to alternatives.

## `FALSIFIED`

The hypothesized segment/problem does not survive collected evidence strongly enough to justify continuing the wedge in its current form.

No disposition establishes population prevalence, WTP, retention, PMF, or production reliability.

---

# 16. Data/privacy operation — hard pre-fieldwork gate

**Do not collect the first real participant interview until the operations packet is decision-complete.**

At minimum resolve:

1. research purpose and participant-facing notice;
2. data categories collected;
3. optional vs required fields/artifacts;
4. recording/transcription posture;
5. R1/R2/R3 storage locations and access controls;
6. participant-code mapping boundary;
7. raw and working-data retention/deletion periods;
8. recruiter/panel/video/transcription/cloud/AI processors actually used;
9. whether/how a foreign processor may access personal data and the applicable review/notice/consent/contract boundary;
10. deletion/contact/request process;
11. compensation/admin record separation;
12. incident/loss handling;
13. public-disclosure review owner/process for R1 -> R0.

Current default research-safety posture:

- collect minimum necessary data;
- no raw email/attachments in GitHub;
- no participant/loop-level matrix in public GitHub;
- no names/contact details in public GitHub analytical artifacts;
- no credentials/inbox access;
- artifact sharing optional;
- recording **OFF by default** for first wave;
- if recording is used, delete raw media after structured extraction/verification under a predeclared retention period;
- participant identity mapping stays outside analytical evidence and is deleted when no longer operationally required, subject to actual legal/accounting obligations;
- external LLMs receive only appropriately de-identified/minimized material unless a separately reviewed processor/data-use decision permits more;
- participant research data are not repurposed for unrelated marketing/model-training without a separate appropriate basis/notice.

The Product researcher must check actual services used against current Japanese Personal Information Protection Commission guidance before collection. This protocol is not legal advice and does not infer a vendor's compliance from marketing claims.

---

# 17. Current external evidence informing the protocol

## Sample adequacy / saturation

- Wutich, Beresford & Bernard (2024), *Sample Sizes for 10 Types of Qualitative Data Analysis*, DOI `10.1177/16094069241296206`.
- Roberts & Saylor (2026), *Data saturation and information power: sample size in qualitative research—when is enough and how to assess?*, DOI `10.1093/eurjcn/zvag046`.
- Moore, Aguinis & Darden (2026), *Defining, assessing, and reporting saturation in qualitative research*, DOI `10.1016/j.leaqua.2026.101950`.

Interpretation: `15–24` can be a planning envelope, but support/saturation cannot be manufactured by pooling heterogeneous cohorts.

## Event-centered / recent-event methods

- Kelly & Sennott, *Event-Centered Interviewing: Integrating Qualitative Interviews with Experience Sampling Technologies*, DOI `10.1177/00811750241283743`.
- Habimana-Jordana & Lanau (2026), *Event Interviews: A Visual Tool to Study Shocks, Change and Adaptation*, DOI `10.1177/16094069251414081`.

## Online qualitative participant integrity

- Crossen, Harper & Maloney (2026), *Identifying and Managing Fraudulent Participants in Online Qualitative Research*, DOI `10.1097/NNR.0000000000000886`.
- *Detecting and Preventing Fraudulent Participation in Qualitative Research* (JMIR, 2026), DOI `10.2196/87037`.
- Mistry et al., P-FROST recommendations, DOI `10.1177/10497323241288181`.

Interpretation: use layered controls and documented adjudication; do not use one proxy/camera/accessibility signal as automatic truth.

## AI interviewing

- Panfilova et al. (2026), Scientific Reports, *The AI interviewer*, DOI `10.1038/s41598-026-46517-7`.
- Zhang et al. (2026), *When the Interviewer Is a Bot*, arXiv `2608.10412`, accepted to ACM HCOMP 2026, DOI reported `10.1145/3834580.3838754`.
- Schroeder et al. (CHI 2025), *Large Language Models in Qualitative Research: Uses, Tensions, and Intentions*, DOI `10.1145/3706598.3713120`.

Interpretation: human first-wave moderation remains justified; a later mode change requires an explicit compatibility gate.

## Japan email/work context

Japan Business Email Association 2026 survey (`n=1,293` work-email users) reports email use remains near-universal among its respondents and shows substantial daily checking/time burden.

This is **population/context evidence only**. It does not establish Lunowa's target segment or open-loop burden.

## Integrated GenAI baseline

Dillon, Jaffe, Immorlica & Stanton, *Shifting Work Patterns with Generative AI* (66 firms / 7,137 knowledge workers; NBER/AER: Insights pipeline) reports meaningful email-time savings among integrated GenAI users.

Interpretation: generic `AI makes email faster` is not a sufficient wedge.

## Current incumbent feature overlap

Current official/product documentation shows substantial overlap:

- Superhuman: auto reminders for unanswered sent mail + auto follow-up drafts;
- Fyxer: awaiting-reply tracking + follow-up drafts after configured waits;
- Shortwave/Tasklet: AI to-dos/search/filtering/background automation;
- Gmail AI Inbox: proactive task/to-do and assistance expansion in 2026.

Fieldwork records the participant's **actual used baseline**, not assumed capability.

## Japan privacy/data handling

Current Personal Information Protection Commission sources include:

- APPI General Guidelines, partly amended June 2026;
- pseudonymized/anonymized-information guidance, partly amended April 2026;
- cloud/processor and foreign-third-party FAQ/guidance.

Important methodological implication:

> Removing a name is not enough to make a row safe for public release when other information can identify the person.

The study therefore treats public GitHub as an explicit publication layer and keeps row-level working evidence in protected storage.

---

# 18. Pre-fieldwork acceptance checklist

Fieldwork may start only when all required items are true:

- [ ] Current Issue #36 contract rechecked live.
- [ ] Product Content COMPLETE authorities acknowledged but not exposed as interview hypotheses.
- [ ] Recruitment copy does not reveal desired monitoring behavior.
- [ ] Screener received 2–3 pilot comprehension checks and obvious ambiguity is corrected.
- [ ] Initial cohort/batch hypothesis is explicit.
- [ ] Negative-control/boundary recruiting remains available.
- [ ] Incentive and eligibility/fraud compensation rules are operationally predeclared.
- [ ] Fraud adjudication flow exists.
- [ ] Human moderator uses neutral recent-event guide for first exploratory wave.
- [ ] R1 evidence matrix/claim grid is ready before first interview.
- [ ] Participant-facing purpose/privacy/recording notice is ready.
- [ ] Actual R1/R2/R3 storage/access/retention/deletion values are filled in.
- [ ] Actual recruiter/video/transcription/cloud/AI processors are reviewed.
- [ ] Raw PII/private email has a protected storage boundary outside public GitHub.
- [ ] R1 -> R0 public-disclosure review process is defined.
- [ ] Independent/adversarial second-pass review plan exists.
- [ ] Analysis will occur between batches.
- [ ] No cohort support will be inferred by pooling heterogeneous groups.
- [ ] Any later AI-moderated evidence has an explicit bridge/compatibility gate.
- [ ] No implementation/Product promotion happens automatically from interview completion.

---

# 19. Relationship to downstream work

- Issue #36 remains the current problem/segment gate.
- Issue #26 remains a downstream mechanism experiment.
- Issue #28 remains write-heavy and unauthorized merely because this protocol exists.
- Issue #32 / PR #34 remains bounded scenario-oracle work and must be reconciled against any accepted Issue #36 segment/baseline result before use where assumptions materially differ.
- Responsibility L2 proof remains technical evidence, not Product validation.

The cheapest next experiment must be selected from actual Issue #36 evidence rather than predetermined by current Product UI or implementation plans.