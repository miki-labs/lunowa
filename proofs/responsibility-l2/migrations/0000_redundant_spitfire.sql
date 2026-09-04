CREATE TABLE "p13_fixture_ai_interpretation_runs" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"basis_evidence_revision" bigint NOT NULL,
	"context_manifest" jsonb DEFAULT '{"messageIds":[]}'::jsonb NOT NULL,
	CONSTRAINT "p13_fixture_ai_runs_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "p13_fixture_ai_runs_revision_nonnegative" CHECK ("p13_fixture_ai_interpretation_runs"."basis_evidence_revision" >= 0)
);
--> statement-breakpoint
CREATE TABLE "p13_fixture_connected_accounts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "p13_fixture_connected_accounts_id_user_uq" UNIQUE("id","user_id")
);
--> statement-breakpoint
CREATE TABLE "p13_fixture_conversations" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"semantic_evidence_revision" bigint DEFAULT 0 NOT NULL,
	"ui_read_at" timestamp (3) with time zone,
	CONSTRAINT "p13_fixture_conversations_id_account_uq" UNIQUE("id","connected_account_id"),
	CONSTRAINT "p13_fixture_conversations_revision_nonnegative" CHECK ("p13_fixture_conversations"."semantic_evidence_revision" >= 0)
);
--> statement-breakpoint
CREATE TABLE "p13_fixture_messages" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"evidence_revision" bigint DEFAULT 0 NOT NULL,
	"content_marker" text NOT NULL,
	CONSTRAINT "p13_fixture_messages_id_account_uq" UNIQUE("id","connected_account_id")
);
--> statement-breakpoint
CREATE TABLE "p13_fixture_participant_identities" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "p13_fixture_participants_id_user_uq" UNIQUE("id","user_id")
);
--> statement-breakpoint
CREATE TABLE "p13_fixture_users" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responsibilities" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"operational_outcome" text NOT NULL,
	"resolution_status" text DEFAULT 'OPEN' NOT NULL,
	"resolution_reason" text,
	"live_tracking_state" text DEFAULT 'TRACKING_ACTIVE' NOT NULL,
	"attention_mode" text DEFAULT 'PRESENT' NOT NULL,
	"semantic_details_version" smallint DEFAULT 1 NOT NULL,
	"semantic_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"accepted_evidence_revision" bigint NOT NULL,
	"aggregate_version" bigint DEFAULT 1 NOT NULL,
	"resolved_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibilities_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "responsibilities_id_account_uq" UNIQUE("id","connected_account_id"),
	CONSTRAINT "responsibilities_operational_outcome_nonempty" CHECK (char_length(btrim("responsibilities"."operational_outcome")) BETWEEN 1 AND 2048),
	CONSTRAINT "responsibilities_resolution_status_check" CHECK ("responsibilities"."resolution_status" IN ('OPEN', 'RESOLVED')),
	CONSTRAINT "responsibilities_resolution_reason_check" CHECK ("responsibilities"."resolution_reason" IS NULL OR "responsibilities"."resolution_reason" IN ('SATISFIED', 'DECLINED', 'CANCELLED', 'SUPERSEDED', 'USER_CLOSED', 'INVALIDATED', 'DUPLICATE')),
	CONSTRAINT "responsibilities_resolution_consistency_check" CHECK (("responsibilities"."resolution_status" = 'OPEN' AND "responsibilities"."resolution_reason" IS NULL AND "responsibilities"."resolved_at" IS NULL) OR ("responsibilities"."resolution_status" = 'RESOLVED' AND "responsibilities"."resolution_reason" IS NOT NULL AND "responsibilities"."resolved_at" IS NOT NULL)),
	CONSTRAINT "responsibilities_live_tracking_state_check" CHECK ("responsibilities"."live_tracking_state" IN ('TRACKING_ACTIVE', 'HISTORICAL_INACTIVE')),
	CONSTRAINT "responsibilities_attention_mode_check" CHECK ("responsibilities"."attention_mode" IN ('PRESENT', 'DEFERRED')),
	CONSTRAINT "responsibilities_deferred_state_check" CHECK ("responsibilities"."attention_mode" <> 'DEFERRED' OR ("responsibilities"."resolution_status" = 'OPEN' AND "responsibilities"."live_tracking_state" = 'TRACKING_ACTIVE')),
	CONSTRAINT "responsibilities_historical_attention_check" CHECK ("responsibilities"."live_tracking_state" <> 'HISTORICAL_INACTIVE' OR "responsibilities"."attention_mode" = 'PRESENT'),
	CONSTRAINT "responsibilities_semantic_details_version_check" CHECK ("responsibilities"."semantic_details_version" >= 1),
	CONSTRAINT "responsibilities_semantic_details_object_check" CHECK (jsonb_typeof("responsibilities"."semantic_details") = 'object'),
	CONSTRAINT "responsibilities_accepted_evidence_revision_check" CHECK ("responsibilities"."accepted_evidence_revision" >= 0),
	CONSTRAINT "responsibilities_aggregate_version_check" CHECK ("responsibilities"."aggregate_version" >= 1)
);
--> statement-breakpoint
CREATE TABLE "responsibility_admission_reviews" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"review_status" text DEFAULT 'OPEN' NOT NULL,
	"resolution" text,
	"reason_codes" text[] NOT NULL,
	"candidate_schema_version" smallint DEFAULT 1 NOT NULL,
	"candidate_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"basis_evidence_revision" bigint NOT NULL,
	"aggregate_version" bigint DEFAULT 1 NOT NULL,
	"source_event_key" text NOT NULL,
	"candidate_key" text NOT NULL,
	"interpretation_run_id" uuid,
	"admitted_responsibility_id" uuid,
	"resolved_by_actor_kind" text,
	"resolved_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibility_admission_reviews_id_account_uq" UNIQUE("id","connected_account_id"),
	CONSTRAINT "responsibility_admission_reviews_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "responsibility_admission_reviews_same_revision_uq" UNIQUE("connected_account_id","source_event_key","candidate_key","basis_evidence_revision"),
	CONSTRAINT "responsibility_admission_reviews_status_check" CHECK ("responsibility_admission_reviews"."review_status" IN ('OPEN', 'RESOLVED')),
	CONSTRAINT "responsibility_admission_reviews_resolution_check" CHECK ("responsibility_admission_reviews"."resolution" IS NULL OR "responsibility_admission_reviews"."resolution" IN ('TRACK', 'DO_NOT_TRACK')),
	CONSTRAINT "responsibility_admission_reviews_reason_codes_check" CHECK (cardinality("responsibility_admission_reviews"."reason_codes") >= 1),
	CONSTRAINT "responsibility_admission_reviews_resolution_shape_check" CHECK (("responsibility_admission_reviews"."review_status" = 'OPEN' AND "responsibility_admission_reviews"."resolution" IS NULL AND "responsibility_admission_reviews"."admitted_responsibility_id" IS NULL AND "responsibility_admission_reviews"."resolved_by_actor_kind" IS NULL AND "responsibility_admission_reviews"."resolved_at" IS NULL) OR ("responsibility_admission_reviews"."review_status" = 'RESOLVED' AND "responsibility_admission_reviews"."resolution" = 'DO_NOT_TRACK' AND "responsibility_admission_reviews"."admitted_responsibility_id" IS NULL AND "responsibility_admission_reviews"."resolved_by_actor_kind" IS NOT NULL AND "responsibility_admission_reviews"."resolved_at" IS NOT NULL) OR ("responsibility_admission_reviews"."review_status" = 'RESOLVED' AND "responsibility_admission_reviews"."resolution" = 'TRACK' AND "responsibility_admission_reviews"."admitted_responsibility_id" IS NOT NULL AND "responsibility_admission_reviews"."resolved_by_actor_kind" IS NOT NULL AND "responsibility_admission_reviews"."resolved_at" IS NOT NULL)),
	CONSTRAINT "responsibility_admission_reviews_candidate_object_check" CHECK (jsonb_typeof("responsibility_admission_reviews"."candidate_summary") = 'object'),
	CONSTRAINT "responsibility_admission_reviews_candidate_version_check" CHECK ("responsibility_admission_reviews"."candidate_schema_version" >= 1),
	CONSTRAINT "responsibility_admission_reviews_basis_revision_check" CHECK ("responsibility_admission_reviews"."basis_evidence_revision" >= 0),
	CONSTRAINT "responsibility_admission_reviews_aggregate_version_check" CHECK ("responsibility_admission_reviews"."aggregate_version" >= 1),
	CONSTRAINT "responsibility_admission_reviews_source_event_key_check" CHECK (char_length(btrim("responsibility_admission_reviews"."source_event_key")) BETWEEN 1 AND 256),
	CONSTRAINT "responsibility_admission_reviews_candidate_key_check" CHECK (char_length(btrim("responsibility_admission_reviews"."candidate_key")) BETWEEN 1 AND 128)
);
--> statement-breakpoint
CREATE TABLE "responsibility_domain_events" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"operation" text NOT NULL,
	"actor_kind" text NOT NULL,
	"reason_codes" text[] NOT NULL,
	"basis_evidence_revision" bigint NOT NULL,
	"aggregate_version_before" bigint NOT NULL,
	"aggregate_version_after" bigint NOT NULL,
	"mutates_state" boolean NOT NULL,
	"source_event_key" text NOT NULL,
	"application_key" text NOT NULL,
	"effect_key" text NOT NULL,
	"correlation_id" uuid NOT NULL,
	"reducer_version" text NOT NULL,
	"interpretation_run_id" uuid,
	"change_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibility_domain_events_id_parent_uq" UNIQUE("id","responsibility_id"),
	CONSTRAINT "responsibility_domain_events_operation_check" CHECK ("responsibility_domain_events"."operation" IN ('CREATE', 'UPDATE', 'RESOLVE', 'REOPEN', 'SUPERSEDE', 'INVALIDATE', 'NO_OP')),
	CONSTRAINT "responsibility_domain_events_noop_shape_check" CHECK (("responsibility_domain_events"."mutates_state" AND "responsibility_domain_events"."operation" <> 'NO_OP') OR (NOT "responsibility_domain_events"."mutates_state" AND "responsibility_domain_events"."operation" = 'NO_OP')),
	CONSTRAINT "responsibility_domain_events_reason_codes_check" CHECK (cardinality("responsibility_domain_events"."reason_codes") >= 1),
	CONSTRAINT "responsibility_domain_events_revision_check" CHECK ("responsibility_domain_events"."basis_evidence_revision" >= 0),
	CONSTRAINT "responsibility_domain_events_version_check" CHECK ("responsibility_domain_events"."aggregate_version_before" >= 0 AND "responsibility_domain_events"."aggregate_version_after" >= 1 AND (("responsibility_domain_events"."mutates_state" AND "responsibility_domain_events"."aggregate_version_after" = "responsibility_domain_events"."aggregate_version_before" + 1) OR (NOT "responsibility_domain_events"."mutates_state" AND "responsibility_domain_events"."aggregate_version_after" = "responsibility_domain_events"."aggregate_version_before"))),
	CONSTRAINT "responsibility_domain_events_actor_kind_check" CHECK (char_length(btrim("responsibility_domain_events"."actor_kind")) BETWEEN 1 AND 64),
	CONSTRAINT "responsibility_domain_events_source_key_check" CHECK (char_length(btrim("responsibility_domain_events"."source_event_key")) BETWEEN 1 AND 256),
	CONSTRAINT "responsibility_domain_events_application_key_check" CHECK (char_length(btrim("responsibility_domain_events"."application_key")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_domain_events_effect_key_check" CHECK (char_length(btrim("responsibility_domain_events"."effect_key")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_domain_events_reducer_version_check" CHECK (char_length(btrim("responsibility_domain_events"."reducer_version")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_domain_events_change_summary_object_check" CHECK (jsonb_typeof("responsibility_domain_events"."change_summary") = 'object')
);
--> statement-breakpoint
CREATE TABLE "responsibility_expected_events" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"actor_kind" text NOT NULL,
	"actor_participant_id" uuid,
	"event_code" text NOT NULL,
	"event_summary" text,
	"event_status" text DEFAULT 'PENDING' NOT NULL,
	"closure_reason" text,
	"basis_kind" text,
	"expectation_strength" text,
	"satisfied_at" timestamp (3) with time zone,
	"closed_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibility_expected_events_id_parent_uq" UNIQUE("id","responsibility_id"),
	CONSTRAINT "responsibility_expected_events_actor_kind_check" CHECK ("responsibility_expected_events"."actor_kind" IN ('PARTICIPANT', 'EXTERNAL')),
	CONSTRAINT "responsibility_expected_events_actor_reference_check" CHECK (("responsibility_expected_events"."actor_kind" = 'PARTICIPANT' AND "responsibility_expected_events"."actor_participant_id" IS NOT NULL) OR ("responsibility_expected_events"."actor_kind" = 'EXTERNAL' AND "responsibility_expected_events"."actor_participant_id" IS NULL)),
	CONSTRAINT "responsibility_expected_events_status_check" CHECK ("responsibility_expected_events"."event_status" IN ('PENDING', 'CLOSED')),
	CONSTRAINT "responsibility_expected_events_closure_check" CHECK (("responsibility_expected_events"."event_status" = 'PENDING' AND "responsibility_expected_events"."closure_reason" IS NULL AND "responsibility_expected_events"."satisfied_at" IS NULL AND "responsibility_expected_events"."closed_at" IS NULL) OR ("responsibility_expected_events"."event_status" = 'CLOSED' AND "responsibility_expected_events"."closure_reason" IS NOT NULL AND "responsibility_expected_events"."closed_at" IS NOT NULL AND ("responsibility_expected_events"."satisfied_at" IS NULL OR "responsibility_expected_events"."closure_reason" = 'SATISFIED'))),
	CONSTRAINT "responsibility_expected_events_event_code_nonempty" CHECK (char_length(btrim("responsibility_expected_events"."event_code")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_expected_events_summary_length" CHECK ("responsibility_expected_events"."event_summary" IS NULL OR char_length("responsibility_expected_events"."event_summary") <= 1024)
);
--> statement-breakpoint
CREATE TABLE "responsibility_field_decisions" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"field_key" text NOT NULL,
	"value_schema_version" smallint DEFAULT 1 NOT NULL,
	"value_jsonb" jsonb NOT NULL,
	"authority_kind" text NOT NULL,
	"basis_evidence_revision" bigint NOT NULL,
	"decision_status" text DEFAULT 'ACTIVE' NOT NULL,
	"superseded_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibility_field_decisions_field_key_nonempty" CHECK (char_length(btrim("responsibility_field_decisions"."field_key")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_field_decisions_value_version_check" CHECK ("responsibility_field_decisions"."value_schema_version" >= 1),
	CONSTRAINT "responsibility_field_decisions_basis_revision_check" CHECK ("responsibility_field_decisions"."basis_evidence_revision" >= 0),
	CONSTRAINT "responsibility_field_decisions_status_check" CHECK ("responsibility_field_decisions"."decision_status" IN ('ACTIVE', 'SUPERSEDED')),
	CONSTRAINT "responsibility_field_decisions_superseded_check" CHECK (("responsibility_field_decisions"."decision_status" = 'ACTIVE' AND "responsibility_field_decisions"."superseded_at" IS NULL) OR ("responsibility_field_decisions"."decision_status" = 'SUPERSEDED' AND "responsibility_field_decisions"."superseded_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "responsibility_obligation_legs" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"bearer_kind" text NOT NULL,
	"bearer_participant_id" uuid,
	"action_code" text NOT NULL,
	"action_summary" text,
	"object_summary" text,
	"leg_status" text DEFAULT 'OPEN' NOT NULL,
	"closure_reason" text,
	"actionability" text DEFAULT 'ACTIONABLE' NOT NULL,
	"basis_kind" text NOT NULL,
	"authority_status" text,
	"activation_event_id" uuid,
	"closed_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibility_obligation_legs_id_parent_uq" UNIQUE("id","responsibility_id"),
	CONSTRAINT "responsibility_obligation_legs_bearer_kind_check" CHECK ("responsibility_obligation_legs"."bearer_kind" IN ('USER', 'PARTICIPANT')),
	CONSTRAINT "responsibility_obligation_legs_bearer_reference_check" CHECK (("responsibility_obligation_legs"."bearer_kind" = 'USER' AND "responsibility_obligation_legs"."bearer_participant_id" IS NULL) OR ("responsibility_obligation_legs"."bearer_kind" = 'PARTICIPANT' AND "responsibility_obligation_legs"."bearer_participant_id" IS NOT NULL)),
	CONSTRAINT "responsibility_obligation_legs_status_check" CHECK ("responsibility_obligation_legs"."leg_status" IN ('OPEN', 'CLOSED')),
	CONSTRAINT "responsibility_obligation_legs_closure_check" CHECK (("responsibility_obligation_legs"."leg_status" = 'OPEN' AND "responsibility_obligation_legs"."closure_reason" IS NULL AND "responsibility_obligation_legs"."closed_at" IS NULL) OR ("responsibility_obligation_legs"."leg_status" = 'CLOSED' AND "responsibility_obligation_legs"."closure_reason" IS NOT NULL AND "responsibility_obligation_legs"."closed_at" IS NOT NULL)),
	CONSTRAINT "responsibility_obligation_legs_actionability_check" CHECK ("responsibility_obligation_legs"."actionability" IN ('ACTIONABLE', 'BLOCKED')),
	CONSTRAINT "responsibility_obligation_legs_action_code_nonempty" CHECK (char_length(btrim("responsibility_obligation_legs"."action_code")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_obligation_legs_basis_kind_nonempty" CHECK (char_length(btrim("responsibility_obligation_legs"."basis_kind")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_obligation_legs_summary_length" CHECK ("responsibility_obligation_legs"."action_summary" IS NULL OR char_length("responsibility_obligation_legs"."action_summary") <= 1024),
	CONSTRAINT "responsibility_obligation_legs_object_length" CHECK ("responsibility_obligation_legs"."object_summary" IS NULL OR char_length("responsibility_obligation_legs"."object_summary") <= 1024)
);
--> statement-breakpoint
CREATE TABLE "responsibility_provenance_refs" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"responsibility_id" uuid,
	"admission_review_id" uuid,
	"target_kind" text NOT NULL,
	"target_id" uuid,
	"field_key" text,
	"support_role" text,
	"evidence_kind" text NOT NULL,
	"message_id" uuid,
	"provider_observation_key" text,
	"interpretation_run_id" uuid,
	"domain_event_id" uuid,
	"source_locator" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source_excerpt_short" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibility_provenance_refs_owner_check" CHECK (("responsibility_provenance_refs"."responsibility_id" IS NOT NULL AND "responsibility_provenance_refs"."admission_review_id" IS NULL) OR ("responsibility_provenance_refs"."responsibility_id" IS NULL AND "responsibility_provenance_refs"."admission_review_id" IS NOT NULL)),
	CONSTRAINT "responsibility_provenance_refs_domain_event_owner_check" CHECK ("responsibility_provenance_refs"."domain_event_id" IS NULL OR "responsibility_provenance_refs"."responsibility_id" IS NOT NULL),
	CONSTRAINT "responsibility_provenance_refs_target_kind_nonempty" CHECK (char_length(btrim("responsibility_provenance_refs"."target_kind")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_provenance_refs_evidence_kind_nonempty" CHECK (char_length(btrim("responsibility_provenance_refs"."evidence_kind")) BETWEEN 1 AND 128),
	CONSTRAINT "responsibility_provenance_refs_evidence_present_check" CHECK ("responsibility_provenance_refs"."message_id" IS NOT NULL OR "responsibility_provenance_refs"."provider_observation_key" IS NOT NULL OR "responsibility_provenance_refs"."interpretation_run_id" IS NOT NULL OR "responsibility_provenance_refs"."domain_event_id" IS NOT NULL),
	CONSTRAINT "responsibility_provenance_refs_locator_object_check" CHECK (jsonb_typeof("responsibility_provenance_refs"."source_locator") = 'object'),
	CONSTRAINT "responsibility_provenance_refs_excerpt_length" CHECK ("responsibility_provenance_refs"."source_excerpt_short" IS NULL OR char_length("responsibility_provenance_refs"."source_excerpt_short") <= 512)
);
--> statement-breakpoint
CREATE TABLE "responsibility_temporal_facts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"temporal_kind" text NOT NULL,
	"obligation_leg_id" uuid,
	"expected_event_id" uuid,
	"original_expression" text,
	"value_kind" text NOT NULL,
	"resolved_date" date,
	"resolved_at" timestamp (3) with time zone,
	"precision_code" text NOT NULL,
	"reference_timezone" text,
	"anchor_kind" text,
	"anchor_reference" text,
	"anchor_offset_seconds" integer,
	"currentness_status" text DEFAULT 'ACCEPTED_CURRENT' NOT NULL,
	"authority_status" text,
	"superseded_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responsibility_temporal_facts_kind_check" CHECK ("responsibility_temporal_facts"."temporal_kind" IN ('SOURCE_DUE', 'EXPECTED_EVENT_TIME', 'USER_TARGET')),
	CONSTRAINT "responsibility_temporal_facts_single_target_check" CHECK (NOT ("responsibility_temporal_facts"."obligation_leg_id" IS NOT NULL AND "responsibility_temporal_facts"."expected_event_id" IS NOT NULL)),
	CONSTRAINT "responsibility_temporal_facts_value_kind_check" CHECK ("responsibility_temporal_facts"."value_kind" IN ('DATE', 'INSTANT', 'UNRESOLVED')),
	CONSTRAINT "responsibility_temporal_facts_value_shape_check" CHECK (("responsibility_temporal_facts"."value_kind" = 'DATE' AND "responsibility_temporal_facts"."resolved_date" IS NOT NULL AND "responsibility_temporal_facts"."resolved_at" IS NULL) OR ("responsibility_temporal_facts"."value_kind" = 'INSTANT' AND "responsibility_temporal_facts"."resolved_date" IS NULL AND "responsibility_temporal_facts"."resolved_at" IS NOT NULL) OR ("responsibility_temporal_facts"."value_kind" = 'UNRESOLVED' AND "responsibility_temporal_facts"."resolved_date" IS NULL AND "responsibility_temporal_facts"."resolved_at" IS NULL)),
	CONSTRAINT "responsibility_temporal_facts_original_expression_length" CHECK ("responsibility_temporal_facts"."original_expression" IS NULL OR char_length("responsibility_temporal_facts"."original_expression") <= 512),
	CONSTRAINT "responsibility_temporal_facts_precision_nonempty" CHECK (char_length(btrim("responsibility_temporal_facts"."precision_code")) BETWEEN 1 AND 64),
	CONSTRAINT "responsibility_temporal_facts_currentness_check" CHECK ("responsibility_temporal_facts"."currentness_status" IN ('ACCEPTED_CURRENT', 'CONFLICT_CANDIDATE', 'SUPERSEDED', 'HISTORICAL')),
	CONSTRAINT "responsibility_temporal_facts_superseded_time_check" CHECK (("responsibility_temporal_facts"."currentness_status" = 'SUPERSEDED' AND "responsibility_temporal_facts"."superseded_at" IS NOT NULL) OR ("responsibility_temporal_facts"."currentness_status" <> 'SUPERSEDED' AND "responsibility_temporal_facts"."superseded_at" IS NULL)),
	CONSTRAINT "responsibility_temporal_facts_anchor_shape_check" CHECK (("responsibility_temporal_facts"."anchor_kind" IS NULL AND "responsibility_temporal_facts"."anchor_reference" IS NULL AND "responsibility_temporal_facts"."anchor_offset_seconds" IS NULL) OR ("responsibility_temporal_facts"."anchor_kind" IS NOT NULL AND "responsibility_temporal_facts"."anchor_reference" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "p13_fixture_ai_interpretation_runs" ADD CONSTRAINT "p13_fixture_ai_runs_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."p13_fixture_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p13_fixture_connected_accounts" ADD CONSTRAINT "p13_fixture_connected_accounts_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."p13_fixture_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p13_fixture_conversations" ADD CONSTRAINT "p13_fixture_conversations_account_fk" FOREIGN KEY ("connected_account_id") REFERENCES "public"."p13_fixture_connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p13_fixture_messages" ADD CONSTRAINT "p13_fixture_messages_account_fk" FOREIGN KEY ("connected_account_id") REFERENCES "public"."p13_fixture_connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p13_fixture_messages" ADD CONSTRAINT "p13_fixture_messages_conversation_account_fk" FOREIGN KEY ("conversation_id","connected_account_id") REFERENCES "public"."p13_fixture_conversations"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p13_fixture_participant_identities" ADD CONSTRAINT "p13_fixture_participants_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."p13_fixture_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibilities" ADD CONSTRAINT "responsibilities_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."p13_fixture_connected_accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibilities" ADD CONSTRAINT "responsibilities_conversation_account_fk" FOREIGN KEY ("conversation_id","connected_account_id") REFERENCES "public"."p13_fixture_conversations"("id","connected_account_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_admission_reviews" ADD CONSTRAINT "responsibility_admission_reviews_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."p13_fixture_connected_accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_admission_reviews" ADD CONSTRAINT "responsibility_admission_reviews_conversation_account_fk" FOREIGN KEY ("conversation_id","connected_account_id") REFERENCES "public"."p13_fixture_conversations"("id","connected_account_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_admission_reviews" ADD CONSTRAINT "responsibility_admission_reviews_admitted_account_fk" FOREIGN KEY ("admitted_responsibility_id","connected_account_id") REFERENCES "public"."responsibilities"("id","connected_account_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_admission_reviews" ADD CONSTRAINT "responsibility_admission_reviews_interpretation_run_user_fk" FOREIGN KEY ("interpretation_run_id","user_id") REFERENCES "public"."p13_fixture_ai_interpretation_runs"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_domain_events" ADD CONSTRAINT "responsibility_domain_events_parent_user_fk" FOREIGN KEY ("responsibility_id","user_id") REFERENCES "public"."responsibilities"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_domain_events" ADD CONSTRAINT "responsibility_domain_events_interpretation_run_user_fk" FOREIGN KEY ("interpretation_run_id","user_id") REFERENCES "public"."p13_fixture_ai_interpretation_runs"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_expected_events" ADD CONSTRAINT "responsibility_expected_events_parent_user_fk" FOREIGN KEY ("responsibility_id","user_id") REFERENCES "public"."responsibilities"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_expected_events" ADD CONSTRAINT "responsibility_expected_events_participant_user_fk" FOREIGN KEY ("actor_participant_id","user_id") REFERENCES "public"."p13_fixture_participant_identities"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_field_decisions" ADD CONSTRAINT "responsibility_field_decisions_responsibility_id_responsibilities_id_fk" FOREIGN KEY ("responsibility_id") REFERENCES "public"."responsibilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_obligation_legs" ADD CONSTRAINT "responsibility_obligation_legs_parent_user_fk" FOREIGN KEY ("responsibility_id","user_id") REFERENCES "public"."responsibilities"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_obligation_legs" ADD CONSTRAINT "responsibility_obligation_legs_participant_user_fk" FOREIGN KEY ("bearer_participant_id","user_id") REFERENCES "public"."p13_fixture_participant_identities"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_obligation_legs" ADD CONSTRAINT "responsibility_obligation_legs_activation_event_parent_fk" FOREIGN KEY ("activation_event_id","responsibility_id") REFERENCES "public"."responsibility_expected_events"("id","responsibility_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_provenance_refs" ADD CONSTRAINT "responsibility_provenance_refs_responsibility_user_fk" FOREIGN KEY ("responsibility_id","user_id") REFERENCES "public"."responsibilities"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_provenance_refs" ADD CONSTRAINT "responsibility_provenance_refs_responsibility_account_fk" FOREIGN KEY ("responsibility_id","connected_account_id") REFERENCES "public"."responsibilities"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_provenance_refs" ADD CONSTRAINT "responsibility_provenance_refs_review_user_fk" FOREIGN KEY ("admission_review_id","user_id") REFERENCES "public"."responsibility_admission_reviews"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_provenance_refs" ADD CONSTRAINT "responsibility_provenance_refs_review_account_fk" FOREIGN KEY ("admission_review_id","connected_account_id") REFERENCES "public"."responsibility_admission_reviews"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_provenance_refs" ADD CONSTRAINT "responsibility_provenance_refs_message_account_fk" FOREIGN KEY ("message_id","connected_account_id") REFERENCES "public"."p13_fixture_messages"("id","connected_account_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_provenance_refs" ADD CONSTRAINT "responsibility_provenance_refs_interpretation_run_user_fk" FOREIGN KEY ("interpretation_run_id","user_id") REFERENCES "public"."p13_fixture_ai_interpretation_runs"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_provenance_refs" ADD CONSTRAINT "responsibility_provenance_refs_domain_event_parent_fk" FOREIGN KEY ("domain_event_id","responsibility_id") REFERENCES "public"."responsibility_domain_events"("id","responsibility_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_temporal_facts" ADD CONSTRAINT "responsibility_temporal_facts_responsibility_id_responsibilities_id_fk" FOREIGN KEY ("responsibility_id") REFERENCES "public"."responsibilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_temporal_facts" ADD CONSTRAINT "responsibility_temporal_facts_leg_parent_fk" FOREIGN KEY ("obligation_leg_id","responsibility_id") REFERENCES "public"."responsibility_obligation_legs"("id","responsibility_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsibility_temporal_facts" ADD CONSTRAINT "responsibility_temporal_facts_event_parent_fk" FOREIGN KEY ("expected_event_id","responsibility_id") REFERENCES "public"."responsibility_expected_events"("id","responsibility_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "responsibilities_live_open_user_idx" ON "responsibilities" USING btree ("user_id","updated_at","id") WHERE "responsibilities"."live_tracking_state" = 'TRACKING_ACTIVE' AND "responsibilities"."resolution_status" = 'OPEN';--> statement-breakpoint
CREATE INDEX "responsibilities_live_done_user_idx" ON "responsibilities" USING btree ("user_id","resolved_at","id") WHERE "responsibilities"."live_tracking_state" = 'TRACKING_ACTIVE' AND "responsibilities"."resolution_status" = 'RESOLVED';--> statement-breakpoint
CREATE INDEX "responsibilities_conversation_idx" ON "responsibilities" USING btree ("conversation_id","created_at","id");--> statement-breakpoint
CREATE INDEX "responsibilities_account_updated_idx" ON "responsibilities" USING btree ("connected_account_id","updated_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "responsibility_admission_reviews_open_source_candidate_uq" ON "responsibility_admission_reviews" USING btree ("connected_account_id","source_event_key","candidate_key") WHERE "responsibility_admission_reviews"."review_status" = 'OPEN';--> statement-breakpoint
CREATE INDEX "responsibility_admission_reviews_open_user_idx" ON "responsibility_admission_reviews" USING btree ("user_id","created_at","id") WHERE "responsibility_admission_reviews"."review_status" = 'OPEN';--> statement-breakpoint
CREATE INDEX "responsibility_admission_reviews_conversation_idx" ON "responsibility_admission_reviews" USING btree ("conversation_id","created_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "responsibility_domain_events_application_effect_uq" ON "responsibility_domain_events" USING btree ("application_key","effect_key");--> statement-breakpoint
CREATE UNIQUE INDEX "responsibility_domain_events_mutation_version_uq" ON "responsibility_domain_events" USING btree ("responsibility_id","aggregate_version_after") WHERE "responsibility_domain_events"."mutates_state";--> statement-breakpoint
CREATE INDEX "responsibility_domain_events_history_idx" ON "responsibility_domain_events" USING btree ("responsibility_id","occurred_at","id");--> statement-breakpoint
CREATE INDEX "responsibility_domain_events_correlation_idx" ON "responsibility_domain_events" USING btree ("correlation_id","id");--> statement-breakpoint
CREATE INDEX "responsibility_domain_events_source_idx" ON "responsibility_domain_events" USING btree ("source_event_key","occurred_at","id");--> statement-breakpoint
CREATE INDEX "responsibility_expected_events_pending_idx" ON "responsibility_expected_events" USING btree ("responsibility_id","actor_kind","id") WHERE "responsibility_expected_events"."event_status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "responsibility_expected_events_actor_idx" ON "responsibility_expected_events" USING btree ("actor_participant_id","responsibility_id") WHERE "responsibility_expected_events"."actor_participant_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "responsibility_field_decisions_active_uq" ON "responsibility_field_decisions" USING btree ("responsibility_id","field_key") WHERE "responsibility_field_decisions"."decision_status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "responsibility_obligation_legs_open_projection_idx" ON "responsibility_obligation_legs" USING btree ("responsibility_id","bearer_kind","actionability","id") WHERE "responsibility_obligation_legs"."leg_status" = 'OPEN';--> statement-breakpoint
CREATE INDEX "responsibility_obligation_legs_activation_event_idx" ON "responsibility_obligation_legs" USING btree ("activation_event_id","responsibility_id") WHERE "responsibility_obligation_legs"."activation_event_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "responsibility_obligation_legs_participant_idx" ON "responsibility_obligation_legs" USING btree ("bearer_participant_id","responsibility_id") WHERE "responsibility_obligation_legs"."bearer_participant_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "responsibility_provenance_refs_responsibility_idx" ON "responsibility_provenance_refs" USING btree ("responsibility_id","target_kind","target_id","id") WHERE "responsibility_provenance_refs"."responsibility_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "responsibility_provenance_refs_review_idx" ON "responsibility_provenance_refs" USING btree ("admission_review_id","id") WHERE "responsibility_provenance_refs"."admission_review_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "responsibility_provenance_refs_message_idx" ON "responsibility_provenance_refs" USING btree ("message_id","id") WHERE "responsibility_provenance_refs"."message_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "responsibility_temporal_current_parent_uq" ON "responsibility_temporal_facts" USING btree ("responsibility_id","temporal_kind") WHERE "responsibility_temporal_facts"."currentness_status" = 'ACCEPTED_CURRENT' AND "responsibility_temporal_facts"."obligation_leg_id" IS NULL AND "responsibility_temporal_facts"."expected_event_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "responsibility_temporal_current_leg_uq" ON "responsibility_temporal_facts" USING btree ("responsibility_id","temporal_kind","obligation_leg_id") WHERE "responsibility_temporal_facts"."currentness_status" = 'ACCEPTED_CURRENT' AND "responsibility_temporal_facts"."obligation_leg_id" IS NOT NULL AND "responsibility_temporal_facts"."expected_event_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "responsibility_temporal_current_event_uq" ON "responsibility_temporal_facts" USING btree ("responsibility_id","temporal_kind","expected_event_id") WHERE "responsibility_temporal_facts"."currentness_status" = 'ACCEPTED_CURRENT' AND "responsibility_temporal_facts"."expected_event_id" IS NOT NULL AND "responsibility_temporal_facts"."obligation_leg_id" IS NULL;--> statement-breakpoint
CREATE INDEX "responsibility_temporal_current_date_idx" ON "responsibility_temporal_facts" USING btree ("temporal_kind","resolved_date","responsibility_id") WHERE "responsibility_temporal_facts"."currentness_status" = 'ACCEPTED_CURRENT' AND "responsibility_temporal_facts"."value_kind" = 'DATE';--> statement-breakpoint
CREATE INDEX "responsibility_temporal_current_instant_idx" ON "responsibility_temporal_facts" USING btree ("temporal_kind","resolved_at","responsibility_id") WHERE "responsibility_temporal_facts"."currentness_status" = 'ACCEPTED_CURRENT' AND "responsibility_temporal_facts"."value_kind" = 'INSTANT';--> statement-breakpoint
CREATE INDEX "responsibility_temporal_conflict_idx" ON "responsibility_temporal_facts" USING btree ("responsibility_id","temporal_kind","id") WHERE "responsibility_temporal_facts"."currentness_status" = 'CONFLICT_CANDIDATE';