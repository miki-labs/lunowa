import {index, pgTable, text, uuid} from 'drizzle-orm/pg-core';

import {account, session, user, verification} from './auth-schema';

/**
 * Better Auth owns the generated tables in auth-schema.ts. This file adds only
 * the proof-only L2 consumer fixture; it is not production migration authority.
 */
export {account, session, user, verification};

/** Minimal L2 consumer fixture; it is deliberately not a production domain table. */
export const responsibilityProofFixture = pgTable('responsibility_proof_fixture', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, {onDelete: 'restrict'}),
  label: text('label').notNull()
}, (table) => [index('responsibility_proof_fixture_user_id_index').on(table.userId)]);

export const betterAuthProofSchema = {user, session, account, verification};
