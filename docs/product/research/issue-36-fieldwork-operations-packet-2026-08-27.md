# Issue #36 Fieldwork Operations Packet — 2026-08-27

## Status

**NONCANONICAL RESEARCH OPERATIONS. FIELDWORK START GATE.**

This packet turns `issue-36-fieldwork-protocol-2026-08-27.md` into an executable first-wave workflow.

It does not declare an ICP, record participant findings, authorize implementation, or replace the live Issue #36 task contract.

The first participant may be collected only after every **BLOCKING** field below has an actual value and has been reviewed for the real tools/services used.

---

# 1. Conservative first-wave operating mode

Unless deliberately changed before recruitment, use this minimum-data posture:

| Decision | First-wave default |
|---|---|
| moderator | human |
| session length | ~45 min |
| recording | **OFF** |
| automated transcription | **OFF** |
| artifact sharing | optional, participant-controlled |
| inbox access | prohibited |
| screenshots/raw email collection | prohibited |
| external AI on participant data | **OFF by default**; only de-identified/minimized R1 extracts after processor review |
| public GitHub row-level data | prohibited |
| analysis cadence | after each 4–6 valid interviews or earlier |
| initial recruitment | behavior-based, adaptive cohort blocks |
| Product pitch | after problem evidence only; no Lunowa pitch in Issue #36 |

Why this default:

- it minimizes sensitive data collection;
- it avoids creating a transcript/recording retention problem before one is needed;
- it preserves event-centered interviewing through structured notes;
- it keeps the first empirical gate about problem/segment rather than tooling sophistication.

Recording may later be enabled only by updating this packet's data flow and participant notice before the affected session.

---

# 2. BLOCKING pre-fieldwork decision sheet

Fill every item before scheduling the first real interview.

## 2.1 Responsible researcher

- Research owner: **MUST RESOLVE**
- Participant privacy/contact point: **MUST RESOLVE**
- Fraud/ineligibility adjudicator: **MUST RESOLVE**
- R1 -> R0 public-disclosure reviewer: **MUST RESOLVE**

One person may hold multiple roles in a solo study, but each responsibility must be explicit.

## 2.2 Recruitment services

For each actual channel/vendor:

| Field | Value |
|---|---|
| service/channel | **MUST RESOLVE** |
| why needed | **MUST RESOLVE** |
| what personal data it receives | **MUST RESOLVE** |
| account/contract owner | **MUST RESOLVE** |
| retention/deletion known? | **MUST RESOLVE** |
| foreign/cloud processing reviewed? | **MUST RESOLVE** |
| approved for use | **MUST RESOLVE** |

Direct personal-network recruiting is still a personal-data operation; do not treat it as outside this sheet.

## 2.3 Interview/video service

- service: **MUST RESOLVE**
- recording disabled in service settings: **MUST VERIFY**
- automated transcription/AI notes disabled: **MUST VERIFY**
- participant can join without exposing unrelated account/profile data where practical: **MUST REVIEW**
- vendor data processing/privacy terms reviewed for actual use: **MUST REVIEW**

## 2.4 R1 — protected research working store

Required characteristics:

- not publicly accessible;
- access limited to research owner/reviewer(s);
- device/account access protected by strong authentication;
- storage encryption available and enabled where applicable;
- backup behavior known;
- sharing links disabled/restricted;
- deletion can be executed.

Actual choice:

- storage/service/path: **MUST RESOLVE**
- authorized people: **MUST RESOLVE**
- encryption/access verification: **MUST VERIFY**
- backup location: **MUST RESOLVE**
- retention: **MUST RESOLVE**

Recommended first-wave retention starting point for decision, not a legal rule:

> retain R1 working evidence through the Issue #36 disposition and independent review, then reassess and delete unnecessary row-level detail rather than retaining it indefinitely.

Do not use this recommendation as the actual schedule until a concrete duration/event trigger is written above.

## 2.5 R2 — identity / admin mapping

R2 contains only contact/scheduling/participant-code/consent/compensation/follow-up information.

- storage/service/path: **MUST RESOLVE**
- access: **MUST RESOLVE**
- participant-code mapping format: **MUST RESOLVE**
- retention/deletion trigger: **MUST RESOLVE**
- accounting/payment records that must be retained separately: **MUST RESOLVE**

R2 must not be embedded in R1 analytical notes.

## 2.6 R3 — raw media/transcripts

First-wave setting:

```text
COLLECT = NO
```

If changed to YES, stop and fill:

- recording purpose;
- explicit consent wording;
- recording service;
- transcript processor;
- access;
- retention duration;
- deletion procedure;
- foreign/cloud processor review;
- whether external AI has any access.

## 2.7 External AI / transcription / analysis processors

First-wave setting:

```text
RAW PERSONAL / CLIENT CONTENT TO EXTERNAL AI = NO
```

If AI assistance is used on R1 material:

- tool/model/service: **MUST RESOLVE BEFORE USE**
- exact data sent: **MUST RESOLVE**
- de-identification/minimization step: **MUST RESOLVE**
- retention/training settings/contract reviewed: **MUST REVIEW**
- foreign/cloud processing reviewed: **MUST REVIEW**
- approved use class: **MUST RESOLVE**

Do not assume a consumer AI setting is appropriate for research data merely because it is convenient.

---

# 3. Participant-facing study information template

Customize the bracketed fields before use.

## Short pre-booking notice

> **調査内容**  
> 仕事上のメールや他のツールをまたいで、途中の仕事・やり取りをどのように把握しているかを調べています。最近実際に起きた仕事の流れについて約45分お話を伺います。現在の仕組みで十分うまくいっている例も重要です。
>
> **共有しなくてよい情報**  
> メール本文、顧客名・会社名、認証情報、契約上の機密情報などを共有する必要はありません。具体例は内容を伏せて説明できます。画面共有も必須ではありません。
>
> **記録方法**  
> [FIRST-WAVE DEFAULT: 録画・自動文字起こしは行いません。研究者が構造化したメモを作成します。]
>
> **利用目的**  
> LunowaというプロダクトのProduct Discoveryとして、特定の仕事の進め方に「未完了のメール上のやり取りを自分で継続監視する負担」が実際に存在するかを調べるために利用します。マーケティング目的の名簿作成や、回答内容による営業には自動転用しません。
>
> **公開**  
> 個人単位の詳細な面談記録は公開GitHubに掲載しません。公開する場合は、集約した傾向・反例・研究上の結論を中心とし、再識別につながる詳細を削除・一般化します。
>
> **任意性**  
> 答えたくない質問は答えなくて構いません。機密情報が見えた場合は、その部分を研究データとして残さないよう努めます。
>
> **問い合わせ**  
> [MUST RESOLVE: research/privacy contact]

## Session-start confirmation

Moderator confirms:

- study purpose understood;
- no need to expose private email text/client names;
- recording posture;
- optional artifact sharing;
- participant may skip a question/end session;
- compensation is not contingent on positive findings;
- data handling/publication summary;
- consent to proceed.

Record only the consent status in R2 and participant code in R1.

---

# 4. Recruitment copy

## 4.1 Direct outreach — Japanese

> **仕事でメールを使っている方への45分インタビューのお願い**
>
> 仕事上のメールや他のツールをまたいで、途中の案件・やり取りをどのように把握しているかを調べています。
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

Do not add Product feature copy or `follow-up/recheck/open-loop` desired-answer hints.

## 4.2 Research-panel description

Use a broad title such as:

> `仕事上のメール・複数ツールでの案件把握に関するインタビュー`

Avoid revealing exact eligibility logic to the panel participant.

---

# 5. Screener — copy-ready form

Use questions from the canonical research protocol. Recommended implementation:

1. work arrangement;
2. external coordination groups;
3. channels used in last 2 weeks;
4. count-band of multi-step email-related matters;
5. actual actions used while a matter stayed in progress;
6. structured systems/tools used;
7. who notices progress/stall;
8. one recent non-confidential example in open text;
9. one already-solved/no-recheck contrast if available;
10. willingness for a 45-minute privacy-preserving discussion.

Operational rules:

- do not expose qualification score;
- manual review Q8;
- preserve negative-control candidates;
- do 2–3 pilot comprehension checks before scale use;
- record misunderstandings and revise wording;
- never call pilot comprehension checks `validated screener`.

---

# 6. Eligibility review sheet — R2/R1 boundary

## R2 admin fields

- applicant contact;
- recruitment source;
- scheduling;
- participant code if accepted;
- compensation status;
- follow-up permission;
- eligibility decision.

## R1 research eligibility note

Use only participant code.

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

Do not copy contact/name/company into R1.

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

Do not publish this form or its row-level results in R0.

---

# 8. Moderator session sheet — R1

## Header

```text
Participant code: P-___
Date: ___
Moderator: ___
Candidate cohort: ___
Recruitment source class: ___
Recording: NO / YES under approved protocol
Artifact use: NONE / REDACTED TIMELINE / LIMITED SCREEN SHARE
```

## Neutral context

- external counterparty types:
- channels:
- official system of record, if any:
- person/system responsible for noticing stalls:

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

Same structure, emphasizing why monitoring was unnecessary/handled well/different.

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

Recommended spreadsheet/table columns:

| Column | Meaning |
|---|---|
| participant_code | pseudonymous code |
| cohort | current cohort hypothesis |
| evidence_class | observed / recent-event recall / self-report |
| loop_id | local protected ID |
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

Never export this row-level table to public GitHub merely after removing participant code.

---

# 10. Claim-evidence grid — R1

For each cohort:

| Claim | Supporting cases | Contradicting cases | Strongest evidence class | Real baseline alternative | Limitation | What would falsify/redirect? |
|---|---|---|---|---|---|---|

Example claim form:

> `Independent professionals coordinating multiple external clients repeatedly re-open sent/inbox state because no current tool owns heterogeneous waiting conditions.`

Do not write `confirmed` unless the evidence warrants the exact scope. Prefer `observed repeatedly in current cohort`, `mixed`, `weak`, etc.

---

# 11. Batch review form

After each 4–6 valid interviews or earlier:

```text
Batch: ___
Cohort(s): ___
Valid cases: ___
Excluded/limited cases: ___

1. What repeated behavior is directly supported?
2. Which evidence is RECENT-EVENT RECALL vs SELF-REPORT?
3. Strongest counterexamples?
4. Which current tools already solve the problem?
5. Is residual gap coherent or heterogeneous?
6. Is problem mainly monitoring, or writing/triage/organization instead?
7. What changed in our segment model?
8. What evidence weakened it?
9. Is dialogue depth sufficient?
10. Is current sample specific/homogeneous enough for the claim?
11. Continue / deepen / redirect / stop?
12. Highest-information next participant/cohort?
13. Moderator-bias correction for next batch?
14. Recruitment-source/fraud concern?
```

Do not pool negative controls into positive-cohort saturation.

---

# 12. R1 -> R0 public-disclosure checklist

Every proposed public finding must pass:

- [ ] no participant code or mapping;
- [ ] no name/contact/company/client identifier;
- [ ] exact dates generalized where unnecessary;
- [ ] rare job/tool/event combinations reviewed;
- [ ] verbatim quote avoided unless necessary;
- [ ] if quote retained, minimum excerpt + disclosure/consent compatibility reviewed;
- [ ] no screenshot/raw artifact;
- [ ] no row-level matrix;
- [ ] small-cell/cohort count disclosure reviewed;
- [ ] conclusion remains traceable in R1 without exposing the trace publicly;
- [ ] reviewer signs off on public version.

Public GitHub result should normally be **cohort-level synthesis**, not participant dossiers.

---

# 13. Final public result template — R0

Path when fieldwork is complete should be a new dated result under `docs/product/research/` or `docs/product/experiments/`.

```markdown
# Issue #36 Field Product Discovery Result — YYYY-MM-DD

## Disposition
SUPPORTED FOR NEXT TEST / REVISE / WEAK / FALSIFIED

## Exact study boundary
- cohort(s) actually recruited
- recruitment sources
- valid interview count by cohort
- method
- important limitations

## What was repeatedly observed/recalled
- cohort-level pattern
- evidence class mix
- disclosure-safe counts/ranges where useful

## What contradicted the hypothesis
- already-solved workflows
- low-burden workflows
- stronger systems of record

## Actual baseline tools
- tools/features actually used
- what worked
- residual gaps

## Segment interpretation
- what workflow-defined cohort, if any, remains coherent
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
- no implementation authorization unless a separate accepted task says so
```

---

# 14. Interviewer-mode bridge form — only if AI moderation is later proposed

Do not use for first wave.

For a bridge sample, compare human vs proposed AI interviewer under a pre-specified design.

Audit:

| Dimension | Human stable-guide reference | AI mode | Acceptable for pooling? |
|---|---|---|---|
| concrete recent event reached | | | |
| deepening probe frequency/quality | | | |
| one-question adherence | | | |
| leadingness | | | |
| contrast case surfaced | | | |
| information loss | | | |
| premature termination | | | |
| participant trust/comprehension | | | |
| evidence-class yield | | | |
| case interpretation/disposition impact | | | |

Final bridge decision:

- `POOLING SUPPORTED FOR THIS RESEARCH QUESTION`
- `SEPARATE EVIDENCE STREAM`
- `AI MODE REJECTED / REVISE`

Never infer general AI-interviewer equivalence from one bridge.

---

# 15. Fieldwork launch record

Create this only after all blocking decisions are filled.

```text
Issue #36 contract checked at: ___
Protocol version/commit: ___
Research owner: ___
Privacy/contact owner: ___
First cohort hypothesis: ___
Recruitment channels approved: ___
Video/interview service approved: ___
Recording: OFF / approved ON
R1 store/access/retention: ___
R2 store/access/retention: ___
R3: NOT USED / approved details
External AI/transcription: NOT USED / approved details
Fraud rule approved: ___
Compensation policy: ___
Participant notice version: ___
Pilot comprehension checks completed: ___
Independent/adversarial review plan: ___
R1->R0 disclosure reviewer: ___

FIELDWORK START: AUTHORIZED / BLOCKED
Blockers if any: ___
```

The launch record is an operations checkpoint, not Product evidence.