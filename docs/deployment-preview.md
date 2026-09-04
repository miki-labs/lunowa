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
pnpm check:cloudflare:deploy
```

`wrangler.jsonc` names the custom Worker entry point, compatibility boundary,
and G20 ten-minute Gmail safety/watch-renewal trigger. It contains no account
ID, token, secret, user-specific configuration, or data binding (the generated
static-assets binding is still required runtime wiring). `vinext` emits the deployable
`dist/server/wrangler.json`; that generated file is not committed.

## Account-side activation (not performed by this workspace)

An authorized Cloudflare account owner should:

1. Create or select the Workers project named `lunowa-preview`, then connect
   this GitHub repository through Cloudflare Workers Builds/Git integration.
2. Set `main` as the production branch. In **Settings → Build**, set the
   Build command to `pnpm build:cloudflare`, the production Deploy command to
   `pnpm deploy:cloudflare`, and the Non-production branch deploy command to
   `pnpm preview:cloudflare`. Both deploy commands consume the exact generated
   `dist/server/wrangler.json` proven by `pnpm check:cloudflare:deploy`.
3. Enable **Builds for non-production branches**. Production commits then use
   `wrangler deploy`, while PR/branch candidates use
   `wrangler versions upload` and therefore receive Cloudflare preview URLs.
4. For any future preview that can reach real auth, provider, or user data,
   protect the preview environment with a Cloudflare Access application and
   policy before enabling that data. Do not add repository custom auth for
   preview protection.

Cloudflare credentials, account configuration, deployment execution, and the
resulting hosted URL are intentionally outside this repository task. After the
integration is enabled, accepted `main` is opened from the active
`lunowa-preview` Worker in Cloudflare's Deployments/Version History surface
(and its stable workers.dev URL once Cloudflare has created it). For a PR,
Cloudflare Workers Builds posts the preview URL directly in the PR comment
when the non-production command performs `wrangler versions upload`.
GitHub check-run **Details** links to the Cloudflare build. Mutable preview
URLs are deliberately not copied into repository docs.

## Deployed smoke

Once Cloudflare has supplied a preview URL, an authorized reviewer can verify
the actual deployed shell without secrets or a second E2E framework:

```bash
# Use the PR preview URL from Cloudflare's PR comment, or the active
# lunowa-preview Worker URL for accepted main.
PLAYWRIGHT_BASE_URL=https://example.invalid pnpm test:e2e:preview
```

The supplied base URL disables Playwright's local web server and checks a
successful `/ja` response, the structural shell, the `ホーム` surface, and the
stable `Lunowaが見ています` Product-shell marker at desktop and compact
viewports.
