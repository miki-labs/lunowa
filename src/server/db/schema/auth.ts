import {relations, sql} from 'drizzle-orm';
import {boolean, index, pgTable, text, timestamp, uniqueIndex, uuid} from 'drizzle-orm/pg-core';

// This production schema is the accepted P14 Better Auth 1.7.2 UUID schema.
// Provider/mailbox credentials belong to the later ConnectedAccount boundary,
// never to these Better Auth account rows.
export const user = pgTable('user', {
  id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
});

export const session = pgTable('session', {
  id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id').notNull().references(() => user.id, {onDelete: 'cascade'})
}, (table) => [index('session_userId_idx').on(table.userId)]);

export const account = pgTable('account', {
  id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
  issuer: text('issuer').notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: uuid('user_id').notNull().references(() => user.id, {onDelete: 'cascade'}),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull()
}, (table) => [
  uniqueIndex('account_issuer_accountId_uidx').on(table.issuer, table.accountId),
  index('account_userId_idx').on(table.userId)
]);

export const verification = pgTable('verification', {
  id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);

export const userRelations = relations(user, ({many}) => ({
  sessions: many(session),
  accounts: many(account)
}));

export const sessionRelations = relations(session, ({one}) => ({
  user: one(user, {fields: [session.userId], references: [user.id]})
}));

export const accountRelations = relations(account, ({one}) => ({
  user: one(user, {fields: [account.userId], references: [user.id]})
}));
