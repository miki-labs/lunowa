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
import {buildDraftContext, buildInterpretationContext, type AuthorizedInterpretationContext, type AuthorizedReplyContext, type BuiltAIContext, type AuthorizedAIProviderObservation} from './context';
import {AIProviderError, parseResponseJson, responseRequest, type ResponsesTransport} from './openai';
import {deriveResponsibilityCommand} from '../responsibility/interpretation';
import type {ResponsibilityEvidenceBasis, ResponsibilityInterpretationCandidate, ResponsibilityState} from '../responsibility/types';

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
  sourceMessageId?: string;
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

export type InterpretationContextRequest = {
  userId: string;
  connectedAccountId: string;
  conversationId: string;
  sourceEventKey: string;
  focalMessageId: string;
  /** Exact message scope; every ID is re-authorized by the snapshot repository. */
  messageIds: readonly string[];
  locale?: string;
  timezone?: string;
};

export type DraftContextRequest = {
  userId: string;
  connectedAccountId: string;
  conversationId: string;
  messageId: string;
  replyMode: 'REPLY' | 'REPLY_ALL';
  trustedRecipientLabels: readonly string[];
  locale?: string;
  timezone?: string;
};

export type AIRunCaptureConfig = Pick<AIModelRuntimeConfig, 'model' | 'modelConfigVersion' | 'dataControlMode'>;

export type CapturedInterpretationContext = {
  context: AuthorizedInterpretationContext;
  built: BuiltAIContext;
  runId: string;
  existingResponsibilities?: readonly ResponsibilityState[];
};

export type CapturedDraftContext = {
  context: AuthorizedReplyContext;
  built: BuiltAIContext & {trustedRecipientLabels: readonly string[]};
  runId: string;
};

/**
 * Production callers provide identifiers only. The repository implementation
 * reads the tenant/account/evidence rows and captures the run in one short DB
 * transaction before the model call. Direct contexts remain available only to
 * explicit test transports.
 */
export type AIContextSnapshotStore = {
  captureInterpretation(input: InterpretationContextRequest, config: AIRunCaptureConfig): Promise<CapturedInterpretationContext>;
  captureDraft(input: DraftContextRequest, config: AIRunCaptureConfig): Promise<CapturedDraftContext>;
};

export type RuntimeDependencies = {
  transport: ResponsesTransport;
  runStore: AIRunStore;
  config: AIModelRuntimeConfig;
  contextSnapshot?: AIContextSnapshotStore;
  /** Used by direct fixture callers; production snapshots carry the same state atomically. */
  existingResponsibilities?: readonly ResponsibilityState[];
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
    sourceMessageId: context.manifest.focalMessageId ?? context.manifest.messageIds[0],
    contextManifest: {
      ...context.manifest,
      dataControlMode: config.dataControlMode,
      storageRequest: 'store:false'
    }
  });
  return captured.id;
}

function isInterpretationContextRequest(input: AuthorizedInterpretationContext | InterpretationContextRequest): input is InterpretationContextRequest {
  return !('messages' in input);
}

function isDraftContextRequest(input: AuthorizedReplyContext | DraftContextRequest): input is DraftContextRequest {
  return !('message' in input);
}

function assertProviderDataControl(deps: RuntimeDependencies): void {
  if (deps.config.dataControlMode === 'UNVERIFIED' && deps.transport.kind !== 'test') {
    throw new AIProviderError('CONFIGURATION_MISSING', 'AI email-content requests require verified data-control configuration');
  }
}

async function captureInterpretationContext(
  deps: RuntimeDependencies,
  input: AuthorizedInterpretationContext | InterpretationContextRequest
): Promise<CapturedInterpretationContext> {
  if (isInterpretationContextRequest(input)) {
    if (!deps.contextSnapshot) throw new AIProviderError('CONFIGURATION_MISSING', 'production interpretation requires an authorized context snapshot');
    return deps.contextSnapshot.captureInterpretation(input, deps.config);
  }
  if (deps.transport.kind !== 'test') throw new AIProviderError('CONFIGURATION_MISSING', 'production interpretation requires an authorized context snapshot');
  const context = {...input, existingResponsibilities: input.existingResponsibilities ?? deps.existingResponsibilities};
  const built = buildInterpretationContext(context);
  return {context, built, runId: await captureRun(deps, built, deps.config), existingResponsibilities: context.existingResponsibilities};
}

async function captureDraftContext(
  deps: RuntimeDependencies,
  input: AuthorizedReplyContext | DraftContextRequest
): Promise<CapturedDraftContext> {
  if (isDraftContextRequest(input)) {
    if (!deps.contextSnapshot) throw new AIProviderError('CONFIGURATION_MISSING', 'production drafting requires an authorized context snapshot');
    return deps.contextSnapshot.captureDraft(input, deps.config);
  }
  if (deps.transport.kind !== 'test') throw new AIProviderError('CONFIGURATION_MISSING', 'production drafting requires an authorized context snapshot');
  const built = buildDraftContext(input);
  return {context: input, built, runId: await captureRun(deps, built, deps.config)};
}

async function mark(deps: RuntimeDependencies, runId: string, userId: string, status: AIRunStatus): Promise<void> {
  await deps.runStore.mark({id: runId, userId, status});
}

function interpretationEvidenceBasis(context: AuthorizedInterpretationContext): ResponsibilityEvidenceBasis {
  return {
    evidenceRevision: context.evidenceRevision,
    sourceEventKey: context.sourceEventKey,
    references: [
      ...context.messages.map((message) => ({evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: message.id})),
      ...(context.providerObservations ?? []).map((observation) => ({
        evidenceKind: observation.kind === 'ATTACHMENT_PRESENCE' && observation.attachmentCount === 0 ? 'PROVIDER_NON_DELIVERY' : 'PROVIDER_MESSAGE_OBSERVED',
        messageId: observation.messageId,
        providerObservationKey: observation.key,
        sourceLocator: {authorized: true, authorityReference: observation.key}
      }))
    ]
  };
}

function trustedProviderFindings(output: import('./contracts').ModelInterpretationOutput, observations: readonly AuthorizedAIProviderObservation[]): import('./contracts').ModelInterpretationOutput {
  if (output.status === 'ABSTAINED' || observations.length === 0) return output;
  const attachmentAbsence = new Set(observations.filter((item) => item.kind === 'ATTACHMENT_PRESENCE' && item.attachmentCount === 0).map((item) => item.messageId));
  if (attachmentAbsence.size === 0) return output;
  return {
    ...output,
    semanticUnits: output.semanticUnits.map((unit) => {
      const claims = unit.communicatedClaims.filter((claim) => claim.kind === 'ATTACHMENT_DELIVERED' && claim.sourceRefs.some((ref) => attachmentAbsence.has(ref.messageId)));
      if (claims.length === 0) return unit;
      const existing = unit.uncertainties.some((item) => item.reasonCode === 'PROVIDER_CONTRADICTION');
      if (existing) return unit;
      return {
        ...unit,
        uncertainties: [...unit.uncertainties, {
          id: `provider-contradiction:${claims[0]?.id}`,
          fieldKey: 'expectedEvents',
          reasonCode: 'PROVIDER_CONTRADICTION',
          material: true,
          reviewRequired: true,
          candidateRefs: claims.map((claim) => claim.id),
          providerObservationKey: observations.find((observation) => observation.messageId === claims[0]?.sourceRefs[0]?.messageId)?.key,
          sourceRefs: claims.flatMap((claim) => claim.sourceRefs)
        }]
      };
    })
  };
}

export class ResponsibilityInterpretationRuntime {
  public constructor(private readonly deps: RuntimeDependencies) {}

  public async run(input: AuthorizedInterpretationContext | InterpretationContextRequest): Promise<InterpretationRuntimeResult> {
    const captured = await captureInterpretationContext(this.deps, input);
    const {context, built, runId} = captured;
    try {
      assertProviderDataControl(this.deps);
      const raw = await this.deps.transport.create(responseRequest({
        model: this.deps.config.model,
        messages: [...built.input],
        format: INTERPRETATION_RESPONSE_FORMAT,
        maxOutputTokens: this.deps.config.maxInterpretationOutputTokens ?? 4_000
      }));
      const modelOutput = validateInterpretationOutput(parseResponseJson(raw), {
        basisEvidenceRevision: context.evidenceRevision,
        allowedMessageIds: built.allowedMessageIds,
        allowedParticipantIds: built.allowedParticipantIds,
        allowedParticipantEmails: built.allowedParticipantEmails,
        allowedParticipantRoles: built.allowedParticipantRoles,
        messageParticipantEmails: built.messageParticipantEmails,
        allowedSourceZones: built.allowedSourceZones,
        authorizedMessageBodies: built.authorizedMessageBodies,
        authorizedMessageSentAt: built.authorizedMessageSentAt,
        referenceTimezone: built.referenceTimezone,
        allowedExistingResponsibilityOutcomes: built.allowedExistingResponsibilityOutcomes,
        expectedSourceMessageId: context.focalMessageId
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
      const enrichedOutput = trustedProviderFindings(modelOutput, built.providerObservations);
      const candidate = toResponsibilityInterpretationCandidate({
        output: enrichedOutput,
        userId: context.user.id,
        connectedAccountId: context.connectedAccount.id,
        conversationId: context.conversationId,
        sourceEventKey: context.sourceEventKey,
        candidateKey: `ai:${context.focalMessageId}:${modelOutput.basisEvidenceRevision}`,
        interpretationRunId: runId
      });
      if (!candidate) throw new AIContractError('interpretation candidate was not produced');
      const derivation = deriveResponsibilityCommand(candidate, {
        evidenceBasis: interpretationEvidenceBasis(context),
        existingResponsibilities: captured.existingResponsibilities ?? this.deps.existingResponsibilities
      });
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

  public async run(input: AuthorizedReplyContext | DraftContextRequest): Promise<DraftRuntimeResult> {
    const captured = await captureDraftContext(this.deps, input);
    const {context, built, runId} = captured;
    try {
      assertProviderDataControl(this.deps);
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
