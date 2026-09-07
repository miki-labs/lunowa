import {constantTimeSecretMatch} from '@/server/gmail/crypto';
import {gmailErrorResponse} from '@/server/gmail/http';
import {createGmailRuntime} from '@/server/gmail/runtime';
import {GmailProviderError} from '@/server/gmail/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const runtime = createGmailRuntime();
    const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null;
    if (!constantTimeSecretMatch(supplied, runtime.environment.workerSecret)) {
      throw new GmailProviderError(401, 'UNAUTHORIZED_WORKER');
    }
    const body = await request.json() as {userId?: unknown; sendOperationId?: unknown};
    if (typeof body.userId !== 'string' || typeof body.sendOperationId !== 'string' || !body.userId || !body.sendOperationId) {
      throw new GmailProviderError(400, 'INVALID_SEND_OPERATION_REQUEST');
    }
    const operation = await runtime.send.dispatch({userId: body.userId, sendOperationId: body.sendOperationId});
    return Response.json({operation}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    const response = gmailErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
