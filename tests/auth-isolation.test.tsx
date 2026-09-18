import {useState} from 'react';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';
import {AuthTestProvider} from './auth-test-provider';

const mocks = vi.hoisted(() => ({getSession: vi.fn(), google: vi.fn()}));
vi.mock('@/lib/auth-client', () => ({authClient: {getSession: mocks.getSession}}));
vi.mock('@/lib/google-sign-in', () => ({beginGoogleSignIn: mocks.google}));
vi.mock('@/components/lunowa-shell', () => ({LunowaShell: function Shell({appUser}: {appUser: {id: string}}) {
  const [draft, setDraft] = useState('');
  return <div><span>{appUser.id}</span><input aria-label="Safe unsent draft" value={draft} onChange={(event) => setDraft(event.target.value)} /></div>;
}}));
import {AuthBoundary} from '@/components/auth-boundary';

afterEach(() => { cleanup(); vi.resetAllMocks(); });
const session = (id: string) => ({data: {user: {id, email: `${id}@example.invalid`, name: id}, session: {id: `session-${id}`}}, error: null});

it.each(['original', 'another'])('retains safe work only when the verified user remains %s', async (nextUser) => {
  mocks.getSession.mockResolvedValue(session('original'));
  mocks.google.mockResolvedValue(undefined);
  render(<AuthBoundary />, {wrapper: AuthTestProvider});
  fireEvent.change(await screen.findByRole('textbox'), {target: {value: 'private draft'}});
  mocks.getSession.mockResolvedValue({data: null, error: null});
  fireEvent(window, new Event('focus'));
  await screen.findByRole('heading', {name: 'もう一度、サインイン'});
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', {name: 'English'})).not.toBeInTheDocument();
  mocks.getSession.mockResolvedValue(session(nextUser));
  fireEvent.click(screen.getByRole('button', {name: 'Google で続行'}));
  expect(await screen.findByRole('textbox')).toHaveValue(nextUser === 'original' ? 'private draft' : '');
  expect(screen.getByText(nextUser)).toBeVisible();
});

it('does not trust popup completion without a server session', async () => {
  mocks.getSession.mockResolvedValue({data: null, error: null});
  mocks.google.mockResolvedValue(undefined);
  render(<AuthBoundary />, {wrapper: AuthTestProvider});
  fireEvent.click(await screen.findByRole('button', {name: 'Google で続行'}));
  await screen.findByRole('alert');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
