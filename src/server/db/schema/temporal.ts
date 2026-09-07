import {sql} from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

import {connectedAccounts} from './evidence';
import {responsibilities} from './responsibility';
import type {TemporalReturnCondition} from '../../responsibility/temporal';

const instant = (name = 'created_at') => timestamp(name, {withTimezone: true, precision: 3}).notNull().defaultNow();
const updatedInstant = () => timestamp('updated_at', {withTimezone: true, precision: 3}).notNull().defaultNow();
const revision = (name: string) => bigint(name, {mode: 'number'});

export const temporalContracts = pgTable(
  'temporal_contracts',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    responsibilityId: uuid('responsibility_id').notNull(),
    contractStatus: text('contract_status').notNull().default('ACTIVE'),
    contractKind: text('contract_kind').notNull(),
    createdBy: text('created_by').notNull(),
    version: revision('version').notNull().default(1),
    returnCondition: jsonb('return_condition').$type<TemporalReturnCondition>().notNull(),
    activatedAt: timestamp('activated_at', {withTimezone: true, precision: 3}).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', {withTimezone: true, precision: 3}),
    createdAt: instant(),
    updatedAt: updatedInstant()
  },
  (table) => [
    unique('temporal_contracts_id_user_uq').on(table.id, table.userId),
    unique('temporal_contracts_id_account_uq').on(table.id, table.connectedAccountId),
    foreignKey({
      name: 'temporal_contracts_responsibility_user_fk',
      columns: [table.responsibilityId, table.userId],
      foreignColumns: [responsibilities.id, responsibilities.userId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'temporal_contracts_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('restrict'),
    check('temporal_contracts_status_check', sql`${table.contractStatus} IN ('ACTIVE', 'RESOLVED', 'CANCELLED', 'SUPERSEDED')`),
    check('temporal_contracts_kind_check', sql`${table.contractKind} IN ('ACTIVE_OBLIGATION_DEFER', 'PASSIVE_WAITING')`),
    check('temporal_contracts_created_by_check', sql`char_length(btrim(${table.createdBy})) BETWEEN 1 AND 64`),
    check('temporal_contracts_version_check', sql`${table.version} >= 1`),
    check('temporal_contracts_return_condition_object_check', sql`jsonb_typeof(${table.returnCondition}) = 'object'`),
    check(
      'temporal_contracts_resolution_shape_check',
      sql`(${table.contractStatus} = 'ACTIVE' AND ${table.resolvedAt} IS NULL) OR (${table.contractStatus} <> 'ACTIVE' AND ${table.resolvedAt} IS NOT NULL)`
    ),
    uniqueIndex('temporal_contracts_active_responsibility_uq')
      .on(table.responsibilityId)
      .where(sql`${table.contractStatus} = 'ACTIVE'`),
    index('temporal_contracts_user_status_idx').on(table.userId, table.contractStatus, table.updatedAt),
    index('temporal_contracts_responsibility_idx').on(table.responsibilityId, table.updatedAt)
  ]
);

export const temporalTriggers = pgTable(
  'temporal_triggers',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    temporalContractId: uuid('temporal_contract_id').notNull(),
    responsibilityId: uuid('responsibility_id').notNull(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    contractVersion: revision('contract_version').notNull(),
    triggerType: text('trigger_type').notNull(),
    triggerAt: timestamp('trigger_at', {withTimezone: true, precision: 3}),
    triggerStatus: text('trigger_status').notNull().default('SCHEDULED'),
    idempotencyKey: text('idempotency_key').notNull(),
    availableAt: timestamp('available_at', {withTimezone: true, precision: 3}).notNull().defaultNow(),
    claimedAt: timestamp('claimed_at', {withTimezone: true, precision: 3}),
    firedAt: timestamp('fired_at', {withTimezone: true, precision: 3}),
    failureCount: revision('failure_count').notNull().default(0),
    lastErrorCode: text('last_error_code'),
    createdAt: instant(),
    updatedAt: updatedInstant()
  },
  (table) => [
    unique('temporal_triggers_id_contract_uq').on(table.id, table.temporalContractId),
    unique('temporal_triggers_id_user_uq').on(table.id, table.userId),
    unique('temporal_triggers_idempotency_uq').on(table.idempotencyKey),
    foreignKey({
      name: 'temporal_triggers_contract_account_fk',
      columns: [table.temporalContractId, table.connectedAccountId],
      foreignColumns: [temporalContracts.id, temporalContracts.connectedAccountId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'temporal_triggers_responsibility_account_fk',
      columns: [table.responsibilityId, table.connectedAccountId],
      foreignColumns: [responsibilities.id, responsibilities.connectedAccountId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'temporal_triggers_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('restrict'),
    check('temporal_triggers_type_check', sql`${table.triggerType} IN ('TIME', 'REPLY_RECEIVED', 'DEADLINE')`),
    check('temporal_triggers_status_check', sql`${table.triggerStatus} IN ('SCHEDULED', 'CLAIMED', 'FIRED', 'CANCELLED', 'SUPERSEDED', 'FAILED')`),
    check('temporal_triggers_contract_version_check', sql`${table.contractVersion} >= 1`),
    check('temporal_triggers_failure_count_check', sql`${table.failureCount} >= 0`),
    check('temporal_triggers_idempotency_key_check', sql`char_length(btrim(${table.idempotencyKey})) BETWEEN 1 AND 256`),
    check(
      'temporal_triggers_fired_shape_check',
      sql`(${table.triggerStatus} = 'FIRED' AND ${table.firedAt} IS NOT NULL) OR (${table.triggerStatus} <> 'FIRED')`
    ),
    index('temporal_triggers_claim_idx').on(table.triggerStatus, table.availableAt, table.triggerAt, table.id),
    index('temporal_triggers_responsibility_idx').on(table.responsibilityId, table.updatedAt)
  ]
);

export const temporalResurfacingEvents = pgTable(
  'temporal_resurfacing_events',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    responsibilityId: uuid('responsibility_id').notNull(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    temporalContractId: uuid('temporal_contract_id'),
    triggerId: uuid('trigger_id'),
    reasonCode: text('reason_code').notNull(),
    attentionBefore: text('attention_before'),
    attentionAfter: text('attention_after'),
    outcome: text('outcome').notNull(),
    detail: jsonb('detail').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: instant()
  },
  (table) => [
    unique('temporal_resurfacing_events_trigger_reason_uq').on(table.triggerId, table.reasonCode),
    foreignKey({
      name: 'temporal_resurfacing_events_responsibility_user_fk',
      columns: [table.responsibilityId, table.userId],
      foreignColumns: [responsibilities.id, responsibilities.userId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'temporal_resurfacing_events_contract_account_fk',
      columns: [table.temporalContractId, table.connectedAccountId],
      foreignColumns: [temporalContracts.id, temporalContracts.connectedAccountId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'temporal_resurfacing_events_trigger_user_fk',
      columns: [table.triggerId, table.userId],
      foreignColumns: [temporalTriggers.id, temporalTriggers.userId]
    }).onDelete('cascade'),
    check('temporal_resurfacing_events_reason_check', sql`char_length(btrim(${table.reasonCode})) BETWEEN 1 AND 128`),
    check('temporal_resurfacing_events_outcome_check', sql`${table.outcome} IN ('CLAIMED', 'FIRED', 'NO_OP', 'STALE', 'FAILED', 'NOTIFICATION_FAILED')`),
    check('temporal_resurfacing_events_detail_object_check', sql`jsonb_typeof(${table.detail}) = 'object'`),
    index('temporal_resurfacing_events_responsibility_idx').on(table.responsibilityId, table.createdAt.desc(), table.id),
    index('temporal_resurfacing_events_trigger_idx').on(table.triggerId, table.createdAt.desc(), table.id)
  ]
);

export const temporalSchema = {temporalContracts, temporalTriggers, temporalResurfacingEvents};
