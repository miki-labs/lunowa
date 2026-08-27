# Issue #36 Fieldwork Protocol — Full Acceptance Audit

Date: 2026-08-27

## Disposition

**FAIL / REVISE**

This audit evaluates the entire existing Issue #36 fieldwork-protocol candidate from draft PR #43, not only a recent paragraph or latest patch.

Audit inputs:

- live GitHub Issue #36, `[Product Discovery]: Validate the first ICP and real communication-monitoring burden`, current body as of `updated_at=2026-08-26T17:19:39Z`;
- current `main` after Product Content completion: `d569d8f1a61b45a0d733a53dc2b90ccc37e67bb9`;
- draft PR #43 candidate head: `5c1e230ade034d7f93176e36cf139753d93d5750`;
- `docs/product/PRODUCT.md`;
- `docs/product/PRODUCT-CONTENT.md`;
- `docs/product/GOLDEN-SCENARIO-BANK.md`;
- current Product/continuity routing and Issue #45 completion state;
- current 2024–2026 qualitative-method, online-research-integrity, AI-interviewer, privacy, email-workload, and incumbent-product evidence.

The old PR #43 branch predates Product Content COMPLETE. It remains a useful protocol draft but must not be merged as-is.

---

## Acceptance standard

The protocol must make Issue #36 empirically falsifiable without silently validating Lunowa, contaminating the first segment search with Product ontology, overstating a heterogeneous qualitative sample, compromising participant privacy, or allowing a later change of interviewer mode to invalidate comparability.

It must preserve the Issue #36 evidence classes:

- `DIRECT OBSERVED`;
- `RECENT-EVENT RECALL`;
- `SELF-REPORT`;
- `EXTERNAL EVIDENCE`;
- `INFERENCE`;
- `UNKNOWN`.

It must not infer market prevalence, PMF, WTP, retention, production reliability, or implementation authorization.

---

# Full audit result by Issue #36 requirement

## 1. Behavior-based recruitment

**PASS with correction needed in sampling interpretation.**

The candidate correctly recruits from workflow characteristics rather than title/email volume and deliberately includes strong-system-of-record counterexamples.

No Product term is required to qualify.

## 2. Recent concrete workflow evidence

**PASS.**

The candidate anchors interviews in 2–4 recent events, uses participant-led reconstruction, and repeatedly redirects abstract `I usually...` answers toward concrete incidents.

The event-centered approach is well supported by current methodological literature.

## 3. Actual current baseline

**PASS with strengthening recommended.**

The candidate asks for real tools and existing systems rather than assuming a plain inbox. Final revision should preserve exact capability/use-state when a participant uses Gmail/Outlook/Superhuman/Fyxer/Shortwave/CRM/etc., because 2026 incumbent capability is materially broader than simple inbox/snooze comparison.

Presence of a feature is not evidence that the participant uses or trusts it.

## 4. Confirming and disconfirming evidence

**PASS.**

The candidate requires a contrasting `already handled well` event, negative-control cohorts, counterexample capture, and an explicit hypothesis-weakening memo.

## 5. Privacy / raw email / PII

**FAIL — material blocker A-04.**

The candidate correctly states that raw private email/PII must not enter GitHub and that recording requires consent, but it leaves the actual research data-handling contract unresolved until interview time.

Before the first real participant, the study needs a frozen operational data-handling notice/process covering at minimum:

- purpose of collection/use;
- data categories collected;
- what is optional vs required;
- recording/transcription choice;
- storage location and access;
- participant-ID mapping kept separate from analytical data;
- raw recording/transcript retention/deletion period;
- processor/cloud/AI services used;
- whether any service outside Japan can access/process personal data and what review applies;
- deletion/request/contact path;
- compensation/admin-record separation;
- incident handling.

Current Japanese Personal Information Protection Commission guidance, including the 2026-amended general guidelines, requires concrete purpose specification/notification and appropriate security/processor management. This audit does not make a legal conclusion about any particular vendor; it requires the Product research operation to resolve its actual handling before collection.

## 6. Evidence-class separation

**PASS.**

The candidate correctly distinguishes observation from artifact-aided recall and hypothetical/self-report answers from event evidence.

## 7. No prevalence/switching/WTP/retention overclaim

**PASS.**

The candidate repeatedly states that the sample is exploratory and non-probability.

## 8. Result can change Product plan

**PASS.**

`SUPPORTED FOR NEXT TEST / REVISE / WEAK / FALSIFIED` can stop or redirect the current mechanism lane.

## 9. Explicit segment/problem disposition

**FAIL — material blocker A-02 in current sampling formulation.**

The candidate has a useful 15–24 planning envelope, but its cohort quotas and cross-case language leave room to pool heterogeneous participants and then declare one overall saturation/support conclusion.

Current 2026 information-power/saturation guidance emphasizes that sample adequacy depends on aim narrowness, sample specificity/homogeneity, dialogue quality, theory use, and analysis strategy; comparative/heterogeneous designs require more information than one narrow homogeneous cohort.

Required correction:

- sampling runs in adaptive blocks, not fixed cohort quotas;
- `SUPPORTED FOR NEXT TEST` is cohort/segment-specific;
- evidence from independent consultants, agencies, owners, and strong-SoR controls must not be pooled to manufacture saturation;
- if one cohort becomes the likely wedge, deepen that cohort until its mechanism/meaning model is sufficiently stable for the decision;
- negative controls test boundaries and should not be counted as evidence of the positive cohort's saturation;
- `15–24` remains a resource envelope/reference, never an acceptance threshold.

---

# Additional full-candidate blockers

## A-01 — Current canonical authority routing is stale

Severity: **MATERIAL**

The draft protocol predates merge commit `d569d8f1...` and only routes Product truth through `PRODUCT.md`.

Current Product authority is deliberately split:

- `PRODUCT.md` — highest-level Product contract;
- `PRODUCT-CONTENT.md` — detailed Product operating contract/final Feature Matrix;
- `GOLDEN-SCENARIO-BANK.md` — Product-level regression consequences, subordinate to Responsibility semantic truth.

The fieldwork protocol must acknowledge these current authorities while making clear that they are **research constraints, not participant-facing concepts or hypotheses to confirm**. Product Golden Scenarios must never be turned into interview answers/oracles.

Issue #45 is complete; Issue #36 is now the active empirical gate.

## A-02 — Heterogeneous sampling can be misread as pooled saturation

Severity: **MATERIAL**

See Acceptance criterion 9 above.

Root cause: the old protocol combined useful cohort planning ranges with one overall `15–24` number without a sufficiently explicit cohort-specific disposition rule.

Correction is methodological, not numerical: support must be tied to a coherent segment and analysis unit.

## A-03 — Later AI-moderated interviews lack a compatibility/bridge gate

Severity: **MATERIAL**

The old protocol correctly requires human moderation for the initial exploratory wave and mentions AI only as later breadth support. However, it does not define what happens if interviewer mode changes mid-study.

Latest relevant evidence strengthens this concern:

- Scientific Reports 2026 shows material model-to-model differences in follow-up necessity, openness, contextual grounding, intensity, and latency;
- the August 2026 HCOMP-accepted `When the Interviewer Is a Bot` deployment reports deepening probes as only 4.9% of turns and 28.7% of question-bearing turns containing multiple questions despite one-question instructions, plus information-loss, premature-termination, latency, and interruption breakdowns;
- CHI 2025 qualitative-research work documents unresolved privacy, ethics, bias, and methodological-intent concerns around LLM use.

Required correction before any later AI-moderated breadth is pooled with human exploratory evidence:

1. label interviewer mode for every case;
2. run a pre-specified bridge/compatibility study against the stable human guide;
3. audit probe depth, one-question adherence, leadingness, premature termination/information loss, event concreteness, and evidence-class yield;
4. compare resulting case classification/interpretive consequences;
5. do not pool modes until the study owner explicitly accepts compatibility for the specific research question;
6. if compatibility is not supported, treat AI-moderated data as a separate evidence stream.

AI assistance for de-identified structuring/coding remains support, not independent validation.

## A-04 — Pre-fieldwork data/privacy operation is not yet decision-complete

Severity: **MATERIAL / FIELDWORK START BLOCKER**

See Acceptance criterion 5 above.

This does not require legal/privacy conclusions to be stored in Product canonical docs. It requires a concrete research-operations packet before collecting real participant data.

## A-05 — Screener cognitive pretest language can overstate validation

Severity: **REQUIRED CORRECTION, lower materiality**

`2–3` target-like cognitive pretests are useful for catching gross wording/interpretation failures but cannot be described as validating the screener or exhausting survey problems.

Required correction: label this a **pilot comprehension check**, not screener validation/saturation. Continue revising when live recruitment/interviews reveal misunderstood questions.

## A-06 — Problem evidence and hypothetical delegation evidence need a stronger boundary

Severity: **REQUIRED CORRECTION**

Issue #36 primarily validates problem/segment. The late interview hypothetical about delegated monitoring is useful `SELF-REPORT`, but should not override strong recent behavioral evidence merely because a participant is cautious about an imagined system.

Required correction:

- primary problem/segment disposition rests on recent behavior, residual gap, consequence, real baseline adequacy, and reachability;
- delegation hypothetical is secondary boundary evidence for next-test design;
- categorical structural rejection may weaken the wedge, but is not treated as observed non-adoption.

---

# Evidence update used in this audit

## Qualitative sample adequacy

- Wutich, Beresford & Bernard, 2024, *Sample Sizes for 10 Types of Qualitative Data Analysis*, DOI `10.1177/16094069241296206`.
- Roberts & Saylor, 2026, *Data saturation and information power: sample size in qualitative research—when is enough and how to assess?*, DOI `10.1093/eurjcn/zvag046`.
- Moore, Aguinis & Darden, 2026, *Defining, assessing, and reporting saturation in qualitative research*, DOI `10.1016/j.leaqua.2026.101950`.

## Event-centered interviewing

- Kelly & Sennott, *Event-Centered Interviewing: Integrating Qualitative Interviews with Experience Sampling Technologies*, DOI `10.1177/00811750241283743`, published in Sociological Methodology 55(1).
- Habimana-Jordana & Lanau, 2026, *Event Interviews: A Visual Tool to Study Shocks, Change and Adaptation*, DOI `10.1177/16094069251414081`.

## Online participant fraud

- Crossen, Harper & Maloney, 2026, *Identifying and Managing Fraudulent Participants in Online Qualitative Research*, DOI `10.1097/NNR.0000000000000886`.
- 2026 JMIR, *Detecting and Preventing Fraudulent Participation in Qualitative Research*, DOI `10.2196/87037`.
- Mistry et al., P-FROST recommendations, 2026 journal issue / DOI `10.1177/10497323241288181`.

## AI interviewing

- Panfilova et al., 2026, *The AI interviewer: multi-faceted evaluation of adaptive questioning by large language models*, Scientific Reports, DOI `10.1038/s41598-026-46517-7`.
- Zhang et al., 2026, *When the Interviewer Is a Bot: Behavior, Breakdowns, and Trust in MLLM-Led Interviews*, arXiv `2608.10412`, accepted to ACM HCOMP 2026, DOI reported as `10.1145/3834580.3838754`.
- Schroeder et al., CHI 2025, *Large Language Models in Qualitative Research: Uses, Tensions, and Intentions*, DOI `10.1145/3706598.3713120`.

## Current Japan email/work context

- Japan Business Email Association, *ビジネスメール実態調査2026*, n=1,293 work-email users; useful population context only, not target-segment evidence.
- Dillon, Jaffe, Immorlica & Stanton, *Shifting Work Patterns with Generative AI*, NBER Working Paper 33795 / AER: Insights forthcoming: 66 firms / 7,137 knowledge workers; integrated GenAI users spent about two fewer hours/week on email in the latter experiment period. Generic `faster email` is therefore an insufficient wedge.

## Current incumbent overlap

- Superhuman Auto Reminders/Auto Drafts automatically resurface unanswered sent mail and draft follow-ups.
- Fyxer tracks sent mail awaiting reply and creates follow-up drafts after configured waiting periods.
- Shortwave/Tasklet supports AI to-dos, search, filters, and background automation.
- Gmail AI Inbox continues expanding task/to-do and proactive assistance behavior in 2026.

These are frontier/baseline facts, not evidence that any participant uses or is satisfied by them.

## Japan privacy/data handling

- Personal Information Protection Commission, APPI General Guidelines, amended 2026: purpose specification/notification, secure management, processor oversight, leak response, etc.
- PPC cloud/foreign-processing Q&A: actual processor access/handling matters; use of foreign/cloud processors requires concrete review rather than assumptions from server geography alone.

---

# Root-cause analysis

The old protocol was drafted before Product Content COMPLETE and was already strong on interview technique. The remaining failures come from **control-plane drift**, not weak Product reasoning:

1. canonical Product routing changed after PR #46;
2. the sampling oracle did not make the unit of `support` explicit enough for a multi-cohort design;
3. AI-interviewer evidence moved quickly in 2026, making interviewer-mode compatibility a new material concern;
4. privacy principles existed, but no exact pre-fieldwork operations gate was required.

The correction should therefore strengthen protocol/test-oracle boundaries rather than redesign Issue #36 or add Product scope.

---

# Required batch correction

Create a current-main Issue #36 fieldwork protocol that:

1. binds to current Product authority/routing without exposing Product ontology to participants;
2. uses adaptive cohort-specific information-power logic;
3. requires a bridge/compatibility gate before mixing AI-moderated and human-moderated evidence;
4. adds a hard pre-fieldwork data-handling/privacy readiness gate;
5. labels 2–3 screener pretests as pilot comprehension checks only;
6. keeps hypothetical delegation as secondary `SELF-REPORT` evidence;
7. preserves all strong anti-fraud, counterexample, recent-event, baseline-tool, evidence-matrix, and stop/redirect mechanisms from the prior candidate;
8. remains noncanonical Product research and does not authorize implementation.

After batch correction, perform a fresh full acceptance audit of Issue #36 + the entire new cumulative candidate before merging any protocol PR.