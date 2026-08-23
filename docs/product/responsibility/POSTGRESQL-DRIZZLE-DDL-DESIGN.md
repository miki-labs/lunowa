# Responsibility PostgreSQL / Drizzle DDL Design v0.1

## Status

**L2 candidate — exact column/constraint/index design for independent review. NOT migration authority until `POSTGRESQL-DRIZZLE-DDL-AUDIT.md` passes and the L2 freeze decision is recorded.**

This document turns the frozen L0/L1 Responsibility model into a concrete PostgreSQL 18 / Drizzle schema proposal.

It deliberately distinguishes:

```text
L0 semantic truth
L1 logical persistence boundary
L2 concrete PostgreSQL/Drizzle representation   <- this document
L3 migration/runtime implementation
```

The goal is not to maximize database cleverness. The goal is the smallest concrete schema that:

- preserves every validated Responsibility invariant;
- makes high-harm corruption mechanically difficult where PostgreSQL can help;
- keeps normal product queries straightforward;
- remains evolvable for a solo developer;
- avoids both a giant semantic JSON blob and table-per-nuance over-normalization.

Primary sources:

- `PHYSICAL-SCHEMA-FREEZE-REVIEW.md`;
- ADR 0008 and ADR 0009;
- `SCENARIO-SCHEMA.md` / `TRANSITION-SCHEMA.md`;
- all 44 Tier-0 detailed oracles;
- all 20 transition oracles;
- `DATA-MODEL.md` / `CONTRACTS.md`.

---

# 1. Current platform facts checked for L2

L2 relies only on ordinary PostgreSQL/Drizzle capabilities:

- PostgreSQL 18 is the accepted datastore and Neon supports PostgreSQL 18;
- PostgreSQL provides native UUID storage and `gen_random_uuid()`;
- PostgreSQL supports `CHECK`, foreign keys, partial indexes, partial unique indexes, and `NULLS NOT DISTINCT` uniqueness;
- Drizzle supports PostgreSQL UUID/JSONB/timestamps, checks, indexes, partial-index predicates, and transactions;
- Drizzle's TypeScript `text({ enum: [...] })` typing alone is not a database runtime constraint, so all safety-relevant finite states below also get explicit PostgreSQL `CHECK` constraints;
- Drizzle transactions support PostgreSQL isolation configuration, and raw `sql` can be used where row-locking or exact SQL is clearer.

This design intentionally does **not** depend on Neon-only database semantics or a PostgreSQL extension.

---

# 2. ID strategy

## 2.1 Decision

Use PostgreSQL `uuid` for application/domain entity identifiers involved in Phase 2.

For Lunowa-owned rows, the default is:

```sql
uuid NOT NULL DEFAULT gen_random_uuid()
```

Do not make timestamp extraction from IDs part of domain behavior; `created_at` remains authoritative for time.

## 2.2 Better Auth integration prerequisite

The exact DDL assumes the Better Auth application user ID is also stored as PostgreSQL `uuid`.

Before the first migration, configure/verify the current Better Auth PostgreSQL/Drizzle integration to use its supported UUID ID strategy rather than relying on an opaque default string-ID format.

Reason:

- keeps ownership FKs type-consistent;
- avoids a permanent text-ID dependency created accidentally by auth defaults;
- Better Auth currently exposes explicit UUID ID generation support for PostgreSQL.

If the auth spike falsifies this assumption, stop the L2 freeze and revise `user_id` consistently before migrations. Do **not** mix a migrated Responsibility schema with an unreviewed auth-ID conversion.

---

# 3. Type strategy: text + CHECK, not PostgreSQL native ENUM

For small control-state sets whose values are part of v0.1 invariants, use:

```text
text column
+ explicit CHECK (... IN (...))
+ TypeScript literal-union typing in Drizzle/application code
```

Do **not** use PostgreSQL native ENUM for Responsibility control state in v0.1.

Rationale:

- these labels are versioned product semantics and may still be renamed/split as real inbox evidence arrives;
- PostgreSQL enum values are convenient for static sets but removal/reordering requires type recreation;
- text + CHECK still gives database enforcement while keeping migrations straightforward;
- linguistic/action/reason taxonomies that are expected to evolve should remain trusted-code registries rather than giant CHECK lists.

Database CHECK sets are therefore reserved for **structural control state**, not every semantic code.

---

# 4. Timestamp and JSON conventions

## 4.1 Instants

Use:

```sql
timestamp(3) with time zone
```

for persisted instants.

Millisecond precision matches the ordinary JavaScript `Date` boundary and avoids pretending that application-generated timestamps have meaningful microsecond precision.

## 4.2 Date-only semantics

A source date such as `金曜まで` must not become midnight in a timezone.

Use PostgreSQL `date` when the accepted value is date-only.

## 4.3 JSONB

Use JSONB only for the frozen aggregate-local semantic-details boundary and bounded audit/candidate summaries.

Every trusted JSONB write must be runtime-schema validated.

At the database boundary, enforce at minimum:

```text
JSON top-level object where an object is required
explicit adjacent schema/version column
```

Do not store provider raw payloads, credentials, or raw model prose in canonical semantic JSON.

---

# 5. External FK prerequisites

The Responsibility schema assumes these existing Phase-2 entities use UUID primary keys:

```text
connected_accounts.id
conversations.id
participant_identities.id
messages.id
ai_interpretation_runs.id
```

To mechanically prevent account/conversation ownership mismatch, Phase 2 should expose these additional unique keys:

```sql
connected_accounts UNIQUE (id, user_id)
conversations      UNIQUE (id, connected_account_id)
```

Then `responsibilities` and `responsibility_admission_reviews` can use composite FKs:

```text
(connected_account_id, user_id)
    -> connected_accounts(id, user_id)

(conversation_id, connected_account_id)
    -> conversations(id, connected_account_id)
```

This costs small redundant unique indexes but makes a high-harm cross-account mismatch structurally harder to persist.

If the broader Phase-2 schema chooses another equivalent ownership-enforcement mechanism, it must be reviewed before changing these FKs.

---

# 6. Concrete table set

L2 proposes exactly these Responsibility-owned tables:

```text
responsibilities
responsibility_obligation_legs
responsibility_expected_events
responsibility_temporal_facts
responsibility_field_decisions
responsibility_provenance_refs
responsibility_domain_events
responsibility_admission_reviews
```

No additional normalized table is introduced for:

```text
completion criteria
constraints
proposals
agreements
uncertainties
ANY_OF assignment
sarcasm
commitment force
projection bucket
```

Those remain typed local detail / upstream interpretation as established by L1.

---

# 7. `responsibilities`

## 7.1 Exact columns

```sql
CREATE TABLE responsibilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL,
  connected_account_id uuid NOT NULL,
  conversation_id uuid NOT NULL,

  operational_outcome text NOT NULL,

  resolution_status text NOT NULL DEFAULT 'OPEN',
  resolution_reason text,
  live_tracking_state text NOT NULL DEFAULT 'TRACKING_ACTIVE',
  attention_mode text NOT NULL DEFAULT 'PRESENT',

  semantic_details_version smallint NOT NULL DEFAULT 1,
  semantic_details jsonb NOT NULL DEFAULT '{}'::jsonb,

  evidence_revision bigint NOT NULL DEFAULT 0,
  aggregate_version bigint NOT NULL DEFAULT 1,

  resolved_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibilities_operational_outcome_nonempty
    CHECK (char_length(btrim(operational_outcome)) BETWEEN 1 AND 2048),

  CONSTRAINT responsibilities_resolution_status_check
    CHECK (resolution_status IN ('OPEN', 'RESOLVED')),

  CONSTRAINT responsibilities_resolution_reason_check
    CHECK (
      resolution_reason IS NULL
      OR resolution_reason IN (
        'SATISFIED',
        'DECLINED',
        'CANCELLED',
        'SUPERSEDED',
        'USER_CLOSED',
        'INVALIDATED',
        'DUPLICATE'
      )
    ),

  CONSTRAINT responsibilities_resolution_consistency_check
    CHECK (
      (
        resolution_status = 'OPEN'
        AND resolution_reason IS NULL
        AND resolved_at IS NULL
      )
      OR
      (
        resolution_status = 'RESOLVED'
        AND resolution_reason IS NOT NULL
        AND resolved_at IS NOT NULL
      )
    ),

  CONSTRAINT responsibilities_live_tracking_state_check
    CHECK (live_tracking_state IN ('TRACKING_ACTIVE', 'HISTORICAL_INACTIVE')),

  CONSTRAINT responsibilities_attention_mode_check
    CHECK (attention_mode IN ('PRESENT', 'DEFERRED')),

  CONSTRAINT responsibilities_deferred_state_check
    CHECK (
      attention_mode <> 'DEFERRED'
      OR (
        resolution_status = 'OPEN'
        AND live_tracking_state = 'TRACKING_ACTIVE'
      )
    ),

  CONSTRAINT responsibilities_historical_attention_check
    CHECK (
      live_tracking_state <> 'HISTORICAL_INACTIVE'
      OR attention_mode = 'PRESENT'
    ),

  CONSTRAINT responsibilities_semantic_details_version_check
    CHECK (semantic_details_version >= 1),

  CONSTRAINT responsibilities_semantic_details_object_check
    CHECK (jsonb_typeof(semantic_details) = 'object'),

  CONSTRAINT responsibilities_evidence_revision_check
    CHECK (evidence_revision >= 0),

  CONSTRAINT responsibilities_aggregate_version_check
    CHECK (aggregate_version >= 1),

  CONSTRAINT responsibilities_account_owner_fk
    FOREIGN KEY (connected_account_id, user_id)
    REFERENCES connected_accounts (id, user_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibilities_conversation_account_fk
    FOREIGN KEY (conversation_id, connected_account_id)
    REFERENCES conversations (id, connected_account_id)
    ON DELETE RESTRICT
);
```

## 7.2 Deliberately absent columns

Do not add:

```text
lifecycle_state
next_owner
BOTH
deadline_at
follow_up_state
uncertain_state
completed boolean
safe_next_action
projection_bucket
```

The first seven violate L0/L1. The last two remain derived/policy output until measured query pressure justifies a rebuildable cache.

## 7.3 Parent indexes

```sql
CREATE INDEX responsibilities_live_open_user_idx
  ON responsibilities (user_id, updated_at DESC, id)
  WHERE live_tracking_state = 'TRACKING_ACTIVE'
    AND resolution_status = 'OPEN';

CREATE INDEX responsibilities_live_done_user_idx
  ON responsibilities (user_id, resolved_at DESC, id)
  WHERE live_tracking_state = 'TRACKING_ACTIVE'
    AND resolution_status = 'RESOLVED';

CREATE INDEX responsibilities_conversation_idx
  ON responsibilities (conversation_id, created_at, id);

CREATE INDEX responsibilities_account_updated_idx
  ON responsibilities (connected_account_id, updated_at DESC, id);
```

No index on `semantic_details` is created in v0.1.

---

# 8. `responsibility_expected_events`

Expected events are created before any obligation leg that uses them as an activation condition. This avoids a cyclic FK design.

```sql
CREATE TABLE responsibility_expected_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL
    REFERENCES responsibilities(id) ON DELETE CASCADE,

  actor_kind text NOT NULL,
  actor_participant_id uuid,

  event_code text NOT NULL,
  event_summary text,

  event_status text NOT NULL DEFAULT 'PENDING',
  closure_reason text,

  basis_kind text,
  expectation_strength text,

  satisfied_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_expected_events_actor_kind_check
    CHECK (actor_kind IN ('PARTICIPANT', 'EXTERNAL')),

  CONSTRAINT responsibility_expected_events_actor_reference_check
    CHECK (
      (actor_kind = 'PARTICIPANT' AND actor_participant_id IS NOT NULL)
      OR
      (actor_kind = 'EXTERNAL' AND actor_participant_id IS NULL)
    ),

  CONSTRAINT responsibility_expected_events_status_check
    CHECK (event_status IN ('PENDING', 'CLOSED')),

  CONSTRAINT responsibility_expected_events_closure_check
    CHECK (
      (event_status = 'PENDING' AND closure_reason IS NULL AND satisfied_at IS NULL)
      OR
      (event_status = 'CLOSED' AND closure_reason IS NOT NULL)
    ),

  CONSTRAINT responsibility_expected_events_event_code_nonempty
    CHECK (char_length(btrim(event_code)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_expected_events_summary_length
    CHECK (event_summary IS NULL OR char_length(event_summary) <= 1024),

  CONSTRAINT responsibility_expected_events_participant_fk
    FOREIGN KEY (actor_participant_id)
    REFERENCES participant_identities(id)
    ON DELETE RESTRICT
);
```

`closure_reason` is a trusted-code registry rather than a DB enum because event classes are expected to evolve. Example values include `SATISFIED`, `CANCELLED`, `INVALIDATED`, and `SUPERSEDED`.

Indexes:

```sql
CREATE INDEX responsibility_expected_events_pending_idx
  ON responsibility_expected_events (responsibility_id, actor_kind, id)
  WHERE event_status = 'PENDING';

CREATE INDEX responsibility_expected_events_actor_idx
  ON responsibility_expected_events (actor_participant_id, responsibility_id)
  WHERE actor_participant_id IS NOT NULL;
```

---

# 9. `responsibility_obligation_legs`

```sql
CREATE TABLE responsibility_obligation_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL
    REFERENCES responsibilities(id) ON DELETE CASCADE,

  bearer_kind text NOT NULL,
  bearer_participant_id uuid,

  action_code text NOT NULL,
  action_summary text,
  object_summary text,

  leg_status text NOT NULL DEFAULT 'OPEN',
  closure_reason text,
  actionability text NOT NULL DEFAULT 'ACTIONABLE',

  basis_kind text NOT NULL,
  authority_status text,

  activation_event_id uuid
    REFERENCES responsibility_expected_events(id) ON DELETE RESTRICT,

  closed_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_obligation_legs_bearer_kind_check
    CHECK (bearer_kind IN ('USER', 'PARTICIPANT')),

  CONSTRAINT responsibility_obligation_legs_bearer_reference_check
    CHECK (
      (bearer_kind = 'USER' AND bearer_participant_id IS NULL)
      OR
      (bearer_kind = 'PARTICIPANT' AND bearer_participant_id IS NOT NULL)
    ),

  CONSTRAINT responsibility_obligation_legs_status_check
    CHECK (leg_status IN ('OPEN', 'CLOSED')),

  CONSTRAINT responsibility_obligation_legs_closure_check
    CHECK (
      (leg_status = 'OPEN' AND closure_reason IS NULL AND closed_at IS NULL)
      OR
      (leg_status = 'CLOSED' AND closure_reason IS NOT NULL AND closed_at IS NOT NULL)
    ),

  CONSTRAINT responsibility_obligation_legs_actionability_check
    CHECK (actionability IN ('ACTIONABLE', 'BLOCKED')),

  CONSTRAINT responsibility_obligation_legs_action_code_nonempty
    CHECK (char_length(btrim(action_code)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_obligation_legs_basis_kind_nonempty
    CHECK (char_length(btrim(basis_kind)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_obligation_legs_summary_length
    CHECK (action_summary IS NULL OR char_length(action_summary) <= 1024),

  CONSTRAINT responsibility_obligation_legs_object_length
    CHECK (object_summary IS NULL OR char_length(object_summary) <= 1024),

  CONSTRAINT responsibility_obligation_legs_participant_fk
    FOREIGN KEY (bearer_participant_id)
    REFERENCES participant_identities(id)
    ON DELETE RESTRICT
);
```

Indexes:

```sql
CREATE INDEX responsibility_obligation_legs_open_projection_idx
  ON responsibility_obligation_legs
    (responsibility_id, bearer_kind, actionability, id)
  WHERE leg_status = 'OPEN';

CREATE INDEX responsibility_obligation_legs_activation_event_idx
  ON responsibility_obligation_legs (activation_event_id, responsibility_id)
  WHERE activation_event_id IS NOT NULL;

CREATE INDEX responsibility_obligation_legs_participant_idx
  ON responsibility_obligation_legs (bearer_participant_id, responsibility_id)
  WHERE bearer_participant_id IS NOT NULL;
```

### 9.1 Cross-aggregate activation invariant

If `activation_event_id` is present, trusted code must verify that the referenced event belongs to the **same Responsibility** before commit.

A conventional FK proves the event exists but cannot itself prove same-parent ownership without duplicating `responsibility_id` into a composite FK target. The L2 audit must decide whether the extra composite FK is worth the added index/DDL complexity.

---

# 10. `responsibility_temporal_facts`

Temporal values preserve date-only vs exact-instant semantics and permit unresolved/conflicting candidates.

```sql
CREATE TABLE responsibility_temporal_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL
    REFERENCES responsibilities(id) ON DELETE CASCADE,

  temporal_kind text NOT NULL,

  obligation_leg_id uuid
    REFERENCES responsibility_obligation_legs(id) ON DELETE CASCADE,
  expected_event_id uuid
    REFERENCES responsibility_expected_events(id) ON DELETE CASCADE,

  original_expression text,

  value_kind text NOT NULL,
  resolved_date date,
  resolved_at timestamp(3) with time zone,
  precision_code text NOT NULL,
  reference_timezone text,

  anchor_kind text,
  anchor_reference text,
  anchor_offset_seconds integer,

  currentness_status text NOT NULL DEFAULT 'ACCEPTED_CURRENT',
  authority_status text,

  superseded_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_temporal_facts_kind_check
    CHECK (temporal_kind IN ('SOURCE_DUE', 'EXPECTED_EVENT_TIME', 'USER_TARGET')),

  CONSTRAINT responsibility_temporal_facts_single_target_check
    CHECK (NOT (obligation_leg_id IS NOT NULL AND expected_event_id IS NOT NULL)),

  CONSTRAINT responsibility_temporal_facts_value_kind_check
    CHECK (value_kind IN ('DATE', 'INSTANT', 'UNRESOLVED')),

  CONSTRAINT responsibility_temporal_facts_value_shape_check
    CHECK (
      (value_kind = 'DATE' AND resolved_date IS NOT NULL AND resolved_at IS NULL)
      OR
      (value_kind = 'INSTANT' AND resolved_date IS NULL AND resolved_at IS NOT NULL)
      OR
      (value_kind = 'UNRESOLVED' AND resolved_date IS NULL AND resolved_at IS NULL)
    ),

  CONSTRAINT responsibility_temporal_facts_precision_nonempty
    CHECK (char_length(btrim(precision_code)) BETWEEN 1 AND 64),

  CONSTRAINT responsibility_temporal_facts_currentness_check
    CHECK (
      currentness_status IN (
        'ACCEPTED_CURRENT',
        'CONFLICT_CANDIDATE',
        'SUPERSEDED',
        'HISTORICAL'
      )
    ),

  CONSTRAINT responsibility_temporal_facts_superseded_time_check
    CHECK (
      currentness_status <> 'SUPERSEDED'
      OR superseded_at IS NOT NULL
    ),

  CONSTRAINT responsibility_temporal_facts_anchor_shape_check
    CHECK (
      (anchor_kind IS NULL AND anchor_reference IS NULL AND anchor_offset_seconds IS NULL)
      OR
      (anchor_kind IS NOT NULL AND anchor_reference IS NOT NULL)
    )
);
```

### 10.1 Current-value uniqueness

One accepted current value is allowed per Responsibility + semantic target + temporal kind, but conflict candidates may coexist.

Use three partial unique indexes rather than one nullable-key shortcut:

```sql
CREATE UNIQUE INDEX responsibility_temporal_current_parent_uq
  ON responsibility_temporal_facts (responsibility_id, temporal_kind)
  WHERE currentness_status = 'ACCEPTED_CURRENT'
    AND obligation_leg_id IS NULL
    AND expected_event_id IS NULL;

CREATE UNIQUE INDEX responsibility_temporal_current_leg_uq
  ON responsibility_temporal_facts
    (responsibility_id, temporal_kind, obligation_leg_id)
  WHERE currentness_status = 'ACCEPTED_CURRENT'
    AND obligation_leg_id IS NOT NULL
    AND expected_event_id IS NULL;

CREATE UNIQUE INDEX responsibility_temporal_current_event_uq
  ON responsibility_temporal_facts
    (responsibility_id, temporal_kind, expected_event_id)
  WHERE currentness_status = 'ACCEPTED_CURRENT'
    AND expected_event_id IS NOT NULL
    AND obligation_leg_id IS NULL;
```

This permits multiple `CONFLICT_CANDIDATE` rows for T0-028 while preventing two accepted-current values for the same target/kind.

### 10.2 Sorting/query indexes

```sql
CREATE INDEX responsibility_temporal_current_date_idx
  ON responsibility_temporal_facts
    (temporal_kind, resolved_date, responsibility_id)
  WHERE currentness_status = 'ACCEPTED_CURRENT'
    AND value_kind = 'DATE';

CREATE INDEX responsibility_temporal_current_instant_idx
  ON responsibility_temporal_facts
    (temporal_kind, resolved_at, responsibility_id)
  WHERE currentness_status = 'ACCEPTED_CURRENT'
    AND value_kind = 'INSTANT';

CREATE INDEX responsibility_temporal_conflict_idx
  ON responsibility_temporal_facts
    (responsibility_id, temporal_kind, id)
  WHERE currentness_status = 'CONFLICT_CANDIDATE';
```

### 10.3 Same-parent target invariant

Trusted reduction must verify that `obligation_leg_id` / `expected_event_id`, when present, belongs to the same `responsibility_id`.

The audit must decide whether to add composite same-parent FKs.

---

# 11. `responsibility_field_decisions`

This table is a narrow **current authority-decision materialization**, not generic state storage.

```sql
CREATE TABLE responsibility_field_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL
    REFERENCES responsibilities(id) ON DELETE CASCADE,

  field_key text NOT NULL,
  value_schema_version smallint NOT NULL DEFAULT 1,
  value_jsonb jsonb NOT NULL,

  authority_kind text NOT NULL,
  basis_evidence_revision bigint NOT NULL,

  decision_status text NOT NULL DEFAULT 'ACTIVE',

  superseded_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_field_decisions_field_key_nonempty
    CHECK (char_length(btrim(field_key)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_field_decisions_value_version_check
    CHECK (value_schema_version >= 1),

  CONSTRAINT responsibility_field_decisions_basis_revision_check
    CHECK (basis_evidence_revision >= 0),

  CONSTRAINT responsibility_field_decisions_status_check
    CHECK (decision_status IN ('ACTIVE', 'SUPERSEDED')),

  CONSTRAINT responsibility_field_decisions_superseded_check
    CHECK (
      (decision_status = 'ACTIVE' AND superseded_at IS NULL)
      OR
      (decision_status = 'SUPERSEDED' AND superseded_at IS NOT NULL)
    )
);
```

Enforce at most one active accepted decision per field:

```sql
CREATE UNIQUE INDEX responsibility_field_decisions_active_uq
  ON responsibility_field_decisions (responsibility_id, field_key)
  WHERE decision_status = 'ACTIVE';
```

`field_key` and `authority_kind` must be trusted-code allowlists. They are intentionally not PostgreSQL enums because the supported correction surface should stay small and explicit without turning this table into EAV.

No generic product API may write an arbitrary `field_key`.

---

# 12. `responsibility_admission_reviews`

AdmissionReview is product state **before** Responsibility existence has been accepted.

```sql
CREATE TABLE responsibility_admission_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL,
  connected_account_id uuid NOT NULL,
  conversation_id uuid NOT NULL,

  review_status text NOT NULL DEFAULT 'OPEN',
  resolution text,

  reason_codes text[] NOT NULL DEFAULT ARRAY[]::text[],

  candidate_schema_version smallint NOT NULL DEFAULT 1,
  candidate_summary jsonb NOT NULL DEFAULT '{}'::jsonb,

  evidence_revision bigint NOT NULL,
  aggregate_version bigint NOT NULL DEFAULT 1,

  source_event_key text NOT NULL,
  candidate_key text NOT NULL,
  interpretation_run_id uuid,

  admitted_responsibility_id uuid
    REFERENCES responsibilities(id) ON DELETE SET NULL,

  resolved_by_actor_kind text,
  resolved_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_admission_reviews_status_check
    CHECK (review_status IN ('OPEN', 'RESOLVED')),

  CONSTRAINT responsibility_admission_reviews_resolution_check
    CHECK (resolution IS NULL OR resolution IN ('TRACK', 'DO_NOT_TRACK')),

  CONSTRAINT responsibility_admission_reviews_resolution_shape_check
    CHECK (
      (
        review_status = 'OPEN'
        AND resolution IS NULL
        AND admitted_responsibility_id IS NULL
        AND resolved_at IS NULL
      )
      OR
      (
        review_status = 'RESOLVED'
        AND resolution = 'DO_NOT_TRACK'
        AND admitted_responsibility_id IS NULL
        AND resolved_at IS NOT NULL
      )
      OR
      (
        review_status = 'RESOLVED'
        AND resolution = 'TRACK'
        AND admitted_responsibility_id IS NOT NULL
        AND resolved_at IS NOT NULL
      )
    ),

  CONSTRAINT responsibility_admission_reviews_candidate_object_check
    CHECK (jsonb_typeof(candidate_summary) = 'object'),

  CONSTRAINT responsibility_admission_reviews_candidate_version_check
    CHECK (candidate_schema_version >= 1),

  CONSTRAINT responsibility_admission_reviews_evidence_revision_check
    CHECK (evidence_revision >= 0),

  CONSTRAINT responsibility_admission_reviews_aggregate_version_check
    CHECK (aggregate_version >= 1),

  CONSTRAINT responsibility_admission_reviews_source_event_key_check
    CHECK (char_length(btrim(source_event_key)) BETWEEN 1 AND 512),

  CONSTRAINT responsibility_admission_reviews_candidate_key_check
    CHECK (char_length(btrim(candidate_key)) BETWEEN 1 AND 256),

  CONSTRAINT responsibility_admission_reviews_account_owner_fk
    FOREIGN KEY (connected_account_id, user_id)
    REFERENCES connected_accounts (id, user_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_admission_reviews_conversation_account_fk
    FOREIGN KEY (conversation_id, connected_account_id)
    REFERENCES conversations (id, connected_account_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_admission_reviews_interpretation_run_fk
    FOREIGN KEY (interpretation_run_id)
    REFERENCES ai_interpretation_runs(id)
    ON DELETE SET NULL
);
```

Only one unresolved product Review candidate is allowed for the same trusted source/candidate identity:

```sql
CREATE UNIQUE INDEX responsibility_admission_reviews_open_source_candidate_uq
  ON responsibility_admission_reviews
    (connected_account_id, source_event_key, candidate_key)
  WHERE review_status = 'OPEN';
```

Indexes:

```sql
CREATE INDEX responsibility_admission_reviews_open_user_idx
  ON responsibility_admission_reviews (user_id, created_at DESC, id)
  WHERE review_status = 'OPEN';

CREATE INDEX responsibility_admission_reviews_conversation_idx
  ON responsibility_admission_reviews (conversation_id, created_at DESC, id);
```

A resolved prior Review row may coexist with a later new Review for the same source/candidate if genuinely new evidence/policy explicitly warrants a new review episode. Product logic must never reopen a user-resolved decision merely because a stale model reruns.

---

# 13. `responsibility_domain_events`

This is append-only semantic-effect history and the primary mechanical idempotency boundary for Responsibility reducer applications.

```sql
CREATE TABLE responsibility_domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL
    REFERENCES responsibilities(id) ON DELETE CASCADE,

  operation text NOT NULL,
  actor_kind text NOT NULL,
  reason_codes text[] NOT NULL DEFAULT ARRAY[]::text[],

  basis_evidence_revision bigint NOT NULL,
  aggregate_version_before bigint NOT NULL,
  aggregate_version_after bigint NOT NULL,
  mutates_state boolean NOT NULL,

  source_event_key text NOT NULL,
  application_key text NOT NULL,
  effect_key text NOT NULL,
  correlation_id uuid NOT NULL,

  reducer_version text NOT NULL,
  interpretation_run_id uuid,

  change_summary jsonb NOT NULL DEFAULT '{}'::jsonb,

  occurred_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_domain_events_operation_check
    CHECK (
      operation IN (
        'CREATE',
        'UPDATE',
        'RESOLVE',
        'REOPEN',
        'SUPERSEDE',
        'INVALIDATE',
        'NO_OP'
      )
    ),

  CONSTRAINT responsibility_domain_events_revision_check
    CHECK (basis_evidence_revision >= 0),

  CONSTRAINT responsibility_domain_events_version_check
    CHECK (
      aggregate_version_before >= 0
      AND aggregate_version_after >= 1
      AND (
        (mutates_state AND aggregate_version_after = aggregate_version_before + 1)
        OR
        (NOT mutates_state AND aggregate_version_after = aggregate_version_before)
      )
    ),

  CONSTRAINT responsibility_domain_events_source_key_check
    CHECK (char_length(btrim(source_event_key)) BETWEEN 1 AND 512),

  CONSTRAINT responsibility_domain_events_application_key_check
    CHECK (char_length(btrim(application_key)) BETWEEN 1 AND 512),

  CONSTRAINT responsibility_domain_events_effect_key_check
    CHECK (char_length(btrim(effect_key)) BETWEEN 1 AND 256),

  CONSTRAINT responsibility_domain_events_reducer_version_check
    CHECK (char_length(btrim(reducer_version)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_domain_events_change_summary_object_check
    CHECK (jsonb_typeof(change_summary) = 'object'),

  CONSTRAINT responsibility_domain_events_interpretation_run_fk
    FOREIGN KEY (interpretation_run_id)
    REFERENCES ai_interpretation_runs(id)
    ON DELETE SET NULL
);
```

## 13.1 Idempotency

The trusted reducer creates `application_key` from the **semantic application attempt**, not merely the raw provider event.

It must distinguish:

```text
same normalized event, same evidence revision, same reducer application
  -> duplicate delivery / retry -> same application_key

same source revisited under a genuinely new authorized evidence revision
  -> new reviewed application -> new application_key
```

Mechanical uniqueness:

```sql
CREATE UNIQUE INDEX responsibility_domain_events_application_effect_uq
  ON responsibility_domain_events
    (responsibility_id, application_key, effect_key);
```

This is deliberately stronger than `source_event_key` uniqueness and avoids blocking legitimate re-evaluation of old evidence after the authorized evidence set changes.

## 13.2 Aggregate-version history

At most one mutating domain event should produce a given aggregate version:

```sql
CREATE UNIQUE INDEX responsibility_domain_events_mutation_version_uq
  ON responsibility_domain_events (responsibility_id, aggregate_version_after)
  WHERE mutates_state;
```

A logged `NO_OP` may keep the current aggregate version and therefore is not subject to that unique index.

Other indexes:

```sql
CREATE INDEX responsibility_domain_events_history_idx
  ON responsibility_domain_events (responsibility_id, occurred_at DESC, id);

CREATE INDEX responsibility_domain_events_correlation_idx
  ON responsibility_domain_events (correlation_id, id);

CREATE INDEX responsibility_domain_events_source_idx
  ON responsibility_domain_events (source_event_key, occurred_at DESC, id);
```

---

# 14. `responsibility_provenance_refs`

Provenance is intentionally flexible as an audit/reference layer while canonical business state remains typed.

The same table can support accepted Responsibilities and pre-admission Review without inventing a second provenance subsystem.

```sql
CREATE TABLE responsibility_provenance_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  responsibility_id uuid
    REFERENCES responsibilities(id) ON DELETE CASCADE,
  admission_review_id uuid
    REFERENCES responsibility_admission_reviews(id) ON DELETE CASCADE,

  target_kind text NOT NULL,
  target_id uuid,
  field_key text,
  support_role text,

  evidence_kind text NOT NULL,
  message_id uuid,
  provider_observation_key text,
  interpretation_run_id uuid,
  domain_event_id uuid
    REFERENCES responsibility_domain_events(id) ON DELETE SET NULL,

  source_locator jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_excerpt_short text,

  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_provenance_refs_owner_check
    CHECK (
      (responsibility_id IS NOT NULL AND admission_review_id IS NULL)
      OR
      (responsibility_id IS NULL AND admission_review_id IS NOT NULL)
    ),

  CONSTRAINT responsibility_provenance_refs_target_kind_nonempty
    CHECK (char_length(btrim(target_kind)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_provenance_refs_evidence_kind_nonempty
    CHECK (char_length(btrim(evidence_kind)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_provenance_refs_evidence_present_check
    CHECK (
      message_id IS NOT NULL
      OR provider_observation_key IS NOT NULL
      OR interpretation_run_id IS NOT NULL
      OR domain_event_id IS NOT NULL
    ),

  CONSTRAINT responsibility_provenance_refs_locator_object_check
    CHECK (jsonb_typeof(source_locator) = 'object'),

  CONSTRAINT responsibility_provenance_refs_excerpt_length
    CHECK (source_excerpt_short IS NULL OR char_length(source_excerpt_short) <= 512),

  CONSTRAINT responsibility_provenance_refs_message_fk
    FOREIGN KEY (message_id)
    REFERENCES messages(id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_provenance_refs_interpretation_run_fk
    FOREIGN KEY (interpretation_run_id)
    REFERENCES ai_interpretation_runs(id)
    ON DELETE SET NULL
);
```

Indexes:

```sql
CREATE INDEX responsibility_provenance_refs_responsibility_idx
  ON responsibility_provenance_refs (responsibility_id, target_kind, target_id, id)
  WHERE responsibility_id IS NOT NULL;

CREATE INDEX responsibility_provenance_refs_review_idx
  ON responsibility_provenance_refs (admission_review_id, id)
  WHERE admission_review_id IS NOT NULL;

CREATE INDEX responsibility_provenance_refs_message_idx
  ON responsibility_provenance_refs (message_id, id)
  WHERE message_id IS NOT NULL;
```

`target_kind`, `field_key`, `support_role`, and `evidence_kind` are trusted-code registries, not open client input.

---

# 15. `semantic_details_v1`

## 15.1 Exact aggregate-local shape

The v1 runtime-validated object is conceptually:

```ts
type ResponsibilitySemanticDetailsV1 = {
  completionCriteria: Array<{
    id: string;                 // UUID string, stable across rewrites
    code: string;
    summary?: string;
    status: "PENDING" | "SATISFIED" | "WAIVED";
    satisfiedAt?: string;       // ISO instant only when satisfied
  }>;

  constraints: Array<{
    id: string;
    code: string;
    summary?: string;
    status: "ACTIVE" | "SATISFIED" | "CANCELLED" | "SUPERSEDED";
    conditionRef?: {
      kind: "EXPECTED_EVENT" | "OTHER";
      id?: string;
      code?: string;
    };
  }>;

  pendingProposals: Array<{
    id: string;
    kind: string;
    value: unknown;             // further validated by proposal kind
    status: "PENDING" | "REJECTED" | "SUPERSEDED";
  }>;

  agreedFacts: Array<{
    id: string;
    kind: string;
    value: unknown;             // further validated by fact kind
    status: "CURRENT" | "SUPERSEDED";
  }>;

  uncertainties: Array<{
    id: string;
    fieldKey: string;
    reasonCode: string;
    material: boolean;
    reviewRequired: boolean;
    candidateRefs?: string[];
  }>;

  assignmentSemantics?: {
    id: string;
    shape: "ANY_OF" | "ALL_OF" | "UNSPECIFIED_GROUP";
    candidateParticipantIds: string[];
    selectedParticipantId?: string;
  };

  riskDetails: Array<{
    id: string;
    targetKind: string;
    targetId?: string;
    riskClass: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
    reasonCode: string;
  }>;
};
```

## 15.2 Required trusted validation rules

At every canonical write:

- the object must match exactly one known `semantic_details_version`;
- unknown top-level keys are rejected;
- local IDs are UUID strings and unique inside the document;
- references to local IDs must resolve;
- `SATISFIED` completion criteria require `satisfiedAt`;
- unresolved shared assignment does not silently create normalized required legs;
- pending proposals never appear in `agreedFacts` without a reducer effect/evidence;
- normalized legs/events/temporal facts are not duplicated into this document;
- raw provider/model payloads and credentials are rejected.

The concrete runtime validation library is not an L2 schema decision; use the project's trusted validation library at implementation time and keep one canonical validator/migration registry.

---

# 16. Transaction and concurrency protocol

The schema is only correct if writes follow one reducer protocol.

## 16.1 Single-Responsibility mutation

Default transaction isolation may remain PostgreSQL `READ COMMITTED` **when combined with explicit row locking and version checks**.

Canonical flow:

```text
BEGIN

1. SELECT Responsibility FOR UPDATE
2. inspect current aggregate_version / evidence_revision
3. check existing domain event by (responsibility_id, application_key, effect_key)
   - if already applied: return the existing result idempotently
4. reject stale/incompatible basis revision
5. validate current FieldDecision authority + evidence
6. apply parent/child/semantic-details mutations
7. increment aggregate_version exactly once for this aggregate command
8. append one mutating DomainEvent with before/after versions
9. COMMIT
```

Do not depend on a read-then-write sequence outside one transaction.

## 16.2 Composite effects across multiple existing Responsibilities

Lock existing Responsibility rows in deterministic UUID order before mutating any of them.

Then apply all effects in one transaction when the source command semantically requires atomicity, for example:

```text
SUPERSEDE R1
CREATE R2
```

Deterministic lock order reduces deadlock risk.

## 16.3 Optimistic/version boundary

Even after row locking, trusted code checks the expected current `aggregate_version`/`evidence_revision` supplied by the reducer command.

`aggregate_version` protects canonical state mutation concurrency.

`evidence_revision` protects semantic basis freshness.

They are intentionally separate.

## 16.4 Serialization retries

The default v0.1 path does not require every reducer write to run at `SERIALIZABLE` isolation. PostgreSQL row locks + deterministic lock order + unique constraints + version checks are simpler for the aggregate-shaped workload.

If a future cross-aggregate invariant cannot be protected cleanly by this protocol, escalate that command to `SERIALIZABLE` with explicit retry handling rather than globally increasing isolation by default.

---

# 17. Drizzle representation rules

## 17.1 UUID

Use Drizzle `uuid(...).defaultRandom()` for ordinary UUID IDs.

## 17.2 State columns

Use `text(..., { enum: [...] })` only for TypeScript inference **plus** a database `check(...)` for finite structural state.

Do not mistake Drizzle's type inference for runtime DB enforcement.

## 17.3 JSONB

Use `jsonb(...).$type<...>()` for TypeScript shape, but runtime-validate before writes. TypeScript generics alone are not validation.

## 17.4 Partial indexes

Use Drizzle `index()` / `uniqueIndex()` with `.where(sql``)` for partial indexes where supported by the current stable Drizzle version.

Committed generated SQL must be reviewed against the SQL contract in this document.

## 17.5 Raw SQL escape hatch

Use `sql`` only where the ORM API would obscure correctness, for example explicit `FOR UPDATE` locking or a PostgreSQL expression/check that is clearer in SQL.

Do not replace reviewable PostgreSQL invariants with application-only logic merely because an ORM helper is missing.

---

# 18. What is DB-enforced vs reducer-enforced

## 18.1 DB-enforced

PostgreSQL should mechanically enforce:

```text
primary/FK ownership where representable
finite structural state values
resolution/reason/timestamp consistency
live/deferred structural consistency
exactly-shaped temporal resolved value representation
at most one accepted current temporal fact per target/kind
at most one active FieldDecision per field
one unresolved AdmissionReview per source/candidate identity
DomainEvent application/effect idempotency
one mutating event per resulting aggregate version
nonempty/bounded critical keys
JSON top-level object shape
```

## 18.2 Reducer/runtime-enforced

Trusted domain code enforces cross-row semantic invariants that PostgreSQL CHECK cannot safely express without triggers/general workflow machinery:

```text
obligation/event temporal target belongs to same Responsibility
activation event belongs to same Responsibility
DEFERRED has a valid active TemporalContract/return condition
parent resolution only when closure criteria/domain policy permit it
ExpectedEvent satisfaction has adequate authority
field-key/value schema registry
semantic_details_v1 deep validation
cross-account semantic merge prohibition
stale AI result rejection beyond revision equality
high-risk safe-action policy
semantic chronology/correction authority
```

Where a reducer-enforced invariant becomes a repeated production failure, first ask whether a narrow relational constraint can cheaply move it into the database before inventing a generic engine.

---

# 19. Explicit non-goals at L2

Do not add before evidence:

```text
RLS/Data API exposure
partitioning
GIN index on semantic_details
projection cache/materialized state
workflow graph
native PostgreSQL enum types for semantic taxonomies
triggers that implement Responsibility reducer semantics
stored procedures as the primary domain layer
cross-account many-to-many Responsibility sources
criterion/proposal/uncertainty tables
semantic embedding IDs/merge hashes
```

---

# 20. L2 acceptance tests for the schema itself

Before migration implementation, instantiate the DDL in a temporary PostgreSQL 18 database and prove at least:

1. invalid `RESOLVED` row without reason/timestamp is rejected;
2. `DEFERRED + HISTORICAL_INACTIVE` is rejected;
3. two current accepted source dues for the same parent/leg/event target are rejected;
4. two conflict candidates are allowed;
5. two active FieldDecisions for one field are rejected;
6. two open AdmissionReviews for the same account/source/candidate are rejected;
7. a resolved old AdmissionReview does not prevent a genuinely new open review row;
8. duplicate `(responsibility, application_key, effect_key)` DomainEvent is rejected;
9. two mutating DomainEvents cannot claim the same resulting aggregate version;
10. multiple NO_OP events can retain the same aggregate version when application keys differ;
11. one Conversation can hold multiple Responsibilities;
12. one Responsibility can hold multiple USER/PARTICIPANT legs;
13. a DATE TemporalFact cannot contain `resolved_at`;
14. an INSTANT TemporalFact cannot contain `resolved_date`;
15. an unresolved TemporalFact can preserve source expression without invented resolved value;
16. an AdmissionReview TRACK resolution requires an admitted Responsibility link;
17. DO_NOT_TRACK does not require any Responsibility row;
18. deleting a Responsibility cascades only aggregate-local children/history/provenance, not Message/provider evidence;
19. account/conversation mismatch fails through ownership FKs;
20. application transaction test proves duplicate retry is idempotent and stale aggregate/evidence versions cannot silently overwrite accepted state.

---

# 21. Oracle-to-DDL mapping summary

| DDL boundary | Main validating cases |
| --- | --- |
| parent orthogonal columns | T0-014/015/038, T07/T08/T20 |
| obligation legs | T0-003/004/012/020/029/031/036, T16/T18 |
| expected events | T0-002/003/005..008/017/034, T02/T04/T09/T18 |
| temporal facts | T0-001..008/018/026..028, T19 |
| semantic details | T0-009..011/014/033/040, T05/T06/T07/T17 |
| field decisions | correction principle, T0-026 negative boundary, T0-027/028, T15 |
| admission review | T0-041..044/042 |
| provenance | T0-022/025/027/028/034/037, M39/R27 |
| domain events/idempotency | T10..T15, V16 |
| account ownership FKs | T0-039 / H06/H13 |

---

# 22. Candidate verdict before independent audit

This proposal is intentionally concrete enough to be falsified.

It should be rejected if the independent L2 audit finds that it:

- cannot express an accepted oracle without application-only hidden state;
- introduces a DB constraint that rejects a valid conflict/history case;
- leaves a high-harm uniqueness/ownership invariant cheaply enforceable but unenforced;
- creates an accidental generic EAV/workflow system;
- requires unacceptable write/query complexity for the core UX;
- depends on unstable ORM behavior rather than reviewable PostgreSQL semantics.

No migrations are authorized by this document alone.