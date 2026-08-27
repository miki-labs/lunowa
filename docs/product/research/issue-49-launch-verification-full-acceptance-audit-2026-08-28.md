# Issue #49 Launch Verification — Full Acceptance Audit — 2026-08-28

## Disposition

**FAIL — one material verification-oracle correction required.**

Audited candidate head before correction: `6b380de3d7fe70b5b67856d46251dfc37c3218b5`.

Base: `main` @ `9c024909c73bffeedd28b04e4534d0763d4cac5d`.

Audit scope:

- live Issue #49 task contract;
- parent Issue #36 constraints;
- merged Issue #48 protocol/control plane;
- complete cumulative changes to launch decision + launch evidence;
- post-merge real Drive/Gmail observations;
- current PPC, Google, Microsoft, QUO Card Pay, panel, fraud, and AI-interviewer evidence.

The audit was completed across the entire candidate before correction.

---

## Material blocker V-01 — Windows encryption verification must cover Device Encryption / Windows Home without false FAIL

### Finding

The candidate correctly selects encrypted local storage as the preferred wave-1 R1/R2 path and correctly offers `manage-bde -status C:` as a fallback. However, its verification narrative centers `Get-BitLockerVolume` and `BitLocker/Device Encryption` without explicitly distinguishing:

- **Device Encryption**, available on a wider set of devices including Windows Home; and
- **BitLocker Drive Encryption** advanced/manual management, associated with Pro/Enterprise/Education.

Microsoft current support states that Device Encryption may be automatically enabled on compatible Windows Home devices and can be checked under `Settings > Privacy & security > Device encryption`. `manage-bde -status` is documented for Windows 10/11 and reports protection/encryption status.

### Risk

A reviewer could incorrectly interpret missing BitLocker PowerShell cmdlet/control-panel functionality as evidence that a Windows Home device is unencrypted, or fail to verify a valid Device Encryption configuration through the supported UI/status path.

### Required correction

Define an edition-agnostic oracle:

1. primary machine-readable status where available: `manage-bde -status C:`;
2. `Get-BitLockerVolume C:` as an additional supported PowerShell path where available;
3. Windows Settings `Privacy & security > Device encryption` as the explicit Device Encryption path, particularly relevant to Home;
4. PASS depends on actual protection/encryption state, not availability of a particular UI/cmdlet;
5. preserve recovery-key safety, R1/R2 separation, backup/sync mapping, and deletion requirements.

---

## Full audit results outside V-01

### PASS — task/scope

- only research-operation decision/evidence artifacts change;
- no Product semantics, Responsibility semantics, schema, provider runtime, or Issue #28 implementation authorization is introduced;
- Issue #36 remains open;
- first participant remains BLOCKED.

### PASS — storage decision logic

- owner-only Drive permission evidence is not over-promoted into processor-contract approval;
- prepared Drive R1/R2 are documented as empty/BLOCKED fallback;
- consumer Drive content-processing evidence makes local encrypted storage a reasonable conservative primary path;
- no claim is made that cloud storage is categorically unlawful or impossible.

### PASS — payment decision

- QUO Card Pay is promoted only as the preferred mechanism, not as completed purchaser/admin verification;
- recipient-side no-registration/URL distribution and purchaser-side fee/account process are distinguished;
- payment remains independent of Product-positive answers;
- secure intended-recipient delivery remains a launch requirement.

### PASS — privacy/minimization

- R0/R1/R2/R3 separation preserved;
- R3 remains OFF;
- raw participant/client content to external AI remains OFF;
- R1 has 90-day periodic necessity review;
- R2 optional follow-up is time-bounded;
- public GitHub remains publication only.

### PASS — measurement validity

- direct-network first batch remains adaptive;
- independent recruitment evidence gates positive disposition rather than first participant launch;
- human-first moderation and AI-mode bridge boundary remain intact;
- neutral participant framing does not reveal the desired monitoring hypothesis.

### PASS — real-environment evidence hygiene

- Drive metadata is used only for sharing/access observations;
- Gmail billing search absence is not treated as proof of no Workspace/DPA contract;
- no participant data have been collected or placed in prepared Drive folders;
- unresolved Meet/local-device/payment/contact facts remain explicitly BLOCKING.

---

## Correction discipline

Only V-01 is material in this full audit. Correct it in one batch across the launch decision and evidence trace, then rerun a **fresh full acceptance audit of Issue #49 + entire final candidate**. Do not treat the correction itself as sufficient PASS evidence.
