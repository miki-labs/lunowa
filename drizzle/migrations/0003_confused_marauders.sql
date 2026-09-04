CREATE TABLE "gmail_bootstrap_states" (
	"connected_account_id" uuid PRIMARY KEY NOT NULL,
	"baseline_history_id" text NOT NULL,
	"page_token" text,
	"page_offset" integer DEFAULT 0 NOT NULL,
	"processed_message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_bootstrap_states_history_id_check" CHECK ("gmail_bootstrap_states"."baseline_history_id" ~ '^[0-9]+$'),
	CONSTRAINT "gmail_bootstrap_states_page_offset_check" CHECK ("gmail_bootstrap_states"."page_offset" >= 0),
	CONSTRAINT "gmail_bootstrap_states_processed_check" CHECK ("gmail_bootstrap_states"."processed_message_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "gmail_oauth_states" (
	"state_digest" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_code_verifier" text NOT NULL,
	"return_path" text NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"consumed_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_oauth_states_digest_nonempty" CHECK (char_length("gmail_oauth_states"."state_digest") = 64),
	CONSTRAINT "gmail_oauth_states_return_path_check" CHECK ("gmail_oauth_states"."return_path" LIKE '/%' AND "gmail_oauth_states"."return_path" NOT LIKE '//%')
);
--> statement-breakpoint
CREATE TABLE "gmail_provider_credentials" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"encrypted_payload" text NOT NULL,
	"key_version" text NOT NULL,
	"granted_scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"invalidated_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_provider_credentials_account_uq" UNIQUE("connected_account_id"),
	CONSTRAINT "gmail_provider_credentials_ciphertext_nonempty" CHECK (char_length("gmail_provider_credentials"."encrypted_payload") BETWEEN 32 AND 32768),
	CONSTRAINT "gmail_provider_credentials_scopes_array_check" CHECK (jsonb_typeof("gmail_provider_credentials"."granted_scopes") = 'array')
);
--> statement-breakpoint
CREATE TABLE "gmail_sync_signals" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"delivery_key" text NOT NULL,
	"reason" text NOT NULL,
	"hinted_history_id" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"locked_until" timestamp (3) with time zone,
	"last_error_code" text,
	"received_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp (3) with time zone,
	CONSTRAINT "gmail_sync_signals_delivery_uq" UNIQUE("delivery_key"),
	CONSTRAINT "gmail_sync_signals_reason_check" CHECK ("gmail_sync_signals"."reason" IN ('INITIAL', 'PUSH', 'SAFETY', 'WATCH_RENEWAL', 'RETRY')),
	CONSTRAINT "gmail_sync_signals_status_check" CHECK ("gmail_sync_signals"."status" IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
	CONSTRAINT "gmail_sync_signals_attempts_nonnegative" CHECK ("gmail_sync_signals"."attempts" >= 0)
);
--> statement-breakpoint
CREATE TABLE "gmail_watch_states" (
	"connected_account_id" uuid PRIMARY KEY NOT NULL,
	"topic_name" text NOT NULL,
	"expiration_at" timestamp (3) with time zone NOT NULL,
	"last_history_id" text NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_watch_states_topic_nonempty" CHECK (char_length(btrim("gmail_watch_states"."topic_name")) > 0)
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "provider_deleted_at" timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "gmail_bootstrap_states" ADD CONSTRAINT "gmail_bootstrap_states_connected_account_id_connected_accounts_id_fk" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_oauth_states" ADD CONSTRAINT "gmail_oauth_states_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_provider_credentials" ADD CONSTRAINT "gmail_provider_credentials_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_provider_credentials" ADD CONSTRAINT "gmail_provider_credentials_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_sync_signals" ADD CONSTRAINT "gmail_sync_signals_connected_account_id_connected_accounts_id_fk" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_watch_states" ADD CONSTRAINT "gmail_watch_states_connected_account_id_connected_accounts_id_fk" FOREIGN KEY ("connected_account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gmail_bootstrap_states_updated_idx" ON "gmail_bootstrap_states" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "gmail_oauth_states_expiry_idx" ON "gmail_oauth_states" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "gmail_sync_signals_claim_idx" ON "gmail_sync_signals" USING btree ("status","available_at","received_at");--> statement-breakpoint
CREATE INDEX "gmail_sync_signals_account_idx" ON "gmail_sync_signals" USING btree ("connected_account_id","received_at");--> statement-breakpoint
CREATE INDEX "gmail_watch_states_expiration_idx" ON "gmail_watch_states" USING btree ("expiration_at");