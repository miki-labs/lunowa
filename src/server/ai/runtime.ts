import {randomUUID} from 'node:crypto';

import {
  AIContractError,
  DRAFT_RESPONSE_FORMAT,
  INTERPRETATION_RESPONSE_FORMAT,
  type ModelDraftOutput,
  toResponsibilityInterpretationCandidate,
  validateDraftOutput,
  validateInterpretationOutput
} from './contracts';
import {buildDraftContext, buildInterpretationContext, type AuthorizedInterpretationContext, type AuthorizedReplyContext, type BuiltAIContext} from './context';
import {parseResponseJson, responseRequest, type ResponsesTransport} from './openai';
import {deriveResponsibilityCommand} from '../responsibility/interpretation';
import type {ResponsibilityEvidenceBasis, ResponsibilityInterpretationCandidate} from '../responsibility/types';

export type AIRunLane = 'interpretation' | 'draft';
export type AIRunStatus = 'CAPTURED' | 'SUCCEEDED' | 'ABSTAINED' | 'STALE' | 'FAILED';

export type AIRunCapture = {
  lane: AIRunLane;
  schemaVersion: number;
  userId: string;
  connectedAccountId: string;
  conversationId: string;
  messageIds: readonly string[];
  basisEvidenceRevision: number;
  modelConfigVersion: string;
  providerModelIdentifier: string;
  contextManifest: Record<string, unknown>;
};

export type AIRunStore = {
  capture(input: AIRunCapture): Promise<{id: string}>;
  mark(input: {id: string; userId: string; status: AIRunStatus}): Promise<void>;
};

export class InMemoryAIRunStore implements AIRunStore {
  public readonly runs = new Map<string, AIRunCapture & {id: string; status: AIRunStatus}>();

  public async capture(input: AIRunCapture): Promise<{id: string}> {
    const id = randomUUID();
    this.runs.set(id, {...input, id, status: 'CAPTURED'});
    return {id};
  }

  public async mark(input: {id: string; userId: string; status: AIRunStatus}): Promise<void> {
    const run = this.runs.get(input.id);
    if (!run || run.userId !== input.userId) throw new Error('AI run is not owned by the current user');
    run.status = input.status;
  }
}

export type AIModelRuntimeConfig = {
  model: string;
  modelConfigVersion: string;
  /** This is an operator/provider fact, never inferred from store:false. */
  dataControlMode: 'UNVERIFIED' | 'STANDARD_API_RETENTION' | 'ZDR_VERIFIED';
  maxInterpretationOutputTokens?: number;
  maxDraftOutputTokens?: number;
};

type RuntimeDependencies = {
  transport: ResponsesTransport;
  runStore: AIRunStore;
  config: AIModelRuntimeConfig;
  currentEvidenceRevision: (input: {userId: string; connectedAccountId: string; conversationId: string}) => Promise<number> | number;
};

export type InterpretationRuntimeResult =
  | {status: 'CANDIDATE' | 'NO_RESPONSIBILITY'; runId: string; candidate: ResponsibilityInterpretationCandidate; derivation: ReturnType<typeof deriveResponsibilityCommand>}
  | {status: 'ABSTAINED' | 'STALE' | 'FAILED'; runId: string; reason: string};

export type DraftRuntimeResult =
  | {status: 'DRAFT'; runId: string; body: string; basisEvidenceRevision: number; manualFallbackAvailable: true}
  | {status: 'ABSTAINED' | 'STALE' | 'FAILED'; runId: string; reason: string; manualFallbackAvailable: true};

function failureReason(error: unknown): string {
  if (error instanceof AIContractError) return error.message;
  if (error instanceof Error && error.name === 'AIProviderError') return error.message;
  return 'AI assistance is unavailable';
}

async function currentRevision(deps: RuntimeDependencies, input: {userId: string; connectedAccountId: string; conversationId: string}): Promise<number> {
  return await deps.currentEvidenceRevision(input);
}

async function captureRun(deps: RuntimeDependencies, context: BuiltAIContext, config: AIModelRuntimeConfig): Promise<string> {
  const captured = await deps.runStore.capture({
    lane: context.manifest.lane,
    schemaVersion: context.manifest.schemaVersion,
    userId: context.manifest.userId,
    connectedAccountId: context.manifest.connectedAccountId,
    conversationId: context.manifest.conversationId,
    messageIds: context.manifest.messageIds,
    basisEvidenceRevision: context.manifest.basisEvidenceRevision,
    modelConfigVersion: config.modelConfigVersion,
    providerModelIdentifier: config.model,
    contextManifest: {
      ...context.manifest,
      dataControlMode: config.dataControlMode,
      storageRequest: 'store:false'
    }
  });
  return captured.id;
}

async function mark(deps: RuntimeDependencies, runId: string, userId: string, status: AIRunStatus): Promise<void> {
  await deps.runStore.mark({id: runId, userId, status});
}

function interpretationEvidenceBasis(context: AuthorizedInterpretationContext): ResponsibilityEvidenceBasis {
  return {
    evidenceRevision: context.evidenceRevision,
    sourceEventKey: context.sourceEventKey,
    references: context.messages.map((message) => ({evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: message.id}))
  };
}

export class ResponsibilityInterpretationRuntime {
  public constructor(private readonly deps: RuntimeDependencies) {}

  public async run(context: AuthorizedInterpretationContext): Promise<InterpretationRuntimeResult> {
    const built = buildInterpretationContext(context);
    const runId = await captureRun(this.deps, built, this.deps.config);
    try {
      const raw = await this.deps.transport.create(responseRequest({
        model: this.deps.config.model,
        messages: [...built.input],
        format: INTERPRETATION_RESPONSE_FORMAT,
        maxOutputTokens: this.deps.config.maxInterpretationOutputTokens ?? 4_000
      }));
      const modelOutput = validateInterpretationOutput(parseResponseJson(raw), {
        basisEvidenceRevision: context.evidenceRevision,
        allowedMessageIds: built.allowedMessageIds,
        allowedParticipantIds: built.allowedParticipantIds
      });
      const current = await currentRevision(this.deps, {userId: context.user.id, connectedAccountId: context.connectedAccount.id, conversationId: context.conversationId});
      if (current !== modelOutput.basisEvidenceRevision) {
        await mark(this.deps, runId, context.user.id, 'STALE');
        return {status: 'STALE', runId, reason: 'interpretation result was based on stale evidence'};
      }
      if (modelOutput.status === 'ABSTAINED') {
        await mark(this.deps, runId, context.user.id, 'ABSTAINED');
        return {status: 'ABSTAINED', runId, reason: modelOutput.abstentionReason ?? 'model abstained'};
      }
      const candidate = toResponsibilityInterpretationCandidate({
        output: modelOutput,
        userId: context.user.id,
        connectedAccountId: context.connectedAccount.id,
        conversationId: context.conversationId,
        sourceEventKey: context.sourceEventKey,
        candidateKey: `ai:${context.focalMessageId}:${modelOutput.basisEvidenceRevision}`,
        interpretationRunId: runId
      });
      if (!candidate) throw new AIContractError('interpretation candidate was not produced');
      const derivation = deriveResponsibilityCommand(candidate, {evidenceBasis: interpretationEvidenceBasis(context)});
      if (derivation.status === 'REJECTED') {
        await mark(this.deps, runId, context.user.id, 'FAILED');
        return {status: 'FAILED', runId, reason: derivation.reason};
      }
      await mark(this.deps, runId, context.user.id, 'SUCCEEDED');
      return {status: derivation.command.admission.decision === 'DO_NOT_TRACK' ? 'NO_RESPONSIBILITY' : 'CANDIDATE', runId, candidate, derivation};
    } catch (error) {
      await mark(this.deps, runId, context.user.id, 'FAILED');
      return {status: 'FAILED', runId, reason: failureReason(error)};
    }
  }
}

export class ContextualDraftRuntime {
  public constructor(private readonly deps: RuntimeDependencies) {}

  public async run(context: AuthorizedReplyContext): Promise<DraftRuntimeResult> {
    const built = buildDraftContext(context);
    const runId = await captureRun(this.deps, built, this.deps.config);
    try {
      const raw = await this.deps.transport.create(responseRequest({
        model: this.deps.config.model,
        messages: [...built.input],
        format: DRAFT_RESPONSE_FORMAT,
        maxOutputTokens: this.deps.config.maxDraftOutputTokens ?? 800
      }));
      const modelOutput: ModelDraftOutput = validateDraftOutput(parseResponseJson(raw), context.evidenceRevision);
      const current = await currentRevision(this.deps, {userId: context.user.id, connectedAccountId: context.connectedAccount.id, conversationId: context.conversationId});
      if (current !== modelOutput.basisEvidenceRevision) {
        await mark(this.deps, runId, context.user.id, 'STALE');
        return {status: 'STALE', runId, reason: 'draft result was based on stale evidence', manualFallbackAvailable: true};
      }
      if (modelOutput.status === 'ABSTAINED') {
        await mark(this.deps, runId, context.user.id, 'ABSTAINED');
        return {status: 'ABSTAINED', runId, reason: modelOutput.abstentionReason ?? 'draft assistance abstained', manualFallbackAvailable: true};
      }
      await mark(this.deps, runId, context.user.id, 'SUCCEEDED');
      return {status: 'DRAFT', runId, body: modelOutput.body, basisEvidenceRevision: modelOutput.basisEvidenceRevision, manualFallbackAvailable: true};
    } catch (error) {
      await mark(this.deps, runId, context.user.id, 'FAILED');
      return {status: 'FAILED', runId, reason: failureReason(error), manualFallbackAvailable: true};
    }
  }
}
