import {AuthBoundary} from '@/components/auth-boundary';

export default async function HomePage({searchParams}: {searchParams: Promise<{auth?: string}>}) {
  const {auth} = await searchParams;
  return <AuthBoundary oauthCallback={auth === 'failed' || auth === 'returned' ? auth : undefined} />;
}
