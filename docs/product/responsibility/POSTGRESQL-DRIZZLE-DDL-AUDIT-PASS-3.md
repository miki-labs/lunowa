# Responsibility PostgreSQL / Drizzle DDL Audit — Pass 3

## Status

**v0.3 is structurally sound at the Responsibility boundary, but two final cross-system contracts must be hardened before declaring static L2 review complete. No new table/aggregate is required.**

Pass 3 focuses on boundaries that are easy to miss after the relational model itself looks correct:

```text
AI context snapshot freshness
cross-user AIInterpretationRun references
```

---

# 1. A14 — basis revision must actually describe the context sent to AI

**Severity:** CRITICAL runtime contract; no new table required

v0.3 correctly adds Conversation `semantic_evidence_revision` and validates it before applying an AI result.

That check is meaningful only if the `basis_evidence_revision` stored on an `AIInterpretationRun` actually corresponds to the exact authorized context captured for that run.

Bad context-build sequence:

```text
read Conversation revision = 17
new message commits -> revision 18
read messages, accidentally including some rev18 evidence
send mixed context but label basis_revision=17
```

or the reverse:

```text
read messages at rev17
new message commits -> rev18
read revision = 18
label old context as rev18
```

Later equality checks cannot detect either mislabeled snapshot.

## Required runtime correction

Context capture must use one of these equivalent patterns:

```text
A. lock Conversation in a short DB transaction,
   read semantic_evidence_revision + authorized context under that lock,
   persist AIInterpretationRun input manifest/basis, release lock, then call model

B. read context under a consistent transaction/snapshot and re-read/verify
   semantic_evidence_revision before persisting the run as based on that revision
```

Do not hold a database lock across the remote model call.

The persisted run should retain at minimum the basis revision and enough input-manifest identity/versioning for debugging/eval without duplicating unrestricted message content.

Add executable test:

```text
57. concurrent evidence arrival cannot produce an AI run whose basis revision labels a mixed/incorrect context snapshot
```

---

# 2. A15 — AIInterpretationRun foreign keys need tenant integrity

**Severity:** HIGH

The schema now mechanically protects:

```text
Responsibility account ownership
participant ownership
Message provenance account ownership
```

but a bare:

```text
interpretation_run_id REFERENCES ai_interpretation_runs(id)
```

can still associate one user's Responsibility/Review/audit history with another user's AI run if trusted code passes the wrong UUID.

AI runs are non-authoritative, but cross-user trace linkage is still a privacy/audit defect and cheap to prevent because `AIInterpretationRun` already belongs to `user_id` conceptually.

## Required correction

Expose upstream:

```sql
ai_interpretation_runs UNIQUE (id, user_id)
responsibility_admission_reviews UNIQUE (id, user_id)
```

Duplicate `user_id` where an audit row references an AI run:

```text
responsibility_domain_events.user_id
responsibility_provenance_refs.user_id
```

Then use composite FKs:

```text
DomainEvent (responsibility_id,user_id) -> Responsibility(id,user_id)
DomainEvent (interpretation_run_id,user_id) -> AIInterpretationRun(id,user_id)

AdmissionReview (interpretation_run_id,user_id) -> AIInterpretationRun(id,user_id)

Provenance (owner_id,user_id) -> owner(id,user_id)
Provenance (interpretation_run_id,user_id) -> AIInterpretationRun(id,user_id)
```

`user_id` remains redundant tenant-integrity data, not an independent source of ownership truth.

Add executable tests:

```text
58. another user's AIInterpretationRun cannot be linked to AdmissionReview
59. another user's AIInterpretationRun cannot be linked to Responsibility DomainEvent
60. another user's AIInterpretationRun cannot be linked to Responsibility/Review provenance
```

---

# 3. Same-conversation provenance decision

Pass 3 explicitly considered adding `conversation_id` to every provenance row so Message provenance could be DB-limited to the owner's Conversation.

**Decision: do not add it in L2 v0.1.**

Reason:

- v0.1 matching keeps one Responsibility owned by one Conversation;
- ordinary interpretation context is Conversation-local;
- however trusted `authorized_external_context` may legitimately supply evidence not itself stored as a Message in that Conversation;
- the high-harm privacy boundary is account/user isolation, which is mechanically enforced;
- forcing every evidence reference to the same Conversation would prematurely constrain future explicitly-authorized context without improving the canonical Responsibility identity model.

The reducer/context builder must still reject unrelated Message use according to the authorized ContextEnvelope. Cross-thread identity remains OPEN and is not silently enabled by provenance flexibility.

---

# 4. Remaining application-only boundaries accepted after review

The following are intentionally not moved into SQL triggers/generalized constraints:

```text
when semantic_evidence_revision advances
AI ContextEnvelope authorization/content membership
semantic chronology/correction authority
ExpectedEvent satisfaction authority
high-risk safe-action policy
TemporalContract validity for DEFERRED attention
semantic_details deep validation
field/action/event code registries
provider_observation_key account validation
```

Each has a narrower trusted-code/test boundary than a DB trigger/workflow engine would provide.

---

# 5. Pass-3 verdict

After applying A15 to the concrete DDL and recording A14 in the runtime acceptance contract:

```text
new Responsibility table/aggregate needed     NO
new lifecycle state needed                    NO
same-parent integrity                         PASS
CREATE idempotency                            PASS at design level
AdmissionReview stale safety                  PASS at design level
Conversation stale-CREATE boundary            PASS at design level
cross-user external FK integrity              PASS after A15 correction
AI context snapshot correctness               RUNTIME TEST REQUIRED
static L2 structural design                    READY FOR FINAL RECHECK
PostgreSQL executable proof                    STILL REQUIRED
migrations                                     NOT AUTHORIZED
```

The next move after A15 is a final static checklist/reconciliation, then an executable PostgreSQL/Drizzle spike. Further speculative table invention is no longer justified.