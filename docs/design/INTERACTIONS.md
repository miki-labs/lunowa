# Lunowa Interaction Specification

## Status

**Canonical interaction source of truth, reconciled with the 2026-08-27 Product contract and Responsibility v0.1 semantics.**

This document owns behavior that screenshots cannot reliably define: surface navigation, Moment/Managed/Review/Source behavior, Temporal Contract behavior, contextual communication, search/retrieval, onboarding, trust/integrity fallbacks, and uncertainty handling.

Responsibility/domain semantics come from `docs/product/responsibility/`. Product scope/value come from `docs/product/PRODUCT.md`.

User-facing buckets (`My Turn / Waiting / Later / Done / Review`) are projections, not one canonical lifecycle enum.

---

# 1. Core interaction invariants

1. **Source is always directly accessible.** AI/Moment is never a mandatory gate to original communication.
2. **Needs You items open Moment.** They represent current user work, not generic message importance.
3. **Source Conversation rows open Source Conversation.** They are ordinary communication, not implicit tasks.
4. **Managed is inspection/reassurance, not a second Inbox.**
5. **Review asks only the smallest material ambiguity/safety question.**
6. **Awareness-only information is not durable Needs You work.**
7. **Integrity failure is system UX, not a fake Responsibility/Review state.**
8. **AI failure does not block ordinary source reading/basic search/contextual manual reply where runtime permits.**
9. **Mailbox hygiene state never substitutes for Responsibility semantics.**
10. **Preserve the user's place and unfinished input across navigation/responsive changes.**

---

# 2. Surface navigation

## 2.1 Home

Home is a composition, not a semantic state.

Selecting a Home attention item:

- Needs You item → open its Moment;
- Review item → open bounded Review interaction;
- Managed reassurance → open Managed inspection;
- `会話を見る` → Source Conversations.

An empty Home may say:

> **今、あなたが対応する必要はありません。**

Do not replace that with unread count or Inbox Zero gamification.

## 2.2 Needs You

Selecting an item opens Moment focused on one primary Responsibility/question.

Needs You must not contain:

- Waiting;
- intentionally deferred Later;
- awareness-only updates;
- pre-admission Review;
- admitted Responsibilities blocked by material Review;
- generic new/important mail.

## 2.3 Managed

Opening Managed intentionally exposes delegated items.

Selecting an item shows:

- tracked operational outcome;
- expected actor/event;
- relevant temporal/return condition;
- current integrity status;
- source/provenance entry;
- lightweight controls such as modify return condition, bring back to attention where semantically valid, stop tracking, or correct material interpretation.

Do not show routine model/tool/scheduler activity unless needed to explain a failure or decision.

## 2.4 Review

Review may present either:

- pre-admission `NEEDS_REVIEW`; or
- admitted Responsibility field/safety uncertainty.

The UX can unify the surface while internal subject type remains explicit.

Review is visible only when materially populated; it need not be a permanently empty top-level destination.

## 2.5 Source Conversations

Source browsing behaves like ordinary email reading. A Source row opens `会話`/Conversation detail.

If a Source row has a Responsibility/status affordance, activating that affordance may open the relevant Moment without changing the row body's source semantics.

---

# 3. Moment interaction

## 3.1 One primary question

> **1 Moment = 1 Primary Question = generally 1 Primary Action.**

Typical hierarchy:

1. why this returned / current question;
2. what materially changed;
3. what remains unresolved;
4. one safe next action if user action exists;
5. concise supporting context;
6. additional Responsibilities;
7. source/provenance disclosure.

Do not render every block in every state.

## 3.2 MY_TURN

Question: `今、何をすればいい？`

Examples:

- `[返信する]`;
- `[見積書を見る]`;
- `[書類を追加]`;
- `[変更を確認]`;
- `[依頼を検証]` for a high-risk request.

The CTA is the **safe Product action**, not blindly the source-requested action.

## 3.3 WAITING

Question: `今は誰/何を待っている？`

Typically no dominant work CTA.

Show expected actor/event and return condition where useful:

```text
ABC社の見積書待ち
明日までに回答予定
返信がなければ金曜に再確認
```

Waiting is normally Managed/quiet, not a daily work queue.

## 3.4 LATER

Question: `いつ/何で戻る？`

```text
8月27日 9:00に再確認
返信が先に来れば、その時点で再評価

[条件を変更]
```

Communication hold/pause is not automatically Later.

## 3.5 Follow-up

Follow-up is normally a My Turn reason/action after a waiting/time condition, not a canonical lifecycle species.

```text
3日返信がありません
確認メールを準備しました

[編集]
[送信]
```

After reconciled follow-up send, if the original outcome remains with the counterpart, projection normally returns to Waiting.

## 3.6 DONE

Explain truthful monitoring end, not fake success.

Satisfied case may show completion evidence. Cancellation/decline/user-close/supersession should use corresponding explanatory copy.

## 3.7 REVIEW

Show:

- exact material question;
- minimum conflicting/safety evidence;
- one/few bounded decisions;
- source access.

Example:

```text
期限を確認

最新本文   金曜まで
以前の本文 月曜まで

[金曜として扱う]
[月曜として扱う]
[原文を見る]
```

Do not ask about harmless uncertainty solely to make the model internally neat.

---

# 4. Multiple Responsibilities / obligation legs

A Conversation may contain zero/one/many Responsibilities.

When several matter, show one primary Moment and compact additional items.

Primary selection prefers:

1. critical/overdue actionable USER work;
2. near material USER due;
3. blocking USER obligation;
4. other high-attention actionable work;
5. material Review when it blocks safe action;
6. otherwise relevant Waiting/Later context.

Do not choose merely by newest message.

Parallel obligation example:

```text
USER leg open + Tanaka leg open
-> MY_TURN

USER leg satisfied + Tanaka leg open
-> WAITING
```

Do not collapse this into an opaque `BOTH` owner.

---

# 5. Evidence / AI interpretation boundary

Preferred principle:

> **AI understands; trusted Product/domain rules decide accepted Responsibility state.**

AI may propose communication acts, obligation bearers, requested actions/events, temporal expressions, completion/correction signals, uncertainty, and provenance candidates.

Trusted domain/policy authority owns admission, identity/effects, actionability, safety, accepted state, authorization, and privileged side effects.

Model confidence or repeated model agreement is not authority.

Original communication remains immutable source evidence.

Prompt/tool-like source text never grants application authority.

---

# 6. Contextual reply / send

## 6.1 Moment-bound communication

When communication is the safe next action, open a bounded composer without losing Moment context.

```text
From: effective account
To/Cc: explicit recipients

[body / AI-prepared draft]
[attachments]

[送信]
```

Reply All must make recipients inspectable/editable.

## 6.2 AI draft

AI may prepare a draft, but the user can edit/replace it. Do not turn writing into a mandatory chatbot flow.

Material dates/amounts/recipients/commitments must not be silently strengthened from ambiguous intent.

## 6.3 Explicit Send

Initial default:

```text
draft
-> user reviews sender / recipients / content / attachments
-> explicit Send
-> provider request
-> reconciliation
-> Responsibility re-evaluation
```

Monitoring delegation does not grant send authority.

## 6.4 Send ambiguity

A click on Send is not authoritative provider acceptance.

If result is ambiguous:

- preserve draft/action context;
- avoid blind duplicate retry;
- show guarded pending/reconciliation state when needed;
- do not move the Responsibility to Done merely because Send was tapped.

After provider reconciliation, projection changes only if accepted domain semantics justify it.

## 6.5 Fresh new mail

Fresh arbitrary new compose is optional Product convenience, not a v1 core gate.

A `新規メール` affordance, if present, may open provider-native compose or an optional Lunowa composer. The Product must not require full compose parity before Attention Delegation is proven.

After a provider-side sent message is observed, Lunowa may offer/admit monitoring under normal semantics.

---

# 7. Attachments

Supported attachment selection/preview should preserve Conversation/Moment context.

Opening a file is not completion evidence.

Contextual reply may support basic attachment upload where the active loop requires it.

If in-app preview is unreliable, provide safe download/open externally without hiding source context.

---

# 8. Temporal Contract interactions

## 8.1 Create/modify

User may explicitly defer attention or Lunowa may propose monitoring/return conditions according to validated policy.

State the real return condition before relying on it.

## 8.2 Initial trigger types

Start from bounded triggers such as:

- exact/scheduled time;
- relevant reply/event observed;
- deadline threshold.

Do not expose a generic rule builder.

## 8.3 Trigger semantics

When a trigger fires:

1. reload current evidence/Responsibility;
2. ignore stale/cancelled conditions;
3. re-evaluate accepted state/actionability;
4. update attention projection if warranted;
5. deliver only according to separate attention policy.

## 8.4 Missed execution

If a promised reconsideration was missed due to provider/background failure, show recovery honestly. Do not pretend the Attention/Temporal promise was met.

---

# 9. Delivery interactions

## 9.1 Message arrival != notification

New evidence first updates/reconsiders state. Delivery is a separate decision.

## 9.2 Lanes

- **Silent** — no user attention;
- **Awareness** — useful/asked-for information but no action;
- **Normal Attention** — Needs You can wait to normal review point;
- **Urgent Attention** — delay has material cost;
- **Integrity Alert** — monitoring capability materially degraded.

Awareness does not become Needs You merely because the user wanted to know.

## 9.3 Push

Push communicates an **attention handoff**, not merely new mail.

Prefer concise action/urgency language:

`ABC社の契約 — 16:30までに確認が必要です`

Tap opens the relevant Moment/Review/integrity recovery surface.

## 9.4 Digest / brief

Optional brief/digest may summarize current attention or awareness/reassurance.

It must never be the only place containing actionable work.

## 9.5 Quiet hours

Quiet hours defer interruption where safe; monitoring/re-evaluation continues.

---

# 10. Managed / integrity interactions

## 10.1 Aggregate reassurance

Prefer:

```text
Lunowaが見ています 14
現在、追加対応が必要なものはありません
最終同期: 2分前
```

Avoid absolute claims such as `Everything is handled` when knowledge is evidence-relative.

## 10.2 Monitoring integrity failure

If provider/sync/scheduler/reconciliation prevents reliable monitoring:

```text
監視を続けられない件があります
Gmailとの同期が停止しています
影響する管理中の件: 3
最終確認: 38分前

[再接続]
```

Integrity failure is not automatically represented as Responsibility Review/Needs You.

## 10.3 Material miss recovery

When a user discovers a material miss, the Product should show when supportable:

- what was missed;
- evidence-backed failure cause;
- impact window;
- affected related scope;
- restored safe state;
- disclosed narrowing/confirmation mode if delegation policy changed.

Apology-only UX is insufficient.

---

# 11. Search / Operational Retrieval

## 11.1 Entry

Use one clear search/question entry rather than a separate generic AI-chat homepage.

Potential user language:

`検索、または質問`

## 11.2 Exact retrieval

Support deterministic source search for exact person/subject/file/date/content retrieval where practical.

## 11.3 Natural-language retrieval

Where implemented, answer from authorized evidence/current accepted state.

Examples:

- `ABC社の契約どうなってる？`
- `見積はいくら？`
- `田中さんとの未完了は？`

## 11.4 Result behavior

Operational answer may show:

- current state;
- current user action (or none);
- latest material change;
- next expected event/return condition;
- `as of` where material;
- source links.

Progressive disclosure returns to exact original communication.

## 11.5 Retrieval is not mutation

Search/semantic similarity never silently creates/merges/closes/updates a Responsibility. New evidence discovered through retrieval still passes canonical admission/reducer/authority rules.

Search scope remains authorization-safe; cross-account semantic merge stays prohibited initially.

---

# 12. People context

Entry may come from person/avatar/name/Search/Moment.

Show only communication-restoration value such as:

- identity/organization from authorized context;
- current open Responsibilities with the person;
- recent material topics;
- relevant files/Conversations.

Do not replace the selected Conversation by default on wide layouts if a secondary sheet can preserve context.

Do not introduce CRM pipeline, relationship-health score, personality profile, or network graph without a separate Product decision.

---

# 13. Mailbox convenience interactions

Provider mailbox operations such as archive/delete/read-unread/spam/block/unsubscribe/send-later may exist as secondary conveniences or provider-native fallbacks.

They are not Responsibility semantics.

```text
Archive action -> provider mailbox state only
Stop tracking -> Lunowa tracking state only
```

Do not automatically couple them.

Bulk mailbox actions are deferred from core v1 behavior.

Pin remains Lunowa explicit retrieval control and is orthogonal to Responsibility.

---

# 14. Onboarding interactions

Preferred first-run:

```text
connect one mailbox
-> provider authorization/account selection
-> explain what Lunowa can monitor / will not autonomously do
-> Source usable
-> choose one current real communication loop
-> show bounded monitoring contract
-> [この件を任せる]
```

Do not require profiles, taxonomy lessons, rule builders, multi-account organization, or broad AI preferences before first value.

Historical sync must not auto-flood live My Turn from years-old unanswered requests.

After successful use, Lunowa may propose new candidate loops or narrow class-scoped monitoring. Class-scoped monitoring still passes normal `TRACK / DO_NOT_TRACK / NEEDS_REVIEW` admission.

Do not silently switch the default landing to Attention-first or reduce provider notifications; explicitly offer those changes after credible experience.

---

# 15. Source-notification migration

Initial use may coexist with provider notifications.

After credible delegated-monitoring experience, Lunowa may offer to reduce ordinary provider notifications for the delegated scope.

This remains opt-in Product hypothesis. Do not require users to disable source notifications before trust is earned.

---

# 16. System/error/offline behavior

Communicate:

1. what happened;
2. what is affected;
3. what remains safe/usable;
4. what user can do now.

Prefer cached/accepted content over blank UI when safe.

- account reconnect → isolate to affected account;
- sync degradation → show integrity impact;
- send failure/ambiguity → preserve composer/action context;
- AI unavailable → Source/basic search/manual contextual reply remain usable where runtime supports them and accepted state does not randomly rewrite;
- attachment preview failure → preview-local fallback;
- app update → never destroy active draft/input.

---

# 17. Navigation continuity

Preserve where practical:

- selected Product surface/filter;
- selected Conversation/Responsibility;
- search query/results;
- list scroll position;
- Moment/source position;
- active draft/recipients/attachments;
- pane widths;
- preview/person-context state.

Back from a mobile Detail/Search result restores prior list/query context.

---

# 18. Keyboard / accessibility

Primary controls must be keyboard reachable with visible focus, semantic accessible labels, logical order, Enter/Space activation where appropriate, Escape for safe transient surfaces, adequate touch targets, non-color-only state meaning, and preserved decision-critical Review/safety content under zoom/text scaling.

Do not rely on hover for essential operations.

---

# 19. Interaction verification checklist

A Product-relevant slice should verify only behavior required by the accepted experiment/current scope, including as applicable:

- Home accurately distinguishes Review / Needs You / Managed reassurance;
- Needs You item opens Moment;
- Source row opens original Conversation;
- Source/status affordance can reach Moment without hiding Source;
- My Turn / Waiting / Later / Done / Review render according to canonical projection semantics;
- awareness-only update does not become Needs You;
- follow-up is My Turn action/reason;
- communication hold remains Waiting unless separately deferred;
- multiple Responsibilities still produce one primary Moment;
- parallel obligation legs move My Turn → Waiting correctly;
- Review can represent pre-admission or admitted-field uncertainty without conflation;
- high-risk request surfaces safe verification rather than blind execution;
- source due / user target / resurface time remain distinct;
- Temporal trigger re-evaluates before delivery;
- Managed inspection does not become an activity console;
- monitoring-integrity failure is visible and not a fake Responsibility;
- contextual reply preserves sender/recipients/attachments;
- ambiguous send preserves safe reconciliation state;
- search returns authorized source/current operational state and does not mutate accepted state;
- historical initial-sync source does not auto-flood live work;
- Pin remains independent;
- AI failure leaves core source behavior usable;
- keyboard/focus/accessibility remain sound.

Do **not** make full new-compose/provider mailbox parity a Product-validation acceptance gate unless a live accepted experiment explicitly requires it.

---

# 20. Default interaction decision rule

When behavior is unspecified, choose the simplest familiar interaction that:

1. preserves the user's place;
2. reduces monitoring/reconstruction burden;
3. keeps source evidence accessible;
4. surfaces only real user attention needs;
5. is reversible/correctable where practical;
6. avoids surprising account/provider behavior;
7. does not require AI for source availability;
8. does not ask the user about harmless uncertainty;
9. does not confuse mailbox/projection state with canonical Responsibility truth;
10. does not expand Product authority merely because a model/tool is technically capable.