# Responsibility Physical Model Adversarial Audit — Batch 3

## Status

**Accepted addendum to `PHYSICAL-MODEL-AUDIT.md`; the physical model remains NOT FROZEN.**

This audit applies the Batch-3 schema-falsifier oracles to the current hybrid physical-model candidate.

The most important result is not a new lifecycle field. It is a **new aggregate boundary before Responsibility admission**.

---

# 1. Audit verdict

After T0-003/T0-004/T0-026/T0-029/T0-030/T0-031/T0-032/T0-041/T0-043/T0-044:

```text
Hybrid accepted-Responsibility aggregate                 KEEP
Normalized obligation legs / events / material times     KEEP
Typed low-query semantic details                         KEEP
FieldDecision for explicit authority decisions           KEEP, NARROW SCOPE
One obligation row per linguistic verb                   REJECT
REOPEN by rewinding prior leg history                     REJECT
One message -> one aggregate effect                       REJECT (already known)
Fake Responsibility for admission uncertainty             REJECT
AIInterpretationRun as durable Review product truth        REJECT
Narrow pre-admission review artifact                       REQUIRED if REVIEW is surfaced
Generic relationship-policy/workflow engine                REJECT
```

The hybrid candidate survives but now has **two distinct accepted product-state domains**:

```text
pre-admission review state
        ↓ TRACK decision
accepted Responsibility state
```

They must not be collapsed merely to simplify rendering.

---

# 2. PMA-B3-01 — Admission-level Review must not be a fake Responsibility

**Severity:** CRITICAL  
**Pressure:** T0-041, T0-043, T0-044

`NEEDS_REVIEW` at admission means Lunowa has not safely decided that a canonical Responsibility exists.

Therefore this physical shortcut is invalid:

```text
create Responsibility
resolution_status = OPEN
uncertainty = "maybe not a responsibility"
projection = REVIEW
```

It would violate the semantic distinction:

```text
admission uncertainty
!=
field uncertainty inside an admitted Responsibility
```

## Preferred minimal boundary

When an admission-review item is surfaced or needs durable user resolution, use a narrow accepted pre-admission artifact.

Candidate concept:

```text
ResponsibilityAdmissionReview {
  id
  user_id
  conversation_id
  connected_account_id

  status
  reason_codes
  candidate_summary_jsonb

  evidence_revision
  source_event_key
  interpretation_run_id?

  admitted_responsibility_id?

  created_at
  resolved_at?
}
```

Exact name/enums remain open.

### Required invariants

```text
AdmissionReview is not a Responsibility.

No Responsibility ID exists merely because Review UI needs a row.

TRACK resolution may CREATE a Responsibility.
DO_NOT_TRACK resolution may close/dismiss the review without a fake resolved Responsibility.

The item preserves source/evidence revision and provenance.
Duplicate source evidence must not create duplicate live review items.
A stale AI run cannot reopen/overwrite a user-resolved admission decision.
```

### Why AIInterpretationRun is insufficient

`AIInterpretationRun` is inference history/candidate output. It may be:

- stale;
- replaced by another model/config;
- retained for eval even when rejected;
- non-authoritative by design.

A durable product Review decision cannot inherit authority merely from whichever run is easiest to query.

---

# 3. PMA-B3-02 — Product `REVIEW` is a union projection, not one canonical entity type

**Severity:** HIGH

The user-facing Review surface may contain at least two internal classes:

```text
A. admitted Responsibility
   + material field-level uncertainty/conflict

B. AdmissionReview
   + Responsibility existence/relevance unresolved
```

T0-028 is class A.

T0-041/T0-043/T0-044 are class B.

The UI may intentionally make them visually coherent, but query/application DTOs must preserve type/identity so that actions are correct.

Example:

```text
Resolve deadline conflict on R1
!=
Admit/dismiss candidate C1
```

Do not solve this by adding `REVIEW` as a lifecycle enum.

---

# 4. PMA-B3-03 — FieldDecision scope must remain narrow

**Severity:** HIGH  
**Pressure:** T0-026

A USER-originated semantic fact is not automatically a field override.

Example:

```text
SOURCE_DUE = Friday
USER_TARGET = Thursday
```

These facts coexist.

The user did not correct the external due. Therefore:

```text
USER_TARGET -> responsibility_temporal_facts
```

not:

```text
ResponsibilityFieldDecision(source_due = Thursday)
```

## Revised rule

`ResponsibilityFieldDecision` is for **accepted authority decisions about a semantic field**, such as explicit user correction/override of an interpretation or tracking field.

It is not:

- generic user-authored data storage;
- a second EAV copy of canonical state;
- the owner of `USER_TARGET` merely because USER supplied it.

### Schema guardrail

`field_key` should eventually be constrained to an explicit supported registry/union in trusted code. Do not permit arbitrary strings to turn this narrow authority table into generic EAV state.

---

# 5. PMA-B3-04 — REOPEN should not rewind child history

**Severity:** HIGH  
**Pressure:** T0-029

A prior action may have genuinely occurred even if the operational outcome was not ultimately satisfied.

Example:

```text
leg-send-original = SATISFIED
provider accepted send
later counterpart says attachment is unusable
```

Correct REOPEN behavior can be:

```text
Responsibility resolution_status: RESOLVED -> OPEN
preserve prior leg as SATISFIED
append new remedial leg: RESEND_USABLE_SIGNED_CONTRACT
```

Do not mechanically reset every old leg to OPEN.

This preserves:

- what actually happened;
- why the system previously considered the loop closed;
- current remedial action;
- evaluation/support history.

The aggregate is current-state + history, not a rewindable one-state task object.

---

# 6. PMA-B3-05 — ObligationLeg is not one row per verb

**Severity:** HIGH  
**Pressure:** T0-031

The instruction:

```text
review contract
then if acceptable sign and return
```

should not automatically create three workflow nodes/legs merely because it contains three verbs.

## Granularity rule

Create separate normalized obligation legs when independent bearer/actionability/closure/query pressure requires them.

A bounded, sequential, communication-local composite can remain one leg plus typed condition/constraint detail when that is the simplest faithful representation.

This avoids turning:

```text
ResponsibilityObligationLeg
```

into a generic workflow-node table.

### Falsifier

If later cases show the second step must be independently scheduled, authorized, queried, or concurrently updated before it becomes current, a separate contingent leg may be justified.

The physical model should follow demonstrated state pressure, not verb count.

---

# 7. PMA-B3-06 — One message creating multiple Responsibilities is cleanly representable

**Severity:** MEDIUM  
**Pressure:** T0-032

No new source-message join model is required solely because one message creates R1 and R2.

The existing candidate supports:

```text
one source_event/correlation
  -> CREATE R1
  -> CREATE R2

R1 provenance -> message m1 span A
R2 provenance -> message m1 span B
```

This confirms the usefulness of:

- multi-effect application commands;
- per-Responsibility domain-event rows;
- shared correlation/source event key;
- normalized provenance refs.

A dedicated many-to-many `message_responsibilities` table remains optional and should be added only if query pressure justifies it.

---

# 8. PMA-B3-07 — Outbound semantics do not require separate persistence machinery

**Severity:** MEDIUM  
**Pressure:** T0-003/T0-004

Outbound request/commitment cases fit the same core model:

```text
outbound REQUEST -> OTHER obligation / WAITING
outbound COMMITMENT -> USER obligation / MY_TURN
```

No `inbound_task` / `outbound_task` table or direction-specific lifecycle is justified.

Direction, speaker, bearer, provenance, account identity, and temporal semantics are enough.

Important temporal implication:

```text
SOURCE_DUE may apply to USER or OTHER obligation legs.
```

The physical temporal model must therefore link due facts to their semantic target rather than assume `SOURCE_DUE == user deadline`.

---

# 9. PMA-B3-08 — Responsibility row is already the operational episode

**Severity:** MEDIUM  
**Pressure:** T0-029/T0-030

The current model does not need a separate generic `episode` parent merely to distinguish:

```text
same outcome failed -> REOPEN R1
new work after genuine closure -> CREATE R2
```

The opaque Responsibility ID is the operational episode identity.

Potential future relation:

```text
related_to_responsibility_id
```

is not required for correctness and should not be added until product/query evidence proves value.

---

# 10. PMA-B3-09 — Missing context requires context revision, not invented state

**Severity:** CRITICAL  
**Pressure:** T0-043

A pre-admission review artifact must distinguish:

```text
source ambiguity
```

from:

```text
missing context that could resolve the source
```

The review item therefore needs enough revision/provenance linkage to support:

```text
initial context envelope incomplete
-> authorized context becomes available
-> re-evaluate candidate
-> TRACK / DO_NOT_TRACK / remain review
```

without rewriting the original message.

The exact physical choice may be:

```text
evidence_revision
context_revision
or one semantic evidence-set revision that includes authorized context membership
```

but the concurrency/idempotency rule must be explicit before schema freeze.

---

# 11. PMA-B3-10 — User-dependent admission does not justify a generic relationship engine

**Severity:** MEDIUM  
**Pressure:** T0-044

Some product admission decisions may legitimately depend on an authorized user convention for a sender/relationship.

This does not imply Responsibility should own:

```text
CRM relationship graph
organization hierarchy
universal politeness ontology
hidden-intent memory
```

The review item may reference authorized external/user-context evidence; the source communication remains immutable.

If a separate communication-preference model is later proven useful, it should remain an upstream admission context source rather than mutating source facts or becoming Responsibility canonical state.

---

# 12. Revised physical candidate after Batch 3

Preferred candidate boundary is now:

```text
# Accepted Responsibility aggregate
responsibilities
responsibility_obligation_legs
responsibility_expected_events
responsibility_temporal_facts
responsibility_field_decisions
responsibility_provenance_refs
responsibility_domain_events
responsibilities.semantic_details_jsonb

# Accepted pre-admission review state
responsibility_admission_reviews        # candidate name

# Separate inference/evidence systems
AI interpretation runs
Messages / Attachments / provider observations
Temporal Contracts / Triggers
Draft / SendOperation
```

The new review table is justified by an actual semantic boundary, not future workflow ambition.

---

# 13. Minimal AdmissionReview workload

Do not normalize more than demonstrated.

Required product operations are currently only:

```text
list unresolved Review candidates for one user/scope/account
open candidate and show reason/source
re-evaluate after authorized context/evidence revision
user resolves TRACK -> create Responsibility
user resolves DO_NOT_TRACK -> close/dismiss candidate
prevent stale/duplicate candidate application
preserve provenance/explanation
```

Not required:

```text
multi-stage approval workflow
review assignment queues across teams
SLA/escalation engine
arbitrary reviewer roles
collaboration comments/tasks
```

This keeps the new boundary narrow.

---

# 14. Schema-freeze impact

Batch 3 produces one material schema addition and several simplifications:

```text
ADD candidate pre-admission review persistence
KEEP FieldDecision but narrow it
KEEP hybrid details boundary
DO NOT add generic episode table
DO NOT add one leg per verb
DO NOT add direction-specific task tables
DO NOT add relationship/workflow engine
```

The physical model is stronger after this batch but still not frozen.

Remaining high-value falsifiers are primarily interpretation/admission cases:

```text
T0-005..008 commitment-force ladder
T0-011..013 preference/review/approval
T0-018..019 material request vs courtesy
T0-020..021 direct assignment vs CC
T0-022..025 quote/forward zoning
T0-042 sarcasm/non-literal ambiguity
```

If these cases do not require new accepted persistence structures, the next step should be a **schema-freeze review**, not continued invention of tables.