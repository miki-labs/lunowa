import type {ProvenanceInput, ResponsibilityInterpretationCandidate} from '../responsibility';
import type {TrustedProviderObservation} from './context';

export type NormalizedAttachmentObservationInput = {
  messageId: string;
  evidenceRevision: number;
  rawProviderMetadata: unknown;
  attachmentCount: number;
};

export function attachmentObservationKey(messageId: string, evidenceRevision: number): string {
  return `gmail:attachment-presence:${messageId}:${evidenceRevision}`;
}

export function normalizedAttachmentObservation(input: NormalizedAttachmentObservationInput): TrustedProviderObservation {
  const metadata = input.rawProviderMetadata && typeof input.rawProviderMetadata === 'object' && !Array.isArray(input.rawProviderMetadata)
    ? input.rawProviderMetadata as {normalization?: {status?: unknown; unsupported?: unknown[]}}
    : undefined;
  const normalization = metadata?.normalization;
  const complete = normalization?.status === 'COMPLETE' &&
    !(normalization.unsupported ?? []).some((issue) => issue === 'MIME_STRUCTURE_TRUNCATED' || issue === 'BODY_ENCODING_UNSUPPORTED');
  return {
    observationKey: attachmentObservationKey(input.messageId, input.evidenceRevision),
    messageId: input.messageId,
    kind: 'ATTACHMENT_PRESENCE',
    status: input.attachmentCount > 0 ? 'PRESENT' : complete ? 'ABSENT' : 'UNKNOWN',
    completeness: complete ? 'COMPLETE' : 'INCOMPLETE',
    attachmentCount: input.attachmentCount,
    source: 'GMAIL_NORMALIZED'
  };
}

export function trustedProviderEvidenceForCandidate(
  candidate: ResponsibilityInterpretationCandidate,
  observations: readonly TrustedProviderObservation[]
): ProvenanceInput[] {
  const result = new Map<string, ProvenanceInput>();
  for (const unit of candidate.semantics) {
    for (const claim of unit.communicatedClaims ?? []) {
      if (claim.kind !== 'ATTACHMENT_DELIVERED') continue;
      for (const provenance of claim.provenance) {
        const messageId = provenance.messageId;
        if (!messageId) continue;
        const observation = observations.find((item) =>
          item.messageId === messageId &&
          item.kind === 'ATTACHMENT_PRESENCE' &&
          item.status === 'ABSENT' &&
          item.completeness === 'COMPLETE'
        );
        if (!observation) continue;
        const item: ProvenanceInput = {
          evidenceKind: 'PROVIDER_NON_DELIVERY',
          messageId,
          providerObservationKey: observation.observationKey,
          sourceLocator: {zone: 'STRUCTURED_METADATA', authorized: true, authorityReference: observation.observationKey}
        };
        result.set(observation.observationKey, item);
      }
    }
  }
  return [...result.values()];
}
