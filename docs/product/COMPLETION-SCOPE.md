# Lunowa completion scope — 2026-09-18

## Status and authority

ユーザーが明示した完成範囲と制約を記録する。今回のローカル文書変更は未マージのcanonical-promotion candidateであり、実装完了の証拠ではない。

実行計画・順序・子Issue・現在の状態は [完成計画 #175](https://github.com/miki-labs/lunowa/issues/175) が所有する。この文書にタスク一覧を複製しない。着手前にlive Issue、blocked_by、コード、PR、実行環境を再確認する。

承認済み画面、既存コード/APIの再利用、全ボタンの本番意味、段階的な整理候補、外部準備状況のM0引継ぎは [m0-baseline.md](../m0-baseline.md) に記録する。実装時はその文書に固定されたmutable stateを再確認する。

## Accepted user direction

- 承認された参照02/03の画面を基準に実用化する。白い面、ネイビー、青紫の光沢、3列、左ナビ、折り畳み、ドラッグ幅調整を保つ。00/01は共通の見た目の参考。サンプルの固定件数・送信者・AI文を本番事実にしない。
- 完成範囲にはGmailとOutlook、および同じサービス内・異なるサービス間の複数アカウント統合表示を含む。従来のGmail-only完成範囲を、この追加合意について拡張する。
- 最初に既存Gmail処理を新画面へ接続し、その後Outlookを追加する。既存のResponsibility・監視・AI処理は再利用して新画面につなぐ。完成はメール閲覧だけでなく、必要な対応を任せて再確認・返信できることを含む。
- 過剰設計を避ける。既存コードの重複・不要部分は使用経路と根拠を確認して整理し、各機能の変更に関係する範囲で修正する。大規模リライトや将来用の汎用基盤を目的にしない。

## Bounded implementation target

計画の初期対象はGmail/Google Workspace、Outlook.com、Microsoft 365の本人用メールボックス。共有/代理メールボックス、IMAP/POP、オンプレExchange、カレンダー、CRM、自動/予約送信、オフライン送信キュー、課金は今回の実装対象に加えない。変更が必要なら具体的な利用目的と小さい実装契約を先に確認する。

LunowaへのGoogleログインと各メールボックスへの同意を分離する。Outlook接続のためだけにMicrosoftによるアプリログインを必須化しない。Microsoft-only利用者向けログインは将来の別判断。

アカウント欄はサービスアイコン・表示名・アドレス・接続状態を表示し、「すべて」と個別の絞り込みを提供する。細かなボタンの意味と新規メールのprovider側導線はM0で既存契約と整合させる。未実装ボタンを本番の動作として提示しない。

## Invariants retained

- 統合表示はcross-account semantic mergeではない。Conversation/Responsibility/資格情報/送信元のaccount境界を保持する。
- Provider mailbox stateとResponsibility stateは別。読んだ・返信した・送信しただけで業務を完了させない。
- AIは理解と提案を行い、権限・accepted state・送信先・実送信を決定しない。手動経路を残す。
- Send要求、provider受付、送信照合、配送、業務完了を区別する。曖昧な送信結果を盲目的に再送しない。
- 初回同期未完了・一部接続障害・監視停止を、ゼロ件/健全/監視中に見せない。
- メール本文・添付はuntrusted。アカウント境界や認証・送信・監視・復旧の保護と必要なテストを「無駄」として削除しない。

## Completion evidence

GmailとOutlookの混在を実アカウント・実DB・実ブラウザで確認する。単体/DB/API/ブラウザ/画像比較は、変更と主張に必要な範囲で行う。過去Issueがclosedでも、現在のコード・デプロイ・providerが検証済みとは限らない。

限定利用での機能完成と一般公開を分ける。一般公開には現行のGoogle/Microsoft同意・公開条件、運用・復旧・データ取り扱いの確認も必要。実装完成は市場/商業的成功の証明ではない。
