import {and, eq} from 'drizzle-orm';

import {getDatabase} from '../index';
import {aiInterpretationRuns} from '../schema/responsibility';
import type {AIRunCapture, AIRunStatus, AIRunStore} from '../../ai/runtime';

type Database = ReturnType<typeof getDatabase>;

/**
 * Durable AI-run substrate adapter. It stores IDs, configuration, revision,
 * lane, and a bounded manifest only; email bodies and raw model payloads do
 * not enter this repository method.
 */
export class AIInterpretationRunRepository implements AIRunStore {
  public constructor(private readonly db: Database = getDatabase()) {}

  public async capture(input: AIRunCapture): Promise<{id: string}> {
    const [row] = await this.db.insert(aiInterpretationRuns).values({
      userId: input.userId,
      conversationId: input.conversationId,
      messageId: input.messageIds[0] ?? null,
      schemaVersion: input.schemaVersion,
      modelConfigVersion: input.modelConfigVersion,
      providerModelIdentifier: input.providerModelIdentifier,
      basisEvidenceRevision: input.basisEvidenceRevision,
      status: 'CAPTURED',
      contextManifest: input.contextManifest,
      createdAt: new Date()
    }).returning({id: aiInterpretationRuns.id});
    if (!row) throw new Error('AI interpretation run was not captured');
    return row;
  }

  public async mark(input: {id: string; userId: string; status: AIRunStatus}): Promise<void> {
    await this.db.update(aiInterpretationRuns).set({status: input.status}).where(and(
      eq(aiInterpretationRuns.id, input.id),
      eq(aiInterpretationRuns.userId, input.userId)
    ));
  }
}
