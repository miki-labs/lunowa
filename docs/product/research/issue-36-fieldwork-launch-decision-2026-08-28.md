# Issue #36 Fieldwork Launch Decision — 2026-08-28

## Status

**NONCANONICAL RESEARCH-OPERATIONS DECISION CANDIDATE.**

Task authority: GitHub Issue #49, `[Product Discovery]: Resolve Issue #36 fieldwork launch configuration`.

Parent authority: Issue #36 plus the merged Issue #48 fieldwork protocol/operations control plane.

Repository baseline at branch creation:

- `main`: `99e9089d1d105eaeda27b795434d5649d3c1a891`;
- Issue #36: OPEN;
- Issue #48: COMPLETE;
- Product implementation: not authorized by this work.

This document resolves all launch choices that can be responsibly resolved from current evidence and explicitly preserves account/device/vendor facts that cannot be inferred remotely.

---

# 1. Executive disposition

```text
FIELDWORK CONTROL PLANE = READY
LAUNCH CONFIGURATION = DECISION-COMPLETE
FIRST REAL PARTICIPANT COLLECTION = BLOCKED
```

The study is blocked on a small number of **real-environment verification values**, not on Product theory or interview methodology.

The first participant may be recruited only when every `MUST VERIFY` / `MUST RESOLVE` item in section 11 is closed with actual evidence.

---

# 2. First-wave operating doctrine

Use the minimum-data, maximum-falsifiability configuration:

| Area | Decision |
|---|---|
| moderator | human |
| interview length | ~45 minutes |
| Product pitch before recent-event evidence | prohibited |
| recording | OFF |
| automated transcription | OFF |
| AI meeting notes | OFF |
| raw participant/client content to external AI | OFF |
| artifact sharing | optional, participant-controlled |
| inbox access | prohibited |
| screenshot/raw-email collection | prohibited |
| R3 raw media | NOT USED in wave 1 |
| public GitHub participant/loop working rows | prohibited |
| analysis | within-case first, cross-case second, batch review every ~4–6 valid interviews or earlier |
| positive support | cohort-specific only |

Why:

- Issue #36 is a problem/segment discovery gate, not a transcription/AI-automation experiment;
- recording/transcription create storage, consent, processor, retention, and disclosure burden without being required to reconstruct recent events;
- human moderation protects exploratory probing depth while the problem model is unstable;
- minimum-data collection reduces privacy and operational failure surfaces.

---

# 3. Recruitment decision

## 3.1 Wave 1 — DECIDED

Start with **direct / warm professional-network outreach**.

The first adaptive block should prioritize workflow-qualified independent/fractional/solo professional-service operators and adjacent small client-service operators.

Recruit on behavior, not title:

- external asynchronous coordination through email;
- personally responsible for noticing progress/stall;
- several unresolved matters can coexist;
- matters can remain open overnight or longer;
- current systems do not clearly own all heterogeneous loops.

Do not recruit only friends, founders, AI enthusiasts, productivity-tool enthusiasts, or people already excited by Lunowa.

## 3.2 Initial block size — DECIDED AS PLANNING HEURISTIC

Target **4–6 valid human-moderated interviews** in the first coherent workflow-defined cohort, then conduct a batch review before expanding.

This is not a pass threshold and not saturation proof.

After the first batch:

- deepen the same cohort if the explanation is becoming more coherent and new cases remain informative;
- redirect to the highest-information contradiction if the emerging model is weak;
- stop the cohort if important loops are absent/already solved/trivial;
- do not mechanically fill a 15–24 total quota.

## 3.3 Independent recruitment path before positive disposition — DECIDED

No cohort may reach `SUPPORTED FOR NEXT TEST` solely from the founder's personal network.

Before a positive Issue #36 disposition, obtain materially independent recruitment evidence through at least one of:

- a verified B2B research panel;
- a separate professional community/network not socially downstream of the founder;
- a specialist Japanese research recruiter/panel.

Treat source differences as evidence/limitations rather than statistical representativeness.

## 3.4 Paid panel candidates — DEFERRED UNTIL AFTER FIRST BATCH

Current vendor capability evidence:

- **User Interviews** reports a panel of 3.2M professionals and supports professional targeting; nearly half of applications are described as arriving with LinkedIn/work-email verification;
- **Respondent** reports 4.3M verified participants, including 3.1M professionals, across 150+ countries;
- **Macromill Interview Zero** provides access to a large Japanese proprietary panel and is a domestic option;
- **ASMARQ** is a Japanese qualitative-research/recruiting option.

These are vendor claims/capabilities. They are not independent evidence that the exact Issue #36 cohort has adequate Japan incidence or that recruited cases are valid.

Do not purchase a panel before first-batch learning sharpens the screener unless direct recruitment cannot fill the initial block.

---

# 4. Interview service decision

## 4.1 Preferred service — DECIDED

Use **Google Meet** for the first wave, provided the real organizer account passes the verification checklist below.

Why:

- ordinary video conversation is sufficient;
- screen sharing can remain participant-controlled;
- recording, transcription, and note-taking are separable features;
- Google supports participant consent controls for capture features, although wave 1 keeps those features off.

This is not a claim that Google Meet is uniquely compliant or superior. It is the lowest-complexity currently available meeting path for this research design.

## 4.2 MUST VERIFY on the actual organizer account

Before the first participant:

- meeting does **not** auto-record;
- transcription does **not** auto-start;
- `Take notes for me` / AI notes do **not** auto-start;
- no third-party meeting bot automatically joins;
- participant can join without being forced to expose unnecessary profile information where practical;
- host controls allow stopping any accidentally activated capture feature immediately;
- calendar invite / joining instructions do not expose unrelated participant contact data to other participants.

If these conditions cannot be guaranteed, switch service or change account/settings before recruitment.

## 4.3 NOT USED in wave 1

- Zoom AI Companion / automated summaries;
- Teams Copilot / intelligent recap;
- Meet automatic transcription/notes;
- third-party meeting bots;
- session-replay or conversation-intelligence services.

These may be evaluated later only under a new processor/data-flow decision.

---

# 5. Research data model

## R0 — public durable GitHub

Allowed:

- protocol;
- research-method decisions;
- aggregate/cohort findings;
- limitations;
- Issue #36 final disposition;
- disclosure-reviewed examples only.

Prohibited by default:

- raw row-level participant/loop working evidence;
- contact details;
- participant-code mapping;
- screenshots/raw email;
- recordings/transcripts;
- exact combinations of rare profession/client/event/time details that create re-identification risk.

## R1 — protected research working store

Contains:

- participant code only;
- structured event/loop evidence;
- evidence class;
- current tool/feature actually used;
- self-check/scaffolding reconstruction;
- counterexamples;
- researcher inference separately labeled;
- claim-evidence mapping;
- batch-review notes.

Direct identifiers do not belong in R1.

## R2 — identity/admin store

Contains only what is necessary for:

- contact;
- scheduling;
- participant-code mapping;
- study-information/consent administration;
- compensation delivery;
- follow-up permission.

R2 must remain separate from analytical R1 material.

## R3 — raw media/transcript

```text
WAVE 1 = OFF / NOT COLLECTED
```

---

# 6. Storage decision

## 6.1 Preferred privacy posture — DECIDED

Use **protected storage with restricted access, explicit deletion capability, and a separate R1/R2 boundary**.

Do not use public GitHub, ordinary unreviewed shared folders, email threads, chat history, or an AI workspace as the authoritative R1/R2 store.

## 6.2 Actual storage provider — MUST RESOLVE / BLOCKING

This cannot be safely inferred from repository state.

Two acceptable starting paths are:

### Option A — encrypted local storage

Use if the research device and backup path can be verified as encrypted and access-controlled.

Must verify:

- device/disk encryption actually enabled;
- OS account protected by strong authentication;
- R1 and R2 are separate directories/containers;
- backup destination is known and protected;
- deletion can be executed from active and backup copies according to policy.

### Option B — controlled Google Drive / Workspace storage

Use only after verifying the actual account/contract and sharing state.

Current generic capabilities/evidence:

- Google Drive supports limited-access folders where only explicitly permitted users can open contents;
- Google Workspace and Workspace Personal have current data-processing terms in supported contractual contexts;
- capability/terms documentation does **not** prove that the connected account is under the needed contract or that its folder is correctly restricted.

Must verify:

- exact account/service tier and applicable data-processing terms;
- R1 and R2 folders are not inherited from a shared/public parent;
- general access is restricted;
- only the research owner/reviewer(s) have access;
- backup/sync behavior is understood;
- retention/deletion is executable;
- any foreign/cloud-processing obligations relevant to actual use are reviewed.

## 6.3 Decision rule

Choose the first option that can be **actually verified**, not the option with the most convenient UI.

Until one option passes verification:

```text
R1/R2 STORAGE = BLOCKED
FIELDWORK START = BLOCKED
```

---

# 7. Retention/deletion decision

## 7.1 R1 — DECIDED AS EVENT-BASED POLICY

Retain detailed R1 working evidence only through:

```text
Issue #36 final disposition
+ independent/final review
+ 30 calendar days for correction/reproducibility cleanup
```

Then:

- delete unnecessary row-level detail;
- retain only the minimum research evidence needed to support durable aggregate conclusions;
- if a subsequent experiment needs re-contact or evidence reuse, make a new explicit retention decision rather than silently extending everything.

## 7.2 R2 — DECIDED AS MINIMUM ADMIN POLICY

Participant-code/contact mapping should be deleted after:

```text
compensation complete
+ any explicitly consented follow-up window expires
+ 30 calendar days for payment/admin correction
```

except records that must be retained for legitimate accounting/tax/payment administration; those records must remain outside the analytical research dataset and follow the applicable administrative retention basis.

## 7.3 R3

Not applicable in wave 1 because R3 is not collected.

## 7.4 Incident preservation exception

If a security/privacy/payment dispute requires temporary evidence preservation, document the reason, scope, access, and revised deletion trigger. Do not silently convert this into indefinite retention.

---

# 8. Participant notice / consent route

## 8.1 Participant-facing purpose — DECIDED

Use a neutral but truthful purpose statement:

> 仕事上のメールや他のツールをまたいで、途中の仕事・やり取りをどのように把握しているかを調べるProduct Discoveryです。最近の具体的な仕事の流れと、現在の仕組みで十分うまくいっている例の両方を伺います。

Do **not** state before evidence collection that the study is trying to prove `manual monitoring burden`, `open loops`, `safe forgetting`, `Waiting`, `Responsibility`, or another desired Lunowa construct.

This avoids avoidable demand-characteristic priming while still telling the participant the actual research domain.

## 8.2 Required notice content — DECIDED

Before participation, communicate at minimum:

- study purpose/domain;
- approximate duration;
- voluntary participation / skip or stop;
- no need to reveal private message text, client names, credentials, or unrelated confidential information;
- recording/transcription/AI-note posture;
- what data are stored and at what level;
- public reporting posture;
- compensation conditions;
- contact for privacy/research questions;
- deletion/contact route where applicable.

## 8.3 Actual contact address — MUST RESOLVE / BLOCKING

A real monitored contact channel must be selected before recruitment.

Do not use a public GitHub issue as the participant privacy/contact channel.

---

# 9. Incentive and payment decision

## 9.1 Amount — DECIDED

Default first-wave incentive:

```text
45-minute eligible professional interview = ¥10,000
scarce/high-opportunity-cost case = up to ¥15,000 with pre-session decision
```

Rationale:

- current Macromill 2026 guidance places ordinary 60–90 minute 1:1 interviews around ¥3,000–¥15,000 and notes materially higher amounts for specialist/decision-maker participants;
- a 45-minute independent B2B professional session has meaningful opportunity cost;
- underpaying may bias recruitment toward professional-panel participants with atypical incentives, while very high publicized payments may increase fraud pressure.

This is a starting operational parameter, not a market-value claim.

## 9.2 Compensation conditions — DECIDED

Pay for an **eligible completed session**, not for:

- Product-positive answers;
- reporting pain;
- high detail;
- willingness to use Lunowa;
- agreeing with the researcher.

A participant who says `my CRM already solves this` remains eligible for compensation if the session is valid.

## 9.3 Payment mechanism — MUST RESOLVE / BLOCKING

Choose a method that minimizes additional identity/banking data.

Preferred order:

1. recruitment-platform managed incentive when using a paid panel;
2. digital gift/payment method requiring no more data than already necessary for R2;
3. bank transfer only if needed, with payment details isolated from R1 and subject to separate administrative retention.

The exact wave-1 direct-recruit payment method must be selected before the first invitation promises compensation.

---

# 10. Fraud / invalid-participant decision

Use layered checks; no single signal automatically proves fraud.

## Before scheduling

- concrete recent-event screener answer;
- internal consistency of role/tool/workflow answers;
- professional-context verification where proportionate and consented;
- do not publish exact qualification logic.

## At session start

- casually reconfirm one or two screener facts;
- verify participant can elaborate on a real recent event without exposing confidential details.

## During session

Watch for clusters:

- generic/scripted non-specific answers;
- contradictions in tool/work context;
- inability to explain sequence/state change;
- incentive-focused pressure;
- duplicated identity/contact patterns where visible through the recruitment process.

## Adjudication

- preserve uncertainty;
- document exclusion reason outside Product evidence;
- do not accuse participant based on one ambiguous signal;
- do not reclassify disconfirming evidence as fraud.

## Compensation rule — DECIDED

- legitimate eligible completed session: pay regardless of finding direction;
- obvious pre-session ineligibility: do not schedule/pay under the disclosed policy;
- suspected mid/post-session fraud: use a documented adjudication path before withholding payment; no impulsive moderator decision.

P-FROST is a method reference, not a validated fraud detector.

---

# 11. Objective launch checklist

## DECIDED — already satisfied by the research contract

- [x] behavior-based recruitment;
- [x] recent-event interview guide;
- [x] negative/control cases;
- [x] first wave human-moderated;
- [x] recording OFF;
- [x] transcription OFF;
- [x] AI meeting notes OFF;
- [x] R3 OFF;
- [x] raw private participant/client content to external AI OFF;
- [x] public GitHub restricted to R0 publication-safe material;
- [x] direct-network first recruitment path;
- [x] Google Meet preferred interview path;
- [x] ¥10,000 standard incentive planning default;
- [x] event-based R1/R2 deletion policy;
- [x] independent recruitment-path requirement before positive Issue #36 disposition.

## MUST VERIFY — real account/device/service evidence required

- [ ] Google Meet organizer account has recording OFF by default;
- [ ] transcription OFF by default;
- [ ] AI notes / `Take notes for me` OFF by default;
- [ ] no third-party meeting bot auto-joins;
- [ ] chosen R1 storage is access-controlled/encrypted as applicable;
- [ ] chosen R2 storage is separately access-controlled;
- [ ] backup/sync paths do not create uncontrolled copies;
- [ ] deletion can be executed under the chosen storage path;
- [ ] actual cloud/vendor processor terms are reviewed where used.

## MUST RESOLVE MANUALLY — cannot be inferred safely

- [ ] research/privacy contact channel;
- [ ] exact R1 storage location/provider;
- [ ] exact R2 storage location/provider;
- [ ] actual authorized reviewer/access list;
- [ ] exact direct-recruit payment method;
- [ ] any accounting/tax retention path for payment records;
- [ ] first independent recruitment network/panel planned for cross-check after initial learning.

## NOT USED — wave 1

- [x] session recording;
- [x] automated transcription;
- [x] AI meeting summarizer;
- [x] raw-media archive;
- [x] external AI processing of raw participant/client material;
- [x] public participant-level working matrix;
- [x] autonomous AI interviewer.

---

# 12. GO / BLOCKED oracle

`FIELDWORK START = GO` only when:

```text
all MUST VERIFY items = evidenced PASS
AND all MUST RESOLVE MANUALLY items = concrete values
AND participant notice reflects those real values
AND compensation promise matches the real delivery path
AND no new material privacy/method blocker is open
```

Otherwise:

```text
FIELDWORK START = BLOCKED
```

Current disposition at this candidate:

> **BLOCKED — research methodology is ready, but storage/contact/payment/account-specific verification is not yet evidenced.**

This is a successful launch-decision result, not a research failure. Starting participant collection despite these unresolved values would be the failure.

---

# 13. Current external evidence used

Material current evidence checked for this decision:

- Japan PPC, Personal Information Protection Act Guidelines (General Rules), June 2026 revision: purpose notification/publication, safety controls, processor supervision, incident duties;
- Japan PPC pseudonymized/anonymous-information guidance: removal of direct identifiers does not automatically remove personal-information status where data remain readily linkable;
- Japan PPC foreign-third-party/processor guidance: data minimization and appropriate supervision remain material when processors handle personal data;
- Google Drive current help: limited-access folders can restrict folder access to explicitly permitted users;
- Google Workspace current 2026 contractual/privacy materials: data-processing commitments exist in supported Workspace contractual contexts, but actual account coverage must be verified;
- Google Meet current help: recording/transcription/note-taking are separately controlled capture features and participant-consent controls exist in supported admin settings;
- User Interviews current panel page: 3.2M professionals (vendor claim);
- Respondent current panel page: 4.3M verified / 3.1M professionals across 150+ countries (vendor claim);
- Macromill 2026 interview-incentive guidance;
- P-FROST / Qualitative Health Research 2026 publication on fraudulent online qualitative participation;
- Scientific Reports 2026 AI-interviewer evaluation: material model-level trade-offs support maintaining human-first exploratory interviewing and explicit mode-compatibility tests.

These sources constrain operations; none establish the Lunowa ICP or Issue #36 outcome.

---

# 14. What comes next

Do **not** recruit yet.

Next operational task is only to close the remaining launch blockers with actual account/device/service evidence. Once the GO oracle passes:

1. cognitively pretest the screener/notice with target-like non-study testers under the same privacy rules;
2. launch the first direct-outreach recruitment block;
3. schedule 4–6 valid human-moderated interviews adaptively;
4. analyze after each session and formally after the first batch;
5. recruit the highest-information contradiction next;
6. use a materially independent recruitment path before any `SUPPORTED FOR NEXT TEST` disposition;
7. keep Issue #36 open until actual evidence supports one final disposition.
