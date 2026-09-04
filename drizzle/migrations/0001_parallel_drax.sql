CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"provider_attachment_id" text,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer,
	"content_disposition" text,
	"content_reference" text NOT NULL,
	"content_hash" text,
	"preview_state" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attachments_size_nonnegative" CHECK ("attachments"."size_bytes" IS NULL OR "attachments"."size_bytes" >= 0),
	CONSTRAINT "attachments_filename_nonempty" CHECK (char_length(btrim("attachments"."filename")) BETWEEN 1 AND 1024),
	CONSTRAINT "attachments_mime_type_nonempty" CHECK (char_length(btrim("attachments"."mime_type")) BETWEEN 1 AND 255),
	CONSTRAINT "attachments_content_reference_nonempty" CHECK (char_length(btrim("attachments"."content_reference")) BETWEEN 1 AND 2048)
);
--> statement-breakpoint
CREATE TABLE "connected_accounts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"email_address" text NOT NULL,
	"display_name" text,
	"connection_state" text DEFAULT 'CONNECTED' NOT NULL,
	"granted_capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"credential_reference" text NOT NULL,
	"last_successful_sync_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connected_accounts_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "connected_accounts_user_provider_account_uq" UNIQUE("user_id","provider","provider_account_id"),
	CONSTRAINT "connected_accounts_provider_nonempty" CHECK (char_length(btrim("connected_accounts"."provider")) BETWEEN 1 AND 128),
	CONSTRAINT "connected_accounts_provider_account_nonempty" CHECK (char_length(btrim("connected_accounts"."provider_account_id")) BETWEEN 1 AND 512),
	CONSTRAINT "connected_accounts_email_nonempty" CHECK (char_length(btrim("connected_accounts"."email_address")) BETWEEN 1 AND 320),
	CONSTRAINT "connected_accounts_connection_state_check" CHECK ("connected_accounts"."connection_state" IN ('CONNECTED', 'RECONNECT_REQUIRED', 'DISCONNECTED', 'ERROR')),
	CONSTRAINT "connected_accounts_capabilities_array_check" CHECK (jsonb_typeof("connected_accounts"."granted_capabilities") = 'array'),
	CONSTRAINT "connected_accounts_credential_reference_nonempty" CHECK (char_length(btrim("connected_accounts"."credential_reference")) BETWEEN 1 AND 1024)
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"provider_thread_id" text,
	"normalized_subject" text,
	"semantic_topic" text,
	"first_message_at" timestamp (3) with time zone,
	"last_message_at" timestamp (3) with time zone,
	"last_inbound_at" timestamp (3) with time zone,
	"last_outbound_at" timestamp (3) with time zone,
	"semantic_evidence_revision" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_id_account_uq" UNIQUE("id","connected_account_id"),
	CONSTRAINT "conversations_revision_nonnegative" CHECK ("conversations"."semantic_evidence_revision" >= 0)
);
--> statement-breakpoint
CREATE TABLE "message_participants" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_participants_message_participant_role_uq" UNIQUE("message_id","participant_id","role"),
	CONSTRAINT "message_participants_role_check" CHECK ("message_participants"."role" IN ('TO', 'CC', 'BCC'))
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"provider_message_id" text NOT NULL,
	"provider_thread_id" text,
	"direction" text NOT NULL,
	"sender_participant_id" uuid,
	"subject" text NOT NULL,
	"text_body" text,
	"sanitized_html_body" text,
	"sent_at_or_received_at" timestamp (3) with time zone NOT NULL,
	"provider_received_at" timestamp (3) with time zone,
	"read_state" text,
	"mailbox_state_snapshot" jsonb,
	"raw_provider_metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_id_account_uq" UNIQUE("id","connected_account_id"),
	CONSTRAINT "messages_account_provider_message_uq" UNIQUE("connected_account_id","provider_message_id"),
	CONSTRAINT "messages_provider_message_nonempty" CHECK (char_length(btrim("messages"."provider_message_id")) BETWEEN 1 AND 1024),
	CONSTRAINT "messages_direction_check" CHECK ("messages"."direction" IN ('INBOUND', 'OUTBOUND'))
);
--> statement-breakpoint
CREATE TABLE "participant_identities" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"canonical_email" text NOT NULL,
	"display_name" text,
	"organization_name" text,
	"last_seen_at" timestamp (3) with time zone,
	"derived_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participant_identities_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "participant_identities_user_email_uq" UNIQUE("user_id","canonical_email"),
	CONSTRAINT "participant_identities_canonical_email_check" CHECK ("participant_identities"."canonical_email" = lower(btrim("participant_identities"."canonical_email")) AND char_length("participant_identities"."canonical_email") BETWEEN 3 AND 320),
	CONSTRAINT "participant_identities_metadata_object_check" CHECK (jsonb_typeof("participant_identities"."derived_metadata") = 'object')
);
--> statement-breakpoint
CREATE TABLE "provider_sync_states" (
	"connected_account_id" uuid PRIMARY KEY NOT NULL,
	"cursor_or_delta_token" text,
	"sync_generation" bigint DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"last_attempt_at" timestamp (3) with time zone,
	"last_success_at" timestamp (3) with time zone,
	"last_full_reconcile_at" timestamp (3) with time zone,
	"last_error_code" text,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "provider_sync_states_generation_nonnegative" CHECK ("provider_sync_states"."sync_generation" >= 0),
	CONSTRAINT "provider_sync_states_status_check" CHECK ("provider_sync_states"."status" IN ('PENDING', 'SYNCING', 'HEALTHY', 'RECONCILIATION_REQUIRED', 'ERROR'))
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_account_fk" FOREIGN KEY ("message_id","connected_account_id") REFERENCES "public"."messages"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_message_account_fk" FOREIGN KEY ("message_id","connected_account_id") REFERENCES "public"."messages"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_participant_owner_fk" FOREIGN KEY ("participant_id","user_id") REFERENCES "public"."participant_identities"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_account_fk" FOREIGN KEY ("conversation_id","connected_account_id") REFERENCES "public"."conversations"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_participant_owner_fk" FOREIGN KEY ("sender_participant_id","user_id") REFERENCES "public"."participant_identities"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_identities" ADD CONSTRAINT "participant_identities_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_sync_states" ADD CONSTRAINT "provider_sync_states_connected_account_id_connected_accounts_id_fk" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attachments_message_provider_attachment_uq" ON "attachments" USING btree ("message_id","provider_attachment_id") WHERE "attachments"."provider_attachment_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "attachments_message_idx" ON "attachments" USING btree ("message_id","id");--> statement-breakpoint
CREATE INDEX "connected_accounts_user_idx" ON "connected_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_account_provider_thread_uq" ON "conversations" USING btree ("connected_account_id","provider_thread_id") WHERE "conversations"."provider_thread_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "conversations_account_updated_idx" ON "conversations" USING btree ("connected_account_id","updated_at","id");--> statement-breakpoint
CREATE INDEX "conversations_user_updated_idx" ON "conversations" USING btree ("user_id","updated_at","id");--> statement-breakpoint
CREATE INDEX "message_participants_participant_idx" ON "message_participants" USING btree ("participant_id","message_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_occurred_idx" ON "messages" USING btree ("conversation_id","sent_at_or_received_at","id");--> statement-breakpoint
CREATE INDEX "messages_account_occurred_idx" ON "messages" USING btree ("connected_account_id","sent_at_or_received_at","id");--> statement-breakpoint
CREATE INDEX "participant_identities_user_idx" ON "participant_identities" USING btree ("user_id","last_seen_at");--> statement-breakpoint
CREATE INDEX "provider_sync_states_status_idx" ON "provider_sync_states" USING btree ("status","updated_at");--> statement-breakpoint
-- Drizzle expresses the non-negative check above. This narrow PostgreSQL
-- trigger closes the remaining database-level invariant: semantic evidence
-- revisions may advance or remain stable, but can never move backwards.
CREATE OR REPLACE FUNCTION "lunowa_guard_conversation_evidence_revision"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."semantic_evidence_revision" < OLD."semantic_evidence_revision" THEN
    RAISE EXCEPTION 'conversation semantic evidence revision cannot decrease'
      USING ERRCODE = '23514', CONSTRAINT = 'conversations_revision_monotonic';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "conversations_semantic_evidence_revision_monotonic"
BEFORE UPDATE OF "semantic_evidence_revision" ON "conversations"
FOR EACH ROW
EXECUTE FUNCTION "lunowa_guard_conversation_evidence_revision"();
