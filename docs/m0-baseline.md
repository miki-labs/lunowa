# M0 baseline — accepted workspace, authentication, and production semantics

## Status and use

This document is the implementation handoff for [Issue #176](https://github.com/miki-labs/lunowa/issues/176), under [completion plan #175](https://github.com/miki-labs/lunowa/issues/175). It records the repository state inspected on 2026-09-18 and the decisions that later Gmail and Outlook work must preserve.

The inspected Git base is `fead4e1b0e6b3ef8eba4b36396ba5d20f2b5055c`; the working candidate is on `codex/176-baseline-reconciliation` and includes the same-session, uncommitted Auth and accepted-reference UI work. This SHA identifies the base, not the complete candidate. Before implementation, use the accepted M0 commit/PR revision produced from this working candidate and re-check live Issue, PR, CI, and worktree state.

This baseline does not prove a live Google or Microsoft consent flow, mailbox sync, database integration, or email delivery. It adds no Gmail or Outlook feature wiring.

### Human summary（日本語）

M0の基準は、承認済み02/03の見た目と幅調整をsample previewとして保持し、実際の認証・Source・Responsibility・下書き・送信は既存`AuthBoundary` / `LunowaShell` / BFF / server境界を再利用する方針です。プレビューの固定データや操作を本番へ接続しません。旧PR #171は一括マージせず、不足している3つの安全な挙動だけをM1/M2で現候補へ実装・検証します。Gmailを先に接続し、Outlookと複数アカウント表示を完成範囲に含めますが、M0自体は実provider動作の完成を意味しません。

## Accepted visual and interaction baseline

The source visual target is reference 02 for the desktop workspace and reference 03 for Moment, conversation history, and reply. `docs/reference-reproduction.md` defines the comparable state and render conditions. The reusable direction is:

- light surfaces, navy text, blue-violet glossy primary controls, and the accepted three-column composition;
- a collapsible left navigation rail and two keyboard- and pointer-operable draggable panel boundaries;
- initial 02/03 proportions, sidebar width 220–360 px (76 px collapsed), list width 320–640 px, and detail minimum 420 px;
- compact behavior at 1000 px and below, with list/detail navigation rather than unusably narrow panes;
- Japanese and English, focus restoration, keyboard separators, IME-safe reply behavior, and a draft retained independently for each selected conversation;
- reference fixture values only inside the opt-in preview. Names, counts, account identities, AI text, read state, and Responsibility state are never production facts.

`src/app/[locale]/preview/page.tsx` routes the default and `?view=moment` previews to `ReferenceWorkspace`; `?view=runtime` routes to the existing fixture-backed `LunowaShell`. The route is guarded by `LUNOWA_UI_PREVIEW=true`, dynamic, and noindex. Production `/[locale]` continues through `AuthBoundary`.

## Ownership and reuse map

| Area | Current owner / route | Decision for later work |
| --- | --- | --- |
| Application identity and session | `src/app/[locale]/page.tsx` -> `AuthBoundary`; `auth-entry.tsx`; Better Auth routes/config | **Keep.** The current candidate implements #174's Google application sign-in while preserving app-session vs mailbox-consent separation. It also retains #112's single-flight/stale-probe protections and truthful failure states. Do not reimplement Auth inside the workspace. |
| Accepted appearance and pane interaction | `ReferenceWorkspace`, `reference-workspace.css`, preview route, reference assets, preview tests | **Keep as an explicit sample oracle.** Reuse its visual composition, scoped styles/tokens where suitable, responsive decisions, and `react-resizable-panels` behavior. Do not connect its fixture state or preview notices to production APIs. |
| Production shell and controller | `LunowaShell`, `lunowa-shell-model.ts`, `WorkspaceHome`, production shell tests | **Consolidate during M1/M2.** Keep `LunowaShell` as the data/action controller and adapt its rendered structure to the accepted reference. `WorkspaceHome` remains the current production Home presentation until that integration; it must not become a second long-lived workspace owner. |
| Source list, detail, search, attachments | `source-ui.tsx`; `/api/bff/users/[userId]/source/conversations`, conversation detail, search, and Gmail attachment routes; Source repository | **Keep and reuse.** These paths already enforce session/ownership boundaries, account-aware Source reads, exact search, pagination, readiness, and safe attachment retrieval. Render them through the accepted panes rather than reconstructing Source from fixtures. |
| Attention / Responsibility | `LunowaShell` reads `/attention` and writes `/attention/actions`; server Attention/Responsibility owners | **Keep and reuse.** Needs You, Managed, Review, Later, Done, Moment, and accepted mutations come from projections/actions. Provider read/star state must not mutate Responsibility implicitly. |
| Reply drafts and Send | `LunowaShell`; `/drafts/context`, `/drafts`, `/send-operations`; communication repositories/services | **Keep and reuse.** Preserve account-bound sender/recipient context, Reply/Reply All, draft identity/version, explicit immediate Send, pending/failure/ambiguous/reconciled states, and IME safeguards. The reference composer is presentation-only. |
| Gmail mailbox connect/reconnect/disconnect | Settings in `LunowaShell`; `/gmail/authorize`, `/gmail/accounts`, Gmail adapter/repository | **Keep for M1/M2.** It is mailbox authorization, separate from application Google sign-in. Provider-specific types/effects stay behind the adapter/BFF boundary. |
| Multi-account evidence | `connectedAccounts`, `providerSyncStates`, account-bound conversations/messages; Source repository account listing/filter | **Keep and extend narrowly.** Existing storage/read models already preserve account/provider identity and account filters. Outlook work should add a thin provider path; it must not introduce cross-account semantic conversation merging. |
| Icons and panel library | `lucide-react`; `react-resizable-panels` | **Keep.** Both have current imports and verified UI purposes. They are not dependency-cleanup candidates. |

### Existing issue and PR disposition

- **#174 Auth/session entry:** incorporate the current same-session candidate as the application-entry owner. Its Google app sign-in uses only identity scopes; Gmail mailbox consent remains separate. M0 does not claim external OAuth callback acceptance and does not close #174; its rollout and rendered acceptance remain `NOT_VERIFIED` until that Issue's gates pass.
- **#112 Auth UX:** preserve the current `AuthBoundary` race/single-flight work and its deterministic tests. The visual rewrite does not replace those semantics. M0 does not close #112 or claim current deployed transition acceptance.
- **#155 / PR #171:** do not merge automatically. The inspected open head is `33274b97ab5f391320d1f3c0400d848a128e22c4`, with 8 changed files and a cumulative `+801/-127` patch. It is useful evidence for production-shaped Home/Attention/Source/Reply behavior and contains corrections around selected typed attention, Later-only truth, and clearing stale draft identity while replacement context loads. Its broad visual treatment is superseded by the explicitly accepted reference 02/03 reproduction. Its Auth patch additionally trusts HTTPS sibling Worker preview origins derived from a hostname prefix; that behavior is absent from this candidate and must receive separate, bounded security/runtime justification if branch-preview OAuth requires it. Preserve the current configured Auth-origin policy until such evidence exists. Reconcile any still-missing behavioral correction into the same production controller/tests before closing or superseding the PR; do not import its `globals.css` presentation wholesale or keep two Home implementations.

### PR #171 behavioral comparison

The three independently useful corrections below were searched in the current candidate and are not present in equivalent implementation/tests. They are accepted missing behavior, not reasons to merge the PR wholesale.

| PR #171 behavior | Current candidate | Owner and action |
| --- | --- | --- |
| Sort typed Needs You and Review entries by accepted delay relevance and select the item whose detail is actually active | **Missing.** Current `WorkspaceHome` renders Needs You then Review and compares the selected origin, without the PR's combined ordering helper/test. | **M1 accepted-shell controller/Home integration.** Port the smallest behavior and deterministic test while adapting presentation to reference 02/03. |
| Represent a Later-only state truthfully instead of showing zero Managed/false reassurance | **Partially represented elsewhere but missing in current Home summary.** The existing Managed surface distinguishes Later; `WorkspaceHome` still reports only `managedCount` in its Home metric/section. | **M1 accepted-shell Home projection.** Show Later separately or with explicit wording; do not count it as healthy Managed or strict zero. Add the focused projection test. |
| Clear the previous conversation's sender/recipient/draft identity and block Send while a newly selected Moment reply context loads | **Missing.** The current candidate does not contain PR #171's loading transition or regression test. | **M2 communication connection.** Clear/fence prior context on identity change, render local loading truth, and expose no Send until the new account-bound context resolves. Port the deterministic delayed-response test. |

### Integration order

1. Integrate this M0 baseline candidate first through its own commit/PR, CI, and independent exact-head review; do not auto-merge it or any overlapping PR.
2. Keep #174 and #112 open until their own external/rendered acceptance is satisfied. M0 records their code ownership and unverified gates; it does not substitute for them.
3. Do not merge or cherry-pick PR #171 wholesale. Keep it as read-only evidence while the accepted visual candidate becomes the shared base.
4. Start M1 from the accepted M0 revision. Bring over only the verified missing Home behaviors in the table, implemented against the accepted workspace structure and current controller.
5. Start M2 after the M1 base is accepted, then bring over the verified stale-reply-context correction and its test. Any later PR #171 disposition is an explicit GitHub action after equivalent behavior is accepted, never an automatic side effect of M0.

## Production control contract

The accepted image contains controls whose sample behavior is not a production contract. The production meaning is fixed as follows.

| Visible control | Production meaning and owner | Current state / delivery stage |
| --- | --- | --- |
| Add account; All; individual accounts | Start provider-specific mailbox consent; show provider icon plus display name, address, connection/sync state; filter the account-bound Source projection. “All” is a union of results, never a semantic merge. | Gmail connect and account-aware Source foundations exist; accepted-shell wiring is M1. Outlook is M3+. |
| Needs You / Managed / Review / Later / Waiting / Done | Navigate/filter accepted Attention projections. These labels are not aliases for Inbox labels, unread, or stars. Healthy Managed excludes degraded, surfaced, stopped, and non-delegated work. | Existing Attention controller/actions are reusable; accepted-shell wiring is M5 where not already exposed. |
| Search, filters, sort, pagination | Authorized exact Source search and stable account-scoped retrieval. Show scope, readiness, and partial/degraded state. Do not advertise natural-language Q&A. | Existing Source BFF/repository is reusable; accepted-shell wiring is M1. |
| Unread | Display provider unread truth. Viewing Source does not automatically change accepted Responsibility state. A provider write requires an explicit control and provider mutation contract; until then this is a read-only filter/indicator. | Read/write behavior is not yet delivered in the accepted shell; no empty mutation control. |
| Pin / star | One Lunowa **Favorite** concept in production, not parallel pin and star meanings. It requires durable user-owned, account/conversation-bound storage and a BFF mutation before the control ships. Provider star writes are a separate future contract. | Reference toggle is session-local sample state. Production persistence is not implemented. |
| Next action / View source / Later | Next action comes from a source-grounded Moment projection; View source opens the authorized conversation; Later requests the existing accepted return-condition action. | Existing owners are reusable; fixed reference prose is never used as live truth. |
| History | Scroll/open the Source-derived message history for the selected account-bound conversation. | Existing Source detail is reusable. No fabricated exchanges or read receipts. |
| Contact / person information | Show only Source-derived sender names, addresses, and explicitly available organization/header context, with provenance where ambiguity matters. | No CRM, inferred profile, relationship score, or fake read receipt. Hide unsupported fields. |
| Reply / Reply All / Details / Send | Use the selected account's communication context, expose sender and recipients, retain drafts, and request explicit immediate Send with truthful reconciliation states. | Existing draft/Send path is reusable in M2. Do not carry preview recipients or shortcut notices into production. |
| Attachment / Suggest a draft | Authorized safe evidence download/basic reply attachment as supported; existing bounded AI draft API, preserving manual composition on failure. | Attachment evidence and draft owners are reused. Reference fixed suggestion is sample-only. |
| New message / Forward | Open the selected account provider's compose/forward surface as an explicit provider fallback. Preserve account identity in the handoff and explain when no safe provider URL/capability exists. | No native composer is required for completion. Do not render an inert button. |
| Send options | Show only implemented reply/send choices. Immediate explicit Send is the current contract. | No phantom menu, scheduled send, automatic send, or offline queue. |
| Workspace selector | The first release has one workspace. Render a noninteractive label or omit the chevron/menu semantics. | The reference dropdown is illustrative; no workspace switching model exists. |
| Settings / Help / profile | Settings owns mailbox connection state, language, sign-out, and supported recovery. Help explains actual behavior. Profile identifies the app user without conflating connected mailboxes. | Use real session/account facts. No sample online status. |
| Pane boundaries / collapse | Preserve accepted pointer, touch, and keyboard resizing, reset, minimums, compact fallback, and draft/selection continuity. | Implemented in the reference oracle. Persistence across reload is optional and may store only presentation sizes. |

## Bounded cleanup inventory

“Deletion candidate” means a later owner must confirm routes, dynamic references, tests, and rendered/runtime behavior after production integration. `rg` absence alone is never deletion evidence.

| Item | Classification | Evidence and exit condition |
| --- | --- | --- |
| `ReferenceWorkspace` and scoped CSS/assets/tests | **Keep** | It is the accepted visual fixture, preview owner, and regression/comparison oracle. Sample-only complexity is purposeful. |
| `LunowaShell` controller, `source-ui`, models, BFF routes, server repositories/services | **Keep** | They own authenticated production reads/effects and safety boundaries that the reference does not implement. Backend/auth/Send/monitoring complexity is not unused because the preview does not call it. |
| `WorkspaceHome` and its dedicated CSS/messages/tests | **Consolidate during M1/M2; deletion candidate afterward** | It is imported by the production shell today. After the accepted Home/list/detail structure is rendered directly by the production path, verify no production/preview/test import remains before deletion. |
| Duplicate Home/list/detail markup inside `LunowaShell` | **Consolidate during feature connection** | Keep controller state and actions; move presentation toward the accepted reusable panes in small feature slices. Do not attempt a broad controller rewrite in M0. |
| PR #171 presentation changes | **Replace/supersede selectively** | Reference 02/03 is the newer accepted visual owner. Preserve independently valid behavior/test corrections only after comparing with the current candidate. |
| Preview-only sample actions/notices/data | **Keep in preview; prevent production import** | They make the oracle safely interactive and truthfully non-effecting. Delete only if the visual oracle is replaced by an equal accepted fixture. |
| Old docs describing Gmail as the final provider limit | **Reconciled** | `COMPLETION-SCOPE.md` and narrow pointers in Product/implementation/continuity docs state Gmail-first implementation with Gmail + Outlook/multiple-account completion scope. Historical milestone text remains historical evidence. |
| `react-resizable-panels`, Lucide, next-intl | **Keep** | Current imports cover accepted splitters, icons, and Japanese/English UI. Package/lockfile cleanup requires production integration plus build verification. |

No runtime code is deleted in M0. Removing a currently imported production Home or a fixture oracle before its replacement is connected would create a gap, not cleanup.

## External readiness inventory

Local inspection found only `.env.example`; the current process did not expose `DATABASE_URL`, Better Auth URL/secret, or Google application identity credentials. The repository-level GitHub variable list was empty and no repository secret names were returned. This does **not** prove that environment-, organization-, host-, or provider-side configuration is absent.

An unauthenticated request to the currently named Cloudflare preview session endpoint returned HTTP 200 with a JSON `null` session. That proves only that the anonymous session route responded at that moment. It does not prove this candidate is deployed, Google OAuth works, PostgreSQL persistence works, or an authenticated session can be created. No GitHub environments were visible under the current access, and no Google, Microsoft, Neon, or Cloudflare provider console was inspected.

Treat every external item below as `NOT_VERIFIED` until checked in the target environment without recording secret values:

- production/preview PostgreSQL reachability and required migrations;
- Better Auth URL/secret and Google application-login client/callback acceptance;
- Gmail mailbox credentials/config (`GOOGLE_GMAIL_CLIENT_ID`, `GOOGLE_GMAIL_CLIENT_SECRET`, `GOOGLE_GMAIL_REDIRECT_URI`, credential-key/version, Pub/Sub audience/service account/topic, and worker secret), Google consent status, and suitable Gmail/Workspace test accounts;
- Microsoft app registration, supported account types, redirect URI, delegated permissions/admin-consent behavior, and Outlook.com plus Microsoft 365 test accounts;
- safe test recipients, provider-side send/reconciliation evidence, attachment cases, and disconnect/reconnect recovery;
- current deployed preview/runtime state. Prior Issue evidence and local mocked tests do not establish current provider acceptance.

External unavailability does not block M1/M2 local UI/controller work using deterministic repository fixtures and BFF contracts. It does block claims about real OAuth, provider state, persistence, mixed-account isolation, or delivery.

## Handoff gates

M1/M2 should begin only from the accepted M0 revision and use these gates:

1. preserve the preview reference as the same-state visual oracle and production `/[locale]` as the authenticated path;
2. connect one existing production owner at a time rather than copying fixture logic;
3. keep account/provider identity through selection, detail, draft, Send, search, attachment, and recovery;
4. omit unsupported controls instead of shipping preview notices or false success;
5. verify targeted unit/integration behavior, canonical checks proportional to the change, and same-state real-browser comparison against reference 02/03;
6. require independent cumulative exact-head review and CI before integration.

M0 completion establishes a shared starting point. It is not evidence that Gmail, Outlook, multiple accounts, or real Send are complete.
