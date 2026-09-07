import type {ProjectionBucket} from '@/server/responsibility/types';

export type AttentionSurface = 'NEEDS_YOU' | 'MANAGED' | 'LATER' | 'REVIEW' | 'DONE' | 'NONE';
export type AttentionIntegrity = 'healthy' | 'unknown' | 'degraded';

export type AttentionItemReadModel = {
  responsibilityId: string;
  conversationId: string;
  surface: AttentionSurface;
  projection: {
    bucket: ProjectionBucket;
    subjectKind: 'RESPONSIBILITY' | 'ADMISSION_REVIEW' | 'NONE';
    primaryReason: string;
  };
  operationalOutcome: string;
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
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AttentionReadModel>;
  return Boolean(
    candidate.source && typeof candidate.source === 'object' &&
      typeof candidate.source.readiness === 'string' &&
      candidate.integrity && typeof candidate.integrity === 'object' &&
      typeof candidate.integrity.status === 'string' &&
      Array.isArray(candidate.needsYou) &&
      Array.isArray(candidate.managed) &&
      Array.isArray(candidate.later) &&
      Array.isArray(candidate.review) &&
      Array.isArray(candidate.done) &&
      typeof candidate.strictZero === 'boolean' &&
      typeof candidate.managedCount === 'number' &&
      typeof candidate.delegatedCount === 'number' &&
      typeof candidate.derivedAt === 'string'
  );
}
