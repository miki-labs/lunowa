# Issue #36 Fieldwork Operations Packet — 2026-08-27

## Status

**NONCANONICAL RESEARCH OPERATIONS. FIELDWORK START GATE.**

This packet turns `issue-36-fieldwork-protocol-2026-08-27.md` into an executable first-wave workflow.

It does not declare an ICP, record participant findings, authorize implementation, or replace the live Issue #36 contract.

The first real participant may be collected only after every **BLOCKING** field below has an actual value and has been reviewed for the real tools/services used.

---

# 1. Conservative first-wave operating mode

Unless deliberately changed before recruitment:

| Decision | First-wave default |
|---|---|
| moderator | human |
| session length | ~45 min |
| recording | **OFF** |
| automated transcription | **OFF** |
| artifact sharing | optional, participant-controlled |
| inbox access | prohibited |
| screenshots/raw email collection | prohibited |
| external AI on participant data | **OFF by default** |
| public GitHub participant/loop rows | prohibited by default |
| analysis cadence | after each 4–6 valid interviews or earlier |
| recruitment | behavior-based, adaptive cohort blocks |
| Product pitch | none during Issue #36 problem evidence collection |

This default minimizes sensitive-data collection and keeps the first empirical gate about the problem/segment rather than research tooling.

Recording or external AI processing may be enabled later only after updating the actual data flow, processor review, and participant notice before the affected session.

---

# 2. BLOCKING pre-fieldwork decision sheet

## 2.1 Responsible roles

- Research owner: **MUST RESOLVE**
- Participant privacy/contact point: **MUST RESOLVE**
- Fraud/ineligibility adjudicator: **MUST RESOLVE**
- R1 -> R0 public-disclosure reviewer: **MUST RESOLVE**
- Independent/second-pass reviewer, if used: **MUST RESOLVE / NONE**

One person may hold multiple roles in a solo study, but each responsibility must be explicit. Any person who can access R1 must be listed in the data-handling decision.

## 2.2 Recruitment services/channels

For every actual source:

| Field | Value |
|---|---|
| service/channel | **MUST RESOLVE** |
| why needed | **MUST RESOLVE** |
| personal data received | **MUST RESOLVE** |
| account/contract owner | **MUST RESOLVE** |
| retention/deletion known | **MUST RESOLVE** |
| foreign/cloud processing reviewed | **MUST RESOLVE** |
| approved for use | **MUST RESOLVE** |

Direct personal-network recruiting is still a personal-data operation.

## 2.3 Interview/video service

- service: **MUST RESOLVE**
- recording disabled in settings: **MUST VERIFY**
- automated transcription/AI notes disabled: **MUST VERIFY**
- participant can join without exposing unrelated account/profile data where practical: **MUST REVIEW**
- vendor data processing/privacy terms reviewed for actual use: **MUST REVIEW**

## 2.4 R1 — protected research working store

R1 contains pseudonymous structured interview/loop evidence and analysis.

Required characteristics:

- not publicly accessible;
- access limited to named research owner/reviewer(s);
- strong authentication;
- storage/device encryption enabled where applicable;
- backup behavior known;
- public/share links restricted;
- deletion can be executed.

Actual choice:

- storage/service/path: **MUST RESOLVE**
- authorized people: **MUST RESOLVE**
- encryption/access verification: **MUST VERIFY**
- backup location: **MUST RESOLVE**
- concrete retention/deletion rule: **MUST RESOLVE**

Do not use an indefinite `keep for research` retention rule. Retain only as long as the stated Issue #36 research/audit purpose requires, then reassess/delete unnecessary row-level detail.

## 2.5 R2 — identity/admin mapping

R2 contains only operational identity/admin data needed for contact, scheduling, participant-code mapping, consent status, compensation, and follow-up permission.

- storage/service/path: **MUST RESOLVE**
- access: **MUST RESOLVE**
- participant-code mapping: **MUST RESOLVE**
- retention/deletion trigger: **MUST RESOLVE**
- payment/accounting records that must be retained separately: **MUST RESOLVE**

Do not embed name/email/company/contact data in R1.

## 2.6 R3 — raw media/transcript

First-wave default:

```text
COLLECT = NO
```

If changed to YES, stop and resolve:

- recording purpose;
- explicit participant notice/consent;
- recording service;
- transcription processor;
- access;
- retention duration;
- deletion procedure;
- foreign/cloud processing review;
- external AI access, if any.

## 2.7 External AI / analysis processors

First-wave default:

```text
RAW PERSONAL / CLIENT CONTENT TO EXTERNAL AI = NO
```

Before any external AI receives R1 material, resolve:

- tool/model/service;
- exact data sent;
- minimization/de-identification step;
- retention/training/data-use settings or contract;
- foreign/cloud processing;
- approved use class.

Do not assume a consumer AI service is appropriate merely because it is convenient.

---

# 3. Participant-facing study information template

The notice must be truthful without revealing the desired answer before the interview.

Customize bracketed fields.

## Short pre-booking notice

> **調査内容**  
> LunowaというプロダクトのProduct Discoveryの一環として、仕事上のメールや他のツールにまたがる「途中の仕事・やり取り」を、人が実際にどのように把握・管理しているかを調べています。最近実際に起きた仕事の流れについて約45分お話を伺います。現在の方法でうまくいっている例とうまくいっていない例の両方が重要です。
>
> **共有しなくてよい情報**  
> メール本文、顧客名・会社名、認証情報、契約上の機密情報などを共有する必要はありません。具体例は内容を伏せて説明できます。画面共有も必須ではありません。
>
> **記録方法**  
> [FIRST-WAVE DEFAULT: 録画・自動文字起こしは行わず、研究者が構造化したメモを作成します。]
>
> **利用目的**  
> 現在の仕事の進め方・既存ツールで十分に管理できる場面と、管理が難しい場面を理解し、Lunowaで今後どの問題を検証すべきか判断するために利用します。回答内容をそのまま営業名簿や無関係なマーケティング目的へ自動転用しません。
>
> **アクセス**  
> 構造化した研究メモはアクセスを限定した研究用保管場所で扱います。[品質確認レビューを行う場合: 必要に応じて、研究品質確認を担当する限定されたレビュー担当者が確認することがあります。]
>
> **公開**  
> 個人単位の詳細な面談記録は公開GitHubに掲載しません。公開する場合は、集約した傾向・反例・研究上の結論を中心とし、再識別につながる詳細を削除・一般化します。
>
> **任意性**  
> 答えたくない質問は答えなくて構いません。機密情報が見えた場合は、その部分を研究データとして残さないよう努めます。
>
> **問い合わせ**  
> [MUST RESOLVE: research/privacy contact]

This purpose description deliberately does **not** say that the study expects `rechecking`, `waiting`, or `monitoring burden`. Those are hypotheses to discover, not answers to teach.

## Session-start confirmation

Moderator confirms:

- study purpose understood;
- no need to expose private email/client names;
- recording posture;
- artifact sharing optional;
- participant may skip questions/end session;
- compensation is not contingent on positive/Product-supportive findings;
- research-team/reviewer access if applicable;
- data handling/publication summary;
- consent to proceed.

Consent status belongs in R2; only participant code appears in R1.

---

# 4. Recruitment copy

## 4.1 Direct outreach — Japanese

> **仕事でメールを使っている方への45分インタビューのお願い**
>
> LunowaのProduct Discoveryとして、仕事上のメールや他のツールをまたいで、途中の案件・やり取りをどのように把握しているかを調べています。
>
> 直近2週間くらいの具体的な仕事の流れについてお話を伺いたいです。現在のツールや仕組みで十分うまく管理できている例も重要なので、「メールに困っている人」だけを探している調査ではありません。
>
> メール本文や顧客名などの機密情報を見せていただく必要はありません。
>
> - 時間: 約45分
> - 謝礼: [MUST RESOLVE; pilot reference ¥8,000–¥10,000]
> - 方法: [MUST RESOLVE]
> - 対象確認のため、事前に短い質問があります
>
> ご協力いただける場合は [MUST RESOLVE contact/form] からお願いします。

Do not add `follow-up`, `recheck`, `waiting`, or desired-answer feature copy.

## 4.2 Panel study title

Recommended broad title:

> `仕事上のメール・複数ツールでの案件把握に関するインタビュー`

Do not reveal exact eligibility logic.

---

# 5. Screener operationalization

Use the ten behavior-based questions in the protocol:

1. work arrangement;
2. external coordination groups;
3. channels used in the last two weeks;
4. multi-step email-related work count-band;
5. actions/tools used while a matter remained in progress;
6. structured systems/tools used;
7. who notices progress/stall;
8. one recent non-confidential example;
9. one already-solved/no-recheck contrast if available;
10. privacy-preserving interview willingness.

Rules:

- do not expose a qualification score;
- manually review the recent-example open text;
- preserve negative-control candidates;
- do 2–3 **pilot comprehension checks** before scaled recruitment;
- continue revising if live recruitment reveals misunderstanding;
- never call these 2–3 checks `validated screener` or `saturation`.

## Pilot comprehension check boundary

Pilot testers are **method testers, not Issue #36 analytical participants** unless later recruited through the normal study flow.

- do not count their answers toward segment support;
- collect only what is necessary to understand question interpretation;
- apply the same privacy/contact separation to any identifiable pilot data;
- do not ask them to expose private email content merely to test wording.

---

# 6. Eligibility review — R2/R1 boundary

## R2 admin fields

- applicant contact;
- recruitment source;
- scheduling;
- participant code if accepted;
- compensation status;
- follow-up permission;
- eligibility decision.

## R1 research eligibility note

```text
Participant: P-___
Candidate cohort: ___
Recent concrete event available: YES / NO / UNCLEAR
Email materially involved: YES / NO / UNCLEAR
Personal monitoring ownership: HIGH / SHARED / LOW / UNKNOWN
Existing strong system owns state: YES / PARTIAL / NO / UNKNOWN
Potential negative-control value: YES / NO
Key ambiguity to test: ___
Eligibility research rationale: ___
```

Never copy contact/name/company into R1.

---

# 7. Fraud/ineligibility adjudication form

Do not decide from one signal.

```text
Participant code / applicant ref: ___
Signals observed:
[ ] generic/scripted recent-event answer
[ ] cannot elaborate recent event
[ ] material screener/interview inconsistency
[ ] work/tool claims materially inconsistent
[ ] duplicate/contact anomaly
[ ] unusual recruitment burst
[ ] repeated incentive-only communication
[ ] other: ___

Accessibility/privacy alternative considered: ___
Additional verification performed: ___
Decision:
[ ] valid
[ ] valid with limitation
[ ] exclude from analytical evidence
[ ] ineligible before session

Compensation consequence under predeclared policy: ___
Reviewer: ___
Reason: ___
```

Do not publish row-level adjudication in R0.

---

# 8. Moderator session sheet — R1

## Header

```text
Participant code: P-___
Date: ___
Moderator: ___
Candidate cohort: ___
Recruitment source class: ___
Recording: NO / YES under approved data flow
Artifact use: NONE / REDACTED TIMELINE / LIMITED SCREEN SHARE
```

## Neutral context

- external counterparty types;
- channels;
- official system of record, if any;
- person/system responsible for noticing stalls.

## Event A

```text
Non-sensitive outcome:
What started it:
Expected next event:
Participant's next-move belief:
What participant did immediately:
Waiting duration/range:
Self-check events and why:
Parallel scaffolding:
Message/reply before outcome complete:
What changed:
What remained open:
What counted as finished:
Consequence if late/missed:
Actual tool/feature used:
What tool handled well:
Residual manual work:
Evidence classes:
```

## Event B — contrast

Use the same structure and emphasize why monitoring/remembering was unnecessary, handled well, or otherwise different.

## Late delegation-boundary self-report

```text
What would still be self-checked:
Reliance-breaking miss:
Evidence needed for monitoring trust:
Never-delegate categories:
Replacement/coexistence baseline:
Evidence class: SELF-REPORT
```

## Bias memo

```text
Evidence that weakens current cohort hypothesis:
Question/probe that may have led participant:
What I expected but did NOT observe:
Highest-information next case:
```

---

# 9. Protected loop evidence table — R1

Recommended columns:

| Column | Meaning |
|---|---|
| participant_code | pseudonymous code |
| cohort | current cohort hypothesis |
| evidence_class | observed / recent-event recall / self-report |
| loop_id | protected local ID |
| outcome | generalized operational outcome |
| external_dependency | generalized type |
| start_range | approximate |
| duration_range | approximate |
| next_move_belief | participant language/generalized |
| expected_event | generalized |
| reply_sufficient | yes/no/context |
| self_check_count | count/range/unknown |
| self_check_trigger | why checked |
| scaffolding | actual mechanism |
| reconstruction | yes/no/context |
| progress_vs_completion | description |
| miss_late | description |
| consequence | generalized |
| baseline_tool | actual tool |
| baseline_feature | feature actually used |
| feature_enabled_used | access/enabled/use status |
| baseline_adequacy | what worked |
| residual_gap | what remained manual |
| contrast_case | yes/no |
| validity_note | limitation |

Never export this row-level table to public GitHub merely after deleting participant code.

---

# 10. Claim-evidence grid — R1

For each candidate cohort:

| Claim | Supporting cases | Contradicting cases | Strongest evidence class | Real baseline alternative | Limitation | What would falsify/redirect? |
|---|---|---|---|---|---|---|

Do not write `confirmed` merely because several cases share a theme. Prefer scope-accurate language such as `repeatedly observed in the current cohort`, `mixed`, `weak`, or `not established`.

---

# 11. Batch review form

After each 4–6 valid interviews or earlier:

```text
Batch: ___
Cohort(s): ___
Valid cases: ___
Excluded/limited cases: ___

1. What repeated behavior is supported?
2. Which evidence is DIRECT OBSERVED vs RECENT-EVENT RECALL vs SELF-REPORT?
3. Strongest counterexamples?
4. Which current tools/features already solve the problem?
5. Is residual gap coherent or heterogeneous?
6. Is the pain mainly monitoring, or writing/triage/organization instead?
7. What changed in the segment model?
8. What evidence weakened it?
9. Is dialogue depth sufficient?
10. Is the sample specific/homogeneous enough for the claim?
11. Continue / deepen / redirect / stop?
12. Highest-information next participant/cohort?
13. Moderator-bias correction for next batch?
14. Recruitment-source/fraud concern?
```

Never pool negative controls into positive-cohort saturation.

---

# 12. R1 -> R0 public-disclosure checklist

Every proposed public finding must pass:

- [ ] no participant code or identity mapping;
- [ ] no name/contact/company/client identifier;
- [ ] exact dates generalized where unnecessary;
- [ ] rare job/tool/event combinations reviewed;
- [ ] verbatim quote avoided unless necessary;
- [ ] if quote retained, minimum excerpt + participant-notice/consent compatibility reviewed;
- [ ] no screenshot/raw artifact;
- [ ] no unreviewed row-level matrix;
- [ ] small-cell/cohort count disclosure reviewed;
- [ ] conclusion remains traceable in R1 without exposing the trace publicly;
- [ ] designated reviewer signs off.

Public GitHub should normally contain **cohort-level synthesis**. Loop-level examples/rows are published only if each specific row passes disclosure review.

---

# 13. Final public result template — R0

```markdown
# Issue #36 Field Product Discovery Result — YYYY-MM-DD

## Disposition
SUPPORTED FOR NEXT TEST / REVISE / WEAK / FALSIFIED

## Exact study boundary
- cohort(s) actually recruited
- recruitment sources
- valid interview count by cohort
- method/interviewer mode
- important limitations

## What was repeatedly observed/recalled
- cohort-level pattern
- evidence-class mix
- disclosure-safe counts/ranges if useful

## What contradicted the hypothesis
- already-solved workflows
- low-burden workflows
- stronger systems of record

## Actual baseline tools
- tools/features actually used
- what worked
- residual gaps

## Segment interpretation
- coherent workflow-defined cohort, if any
- who should NOT be in the first wedge

## Delegation-boundary self-report
- secondary only
- not adoption evidence

## Unknowns
- explicit remaining unknowns

## Cheapest next experiment
- one falsifiable next test

## Non-claims
- no prevalence
- no PMF
- no WTP
- no retention
- no production reliability
- no automatic implementation authorization
```

---

# 14. AI-interviewer bridge form — only if later proposed

Do not use for first wave.

| Dimension | Human stable-guide reference | AI mode | Pooling acceptable? |
|---|---|---|---|
| concrete recent event reached | | | |
| deepening probe quality | | | |
| one-question adherence | | | |
| leadingness | | | |
| contrast case surfaced | | | |
| information loss | | | |
| premature termination | | | |
| participant trust/comprehension | | | |
| evidence-class yield | | | |
| case interpretation/disposition impact | | | |

Decision:

- `POOLING SUPPORTED FOR THIS RESEARCH QUESTION`
- `SEPARATE EVIDENCE STREAM`
- `AI MODE REJECTED / REVISE`

Never infer general AI-interviewer equivalence from one bridge.

---

# 15. Fieldwork launch record

Create/fill only after every blocking decision is concrete.

```text
Issue #36 contract checked at: ___
Protocol version/commit: ___
Research owner: ___
Privacy/contact owner: ___
First cohort hypothesis: ___
Recruitment channels approved: ___
Interview service approved: ___
Recording: OFF / approved ON
R1 store/access/retention: ___
R2 store/access/retention: ___
R3: NOT USED / approved details
External AI/transcription: NOT USED / approved details
Fraud rule approved: ___
Compensation policy: ___
Participant notice version: ___
Pilot comprehension checks completed: ___
Second-pass review plan: ___
R1->R0 disclosure reviewer: ___

FIELDWORK START: AUTHORIZED / BLOCKED
Blockers if any: ___
```

The launch record is an operations checkpoint, not Product evidence.