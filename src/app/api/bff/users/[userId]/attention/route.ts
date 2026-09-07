import {getOwnedAppSession, sessionAccessResponse} from '@/server/auth/session';
import {ResponsibilityRepository} from '@/server/db/repositories/responsibility';
import {SourceRepository} from '@/server/db/repositories/source';
import {buildAttentionReadModel} from '@/server/responsibility/attention-read-model';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};

export async function GET(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const responsibilityRepository = new ResponsibilityRepository();
    const [responsibilities, admissionReviews, source] = await Promise.all([
      responsibilityRepository.listResponsibilities({userId}),
      responsibilityRepository.listAdmissionReviews({userId}),
      new SourceRepository().listConversations({userId, limit: 1})
    ]);
    return Response.json(buildAttentionReadModel({
      responsibilities: responsibilities.map(({state}) => state),
      admissionReviews,
      sourceReadiness: source.readiness,
      dataThroughAt: source.dataThroughAt
    }), {headers: {'Cache-Control': 'private, no-store'}});
  } catch (error) {
    const sessionResponse = sessionAccessResponse(error);
    if (sessionResponse) return sessionResponse;
    throw error;
  }
}
