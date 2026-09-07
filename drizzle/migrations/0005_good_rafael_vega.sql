CREATE TABLE "drafts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"conversation_id" uuid,
	"in_reply_to_message_id" uuid,
	"mode" text NOT NULL,
	"recipients" jsonb NOT NULL,
	"cc" jsonb NOT NULL,
	"bcc" jsonb NOT NULL,
	"subject" text NOT NULL,
	"body_format" text DEFAULT 'TEXT' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"reply_context" jsonb NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drafts_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "drafts_mode_check" CHECK ("drafts"."mode" IN ('REPLY', 'REPLY_ALL')),
	CONSTRAINT "drafts_body_format_check" CHECK ("drafts"."body_format" = 'TEXT'),
	CONSTRAINT "drafts_status_check" CHECK ("drafts"."status" IN ('ACTIVE', 'DISCARDED')),
	CONSTRAINT "drafts_version_check" CHECK ("drafts"."version" >= 1),
	CONSTRAINT "drafts_recipients_array_check" CHECK (jsonb_typeof("drafts"."recipients") = 'array'),
	CONSTRAINT "drafts_cc_array_check" CHECK (jsonb_typeof("drafts"."cc") = 'array'),
	CONSTRAINT "drafts_bcc_array_check" CHECK (jsonb_typeof("drafts"."bcc") = 'array'),
	CONSTRAINT "drafts_reply_context_object_check" CHECK (jsonb_typeof("drafts"."reply_context") = 'object')
);
--> statement-breakpoint
CREATE TABLE "send_operations" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"draft_id" uuid NOT NULL,
	"connected_account_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"kind" text DEFAULT 'IMMEDIATE' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"draft_snapshot" jsonb NOT NULL,
	"provider_result_id" text,
	"provider_message_id" text,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error_code" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "send_operations_id_user_uq" UNIQUE("id","user_id"),
	CONSTRAINT "send_operations_user_idempotency_uq" UNIQUE("user_id","idempotency_key"),
	CONSTRAINT "send_operations_key_check" CHECK (char_length(btrim("send_operations"."idempotency_key")) BETWEEN 1 AND 128),
	CONSTRAINT "send_operations_kind_check" CHECK ("send_operations"."kind" = 'IMMEDIATE'),
	CONSTRAINT "send_operations_status_check" CHECK ("send_operations"."status" IN ('PENDING', 'DISPATCHING', 'AMBIGUOUS', 'PROVIDER_ACCEPTED', 'RECONCILED', 'FAILED')),
	CONSTRAINT "send_operations_snapshot_object_check" CHECK (jsonb_typeof("send_operations"."draft_snapshot") = 'object'),
	CONSTRAINT "send_operations_attempt_count_check" CHECK ("send_operations"."attempt_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_conversation_account_fk" FOREIGN KEY ("conversation_id","connected_account_id") REFERENCES "public"."conversations"("id","connected_account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_reply_message_account_fk" FOREIGN KEY ("in_reply_to_message_id","connected_account_id") REFERENCES "public"."messages"("id","connected_account_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_operations" ADD CONSTRAINT "send_operations_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_operations" ADD CONSTRAINT "send_operations_draft_user_fk" FOREIGN KEY ("draft_id","user_id") REFERENCES "public"."drafts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_operations" ADD CONSTRAINT "send_operations_account_owner_fk" FOREIGN KEY ("connected_account_id","user_id") REFERENCES "public"."connected_accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drafts_user_updated_idx" ON "drafts" USING btree ("user_id","updated_at","id");--> statement-breakpoint
CREATE INDEX "send_operations_draft_idx" ON "send_operations" USING btree ("draft_id","created_at");--> statement-breakpoint
CREATE INDEX "send_operations_pending_idx" ON "send_operations" USING btree ("status","updated_at");