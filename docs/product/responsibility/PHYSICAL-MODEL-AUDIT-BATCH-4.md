# Responsibility Physical Model Adversarial Audit — Batch 4

## Status

**Accepted final Tier-0 falsifier audit of the v0.1 Responsibility persistence boundary.**

This audit applies the final sixteen detailed base oracles from `TIER-0-DETAILED-ORACLES-BATCH-4.md` to the hybrid physical model.

The goal is to detect whether any remaining core interpretation/admission case forces a new persisted entity, lifecycle state, or workflow abstraction before schema freeze review.

---

# 1. Audit verdict

Result:

```text
Accepted Responsibility aggregate                         KEEP
Pre-admission Review boundary                              KEEP
Normalized obligation legs                                KEEP
Normalized expected events                                KEEP + qualifier refinement
Normalized material temporal facts                        KEEP
FieldDecision narrow authority table                      KEEP
Typed/versioned local semantic details                    KEEP
Normalized provenance                                     KEEP + support-role refinement
Domain-event/idempotency boundary                         KEEP
New lifecycle state                                       REJECT
Commitment-force table/state                              REJECT
Recipient/CC ownership table                              REJECT
Sarcasm/sentiment workflow state                          REJECT
Generic assignment/relationship engine                    REJECT
Generic proposal/decision engine                          REJECT
```

No final Tier-0 case requires an additional persistence aggregate beyond the already justified AdmissionReview boundary.

The new pressure is metadata inside existing structures, not new structure count.

---

# 2. PMA-B4-01 — Commitment force is interpretation/expectation metadata, not lifecycle

**Severity:** HIGH  
**Pressure:** T0-005..008

The system must distinguish:

```text
FIRM COMMITMENT
PLAN
INTENTION
TENTATIVE INTENTION
CAPABILITY
```

but those distinctions do not justify:

```text
lifecycle_state = PLANNED | INTENDED | CAPABLE
```

or five separate obligation entity types.

## Persistence rule

When the distinction materially affects accepted waiting semantics, a pending expected event may carry a narrow qualifier such as:

```text
basis_kind
expectation_strength
```

Examples:

```text
"明日送る予定です"
-> expected event may have PLAN basis + date

"来週なら送れそうです"
-> capability evidence does not become a promised expected-event time
```

If a qualifier does not affect canonical workflow behavior, it may remain in accepted interpretation/provenance rather than being duplicated into Responsibility state.

### Guardrail

Do not persist every extracted linguistic nuance merely because the model can classify it.

---

# 3. PMA-B4-02 — Capability establishes a negative persistence boundary

**Severity:** HIGH

T0-008 proves:

```text
extracted temporal expression
!=
canonical TemporalFact
```

`来週なら` in a capability statement is temporal/feasibility context but not necessarily:

```text
SOURCE_DUE
EXPECTED_EVENT_TIME
USER_TARGET
```

Therefore `responsibility_temporal_facts` should contain **accepted material temporal semantics**, not every date-like span returned by the model.

This reduces false deadline/expectation creation and keeps the temporal table semantically strong.

---

# 4. PMA-B4-03 — Preference does not require a normalized preference entity

**Severity:** MEDIUM  
**Pressure:** T0-011

A preference can be relevant evidence during negotiation without becoming an agreed fact.

Current boundary remains sufficient:

```text
pending proposal/agreed fact details
+ accepted interpretation/provenance
```

Do not add:

```text
preferences table
opinion table
negotiation-term graph
```

unless a real product query/integration later requires independent identity.

---

# 5. PMA-B4-04 — Approval semantics do not move authorization into Responsibility

**Severity:** HIGH  
**Pressure:** T0-012/T0-013

`確認します` and `承認します` are semantically different.

But the fact that `承認します` is an approval utterance does not itself prove that the speaker has authority to satisfy an approval condition.

Therefore:

```text
communicative force
!=
field/event authority
```

The existing expected-event/evidence-authority/reducer boundary remains correct.

Do not add an organization/approval-role graph to Responsibility merely to satisfy this case. Trusted authority context belongs to the appropriate account/organization/security/domain source and is consumed during reduction.

---

# 6. PMA-B4-05 — DO_NOT_TRACK should normally leave no durable product-state row

**Severity:** HIGH  
**Pressure:** T0-019/T0-021/T0-023/T0-024

A determinate rejected candidate does not need:

```text
fake resolved Responsibility
or
AdmissionReview(status=DISMISSED)
```

merely for bookkeeping.

The model/inference run may remain for audit/eval according to retention policy.

Durable AdmissionReview is justified when:

- admission remains unresolved;
- the item must be surfaced/re-evaluated/user-resolved;
- product state must survive model reruns.

This prevents the new AdmissionReview boundary from becoming a generic archive of every non-task email.

---

# 7. PMA-B4-06 — Direct recipient/CC evidence stays upstream

**Severity:** MEDIUM/HIGH  
**Pressure:** T0-020/T0-021

Provider/message metadata already records:

```text
To
CC
participants
```

Canonical Responsibility state records an accepted obligation bearer only after interpretation/admission.

Do not add a persistent shortcut such as:

```text
recipient_is_owner
cc_implies_obligation
```

The same recipient metadata may support different responsibility conclusions depending on current authored language and context.

---

# 8. PMA-B4-07 — Provenance requires support roles for compositional evidence

**Severity:** HIGH  
**Pressure:** T0-022/T0-025

A current request can derive from multiple source zones:

```text
AUTHORED_CURRENT -> communicative force
QUOTED/FORWARDED -> object/referent/context
```

The existing normalized provenance table remains the right structure, but a reference should be able to identify its semantic support role when material.

Candidate refinement:

```text
ResponsibilityProvenanceReference {
  ...
  support_role?
}
```

Candidate roles are not frozen, but examples include:

```text
COMMUNICATIVE_FORCE
OBJECT_CONTEXT
TEMPORAL_SOURCE
AUTHORITY_SUPPORT
PROVIDER_OBSERVATION
CORRECTION_TARGET
```

### Why this matters

Without role information, explanation/re-evaluation may know that two spans were used but not **how** each span supported the accepted fact.

### Guardrail

Do not turn support roles into a generic knowledge graph. They are audit/reduction metadata.

---

# 9. PMA-B4-08 — Quoted/forwarded zoning needs no new persistence aggregate

**Severity:** MEDIUM  
**Pressure:** T0-022..025

Message normalization/zoning belongs to evidence/interpretation boundaries.

Responsibility persistence only needs accepted effects and provenance references back to those zones/spans.

No table such as:

```text
quoted_tasks
forwarded_tasks
```

is justified.

This preserves the important rule:

```text
source zone affects authority
but source zone is not workflow state
```

---

# 10. PMA-B4-09 — Sarcasm/non-literal ambiguity requires no special workflow state

**Severity:** HIGH  
**Pressure:** T0-042

When plausible literal/non-literal readings reverse whether a Responsibility exists, the existing pre-admission Review boundary is sufficient:

```text
AdmissionReview
  reason = PRAGMATIC_AMBIGUITY
  candidate readings/evidence
```

Do not add:

```text
sarcasm boolean on Responsibility
sentiment lifecycle
hidden-intent field
```

A model's confidence about sarcasm is not authority to create a firm obligation.

---

# 11. PMA-B4-10 — Projection equality does not justify semantic collapse

**Severity:** HIGH

T0-005/T0-006/T0-007 may all project `WAITING` in the supplied context.

That does **not** mean their communication semantics are identical.

Likewise two cases can share `MY_TURN` while differing in:

- source due vs user target;
- review vs safe verification;
- one vs multiple obligations.

Therefore persistence optimization must never infer:

```text
same UI bucket -> same canonical state
```

This is another reason not to store a single lifecycle/projection enum as truth.

---

# 12. PMA-B4-11 — Accepted-state sparsity is intentional

**Severity:** MEDIUM/HIGH

The final Tier-0 set demonstrates an important design property:

> Not every interpreted fact must be copied into canonical Responsibility persistence.

Examples:

```text
courtesy -> no Responsibility
capability temporal phrase -> may remain interpretation context
preference -> may remain evidence, not agreed fact
quoted historical request -> may remain provenance/context only
sarcasm candidates -> AdmissionReview, not Responsibility
```

This keeps the canonical aggregate smaller and reduces synchronization bugs between interpretation history and accepted product state.

The reducer should persist only semantics needed for current accepted behavior, explanation, correction, or future deterministic re-evaluation.

---

# 13. Revised logical persistence boundary after all 44 Tier-0 cases

The strongest current boundary is:

```text
# Accepted Responsibility state
responsibilities
responsibility_obligation_legs
responsibility_expected_events
responsibility_temporal_facts
responsibility_field_decisions
responsibility_provenance_refs
responsibility_domain_events
responsibilities.semantic_details_jsonb

# Accepted unresolved pre-admission product state
responsibility_admission_reviews       # name still candidate

# Separate probabilistic/evidence authorities
AI interpretation runs
Messages / Attachments / provider observations

# Separate durable operational authorities
Temporal Contracts / Triggers
Draft / SendOperation
```

Refinements before exact DDL:

```text
expected_events may need basis_kind / expectation_strength
provenance_refs may need support_role
field_decisions must use a constrained field registry
AdmissionReview must be idempotent and stale-safe
DomainEvent/source application must have mechanical idempotency
risk remains target-scoped; parent aggregate risk is derived only
```

---

# 14. Tier-0 structural falsifier result

Across all 44 detailed base cases plus 20 transition traces:

```text
required new Responsibility-side entity from Batch 4:     0
required new lifecycle enum/state machine:                 0
required generic workflow abstraction:                     0
required additional pre-admission aggregate after B3:      0
required field refinements in existing boundaries:         2 notable
```

The two notable refinements are:

1. expected-event basis/strength where material;
2. provenance support-role metadata.

Neither changes the aggregate architecture.

---

# 15. Audit conclusion

The remaining interpretation/admission cases failed to falsify the hybrid model.

The evidence now supports moving from:

```text
"candidate persistence architecture"
```

to a **logical persistence-boundary freeze review**.

That review should freeze only:

- aggregate/table responsibilities;
- authority boundaries;
- normalized-vs-typed-details boundary;
- critical concurrency/idempotency invariants;

while leaving exact:

- SQL column names/types;
- enum labels/cardinality;
- index set;
- JSON schema details;
- query implementation;

for a separate DDL design/review step.