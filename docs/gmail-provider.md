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

Initial sync is bounded to 250 messages per worker run. Its watch baseline,
page token, page offset, and processed count are durable. While more pages
remain, the account is explicitly `RECONCILIATION_REQUIRED` with
`BOOTSTRAP_INCOMPLETE`, has no published cursor, and queues another bounded
continuation. Only after all historical pages and every change since the
original watch baseline commit does the cursor become healthy.

## Recovery and evidence access

- Gmail history HTTP 404 sets `RECONCILIATION_REQUIRED` and performs an
  explicit full mailbox comparison. A mailbox above the configured 10,000
  message recovery bound remains degraded; it is never reported as empty or
  healthy.
- Gmail deletion/history absence sets `Message.provider_deleted_at`; it never
  deletes observed communication, participants, or attachment metadata.
- OAuth refresh invalidation sets the account to `RECONNECT_REQUIRED`.
- Intentional disconnect best-effort revokes the provider grant, always deletes
  local ciphertext, and preserves already-ingested Source evidence.
- Attachment bytes are fetched only after application-session and
  user/account/attachment ownership checks. Responses force download and
  preserve Gmail 403/451 restrictions as `PROVIDER_SECURITY_BLOCK`. Provider
  filenames, MIME types, addresses, headers, and response headers are bounded
  and sanitized or rejected before they cross the evidence/download boundary.

## Verification boundary

`pnpm test:gmail-provider` deterministically covers encryption, ownership,
OAuth state/PKCE, notification authentication/deduplication, initial/history
sync, stale-cursor recovery, safety scheduling, auth loss, and attachment
blocks. `.github/workflows/g20-gmail-provider.yml` binds the generated migration
and production-shaped ciphertext/ownership/dedup/bootstrap/tombstone/cursor
invariants to the exact pull-request head on PostgreSQL 18.6.

Mocks and PostgreSQL do not establish provider acceptance. Before accepting a
candidate, a trusted operator must prepare a dedicated Gmail test account with
a newly changed message containing a harmless attachment, record the history
ID from before that change, and dispatch `G20 real Gmail provider evidence`
against the exact 40-character candidate SHA. The protected
`gmail-provider-evidence` environment supplies the client, refresh credential,
topic, history ID, message ID, and attachment ID as secrets. The separately
reviewed evidence reference must cover the actual OAuth consent/readonly scope
and authenticated Pub/Sub delivery to the deployed callback. The workflow then
uses the real refresh credential and Gmail API to prove profile, non-empty
history interval, normalization, attachment fetch, and `users.watch`, and
uploads only a sanitized exact-head JSON artifact. A missing, failing,
different-head, or mock-only run is explicitly insufficient for Issue #65.
