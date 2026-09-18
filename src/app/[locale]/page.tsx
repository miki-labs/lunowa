import {AuthBoundary} from '@/components/auth-boundary';

export default async function HomePage({searchParams}: {searchParams: Promise<{auth?: string; gmail?: string}>}) {
  const {auth, gmail} = await searchParams;
  return <AuthBoundary
    oauthCallback={auth === 'failed' || auth === 'returned' ? auth : undefined}
    mailboxCallback={gmail === 'syncing' || gmail === 'cancelled' ? gmail : undefined}
  />;
}
