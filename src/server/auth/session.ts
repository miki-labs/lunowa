import {getAppAuth} from './auth';

export type AuthenticatedAppSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
};

export class AppSessionAccessError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN'
  ) {
    super(code);
  }
}

export function authorizeAppSession(
  candidate: AuthenticatedAppSession | null,
  requestedUserId: string,
  now = new Date()
): AuthenticatedAppSession {
  if (!candidate || candidate.session.expiresAt.getTime() <= now.getTime()) {
    throw new AppSessionAccessError(401, 'UNAUTHENTICATED');
  }

  if (candidate.session.userId !== candidate.user.id || candidate.user.id !== requestedUserId) {
    throw new AppSessionAccessError(403, 'FORBIDDEN');
  }

  return candidate;
}

export async function getOwnedAppSession(headers: Headers, requestedUserId: string) {
  // Cookie caching stays disabled in configuration. The explicit query keeps
  // this user-scoped BFF check authoritative and prevents a refresh write from
  // disguising the request's original expiry boundary.
  const candidate = await getAppAuth().api.getSession({
    headers,
    query: {disableCookieCache: true, disableRefresh: true}
  });
  return authorizeAppSession(candidate, requestedUserId);
}

export async function getCurrentAppSession(headers: Headers) {
  const candidate = await getAppAuth().api.getSession({
    headers,
    query: {disableCookieCache: true, disableRefresh: true}
  });
  if (!candidate) throw new AppSessionAccessError(401, 'UNAUTHENTICATED');
  return authorizeAppSession(candidate, candidate.user.id);
}

export function sessionAccessResponse(error: unknown): Response | null {
  if (!(error instanceof AppSessionAccessError)) return null;
  return Response.json({error: error.code}, {
    status: error.status,
    headers: {'Cache-Control': 'no-store'}
  });
}
