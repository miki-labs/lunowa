# R90 Public-beta readiness

Status date: 2026-09-10

`PUBLIC_BETA_READY: NO`

`PRIVATE_TEST_BETA_ALLOWED: YES`

This file records Product-side release facts. It does not authorize a public launch. `miki-labs/lunowa-site` owns public home/privacy/support implementation, and external provider approval remains external evidence.

## Current release decision

The accepted v1 Product loop may continue with explicitly authorized Google test users. Public Google-account availability remains blocked until every material R90 item below is evidenced.

Do not weaken OAuth, data, secret, backup, or provider-effect controls to make a preview look production-ready.

## Provider scope and publication

The application requests exactly:

- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`

The readonly scope is Restricted and the send scope is Sensitive under current Google policy. The server stores/processes Gmail data, so public use of the Restricted scope requires the applicable Google verification path and, where Google requires it, the restricted-scope security assessment.

Current action:

1. Keep the Google project in Testing while private/test-user beta is used.
2. Keep production/test OAuth clients and redirect URIs separated before public submission.
3. Complete Google branding/domain/support/privacy/demo evidence before requesting verification.
4. Record verification/security-assessment completion only from current provider evidence.

## Data and backup

Current Neon observation and restore proof on 2026-09-10:

- project: `lunowa-preview`;
- PostgreSQL 18;
- point-in-time history retention: 6 hours;
- automatic snapshot schedules are not enabled for this project/plan;
- manual snapshot `r90-restore-proof-2026-09-10` was created and restored through Neon;
- Neon finalized the restore by atomically swapping the restored branch into `main` and preserving the pre-restore branch as `pre-r90-restore-2026-09-10`;
- the restored `main` and preserved pre-restore branch had identical schema and identical row-count/max-update evidence across user, session, connected account, conversation, message, Responsibility, Draft and SendOperation tables.

Authoritative production-data restore is therefore **directly verified**. The current plan cannot create an automatic snapshot schedule, so while public release remains NO-GO, private/test beta uses the verified provider restore path plus manual release snapshots and the available PITR window. Re-check backup capability immediately before any later public cutover.

Product-account deletion/privacy statements must include realistic backup and downstream-processor behavior. Do not promise immediate erasure from backups unless the actual provider lifecycle supports and verifies that claim.

## Provider-effect abuse containment

A new immediate SendOperation is admitted only after trusted session/account/draft checks. R90 additionally bounds new provider-effect identities per user and connected mailbox:

- maximum 20 new SendOperations in any 10-minute window;
- maximum 100 new SendOperations in any 24-hour window.

Admission locks the connected-account row before counting and creating a new operation, so concurrent requests cannot race through the bound. Re-reading an already admitted immutable draft snapshot still converges on the existing operation and is not turned into a new send identity.

A limit breach returns HTTP 429 before Gmail dispatch.

These limits are public-beta safety ceilings, not pricing/entitlement semantics.

## Observability

Cloudflare Workers Logs are explicitly enabled in `wrangler.jsonc` with full head sampling for the current low-traffic beta stage.

Scheduled Gmail, Send and Temporal reconciliation emits only bounded operational counts and status. It must not log message bodies, addresses, tokens, credentials, draft content or other mailbox content.

A post-deploy release check must confirm the exact deployed Worker actually emits and retains invocation/error logs in the intended Cloudflare account.

## AI data-control boundary

The application requests OpenAI Responses with `store: false`, but that request option is not treated as proof of Zero Data Retention.

Production AI email-content execution fails closed when the configured data-control mode is `UNVERIFIED`. The deployed Worker secret inventory observed on 2026-09-10 contains no `OPENAI_API_KEY`. Current production source also has no application route/worker owner invoking the AI runtime. Production email-content AI is therefore outside the current release surface rather than running under an assumed retention mode.

Before any later public AI activation, verify the exact OpenAI organization/project retention posture and deployed model/config, then record only that verified mode. Manual drafting remains the accepted fallback.

## Incident and credential recovery

For a material incident, prefer containment before repair:

1. stop or narrow the affected public/provider path;
2. preserve exact release/operation identifiers and non-sensitive logs;
3. revoke/rotate the affected credential through its owning provider;
4. reconcile Gmail Send/sync state from provider truth rather than blind replay;
5. restore data only through an isolated, tested database recovery path;
6. deploy a reviewed fix traceable to an exact source revision;
7. verify recovery before restoring broader access.

Never put recovery codes, API keys, OAuth client secrets, encryption keys or database credentials in this repository or coding-agent evidence.

Critical control planes to verify outside routine agent context before public beta:

- GitHub/source-control recovery and MFA;
- Cloudflare account/Worker/domain recovery and MFA;
- Neon organization/project recovery and database credentials;
- Google Cloud/OAuth project recovery and contacts;
- domain registrar/DNS recovery;
- OpenAI organization/project recovery if AI is activated.

## Release disposition

`PUBLIC_BETA_DECISION: NO_GO`

`PRIVATE_TEST_BETA_DECISION: GO`

Public exposure is deliberately not authorized because Google production OAuth verification/restricted-scope assessment and production home/privacy/support/OAuth-branding evidence are not complete. Post-deploy Workers Logs receipt and final production source/deployment binding are also release-action checks rather than reasons to widen access now.

The current release scope is explicitly reduced to owner-authorized Google test users. OpenAI email-content execution is not activated. Neon restore has been directly verified. Critical account/MFA/recovery material remains outside the repository by design and must be operator-checked before a later public cutover.

R90 can close on this bounded NO-GO/GO decision: v1 is allowed to proceed as a private/test-user beta, while public beta remains a separate explicit release action that must fresh-revalidate Google, site, backup, observability and control-plane evidence.
