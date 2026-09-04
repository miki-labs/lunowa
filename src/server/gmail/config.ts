import {GMAIL_READONLY_SCOPE} from './types';

export type GmailEnvironment = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  credentialKey: string;
  credentialKeyVersion: string;
  pubsubAudience: string;
  pubsubServiceAccount: string;
  pubsubTopic: string;
  workerSecret: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Gmail provider requests.`);
  return value;
}

export function getGmailEnvironment(): GmailEnvironment {
  const result = {
    clientId: required('GOOGLE_GMAIL_CLIENT_ID'),
    clientSecret: required('GOOGLE_GMAIL_CLIENT_SECRET'),
    redirectUri: required('GOOGLE_GMAIL_REDIRECT_URI'),
    credentialKey: required('GMAIL_CREDENTIAL_KEY'),
    credentialKeyVersion: required('GMAIL_CREDENTIAL_KEY_VERSION'),
    pubsubAudience: required('GMAIL_PUBSUB_AUDIENCE'),
    pubsubServiceAccount: required('GMAIL_PUBSUB_SERVICE_ACCOUNT'),
    pubsubTopic: required('GMAIL_PUBSUB_TOPIC'),
    workerSecret: required('GMAIL_WORKER_SECRET')
  };
  new URL(result.redirectUri);
  if (!result.pubsubServiceAccount.endsWith('.gserviceaccount.com')) {
    throw new Error('GMAIL_PUBSUB_SERVICE_ACCOUNT must be a Google service account email.');
  }
  if (!result.pubsubTopic.startsWith('projects/')) {
    throw new Error('GMAIL_PUBSUB_TOPIC must be a fully-qualified Pub/Sub topic.');
  }
  return result;
}

export const GMAIL_OAUTH_SCOPES = Object.freeze([GMAIL_READONLY_SCOPE]);
