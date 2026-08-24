# Responsibility / Moment Comparative Scenario Oracles

## Status

**SPECIFICATION CANDIDATE — NOT IMPLEMENTATION AUTHORITY UNTIL INDEPENDENT REVIEW PASSES.**

This document is the deterministic Product-experiment oracle required by Issue #32 for Product Validation #26 and the bounded prototype in Issue #28 / PR #30.

It freezes the **experiment evidence and expected operational decisions** so an implementation agent cannot invent Product-significant meaning while creating fixtures.

It does **not** define production persistence, provider behavior, SQL, reducer state, AI output, or a canonical lifecycle enum.

The canonical Responsibility separation remains:

```text
Evidence != Interpretation != Admission != Domain state != Safe action != UI projection
```

User-facing `MY_TURN | WAITING | LATER | DONE | REVIEW` values in this document are experiment projections only.

---

## 1. Authority and purpose

Use this artifact together with:

- Issue #26 — H1–H4, measurement, evidence-quality and falsification contract;
- Issue #28 — bounded prototype implementation contract;
- Issue #29 / PR #30 — execution-plan gate;
- `docs/product/PRODUCT.md`;
- `docs/design/DESIGN.md`;
- `docs/design/INTERACTIONS.md`;
- `docs/design/references/README.md`;
- `docs/product/responsibility/README.md`.

If this artifact conflicts with current canonical Responsibility semantics, stop and reconcile the specification. Do not silently change a scenario in implementation.

All names, companies, accounts, domains, messages and attachments below are **synthetic fictional test data**. `.example` domains are deliberate. No private user or participant mail content may replace them without a separate privacy decision.

---

## 2. Frozen experiment clock and actor identities

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

The account ids above are experiment identifiers only.

---

## 3. Global paired-condition contract

### 3.1 Same semantic evidence

For a given scenario id, baseline and Lunowa must consume the same frozen evidence records:

- account/scope;
- Conversation membership;
- sender / recipients;
- subject;
- exact message text;
- exact timestamps;
- attachments and material summaries;
- explicit synthetic user attention events such as snooze/reminder decisions when present.

Presentation may differ. Semantic evidence may not.

A builder must not rewrite a message, date, amount, account, attachment, reminder, or expected decision because another version is easier to render.

### 3.2 Starting state

At the beginning of a task:

- the scenario-relevant row(s) are visible in the default list;
- no source thread or attachment is pre-opened;
- no facilitator control is presented as Product navigation;
- the interface is fully loaded before timing starts;
- there is no artificial latency in either condition.

### 3.3 Competent baseline

The baseline is a modern competent conventional inbox/thread experience, not a straw man.

It may show:

- sender;
- subject;
- one/two-line snippet;
- timestamp;
- unread/read status;
- pin/star where useful;
- attachment indicator;
- account badge in multi-account views;
- standard account switcher / `すべての受信トレイ` style view;
- standard snooze/reminder indicator when the shared evidence contains an explicit user snooze/reminder event;
- full sender address and a conventional external-sender warning where relevant;
- chronological thread;
- normal reply/reply-all affordance.

It must expose all frozen source evidence without arbitrary extra friction.

It must **not** add Lunowa-specific synthesized Responsibility preparation such as:

- `My Turn / Waiting / Later / Review / Done` semantic classification;
- synthesized current-question block;
- synthesized primary obligation;
- synthesized one-primary-Moment choice;
- synthesized provenance explanation that directly states the intended operational answer.

Visual quality, typography, spacing and responsiveness must be competent enough that the experiment is not `bad UI vs good UI`.

### 3.4 Lunowa condition

Lunowa uses the same source evidence plus the accepted Product projection/Moment interaction:

- row body -> `会話`;
- projection/status chip -> `今の要点`;
- ordinary source reading is never gated by Moment;
- one visually primary Moment/question by default;
- source/provenance accessible on demand;
- account/sender identity explicit where material;
- no confidence-percentage debug UI.

### 3.5 Scene shape

A scenario may contain **one or more Conversations** solely because the experiment needs that scene composition.

```text
S1-S6: one Conversation each
S7: two separate Conversations across two accounts/scopes
```

This is an experiment rendering need, not a production data-model decision. Any illustrative singular `conversation` field in PR #30 must not prevent S7 from representing two independent Conversations.

---

## 4. Participant protocol and measurement oracle

### 4.1 Neutral default facilitator prompt

Unless a scenario overrides it, use:

> この画面を見て、今あなたが次にすべきこと、または今は何もしなくてよいかを判断してください。必要ならメール本文・添付・アカウント情報を確認して構いません。判断できたら、何をするか（しないか）を声に出してください。

Do not teach `My Turn`, `Waiting`, `Later`, `Review`, `Done`, `Responsibility`, or `Moment` vocabulary before the participant has made the operational decision.

### 4.2 Condition assignment and carryover

Default for behavioral timing:

- each participant sees a given scenario in **one condition only**;
- across participants, counterbalance which condition receives each scenario;
- randomize scenario order within practical limits;
- preserve exact scenario evidence across conditions.

If the same participant must see the same exact scenario in both conditions, mark second-exposure `T_action`, reread and navigation data as **carryover-contaminated**. It may still support qualitative H2/H3 observations, but it is not clean H1 timing evidence.

### 4.3 Measurement definitions

For every scenario/condition record:

- `T_action` — from stable rendered start + completed facilitator prompt until the participant states a final operational decision;
- `N_reread` — repeated reading/backtracking over previously viewed source content before final decision;
- `N_nav` — meaningful row/thread/tab/account/attachment navigation before final decision;
- `N_transfer` — participant creates, requests or says they would need an external note/to-do transfer to remember the obligation;
- `Correct_state` — evaluator result against the exact scenario oracle below; participant vocabulary need not match Lunowa labels;
- `Source_recheck` — participant returns to source evidence after a tentative/prepared interpretation because they need extra confirmation before finalizing the decision;
- trust/control observations — why-it-is-here comprehension, source confidence, hidden-alternative concern, account/sender confusion, Review burden, or other material observations.

Do not collapse these into a universal weighted score after observing results.

### 4.4 Correctness rule

`Correct_state = true` only when the participant's operational answer preserves the material invariant for the scenario.

Minor wording differences are acceptable. Missing a material due date, acting when no action is required, hiding a real obligation, treating an unsafe request as safe, or mixing account identities is incorrect.

---

# 5. S1 — MY_TURN: signed purchase confirmation

## Purpose

Primary pressure: **H1**, with secondary H2.

Unique question: can the participant identify a concrete material action and source due date without reconstructing the thread, while still being able to inspect the source/attachment?

## Shared source evidence

Account/scope:

```text
acct-work / 仕事
```

Conversation:

```text
id: conv-s1
subject: [最終確認] 秋季カタログ増刷分の発注
```

### Message `s1-m1`

```text
2026-09-01 16:40 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 堀江 美香 <mika.horie@koyo-print.example>

堀江様

先ほどのお見積りありがとうございます。
増刷部数を3,000部から4,000部へ変更した内容で、最終確認書をご用意いただけますでしょうか。

よろしくお願いいたします。
```

### Message `s1-m2`

```text
2026-09-02 09:20 JST
From: 堀江 美香 <mika.horie@koyo-print.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

4,000部へ変更した内容で校了データと発注確認書を更新しました。
添付の「発注確認書_2026-09.pdf」の部数・納期をご確認ください。

問題なければ、確認書へ署名のうえ **9月4日（金）17:00まで** にこのメールへ返信添付をお願いします。
入稿締切の都合上、期限を過ぎる場合は事前にご連絡ください。

よろしくお願いいたします。
```

Attachment `s1-a1`:

```text
filename: 発注確認書_2026-09.pdf
summary: 4,000部 / 納品予定 2026-09-18 / 税込 418,000円 / 署名欄あり
source: s1-m2
```

## Responsibility interpretation boundary

```text
responsibility: resp-s1-order-confirmation
projection: MY_TURN
current user obligation: 発注確認書の内容を確認し、署名して返信添付する
source due: 2026-09-04 17:00 JST
user target: none
resurface time: none
expected external event: none before user action
primary Moment: resp-s1-order-confirmation
safe primary product action: 発注確認書を開く
provenance: s1-m2 + s1-a1
```

`発注確認書を開く` is a safe prototype action. Opening the file is **not** completion evidence.

## Expected operational decision

Correct answer must include materially:

> 今は自分の対応。発注確認書を確認・署名し、9月4日17:00までに返信添付する。

The participant does not need to say `MY_TURN`.

Source basis: `s1-m2`, with attachment `s1-a1` supporting what must be checked.

Opening the source thread/attachment is optional.

## Baseline fairness

Baseline row may show sender, subject, snippet containing `9月4日（金）17:00まで`, timestamp and attachment indicator. Row click opens the complete thread and attachment.

Do not truncate the snippet specifically to hide the due date.

## Scenario-specific forbidden outcomes

- project as Waiting/Later/Done/NONE while the user obligation is actionable;
- imply opening the PDF completes the obligation;
- hide or alter the source due date;
- invent a different internal deadline as if it were the source deadline;
- offer an unsafe fake `発注する` action that bypasses signature/reply requirements;
- give Lunowa access to attachment content that baseline cannot open.

## Record

`T_action`, `N_reread`, `N_nav`, `N_transfer`, `Correct_state`, `Source_recheck`, due-date comprehension, provenance-use observation.

---

# 6. S2 — WAITING: legal confirmation pending

## Purpose

Primary pressure: **H1/H2**.

Unique question: can the participant safely stop working/rechecking when the user already acted and the next meaningful event belongs to the counterpart?

## Shared source evidence

Account/scope:

```text
acct-work / 仕事
```

Conversation:

```text
id: conv-s2
subject: 業務委託契約書ドラフトの法務確認
```

### Message `s2-m1`

```text
2026-09-01 10:05 JST
From: 佐藤 怜奈 <reina.sato@seiwa-partners.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

先日の打ち合わせ内容を反映した契約書ドラフトをお送りいただけますでしょうか。
受領後、弊社法務で確認します。
```

### Message `s2-m2`

```text
2026-09-02 14:12 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 佐藤 怜奈 <reina.sato@seiwa-partners.example>

佐藤様

修正版を添付します。
打ち合わせで合意した成果物範囲と検収条件を反映しました。
ご確認をお願いいたします。
```

Attachment `s2-a1`:

```text
filename: 業務委託契約書_v3.docx
source: s2-m2
```

### Message `s2-m3`

```text
2026-09-02 16:08 JST
From: 佐藤 怜奈 <reina.sato@seiwa-partners.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

受領しました。現在、法務で確認中です。
**9月5日中** を目安に回答します。
追加で確認が必要な点があればこちらからご連絡します。
```

Synthetic user attention event `s2-e1` shared by both conditions:

```text
2026-09-02 16:10 JST
User set a conventional reminder / Lunowa waiting-return check:
「9月7日 09:00まで返信がなければ再確認」
```

## Responsibility interpretation boundary

```text
responsibility: resp-s2-contract-review
projection: WAITING
current user obligation: none
next expected event: counterpart legal-review response
source expected date: 2026-09-05 (DATE; message says 9月5日中)
follow-up/resurface check: 2026-09-07 09:00 JST, explicitly user-set in s2-e1
primary Moment: resp-s2-contract-review
safe primary action: none required
provenance: s2-m2 + s2-m3 + s2-e1
```

The follow-up check is not a current obligation and does not create a `FOLLOW_UP` lifecycle state.

## Expected operational decision

Correct answer materially:

> 今は追加対応しない。こちらから修正版は送付済みで、佐藤さん側の法務回答待ち。9月7日9:00まで返信がなければ再確認する。

Opening the thread is optional.

## Baseline fairness

Baseline shows the full sent/received chronology, including the user's sent attachment and the counterpart's `9月5日中` reply. Because `s2-e1` is shared evidence, a competent baseline may visibly show a standard reminder marker for 9月7日9:00.

## Scenario-specific forbidden outcomes

- render a dominant `返信する` or other current-work CTA;
- classify as Done simply because the user sent the draft;
- classify as Later merely because the item is not current work;
- imply the counterpart's promised response is already received;
- turn the user-set follow-up check into a source due date;
- hide the fact that the next event belongs to the counterpart.

## Record

`T_action`, repeated-check intent, `N_reread`, `N_nav`, `N_transfer`, `Correct_state`, `Source_recheck`, understanding of who/what is pending.

---

# 7. S3 — LATER: explicit user defer before renewal decision

## Purpose

Primary pressure: **H1/H2**.

Unique question: does Lunowa communicate intentional defer/return semantics more clearly than a competent conventional snooze without misclassifying blocked work as Later?

## Shared source evidence

Account/scope:

```text
acct-work / 仕事
```

Conversation:

```text
id: conv-s3
subject: DesignCloud 年間プラン更新のご確認
```

### Message `s3-m1`

```text
2026-09-03 08:30 JST
From: DesignCloud 更新窓口 <renewal@designcloud.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

年間プランは10月1日に更新予定です。
今回、現行プラン継続または新しいチームプランへの変更をお選びいただけます。

プラン変更をご希望の場合は **9月12日 18:00まで** に管理画面でお手続きください。
それ以降は現行プランで更新されます。
```

Synthetic explicit user attention event `s3-e1`:

```text
2026-09-03 09:05 JST
User intentionally deferred this actionable decision until:
2026-09-08 09:00 JST
Reason shown to facilitator only: 9/7のチーム人数確定後に判断するため
```

## Responsibility interpretation boundary

```text
responsibility: resp-s3-renewal-choice
projection: LATER
underlying user obligation: 更新プランを判断する（actionable in principle）
source due: 2026-09-12 18:00 JST
user target: none
resurface time: 2026-09-08 09:00 JST, explicit user defer
external party pending: none
primary Moment: resp-s3-renewal-choice
safe primary action: 条件を変更 (secondary; no dominant work action now)
provenance: s3-m1 + s3-e1
```

## Expected operational decision

Correct answer materially:

> 今は対応しない。自分で9月8日9:00まで延期した更新判断で、9月8日に戻る。相手待ちではない。元の変更期限は9月12日18:00。

## Baseline fairness

Because `s3-e1` is shared evidence, baseline must show a recognizable snooze/reminder marker such as `9/8 9:00までスヌーズ`. It may also show the source snippet with `9月12日 18:00まで`.

Do not remove normal snooze capability just to make Later look useful.

## Scenario-specific forbidden outcomes

- classify as Waiting when no external event is pending;
- omit the explicit return time;
- replace the source due with the resurface time or vice versa;
- show a dominant current-work CTA despite the explicit defer;
- claim the product decided to defer when `s3-e1` says the user did;
- handicap baseline by hiding its standard snooze state.

## Record

`T_action`, `Correct_state`, return-time/source-due distinction, `N_reread`, `N_nav`, `N_transfer`, `Source_recheck`, trust in return promise.

---

# 8. S4 — REVIEW: unverified bank-detail change

## Purpose

Primary pressure: **H2**, secondary H1.

Unique question: can Lunowa surface a decision-critical safety/authority conflict without inventing certainty, while a competent baseline still exposes the raw warning signs?

## Shared source evidence

Account/scope:

```text
acct-work / 仕事
```

Conversation:

```text
id: conv-s4
subject: 請求書 HL-8821 / 8月配送分
```

### Message `s4-m1`

```text
2026-09-02 10:15 JST
From: 北斗ロジスティクス 請求担当 <billing@hokuto-logistics.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

8月配送分の請求書を添付します。
請求金額は486,200円、支払期日は **9月8日** です。
振込先は請求書記載の青葉銀行 本店 普通 0001234 です。

よろしくお願いいたします。
```

Attachment `s4-a1`:

```text
filename: HL-8821_請求書.pdf
summary: 486,200円 / 支払期日 2026-09-08 / 青葉銀行 本店 普通 0001234
source: s4-m1
```

### Message `s4-m2`

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
No previously trusted evidence in the scenario establishes that
hokuto-payments.example is an authorized payment-change domain.
No provider fact says the message is fraudulent either.
```

## Responsibility interpretation boundary

```text
responsibility: resp-s4-invoice-payment
projection: REVIEW
material obligation: invoice payment remains real/open
source due: 2026-09-08 (DATE)
critical uncertainty: authority/legitimacy of changed bank instructions
known conflict: original invoice/original domain vs new unverified domain/instructions
primary Moment: resp-s4-invoice-payment
safe primary action: 依頼を確認
unsafe direct action: 支払う
provenance: s4-m1 + s4-a1 + s4-m2 + absence-of-authority evidence fact
```

Review is caused by decision-critical safety/authority uncertainty, not harmless model uncertainty.

## Expected operational decision

Correct answer materially:

> まだ新しい口座へ支払わない。振込先変更の権限・正当性を、既知の連絡先や元の請求元情報で確認してから判断する。

The participant must not be required to declare the message fraudulent; that is not established by evidence.

Opening sender/source evidence is expected or at least reasonable. Provenance use is a core observation here.

## Baseline fairness

Baseline must show the full sender email address, original invoice attachment and chronology. A competent conventional external-sender/domain warning may be shown for `hokuto-payments.example`.

Baseline must not be stripped of standard phishing/security affordances.

## Scenario-specific forbidden outcomes

- present `星川銀行...0005678` as verified truth;
- offer `支払う` as the dominant safe CTA;
- classify as ordinary My Turn with no material warning;
- classify as Done/Waiting/Later to avoid the uncertainty;
- declare the message fraudulent without evidence;
- hide either conflicting source;
- show a confidence percentage instead of the material conflict;
- give baseline an intentionally obscured sender address.

## Record

`T_action`, `Correct_state`, `Source_recheck`, whether participant can explain why Review exists, whether evidence is sufficient, whether Review feels like safety help vs debug burden.

---

# 9. S5 — DONE: cancellation accepted, no success fiction

## Purpose

Primary pressure: **H1/H2**.

Unique question: can resolved work become safely ignorable while preserving a truthful non-success resolution reason?

## Shared source evidence

Account/scope:

```text
acct-work / 仕事
```

Conversation:

```text
id: conv-s5
subject: 9/18 研修室予約 R-271 キャンセル依頼
```

### Message `s5-m1`

```text
2026-09-01 11:18 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 東都カンファレンス予約窓口 <booking@toto-conference.example>

予約番号R-271（9月18日 研修室B）について、社内予定変更のためキャンセルをお願いします。
キャンセル料の有無もあわせてご確認ください。
```

### Message `s5-m2`

```text
2026-09-01 13:30 JST
From: 東都カンファレンス予約窓口 <booking@toto-conference.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

予約番号R-271のキャンセル手続きが完了しました。
今回は期限内のためキャンセル料は発生しません。
追加のお手続きは不要です。
```

## Responsibility interpretation boundary

```text
responsibility: resp-s5-cancel-room
projection: DONE
resolution reason: cancelled
current user obligation: none
primary Moment: resp-s5-cancel-room
safe primary action: none
provenance: s5-m1 + s5-m2
```

## Expected operational decision

Correct answer materially:

> キャンセルは受け付け済みで、追加対応はない。もう何もしなくてよい。

## Baseline fairness

Baseline shows the last reply snippet including `キャンセル手続きが完了` and opens the full thread in one normal row click.

## Scenario-specific forbidden outcomes

- imply `成功` / `満足に完了` rather than truthful cancellation;
- show a dominant CTA;
- keep My Turn because the original reservation existed;
- treat opening the confirmation message as the event that caused completion;
- hide the `追加のお手続きは不要` evidence from baseline.

## Record

`T_action`, `Correct_state`, `N_reread`, `N_nav`, `N_transfer`, `Source_recheck`, whether participant feels safe ignoring the item.

---

# 10. S6 — multiple Responsibilities: one primary Moment

## Purpose

Primary pressure: **H1/H3**.

Unique question: can Lunowa preserve multiple independent operational loops inside one Conversation while presenting exactly one sensible default primary Moment rather than a CTA wall?

## Shared source evidence

Account/scope:

```text
acct-work / 仕事
```

Conversation:

```text
id: conv-s6
subject: 10/2 展示会ブース準備事項
```

### Message `s6-m1`

```text
2026-09-01 09:00 JST
From: 加藤 結衣 <yui.kato@east-hall.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

10月2日の展示会ブースについて、以下3点お願いします。

1. レイアウト修正版PDFを **9月4日 15:00まで** にご返信ください。
2. 電源容量はこちらで会場管理へ確認します。機材リストをいただければ確認を進めます。
3. 看板の正式発注は9月8日の色校確認後で構いません。発注期限は **9月10日 17:00** です。

よろしくお願いいたします。
```

### Message `s6-m2`

```text
2026-09-02 11:20 JST
From: 森川 直人 <naoto.morikawa@aoba-design.example>
To: 加藤 結衣 <yui.kato@east-hall.example>

加藤様

機材リストを添付します。
電源容量の確認をお願いします。
レイアウト修正版は別途お送りします。
```

Attachment `s6-a1`:

```text
filename: 展示会_機材リスト.xlsx
source: s6-m2
```

### Message `s6-m3`

```text
2026-09-02 13:05 JST
From: 加藤 結衣 <yui.kato@east-hall.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

機材リスト受領しました。
会場管理へ電源容量の確認を依頼済みです。**9月5日中** に回答見込みです。
```

Synthetic explicit user attention event `s6-e1`:

```text
2026-09-03 09:15 JST
User intentionally deferred the signboard-order decision until:
2026-09-08 16:00 JST
Reason: 色校確認後に発注内容を確定するため
```

## Responsibility interpretation boundary

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
underlying user obligation: 色校確認後に看板を正式発注する
source due: 2026-09-10 17:00 JST
resurface time: 2026-09-08 16:00 JST, explicit user defer s6-e1
provenance: s6-m1 + s6-e1
```

### Default primary Moment

```text
primaryResponsibility: resp-s6-layout
reason: nearest material currently actionable USER source due
safe primary action: 会話を開いて返信を準備
```

The three Responsibilities remain independent. Selecting a secondary item may change the active Moment view but must not rewrite the other items or create one Conversation lifecycle.

## Scenario-specific facilitator prompt

> この会話について、今まず何をすべきか判断してください。ほかに気にしておくことがあれば合わせて説明してください。必要ならメール本文や添付を確認して構いません。

This does not name the three expected states.

## Expected operational decision

A fully correct answer materially identifies:

1. **first priority:** send the revised layout PDF by 9/4 15:00;
2. power-capacity item: user already supplied the equipment list and is waiting for the external answer expected by 9/5;
3. signboard order: intentionally deferred until 9/8 16:00, with source deadline 9/10 17:00.

For `T_action`, stop at the participant's first correct identification of the primary action. Continue observing the rest for complexity/trust/H3 evidence.

## Baseline fairness

Baseline exposes all messages in the single thread, the attachment indicator, sender/time/snippets and ordinary thread search/scroll. It must not hide the numbered three-item request.

It may use normal flags/stars but not synthesized per-item Responsibility states.

## Scenario-specific forbidden outcomes

- flatten the whole Conversation into one lifecycle value;
- show three equal-priority primary CTAs;
- choose newest message rather than the nearest actionable material user due;
- mark the power item My Turn after the equipment list was already sent;
- mark the signboard item Waiting instead of explicit user defer;
- hide one item because another is primary;
- mutate secondary items when the active Moment selection changes.

## Record

`T_action` for primary choice, `Correct_state` for primary plus three-item classification, `N_reread`, `N_nav`, `N_transfer`, `Source_recheck`, H3 hidden-alternative concern, whether secondary items remain understandable without CTA overload.

---

# 11. S7 — cross-account/scope: similar subject, separate obligations

## Purpose

Primary pressure: **H4**, with H1/H2.

Unique question: can a unified attention surface reduce account switching while preserving explicit account/source/sending identity and refusing semantic auto-merge across superficially similar mail?

## Shared source evidence

This scene contains two separate Conversations.

### Conversation `conv-s7-work`

Account/scope:

```text
acct-work / 仕事
recipient identity: naoto.morikawa@aoba-design.example
```

Subject:

```text
[CloudPort] 契約更新のご案内
```

Message `s7-w-m1`:

```text
2026-09-02 09:10 JST
From: CloudPort 更新窓口 <renewals@cloudport.example>
To: 森川 直人 <naoto.morikawa@aoba-design.example>

森川様

法人契約 CP-W-482（Team / 20席）は10月1日に更新予定です。
継続の場合は、添付の更新申込書へ社内発注番号を記載し、
**9月9日 17:00まで** にこのメールへ返信添付してください。

法人契約に関する返信は、登録済みの法人メールアドレスからお願いいたします。
```

Attachment `s7-w-a1`:

```text
filename: CP-W-482_更新申込書.pdf
source: s7-w-m1
```

### Conversation `conv-s7-personal`

Account/scope:

```text
acct-personal / 個人
recipient identity: naoto@morikawa-lab.example
```

Subject:

```text
[CloudPort] 契約更新のご案内
```

Message `s7-p-m1`:

```text
2026-09-02 09:12 JST
From: CloudPort 更新窓口 <renewals@cloudport.example>
To: 森川 直人 <naoto@morikawa-lab.example>

森川様

個人契約 CP-P-119（Personal Pro）は10月1日に更新予定です。
登録カードの有効期限が9月末のため、継続する場合は
**9月15日 23:59まで** に個人アカウントの管理画面で支払い方法を更新してください。

この手続きにメール返信は不要です。
```

Frozen relation fact:

```text
The two messages share sender organization and subject text,
but they belong to different accounts, contract ids, Conversations and obligations.
No evidence authorizes semantic merge.
```

## Responsibility interpretation boundary

### `resp-s7-work-renewal`

```text
conversation: conv-s7-work
account/scope: acct-work / 仕事
projection: MY_TURN
obligation: 法人更新申込書へ社内発注番号を記載し返信添付
source due: 2026-09-09 17:00 JST
required reply identity: naoto.morikawa@aoba-design.example
provenance: s7-w-m1 + s7-w-a1
```

### `resp-s7-personal-payment`

```text
conversation: conv-s7-personal
account/scope: acct-personal / 個人
projection: MY_TURN
obligation: 個人CloudPortアカウントで支払い方法を更新
source due: 2026-09-15 23:59 JST
email reply: not required
account context: naoto@morikawa-lab.example
provenance: s7-p-m1
```

The two Responsibilities remain separate. There is **no combined Responsibility/Moment** merely because sender and subject match.

Default primary item for a unified attention list at the frozen clock:

```text
resp-s7-work-renewal
reason: earlier material source due (9/9 17:00 vs 9/15 23:59)
```

If the work Conversation reply composer is shown, `From` must explicitly be `naoto.morikawa@aoba-design.example`.

## Scenario-specific facilitator prompt

> 似た件名の更新メールが2件あります。今どの対応が先かを判断し、それぞれ何をする必要があるか説明してください。メール返信が必要な場合は、どのアカウントから送るべきかも答えてください。

The prompt acknowledges visible similarity but does not teach merge/non-merge or projection labels.

## Expected operational decision

Fully correct answer materially:

- these are **two separate contracts/tasks**, not one merged thread/task;
- work CP-W-482 is first because 9/9 17:00 is earlier; update the corporate form and reply from the **work account**;
- personal CP-P-119 requires payment-method update in the personal account by 9/15 23:59 and requires **no email reply**.

## Baseline fairness

Baseline must support a competent unified/all-inboxes view with two separate rows, both showing account badges. It may sort by received time and allows account switching/filtering. Opening each row shows its exact recipient account and full thread.

Do not force baseline users to manually visit two inboxes if the conventional baseline being represented supports unified inboxes. Plain multi-account aggregation is not Lunowa's claimed differentiator.

## Scenario-specific forbidden outcomes

- merge the two Conversations/Responsibilities because sender or subject matches;
- hide account badge/source identity in unified attention;
- reply to the work contract from the personal account;
- imply an email reply is needed for CP-P-119;
- show one combined deadline/action summary;
- make baseline cross-account navigation artificially worse than a competent unified inbox;
- treat H4 success as proven merely because two accounts are displayed.

## Record

`T_action`, `N_nav` including account switching/filtering, `Correct_state`, sender/account identity correctness, `N_reread`, `N_transfer`, `Source_recheck`, H4 confusion/reduction observations.

---

## 12. Cross-scenario semantic invariants

The implementation must preserve all of these:

1. Conversation is not Responsibility.
2. Projection equality does not imply semantic equality.
3. A real actionable user obligation must not be hidden as Waiting/Later/Done/NONE.
4. `WAITING` means no current user action and next meaningful event belongs to another party/external event.
5. `LATER` requires explicit/validated defer/return semantics; communication hold is not Later.
6. Follow-up is a reason/action that may return a Responsibility to `MY_TURN`; it is not a lifecycle species.
7. `DONE` carries truthful resolution reason; cancelled/declined/superseded is not fictional successful satisfaction.
8. `REVIEW` must expose only material decision-critical uncertainty and relevant evidence; it must not invent certainty.
9. Opening a message/attachment is not completion evidence.
10. Multiple Responsibilities preserve independent state and one default primary Moment.
11. Cross-account semantic similarity never authorizes merge.
12. Sending identity is explicit where reply identity is material.
13. Source due, user target, resurface time, expected-event date and follow-up time are distinct facts.
14. Baseline and Lunowa receive identical source evidence.

---

## 13. Implementation translation boundary

An implementation may translate this document into typed fixtures, but the translation must be mechanical.

Allowed implementation choices include:

- TypeScript identifier naming;
- component boundaries;
- how fixture files are split;
- route/query parsing;
- visual component implementation;
- test-helper structure.

Not allowed without specification revision:

- changing exact source message text;
- changing timestamps/dates/amounts;
- changing account/sender/recipient identity;
- changing which evidence belongs to which Conversation;
- changing expected projection/decision;
- changing primary Responsibility selection;
- changing baseline evidence availability;
- changing forbidden outcomes;
- adding a canonical persisted lifecycle interpretation.

If the renderer needs fields not expressible from this oracle without inventing Product meaning, stop and raise a specification gap.

---

## 14. Required implementation assertions derived from this oracle

At minimum, the later Issue #28 implementation should mechanically prove:

- both modes reference the same scenario evidence ids/content;
- S1 yields the frozen My Turn action/source due and does not treat file open as completion;
- S2 has no dominant current-work CTA and preserves counterpart waiting + follow-up check distinction;
- S3 preserves `source due != resurface time` and does not become Waiting;
- S4 has no direct payment CTA and exposes both conflicting provenance sources;
- S5 exposes cancellation as the truthful resolution reason;
- S6 contains exactly the three specified Responsibility fixtures and defaults to `resp-s6-layout` as primary;
- S7 contains two separate Conversations/Responsibilities/accounts and never produces a merged semantic item;
- S7 work reply context uses the work From identity;
- baseline-specific modern affordances required by the fairness contract are present;
- all scenario ids are deterministic at the frozen evaluation clock.

These are experiment assertions, not production reducer tests.

---

## 15. Independent review questions for Issue #32

The reviewer must try to falsify this candidate on these points:

1. Is every expected decision objectively derivable from the frozen evidence?
2. Does any scenario invent a Responsibility semantic rule not already accepted?
3. Is any baseline artificially weakened?
4. Does S3 fairly compare Later against a competent conventional snooze?
5. Does S4 remain uncertain rather than silently declaring fraud or legitimacy?
6. Does S5 preserve a non-success resolution reason truthfully?
7. Does S6 really contain three independent operational loops with one justified primary Moment?
8. Does S7 test H4 beyond plain unified-inbox aggregation and preserve reply identity?
9. Could a builder still materially change H1–H4 observability while claiming to merely implement fixtures?
10. Are participant prompts neutral enough that they do not teach the expected projection vocabulary?
11. Are `T_action`, reread/navigation/transfer/source-recheck measures interpretable without a post-hoc aggregate score?
12. Does the artifact remain an experiment oracle rather than a disguised production data model?

Required disposition for this artifact:

```text
PASS / ORACLE SUPPORTED
or
FAIL / REVISE
```

A PASS here still does not authorize Issue #28 write-heavy implementation until:

- PR #30 is reconciled and independently re-reviewed to `PASS / IMPLEMENTATION SUPPORTED`;
- exact-head mechanical gates pass;
- the separate unattended implementation-harness minimum reliable v0.1 resume gate is satisfied.

---

## 16. Acceptance checklist

- [x] S1–S7 have exact synthetic shared source evidence sufficient for deterministic rendering.
- [x] Baseline and Lunowa are required to use semantically identical evidence per scenario.
- [x] Every scenario has an explicit expected operational decision and source basis.
- [x] Every scenario has scenario-specific forbidden outcomes/falsifiers.
- [x] My Turn / Waiting / Later / Done / Review semantics follow current canonical interaction rules.
- [x] S6 has three independent Responsibilities and one justified default primary Moment.
- [x] S7 has two accounts/scopes, explicit sender identity and a no-auto-merge oracle.
- [x] S4 uses material authority/safety uncertainty and does not invent certainty.
- [x] Participant prompts avoid requiring Lunowa projection vocabulary.
- [x] Measurement fields align with Issue #26 and no aggregate score is invented.
- [x] Fixture meaning is explicitly experiment-only and does not freeze production persistence.
- [x] No private participant/mail content is committed.
- [ ] Independent review completed on the exact candidate.
- [ ] Repository mechanical checks completed on the exact candidate.

Until the final two items pass, this file remains a candidate.