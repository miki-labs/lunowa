# Responsibility Transition Oracles v0.1

## Status

**Accepted transition-semantics baseline for the 20 mandatory traces in `COVERAGE-PLAN.md`.**

This document validates Responsibility semantics across time. Static message classification is insufficient for identity continuity, correction, reopening, proposal negotiation, delegation, temporal anchors, historical activation, or stale-analysis behavior.

These are semantic/runtime test contracts. They do not freeze SQL tables, enum names, job implementation, or provider-specific APIs.

`mapped` means the trace has an explicit oracle. It does not mean any implementation has executed or passed it.

---

# 1. Transition-oracle conventions

A trace is evaluated as an ordered sequence of **semantic events**, not merely as the order in which workers happen to process records.

Each step has:

```text
source evidence / trusted event
        ↓
interpretation or deterministic observation
        ↓
matching/reduction effects
        ↓
accepted evidence-relative Responsibility snapshot
        ↓
safety / projection
```

A step may affect more than one Responsibility. In particular, supersession can resolve one Responsibility and create another in the same focal event.

For each trace we distinguish:

- `semantic chronology` — when/why communication or authoritative evidence became true;
- `observed/ingestion chronology` — when Lunowa received or processed it;
- `evidence revision` — version of the authorized evidence set used by an interpretation;
- `domain effect` — CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / NO_OP or a composite set of effects;
- `projection` — deterministic user-facing `MY_TURN / WAITING / LATER / DONE / REVIEW / NONE`.

## 1.1 Core transition invariants

```text
later processing ≠ later semantic authority
send attempt ≠ reconciled send
proposal ≠ agreement
pause ≠ cancellation
user action completion ≠ whole Responsibility completion
temporary resolution ≠ identity reset
new work after genuine closure ≠ reopening old episode
historical apparent open loop ≠ live active responsibility
```

## 1.2 Projection discipline

A communication-level hold/pause does **not** itself mean `LATER`. `LATER` is an attention/defer projection. If an open Responsibility is blocked waiting for another party/event, its ordinary projection is `WAITING` unless the user/product separately defers its attention.

This clarifies the earlier shorthand `WAITING/LATER` used for hold examples.

---

# 2. T01 — CREATE → UPDATE → RESOLVE

**Purpose:** basic identity continuity across a clarification update and successful completion.

**Operational outcome:** send the requested weekly status report.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `今週の進捗レポートを金曜までに送ってください。` | CREATE `R1` | `R1 OPEN`; USER owes SEND_REPORT; source due Friday; `MY_TURN` |
| 2 | Same counterpart: `レポートはPDFでお願いします。` | UPDATE `R1` | Same identity; action constraint/format becomes PDF; due unchanged; `MY_TURN` |
| 3 | USER sends the PDF through Lunowa; provider send is reconciled accepted | UPDATE/RESOLVE `R1` because the operational outcome is specifically successful sending of the requested report | USER obligation satisfied; no remaining expected event; `R1 RESOLVED/SATISFIED`; `DONE` |

### Must hold

- Step 2 MUST NOT create a second Responsibility merely because a new message arrived.
- The format clarification MUST NOT rewrite the original Friday source-due evidence.
- Resolution at step 3 depends on trusted send reconciliation, not the user's draft text or send-button click alone.

### Forbidden

- one-message-one-Responsibility fragmentation;
- resolving before provider reconciliation when send acceptance is unknown;
- losing provenance for the original due or later PDF constraint.

---

# 3. T02 — USER obligation → user send → Waiting → counterpart response → resolve

**Purpose:** distinguish completion of the user's current leg from completion of the whole communication loop.

**Operational outcome:** obtain counterpart confirmation that the submitted draft is acceptable.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `ドラフトを送ってください。確認したら返事します。` | CREATE `R1` | USER owes SEND_DRAFT; expected later counterpart confirmation; `MY_TURN` |
| 2 | USER sends draft; provider reconciliation confirms send | UPDATE `R1` | USER send leg satisfied; OTHER_PARTY now expected to CONFIRM_DRAFT; `WAITING` |
| 3 | Counterpart: `受領しました。内容も問題ありません。` | RESOLVE `R1` | expected confirmation satisfied; `RESOLVED/SATISFIED`; `DONE` |

### Must hold

`USER_SENT_REQUIRED_REPLY` can move ownership/expectation without implying the entire Responsibility is complete.

### Forbidden

- `DONE` immediately at step 2 when confirmation is part of the operational outcome;
- creating a new Responsibility merely because ownership changes USER → OTHER_PARTY.

---

# 4. T03 — Outbound user commitment → fulfillment send → provider reconciliation → resolve

**Purpose:** user-sent communication can create a user obligation; actual provider evidence closes it.

**Operational outcome:** send the revised quotation promised by the user.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | USER sends: `修正版の見積書は明日送ります。` | CREATE `R1` from outbound COMMITMENT | USER owes SEND_REVISED_QUOTE; expected due is the communicated commitment time; `MY_TURN` |
| 2 | USER composes/sends revised quote; provider response is ambiguous timeout | NO authoritative completion yet | `R1 OPEN`; sending outcome uncertain; conservative visible state, not `DONE` |
| 3 | Reconciliation later confirms provider accepted the message with attachment | RESOLVE `R1` | promised send satisfied; `DONE` |

### Must hold

- The sent commitment text is source of truth for what the user promised.
- A send timeout with possible provider acceptance is not safe evidence for either blind retry or completion.

### Forbidden

- resolving at the moment a send command is issued;
- blindly retrying an ambiguous send and risking duplicate delivery;
- rewriting the user's communicated due based on an unspoken intent.

---

# 5. T04 — Waiting → follow-up trigger → user follow-up → send → Waiting → resolve

**Purpose:** follow-up is a new current action inside the same Responsibility, not a separate lifecycle species or a new Responsibility.

**Operational outcome:** obtain approval from the counterpart.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | USER requests: `金曜までに承認をお願いします。` | CREATE `R1` | OTHER_PARTY owes approval; `WAITING` |
| 2 | Friday follow-up trigger fires; no approval/reply observed | UPDATE `R1` after re-evaluation | USER now has FOLLOW_UP action; original approval expectation remains unresolved; `MY_TURN` |
| 3 | USER sends reminder; provider reconciles send | UPDATE `R1` | follow-up leg satisfied; OTHER_PARTY again owns next expected approval; `WAITING` |
| 4 | Counterpart: `承認します。` with sufficient authority/context | RESOLVE `R1` | approval satisfied; `DONE` |

### Must hold

- Trigger firing MUST re-evaluate current evidence before changing actionability.
- Follow-up sending does not satisfy the original approval outcome.
- Same Responsibility identity persists through Waiting → My Turn → Waiting.

### Forbidden

- a persisted `FOLLOW_UP` lifecycle replacing the underlying obligation semantics;
- new Responsibility for every reminder;
- resolving because reminder was sent.

---

# 6. T05 — Proposal → counterproposal → acceptance/agreement

**Purpose:** negotiation terms remain pending until accepted.

**Operational outcome:** agree on a meeting time.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `金曜17時はいかがでしょうか。` | CREATE `R1` negotiation loop | pending proposal = Fri 17:00; USER response needed; no agreed time; `MY_TURN` |
| 2 | USER: `17時は難しいです。18時なら可能です。` | UPDATE `R1` | Fri 17:00 explicitly rejected; new counterproposal Fri 18:00 pending; OTHER response expected; `WAITING` |
| 3 | Counterpart: `では18時でお願いします。` | UPDATE + RESOLVE `R1` | pending proposal becomes agreed fact Fri 18:00; negotiation outcome satisfied; `DONE` for the scheduling-negotiation Responsibility |

### Must hold

- Proposed times are not authoritative agreed times before acceptance.
- Rejection of 17:00 and proposal of 18:00 are separate semantic effects in step 2.
- Resolving the **agreement** Responsibility does not itself claim the future meeting occurred.

### Forbidden

- storing Fri 17:00 as agreed at step 1;
- treating counterproposal as acceptance of the original proposal;
- creating a user deadline from the proposed meeting time.

---

# 7. T06 — Proposal → rejection/decline without accidental agreement

**Purpose:** rejection can keep a negotiation loop open without establishing a fact.

**Operational outcome:** agree on a meeting time.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `金曜17時はいかがでしょうか。` | CREATE `R1` | pending Fri 17:00 proposal; `MY_TURN` |
| 2 | USER: `金曜17時は難しいです。別の候補をいただけますか。` | UPDATE `R1` | Fri 17:00 rejected; no agreed time; OTHER_PARTY now expected to propose alternatives; `WAITING` |

### Must hold

Rejection of a proposal is not cancellation of the broader scheduling goal unless the communication actually cancels it.

### Forbidden

- agreed_time = Fri 17:00;
- `DONE` merely because the user responded;
- converting `別の候補をいただけますか` into a user obligation.

---

# 8. T07 — Open → hold/pause → resume → resolve

**Purpose:** hold changes actionability through a constraint/expected event without cancelling the Responsibility or equating hold with snooze.

**Operational outcome:** send the final contract after the counterpart's legal clearance.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `最終契約書を送ってください。` | CREATE `R1` | USER owes SEND_FINAL_CONTRACT; `MY_TURN` |
| 2 | Counterpart: `法務確認が終わるまで一旦止めてください。こちらから連絡します。` | UPDATE `R1` | add DO_NOT_PROCEED-until-resume constraint; current user action blocked; expected OTHER/EXTERNAL resume event; `WAITING` |
| 3 | Counterpart: `法務確認が終わりました。月曜までに送ってください。` | UPDATE `R1` | resume condition satisfied; constraint lifted; USER action active; new source due Monday with provenance; `MY_TURN` |
| 4 | USER sends final contract; provider reconciles accepted | RESOLVE `R1` | operational outcome satisfied; `DONE` |

### Must hold

- Hold is not cancellation.
- Hold is not automatically product `LATER`; the next semantic event is someone else's resume/approval, so ordinary projection is `WAITING`.
- Resumption may add new temporal evidence without rewriting earlier messages.

### Forbidden

- resolving as cancelled at step 2;
- continuing to recommend SEND while the prohibition constraint is active;
- keeping the hold constraint after explicit resume evidence.

---

# 9. T08 — Open → cancellation → resolved-cancelled

**Purpose:** resolution reason is distinct from successful satisfaction.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `契約書のレビューをお願いします。` | CREATE `R1` | USER review obligation; `MY_TURN` |
| 2 | Same counterpart: `このレビューはもう不要です。依頼を取り下げます。` | RESOLVE `R1` | `resolution_reason=CANCELLED` (conceptually); no active obligation; `DONE` |

### Forbidden

- resolution reason `SATISFIED` when the requested work was not performed;
- retaining an active user obligation after explicit cancellation;
- treating cancellation as a hidden deletion of history.

---

# 10. T09 — Delegation intent → effective delegation → other-party work → resolve

**Purpose:** intent to delegate is not ownership transfer; transfer requires communicative evidence.

**Operational outcome:** obtain requested figures from Tanaka.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Manager to USER: `田中さんから最新の数値をもらってください。` | CREATE `R1` | USER responsible for obtaining figures; `MY_TURN` |
| 2 | USER to manager only: `田中さんにお願いしておきます。` | UPDATE `R1` | USER has committed/intended to delegate, but Tanaka has not yet received a request; `MY_TURN` |
| 3 | USER sends to Tanaka: `最新の数値をお願いします。`; Tanaka is actual recipient; provider send reconciled | UPDATE `R1` | effective request to Tanaka exists; USER delegation leg satisfied; expected Tanaka response/work; `WAITING` |
| 4 | Tanaka: `最新値です。` with requested figures attached/available | RESOLVE `R1` | operational outcome obtained; `DONE` |

### Forbidden

- moving ownership to Tanaka at step 2;
- requiring Tanaka to be a connected Lunowa user;
- creating a separate Responsibility solely for the delegation communication when it serves the same operational outcome.

---

# 11. T10 — Apparent completion → contradictory failure evidence → REOPEN

**Purpose:** later evidence can show that a previously accepted closure did not actually satisfy the same operational outcome.

**Operational outcome:** deliver a usable signed contract.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart requests signed contract | CREATE `R1` | USER obligation; `MY_TURN` |
| 2 | USER sends signed contract; provider reconciliation confirms send | RESOLVE `R1` under then-available evidence | `DONE` |
| 3 | Counterpart: `添付が壊れて開けません。再送お願いします。` | REOPEN `R1` | same operational outcome was never successfully satisfied; USER owes resend; `MY_TURN` |

### Must hold

The prior resolution history remains visible. REOPEN does not erase the fact that the system previously had reasonable evidence to close.

### Forbidden

- CREATE a new independent Responsibility for the exact same unsatisfied delivery outcome;
- leave `R1` Done after explicit failure evidence;
- erase the prior send/reconciliation provenance.

---

# 12. T11 — Genuinely resolved episode → later new work → CREATE new Responsibility

**Purpose:** avoid infinite reopening of a broad project goal.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart requests review of first draft | CREATE `R1` | USER reviews first draft |
| 2 | USER completes review; counterpart explicitly accepts that first-draft review is finished | RESOLVE `R1` | `R1 DONE/SATISFIED` |
| 3 | Days later: `別件ですが、最終版もレビューお願いします。` | CREATE `R2` | `R1` stays resolved; `R2 OPEN`; USER owes final-version review; `MY_TURN` |

### Forbidden

- REOPEN `R1` merely because topic/participants are similar;
- broaden identity to a perpetual `review the project` Responsibility;
- merge R1/R2 based only on embeddings or subject similarity.

---

# 13. T12 — Explicit supersession → old resolved/superseded + new Responsibility

**Purpose:** a single focal message may have composite domain effects across multiple Responsibilities.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `契約ドラフトAを金曜までにレビューしてください。` | CREATE `R1` | review-A obligation; `MY_TURN` |
| 2 | Counterpart: `先ほどのドラフトAレビュー依頼は取り下げます。代わりに解約通知案を月曜までに作成してください。` | Composite: RESOLVE/SUPERSEDE `R1` **and** CREATE `R2` | `R1 DONE/SUPERSEDED`; `R2 OPEN`; USER owes CREATE_TERMINATION_NOTICE; due Monday; `MY_TURN` |

### Must hold

One event can legitimately produce multiple domain effects. A single scalar `expected_matching.operation` is insufficient for every transition trace; transition tests must support an effect set/list.

### Forbidden

- mutate R1's outcome from `review draft A` into `write termination notice` while pretending identity stayed the same;
- keep R1 active after explicit withdrawal;
- lose the explicit supersession relation/provenance.

---

# 14. T13 — Conflict → explicit correction → one current fact with preserved history

**Purpose:** explicit resolution of a field conflict differs from recency-based guessing.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Authorized requester A: `金曜までに提出してください。` | CREATE `R1` | source due Friday; USER obligation; `MY_TURN` |
| 2 | Actor B: `月曜までで大丈夫です。`; authority to override is unknown | UPDATE `R1` with conflicting evidence, not authoritative replacement | due conflict Friday vs Monday; Responsibility remains visible; `REVIEW` |
| 3 | Authorized requester A: `Bさんの月曜で正しいです。金曜指定は取り消します。` | UPDATE `R1` | conflict resolved; current due Monday; Friday retained as superseded historical source; `MY_TURN` |

### Forbidden

- selecting Monday at step 2 solely because B's message is newer;
- deleting the original Friday evidence after correction;
- creating a new Responsibility for a due-date correction alone.

---

# 15. T14 — Newer correction processed first → older evidence ingested late → corrected state remains current

**Purpose:** observed/ingestion order must not define semantic chronology.

Semantic communication chronology:

```text
10:00 m1: `金曜までに提出してください。`
10:05 m2: `先ほど金曜と書きましたが、月曜の誤りです。`
```

Observed order is intentionally reversed.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | m2 is ingested/observed first at 10:06 | CREATE or provisional UPDATE according to available matching context | Current due may be Monday because m2 explicitly communicates Monday; predecessor context may be marked missing/unlinked; MUST NOT invent Friday |
| 2 | m1 arrives late at 10:07 with semantic sent time 10:00 | Link/reduce evidence in semantic chronology | m1 becomes corrected predecessor; current due remains Monday; provenance now includes both m1 and m2 |

### Must hold

Final canonical state must be invariant to these two ingestion orders when semantic evidence is the same.

### Forbidden

- late m1 rolling the due back to Friday;
- `last processed event wins`;
- discarding m2 because its predecessor had not yet been ingested when m2 arrived.

---

# 16. T15 — AI run basis revision becomes stale → stale result rejected → current result may apply

**Purpose:** contain model nondeterminism and asynchronous races.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Evidence revision 17 contains m1 with Friday due; AI Run A starts with `basis_revision=17` | no immediate domain mutation from merely starting a run | accepted state remains whatever revision 17 had |
| 2 | m2 explicit correction to Monday is ingested; evidence revision becomes 18 | current accepted interpretation may become stale/processing pending valid revision-18 interpretation | system MUST NOT pretend revision 17 remains current authority merely because Run A is still executing |
| 3 | Run A returns a valid schema output that says Friday | store trace/eval if useful; **reject for current mutation** because basis 17 ≠ current 18 | current state does not roll back to Friday |
| 4 | Run B based on revision 18 returns valid interpretation; deterministic validation/reducer accepts Monday | APPLY revision-18 result | current due Monday; current accepted interpretation references revision 18 |

### Forbidden

- latest wall-clock completion wins;
- stale Run A overwrites newer evidence;
- UI open/re-render causing an implicit rerun and nondeterministic rewrite.

---

# 17. T16 — Parallel USER + OTHER obligations → user leg completes → Waiting → resolve

**Purpose:** validate state vector / obligation-leg semantics.

**Operational outcome:** obtain a contract signed by both USER and Tanaka.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Request: `あなたと田中さんの両方が署名してください。` | CREATE `R1` | two open obligation legs: USER_SIGN, TANAKA_SIGN; `MY_TURN` because USER leg is open |
| 2 | Trusted evidence USER signed | UPDATE `R1` | USER leg satisfied; Tanaka leg still open; `WAITING` |
| 3 | Trusted evidence Tanaka signed | RESOLVE `R1` | all required signature criteria/legs satisfied; `DONE` |

### Forbidden

- scalar `BOTH` being treated as complete canonical state;
- resolving after USER signs while Tanaka leg remains open;
- keeping `MY_TURN` after the user's only required leg is satisfied.

---

# 18. T17 — Partial completion criteria → remains open → final criterion → resolve

**Purpose:** distinguish one Responsibility with completion criteria from multiple independent outcomes.

**Operational outcome:** provide both sides of the required identity document.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `本人確認書類の表裏を送ってください。` | CREATE `R1` | criteria FRONT and BACK both unsatisfied; USER action; `MY_TURN` |
| 2 | USER sends FRONT only; provider reconciles | UPDATE `R1` | FRONT satisfied, BACK unsatisfied; Responsibility remains OPEN; `MY_TURN` |
| 3 | USER sends BACK; provider reconciles | RESOLVE `R1` | all completion criteria satisfied; `DONE` |

### Forbidden

- Done after step 2;
- splitting FRONT and BACK into independent Responsibilities without evidence of independent operational outcomes;
- treating attachment-open/read state as criterion completion.

---

# 19. T18 — Conditional obligation waits on external event → event occurs → USER obligation activates

**Purpose:** a future user action can be known without being currently actionable.

**Operational outcome:** sign the agreement after legal approval.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Counterpart: `法務承認が出たら署名してください。` | CREATE `R1` | expected event LEGAL_APPROVAL; future SIGN obligation is contingent on that event; no current executable user action; `WAITING` |
| 2 | Trusted/authorized evidence `LEGAL_APPROVAL_OBSERVED` | UPDATE `R1` | expected event satisfied; contingent SIGN obligation becomes actionable for USER; `MY_TURN` |
| 3 | Trusted evidence USER signed | RESOLVE `R1` | operational outcome satisfied; `DONE` |

### Must hold

The pre-approval model needs to retain the **activation relation** between the expected event and the future user obligation. It must not simply forget the future action while waiting.

A physical schema may implement this via an expected-event activation effect, a condition on an obligation, or another minimal representation; the semantic requirement is fixed, the storage shape is not.

### Forbidden

- `MY_TURN` before approval merely because the sentence contains `署名してください`;
- dropping the future sign obligation while waiting;
- continuing to block signing after trusted approval evidence.

---

# 20. T19 — Event-relative temporal anchor resolves → anchor changes → derived time updates without source rewrite

**Purpose:** external temporal resolution is derived, versioned context rather than rewritten communication.

**Source communication:** `会議開始の1時間前までに資料を送ってください。`

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Source request is ingested; authorized calendar anchor Meeting-X = 2026-08-27 15:00 JST | CREATE `R1` | original temporal expression preserved; relation = BEFORE 1h Meeting-X; derived due = 14:00 JST; `MY_TURN` |
| 2 | Calendar Meeting-X is authoritatively moved to 16:30 JST | UPDATE derived temporal resolution on same `R1` | derived due = 15:30 JST; source text remains exactly `会議開始の1時間前までに`; provenance/anchor identity retained |

### Must hold

- No model needs to pretend the email originally said 14:00 or 15:30.
- Anchor re-resolution can be deterministic when source semantics and calendar identity are already established.

### Forbidden

- mutating the stored source expression;
- creating a new Responsibility because the calendar event moved;
- leaving a stale derived due after a trusted anchor change.

---

# 21. T20 — Historical apparent open loop → conservative inactive/review → user resumes or closes tracking

**Purpose:** historical reconstruction and live responsibility activation are distinct.

**Historical evidence:** a seven-year-old request appears unanswered in the imported email history; no closure is observable in authorized evidence.

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 1 | Initial historical sync/analysis finds the old apparent open loop | CREATE/record historical candidate semantics without auto-activating as live user work | evidence-relative obligation may be unresolved, but product tracking activation is conservative; `REVIEW` or `NONE`, never automatic live `MY_TURN` |

Then the trace branches on explicit user authority.

### Branch A — user resumes tracking

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 2A | USER explicitly chooses `この件を追跡する` | UPDATE activation/attention policy for the same historical Responsibility | Responsibility becomes actively tracked; if USER still appears bearer, `MY_TURN` |

### Branch B — user closes tracking

| Step | Event / evidence | Expected domain effect | Expected snapshot / projection |
| --- | --- | --- | --- |
| 2B | USER explicitly chooses `もう追跡しない` | RESOLVE/close tracking with `USER_CLOSED`-like reason | `DONE/NONE` for Lunowa tracking; no assertion that the historical external obligation was objectively satisfied |

### Must hold

This trace exposes a semantic dimension not captured by a naive `OPEN/RESOLVED` pair alone: an apparent historical open loop can exist without being activated as live work. Exact physical representation is frozen by DDL v0.4; runtime implementation remains separately unauthorized.

### Forbidden

- old no-reply evidence automatically flooding `MY_TURN`;
- treating user tracking-close as objective satisfaction;
- inventing off-channel completion simply because the item is old.

---

# 22. Transition coverage result

All 20 mandatory transition IDs in `COVERAGE-PLAN.md` now have an explicit oracle:

```text
T01  mapped
T02  mapped
T03  mapped
T04  mapped
T05  mapped
T06  mapped
T07  mapped
T08  mapped
T09  mapped
T10  mapped
T11  mapped
T12  mapped
T13  mapped
T14  mapped
T15  mapped
T16  mapped
T17  mapped
T18  mapped
T19  mapped
T20  mapped
```

This closes **transition-design coverage**, not runtime verification.

---

# 23. Design findings discovered by transition expansion

The transition pass produced four material clarifications that should constrain later schema/runtime work.

## 23.1 One event may have composite Responsibility effects

T12 proves that a focal communication can:

```text
resolve/supersede R1
AND
create R2
```

Therefore a transition/evaluation contract must allow `effects[]`; one scalar matching operation is not universally sufficient.

## 23.2 Hold and product defer are orthogonal

T07 proves:

```text
communication hold/pause ≠ user snooze/defer
```

A held Responsibility blocked on another party/event naturally projects `WAITING`; `LATER` requires a separate attention/defer decision.

## 23.3 Contingent obligations require a durable activation relation

T18 proves that the system must remember:

```text
LEGAL_APPROVAL
    ↓ activates
USER_SIGN
```

without surfacing USER_SIGN as immediately actionable before approval. This is a semantic requirement, not a mandate to build a generic workflow engine.

## 23.4 Historical semantic openness and live tracking activation are distinct

T20 proves:

```text
appears semantically unresolved in historical evidence
≠
should be live active work now
```

A future physical model needs a minimal way to represent this distinction without claiming world completion or flooding the user.

---

# 24. Verification routing

These traces should later be executed at the layer that owns the relevant invariant.

| Trace family | Primary verification |
| --- | --- |
| T01, T02, T05–T13, T16–T20 | deterministic domain/reducer tests + scenario oracle |
| T03 | provider send/reconciliation integration |
| T04 | durable scheduler + reducer integration |
| T14 | sync/reconciliation ordering integration |
| T15 | AI runtime concurrency/evidence-revision integration |
| T19 | external-anchor resolver integration |

The semantic oracle remains shared across layers; passing an LLM prompt-eval alone does not prove the runtime transition is safe.
