# Lunowa Onboarding / Trust Progression Candidate

## Status

**Durable Product candidate — NOT canonical design authority and NOT implementation authorization.**

This document specifies how a new user should move from first connection to credible Attention Delegation without requiring blind trust, constant AI oversight, or immediate abandonment of the source inbox.

It is downstream of:

- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md`;
- `V1-PRODUCT-SURFACE-CANDIDATE.md`;
- canonical Responsibility semantics under `docs/product/responsibility/`.

It does not change schema, provider scope, implementation sequencing, or current Product-discovery gates.

Labels:

- **DOCTRINE CANDIDATE** — durable Product principle;
- **SUPPORTED INFERENCE** — strong synthesis from external evidence;
- **PRODUCT HYPOTHESIS** — Lunowa-specific behavior requiring validation;
- **UNKNOWN** — deliberately unresolved.

---

# 1. Core principle

## 1.1 Do not ask for trust; earn delegated monitoring

**DOCTRINE CANDIDATE:** Lunowa must not ask the user to trust a general AI system or to stop checking email on day one.

The Product should earn a narrower behavior:

> **“I am willing to let Lunowa monitor this kind of communication loop for me.”**

Trust language is secondary. The relevant Product behavior is **delegation**.

## 1.2 Trust is not one scalar

**SUPPORTED INFERENCE:** user trust/reliance should be treated as dynamic and function/context-specific rather than one global score.

A user may rationally trust Lunowa to:

- notice whether a reply arrived;
- remember a date;
- maintain Waiting state;

while not yet trusting it to:

- infer document completeness;
- interpret negotiation intent;
- send external messages automatically.

Therefore do not implement a global `trust_level` that unlocks all capabilities.

## 1.3 Capability, permission, and demonstrated reliability remain separate

```text
Capability
  what Lunowa/model can technically do

Observed reliability
  how well a specific function has behaved in actual use/evaluation

Delegation permission
  what the user has allowed Lunowa to carry on their behalf
```

None implies the others.

---

# 2. The onboarding goal

Early onboarding is not about:

- configuring every category;
- cleaning the inbox;
- training an AI persona;
- learning a new task taxonomy;
- enabling broad automation;
- reaching Inbox Zero.

The earliest meaningful Product proof is:

> **Experience a complete monitoring handoff in which the user can stop checking, Lunowa stays quiet while no attention is needed, and Lunowa returns the item with enough context at the correct time/state change.**

Do **not** require that this full cycle complete within the first calendar week. Real externally dependent loops may legitimately last days or weeks. Optimizing onboarding for an artificial short completion window could bias the Product toward trivial loops and undermine the actual wedge.

Before the first natural full closure, onboarding can still demonstrate value through bounded delegation, correct silent intermediate handling, evidence receipts, integrity transparency, and correct return behavior.

---

# 3. First-run sequence

## 3.1 Step 1 — Connect one mailbox and explain the boundary

**PRODUCT HYPOTHESIS:** first-run should prefer one real mailbox over multi-account setup breadth.

The user should see a compact permission/boundary explanation:

```text
Lunowa can
- read connected email needed to understand tracked conversations
- watch replies and relevant timing/evidence
- prepare context and drafts

Lunowa will not, by default
- send email without your approval
- alter external commitments on its own
- hide the original source from you
- treat every email as a task
```

Avoid a long AI-capability marketing screen.

## 3.2 Step 2 — Source remains intact

**DOCTRINE CANDIDATE:** connecting Lunowa must not require the user to abandon or reorganize their source inbox immediately.

Initial behavior should be observational/additive:

- no broad provider-side archiving merely to make Lunowa look clean;
- no irreversible mailbox reorganization;
- no claim that Lunowa now safely covers historical unresolved work.

This respects the fixed semantic rule that historical lack of observed closure does not imply a live Responsibility.

## 3.3 Step 3 — Choose one real loop

**PRODUCT HYPOTHESIS:** the best first proof is a real current loop selected from recent Sent / current Conversations, not a synthetic tutorial alone.

Candidate prompt:

```text
最近、返事や結果を待っている件はありますか？

[最近の送信メールから選ぶ]
[受信メールから選ぶ]
[あとで]
```

The user chooses one concrete communication where monitoring burden already exists.

Selection of a thread does **not** mean `1 thread = 1 Responsibility`. Lunowa must still propose the smallest coherent operational outcome and preserve ordinary admission semantics.

## 3.4 Step 4 — Show the delegation contract in ordinary language

Before monitoring begins, Lunowa should summarize the candidate contract:

```text
見積書を待つ

待っているもの
見積書

今は
ABC社の返答待ち

Lunowaが戻す条件
- 見積書が届いた
- 追加の確認が必要になった
- 金曜まで進展がない

Lunowaが勝手にしないこと
- 返信を送る
- 完了扱いにする（結果を確認できない場合）
```

Primary action:

`[この件を任せる]`

The user is delegating a bounded monitoring contract, not approving generic AI autonomy.

## 3.5 Step 5 — Remove it from active attention

After explicit initial delegation:

```text
Lunowaが見ています
次にあなたが必要になったら戻します
```

The item moves to Managed / Waiting as appropriate.

Do not keep presenting it as an unresolved badge requiring daily checking.

---

# 4. Trust progression model

## 4.1 Phase A — Demonstrate

Early use is **proof-oriented**.

The user delegates bounded individual loops.

Lunowa:

- makes source/evidence easily inspectable;
- shows what it believes it is monitoring;
- does not automatically broaden scope;
- does not auto-send consequential external actions.

## 4.2 Phase B — Assisted delegation

After successful real interactions, Lunowa may proactively identify new candidate loops:

```text
この件、返答を待つ状態として見ておきますか？

見ているもの: signed contract
戻す条件: reply / Thursday / contradiction

[任せる]
[今回はしない]
```

The goal is not to ask this forever. It is temporary scaffolding while the user learns the Product's boundaries.

## 4.3 Phase C — Class-scoped default monitoring

**PRODUCT HYPOTHESIS:** after repeated sufficiently reliable behavior for a recognizable class, Lunowa may offer a scope-specific delegation rule.

Example:

```text
これまで、期限つきで相手に依頼した複数の件をLunowaに任せました。
今後、このタイプは自動で見ておきますか？

対象
期限つきの送信依頼

すること
返信・結果・期限を監視

しないこと
自動送信

[今後は自動で見る]
[今まで通り確認する]
```

The exact count/threshold is NOT fixed by this document. Promotion must be based on validated Product evidence, not an arbitrary magic number.

Class-scoped delegation is **permission to monitor eligible admitted Responsibilities**, not permission to bypass Responsibility admission. Every candidate still respects canonical `TRACK / DO_NOT_TRACK / NEEDS_REVIEW` semantics, material uncertainty, identity boundaries, and `No Responsibility` as a correct outcome.

This must not become a generic user-authored rule engine/DSL in v1.

## 4.4 Phase D — Quiet default

Once the user has explicitly enabled safe class-scoped delegation, the Product may become quieter:

```text
mail/evidence arrives
→ ordinary admission / matching / reduction
→ eligible safe admitted Responsibility
→ monitor automatically within delegated scope
→ no interruption unless Attention Need changes
```

The source remains available.

## 4.5 External action autonomy is a separate ladder

Monitoring progression must not silently grant action autonomy.

A user may reach quiet automatic monitoring while email send remains:

```text
draft prepared
→ preview
→ user approves Send
```

Any later external-action delegation must be action/context/scope-specific and independently authorized.

---

# 5. Do not use calendar time as the trust ladder

Avoid:

```text
Day 1 = manual
Day 3 = semi-auto
Day 7 = automatic
```

Time alone proves nothing.

A seven-day onboarding checklist may be useful educationally, but Product authority should expand only because:

- the user experienced relevant real loops/interactions;
- the system produced observable sufficiently reliable behavior for the relevant function/class;
- material errors/corrections are understood;
- the user explicitly accepts the broader delegation scope.

A loop taking longer than a week is not an onboarding failure if Lunowa is correctly carrying the monitoring burden during that period.

---

# 6. How Lunowa demonstrates value without becoming an oversight dashboard

## 6.1 Evidence receipts, not activity feed

The user should not watch every model/tool step.

Early trust-building may use low-stimulation **evidence receipts** inside Managed or a compact recap:

```text
水曜 10:20
ABC社「社内確認中」
→ 対応不要として監視を継続

木曜 16:05
回答予定が金曜へ変更
→ 金曜に再評価
```

These are inspectable proof of correct stewardship, not notifications.

## 6.2 Successful closure receipt

After a complete loop:

```text
完了

4日間 Lunowaが見ていました
途中の「確認中」は対応不要として処理
今日、見積書が届いたためあなたに戻しました

原文と判断根拠を見る
```

The duration in this example is illustrative only; Product value does not depend on rapid closure.

This makes the invisible value legible without requiring constant monitoring.

## 6.3 Do not manufacture confidence theater

Avoid prominent unvalidated cues such as:

- `AI confidence 94%`;
- green “safe” badges derived only from model confidence;
- fluent long-form rationale as proof;
- anthropomorphic “I am certain” language.

Prefer source-grounded facts and concrete system state.

---

# 7. Source-first to Attention-first migration

## 7.1 Do not force Inbox abandonment

**DOCTRINE CANDIDATE:** Attention-first should be an earned/defaultable workflow, not an onboarding prerequisite.

Initial navigation may keep Source Conversations prominent alongside Needs You.

## 7.2 Offer the landing shift explicitly

After meaningful successful delegation experience, Lunowa may offer:

```text
最近は「対応が必要」から始めることが増えています。
Lunowaを開いた時、ここを最初に表示しますか？

[対応が必要を最初に開く]
[会話のまま]
```

Do not silently switch the user's default landing because an internal trust model says they are ready.

## 7.3 Managed visibility may become quieter, not unavailable

As delegation grows:

- aggregate reassurance remains;
- detailed Waiting/Later state is one action away;
- Source remains directly accessible;
- integrity failures become more visible, not less.

---

# 8. Monitoring integrity is part of trust progression

When the Product owns monitoring burden, loss of monitoring capability is itself a **Product-level attention condition**.

It is not automatically a Responsibility, `Needs You`, or semantic `Review` subject. System-integrity/degraded-state UX should remain distinct from communication Responsibility projections unless the failure independently creates a real user obligation/decision.

Examples:

- Gmail/Outlook disconnected;
- sync materially stale;
- provider permissions revoked;
- required scheduler/reconciliation unavailable;
- a tracked item cannot be verified within its contract.

UI example:

```text
監視を続けられない件があります

Gmailとの同期が停止しています
影響する管理中の件: 3
最終確認: 38分前

[再接続]
```

Do not continue displaying generic reassurance while monitoring integrity is materially degraded.

---

# 9. Error classes and trust repair

## 9.1 False positive — tracked something unnecessary

User action:

`[これは追わない]`

Expected repair:

- stop live tracking;
- preserve source/history;
- make correction cheap;
- optionally ask whether this should apply to a narrow future class, but do not force explanation.

False positives must not create a large correction workload.

## 9.2 Interpretation error — wrong field/state

Example:

Lunowa inferred Friday; source actually says Monday.

Repair should show:

```text
期限を誤って扱っていました

Lunowaの扱い: 金曜
正しい期限: 月曜
根拠: 最新メール 8/26 14:10

[月曜に修正]
```

Correction remains field-scoped; it must not freeze unrelated fields.

## 9.3 Material miss discovered by user

This is the most damaging class because successful offloading makes the user less likely to self-monitor.

Lunowa should not respond with a conversational apology alone.

Required Product response should answer:

1. **What was missed?**
2. **Why was it not surfaced/monitored?** — only what can be supported, no invented causal story.
3. **What was the impact window?**
4. **Are other current delegated loops affected by the same failure mode?**
5. **What did Lunowa do to restore safe monitoring now?**
6. **Has the affected delegation scope been narrowed or returned to confirmation mode?**

Example:

```text
見落としがありました

8/25 09:12 の返信であなたの確認が必要になっていましたが、
Lunowaは「経過報告」として扱い、戻しませんでした。

影響
この件は約9時間遅れて表示されました

現在
この件は「対応が必要」に戻しています
同じ判断条件を使う管理中の2件を再確認しました

今後
この種類は、再確認が完了するまで自動監視の対象を広げません

[原文と判断履歴を見る]
```

Exact repair mechanics require implementation/eval evidence; the Product invariant is transparent impact + concrete recovery, not emotional language.

A safety fallback may temporarily return the affected delegated class to confirmation-oriented behavior, but the user must be told what changed. Do not silently mutate broad permission scope based on an opaque “trust repair” algorithm.

## 9.4 Integrity failure is not an AI interpretation error

A provider outage/sync failure should be communicated as such rather than anthropomorphically blamed on “AI”.

Error communication must distinguish:

- source unavailable;
- interpretation wrong;
- policy/authority blocked;
- provider action ambiguous;
- monitoring infrastructure unavailable.

---

# 10. Trust should be measured behaviorally

Do not use only:

- “How much do you trust Lunowa?”;
- generic satisfaction;
- confidence ratings.

Important Product measures include:

## Delegation behavior

- number/rate of real loops explicitly delegated;
- class-scoped delegation opt-in;
- percentage of candidate loops user declines;
- continued delegation after successful closure/return behavior;
- delegation contraction after errors.

A decline is an observed behavior, not proof of distrust; reasons may include irrelevance, low value, privacy preference, or misclassification.

## Parallel monitoring behavior

- source-thread fallback/recheck frequency during Managed periods;
- Sent/Inbox self-checking for delegated loops;
- user-created parallel reminders/tasks for delegated loops;
- repeated opening of Managed without a state change.

## Calibration / correction

- user corrections per delegated loop;
- correction type/severity;
- false-positive tracking removals;
- user-discovered missed Attention events;
- unnecessary resurfacing rate;
- reopen/correction after apparent closure.

## Context restoration

- time from Moment open to correct next action;
- source-thread expansion before action;
- whether the user needs to reconstruct the whole thread manually.

## Reliability / integrity

- monitorable time vs integrity-degraded time;
- timeliness of integrity warnings;
- reconciliation lag for material external events;
- impact window of discovered misses.

The North Star behavior is not “high trust”. It is **appropriate, sustainable monitoring relinquishment**.

---

# 11. What onboarding must not become

Do not build:

- a 20-step configuration wizard;
- a personality questionnaire before value;
- a generic rule builder;
- a required taxonomy tutorial;
- an AI activity console;
- a global autonomy slider;
- a screen demanding the user classify every old email;
- automatic historical Responsibility activation;
- a tutorial that claims perfect reliability;
- gamified pressure to “trust Lunowa more”.

---

# 12. Early Product experience candidate

This is behavior-driven, not a mandatory day-by-day unlock schedule.

```text
FIRST SESSION
connect one mailbox
→ explain permission/authority boundary
→ choose one real current loop
→ review bounded delegation contract
→ delegate

FIRST REAL WAIT
Lunowa moves loop out of active attention
→ intermediate non-actionable evidence may be processed silently
→ user can inspect Managed/evidence receipt if desired

FIRST RETURN
Lunowa surfaces a Moment when user action/judgment is truly required
→ source remains one click away
→ contextual draft/action may be prepared

FIRST NATURAL CLOSURE
when the real external loop eventually closes,
Lunowa verifies/records justified closure
→ shows compact stewardship receipt

NEXT LOOPS
Lunowa identifies candidates
→ user can accept/decline cheaply

AFTER REPEATED SUFFICIENTLY RELIABLE BEHAVIOR IN A CLASS
Lunowa may offer class-scoped automatic monitoring
→ explicit opt-in
→ ordinary admission semantics still apply
→ no automatic expansion of external-action authority

AFTER MATERIAL FAILURE
transparent incident + affected-scope check
→ safe fallback/narrowing where justified and disclosed
→ delegation is re-earned by behavior, not apology
```

---

# 13. Candidate copy principles

Prefer:

- `Lunowaが見ています`
- `この件を任せる`
- `次にあなたが必要になったら戻します`
- `何もする必要はありません`
- `この件は追跡を終了しました`
- `判断できないため確認が必要です`
- `監視を続けられない件があります`

Avoid overclaiming:

- `完全にお任せください`
- `もう絶対に確認しなくて大丈夫`
- `AIが100%管理します`
- `Lunowaが責任を持ちます`

Product copy must match actual reliability/authority boundaries.

---

# 14. Product invariants

> **Delegation is earned by experience, not demanded by onboarding.**

> **Trust expands by function/scope, not globally.**

> **Class-scoped delegation never bypasses Responsibility admission or material Review.**

> **Monitoring autonomy and external-action autonomy are separate.**

> **The source inbox remains available while Attention-first behavior is earned.**

> **Early transparency should expose evidence and boundaries, not raw agent activity.**

> **Monitoring-integrity alerts are system/degraded-state UX, not automatically fake Responsibilities.**

> **Material misses require impact disclosure and concrete recovery, not apology theater.**

> **A system that asks the user to continuously supervise delegated monitoring has failed the Product thesis.**

> **The target behavior is appropriate monitoring relinquishment, not maximum trust.**

---

# 15. Open Product questions

Still unresolved and requiring Product evidence:

1. What observed behavior/reliability is enough before offering class-scoped automatic monitoring?
2. Should the first delegated loop be user-selected from Sent, suggested by Lunowa, or both?
3. How much evidence-receipt detail helps trust without reintroducing checking behavior?
4. When should Lunowa suggest switching the default landing from Source to Needs You?
5. Which low-risk loop classes may be auto-monitored after explicit class-scoped opt-in?
6. What exact incident UX is needed after a material false negative?
7. How should trust progression differ for users with high existing automation preference versus high desire for control?
8. Can awareness-only updates be batched without causing users to return to manual checking?
9. How long can the first natural loop remain open before onboarding needs a second, faster proof loop without manufacturing artificial tasks?

These must not be resolved by arbitrary Product taste alone.
