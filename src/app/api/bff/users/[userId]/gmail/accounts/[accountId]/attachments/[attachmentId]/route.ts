import {getOwnedAppSession} from '@/server/auth/session';
import {gmailErrorResponse} from '@/server/gmail/http';
import {createGmailRuntime} from '@/server/gmail/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string; accountId: string; attachmentId: string}>};

function disposition(filename: string): string {
  const fallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_').slice(0, 150) || 'attachment';
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(request: Request, context: RouteContext) {
  const {userId, accountId, attachmentId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const attachment = await createGmailRuntime().attachments.fetch({
      userId,
      connectedAccountId: accountId,
      attachmentId
    });
    return new Response(attachment.content, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': disposition(attachment.filename),
        'Content-Length': String(attachment.size),
        'Content-Type': attachment.mimeType,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox"
      }
    });
  } catch (error) {
    const response = gmailErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
