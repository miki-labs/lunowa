import {TemporalRepository} from '@/server/db/repositories/temporal';
import {createGmailRuntime} from '@/server/gmail/runtime';

type MonitoringStopper = Pick<TemporalRepository, 'stopTrackingForDisconnectedAccount'>;
type CredentialDisconnect = Pick<ReturnType<typeof createGmailRuntime>['credentials'], 'disconnect'>;

export async function disconnectGmailAccount(
  input: {userId: string; connectedAccountId: string; requestKey: string; now?: Date},
  monitoring: MonitoringStopper = new TemporalRepository(),
  credentials: CredentialDisconnect = createGmailRuntime().credentials
): Promise<{stoppedResponsibilities: number}> {
  // Stop the delegated promise first. If this fails, keep the provider
  // credential untouched rather than claiming a successful disconnect while
  // old tracking remains active. Provider revocation remains best-effort inside
  // the credential service after the local monitoring transition succeeds.
  const stoppedResponsibilities = await monitoring.stopTrackingForDisconnectedAccount(input);
  await credentials.disconnect(input.userId, input.connectedAccountId);
  return {stoppedResponsibilities};
}
