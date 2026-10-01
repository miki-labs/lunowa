# Google application sign-in

The application entry supports Japanese (`/ja`) and English (`/en`). It uses
Google for both first-time registration and returning users. UI strings live in
the `Auth` namespaces in `messages/ja.json` and `messages/en.json`; layout is scoped
to `src/components/auth-entry.module.css`.

## Runtime setup

- Configure `DATABASE_URL`, an unpredictable `BETTER_AUTH_SECRET` of at least 32
  characters, and the externally reachable `BETTER_AUTH_URL`.
- Create a Google OAuth web client for **application identity**, distinct from
  the Gmail connector. Set `GOOGLE_AUTH_CLIENT_ID` and `GOOGLE_AUTH_CLIENT_SECRET`
  through the runtime secret store or an ignored local environment file.
- Register `<BETTER_AUTH_URL>/api/auth/callback/google` as its exact authorized
  redirect URI. The local example is
  `http://localhost:3000/api/auth/callback/google`.
- The identity request uses only `openid email profile`, online access, and no
  incremental authorization. Gmail access remains a separate connector flow.
- An unconfigured Google provider fails closed; it does not enable password
  login. The `credentialFixture` option is an explicit test-only opt-in used by
  existing database acceptance fixtures and is never enabled by runtime config.

Google sign-in opens a separate window. Allow pop-ups for the application. A
cancelled or failed attempt offers a retry; completion is accepted only after
checking the server session. Same-user reauthentication keeps the current shell
and safe unsent draft state. A different user remounts the shell. Language
navigation is hidden while retained work needs reauthentication.

Account linking is disabled. Existing password-only accounts are not silently
linked to a Google identity with the same email. A deliberate migration/recovery
decision is required before rolling this change out to such users. Existing
sessions and UUID ownership/schema are unchanged.

## Verification boundary

Request-level tests exercise the real Better Auth endpoint policy with disposable
memory persistence. Browser tests simulate Google completion; they do not contact
Google or grant mailbox access. Actual Google consent/callback and PostgreSQL
token/session persistence require configured integration verification before
production rollout. Do not interpret local visual or mocked-browser success as
proof of those external boundaries.
