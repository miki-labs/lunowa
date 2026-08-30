# ADR 0004 — Web Runtime and UI Stack

## Status

Accepted — 2026-08-19
Terminology reconciled with Responsibility v0.1 — 2026-08-23
UI reuse / hosting amendment — 2026-08-31

## Context

Lunowa is a responsive, interaction-heavy web mail product with a three-pane desktop shell, contextual Moment View, rich compose flows, account/provider OAuth endpoints, and later background/provider integrations.

The initial product is being built by one developer with substantial Codex assistance. The stack therefore optimizes for implementation speed, mature ecosystem reuse, browser quality, legibility, and low operational burden without introducing distributed architecture before demand is proven.

Responsibility v0.1 clarifies that Lunowa's differentiated UI value comes from simple deterministic projections such as `My Turn / Waiting / Later / Done / Review` over a richer canonical Responsibility model. The UI stack must support that interaction quality without becoming domain authority itself.

AI-assisted implementation creates an additional risk: generic UI/accessibility infrastructure is cheap to generate incorrectly, so "custom code is easy to produce" is not evidence that it should be owned by Lunowa.

## Decision

Use:

- Node.js 24 LTS;
- pnpm;
- TypeScript strict mode;
- Next.js 16.x App Router as the single initial web/API application;
- React 19.x as supported by the chosen Next.js release;
- Tailwind CSS 4;
- shadcn/ui current components/registry as the primary UI-primitive source, using its maintained underlying primitives/libraries where appropriate;
- Lucide-style icons;
- next-intl from the start for Lunowa-owned UI copy;
- TanStack Query v5 selectively for interactive server state;
- React/local/URL state before adding a separate global state library;
- Vitest + React Testing Library + Playwright for verification.

Use Cloudflare Workers as the initial hosting target. Keep Next.js application/domain code hosting-neutral enough that the deployment adapter remains replaceable. Before a Cloudflare deployment path becomes accepted infrastructure, prove the current official Next.js-on-Workers path against Lunowa's actual runtime requirements rather than assuming compatibility from framework marketing or a stale adapter snapshot.

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

The visual differentiation lives in Lunowa's brand, information hierarchy, Responsibility projections, Moment behavior, and interaction model — not in reinventing accessible dialog, menu, tooltip, resize, tab, form, focus, keyboard-navigation or virtualization primitives.

For generic UI interaction/accessibility infrastructure, use this order:

```text
existing Lunowa component
-> current shadcn/ui component or registry implementation
-> its maintained underlying primitive/library
-> another mature maintained OSS implementation
-> custom primitive only for a concrete unmet accepted requirement
```

A custom generic primitive is an exception. The task/PR must identify the concrete requirement gap and why the preferred maintained options cannot satisfy it without a worse material trade-off. Hand-written focus traps, keyboard systems, dialog/menu/popover/tooltip/combobox/drawer behavior, split-pane resizing, virtualization or similar infrastructure are not accepted merely because an agent can generate them quickly.

This reuse rule does **not** outsource Product design. Lunowa-specific components such as Moment, Conversation rows, Responsibility projections, Needs You/Managed summaries and source-grounded reply composition remain Lunowa-owned compositions built from reusable primitives.

shadcn/ui and underlying libraries are implementation material, not design authority. `docs/design/` and current textual Responsibility semantics remain authoritative.

Historical screenshot filenames such as `moment-action-required` or `moment-follow-up` are visual-reference names only; they must not be interpreted as canonical domain enum requirements.

### Cloudflare is hosting infrastructure, not architecture authority

Cloudflare Workers is selected as the initial hosting target to keep the deployment edge-oriented and operationally small while retaining one web/API application. The exact Next.js adapter/runtime path is intentionally not frozen in this ADR because that surface changes faster than Lunowa Product/domain semantics.

Before relying on it, verify the then-current official Cloudflare path against the actual Lunowa surface, including as applicable:

- App Router and server rendering used by Lunowa;
- Route Handlers/BFF;
- cookies/session behavior;
- `next-intl`;
- environment/secrets;
- Neon/PostgreSQL connectivity;
- OAuth/webhook endpoints;
- browser smoke on the deployed candidate.

A Cloudflare adapter limitation is a deployment-boundary problem first. Do not respond by silently moving Product/domain logic into platform-specific APIs or replacing PostgreSQL/Trigger.dev merely because Cloudflare offers adjacent services.

### Internationalization is cheap to prepare early

Hard-coding Japanese strings throughout the app creates avoidable future rework. next-intl allows Japanese-first shipping while structurally preserving later English/Spanish support.

## Alternatives considered

### React/Vite SPA + separate API server

Rejected initially. It creates another deployment/runtime boundary without demonstrated product benefit.

### Remix/React Router framework

Viable, but not selected. No current Lunowa requirement justifies a framework migration before the accepted Next.js application proves insufficient on the chosen hosting target.

### Vercel hosting

Viable and operationally straightforward for Next.js, but no longer the initial target. Keep it as a fallback option only if current Cloudflare deployment evidence shows a material compatibility/operability disadvantage that is larger than the cost of switching hosting.

### Node 26 Current

Rejected for the production/bootstrap baseline. Node 24 is LTS; Current-release risk adds little product value.

### Custom design-system primitives

Rejected for non-differentiating accessibility/interaction primitives. Custom styling and Product-specific compositions remain expected.

### Zustand/Redux as a default global store

Deferred. Add only when actual cross-tree client-state complexity demonstrates need.

## Consequences

Positive:

- one TypeScript/Node mental model;
- fast Codex/local iteration;
- strong responsive/component ecosystem;
- less low-level UI/accessibility code for Lunowa to own;
- clearer review oracle against agent-generated wheel reinvention;
- one replaceable Cloudflare deployment boundary;
- fewer moving parts before validation.

Costs/risks:

- interactive mail-workspace state requires disciplined client/server boundaries;
- current Next.js-on-Cloudflare compatibility must be proven and rechecked as adapters/runtime support change;
- Cloudflare request/runtime behavior must not be mistaken for durable job infrastructure;
- Next.js security patches must be followed promptly;
- shadcn defaults can cause visual drift if treated as design authority;
- OSS reuse can still import unnecessary breadth if components are adopted without requirement fit;
- UI fixture shortcuts can accidentally recreate the old lifecycle model unless fake data is shaped around current projections/semantic boundaries.

## Guardrails

- Provider SDK types must not leak into UI/domain contracts.
- Durable background work does not live in browser timers or long-held HTTP requests.
- UI buckets/projection chips do not become canonical Responsibility state.
- Fake-data UI must not reintroduce the superseded lifecycle enum or scalar `BOTH` owner merely because it is easier to mock.
- Generated visual references are design input, not pixel-perfect semantic goldens.
- Establish implemented-app Playwright visual baselines only after visual approval.
- Reuse maintained generic UI/accessibility primitives before custom implementation; custom generic primitives require a documented concrete gap.
- Do not let shadcn/Base UI/other OSS vocabulary become Lunowa Product or domain vocabulary.
- Keep Cloudflare-specific deployment/runtime details behind the hosting boundary; do not couple Product/domain code to them without a concrete accepted reason.
- Keep `pnpm-lock.yaml` committed and use security-patched versions inside accepted major lines.

## Evidence posture

Original acceptance checked Node release/LTS status, Next.js release/security line, shadcn/ui Next.js support, next-intl App Router support, TanStack Query v5 and Playwright visual comparisons.

The 2026-08-31 amendment additionally treats current shadcn primitive availability and Cloudflare Next.js/Workers support as time-sensitive implementation evidence. Re-check official current documentation and run a bounded compatibility proof at the relevant implementation/deployment gate rather than freezing today's adapter/version details into durable Product architecture.
