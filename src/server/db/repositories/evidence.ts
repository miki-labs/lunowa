import {and, asc, eq, sql} from 'drizzle-orm';

import {getDatabase} from '../index';
import {
  attachments,
  connectedAccounts,
  conversations,
  messageParticipants,
  messages,
  participantIdentities,
  providerSyncStates
} from '../schema/evidence';
import {
  canonicalizeParticipant,
  type NormalizedAttachment,
  type NormalizedConnectedAccount,
  type NormalizedProviderMessage,
  type ProviderSyncStateInput
} from '../../evidence/normalized';

type Database = ReturnType<typeof getDatabase>;

function sameDate(left: Date | null | undefined, right: Date | null | undefined): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return left.getTime() === right.getTime();
}

function maxDate(left: Date | null | undefined, right: Date | undefined): Date | null {
  if (!left) return right ?? null;
  if (!right) return left;
  return left.getTime() >= right.getTime() ? left : right;
}

function minDate(left: Date | null | undefined, right: Date): Date {
  if (!left || right.getTime() < left.getTime()) return right;
  return left;
}

function assertSafeMetadata(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeMetadata(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (/(token|secret|password|authorization|cookie)/i.test(key)) {
      throw new Error(`${path}.${key} contains credential material`);
    }
    assertSafeMetadata(nested, `${path}.${key}`);
  }
}

function participantSet(
  participants: readonly {participantId: string; role: string}[]
): string {
  return participants
    .map(({participantId, role}) => `${role}:${participantId}`)
    .sort()
    .join('|');
}

function attachmentSet(attachmentRows: readonly (NormalizedAttachment & {id?: string})[]): string {
  return attachmentRows
    .map((attachment) =>
      JSON.stringify({
        providerAttachmentId: attachment.providerAttachmentId ?? null,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes ?? null,
        contentDisposition: attachment.contentDisposition ?? null,
        contentReference: attachment.contentReference,
        contentHash: attachment.contentHash ?? null,
        previewState: attachment.previewState ?? null
      })
    )
    .sort()
    .join('|');
}

function normalizeAttachments(attachmentsInput: readonly NormalizedAttachment[]): NormalizedAttachment[] {
  const result = attachmentsInput.map((attachment) => ({
    ...attachment,
    filename: attachment.filename.trim(),
    mimeType: attachment.mimeType.trim(),
    contentDisposition: attachment.contentDisposition?.trim() || undefined,
    contentReference: attachment.contentReference.trim(),
    contentHash: attachment.contentHash?.trim() || undefined,
    previewState: attachment.previewState?.trim() || undefined
  }));

  if (result.some(({filename, mimeType, contentReference}) => !filename || !mimeType || !contentReference)) {
    throw new Error('attachment metadata requires filename, MIME type, and content reference');
  }
  if (result.some(({sizeBytes}) => sizeBytes !== undefined && (!Number.isInteger(sizeBytes) || sizeBytes < 0))) {
    throw new Error('attachment size must be a non-negative integer');
  }

  const providerIds = result
    .map(({providerAttachmentId}) => providerAttachmentId)
    .filter((value): value is string => Boolean(value));
  if (new Set(providerIds).size !== providerIds.length) {
    throw new Error('attachment provider IDs must be unique within a message');
  }
  result.forEach((attachment, index) => assertSafeMetadata(attachment, `attachments[${index}]`));
  return result;
}

export class EvidenceRepository {
  public constructor(private readonly db: Database = getDatabase()) {}

  public async upsertConnectedAccount(input: NormalizedConnectedAccount): Promise<string> {
    const provider = input.provider.trim().toLowerCase();
    const providerAccountId = input.providerAccountId.trim();
    const emailAddress = input.emailAddress.trim();
    const credentialReference = input.credentialReference.trim();
    if (!provider || !providerAccountId || !emailAddress || !credentialReference) {
      throw new Error('connected account identity and credential reference are required');
    }

    const now = new Date();
    const [row] = await this.db
      .insert(connectedAccounts)
      .values({
        userId: input.userId,
        provider,
        providerAccountId,
        emailAddress,
        displayName: input.displayName?.trim() || null,
        connectionState: input.connectionState ?? 'CONNECTED',
        grantedCapabilities: [...(input.grantedCapabilities ?? [])],
        credentialReference,
        createdAt: now,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: [
          connectedAccounts.userId,
          connectedAccounts.provider,
          connectedAccounts.providerAccountId
        ],
        set: {
          emailAddress,
          displayName: input.displayName?.trim() || null,
          connectionState: input.connectionState ?? 'CONNECTED',
          grantedCapabilities: [...(input.grantedCapabilities ?? [])],
          credentialReference,
          updatedAt: now
        }
      })
      .returning({id: connectedAccounts.id});

    if (!row) throw new Error('connected account upsert did not return an ID');
    return row.id;
  }

  public async upsertProviderSyncState(input: ProviderSyncStateInput): Promise<void> {
    const account = await this.db
      .select({id: connectedAccounts.id})
      .from(connectedAccounts)
      .where(and(eq(connectedAccounts.id, input.connectedAccountId), eq(connectedAccounts.userId, input.userId)))
      .limit(1);
    if (!account[0]) throw new Error('connected account is not owned by the current user');

    const now = new Date();
    await this.db
      .insert(providerSyncStates)
      .values({
        connectedAccountId: input.connectedAccountId,
        cursorOrDeltaToken: input.cursorOrDeltaToken,
        syncGeneration: input.syncGeneration ?? 0,
        status: input.status ?? 'PENDING',
        lastAttemptAt: input.lastAttemptAt,
        lastSuccessAt: input.lastSuccessAt,
        lastFullReconcileAt: input.lastFullReconcileAt,
        lastErrorCode: input.lastErrorCode,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: providerSyncStates.connectedAccountId,
        set: {
          cursorOrDeltaToken: input.cursorOrDeltaToken,
          syncGeneration: input.syncGeneration ?? 0,
          status: input.status ?? 'PENDING',
          lastAttemptAt: input.lastAttemptAt,
          lastSuccessAt: input.lastSuccessAt,
          lastFullReconcileAt: input.lastFullReconcileAt,
          lastErrorCode: input.lastErrorCode,
          updatedAt: now
        }
      });
  }

  public async listProviderMessageIds(input: {
    userId: string;
    connectedAccountId: string;
  }): Promise<readonly string[]> {
    const rows = await this.db
      .select({providerMessageId: messages.providerMessageId})
      .from(messages)
      .where(
        and(
          eq(messages.userId, input.userId),
          eq(messages.connectedAccountId, input.connectedAccountId)
        )
      );
    return rows.map(({providerMessageId}) => providerMessageId);
  }

  /**
   * Records current provider absence without erasing immutable communication
   * evidence. Physical deletion belongs to a separate privacy/account-deletion
   * authority, never to a Gmail history event.
   */
  public async markNormalizedMessageAbsent(input: {
    userId: string;
    connectedAccountId: string;
    providerMessageId: string;
  }): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          providerDeletedAt: messages.providerDeletedAt
        })
        .from(messages)
        .where(
          and(
            eq(messages.userId, input.userId),
            eq(messages.connectedAccountId, input.connectedAccountId),
            eq(messages.providerMessageId, input.providerMessageId)
          )
        )
        .for('update');
      if (!existing) return false;
      if (existing.providerDeletedAt) return false;

      await tx
        .update(messages)
        .set({providerDeletedAt: new Date(), updatedAt: new Date()})
        .where(eq(messages.id, existing.id));
      await tx
        .update(conversations)
        .set({
          semanticEvidenceRevision: sql`${conversations.semanticEvidenceRevision} + 1`,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(conversations.id, existing.conversationId),
            eq(conversations.userId, input.userId),
            eq(conversations.connectedAccountId, input.connectedAccountId)
          )
        );
      return true;
    });
  }

  /**
   * Advances evidence under the conversation row lock. The migration trigger
   * independently rejects direct SQL attempts to decrease the revision.
   */
  public async advanceConversationEvidenceRevision(input: {
    userId: string;
    connectedAccountId: string;
    conversationId: string;
  }): Promise<number> {
    const [row] = await this.db
      .update(conversations)
      .set({
        semanticEvidenceRevision: sql`${conversations.semanticEvidenceRevision} + 1`,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(conversations.id, input.conversationId),
          eq(conversations.userId, input.userId),
          eq(conversations.connectedAccountId, input.connectedAccountId)
        )
      )
      .returning({revision: conversations.semanticEvidenceRevision});
    if (!row) throw new Error('conversation is not owned by the current user');
    return row.revision;
  }

  /**
   * Atomically reconciles one provider-neutral message, its participant edges,
   * and attachment metadata. Re-ingesting the same unchanged provider message
   * returns the existing row without advancing semantic evidence revision.
   */
  public async upsertNormalizedMessage(input: NormalizedProviderMessage): Promise<{
    messageId: string;
    conversationId: string;
    evidenceRevision: number;
    changed: boolean;
  }> {
    const sender = canonicalizeParticipant(input.sender);
    const recipients = input.recipients.map(canonicalizeParticipant);
    const cc = (input.cc ?? []).map(canonicalizeParticipant);
    const bcc = (input.bcc ?? []).map(canonicalizeParticipant);
    const normalizedAttachments = normalizeAttachments(input.attachments ?? []);
    [sender, ...recipients, ...cc, ...bcc].forEach((participant, index) =>
      assertSafeMetadata(participant.derivedMetadata, `participants[${index}].derivedMetadata`)
    );
    assertSafeMetadata(input.mailboxStateSnapshot, 'mailboxStateSnapshot');
    assertSafeMetadata(input.rawProviderMetadata, 'rawProviderMetadata');
    const providerMessageId = input.providerMessageId.trim();
    const subject = input.subject.trim();
    if (!providerMessageId || !subject) throw new Error('provider message ID and subject are required');

    return this.db.transaction(async (tx) => {
      const account = await tx
        .select({id: connectedAccounts.id})
        .from(connectedAccounts)
        .where(and(eq(connectedAccounts.id, input.connectedAccountId), eq(connectedAccounts.userId, input.userId)))
        .limit(1);
      if (!account[0]) throw new Error('connected account is not owned by the current user');

      await tx
        .insert(conversations)
        .values({
          id: input.conversation.id,
          userId: input.userId,
          connectedAccountId: input.connectedAccountId,
          providerThreadId: input.conversation.providerThreadId ?? null,
          normalizedSubject: input.conversation.normalizedSubject?.trim() || null,
          semanticTopic: input.conversation.semanticTopic?.trim() || null,
          firstMessageAt: input.occurredAt,
          lastMessageAt: input.occurredAt,
          lastInboundAt: input.direction === 'INBOUND' ? input.occurredAt : null,
          lastOutboundAt: input.direction === 'OUTBOUND' ? input.occurredAt : null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoNothing({target: conversations.id});

      const [conversation] = await tx
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversation.id))
        .for('update');
      if (
        !conversation ||
        conversation.userId !== input.userId ||
        conversation.connectedAccountId !== input.connectedAccountId
      ) {
        throw new Error('conversation is not owned by the current user and connected account');
      }

      const nextFirstMessageAt = minDate(conversation.firstMessageAt, input.occurredAt);
      const nextLastMessageAt = maxDate(conversation.lastMessageAt, input.occurredAt);
      const nextLastInboundAt =
        input.direction === 'INBOUND'
          ? maxDate(conversation.lastInboundAt, input.occurredAt)
          : conversation.lastInboundAt;
      const nextLastOutboundAt =
        input.direction === 'OUTBOUND'
          ? maxDate(conversation.lastOutboundAt, input.occurredAt)
          : conversation.lastOutboundAt;
      const nextProviderThreadId =
        input.conversation.providerThreadId ?? conversation.providerThreadId;
      const nextNormalizedSubject =
        input.conversation.normalizedSubject?.trim() || conversation.normalizedSubject;
      const nextSemanticTopic = input.conversation.semanticTopic?.trim() || conversation.semanticTopic;
      const conversationChanged =
        nextProviderThreadId !== conversation.providerThreadId ||
        nextNormalizedSubject !== conversation.normalizedSubject ||
        nextSemanticTopic !== conversation.semanticTopic ||
        !sameDate(nextFirstMessageAt, conversation.firstMessageAt) ||
        !sameDate(nextLastMessageAt, conversation.lastMessageAt) ||
        !sameDate(nextLastInboundAt, conversation.lastInboundAt) ||
        !sameDate(nextLastOutboundAt, conversation.lastOutboundAt);
      if (conversationChanged) {
        await tx
          .update(conversations)
          .set({
            providerThreadId: nextProviderThreadId,
            normalizedSubject: nextNormalizedSubject,
            semanticTopic: nextSemanticTopic,
            firstMessageAt: nextFirstMessageAt,
            lastMessageAt: nextLastMessageAt,
            lastInboundAt: nextLastInboundAt,
            lastOutboundAt: nextLastOutboundAt,
            updatedAt: new Date()
          })
          .where(eq(conversations.id, input.conversation.id));
      }

      const identityIds = new Map<string, string>();
      let participantChanged = false;
      const allParticipants = [sender, ...recipients, ...cc, ...bcc];
      for (const participant of allParticipants) {
        const canonicalEmail = participant.canonicalEmail;
        if (identityIds.has(canonicalEmail)) continue;
        const [existing] = await tx
          .select()
          .from(participantIdentities)
          .where(
            and(
              eq(participantIdentities.userId, input.userId),
              eq(participantIdentities.canonicalEmail, canonicalEmail)
            )
          )
          .for('update');
        const nextDisplayName = participant.displayName ?? existing?.displayName ?? null;
        const nextOrganizationName = participant.organizationName ?? existing?.organizationName ?? null;
        const nextDerivedMetadata = participant.derivedMetadata ?? existing?.derivedMetadata ?? {};
        const nextLastSeenAt = maxDate(existing?.lastSeenAt, input.occurredAt);
        if (!existing) {
          const [created] = await tx
            .insert(participantIdentities)
            .values({
              userId: input.userId,
              canonicalEmail,
              displayName: nextDisplayName,
              organizationName: nextOrganizationName,
              lastSeenAt: nextLastSeenAt,
              derivedMetadata: nextDerivedMetadata,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning({id: participantIdentities.id});
          if (!created) throw new Error('participant identity upsert did not return an ID');
          identityIds.set(canonicalEmail, created.id);
          participantChanged = true;
          continue;
        }
        identityIds.set(canonicalEmail, existing.id);
        const identityChanged =
          nextDisplayName !== existing.displayName ||
          nextOrganizationName !== existing.organizationName ||
          JSON.stringify(nextDerivedMetadata) !== JSON.stringify(existing.derivedMetadata) ||
          !sameDate(nextLastSeenAt, existing.lastSeenAt);
        participantChanged = participantChanged || identityChanged;
        if (identityChanged) {
          await tx
            .update(participantIdentities)
            .set({
              displayName: nextDisplayName,
              organizationName: nextOrganizationName,
              lastSeenAt: nextLastSeenAt,
              derivedMetadata: nextDerivedMetadata,
              updatedAt: new Date()
            })
            .where(eq(participantIdentities.id, existing.id));
        }
      }

      const senderParticipantId = identityIds.get(sender.canonicalEmail);
      if (!senderParticipantId) throw new Error('sender participant identity was not persisted');
      const existingMessage = await tx
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.connectedAccountId, input.connectedAccountId),
            eq(messages.providerMessageId, providerMessageId)
          )
        )
        .for('update');
      const messageValues = {
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        conversationId: input.conversation.id,
        providerMessageId,
        providerThreadId: input.providerThreadId ?? input.conversation.providerThreadId ?? null,
        direction: input.direction,
        senderParticipantId,
        subject,
        textBody: input.textBody ?? null,
        sanitizedHtmlBody: input.sanitizedHtmlBody ?? null,
        occurredAt: input.occurredAt,
        providerReceivedAt: input.providerReceivedAt ?? null,
        readState: input.readState ?? null,
        mailboxStateSnapshot: input.mailboxStateSnapshot ?? null,
        rawProviderMetadata: input.rawProviderMetadata ?? null,
        providerDeletedAt: null,
        updatedAt: new Date()
      };
      let messageId: string;
      let messageChanged = false;
      if (existingMessage[0]) {
        const existing = existingMessage[0];
        messageId = existing.id;
        messageChanged =
          existing.userId !== messageValues.userId ||
          existing.conversationId !== messageValues.conversationId ||
          existing.providerThreadId !== messageValues.providerThreadId ||
          existing.direction !== messageValues.direction ||
          existing.senderParticipantId !== messageValues.senderParticipantId ||
          existing.subject !== messageValues.subject ||
          existing.textBody !== messageValues.textBody ||
          existing.sanitizedHtmlBody !== messageValues.sanitizedHtmlBody ||
          !sameDate(existing.occurredAt, messageValues.occurredAt) ||
          !sameDate(existing.providerReceivedAt, messageValues.providerReceivedAt) ||
          existing.readState !== messageValues.readState ||
          JSON.stringify(existing.mailboxStateSnapshot) !== JSON.stringify(messageValues.mailboxStateSnapshot) ||
          JSON.stringify(existing.rawProviderMetadata) !== JSON.stringify(messageValues.rawProviderMetadata) ||
          existing.providerDeletedAt !== null;
        if (messageChanged) {
          await tx.update(messages).set(messageValues).where(eq(messages.id, messageId));
        }
      } else {
        const [created] = await tx
          .insert(messages)
          .values({
            ...messageValues,
            createdAt: new Date()
          })
          .returning({id: messages.id});
        if (!created) throw new Error('message upsert did not return an ID');
        messageId = created.id;
        messageChanged = true;
      }

      const desiredEdges = [
        ...recipients.map((participant) => ({
          participantId: identityIds.get(participant.canonicalEmail) as string,
          role: 'TO'
        })),
        ...cc.map((participant) => ({
          participantId: identityIds.get(participant.canonicalEmail) as string,
          role: 'CC'
        })),
        ...bcc.map((participant) => ({
          participantId: identityIds.get(participant.canonicalEmail) as string,
          role: 'BCC'
        }))
      ];
      const currentEdges = await tx
        .select({participantId: messageParticipants.participantId, role: messageParticipants.role})
        .from(messageParticipants)
        .where(
          and(
            eq(messageParticipants.messageId, messageId),
            eq(messageParticipants.connectedAccountId, input.connectedAccountId)
          )
        );
      const edgesChanged = participantSet(currentEdges) !== participantSet(desiredEdges);
      if (edgesChanged) {
        await tx
          .delete(messageParticipants)
          .where(
            and(
              eq(messageParticipants.messageId, messageId),
              eq(messageParticipants.connectedAccountId, input.connectedAccountId)
            )
          );
        if (desiredEdges.length > 0) {
          await tx.insert(messageParticipants).values(
            desiredEdges.map(({participantId, role}) => ({
              userId: input.userId,
              connectedAccountId: input.connectedAccountId,
              messageId,
              participantId,
              role,
              createdAt: new Date()
            }))
          );
        }
      }

      const currentAttachments = await tx
        .select({
          providerAttachmentId: attachments.providerAttachmentId,
          filename: attachments.filename,
          mimeType: attachments.mimeType,
          sizeBytes: attachments.sizeBytes,
          contentDisposition: attachments.contentDisposition,
          contentReference: attachments.contentReference,
          contentHash: attachments.contentHash,
          previewState: attachments.previewState
        })
        .from(attachments)
        .where(
          and(
            eq(attachments.messageId, messageId),
            eq(attachments.connectedAccountId, input.connectedAccountId)
          )
        )
        .orderBy(asc(attachments.id));
      const attachmentsChanged =
        attachmentSet(
          currentAttachments.map((attachment) => ({
            ...attachment,
            providerAttachmentId: attachment.providerAttachmentId ?? undefined,
            sizeBytes: attachment.sizeBytes ?? undefined,
            contentDisposition: attachment.contentDisposition ?? undefined,
            contentHash: attachment.contentHash ?? undefined,
            previewState: attachment.previewState ?? undefined
          }))
        ) !== attachmentSet(normalizedAttachments);
      if (attachmentsChanged) {
        await tx
          .delete(attachments)
          .where(
            and(
              eq(attachments.messageId, messageId),
              eq(attachments.connectedAccountId, input.connectedAccountId)
            )
          );
        if (normalizedAttachments.length > 0) {
          await tx.insert(attachments).values(
            normalizedAttachments.map((attachment) => ({
              id: attachment.id,
              userId: input.userId,
              connectedAccountId: input.connectedAccountId,
              messageId,
              providerAttachmentId: attachment.providerAttachmentId,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              contentDisposition: attachment.contentDisposition,
              contentReference: attachment.contentReference,
              contentHash: attachment.contentHash,
              previewState: attachment.previewState,
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          );
        }
      }

      const changed = conversationChanged || participantChanged || messageChanged || edgesChanged || attachmentsChanged;
      if (changed) {
        const [updated] = await tx
          .update(conversations)
          .set({
            semanticEvidenceRevision: sql`${conversations.semanticEvidenceRevision} + 1`,
            updatedAt: new Date()
          })
          .where(eq(conversations.id, input.conversation.id))
          .returning({revision: conversations.semanticEvidenceRevision});
        if (!updated) throw new Error('conversation evidence revision was not advanced');
        return {
          messageId,
          conversationId: input.conversation.id,
          evidenceRevision: updated.revision,
          changed: true
        };
      }

      return {
        messageId,
        conversationId: input.conversation.id,
        evidenceRevision: conversation.semanticEvidenceRevision,
        changed: false
      };
    });
  }
}
