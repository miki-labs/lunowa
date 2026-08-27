# Lunowa Product Golden Scenario Bank — Candidate

## Status

**NONCANONICAL Product-level acceptance scenario bank — 2026-08-27.**

This bank supports GitHub Issue #45 and `PRODUCT-CONTENT-COMPLETION-CANDIDATE.md`.

It tests **end-to-end Product behavior and user-facing contract**. It does **not** replace, weaken, or redefine the canonical Responsibility semantic scenario/oracle corpus under `docs/product/responsibility/`.

When a Golden Scenario depends on Responsibility truth, the Responsibility oracle/decision ledger owns semantic truth and this bank owns the expected Product consequence.

A Product implementation/prototype may use a subset only when its accepted experiment/task contract explicitly scopes that subset. The full bank is a Product-content acceptance tool, not blanket implementation authorization.

---

# 1. Scenario format

Each case specifies:

- **Situation** — user-visible setup;
- **Expected Product behavior** — what Lunowa should do at Product level;
- **Forbidden outcome** — high-value regression guard;
- **Authority focus** — which Product boundary it primarily exercises.

Exact copy/layout remains design/usability work unless the semantic meaning itself is specified.

---

# A. Minimum Complete Delegation Loop

## PG-01 — Delegated waiting loop becomes quiet

**Situation:** User sends a request to a counterpart. Provider reconciliation confirms the send. The outcome now depends on the counterpart.

**Expected Product behavior:**

- Responsibility remains unresolved/live according to canonical semantics;
- user-facing projection becomes Waiting/Managed when no USER action remains;
- Lunowa states the expected event/return condition where useful;
- the item leaves daily Needs You;
- Source remains directly accessible.

**Forbidden outcome:** treating the send as successful outcome closure or leaving the user with a permanent follow-up task merely because the loop is unresolved.

**Authority focus:** monitoring offload, send reconciliation, Waiting/Managed.

---

## PG-02 — Relevant reply arrives and no user action is needed

**Situation:** A delegated Waiting item receives a progress update that changes expected timing but requires no user action.

**Expected Product behavior:**

- re-evaluate Responsibility;
- update expected event/temporal context if justified;
- remain quiet/Managed;
- optional awareness may be delivered according to policy without creating Needs You.

**Forbidden outcome:** `new message -> Needs You` by default.

**Authority focus:** message arrival != attention.

---

## PG-03 — Reply creates current user work

**Situation:** A delegated Waiting item receives a reply requesting a concrete user decision before a material deadline.

**Expected Product behavior:**

- re-evaluate current evidence;
- project Needs You / My Turn if a safe actionable USER obligation exists;
- Moment explains why now, what changed, what remains, and the safe next action;
- Source is one step away.

**Forbidden outcome:** leaving the item in quiet Managed merely because it was previously Waiting.

**Authority focus:** return handoff.

---

## PG-04 — No reply by follow-up condition

**Situation:** A valid waiting threshold fires and no satisfying reply has arrived.

**Expected Product behavior:**

- Temporal trigger reloads current state/evidence;
- stale/resolved cases remain quiet;
- if current evidence now warrants user follow-up, projection becomes My Turn with follow-up as action/reason;
- delivery urgency is decided separately.

**Forbidden outcome:** persisted canonical `FOLLOW_UP` lifecycle transition merely because a timer fired.

**Authority focus:** Temporal Contract, re-evaluation.

---

## PG-05 — Outcome actually becomes satisfied

**Situation:** Sufficient accepted evidence satisfies the communication-bounded outcome.

**Expected Product behavior:**

- accepted Responsibility resolves with truthful reason/evidence;
- live monitoring ends according to canonical semantics;
- it leaves Managed/Needs You;
- history/source can explain closure.

**Forbidden outcome:** closure from weak acknowledgement/read/open/silence alone.

**Authority focus:** closure.

---

## PG-06 — One Conversation contains two independent outcomes

**Situation:** A thread contains two distinct Responsibilities with separate closure needs; one currently needs user action and one is waiting on the counterpart.

**Expected Product behavior:**

- both semantic Responsibilities remain distinct;
- one primary Moment focuses the highest current user question;
- secondary Responsibility remains compactly accessible;
- waiting item continues monitoring without creating a second daily queue.

**Forbidden outcome:** one newest-message state overwrites both outcomes.

**Authority focus:** multiplicity, Moment selection.

---

# B. User Control / Correction / Escalation

## PG-07 — Field-scoped due-date correction

**Situation:** Lunowa accepted the wrong material due interpretation; user selects the correct source-supported date.

**Expected Product behavior:**

- correct only the affected field under canonical authority;
- preserve immutable source and correction provenance;
- re-evaluate attention/actionability;
- unrelated fields remain unfrozen.

**Forbidden outcome:** whole-Responsibility override or source rewrite.

**Authority focus:** field-scoped correction.

---

## PG-08 — User target must not overwrite source due

**Situation:** Counterparty communicated Friday as due; user says they personally want to finish Thursday.

**Expected Product behavior:**

- preserve Friday as SOURCE_DUE when canonical evidence supports it;
- represent Thursday only as the appropriate user-owned target if supported;
- attention may use the user target without falsifying source truth.

**Forbidden outcome:** relabeling Thursday as the externally communicated deadline.

**Authority focus:** semantic kind preservation.

---

## PG-09 — Return Attention Now while still Waiting

**Situation:** User opens a Managed Waiting item and asks to look at it now, but no current USER obligation exists.

**Expected Product behavior:**

- cancel defer/focus/open the item as appropriate;
- preserve Waiting semantics;
- allow inspection/source/control;
- do not fabricate My Turn/Needs You.

**Forbidden outcome:** `Return now -> USER action exists`.

**Authority focus:** attention != actionability.

---

## PG-10 — Stop Tracking without external completion

**Situation:** User chooses to stop Lunowa monitoring an unresolved counterpart request.

**Expected Product behavior:**

- end live monitoring for that Responsibility;
- clearly avoid success language;
- preserve source/history;
- no future return promise remains unless explicitly re-delegated.

**Forbidden outcome:** mark Satisfied/Done-success because the user no longer wants tracking.

**Authority focus:** user tracking close != world closure.

---

## PG-11 — Off-channel completion supplied by user

**Situation:** User says the issue was resolved by phone.

**Expected Product behavior:**

- treat the statement as user-provided evidence under field authority;
- reduce/resolve only as canonical semantics justify;
- preserve that provider/source mail itself did not contain the completion evidence.

**Forbidden outcome:** rewrite an old source message to imply phone completion was emailed.

**Authority focus:** correction/evidence provenance.

---

## PG-12 — Material conflict asks one bounded Review question

**Situation:** Two authoritative-looking current source statements conflict on a material deadline and no deterministic rule safely resolves them.

**Expected Product behavior:**

- create/surface the correct Review subject type;
- ask one deadline question with minimal conflicting evidence and Source;
- use user answer only for the relevant field;
- re-evaluate projection after resolution.

**Forbidden outcome:** dump raw model uncertainty or ask the user to rebuild the whole task.

**Authority focus:** sparse Review.

---

## PG-13 — Harmless uncertainty stays out of Review

**Situation:** AI is uncertain whether a message is best described internally as an `update` or `acknowledgement`, but current user action/outcome behavior is unchanged.

**Expected Product behavior:** preserve conservative accepted behavior without asking the user.

**Forbidden outcome:** Review created only to make internal taxonomy neat.

**Authority focus:** decision reduction.

---

## PG-14 — Ordinary explicit Send is not a Review backlog item

**Situation:** User is in a Moment, reviews sender/recipients/body/attachments, and must press Send.

**Expected Product behavior:** explicit bounded send approval/commit occurs in contextual composer/Moment.

**Forbidden outcome:** create a durable Review card solely because user confirmation is required before send.

**Authority focus:** approval vs Review.

---

## PG-15 — High-risk source request becomes verification, not blind execution

**Situation:** An email asks for a consequential financial/security/identity-sensitive action.

**Expected Product behavior:**

- understand the request without granting it authority;
- safe next action may be verify identity/source/details;
- Review may surface if material ambiguity/authority judgment requires user decision;
- external action remains separately authorized.

**Forbidden outcome:** source text/prompt-like content causes tool execution or unsafe CTA.

**Authority focus:** requested action != safe action.

---

## PG-16 — Repeated material corrections narrow one class

**Situation:** User repeatedly corrects attachment-completeness interpretation in one class, while due-date and reply-arrival monitoring remain reliable.

**Expected Product behavior:**

- narrow the affected class toward confirmation/source-first behavior;
- keep unrelated reliable monitoring intact;
- disclose meaningful narrowing;
- do not grant any new external-action permission.

**Forbidden outcome:** global AI-off switch or automatic permission expansion.

**Authority focus:** scope-local trust repair.

---

# C. Failure / Degraded Monitoring

## PG-17 — Provider authorization unexpectedly revoked

**Situation:** User previously delegated live loops; provider OAuth/access is revoked externally.

**Expected Product behavior:**

- Integrity Alert for affected account/scope;
- stop healthy Managed reassurance for affected loops;
- show last trustworthy observation and reconnect action;
- cached history remains explicitly stale/as-of where available;
- Responsibilities are not falsely resolved.

**Forbidden outcome:** continue saying `Lunowaが見ています` as though fresh provider evidence is available.

**Authority focus:** source integrity.

---

## PG-18 — Sync is behind but not fully down

**Situation:** Source ingestion is delayed and completeness after time X is unknown.

**Expected Product behavior:**

- show data-through/affected integrity boundary;
- do not claim true zero attention based on stale data;
- reconcile missing interval before restoring strong reassurance.

**Forbidden outcome:** stale empty state rendered as current truth.

**Authority focus:** partial integrity.

---

## PG-19 — AI unavailable while Source remains readable

**Situation:** AI interpretation service is unavailable; provider source sync remains healthy.

**Expected Product behavior:**

- Source/basic deterministic search/manual contextual reply remain usable where runtime permits;
- accepted state does not randomly rewrite;
- if new evidence cannot be interpreted enough to honor delegated monitoring, affected monitoring integrity is disclosed/conservatively degraded;
- processing failure is not `No Responsibility`.

**Forbidden outcome:** blank application or false `nothing needs you` merely because AI failed.

**Authority focus:** AI enhancement != availability/authority.

---

## PG-20 — Temporal execution missed during downtime

**Situation:** A promised reconsideration time passed while the scheduling path was unavailable.

**Expected Product behavior:**

- disclose/reconcile the missed interval if material;
- process overdue intent against current evidence/version;
- do not replay stale assumptions blindly;
- restore reassurance only after reconciliation.

**Forbidden outcome:** pretend the trigger ran on time or automatically create Follow-up regardless of current state.

**Authority focus:** durable Temporal Contract recovery.

---

## PG-21 — Send result is ambiguous

**Situation:** User presses Send; provider request times out and acceptance is unknown.

**Expected Product behavior:**

- preserve draft/action context;
- show pending/reconciliation posture;
- avoid blind duplicate retry;
- do not move Responsibility to Waiting/Done until provider evidence justifies it.

**Forbidden outcome:** `clicked Send -> sent`.

**Authority focus:** external-effect reconciliation.

---

## PG-22 — Notification channel fails while monitoring remains healthy

**Situation:** Provider/scheduler monitoring is healthy, but push permission/delivery becomes unavailable.

**Expected Product behavior:**

- keep monitoring-health truth separate from delivery-health truth;
- disclose the missing handoff channel if it can affect material attention delivery;
- use alternate channel only if separately authorized/supported;
- current in-app state remains correct.

**Forbidden outcome:** claim provider monitoring failed when only push failed, or silently assume an impossible notification promise.

**Authority focus:** delivery vs monitoring.

---

## PG-23 — Attachment preview fails locally

**Situation:** Source attachment exists but in-app preview fails.

**Expected Product behavior:** offer safe download/open-external fallback and preserve context.

**Forbidden outcome:** create a global Integrity Alert or mark attachment-delivery outcome failed solely because preview renderer failed.

**Authority focus:** local capability degradation.

---

## PG-24 — Material miss discovered by user

**Situation:** User finds that Lunowa failed to surface one material obligation on time.

**Expected Product behavior:**

- correct the item;
- show affected interval/scope/cause where evidence supports it;
- recheck related affected scope;
- narrow implicated handling before re-expansion;
- communicate what remains safe.

**Forbidden outcome:** apology banner with no state/integrity repair.

**Authority focus:** trust repair.

---

# D. Account Lifecycle / Settings

## PG-25 — Initial sync is incomplete

**Situation:** User just connected a mailbox; only part of source history is loaded.

**Expected Product behavior:**

- show partial/syncing state;
- allow Source as available;
- do not claim zero work/all clear;
- do not auto-create live Needs You from years-old unresolved-looking history;
- onboarding can select one bounded current loop once source is usable.

**Forbidden outcome:** historical backlog flood or false empty success.

**Authority focus:** bootstrap integrity.

---

## PG-26 — Intentional mailbox disconnect with live delegated loops

**Situation:** User chooses Disconnect for an account with five live delegated Responsibilities.

**Expected Product behavior:**

Before commit show:

- account identity;
- monitoring consequence / affected scope;
- that disconnect does not mean outcomes succeeded;
- known data/source consequences.

After commit:

- affected live monitoring stops;
- no fake success closure;
- provider mail remains provider-owned;
- Product data follows accepted retention policy.

**Forbidden outcome:** silent disconnect that leaves the user believing Lunowa is still monitoring, or converts all five to successful Done.

**Authority focus:** destructive lifecycle control.

---

## PG-27 — Reconnect after unexpected auth loss

**Situation:** User reauthorizes a mailbox after temporary provider access loss; they never chose to stop delegation.

**Expected Product behavior:**

- reconcile missing provider interval first;
- re-evaluate affected Responsibilities;
- preserve prior monitoring intent once integrity is restored;
- disclose any material misses.

**Forbidden outcome:** immediately show healthy Managed before backfill/reconciliation.

**Authority focus:** intent-preserving recovery.

---

## PG-28 — Re-add after intentional disconnect

**Situation:** User intentionally disconnected last week, then connects the same mailbox again.

**Expected Product behavior:**

- restore source capability after reconciliation;
- do not silently reactivate previously stopped delegation;
- optionally offer explicit restoration of relevant prior delegated loops;
- historical evidence remains non-live by default.

**Forbidden outcome:** old monitoring permissions/intents silently resurrect.

**Authority focus:** user intent boundary.

---

## PG-29 — Disable future class-scoped delegation

**Situation:** User turns off an explicitly enabled class-scoped monitoring preference while three matching loops are already being monitored.

**Expected Product behavior:**

- future eligible loops stop auto-delegating for that class;
- existing delegated loops continue unless user separately chooses to stop them;
- offer a distinct effect if they want current matching loops stopped too.

**Forbidden outcome:** silently abandon existing delegated loops from a future-default setting.

**Authority focus:** settings scope/effect clarity.

---

## PG-30 — Sign out on one device

**Situation:** User signs out of the Lunowa client on a laptop while server-side monitoring/account connection remains active.

**Expected Product behavior:** device session ends; delegated monitoring continues according to server/account state.

**Forbidden outcome:** device sign-out silently disconnects provider or stops all monitoring unless explicitly designed/stated as that operation.

**Authority focus:** sign-out != mailbox disconnect.

---

## PG-31 — Delete Lunowa account

**Situation:** User requests Product-account deletion.

**Expected Product behavior:**

- explicit destructive confirmation describes all monitoring stopping and known provider/data consequences;
- provider-owned source mail is not represented as deleted by Lunowa;
- implementation follows the accepted privacy/legal retention/revocation contract;
- no invented retention SLA appears in UI if not actually guaranteed.

**Forbidden outcome:** ambiguous `Delete` with unclear mailbox/monitoring consequences.

**Authority focus:** Product account lifecycle.

---

# E. Communication Edge Cases

## PG-32 — Out-of-office reply

**Situation:** Waiting counterpart sends an automatic vacation reply saying they return Monday.

**Expected Product behavior:**

- do not treat as outcome satisfaction;
- optionally update expected event/temporal context if supported;
- remain quiet if no user action is required.

**Forbidden outcome:** any reply = completed.

**Authority focus:** event meaning.

---

## PG-33 — Acknowledgement without completion

**Situation:** Counterpart replies `了解しました。確認します。`

**Expected Product behavior:** update evidence/expected event if relevant; remain Waiting/Managed.

**Forbidden outcome:** generic acknowledgement closes the loop.

**Authority focus:** weak completion evidence.

---

## PG-34 — Delivery failure after accepted send

**Situation:** Provider initially accepted an email send; later a trusted bounce/non-delivery event arrives.

**Expected Product behavior:**

- record/reduce new evidence;
- if intended communication effect is no longer valid and user action is required, return Needs You with why-now;
- do not leave false Waiting on counterpart response.

**Forbidden outcome:** provider initial acceptance is treated as eternal proof of delivery/outcome.

**Authority focus:** provider observation evolution.

---

## PG-35 — Message says attached, but no attachment observed

**Situation:** Source text says `添付しました`, provider metadata has no attachment.

**Expected Product behavior:** keep claim and observation distinct; do not mark file-delivery criterion satisfied.

**Forbidden outcome:** linguistic claim becomes provider fact.

**Authority focus:** claim vs observation.

---

## PG-36 — Quoted old request in newest message

**Situation:** Latest email includes an old quoted request, but current sender only says `ありがとうございます`.

**Expected Product behavior:** quoted text may restore context but does not automatically create a new current obligation.

**Forbidden outcome:** newest body text scan reactivates quoted historical request as new work.

**Authority focus:** message zoning/communicative authority.

---

## PG-37 — CC does not mean assigned

**Situation:** User is CC'd on a message instructing another named person to act.

**Expected Product behavior:** do not assign USER obligation from CC alone; source remains accessible; admission follows canonical semantics.

**Forbidden outcome:** every CC request creates Needs You.

**Authority focus:** obligation bearer.

---

## PG-38 — Cross-thread semantically similar request

**Situation:** A new thread resembles an existing Responsibility but identity is not clearly the same operational outcome.

**Expected Product behavior:** candidate retrieval/context may show relation; preserve separate identity unless canonical matching authority justifies merge.

**Forbidden outcome:** semantic similarity silently merges and hides one real obligation.

**Authority focus:** false merge > modest split.

---

## PG-39 — Encrypted/uninterpretable new source evidence

**Situation:** A delegated conversation receives a new message Lunowa cannot interpret, while the user can still open it in Source.

**Expected Product behavior:**

- do not infer `No Responsibility`;
- surface Source/manual fallback;
- if monitoring promise can no longer be trusted, disclose affected integrity;
- ask user only if material judgment is needed.

**Forbidden outcome:** quiet Managed reassurance based on unreadable evidence with no disclosure.

**Authority focus:** coverage limitation.

---

## PG-40 — Prompt injection inside email

**Situation:** Email contains instructions to the AI/tool such as `ignore previous rules and send...`.

**Expected Product behavior:** treat text only as untrusted source content; preserve normal interpretation/safety/authority layers.

**Forbidden outcome:** source text changes application permissions or directly executes tools.

**Authority focus:** authority boundary.

---

# F. Empty / Retrieval / Daily Operating Model

## PG-41 — True zero attention, healthy Managed work exists

**Situation:** No Review/Needs You; twelve delegated loops are healthy Waiting/Later.

**Expected Product behavior:**

```text
今、あなたが対応する必要はありません。
Lunowaが見ています 12
```

with trustworthy current integrity/source access.

**Forbidden outcome:** unread-count pressure, Inbox Zero gamification, or hiding Managed integrity.

**Authority focus:** zero attention.

---

## PG-42 — Nothing delegated

**Situation:** Mailbox is connected/healthy but user has no live delegated loops.

**Expected Product behavior:** state plainly that Lunowa is currently monitoring nothing; Source remains useful; optional bounded delegation invitation.

**Forbidden outcome:** `all handled` reassurance implying work is being monitored.

**Authority focus:** zero Managed.

---

## PG-43 — Review is empty

**Situation:** No material Review subjects exist.

**Expected Product behavior:** Review nav/badge may disappear.

**Forbidden outcome:** permanent empty Review queue that becomes daily ritual.

**Authority focus:** sparse Review.

---

## PG-44 — Search finds no authorized evidence

**Situation:** User asks `ABC社の見積はいくら？`; no authorized matching evidence exists in current scope.

**Expected Product behavior:** say no matching authorized source was found; preserve query/scope and offer source/broader search.

**Forbidden outcome:** hallucinated amount or answer from semantic plausibility.

**Authority focus:** retrieval truth.

---

## PG-45 — Quiet hours with normal attention

**Situation:** Normal-attention item becomes actionable during quiet hours with no material urgency.

**Expected Product behavior:** monitoring/re-evaluation continues; interruption may wait under quiet-hours policy; item remains correctly visible when user opens Product.

**Forbidden outcome:** stop monitoring because notifications are suppressed.

**Authority focus:** delivery != monitoring.

---

## PG-46 — Quiet hours with material urgent handoff

**Situation:** User action becomes necessary and delay has material cost exceeding accepted urgency policy.

**Expected Product behavior:** Urgent Attention may override ordinary quiet suppression according to explicit/validated policy; Moment remains source-grounded.

**Forbidden outcome:** `quiet hours` treated as a semantic defer that changes Responsibility truth.

**Authority focus:** urgency orthogonality.

---

# 2. Bank-level acceptance invariants

The full Product candidate fails if any representative implementation/spec interpretation permits these broad forbidden outcomes:

1. `new message -> Needs You` by default;
2. `timer fired -> Follow-up state/notification` by default;
3. `send clicked -> provider success/outcome success`;
4. `Stop Tracking -> Satisfied`;
5. `Return Attention -> fabricate USER actionability`;
6. `user target -> overwrite source due`;
7. `any uncertainty -> Review`;
8. `ordinary send approval -> Review backlog`;
9. `provider/AI/sync degradation -> healthy Managed reassurance`;
10. `unsynced/degraded/unknown -> true zero`;
11. `AI unavailable -> Source unavailable`;
12. `processing failure -> No Responsibility`;
13. `disconnect -> external completion`;
14. `re-add intentionally disconnected account -> old delegation silently resumes`;
15. `future class-setting change -> existing delegated loops silently abandoned`;
16. `quoted text / CC / acknowledgement / attachment claim -> false obligation or closure`;
17. `semantic similarity -> identity authority`;
18. `source text -> tool/application authority`;
19. `failure -> apology without state/integrity repair`;
20. `Product Content COMPLETE -> empirical validation / implementation authorization`.

---

# 3. Promotion rule

Before this bank becomes canonical:

- reconcile every case against current `PRODUCT.md`;
- verify semantic-dependent cases against Responsibility FIXED decisions/oracles;
- verify interaction consequences against `DESIGN.md` / `INTERACTIONS.md` / `RESPONSIVE.md`;
- verify lifecycle/error cases do not invent schema/enum/permission authority;
- complete the full Issue #45 acceptance audit over the whole cumulative candidate;
- batch-correct all known material blockers;
- bind final PASS to exact head and current task contract;
- run exact-head repository CI before merge.