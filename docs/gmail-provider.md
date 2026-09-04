# Gmail provider operations

G20 activates one Gmail read-only Source lane. Gmail authorization remains
separate from the Better Auth application session and does not grant Send or
Responsibility mutation authority.

## Runtime configuration

Configure the variables documented in `.env.example` through the deployment
secret store. `GMAIL_CREDENTIAL_KEY` must be a base64-encoded 32-byte AES key;
only its version identifier belongs in ordinary configuration. Never put a
real token or key in repository files, logs, test fixtures, or browser APIs.

The Google OAuth client redirect URI is:

```text
/api/providers/gmail/oauth/callback
```

Grant only `https://www.googleapis.com/auth/gmail.readonly`. The flow requests
offline access because watch renewal and reconciliation run without an active
browser session. Reconnect uses the same authorization path.

## Pub/Sub and scheduling

Configure the push subscription to call:

```text
POST /api/providers/gmail/pubsub
```

Use authenticated push with the exact audience and service account configured
by `GMAIL_PUBSUB_AUDIENCE` and `GMAIL_PUBSUB_SERVICE_ACCOUNT`. The endpoint
verifies the Google OIDC signature/claims, durably deduplicates the delivery,
and acknowledges without treating its `historyId` as Source truth.

An external durable scheduler must call the following endpoint at least every
10 minutes with `Authorization: Bearer <GMAIL_WORKER_SECRET>`:

```text
POST /api/internal/gmail/reconcile
```

Each invocation enqueues accounts whose safety reconciliation or watch renewal
is due, then drains bounded work. Delivery retries are safe: source upserts are
idempotent and the history cursor advances with compare-and-set only after
required evidence writes commit.

## Recovery and evidence access

- Gmail history HTTP 404 sets `RECONCILIATION_REQUIRED` and performs an
  explicit full mailbox comparison. A mailbox above the configured 10,000
  message recovery bound remains degraded; it is never reported as empty or
  healthy.
- OAuth refresh invalidation sets the account to `RECONNECT_REQUIRED`.
- Intentional disconnect best-effort revokes the provider grant, always deletes
  local ciphertext, and preserves already-ingested Source evidence.
- Attachment bytes are fetched only after application-session and
  user/account/attachment ownership checks. Responses force download and
  preserve Gmail 403/451 restrictions as `PROVIDER_SECURITY_BLOCK`.

## Verification boundary

`pnpm test:gmail-provider` deterministically covers encryption, ownership,
OAuth state/PKCE, notification authentication/deduplication, initial/history
sync, stale-cursor recovery, safety scheduling, auth loss, and attachment
blocks. Real OAuth consent, Pub/Sub delivery, Gmail watch/history behavior and
provider security responses require credential-bound exact-head host/provider
evidence; local mocks do not establish those claims.
