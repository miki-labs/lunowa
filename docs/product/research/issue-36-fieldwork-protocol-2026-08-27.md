# Issue #36 Fieldwork Protocol — 2026-08-27

## Status

**NONCANONICAL RESEARCH PROTOCOL.**

This document operationalizes GitHub Issue #36 (`[Product Discovery]: Validate the first ICP and real communication-monitoring burden`). It does **not** change canonical Product truth in `docs/product/PRODUCT.md`, declare an ICP, validate PMF/WTP, or authorize implementation.

The protocol is designed to maximize falsifiability and reduce recall, leading-question, founder-expectancy, panel-conditioning, and fraudulent-participant risk while preserving participant privacy.

---

# 1. Research decision to make

Determine whether a **coherent, reachable segment** repeatedly carries unresolved email-borne coordination in its own head or parallel reminder systems, despite current tools, strongly enough to justify the next bounded Lunowa mechanism test.

The study is not intended to answer market prevalence, pricing, feature preference, retention, or PMF.

A positive result is not “people like Lunowa.” A positive result is repeated recent behavioral evidence that a coherent cohort has under-served monitoring burden and could plausibly relinquish some of that monitoring under a credible reliability/control model.

---

# 2. Methodological posture

## 2.1 Event-centered / critical-incident interviewing

Anchor interviews in **specific recent events**, not generic attitudes.

For each participant, reconstruct 2–4 concrete communication loops from roughly the last 7–14 days. Use a participant-led timeline to reconstruct what happened, what remained unresolved, what the participant expected next, what they checked, what tools they used, what changed, and how the loop ended or remains open.

Recent event-centered and Critical Incident Technique literature supports using participant-identified episodes and timelines to elicit behavior, sequence, intent, and resource use more precisely than abstract opinion questions.

## 2.2 Human moderation for the first exploratory wave

The initial exploratory wave should be **human-moderated**.

2025–2026 evidence suggests LLM interviewers can improve consistency and scale and can conduct adaptive follow-ups, but deployed systems still show probe-light behavior, multi-question turns, premature termination/information-loss failure modes, and weaker narrative depth in some exploratory settings. Therefore:

- human moderator owns the first exploratory wave within the planning range below, subject to cohort stop/redirect rules;
- AI may assist with guide rehearsal, transcription, de-identified structuring, coding suggestions, contradiction search, and synthesis;
- AI does not decide participant validity, evidence classification, segment disposition, or Product promotion;
- raw private client/email content must not be sent to an unapproved external model;
- AI-moderated interviews may be considered later for **breadth/validation after the human interview model stabilizes**, not as a substitute for the first discovery wave.

## 2.3 Founder-expectancy / confirmation-bias controls

Because the Product founder may also moderate, the protocol must assume a strong incentive to see confirming evidence.

Controls:

- do not show or explain Lunowa before recent-event reconstruction;
- use the same neutral core guide for confirming and disconfirming participants;
- ask for a contrasting “already handled well” event in every valid interview;
- write the structured loop evidence **before** writing Product interpretation;
- preserve explicit counterexamples beside supportive cases;
- after each interview, record a short `what would make the current hypothesis weaker?` memo;
- after each batch, actively sample the case most likely to contradict the emerging explanation;
- strongly prefer an independent second-pass review of the first 3 valid interviews and at least one case per cohort using de-identified structured notes/transcripts. The reviewer should look specifically for leading probes, evidence/inference mixing, omitted counterexamples, and unjustified Product-language translation;
- if no independent human reviewer is available, an AI adversarial review of de-identified material may be used as an additional error-finding aid, but it is **not** classified as independent validation and cannot promote the segment hypothesis.

## 2.4 Information power, not a magic interview count

Use a planning range rather than a fixed “10 interviews is enough” rule.

Initial planning range:

- independent / fractional / solo professional services: 5–6 valid interviews;
- small agency / client-service operators: 5–6;
- small B2B owner/operators: 5–6;
- strong-system-of-record negative controls: 3–6 across ATS/CRM/accounting/legal/domain-managed workflows;
- expected initial total: roughly **15–24 valid interviews** if the cohorts continue to carry information value.

This is a resource-planning range, not a prevalence estimator. Continue, stop, or redirect sampling based on information power: study aim narrowness, cohort specificity, quality/depth of dialogue, use of prior theory, and whether new cases still change the causal/workflow model.

Do not claim saturation merely because no new high-level theme appears in a few shallow interviews.

---

# 3. Recruitment strategy

## 3.1 Primary positive-search cohorts

Recruit by **workflow characteristics**, not titles.

Priority cohort A — independent / fractional / solo professional-service operators:

- personally handle multiple external counterparties;
- email carries requests, approvals, documents, decisions, or commitments;
- several loops remain unresolved overnight or longer;
- participant personally tracks next moves rather than routinely delegating this to an assistant;
- no single strong system of record adequately monitors the heterogeneous communication state.

Priority cohort B — small agency / client-service operators:

- similar external dependency density;
- explicitly test whether project-management/shared-inbox/CRM tooling already solves the monitoring problem.

Priority cohort C — small B2B owner/operators:

- personally coordinate customers, vendors, accountant/lawyer/contractors/partners;
- use this cohort to discover which workflow characteristics, not “owner” title, predict burden.

## 3.2 Negative-control recruitment

Intentionally recruit several participants whose domain tools may already solve the problem well, for example:

- recruiter with mature ATS;
- accountant using client-request/workflow software;
- lawyer using practice-management/case-management software;
- sales/client-service operator with strong CRM discipline.

These are not “bad participants.” They test the Product boundary that a stronger structured system of record should make Lunowa unnecessary or overlay-only.

## 3.3 Recruitment channels — preferred order

1. **Direct / warm / professional-network outreach** for the first wave. Highest ability to explain the study and validate real professional context; counteract homophily by deliberately varying role/company/workflow.
2. **Verified B2B research panels** as a supplement, not the sole source. Current examples include User Interviews and Respondent. User Interviews’ 2026 panel reports 2,557 professionals in Japan, so niche Japan targeting may be feasible but constrained; vendor panel counts/quality claims are not independent evidence.
3. **Japanese research panels/recruiters** such as Macromill/InterviewZero or ASMARQ when broader domestic reach or faster quota filling is worth the cost. Treat panel-size and quality claims as vendor claims.
4. Open social-media recruitment only with stronger anti-fraud and qualification controls.

Do not recruit only friends/founders already enthusiastic about AI/productivity; that sample will overstate adoption and problem salience.

---

# 4. Incentive policy

Compensate participants for time without making the incentive the dominant reason to qualify.

Current Japanese market-research guidance (Macromill, 2026) gives broad reference ranges of ¥3,000–¥15,000 for 60–90 minute 1:1 interviews and ¥10,000–¥30,000 for B2B/expert interviews of 60+ minutes.

Practical pilot for this study:

- standard 45-minute professional interview: **¥8,000–¥10,000**;
- scarce/high-opportunity-cost B2B participant: up to roughly **¥12,000–¥15,000** if recruitment proves difficult;
- pay promptly after a completed valid session;
- compensate time, not “positive” answers;
- do not reveal detailed qualification logic or unusually emphasize the incentive in public recruitment copy.

If cost/fill-rate data contradict this range, adjust transparently. Incentive amount is an operational parameter, not Product evidence.

---

# 5. Recruitment screener

Keep the screener short (target 8–12 substantive questions), behavior-based, and non-leading. Do not mention Lunowa, “open loops,” “waiting,” or the desired answer. Where the tooling permits it, separate questions across pages so later questions do not teach respondents how to answer earlier ones.

Before scaled recruitment, run **2–3 cognitive pretests** with people who resemble the target population and ask what they thought each question meant. Revise ambiguous wording before treating screener output as eligibility evidence.

## Suggested screener

### Q1 — Work arrangement

Which best describes your current work situation?

- self-employed / independent professional;
- founder or owner of a small business;
- employee at a small company;
- employee at a medium/large company;
- other.

**Purpose:** quota/context only; no title alone qualifies.

### Q2 — External coordination

In a typical work week, with which groups do you personally communicate to move work forward? Select all that apply.

- customers/clients;
- prospective customers;
- vendors/suppliers;
- contractors/freelancers;
- professional advisers;
- partner companies;
- internal coworkers only;
- other.

### Q3 — Channels actually used

In the last 2 weeks, which channels did you personally use for work coordination, and approximately how often?

- email;
- Slack/Teams/Chatwork/other chat;
- LINE/other messaging;
- phone;
- scheduled meetings;
- CRM/ATS/ticketing portal;
- other.

**Qualification signal:** email is materially used; email need not be the only channel.

### Q4 — Recent multi-step work

Thinking only about the last 14 days, about how many work matters involving email took more than one step or remained in progress beyond the initial send/receive?

- none;
- 1;
- 2–3;
- 4–7;
- 8+;
- not sure.

Do not treat this estimate as measured prevalence; use it only for screening/context.

### Q5 — What they actually did while a matter remained in progress

During the last 14 days, for work matters involving email that were not finished immediately, which of these did you personally do at least once? Select all that apply.

- reopened Inbox or the thread;
- searched Sent mail;
- used star/flag/label/folder;
- snoozed an email;
- created a calendar reminder;
- created a task in Todoist/Notion/Asana/etc.;
- wrote a note/spreadsheet entry;
- relied on a CRM/ATS/ticket/project tool;
- asked an assistant/coworker to track it;
- did nothing / simply continued work;
- none of these;
- other.

The question intentionally does **not** say that manual rechecking is the desired behavior.

### Q6 — Existing systems

Which tools currently track client/candidate/case/project/work status for you?

Include CRM, ATS, ticketing, project-management, accounting/practice-management, or other structured systems.

### Q7 — Personal ownership

When an external work matter communicated through email is not finished yet, who usually remains responsible for noticing whether it progresses or stalls?

- mostly me;
- shared with coworkers;
- dedicated assistant/operations role;
- structured software/system reliably handles it;
- varies substantially.

### Q8 — Recent example, open text

Without including names, confidential details, or message text, briefly describe **one recent work matter involving email that took more than one step to complete or was not finished immediately**. What happened after the first message?

**Manual review required.** Look for concrete temporal/behavioral detail, including cases where another system handled the work well. Do not reward Product-friendly vocabulary.

### Q9 — Contrast / anti-gaming question

In the last 14 days, was there a work matter you did **not** need to remember or manually recheck because another system/person handled it well? If yes, briefly describe the kind of system/person.

This deliberately makes “already solved” a legitimate answer.

### Q10 — Interview logistics / privacy

Would you be comfortable discussing 2–4 recent examples in a 45-minute video call if you can redact names/content and are never required to expose private client information?

- yes;
- maybe / verbal reconstruction only;
- no.

Do not reject “verbal reconstruction only”; artifact display is optional.

---

# 6. Screener qualification logic

## Primary-cohort eligibility signals

A participant is a stronger primary candidate when evidence indicates several of:

- materially uses email for external coordination;
- personally owns monitoring/follow-up;
- can reconstruct at least one recent unresolved event, preferably multiple;
- waiting persists overnight or longer;
- manually rechecks or creates parallel scaffolding, or has meaningful miss/latency consequences;
- replies may represent progress without satisfying the awaited outcome;
- existing structured tooling does not fully own the heterogeneous loop;
- has practical autonomy to try a companion workflow.

Do not require every criterion. Do not reveal the scoring logic publicly.

## Negative-control eligibility

Intentionally preserve quota for participants who have similar coordination volume but answer that a CRM/ATS/ticket/accounting/practice system reliably owns the important loop.

## Reject / deprioritize for the primary cohort

- cannot provide any specific recent event;
- work communication is almost entirely synchronous or non-email;
- monitoring responsibility is routinely delegated away from them;
- every material loop is already reliably handled by a stronger structured system;
- answers are internally inconsistent or appear fabricated.

A rejection is a sampling decision, not evidence that the market segment does not exist.

---

# 7. Fraud / professional-participant controls

Online qualitative research now has a documented imposter/fraud problem, especially when public recruitment and incentives are combined. Use layered controls without turning one signal into automatic exclusion.

Controls:

- keep public study description broad; do not publish exact eligibility criteria;
- manually review the open-text recent-event answer;
- if using an unverified source, conduct a 3–5 minute pre-call or equivalent secondary confirmation;
- for B2B recruitment, optionally confirm a professional profile/work context with consent (for example LinkedIn or work email), but do not store unnecessary PII in the research repository;
- at interview start, casually re-ask one or two screener facts and compare for consistency;
- watch for clusters of red flags: generic/scripted answers, inability to elaborate on concrete events, inconsistent work/tool descriptions, unusual recruitment bursts, repeated incentive-focused communication, duplicated identities/contact patterns;
- camera-on may improve verification/rapport but should not be the sole validity criterion; preserve accessibility/privacy alternatives;
- do not accuse or exclude a participant based on a single ambiguous flag;
- document exclusions and reasons outside Product evidence so suspicious data do not silently disappear.

No raw identity documents, email addresses, IP addresses, private messages, or client data go into GitHub.

---

# 8. Interview guide — 45 minutes

## 0–3 min — consent and framing

Neutral framing:

> We are studying how people keep track of work that continues across email and other tools. We are interested in what actually happened recently, including cases where your current tools already work well. This is not a sales call and there are no right answers. Please do not share confidential names, credentials, or message text.

If recording, obtain explicit consent and state storage/retention. Recording is optional if the participant declines; take structured notes instead.

Do **not** explain Lunowa’s proposed solution before event reconstruction.

## 3–7 min — work context

- What kinds of external people or organizations do you personally coordinate with?
- Which channels/tools are involved?
- Which system, if any, is the official place where work status lives?
- Who normally notices if something does not progress as expected?

Keep this factual; do not spend the session on generic frustrations.

## 7–22 min — Event A: recent multi-step email matter

Opening prompt:

> Think of a recent work-related matter involving email that took more than one step to finish, or is still in progress. Walk me through it from the beginning.

Do **not** assume the participant manually rechecked it. Discover whether monitoring burden existed.

Build a visible or note-based timeline:

1. What outcome did you ultimately need?
2. What started the matter?
3. At that moment, who/what did you believe had the next move?
4. What did you expect to happen next?
5. What did you do immediately after sending/receiving the email?
6. When did you next think about the matter? What triggered that?
7. Did you look anywhere to determine status? If yes, where: Inbox, Sent, search, task app, calendar, CRM, notes, another person?
8. Did you create any reminder/scaffolding? If yes, why that method?
9. Did any message arrive before the actual outcome was complete? If yes, what changed and what remained open?
10. How did you decide when, if ever, to look again?
11. What counted as actually finished?
12. What would have happened if you forgot or were late?
13. Which part, if any, did your current tools handle well?

For each self-check that actually occurred, probe **why that check happened** rather than merely counting it. If there was no self-check, preserve that as disconfirming evidence.

## 22–32 min — Event B: deliberately contrasting case

Select a contrasting recent event:

- a case already handled well by CRM/ATS/project software;
- a case where reply = completion;
- a case where participant did not recheck;
- or a case that was forgotten/late.

Prompt:

> Give me a recent case that worked differently — for example, one where another tool/person handled the state well, one that finished quickly, or one you did not need to think about again.

Goal: identify the boundary of the problem, not just confirming examples.

## 32–38 min — cross-event current workflow

- Across these examples, how do you know what currently needs your attention versus someone else’s?
- Is there one place you trust, or do you reconstruct status from several places?
- When you create a task/reminder, what information do you record? Just a date, or what you are actually expecting to happen?
- Which existing tool already solves this best?
- What does it still fail to cover?
- Have you ever stopped using a reminder/follow-up tool? What caused that?

## 38–43 min — delegation boundary, asked only after behavior

These responses are **SELF-REPORT**, not proof of adoption.

Use a neutral bounded scenario, not a Lunowa pitch:

> Imagine a system could monitor one specific unresolved email matter, show you the original evidence whenever you wanted, and return it when a defined event or time condition required your attention. It would not send external messages without your approval. What would you still feel you had to check yourself?

Then probe:

- What kind of miss would make you stop relying on it?
- What evidence would you need to trust that it was still monitoring?
- Which kinds of matters would you never delegate?
- Which current tool would this have to replace or coexist with?

Do not ask “Would you buy/use Lunowa?” in this issue.

## 43–45 min — close

- Is there a recent example that contradicts the pattern we discussed?
- Who has a very different workflow from you that we should talk to?
- Ask permission for a follow-up only if needed.

---

# 9. Participant-led artifact use

Artifact inspection is optional and participant-controlled.

Preferred hierarchy:

1. verbal reconstruction;
2. participant draws/types a redacted timeline;
3. participant screen-shares only selected/redacted metadata/thread sections if comfortable.

Never require access to an inbox or credentials. Do not capture screenshots/raw messages into the repository. The moderator should interrupt if sensitive names/client content are unnecessarily exposed.

A small optional pre-task can improve recall:

> Before the interview, identify two recent work-email matters: one that took more than one step or stayed in progress, and one that another system/person handled well. Do not send us the emails.

Keep the pre-task light; do not ask participants to manufacture logs or count weeks of history retrospectively.

---

# 10. Evidence matrix

Store only de-identified structured observations.

Per participant:

- cohort/recruitment channel;
- broad work context;
- actual baseline tools;
- whether personally responsible for monitoring;
- limitations/validity notes.

Per reconstructed loop:

| Field | Record |
|---|---|
| evidence class | `DIRECT OBSERVED` / `RECENT-EVENT RECALL` / `SELF-REPORT` / `INFERENCE` / `UNKNOWN` |
| loop/outcome | non-sensitive operational description |
| external dependency | person/org/event/time/document/etc. |
| started | approximate date/time |
| open duration | approximate |
| next-move belief | user / counterparty / both / unclear |
| expected event | what participant was waiting to observe |
| reply sufficient? | yes/no/context |
| `N_self_check` | reconstructed count/range, not assumed exact |
| self-check triggers | why each check happened |
| scaffolding | star/snooze/task/calendar/CRM/note/etc. |
| reconstruction episode | whether participant had to re-read/reconstruct context |
| meaningful state changes | progress vs completion |
| failure/latency | forgotten/late/duplicate/unnecessary rechecks |
| consequence | operational/economic/relationship cost, if any |
| current solution | what helped |
| residual gap | what remained under-served |
| no-monitoring counterexample | if relevant |

Do not collapse these fields into one weighted pain score.

---

# 11. Analysis process

## 11.1 Within-case first

For each loop, reconstruct a compact sequence:

```text
trigger
-> unresolved outcome
-> current next move
-> participant action/scaffolding
-> waiting or continued work
-> self-check(s), if any
-> evidence/state change
-> resolution or still open
```

Separate observed/recalled event from participant interpretation and researcher inference.

## 11.2 Cross-case second

Compare across loops and participants for:

- repeated manual rechecking despite inability to act;
- parallel reminder/scaffolding duplication;
- reply != awaited outcome;
- temporal/state reconstruction cost;
- missed/late consequences;
- existing-tool adequacy;
- strong-system-of-record counterexamples;
- conditions under which participants already relinquish monitoring;
- conditions that prevent delegation.

Preserve counterexamples next to supporting examples.

## 11.3 Batch review

After each batch of roughly 4–6 valid interviews:

- update the provisional causal/workflow model;
- list evidence that weakens each current hypothesis;
- identify the highest-information next participant/cohort;
- check whether the interviewer is leading, over-probing one theme, or failing to reach concrete events;
- compare founder interpretation with any available independent/adversarial second-pass review;
- decide whether to continue, redirect, or stop a cohort.

Do not wait until all interviews are complete before analysis.

---

# 12. Operational stop / redirect rules

These are **resource-allocation heuristics, not population statistics**.

Consider stopping or deprioritizing a cohort early when a coherent first batch repeatedly shows one or more of:

- participants cannot reconstruct material recent email-dependent unresolved loops;
- waiting is rare/brief and manual monitoring is trivial;
- self-checking is low because the behavior is genuinely unnecessary;
- a strong existing system reliably owns state and attention;
- meaningful consequences of delay/miss are absent;
- the real pain is writing/summarization speed rather than monitoring;
- participants explicitly describe reliable existing delegation to an assistant/ops role;
- event examples are too heterogeneous to form a coherent wedge.

Continue/deepen a cohort when independent participants repeatedly show:

- multiple recent externally dependent loops;
- manual self-checking or parallel scaffolding that persists despite current tools;
- state changes where reply is not completion;
- meaningful cost of missed/late follow-up;
- a common residual gap not adequately owned by a stronger system;
- plausible monitoring delegation boundaries under explicit reliability/control assumptions.

Do not set a fake universal numeric threshold for `N_self_check` or “pain.”

---

# 13. Disposition after fieldwork

Issue #36 must end with one of:

- `SUPPORTED FOR NEXT TEST`;
- `REVISE`;
- `WEAK`;
- `FALSIFIED`.

A `SUPPORTED FOR NEXT TEST` disposition requires a coherent explanatory pattern across recent behavior, current baseline tools, residual gap, and delegation boundary. It does not establish market size, WTP, retention, or PMF.

The cheapest next experiment should follow from what was actually observed. Do not automatically promote the current five-surface IA, Responsibility UI, or implementation plan merely because the problem appears real.

---

# 14. Data/privacy handling

- no raw private email or attachments in GitHub;
- no participant names/contact details in GitHub research artifacts;
- no credentials or inbox access;
- participant may redact or verbally reconstruct all examples;
- recording only with explicit consent;
- raw recordings/transcripts, if collected, stay outside the repository under a stated retention/deletion policy;
- de-identify before AI-assisted analysis;
- do not upload sensitive/client content to an external AI service without explicit appropriate authorization and data-handling review;
- separate participant compensation/admin records from analytical evidence.

---

# 15. Current external-method references

These sources inform the protocol but do not constitute Product truth:

- Wutich, Beresford & Bernard (2024), *Sample Sizes for 10 Types of Qualitative Data Analysis*, International Journal of Qualitative Methods — theme/meaning/theoretical saturation guidance and warnings against shallow saturation claims.
- Roberts & Saylor (2026), *Data saturation and information power: sample size in qualitative research—when is enough and how to assess?*, European Journal of Cardiovascular Nursing — current information-power guidance.
- Kelly & Sennott (2025), *Event-Centered Interviewing: Integrating Qualitative Interviews with Experience Sampling Technologies* — event/timeline anchoring.
- Habimana-Jordana & Lanau (2026), *Event Interviews: A Visual Tool to Study Shocks, Change and Adaptation* — timeline/resource reconstruction around participant-identified events.
- Crossen, Harper & Maloney (2026), *Identifying and Managing Fraudulent Participants in Online Qualitative Research* — current imposter-participant evidence.
- P-FROST recommendations / recent JMIR and related fraud-method papers (2024–2026) — layered screening and ethical anti-fraud controls.
- Jack, Cooper & Flower (2026), *Automating the qualitative interview? Using Gen AI chatbots in social science research* — evidence for scalable LLM interviewing with methodological limits.
- Zhang et al. (2026), *When the Interviewer Is a Bot: Behavior, Breakdowns, and Trust in MLLM-Led Interviews* — deployed probe-depth/breakdown evidence.
- Panfilova et al. (2026), *The AI interviewer: multi-faceted evaluation of adaptive questioning by large language models*, Scientific Reports — structured evaluation of adaptive LLM interviewing.
- Macromill (2026), current Japanese interview-incentive guidance — operational compensation reference only.
- User Interviews 2026 panel/screener guidance and Respondent current panel information — vendor evidence on panel availability/verification, not independent quality proof.

---

# 16. Pre-fieldwork checklist

- [ ] Recruiter copy does not reveal the desired monitoring behavior.
- [ ] Screener cognitively pretested on at least 2–3 target-like people before scale recruitment.
- [ ] First exploratory interviews are human-moderated.
- [ ] Interview guide starts from neutral recent events, not Lunowa concepts or assumed self-checking.
- [ ] Negative-control quota is preserved.
- [ ] Incentive/payment method is clear.
- [ ] Consent/recording/privacy language is ready.
- [ ] Evidence matrix is ready before first interview.
- [ ] Raw PII/email content has a storage boundary outside GitHub.
- [ ] Moderator records disconfirming evidence explicitly.
- [ ] Evidence is recorded before Product interpretation.
- [ ] Independent second-pass review is arranged where feasible; AI-only adversarial review is not mislabeled independent.
- [ ] Analysis occurs between batches, not only at the end.
- [ ] No implementation/Product promotion is triggered automatically by interview completion.
