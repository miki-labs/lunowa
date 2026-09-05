import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual
} from 'node:crypto';

type CipherEnvelope = {v: 1; iv: string; tag: string; ciphertext: string};

function base64Url(value: Buffer): string {
  return value.toString('base64url');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function randomUrlToken(bytes = 32): string {
  return base64Url(randomBytes(bytes));
}

export function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier, 'ascii').digest('base64url');
}

export function constantTimeSecretMatch(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualDigest = createHash('sha256').update(actual).digest();
  const expectedDigest = createHash('sha256').update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

export class GmailCredentialCipher {
  private readonly key: Buffer;

  constructor(encodedKey: string) {
    this.key = Buffer.from(encodedKey, 'base64');
    if (this.key.length !== 32) {
      throw new Error('GMAIL_CREDENTIAL_KEY must be a base64-encoded 32-byte key.');
    }
  }

  encrypt(value: unknown, context: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(context, 'utf8'));
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(value), 'utf8'),
      cipher.final()
    ]);
    const envelope: CipherEnvelope = {
      v: 1,
      iv: base64Url(iv),
      tag: base64Url(cipher.getAuthTag()),
      ciphertext: base64Url(ciphertext)
    };
    return Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64url');
  }

  decrypt<T>(encodedEnvelope: string, context: string): T {
    let envelope: CipherEnvelope;
    try {
      envelope = JSON.parse(Buffer.from(encodedEnvelope, 'base64url').toString('utf8')) as CipherEnvelope;
    } catch {
      throw new Error('Encrypted Gmail credential is malformed.');
    }
    if (envelope.v !== 1 || !envelope.iv || !envelope.tag || !envelope.ciphertext) {
      throw new Error('Encrypted Gmail credential has an unsupported envelope.');
    }
    try {
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.key,
        Buffer.from(envelope.iv, 'base64url')
      );
      decipher.setAAD(Buffer.from(context, 'utf8'));
      decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'));
      return JSON.parse(
        Buffer.concat([
          decipher.update(Buffer.from(envelope.ciphertext, 'base64url')),
          decipher.final()
        ]).toString('utf8')
      ) as T;
    } catch {
      throw new Error('Encrypted Gmail credential could not be authenticated.');
    }
  }
}
