import {getOwnedAppSession} from '@/server/auth/session';
import {CommunicationInputError, CommunicationRepository} from '@/server/db/repositories/communication';
import {communicationErrorResponse, optionalRecipients, optionalString, parseCommunicationRequest, parseReplyMode, requiredString} from '@/server/communication/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};


export async function GET(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const draftId = new URL(request.url).searchParams.get('draftId');
    if (!draftId) return Response.json({error: 'DRAFT_ID_REQUIRED'}, {status: 400, headers: {'Cache-Control': 'no-store'}});
    const draft = await new CommunicationRepository().getDraft(userId, draftId);
    if (!draft) return Response.json({error: 'DRAFT_NOT_FOUND'}, {status: 404, headers: {'Cache-Control': 'no-store'}});
    return Response.json(draft, {headers: {'Cache-Control': 'private, no-store'}});
  } catch (error) {
    const response = communicationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}

export async function POST(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const body = await parseCommunicationRequest(request);
    const expectedVersion = body.expectedVersion === undefined ? undefined : Number(body.expectedVersion);
    if (expectedVersion !== undefined && (!Number.isInteger(expectedVersion) || expectedVersion < 1)) throw new CommunicationInputError('EXPECTED_VERSION_INVALID');
    const recipients = optionalRecipients(body.recipients);
    const cc = optionalRecipients(body.cc);
    const draftInput: Parameters<CommunicationRepository['saveDraft']>[0] = {
      userId,
      draftId: optionalString(body, 'draftId'),
      expectedVersion,
      connectedAccountId: requiredString(body, 'connectedAccountId'),
      conversationId: requiredString(body, 'conversationId'),
      inReplyToMessageId: optionalString(body, 'inReplyToMessageId'),
      mode: parseReplyMode(body.mode),
      body: typeof body.body === 'string' ? body.body : ''
    };
    if (recipients !== undefined) draftInput.recipients = recipients;
    if (cc !== undefined) draftInput.cc = cc;
    const draft = await new CommunicationRepository().saveDraft(draftInput);
    return Response.json(draft, {headers: {'Cache-Control': 'private, no-store'}});
  } catch (error) {
    const response = communicationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
