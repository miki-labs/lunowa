# Lunowa System Contracts

## Status

**Accepted logical module contracts, reconciled 2026-08-28 for the one-provider Minimum Complete Delegation Loop and Issue #58 dependency ownership.**

These contracts isolate provider/model/job/UI implementation from Product/domain authority. Concrete API/SDK syntax remains implementation-open. Current activation/dependency authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`.

## 1. Contract principles

1. External data enters through validated adapters.
2. Core contracts use Lunowa concepts, not vendor SDK types.
3. Evidence, interpretation, accepted state, safe action and UI projection remain distinct.
4. Background work reloads/re-authorizes/revalidates current state before effects.
5. External effects define durable idempotency/reconciliation at the application/domain boundary.
6. Stale evidence/model/job results cannot win because they finish last.
7. Search/read models resolve to current authorized sources.
8. Current v1 activates only contracts required by the one-provider complete loop.
9. Production FK targets must exist as accepted production tables before referencing migrations can pass.

## 2. Application session contract

Application identity/session is independent from mailbox authorization.

```text
AppSession {
  user_id
  session_id
  expires_at
}
```

Server-side BFF/route handling revalidates session/authorization for protected reads/writes. App sign-out does not disconnect a mailbox or resolve/stop Responsibilities.

G10 owns app-auth User/session production schema only.

## 3. Provider-neutral Source persistence contract — G19

G19 is the single production writer for provider-neutral Source/account persistence after G10 + P13 PASS.

Minimum durable ownership:

```text
ConnectedAccount
ProviderSyncState
Conversation
Message
Attachment metadata
```

Required invariants include the P13-proven L2 upstream prerequisites, including where applicable:

```sql
connected_accounts UNIQUE (id, user_id)
conversations UNIQUE (id, connected_account_id)
messages UNIQUE (id, connected_account_id)
```

and monotonic non-negative `Conversation.semantic_evidence_revision`.

At minimum:

```text
(connected_account_id, provider_message_id)
```

is unique.

G19 repositories and deterministic fixtures are provider-neutral. They may be exercised without Gmail. G19 contains no Responsibility-owned production table and no live Gmail OAuth/watch/history behavior.

A production migration may never satisfy its FK dependency using a proof-only fixture table.

## 4. Connected-account / credential contract

```text
connectAccount(auth_result) -> ConnectedAccountConnection
```

Minimum result:

```text
provider_account_id
email_address
display_name?
granted_capabilities
credential_reference
initial_sync_hint?
```

Requirements:

- verify provider identity from provider evidence;
- keep mailbox credentials server-side and outside normal browser APIs;
- mailbox credential authority is Lunowa-owned, not auth-library social-account authority;
- distinguish reconnect-required from transient failure;
- capability absence disables only the corresponding capability.

Before a real Google token is durably stored:

- encrypt/store it securely at rest;
- keep cryptographic key/secret outside ordinary application DB/repository data;
- never log token values;
- lookup/use requires current authenticated user + ConnectedAccount ownership;
- handle invalidation/revocation as explicit integrity/reconnect state;
- revoke/delete when intentionally removed where supported.

A non-persistent protocol spike may avoid durable token storage. Plaintext durable storage is never an accepted transitional contract.

## 5. Provider capability contract

```text
ProviderCapabilities {
  incremental_sync
  thread_identity
  attachment_fetch
  message_send
  mark_read? archive? trash? spam?
  draft_sync?
  schedule_send_native?
  contact_lookup?
}
```

Capability presence does not activate a Product feature. Current v1 requires Source read, attachment evidence access and contextual immediate Send. Forward/Send Later/etc remain inactive unless separately accepted.

## 6. Gmail synchronization contract — G20

G20 consumes G19 persistence and owns live Gmail OAuth/watch/history/provider behavior.

```text
syncAccount(connected_account_id, reason) -> SyncResult
```

Reasons include:

```text
INITIAL_SYNC
PUSH_SIGNAL
PERIODIC_RECONCILIATION
USER_REFRESH
RECONNECT
FULL_RESYNC
```

Required sequence:

```text
authorize account
-> fetch provider changes
-> normalize untrusted payload
-> idempotent upsert through G19 repositories
-> commit Source/evidence revision
-> enqueue downstream reconsideration
-> advance provider cursor after required local durability
```

### Push ingress

Gmail `users.watch` / Pub/Sub notification is a reconciliation signal, not mailbox/domain truth.

Production ingress:

- authenticate push and validate expected audience/identity claims as applicable;
- acknowledge valid request quickly;
- defer non-trivial work to durable execution;
- tolerate duplicate/delayed/dropped notifications;
- periodically reconcile even with no push;
- renew watch before provider expiration.

### Stale history recovery

Invalid/stale `startHistoryId` / HTTP 404 enters explicit full-sync recovery. It never becomes empty/current truth.

### Semantic chronology / history activation

Worker order is not semantic chronology. Preserve source semantic time/relation evidence. Initial historical ingestion never automatically activates every unresolved-looking thread as live work.

## 7. Normalized Source contract

Provider adapters normalize into a vendor-free Source shape such as:

```text
NormalizedProviderMessage {
  provider_message_id
  provider_thread_id?
  sender
  recipients[]
  cc[]
  bcc[]?
  subject
  text_body?
  sanitized_html_source?
  timestamp
  mailbox_state?
  attachments[]
  minimal_provider_metadata
}
```

Provider HTML/body/attachment bytes remain untrusted. Source remains readable without Responsibility/Moment.

This normalized contract is frozen enough for deterministic Responsibility fixture work. G31 may consume it without live G20/G21 completion.

## 8. Attachment evidence access

Current CORE:

- preserve attachment existence/metadata/provenance;
- authorize every access;
- safe fetch/stream/open/download/provider fallback;
- distinguish provider/security restriction from local preview failure;
- preserve Source/Moment context.

Rich native preview and reply attachment-add remain conditional. Access/preview is not completion evidence.

## 9. Exact Source search

```text
searchSource(user_id, request) -> SearchResultPage
```

Requirements:

- V1 CORE exact/deterministic retrieval over authorized Source;
- current user/account/scope authorization;
- truthful no-match retaining enough query/scope context to revise;
- stale derived index may reduce recall but never leak inaccessible data;
- semantic/NL Q&A advertised only when separately active;
- similarity never authorizes Responsibility identity merge.

## 10. AI Responsibility-interpretation contract

Only current authorized normalized context enters the model.

Conceptual input:

```text
InterpretationInput {
  schema_version
  behavior_config_version
  evidence_revision
  locale
  timezone
  focal_message_id?
  conversation_context
  existing_responsibility_context[]?
  authorized_external_context[]?
}
```

Output is structured **candidate interpretation**, never accepted state:

```text
InterpretationOutput {
  schema_version
  basis_evidence_revision
  communication_acts[]
  communicated_claims[]?
  proposed_terms[]?
  no_responsibility_signal?
  uncertainty[]?
}
```

Validate runtime schema, current authorization, source IDs/participants, deterministic provider facts, material values/source locators where practical, cross-account boundaries and evidence-revision freshness.

AI is not authoritative for auth, provider facts, Responsibility admission/identity/effects, tracking/defer, Temporal effects, send permission or external actions.

## 11. Contextual AI draft contract

V1 CORE-target assistance is separate from Responsibility interpretation.

```text
requestContextualDraft(DraftAssistInput) -> DraftCandidate
```

Candidate body is editable text, not a send command. Effective sender/recipient authority comes from trusted application/provider state, not model output. The model cannot add hidden recipients or execute provider actions. User explicitly reviews/commits Send. Manual composer remains baseline when assistance fails.

Drafting and Responsibility interpretation use separate schemas/evals even if transport/runtime is shared.

## 12. AI data-control contract

Before production email AI use:

- record current project/org retention/data-control mode;
- minimize authorized context;
- use `store:false` where appropriate;
- do not describe `store:false` as equivalent to Zero Data Retention;
- avoid indiscriminate raw mail/prompt/output logging;
- if ZDR is required, verify actual eligibility/settings/endpoint-feature compatibility.

## 13. Responsibility reduction contract

```text
reduceResponsibilityEvidence(
  current_responsibilities,
  evidence_event,
  policy_context
) -> ResponsibilityDecision
```

Admission:

```text
TRACK
DO_NOT_TRACK
NEEDS_REVIEW
```

Effects:

```text
CREATE
UPDATE
RESOLVE
REOPEN
SUPERSEDE
INVALIDATE
NO_OP
```

One evidence event may produce multiple effects. Reducer preserves canonical orthogonal dimensions, field-scoped authority and provenance. The obsolete single lifecycle enum never returns as truth. Historical evidence-relative OPEN does not imply live tracking.

## 14. Product projection contract

```text
projectConversationAttention(responsibilities[]) -> ConversationAttention
```

Possible UI projection:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

Only appropriate live Responsibilities participate in current-work projection. Newest message is not status authority. Projection is deterministic/rebuildable.

## 15. Temporal Contract

Persisted contract/trigger is durable intent; scheduler/job run is execution.

```text
upsertTemporalContract(responsibility_id, spec, actor)
processTemporalTrigger(trigger_id)
```

On fire:

1. load current trigger/contract/Responsibility/evidence;
2. verify active/current version;
3. claim through domain/DB idempotency;
4. re-evaluate current evidence;
5. persist domain/attention/audit effects;
6. fire/cancel/supersede trigger state;
7. reconcile stale sibling triggers.

Trigger fire != notification/MY_TURN automatically.

If Trigger.dev is used, key composition/scope/TTL is explicit and vendor idempotency is never the sole guarantee. Every run rechecks DB/domain currentness.

## 16. Product read-model contract

Read models distinguish:

- app session/auth;
- mailbox connection/capability;
- sync/integrity/data-through;
- accepted Responsibility projection;
- pending/failed/ambiguous mutation/effect;
- Source/provenance.

Partial/degraded/untrusted coverage cannot become true zero. UI components/read models never create domain authority.

## 17. Draft contract — G50

```text
saveDraft(draft_id?, expected_version?, payload) -> Draft
```

Requirements:

- authorize sender/account;
- validate recipients/accepted attachments;
- version/conflict handling or equivalent;
- idempotent autosave where used;
- preserve draft across relevant navigation/layout/re-auth recovery;
- explicit discard distinct from pane close.

## 18. Immediate SendOperation contract — G50/G51

G50 owns minimal request/pending schema; G51 owns provider dispatch/reconciliation transitions.

```text
requestImmediateSend(draft_id) -> SendOperation
```

SendOperation distinguishes request/pending/dispatch/provider-unknown/provider-accepted/failed/reconciled truth. G50 establishes durable operation identity/idempotency and intended draft snapshot. No delayed-send scheduling schema is implied.

G51 dispatch sequence:

1. claim through application/domain idempotency;
2. re-authorize current account capability;
3. validate intended draft snapshot;
4. call provider adapter;
5. record unambiguous/ambiguous result;
6. reconcile sent Source evidence where required;
7. feed sufficient evidence to Responsibility reducer.

Invariant:

```text
Send request != provider acceptance != operational closure
```

Timeout/unknown acceptance forbids blind duplicate retry.

Forward, Send Later/SCHEDULED, generic Undo/recall and silent offline queued Send are not current activation authority.

## 19. Settings/lifecycle mutations

Reconnect, disconnect, Stop Tracking, Return Attention, defer and supported Settings distinguish request/pending/accepted/failure.

App sign-out != mailbox disconnect. Reconnect after unintended auth loss restores reassurance only after missing-interval reconciliation. Re-add after intentional disconnect never silently reactivates old delegation.

## 20. Integrity contract

Material degraded state exposes as applicable:

- affected account/capability/scope;
- what is not trustworthy;
- last trustworthy observation/data-through;
- affected live delegation scope/count;
- what remains safe/usable;
- recovery action.

Do not restore healthy Managed reassurance before reconciliation completes.

## 21. Audit/observability

Keep structured evidence sufficient to explain state changes, resurfacing, sync/send/trigger pending/reconciliation, account/provider identity, evidence revision/model/config basis and degraded intervals.

Logs are not canonical state. Never indiscriminately log secrets/full sensitive mail/model payloads.

## 22. Public-release boundary

Local/private complete-loop proof and public release are separate gates.

Public release may additionally require Google OAuth verification/security assessment, exact privacy/retention/deletion commitments, production credential rotation/recovery operations, current AI data controls and operational hardening.

Those release obligations do not establish Product-market evidence.
