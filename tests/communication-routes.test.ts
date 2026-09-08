import {beforeEach, describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
  getOwnedAppSession: vi.fn(),
  sessionAccessResponse: vi.fn(),
  repository: {
    getReplyContext: vi.fn(),
    saveDraft: vi.fn(),
    getDraft: vi.fn(),
    requestImmediateSend: vi.fn()
  },
  gmailSend: {dispatch: vi.fn()}
}));

vi.mock('@/server/auth/session', () => ({
  getOwnedAppSession: mocks.getOwnedAppSession,
  sessionAccessResponse: mocks.sessionAccessResponse
}));
vi.mock('@/server/db/repositories/communication', () => ({
  CommunicationRepository: vi.fn(function () { return mocks.repository; }),
  CommunicationInputError: class CommunicationInputError extends Error { public code: string; constructor(code: string) { super(code); this.code = code; } },
  DraftConflictError: class DraftConflictError extends Error { public currentVersion: number; constructor(currentVersion: number) { super('DRAFT_VERSION_CONFLICT'); this.currentVersion = currentVersion; } }
}));
vi.mock('@/server/gmail/runtime', () => ({createGmailRuntime: vi.fn(() => ({send: mocks.gmailSend}))}));

import {GET as getContext} from '@/app/api/bff/users/[userId]/drafts/context/route';
import {POST as saveDraft} from '@/app/api/bff/users/[userId]/drafts/route';
import {POST as requestSend} from '@/app/api/bff/users/[userId]/send-operations/route';

function request(url: string, body?: Record<string, unknown>) {
  return new Request(url, body ? {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)} : undefined);
}

describe('G50 contextual communication routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOwnedAppSession.mockResolvedValue({user: {id: 'user-1'}});
    mocks.sessionAccessResponse.mockReturnValue(null);
    mocks.repository.getReplyContext.mockResolvedValue({
      connectedAccount: {id: 'account-1', emailAddress: 'owner@example.com', displayName: 'Owner', connectionState: 'CONNECTED', sendAuthorized: true},
      conversationId: 'conversation-1', providerThreadId: 'thread-1', inReplyToMessageId: 'message-1', inReplyToProviderMessageId: 'provider-message-1',
      evidenceRevision: 2, mode: 'REPLY_ALL', sender: {email: 'owner@example.com', displayName: 'Owner'},
      recipients: [{email: 'sender@example.com', displayName: 'Sender'}], cc: [], bcc: [], subject: 'Re: Request'
    });
    mocks.repository.saveDraft.mockResolvedValue({id: 'draft-1', version: 1, body: '返信', recipients: [{email: 'sender@example.com'}]});
    mocks.repository.requestImmediateSend.mockResolvedValue({id: 'operation-1', status: 'PENDING', draftId: 'draft-1'});
    mocks.gmailSend.dispatch.mockResolvedValue({id: 'operation-1', status: 'RECONCILED', draftId: 'draft-1'});
  });

  it('returns server-built reply context rather than accepting client recipients', async () => {
    const response = await getContext(request('http://localhost/api/bff/users/user-1/drafts/context?connectedAccountId=account-1&conversationId=conversation-1&mode=REPLY_ALL'), {params: Promise.resolve({userId: 'user-1'})});
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({recipients: [{email: 'sender@example.com'}], mode: 'REPLY_ALL'});
    expect(mocks.repository.getReplyContext).toHaveBeenCalledWith(expect.objectContaining({userId: 'user-1', mode: 'REPLY_ALL'}));
  });

  it('saves the user body while keeping mode/context server-authorized', async () => {
    const response = await saveDraft(request('http://localhost/api/bff/users/user-1/drafts', {
      connectedAccountId: 'account-1', conversationId: 'conversation-1', inReplyToMessageId: 'message-1', mode: 'REPLY', body: '確認しました。'
    }), {params: Promise.resolve({userId: 'user-1'})});
    expect(response.status).toBe(200);
    expect(mocks.repository.saveDraft).toHaveBeenCalledWith(expect.objectContaining({userId: 'user-1', body: '確認しました。', mode: 'REPLY'}));
    expect(mocks.repository.saveDraft.mock.calls[0]?.[0]).not.toHaveProperty('recipients');
  });

  it('treats null expectedVersion from an unsaved browser draft as an initial create', async () => {
    const response = await saveDraft(request('http://localhost/api/bff/users/user-1/drafts', {
      draftId: null, expectedVersion: null, connectedAccountId: 'account-1', conversationId: 'conversation-1',
      inReplyToMessageId: 'message-1', mode: 'REPLY', body: '初回保存'
    }), {params: Promise.resolve({userId: 'user-1'})});
    expect(response.status).toBe(200);
    expect(mocks.repository.saveDraft).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1', draftId: undefined, expectedVersion: undefined, body: '初回保存'
    }));
  });

  it('rejects malformed JSON at the communication boundary instead of surfacing a server error', async () => {
    const response = await requestSend(new Request('http://localhost/api/bff/users/user-1/send-operations', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{not-json'
    }), {params: Promise.resolve({userId: 'user-1'})});
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({accepted: false, error: 'INVALID_JSON_BODY'});
    expect(mocks.repository.requestImmediateSend).not.toHaveBeenCalled();
  });

  it('binds the active Responsibility and performs the explicit provider dispatch in the live request', async () => {
    const responsibilityBinding = {responsibilityId: 'responsibility-1', aggregateVersion: 3, evidenceRevision: 2};
    const response = await requestSend(request('http://localhost/api/bff/users/user-1/send-operations', {
      draftId: 'draft-1', responsibilityBinding
    }), {params: Promise.resolve({userId: 'user-1'})});
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({accepted: true, operation: {status: 'RECONCILED'}});
    expect(mocks.repository.requestImmediateSend).toHaveBeenCalledWith({userId: 'user-1', draftId: 'draft-1', responsibilityBinding});
    expect(mocks.gmailSend.dispatch).toHaveBeenCalledTimes(1);
    expect(mocks.gmailSend.dispatch).toHaveBeenCalledWith({userId: 'user-1', sendOperationId: 'operation-1'});
  });
});
