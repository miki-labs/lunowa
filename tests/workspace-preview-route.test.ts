import {afterEach, expect, it, vi} from 'vitest';
vi.mock('next/navigation', () => ({notFound: () => {throw new Error('NOT_FOUND');}}));
vi.mock('@/components/lunowa-shell', () => ({LunowaShell: () => null}));
vi.mock('@/components/reference-workspace', () => ({ReferenceWorkspace: () => null}));
import PreviewPage from '@/app/[locale]/preview/page';
afterEach(() => vi.unstubAllEnvs());
it('hides the fixture route unless explicitly enabled', async () => {
  vi.stubEnv('LUNOWA_UI_PREVIEW', '');
  await expect(PreviewPage({params: Promise.resolve({locale: 'ja'})})).rejects.toThrow('NOT_FOUND');
});
it('enables only a sessionless preview with the requested locale', async () => {
  vi.stubEnv('LUNOWA_UI_PREVIEW', 'true');
  const page = await PreviewPage({params: Promise.resolve({locale: 'en'})});
  expect(page.props).toEqual({locale: 'en', variant: 'desktop'});
});
it('keeps the runtime fixtures explicitly accessible without granting a session', async () => {
  vi.stubEnv('LUNOWA_UI_PREVIEW', 'true');
  const page = await PreviewPage({params: Promise.resolve({locale: 'ja'}), searchParams: Promise.resolve({view: 'runtime'})});
  expect(page.props).toEqual({locale: 'ja', preview: true});
});
it('selects the second supplied conversation reference explicitly', async () => {
  vi.stubEnv('LUNOWA_UI_PREVIEW', 'true');
  const page = await PreviewPage({params: Promise.resolve({locale: 'ja'}), searchParams: Promise.resolve({view: 'moment'})});
  expect(page.props).toEqual({locale: 'ja', variant: 'moment'});
});
