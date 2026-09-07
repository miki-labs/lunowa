import type {ProjectionBucket} from '@/server/responsibility/types';

export type AttentionSurface = 'NEEDS_YOU' | 'MANAGED' | 'LATER' | 'REVIEW' | 'DONE' | 'NONE';
export type AttentionIntegrity = 'healthy' | 'unknown' | 'degraded';

export type AttentionItemReadModel = {
  id: string;
  subjectKind: 'RESPONSIBILITY' | 'ADMISSION_REVIEW';
  responsibilityId: string | null;
  admissionReviewId: string | null;
  conversationId: string;
  surface: AttentionSurface;
  projection: {
    bucket: ProjectionBucket;
    subjectKind: 'RESPONSIBILITY' | 'ADMISSION_REVIEW' | 'NONE';
    primaryReason: string;
  };
  operationalOutcome: string;
  reviewQuestion: string | null;
  primaryAction: string | null;
  awaitedEvent: string | null;
  returnCondition: string | null;
  nearestRelevantTime: string | null;
  overdue: boolean;
};

export type AttentionReadModel = {
  source: {
    readiness: 'loading' | 'partial' | 'ready' | 'degraded' | 'unavailable';
    dataThroughAt: string | null;
  };
  integrity: {
    status: AttentionIntegrity;
    message: string | null;
  };
  needsYou: AttentionItemReadModel[];
  managed: AttentionItemReadModel[];
  later: AttentionItemReadModel[];
  review: AttentionItemReadModel[];
  done: AttentionItemReadModel[];
  strictZero: boolean;
  managedCount: number;
  delegatedCount: number;
  derivedAt: string;
};

export function isAttentionReadModel(value: unknown): value is AttentionReadModel {
  const record = (candidate: unknown): candidate is Record<string, unknown> => Boolean(candidate && typeof candidate === 'object');
  const nullableString = (candidate: unknown): candidate is string | null => candidate === null || typeof candidate === 'string';
  const nonNegativeInteger = (candidate: unknown): candidate is number => typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 0;
  const validSurface = (candidate: unknown): candidate is AttentionSurface =>
    candidate === 'NEEDS_YOU' || candidate === 'MANAGED' || candidate === 'LATER' || candidate === 'REVIEW' || candidate === 'DONE' || candidate === 'NONE';
  const validBucket = (candidate: unknown): candidate is ProjectionBucket =>
    candidate === 'MY_TURN' || candidate === 'WAITING' || candidate === 'LATER' || candidate === 'REVIEW' || candidate === 'DONE' || candidate === 'NONE';
  const validItem = (candidate: unknown): candidate is AttentionItemReadModel => {
    if (!record(candidate) || !record(candidate.projection)) return false;
    const projection = candidate.projection;
    const idsMatch = candidate.subjectKind === 'RESPONSIBILITY'
      ? candidate.id === candidate.responsibilityId && candidate.admissionReviewId === null
      : candidate.id === candidate.admissionReviewId && candidate.responsibilityId === null;
    return typeof candidate.id === 'string' && candidate.id.length > 0 &&
      (candidate.subjectKind === 'RESPONSIBILITY' || candidate.subjectKind === 'ADMISSION_REVIEW') &&
      nullableString(candidate.responsibilityId) && nullableString(candidate.admissionReviewId) &&
      idsMatch &&
      typeof candidate.conversationId === 'string' && candidate.conversationId.length > 0 &&
      validSurface(candidate.surface) &&
      validBucket(projection.bucket) &&
      (projection.subjectKind === candidate.subjectKind) &&
      typeof projection.primaryReason === 'string' &&
      typeof candidate.operationalOutcome === 'string' &&
      nullableString(candidate.reviewQuestion) &&
      nullableString(candidate.primaryAction) &&
      nullableString(candidate.awaitedEvent) &&
      nullableString(candidate.returnCondition) &&
      nullableString(candidate.nearestRelevantTime) &&
      typeof candidate.overdue === 'boolean';
  };

  if (!record(value) || !record(value.source) || !record(value.integrity)) return false;
  const source = value.source;
  const integrity = value.integrity;
  const items = [value.needsYou, value.managed, value.later, value.review, value.done];
  return (source.readiness === 'loading' || source.readiness === 'partial' || source.readiness === 'ready' || source.readiness === 'degraded' || source.readiness === 'unavailable') &&
    nullableString(source.dataThroughAt) &&
    (integrity.status === 'healthy' || integrity.status === 'unknown' || integrity.status === 'degraded') &&
    nullableString(integrity.message) &&
    items.every((candidate) => Array.isArray(candidate) && candidate.every(validItem)) &&
    typeof value.strictZero === 'boolean' &&
    nonNegativeInteger(value.managedCount) &&
    nonNegativeInteger(value.delegatedCount) &&
    typeof value.derivedAt === 'string' && value.derivedAt.length > 0;
}
