import {describe, expect, it} from 'vitest';

import {buildReplyRecipients, normalizeDraftBody, normalizeReplyBody} from '@/server/communication/reply';

const sender = {email: 'me@example.com', displayName: 'Me'};

describe('G50 trusted contextual reply construction', () => {
  it('builds Reply to the observed sender and excludes the sending account', () => {
    expect(buildReplyRecipients('REPLY', {
      sender,
      originalSender: {email: 'sender@example.com', displayName: 'Sender'},
      originalRecipients: [sender, {email: 'other@example.com', displayName: 'Other'}],
      originalCc: [{email: 'copy@example.com', displayName: 'Copy'}],
      originalBcc: [{email: 'hidden@example.com'}]
    })).toEqual({
      to: [{email: 'sender@example.com', displayName: 'Sender'}],
      cc: [],
      bcc: []
    });
  });

  it('builds Reply All deterministically, deduplicates, and never copies Bcc', () => {
    expect(buildReplyRecipients('REPLY_ALL', {
      sender,
      originalSender: {email: 'sender@example.com', displayName: 'Sender'},
      originalRecipients: [sender, {email: 'other@example.com', displayName: 'Other'}, {email: 'sender@example.com'}],
      originalCc: [{email: 'copy@example.com', displayName: 'Copy'}, {email: 'other@example.com'}],
      originalBcc: [{email: 'hidden@example.com'}]
    })).toEqual({
      to: [
        {email: 'sender@example.com', displayName: 'Sender'},
        {email: 'other@example.com', displayName: 'Other'}
      ],
      cc: [{email: 'copy@example.com', displayName: 'Copy'}],
      bcc: []
    });
  });


  it('replies to the observed recipients when the latest message was sent by the current account', () => {
    expect(buildReplyRecipients('REPLY', {
      sender,
      originalSender: sender,
      originalRecipients: [
        {email: 'recipient@example.com', displayName: 'Recipient'},
        {email: 'second@example.com', displayName: 'Second'}
      ],
      originalCc: [{email: 'copy@example.com', displayName: 'Copy'}]
    })).toEqual({
      to: [
        {email: 'recipient@example.com', displayName: 'Recipient'},
        {email: 'second@example.com', displayName: 'Second'}
      ],
      cc: [],
      bcc: []
    });
  });

  it('preserves Japanese IME text through NFC serialization without implicit Send', () => {
    const body = '確認しました。\n次の条件をお願いします。';
    expect(normalizeDraftBody(body)).toBe(body);
    expect(() => normalizeReplyBody('  ')).toThrow('draft body is required');
    expect(normalizeReplyBody('返信')).toBe('返信');
  });
});
