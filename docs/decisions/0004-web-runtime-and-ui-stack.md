# ADR 0004 — Web Runtime and UI Stack

## Status

Accepted — 2026-08-19  
Terminology reconciled with Responsibility v0.1 — 2026-08-23

## Context

Lunowa is a responsive, interaction-heavy web mail product with a three-pane desktop shell, contextual Moment View, rich compose flows, account/provider OAuth endpoints, and later background/provider integrations.

The initial product is being built by one developer with substantial Codex assistance. The stack therefore optimizes for implementation speed, mature ecosystem reuse, browser quality, legibility, and low operational burden without introducing distributed architecture before demand is proven.

Responsibility v0.1 clarifies that Lunowa's differentiated UI value comes from simple deterministic projections such as `My Turn / Waiting / Later / Done / Review` over a richer canonical Responsibility model. The UI stack must support that interaction quality without becoming domain authority itself.

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

Lunowa does not currently require independently deployed frontend/backend services. Next.js can host the UI, Node-compatible Route Handlers, OAuth callbacks, provider webhooks, and ordinary product APIs while domain modules remain separated inside a modular monolith.

This reduces:

- deployment surfaces;
- cross-service contracts;
- local-development setup;
- duplicated auth/session plumbing;
- Codex context fragmentation.

### Reuse beats custom component infrastructure

The visual differentiation lives in Lunowa's brand, information hierarchy, Responsibility projections, Moment behavior, and interaction model — not in reinventing accessible dialog, menu, tooltip, resize, tab, and form primitives.

shadcn/ui is implementation material, not design authority. `docs/design/` and current textual Responsibility semantics remain authoritative.

Historical screenshot filenames such as `moment-action-required` or `moment-follow-up` are visual-reference names only; they must not be interpreted as canonical domain enum requirements.

### Internationalization is cheap to prepare early

Hard-coding Japanese strings throughout the app creates avoidable future rework. next-intl allows Japanese-first shipping while structurally preserving later English/Spanish support.

## Alternatives considered

### React/Vite SPA + separate API server

Rejected initially. It creates another deployment/runtime boundary without demonstrated product benefit.

### Remix/React Router framework

Viable, but not selected. Next.js fits the chosen Vercel path/current project ecosystem; no Lunowa requirement justifies switching.

### Node 26 Current

Rejected for the production/bootstrap baseline. Node 24 is LTS; Current-release risk adds little product value.

### Custom design-system primitives

Rejected for non-differentiating accessibility/interaction primitives. Custom styling and product-specific components remain expected.

### Zustand/Redux as a default global store

Deferred. Add only when actual cross-tree client-state complexity demonstrates need.

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
- shadcn defaults can cause visual drift if treated as design authority;
- UI fixture shortcuts can accidentally recreate the old lifecycle model unless fake data is shaped around current projections/semantic boundaries.

## Guardrails

- Provider SDK types must not leak into UI/domain contracts.
- Durable background work does not live in browser timers or long-held HTTP requests.
- UI buckets/projection chips do not become canonical Responsibility state.
- Fake-data UI must not reintroduce the superseded lifecycle enum or scalar `BOTH` owner merely because it is easier to mock.
- Generated visual references are design input, not pixel-perfect semantic goldens.
- Establish implemented-app Playwright visual baselines only after visual approval.
- Keep `pnpm-lock.yaml` committed and use security-patched versions inside accepted major lines.

## Evidence checked when originally accepted

- Node release/LTS status;
- Next.js release/security line;
- shadcn/ui Next.js support;
- next-intl App Router support;
- TanStack Query v5;
- Playwright visual comparisons.

These ecosystem facts are time-sensitive and should be rechecked when they materially affect implementation/release.