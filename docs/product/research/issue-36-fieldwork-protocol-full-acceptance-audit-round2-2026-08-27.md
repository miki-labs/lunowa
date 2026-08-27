# Issue #36 Fieldwork Protocol — Full Acceptance Audit Round 2

Date: 2026-08-27

## Disposition

**FAIL / REVISE**

This audit re-evaluates the entire current v2 protocol candidate after the first batched correction, not only the new privacy section.

Candidate audited:

- branch: `chatgpt/issue-36-fieldwork-protocol-v2`;
- base: current `main` at `d569d8f1a61b45a0d733a53dc2b90ccc37e67bb9`;
- protocol candidate introduced at commit `d275074424c4f4c6d067c1efbd2fe75bff7957e6`;
- live Issue #36 contract as of `updated_at=2026-08-26T17:19:39Z`.

The first audit corrected stale Product routing, cohort-specific information-power logic, AI-interviewer compatibility, privacy start-gate requirements, pilot-comprehension wording, and the problem-evidence/delegation-hypothetical boundary.

Round 2 finds one additional material blocker caused by the **public repository boundary**.

---

# Material blocker B-01 — participant/loop-level de-identification is not sufficient for public GitHub by default

Severity: **MATERIAL / FIELDWORK DATA-GOVERNANCE BLOCKER**

The v2 protocol currently says to store de-identified structured participant/loop evidence in the repository.

That is too permissive because this repository is public.

A participant/loop record may omit name/email and still remain identifying or re-identifiable through combinations such as:

- niche profession/company context;
- exact dates/time windows;
- client/vendor relationship type;
- distinctive workflow/tool stack;
- unusual event/consequence;
- verbatim language;
- recruitment channel;
- cross-reference with public professional information.

Current Japanese Personal Information Protection Commission guidance explicitly distinguishes simple removal/pseudonymization from information that is actually outside personal-information treatment. Removing direct identifiers alone does not guarantee that the resulting record is non-personal if it can be readily matched with other information to identify a person.

Relevant current PPC sources:

- APPI General Guidelines, partly amended June 2026;
- PPC pseudonymized/anonymized-information guidance, partly amended April 2026;
- PPC FAQ explaining that information with identifying fields removed can still be personal information where it can be readily collated with other information to identify the person;
- PPC FAQ explaining that pseudonymized information may remain personal information where the organization retains source data/mapping information.

## Required correction

Introduce explicit storage tiers:

### Public durable GitHub (`R0`)

May contain only:

- research method/protocol;
- aggregate cohort-level findings;
- cohort-level counts/ranges when disclosure-safe;
- synthesized patterns/counterpatterns;
- high-level limitations;
- disposition and next experiment;
- only minimal quotes/paraphrases that have passed re-identification review and are appropriate for public disclosure.

Must not contain by default:

- participant codes tied to detailed records;
- row-level participant/loop matrix;
- exact dates tied to rare events;
- detailed tool/workflow combinations that can identify a person;
- raw/verbatim interview text;
- contact/recruitment/admin data;
- screenshots/raw artifacts.

### Protected research working store (`R1`)

Contains pseudonymous structured participant/loop evidence, interview notes, coding, claim-evidence mapping, and any disclosure-sensitive operational detail.

Requires access control and is not public.

### Identity / admin mapping (`R2`)

Contact details, participant-code mapping, scheduling, consent/compensation administration.

Stored separately from analytical evidence with minimum access and independent retention rules.

### Raw media/transcript (`R3`)

Default: **not collected** for the first wave unless explicitly enabled by the approved data-handling decision.

If collected, use a protected store, explicit consent, shortest defensible retention, and deletion after structured extraction/quality review according to the predeclared schedule.

## Public reporting rule

Before anything moves from R1 to R0, perform a disclosure review:

1. remove direct identifiers;
2. generalize/suppress rare quasi-identifiers;
3. remove exact dates/company/client details when unnecessary;
4. check combinations for re-identification risk;
5. avoid verbatim quotes by default; use paraphrase unless a quote is necessary and approved;
6. preserve analytical meaning without exposing unnecessary participant detail.

Do not label ordinary pseudonymization as `anonymous` or legally anonymous processed information unless the applicable standard is actually met.

---

# Full-candidate re-audit after B-01

Other Issue #36 acceptance dimensions remain materially sound:

- behavior-based recruitment: PASS;
- recent-event reconstruction: PASS;
- actual baseline/workaround capture: PASS;
- counterexamples/negative controls: PASS;
- evidence-class separation: PASS;
- no population/WTP/PMF overclaim: PASS;
- cohort-specific disposition: PASS after v2 correction;
- adaptive information-power logic: PASS;
- first-wave human moderation: PASS;
- AI-interviewer bridge gate: PASS;
- fraud controls: PASS;
- hypothetical delegation as secondary SELF-REPORT: PASS;
- implementation remains unauthorized: PASS.

No additional material methodological blocker was identified in this round beyond B-01.

---

# Root-cause analysis

The first audit correctly identified that the **actual data-handling operation** must be fixed before fieldwork, but the v2 drafting step inherited an assumption from the old protocol that `de-identified structured observations` were suitable for the repository.

That assumption failed to account for the repository's **public visibility** as a separate publication/disclosure boundary.

Preventive fix:

> Data minimization and de-identification are not sufficient publication criteria. Every destination has its own disclosure authority and re-identification risk.

The final protocol and operations packet must therefore distinguish R0/R1/R2/R3 explicitly.

---

# Required batch correction

1. amend the v2 protocol evidence matrix/storage language to keep row-level working evidence outside public GitHub;
2. add the R0/R1/R2/R3 storage model and public disclosure review;
3. create an operations packet that makes the pre-fieldwork data flow explicit;
4. keep raw recording OFF by default unless separately enabled;
5. keep actual vendor/storage processor choices as explicit start-gate fields and review them against current PPC guidance before participant collection;
6. conduct another full candidate audit after these corrections before any protocol merge.