import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/** Proof-only domain row; this is not production Responsibility authority. */
export const proofResponsibility = pgTable("p14_proof_responsibility", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});
