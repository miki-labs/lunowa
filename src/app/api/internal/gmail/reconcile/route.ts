import {constantTimeSecretMatch} from '@/server/gmail/crypto';
import {gmailErrorResponse} from '@/server/gmail/http';
import {createGmailRuntime} from '@/server/gmail/runtime';
import {GmailProviderError} from '@/server/gmail/types';
import {runGmailReconciliation} from '@/server/gmail/worker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const runtime = createGmailRuntime();
    const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null;
    if (!constantTimeSecretMatch(supplied, runtime.environment.workerSecret)) {
      throw new GmailProviderError(401, 'UNAUTHORIZED_WORKER');
    }
    const result = await runGmailReconciliation(runtime);
    return Response.json(
      result,
      {headers: {'Cache-Control': 'no-store'}}
    );
  } catch (error) {
    const response = gmailErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
