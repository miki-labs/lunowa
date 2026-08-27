# Issue #36 Fieldwork Evidence Update — 2026-08-27

## Status

**NONCANONICAL EXTERNAL EVIDENCE / METHOD RATIONALE.**

This file supports Issue #36 fieldwork design. It is not participant evidence and does not establish an ICP, Product truth, market prevalence, or Product-market fit.

Labels:

- **EXTERNAL EVIDENCE** — current published/product/official source;
- **INFERENCE** — methodological/Product-discovery consequence;
- **UNKNOWN** — not established.

---

# 1. Japan email context

## Japan Business Email Association — Business Email Survey 2026

Primary source:

- https://businessmail.or.jp/research/2026-result/

**EXTERNAL EVIDENCE:** the association reports an internet survey of `n=1,293` people who use email at work, conducted April 1–30, 2026. Reported highlights include:

- email use: `98.14%`;
- average sent mail: `12.27/day`;
- average received mail: `46.49/day`;
- average reading time: `1m39s/message`;
- average writing time: `6m19s/message`;
- about half checking mail 10+ times/day;
- over 60% considering >24h without a reply to be slow.

The association also reports that average received volume fell from the prior year while reading/writing time increased.

**INFERENCE:** email remains operationally important in the surveyed Japanese work population, but these aggregate figures do **not** establish Lunowa's open-loop monitoring problem, its prevalence, or a target ICP.

Issue #36 therefore asks what participants were actually monitoring/rechecking and why, rather than qualifying by email volume alone.

---

# 2. Generic AI email-speed improvement is already a strong baseline

## Dillon, Jaffe, Immorlica & Stanton — Shifting Work Patterns with Generative AI

Sources:

- NBER Working Paper 33795 / current revision: https://www.nber.org/papers/w33795
- AEA publication pipeline should be rechecked when final publication metadata matters.

**EXTERNAL EVIDENCE:** the field experiment covers 66 firms / 7,137 knowledge workers with randomized access to integrated generative AI. Reported analysis includes meaningful reductions in email time among users during the latter experiment period.

**INFERENCE:** `AI makes email faster` is not a sufficient Lunowa wedge. Issue #36 must distinguish monitoring burden from drafting/summarization/triage burden.

---

# 3. Current incumbent follow-up / task / automation overlap

## Gmail AI Inbox — 2026

Primary Google sources:

- https://blog.google/products-and-platforms/products/gmail/gmail-is-entering-the-gemini-era/
- https://blog.google/products-and-platforms/products/workspace/workspace-updates/
- https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/

**EXTERNAL EVIDENCE:** Google describes AI Inbox as a proactive inbox view that surfaces important to-dos and updates. By I/O 2026, Google also described personalized draft replies, links to relevant Workspace files, marking tasks done, and dismissing suggestions.

## Superhuman Auto Reminders / Auto Drafts

Primary/current product source:

- https://help.superhuman.com/hc/en-us/articles/46005658551053-Auto-Reminders-Auto-Drafts

**EXTERNAL EVIDENCE:** Superhuman can automatically remind users about sent mail that has not received a reply. Its AI can select messages that need follow-up and can automatically prepare follow-up drafts. Current help content includes 2026 Auto Draft settings imagery.

## Fyxer follow-up tracking

Primary/current help source:

- https://support.fyxer.com/article/track-email-follow-ups

**EXTERNAL EVIDENCE:** Fyxer tracks sent conversations with no reply, waits a configured period, marks them as awaiting reply/to follow up, and prepares a follow-up draft.

## Shortwave + Tasklet

Primary/current sources:

- https://www.shortwave.com/blog/shortwave-tasklet-integration/
- https://www.shortwave.com/blog/introducing-tasklet-ai-automation/
- https://www.shortwave.com/docs/guides/ai-assistant/

**EXTERNAL EVIDENCE:** Shortwave exposes AI todo/filter/search capabilities; Tasklet can run email-triggered/scheduled background automations, create/manage todos, draft replies, and connect email with other systems.

**INFERENCE:** Product Discovery must not compare Lunowa against an imaginary plain inbox. It must capture the participant's **actual baseline feature use**.

Critical distinction:

```text
feature exists externally
!= participant has access
!= feature is enabled
!= participant uses it
!= participant trusts it
!= feature adequately solves this specific loop
```

Competitor capability is frontier evidence, not participant evidence.

---

# 4. Qualitative sample adequacy

## Wutich, Beresford & Bernard (2024)

- *Sample Sizes for 10 Types of Qualitative Data Analysis*
- DOI: https://doi.org/10.1177/16094069241296206

**EXTERNAL EVIDENCE:** the review summarizes differing sample-size/saturation requirements across qualitative analytic strategies and warns against applying one universal number.

## Roberts & Saylor (2026)

- *Data saturation and information power: sample size in qualitative research—when is enough and how to assess?*
- DOI: https://doi.org/10.1093/eurjcn/zvag046

**EXTERNAL EVIDENCE:** information power depends on factors including narrowness of aim, sample specificity, theory, dialogue quality, and analysis strategy.

## Moore, Aguinis & Darden (2026)

- *Defining, assessing, and reporting saturation in qualitative research*
- DOI: https://doi.org/10.1016/j.leaqua.2026.101950

**INFERENCE:** `15–24 interviews` is a planning envelope only. A heterogeneous set of consultants, agency operators, founders, and negative-control professions cannot be pooled to manufacture one saturation claim. `SUPPORTED FOR NEXT TEST` must be tied to a coherent cohort/segment.

---

# 5. Event-centered recent-event interviewing

## Kelly & Sennott

- *Event-Centered Interviewing: Integrating Qualitative Interviews with Experience Sampling Technologies*
- DOI: https://doi.org/10.1177/00811750241283743

## Habimana-Jordana & Lanau (2026)

- *Event Interviews: A Visual Tool to Study Shocks, Change and Adaptation*
- DOI: https://doi.org/10.1177/16094069251414081

**INFERENCE:** reconstructing concrete recent event sequences and timelines is preferable for Issue #36 to asking abstract `usually` or future-feature questions. Artifact use should remain participant-controlled and privacy-minimized.

---

# 6. Online qualitative participant fraud / integrity

Relevant current sources:

- Crossen, Harper & Maloney (2026), *Identifying and Managing Fraudulent Participants in Online Qualitative Research*, DOI: https://doi.org/10.1097/NNR.0000000000000886
- *Detecting and Preventing Fraudulent Participation in Qualitative Research* (JMIR, 2026), DOI: https://doi.org/10.2196/87037
- Mistry et al., P-FROST recommendations, DOI: https://doi.org/10.1177/10497323241288181

**INFERENCE:** use layered screening/consistency checks and a documented adjudication process. One signal—camera status, profile availability, response style, accessibility behavior, or incentive concern—must not automatically determine fraud.

---

# 7. AI-moderated interviews

## Panfilova et al. (2026), Scientific Reports

- *The AI interviewer: multi-faceted evaluation of adaptive questioning by large language models*
- DOI: https://doi.org/10.1038/s41598-026-46517-7

**EXTERNAL EVIDENCE:** model-to-model differences exist across adaptive follow-up qualities such as necessity, openness/contextual grounding, and other interview dimensions.

## Zhang et al. (2026), accepted ACM HCOMP 2026

- *When the Interviewer Is a Bot: Behavior, Breakdowns, and Trust in MLLM-Led Interviews*
- arXiv: https://arxiv.org/abs/2608.10412
- DOI reported for HCOMP: https://doi.org/10.1145/3834580.3838754

**EXTERNAL EVIDENCE:** deployed interviews showed relatively sparse deepening probes, multi-question-turn violations despite instructions, and breakdowns involving information loss, premature termination, latency, and interruption.

## Schroeder et al. (CHI 2025)

- *Large Language Models in Qualitative Research: Uses, Tensions, and Intentions*
- DOI: https://doi.org/10.1145/3706598.3713120

**INFERENCE:** keep the first Issue #36 exploratory wave human-moderated. If a later AI mode is introduced, interviewer mode is a methodological intervention; perform a bridge/compatibility evaluation before pooling evidence.

---

# 8. Japan privacy / data handling

## Personal Information Protection Commission — current 2026 guidance

Primary sources:

- APPI General Guidelines, partly amended June 2026: https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/
- Legal/guideline index: https://www.ppc.go.jp/personalinfo/legal/
- Pseudonymized/anonymized information guidance, partly amended April 2026: https://www.ppc.go.jp/personalinfo/legal/guidelines_anonymous/
- Cloud processor FAQ Q7-53: https://www.ppc.go.jp/all_faq_index/faq1-q7-53/
- Foreign provider / domestic server FAQ Q12-4: https://www.ppc.go.jp/all_faq_index/faq1-q12-4/
- FAQ on removed identifiers still being personal information where readily collatable: https://www.ppc.go.jp/all_faq_index/faq3-q2-11/
- FAQ on pseudonymized information remaining personal information where source/mapping permits identification: https://www.ppc.go.jp/all_faq_index/faq1-q14-2/

**EXTERNAL EVIDENCE:** current PPC guidance requires concrete purpose specification/notification, appropriate security management, processor oversight, and case-specific analysis of cloud/foreign processing. Simply deleting direct identifiers does not automatically put a record outside personal-information handling when other information can readily identify the person.

**INFERENCE for this public repository:**

- public GitHub is an explicit publication layer;
- participant/loop-level working evidence stays in a protected store;
- identity/admin mapping is separated;
- raw recording/transcript is off by default;
- public results are aggregate/synthesized and pass re-identification review;
- actual vendors/storage/processors must be reviewed before participant collection.

This is a research-operations safety interpretation, not legal advice.

---

# 9. Evidence limits

This evidence update does **not** establish:

- a validated first ICP;
- frequency/prevalence of Lunowa's target monitoring burden;
- attainable false-negative/review rates;
- willingness to delegate in real behavior;
- switching/WTP/retention/PMF;
- a population effect of any specific competitor feature;
- legal compliance of the eventual research/tool stack;
- implementation authorization.

Those remain Issue #36 or later empirical/legal/technical questions.