export type ReplyMode = 'REPLY' | 'REPLY_ALL';

export type CommunicationParticipant = {email: string; displayName: string | null};

export type ReplyContextReadModel = {
  connectedAccount: {id: string; emailAddress: string; displayName: string | null; connectionState: string; sendAuthorized: boolean};
  conversationId: string;
  providerThreadId: string | null;
  inReplyToMessageId: string;
  inReplyToProviderMessageId: string;
  evidenceRevision: number;
  mode: ReplyMode;
  sender: CommunicationParticipant;
  recipients: CommunicationParticipant[];
  cc: CommunicationParticipant[];
  bcc: CommunicationParticipant[];
  subject: string;
  draft?: {
    id: string;
    version: number;
    body: string;
    recipients: CommunicationParticipant[];
    cc: CommunicationParticipant[];
  };
};

export type DraftSaveState = 'idle' | 'saving' | 'saved' | 'conflict' | 'failed';
