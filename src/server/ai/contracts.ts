import type {
  CandidateAgreedFact,
  CandidateCompletionCriterion,
  CandidateConstraint,
  CandidateExpectedEvent,
  CandidateFieldCorrection,
  CandidateObligationLeg,
  CandidatePendingProposal,
  CandidateResponsibilitySemantics,
  CandidateTemporalFact,
  CandidateTerminalSignal,
  ProvenanceInput,
  ResponsibilityInterpretationCandidate,
  Uncertainty,
  RiskDetail
} from '../responsibility/types';

/**
 * These are the only source zones that a model may cite. Provider
 * observations, application state, and accepted Responsibility state are
 * intentionally absent: the trusted application adds and validates those
 * facts outside the model boundary.
 */
export const MODEL_SOURCE_ZONES = [
  'AUTHORED_CURRENT',
  'QUOTED_HISTORY',
  'FORWARDED_CONTENT',
  'SIGNATURE',
  'DISCLAIMER',
  'STRUCTURED_METADATA'
] as const;
export type ModelSourceZone = (typeof MODEL_SOURCE_ZONES)[number];

export const AI_INTERPRETATION_SCHEMA_VERSION = 1 as const;
export const AI_DRAFT_SCHEMA_VERSION = 1 as const;

export type ModelSourceRef = {
  messageId: string;
  zone: ModelSourceZone;
  excerpt?: string;
  start?: number;
  end?: number;
};

export type ModelIdentityRelation = {
  kind: 'NEW' | 'CONTINUES' | 'REPLACES' | 'SAME_UNSATISFIED_OUTCOME' | 'NEW_EPISODE';
  priorOperationalOutcome?: string;
};

type ModelProvenanced<T extends object> = T & {sourceRefs: ModelSourceRef[]};

export type ModelObligationLeg = ModelProvenanced<{
  id: string;
  bearerCandidate: 'USER' | 'PARTICIPANT' | 'OTHER_PARTY' | 'EXTERNAL';
  participantId?: string;
  actionCode: string;
  actionSummary?: string;
  objectSummary?: string;
  basisKind?: string;
  blockedByCondition?: boolean;
}>;

export type ModelExpectedEvent = ModelProvenanced<{
  id: string;
  actor: 'PARTICIPANT' | 'OTHER_PARTY' | 'EXTERNAL';
  participantId?: string;
  eventCode: string;
  eventSummary?: string;
  basisKind?: string;
  expectationStrength?: string;
}>;

export type ModelTemporalFact = ModelProvenanced<{
  id: string;
  temporalKind: 'SOURCE_DUE' | 'EXPECTED_EVENT_TIME' | 'USER_TARGET';
  obligationLegId?: string;
  expectedEventId?: string;
  originalExpression?: string;
  valueKind: 'DATE' | 'INSTANT' | 'UNRESOLVED';
  resolvedDate?: string;
  resolvedAt?: string;
  precisionCode: string;
  referenceTimezone?: string;
  anchorKind?: string;
  anchorReference?: string;
  anchorOffsetSeconds?: number;
  conflictCandidate?: boolean;
  authorityStatus?: string;
}>;

export type ModelCompletionCriterion = ModelProvenanced<{
  id: string;
  code: string;
  summary?: string;
}>;

export type ModelConstraint = ModelProvenanced<{
  id: string;
  code: string;
  summary?: string;
  conditionRef?: {kind: 'EXPECTED_EVENT' | 'OTHER'; id?: string; code?: string};
}>;

/**
 * Structured Outputs cannot express an arbitrary object with strict
 * additionalProperties=false. Model values therefore cross the wire as
 * bounded JSON text and are decoded only after runtime validation.
 */
export type ModelJSONValue = string;

export type ModelPendingProposal = ModelProvenanced<{
  id: string;
  kind: string;
  value: ModelJSONValue;
  candidateStatus?: 'PENDING' | 'REJECTED';
}>;

export type ModelAgreedFact = ModelProvenanced<{
  id: string;
  kind: string;
  value: ModelJSONValue;
}>;

export type ModelUncertainty = ModelProvenanced<{
  id: string;
  fieldKey: string;
  reasonCode: string;
  material: boolean;
  reviewRequired: boolean;
  candidateRefs?: string[];
}>;

export type ModelRiskDetail = ModelProvenanced<{
  id: string;
  targetKind: string;
  targetId?: string;
  riskClass: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  reasonCode: string;
}>;

export type ModelFieldCorrection = ModelProvenanced<{
  fieldKey: CandidateFieldCorrection['fieldKey'];
  value: ModelJSONValue;
  semanticTime?: string;
  relation: 'CORRECTION' | 'SUPERSEDES' | 'CONFLICT';
}>;

export type ModelSemanticUnit = {
  candidateUnitKey: string;
  materiality: 'MATERIAL' | 'NOT_MATERIAL' | 'UNCERTAIN';
  operationalOutcome?: string;
  identityRelation?: ModelIdentityRelation;
  obligationLegs: ModelObligationLeg[];
  expectedEvents: ModelExpectedEvent[];
  temporalFacts: ModelTemporalFact[];
  completionCriteria: ModelCompletionCriterion[];
  constraints: ModelConstraint[];
  pendingProposals: ModelPendingProposal[];
  agreedFacts: ModelAgreedFact[];
  uncertainties: ModelUncertainty[];
  riskDetails: ModelRiskDetail[];
  assignmentSemantics?: {
    id: string;
    shape: 'ANY_OF' | 'ALL_OF' | 'UNSPECIFIED_GROUP';
    candidateParticipantIds: string[];
    selectedParticipantId?: string;
  };
  corrections: ModelFieldCorrection[];
  terminalSignal?: {
    kind: 'NONE' | 'COMPLETED' | 'DECLINED' | 'CANCELLED' | 'INVALIDATED';
    sourceRefs: ModelSourceRef[];
  };
  sourceRefs: ModelSourceRef[];
};

export type ModelInterpretationOutput = {
  schemaVersion: typeof AI_INTERPRETATION_SCHEMA_VERSION;
  basisEvidenceRevision: number;
  status: 'CANDIDATE' | 'ABSTAINED';
  sourceMessageId: string;
  abstentionReason?: 'AMBIGUOUS' | 'MISSING_CONTEXT' | 'UNSAFE_HIGH_RISK' | 'UNINTERPRETABLE';
  semanticUnits: ModelSemanticUnit[];
  sourceRefs: ModelSourceRef[];
};

export type ModelDraftOutput = {
  schemaVersion: typeof AI_DRAFT_SCHEMA_VERSION;
  basisEvidenceRevision: number;
  status: 'DRAFT' | 'ABSTAINED';
  body: string;
  abstentionReason?: 'MISSING_CONTEXT' | 'UNSAFE_HIGH_RISK' | 'UNINTERPRETABLE';
};

export type JsonSchema = {
  type?: string | string[];
  enum?: readonly unknown[];
  properties?: Record<string, JsonSchema>;
  required?: readonly string[];
  items?: JsonSchema;
  additionalProperties?: boolean;
  anyOf?: readonly JsonSchema[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
};

export type StructuredResponseFormat = {
  type: 'json_schema';
  name: string;
  strict: true;
  schema: JsonSchema;
};

const nullable = (schema: JsonSchema): JsonSchema => ({anyOf: [schema, {type: 'null'}]});
const stringSchema = (maxLength?: number): JsonSchema => ({type: 'string', ...(maxLength ? {maxLength} : {})});
const enumSchema = (values: readonly string[]): JsonSchema => ({type: 'string', enum: values});
const arraySchema = (items: JsonSchema): JsonSchema => ({type: 'array', items});
const objectSchema = (properties: Record<string, JsonSchema>, required: readonly string[]): JsonSchema => ({
  type: 'object', properties, required, additionalProperties: false
});

const sourceRefSchema = objectSchema({
  messageId: stringSchema(256),
  zone: enumSchema(MODEL_SOURCE_ZONES),
  excerpt: nullable(stringSchema(512)),
  start: nullable({type: 'integer', minimum: 0, maximum: 100_000}),
  end: nullable({type: 'integer', minimum: 0, maximum: 100_000})
}, ['messageId', 'zone', 'excerpt', 'start', 'end']);

const provenanceFields = {sourceRefs: arraySchema(sourceRefSchema)};
const sourceProvenanced = (properties: Record<string, JsonSchema>, required: readonly string[]): JsonSchema =>
  objectSchema({...properties, ...provenanceFields}, [...required, 'sourceRefs']);

const jsonValueSchema: JsonSchema = {
  type: 'string', maxLength: 16_384
};

const identitySchema = nullable(objectSchema({
  kind: enumSchema(['NEW', 'CONTINUES', 'REPLACES', 'SAME_UNSATISFIED_OUTCOME', 'NEW_EPISODE']),
  priorOperationalOutcome: nullable(stringSchema(2048))
}, ['kind', 'priorOperationalOutcome']));

const obligationLegSchema = sourceProvenanced({
  id: stringSchema(128),
  bearerCandidate: enumSchema(['USER', 'PARTICIPANT', 'OTHER_PARTY', 'EXTERNAL']),
  participantId: nullable(stringSchema(128)),
  actionCode: stringSchema(128),
  actionSummary: nullable(stringSchema(2048)),
  objectSummary: nullable(stringSchema(2048)),
  basisKind: nullable(stringSchema(128)),
  blockedByCondition: {type: 'boolean'}
}, ['id', 'bearerCandidate', 'participantId', 'actionCode', 'actionSummary', 'objectSummary', 'basisKind', 'blockedByCondition']);

const expectedEventSchema = sourceProvenanced({
  id: stringSchema(128),
  actor: enumSchema(['PARTICIPANT', 'OTHER_PARTY', 'EXTERNAL']),
  participantId: nullable(stringSchema(128)),
  eventCode: stringSchema(128),
  eventSummary: nullable(stringSchema(2048)),
  basisKind: nullable(stringSchema(128)),
  expectationStrength: nullable(stringSchema(128))
}, ['id', 'actor', 'participantId', 'eventCode', 'eventSummary', 'basisKind', 'expectationStrength']);

const temporalFactSchema = sourceProvenanced({
  id: stringSchema(128),
  temporalKind: enumSchema(['SOURCE_DUE', 'EXPECTED_EVENT_TIME', 'USER_TARGET']),
  obligationLegId: nullable(stringSchema(128)),
  expectedEventId: nullable(stringSchema(128)),
  originalExpression: nullable(stringSchema(512)),
  valueKind: enumSchema(['DATE', 'INSTANT', 'UNRESOLVED']),
  resolvedDate: nullable(stringSchema(32)),
  resolvedAt: nullable(stringSchema(64)),
  precisionCode: stringSchema(64),
  referenceTimezone: nullable(stringSchema(128)),
  anchorKind: nullable(stringSchema(128)),
  anchorReference: nullable(stringSchema(256)),
  anchorOffsetSeconds: nullable({type: 'integer', minimum: -31_536_000, maximum: 31_536_000}),
  conflictCandidate: {type: 'boolean'},
  authorityStatus: nullable(stringSchema(128))
}, ['id', 'temporalKind', 'obligationLegId', 'expectedEventId', 'originalExpression', 'valueKind', 'resolvedDate', 'resolvedAt', 'precisionCode', 'referenceTimezone', 'anchorKind', 'anchorReference', 'anchorOffsetSeconds', 'conflictCandidate', 'authorityStatus']);

const completionSchema = sourceProvenanced({
  id: stringSchema(128), code: stringSchema(128), summary: nullable(stringSchema(2048))
}, ['id', 'code', 'summary']);
const constraintSchema = sourceProvenanced({
  id: stringSchema(128), code: stringSchema(128), summary: nullable(stringSchema(2048)),
  conditionRef: nullable(objectSchema({kind: enumSchema(['EXPECTED_EVENT', 'OTHER']), id: nullable(stringSchema(128)), code: nullable(stringSchema(128))}, ['kind', 'id', 'code']))
}, ['id', 'code', 'summary', 'conditionRef']);
const proposalSchema = sourceProvenanced({
  id: stringSchema(128), kind: stringSchema(128), value: jsonValueSchema, candidateStatus: nullable(enumSchema(['PENDING', 'REJECTED']))
}, ['id', 'kind', 'value', 'candidateStatus']);
const agreedFactSchema = sourceProvenanced({
  id: stringSchema(128), kind: stringSchema(128), value: jsonValueSchema
}, ['id', 'kind', 'value']);
const uncertaintySchema = sourceProvenanced({
  id: stringSchema(128), fieldKey: stringSchema(128), reasonCode: stringSchema(128), material: {type: 'boolean'}, reviewRequired: {type: 'boolean'}, candidateRefs: nullable(arraySchema(stringSchema(128)))
}, ['id', 'fieldKey', 'reasonCode', 'material', 'reviewRequired', 'candidateRefs']);
const riskSchema = sourceProvenanced({
  id: stringSchema(128), targetKind: stringSchema(128), targetId: nullable(stringSchema(128)), riskClass: enumSchema(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']), reasonCode: stringSchema(128)
}, ['id', 'targetKind', 'targetId', 'riskClass', 'reasonCode']);
const correctionSchema = sourceProvenanced({
  fieldKey: stringSchema(128), value: jsonValueSchema, semanticTime: nullable(stringSchema(128)), relation: enumSchema(['CORRECTION', 'SUPERSEDES', 'CONFLICT'])
}, ['fieldKey', 'value', 'semanticTime', 'relation']);

const assignmentSchema = nullable(objectSchema({
  id: stringSchema(128), shape: enumSchema(['ANY_OF', 'ALL_OF', 'UNSPECIFIED_GROUP']), candidateParticipantIds: arraySchema(stringSchema(128)), selectedParticipantId: nullable(stringSchema(128))
}, ['id', 'shape', 'candidateParticipantIds', 'selectedParticipantId']));
const terminalSchema = nullable(objectSchema({
  kind: enumSchema(['NONE', 'COMPLETED', 'DECLINED', 'CANCELLED', 'INVALIDATED']), sourceRefs: arraySchema(sourceRefSchema)
}, ['kind', 'sourceRefs']));
const semanticUnitSchema = objectSchema({
  candidateUnitKey: stringSchema(128), materiality: enumSchema(['MATERIAL', 'NOT_MATERIAL', 'UNCERTAIN']), operationalOutcome: nullable(stringSchema(2048)), identityRelation: identitySchema,
  obligationLegs: arraySchema(obligationLegSchema), expectedEvents: arraySchema(expectedEventSchema), temporalFacts: arraySchema(temporalFactSchema), completionCriteria: arraySchema(completionSchema), constraints: arraySchema(constraintSchema), pendingProposals: arraySchema(proposalSchema), agreedFacts: arraySchema(agreedFactSchema), uncertainties: arraySchema(uncertaintySchema), riskDetails: arraySchema(riskSchema), assignmentSemantics: assignmentSchema, corrections: arraySchema(correctionSchema), terminalSignal: terminalSchema, sourceRefs: arraySchema(sourceRefSchema)
}, ['candidateUnitKey', 'materiality', 'operationalOutcome', 'identityRelation', 'obligationLegs', 'expectedEvents', 'temporalFacts', 'completionCriteria', 'constraints', 'pendingProposals', 'agreedFacts', 'uncertainties', 'riskDetails', 'assignmentSemantics', 'corrections', 'terminalSignal', 'sourceRefs']);

export const INTERPRETATION_RESPONSE_FORMAT: StructuredResponseFormat = {
  type: 'json_schema', name: 'lunowa_responsibility_interpretation_v1', strict: true,
  schema: objectSchema({
    schemaVersion: {type: 'integer', enum: [AI_INTERPRETATION_SCHEMA_VERSION]}, basisEvidenceRevision: {type: 'integer', minimum: 0}, status: enumSchema(['CANDIDATE', 'ABSTAINED']), sourceMessageId: stringSchema(256), abstentionReason: nullable(enumSchema(['AMBIGUOUS', 'MISSING_CONTEXT', 'UNSAFE_HIGH_RISK', 'UNINTERPRETABLE'])), semanticUnits: arraySchema(semanticUnitSchema), sourceRefs: arraySchema(sourceRefSchema)
  }, ['schemaVersion', 'basisEvidenceRevision', 'status', 'sourceMessageId', 'abstentionReason', 'semanticUnits', 'sourceRefs'])
};

export const DRAFT_RESPONSE_FORMAT: StructuredResponseFormat = {
  type: 'json_schema', name: 'lunowa_contextual_reply_draft_v1', strict: true,
  schema: objectSchema({
    schemaVersion: {type: 'integer', enum: [AI_DRAFT_SCHEMA_VERSION]}, basisEvidenceRevision: {type: 'integer', minimum: 0}, status: enumSchema(['DRAFT', 'ABSTAINED']), body: stringSchema(12_000), abstentionReason: nullable(enumSchema(['MISSING_CONTEXT', 'UNSAFE_HIGH_RISK', 'UNINTERPRETABLE']))
  }, ['schemaVersion', 'basisEvidenceRevision', 'status', 'body', 'abstentionReason'])
};

export class AIContractError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'AIContractError';
  }
}

type RecordValue = Record<string, unknown>;

function record(value: unknown, label: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AIContractError(`${label} must be an object`);
  return value as RecordValue;
}

function exact(value: RecordValue, keys: readonly string[], label: string): void {
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new AIContractError(`${label} contains unsupported field ${key}`);
}

function stringValue(value: unknown, label: string, max = 4096): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new AIContractError(`${label} must be a bounded non-empty string`);
  return value;
}

function optionalString(value: unknown, label: string, max = 4096): string | undefined {
  if (value === undefined || value === null) return undefined;
  return stringValue(value, label, max);
}

function booleanValue(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw new AIContractError(`${label} must be boolean`);
  return value;
}

function enumValue<T extends string>(value: unknown, values: readonly T[], label: string): T {
  if (typeof value !== 'string' || !values.includes(value as T)) throw new AIContractError(`${label} has an unsupported value`);
  return value as T;
}

function boundedInteger(value: unknown, label: string, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum) throw new AIContractError(`${label} must be a bounded integer`);
  return value as number;
}

const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'admission', 'effects', 'responsibilityRef', 'applicationKey', 'resolutionEvidence', 'liveTrackingState', 'attentionMode', 'providerObservations', 'operation', 'commandSource', 'expectedAggregateVersion', 'sender', 'recipients', 'from', 'to', 'cc', 'bcc', 'send'
]);

function assertNoForbiddenKeys(value: unknown, path = 'model output', depth = 0): void {
  if (depth > 12) throw new AIContractError(`${path} is too deeply nested`);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`, depth + 1));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key)) throw new AIContractError(`${path}.${key} is outside the model authority`);
    assertNoForbiddenKeys(nested, `${path}.${key}`, depth + 1);
  }
}

function safeJsonValue(value: unknown, label: string): unknown {
  assertNoForbiddenKeys(value, label);
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined || serialized.length > 16_384) throw new Error('too large');
    return JSON.parse(serialized) as unknown;
  } catch {
    throw new AIContractError(`${label} must be bounded JSON data`);
  }
}

function encodedJsonValue(value: unknown, label: string): ModelJSONValue {
  const encoded = stringValue(value, label, 16_384);
  try {
    safeJsonValue(JSON.parse(encoded) as unknown, label);
  } catch {
    throw new AIContractError(`${label} must contain encoded bounded JSON data`);
  }
  return encoded;
}

function decodedJsonValue(value: ModelJSONValue, label: string): unknown {
  try {
    return safeJsonValue(JSON.parse(value) as unknown, label);
  } catch {
    throw new AIContractError(`${label} must contain encoded bounded JSON data`);
  }
}

type AuthorizedSourceZone = {zone: ModelSourceZone; start: number; end: number};

function sourceRefs(
  value: unknown,
  label: string,
  allowedMessageIds: ReadonlySet<string>,
  allowedSourceZones: ReadonlyMap<string, readonly AuthorizedSourceZone[]>,
  authorizedMessageBodies: ReadonlyMap<string, string>
): ModelSourceRef[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 32) throw new AIContractError(`${label} must contain one to 32 source references`);
  return value.map((item, index) => {
    const source = record(item, `${label}[${index}]`);
    exact(source, ['messageId', 'zone', 'excerpt', 'start', 'end'], `${label}[${index}]`);
    const messageId = stringValue(source.messageId, `${label}[${index}].messageId`, 256);
    if (!allowedMessageIds.has(messageId)) throw new AIContractError(`${label}[${index}] references an unauthorized message`);
    const zone = enumValue(source.zone, MODEL_SOURCE_ZONES, `${label}[${index}].zone`);
    const excerpt = optionalString(source.excerpt, `${label}[${index}].excerpt`, 512);
    const start = source.start === undefined || source.start === null ? undefined : boundedInteger(source.start, `${label}[${index}].start`, 0, 100_000);
    const end = source.end === undefined || source.end === null ? undefined : boundedInteger(source.end, `${label}[${index}].end`, 0, 100_000);
    if ((start === undefined) !== (end === undefined)) throw new AIContractError(`${label}[${index}] must provide both source span bounds or neither`);
    if (start !== undefined && end !== undefined && end < start) throw new AIContractError(`${label}[${index}] has inverted source span`);
    const authorizedZones = allowedSourceZones.get(messageId) ?? [];
    const matchingZones = authorizedZones.filter((candidate) => candidate.zone === zone);
    if (matchingZones.length === 0) throw new AIContractError(`${label}[${index}] cites an unauthorized source zone`);
    if (start !== undefined && end !== undefined && !matchingZones.some((candidate) => start >= candidate.start && end <= candidate.end)) {
      throw new AIContractError(`${label}[${index}] cites a source span outside the authorized zone`);
    }
    const body = authorizedMessageBodies.get(messageId);
    if (body !== undefined && excerpt) {
      const excerptMatches = start !== undefined && end !== undefined
        ? body.slice(start, end) === excerpt
        : matchingZones.some((candidate) => body.slice(candidate.start, candidate.end).includes(excerpt));
      if (!excerptMatches) throw new AIContractError(`${label}[${index}] excerpt does not match the authorized source`);
    }
    return {messageId, zone, ...(excerpt ? {excerpt} : {}), ...(start !== undefined ? {start} : {}), ...(end !== undefined ? {end} : {})};
  });
}

function mapSourceRefs(refs: readonly ModelSourceRef[]): ProvenanceInput[] {
  return refs.map((ref) => ({
    evidenceKind: 'COMMUNICATED_CLAIM', messageId: ref.messageId,
    ...(ref.excerpt ? {sourceExcerptShort: ref.excerpt} : {}),
    sourceLocator: {messageId: ref.messageId, zone: ref.zone, ...(ref.start !== undefined ? {start: ref.start} : {}), ...(ref.end !== undefined ? {end: ref.end} : {})}
  }));
}

function mapProvenanced<T extends {sourceRefs: ModelSourceRef[]}>(item: T): Omit<T, 'sourceRefs'> & {provenance: ProvenanceInput[]} {
  const {sourceRefs: refs, ...rest} = item;
  return {...rest, provenance: mapSourceRefs(refs)};
}

function validateIdentity(value: unknown, label: string): ModelIdentityRelation | undefined {
  if (value === undefined || value === null) return undefined;
  const item = record(value, label);
  exact(item, ['kind', 'priorOperationalOutcome'], label);
  const kind = enumValue(item.kind, ['NEW', 'CONTINUES', 'REPLACES', 'SAME_UNSATISFIED_OUTCOME', 'NEW_EPISODE'] as const, `${label}.kind`);
  const priorOperationalOutcome = optionalString(item.priorOperationalOutcome, `${label}.priorOperationalOutcome`, 2048);
  if (kind !== 'NEW' && kind !== 'NEW_EPISODE' && !priorOperationalOutcome) throw new AIContractError(`${label} needs priorOperationalOutcome`);
  return {kind, ...(priorOperationalOutcome ? {priorOperationalOutcome} : {})};
}

function validateSourceProvenanced(
  value: unknown,
  label: string,
  allowedMessageIds: ReadonlySet<string>,
  allowedSourceZones: ReadonlyMap<string, readonly AuthorizedSourceZone[]>,
  authorizedMessageBodies: ReadonlyMap<string, string>
): ModelSourceRef[] {
  const item = record(value, label);
  return sourceRefs(item.sourceRefs, `${label}.sourceRefs`, allowedMessageIds, allowedSourceZones, authorizedMessageBodies);
}

function validateSemanticUnit(
  value: unknown,
  label: string,
  allowedMessageIds: ReadonlySet<string>,
  allowedParticipantIds: ReadonlySet<string>,
  allowedSourceZones: ReadonlyMap<string, readonly AuthorizedSourceZone[]>,
  authorizedMessageBodies: ReadonlyMap<string, string>
): ModelSemanticUnit {
  const item = record(value, label);
  exact(item, ['candidateUnitKey', 'materiality', 'operationalOutcome', 'identityRelation', 'obligationLegs', 'expectedEvents', 'temporalFacts', 'completionCriteria', 'constraints', 'pendingProposals', 'agreedFacts', 'uncertainties', 'riskDetails', 'assignmentSemantics', 'corrections', 'terminalSignal', 'sourceRefs'], label);
  const candidateUnitKey = stringValue(item.candidateUnitKey, `${label}.candidateUnitKey`, 128);
  const materiality = enumValue(item.materiality, ['MATERIAL', 'NOT_MATERIAL', 'UNCERTAIN'] as const, `${label}.materiality`);
  const operationalOutcome = optionalString(item.operationalOutcome, `${label}.operationalOutcome`, 2048);
  if (materiality === 'MATERIAL' && !operationalOutcome) throw new AIContractError(`${label}.operationalOutcome is required for material units`);
  const identityRelation = validateIdentity(item.identityRelation, `${label}.identityRelation`);
  const refs = validateSourceProvenanced(item, label, allowedMessageIds, allowedSourceZones, authorizedMessageBodies);
  const refsFor = (value: unknown, nestedLabel: string): ModelSourceRef[] =>
    validateSourceProvenanced(value, nestedLabel, allowedMessageIds, allowedSourceZones, authorizedMessageBodies);
  const list = <T>(key: string, mapper: (value: unknown, label: string) => T): T[] => {
    const values = item[key];
    if (!Array.isArray(values) || values.length > 64) throw new AIContractError(`${label}.${key} must be a bounded array`);
    return values.map((nested, index) => mapper(nested, `${label}.${key}[${index}]`));
  };
  const obligationLegs = list('obligationLegs', (value, nestedLabel) => {
    const leg = record(value, nestedLabel);
    exact(leg, ['id', 'bearerCandidate', 'participantId', 'actionCode', 'actionSummary', 'objectSummary', 'basisKind', 'blockedByCondition', 'sourceRefs'], nestedLabel);
    const bearerCandidate = enumValue(leg.bearerCandidate, ['USER', 'PARTICIPANT', 'OTHER_PARTY', 'EXTERNAL'] as const, `${nestedLabel}.bearerCandidate`);
    const participantId = optionalString(leg.participantId, `${nestedLabel}.participantId`, 128);
    if (bearerCandidate !== 'USER' && (!participantId || !allowedParticipantIds.has(participantId))) throw new AIContractError(`${nestedLabel} needs an authorized participantId`);
    return {id: stringValue(leg.id, `${nestedLabel}.id`, 128), bearerCandidate, ...(participantId ? {participantId} : {}), actionCode: stringValue(leg.actionCode, `${nestedLabel}.actionCode`, 128), ...(optionalString(leg.actionSummary, `${nestedLabel}.actionSummary`, 2048) ? {actionSummary: optionalString(leg.actionSummary, `${nestedLabel}.actionSummary`, 2048)} : {}), ...(optionalString(leg.objectSummary, `${nestedLabel}.objectSummary`, 2048) ? {objectSummary: optionalString(leg.objectSummary, `${nestedLabel}.objectSummary`, 2048)} : {}), ...(optionalString(leg.basisKind, `${nestedLabel}.basisKind`, 128) ? {basisKind: optionalString(leg.basisKind, `${nestedLabel}.basisKind`, 128)} : {}), blockedByCondition: booleanValue(leg.blockedByCondition, `${nestedLabel}.blockedByCondition`), sourceRefs: sourceRefs(leg.sourceRefs, `${nestedLabel}.sourceRefs`, allowedMessageIds, allowedSourceZones, authorizedMessageBodies)};
  });
  const expectedEvents = list('expectedEvents', (value, nestedLabel) => {
    const event = record(value, nestedLabel);
    exact(event, ['id', 'actor', 'participantId', 'eventCode', 'eventSummary', 'basisKind', 'expectationStrength', 'sourceRefs'], nestedLabel);
    const actor = enumValue(event.actor, ['PARTICIPANT', 'OTHER_PARTY', 'EXTERNAL'] as const, `${nestedLabel}.actor`);
    const participantId = optionalString(event.participantId, `${nestedLabel}.participantId`, 128);
    if (actor !== 'EXTERNAL' && (!participantId || !allowedParticipantIds.has(participantId))) throw new AIContractError(`${nestedLabel} needs an authorized participantId`);
    return {id: stringValue(event.id, `${nestedLabel}.id`, 128), actor, ...(participantId ? {participantId} : {}), eventCode: stringValue(event.eventCode, `${nestedLabel}.eventCode`, 128), ...(optionalString(event.eventSummary, `${nestedLabel}.eventSummary`, 2048) ? {eventSummary: optionalString(event.eventSummary, `${nestedLabel}.eventSummary`, 2048)} : {}), ...(optionalString(event.basisKind, `${nestedLabel}.basisKind`, 128) ? {basisKind: optionalString(event.basisKind, `${nestedLabel}.basisKind`, 128)} : {}), ...(optionalString(event.expectationStrength, `${nestedLabel}.expectationStrength`, 128) ? {expectationStrength: optionalString(event.expectationStrength, `${nestedLabel}.expectationStrength`, 128)} : {}), sourceRefs: validateSourceProvenanced(event, nestedLabel, allowedMessageIds, allowedSourceZones, authorizedMessageBodies)};
  });
  const temporalFacts = list('temporalFacts', (value, nestedLabel) => {
    const fact = record(value, nestedLabel);
    exact(fact, ['id', 'temporalKind', 'obligationLegId', 'expectedEventId', 'originalExpression', 'valueKind', 'resolvedDate', 'resolvedAt', 'precisionCode', 'referenceTimezone', 'anchorKind', 'anchorReference', 'anchorOffsetSeconds', 'conflictCandidate', 'authorityStatus', 'sourceRefs'], nestedLabel);
    const valueKind = enumValue(fact.valueKind, ['DATE', 'INSTANT', 'UNRESOLVED'] as const, `${nestedLabel}.valueKind`);
    const resolvedDate = optionalString(fact.resolvedDate, `${nestedLabel}.resolvedDate`, 32);
    const resolvedAt = optionalString(fact.resolvedAt, `${nestedLabel}.resolvedAt`, 64);
    if (valueKind === 'DATE' && resolvedDate && !/^\d{4}-\d{2}-\d{2}$/.test(resolvedDate)) throw new AIContractError(`${nestedLabel}.resolvedDate must retain date precision`);
    if (valueKind === 'INSTANT' && resolvedAt && Number.isNaN(Date.parse(resolvedAt))) throw new AIContractError(`${nestedLabel}.resolvedAt must be an ISO instant`);
    if (valueKind === 'UNRESOLVED' && (resolvedDate || resolvedAt)) throw new AIContractError(`${nestedLabel} unresolved time cannot carry a resolved value`);
    const temporalKind = enumValue(fact.temporalKind, ['SOURCE_DUE', 'EXPECTED_EVENT_TIME', 'USER_TARGET'] as const, `${nestedLabel}.temporalKind`);
    const obligationLegId = optionalString(fact.obligationLegId, `${nestedLabel}.obligationLegId`, 128);
    const expectedEventId = optionalString(fact.expectedEventId, `${nestedLabel}.expectedEventId`, 128);
    return {
      id: stringValue(fact.id, `${nestedLabel}.id`, 128), temporalKind,
      ...(obligationLegId ? {obligationLegId} : {}), ...(expectedEventId ? {expectedEventId} : {}),
      ...(optionalString(fact.originalExpression, `${nestedLabel}.originalExpression`, 512) ? {originalExpression: optionalString(fact.originalExpression, `${nestedLabel}.originalExpression`, 512)} : {}),
      valueKind, ...(resolvedDate ? {resolvedDate} : {}), ...(resolvedAt ? {resolvedAt} : {}),
      precisionCode: stringValue(fact.precisionCode, `${nestedLabel}.precisionCode`, 64),
      ...(optionalString(fact.referenceTimezone, `${nestedLabel}.referenceTimezone`, 128) ? {referenceTimezone: optionalString(fact.referenceTimezone, `${nestedLabel}.referenceTimezone`, 128)} : {}),
      ...(optionalString(fact.anchorKind, `${nestedLabel}.anchorKind`, 128) ? {anchorKind: optionalString(fact.anchorKind, `${nestedLabel}.anchorKind`, 128)} : {}),
      ...(optionalString(fact.anchorReference, `${nestedLabel}.anchorReference`, 256) ? {anchorReference: optionalString(fact.anchorReference, `${nestedLabel}.anchorReference`, 256)} : {}),
      ...(fact.anchorOffsetSeconds === undefined || fact.anchorOffsetSeconds === null ? {} : {anchorOffsetSeconds: boundedInteger(fact.anchorOffsetSeconds, `${nestedLabel}.anchorOffsetSeconds`, -31_536_000, 31_536_000)}),
      conflictCandidate: booleanValue(fact.conflictCandidate, `${nestedLabel}.conflictCandidate`),
      ...(optionalString(fact.authorityStatus, `${nestedLabel}.authorityStatus`, 128) ? {authorityStatus: optionalString(fact.authorityStatus, `${nestedLabel}.authorityStatus`, 128)} : {}),
      sourceRefs: refsFor(fact, nestedLabel)
    };
  });
  const completionCriteria = list('completionCriteria', (value, nestedLabel) => { const item = record(value, nestedLabel); exact(item, ['id', 'code', 'summary', 'sourceRefs'], nestedLabel); return {id: stringValue(item.id, `${nestedLabel}.id`, 128), code: stringValue(item.code, `${nestedLabel}.code`, 128), ...(optionalString(item.summary, `${nestedLabel}.summary`, 2048) ? {summary: optionalString(item.summary, `${nestedLabel}.summary`, 2048)} : {}), sourceRefs: refsFor(item, nestedLabel)}; });
  const constraints = list('constraints', (value, nestedLabel) => { const item = record(value, nestedLabel); exact(item, ['id', 'code', 'summary', 'conditionRef', 'sourceRefs'], nestedLabel); const condition = item.conditionRef === undefined || item.conditionRef === null ? undefined : record(item.conditionRef, `${nestedLabel}.conditionRef`); if (condition) exact(condition, ['kind', 'id', 'code'], `${nestedLabel}.conditionRef`); return {id: stringValue(item.id, `${nestedLabel}.id`, 128), code: stringValue(item.code, `${nestedLabel}.code`, 128), ...(optionalString(item.summary, `${nestedLabel}.summary`, 2048) ? {summary: optionalString(item.summary, `${nestedLabel}.summary`, 2048)} : {}), ...(condition ? {conditionRef: {kind: enumValue(condition.kind, ['EXPECTED_EVENT', 'OTHER'] as const, `${nestedLabel}.conditionRef.kind`), ...(optionalString(condition.id, `${nestedLabel}.conditionRef.id`, 128) ? {id: optionalString(condition.id, `${nestedLabel}.conditionRef.id`, 128)} : {}), ...(optionalString(condition.code, `${nestedLabel}.conditionRef.code`, 128) ? {code: optionalString(condition.code, `${nestedLabel}.conditionRef.code`, 128)} : {})}} : {}), sourceRefs: refsFor(item, nestedLabel)}; });
  const proposals = list('pendingProposals', (value, nestedLabel) => { const item = record(value, nestedLabel); exact(item, ['id', 'kind', 'value', 'candidateStatus', 'sourceRefs'], nestedLabel); return {id: stringValue(item.id, `${nestedLabel}.id`, 128), kind: stringValue(item.kind, `${nestedLabel}.kind`, 128), value: encodedJsonValue(item.value, `${nestedLabel}.value`), ...(item.candidateStatus === undefined || item.candidateStatus === null ? {} : {candidateStatus: enumValue(item.candidateStatus, ['PENDING', 'REJECTED'] as const, `${nestedLabel}.candidateStatus`)}), sourceRefs: refsFor(item, nestedLabel)}; });
  const agreedFacts = list('agreedFacts', (value, nestedLabel) => { const item = record(value, nestedLabel); exact(item, ['id', 'kind', 'value', 'sourceRefs'], nestedLabel); return {id: stringValue(item.id, `${nestedLabel}.id`, 128), kind: stringValue(item.kind, `${nestedLabel}.kind`, 128), value: encodedJsonValue(item.value, `${nestedLabel}.value`), sourceRefs: refsFor(item, nestedLabel)}; });
  const uncertainties = list('uncertainties', (value, nestedLabel) => { const item = record(value, nestedLabel); exact(item, ['id', 'fieldKey', 'reasonCode', 'material', 'reviewRequired', 'candidateRefs', 'sourceRefs'], nestedLabel); const refs = item.candidateRefs === undefined || item.candidateRefs === null ? undefined : (() => { if (!Array.isArray(item.candidateRefs)) throw new AIContractError(`${nestedLabel}.candidateRefs must be an array`); return item.candidateRefs.map((ref, index) => stringValue(ref, `${nestedLabel}.candidateRefs[${index}]`, 128)); })(); return {id: stringValue(item.id, `${nestedLabel}.id`, 128), fieldKey: stringValue(item.fieldKey, `${nestedLabel}.fieldKey`, 128), reasonCode: stringValue(item.reasonCode, `${nestedLabel}.reasonCode`, 128), material: booleanValue(item.material, `${nestedLabel}.material`), reviewRequired: booleanValue(item.reviewRequired, `${nestedLabel}.reviewRequired`), ...(refs ? {candidateRefs: refs} : {}), sourceRefs: refsFor(item, nestedLabel)}; });
  const riskDetails = list('riskDetails', (value, nestedLabel) => { const item = record(value, nestedLabel); exact(item, ['id', 'targetKind', 'targetId', 'riskClass', 'reasonCode', 'sourceRefs'], nestedLabel); return {id: stringValue(item.id, `${nestedLabel}.id`, 128), targetKind: stringValue(item.targetKind, `${nestedLabel}.targetKind`, 128), ...(optionalString(item.targetId, `${nestedLabel}.targetId`, 128) ? {targetId: optionalString(item.targetId, `${nestedLabel}.targetId`, 128)} : {}), riskClass: enumValue(item.riskClass, ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const, `${nestedLabel}.riskClass`), reasonCode: stringValue(item.reasonCode, `${nestedLabel}.reasonCode`, 128), sourceRefs: refsFor(item, nestedLabel)}; });
  const corrections = list('corrections', (value, nestedLabel) => { const item = record(value, nestedLabel); exact(item, ['fieldKey', 'value', 'semanticTime', 'relation', 'sourceRefs'], nestedLabel); return {fieldKey: enumValue(item.fieldKey, ['operationalOutcome', 'obligationLegs', 'expectedEvents', 'temporalFacts', 'temporalFacts.SOURCE_DUE', 'temporalFacts.EXPECTED_EVENT_TIME', 'temporalFacts.USER_TARGET', 'completionCriteria', 'constraints', 'pendingProposals', 'agreedFacts', 'uncertainties', 'riskDetails'] as const, `${nestedLabel}.fieldKey`), value: encodedJsonValue(item.value, `${nestedLabel}.value`), ...(optionalString(item.semanticTime, `${nestedLabel}.semanticTime`, 128) ? {semanticTime: optionalString(item.semanticTime, `${nestedLabel}.semanticTime`, 128)} : {}), relation: enumValue(item.relation, ['CORRECTION', 'SUPERSEDES', 'CONFLICT'] as const, `${nestedLabel}.relation`), sourceRefs: refsFor(item, nestedLabel)}; });
  const assignment = item.assignmentSemantics === undefined || item.assignmentSemantics === null ? undefined : (() => { const value = record(item.assignmentSemantics, `${label}.assignmentSemantics`); exact(value, ['id', 'shape', 'candidateParticipantIds', 'selectedParticipantId'], `${label}.assignmentSemantics`); if (!Array.isArray(value.candidateParticipantIds)) throw new AIContractError(`${label}.assignmentSemantics.candidateParticipantIds must be an array`); const ids = value.candidateParticipantIds.map((id, index) => stringValue(id, `${label}.assignmentSemantics.candidateParticipantIds[${index}]`, 128)); if (ids.some((id) => !allowedParticipantIds.has(id))) throw new AIContractError(`${label}.assignmentSemantics contains an unauthorized participant`); const selected = optionalString(value.selectedParticipantId, `${label}.assignmentSemantics.selectedParticipantId`, 128); if (selected && !allowedParticipantIds.has(selected)) throw new AIContractError(`${label}.assignmentSemantics.selectedParticipantId is unauthorized`); return {id: stringValue(value.id, `${label}.assignmentSemantics.id`, 128), shape: enumValue(value.shape, ['ANY_OF', 'ALL_OF', 'UNSPECIFIED_GROUP'] as const, `${label}.assignmentSemantics.shape`), candidateParticipantIds: ids, ...(selected ? {selectedParticipantId: selected} : {})}; })();
  const terminal = item.terminalSignal === undefined || item.terminalSignal === null ? undefined : (() => { const value = record(item.terminalSignal, `${label}.terminalSignal`); exact(value, ['kind', 'sourceRefs'], `${label}.terminalSignal`); return {kind: enumValue(value.kind, ['NONE', 'COMPLETED', 'DECLINED', 'CANCELLED', 'INVALIDATED'] as const, `${label}.terminalSignal.kind`), sourceRefs: sourceRefs(value.sourceRefs, `${label}.terminalSignal.sourceRefs`, allowedMessageIds, allowedSourceZones, authorizedMessageBodies)}; })();
  return {candidateUnitKey, materiality, ...(operationalOutcome ? {operationalOutcome} : {}), ...(identityRelation ? {identityRelation} : {}), obligationLegs, expectedEvents, temporalFacts, completionCriteria, constraints, pendingProposals: proposals, agreedFacts, uncertainties, riskDetails, ...(assignment ? {assignmentSemantics: assignment} : {}), corrections, ...(terminal ? {terminalSignal: terminal} : {}), sourceRefs: refs};
}

export function validateInterpretationOutput(value: unknown, input: {basisEvidenceRevision: number; allowedMessageIds: ReadonlySet<string>; allowedParticipantIds: ReadonlySet<string>; allowedSourceZones: ReadonlyMap<string, readonly AuthorizedSourceZone[]>; authorizedMessageBodies: ReadonlyMap<string, string>}): ModelInterpretationOutput {
  assertNoForbiddenKeys(value);
  const item = record(value, 'interpretation output');
  exact(item, ['schemaVersion', 'basisEvidenceRevision', 'status', 'sourceMessageId', 'abstentionReason', 'semanticUnits', 'sourceRefs'], 'interpretation output');
  if (item.schemaVersion !== AI_INTERPRETATION_SCHEMA_VERSION) throw new AIContractError('unsupported interpretation schema version');
  if (item.basisEvidenceRevision !== input.basisEvidenceRevision) throw new AIContractError('interpretation basis evidence revision is stale');
  const status = enumValue(item.status, ['CANDIDATE', 'ABSTAINED'] as const, 'interpretation output.status');
  const sourceMessageId = stringValue(item.sourceMessageId, 'interpretation output.sourceMessageId', 256);
  if (!input.allowedMessageIds.has(sourceMessageId)) throw new AIContractError('interpretation sourceMessageId is unauthorized');
  const abstentionReason = item.abstentionReason === undefined || item.abstentionReason === null ? undefined : enumValue(item.abstentionReason, ['AMBIGUOUS', 'MISSING_CONTEXT', 'UNSAFE_HIGH_RISK', 'UNINTERPRETABLE'] as const, 'interpretation output.abstentionReason');
  if (status === 'ABSTAINED' && !abstentionReason) throw new AIContractError('abstained interpretation needs a reason');
  if (status === 'CANDIDATE' && abstentionReason) throw new AIContractError('candidate interpretation cannot carry an abstention reason');
  if (!Array.isArray(item.semanticUnits) || item.semanticUnits.length > 32) throw new AIContractError('interpretation semanticUnits must be a bounded array');
  const semanticUnits = item.semanticUnits.map((unit, index) => validateSemanticUnit(unit, `interpretation output.semanticUnits[${index}]`, input.allowedMessageIds, input.allowedParticipantIds, input.allowedSourceZones, input.authorizedMessageBodies));
  if (new Set(semanticUnits.map((unit) => unit.candidateUnitKey)).size !== semanticUnits.length) throw new AIContractError('interpretation semantic unit keys must be unique');
  if (status === 'ABSTAINED' && semanticUnits.length > 0) throw new AIContractError('abstained interpretation cannot include semantic units');
  return {schemaVersion: AI_INTERPRETATION_SCHEMA_VERSION, basisEvidenceRevision: input.basisEvidenceRevision, status, sourceMessageId, ...(abstentionReason ? {abstentionReason} : {}), semanticUnits, sourceRefs: sourceRefs(item.sourceRefs, 'interpretation output.sourceRefs', input.allowedMessageIds, input.allowedSourceZones, input.authorizedMessageBodies)};
}

export function validateDraftOutput(value: unknown, expectedRevision: number): ModelDraftOutput {
  assertNoForbiddenKeys(value);
  const item = record(value, 'draft output');
  exact(item, ['schemaVersion', 'basisEvidenceRevision', 'status', 'body', 'abstentionReason'], 'draft output');
  if (item.schemaVersion !== AI_DRAFT_SCHEMA_VERSION) throw new AIContractError('unsupported draft schema version');
  if (item.basisEvidenceRevision !== expectedRevision) throw new AIContractError('draft basis evidence revision is stale');
  const status = enumValue(item.status, ['DRAFT', 'ABSTAINED'] as const, 'draft output.status');
  const body = typeof item.body === 'string' ? item.body : '';
  if (body.length > 12_000) throw new AIContractError('draft body is too long');
  const abstentionReason = item.abstentionReason === undefined || item.abstentionReason === null ? undefined : enumValue(item.abstentionReason, ['MISSING_CONTEXT', 'UNSAFE_HIGH_RISK', 'UNINTERPRETABLE'] as const, 'draft output.abstentionReason');
  if (status === 'DRAFT' && !body.trim()) throw new AIContractError('draft output must contain editable text');
  if (status === 'ABSTAINED' && body.trim()) throw new AIContractError('abstained draft cannot contain a body');
  if (status === 'ABSTAINED' && !abstentionReason) throw new AIContractError('abstained draft needs a reason');
  if (status === 'DRAFT' && abstentionReason) throw new AIContractError('draft cannot carry an abstention reason');
  return {schemaVersion: AI_DRAFT_SCHEMA_VERSION, basisEvidenceRevision: expectedRevision, status, body, ...(abstentionReason ? {abstentionReason} : {})};
}

function mapCandidateUnit(unit: ModelSemanticUnit): CandidateResponsibilitySemantics {
  const provenanced = <T extends {sourceRefs: ModelSourceRef[]}>(items: readonly T[] | undefined) => (items ?? []).map((item) => mapProvenanced(item));
  const mapTerminal = (signal: ModelSemanticUnit['terminalSignal']): CandidateTerminalSignal | undefined => signal ? {kind: signal.kind, provenance: mapSourceRefs(signal.sourceRefs)} : undefined;
  const obligationLegs = unit.obligationLegs.map((leg) => {
    const {provenance, ...rest} = mapProvenanced(leg) as CandidateObligationLeg & {provenance: ProvenanceInput[]};
    return {...rest, provenance};
  });
  const expectedEvents = unit.expectedEvents.map((event) => {
    const {provenance, ...rest} = mapProvenanced(event) as CandidateExpectedEvent & {provenance: ProvenanceInput[]};
    return {...rest, provenance};
  });
  return {
    candidateUnitKey: unit.candidateUnitKey,
    materiality: unit.materiality,
    ...(unit.operationalOutcome ? {operationalOutcome: unit.operationalOutcome} : {}),
    ...(unit.identityRelation ? {identityRelation: unit.identityRelation} : {}),
    obligationLegs,
    expectedEvents,
    temporalFacts: provenanced(unit.temporalFacts) as CandidateTemporalFact[],
    completionCriteria: provenanced(unit.completionCriteria) as CandidateCompletionCriterion[],
    constraints: provenanced(unit.constraints) as CandidateConstraint[],
    pendingProposals: unit.pendingProposals.map((item) => ({...mapProvenanced(item), value: decodedJsonValue(item.value, `pending proposal ${item.id}.value`)})) as CandidatePendingProposal[],
    agreedFacts: unit.agreedFacts.map((item) => ({...mapProvenanced(item), value: decodedJsonValue(item.value, `agreed fact ${item.id}.value`)})) as CandidateAgreedFact[],
    uncertainties: provenanced(unit.uncertainties) as Uncertainty[],
    riskDetails: provenanced(unit.riskDetails) as RiskDetail[],
    ...(unit.assignmentSemantics ? {assignmentSemantics: unit.assignmentSemantics} : {}),
    corrections: unit.corrections.map((item) => ({...mapProvenanced(item), value: decodedJsonValue(item.value, `field correction ${item.fieldKey}.value`)})) as CandidateFieldCorrection[],
    ...(unit.terminalSignal ? {terminalSignal: mapTerminal(unit.terminalSignal)} : {}),
    provenance: mapSourceRefs(unit.sourceRefs)
  };
}

export function toResponsibilityInterpretationCandidate(input: {
  output: ModelInterpretationOutput;
  userId: string;
  connectedAccountId: string;
  conversationId: string;
  sourceEventKey: string;
  candidateKey: string;
  interpretationRunId?: string;
}): ResponsibilityInterpretationCandidate | undefined {
  if (input.output.status === 'ABSTAINED') return undefined;
  return {
    userId: input.userId,
    connectedAccountId: input.connectedAccountId,
    conversationId: input.conversationId,
    sourceEventKey: input.sourceEventKey,
    candidateKey: input.candidateKey,
    evidenceRevision: input.output.basisEvidenceRevision,
    semantics: input.output.semanticUnits.map(mapCandidateUnit),
    provenance: mapSourceRefs(input.output.sourceRefs),
    sourceMessageId: input.output.sourceMessageId,
    ...(input.interpretationRunId ? {interpretationRunId: input.interpretationRunId} : {})
  };
}
