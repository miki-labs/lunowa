# ADR 0004 — Web runtime and UI stack

## Status

Accepted — 2026-08-19

## Context

Lunowa is a responsive, interaction-heavy web mail product with a three-pane desktop shell, contextual Moment View, rich compose flows, account/provider OAuth endpoints, and later background/provider integrations.

The initial product is being built by one developer with substantial Codex assistance. The stack therefore needs to optimize for implementation speed, mature ecosystem reuse, browser quality, legibility, and low operational burden without creating distributed architecture before the product proves demand.

## Decision

Use:

- Node.js 24 LTS;
- pnpm;
- TypeScript strict mode;
- Next.js 16.x App Router as the single initial web/API application;
- React 19.x as supported by the chosen Next.js release;
- Tailwind CSS 4;
- shadcn/ui components/primitives adapted to Lunowa's design system;
- Lucide-style icons;
- next-intl from the start for Lunowa-owned UI copy;
- TanStack Query v5 selectively for interactive server state;
- React/local/URL state before adding a separate global state library;
- Vitest + React Testing Library + Playwright for verification.

Deploy the web/API application to Vercel initially.

Do not add a separate backend service until a measured runtime, security, scaling, or deployment boundary requires it.

## Rationale

### One application is cheaper to reason about

Lunowa does not currently require independently deployed frontend/backend services. Next.js can host the UI, Node-compatible Route Handlers, OAuth callbacks, provider webhooks, and ordinary product APIs while keeping domain modules separated inside a modular monolith.

This reduces:

- deployment surfaces;
- cross-service contracts;
- local-development setup;
- duplicated auth/session plumbing;
- Codex context fragmentation.

### Reuse beats custom component infrastructure

The visual differentiation lives in Lunowa's brand, information hierarchy, lifecycle states, and interaction behavior — not in reinventing accessible dialog, menu, tooltip, resize, tabs, and form primitives.

shadcn/ui is therefore implementation material, not a design authority. `docs/design/` and the committed reference images remain authoritative.

### Internationalization is cheap to prepare early

Hard-coding Japanese strings throughout the application would create avoidable future rework. next-intl integrates directly with the App Router and allows Japanese-first shipping while keeping later English/Spanish support structurally cheap.

## Alternatives considered

### React/Vite SPA + separate API server

Rejected initially. It creates an additional deployment/runtime boundary without a demonstrated benefit for the current product.

### Remix/React Router framework

Viable, but not selected. Next.js has the better fit with the chosen Vercel deployment path and current Codex/React ecosystem for this project; no Lunowa requirement makes switching frameworks worth the added decision cost.

### Node 26 Current

Rejected for the production/bootstrap baseline. Node 24 is LTS; the product gains little from Current-release risk.

### Custom design-system primitives

Rejected for non-differentiating accessibility/interaction primitives. Custom styling and product-specific components remain expected.

### Zustand/Redux as a default global store

Deferred. Add only when actual cross-tree client-state complexity demonstrates the need.

## Consequences

Positive:

- one TypeScript/Node mental model;
- fast Codex/local iteration;
- strong responsive/component ecosystem;
- straightforward preview deployments;
- fewer moving parts before validation.

Costs/risks:

- interactive mail-workspace state requires disciplined client/server boundaries;
- Vercel request runtimes must not be mistaken for durable job infrastructure;
- Next.js security patches must be followed promptly;
- shadcn defaults can cause visual drift if Codex treats them as the design source of truth.

## Guardrails

- Provider SDK types must not leak into UI/domain contracts.
- Durable background work does not live in browser timers or long-held HTTP requests.
- Generated design references are input, not pixel-perfect golden screenshots.
- Establish implemented-app Playwright golden screenshots only after visual approval.
- Keep `pnpm-lock.yaml` committed and use security-patched versions inside the accepted major lines.

## Evidence checked

- Node release/LTS status: https://nodejs.org/en/about/previous-releases
- Next.js release/security line: https://nextjs.org/blog
- shadcn/ui Next.js support: https://ui.shadcn.com/docs/installation/next
- next-intl App Router: https://next-intl.dev/docs/getting-started/app-router
- TanStack Query v5: https://tanstack.com/query/v5/docs/framework/react/overview
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
