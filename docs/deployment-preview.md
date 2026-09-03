# Cloudflare preview deployment boundary

This is a deployment runbook, not Product/capability authority. Semantic and
capability truth remains in [`continuity/CURRENT.md`](continuity/CURRENT.md);
the live deployed URL and its status remain GitHub/Cloudflare deployment
metadata. Do not copy mutable preview URLs into this file.

## Candidate evidence — 2026-09-03

The candidate was based on accepted `main`
`981b8d4cc7376fe119419dcebb82aa203e33b127`, using Node 24.20.0 and pnpm
11.20.0. Its deployment-only tool basis is:

- Next.js 16.3.3 / React 19.2.7
- `vinext` 1.0.0-beta.9 (the current beta status is intentional evidence, not
  a claim of stable maturity)
- `@vinext/cloudflare` 1.0.0-beta.7
- Vite 8.2.2 / `@cloudflare/vite-plugin` 1.54.3 / Wrangler 4.128.0

Execution-time guidance was rechecked from the current Cloudflare-maintained
`vinext` package CLI and README available through the public npm registry: run
`vinext check` for an existing Next.js app, then use the native Workers path
when it is compatible. `pnpm check:cloudflare` reported 100% compatibility
(six supported checks, zero partial checks and zero issues). The native
`vinext` path was therefore selected over OpenNext; no app rewrite, platform
binding, cache, KV, image, or Worker-specific Product code was needed.

The following commands succeeded on this candidate:

```bash
pnpm check:cloudflare
pnpm build:cloudflare
pnpm exec vinext-cloudflare deploy --config dist/server/wrangler.json --dry-run
```

`wrangler.jsonc` intentionally names only the Worker and compatibility
boundary. It contains no account ID, token, secret, user-specific
configuration, or data/service binding (the generated static-assets binding is
the only required runtime wiring). `vinext` emits the deployable
`dist/server/wrangler.json`; that generated file is not committed.

## Account-side activation (not performed by this workspace)

An authorized Cloudflare account owner should:

1. Create or select the Workers project named `lunowa-preview`, then connect
   this GitHub repository through Cloudflare Workers Builds/Git integration.
2. Set `main` as the production branch and configure the Workers build to run
   `pnpm install --frozen-lockfile` followed by `pnpm build:cloudflare`. Use
   the generated `dist/server/wrangler.json` deployment configuration (the
   equivalent repository command is `pnpm deploy:cloudflare`).
3. Enable branch and pull-request preview deployments in that integration, so
   Cloudflare publishes deployment status and the direct URL to GitHub for
   both `main` and PR candidates.
4. For any future preview that can reach real auth, provider, or user data,
   protect the preview environment with a Cloudflare Access application and
   policy before enabling that data. Do not add repository custom auth for
   preview protection.

Cloudflare credentials, account configuration, deployment execution, and the
resulting hosted URL are intentionally outside this repository task. After the
integration is enabled, open accepted `main` from GitHub's latest deployment
status using **View deployment**. For a PR, use that PR's live deployment
status in the same way; those URLs are deliberately not copied into docs.

## Deployed smoke

Once Cloudflare has supplied a preview URL, an authorized reviewer can verify
the actual deployed shell without secrets or a second E2E framework:

```bash
# Set PLAYWRIGHT_BASE_URL to the live URL copied from GitHub deployment status.
pnpm test:e2e:preview
```

The supplied base URL disables Playwright's local web server and checks a
successful `/ja` response, the structural shell, the `ホーム` surface, and the
stable `Lunowaが見ています` Product-shell marker at desktop and compact
viewports.
