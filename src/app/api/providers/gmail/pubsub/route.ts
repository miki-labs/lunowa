import {gmailErrorResponse} from '@/server/gmail/http';
import {createGmailRuntime} from '@/server/gmail/runtime';
import {GmailProviderError} from '@/server/gmail/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const declaredLength = Number(request.headers.get('content-length') ?? 0);
    if (declaredLength > 65_536) throw new GmailProviderError(413, 'PUBSUB_BODY_TOO_LARGE');
    const text = await request.text();
    if (Buffer.byteLength(text) > 65_536) throw new GmailProviderError(413, 'PUBSUB_BODY_TOO_LARGE');
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new GmailProviderError(400, 'INVALID_PUBSUB_BODY');
    }
    await createGmailRuntime().push.accept(request.headers.get('authorization'), body);
    return new Response(null, {status: 204, headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    const response = gmailErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
