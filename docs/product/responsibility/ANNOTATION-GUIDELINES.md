# Responsibility Annotation Guideline v0.1

## Status

**Accepted as the v0.1 annotation/domain-semantics baseline for scenario construction.**

This document defines how Lunowa should reason about communication before implementation details are frozen. It is an annotation and domain-semantics contract, not a database schema.

The goal is not to classify sentences for their own sake. The goal is to determine, from available evidence, what communication-bounded responsibility loop exists, how it is changing, what is safe to surface to the user, and what must remain uncertain.

---

## 1. Non-negotiable separations

Lunowa MUST preserve these distinctions:

```text
Message ≠ Conversation ≠ Responsibility
Evidence ≠ Interpretation
Communicated claim ≠ observed world fact
Literal form ≠ communicative force
Politeness ≠ obligation strength
Capability ≠ intention ≠ commitment
Proposal ≠ agreement
Pause ≠ cancellation
Delegation intent ≠ delegation effect
Tracking ≠ compliance
Requested action ≠ safe next action
Ingestion order ≠ semantic chronology
User preference ≠ source fact
```

A model may participate in interpretation, but it MUST NOT collapse these boundaries.

---

## 2. Responsibility definition

A **Responsibility** is a communication-bounded, trackable operational obligation / expected-outcome loop that has a coherent closure condition and whose omission or mishandling can leave a meaningful unfinished state, expectation violation, or material opportunity loss for the user or communication counterpart.

Important consequences:

- a Message may create zero, one, or many Responsibilities;
- a Conversation may contain zero, one, or many Responsibilities;
- a Request-like utterance does not automatically become a Responsibility;
- a Responsibility may be temporarily waiting on another party or event and still remain the same Responsibility;
- the concept name is `Responsibility`; the physical implementation may temporarily retain `ActionItem` until schema design is reconciled.

### 2.1 Operational outcome, not arbitrary large goal

Responsibility identity should follow the **smallest communication-bounded operational outcome with a coherent closure condition**, not an arbitrarily broad project goal.

Bad identity:

```text
"Launch the product"
```

when the communication actually establishes independent loops such as review, approval, and signature.

Better identity:

```text
"Review the contract draft"
"Approve the revised contract"
"Return the signed agreement"
```

Sequential steps may remain one Responsibility when they are operationally and temporally cohesive and converge on one closure condition.

---

## 3. Evidence-relative truth

Lunowa does not know metaphysical world truth. Its current state is evidence-relative:

```text
LunowaState(t) = reduce(authorized evidence available through t)
```

Therefore:

```text
LunowaState(t) may differ from WorldState(t)
```

Example: a task may have been completed by phone while Lunowa has no phone evidence.

Lunowa MUST NOT invent off-channel completion merely because enough time has passed.

---

## 4. Preserve original communication

Actually sent/received communication is immutable source evidence.

```text
Original source ≠ normalized text ≠ interpretation
```

Typo correction, paraphrase, translation, summarization, and AI interpretation are derived layers. They MUST NOT rewrite what was actually communicated.

If a later message explicitly corrects an earlier fact, the current interpreted fact may change while the original history remains preserved.

Example:

```text
Message A: "8/23まで"
Message B: "先ほど23日と書きましたが28日の誤りです"
```

Current due interpretation may become 8/28 because of explicit correction evidence; Message A is not rewritten.

---

## 5. Context envelope

Annotation MUST declare which context is available. Do not silently use unavailable knowledge.

Conceptually:

```text
ContextEnvelope {
  current_user
  connected_account
  message_direction
  sender
  recipients / cc / bcc when available
  current_message
  authorized preceding thread context
  timestamps
  attachment metadata
  existing responsibilities
  locale / timezone
  optional authorized external context
}
```

Distinguish:

- `MISSING_CONTEXT`: required evidence is absent from the annotation input;
- `SOURCE_AMBIGUITY`: available source itself supports multiple reasonable interpretations;
- `UNKNOWN`: a field cannot currently be determined.

---

## 6. Message zoning

Current authored content MUST be separated from quoted/forwarded/boilerplate content where practical.

Conceptual zones:

```text
AUTHORED_CURRENT
QUOTED_HISTORY
FORWARDED_CONTENT
SIGNATURE
DISCLAIMER
STRUCTURED_METADATA
```

Quoted or forwarded requests MUST NOT automatically create a new user Responsibility.

Examples:

```text
"了解しました。\n> 明日までに送ってください"
```

The quoted request is historical evidence, not a newly authored request.

```text
"これお願いします。\n--- forwarded request ---"
```

The current authored phrase may create a new request whose referent is grounded by the forwarded material.

---

## 7. Communication act candidates

v0.1 uses a deliberately small act taxonomy:

```text
REQUEST
COMMITMENT
PROPOSAL
DECISION
CORRECTION
CANCELLATION
COMPLETION_SIGNAL
INFORMATION
```

Acts are not required to be mutually exclusive when one utterance legitimately carries multiple functions.

A CommunicationActCandidate may conceptually carry:

```text
speaker
obligation_bearer?
counterparty?
communicative_force
modality
obligation_strength?
polarity
action_or_event?
object?
proposed_terms[]
condition?
constraints[]
discourse_scope
temporal_expressions[]
provenance[]
```

### 7.1 Speaker is not obligation bearer

The sender of a sentence is not necessarily the actor who owes the action.

```text
"田中さんが明日送ります"
```

may have `speaker = sender`, `obligation_bearer = Tanaka`.

### 7.2 Literal form is not communicative force

Polite/indirect business language may still be a real request. Conversely, a sentence that resembles a request may be a courtesy formula.

Lunowa annotates the best-supported public communicative force from available evidence. It MUST NOT claim access to hidden private intent.

### 7.3 Politeness is not obligation strength

A highly polite request may still be mandatory. A rude sentence may still be optional in context. Keep these concepts separate.

### 7.4 Capability, intention, plan, and commitment

Do not strengthen weak modality:

```text
"対応できそうです"       != commitment
"対応しようと思います"   != firm commitment
"対応する予定です"       != necessarily firm commitment
"対応します"             = stronger commitment candidate
```

The exact modality enum is not frozen, but the distinction is normative.

### 7.5 Proposal is not agreement

```text
"金曜17時はいかがですか"
```

creates a proposal, not an agreed meeting time.

Counterproposal, acceptance, rejection, and correction MUST preserve negotiation state until agreement evidence exists.

---

## 8. Claim vs observation

Communication claims and system observations are different evidence classes.

Conceptual evidence classes include:

```text
COMMUNICATED_CLAIM
PROVIDER_OBSERVATION
EXTERNAL_AUTHORITATIVE_FACT
USER_ASSERTION
DERIVED_INFERENCE
```

Authority is **field-specific**, not globally ranked.

Example:

```text
Message claim: "添付しました"
Provider observation: no attachment
```

For attachment existence, provider metadata is stronger evidence. For whether an existing attachment is the intended revised document, semantic interpretation may still be required.

Conflict MUST be preserved instead of silently choosing whichever evidence arrived last.

---

## 9. Responsibility admission

Communication act detection is not task creation.

Each candidate is admitted as:

```text
TRACK
DO_NOT_TRACK
NEEDS_REVIEW
```

A useful conceptual test is:

```text
Track(candidate)
  requires materiality
  + relevance
  + an open loop / closure condition
  + grounding in evidence
```

This is a reasoning framework, not a numeric score.

### 9.1 TRACK

There is a sufficiently grounded, material open loop worth managing.

### 9.2 DO_NOT_TRACK

The language may be meaningful but no useful responsibility loop should be created.

Typical examples include many FYIs, receipts, courtesy formulas, or irrelevant third-party requests.

### 9.3 NEEDS_REVIEW

A decision-critical question cannot be resolved safely from available evidence.

Do not use review merely because one non-critical field is uncertain.

---

## 10. Materiality and relevance

Useful diagnostic questions include:

- Is someone reasonably expecting completion, response, decision, or delivery?
- Would inaction plausibly produce a follow-up, failure, missed deadline, or meaningful loss?
- Is there a coherent closure condition?
- Is the loop relevant to the current user or something the user is waiting on?

These diagnostics MUST NOT be converted into fake-precision numeric weights until empirical evidence justifies them.

CC membership alone does not establish assignment.

```text
To/CC membership ≠ obligation bearer
```

Explicit assignment is stronger evidence than recipient-list inference.

---

## 11. Responsibility identity and matching

Matching operations are conceptually:

```text
CREATE
UPDATE
RESOLVE
REOPEN
SUPERSEDE
INVALIDATE
NO_OP
```

### 11.1 Evidence hierarchy for same-episode matching

Prefer, in order:

1. explicit relation/correction/replacement language;
2. operational-outcome continuity;
3. object/artifact continuity;
4. actor/counterparty continuity;
5. temporal/episode continuity;
6. semantic similarity as a candidate-retrieval signal only.

Embedding similarity, subject equality, or semantic hashes MUST NOT be authoritative identity rules.

### 11.2 Split vs same Responsibility

Keep sequential steps together when they form one operationally and temporally cohesive closure loop.

Split when independent operational outcomes can be completed/closed independently.

Completion subcriteria do not automatically require separate Responsibilities.

Example:

```text
"免許証の表裏を提出"
```

is normally one Responsibility with multiple criteria.

```text
"免許証提出 + 面談候補日回答"
```

normally yields two Responsibilities.

### 11.3 False merge is more dangerous than modest false split

Initial risk policy:

```text
Cost(false merge) > Cost(modest false split)
```

because false merge can hide a real obligation.

### 11.4 Reopen vs new episode

```text
Goal was never actually satisfied -> REOPEN
Goal was genuinely satisfied and new work later appears -> CREATE new Responsibility
```

---

## 12. Active obligations, expected events, and scalar owner

A Responsibility may contain more than one simultaneous active obligation or expected event.

Conceptually:

```text
Responsibility {
  active_obligations[]
  expected_events[]
}
```

This handles parallel cases such as two parties who must both sign.

A scalar `next_owner` may be retained as a convenience/primary projection, but it MUST NOT be treated as a complete canonical representation.

Do not use a vague `BOTH` value to erase parallel or ambiguous structure.

---

## 13. Constraints and contingent responsibilities

A prohibition is not always a next action.

```text
"法務承認前には送らないでください"
```

may become a constraint such as `DO_NOT_SEND_BEFORE(LEGAL_APPROVAL)` rather than `next_action = do not send`.

Distinguish:

- a specific contingent Responsibility tied to the current communication episode;
- a standing/general future instruction or preference.

Generic future policy should not be forced into the current Responsibility model.

### 13.1 Pause is not cancellation

```text
"一旦止めてください。こちらから連絡するまで進めないでください"
```

usually keeps the Responsibility open while adding a constraint/expected event.

```text
"この件はもう不要です"
```

may resolve via cancellation.

---

## 14. Delegation

Delegation intent is not effective transfer.

```text
"田中さんにお願いしておきます"
```

may create a user commitment to delegate.

```text
"田中さん、こちらお願いします"
```

with Tanaka as an actual recipient is stronger evidence that the request has been communicated to Tanaka.

Ownership/obligation transfer requires evidence of delegation effect, not merely an intention to delegate.

---

## 15. Temporal semantics

Do not collapse distinct temporal concepts:

```text
SOURCE_DUE
EXPECTED_EVENT_TIME
USER_TARGET
RESURFACE_TIME
FOLLOW_UP_TIME
```

Example:

```text
"明日こちらから修正版を送ります"
```

has an expected event time, not a user deadline.

A user deciding to work Thursday does not rewrite an externally communicated Friday deadline.

### 15.1 No silent precision upgrade

Derived precision MUST NOT silently exceed the source evidence.

```text
"金曜まで" -> Friday/date precision
NOT -> Friday 17:00
```

```text
"ASAP" -> urgency signal
NOT -> invented exact deadline
```

### 15.2 Preserve reference frame

Relative times and terms such as `EOD` need their source/reference context. Do not resolve `明日` from processing time if the relevant anchor is message time. Do not assume the user's timezone when the sender-reference frame is unknown.

### 15.3 External anchors remain derived

```text
"会議までに"
```

may be resolved against an authorized Calendar event, but the source remains event-relative. If the meeting moves, the derived resolved instant may change without rewriting the email source.

---

## 16. Proposed vs agreed facts

Pending proposals MUST NOT become authoritative agreed facts merely because they contain a date, amount, or condition.

```text
proposal -> pending term
acceptance -> agreed fact candidate
correction/rejection -> update proposal state
```

Examples include meeting times, deadlines, scope, contract terms, amounts, and delivery conditions.

`"A案が良いと思います"` is not automatically equivalent to a final approval of A.

---

## 17. Resolution

`Resolved` does not imply successful satisfaction.

Conceptually distinguish reasons such as:

```text
SATISFIED
DECLINED
CANCELLED
SUPERSEDED
USER_CLOSED
INVALIDATED
DUPLICATE
```

The exact enum is not frozen.

Important distinctions:

- decline communicated to counterpart ≠ user privately stops tracking;
- user tracking close ≠ external-world completion;
- acknowledgement such as `ありがとうございます` is usually weak completion evidence unless context makes closure explicit.

### 17.1 Completion evidence must be conservative

Strong evidence may include explicit user completion, reconciled provider send when sending is the required action, explicit counterpart closure, or authoritative external confirmation.

Weak evidence includes read/open state, inactivity, generic thanks, or AI belief that the work is probably done.

---

## 18. Typo/noise handling

Typos are expected real-world input. Original text remains immutable.

Normalization is derived and MAY be used when semantic interpretation is stable.

Material values MUST NOT be silently corrected based only on plausibility, including:

```text
dates/times
amounts/quantities
identities
email addresses
URLs
filenames
negation
approval/rejection
```

### 18.1 Robustness has two directions

Lunowa should be invariant to meaning-preserving noise while remaining sensitive to meaning-changing edits.

```text
"契約しょを確認してください" ≈ "契約書を確認してください"
```

but

```text
"送ってください" != "送らないでください"
```

If plausible normalizations reverse a decision-critical field, treat this as source noise/ambiguity rather than silently selecting one reading.

---

## 19. AI nondeterminism and freshness

AI interpretation is probabilistic candidate evidence, not domain truth.

### 19.1 Persist accepted interpretation/state

Do not re-run AI simply because the user opened a view. Accepted state is persisted and reused until meaningful evidence/configuration changes justify reevaluation.

### 19.2 Stale runs cannot mutate current state

An interpretation based on an older authorized evidence-set revision may be stored for diagnostics, but MUST NOT overwrite current authoritative responsibility state.

### 19.3 Consensus is not truth

Repeated-model agreement is an uncertainty signal only:

```text
Consensus != authority
```

Prefer source grounding, deterministic validation, domain invariants, and context checks over brute-force repeated inference.

---

## 20. Semantic chronology and historical ingestion

Processing order is not semantic time.

```text
observed/ingested order != communicated chronology
```

Late ingestion of an older message MUST NOT roll back a later explicit correction.

Historical reconstruction also requires lower confidence in current activity:

```text
No observed historical closure != currently active responsibility
```

Initial sync of years-old email MUST NOT automatically populate the live `My Turn` view as though every unresolved historical thread were current.

---

## 21. Uncertainty taxonomy

At minimum, reason about:

```text
MODEL_UNCERTAINTY
SOURCE_AMBIGUITY
SOURCE_NOISE
MISSING_CONTEXT
CONFLICTING_EVIDENCE
STALE_ANALYSIS
PRAGMATIC_AMBIGUITY
AMBIGUOUS_ASSIGNMENT
HIGH_RISK_UNVERIFIED_REQUEST
```

Exact storage enum is not frozen.

Uncertainty should be field-level where possible.

Whole-item review is warranted when uncertainty affects a decision-critical question such as:

- whether a Responsibility exists;
- who bears a material obligation;
- whether it is resolved;
- whether a prohibitive constraint exists;
- whether two items are the same episode;
- a high-risk material value.

Uncertain non-critical fields do not automatically force whole-item review.

---

## 22. Human review policy

`NEEDS_REVIEW` is a safe product path, not a model failure label.

However:

```text
Uncertain fact != always ask the user
```

Only ask when the missing judgment is decision-critical/material and cannot be resolved more cheaply or safely from available authorized context.

When asking, prefer one minimal question over an interrogation.

---

## 23. Safety/actionability boundary

Tracking a request is not endorsing or authorizing it.

```text
Tracking != compliance
Interpretation != authorization
```

For high-risk requests, distinguish:

```text
requested_action
safe/recommended_next_action
```

Example:

```text
Requested action: transfer money
Safe next action: review/verify payment request
```

Externally supplied text MUST NOT gain application/tool authority merely because the model understood it as an instruction.

Prompt-injection content inside email remains untrusted communication data.

---

## 24. Product projection

`My Turn`, `Waiting`, `Later`, `Done`, and review surfaces are deterministic projections over canonical responsibility state, not primary domain truth.

Conceptual projection:

```text
if resolved -> Done
else if materially ambiguous on a critical decision -> Review
else if intentionally deferred from attention -> Later
else if any active user obligation exists -> My Turn
else if unresolved other-party/external obligations/events exist -> Waiting
else -> Review / ordinary conversation fallback
```

Projection/ranking rules MUST be deterministic, testable, and rebuildable.

---

## 25. Annotation oracle types

Each canonical case should identify one of:

```text
DETERMINATE
AMBIGUOUS
USER_DEPENDENT
```

Do not force a unique label when reasonable humans may disagree even with the same complete context.

Where possible, preserve raw annotations/disagreement in addition to adjudicated outcomes.

An ambiguous case may define acceptable outcomes and forbidden outcomes rather than a single exact label.

---

## 26. Annotation decision procedure

Annotators MUST follow this order conceptually:

1. Declare available authorized evidence/context.
2. Zone current authored, quoted, forwarded, and boilerplate content.
3. Identify communication acts and communicated claims.
4. Record provider/external observations separately from claims.
5. Detect conflicts, missing context, noise, and ambiguity.
6. Determine public communicative force, without inferring hidden private intent.
7. Determine obligation bearer(s), expected event actors, modality, and obligation strength where relevant.
8. Apply Responsibility admission: `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`.
9. If tracked, determine the smallest communication-bounded operational outcome and closure condition.
10. Match against existing Responsibility episodes: `CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP`.
11. Record active obligations, expected events, pending proposals/agreed facts, and constraints.
12. Annotate temporal facts by semantic kind and precision.
13. Annotate resolution conservatively and distinguish resolution reason from success.
14. Record field-level uncertainty/risk and all material provenance.
15. Apply safety/actionability policy; do not equate requested action with safe CTA.
16. Derive deterministic UX projection.
17. Record must-hold invariants and forbidden outcomes for evaluation.

Do not jump directly from message text to a `My Turn / Waiting / Done` label.

---

## 27. Evaluation priorities

Evaluate layers separately:

```text
1. message zoning/parsing
2. communication-act / claim extraction
3. responsibility admission
4. responsibility matching/identity
5. domain reduction
6. safety/actionability policy
7. UX projection
```

Risk is asymmetric. At v0.1, preserve only ordinal priorities rather than arbitrary numeric weights:

```text
missed material obligation > unnecessary review
fake completion >> visible uncertainty
false merge > modest false split
wrong account/identity/authorization = critical class
invented material deadline/amount = critical class
```

A system that sends everything to review is also a product failure; safety must not eliminate decision-reduction value.

---

## 28. Research basis and limitations

This specification is informed by prior email/request annotation work showing that requests and commitments contain difficult edge cases even for human annotators, and by modern evidence that LLM behavior remains probabilistic, abstention is non-trivial, and typographical noise degrades model performance.

Primary references used while establishing v0.1:

- Andrew Lampert, Robert Dale, Cécile Paris (2008), *Requests and Commitments in Email are More Complex Than You Think: Eight Reasons to be Cautious*, ACL Anthology U08-1009.
- Nishanth Madhusudhan et al. (2025), *Do LLMs Know When to NOT Answer? Investigating Abstention Abilities of Large Language Models*, COLING 2025.
- Raoyuan Zhao et al. (2026), *Evaluating Robustness of Large Language Models Against Multilingual Typographical Errors*, ACL 2026.

These references inform failure modes and evaluation design; they do not override Lunowa's product-specific semantics.
