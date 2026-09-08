# Gmail provider operations

G20 establishes the Gmail read-only Source lane; G51 extends the same mailbox
authorization boundary with explicit Gmail Send capability. Gmail authorization
remains separate from the Better Auth application session and never grants
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

Current v1 requests exactly `https://www.googleapis.com/auth/gmail.readonly`
and `https://www.googleapis.com/auth/gmail.send`. Read authority remains required
for Source/monitoring; Send is a separate `mail_send` capability and is checked
again immediately before dispatch. The flow requests offline access because watch
renewal and reconciliation run without an active browser session. Reconnect uses
the same authorization path. No broader Gmail scope is requested.

## Pub/Sub and scheduling

Configure the push subscription to call:

```text
POST /api/providers/gmail/pubsub
```

Use authenticated push with the exact audience and service account configured
by `GMAIL_PUBSUB_AUDIENCE` and `GMAIL_PUBSUB_SERVICE_ACCOUNT`. The endpoint
verifies the Google OIDC signature/claims, durably deduplicates the delivery,
and acknowledges without treating its `historyId` as Source truth.

`infra/gmail-pubsub` is the deployable owner for the topic, Gmail publisher
grant, authenticated subscription, callback identity, OIDC audience, Pub/Sub
service-agent token-creation grant, and delivery retry policy. Apply that
module in the Google Cloud project before calling `users.watch`; its outputs
map directly to the three public Pub/Sub application variables.

The Cloudflare Worker entry point is bound to `*/10 * * * *` in
`wrangler.jsonc`. Each scheduled event invokes the same reconciliation owner
as the authenticated recovery endpoint below. `GMAIL_WORKER_SECRET` protects
manual/control-plane invocation of that endpoint; it is not the scheduler:

```text
POST /api/internal/gmail/reconcile
```

Each invocation enqueues accounts whose safety reconciliation or watch renewal
is due, then drains bounded work. The recurring trigger repairs a missed prior
trigger independently of push, while durable signal retry/backoff repairs
provider or processing failures. Source upserts are idempotent and the history
cursor advances with compare-and-set only after required evidence writes
commit.

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
- HTML-only body evidence is allowlist-sanitized. Filename-less externalized
  `text/plain`/`text/html` parts are fetched within a 2 MiB bound and are not
  represented as user attachments. Unsupported body/address forms are stored
  as explicit bounded normalization metadata instead of blocking the cursor.
- Gmail `SENT` label evidence determines outbound direction for account aliases;
  primary-address equality remains only a fallback.
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
invariants, including rollback-before-`CONNECTED`, to the exact pull-request
head on PostgreSQL 18.6. The unit gate also asserts the committed cron and
Pub/Sub IAM bindings. An actual Cloudflare deploy and Terraform apply remain
external runtime evidence, not facts inferred from those assertions.

Mocks and PostgreSQL do not establish provider acceptance. Before accepting a
candidate, a trusted operator must prepare a dedicated Gmail test account with
a newly changed message containing a harmless attachment, record the history
ID from before that change, and dispatch `G20 real Gmail provider evidence`
against the exact 40-character candidate SHA. The protected
`gmail-provider-evidence` environment supplies the client, refresh credential,
topic, history ID, message ID, and attachment ID as secrets. The separately
reviewed, durable evidence reference must let the trusted reviewer inspect the
actual app OAuth connect/callback ciphertext boundary, readonly consent,
applied Terraform plan, authenticated Pub/Sub delivery to the deployed
callback, and an observed scheduled safety/renewal invocation. A supplied
reference string alone establishes none of those claims. The workflow then
uses the real refresh credential and Gmail API to prove profile, non-empty
history interval, normalization, attachment fetch, and `users.watch`, and
uploads only a sanitized exact-head JSON artifact. A missing, failing,
different-head, mock-only, pre-provisioned-token-only, or uninspectable run is
explicitly insufficient for Issue #65.
## G51 vendor recheck — 2026-09-08

Current Google Gmail API documentation was rechecked before G51 acceptance.
`users.messages.send` remains the direct send method; the `Message.raw` payload is
a base64URL-encoded RFC-formatted message. Adding a message to an existing
thread still requires the requested `threadId`, RFC-compliant `References` and
`In-Reply-To` headers, and a matching `Subject`. Lunowa requests only
`https://www.googleapis.com/auth/gmail.send` for Send authority in addition to
its separately owned read scope.

Google's current Gmail error guide recommends exponential backoff for rate-limit
and server errors, but also states that mail sending has separate per-user
limits and that a successful HTTP response alone is not proof that the message
was successfully sent. Gmail quota tiering also changed in 2026. G51 therefore
does not encode stale fixed quota numbers and deliberately does **not** apply a
generic blind retry policy to a possibly accepted Send. A transport/server
ambiguity remains `AMBIGUOUS` until stable Message-ID/provider reconciliation
proves the outcome.

Primary references checked on 2026-09-08:

- https://developers.google.com/workspace/gmail/api/guides/sending
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send
- https://developers.google.com/workspace/gmail/api/auth/scopes
- https://developers.google.com/workspace/gmail/api/guides/handle-errors
- https://developers.google.com/workspace/release-notes

## G51 real Gmail Send acceptance

G51 provider acceptance is deliberately separate from ordinary `pnpm verify`.
Deterministic PostgreSQL/UI tests prove the Lunowa request -> durable
SendOperation -> Source -> Responsibility composition, but they cannot prove
that Gmail places a real Reply or Reply All in the intended provider thread.

`pnpm accept:gmail-real-send` exercises one explicit provider lane per process.
It requires `G51_REAL_LANE=REPLY` or `REPLY_ALL` and
`G51_REAL_MODE=SEND_ONCE` or `RECONCILE_ONLY`. `SEND_ONCE` additionally requires
`G51_ALLOW_REAL_SEND=YES`; without that exact value the process stops before a
provider client is constructed. The declared candidate SHA must match the clean checkout actually executing the
harness before provider credentials are constructed. A local durable effect marker is
atomically written before `messages.send` and is scoped to the exact candidate/lane,
so changing the run ID cannot admit a second provider attempt on that controller
host. After any ambiguous outcome, only `RECONCILE_ONLY` is permitted; it must use
the run ID bound by the durable claim, searches the stable RFC822 Message-ID, and
never calls `messages.send`.

The prepared source must be an inbound message in a dedicated harmless test
thread. Provider `From` / `To` / `Cc` headers are parsed as RFC mailbox lists rather
than matched as raw substrings. Every target address must be both exactly
provider-observed in that source and present in the explicit
`G51_REAL_ALLOWED_RECIPIENTS_JSON` allowlist; the connected account is never a
target. Reply must target the exact observed sender. Reply All must retain that
sender and exercise at least one additional observed recipient. Bcc is never
accepted by this harness.

A lane passes only after Gmail is read back and confirms the expected thread,
stable Message-ID, In-Reply-To, References chain, Subject, exact To/Cc mailbox
sets, and no Bcc target. Evidence output contains the exact candidate SHA and external evidence
reference but hashes provider/thread identities and emits no credentials,
recipient addresses, mailbox content, or raw MIME. Both Reply and Reply All
must PASS against the same exact candidate before G51 may claim its real Gmail
threading acceptance. Real sends require an explicit trusted-operator approval;
this harness is not part of unattended CI or cron execution.
