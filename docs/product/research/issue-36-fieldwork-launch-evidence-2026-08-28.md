# Issue #36 Fieldwork Launch Evidence — 2026-08-28

## Status

**NONCANONICAL EXTERNAL + REAL-ENVIRONMENT EVIDENCE TRACE.**

Supports Issue #49. External facts are time-sensitive; real-environment observations are scoped to the connected account/folders actually checked. None is Product/ICP evidence.

---

# 1. Japan privacy / data handling

## PPC General Guidelines

Source:
- https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/

Current page identifies partial revision in **June 2026**.

Material operational categories include:

- purpose notification/publication;
- appropriate security controls for personal data;
- supervision of processors/contractors;
- incident-response/reporting/notification obligations where applicable.

This trace is not case-specific legal advice.

## Pseudonymization / anonymization

Sources:
- https://www.ppc.go.jp/personalinfo/legal/guidelines_anonymous/
- https://www.ppc.go.jp/all_faq_index/faq1-q14-2/

Removing names/emails does not automatically make a research row anonymous. If data remain readily linkable to information that identifies the person, they may remain personal information.

Operational consequence: R1 pseudonymous working evidence is not automatically safe for public GitHub.

## Cloud / foreign processor boundary

Source:
- https://www.ppc.go.jp/personalinfo/legal/guidelines_offshore/

PPC cloud guidance makes actual handling/contract conditions material; the presence of data in cloud storage alone does not settle the treatment. Data minimization and appropriate oversight remain relevant where a processor handles personal data.

Operational consequence: generic cloud-product capability is not launch approval for the actual research account.

---

# 2. Google Meet capture controls

Official sources:
- https://support.google.com/meet/answer/9308681?hl=ja
- https://support.google.com/meet/answer/12849897

Current Google help treats recording, transcription, and note-taking as separately controlled capture/intelligence features. Automatic-start/admin configuration can exist.

Operational consequence:

- ordinary Meet can support the human-led wave with capture features OFF;
- generic docs do not prove the actual organizer account defaults;
- real account/session verification remains a pre-first-participant gate.

---

# 3. Google Drive — generic evidence and live account observations

## Generic access-control capability

Source:
- https://support.google.com/drive/answer/14254362?hl=ja

Drive supports limited/restricted access structures.

## Consumer content processing

Current Google consumer privacy/help materials describe processing Drive content for product functions including search, spam/malware protection, reliability/troubleshooting, and abuse prevention. Private content is not thereby public to other users, but this does not establish a `provider does not handle the data` contract for the connected research account.

Operational consequence: owner-only sharing state is necessary but not sufficient to approve an unknown-tier consumer Drive as R1/R2 research storage.

## Workspace contractual context

Sources:
- https://knowledge.workspace.google.com/admin/compliance/privacy-compliance-and-records-for-google-workspace-and-cloud-identity
- https://workspace.google.com/terms/workspace-personal-terms/

Google publishes data-processing commitments in supported Workspace contractual contexts. Do not infer that a generic Google account has a particular Workspace/DPA arrangement without evidence of the actual tier/agreement.

## Real connected-account verification — 2026-08-28

Read-only metadata was checked for the user's existing Lunowa Drive hierarchy and newly prepared research folders.

Observed:

- existing Lunowa folder: `shared=false`, owner-only permission;
- parent My Drive: `shared=false`, owner-only permission;
- prepared R1 folder: `shared=false`, owner-only permission;
- prepared R2 folder: `shared=false`, owner-only permission;
- R1 folder contents: empty;
- R2 folder contents: empty.

A preparation parent was created and then renamed to:

```text
BLOCKED - Lunowa Research - Private - NO PARTICIPANT DATA
```

No participant data have been written there.

A narrowly scoped Gmail search for Google One / Workspace billing/subscription evidence did not yield evidence sufficient to establish an applicable paid Workspace/DPA tier. Absence of billing mail is **not** proof of no contract; generic Workspace product/marketing mail is not contract evidence.

Disposition:

```text
Drive sharing/access structure = VERIFIED OWNER-ONLY
Drive research folders = VERIFIED EMPTY
actual account/DPA/processor acceptance = NOT ESTABLISHED
wave-1 participant data in Drive = NOT APPROVED
```

---

# 4. Windows encrypted-local storage evidence

## BitLocker status command

Official source:
- https://learn.microsoft.com/en-us/powershell/module/bitlocker/get-bitlockervolume?view=windowsserver2025-ps

Microsoft documents `Get-BitLockerVolume` as returning, among other attributes:

- `VolumeStatus`;
- `EncryptionPercentage`;
- `ProtectionStatus`;
- `EncryptionMethod`.

The official example for a protected OS drive shows `FullyEncrypted`, `EncryptionPercentage: 100`, and `ProtectionStatus: On`.

Local verification command:

```powershell
Get-BitLockerVolume C: | Format-List MountPoint,VolumeStatus,ProtectionStatus,EncryptionPercentage,EncryptionMethod
```

Fallback Windows command:

```powershell
manage-bde -status C:\
```

## Recovery key / management

Official source:
- https://support.microsoft.com/en-us/windows/security/encryption/bitlocker-drive-encryption

Microsoft's current BitLocker guidance requires backing up the recovery key when encryption is enabled. The key must not be copied into GitHub/chat/research evidence.

Operational consequence:

Encrypted local storage is the preferred wave-1 path because it avoids the unresolved current Drive processor/account-tier dependency, **but it remains BLOCKED until the actual research Windows device, backup/sync path, R1/R2 separation, and deletion behavior are verified.**

---

# 5. Recruitment panel capabilities

## User Interviews

Source:
- https://www.userinterviews.com/our-research-panel

Current vendor page claims a large professional panel and professional targeting/verification capabilities.

Classification: **VENDOR CLAIM / CAPABILITY EVIDENCE**.

Do not infer exact Japan cohort incidence, representativeness, or participant validity from headline panel size.

## Respondent

Source:
- https://www.respondent.io/browse-panel

Current vendor page claims millions of verified/professional participants across many countries.

Classification: **VENDOR CLAIM / CAPABILITY EVIDENCE**.

## Japanese options

Macromill Interview Zero and ASMARQ remain domestic recruitment candidates. Exact Issue #36 cohort incidence/performance is unknown until tested.

Operational consequence: do not purchase/select the independent panel before first-batch evidence sharpens the cohort unless direct recruitment cannot fill the block. Independent recruitment evidence is required before a positive final disposition, not before first participant launch.

---

# 6. Incentive level

Macromill source:
- https://www.macromill.com/service/words/interview-reward/

Published February 20, 2026.

The article gives broad market-research reference ranges, including approximately ¥3,000–¥15,000 for 60–90 minute 1:1 depth interviews and potentially higher incentives for specialist/decision-maker participants.

Operational inference:

```text
45-minute eligible B2B professional = ¥10,000 default
scarce/high-opportunity-cost case = up to ¥15,000 if decided before the session
```

This is a practical starting parameter, not Product evidence or a scientifically optimal price.

---

# 7. QUO Card Pay — preferred direct-recruit payment mechanism

Official sources:
- https://www.quocard.com/pay.html
- https://www.quocard.com/business/faq/
- https://www.quocard.com/individual/product/quopay/
- https://www.quocard.com/payec/terms/

Current official documentation supports:

- recipient receives/opens a unique URL;
- dedicated app is not required;
- ordinary recipient use does not require personal-information registration;
- URLs can be distributed electronically, including email;
- code face value can be set from ¥50 to ¥100,000 in ¥1 increments;
- issuance fee is currently 6% of face value, with consumption tax on that fee;
- purchaser-side payment/account setup remains an administrative process.

Operational consequence:

QUO Card Pay is the preferred wave-1 direct-recruit mechanism because it avoids collecting participant bank-account details solely for an ordinary interview honorarium.

Still required before launch:

- purchaser/account setup and terms review;
- real purchase/payment test/path;
- secure participant delivery procedure;
- accounting/tax/payment-record retention outside R1;
- participant notice matches the actual delivery workflow.

---

# 8. Online qualitative participant fraud

P-FROST / Qualitative Health Research sources:
- https://pubmed.ncbi.nlm.nih.gov/39548877/
- https://doi.org/10.1177/10497323241288181

The work describes online qualitative fraudulent-participant risk and layered mitigation recommendations.

Operational consequence:

Use multiple signals and documented adjudication; no single red flag is a validated fraud detector, and disconfirming evidence must not be relabeled fraud because it weakens the Product hypothesis.

---

# 9. AI interviewer measurement-mode risk

Scientific Reports 2026:
- https://www.nature.com/articles/s41598-026-46517-7
- https://doi.org/10.1038/s41598-026-46517-7

The evaluation reports material cross-model differences in follow-up necessity, context awareness, openness/non-leadingness, style/empathy, latency, questioning intensity, and protocol robustness.

Operational consequence:

- there is no generic interchangeable `AI interviewer` measurement instrument;
- changing model/orchestration can change collected evidence;
- human moderation remains appropriate for the unstable first exploratory wave;
- later AI-mode evidence needs an explicit bridge/compatibility decision before pooling with human-moderated Issue #36 evidence.

---

# 10. Evidence limits / unresolved real-environment facts

The evidence above does **not** establish:

- the Lunowa ICP or problem prevalence;
- PMF, WTP, retention, production reliability, or optimal interview count;
- actual Google Meet organizer capture defaults;
- actual Windows encryption/backup/deletion state;
- a participant-facing privacy contact;
- completed QUO Card Pay purchaser/payment/accounting workflow;
- exact incidence or quality of a named panel for the final refined Japan cohort.

Those unresolved items remain explicit launch or Issue #36 evidence targets rather than assumptions.
