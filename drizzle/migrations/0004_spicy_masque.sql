CREATE TABLE "temporal_contracts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"contract_status" text DEFAULT 'ACTIVE' NOT NULL,
	"contract_kind" text NOT NULL,
	"created_by" text NOT NULL,
	"version" bigint DEFAULT 1 NOT NULL,
	"return_condition" jsonb NOT NULL,
	"activated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "temporal_contracts_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "temporal_contracts_id_account_uq" UNIQUE("id","connected_account_id"),
	CONSTRAINT "temporal_contracts_status_check" CHECK ("temporal_contracts"."contract_status" IN ('ACTIVE', 'RESOLVED', 'CANCELLED', 'SUPERSEDED')),
	CONSTRAINT "temporal_contracts_kind_check" CHECK ("temporal_contracts"."contract_kind" IN ('ACTIVE_OBLIGATION_DEFER', 'PASSIVE_WAITING')),
	CONSTRAINT "temporal_contracts_created_by_check" CHECK (char_length(btrim("temporal_contracts"."created_by")) BETWEEN 1 AND 64),
	CONSTRAINT "temporal_contracts_version_check" CHECK ("temporal_contracts"."version" >= 1),
	CONSTRAINT "temporal_contracts_return_condition_object_check" CHECK (jsonb_typeof("temporal_contracts"."return_condition") = 'object'),
	CONSTRAINT "temporal_contracts_resolution_shape_check" CHECK (("temporal_contracts"."contract_status" = 'ACTIVE' AND "temporal_contracts"."resolved_at" IS NULL) OR ("temporal_contracts"."contract_status" <> 'ACTIVE' AND "temporal_contracts"."resolved_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "temporal_resurfacing_events" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"temporal_contract_id" uuid,
	"trigger_id" uuid,
	"reason_code" text NOT NULL,
	"attention_before" text,
	"attention_after" text,
	"outcome" text NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "temporal_resurfacing_events_trigger_reason_uq" UNIQUE("trigger_id","reason_code"),
	CONSTRAINT "temporal_resurfacing_events_reason_check" CHECK (char_length(btrim("temporal_resurfacing_events"."reason_code")) BETWEEN 1 AND 128),
	CONSTRAINT "temporal_resurfacing_events_outcome_check" CHECK ("temporal_resurfacing_events"."outcome" IN ('CLAIMED', 'FIRED', 'NO_OP', 'STALE', 'FAILED', 'NOTIFICATION_FAILED')),
	CONSTRAINT "temporal_resurfacing_events_detail_object_check" CHECK (jsonb_typeof("temporal_resurfacing_events"."detail") = 'object')
);
--> statement-breakpoint
CREATE TABLE "temporal_triggers" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"temporal_contract_id" uuid NOT NULL,
	"responsibility_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"contract_version" bigint NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_at" timestamp (3) with time zone,
	"trigger_status" text DEFAULT 'SCHEDULED' NOT NULL,
	"idempotency_key" text NOT NULL,
	"available_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp (3) with time zone,
	"fired_at" timestamp (3) with time zone,
	"failure_count" bigint DEFAULT 0 NOT NULL,
	"last_error_code" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "temporal_triggers_id_contract_uq" UNIQUE("id","temporal_contract_id"),
	CONSTRAINT "temporal_triggers_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "temporal_triggers_idempotency_uq" UNIQUE("idempotency_key"),
	CONSTRAINT "temporal_triggers_type_check" CHECK ("temporal_triggers"."trigger_type" IN ('TIME', 'REPLY_RECEIVED', 'DEADLINE')),
	CONSTRAINT "temporal_triggers_status_check" CHECK ("temporal_triggers"."trigger_status" IN ('SCHEDULED', 'CLAIMED', 'FIRED', 'CANCELLED', 'SUPERSEDED', 'FAILED')),
	CONSTRAINT "temporal_triggers_contract_version_check" CHECK ("temporal_triggers"."contract_version" >= 1),
	CONSTRAINT "temporal_triggers_failure_count_check" CHECK ("temporal_triggers"."failure_count" >= 0),
	CONSTRAINT "temporal_triggers_idempotency_key_check" CHECK (char_length(btrim("temporal_triggers"."idempotency_key")) BETWEEN 1 AND 256),
	CONSTRAINT "temporal_triggers_fired_shape_check" CHECK (("temporal_triggers"."trigger_status" = 'FIRED' AND "temporal_triggers"."fired_at" IS NOT NULL) OR ("temporal_triggers"."trigger_status" <> 'FIRED'))
);
--> statement-breakpoint
ALTER TABLE "temporal_contracts" ADD CONSTRAINT "temporal_contracts_responsibility_user_fk" FOREIGN KEY ("responsibility_id","user_id") REFERENCES "public"."responsibilities"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporal_contracts" ADD CONSTRAINT "temporal_contracts_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporal_resurfacing_events" ADD CONSTRAINT "temporal_resurfacing_events_responsibility_user_fk" FOREIGN KEY ("responsibility_id","user_id") REFERENCES "public"."responsibilities"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporal_resurfacing_events" ADD CONSTRAINT "temporal_resurfacing_events_contract_account_fk" FOREIGN KEY ("temporal_contract_id","connected_account_id") REFERENCES "public"."temporal_contracts"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporal_resurfacing_events" ADD CONSTRAINT "temporal_resurfacing_events_trigger_user_fk" FOREIGN KEY ("trigger_id","user_id") REFERENCES "public"."temporal_triggers"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporal_triggers" ADD CONSTRAINT "temporal_triggers_contract_account_fk" FOREIGN KEY ("temporal_contract_id","connected_account_id") REFERENCES "public"."temporal_contracts"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporal_triggers" ADD CONSTRAINT "temporal_triggers_responsibility_account_fk" FOREIGN KEY ("responsibility_id","connected_account_id") REFERENCES "public"."responsibilities"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporal_triggers" ADD CONSTRAINT "temporal_triggers_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "temporal_contracts_active_responsibility_uq" ON "temporal_contracts" USING btree ("responsibility_id") WHERE "temporal_contracts"."contract_status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "temporal_contracts_user_status_idx" ON "temporal_contracts" USING btree ("user_id","contract_status","updated_at");--> statement-breakpoint
CREATE INDEX "temporal_contracts_responsibility_idx" ON "temporal_contracts" USING btree ("responsibility_id","updated_at");--> statement-breakpoint
CREATE INDEX "temporal_resurfacing_events_responsibility_idx" ON "temporal_resurfacing_events" USING btree ("responsibility_id","created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "temporal_resurfacing_events_trigger_idx" ON "temporal_resurfacing_events" USING btree ("trigger_id","created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "temporal_triggers_claim_idx" ON "temporal_triggers" USING btree ("trigger_status","available_at","trigger_at","id");--> statement-breakpoint
CREATE INDEX "temporal_triggers_responsibility_idx" ON "temporal_triggers" USING btree ("responsibility_id","updated_at");
