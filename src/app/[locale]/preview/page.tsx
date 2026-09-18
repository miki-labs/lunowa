import {notFound} from 'next/navigation';
import {LunowaShell} from '@/components/lunowa-shell';
import {ReferenceWorkspace} from '@/components/reference-workspace';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'Lunowa · Design preview', robots: {index: false, follow: false}};

export default async function PreviewPage({params, searchParams}: {params: Promise<{locale: string}>; searchParams?: Promise<{view?: string}>}) {
  // Explicit local opt-in. This route never grants a session or BFF access.
  if (process.env.LUNOWA_UI_PREVIEW !== 'true') notFound();
  const {locale} = await params;
  const {view} = await (searchParams ?? Promise.resolve({view: undefined}));
  if (view === 'runtime') return <LunowaShell locale={locale === 'en' ? 'en' : 'ja'} preview />;
  return <ReferenceWorkspace locale={locale === 'en' ? 'en' : 'ja'} variant={view === 'moment' ? 'moment' : 'desktop'} />;
}
