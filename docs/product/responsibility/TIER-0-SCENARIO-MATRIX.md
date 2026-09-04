# Tier 0 Responsibility Scenario Matrix v0.1

## Status

**Accepted scenario-assignment baseline; all 44 base cases have now been expanded into full layered semantic oracles.**

This document remains the compact assignment/coverage map for Tier 0. Detailed truth lives in the detailed-oracle files and transition artifacts. It is not an execution report.

Tier 0 contains:

```text
44 base semantic oracles
+ controlled perturbation / runtime variants
+ cross-cutting corpus assertions
```

The earlier planning range of 30–40 base cases was intentionally exceeded by four cases. Compressing these ambiguity boundaries would reduce diagnosability and optimize the quota rather than the specification.

`mapped` / `fully layered` does **not** mean an implementation has executed or passed the oracle.

---

## 1. Design constraints

Every Tier 0 base case follows these rules:

1. isolate one primary semantic boundary, with no more than a small number of deliberate secondary interactions;
2. state Responsibility meaning rather than only a final UI bucket;
3. preserve source wording/provenance for decision-critical facts;
4. state forbidden outcomes for HIGH/CRITICAL cases;
5. prefer explicit minimal contrasts over unrelated examples;
6. represent surface-language diversity as controlled variants where underlying semantics are unchanged;
7. do not smuggle SQL shape, model provider, numeric thresholds, or prompt wording into the oracle.

---

# 2. Base semantic oracles

## A. Direction × Request / Commitment

| ID | Source / context | Expected semantic oracle | Projection | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| T0-001 | **Inbound:** `修正版を明日までに送ってください。` | `REQUEST`; USER bears a send obligation; `source_due=tomorrow`; TRACK | MY_TURN | HIGH | R04 R05 R23 R24 R26 R27 R44; C01 C17; I201 I203 I207 | M34; forbid fabricated exact clock time |
| T0-002 | **Inbound:** `修正版を明日送ります。` | OTHER_PARTY communicates a firm send commitment; `expected_event_time=tomorrow`, not USER due | WAITING | HIGH | R07 R09 R23 R24 R27 R44; C01 C03 C04 C07 C17; I201 I202 I207; MR06 MR12 | M14; H03 H04; forbid MY_TURN from the word `明日` alone |
| T0-003 | **Outbound:** `修正版を明日までに送ってください。` | USER requests OTHER_PARTY to send; OTHER bears obligation | WAITING | NORMAL | R07 R44; C02; I201 I205 I206 | forbid assigning the outbound request back to USER |
| T0-004 | **Outbound:** `修正版を明日送ります。` | USER communicates a firm send commitment; USER bears obligation | MY_TURN | HIGH | R07 R09 R44; C02 C03; I201 I202 I206; MR06 | H03; forbid treating the same words as OTHER-owned merely because T0-002 is OTHER-owned |

These four cases are the canonical direction/act quadrant. Direction is evidence, not a cosmetic field.

---

## B. Commitment-force ladder

For T0-005 through T0-008, assume an existing open Responsibility whose outcome is `receive revised document from counterpart`. The messages may update expectation evidence; they must not be silently upgraded into a firmer promise than was communicated.

| ID | Source | Expected semantic oracle | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- |
| T0-005 | `修正版を明日送る予定です。` | stated PLAN; planned timing may refine expected-event evidence, but not as firm commitment | NORMAL | R09; C04 C05; I202 | M09 |
| T0-006 | `修正版を明日送ろうと思っています。` | stated INTENTION; weaker than firm commitment and distinct from plan wording | NORMAL | R09; C05 C06; I202 | M09 |
| T0-007 | `修正版を明日送れればと思っています。` | TENTATIVE intention / weak future orientation; do not strengthen | NORMAL | R09; C06; I202; MR12 | M09 |
| T0-008 | `来週なら修正版を送れそうです。` | CAPABILITY / feasibility statement; not a commitment and not automatically an accepted expected-event time | HIGH | R09; C07; I202 | M09; forbid firm waiting promise from capability only |

---

## C. Proposal, agreement, preference, review, approval

| ID | Source / context | Expected semantic oracle | Projection | Risk | Primary coverage | Forbidden / mutant |
| --- | --- | --- | --- | --- | --- | --- |
| T0-009 | Scheduling loop; `金曜17時はいかがでしょうか。` | PROPOSAL with pending term `Friday 17:00`; not agreed fact | MY_TURN or WAITING according to whose response is next, never DONE merely from proposal | HIGH | R10; C08; I208 I209; MR11 | M10; H14 |
| T0-010 | Reply to T0-009: `では金曜17時でお願いします。` | explicit acceptance/decision; pending term becomes agreed fact | state follows remaining scheduling obligations | HIGH | R10; C08; I208 I209; MR11 | M10 |
| T0-011 | `金曜17時が良いと思います。` | preference/opinion; not automatically final acceptance | REVIEW/WAITING depending supplied context | NORMAL | R06 R10; C09; I208 | forbid preference → agreement shortcut |
| T0-012 | Existing contract loop; `確認します。` | commitment/action = REVIEW/CHECK only | MY_TURN | HIGH | R06; C10; I202 | forbid review → approval inflation |
| T0-013 | Same context; `承認します。` | APPROVAL/DECISION semantically; authoritative satisfaction still depends on speaker authority | context dependent | HIGH | R06; C10; I202 | forbid collapsing `確認` and `承認` |

---

## D. Hold, cancellation, delegation

| ID | Source / context | Expected semantic oracle | Projection | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| T0-014 | Existing open loop; `一旦止めてください。こちらから連絡するまで進めないでください。` | Responsibility remains OPEN; add `DO_NOT_PROCEED` constraint; wait for resume event | WAITING; LATER only if separate attention defer exists | HIGH | R20 R21; C11; I205 | M30; forbid resolved-cancelled |
| T0-015 | Existing open loop; `この件はもう不要です。` | explicit cancellation; resolve with cancellation-like reason, not satisfaction | DONE | HIGH | R21 R39; C11; I210 | M30; forbid SATISFIED if work was cancelled |
| T0-016 | USER previously owes work; USER says `田中さんにお願いしておきます。`; Tanaka is not recipient | intent/commitment to delegate; ownership not yet effectively transferred | MY_TURN | HIGH | R07 R22; C12; I205 | M31 |
| T0-017 | Same work; Tanaka is recipient and USER writes `田中さん、こちらお願いします。` | effective delegated REQUEST communicated to Tanaka; OTHER obligation exists | WAITING if USER has no remaining leg | HIGH | R07 R22; C12; I205 I206 I311 | M31 |

---

## E. Admission, politeness, assignment, zoning

| ID | Source / context | Expected semantic oracle | Projection | Oracle type | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T0-018 | `恐れ入りますが、本日中にご提出いただけますでしょうか。` directed to USER | polite but material REQUEST; explicit due remains material | MY_TURN | DETERMINATE | HIGH | R06 R08; C13; I202 I203 I310 | M08; forbid polite ⇒ OPTIONAL shortcut |
| T0-019 | `何かあればお気軽にご連絡ください。` | courtesy/formulaic offer; normally DO_NOT_TRACK | NONE | DETERMINATE | LOW | R04 R05 R06; C13; I203 | M03 M04 |
| T0-020 | USER direct addressee: `佐藤さん、こちらお願いします。` | explicit USER assignment | MY_TURN | DETERMINATE | HIGH | R07; C14; I205 I206; MR07 | H03 |
| T0-021 | Same work addressed to Tanaka; USER CC only | CC does not create USER obligation | NONE in supplied no-existing-loop context | DETERMINATE | HIGH | R07; C14; I205 I206; MR07 | M07; forbid USER ownership from CC alone |
| T0-022 | Current authored `これお願いします。` followed by quoted old request | current authored text supplies request force; quoted text may supply referent/object context | MY_TURN/WAITING by assignment | DETERMINATE | NORMAL | R04 R27; C15; I204 I214 I303 | preserve zoning/provenance roles |
| T0-023 | Current authored `了解しました。` followed by quoted old request `明日までに資料を送ってください` | quoted historical request must not be re-created as a new current request | NONE or existing-loop update only | DETERMINATE | HIGH | R04 R05 R27; C15; I204 I214; MR19 | M11 |
| T0-024 | `FYI` + forwarded request to somebody else | forwarding alone does not transfer obligation to current USER | NONE | DETERMINATE | NORMAL | R04 R05; C16; I204 I214 | M12 |
| T0-025 | `これお願いします。` + same forwarded content | authored request supplies current force; forwarded content may define object/context | actionable according to current assignment | DETERMINATE | HIGH | R04 R07; C16; I204 I214 I303; MR20 | M12 |

---

## F. Temporal source, user target, correction, conflict

| ID | Source / context | Expected semantic oracle | Projection | Oracle type | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T0-026 | Existing source due = Friday. USER sets personal target = Thursday. | preserve `source_due=Friday` and `user_target=Thursday` as independent facts; USER_TARGET is not a source-field override | MY_TURN | DETERMINATE | HIGH | R23 R28 R29; C18; I225; MR13 | M15 |
| T0-027 | Friday; same authoritative speaker later says `先ほど金曜と書きましたが、月曜の誤りです。` | explicit CORRECTION updates current due to Monday while preserving Friday history | MY_TURN | DETERMINATE | HIGH | R01 R12 R23 R27; C19; I220 | M33 |
| T0-028 | Actor A says Friday; Actor B says Monday; no evidence B can override A | unresolved conflict; preserve both; do not select by recency alone | REVIEW while material obligation remains admitted | AMBIGUOUS | CRITICAL | R12 R45; C19; I217 I220; O08 | M05 M33; H12 |

---

## G. Identity, reopen/new episode, multiplicity, partial completion

| ID | Source / context | Expected semantic oracle | Projection | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| T0-029 | Deliver usable signed contract; counterpart later says `添付が壊れて開けません。再送お願いします。` | same operational outcome never actually satisfied → REOPEN same Responsibility; preserve prior completed action history and add remedial work | MY_TURN | CRITICAL | R16; C20; I210 I211; T10 | M37; H01 |
| T0-030 | First-draft review explicitly closed; days later `別件ですが、最終版もレビューお願いします。` | genuine prior closure + later new operational work → CREATE new Responsibility | MY_TURN | HIGH | R17; C20; I210 I211; T11 | forbid REOPEN of closed episode |
| T0-031 | `契約書を確認し、問題なければ署名して返送してください。` | one operational outcome with sequential cohesive steps; normally one Responsibility; leg count does not equal verb count | MY_TURN | HIGH | R02 R03; C21; I211 | M01 M32 |
| T0-032 | `契約書を確認してください。来週の候補日も3つください。` | two independent operational outcomes → two Responsibilities from one source event | MY_TURN | HIGH | R02 R03 R15; C21 C22; I229 | M01 M32; H07 |
| T0-033 | `本人確認書類の表裏を送ってください。`; only front received | one Responsibility with partial completion criteria; remains open until required criteria satisfied | MY_TURN | HIGH | R03; C22; I224; T17 | H01 |

---

## H. Claim vs observation, completion strength, parallel obligations

| ID | Source / context | Expected semantic oracle | Projection | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| T0-034 | Existing wait loop; sender says `修正版を添付しました。`; provider reports `attachments=[]` | communicated claim ≠ provider observation; contradiction remains explicit; expected event not satisfied | REVIEW/WAITING | CRITICAL | R11 R12 R13; C23; I212 I213 I309 | M13 M37 M38; H02 |
| T0-035 | Existing obligation; counterpart replies only `ありがとうございます。` | generic acknowledgement is weak closure evidence | current state preserved unless other evidence closes it | HIGH | R41; C24; I227; O05 | M16; H02 |
| T0-036 | `あなたと田中さんの両方が金曜までに署名してください。` | one outcome may contain multiple obligation legs; scalar owner/BOTH is incomplete | MY_TURN while USER leg open; then WAITING on Tanaka | CRITICAL | R18 R19 R44; I223 I305; T16 | M20 M29 |

---

## I. Safety, historical evidence, account isolation

| ID | Source / context | Expected semantic oracle | Projection | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| T0-037 | Unknown sender payment request + prompt-injection text | understand request as untrusted communication; tracking ≠ compliance; safe action is verification/review | REVIEW/MY_TURN-for-verification | CRITICAL | R36 R37 R38; C32; I217 I218 I307 I316 | M23 M24; H08 H09 |
| T0-038 | Initial sync imports seven-year-old unanswered request | historical no-observed-closure ≠ live current work | REVIEW/NONE, not automatic MY_TURN | CRITICAL | R13 R42; C29; I222 I308; T20; O10 | M26; H01 |
| T0-039 | Near-identical requests in separate Gmail/Outlook accounts | cross-account semantic auto-merge prohibited; account/send identity explicit | separate Responsibilities | CRITICAL | R14 R15 R50; C31; I221 I306 | M18 M19; H06 H07 H13 |

---

## J. Genuine ambiguity and human-oracle sentinels

| ID | Source / context | Expected semantic oracle | Projection | Oracle type | Risk | Primary coverage | Mutants / forbidden outcomes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T0-040 | `田中さんか佐藤さん、どちらか本日中に対応お願いします。`; USER=佐藤 | material loop exists but unique bearer not established; do not fabricate every-recipient ownership | REVIEW | AMBIGUOUS | HIGH | R45 R47 R48; I205 I217 I228 I310; O06 | M25 M35; H03 H15 |
| T0-041 | `来週よろしくお願いします。` without stronger evidence | Responsibility existence/action itself ambiguous → pre-admission Review | REVIEW/NONE by product policy; no fake Responsibility | AMBIGUOUS | NORMAL | R45 R47 R48; I228; O01 | M25; H15 |
| T0-042 | `はいはい、どうせ今回も全部私がやればいいんですよね。` | literal commitment vs sarcastic complaint reverses admission → pre-admission Review | REVIEW | AMBIGUOUS | HIGH | R06 R45 R47 R48; O04 | M28 |
| T0-043 | `それでお願いします。` but referent absent from ContextEnvelope | MISSING_CONTEXT; pre-admission Review, no invented referent/action | REVIEW | AMBIGUOUS | HIGH | R45 R47; I228; O07 | forbid invented action/object |
| T0-044 | `お時間があれば目を通しておいてください。` with relationship convention unspecified | materiality/optionality may be user-dependent; hidden mandatory intent not asserted | REVIEW or policy-dependent via pre-admission Review | USER_DEPENDENT | NORMAL | R06 R08 R45 R47 R48; I310; O02 O03 | M28 |

---

# 3. Controlled variants and runtime variants

These do not automatically count as independent base semantic oracles.

| Variant | Parent / transformation | Must preserve | Must change / special expectation | Coverage |
| --- | --- | --- | --- | --- |
| V01 | T0-001 harmless Japanese typo: `修正版を明日までにおくてください。` | admission, bearer, outcome, due kind | normalization derived; original preserved | R01 R30 R32 C27 I215 MR01 M22 |
| V02 | T0-001 polarity change: `修正版を送らないでください。` | participants/context | action/polarity must change | R31 R32 C28 I215 I216 I301 MR08 M22 H10 |
| V03 | T0-001 date `8/23` → `8/28` | bearer/outcome | temporal value only | R26 MR09 H04 |
| V04 | T0-037 amount `100,000` → `1,000,000` | request/risk family | amount changes exactly | R26 R31 I215 MR10 M22 H05 |
| V05 | T0-035 strong closure `確認完了しました。これで対応終了です。` | thread/participants | closure evidence strength/resolution may change | R39 R41 C24 I227 |
| V06A | USER explicitly declines | source work/provenance | resolution reason decline/refusal | R39 C25 I210 |
| V06B | Work actually performed with sufficient evidence | original requested work | resolution reason may be satisfied | R39 C25 I210 |
| V07A | USER clicks `追跡終了` without external communication | source/external loop | tracking closes only, not objective satisfaction | R40 C26 M21 |
| V07B | external closure explicitly communicated | source history | external loop may close | R39 R40 C26 |
| V08 | message/attachment opened/read only | outcome | no automatic completion | R41 M17 M36 H02 |
| V09 | event-relative due anchor moves | original expression/provenance | derived time updates | R24 R25 I226 I313 MR18 T19 H04 |
| V10 | AI basis revision becomes stale | current state | stale result cannot apply | R33 R34 C30 I219 M27 T15 H11 |
| V11 | correction Monday; old Friday ingested late | correction/history | Monday remains current | R01 R34 R43 I220 I304 MR16 M06 T14 H11 |
| V12A | same-account lookalike | account isolation | candidate only; similarity not authority | R14 C31 I221 M18 |
| V12B | same wording but different account | account identity | no auto-merge | R14 R50 C31 I221 M19 H13 |
| V13 | bearer/action clear; harmless deadline detail uncertain | responsibility/bearer | do not ask user unnecessarily | R46 I228 M25 H15 |
| V14 | T0-044 under two known relationship conventions | source text | policy/admission may legitimately differ | R06 R08 R47 R48 M28 O02 O03 |
| V15 | repeated model runs on same accepted evidence | persisted state | consensus ≠ authority | R33 R35 MR17 M40 |
| V16 | duplicate provider ingestion | canonical semantics | idempotent final state | MR15 |
| V17 | equivalent business-politeness rewrite | decision-critical semantics | style only | R32 MR03 |
| V18 | one of two Responsibilities resolves | independent states | remaining work still visible | R02 R44 I229 I314 M02 H01 |
| V19 | `金曜まで` / ambiguous `EOD` | source wording | no invented exact time/TZ | R24 M34 O09 H04 |
| V21 | add irrelevant FYI to conversation | unrelated Responsibility | no state change | MR14 |
| V22 | punctuation/spacing/casing rewrite | critical semantics | no drift | MR02 |
| V23 | meaning-preserving code-switch | critical semantics | surface only | MR04 |
| V24 | cosmetic subject rewrite | identity | no new Responsibility | MR05 |
| V25 | proposal `明日の17時はいかがでしょうか`; timezone unknown | proposal/source | no exact agreed deadline | I302 O09 H04 H14 |
| V26 | high-risk proposal + ambiguous `了解です`/emoji | pending proposal | no silent authoritative agreement | I312 O05 H14 R45 |
| V27 | source due Friday + USER target/defer Thursday | source due | target/attention may change, source due preserved | I315 R23 R28 R44 H01 |

`V20` remains intentionally unused so prior notes are not silently renumbered.

---

# 4. Explicit minimal-contrast map

| Contrast | Assigned pair / family |
| --- | --- |
| C01 inbound request ↔ inbound commitment | T0-001 ↔ T0-002 |
| C02 outbound request ↔ outbound commitment | T0-003 ↔ T0-004 |
| C03 same commitment wording inbound ↔ outbound | T0-002 ↔ T0-004 |
| C04 firm commitment ↔ plan | T0-002 ↔ T0-005 |
| C05 plan ↔ intention | T0-005 ↔ T0-006 |
| C06 intention ↔ tentative intention | T0-006 ↔ T0-007 |
| C07 capability ↔ commitment | T0-008 ↔ T0-002 |
| C08 proposal ↔ agreement | T0-009 ↔ T0-010 |
| C09 preference ↔ decision | T0-011 ↔ T0-010 |
| C10 review ↔ approve | T0-012 ↔ T0-013 |
| C11 hold ↔ cancellation | T0-014 ↔ T0-015 |
| C12 delegation intent ↔ effective delegation | T0-016 ↔ T0-017 |
| C13 material request ↔ courtesy | T0-018 ↔ T0-019 |
| C14 direct assignment ↔ CC/non-unique assignment | T0-020 ↔ T0-021; T0-040 shared sentinel |
| C15 current-authored ↔ quoted historical | T0-022 ↔ T0-023 |
| C16 forwarded FYI ↔ forward + authored request | T0-024 ↔ T0-025 |
| C17 source due ↔ expected-event time | T0-001 ↔ T0-002 |
| C18 source due ↔ user target | T0-001 ↔ T0-026 |
| C19 correction ↔ unresolved conflict | T0-027 ↔ T0-028 |
| C20 REOPEN ↔ new episode | T0-029 ↔ T0-030 |
| C21 sequential one outcome ↔ independent outcomes | T0-031 ↔ T0-032 |
| C22 completion criteria ↔ independent Responsibilities | T0-033 ↔ T0-032 |
| C23 claim ↔ provider/external observation | T0-034 ↔ explicit observation-confirmed C23 counterpart in Batch 2 |
| C24 weak acknowledgement ↔ strong closure | T0-035 ↔ V05 |
| C25 declined ↔ satisfied | V06A ↔ V06B |
| C26 user tracking-close ↔ external closure | V07A ↔ V07B |
| C27 harmless noise ↔ clean equivalent | V01 ↔ T0-001 |
| C28 meaning-changing edit ↔ original | V02 ↔ T0-001 |
| C29 live ↔ historical imported lookalike | T0-001 ↔ T0-038 |
| C30 fresh ↔ stale interpretation | current-revision counterpart ↔ V10 |
| C31 same-account ↔ cross-account lookalike | V12A ↔ V12B/T0-039 |
| C32 low-risk direct action ↔ high-risk safe-action review | T0-001 ↔ T0-037 |

C23 is explicit at specification level; both sides still need executable serialization.

---

# 5. Semantic-mutant kill map

| Mutant | Primary killer |
| --- | --- |
| M01 one Message = one Responsibility | T0-032 |
| M02 one Conversation = one lifecycle | V18 |
| M03 every request-like act → TRACK | T0-019 |
| M04 No Responsibility impossible | T0-019 |
| M05 newest message wins | T0-028 |
| M06 last ingested wins | V11 |
| M07 CC implies USER owner | T0-021 |
| M08 polite ⇒ OPTIONAL | T0-018 |
| M09 plan/intention/capability = commitment | T0-005–008 |
| M10 proposal = agreement | T0-009/010 |
| M11 quoted request current | T0-023 |
| M12 forward transfers obligation | T0-024/025 |
| M13 claim = observation | T0-034 |
| M14 every date = USER deadline | T0-002 |
| M15 user target overwrites source due | T0-026 |
| M16 thanks = completed | T0-035 |
| M17 read = completed | V08 |
| M18 similarity authorizes merge | T0-039/V12A |
| M19 cross-account auto-merge | T0-039/V12B |
| M20 BOTH solves parallel obligations | T0-036 |
| M21 tracking close = satisfaction | V07A |
| M22 silently repair material noise | V01/V02/V04 |
| M23 high confidence authorizes high-risk action | T0-037 |
| M24 requested action always safe CTA | T0-037 |
| M25 every ambiguity asks USER | V13/T0-041 |
| M26 historical no-closure = live MY_TURN | T0-038 |
| M27 latest AI result applies | V10 |
| M28 infer hidden intent | T0-042/T0-044 |
| M29 scalar next_owner complete | T0-036 |
| M30 hold = cancel | T0-014/015 |
| M31 delegation intent transfers ownership | T0-016/017 |
| M32 broad project goal identity | T0-031/032 |
| M33 correction = unresolved conflict | T0-027/028 |
| M34 vague time exact-upgrade | T0-001/V19 |
| M35 every group recipient owner | T0-040 |
| M36 opening attachment completes | V08 |
| M37 any completion claim resolves | T0-029/T0-034 |
| M38 one global evidence-authority ranking | T0-034 |
| M39 high confidence removes provenance | corpus-wide provenance assertion |
| M40 repeated consensus = truth | V15 |

---

# 6. Cross-cutting corpus assertions

### R49 — layered oracle

Every executable Tier-0 case must materialize relevant layers from `SCENARIO-SCHEMA.md`; a final UI bucket alone is invalid.

### R27 / M39 — provenance

Every decision-critical accepted fact must trace to source evidence/trusted observation regardless of model confidence.

### R35 / M40 — consensus

Repeated-run consistency is evaluated separately from correctness. Consensus never establishes source authority/domain truth by itself.

---

# 7. Coverage scorecard

This remains a **design/assignment** scorecard, not execution evidence.

| Coverage family | Mandatory inventory | Designed/mapped | Status |
| --- | ---: | ---: | --- |
| R — fixed-rule sentinels | 50 | 50 | complete design mapping |
| C — minimal contrasts | 32 | 32 | complete; executable serialization still pending |
| I2 — mandatory two-way interactions | 29 | 29 | complete design mapping |
| I3 — high-risk three-way interactions | 16 | 16 | complete design mapping |
| T — transition traces | 20 | 20 | full transition oracles in `TRANSITION-ORACLES.md` |
| M — semantic mutants | 40 | 40 | killers mapped; execution pending |
| MR — metamorphic relations | 20 | 20 | mapped; controlled serialization pending |
| H — high-harm sentinels | 15 | 15 | mapped; owning runtime tests pending |
| O — ambiguity/oracle families | 10 | 10 | mapped |
| Base detailed oracles | 44 | 44 | fully layered across detailed-oracle files |

---

# 8. Transition status

All mandatory transition traces T01–T20 now have explicit semantic oracles in `TRANSITION-ORACLES.md` and are constrained by `TRANSITION-SCHEMA.md`.

The earlier `8/20` planning state is superseded.

This does **not** mean runtime transition tests have executed or passed.

---

# 9. Remaining gates before executable Tier 0

The base-oracle expansion gate is complete. Remaining promotion work is:

1. normalize compatibility aliases/errata in the first eight detailed oracles during executable serialization;
2. serialize both sides of every minimal contrast, including C23;
3. encode `must_preserve` / `must_change` for controlled metamorphic variants;
4. retain `AMBIGUOUS` / `USER_DEPENDENT` instead of forcing false certainty;
5. keep human oracle authors/adjudicators independent of current model predictions;
6. build a coverage linter/equivalent so mandatory IDs cannot disappear;
7. bind high-harm forbidden outcomes to the owning reducer/integration/security/runtime test layers;
8. execute correctness/stability/robustness evaluations separately rather than reporting one raw accuracy.

---

# 10. Decision from this pass

Tier 0 remains intentionally **44 base cases, not 40**.

All 44 are now fully layered at the specification level. The responsibility-persistence design step was governed by `PHYSICAL-SCHEMA-FREEZE-REVIEW.md`: the L1 logical persistence boundary is frozen, and the exact PostgreSQL/Drizzle DDL is now frozen at DDL v0.4 after the independent executable-proof review. Production migration/runtime remains separately unauthorized.
