DROP INDEX "responsibilities_live_open_user_idx";--> statement-breakpoint
DROP INDEX "responsibilities_live_done_user_idx";--> statement-breakpoint
DROP INDEX "responsibilities_account_updated_idx";--> statement-breakpoint
DROP INDEX "responsibility_admission_reviews_open_user_idx";--> statement-breakpoint
DROP INDEX "responsibility_admission_reviews_conversation_idx";--> statement-breakpoint
DROP INDEX "responsibility_domain_events_history_idx";--> statement-breakpoint
DROP INDEX "responsibility_domain_events_source_idx";--> statement-breakpoint
CREATE INDEX "responsibilities_live_open_user_idx" ON "responsibilities" USING btree ("user_id","updated_at" DESC NULLS LAST,"id") WHERE "responsibilities"."live_tracking_state" = 'TRACKING_ACTIVE' AND "responsibilities"."resolution_status" = 'OPEN';--> statement-breakpoint
CREATE INDEX "responsibilities_live_done_user_idx" ON "responsibilities" USING btree ("user_id","resolved_at" DESC NULLS LAST,"id") WHERE "responsibilities"."live_tracking_state" = 'TRACKING_ACTIVE' AND "responsibilities"."resolution_status" = 'RESOLVED';--> statement-breakpoint
CREATE INDEX "responsibilities_account_updated_idx" ON "responsibilities" USING btree ("connected_account_id","updated_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "responsibility_admission_reviews_open_user_idx" ON "responsibility_admission_reviews" USING btree ("user_id","created_at" DESC NULLS LAST,"id") WHERE "responsibility_admission_reviews"."review_status" = 'OPEN';--> statement-breakpoint
CREATE INDEX "responsibility_admission_reviews_conversation_idx" ON "responsibility_admission_reviews" USING btree ("conversation_id","created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "responsibility_domain_events_history_idx" ON "responsibility_domain_events" USING btree ("responsibility_id","occurred_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "responsibility_domain_events_source_idx" ON "responsibility_domain_events" USING btree ("source_event_key","occurred_at" DESC NULLS LAST,"id");