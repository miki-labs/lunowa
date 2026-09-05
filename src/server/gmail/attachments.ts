import {GmailRepository} from '@/server/db/repositories/gmail';

import {GmailCredentialService} from './authorization';
import type {GmailProviderClient} from './types';
import {GmailProviderError} from './types';

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const SAFE_MIME_TYPE = /^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/;
const UNSAFE_FILENAME = /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069\\/]/g;

export function safeDownloadFilename(value: string): string {
  const basename = value.normalize('NFC').split(/[\\/]+/).at(-1) ?? '';
  const candidate = basename.replace(UNSAFE_FILENAME, '_').replace(/^\.+/, '').trim().slice(0, 255);
  return candidate && !/^\.+$/.test(candidate) ? candidate : 'attachment';
}

export function safeDownloadMimeType(value: string): string {
  const candidate = value.trim().toLowerCase();
  return SAFE_MIME_TYPE.test(candidate) ? candidate : 'application/octet-stream';
}

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
      filename: safeDownloadFilename(attachment.filename),
      mimeType: safeDownloadMimeType(attachment.mimeType),
      size: content.byteLength
    };
  }
}
