import {toNextJsHandler} from 'better-auth/next-js';

import {getAppAuth} from '@/server/auth/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = (request: Request) => getAppAuth().handler(request);

export const {GET, POST, PATCH, PUT, DELETE} = toNextJsHandler(handler);
