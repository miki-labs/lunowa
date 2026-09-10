import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  SEND_ADMISSION_BURST_LIMIT,
  SEND_ADMISSION_BURST_WINDOW_MS,
  SEND_ADMISSION_DAILY_LIMIT,
  SEND_ADMISSION_DAILY_WINDOW_MS
} from '@/server/db/repositories/communication';
import {GMAIL_OAUTH_SCOPES} from '@/server/gmail/config';
import {GMAIL_READONLY_SCOPE, GMAIL_SEND_SCOPE} from '@/server/gmail/types';
import {responseRequest} from '@/server/ai/openai';

describe('R90 public-beta release safety', () => {
  it('keeps Gmail authorization at the exact accepted least-privilege scope pair', () => {
    expect([...GMAIL_OAUTH_SCOPES]).toEqual([GMAIL_READONLY_SCOPE, GMAIL_SEND_SCOPE]);
  });

  it('hard-bounds new Send identities for the private/public beta boundary', () => {
    expect(SEND_ADMISSION_BURST_WINDOW_MS).toBe(10 * 60 * 1000);
    expect(SEND_ADMISSION_BURST_LIMIT).toBe(20);
    expect(SEND_ADMISSION_DAILY_WINDOW_MS).toBe(24 * 60 * 60 * 1000);
    expect(SEND_ADMISSION_DAILY_LIMIT).toBe(100);
  });

  it('keeps OpenAI storage opt-out explicit without representing it as ZDR', () => {
    const request = responseRequest({
      model: 'gpt-test',
      messages: [],
      format: {} as never,
      maxOutputTokens: 32
    });
    expect(request.store).toBe(false);
  });

  it('enables persisted Workers observability for the deployed runtime', () => {
    const wrangler = JSON.parse(readFileSync(resolve(process.cwd(), 'wrangler.jsonc'), 'utf8')) as {
      observability?: {enabled?: boolean; head_sampling_rate?: number};
    };
    expect(wrangler.observability).toEqual({enabled: true, head_sampling_rate: 1});
  });

  it('keeps public release fail-closed while external R90 evidence is incomplete', () => {
    const readiness = readFileSync(resolve(process.cwd(), 'docs/R90-PUBLIC-BETA-READINESS.md'), 'utf8');
    expect(readiness).toContain('`PUBLIC_BETA_READY: NO`');
    expect(readiness).toContain('`PUBLIC_BETA_DECISION: NO_GO`');
    expect(readiness).toContain('`PRIVATE_TEST_BETA_DECISION: GO`');
    expect(readiness).toContain('Authoritative production-data restore is therefore **directly verified**.');
    expect(readiness).toContain('contains no `OPENAI_API_KEY`');
  });
});
