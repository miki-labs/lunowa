# Responsibility / Moment Comparative Scenario Oracles

## Status

**REVISION CANDIDATE — NOT IMPLEMENTATION AUTHORITY UNTIL INDEPENDENT REVIEW PASSES.**

This document is the deterministic Product-experiment oracle required by Issue #32 for Product Validation #26 and the bounded prototype in Issue #28 / PR #30.

It freezes the **experiment evidence, timed starting state, expected operational decisions, baseline fairness boundary, and scenario-specific falsifiers** so an implementation agent cannot invent Product-significant meaning while creating fixtures.

It does **not** define production persistence, provider behavior, SQL, reducer state, AI output, or a canonical lifecycle enum.

The canonical separation remains:

```text
Evidence != Interpretation != Admission != Domain state != Safe action != UI projection
```

User-facing `MY_TURN | WAITING | LATER | DONE | REVIEW` values in this document are experiment projections only.

Live review/CI/merge state is owned by **Issue #32 and the current PR discussion**, not by checkboxes in this file. A stale copy of this document must never be used to infer that review or mechanical gates passed.

---

## 1. Authority and experiment purpose

Use this artifact together with:

- Issue #26 — H1-H4, measurement, evidence-quality and falsification contract;
- Issue #28 — bounded prototype implementation contract;
- Issue #29 / PR #30 — execution-plan gate;
- `docs/product/PRODUCT.md`;
- `docs/design/DESIGN.md`;
- `docs/design/INTERACTIONS.md`;
- `docs/design/references/README.md`;
- `docs/product/responsibility/README.md`;
- `docs/product/responsibility/ANNOTATION-GUIDELINES.md` only when a scenario semantic is in doubt.

If this artifact conflicts with accepted Responsibility semantics, stop and reconcile the specification. Do not silently repair the scenario in implementation.

All names, companies, accounts, domains, messages and attachments below are **synthetic fictional test data**. `.example` domains are deliberate.

The experiment is intended to answer whether Responsibility / Moment preparation reduces communication-management reconstruction burden without creating trust, control, or account-boundary confusion. It is not a general email-client benchmark and does not prove ICP, demand, switching willingness, WTP, distribution, or retention.

---

## 2. Frozen clock and actor identities

Unless a scenario explicitly says otherwise:

```text
Evaluation clock: 2026-09-03 10:00 JST
Locale: ja-JP
Timezone: Asia/Tokyo
```

Primary fictional user:

```text
Name: 森川 直人
```

Connected fake accounts/scopes:

| Account id | Scope | Address | Display label |
| --- | --- | --- | --- |
| `acct-work` | `仕事` | `naoto.morikawa@aoba-design.example` | 青葉デザイン / 仕事 |
| `acct-personal` | `個人` | `naoto@morikawa-lab.example` | 個人 |

The account ids are experiment identifiers only.

---

## 3. Paired-condition contract

### 3.1 Same semantic evidence

For a scenario id, baseline and Lunowa consume the same frozen evidence records:

- account/scope;
- Conversation membership;
- sender / recipients;
- subject;
- exact message text;
- exact timestamps;
- attachments and material summaries;
- exact synthetic user attention/commitment events where present.

Presentation may differ. Semantic evidence may not.

A builder must not rewrite a message, date, amount, account, attachment, user decision, reminder, or expected decision because another version is easier to render.

### 3.2 Timed starting state

At the start of each timed task:

- the relevant row or rows are visible without scrolling;
- no Conversation, attachment, Moment, account menu, or facilitator control is pre-opened;
- the interface is fully rendered before timing begins;
- there is no artificial latency in either condition;
- the participant receives the frozen facilitator prompt;
- timing starts when the prompt ends;
- timing stops when the participant states a final operational decision for the task's timed objective;
- post-task trust/provenance questions occur **after** timing stops.

Do not use concurrent think-aloud prompts during `T_action`; they would make timing dependent on verbalization speed. The facilitator may ask the fixed post-task questions after the decision.

### 3.3 Frozen conventional baseline

The baseline is a competent modern conventional inbox/thread experience, not a straw man.

Baseline capabilities available in every scenario where relevant:

- sender;
- subject;
- frozen source-derived row snippet listed in Section 4;
- timestamp;
- unread/read state;
- attachment indicator;
- chronological full thread in one ordinary row open;
- reply/reply-all where source communication permits it;
- account badge and unified/all-inboxes view in S7;
- conventional snooze/reminder marker when the shared evidence explicitly contains such a user event;
- full sender address and ordinary external-sender/security affordance in S4.

The baseline must not expose Lunowa-specific synthesized preparation:

- `My Turn / Waiting / Later / Review / Done` classification;
- synthesized current question;
- synthesized operational answer;
- synthesized one-primary-Moment ranking;
- synthesized provenance explanation that states the intended answer.

Visual quality, typography, spacing, responsiveness, click targets, and basic accessibility must be competent enough that the comparison is not `bad UI vs good UI`.

### 3.4 Frozen Lunowa treatment boundary

Before the participant opens anything, Lunowa shows the **same source-derived sender/subject/time/account/attachment/snippet fields as the baseline**, plus only the frozen Product preparation listed in Section 4.

Lunowa treatment behavior:

- row body -> `会話`;
- projection/status chip -> `今の要点`;
- ordinary source reading is never gated by Moment;
- one visually primary Moment/question by default;
- source/provenance accessible on demand;
- account/sender identity explicit where material;
- no confidence-percentage/debug UI.

This prevents an implementation from winning by selectively exposing more raw source evidence in the Lunowa row while hiding it in the baseline.

### 3.5 Scene shape

```text
S1-S6: one Conversation each
S7: two separate Conversations across two accounts/scopes
```

This is an experiment rendering requirement, not production data-model authority.

---

## 4. Frozen list-level evidence before first interaction

This table is Product-significant experiment evidence, not a pixel/layout contract.

For each row, baseline and Lunowa must expose exactly the same source-derived sender, subject, timestamp, account badge requirement, attachment indicator, and snippet. Lunowa may additionally expose only the listed treatment preparation.

| Scenario | Baseline + Lunowa shared initial row evidence | Lunowa-only preparation |
| --- | --- | --- |
| S1 | Sender `堀江 美香`; subject `[最終確認] 秋季カタログ増刷分の発注`; time `9/2 09:20`; attachment indicator ON; snippet `問題なければ、確認書へ署名のうえ9月4日（金）17:00までにこのメールへ返信添付をお願いします。` | chip `対応が必要` |
| S2 | Sender `佐藤 怜奈`; subject `業務委託契約書ドラフトの法務確認`; time `9/2 16:08`; attachment indicator ON because thread contains sent attachment; snippet `受領しました。現在、法務で確認中です。9月5日中を目安に回答します。` | chip `待ち` |
| S3 | Sender `DesignCloud 更新窓口`; subject `DesignCloud 年間プラン更新のご確認`; time `9/3 08:30`; snippet `プラン変更をご希望の場合は9月12日18:00までに管理画面でお手続きください。` plus visible conventional/Lunowa return marker `9/8 09:00` from shared user defer evidence | chip `あとで` |
| S4 | Sender display `北斗ロジスティクス 経理`; full sender address recoverable in row/details as `accounts@hokuto-payments.example`; subject `請求書 HL-8821 / 8月配送分`; time `9/3 08:42`; attachment indicator ON because thread contains invoice; snippet `システム移行に伴い、HL-8821のお振込先が変更になりました。今回は星川銀行 中央支店 普通 0005678へお願いいたします。` | chip `確認` |
| S5 | Sender `東都カンファレンス予約窓口`; subject `9/18 研修室予約 R-271 キャンセル依頼`; time `9/1 13:30`; snippet `予約番号R-271のキャンセル手続きが完了しました。今回は期限内のためキャンセル料は発生しません。` | chip `完了` |
| S6 | Sender `加藤 結衣`; subject `10/2 展示会ブース準備事項`; time `9/2 13:05`; attachment indicator ON; snippet `機材リスト受領しました。会場管理へ電源容量の確認を依頼済みです。9月5日中に回答見込みです。` | chip `対応が必要` plus restrained `他に2件` indicator; no three-CTA preview |
| S7-work | Sender `CloudPort 更新窓口`; subject `[CloudPort] 契約更新のご案内`; time `9/2 09:10`; account badge `仕事`; attachment indicator ON; snippet `更新申込書へ社内発注番号を記載し、9月9日17:00までにこのメールへ返信添付してください。` | chip `対応が必要`; this row is the S7 experiment's deterministic primary attention item |
| S7-personal | Sender `CloudPort 更新窓口`; subject `[CloudPort] 契約更新のご案内`; time `9/2 09:12`; account badge `個人`; snippet `9月15日23:59までに個人アカウントの管理画面で支払い方法を更新してください。` | chip `対応が必要`; secondary to S7-work for this experiment only |

Baseline S7 ordering is conventional newest-received-first: personal row then work row.

Lunowa S7 ordering/highlight is work row then personal row because **this experiment scene** freezes the work item as primary under the already accepted preference for nearer material actionable user due dates. This is not a new global cross-Conversation ranking specification and must not be generalized beyond S7 from this artifact.

---

## 5. Participant protocol and measurement oracle

### 5.1 Neutral default facilitator prompt

Unless overridden below:

> この画面を見て、今あなたが次にすべきこと、または今は何もしなくてよいかを判断してください。必要ならメール本文・添付・アカウント情報を確認して構いません。判断できたら、何をするか（しないか）を答えてください。

Do not teach `My Turn`, `Waiting`, `Later`, `Review`, `Done`, `Responsibility`, or `Moment` vocabulary before the participant makes the operational decision.

### 5.2 Condition assignment and carryover

For clean behavioral timing:

- each participant sees a given exact scenario in one condition only;
- across participants, counterbalance which condition receives each scenario;
- rotate/randomize scenario order so one scenario is not systematically first or last;
- preserve exact evidence and prompt across conditions.

If the same participant sees the same exact scenario twice, second-exposure `T_action`, `N_reread`, and `N_nav` are marked **carryover-contaminated** and are not clean H1 timing evidence.

### 5.3 Measures

Record per scenario/condition:

- `T_action` — prompt end to final operational decision;
- `N_reread` — repeated/backtracking source reads before final decision;
- `N_nav` — meaningful row/thread/tab/account/attachment navigation before final decision;
- `N_transfer` — participant creates, requests, or says they would need an external note/to-do transfer;
- `Correct_state` — evaluator result against the exact scenario oracle; Lunowa terminology is not required;
- `Source_recheck` — participant returns to source evidence after a tentative prepared interpretation because they need additional confirmation;
- trust/control observations — source confidence, account/sender confusion, hidden-alternative concern, Review burden, or feeling that the system decided too much.

Do not collapse these into a universal weighted score after seeing results.

### 5.4 Fixed post-task questions

Ask only after `T_action` stops:

1. `何を根拠にその判断をしましたか？`
2. `この判断のために、元のメールや添付をさらに確認したいですか？ なぜですか？`
3. `この画面が情報を隠しすぎている、または決めすぎていると感じた点はありますか？`

For S7 add:

4. `どのアカウント／送信元で扱う話だと理解しましたか？`

These questions collect H2/H3/H4 observations after timing and must not be used to coach the timed decision.

### 5.5 Correctness rule

`Correct_state = true` only when the participant's answer preserves the scenario's material invariant.

Minor wording differences are acceptable. Missing a material due date, acting when no action is required, hiding a real obligation, treating an unsafe request as safe, or mixing account identities is incorrect.

---

# 6. S1 — MY_TURN: signed purchase confirmation

## Purpose

Primary pressure: **H1**, secondary H2.

Unique ambiguity: concrete material action + source due + attachment/provenance.

## Shared source evidence

```text
account: acct-work / 仕事
conversation: conv-s1
subject: [最終確認] 秋季カタログ増刷分の発注
```

### `s1-m1`

```text
2026-09-01 16:40 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 堀江 美香 <mika.horie@koyo-print.example>

堀江様

先ほどのお見積りありがとうございます。
増刷部数を3,000部から4,000部へ変更した内容で、最終確認書をご用意いただけますでしょうか。

よろしくお願いいたします。
```

### `s1-m2`

```text
2026-09-02 09:20 JST
From: 堀江 美香 <mika.horie@koyo-print.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

4,000部へ変更した内容で校了データと発注確認書を更新しました。
添付の「発注確認書_2026-09.pdf」の部数・納期をご確認ください。

問題なければ、確認書へ署名のうえ9月4日（金）17:00までにこのメールへ返信添付をお願いします。
入稿締切の都合上、期限を過ぎる場合は事前にご連絡ください。

よろしくお願いいたします。
```

Attachment:

```text
id: s1-a1
filename: 発注確認書_2026-09.pdf
summary: 4,000部 / 納品予定 2026-09-18 / 税込 418,000円 / 署名欄あり
source: s1-m2
```

## Experiment Responsibility boundary

```text
responsibility: resp-s1-order-confirmation
projection: MY_TURN
current user obligation: 発注確認書の内容を確認し、署名して返信添付する
source due: 2026-09-04 17:00 JST
primary Moment: resp-s1-order-confirmation
safe prototype primary action: 発注確認書を開く
provenance: s1-m2 + s1-a1
```

Opening the file is not completion evidence.

## Expected decision

Materially correct:

> 今は自分の対応。発注確認書を確認・署名し、9月4日17:00までに返信添付する。

Opening source/attachment is optional.

## Forbidden outcomes

- Waiting/Later/Done/NONE while the obligation is actionable;
- file-open treated as completion;
- altered source due;
- unsafe fake `発注する` action bypassing signature/reply;
- unequal attachment access between conditions.

---

# 7. S2 — WAITING: legal confirmation pending

## Purpose

Primary pressure: **H1/H2**.

Unique ambiguity: user already acted; external response is the next meaningful event; follow-up time is not a current obligation.

## Shared source evidence

```text
account: acct-work / 仕事
conversation: conv-s2
subject: 業務委託契約書ドラフトの法務確認
```

### `s2-m1`

```text
2026-09-01 10:05 JST
From: 佐藤 怜奈 <reina.sato@seiwa-partners.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

先日の打ち合わせ内容を反映した契約書ドラフトをお送りいただけますでしょうか。
受領後、弊社法務で確認します。
```

### `s2-m2`

```text
2026-09-02 14:12 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 佐藤 怜奈 <reina.sato@seiwa-partners.example>

佐藤様

修正版を添付します。
打ち合わせで合意した成果物範囲と検収条件を反映しました。
ご確認をお願いいたします。
```

Attachment:

```text
id: s2-a1
filename: 業務委託契約書_v3.docx
source: s2-m2
```

### `s2-m3`

```text
2026-09-02 16:08 JST
From: 佐藤 怜奈 <reina.sato@seiwa-partners.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

受領しました。現在、法務で確認中です。
9月5日中を目安に回答します。
追加で確認が必要な点があればこちらからご連絡します。
```

Shared user event:

```text
id: s2-e1
2026-09-02 16:10 JST
User set reminder / waiting-return check:
9月7日 09:00まで返信がなければ再確認
```

## Experiment Responsibility boundary

```text
responsibility: resp-s2-contract-review
projection: WAITING
current user obligation: none
next expected event: counterpart legal-review response
source expected date: 2026-09-05 (DATE)
follow-up/resurface check: 2026-09-07 09:00 JST from s2-e1
primary Moment: resp-s2-contract-review
safe primary action: none required
provenance: s2-m2 + s2-m3 + s2-e1
```

## Expected decision

Materially correct:

> 今は追加対応しない。修正版は送付済みで佐藤さん側の法務回答待ち。9月7日9:00まで返信がなければ再確認する。

## Forbidden outcomes

- dominant current-work/reply CTA;
- Done merely because the draft was sent;
- Later merely because it is not current work;
- follow-up time mislabeled as source due;
- hiding that the next event belongs to the counterpart.

---

# 8. S3 — LATER: explicit user defer before renewal decision

## Purpose

Primary pressure: **H1/H2**.

Unique ambiguity: intentional Product defer vs passive Waiting; source due vs resurface time.

## Shared source evidence

```text
account: acct-work / 仕事
conversation: conv-s3
subject: DesignCloud 年間プラン更新のご確認
```

### `s3-m1`

```text
2026-09-03 08:30 JST
From: DesignCloud 更新窓口 <renewal@designcloud.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

年間プランは10月1日に更新予定です。
今回、現行プラン継続または新しいチームプランへの変更をお選びいただけます。

プラン変更をご希望の場合は9月12日18:00までに管理画面でお手続きください。
それ以降は現行プランで更新されます。
```

Shared explicit user defer:

```text
id: s3-e1
2026-09-03 09:05 JST
User intentionally deferred the tracked renewal-plan decision until:
2026-09-08 09:00 JST
Reason: 9/7のチーム人数確定後に判断するため
```

The user's explicit decision to keep/return to this material choice grounds the tracked decision loop for the experiment; the product does not infer an obligation solely from a marketing-style renewal notice.

## Experiment Responsibility boundary

```text
responsibility: resp-s3-renewal-choice
projection: LATER
underlying tracked user decision: 更新プランを判断する
source due for plan change: 2026-09-12 18:00 JST
resurface time: 2026-09-08 09:00 JST
external party pending: none
primary Moment: resp-s3-renewal-choice
safe primary action while deferred: 条件を変更 (secondary)
provenance: s3-m1 + s3-e1
```

## Expected decision

Materially correct:

> 今は対応しない。自分で9月8日9:00まで延期した更新判断で、その時に戻る。相手待ちではない。元の変更期限は9月12日18:00。

## Baseline-specific fairness

The shared user defer is rendered as a conventional visible snooze/reminder state `9/8 09:00`. Baseline retains normal snooze semantics; it is not disabled to make Lunowa Later look useful.

## Forbidden outcomes

- Waiting with no external pending event;
- missing return time;
- source due/resurface conflation;
- dominant current-work CTA while deferred;
- claiming the product chose the defer;
- hiding baseline snooze state.

---

# 9. S4 — REVIEW: unverified bank-detail change

## Purpose

Primary pressure: **H2**, secondary H1.

Unique ambiguity: material safety/authority uncertainty without fabricated fraud certainty.

## Shared source evidence

```text
account: acct-work / 仕事
conversation: conv-s4
subject: 請求書 HL-8821 / 8月配送分
```

### `s4-m1`

```text
2026-09-02 10:15 JST
From: 北斗ロジスティクス 請求担当 <billing@hokuto-logistics.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

8月配送分の請求書を添付します。
請求金額は486,200円、支払期日は9月8日です。
振込先は請求書記載の青葉銀行 本店 普通 0001234 です。

よろしくお願いいたします。
```

Attachment:

```text
id: s4-a1
filename: HL-8821_請求書.pdf
summary: 486,200円 / 支払期日 2026-09-08 / 青葉銀行 本店 普通 0001234
source: s4-m1
```

### `s4-m2`

```text
2026-09-03 08:42 JST
From: 北斗ロジスティクス 経理 <accounts@hokuto-payments.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>
Subject: Re: 請求書 HL-8821 / 8月配送分

森川様

システム移行に伴い、HL-8821のお振込先が変更になりました。
今回は星川銀行 中央支店 普通 0005678へお願いいたします。
本メールの口座を優先してください。

お手数ですがよろしくお願いいたします。
```

Frozen evidence fact:

```text
No trusted evidence establishes hokuto-payments.example as an authorized payment-change domain.
No evidence establishes that the message is fraudulent either.
```

## Experiment Responsibility boundary

```text
responsibility: resp-s4-invoice-payment
projection: REVIEW
material obligation: invoice payment remains open
source due: 2026-09-08 (DATE)
critical uncertainty: authority/legitimacy of changed bank instructions
primary Moment: resp-s4-invoice-payment
safe primary action: 依頼を確認
unsafe direct action: 支払う
provenance: s4-m1 + s4-a1 + s4-m2 + absence-of-authority fact
```

## Expected decision

Materially correct:

> まだ新しい口座へ支払わない。振込先変更の権限・正当性を、既知の連絡先や元の請求元情報で確認してから判断する。

Declaring the new message fraudulent is not required and is not evidence-supported.

## Baseline-specific fairness

Baseline exposes the exact full sender address, original invoice, chronology, and a normal external-sender/domain warning if the implementation uses such a conventional affordance. It must not obscure the sender specifically to make Review look better.

## Forbidden outcomes

- new account presented as verified truth;
- `支払う` as dominant safe CTA;
- ordinary My Turn with no material warning;
- fraud declared without evidence;
- either conflicting source hidden;
- confidence percentage replacing the material uncertainty.

---

# 10. S5 — DONE: cancellation accepted, no success fiction

## Purpose

Primary pressure: **H1/H2**.

Unique ambiguity: safely ignorable resolved work with truthful non-success resolution reason.

## Shared source evidence

```text
account: acct-work / 仕事
conversation: conv-s5
subject: 9/18 研修室予約 R-271 キャンセル依頼
```

### `s5-m1`

```text
2026-09-01 11:18 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 東都カンファレンス予約窓口 <booking@toto-conference.example>

予約番号R-271（9月18日 研修室B）について、社内予定変更のためキャンセルをお願いします。
キャンセル料の有無もあわせてご確認ください。
```

### `s5-m2`

```text
2026-09-01 13:30 JST
From: 東都カンファレンス予約窓口 <booking@toto-conference.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

予約番号R-271のキャンセル手続きが完了しました。
今回は期限内のためキャンセル料は発生しません。
追加のお手続きは不要です。
```

## Experiment Responsibility boundary

```text
responsibility: resp-s5-cancel-room
projection: DONE
resolution reason: cancelled
current user obligation: none
primary Moment: resp-s5-cancel-room
safe primary action: none
provenance: s5-m1 + s5-m2
```

## Expected decision

Materially correct:

> キャンセルは受け付け済みで、追加対応はない。もう何もしなくてよい。

## Forbidden outcomes

- fictional successful-satisfaction language replacing cancellation;
- dominant CTA;
- My Turn because the original reservation existed;
- opening/read state treated as completion evidence;
- hiding `追加のお手続きは不要` from baseline.

---

# 11. S6 — multiple Responsibilities: one primary Moment

## Purpose

Primary pressure: **H1/H3**.

Unique ambiguity: multiple independent loops inside one Conversation while preserving one sensible default primary Moment.

## Shared source evidence

```text
account: acct-work / 仕事
conversation: conv-s6
subject: 10/2 展示会ブース準備事項
```

### `s6-m1`

```text
2026-09-01 09:00 JST
From: 加藤 結衣 <yui.kato@east-hall.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

10月2日の展示会ブースについて、以下3点お願いします。

1. レイアウト修正版PDFを9月4日15:00までにご返信ください。
2. 電源容量はこちらで会場管理へ確認します。機材リストをいただければ確認を進めます。
3. 看板の正式発注は9月8日の色校確認後で構いません。発注期限は9月10日17:00です。

よろしくお願いいたします。
```

### `s6-m2`

```text
2026-09-02 11:20 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 加藤 結衣 <yui.kato@east-hall.example>

加藤様

機材リストを添付します。
電源容量の確認をお願いします。
レイアウト修正版は別途お送りします。
```

Attachment:

```text
id: s6-a1
filename: 展示会_機材リスト.xlsx
source: s6-m2
```

### `s6-m3`

```text
2026-09-02 13:05 JST
From: 加藤 結衣 <yui.kato@east-hall.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

機材リスト受領しました。
会場管理へ電源容量の確認を依頼済みです。9月5日中に回答見込みです。
```

Shared explicit user defer:

```text
id: s6-e1
2026-09-03 09:15 JST
User intentionally deferred the signboard-order decision until:
2026-09-08 16:00 JST
Reason: 色校確認後に発注内容を確定するため
```

## Experiment Responsibility boundary

### `resp-s6-layout`

```text
projection: MY_TURN
obligation: レイアウト修正版PDFを返信する
source due: 2026-09-04 15:00 JST
provenance: s6-m1 + s6-m2
```

### `resp-s6-power`

```text
projection: WAITING
current user obligation: none; 機材リスト送付済み
next expected event: 会場管理からの電源容量回答
source expected date: 2026-09-05 (DATE)
provenance: s6-m2 + s6-a1 + s6-m3
```

### `resp-s6-signage`

```text
projection: LATER
underlying tracked user obligation: 色校確認後に看板を正式発注する
source due: 2026-09-10 17:00 JST
resurface time: 2026-09-08 16:00 JST
provenance: s6-m1 + s6-e1
```

### Default primary Moment

```text
primaryResponsibility: resp-s6-layout
reason: nearest material currently actionable USER source due
safe primary action: 会話を開いて返信を準備
```

The three Responsibilities remain independent.

## Frozen facilitator prompt

> この会話について、今まず何をすべきか判断してください。ほかに気にしておくことがあれば合わせて説明してください。必要ならメール本文や添付を確認して構いません。

## Expected decision

A fully correct answer identifies materially:

1. first priority: revised layout PDF by 9/4 15:00;
2. power: equipment list already sent; external answer expected by 9/5;
3. signboard: intentionally deferred to 9/8 16:00; source deadline 9/10 17:00.

For `T_action`, stop at the first correct primary-action identification. Continue the rest only for classification/complexity/H3 observation.

## Forbidden outcomes

- one Conversation lifecycle value flattening all three loops;
- three equal-priority CTAs;
- newest-message selection overriding nearer actionable due;
- power item My Turn after list was sent;
- signage item Waiting instead of explicit user defer;
- hidden secondary item;
- secondary state mutation when active Moment changes.

---

# 12. S7 — cross-account/scope: similar subject, separate committed renewals

## Purpose

Primary pressure: **H4**, with H1/H2.

Unique ambiguity: unified attention across superficially similar communications while preserving two contracts, two Conversations, two account identities, and correct sending boundary.

This scenario intentionally adds **explicit prior user continuation evidence** so the renewal actions are objectively grounded. The oracle must not infer continuation merely from conditional vendor wording.

## Shared source evidence

This scene contains two separate Conversations.

### Work Conversation `conv-s7-work`

```text
account/scope: acct-work / 仕事
recipient identity: naoto.morikawa@aoba-design.example
subject: [CloudPort] 契約更新のご案内
```

#### `s7-w-m0` — explicit user continuation commitment

```text
2026-09-01 16:05 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: CloudPort 更新窓口 <renewals@cloudport.example>

CloudPortご担当者様

法人契約 CP-W-482（Team / 20席）は10月以降も継続します。
更新に必要な手続きを教えてください。

よろしくお願いいたします。
```

#### `s7-w-m1`

```text
2026-09-02 09:10 JST
From: CloudPort 更新窓口 <renewals@cloudport.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

継続のご連絡ありがとうございます。
法人契約 CP-W-482（Team / 20席）の更新申込書を添付します。
社内発注番号を記載し、9月9日17:00までにこのメールへ返信添付してください。

法人契約に関する返信は、登録済みの法人メールアドレスからお願いいたします。
```

Attachment:

```text
id: s7-w-a1
filename: CP-W-482_更新申込書.pdf
source: s7-w-m1
```

### Personal Conversation `conv-s7-personal`

```text
account/scope: acct-personal / 個人
recipient identity: naoto@morikawa-lab.example
subject: [CloudPort] 契約更新のご案内
```

#### `s7-p-m0` — explicit user continuation commitment

```text
2026-09-01 21:10 JST
From: 森川 直人 <naoto@morikawa-lab.example>
To: CloudPort 更新窓口 <renewals@cloudport.example>

CloudPortご担当者様

個人契約 CP-P-119（Personal Pro）も10月以降継続します。
登録カードが9月末で切れるため、必要な更新手続きを教えてください。
```

#### `s7-p-m1`

```text
2026-09-02 09:12 JST
From: CloudPort 更新窓口 <renewals@cloudport.example>
To: 森川 直人 <naoto@morikawa-lab.example>

森川様

継続のご連絡ありがとうございます。
個人契約 CP-P-119（Personal Pro）は、9月15日23:59までに個人アカウントの管理画面で支払い方法を更新してください。
この手続きにメール返信は不要です。
```

Frozen relation fact:

```text
The two Conversations share sender organization and subject text,
but have different account identities, contract ids, operational outcomes and required actions.
No evidence authorizes semantic merge.
```

## Experiment Responsibility boundary

### `resp-s7-work-renewal`

```text
conversation: conv-s7-work
account/scope: acct-work / 仕事
projection: MY_TURN
grounding: explicit continuation commitment s7-w-m0 + requested update step s7-w-m1
obligation: 法人更新申込書へ社内発注番号を記載し返信添付
source due: 2026-09-09 17:00 JST
required reply identity: naoto.morikawa@aoba-design.example
provenance: s7-w-m0 + s7-w-m1 + s7-w-a1
```

### `resp-s7-personal-payment`

```text
conversation: conv-s7-personal
account/scope: acct-personal / 個人
projection: MY_TURN
grounding: explicit continuation commitment s7-p-m0 + requested update step s7-p-m1
obligation: 個人CloudPortアカウントで支払い方法を更新
source due: 2026-09-15 23:59 JST
email reply: not required
account context: naoto@morikawa-lab.example
provenance: s7-p-m0 + s7-p-m1
```

The two Responsibilities remain separate.

### S7-only deterministic primary presentation

For **this experiment scene only**:

```text
primary item: resp-s7-work-renewal
reason: nearer material currently actionable source due (9/9 vs 9/15)
```

This choice instantiates an already accepted primary-Moment preference for the purpose of reproducible H4 testing. It does **not** define a canonical global cross-Conversation ranking algorithm, inbox sort rule, or production attention score.

If the work reply composer is shown, `From` must explicitly be `naoto.morikawa@aoba-design.example`.

## Frozen neutral facilitator prompt

> この画面を見て、今どう対応するのがよいか説明してください。必要な対応が複数あると判断した場合は優先順も含めて説明し、メール返信が必要ならどの送信元を使うかも答えてください。

The prompt does not state that there are two separate tasks, does not say they must remain unmerged, and does not name projection labels.

## Expected decision

Fully correct answer materially includes:

- two separate contracts/operational tasks, not one combined obligation;
- work CP-W-482 first because 9/9 17:00 is earlier; complete the corporate form and reply from the **work account**;
- personal CP-P-119 requires payment-method update in the personal account by 9/15 23:59 and requires **no email reply**.

The participant may discover these facts through the initial rows, Moment, source thread, or account context. The evaluator scores the final operational understanding, not whether the participant uses Lunowa terminology.

## Baseline-specific fairness

Baseline uses a competent unified/all-inboxes view. Both rows are simultaneously visible with account badges; no forced manual visit to two separate inboxes. Opening either row reveals exact recipient/From context and complete source thread.

Baseline ordering is newest-received-first as frozen in Section 4. This is a reproducible conventional presentation, not an artificial account-switch penalty.

## Forbidden outcomes

- semantic merge based on sender/subject similarity;
- hidden account badge/source identity;
- work reply from personal account;
- email reply implied for CP-P-119;
- one combined deadline/action summary;
- baseline forced through separate inboxes;
- H4 declared supported merely because two accounts are displayed;
- S7 primary presentation generalized into a production global ranking rule.

---

## 13. Cross-scenario semantic invariants

1. Conversation is not Responsibility.
2. Projection equality does not imply semantic equality.
3. A real actionable user obligation must not be hidden as Waiting/Later/Done/NONE.
4. `WAITING` means no current user action and next meaningful event belongs to another party/external event.
5. `LATER` requires explicit/validated defer/return semantics; communication hold is not Later.
6. Follow-up is a reason/action, not a lifecycle species.
7. `DONE` carries truthful resolution reason; cancellation/decline/supersede is not fictional successful satisfaction.
8. `REVIEW` exposes material decision-critical uncertainty and relevant evidence; it does not invent certainty.
9. Opening a message/attachment is not completion evidence.
10. Multiple Responsibilities preserve independent state and one default primary Moment where the experiment specifies one.
11. Cross-account similarity never authorizes semantic merge.
12. Sending identity is explicit where reply identity is material.
13. Source due, user target, resurface time, expected-event date and follow-up time remain distinct.
14. Baseline and Lunowa receive identical source evidence.
15. A conditional action is not promoted to an unconditional user obligation without evidence that the condition is satisfied or the user has explicitly committed to the relevant path.
16. Experiment-specific list ordering/primary choices are not production ranking authority.

---

## 14. Implementation translation boundary

Implementation may translate this document into typed fixtures only mechanically.

Allowed implementation choices:

- TypeScript identifier naming;
- fixture file split;
- component boundaries;
- route/query parsing;
- visual component implementation consistent with current design authority;
- test-helper structure.

Not allowed without specification revision:

- source message edits;
- timestamp/date/amount edits;
- account/sender/recipient edits;
- moving evidence between Conversations;
- changing shared initial row evidence/snippet;
- changing expected projection/decision;
- changing primary Responsibility selection where frozen;
- changing baseline evidence availability;
- changing participant prompt;
- changing forbidden outcomes;
- treating experiment projections as canonical persisted lifecycle truth;
- generalizing S7's experiment-only attention ordering into production ranking semantics.

If the renderer requires a Product-significant field that cannot be derived mechanically from this oracle, stop and raise a specification gap.

---

## 15. Required implementation assertions derived from this oracle

Later Issue #28 implementation must mechanically prove at minimum:

- both modes reference identical frozen source evidence ids/content;
- shared initial row evidence exactly matches Section 4;
- Lunowa-only preparation does not leak into baseline;
- S1 preserves user action/source due and file-open != completion;
- S2 has no dominant current-work CTA and preserves counterpart waiting + follow-up distinction;
- S3 preserves source due != resurface time and baseline snooze visibility;
- S4 exposes both payment sources and has no direct payment CTA;
- S5 exposes cancellation as the resolution reason;
- S6 contains exactly three specified independent Responsibility fixtures and defaults to `resp-s6-layout`;
- S7 contains two Conversations/accounts/Responsibilities with explicit prior continuation evidence;
- S7 never merges them semantically;
- S7 work reply uses the work From identity;
- S7 primary ordering is tagged/tested as experiment-only, not global ranking authority;
- all scenario ids are deterministic at the frozen evaluation clock.

These are Product-experiment assertions, not production reducer tests.

---

## 16. Independent review contract

The next independent reviewer must audit the **entire current candidate**, not only the latest edits, and try to falsify:

1. whether every expected decision is derivable from source evidence;
2. whether any scenario invents a Responsibility semantic rule;
3. whether any baseline is handicapped;
4. whether timed starting evidence is deterministic enough to make `T_action`, `N_nav`, and `N_reread` interpretable;
5. whether S3 is a fair Later-vs-conventional-snooze comparison;
6. whether S4 preserves uncertainty rather than declaring fraud/legitimacy;
7. whether S6 preserves three independent loops + one justified primary Moment;
8. whether S7's two actionable renewals are grounded by explicit user continuation evidence;
9. whether S7 prompt neutrality allows account/task decomposition to be observed rather than taught;
10. whether S7 tests H4 beyond plain unified-inbox aggregation;
11. whether a builder can still materially alter H1-H4 observability while claiming fixture-only implementation;
12. whether the artifact remains experiment authority only and does not become production schema/ranking authority.

Required disposition is exactly one of:

```text
PASS / ORACLE SUPPORTED
FAIL / REVISE
```

A PASS still does not authorize Issue #28 until PR #30 is reconciled/re-reviewed and the separate implementation-harness resume gate is satisfied.

---

## 17. Content acceptance inventory

The candidate intentionally contains:

- exact S1-S7 synthetic source evidence;
- exact account/sender/recipient identities;
- exact dates/timestamps/attachments where material;
- exact shared initial baseline/Lunowa row evidence;
- exact Lunowa-only initial preparation boundary;
- explicit S3/S6 defer evidence;
- explicit S7 continuation commitments before renewal actions;
- exact expected operational decisions/source bases;
- scenario-specific forbidden outcomes;
- fixed timed-task and post-task protocol;
- baseline fairness boundaries;
- experiment-only fixture/projection/ranking boundary;
- no private mail/participant content;
- no production provider/auth/DB/AI/send/runtime work.

Live CI, `git diff --check`, review disposition, and merge authority remain external durable state in GitHub and must be re-established on every new exact head.