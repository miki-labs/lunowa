import {boolean, index, pgTable, text, timestamp, uniqueIndex, uuid} from 'drizzle-orm/pg-core';

/**
 * P14 proof-only Better Auth topology. This is not production migration authority.
 * UUID defaults are database-side so generated SQL and the PostgreSQL catalog carry
 * the contract instead of relying on TypeScript-only IDs.
 */
export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull(),
  updatedAt: timestamp('updated_at', {withTimezone: true}).notNull()
});

export const session = pgTable('session', {
  id: uuid('id').defaultRandom().primaryKey(),
  expiresAt: timestamp('expires_at', {withTimezone: true}).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull(),
  updatedAt: timestamp('updated_at', {withTimezone: true}).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id').notNull().references(() => user.id, {onDelete: 'cascade'})
}, (table) => [index('session_user_id_index').on(table.userId)]);

export const account = pgTable('account', {
  id: uuid('id').defaultRandom().primaryKey(),
  issuer: text('issuer').notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: uuid('user_id').notNull().references(() => user.id, {onDelete: 'cascade'}),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {withTimezone: true}),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {withTimezone: true}),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull(),
  updatedAt: timestamp('updated_at', {withTimezone: true}).notNull()
}, (table) => [
  index('account_user_id_index').on(table.userId),
  uniqueIndex('account_issuer_account_id_unique').on(table.issuer, table.accountId)
]);

export const verification = pgTable('verification', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', {withTimezone: true}).notNull(),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull(),
  updatedAt: timestamp('updated_at', {withTimezone: true}).notNull()
}, (table) => [index('verification_identifier_index').on(table.identifier)]);

/** Minimal L2 consumer fixture; it is deliberately not a production domain table. */
export const responsibilityProofFixture = pgTable('responsibility_proof_fixture', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, {onDelete: 'restrict'}),
  label: text('label').notNull()
}, (table) => [index('responsibility_proof_fixture_user_id_index').on(table.userId)]);

export const betterAuthProofSchema = {user, session, account, verification};
