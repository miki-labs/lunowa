import {getOwnedAppSession} from '@/server/auth/session';
import {CommunicationRepository} from '@/server/db/repositories/communication';
import {communicationErrorResponse, optionalResponsibilityBinding, parseCommunicationRequest, requiredString} from '@/server/communication/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};

export async function POST(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const body = await parseCommunicationRequest(request);
    const operation = await new CommunicationRepository().requestImmediateSend({
      userId,
      draftId: requiredString(body, 'draftId'),
      responsibilityBinding: optionalResponsibilityBinding(body.responsibilityBinding)
    });
    return Response.json({accepted: true, operation}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    const response = communicationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
