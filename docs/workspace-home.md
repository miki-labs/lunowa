# Home and shared navigation

This local frontend slice follows the Home/shared-navigation portion of #173 and
the user's request to begin the app screens after the Google-only entry, refined by their explicit selection of reference boards 00–03. It is a
continuation of the existing frontend worktree, not ownership or acceptance of
the separate #155/#171 candidate. No remote PR, merge, deployment, or provider
operation is part of this change.

Home now separates immediate action, Review, and quiet Managed work; recent
Source conversations remain accessible independently. Desktop keeps navigation, a compact list, and detail in three panes, including before selection. Moment shows the next action, original conversation history, and contextual reply. Compact
screens use the existing navigation drawer and detail/back flow.

Existing controllers, accepted attention read models, Source access, contextual
reply, and guarded Send remain the operational owners. An empty Managed summary
opens the real monitoring surface; it cannot invent a sample detail. Later-only
work, delegated work needing attention, incomplete coverage, and trustworthy
zero are distinct states.

## Reuse and localization

Home and navigation use the existing next-intl integration and a `Workspace`
namespace in Japanese and English. Static named Lucide imports supply outline
icons. Context7 documentation informed both integrations. Existing navigation,
focus restoration, native controls, and detail components are reused.

This slice translates Home, common navigation, and the sample Moment/reply flow. Existing detail, Source,
Managed, Review, and settings bodies still need their own localization pass.
Provider/user content is displayed as evidence rather than translated implicitly.

The canonical reference images guide palette, component density, status colors,
navigation and selected workspace proportions. Reference 02 owns desktop composition and 03 owns the action/history/reply arrangement. Home counts remain compact summaries. It is not a literal copy of reference 02's
obsolete Inbox taxonomy. The sidebar uses a reference-derived Lunowa logo; provenance is recorded in `public/brand/README.md`.

## Local preview

Set `LUNOWA_UI_PREVIEW=true` explicitly in a local environment and run `pnpm dev`.
Open `/ja/preview?view=runtime` or `/en/preview?view=runtime`. The banner identifies synthetic data, a
language selector changes Home/navigation in place, and the state selector at
the bottom exercises existing fixtures. This route is dynamic, excluded from
indexing, and returns 404 without the opt-in.

The preview never supplies an app user or an authenticated session. Its sample
interactions do not send, connect, or monitor real email. Authentication and BFF
authorization on ordinary routes remain unchanged. Do not enable the preview
flag for a production rollout.

The default `/[locale]/preview` now hosts the user's separately requested faithful
reference reproduction. See [reference-reproduction.md](reference-reproduction.md).
That sample-only visual approval stage supersedes the earlier preview's visual
direction; it does not claim that production provider integration is complete.

## Verification boundary

Unit coverage checks empty/live/Later/unknown monitoring truth, accepted detail
origins, language changes, absence of preview API calls, and the route's default
404 gate. Browser regression covers navigation, contextual reply, Send guards,
responsive stages, zoom, IME, session transitions, and focus restoration.

Visual QA uses synthetic screenshots at 1440, 430 and 320 CSS pixels in Japanese
and English, selected detail, zero/loading/degraded states, and 200% text scale.
These checks prove local presentation and mocked interactions, not actual Google
OAuth completion, live mailbox monitoring, PostgreSQL persistence, or delivery.
