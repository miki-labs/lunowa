# Issue #36 Fieldwork Launch Evidence — 2026-08-28

## Status

**NONCANONICAL EXTERNAL-EVIDENCE TRACE.**

Supports Issue #49 launch decisions. External facts are time-sensitive and must be rechecked when materially used.

---

## 1. Japan privacy / data handling

### Personal Information Protection Commission — General Guidelines

Source:
- https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/

Current page identifies the General Guidelines as partially revised in **June 2026**.

Material implications for fieldwork operations:

- purpose notification/publication is a real requirement category when personal information is acquired;
- appropriate security controls are required for personal data;
- processor/contractor supervision is a material duty category;
- incident response/reporting/participant notification duties may apply depending on the event.

Do not turn this repository note into case-specific legal advice.

### PPC — pseudonymized / anonymized information

Sources:
- https://www.ppc.go.jp/personalinfo/legal/guidelines_anonymous/
- https://www.ppc.go.jp/all_faq_index/faq1-q14-2/

Material implication:

Removing a name/email does **not** automatically make a participant record anonymous. If the holder can readily link pseudonymized material to other information and identify the person, it can remain personal information.

Therefore R1 pseudonymous working evidence is not automatically safe for public GitHub.

### PPC — foreign processors / outsourced handling

Source:
- https://www.ppc.go.jp/personalinfo/legal/guidelines_offshore/

Material implication:

Where a processor handles personal data, minimize data to what is necessary and review/supervise the processor appropriately for the real handling context. Generic cloud availability is not sufficient approval evidence.

---

## 2. Google Meet capture controls

### Google Meet recording

Source:
- https://support.google.com/meet/answer/9308681?hl=ja

Current help states that recording is a host/permission-controlled meeting feature. Google also supports an administrator setting that can require explicit participant agreement before features such as recording, transcription, or AI note-taking are used.

### Google Meet transcripts

Source:
- https://support.google.com/meet/answer/12849897

Current help documents separate controls for recording, transcription, and note-taking, including automatic-start settings that organizers/admins may configure.

Operational implication:

Wave 1 can use ordinary Meet while keeping all capture/intelligence features OFF, but the **actual organizer account must be checked** because generic product capability does not prove the account's defaults.

---

## 3. Google Drive / Workspace storage

### Drive limited access

Source:
- https://support.google.com/drive/answer/14254362?hl=ja

Current Drive help states that limited-access folders can restrict opening to permitted users and recommends limited-access subfolders for sensitive files.

Operational implication:

This is a useful access-control capability for a possible R1/R2 store. It does not establish that the connected account is under the correct contract or that the actual folder is private.

### Workspace privacy / data-processing terms

Sources:
- https://knowledge.workspace.google.com/admin/compliance/privacy-compliance-and-records-for-google-workspace-and-cloud-identity
- https://workspace.google.com/terms/workspace-personal-terms/

Current 2026 documentation describes data-processing commitments for supported Google Workspace / Workspace Personal contractual contexts.

Operational implication:

Do **not** infer that a generic personal Google Drive account is automatically covered by a particular business DPA. Verify the actual account/service tier and applicable agreement before approving Drive as R1/R2.

---

## 4. Recruitment panel capabilities

### User Interviews

Source:
- https://www.userinterviews.com/our-research-panel

Current vendor page claims approximately **3.2M professionals** and professional targeting by occupation, industry, seniority, and company size; it also states that nearly half of applications arrive with LinkedIn or work-email verification.

Classification: **VENDOR CLAIM / CAPABILITY EVIDENCE**.

Do not infer Japan incidence for the exact Lunowa cohort or research quality from the panel total.

### Respondent

Source:
- https://www.respondent.io/browse-panel

Current vendor page claims approximately:

- 4.3M verified participants;
- 3.1M professionals;
- coverage across 150+ countries.

Classification: **VENDOR CLAIM / CAPABILITY EVIDENCE**.

Do not infer cohort incidence, representativeness, or fraud-free performance from the headline numbers.

### Macromill Interview Zero

Source:
- https://www.macromill.com/press/release/20240822.html

Macromill describes Interview Zero as a self-service online interview platform using its Japanese proprietary panel.

Classification: domestic vendor capability evidence; panel/recruiting performance for the exact Issue #36 cohort remains unknown until tested.

---

## 5. Incentive reference

### Macromill 2026 incentive guidance

Source:
- https://www.macromill.com/service/words/interview-reward/

Published February 20, 2026.

The article gives broad reference ranges:

- 60–90 minute 1:1 depth interview: roughly **¥3,000–¥15,000**;
- specialist/decision-maker participants can require materially higher incentives.

Operational inference:

A **¥10,000 default for a 45-minute independent/small-firm B2B professional** is a reasonable recruitment starting point, not a scientific optimum. Adjust based on actual fill/eligibility/participant opportunity cost without paying for supportive answers.

---

## 6. Online qualitative participant fraud

### P-FROST / Qualitative Health Research

Sources:
- https://pubmed.ncbi.nlm.nih.gov/39548877/
- https://doi.org/10.1177/10497323241288181

Published in volume 36(7), 2026; first published online in 2024.

The paper describes fraudulent participation as an increased risk in online qualitative research, especially with monetary incentives, and proposes layered recommendations across study setup, incentives/recruitment, data collection, and analysis/reporting.

Operational implication:

Use layered validity controls and documented adjudication. Do not treat one red flag as a validated fraud classifier and do not relabel disconfirming evidence as fraud.

---

## 7. AI interviewer mode risk

### Scientific Reports 2026

Source:
- https://www.nature.com/articles/s41598-026-46517-7
- DOI: https://doi.org/10.1038/s41598-026-46517-7

Published April 4, 2026; version of record July 2, 2026.

The controlled evaluation reports meaningful cross-model differences in follow-up necessity, context awareness, openness/non-leadingness, empathy/style, latency, questioning intensity, and protocol robustness.

Operational implication:

- there is no generic `AI interviewer` equivalence class;
- changing model/orchestration can change the measurement instrument;
- first-wave human moderation remains justified for unstable exploratory discovery;
- any later AI-moderated stream requires explicit bridge/compatibility evidence before pooling with human-moderated Issue #36 evidence.

---

## 8. Evidence limits

None of the sources above establish:

- the Lunowa ICP;
- prevalence of communication-monitoring burden;
- the optimal interview count;
- a legal conclusion for a not-yet-selected storage/vendor stack;
- the empirical reliability threshold required for monitoring delegation;
- that a named panel will successfully recruit the exact target cohort in Japan.

Those remain Issue #36 or launch-environment evidence targets.
