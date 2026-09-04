import {GmailAttachmentService} from './attachments';
import {GmailAuthorizationService, GmailCredentialService} from './authorization';
import {getGmailEnvironment} from './config';
import {GmailCredentialCipher} from './crypto';
import {GoogleGmailClient} from './provider-client';
import {GmailPushIngress, GooglePubSubJwtVerifier} from './pubsub';
import {GmailSyncService} from './sync';

export function createGmailRuntime() {
  const environment = getGmailEnvironment();
  const cipher = new GmailCredentialCipher(environment.credentialKey);
  const provider = new GoogleGmailClient(environment);
  const credentials = new GmailCredentialService(environment, cipher, provider);
  return {
    environment,
    authorization: new GmailAuthorizationService(environment, cipher, provider),
    credentials,
    sync: new GmailSyncService(environment.pubsubTopic, provider, credentials),
    push: new GmailPushIngress(
      new GooglePubSubJwtVerifier(environment.pubsubAudience, environment.pubsubServiceAccount)
    ),
    attachments: new GmailAttachmentService(provider, credentials)
  };
}
