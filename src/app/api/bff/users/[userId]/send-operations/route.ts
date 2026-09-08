import {getOwnedAppSession} from '@/server/auth/session';
import {CommunicationRepository} from '@/server/db/repositories/communication';
import {communicationErrorResponse, optionalResponsibilityBinding, parseCommunicationRequest, requiredString} from '@/server/communication/http';
import {createGmailRuntime} from '@/server/gmail/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};

export async function POST(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const body = await parseCommunicationRequest(request);
    const repository = new CommunicationRepository();
    const requested = await repository.requestImmediateSend({
      userId,
      draftId: requiredString(body, 'draftId'),
      responsibilityBinding: optionalResponsibilityBinding(body.responsibilityBinding)
    });
    // This request is the user's explicit immediate-Send effect. PENDING is not
    // consumed by background reconciliation; the live request performs the one
    // provider dispatch attempt and returns its durable truth state.
    const operation = await createGmailRuntime().send.dispatch({userId, sendOperationId: requested.id});
    return Response.json({accepted: true, operation}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    const response = communicationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
