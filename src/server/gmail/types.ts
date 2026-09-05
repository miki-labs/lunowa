import type {NormalizedProviderMessage} from '@/server/evidence/normalized';

export const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

export type GmailTokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
};

export type GmailProfile = {
  emailAddress: string;
  historyId: string;
};

export type GmailMessageHeader = {name?: string; value?: string};
export type GmailMessagePart = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailMessageHeader[];
  body?: {attachmentId?: string; size?: number; data?: string};
  parts?: GmailMessagePart[];
};
export type GmailMessage = {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
};

export type GmailHistory = {
  id?: string;
  messages?: {id: string; threadId?: string}[];
  messagesAdded?: {message: {id: string; threadId?: string}}[];
  messagesDeleted?: {message: {id: string; threadId?: string}}[];
  labelsAdded?: {message: {id: string; threadId?: string}}[];
  labelsRemoved?: {message: {id: string; threadId?: string}}[];
};

export type GmailHistoryPage = {
  history?: GmailHistory[];
  historyId?: string;
  nextPageToken?: string;
};

export type GmailMessageListPage = {
  messages?: {id: string; threadId?: string}[];
  nextPageToken?: string;
};

export type GmailWatch = {historyId: string; expiration: string};

export interface GmailProviderClient {
  exchangeCode(code: string, codeVerifier: string): Promise<GmailTokenSet & {scope: string}>;
  refresh(refreshToken: string): Promise<Partial<GmailTokenSet> & Pick<GmailTokenSet, 'accessToken' | 'expiresAt'>>;
  revoke(token: string): Promise<void>;
  getProfile(accessToken: string): Promise<GmailProfile>;
  watch(accessToken: string, topicName: string): Promise<GmailWatch>;
  listMessages(accessToken: string, pageToken?: string): Promise<GmailMessageListPage>;
  getMessage(accessToken: string, messageId: string): Promise<GmailMessage>;
  listHistory(accessToken: string, startHistoryId: string, pageToken?: string): Promise<GmailHistoryPage>;
  getAttachment(accessToken: string, messageId: string, attachmentId: string): Promise<{data: string; size?: number}>;
}

export interface GmailEvidenceWriter {
  upsertNormalizedMessage(input: NormalizedProviderMessage): Promise<unknown>;
  listProviderMessageIds(input: {userId: string; connectedAccountId: string}): Promise<readonly string[]>;
  markNormalizedMessageAbsent(input: {userId: string; connectedAccountId: string; providerMessageId: string}): Promise<boolean>;
}

export class GmailProviderError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message = `Gmail provider request failed (${code})`
  ) {
    super(message);
  }
}
