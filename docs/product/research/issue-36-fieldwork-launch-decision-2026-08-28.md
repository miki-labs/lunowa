# Issue #36 Fieldwork Launch Decision — 2026-08-28

## Status / authority

**NONCANONICAL RESEARCH-OPERATIONS DECISION under Issue #49.**

This is the current cumulative launch decision for Issue #36. It incorporates the audited Issue #48 control plane, PR #51 launch audit, and post-merge real-environment verification performed on 2026-08-28.

Current repository baseline for this reconciliation: `main` @ `9c024909c73bffeedd28b04e4534d0763d4cac5d`.

This document does not collect participant evidence, declare an ICP, close Issue #36, or authorize implementation.

---

# 1. Executive disposition

```text
PRODUCT CONTENT = COMPLETE
FIELDWORK CONTROL PLANE = READY
LAUNCH DECISION = DECISION-COMPLETE
FIRST REAL PARTICIPANT COLLECTION = BLOCKED
```

The remaining blockers are **real-environment operational checks**, not unresolved Product theory or interview methodology.

`FIELDWORK START = GO` only after every pre-first-participant blocker in section 11 has actual evidence or a concrete value.

---

# 2. First-wave doctrine — DECIDED

| Area | Wave-1 decision |
|---|---|
| moderator | human |
| session length | ~45 minutes |
| Product/Lunowa pitch before event evidence | prohibited |
| recording | OFF |
| automated transcription | OFF |
| AI meeting notes | OFF |
| autonomous AI interviewer | OFF |
| raw participant/client content to external AI | OFF |
| artifact sharing | optional, participant-controlled |
| inbox access | prohibited |
| screenshot/raw-email collection | prohibited |
| R3 raw media | NOT USED |
| public GitHub row-level working evidence | prohibited |
| analysis | within-case first; cross-case second; batch review after ~4–6 valid cases or earlier |
| support claim | cohort-specific only |

Issue #36 is a problem/segment discovery gate. Extra capture/AI tooling would add consent, processor, retention, and measurement-mode risks without being necessary for the first exploratory wave.

---

# 3. Recruitment — DECIDED

## 3.1 First adaptive block

Start with **direct / warm professional-network outreach** to workflow-qualified independent/fractional/solo professional-service operators and adjacent small client-service operators.

Recruit on behavior, not title:

- external asynchronous work through email;
- participant personally notices progress/stall;
- several unresolved matters can coexist;
- some matters remain open overnight or longer;
- no single current system clearly owns all heterogeneous loops.

Do not recruit only friends, founders, AI enthusiasts, productivity-tool enthusiasts, or people already enthusiastic about Lunowa.

## 3.2 Initial planning block

Target **4–6 valid human-moderated interviews** in the first coherent workflow-defined cohort, then review before expanding.

This is neither a pass threshold nor saturation proof.

After the block:

- deepen if the explanation is coherent and new cases remain informative;
- recruit the highest-information contradiction when uncertainty remains;
- stop/deprioritize if important loops are absent, trivial, or already adequately owned by current systems.

## 3.3 Independent recruitment evidence before positive disposition

No cohort may receive `SUPPORTED FOR NEXT TEST` solely from the founder's personal network.

Before a positive Issue #36 disposition, use a materially independent path such as:

- a verified B2B research panel;
- a separate professional community/network not socially downstream of the founder;
- a specialist Japanese research recruiter/panel.

Do **not** force a specific panel before the first participant. First-batch evidence may materially sharpen the cohort and screener.

Current vendors such as User Interviews, Respondent, Macromill Interview Zero, and ASMARQ are capability candidates only; vendor panel-size/verification claims are not evidence of exact cohort incidence or validity.

---

# 4. Interview service — Google Meet preferred, account verification BLOCKING

Use **Google Meet** for wave 1 if the real organizer account passes the launch check.

Before the first participant, verify on the actual account/session configuration:

- recording does not auto-start;
- transcription does not auto-start;
- `Take notes for me` / AI notes do not auto-start;
- no third-party meeting bot auto-joins;
- participant-controlled screen sharing remains optional;
- host can immediately stop any accidentally activated capture feature;
- invite/joining setup does not expose unrelated participant contact details.

Generic Google documentation cannot prove these account-specific facts.

Wave 1 does not use Zoom AI Companion, Teams Copilot/intelligent recap, Meet automatic notes/transcription, third-party meeting bots, or conversation-intelligence tooling.

---

# 5. Research-data layers — DECIDED

## R0 — public durable GitHub

Allowed:

- protocol and method decisions;
- aggregate/cohort findings;
- limitations;
- final Issue #36 disposition;
- disclosure-reviewed examples only.

Prohibited by default:

- participant contact details;
- participant-code mapping;
- raw row-level working evidence;
- screenshots/raw email;
- recordings/transcripts;
- rare combinations of profession/client/event/time details that create re-identification risk.

## R1 — protected analytical working evidence

Contains participant code, structured event/loop evidence, evidence class, actual current tool/feature use, reconstructed self-check/scaffolding, counterexamples, separately labeled inference, claim-evidence mapping, and batch-review notes.

Direct identifiers do not belong in R1.

## R2 — identity/admin

Contains only contact, scheduling, participant-code mapping, study-information/consent administration, compensation delivery, and explicitly consented follow-up permission.

R2 remains separate from R1.

## R3 — raw media/transcripts

```text
WAVE 1 = OFF / NOT COLLECTED
```

---

# 6. Storage — encrypted local storage is now the primary wave-1 path

## 6.1 Current decision

**Primary wave-1 R1/R2 storage:** verified encrypted local storage on the research Windows device.

**Fallback only:** controlled cloud storage after an explicit account/processor/contract decision.

This supersedes the earlier neutral `local or Drive` posture.

Why:

- the current connected Google Drive access-control structure is owner-only, but the actual account/service-tier/DPA boundary has not been established;
- current Google consumer Drive documentation states that user content is processed for product functions such as search, malware/spam protection, reliability, troubleshooting, and abuse prevention;
- therefore owner-only sharing metadata alone is not sufficient evidence to accept the current consumer/unknown-tier Drive as the wave-1 research-data processor/storage path;
- encrypted local storage removes that unresolved cloud-processor dependency if device/backup/deletion controls can be verified.

## 6.2 Real Drive verification already completed

A private empty preparation structure exists under the user's Lunowa Drive area.

Verified through live metadata:

- existing Lunowa folder: `shared=false`, owner-only;
- My Drive parent: `shared=false`, owner-only;
- prepared R1 folder: `shared=false`, owner-only;
- prepared R2 folder: `shared=false`, owner-only;
- R1/R2 folders are empty.

The parent was deliberately renamed:

```text
BLOCKED - Lunowa Research - Private - NO PARTICIPANT DATA
```

This structure is **not approved for participant data** and must remain empty unless a later explicit decision accepts the account/processor boundary.

A limited Gmail search did not find billing/subscription evidence sufficient to establish an applicable paid Workspace/DPA tier. Absence of such mail is not proof that no contract exists; generic Workspace marketing mail is not DPA evidence.

## 6.3 Local-storage PASS oracle — BLOCKING

On the actual Windows research device, verify locally. Never publish/paste the BitLocker recovery key.

Preferred command:

```powershell
Get-BitLockerVolume C: | Format-List MountPoint,VolumeStatus,ProtectionStatus,EncryptionPercentage,EncryptionMethod
```

Fallback:

```powershell
manage-bde -status C:\
```

PASS requires:

- the volume storing R1/R2 is fully encrypted / 100%;
- BitLocker/Device Encryption protection is ON;
- the OS account uses strong authentication;
- a recovery key exists in a separate safe location;
- the recovery key is not stored in GitHub, chat, R1, or R2;
- R1 and R2 use separate local directories/containers;
- backup/sync destinations are known and approved;
- unapproved cloud sync does not silently copy R1/R2;
- deletion and backup cleanup can be executed under the retention policy.

Until this passes:

```text
R1/R2 STORAGE = BLOCKED
FIELDWORK START = BLOCKED
```

---

# 7. Retention / minimization — DECIDED

## 7.1 R1

Target final deletion point:

```text
Issue #36 final disposition
+ independent/final review
+ 30 calendar days for correction/reproducibility cleanup
```

An open Issue is not permission for indefinite retention.

Every **90 calendar days from the first participant** while Issue #36 remains open, document a necessity/minimization review:

- is each field/case still necessary?
- can contextual granularity be reduced?
- can completed/invalid-case detail be removed?
- is continued row-level retention justified by active analysis/review?

Delete unnecessary detail even while Issue #36 remains open.

## 7.2 R2

Delete participant-code/contact mapping after:

```text
compensation complete
+ explicitly consented follow-up window expires
+ 30 calendar days for payment/admin correction
```

Wave-1 optional research follow-up is bounded to **90 days from interview** unless the participant later provides a separate explicit extension/re-contact permission.

Accounting/tax/payment records that legitimately require longer retention remain outside R1 and follow the applicable administrative basis.

## 7.3 Early deletion/minimization and incident exception

Participant requests for deletion/reduced use should be handled promptly to the extent applicable/feasible rather than waiting for the maximum schedule.

A temporary security/privacy/payment-dispute preservation exception must record reason, scope, access, and a new deletion trigger; it does not create indefinite retention.

---

# 8. Participant notice / contact — purpose decided, real contact BLOCKING

Use a neutral truthful description before evidence collection:

> 仕事上のメールや他のツールをまたいで、途中の仕事・やり取りをどのように把握しているかを調べるProduct Discoveryです。最近の具体的な仕事の流れと、現在の仕組みで十分うまくいっている例の両方を伺います。

Do not tell participants in advance that the desired finding is `manual monitoring burden`, `open loops`, `safe forgetting`, `Waiting`, `Responsibility`, or another Lunowa construct.

Before participation communicate at minimum:

- study purpose/domain;
- approximate duration;
- voluntary participation / ability to skip or stop;
- no need to reveal private message text, client names, credentials, or unrelated confidential information;
- recording/transcription/AI-note posture;
- what data are stored;
- public reporting posture;
- compensation conditions;
- privacy/research contact;
- deletion/contact route where applicable.

A **real monitored research/privacy contact channel remains BLOCKING**. Do not use a public GitHub Issue as that participant-facing contact channel.

---

# 9. Incentive / payment — QUO Card Pay selected as preferred direct-recruit path

## 9.1 Amount

```text
45-minute eligible professional interview = ¥10,000
scarce/high-opportunity-cost case = up to ¥15,000 when decided before session
```

Macromill's 2026 market-research guidance is an operational reference, not Product evidence or a scientific optimum.

## 9.2 Direction-independence

Compensation is for an eligible completed session, not for Product-positive findings, reporting pain, detail level, or willingness to use Lunowa.

A valid participant who reports `my current system already solves this` is still compensated.

## 9.3 Preferred direct-recruit mechanism

**Preferred:** QUO Card Pay.

Current official capability evidence supports the data-minimization rationale:

- recipient receives a unique URL;
- no dedicated app is required;
- recipient registration of personal information is not required for ordinary receipt/use;
- URL can be delivered electronically;
- one code can support the planned incentive range;
- current issuance/processing fee is an operational purchaser cost and does not change the participant incentive face value.

This avoids collecting bank-account details merely to pay ordinary wave-1 participants.

## 9.4 Remaining payment BLOCKERS

Before an invitation promises this delivery method, verify:

- purchaser/account setup and applicable terms;
- real purchase/payment path;
- secure delivery procedure to the intended participant;
- accounting/tax/payment-record retention outside R1;
- participant-facing compensation wording matches the real process.

Platform-managed incentives remain preferable when a later paid research panel owns payment.

---

# 10. Fraud / validity controls — DECIDED

Use layered controls; no single signal proves fraud.

Before scheduling:

- require a concrete recent-event screener answer;
- check internal consistency of role/tool/workflow answers;
- use proportionate professional-context verification where appropriate and consented;
- do not publish the exact qualification logic.

At session start/during interview:

- casually reconfirm selected screener facts;
- verify the participant can elaborate a concrete recent event without exposing confidential content;
- watch for clusters of generic/scripted answers, contradictory context, inability to explain sequence/state change, or duplicated recruitment identity patterns.

Do not reclassify disconfirming Product evidence as fraud.

Legitimate eligible completed sessions are paid regardless of finding direction. Suspected mid/post-session fraud requires documented adjudication before payment is withheld.

---

# 11. Objective launch checklist

## DECIDED / already satisfied

- [x] behavior-based recruitment;
- [x] recent-event interview guide;
- [x] negative/control cases;
- [x] first wave human-moderated;
- [x] recording OFF;
- [x] transcription OFF;
- [x] AI meeting notes OFF;
- [x] autonomous AI interviewer OFF;
- [x] R3 OFF;
- [x] raw private participant/client content to external AI OFF;
- [x] public GitHub restricted to R0 publication-safe material;
- [x] direct-network first recruitment path;
- [x] Google Meet preferred interview path;
- [x] ¥10,000 standard incentive planning default;
- [x] QUO Card Pay selected as preferred direct-recruit payment mechanism;
- [x] encrypted local storage selected as preferred R1/R2 path;
- [x] prepared Drive R1/R2 access controls verified owner-only and folders verified empty;
- [x] prepared Drive path explicitly BLOCKED for participant data;
- [x] event-based + 90-day periodic-minimization R1 policy;
- [x] time-bounded R2 follow-up policy;
- [x] independent recruitment evidence required before positive Issue #36 disposition.

## MUST VERIFY — before first participant

### Meeting
- [ ] Google Meet organizer account recording OFF by default;
- [ ] transcription OFF by default;
- [ ] AI notes OFF by default;
- [ ] no third-party meeting bot auto-joins.

### Local storage
- [ ] BitLocker/Device Encryption fully protects the R1/R2 storage volume;
- [ ] OS account strong authentication confirmed;
- [ ] separate R1/R2 local paths selected;
- [ ] backup/sync behavior mapped and approved;
- [ ] deletion/backup cleanup path verified;
- [ ] recovery-key safety confirmed without exposing the key.

### Participant administration
- [ ] real monitored research/privacy contact channel selected;
- [ ] actual authorized research/reviewer access list fixed;
- [ ] QUO Card Pay purchaser/setup/real delivery path verified;
- [ ] accounting/tax/payment-record retention path fixed outside R1.

## POST-WAVE-1 / PRE-`SUPPORTED FOR NEXT TEST`

- [ ] select a materially independent recruitment network/panel using the refined cohort/screener;
- [ ] obtain valid evidence through that independent path;
- [ ] compare whether the core explanation survives recruitment-source differences;
- [ ] document source-specific selection/fraud/coverage limitations.

---

# 12. GO / BLOCKED oracle

`FIELDWORK START = GO` only when:

```text
all pre-first-participant MUST VERIFY items = evidenced PASS
AND all participant-admin values = concrete
AND participant notice reflects the real configuration
AND compensation wording matches the real payment path
AND no new material privacy/method blocker is open
```

Current disposition:

> **BLOCKED — methodology and launch decisions are ready; actual Meet settings, encrypted-local-storage/backup state, participant contact, and QUO Card Pay purchaser/admin flow are not yet fully evidenced.**

This BLOCKED status is the correct safety result. Starting participant collection despite the missing evidence would be a process failure.

---

# 13. Evidence boundaries

Current launch decisions use up-to-date evidence including:

- Japan PPC June-2026 Personal Information Protection guidelines and related pseudonymization/cloud guidance;
- Google Meet current capture controls;
- Google consumer Drive privacy/processing disclosures and current Drive access-control capabilities;
- Microsoft current BitLocker/Device Encryption verification guidance;
- current User Interviews / Respondent / Japanese panel vendor capability claims;
- Macromill 2026 incentive guidance;
- QUO Card Pay current official distribution/recipient/fee documentation;
- P-FROST online qualitative fraud guidance;
- Scientific Reports 2026 AI-interviewer evidence.

None establishes the Lunowa ICP, problem prevalence, PMF, WTP, retention, production reliability, or an Issue #36 positive result.

---

# 14. Next actions

Do **not** recruit yet.

Close only these real-environment blockers:

1. verify the actual Windows encryption/backup/deletion state;
2. verify the actual Google Meet capture/AI-note defaults;
3. select a real participant-facing research/privacy contact;
4. verify QUO Card Pay purchaser/payment/accounting workflow.

Once the GO oracle passes:

1. cognitively pretest the screener/notice with target-like non-study testers under the same privacy rules;
2. launch the first direct-outreach adaptive block;
3. interview/analyze 4–6 valid cases or stop/redirect earlier if evidence warrants;
4. recruit the highest-information contradiction;
5. select a materially independent recruitment path after first-batch learning;
6. keep Issue #36 open until real evidence supports exactly one final disposition.
