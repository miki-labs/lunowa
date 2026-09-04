# Responsibility PostgreSQL / Drizzle DDL Design v0.4

## Status

**Accepted exact L2 schema after the independent Issue #15 audit. DDL v0.4 is FROZEN; production migration/runtime authority remains NOT AUTHORIZED by this freeze.**

Freeze levels:

```text
L0 semantic model                           FROZEN v0.1 baseline
L1 logical persistence boundary             FROZEN v0.1
L2 exact PostgreSQL/Drizzle schema          FROZEN — DDL v0.4
L3 migrations/runtime                       NOT AUTHORIZED by this freeze
```

v0.4 incorporates all required findings from:

```text
POSTGRESQL-DRIZZLE-DDL-AUDIT.md
POSTGRESQL-DRIZZLE-DDL-AUDIT-PASS-2.md
POSTGRESQL-DRIZZLE-DDL-AUDIT-PASS-3.md
```

No static audit required a new L1 Responsibility aggregate/table or a new lifecycle state.

---

# 1. Platform assumptions and prerequisites

The design uses ordinary PostgreSQL/Drizzle capabilities:

```text
PostgreSQL 18
uuid / gen_random_uuid()
CHECK / UNIQUE / FOREIGN KEY
multi-column foreign keys
partial / partial-unique indexes
jsonb
row locks + transactions
```

PostgreSQL—not TypeScript inference—is the authority for database constraints.

## 1.1 Better Auth UUID gate

All Phase-2 ownership IDs in this frozen DDL v0.4 representation use PostgreSQL `uuid`.

Before any migration is accepted, verify the current Better Auth + PostgreSQL/Drizzle configuration with its supported UUID ID strategy so the actual application-user primary key is PostgreSQL `uuid`.

If the auth spike fails, stop L2 promotion and revise the cross-system ID type consistently before migration.

## 1.2 Upstream ownership/index prerequisites

The broader Phase-2 schema MUST expose:

```sql
connected_accounts UNIQUE (id, user_id);
conversations      UNIQUE (id, connected_account_id);
participant_identities UNIQUE (id, user_id);
messages           UNIQUE (id, connected_account_id);
ai_interpretation_runs UNIQUE (id, user_id);
```

These are deliberate ownership/reference indexes even though `id` is already individually unique.

## 1.3 Conversation semantic evidence revision

The existing Conversation entity MUST expose a monotonic semantic-evidence revision:

```sql
semantic_evidence_revision bigint NOT NULL DEFAULT 0
CHECK (semantic_evidence_revision >= 0)
```

Meaning:

> version of the authorized semantic evidence/context set used for Responsibility admission, matching, and interpretation in this Conversation.

Advance it when material semantic input changes, such as:

```text
new normalized message
material message/content reconciliation
relevant attachment/attachment-metadata change
provider observation that changes semantic evidence
accepted authorized external context used by the reducer
```

Do not advance it for UI/read/rendering-only changes.

In v0.1, admission/matching reducer commands lock the Conversation row before accepting semantic effects. This is a concurrency/evidence coordinator only; canonical Responsibility state still belongs to Responsibility aggregates.

## 1.4 AI context snapshot invariant

An `AIInterpretationRun.basis_evidence_revision` is valid only if it labels the exact authorized context captured for that run.

Context building MUST either:

```text
A. briefly lock Conversation while reading the revision + authorized context/input manifest,
   persist the run basis/manifest, release the DB lock, then call the remote model;

or

B. use a consistent DB snapshot and re-check the Conversation revision before
   persisting/dispatching the run as based on that revision.
```

Do not hold a database lock across the remote AI call.

This is a runtime contract rather than a new table requirement.

---

# 2. General type conventions

## IDs

Lunowa-owned rows:

```sql
uuid NOT NULL DEFAULT gen_random_uuid()
```

IDs are opaque; `created_at` is authoritative for time.

## Structural state

Use:

```text
text + PostgreSQL CHECK + TypeScript literal-union typing
```

for small safety-relevant state sets. Do not use PostgreSQL native ENUM for Responsibility v0.1 control states.

## Time

```text
timestamp(3) with time zone   for instants
date                          for date-only accepted semantics
```

Date-only source semantics never become fake midnight instants.

## JSONB

Canonical JSONB is limited to the frozen typed aggregate-local details boundary and bounded audit/candidate summaries. Every trusted write is runtime-schema validated.

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

No normalized table is introduced for criteria, constraints, proposals, agreements, uncertainties, ANY_OF assignment, sarcasm, commitment force, or UI projection.

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

  accepted_evidence_revision bigint NOT NULL,
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

  CONSTRAINT responsibilities_accepted_evidence_revision_check
    CHECK (accepted_evidence_revision >= 0),

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

`accepted_evidence_revision` is the Conversation semantic revision last accepted/applied to this Responsibility; it need not equal the latest Conversation revision at every instant.

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

`satisfied_at` is optional even for satisfaction when the exact external occurrence time is unknown; `closed_at` records when Lunowa accepted closure.

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

`HISTORICAL` and `SUPERSEDED` remain distinct: historical retained evidence need not have been the once-accepted value that a later fact superseded.

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

  basis_evidence_revision bigint NOT NULL,
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

  CONSTRAINT responsibility_admission_reviews_id_user_uq
    UNIQUE (id, user_id),

  CONSTRAINT responsibility_admission_reviews_same_revision_uq
    UNIQUE (
      connected_account_id,
      source_event_key,
      candidate_key,
      basis_evidence_revision
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

  CONSTRAINT responsibility_admission_reviews_basis_revision_check
    CHECK (basis_evidence_revision >= 0),

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

  CONSTRAINT responsibility_admission_reviews_interpretation_run_user_fk
    FOREIGN KEY (interpretation_run_id, user_id)
    REFERENCES ai_interpretation_runs (id, user_id)
    ON DELETE SET NULL (interpretation_run_id)
);
```

**Implementation note:** PostgreSQL supports column-list `SET NULL` actions, but Drizzle support/current generated SQL must be verified. If Drizzle cannot express the column-list action cleanly, use explicit migration SQL or use `NO ACTION` and explicit retention cleanup. Never set `user_id` null as a side effect of pruning an interpretation run.

```sql
CREATE UNIQUE INDEX responsibility_admission_reviews_open_source_candidate_uq
  ON responsibility_admission_reviews
    (connected_account_id, source_event_key, candidate_key)
  WHERE review_status = 'OPEN';

CREATE INDEX responsibility_admission_reviews_open_user_idx
  ON responsibility_admission_reviews (user_id, created_at DESC, id)
  WHERE review_status = 'OPEN';

CREATE INDEX responsibility_admission_reviews_conversation_idx
  ON responsibility_admission_reviews (conversation_id, created_at DESC, id);
```

`candidate_key` is deterministic trusted semantic-candidate identity, independent of model-run IDs.

---

# 10. `responsibility_domain_events`

```sql
CREATE TABLE responsibility_domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id uuid NOT NULL,
  user_id uuid NOT NULL,

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

  CONSTRAINT responsibility_domain_events_parent_user_fk
    FOREIGN KEY (responsibility_id, user_id)
    REFERENCES responsibilities (id, user_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_domain_events_interpretation_run_user_fk
    FOREIGN KEY (interpretation_run_id, user_id)
    REFERENCES ai_interpretation_runs (id, user_id)
    ON DELETE SET NULL (interpretation_run_id),

  CONSTRAINT responsibility_domain_events_operation_check
    CHECK (
      operation IN (
        'CREATE', 'UPDATE', 'RESOLVE', 'REOPEN',
        'SUPERSEDE', 'INVALIDATE', 'NO_OP'
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
    CHECK (jsonb_typeof(change_summary) = 'object')
);
```

As above, if column-list `ON DELETE SET NULL` is not emitted cleanly by Drizzle, prefer `NO ACTION` + explicit retention cleanup over nulling tenant ownership.

Global semantic application/effect idempotency:

```sql
CREATE UNIQUE INDEX responsibility_domain_events_application_effect_uq
  ON responsibility_domain_events (application_key, effect_key);

CREATE UNIQUE INDEX responsibility_domain_events_mutation_version_uq
  ON responsibility_domain_events (responsibility_id, aggregate_version_after)
  WHERE mutates_state;

CREATE INDEX responsibility_domain_events_history_idx
  ON responsibility_domain_events (responsibility_id, occurred_at DESC, id);

CREATE INDEX responsibility_domain_events_correlation_idx
  ON responsibility_domain_events (correlation_id, id);

CREATE INDEX responsibility_domain_events_source_idx
  ON responsibility_domain_events (source_event_key, occurred_at DESC, id);
```

`application_key` is deterministic before target Responsibility acceptance and namespaced by trusted code. `effect_key` is a deterministic semantic effect slot and MUST NOT depend on a newly generated Responsibility UUID.

---

# 11. `responsibility_provenance_refs`

v0.1 canonical Message provenance is same-account and all AI-run references are same-user.

```sql
CREATE TABLE responsibility_provenance_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL,
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

  CONSTRAINT responsibility_provenance_refs_responsibility_user_fk
    FOREIGN KEY (responsibility_id, user_id)
    REFERENCES responsibilities (id, user_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_provenance_refs_responsibility_account_fk
    FOREIGN KEY (responsibility_id, connected_account_id)
    REFERENCES responsibilities (id, connected_account_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_provenance_refs_review_user_fk
    FOREIGN KEY (admission_review_id, user_id)
    REFERENCES responsibility_admission_reviews (id, user_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_provenance_refs_review_account_fk
    FOREIGN KEY (admission_review_id, connected_account_id)
    REFERENCES responsibility_admission_reviews (id, connected_account_id)
    ON DELETE CASCADE,

  CONSTRAINT responsibility_provenance_refs_message_account_fk
    FOREIGN KEY (message_id, connected_account_id)
    REFERENCES messages (id, connected_account_id)
    ON DELETE RESTRICT,

  CONSTRAINT responsibility_provenance_refs_interpretation_run_user_fk
    FOREIGN KEY (interpretation_run_id, user_id)
    REFERENCES ai_interpretation_runs (id, user_id)
    ON DELETE SET NULL (interpretation_run_id),

  CONSTRAINT responsibility_provenance_refs_domain_event_parent_fk
    FOREIGN KEY (domain_event_id, responsibility_id)
    REFERENCES responsibility_domain_events (id, responsibility_id)
    ON DELETE NO ACTION,

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

If Drizzle cannot express column-list `SET NULL`, use explicit SQL or `NO ACTION`/retention cleanup. Under no circumstance may pruning an AI run null the `user_id` ownership column.

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

`source_excerpt_short` is optional and SHOULD be omitted when source locator/ID is enough.

---

# 12. `semantic_details_v1`

```ts
type ResponsibilitySemanticDetailsV1 = {
  completionCriteria: Array<{
    id: string;
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
    value: unknown;
    status: "PENDING" | "REJECTED" | "SUPERSEDED";
  }>;

  agreedFacts: Array<{
    id: string;
    kind: string;
    value: unknown;
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

Trusted validator rules:

```text
exact known semantic_details_version
unknown top-level keys rejected
local IDs valid/unique
local references resolve
SATISFIED criterion requires satisfiedAt
unresolved shared assignment creates no fabricated required leg
proposal -> agreed fact only through reducer effect/evidence
normalized legs/events/times not duplicated into JSON
raw provider/model payloads and credentials rejected
```

---

# 13. Machine-key contract

Trusted canonical keys:

```text
source_event_key <= 256 ASCII chars
application_key  <= 128 ASCII chars
candidate_key    <= 128 ASCII chars
effect_key       <= 128 ASCII chars
```

They are not raw URLs, message bodies, user text, or model prose.

Tests:

```text
same account/source/revision/application -> same key
different account -> different namespace
different evidence revision -> new application key only when re-application is authorized
model rerun alone -> no new semantic application identity
one application/multiple effects -> distinct stable effect keys
duplicate CREATE with different generated target UUID -> same application/effect key
```

---

# 14. Transaction/concurrency protocol

## 14.1 AI/context capture

Do not label an inconsistent context snapshot with a revision.

Use a short Conversation lock/consistent snapshot to capture:

```text
current semantic_evidence_revision
exact authorized Message/context membership / input-manifest identity
```

Persist the run basis, release DB locks, then call the remote model.

## 14.2 Universal Conversation coordination for admission/matching

Before accepting semantic admission/matching effects from Conversation evidence:

```text
BEGIN
1. SELECT Conversation FOR UPDATE
2. read current semantic_evidence_revision
3. compare candidate/AI basis_evidence_revision
4. reject stale basis before Review/Responsibility creation or mutation
5. perform admission + identity matching against current state in this Conversation
6. lock affected existing Responsibility rows in deterministic UUID order
7. apply idempotent effects
COMMIT
```

Conversation locking is concurrency/evidence coordination, not workflow-state authority.

## 14.3 Existing Responsibility mutation

After the Conversation freshness gate:

```text
1. SELECT affected Responsibility FOR UPDATE
2. verify expected aggregate_version
3. query global (application_key,effect_key); return existing result if already accepted
4. validate FieldDecision/current evidence
5. mutate parent/children/details
6. accepted_evidence_revision := current Conversation semantic_evidence_revision
7. aggregate_version := aggregate_version + 1 exactly once
8. append mutating DomainEvent before/after
9. set updated_at := now() on changed current-state rows
```

## 14.4 CREATE

```text
BEGIN
1. lock Conversation and validate current semantic revision
2. perform admission/identity matching under that lock
3. compute application_key/effect_key before target identity acceptance
4. existing global DomainEvent key pair -> return winning Responsibility
5. generate candidate Responsibility UUID
6. insert Responsibility with accepted_evidence_revision=current Conversation revision
7. insert current children
8. insert CREATE DomainEvent before=0, after=1
9. global unique(application_key,effect_key) arbitrates duplicate CREATE
COMMIT
```

## 14.5 Composite effects

Lock Conversation first, then existing Responsibility rows in deterministic UUID order. Atomic effects such as `SUPERSEDE R1 + CREATE R2` share application/correlation context and have distinct deterministic effect keys.

## 14.6 AdmissionReview

```text
BEGIN
1. lock Conversation; verify current semantic revision
2. SELECT AdmissionReview FOR UPDATE if present
3. verify expected Review aggregate_version
4. RESOLVED -> return terminal result idempotently
5. OPEN re-evaluation may only move basis_evidence_revision forward/current
6. TRACK -> create/load Responsibility through global CREATE idempotency; link same-account R
7. DO_NOT_TRACK -> terminal resolution
8. set resolver/resolved_at; increment Review version; updated_at=now()
COMMIT
```

## 14.7 Isolation

Default remains PostgreSQL `READ COMMITTED` + explicit locks + deterministic lock order + unique/FK constraints + version checks. Use `SERIALIZABLE` with retry only for a later demonstrated invariant that cannot be protected cleanly by this protocol.

---

# 15. DB-enforced vs runtime-enforced

## PostgreSQL-enforced

```text
Responsibility/Review account + user ownership
same-user Participant references
same-user AIInterpretationRun references
same-Responsibility activation/temporal child references
finite structural states
resolution/reason/timestamp consistency
defer/live consistency
DATE/INSTANT/UNRESOLVED shape
one accepted-current temporal fact per target/kind
conflict candidates coexist
one active FieldDecision per field
one open AdmissionReview per source/candidate
same source/candidate/basis Review cannot reappear
same-account TRACK Review link
global application/effect idempotency
one mutating event per resulting aggregate version
same-account Message provenance
same-user AI-run provenance
a same-Responsibility DomainEvent provenance link
JSON object shape / bounded machine keys
```

## Trusted runtime/reducer

```text
when Conversation.semantic_evidence_revision advances
AI ContextEnvelope authorization + snapshot/revision consistency
Conversation-first admission/matching lock protocol
DEFERRED -> valid TemporalContract/return condition
parent closure policy/criteria
ExpectedEvent satisfaction authority
field/action/event/authority registries
semantic_details_v1 deep validation
semantic chronology/correction/supersession authority
high-risk safe-action policy
provider_observation_key account ownership
updated_at maintenance
```

---

# 16. Delete/retention

Normal domain transitions close/supersede rows rather than hard-delete them.

Hard delete is explicit privacy/account teardown.

```text
Responsibility -> aggregate-local rows/provenance/history: CASCADE
AdmissionReview -> Review provenance: CASCADE
TRACK Review -> admitted Responsibility: RESTRICT/NO ACTION
cross-child event/leg references: NO ACTION
Provenance -> Message: RESTRICT
AIInterpretationRun links: prune through column-list SET NULL when supported,
                           otherwise explicit cleanup/NO ACTION
```

Privacy deletion order:

```text
1. delete Responsibility/AdmissionReview state + provenance/history as policy requires
2. delete Message/provider evidence
3. prune AI runs according to retention policy with ownership-safe references
4. delete account/auth secret material
```

Executable tests must prove the actual FK graph and teardown sequence.

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

PostgreSQL supports column-list `SET NULL` on multi-column FKs, but current Drizzle emission for that exact clause MUST be checked. If unclear, use explicit migration SQL or `NO ACTION` + explicit cleanup. Never null a tenant owner column to prune an optional AI-run link.

Raw SQL is acceptable where it makes correctness clearer, especially `SELECT ... FOR UPDATE` or exact PostgreSQL constraint clauses.

Generated SQL must be reviewed against this contract. Type hints / `$type` are not runtime validation.

---

# 18. L2 executable acceptance suite

The L2 proof instantiated the Drizzle-generated schema on temporary PostgreSQL 18 and proved:

## Parent/state

```text
01 invalid RESOLVED without reason/timestamp rejected
02 DEFERRED + HISTORICAL_INACTIVE rejected
03 one Conversation can contain multiple Responsibilities
04 account/conversation mismatch rejected
```

## Temporal

```text
05 duplicate ACCEPTED_CURRENT parent temporal fact rejected
06 duplicate ACCEPTED_CURRENT leg temporal fact rejected
07 duplicate ACCEPTED_CURRENT event temporal fact rejected
08 multiple CONFLICT_CANDIDATE values allowed
09 DATE with resolved_at rejected
10 INSTANT with resolved_date rejected
11 UNRESOLVED retains source expression without fabricated value
12 ACCEPTED_CURRENT with superseded_at rejected
13 cross-Responsibility leg target rejected
14 cross-Responsibility event target rejected
```

## Legs/events

```text
15 multiple USER/PARTICIPANT legs allowed
16 cross-Responsibility activation event rejected
17 participant belonging to another Lunowa user rejected
18 CLOSED ExpectedEvent requires closed_at
19 cancelled/invalidated event closure does not require fake satisfied_at
```

## Field decisions

```text
20 two ACTIVE decisions for same field rejected
21 superseded decision requires superseded_at
```

## AdmissionReview

```text
22 two OPEN reviews for same account/source/candidate rejected
23 same source/candidate/basis revision cannot be recreated after resolution
24 new basis revision can form/re-evaluate a new episode when policy permits
25 TRACK requires admitted Responsibility
26 TRACK link to another account rejected
27 deleting TRACKed admitted Responsibility rejected while Review history remains
28 DO_NOT_TRACK has no Responsibility requirement
29 Review resolution retry returns same terminal result/no duplicate Responsibility
```

## Idempotency/history

```text
30 duplicate global (application_key,effect_key) rejected
31 concurrent duplicate CREATE with different generated Responsibility UUIDs -> exactly one commit
32 two mutating events cannot claim same resulting aggregate version
33 NO_OP may retain current aggregate version under distinct application/effect identity
34 stale aggregate command cannot overwrite current accepted state
35 one source application can atomically affect multiple Responsibilities
```

## Provenance/account

```text
36 Message from another connected account rejected as provenance
37 DomainEvent from another Responsibility rejected as provenance
38 provenance support-role/locator works without copied full body
```

## Delete/privacy

```text
39 parent hard-delete removes aggregate-local state/history/provenance only
40 parent delete succeeds with cross-child FK graph or approved explicit teardown order
41 Message deletion blocked while provenance exists
42 explicit privacy deletion order succeeds
```

## Semantic details

```text
43 invalid semantic-details version/object rejected by trusted runtime
44 duplicate local semantic-detail IDs rejected
45 unresolved ANY_OF creates no fabricated required legs
46 proposal does not become agreed fact without reducer effect/evidence
```

## Auth UUID

```text
47 actual Better Auth user PK is PostgreSQL uuid
48 sign-up/session/account-linking roundtrip works against exact UUID schema
49 Better Auth schema generation does not silently revert user IDs to text
```

## Conversation evidence freshness

```text
50 stale rev N direct TRACK/CREATE rejected after Conversation advances to rev N+1
51 stale rev N AdmissionReview create/update rejected after rev N+1
52 semantically related Conversation events processed concurrently serialize admission/matching
53 duplicate same-revision CREATE still rejected by global application/effect idempotency
54 UI/read-only changes do not advance semantic_evidence_revision
55 relevant semantic Message/Attachment/provider evidence advances semantic_evidence_revision
56 Responsibility accepted_evidence_revision records last applied basis without masquerading as current Conversation revision
57 concurrent evidence arrival cannot produce an AI run whose basis revision labels a mixed/incorrect context snapshot
```

## AI-run tenant integrity

```text
58 another user's AIInterpretationRun cannot be linked to AdmissionReview
59 another user's AIInterpretationRun cannot be linked to Responsibility DomainEvent
60 another user's AIInterpretationRun cannot be linked to Responsibility/Review provenance
```

No migration is authorized until this suite or an explicitly equivalent set passes.

---

# 19. Oracle-to-DDL map

| Boundary | Primary semantic pressure |
| --- | --- |
| Conversation semantic revision/lock | stale AI invariant, T15, T0-043 context revision |
| parent orthogonal columns | T0-014/015/038, T07/T08/T20 |
| obligation legs | T0-003/004/012/020/029/031/036, T16/T18 |
| expected events | T0-002/003/005..008/017/034, T02/T04/T09/T18 |
| temporal facts | T0-001..008/018/026..028, T19 |
| semantic details | T0-009..011/014/033/040, T05/T06/T07/T17 |
| field decisions | T0-026 negative boundary, T0-027/028, T15 |
| AdmissionReview | T0-041..044/T0-042 |
| provenance | T0-022/025/027/028/034/037, M39/R27 |
| global DomainEvent idempotency | V16, T10..T15, duplicate CREATE pressure |
| account/user integrity | T0-039, H06/H13, authorization invariants |

---

# 20. Open trusted-code registries/policies

Still intentionally not frozen as database vocabularies:

```text
action_code
event_code
basis_kind / expectation_strength
leg/event closure_reason
FieldDecision field/value/authority registry
support_role / evidence_kind
semantic-details validator implementation
machine-key hashing/encoding
query/repository helper names
```

They are bounded/tested in trusted code. Freezing their complete vocabulary before real data would be false precision.

---

# 21. Static-review verdict

```text
L0 semantic model                    FROZEN v0.1 baseline
L1 logical persistence boundary      FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle schema   FROZEN — DDL v0.4
L2 executable proof                  PASS (60/60 acceptance IDs)
L2 final freeze                      PASS/FREEZE through Issue #15
L3 migrations/runtime                NOT AUTHORIZED by this freeze
```

No further table invention is justified by the current corpus/static or executable audit. DDL v0.4 is the exact-schema authority; production migration and runtime work remain a separate explicitly authorized L3 task.
