import {and, asc, desc, eq, lte, or, sql} from 'drizzle-orm';
import {createHash} from 'node:crypto';

import {getDatabase} from '../index';
import {temporalContracts, temporalResurfacingEvents, temporalTriggers} from '../schema/temporal';
import {conversations} from '../schema/evidence';
import {responsibilities} from '../schema/responsibility';
import {ResponsibilityRepository} from './responsibility';
import {
  createDeferAttentionCommand,
  createReturnAttentionCommand,
  createTemporalReconsiderationCommand,
  isTemporalTriggerEligible,
  projectResponsibility,
  validateTemporalReturnCondition,
  type TemporalContract,
  type TemporalDecision,
  type TemporalEvidence,
  type TemporalEvaluationContext,
  type TemporalProcessResult,
  type TemporalRuntimeOptions,
  type TemporalTrigger,
  type UpsertTemporalContractInput
} from '../../responsibility';

type Database = ReturnType<typeof getDatabase>;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stableUuid(seed: string): string {
  const digest = createHash('sha256').update(seed).digest('hex');
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
}

function asUuid(value: string | undefined, seed: string): string {
  return value && UUID.test(value) ? value : stableUuid(seed);
}

function iso(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

function scopedTriggerIdempotencyKey(
  contractId: string,
  contractVersion: number,
  triggerType: TemporalTrigger['triggerType'],
  logicalKey: string | undefined,
  index: number
): string {
  if (logicalKey !== undefined && (!logicalKey.trim() || logicalKey.length > 256)) {
    throw new Error('temporal trigger idempotency key must be non-empty and at most 256 characters');
  }
  return `temporal:${stableUuid(`${contractId}:${contractVersion}:${triggerType}:${logicalKey?.trim() || index}`)}`;
}

function contractFromRow(row: typeof temporalContracts.$inferSelect): TemporalContract {
  return {
    id: row.id,
    userId: row.userId,
    connectedAccountId: row.connectedAccountId,
    responsibilityId: row.responsibilityId,
    status: row.contractStatus as TemporalContract['status'],
    contractKind: row.contractKind as TemporalContract['contractKind'],
    createdBy: row.createdBy,
    version: row.version,
    returnCondition: row.returnCondition,
    activatedAt: row.activatedAt.toISOString(),
    ...(iso(row.resolvedAt) ? {resolvedAt: iso(row.resolvedAt)} : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function triggerFromRow(row: typeof temporalTriggers.$inferSelect): TemporalTrigger {
  return {
    id: row.id,
    temporalContractId: row.temporalContractId,
    responsibilityId: row.responsibilityId,
    userId: row.userId,
    connectedAccountId: row.connectedAccountId,
    contractVersion: row.contractVersion,
    triggerType: row.triggerType as TemporalTrigger['triggerType'],
    ...(iso(row.triggerAt) ? {triggerAt: iso(row.triggerAt)} : {}),
    status: row.triggerStatus as TemporalTrigger['status'],
    idempotencyKey: row.idempotencyKey,
    availableAt: row.availableAt.toISOString(),
    ...(iso(row.claimedAt) ? {claimedAt: iso(row.claimedAt)} : {}),
    ...(iso(row.firedAt) ? {firedAt: iso(row.firedAt)} : {}),
    failureCount: row.failureCount,
    ...(row.lastErrorCode ? {lastErrorCode: row.lastErrorCode} : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function eligibleStatus(status: TemporalTrigger['status']): boolean {
  return status === 'SCHEDULED' || status === 'FAILED' || status === 'CLAIMED';
}

export type DurableTemporalProcessInput = {
  triggerId: string;
  userId: string;
  now?: Date;
  loadEvidence: (context: {contract: TemporalContract; trigger: TemporalTrigger; responsibilityId: string}) => Promise<TemporalEvidence>;
  evaluate?: TemporalRuntimeOptions['evaluate'];
  notify?: TemporalRuntimeOptions['notify'];
};

/**
 * PostgreSQL-backed Temporal boundary. Trigger.dev (or another scheduler)
 * only calls this boundary; the contract/trigger rows and Responsibility
 * domain idempotency remain authoritative.
 */
export class TemporalRepository {
  private readonly responsibilityRepository: ResponsibilityRepository;

  public constructor(private readonly db: Database = getDatabase()) {
    this.responsibilityRepository = new ResponsibilityRepository(db);
  }

  public async getContract(input: {id: string; userId: string}): Promise<TemporalContract | null> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.select().from(temporalContracts).where(and(eq(temporalContracts.id, input.id), eq(temporalContracts.userId, input.userId)));
      return row ? contractFromRow(row) : null;
    });
  }

  public async upsertTemporalContract(input: UpsertTemporalContractInput): Promise<TemporalContract> {
    validateTemporalReturnCondition(input.returnCondition);
    return this.db.transaction((tx) => this.upsertTemporalContractInTransaction(tx, input));
  }

  private async upsertTemporalContractInTransaction(tx: Transaction, input: UpsertTemporalContractInput): Promise<TemporalContract> {
    const now = input.now ?? new Date();
    // Keep the lock order aligned with ResponsibilityRepository: conversation
    // (evidence revision) before Responsibility, then Temporal intent.
    const [unlockedResponsibility] = await tx.select({conversationId: responsibilities.conversationId}).from(responsibilities).where(and(
      eq(responsibilities.id, input.responsibilityId),
      eq(responsibilities.userId, input.userId),
      eq(responsibilities.connectedAccountId, input.connectedAccountId)
    ));
    if (!unlockedResponsibility) throw new Error('temporal contract Responsibility is outside the authorized scope');
    const [conversation] = await tx.select({id: conversations.id}).from(conversations).where(and(
      eq(conversations.id, unlockedResponsibility.conversationId),
      eq(conversations.userId, input.userId),
      eq(conversations.connectedAccountId, input.connectedAccountId)
    )).for('update');
    if (!conversation) throw new Error('temporal contract conversation is outside the authorized scope');
    const [responsibility] = await tx.select().from(responsibilities).where(and(
      eq(responsibilities.id, input.responsibilityId),
      eq(responsibilities.userId, input.userId),
      eq(responsibilities.connectedAccountId, input.connectedAccountId)
    )).for('update');
    if (!responsibility) throw new Error('temporal contract Responsibility is outside the authorized scope');
    if (responsibility.resolutionStatus !== 'OPEN' || responsibility.liveTrackingState !== 'TRACKING_ACTIVE') throw new Error('temporal contract requires an active open Responsibility');

    const requestedId = input.id ? asUuid(input.id, `${input.userId}:${input.responsibilityId}:contract-request:${input.id}`) : undefined;
    if (requestedId) {
      const [priorRequest] = await tx.select().from(temporalContracts).where(eq(temporalContracts.id, requestedId)).for('update');
      if (priorRequest) {
        if (priorRequest.userId !== input.userId || priorRequest.connectedAccountId !== input.connectedAccountId || priorRequest.responsibilityId !== input.responsibilityId) {
          throw new Error('temporal contract idempotency scope mismatch');
        }
        return contractFromRow(priorRequest);
      }
    }

    const [existing] = await tx.select().from(temporalContracts).where(and(
      eq(temporalContracts.responsibilityId, input.responsibilityId),
      eq(temporalContracts.userId, input.userId),
      eq(temporalContracts.connectedAccountId, input.connectedAccountId),
      eq(temporalContracts.contractStatus, 'ACTIVE')
    )).for('update');
    // The Responsibility row lock above serializes contract creation for this
    // aggregate. Version therefore advances from all durable history, not only
    // from the currently ACTIVE row; resolving a contract must never reset the
    // identity/version sequence back to 1.
    const [latest] = await tx.select({version: temporalContracts.version}).from(temporalContracts).where(and(
      eq(temporalContracts.responsibilityId, input.responsibilityId),
      eq(temporalContracts.userId, input.userId),
      eq(temporalContracts.connectedAccountId, input.connectedAccountId)
    )).orderBy(desc(temporalContracts.version)).limit(1);
    const version = (latest?.version ?? 0) + 1;
    if (existing) {
      await tx.update(temporalContracts).set({contractStatus: 'SUPERSEDED', resolvedAt: now, updatedAt: now}).where(eq(temporalContracts.id, existing.id));
      await tx.update(temporalTriggers).set({triggerStatus: 'SUPERSEDED', updatedAt: now}).where(and(eq(temporalTriggers.temporalContractId, existing.id), or(eq(temporalTriggers.triggerStatus, 'SCHEDULED'), eq(temporalTriggers.triggerStatus, 'CLAIMED'), eq(temporalTriggers.triggerStatus, 'FAILED'))));
    }
    const contractId = requestedId ?? stableUuid(`${input.userId}:${input.responsibilityId}:contract:${version}`);
    const [row] = await tx.insert(temporalContracts).values({
      id: contractId,
      userId: input.userId,
      connectedAccountId: input.connectedAccountId,
      responsibilityId: input.responsibilityId,
      contractStatus: 'ACTIVE',
      contractKind: input.contractKind,
      createdBy: input.createdBy,
      version,
      returnCondition: input.returnCondition,
      activatedAt: existing?.activatedAt ?? now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    }).returning();
    if (!row) throw new Error('temporal contract was not persisted');
    for (const [index, triggerInput] of input.triggers.entries()) {
      const idempotencyKey = scopedTriggerIdempotencyKey(contractId, version, triggerInput.triggerType, triggerInput.idempotencyKey, index);
      const triggerId = asUuid(triggerInput.id, `${contractId}:${version}:${triggerInput.triggerType}:${idempotencyKey}`);
      await tx.insert(temporalTriggers).values({
        id: triggerId,
        temporalContractId: contractId,
        responsibilityId: input.responsibilityId,
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        contractVersion: version,
        triggerType: triggerInput.triggerType,
        triggerAt: triggerInput.triggerAt ? new Date(triggerInput.triggerAt) : null,
        triggerStatus: 'SCHEDULED',
        idempotencyKey,
        availableAt: now,
        failureCount: 0,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing({target: temporalTriggers.idempotencyKey});
    }
    return contractFromRow(row);
  }

  public async deferAttention(input: {
    state: Parameters<typeof createDeferAttentionCommand>[0]['state'];
    requestKey: string;
    contract: UpsertTemporalContractInput;
  }): Promise<{contract: TemporalContract; state: NonNullable<Awaited<ReturnType<ResponsibilityRepository['getResponsibility']>>>['state']}> {
    const current = await this.responsibilityRepository.getResponsibility({userId: input.state.userId, connectedAccountId: input.state.connectedAccountId, responsibilityId: input.state.id});
    if (!current) throw new Error('Responsibility was not found');
    if (input.contract.responsibilityId !== current.state.id || input.contract.userId !== current.state.userId || input.contract.connectedAccountId !== current.state.connectedAccountId) throw new Error('temporal contract scope mismatch');
    return this.db.transaction(async (tx) => {
      const contractInput = input.contract.id ? input.contract : {
        ...input.contract,
        id: stableUuid(`${current.state.userId}:${current.state.connectedAccountId}:${current.state.id}:defer:${input.requestKey}`)
      };
      const contract = await this.upsertTemporalContractInTransaction(tx, contractInput);
      const command = createDeferAttentionCommand({state: current.state, requestKey: input.requestKey, returnConditionKey: contract.id, evidenceRevision: current.state.acceptedEvidenceRevision});
      const result = await this.responsibilityRepository.applyTrustedCommandInTransaction(tx, command);
      if (result.status !== 'APPLIED' || !result.responsibilities[0]) throw new Error(result.status === 'APPLIED' ? 'defer did not produce state' : result.reason);
      if (contract.status !== 'ACTIVE' && result.effects.some((effect) => effect.changed)) {
        throw new Error('a completed temporal contract cannot be reused for a new defer operation');
      }
      await this.insertAudit(tx, {
        responsibilityId: current.state.id,
        userId: current.state.userId,
        connectedAccountId: current.state.connectedAccountId,
        temporalContractId: contract.id,
        reasonCode: 'USER_DEFERRED_ATTENTION',
        outcome: 'FIRED',
        attentionBefore: current.state.attentionMode,
        attentionAfter: result.responsibilities[0].attentionMode,
        createdAt: input.contract.now ?? new Date()
      });
      return {contract, state: result.responsibilities[0]};
    });
  }

  public async returnAttention(input: {userId: string; connectedAccountId: string; responsibilityId: string; requestKey: string; evidenceRevision?: number; expectedAggregateVersion?: number; now?: Date}): Promise<NonNullable<Awaited<ReturnType<ResponsibilityRepository['getResponsibility']>>>['state']> {
    const current = await this.responsibilityRepository.getResponsibility(input);
    if (!current) throw new Error('Responsibility was not found');
    const command = createReturnAttentionCommand({
      state: current.state,
      requestKey: input.requestKey,
      evidenceRevision: input.evidenceRevision,
      expectedAggregateVersion: input.expectedAggregateVersion
    });
    const now = input.now ?? new Date();
    return this.db.transaction(async (tx) => {
      const result = await this.responsibilityRepository.applyTrustedCommandInTransaction(tx, command);
      if (result.status !== 'APPLIED' || !result.responsibilities[0]) throw new Error(result.status === 'APPLIED' ? 'Return Attention did not produce state' : result.reason);
      await this.retireActiveContractsInTransaction(tx, input, now, 'RESOLVED', 'CANCELLED');
      await this.insertAudit(tx, {
        responsibilityId: input.responsibilityId,
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        reasonCode: 'USER_RETURNED_ATTENTION',
        outcome: 'FIRED',
        attentionBefore: current.state.attentionMode,
        attentionAfter: result.responsibilities[0].attentionMode,
        createdAt: now
      });
      return result.responsibilities[0];
    });
  }

  private async retireActiveContractsInTransaction(
    tx: Transaction,
    input: {userId: string; connectedAccountId: string; responsibilityId: string},
    now: Date,
    contractStatus: 'RESOLVED' | 'CANCELLED',
    triggerStatus: 'CANCELLED' | 'SUPERSEDED',
    preserveTriggerId?: string
  ): Promise<void> {
    const active = await tx.select({id: temporalContracts.id}).from(temporalContracts).where(and(
      eq(temporalContracts.responsibilityId, input.responsibilityId),
      eq(temporalContracts.userId, input.userId),
      eq(temporalContracts.connectedAccountId, input.connectedAccountId),
      eq(temporalContracts.contractStatus, 'ACTIVE')
    )).for('update');
    for (const contract of active) {
      await tx.update(temporalContracts).set({contractStatus, resolvedAt: now, updatedAt: now}).where(eq(temporalContracts.id, contract.id));
      await tx.update(temporalTriggers).set({triggerStatus, claimedAt: null, updatedAt: now}).where(and(
        eq(temporalTriggers.temporalContractId, contract.id),
        ...(preserveTriggerId ? [sql`${temporalTriggers.id} <> ${preserveTriggerId}`] : []),
        or(eq(temporalTriggers.triggerStatus, 'SCHEDULED'), eq(temporalTriggers.triggerStatus, 'CLAIMED'), eq(temporalTriggers.triggerStatus, 'FAILED'))
      ));
    }
  }

  public async processTemporalTrigger(input: DurableTemporalProcessInput): Promise<TemporalProcessResult> {
    const now = input.now ?? new Date();
    const claimed = await this.claimTrigger(input.triggerId, input.userId, now);
    if (!claimed) return {status: 'NOT_FOUND', triggerId: input.triggerId};
    if (claimed.trigger.status === 'FIRED') return {status: 'ALREADY_PROCESSED', triggerId: input.triggerId, trigger: claimed.trigger};
    if (claimed.trigger.status === 'CANCELLED' || claimed.trigger.status === 'SUPERSEDED') {
      await this.recordAudit({responsibilityId: claimed.trigger.responsibilityId, userId: claimed.trigger.userId, connectedAccountId: claimed.trigger.connectedAccountId, temporalContractId: claimed.trigger.temporalContractId, triggerId: claimed.trigger.id, reasonCode: 'STALE_TEMPORAL_TRIGGER', outcome: 'STALE'});
      return {status: 'STALE', triggerId: input.triggerId, trigger: claimed.trigger};
    }
    if (!claimed.owned) return {status: 'NOT_DUE', triggerId: input.triggerId, trigger: claimed.trigger};
    try {
      const current = await this.responsibilityRepository.getResponsibility({userId: input.userId, connectedAccountId: claimed.trigger.connectedAccountId, responsibilityId: claimed.trigger.responsibilityId});
      const stale = !current || claimed.contract.status !== 'ACTIVE' || claimed.contract.version !== claimed.trigger.contractVersion || current.state.resolutionStatus !== 'OPEN' || current.state.liveTrackingState !== 'TRACKING_ACTIVE';
      if (stale) {
        const trigger = await this.finishTrigger(claimed.trigger, 'SUPERSEDED', now, 'STALE_TEMPORAL_TRIGGER');
        return {status: trigger.status === 'FIRED' ? 'ALREADY_PROCESSED' : 'STALE', triggerId: input.triggerId, trigger};
      }
      const evidence = await input.loadEvidence({contract: claimed.contract, trigger: claimed.trigger, responsibilityId: claimed.trigger.responsibilityId});
      if (evidence.evidenceRevision < current.state.acceptedEvidenceRevision) {
        const trigger = await this.finishTrigger(claimed.trigger, 'SUPERSEDED', now, 'STALE_TEMPORAL_TRIGGER');
        return {status: trigger.status === 'FIRED' ? 'ALREADY_PROCESSED' : 'STALE', triggerId: input.triggerId, trigger};
      }
      if (!isTemporalTriggerEligible(claimed.trigger, evidence, now)) {
        const trigger = await this.resetClaim(claimed.trigger, now);
        if (trigger.status === 'FIRED') return {status: 'ALREADY_PROCESSED', triggerId: input.triggerId, trigger};
        if (trigger.status === 'CANCELLED' || trigger.status === 'SUPERSEDED') {
          await this.recordAudit({responsibilityId: trigger.responsibilityId, userId: trigger.userId, connectedAccountId: trigger.connectedAccountId, temporalContractId: trigger.temporalContractId, triggerId: trigger.id, reasonCode: 'STALE_TEMPORAL_TRIGGER', outcome: 'STALE'});
          return {status: 'STALE', triggerId: input.triggerId, trigger};
        }
        return {status: 'NOT_DUE', triggerId: input.triggerId, trigger};
      }
      const context: TemporalEvaluationContext = {contract: claimed.contract, trigger: claimed.trigger, state: current.state, evidence, now};
      const decision: TemporalDecision = await (input.evaluate ?? (() => ({kind: evidence.userAttentionNeeded ? 'RETURN_ATTENTION' : 'NO_OP', reasonCode: evidence.userAttentionNeeded ? 'CURRENT_USER_ATTENTION_REQUIRED' : 'CURRENT_EVIDENCE_STILL_QUIET'})))(context);
      const latestContract = await this.getContract({id: claimed.contract.id, userId: input.userId});
      const latestState = await this.responsibilityRepository.getResponsibility({userId: input.userId, connectedAccountId: claimed.trigger.connectedAccountId, responsibilityId: claimed.trigger.responsibilityId});
      const latestEvidence = latestState ? await input.loadEvidence({contract: latestContract ?? claimed.contract, trigger: claimed.trigger, responsibilityId: claimed.trigger.responsibilityId}) : null;
      if (!latestContract || latestContract.status !== 'ACTIVE' || latestContract.version !== claimed.trigger.contractVersion || !latestState || latestState.state.aggregateVersion !== current.state.aggregateVersion || !latestEvidence || latestEvidence.evidenceRevision !== evidence.evidenceRevision) {
        const trigger = await this.finishTrigger(claimed.trigger, 'SUPERSEDED', now, 'STALE_TEMPORAL_TRIGGER');
        return {status: trigger.status === 'FIRED' ? 'ALREADY_PROCESSED' : 'STALE', triggerId: input.triggerId, trigger};
      }
      const committed = await this.commitTriggerDecision({
        input,
        claimed,
        current: current.state,
        evidence: latestEvidence,
        decision,
        now
      });
      if (committed.status === 'STALE') return {status: 'STALE', triggerId: input.triggerId, trigger: committed.trigger};
      const next = committed.state;
      let notificationStatus: 'NOT_ATTEMPTED' | 'DELIVERED' | 'FAILED' = 'NOT_ATTEMPTED';
      if (input.notify && decision.kind !== 'NO_OP') {
        try { await input.notify({...context, state: latestState.state, evidence: latestEvidence}); notificationStatus = 'DELIVERED'; }
        catch { notificationStatus = 'FAILED'; await this.recordAudit({responsibilityId: current.state.id, userId: current.state.userId, connectedAccountId: current.state.connectedAccountId, temporalContractId: claimed.contract.id, triggerId: claimed.trigger.id, reasonCode: 'NOTIFICATION_DELIVERY_FAILED', outcome: 'NOTIFICATION_FAILED', attentionBefore: next.attentionMode, attentionAfter: next.attentionMode}); }
      }
      return {status: decision.kind === 'NO_OP' ? 'NO_OP' : 'FIRED', triggerId: input.triggerId, trigger: committed.trigger, state: next, projection: projectResponsibility(next), notificationStatus};
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TEMPORAL_PROCESSING_FAILED';
      const trigger = await this.failTrigger(claimed.trigger, now, message);
      if (trigger.status === 'FIRED') return {status: 'ALREADY_PROCESSED', triggerId: input.triggerId, trigger};
      if (trigger.status === 'CANCELLED' || trigger.status === 'SUPERSEDED') {
        await this.recordAudit({responsibilityId: trigger.responsibilityId, userId: trigger.userId, connectedAccountId: trigger.connectedAccountId, temporalContractId: trigger.temporalContractId, triggerId: trigger.id, reasonCode: 'STALE_TEMPORAL_TRIGGER', outcome: 'STALE'});
        return {status: 'STALE', triggerId: input.triggerId, trigger};
      }
      return {status: 'FAILED', triggerId: input.triggerId, trigger, error: message};
    }
  }

  private async commitTriggerDecision(input: {
    input: DurableTemporalProcessInput;
    claimed: {trigger: TemporalTrigger; contract: TemporalContract};
    current: NonNullable<Awaited<ReturnType<ResponsibilityRepository['getResponsibility']>>>['state'];
    evidence: TemporalEvidence;
    decision: TemporalDecision;
    now: Date;
  }): Promise<{status: 'STALE'; trigger: TemporalTrigger} | {status: 'APPLIED'; trigger: TemporalTrigger; state: NonNullable<Awaited<ReturnType<ResponsibilityRepository['getResponsibility']>>>['state']}> {
    return this.db.transaction(async (tx) => {
      const live = await this.responsibilityRepository.getResponsibilityInTransaction(tx, {
        userId: input.input.userId,
        connectedAccountId: input.claimed.trigger.connectedAccountId,
        responsibilityId: input.claimed.trigger.responsibilityId
      });
      const [contractRow] = await tx.select().from(temporalContracts).where(and(
        eq(temporalContracts.id, input.claimed.contract.id),
        eq(temporalContracts.userId, input.input.userId),
        eq(temporalContracts.connectedAccountId, input.claimed.trigger.connectedAccountId)
      )).for('update');
      const [triggerRow] = await tx.select().from(temporalTriggers).where(and(
        eq(temporalTriggers.id, input.claimed.trigger.id),
        eq(temporalTriggers.userId, input.input.userId)
      )).for('update');
      const liveContract = contractRow ? contractFromRow(contractRow) : null;
      const liveTrigger = triggerRow ? triggerFromRow(triggerRow) : input.claimed.trigger;
      const stale = !live || !liveContract || !triggerRow || liveTrigger.status !== 'CLAIMED' || liveContract.status !== 'ACTIVE' || liveContract.version !== input.claimed.trigger.contractVersion || liveContract.version !== liveTrigger.contractVersion || live.state.aggregateVersion !== input.current.aggregateVersion || live.state.resolutionStatus !== 'OPEN' || live.state.liveTrackingState !== 'TRACKING_ACTIVE' || live.semanticEvidenceRevision !== input.evidence.evidenceRevision;
      if (stale) {
        if (triggerRow && liveTrigger.status === 'CLAIMED') {
          const [updated] = await tx.update(temporalTriggers).set({triggerStatus: 'SUPERSEDED', claimedAt: null, updatedAt: input.now}).where(eq(temporalTriggers.id, liveTrigger.id)).returning();
          await this.insertAudit(tx, {
            responsibilityId: input.claimed.trigger.responsibilityId,
            userId: input.claimed.trigger.userId,
            connectedAccountId: input.claimed.trigger.connectedAccountId,
            temporalContractId: liveContract?.id ?? input.claimed.trigger.temporalContractId,
            triggerId: input.claimed.trigger.id,
            reasonCode: 'STALE_TEMPORAL_TRIGGER',
            outcome: 'STALE',
            createdAt: input.now
          });
          return {status: 'STALE', trigger: updated ? triggerFromRow(updated) : {...liveTrigger, status: 'SUPERSEDED'}};
        }
        if (triggerRow && liveTrigger.status !== 'FIRED') {
          await this.insertAudit(tx, {
            responsibilityId: input.claimed.trigger.responsibilityId,
            userId: input.claimed.trigger.userId,
            connectedAccountId: input.claimed.trigger.connectedAccountId,
            temporalContractId: liveContract?.id ?? input.claimed.trigger.temporalContractId,
            triggerId: input.claimed.trigger.id,
            reasonCode: 'STALE_TEMPORAL_TRIGGER',
            outcome: 'STALE',
            createdAt: input.now
          });
        }
        return {status: 'STALE', trigger: liveTrigger};
      }

      const liveContext: TemporalEvaluationContext = {
        contract: liveContract,
        trigger: liveTrigger,
        state: live.state,
        evidence: input.evidence,
        now: input.now
      };
      let next = live.state;
      if (input.decision.kind !== 'NO_OP') {
        const command = createTemporalReconsiderationCommand(liveContext, input.decision);
        const result = await this.responsibilityRepository.applyTrustedCommandInTransaction(tx, command);
        if (result.status !== 'APPLIED' || !result.responsibilities[0]) throw new Error(result.status === 'APPLIED' ? 'temporal decision did not produce state' : result.reason);
        next = result.responsibilities[0];
      }

      if (input.decision.kind !== 'NO_OP') {
        await this.retireActiveContractsInTransaction(tx, {
          userId: input.input.userId,
          connectedAccountId: input.claimed.trigger.connectedAccountId,
          responsibilityId: input.claimed.trigger.responsibilityId
        }, input.now, 'RESOLVED', 'CANCELLED', input.claimed.trigger.id);
      }
      const [updatedTrigger] = await tx.update(temporalTriggers).set({triggerStatus: 'FIRED', claimedAt: null, firedAt: input.now, updatedAt: input.now}).where(eq(temporalTriggers.id, input.claimed.trigger.id)).returning();
      if (!updatedTrigger) throw new Error('temporal trigger disappeared while committing its decision');
      await this.insertAudit(tx, {
        responsibilityId: live.state.id,
        userId: live.state.userId,
        connectedAccountId: live.state.connectedAccountId,
        temporalContractId: liveContract.id,
        triggerId: liveTrigger.id,
        reasonCode: input.decision.reasonCode,
        // FIRED is the transport/consumption state; NO_OP is the semantic
        // outcome and must remain visible in the audit stream.
        outcome: input.decision.kind === 'NO_OP' ? 'NO_OP' : 'FIRED',
        attentionBefore: live.state.attentionMode,
        attentionAfter: next.attentionMode,
        createdAt: input.now
      });
      return {status: 'APPLIED', trigger: triggerFromRow(updatedTrigger), state: next};
    });
  }

  public async reconcileOverdue(input: Omit<DurableTemporalProcessInput, 'triggerId'> & {userId: string}): Promise<TemporalProcessResult[]> {
    const now = input.now ?? new Date();
    const rows = await this.db.transaction(async (tx) => tx.select().from(temporalTriggers).where(and(
      eq(temporalTriggers.userId, input.userId),
      or(
        and(or(eq(temporalTriggers.triggerStatus, 'SCHEDULED'), eq(temporalTriggers.triggerStatus, 'FAILED')), lte(temporalTriggers.availableAt, now)),
        and(eq(temporalTriggers.triggerStatus, 'CLAIMED'), lte(temporalTriggers.claimedAt, new Date(now.getTime() - 5 * 60 * 1000)))
      )
    )).orderBy(asc(temporalTriggers.availableAt), asc(temporalTriggers.id)));
    const results: TemporalProcessResult[] = [];
    for (const row of rows) results.push(await this.processTemporalTrigger({...input, triggerId: row.id, now}));
    return results;
  }

  /** Returns bounded tenant work for a scheduler recovery sweep. */
  public async listDueUserIds(now = new Date(), limit = 20): Promise<readonly string[]> {
    const rows = await this.db.select({userId: temporalTriggers.userId})
      .from(temporalTriggers)
      .where(or(
        and(or(eq(temporalTriggers.triggerStatus, 'SCHEDULED'), eq(temporalTriggers.triggerStatus, 'FAILED')), lte(temporalTriggers.availableAt, now)),
        and(eq(temporalTriggers.triggerStatus, 'CLAIMED'), lte(temporalTriggers.claimedAt, new Date(now.getTime() - 5 * 60 * 1000)))
      ))
      .orderBy(asc(temporalTriggers.availableAt), asc(temporalTriggers.userId), asc(temporalTriggers.id))
      .limit(Math.max(1, Math.min(limit, 100)));
    return [...new Set(rows.map((row) => row.userId))];
  }

  private async claimTrigger(id: string, userId: string, now: Date): Promise<{trigger: TemporalTrigger; contract: TemporalContract; owned: boolean} | null> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.select().from(temporalTriggers).where(and(eq(temporalTriggers.id, id), eq(temporalTriggers.userId, userId))).for('update');
      if (!row) return null;
      // The contract is read-only at claim time. Avoid locking it in the
      // inverse order from the commit path (Responsibility -> contract ->
      // trigger); commit-time currentness is the authoritative guard.
      const [contractRow] = await tx.select().from(temporalContracts).where(eq(temporalContracts.id, row.temporalContractId));
      if (!contractRow) return null;
      const trigger = triggerFromRow(row);
      if (!eligibleStatus(trigger.status)) return {trigger, contract: contractFromRow(contractRow), owned: false};
      if (trigger.availableAt && Date.parse(trigger.availableAt) > now.getTime()) return {trigger, contract: contractFromRow(contractRow), owned: false};
      if (trigger.status === 'CLAIMED' && trigger.claimedAt && Date.parse(trigger.claimedAt) + 5 * 60 * 1000 > now.getTime()) return {trigger, contract: contractFromRow(contractRow), owned: false};
      const [updated] = await tx.update(temporalTriggers).set({triggerStatus: 'CLAIMED', claimedAt: now, updatedAt: now}).where(eq(temporalTriggers.id, id)).returning();
      if (!updated) return null;
      return {trigger: triggerFromRow(updated), contract: contractFromRow(contractRow), owned: true};
    });
  }

  private async resetClaim(trigger: TemporalTrigger, now: Date): Promise<TemporalTrigger> {
    return this.db.transaction(async (tx) => {
      const [updated] = await tx.update(temporalTriggers).set({triggerStatus: 'SCHEDULED', claimedAt: null, updatedAt: now}).where(and(
        eq(temporalTriggers.id, trigger.id),
        eq(temporalTriggers.userId, trigger.userId),
        eq(temporalTriggers.triggerStatus, 'CLAIMED')
      )).returning();
      if (updated) return triggerFromRow(updated);
      const [current] = await tx.select().from(temporalTriggers).where(and(eq(temporalTriggers.id, trigger.id), eq(temporalTriggers.userId, trigger.userId)));
      return current ? triggerFromRow(current) : trigger;
    });
  }

  private async finishTrigger(trigger: TemporalTrigger, status: 'FIRED' | 'SUPERSEDED', now: Date, reasonCode: string, attentionBefore?: string, attentionAfter?: string, contractId?: string): Promise<TemporalTrigger> {
    return this.db.transaction(async (tx) => {
      const [updated] = await tx.update(temporalTriggers).set({triggerStatus: status, claimedAt: null, ...(status === 'FIRED' ? {firedAt: now} : {}), updatedAt: now}).where(and(
        eq(temporalTriggers.id, trigger.id),
        eq(temporalTriggers.userId, trigger.userId),
        eq(temporalTriggers.triggerStatus, 'CLAIMED')
      )).returning();
      if (updated) {
        await this.insertAudit(tx, {responsibilityId: trigger.responsibilityId, userId: trigger.userId, connectedAccountId: trigger.connectedAccountId, temporalContractId: contractId ?? trigger.temporalContractId, triggerId: trigger.id, reasonCode, outcome: status === 'FIRED' ? 'FIRED' : 'STALE', attentionBefore, attentionAfter, createdAt: now});
        return triggerFromRow(updated);
      }
      const [current] = await tx.select().from(temporalTriggers).where(and(eq(temporalTriggers.id, trigger.id), eq(temporalTriggers.userId, trigger.userId)));
      if (current && current.triggerStatus !== 'FIRED' && status === 'SUPERSEDED') {
        await this.insertAudit(tx, {responsibilityId: trigger.responsibilityId, userId: trigger.userId, connectedAccountId: trigger.connectedAccountId, temporalContractId: contractId ?? trigger.temporalContractId, triggerId: trigger.id, reasonCode, outcome: 'STALE', attentionBefore, attentionAfter, createdAt: now});
      }
      return current ? triggerFromRow(current) : trigger;
    });
  }

  private async failTrigger(trigger: TemporalTrigger, now: Date, errorCode: string): Promise<TemporalTrigger> {
    const delay = Math.min(60 * 60 * 1000, 2 ** (trigger.failureCount + 1) * 1000);
    return this.db.transaction(async (tx) => {
      const [updated] = await tx.update(temporalTriggers).set({triggerStatus: 'FAILED', claimedAt: null, failureCount: sql`${temporalTriggers.failureCount} + 1`, lastErrorCode: errorCode.slice(0, 256), availableAt: new Date(now.getTime() + delay), updatedAt: now}).where(and(
        eq(temporalTriggers.id, trigger.id),
        eq(temporalTriggers.userId, trigger.userId),
        eq(temporalTriggers.triggerStatus, 'CLAIMED')
      )).returning();
      if (updated) {
        await this.insertAudit(tx, {responsibilityId: trigger.responsibilityId, userId: trigger.userId, connectedAccountId: trigger.connectedAccountId, temporalContractId: trigger.temporalContractId, triggerId: trigger.id, reasonCode: 'TEMPORAL_PROCESSING_FAILED', outcome: 'FAILED', createdAt: now});
        return triggerFromRow(updated);
      }
      const [current] = await tx.select().from(temporalTriggers).where(and(eq(temporalTriggers.id, trigger.id), eq(temporalTriggers.userId, trigger.userId)));
      return current ? triggerFromRow(current) : trigger;
    });
  }

  private async recordAudit(input: {
    responsibilityId: string;
    userId: string;
    connectedAccountId: string;
    temporalContractId?: string;
    triggerId?: string;
    reasonCode: string;
    outcome: 'CLAIMED' | 'FIRED' | 'NO_OP' | 'STALE' | 'FAILED' | 'NOTIFICATION_FAILED';
    attentionBefore?: string;
    attentionAfter?: string;
  }): Promise<void> {
    await this.db.transaction((tx) => this.insertAudit(tx, {...input, createdAt: new Date()}));
  }

  private async insertAudit(tx: Transaction, input: Parameters<TemporalRepository['recordAudit']>[0] & {createdAt: Date}): Promise<void> {
    await tx.insert(temporalResurfacingEvents).values({
      id: stableUuid(`${input.triggerId ?? input.temporalContractId ?? input.responsibilityId}:${input.reasonCode}`),
      responsibilityId: input.responsibilityId,
      userId: input.userId,
      connectedAccountId: input.connectedAccountId,
      temporalContractId: input.temporalContractId ?? null,
      triggerId: input.triggerId ?? null,
      reasonCode: input.reasonCode,
      attentionBefore: input.attentionBefore ?? null,
      attentionAfter: input.attentionAfter ?? null,
      outcome: input.outcome,
      detail: {},
      createdAt: input.createdAt
    }).onConflictDoNothing();
  }
}

export const DurableTemporalRepository = TemporalRepository;
