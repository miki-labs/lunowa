import {applyAttentionCommand, createDeferAttentionCommand, createReturnAttentionCommand} from './attention';
import {projectResponsibility} from './projection';
import {reduceResponsibility} from './reducer';
import type {
  Projection,
  ProvenanceInput,
  ResponsibilityPatch,
  ResponsibilityState,
  TrustedResponsibilityCommand
} from './types';

export const TEMPORAL_TRIGGER_TYPES = ['TIME', 'REPLY_RECEIVED', 'DEADLINE'] as const;
export type TemporalTriggerType = (typeof TEMPORAL_TRIGGER_TYPES)[number];
export const TEMPORAL_CONTRACT_KINDS = ['ACTIVE_OBLIGATION_DEFER', 'PASSIVE_WAITING'] as const;
export type TemporalContractKind = (typeof TEMPORAL_CONTRACT_KINDS)[number];
export const TEMPORAL_CONTRACT_STATUSES = ['ACTIVE', 'RESOLVED', 'CANCELLED', 'SUPERSEDED'] as const;
export type TemporalContractStatus = (typeof TEMPORAL_CONTRACT_STATUSES)[number];
export const TEMPORAL_TRIGGER_STATUSES = ['SCHEDULED', 'CLAIMED', 'FIRED', 'CANCELLED', 'SUPERSEDED', 'FAILED'] as const;
export type TemporalTriggerStatus = (typeof TEMPORAL_TRIGGER_STATUSES)[number];

export type TemporalReturnCondition = {
  kind: TemporalTriggerType;
  label?: string;
  expectedEventId?: string;
  temporalFactId?: string;
};

export type TemporalContract = {
  id: string;
  userId: string;
  connectedAccountId: string;
  responsibilityId: string;
  status: TemporalContractStatus;
  contractKind: TemporalContractKind;
  createdBy: string;
  version: number;
  returnCondition: TemporalReturnCondition;
  activatedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TemporalTrigger = {
  id: string;
  temporalContractId: string;
  responsibilityId: string;
  userId: string;
  connectedAccountId: string;
  contractVersion: number;
  triggerType: TemporalTriggerType;
  triggerAt?: string;
  status: TemporalTriggerStatus;
  idempotencyKey: string;
  availableAt: string;
  claimedAt?: string;
  firedAt?: string;
  failureCount: number;
  lastErrorCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type TemporalEvidence = {
  evidenceRevision: number;
  references: ProvenanceInput[];
  replyReceived?: boolean;
  deadlineReached?: boolean;
  outcomeSatisfied?: boolean;
  userAttentionNeeded?: boolean;
};

export type TemporalAuditEvent = {
  id: string;
  responsibilityId: string;
  temporalContractId?: string;
  triggerId?: string;
  reasonCode: string;
  attentionBefore?: string;
  attentionAfter?: string;
  outcome: 'CLAIMED' | 'FIRED' | 'NO_OP' | 'STALE' | 'FAILED' | 'NOTIFICATION_FAILED';
  createdAt: string;
};

export type TemporalDecision = {
  kind: 'NO_OP' | 'RETURN_ATTENTION' | 'APPLY';
  reasonCode: string;
  patch?: ResponsibilityPatch;
  command?: TrustedResponsibilityCommand;
};

export type TemporalEvaluationContext = {
  contract: TemporalContract;
  trigger: TemporalTrigger;
  state: ResponsibilityState;
  evidence: TemporalEvidence;
  now: Date;
};

export type TemporalRuntimeOptions = {
  claimLeaseMs?: number;
  evaluate?: (context: TemporalEvaluationContext) => TemporalDecision | Promise<TemporalDecision>;
  notify?: (context: TemporalEvaluationContext) => void | Promise<void>;
};

export type UpsertTemporalContractInput = {
  id?: string;
  userId: string;
  connectedAccountId: string;
  responsibilityId: string;
  contractKind: TemporalContractKind;
  createdBy: string;
  returnCondition: TemporalReturnCondition;
  triggers: Array<{
    id?: string;
    triggerType: TemporalTriggerType;
    triggerAt?: string;
    idempotencyKey?: string;
  }>;
  now?: Date;
};

export type TemporalSnapshot = {
  contracts: TemporalContract[];
  triggers: TemporalTrigger[];
  responsibilities: ResponsibilityState[];
  evidence: Array<{responsibilityId: string; value: TemporalEvidence}>;
  audits: TemporalAuditEvent[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stableId(seed: string): string {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
  return `temporal-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function iso(now: Date): string {
  return now.toISOString();
}

export function validateTemporalReturnCondition(condition: TemporalReturnCondition): void {
  if (!TEMPORAL_TRIGGER_TYPES.includes(condition.kind)) throw new Error(`unsupported temporal trigger ${condition.kind}`);
  if (condition.kind === 'TIME' && !condition.temporalFactId && !condition.label) throw new Error('TIME return condition needs a temporal fact or label');
  if (condition.kind === 'REPLY_RECEIVED' && !condition.expectedEventId && !condition.label) throw new Error('REPLY_RECEIVED return condition needs an expected event or label');
  if (condition.kind === 'DEADLINE' && !condition.temporalFactId && !condition.label) throw new Error('DEADLINE return condition needs a temporal fact or label');
}

export function isTemporalTriggerEligible(trigger: TemporalTrigger, evidence: TemporalEvidence, now: Date): boolean {
  if (trigger.triggerAt && Date.parse(trigger.triggerAt) > now.getTime()) return false;
  if (trigger.triggerType === 'REPLY_RECEIVED') return evidence.replyReceived === true;
  if (trigger.triggerType === 'DEADLINE') return evidence.deadlineReached === true || Boolean(trigger.triggerAt && Date.parse(trigger.triggerAt) <= now.getTime());
  return true;
}

function validateTemporalApplyCommand(
  context: TemporalEvaluationContext,
  command: TrustedResponsibilityCommand
): TrustedResponsibilityCommand {
  if (command.commandSource !== 'TRUSTED_SYSTEM') throw new Error('Temporal APPLY command must come from TRUSTED_SYSTEM');
  if (command.userId !== context.state.userId || command.connectedAccountId !== context.state.connectedAccountId || command.conversationId !== context.state.conversationId) {
    throw new Error('Temporal APPLY command cannot cross user, account, or conversation scope');
  }
  if (command.evidenceRevision !== context.evidence.evidenceRevision) throw new Error('Temporal APPLY command must use the current evaluated evidence revision');
  if (command.admission.decision !== 'TRACK') throw new Error('Temporal APPLY command cannot change Responsibility admission');
  if (!command.effects?.length) throw new Error('Temporal APPLY command requires explicit effects on the claimed Responsibility');
  for (const effect of command.effects) {
    if (effect.operation === 'CREATE' || effect.responsibilityRef !== context.state.id) {
      throw new Error('Temporal APPLY command is limited to the claimed Responsibility and cannot CREATE another Responsibility');
    }
    if (effect.expectedAggregateVersion !== undefined && effect.expectedAggregateVersion !== context.state.aggregateVersion) {
      throw new Error('Temporal APPLY command must target the evaluated aggregate version');
    }
    if (
      effect.patch?.attentionMode !== undefined ||
      effect.patch?.liveTrackingState !== undefined ||
      effect.patch?.fieldChanges?.some((change) => change.fieldKey === 'attentionMode' || change.fieldKey === 'liveTrackingState')
    ) {
      throw new Error('Temporal APPLY cannot defer attention or change live tracking; those controls require their dedicated trusted boundary');
    }
  }
  return command;
}

export function createTemporalReconsiderationCommand(
  context: TemporalEvaluationContext,
  decision: TemporalDecision
): TrustedResponsibilityCommand {
  // RETURN_ATTENTION is deliberately narrower than a generic trusted APPLY.
  // A scheduler/evaluator cannot smuggle world-state effects through a return
  // decision, even if it accidentally supplies its own patch or command.
  const acceptedDecision: TemporalDecision = decision.kind === 'RETURN_ATTENTION'
    ? {
        kind: 'RETURN_ATTENTION',
        reasonCode: decision.reasonCode,
        patch: {
          fieldChanges: [{
            fieldKey: 'attentionMode',
            value: 'PRESENT',
            authorityKind: 'TEMPORAL_ATTENTION',
            provenance: context.evidence.references
          }]
        }
      }
    : decision;
  if (acceptedDecision.command) {
    if (acceptedDecision.kind !== 'APPLY') throw new Error('only Temporal APPLY may provide an explicit trusted command');
    return validateTemporalApplyCommand(context, acceptedDecision.command);
  }
  const provenance = context.evidence.references[0] ?? {
    evidenceKind: 'EXTERNAL_AUTHORITATIVE_FACT',
    providerObservationKey: `temporal:${context.trigger.id}`,
    sourceLocator: {authorized: true, authorityReference: context.trigger.id}
  } satisfies ProvenanceInput;
  const sourceEventKey = `temporal:${context.trigger.id}`;
  const command: TrustedResponsibilityCommand = {
    userId: context.state.userId,
    connectedAccountId: context.state.connectedAccountId,
    conversationId: context.state.conversationId,
    commandSource: 'TRUSTED_SYSTEM',
    sourceEventKey,
    candidateKey: sourceEventKey,
    evidenceRevision: context.evidence.evidenceRevision,
    admission: {decision: 'TRACK', reasonCodes: ['TEMPORAL_RECONSIDERATION']},
    provenance: [provenance],
    applicationKey: sourceEventKey,
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: context.state.id,
      expectedAggregateVersion: context.state.aggregateVersion,
      effectKey: 'reconsider',
      patch: acceptedDecision.patch,
      provenance: [provenance]
    }]
  };
  return acceptedDecision.kind === 'APPLY' ? validateTemporalApplyCommand(context, command) : command;
}

export class InMemoryTemporalStore {
  private contracts = new Map<string, TemporalContract>();
  private triggers = new Map<string, TemporalTrigger>();
  private responsibilities = new Map<string, ResponsibilityState>();
  private evidence = new Map<string, TemporalEvidence>();
  private audits: TemporalAuditEvent[] = [];

  public constructor(snapshot?: TemporalSnapshot) {
    for (const contract of snapshot?.contracts ?? []) this.contracts.set(contract.id, clone(contract));
    for (const trigger of snapshot?.triggers ?? []) this.triggers.set(trigger.id, clone(trigger));
    for (const state of snapshot?.responsibilities ?? []) this.responsibilities.set(state.id, clone(state));
    for (const item of snapshot?.evidence ?? []) this.evidence.set(item.responsibilityId, clone(item.value));
    this.audits = clone(snapshot?.audits ?? []);
  }

  public snapshot(): TemporalSnapshot {
    return {
      contracts: clone([...this.contracts.values()]),
      triggers: clone([...this.triggers.values()]),
      responsibilities: clone([...this.responsibilities.values()]),
      evidence: clone([...this.evidence.entries()].map(([responsibilityId, value]) => ({responsibilityId, value}))),
      audits: clone(this.audits)
    };
  }

  public restore(snapshot: TemporalSnapshot): void {
    this.contracts.clear();
    this.triggers.clear();
    this.responsibilities.clear();
    this.evidence.clear();
    for (const contract of snapshot.contracts) this.contracts.set(contract.id, clone(contract));
    for (const trigger of snapshot.triggers) this.triggers.set(trigger.id, clone(trigger));
    for (const state of snapshot.responsibilities) this.responsibilities.set(state.id, clone(state));
    for (const item of snapshot.evidence) this.evidence.set(item.responsibilityId, clone(item.value));
    this.audits = clone(snapshot.audits);
  }

  public setResponsibility(state: ResponsibilityState): void { this.responsibilities.set(state.id, clone(state)); }
  public getResponsibility(id: string): ResponsibilityState | undefined { const value = this.responsibilities.get(id); return value ? clone(value) : undefined; }
  public setEvidence(responsibilityId: string, value: TemporalEvidence): void { this.evidence.set(responsibilityId, clone(value)); }
  public getEvidence(responsibilityId: string): TemporalEvidence { return clone(this.evidence.get(responsibilityId) ?? {evidenceRevision: this.getResponsibility(responsibilityId)?.acceptedEvidenceRevision ?? 0, references: []}); }
  public getContract(id: string): TemporalContract | undefined { const value = this.contracts.get(id); return value ? clone(value) : undefined; }
  public getTrigger(id: string): TemporalTrigger | undefined { const value = this.triggers.get(id); return value ? clone(value) : undefined; }
  public listTriggers(): TemporalTrigger[] { return clone([...this.triggers.values()]); }
  public listAudits(): TemporalAuditEvent[] { return clone(this.audits); }

  public upsertContract(input: UpsertTemporalContractInput): TemporalContract {
    validateTemporalReturnCondition(input.returnCondition);
    const now = input.now ?? new Date();
    const responsibility = this.responsibilities.get(input.responsibilityId);
    if (responsibility && (
      responsibility.userId !== input.userId ||
      responsibility.connectedAccountId !== input.connectedAccountId ||
      responsibility.resolutionStatus !== 'OPEN' ||
      responsibility.liveTrackingState !== 'TRACKING_ACTIVE'
    )) throw new Error('temporal contract requires an active open Responsibility in the authorized scope');
    const priorRequest = input.id ? this.contracts.get(input.id) : undefined;
    if (priorRequest && (priorRequest.userId !== input.userId || priorRequest.connectedAccountId !== input.connectedAccountId || priorRequest.responsibilityId !== input.responsibilityId)) {
      throw new Error('temporal contract scope mismatch');
    }
    if (priorRequest) return clone(priorRequest);
    const scopedHistory = [...this.contracts.values()].filter((contract) =>
      contract.userId === input.userId &&
      contract.connectedAccountId === input.connectedAccountId &&
      contract.responsibilityId === input.responsibilityId
    );
    const existing = scopedHistory.find((contract) => contract.status === 'ACTIVE');
    const version = Math.max(0, ...scopedHistory.map((contract) => contract.version)) + 1;
    const id = input.id ?? stableId(`${input.userId}:${input.responsibilityId}:contract:${version}`);
    if (existing) {
      existing.status = 'SUPERSEDED';
      existing.resolvedAt = iso(now);
      existing.updatedAt = iso(now);
      this.contracts.set(existing.id, existing);
      for (const trigger of this.triggers.values()) {
        if (trigger.temporalContractId === existing.id && ['SCHEDULED', 'CLAIMED', 'FAILED'].includes(trigger.status)) {
          trigger.status = 'SUPERSEDED';
          trigger.updatedAt = iso(now);
        }
      }
    }
    const contract: TemporalContract = {
      id,
      userId: input.userId,
      connectedAccountId: input.connectedAccountId,
      responsibilityId: input.responsibilityId,
      status: 'ACTIVE',
      contractKind: input.contractKind,
      createdBy: input.createdBy,
      version,
      returnCondition: clone(input.returnCondition),
      activatedAt: existing?.activatedAt ?? iso(now),
      createdAt: existing?.createdAt ?? iso(now),
      updatedAt: iso(now)
    };
    this.contracts.set(id, contract);
    for (const [index, inputTrigger] of input.triggers.entries()) {
      const logicalIdempotencyKey = inputTrigger.idempotencyKey?.trim() || String(index);
      if (inputTrigger.idempotencyKey !== undefined && (!inputTrigger.idempotencyKey.trim() || inputTrigger.idempotencyKey.length > 256)) {
        throw new Error('temporal trigger idempotency key must be non-empty and at most 256 characters');
      }
      const scopedIdempotencyKey = `${id}:${version}:${inputTrigger.triggerType}:${logicalIdempotencyKey}`;
      const triggerId = existing
        ? stableId(scopedIdempotencyKey)
        : inputTrigger.id ?? stableId(scopedIdempotencyKey);
      const trigger: TemporalTrigger = {
        id: triggerId,
        temporalContractId: id,
        responsibilityId: input.responsibilityId,
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        contractVersion: version,
        triggerType: inputTrigger.triggerType,
        ...(inputTrigger.triggerAt ? {triggerAt: inputTrigger.triggerAt} : {}),
        status: 'SCHEDULED',
        idempotencyKey: scopedIdempotencyKey,
        availableAt: iso(now),
        failureCount: 0,
        createdAt: iso(now),
        updatedAt: iso(now)
      };
      const previous = this.triggers.get(triggerId);
      if (previous && previous.idempotencyKey !== trigger.idempotencyKey) throw new Error('temporal trigger idempotency key collision');
      if (!previous || previous.status !== 'FIRED') this.triggers.set(triggerId, trigger);
    }
    return clone(contract);
  }

  public updateResponsibility(state: ResponsibilityState): void { this.responsibilities.set(state.id, clone(state)); }
  public saveContract(contract: TemporalContract): void { this.contracts.set(contract.id, clone(contract)); }
  public addAudit(event: Omit<TemporalAuditEvent, 'id' | 'createdAt'> & {id?: string; createdAt?: string}): TemporalAuditEvent {
    const duplicate = event.triggerId && this.audits.find((item) => item.triggerId === event.triggerId && item.reasonCode === event.reasonCode);
    if (duplicate) return clone(duplicate);
    const result = {...event, id: event.id ?? stableId(`${event.triggerId ?? event.temporalContractId ?? event.responsibilityId}:${event.reasonCode}`), createdAt: event.createdAt ?? new Date().toISOString()};
    this.audits.push(clone(result));
    return clone(result);
  }

  public claimTrigger(id: string, now: Date, claimLeaseMs: number): TemporalTrigger | undefined {
    const trigger = this.triggers.get(id);
    if (!trigger) return undefined;
    if (trigger.status === 'FIRED' || trigger.status === 'CANCELLED' || trigger.status === 'SUPERSEDED') return clone(trigger);
    if (trigger.availableAt && Date.parse(trigger.availableAt) > now.getTime()) return clone(trigger);
    if (trigger.status === 'CLAIMED' && trigger.claimedAt && Date.parse(trigger.claimedAt) + claimLeaseMs > now.getTime()) return clone(trigger);
    trigger.status = 'CLAIMED';
    trigger.claimedAt = iso(now);
    trigger.updatedAt = iso(now);
    this.triggers.set(id, trigger);
    return clone(trigger);
  }

  public saveTrigger(trigger: TemporalTrigger): void { this.triggers.set(trigger.id, clone(trigger)); }
}

export class TemporalRuntime {
  private readonly claimLeaseMs: number;
  private readonly evaluate: NonNullable<TemporalRuntimeOptions['evaluate']>;

  public constructor(private readonly store: InMemoryTemporalStore, options: TemporalRuntimeOptions = {}) {
    this.claimLeaseMs = options.claimLeaseMs ?? 5 * 60 * 1000;
    this.evaluate = options.evaluate ?? ((context) => ({
      kind: context.evidence.userAttentionNeeded ? 'RETURN_ATTENTION' : 'NO_OP',
      reasonCode: context.evidence.userAttentionNeeded ? 'CURRENT_USER_ATTENTION_REQUIRED' : 'CURRENT_EVIDENCE_STILL_QUIET'
    }));
    this.notify = options.notify;
  }

  private readonly notify?: TemporalRuntimeOptions['notify'];

  public async deferAttention(input: AttentionCommandInputForRuntime): Promise<{contract: TemporalContract; state: ResponsibilityState}> {
    const state = this.store.getResponsibility(input.state.id);
    if (!state) throw new Error('Responsibility was not found');
    if (input.contract.responsibilityId !== state.id || input.contract.userId !== state.userId || input.contract.connectedAccountId !== state.connectedAccountId) throw new Error('temporal contract scope mismatch');
    const before = this.store.snapshot();
    try {
      const contractInput = input.contract.id ? input.contract : {
        ...input.contract,
        id: stableId(`${state.userId}:${state.connectedAccountId}:${state.id}:defer:${input.requestKey}`)
      };
      const priorRequest = contractInput.id ? this.store.getContract(contractInput.id) : undefined;
      const contract = this.store.upsertContract(contractInput);
      if (priorRequest) return {contract, state};
      const command = createDeferAttentionCommand({state, requestKey: input.requestKey, returnConditionKey: contract.id, evidenceRevision: state.acceptedEvidenceRevision, now: input.now});
      const next = applyAttentionCommand(state, command, input.now);
      this.store.updateResponsibility(next);
      return {contract, state: next};
    } catch (error) {
      this.store.restore(before);
      throw error;
    }
  }

  public returnAttention(input: {responsibilityId: string; requestKey: string; now?: Date}): ResponsibilityState {
    const state = this.store.getResponsibility(input.responsibilityId);
    if (!state) throw new Error('Responsibility was not found');
    const before = this.store.snapshot();
    try {
      const command = createReturnAttentionCommand({state, requestKey: input.requestKey, evidenceRevision: state.acceptedEvidenceRevision, now: input.now});
      const next = applyAttentionCommand(state, command, input.now);
      this.store.updateResponsibility(next);
      for (const trigger of this.store.listTriggers()) {
        const contract = this.store.getContract(trigger.temporalContractId);
        if (contract?.responsibilityId === state.id && ['SCHEDULED', 'CLAIMED', 'FAILED'].includes(trigger.status)) {
          trigger.status = 'CANCELLED';
          trigger.updatedAt = (input.now ?? new Date()).toISOString();
          this.store.saveTrigger(trigger);
        }
        if (contract?.responsibilityId === state.id && contract.status === 'ACTIVE') {
          contract.status = 'RESOLVED';
          contract.resolvedAt = (input.now ?? new Date()).toISOString();
          contract.updatedAt = (input.now ?? new Date()).toISOString();
          this.store.saveContract(contract);
        }
      }
      return next;
    } catch (error) {
      this.store.restore(before);
      throw error;
    }
  }

  public async processTemporalTrigger(id: string, now = new Date()): Promise<TemporalProcessResult> {
    const before = this.store.getTrigger(id);
    if (!before) return {status: 'NOT_FOUND', triggerId: id};
    if (before.status === 'CLAIMED' && before.claimedAt && Date.parse(before.claimedAt) + this.claimLeaseMs > now.getTime()) return {status: 'NOT_DUE', triggerId: id, trigger: before};
    const claimed = this.store.claimTrigger(id, now, this.claimLeaseMs);
    if (!claimed) return {status: 'NOT_FOUND', triggerId: id};
    if (claimed.status === 'FIRED') return {status: 'ALREADY_PROCESSED', triggerId: id, trigger: claimed};
    if (claimed.status === 'CANCELLED' || claimed.status === 'SUPERSEDED') {
      this.store.addAudit({responsibilityId: claimed.responsibilityId, temporalContractId: claimed.temporalContractId, triggerId: claimed.id, reasonCode: 'STALE_TEMPORAL_TRIGGER', outcome: 'STALE', createdAt: iso(now)});
      return {status: 'STALE', triggerId: id, trigger: claimed};
    }
    if (claimed.status !== 'CLAIMED') return {status: 'NOT_DUE', triggerId: id, trigger: claimed};
    const contract = this.store.getContract(claimed.temporalContractId);
    const state = this.store.getResponsibility(claimed.responsibilityId);
    const evidence = this.store.getEvidence(claimed.responsibilityId);
    const stale = !contract || contract.status !== 'ACTIVE' || contract.version !== claimed.contractVersion || !state || state.resolutionStatus !== 'OPEN' || state.liveTrackingState !== 'TRACKING_ACTIVE';
    const evidenceIsStale = Boolean(state && evidence.evidenceRevision < state.acceptedEvidenceRevision);
    if (stale || evidenceIsStale) {
      claimed.status = 'SUPERSEDED';
      claimed.updatedAt = iso(now);
      this.store.saveTrigger(claimed);
      this.store.addAudit({responsibilityId: claimed.responsibilityId, temporalContractId: contract?.id, triggerId: claimed.id, reasonCode: 'STALE_TEMPORAL_TRIGGER', outcome: 'STALE', attentionBefore: state?.attentionMode, attentionAfter: state?.attentionMode, createdAt: iso(now)});
      return {status: 'STALE', triggerId: id, trigger: claimed};
    }
    if (!isTemporalTriggerEligible(claimed, evidence, now)) {
      claimed.status = 'SCHEDULED';
      claimed.claimedAt = undefined;
      claimed.updatedAt = iso(now);
      this.store.saveTrigger(claimed);
      return {status: 'NOT_DUE', triggerId: id, trigger: claimed};
    }
    const context: TemporalEvaluationContext = {contract, trigger: claimed, state, evidence, now};
    try {
      const decision = await this.evaluate(context);
      const currentContract = this.store.getContract(claimed.temporalContractId);
      const currentState = this.store.getResponsibility(claimed.responsibilityId);
      const currentEvidence = this.store.getEvidence(claimed.responsibilityId);
      if (
        !currentContract ||
        currentContract.status !== 'ACTIVE' ||
        currentContract.version !== claimed.contractVersion ||
        !currentState ||
        currentState.aggregateVersion !== state.aggregateVersion ||
        currentEvidence.evidenceRevision !== evidence.evidenceRevision
      ) {
        claimed.status = 'SUPERSEDED';
        claimed.claimedAt = undefined;
        claimed.updatedAt = iso(now);
        this.store.saveTrigger(claimed);
        this.store.addAudit({responsibilityId: claimed.responsibilityId, temporalContractId: claimed.temporalContractId, triggerId: claimed.id, reasonCode: 'STALE_TEMPORAL_TRIGGER', outcome: 'STALE', attentionBefore: currentState?.attentionMode, attentionAfter: currentState?.attentionMode, createdAt: iso(now)});
        return {status: 'STALE', triggerId: id, trigger: claimed};
      }
      const currentContext: TemporalEvaluationContext = {contract: currentContract, trigger: claimed, state: currentState, evidence: currentEvidence, now};
      let next = currentState;
      if (decision.kind !== 'NO_OP') {
        const command = createTemporalReconsiderationCommand(currentContext, decision);
        const result = reduceResponsibility(command, {
          currentEvidenceRevision: currentEvidence.evidenceRevision,
          existingResponsibilities: [state],
          evidenceBasis: {evidenceRevision: currentEvidence.evidenceRevision, sourceEventKey: command.sourceEventKey, references: command.provenance ?? currentEvidence.references},
          now
        });
        if (result.status !== 'APPLIED' || !result.effects[0]?.state) throw new Error(result.status === 'APPLIED' ? 'temporal decision did not produce state' : result.reason);
        next = result.effects[0].state;
        this.store.updateResponsibility(next);
      }
      if (decision.kind !== 'NO_OP') {
        const timestamp = iso(now);
        for (const sibling of this.store.listTriggers()) {
          const siblingContract = this.store.getContract(sibling.temporalContractId);
          if (siblingContract?.responsibilityId !== state.id) continue;
          if (siblingContract.status === 'ACTIVE') {
            siblingContract.status = 'RESOLVED';
            siblingContract.resolvedAt = timestamp;
            siblingContract.updatedAt = timestamp;
            this.store.saveContract(siblingContract);
          }
          if (sibling.id !== claimed.id && ['SCHEDULED', 'CLAIMED', 'FAILED'].includes(sibling.status)) {
            sibling.status = 'CANCELLED';
            sibling.claimedAt = undefined;
            sibling.updatedAt = timestamp;
            this.store.saveTrigger(sibling);
          }
        }
      }
      claimed.status = 'FIRED';
      claimed.firedAt = iso(now);
      claimed.claimedAt = undefined;
      claimed.updatedAt = iso(now);
      this.store.saveTrigger(claimed);
      this.store.addAudit({responsibilityId: state.id, temporalContractId: contract.id, triggerId: claimed.id, reasonCode: decision.reasonCode, outcome: decision.kind === 'NO_OP' ? 'NO_OP' : 'FIRED', attentionBefore: state.attentionMode, attentionAfter: next.attentionMode, createdAt: iso(now)});
      let notificationStatus: 'NOT_ATTEMPTED' | 'DELIVERED' | 'FAILED' = 'NOT_ATTEMPTED';
      if (this.notify && decision.kind !== 'NO_OP') {
        try { await this.notify(currentContext); notificationStatus = 'DELIVERED'; }
        catch { notificationStatus = 'FAILED'; this.store.addAudit({responsibilityId: state.id, temporalContractId: contract.id, triggerId: claimed.id, reasonCode: 'NOTIFICATION_DELIVERY_FAILED', outcome: 'NOTIFICATION_FAILED', attentionBefore: next.attentionMode, attentionAfter: next.attentionMode, createdAt: iso(now)}); }
      }
      return {status: decision.kind === 'NO_OP' ? 'NO_OP' : 'FIRED', triggerId: id, trigger: claimed, state: next, projection: projectResponsibility(next), notificationStatus};
    } catch (error) {
      claimed.status = 'FAILED';
      claimed.failureCount += 1;
      claimed.lastErrorCode = error instanceof Error ? error.message : 'TEMPORAL_PROCESSING_FAILED';
      claimed.availableAt = iso(new Date(now.getTime() + Math.min(60 * 60 * 1000, 2 ** claimed.failureCount * 1000)));
      claimed.claimedAt = undefined;
      claimed.updatedAt = iso(now);
      this.store.saveTrigger(claimed);
      this.store.addAudit({responsibilityId: claimed.responsibilityId, temporalContractId: contract.id, triggerId: claimed.id, reasonCode: 'TEMPORAL_PROCESSING_FAILED', outcome: 'FAILED', createdAt: iso(now)});
      return {status: 'FAILED', triggerId: id, trigger: claimed, error: claimed.lastErrorCode};
    }
  }

  public async reconcileOverdue(now = new Date()): Promise<TemporalProcessResult[]> {
    const results: TemporalProcessResult[] = [];
    for (const trigger of this.store.listTriggers()) {
      const leaseExpired = trigger.status === 'CLAIMED' && Boolean(trigger.claimedAt) && Date.parse(trigger.claimedAt as string) + this.claimLeaseMs <= now.getTime();
      const retryable = trigger.status === 'FAILED' && Date.parse(trigger.availableAt) <= now.getTime();
      const scheduled = trigger.status === 'SCHEDULED' && Date.parse(trigger.availableAt) <= now.getTime();
      if (leaseExpired || retryable || scheduled) results.push(await this.processTemporalTrigger(trigger.id, now));
    }
    return results;
  }
}

export type AttentionCommandInputForRuntime = {
  state: ResponsibilityState;
  requestKey: string;
  contract: UpsertTemporalContractInput;
  now?: Date;
};

export type TemporalProcessResult = {
  status: 'NOT_FOUND' | 'NOT_DUE' | 'ALREADY_PROCESSED' | 'STALE' | 'NO_OP' | 'FIRED' | 'FAILED';
  triggerId: string;
  trigger?: TemporalTrigger;
  state?: ResponsibilityState;
  projection?: Projection;
  notificationStatus?: 'NOT_ATTEMPTED' | 'DELIVERED' | 'FAILED';
  error?: string;
};

export const upsertTemporalContract = (store: InMemoryTemporalStore, input: UpsertTemporalContractInput): TemporalContract => store.upsertContract(input);
export const processTemporalTrigger = (runtime: TemporalRuntime, triggerId: string, now?: Date): Promise<TemporalProcessResult> => runtime.processTemporalTrigger(triggerId, now);
