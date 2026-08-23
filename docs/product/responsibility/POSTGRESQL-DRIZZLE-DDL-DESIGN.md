# Responsibility PostgreSQL / Drizzle DDL Design v0.2

## Status

**Corrected L2 candidate after independent static audit. Migration authority is still BLOCKED until the concrete Drizzle/SQL schema is instantiated against PostgreSQL 18 and the executable L2 acceptance suite passes.**

This document turns the frozen L0/L1 Responsibility model into a concrete PostgreSQL 18 / Drizzle schema proposal.

Freeze levels remain:

```text
L0 semantic truth                           FROZEN v0.1
L1 logical persistence boundary             FROZEN v0.1
L2 exact PostgreSQL/Drizzle representation  CANDIDATE v0.2
L3 migrations/runtime                       NOT AUTHORIZED
```

The v0.2 changes apply all required findings from `POSTGRESQL-DRIZZLE-DDL-AUDIT.md`, especially:

```text
global CREATE-safe application idempotency
same-Responsibility composite child FKs
same-user participant integrity
same-account provenance integrity
stale-safe AdmissionReview identity
same-account TRACK resolution link
ExpectedEvent closed_at
strict TemporalFact supersession consistency
bounded canonical machine keys
explicit AdmissionReview transaction protocol
```

No new L1 persistence aggregate was required.

---

# 1. Platform assumptions and implementation prerequisites

The design uses ordinary PostgreSQL/Drizzle capabilities only:

```text
PostgreSQL 18
uuid / gen_random_uuid()
CHECK / UNIQUE / FOREIGN KEY
multi-column foreign keys
partial / partial-unique indexes
jsonb
row locks + transactions
```

Drizzle is required to generate reviewable PostgreSQL schema/migrations, but PostgreSQL—not TypeScript inference—is the authority for database constraints.

## 1.1 Better Auth UUID gate

All application/domain ownership IDs in this L2 candidate use PostgreSQL `uuid`.

Before any Phase-2 migration is accepted, the auth spike MUST verify the current Better Auth + PostgreSQL/Drizzle integration with its supported UUID ID strategy so that the actual `users.id` column is PostgreSQL `uuid`.

If that spike fails, stop L2 promotion and revise the cross-system ID type consistently before migration. Do not mix UUID domain FKs with an unreviewed text auth ID.

## 1.2 Upstream composite-key prerequisites

The broader Phase-2 schema MUST expose these keys before the Responsibility DDL is installed:

```sql
-- IDs are already primary keys; these redundant unique keys exist for
-- multi-column ownership foreign keys.

connected_accounts UNIQUE (id, user_id);
conversations      UNIQUE (id, connected_account_id);
participant_identities UNIQUE (id, user_id);
messages           UNIQUE (id, connected_account_id);
```

These are deliberate tenant/account-integrity indexes, not alternate identities.

---

# 2. General type conventions

## 2.1 IDs

Lunowa-owned rows:

```sql
uuid NOT NULL DEFAULT gen_random_uuid()
```

IDs are opaque. `created_at` is the authoritative creation time.

## 2.2 Structural control states

Use:

```text
text
+ PostgreSQL CHECK
+ TypeScript literal union
```

for small safety-relevant control states.

Do not use PostgreSQL native ENUM for Responsibility v0.1 control states. Linguistic/action/reason registries that are expected to evolve stay as trusted-code registries rather than large DB enums.

## 2.3 Instants and date-only values

Use:

```text
timestamp(3) with time zone   for instants
date                          for date-only accepted semantics
```

A date-only source value MUST NOT be silently converted to midnight.

## 2.4 JSONB

Canonical JSONB is restricted to the frozen typed aggregate-local details boundary and bounded audit/candidate summaries.

Every trusted write requires runtime schema validation and an explicit adjacent schema/version column where the JSON object evolves independently.

---

# 3. Exact Responsibility-owned table set

```text
responsibilities
responsibility_expected_events
responsibility_obligation_legs
responsibility_temporal_facts
responsibility_field_decisions
responsibility_admission_reviews
responsibility_domain_events
responsibility_provenance_refs
```

No table is added for completion criteria, constraints, proposals, agreements, uncertainties, ANY_OF assignment, sarcasm, commitment force, or projection buckets.

---

# 4. `responsibilities`

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

  CONSTRAINT responsibilities_id_user_uq
    UNIQUE (id, user_id),

  CONSTRAINT responsibilities_id_account_uq
    UNIQUE (id, connected_account_id),

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

Indexes:

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

Deliberately absent canonical columns:

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

---

# 5. `responsibility_expected_events`

```sql
CREATE TABLE responsibility_expected_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL,
  user_id uuid NOT NULL,

  actor_kind text NOT NULL,
  actor_participant_id uuid,

  event_code text NOT NULL,
  event_summary text,

  event_status text NOT NULL DEFAULT 'PENDING',
  closure_reason text,

  basis_kind text,
  expectation_strength text,

  satisfied_at timestamp(3) with time zone,
  closed_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_expected_events_id_parent_uq
    UNIQUE (id, responsibility_id),

  CONSTRAINT responsibility_expected_events_parent_user_fk
    FOREIGN KEY (responsibility_id, user_id)
    REFERENCES responsibilities (id, user_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_expected_events_actor_kind_check
    CHECK (actor_kind IN ('PARTICIPANT', 'EXTERNAL')),

  CONSTRAINT responsibility_expected_events_actor_reference_check
    CHECK (
      (actor_kind = 'PARTICIPANT' AND actor_participant_id IS NOT NULL)
      OR
      (actor_kind = 'EXTERNAL' AND actor_participant_id IS NULL)
    ),

  CONSTRAINT responsibility_expected_events_participant_user_fk
    FOREIGN KEY (actor_participant_id, user_id)
    REFERENCES participant_identities (id, user_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_expected_events_status_check
    CHECK (event_status IN ('PENDING', 'CLOSED')),

  CONSTRAINT responsibility_expected_events_closure_check
    CHECK (
      (
        event_status = 'PENDING'
        AND closure_reason IS NULL
        AND satisfied_at IS NULL
        AND closed_at IS NULL
      )
      OR
      (
        event_status = 'CLOSED'
        AND closure_reason IS NOT NULL
        AND closed_at IS NOT NULL
        AND (satisfied_at IS NULL OR closure_reason = 'SATISFIED')
      )
    ),

  CONSTRAINT responsibility_expected_events_event_code_nonempty
    CHECK (char_length(btrim(event_code)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_expected_events_summary_length
    CHECK (event_summary IS NULL OR char_length(event_summary) <= 1024)
);
```

`closure_reason`, `basis_kind`, and `expectation_strength` are trusted-code registries. A satisfaction closure may leave `satisfied_at` null when the exact external occurrence time is unknown; `closed_at` records when Lunowa accepted closure.

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

# 6. `responsibility_obligation_legs`

```sql
CREATE TABLE responsibility_obligation_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL,
  user_id uuid NOT NULL,

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

  activation_event_id uuid,

  closed_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_obligation_legs_id_parent_uq
    UNIQUE (id, responsibility_id),

  CONSTRAINT responsibility_obligation_legs_parent_user_fk
    FOREIGN KEY (responsibility_id, user_id)
    REFERENCES responsibilities (id, user_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_obligation_legs_bearer_kind_check
    CHECK (bearer_kind IN ('USER', 'PARTICIPANT')),

  CONSTRAINT responsibility_obligation_legs_bearer_reference_check
    CHECK (
      (bearer_kind = 'USER' AND bearer_participant_id IS NULL)
      OR
      (bearer_kind = 'PARTICIPANT' AND bearer_participant_id IS NOT NULL)
    ),

  CONSTRAINT responsibility_obligation_legs_participant_user_fk
    FOREIGN KEY (bearer_participant_id, user_id)
    REFERENCES participant_identities (id, user_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_obligation_legs_activation_event_parent_fk
    FOREIGN KEY (activation_event_id, responsibility_id)
    REFERENCES responsibility_expected_events (id, responsibility_id)
    ON DELETE NO ACTION,

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
    CHECK (object_summary IS NULL OR char_length(object_summary) <= 1024)
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

The composite activation FK mechanically forbids a condition event from another Responsibility.

---

# 7. `responsibility_temporal_facts`

```sql
CREATE TABLE responsibility_temporal_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL
    REFERENCES responsibilities(id) ON DELETE CASCADE,

  temporal_kind text NOT NULL,

  obligation_leg_id uuid,
  expected_event_id uuid,

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

  CONSTRAINT responsibility_temporal_facts_leg_parent_fk
    FOREIGN KEY (obligation_leg_id, responsibility_id)
    REFERENCES responsibility_obligation_legs (id, responsibility_id)
    ON DELETE NO ACTION,

  CONSTRAINT responsibility_temporal_facts_event_parent_fk
    FOREIGN KEY (expected_event_id, responsibility_id)
    REFERENCES responsibility_expected_events (id, responsibility_id)
    ON DELETE NO ACTION,

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

  CONSTRAINT responsibility_temporal_facts_original_expression_length
    CHECK (original_expression IS NULL OR char_length(original_expression) <= 512),

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
      (currentness_status = 'SUPERSEDED' AND superseded_at IS NOT NULL)
      OR
      (currentness_status <> 'SUPERSEDED' AND superseded_at IS NULL)
    ),

  CONSTRAINT responsibility_temporal_facts_anchor_shape_check
    CHECK (
      (anchor_kind IS NULL AND anchor_reference IS NULL AND anchor_offset_seconds IS NULL)
      OR
      (anchor_kind IS NOT NULL AND anchor_reference IS NOT NULL)
    )
);
```

Current accepted uniqueness while allowing conflict candidates:

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

Query indexes:

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

`HISTORICAL` and `SUPERSEDED` remain distinct: the former may represent retained historical/candidate evidence that was not necessarily the once-accepted value replaced by another accepted value.

---

# 8. `responsibility_field_decisions`

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

CREATE UNIQUE INDEX responsibility_field_decisions_active_uq
  ON responsibility_field_decisions (responsibility_id, field_key)
  WHERE decision_status = 'ACTIVE';
```

`field_key`, its value schema, and `authority_kind` are trusted-code allowlists. This table is not generic EAV and does not own `USER_TARGET` merely because a user supplied it.

---

# 9. `responsibility_admission_reviews`

```sql
CREATE TABLE responsibility_admission_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL,
  connected_account_id uuid NOT NULL,
  conversation_id uuid NOT NULL,

  review_status text NOT NULL DEFAULT 'OPEN',
  resolution text,

  reason_codes text[] NOT NULL,

  candidate_schema_version smallint NOT NULL DEFAULT 1,
  candidate_summary jsonb NOT NULL DEFAULT '{}'::jsonb,

  evidence_revision bigint NOT NULL,
  aggregate_version bigint NOT NULL DEFAULT 1,

  source_event_key text NOT NULL,
  candidate_key text NOT NULL,
  interpretation_run_id uuid,

  admitted_responsibility_id uuid,

  resolved_by_actor_kind text,
  resolved_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_admission_reviews_id_account_uq
    UNIQUE (id, connected_account_id),

  CONSTRAINT responsibility_admission_reviews_same_revision_uq
    UNIQUE (
      connected_account_id,
      source_event_key,
      candidate_key,
      evidence_revision
    ),

  CONSTRAINT responsibility_admission_reviews_status_check
    CHECK (review_status IN ('OPEN', 'RESOLVED')),

  CONSTRAINT responsibility_admission_reviews_resolution_check
    CHECK (resolution IS NULL OR resolution IN ('TRACK', 'DO_NOT_TRACK')),

  CONSTRAINT responsibility_admission_reviews_reason_codes_check
    CHECK (cardinality(reason_codes) >= 1),

  CONSTRAINT responsibility_admission_reviews_resolution_shape_check
    CHECK (
      (
        review_status = 'OPEN'
        AND resolution IS NULL
        AND admitted_responsibility_id IS NULL
        AND resolved_by_actor_kind IS NULL
        AND resolved_at IS NULL
      )
      OR
      (
        review_status = 'RESOLVED'
        AND resolution = 'DO_NOT_TRACK'
        AND admitted_responsibility_id IS NULL
        AND resolved_by_actor_kind IS NOT NULL
        AND resolved_at IS NOT NULL
      )
      OR
      (
        review_status = 'RESOLVED'
        AND resolution = 'TRACK'
        AND admitted_responsibility_id IS NOT NULL
        AND resolved_by_actor_kind IS NOT NULL
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
    CHECK (char_length(btrim(source_event_key)) BETWEEN 1 AND 256),

  CONSTRAINT responsibility_admission_reviews_candidate_key_check
    CHECK (char_length(btrim(candidate_key)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_admission_reviews_account_owner_fk
    FOREIGN KEY (connected_account_id, user_id)
    REFERENCES connected_accounts (id, user_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_admission_reviews_conversation_account_fk
    FOREIGN KEY (conversation_id, connected_account_id)
    REFERENCES conversations (id, connected_account_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_admission_reviews_admitted_account_fk
    FOREIGN KEY (admitted_responsibility_id, connected_account_id)
    REFERENCES responsibilities (id, connected_account_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_admission_reviews_interpretation_run_fk
    FOREIGN KEY (interpretation_run_id)
    REFERENCES ai_interpretation_runs(id)
    ON DELETE SET NULL
);
```

At most one currently OPEN review for the source/candidate identity:

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

`candidate_key` is deterministic trusted semantic-candidate identity and MUST NOT depend on model-run IDs or unstable generated labels.

---

# 10. `responsibility_domain_events`

```sql
CREATE TABLE responsibility_domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL
    REFERENCES responsibilities(id) ON DELETE CASCADE,

  operation text NOT NULL,
  actor_kind text NOT NULL,
  reason_codes text[] NOT NULL,

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

  CONSTRAINT responsibility_domain_events_id_parent_uq
    UNIQUE (id, responsibility_id),

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

  CONSTRAINT responsibility_domain_events_noop_shape_check
    CHECK (
      (mutates_state AND operation <> 'NO_OP')
      OR
      (NOT mutates_state AND operation = 'NO_OP')
    ),

  CONSTRAINT responsibility_domain_events_reason_codes_check
    CHECK (cardinality(reason_codes) >= 1),

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

  CONSTRAINT responsibility_domain_events_actor_kind_check
    CHECK (char_length(btrim(actor_kind)) BETWEEN 1 AND 64),

  CONSTRAINT responsibility_domain_events_source_key_check
    CHECK (char_length(btrim(source_event_key)) BETWEEN 1 AND 256),

  CONSTRAINT responsibility_domain_events_application_key_check
    CHECK (char_length(btrim(application_key)) BETWEEN 1 AND 128),

  CONSTRAINT responsibility_domain_events_effect_key_check
    CHECK (char_length(btrim(effect_key)) BETWEEN 1 AND 128),

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

## 10.1 Global semantic-application idempotency

`application_key` is deterministic **before** accepting/generating the target Responsibility identity and is globally namespaced by trusted code. `effect_key` identifies a deterministic semantic effect slot and MUST NOT depend on a newly generated Responsibility UUID.

Examples:

```text
application_key = compact hash/account-scoped opaque key for
                  source + authorized evidence revision + application namespace

effect_key      = create:candidate-2
                  supersede:existing-slot-1
                  update:deadline-resolution
```

Global uniqueness:

```sql
CREATE UNIQUE INDEX responsibility_domain_events_application_effect_uq
  ON responsibility_domain_events (application_key, effect_key);
```

This protects duplicate concurrent `CREATE` attempts even if each worker generated a different Responsibility UUID.

Legitimate explicit re-evaluation/migration under a different semantic application uses a distinct, versioned application namespace. A model/reducer version bump by itself does not silently create a new application identity.

## 10.2 Aggregate version uniqueness

```sql
CREATE UNIQUE INDEX responsibility_domain_events_mutation_version_uq
  ON responsibility_domain_events (responsibility_id, aggregate_version_after)
  WHERE mutates_state;
```

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

# 11. `responsibility_provenance_refs`

In v0.1 all canonical Responsibility/AdmissionReview Message evidence is account-local. Provenance therefore duplicates the account ID deliberately and enforces it.

```sql
CREATE TABLE responsibility_provenance_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  connected_account_id uuid NOT NULL,

  responsibility_id uuid,
  admission_review_id uuid,

  target_kind text NOT NULL,
  target_id uuid,
  field_key text,
  support_role text,

  evidence_kind text NOT NULL,
  message_id uuid,
  provider_observation_key text,
  interpretation_run_id uuid,
  domain_event_id uuid,

  source_locator jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_excerpt_short text,

  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),

  CONSTRAINT responsibility_provenance_refs_owner_check
    CHECK (
      (responsibility_id IS NOT NULL AND admission_review_id IS NULL)
      OR
      (responsibility_id IS NULL AND admission_review_id IS NOT NULL)
    ),

  CONSTRAINT responsibility_provenance_refs_domain_event_owner_check
    CHECK (domain_event_id IS NULL OR responsibility_id IS NOT NULL),

  CONSTRAINT responsibility_provenance_refs_responsibility_account_fk
    FOREIGN KEY (responsibility_id, connected_account_id)
    REFERENCES responsibilities (id, connected_account_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_provenance_refs_review_account_fk
    FOREIGN KEY (admission_review_id, connected_account_id)
    REFERENCES responsibility_admission_reviews (id, connected_account_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_provenance_refs_message_account_fk
    FOREIGN KEY (message_id, connected_account_id)
    REFERENCES messages (id, connected_account_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_provenance_refs_domain_event_parent_fk
    FOREIGN KEY (domain_event_id, responsibility_id)
    REFERENCES responsibility_domain_events (id, responsibility_id)
    ON DELETE NO ACTION,

  CONSTRAINT responsibility_provenance_refs_interpretation_run_fk
    FOREIGN KEY (interpretation_run_id)
    REFERENCES ai_interpretation_runs(id)
    ON DELETE SET NULL,

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
    CHECK (source_excerpt_short IS NULL OR char_length(source_excerpt_short) <= 512)
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

`source_excerpt_short` is optional and SHOULD be omitted by default when source locator/ID is enough. It is never a substitute for retention/privacy policy.

`target_kind`, `field_key`, `support_role`, `evidence_kind`, and provider-observation key semantics are trusted-code registries.

---

# 12. `semantic_details_v1`

Canonical runtime shape remains aggregate-local:

```ts
type ResponsibilitySemanticDetailsV1 = {
  completionCriteria: Array<{
    id: string; // UUID string, stable local identity
    code: string;
    summary?: string;
    status: "PENDING" | "SATISFIED" | "WAIVED";
    satisfiedAt?: string;
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
    value: unknown; // further validator selected by kind
    status: "PENDING" | "REJECTED" | "SUPERSEDED";
  }>;

  agreedFacts: Array<{
    id: string;
    kind: string;
    value: unknown; // further validator selected by kind
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

Trusted validator requirements:

```text
exact known semantic_details_version
unknown top-level keys rejected
local IDs are valid UUID strings and unique
all local references resolve
SATISFIED criterion requires satisfiedAt
unresolved shared assignment creates no fabricated normalized required leg
proposal -> agreed fact only through a reducer effect with evidence
normalized legs/events/times not duplicated in JSON
raw provider/model payloads and credentials rejected
```

No GIN index is created in v0.1.

---

# 13. Machine-key contract

Keys used for idempotency/AdmissionReview identity are generated only by trusted code.

```text
source_event_key <= 256 ASCII chars
application_key  <= 128 ASCII chars
candidate_key    <= 128 ASCII chars
effect_key       <= 128 ASCII chars
```

They are canonical opaque identifiers, not raw URLs, message bodies, user text, or model prose.

Required key-generation tests include:

```text
same account/source/revision/application -> stable same key
different account -> different application/source namespace
different evidence revision -> different application key when re-application is authorized
model rerun alone -> no new semantic application identity
multiple semantic effects in one application -> distinct stable effect keys
duplicate CREATE with newly generated target UUID -> same application/effect key
```

---

# 14. Transaction and concurrency protocols

## 14.1 Existing Responsibility mutation

Default v0.1 isolation may remain PostgreSQL `READ COMMITTED` with explicit row locking and version/idempotency checks:

```text
BEGIN
1. SELECT Responsibility FOR UPDATE
2. verify expected aggregate_version + current evidence_revision
3. query global (application_key, effect_key)
   - if already accepted, return the existing result idempotently
4. reject stale/incompatible semantic basis
5. validate active FieldDecision authority + current evidence
6. mutate parent/children/semantic details
7. aggregate_version := aggregate_version + 1 exactly once
8. append one mutating DomainEvent with before/after versions
9. set updated_at := now() on changed current-state rows
COMMIT
```

## 14.2 CREATE

There is no existing Responsibility row to lock.

```text
BEGIN
1. compute deterministic application_key + effect_key before accepting target identity
2. if existing DomainEvent already has that key pair, return its Responsibility
3. generate candidate Responsibility UUID
4. insert Responsibility/current children
5. insert CREATE DomainEvent with before=0, after=1
6. global unique(application_key,effect_key) is the commit arbiter
COMMIT
```

If two workers race, one global unique insert wins; the losing transaction rolls back the duplicate Responsibility. The caller then loads the winning DomainEvent/Responsibility.

## 14.3 Composite effects

For existing Responsibilities, lock rows in deterministic UUID order. Apply all semantically atomic effects in one transaction when required, e.g.:

```text
SUPERSEDE R1
CREATE R2
```

Each effect gets its own stable `effect_key`; all share one application/correlation context.

## 14.4 AdmissionReview re-evaluation/resolution

```text
BEGIN
1. SELECT AdmissionReview FOR UPDATE
2. verify expected review aggregate_version and evidence_revision
3. if already RESOLVED -> return stored terminal decision idempotently
4. re-evaluation may update an OPEN row only against current authorized evidence
5. TRACK:
   - create/load Responsibility through the global CREATE idempotency boundary
   - set resolution=TRACK + same-account admitted_responsibility_id
6. DO_NOT_TRACK:
   - set resolution=DO_NOT_TRACK
7. set resolver/resolved_at, increment review aggregate_version, updated_at=now()
COMMIT
```

A stale model run cannot reopen/replace a resolved row. The all-status same-revision unique key prevents re-creation for the exact same source/candidate/evidence revision.

## 14.5 Isolation escalation

Do not globally use `SERIALIZABLE` by default. If a later invariant cannot be protected with row locks, deterministic lock order, unique/FK constraints, and version checks, isolate that command and use serializable execution with explicit retry.

---

# 15. DB-enforced vs reducer-enforced invariants

## PostgreSQL-enforced

```text
account/conversation ownership of Responsibility/Review
same-user participant ownership on obligation/event rows
same-Responsibility activation/temporal child references
finite structural state values
resolution/reason/timestamp consistency
defer/live structural consistency
DATE/INSTANT/UNRESOLVED shape
one accepted-current temporal fact per semantic target/kind
conflict candidates may coexist
one active FieldDecision per field
one open Review candidate per source/candidate
same source/candidate/revision Review cannot reappear
same-account TRACK Review -> Responsibility link
global semantic application/effect idempotency
one mutating DomainEvent per resulting aggregate version
same-account Message provenance
same-Responsibility DomainEvent provenance
JSON top-level object shape
bounded canonical machine keys
```

## Trusted reducer/runtime-enforced

```text
DEFERRED has a valid current TemporalContract/return condition
parent closure criteria/domain policy
ExpectedEvent satisfaction authority
field-key/value/authority registries
semantic_details_v1 deep validation
semantic chronology and correction/supersession authority
stale AI rejection beyond raw revision equality
high-risk safe-action policy
cross-account semantic merge prohibition at matching/context construction
provider_observation_key ownership validation
updated_at maintenance on trusted writes
```

---

# 16. Delete and retention rules

Normal domain state evolution never hard-deletes Responsibility children; it closes/supersedes them.

Hard delete is reserved for explicit privacy/account teardown or maintenance policy.

```text
Responsibility -> aggregate-local children/history/provenance: CASCADE
Review -> Review provenance: CASCADE
Review TRACK -> admitted Responsibility: RESTRICT/NO ACTION
cross-child event/leg references: NO ACTION
Provenance -> Message: RESTRICT
```

Privacy deletion order is explicit:

```text
1. delete Responsibility/AdmissionReview state and provenance
2. delete Message/provider evidence according to retention policy
3. delete account/auth secret material according to provider/account policy
```

The executable PostgreSQL acceptance suite MUST verify that deleting a parent Responsibility succeeds with the composite/cross-child FK graph. If `NO ACTION` timing prevents aggregate teardown, use an explicit child teardown order rather than weakening normal referential safety.

---

# 17. Drizzle representation rules

Use current Drizzle PostgreSQL primitives:

```text
uuid().defaultRandom()
text() + explicit check(...)
jsonb().$type<...>() + independent runtime validator
foreignKey(...) for multi-column FKs
index()/uniqueIndex() + .where(sql``) for partial indexes
transaction(..., { isolationLevel: "read committed" })
```

Use raw reviewable SQL only where it makes correctness clearer, such as explicit `SELECT ... FOR UPDATE` or a PostgreSQL constraint expression not cleanly represented by the ORM API.

Generated SQL is reviewed against this DDL contract. TypeScript enum hints and `$type` generics are not runtime validation.

---

# 18. L2 executable acceptance suite

Before L2 freeze/migration authorization, instantiate the concrete Drizzle-generated schema on temporary PostgreSQL 18 and prove all of the following.

## Parent/state

```text
01 invalid RESOLVED without reason/timestamp rejected
02 DEFERRED + HISTORICAL_INACTIVE rejected
03 one Conversation can contain multiple Responsibilities
04 account/conversation mismatch rejected
```

## Temporal

```text
05 two ACCEPTED_CURRENT facts for same parent/kind rejected
06 two ACCEPTED_CURRENT facts for same leg/kind rejected
07 two ACCEPTED_CURRENT facts for same event/kind rejected
08 multiple CONFLICT_CANDIDATE values allowed
09 DATE with resolved_at rejected
10 INSTANT with resolved_date rejected
11 UNRESOLVED preserves expression with no fabricated resolved value
12 ACCEPTED_CURRENT with superseded_at rejected
13 cross-Responsibility leg temporal target rejected
14 cross-Responsibility event temporal target rejected
```

## Obligation/events

```text
15 multiple USER/PARTICIPANT legs allowed
16 cross-Responsibility activation_event rejected
17 participant belonging to another Lunowa user rejected
18 ExpectedEvent CLOSED requires closed_at
19 CANCELLED/INVALIDATED event closure does not require fake satisfied_at
```

## Field decisions

```text
20 two ACTIVE decisions for same field rejected
21 superseded decision requires superseded_at
```

## AdmissionReview

```text
22 two OPEN reviews for same account/source/candidate rejected
23 same source/candidate/evidence revision cannot be recreated after resolution
24 new evidence revision can form a new review episode when no OPEN episode conflicts
25 TRACK resolution requires admitted Responsibility
26 TRACK link to another account rejected
27 deleting TRACKed admitted Responsibility is rejected while Review history remains
28 DO_NOT_TRACK requires no Responsibility
29 resolution retry returns stored terminal result and creates no duplicate Responsibility
```

## Idempotency/history

```text
30 duplicate global (application_key,effect_key) rejected
31 concurrent duplicate CREATE with different generated Responsibility UUIDs -> exactly one commit
32 two mutating events cannot claim same resulting aggregate version
33 NO_OP may retain current aggregate version under a different application/effect identity
34 stale aggregate/evidence command cannot overwrite accepted state
35 one source event can atomically produce distinct effects on multiple Responsibilities
```

## Provenance/account

```text
36 Message from another connected account rejected as provenance
37 DomainEvent from another Responsibility rejected as provenance
38 provenance retains support-role/locator without requiring copied full body
```

## Hard delete/privacy

```text
39 aggregate parent hard-delete removes aggregate-local state/history/provenance only
40 parent delete succeeds with same-parent/cross-child FK graph
41 Message deletion is blocked while provenance exists
42 explicit privacy deletion order succeeds
```

## Semantic details

```text
43 invalid semantic_details version/object rejected by trusted runtime before DB write
44 duplicate local semantic-detail IDs rejected by validator
45 unresolved ANY_OF assignment produces no fabricated required legs
46 proposal does not become agreed fact without reducer effect/evidence
```

## Auth ID gate

```text
47 actual Better Auth user PK is PostgreSQL uuid
48 Better Auth sign-up/session/account-linking roundtrip works against the exact UUID schema
49 Better Auth schema generation/migration does not silently revert user IDs to text
```

No migration is authorized until this suite or an explicitly equivalent set passes.

---

# 19. Oracle-to-DDL map

| DDL boundary | Primary semantic pressure |
| --- | --- |
| parent orthogonal columns | T0-014/015/038, T07/T08/T20 |
| obligation legs | T0-003/004/012/020/029/031/036, T16/T18 |
| expected events | T0-002/003/005..008/017/034, T02/T04/T09/T18 |
| temporal facts | T0-001..008/018/026..028, T19 |
| semantic details | T0-009..011/014/033/040, T05/T06/T07/T17 |
| field decisions | T0-026 negative boundary, T0-027/028, T15 |
| AdmissionReview | T0-041..044/T0-042 |
| provenance | T0-022/025/027/028/034/037, M39/R27 |
| global domain-event idempotency | V16, T10..T15, duplicate CREATE pressure |
| account ownership/provenance FKs | T0-039, H06/H13 |

---

# 20. Remaining open L2 choices that do not block executable validation

The following are still intentionally implementation-level registries/policies, not missing tables:

```text
action_code vocabulary
event_code vocabulary
basis_kind / expectation_strength vocabulary
closure_reason registries for legs/events
FieldDecision field/value registry
support_role/evidence_kind registries
exact semantic_details validator library
canonical machine-key hashing/encoding implementation
query helper/repository function names
```

They must be bounded in trusted code and tested, but freezing their complete vocabulary before real data would be false precision.

---

# 21. Current verdict

```text
L0 semantics                         FROZEN v0.1
L1 logical persistence boundary      FROZEN v0.1
L2 corrected exact DDL candidate     STATIC-AUDIT CORRECTED
L2 executable PostgreSQL proof       PENDING
L2 final freeze                      NOT YET
L3 migrations/runtime                NOT AUTHORIZED
```

The next task is no longer speculative schema design. It is to express this v0.2 contract as temporary Drizzle/PostgreSQL schema/tests, run the 49-item acceptance matrix, inspect generated SQL, and only then decide whether L2 earns a freeze.