import {GmailRepository} from '@/server/db/repositories/gmail';

import {GmailCredentialService} from './authorization';
import type {GmailProviderClient} from './types';
import {GmailProviderError} from './types';

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

type AttachmentRepository = Pick<GmailRepository, 'getOwnedAttachment'>;

export class GmailAttachmentService {
  constructor(
    private readonly provider: GmailProviderClient,
    private readonly credentials: GmailCredentialService,
    private readonly repository: AttachmentRepository = new GmailRepository()
  ) {}

  async fetch(input: {userId: string; connectedAccountId: string; attachmentId: string}) {
    const attachment = await this.repository.getOwnedAttachment(input);
    if (!attachment?.providerAttachmentId) throw new GmailProviderError(404, 'ATTACHMENT_NOT_FOUND');
    if (attachment.sizeBytes !== null && attachment.sizeBytes > MAX_ATTACHMENT_BYTES) {
      throw new GmailProviderError(413, 'ATTACHMENT_TOO_LARGE');
    }
    const accessToken = await this.credentials.getAccessToken(input.userId, input.connectedAccountId);
    let response: {data: string; size?: number};
    try {
      response = await this.provider.getAttachment(
        accessToken,
        attachment.providerMessageId,
        attachment.providerAttachmentId
      );
    } catch (error) {
      if (error instanceof GmailProviderError && error.status === 401) {
        await this.credentials.markReconnectRequired(input.userId, input.connectedAccountId);
      }
      if (error instanceof GmailProviderError && (error.status === 403 || error.status === 451)) {
        throw new GmailProviderError(403, 'PROVIDER_SECURITY_BLOCK');
      }
      throw error;
    }
    if (response.data.length > Math.ceil(MAX_ATTACHMENT_BYTES * 4 / 3) + 4) {
      throw new GmailProviderError(413, 'ATTACHMENT_TOO_LARGE');
    }
    const content = Buffer.from(response.data, 'base64url');
    if (content.byteLength > MAX_ATTACHMENT_BYTES || (response.size !== undefined && response.size > MAX_ATTACHMENT_BYTES)) {
      throw new GmailProviderError(413, 'ATTACHMENT_TOO_LARGE');
    }
    return {
      content,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      size: content.byteLength
    };
  }
}
