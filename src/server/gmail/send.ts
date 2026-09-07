import {createHash} from 'node:crypto';

import type {CommunicationRepository, SendOperationReadModel} from '@/server/db/repositories/communication';
import {CommunicationRepository as DefaultCommunicationRepository} from '@/server/db/repositories/communication';
import type {EvidenceRepository} from '@/server/db/repositories/evidence';
import {EvidenceRepository as DefaultEvidenceRepository} from '@/server/db/repositories/evidence';
import type {ResponsibilityRepository} from '@/server/db/repositories/responsibility';
import {ResponsibilityRepository as DefaultResponsibilityRepository} from '@/server/db/repositories/responsibility';
import {GmailCredentialService} from './authorization';
import {normalizeGmailMessage} from './normalize';
import type {GmailMessage, GmailProviderClient} from './types';
import {GmailProviderError, GMAIL_SEND_SCOPE} from './types';
import type {ProvenanceInput, ResponsibilityState, TrustedResponsibilityCommand} from '@/server/responsibility';

const RECONCILABLE_STATUSES = ['DISPATCHING', 'AMBIGUOUS', 'PROVIDER_ACCEPTED'] as const;

export type SendSnapshot = {
  draftId: string;
  draftVersion: number;
  userId: string;
  connectedAccountId: string;
  sender: {email: string; displayName: string | null};
  conversationId: string;
  inReplyToMessageId: string;
  mode: 'REPLY' | 'REPLY_ALL';
  recipients: readonly {email: string; displayName: string | null}[];
  cc: readonly {email: string; displayName: string | null}[];
  bcc: readonly {email: string; displayName: string | null}[];
  subject: string;
  bodyFormat: 'TEXT';
  body: string;
  replyContext: Record<string, unknown>;
  responsibilityBinding?: {
    responsibilityId: string;
    aggregateVersion: number;
    evidenceRevision: number;
  };
};

type OperationStore = Pick<CommunicationRepository,
  'getSendOperation' | 'claimSendOperation' | 'transitionSendOperation'>;
type EvidenceWriter = Pick<EvidenceRepository, 'upsertNormalizedMessage'>;
type ResponsibilityWriter = Pick<ResponsibilityRepository, 'getResponsibility' | 'applyTrustedCommand'>;
type CredentialReader = Pick<GmailCredentialService, 'getAccessToken'> &
  Partial<Pick<GmailCredentialService, 'markReconnectRequired'>>;

function header(message: GmailMessage, name: string): string | undefined {
  return message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value?.trim();
}

function assertHeaderSafe(value: string, name: string): string {
  if (!value || /[\r\n\u0000-\u001f\u007f]/.test(value)) throw new Error(`MIME_HEADER_INVALID:${name}`);
  return value;
}

function encodeHeader(value: string): string {
  const safe = assertHeaderSafe(value, 'value');
  return /[^\x20-\x7e]/.test(safe)
    ? `=?UTF-8?B?${Buffer.from(safe, 'utf8').toString('base64')}?=`
    : safe;
}

function mailbox(value: {email: string; displayName: string | null}): string {
  const email = assertHeaderSafe(value.email.trim().toLowerCase(), 'address');
  if (!/^[^@\s<>]+@[^@\s<>]+$/.test(email)) throw new Error('MIME_ADDRESS_INVALID');
  if (!value.displayName) return `<${email}>`;
  const displayName = assertHeaderSafe(value.displayName, 'display-name');
  return /[^\x20-\x7e]/.test(displayName)
    ? `${encodeHeader(displayName)} <${email}>`
    : `"${displayName.replace(/[\\\"]/g, '\\$&')}" <${email}>`;
}

function mailboxes(values: readonly {email: string; displayName: string | null}[]): string {
  if (values.length === 0) throw new Error('MIME_RECIPIENTS_EMPTY');
  return values.map(mailbox).join(', ');
}

function messageIdForSendOperation(sendOperationId: string): string {
  const digest = createHash('sha256').update(`lunowa:gmail:send:${sendOperationId}`).digest('hex');
  return `<lunowa-${digest}@lunowa.invalid>`;
}

function messageIds(value: string | undefined): string[] {
  if (!value) return [];
  assertHeaderSafe(value, 'message-id');
  return [...value.matchAll(/<[^<>\r\n\s]+>/g)].map(([id]) => id);
}

function compatibleSubject(left: string, right: string): boolean {
  const normalize = (value: string) => value.trim().replace(/^(?:(?:re|fw|fwd)\s*:\s*)+/i, '').trim().toLowerCase();
  return normalize(left) === normalize(right);
}

function contextString(snapshot: SendSnapshot, key: string): string {
  const value = snapshot.replyContext[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`SEND_CONTEXT_MISSING:${key}`);
  return value;
}

export function buildGmailMessageId(sendOperationId: string): string {
  return messageIdForSendOperation(sendOperationId);
}

export function buildGmailTextMime(input: {
  sendOperationId: string;
  snapshot: SendSnapshot;
  originalMessage: GmailMessage;
}): {raw: string; threadId: string; messageId: string} {
  const {snapshot, originalMessage} = input;
  if (snapshot.bodyFormat !== 'TEXT') throw new Error('MIME_BODY_FORMAT_UNSUPPORTED');
  assertHeaderSafe(snapshot.subject, 'subject');
  const providerThreadId = contextString(snapshot, 'providerThreadId');
  if (!originalMessage.threadId || originalMessage.threadId !== providerThreadId) {
    throw new Error('THREAD_CONTEXT_MISMATCH');
  }
  const originalMessageId = header(originalMessage, 'Message-ID');
  if (!originalMessageId || messageIds(originalMessageId).length !== 1) throw new Error('ORIGINAL_MESSAGE_ID_MISSING');
  const originalSubject = header(originalMessage, 'Subject');
  if (!originalSubject || !compatibleSubject(snapshot.subject, originalSubject)) throw new Error('THREAD_SUBJECT_MISMATCH');

  const references = [...new Set([
    ...messageIds(header(originalMessage, 'References')),
    ...messageIds(originalMessageId)
  ])];
  const messageId = messageIdForSendOperation(input.sendOperationId);
  const lines = [
    `From: ${mailbox(snapshot.sender)}`,
    `To: ${mailboxes(snapshot.recipients)}`,
    ...(snapshot.cc.length > 0 ? [`Cc: ${mailboxes(snapshot.cc)}`] : []),
    ...(snapshot.bcc.length > 0 ? [`Bcc: ${mailboxes(snapshot.bcc)}`] : []),
    `Subject: ${encodeHeader(snapshot.subject)}`,
    `Message-ID: ${messageId}`,
    `In-Reply-To: ${originalMessageId}`,
    `References: ${references.join(' ')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    snapshot.body.replace(/\r\n|\r|\n/g, '\r\n')
  ];
  const raw = Buffer.from(lines.join('\r\n'), 'utf8').toString('base64url');
  return {raw, threadId: originalMessage.threadId, messageId};
}

function snapshotOf(operation: SendOperationReadModel): SendSnapshot {
  const value = operation.draftSnapshot as Partial<SendSnapshot>;
  if (value.userId !== operation.userId || value.connectedAccountId !== operation.connectedAccountId ||
      !value.sender || !value.sender.email || !value.conversationId || !value.inReplyToMessageId ||
      !value.replyContext || !Array.isArray(value.recipients) || !Array.isArray(value.cc) || !Array.isArray(value.bcc)) {
    throw new Error('SEND_SNAPSHOT_UNTRUSTED');
  }
  return value as SendSnapshot;
}

function providerErrorCode(error: unknown): string {
  return error instanceof GmailProviderError ? error.code : 'SEND_TRANSPORT_AMBIGUOUS';
}

function isExplicitProviderRejection(error: unknown): boolean {
  return error instanceof GmailProviderError && error.status >= 400 && error.status < 500;
}

function bindingOf(snapshot: SendSnapshot): SendSnapshot['responsibilityBinding'] | undefined {
  const binding = snapshot.responsibilityBinding;
  if (!binding || !Number.isInteger(binding.aggregateVersion) || binding.aggregateVersion < 1 ||
      !Number.isInteger(binding.evidenceRevision) || binding.evidenceRevision < 0 ||
      !binding.responsibilityId) return undefined;
  return binding;
}

function sendLeg(leg: ResponsibilityState['obligationLegs'][number]): boolean {
  return leg.bearer === 'USER' && /^(?:SEND|REPLY|RESPOND|FOLLOW[_-]?UP)(?:$|[_-])/.test(leg.actionCode.trim().toUpperCase());
}

export function buildTrustedReconciledSendCommand(input: {
  operation: SendOperationReadModel;
  snapshot: SendSnapshot;
  responsibility: ResponsibilityState;
  messageId: string;
  evidenceRevision: number;
}): TrustedResponsibilityCommand | undefined {
  const state = input.responsibility;
  const candidates = state.obligationLegs.filter((leg) => leg.status === 'OPEN' && sendLeg(leg));
  if (candidates.length !== 1) return undefined;
  const selected = candidates[0]!;
  const provenance: ProvenanceInput = {
    evidenceKind: 'PROVIDER_RECONCILED_SEND',
    messageId: input.messageId,
    providerObservationKey: input.operation.providerMessageId ?? undefined,
    sourceLocator: {authorized: true, provider: 'gmail', sendOperationId: input.operation.id}
  };
  const legs = state.obligationLegs.map((leg) => leg.id === selected.id
    ? {...leg, status: 'CLOSED' as const, closureReason: 'SATISFIED', closedAt: new Date().toISOString(), provenance: [...leg.provenance, provenance]}
    : leg);
  const hasRemainingRequirements = legs.some((leg) => leg.status === 'OPEN') ||
    state.expectedEvents.some((event) => event.status === 'PENDING') ||
    state.details.completionCriteria.some((criterion) => criterion.status === 'PENDING');
  const effect = {
    operation: hasRemainingRequirements ? 'UPDATE' as const : 'RESOLVE' as const,
    responsibilityRef: state.id,
    expectedAggregateVersion: state.aggregateVersion,
    effectKey: `provider-reconciled-send:${input.operation.id}`,
    patch: {obligationLegs: legs},
    ...(hasRemainingRequirements ? {} : {reason: 'SATISFIED', resolutionEvidence: {strength: 'SUFFICIENT' as const, kinds: ['PROVIDER_RECONCILED_SEND' as const], explicitlySatisfiesOutcome: true}}),
    provenance: [provenance]
  };
  return {
    userId: state.userId,
    connectedAccountId: state.connectedAccountId,
    conversationId: state.conversationId,
    commandSource: 'TRUSTED_SYSTEM',
    sourceEventKey: `provider-reconciled-send:${input.operation.id}`,
    candidateKey: `provider-reconciled-send:${input.operation.id}`,
    evidenceRevision: input.evidenceRevision,
    admission: {decision: 'TRACK', reasonCodes: ['PROVIDER_RECONCILED_SEND'], candidateSummary: {sendOperationId: input.operation.id}},
    provenance: [provenance],
    applicationKey: `provider-reconciled-send:${input.operation.id}`,
    correlationId: input.operation.id,
    effects: [effect]
  };
}

export class GmailSendService {
  constructor(
    private readonly provider: GmailProviderClient,
    private readonly credentials: CredentialReader,
    private readonly operations: OperationStore = new DefaultCommunicationRepository(),
    private readonly evidence: EvidenceWriter = new DefaultEvidenceRepository(),
    private readonly responsibilities: ResponsibilityWriter = new DefaultResponsibilityRepository()
  ) {}

  async dispatch(input: {userId: string; sendOperationId: string}): Promise<SendOperationReadModel> {
    const operation = await this.operations.claimSendOperation(input);
    if (operation.status === 'FAILED' || operation.status === 'RECONCILED') return operation;
    if (!operation.claimed && (RECONCILABLE_STATUSES as readonly string[]).includes(operation.status)) {
      return this.reconcile(input, operation);
    }
    const snapshot = snapshotOf(operation);
    let accessToken: string;
    let mime: ReturnType<typeof buildGmailTextMime>;
    let originalMessage: GmailMessage;
    try {
      accessToken = await this.credentials.getAccessToken(input.userId, operation.connectedAccountId, GMAIL_SEND_SCOPE);
      originalMessage = await this.provider.getMessage(accessToken, contextString(snapshot, 'inReplyToProviderMessageId'));
      mime = buildGmailTextMime({sendOperationId: operation.id, snapshot, originalMessage});
    } catch (error) {
      if (error instanceof GmailProviderError && error.status === 401 && this.credentials.markReconnectRequired) {
        await this.credentials.markReconnectRequired(input.userId, operation.connectedAccountId).catch(() => undefined);
      }
      return this.operations.transitionSendOperation({
        userId: input.userId,
        sendOperationId: operation.id,
        expectedStatuses: ['DISPATCHING'],
        status: 'FAILED',
        lastErrorCode: error instanceof Error ? error.message.slice(0, 128) : 'SEND_PRECONDITION_FAILED'
      });
    }
    try {
      const response = await this.provider.sendMessage(accessToken, mime);
      if (!response.id || !response.threadId) throw new GmailProviderError(502, 'INVALID_SEND_RESPONSE');
      const accepted = await this.operations.transitionSendOperation({
        userId: input.userId,
        sendOperationId: operation.id,
        expectedStatuses: ['DISPATCHING', 'AMBIGUOUS'],
        status: 'PROVIDER_ACCEPTED',
        providerResultId: response.id,
        providerMessageId: response.id,
        lastErrorCode: null
      });
      return this.reconcileAccepted(input, accepted, accessToken, response.id);
    } catch (error) {
      if (error instanceof GmailProviderError && error.status === 401 && this.credentials.markReconnectRequired) {
        await this.credentials.markReconnectRequired(input.userId, operation.connectedAccountId).catch(() => undefined);
      }
      return this.operations.transitionSendOperation({
        userId: input.userId,
        sendOperationId: operation.id,
        expectedStatuses: ['DISPATCHING'],
        status: isExplicitProviderRejection(error) ? 'FAILED' : 'AMBIGUOUS',
        lastErrorCode: providerErrorCode(error)
      });
    }
  }

  private async reconcile(input: {userId: string; sendOperationId: string}, operation: SendOperationReadModel): Promise<SendOperationReadModel> {
    let token: string;
    try {
      token = await this.credentials.getAccessToken(input.userId, operation.connectedAccountId, GMAIL_SEND_SCOPE);
    } catch (error) {
      return this.operations.transitionSendOperation({
        userId: input.userId, sendOperationId: operation.id, expectedStatuses: [operation.status],
        status: operation.status, lastErrorCode: error instanceof Error ? error.message.slice(0, 128) : 'RECONCILIATION_AUTH_FAILED'
      });
    }
    const stableId = messageIdForSendOperation(operation.id);
    let page;
    try {
      page = await this.provider.listMessagesByRfc822MessageId(token, stableId);
    } catch (error) {
      return this.operations.transitionSendOperation({
        userId: input.userId, sendOperationId: operation.id, expectedStatuses: [operation.status],
        status: operation.status, lastErrorCode: providerErrorCode(error)
      });
    }
    const ids = [...new Set((page.messages ?? []).map((item) => item.id).filter(Boolean))];
    const matches: GmailMessage[] = [];
    try {
      for (const id of ids) {
        const message = await this.provider.getMessage(token, id);
        if (header(message, 'Message-ID') === stableId) matches.push(message);
      }
    } catch (error) {
      return this.operations.transitionSendOperation({
        userId: input.userId, sendOperationId: operation.id, expectedStatuses: [operation.status],
        status: 'AMBIGUOUS', lastErrorCode: providerErrorCode(error)
      });
    }
    if (matches.length !== 1) {
      return this.operations.transitionSendOperation({
        userId: input.userId, sendOperationId: operation.id, expectedStatuses: [operation.status],
        status: 'AMBIGUOUS', lastErrorCode: matches.length > 1 ? 'MULTIPLE_RECONCILIATION_MATCHES' : 'SEND_ACCEPTANCE_UNKNOWN'
      });
    }
    return this.reconcileAccepted(input, operation, token, matches[0]!.id, matches[0]);
  }

  private async reconcileAccepted(
    input: {userId: string; sendOperationId: string},
    operation: SendOperationReadModel,
    accessToken: string,
    providerMessageId: string,
    knownMessage?: GmailMessage
  ): Promise<SendOperationReadModel> {
    const snapshot = snapshotOf(operation);
    const message = knownMessage ?? await this.provider.getMessage(accessToken, providerMessageId);
    const normalized = await normalizeGmailMessage({
      userId: input.userId,
      connectedAccountId: operation.connectedAccountId,
      accountEmail: snapshot.sender.email,
      message,
      loadBodyPart: (attachmentId) => this.provider.getAttachment(accessToken, message.id, attachmentId)
    });
    const source = await this.evidence.upsertNormalizedMessage(normalized);
    const binding = bindingOf(snapshot);
    if (binding) {
      const target = await this.responsibilities.getResponsibility({
        userId: input.userId,
        connectedAccountId: operation.connectedAccountId,
        responsibilityId: binding.responsibilityId
      });
      if (target && target.state.aggregateVersion === binding.aggregateVersion &&
          target.state.acceptedEvidenceRevision === binding.evidenceRevision &&
          target.state.conversationId === snapshot.conversationId) {
        const command = buildTrustedReconciledSendCommand({operation, snapshot, responsibility: target.state, messageId: source.messageId, evidenceRevision: source.evidenceRevision});
        if (command) await this.responsibilities.applyTrustedCommand(command);
      }
    }
    return this.operations.transitionSendOperation({
      userId: input.userId, sendOperationId: operation.id,
      expectedStatuses: ['PROVIDER_ACCEPTED', 'DISPATCHING', 'AMBIGUOUS'],
      status: 'RECONCILED', providerResultId: operation.providerResultId ?? providerMessageId,
      providerMessageId, lastErrorCode: null
    });
  }
}
