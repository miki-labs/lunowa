export type ReplyMode = 'REPLY' | 'REPLY_ALL';

export type ReplyParticipant = {
  email: string;
  displayName?: string | null;
};

export type ReplyContext = {
  sender: ReplyParticipant;
  originalSender: ReplyParticipant;
  originalRecipients: readonly ReplyParticipant[];
  originalCc: readonly ReplyParticipant[];
  originalBcc?: readonly ReplyParticipant[];
};

export type ReplyRecipients = {
  to: ReplyParticipant[];
  cc: ReplyParticipant[];
  bcc: ReplyParticipant[];
};

function normalize(participant: ReplyParticipant): ReplyParticipant {
  const email = participant.email.trim().toLowerCase();
  if (!email || email.length > 320 || !email.includes('@')) throw new Error('recipient email is invalid');
  return {email, displayName: participant.displayName?.trim() || null};
}

function unique(participants: readonly ReplyParticipant[], excluded: Set<string>): ReplyParticipant[] {
  const seen = new Set(excluded);
  const result: ReplyParticipant[] = [];
  for (const candidate of participants) {
    const participant = normalize(candidate);
    if (seen.has(participant.email)) continue;
    seen.add(participant.email);
    result.push(participant);
  }
  return result;
}

/**
 * Builds an inspectable recipient set from provider-observed participants.
 * Client or model supplied addresses are intentionally not accepted here.
 */
export function buildReplyRecipients(mode: ReplyMode, context: ReplyContext): ReplyRecipients {
  if (mode !== 'REPLY' && mode !== 'REPLY_ALL') throw new Error('unsupported reply mode');
  const sender = normalize(context.sender);
  const originalSender = normalize(context.originalSender);
  const excluded = new Set([sender.email]);
  const replyTargets = originalSender.email === sender.email ? context.originalRecipients : [originalSender];
  const to = unique(
    mode === 'REPLY' ? replyTargets : [originalSender, ...context.originalRecipients],
    excluded
  );
  const cc = mode === 'REPLY_ALL'
    ? unique(context.originalCc, new Set([...excluded, ...to.map(({email}) => email)]))
    : [];
  // Bcc is never copied into a contextual reply. It is not inspectable provider
  // conversation context and copying it would disclose a hidden recipient.
  return {to, cc, bcc: []};
}

export function normalizeReplyBody(body: string): string {
  if (typeof body !== 'string') throw new Error('draft body is required');
  const normalized = body.normalize('NFC');
  if (!normalized.trim()) throw new Error('draft body is required');
  if (normalized.length > 100_000) throw new Error('draft body is too long');
  return normalized;
}

export function normalizeDraftBody(body: string): string {
  if (typeof body !== 'string') throw new Error('draft body is required');
  const normalized = body.normalize('NFC');
  if (normalized.length > 100_000) throw new Error('draft body is too long');
  return normalized;
}
