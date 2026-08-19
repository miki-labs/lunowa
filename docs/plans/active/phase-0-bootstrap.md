# Phase 0 — Lunowa Application Bootstrap

## Status

**Active / Ready for implementation**

This is the current execution artifact for bootstrapping Lunowa's real application codebase. It is intentionally narrower than `docs/product/IMPLEMENTATION-PLAN.md`.

The goal is to establish a reproducible, verified application foundation that Codex can extend into the high-fidelity fake-data product shell in Phase 1.

This plan does **not** authorize implementation of Gmail, Microsoft Graph, Neon production data, Trigger.dev production jobs, or OpenAI runtime behavior yet.

---

## 1. Goal

Create the smallest real Lunowa application scaffold that:

- follows the accepted initial stack;
- runs locally with one documented command;
- builds reproducibly;
- has strict type/lint/test verification;
- is ready to implement the committed visual references;
- supports Japanese-first UI without hard-coding the app into a Japanese-only architecture;
- keeps future provider/auth/database/job/AI boundaries available without activating unnecessary infrastructure now.

The output of this phase is a **working engineering foundation**, not a finished product screen.

---

## 2. Why this phase exists

The repository currently has accepted product/design/architecture sources but no established runtime code or canonical commands.

Skipping this phase would force later Codex tasks to invent:

- package manager/runtime assumptions;
- directory structure;
- styling conventions;
- test setup;
- localization boundaries;
- environment handling;
- browser verification path.

Those decisions should be established once and then reused.

---

## 3. Required source-of-truth reading

Before implementation, inspect at minimum:

### Repository map

- `AGENTS.md`

### Product/engineering

- `docs/product/TECH-STACK.md`
- `docs/product/ARCHITECTURE.md`
- `docs/product/CONTRACTS.md`
- `docs/product/IMPLEMENTATION-PLAN.md`

### Design

- `docs/design/DESIGN.md`
- `docs/design/INTERACTIONS.md`
- `docs/design/RESPONSIVE.md`
- `docs/design/references/README.md`
- `docs/design/references/00-brand-system.png`
- `docs/design/references/01-component-system.png`
- `docs/design/references/02-desktop-conversation-default.png`

### Reusable engineering baseline

Read only the parts needed for bootstrap:

- `docs/greenfield-bootstrap.md`
- `docs/reuse-dependencies.md`
- `docs/verification-review.md`
- `docs/security-privacy.md`
- `docs/coding-agent-harness.md`

### Architecture decisions

- `docs/decisions/0001-modular-monolith-default.md`
- `docs/decisions/0004-web-runtime-and-ui-stack.md`
- `docs/decisions/0005-auth-and-persistence-stack.md`

Do not load unrelated blueprint documents merely for completeness.

---

## 4. Accepted stack for this phase

Install/use only what Phase 0 actually needs.

### Required now

- Node.js 24 LTS
- pnpm
- TypeScript strict
- Next.js 16.x App Router
- React version supported by the selected Next.js 16 release
- Tailwind CSS 4
- next-intl
- shadcn/ui setup or the minimum prerequisites required to add its components cleanly in Phase 1
- Lucide React icons if immediately useful for shell primitives
- Zod if needed for configuration validation
- Vitest
- React Testing Library
- Playwright

### Do not activate yet merely because it is accepted later

Do **not** require these services/dependencies to make Phase 0 or Phase 1 run:

- Neon production database
- Drizzle persistence schema beyond a deliberately tiny integration spike if needed
- Better Auth production configuration
- Google OAuth credentials
- Gmail API
- Microsoft Graph
- Trigger.dev
- OpenAI API key/runtime
- Redis
- vector database
- external search service

The repository should support fake-data UI work without any external secret.

---

## 5. Expected repository shape

Do not create abstraction layers merely to satisfy this sketch. Prefer framework conventions. The exact names may be adapted if the generated Next.js structure makes a simpler equivalent obvious.

A reasonable target is:

```text
lunowa/
├── app/
│   ├── [locale]/            # if locale routing is selected by next-intl setup
│   ├── globals.css
│   └── ...
├── components/
│   ├── ui/                  # shadcn/reusable primitives
│   └── ...                  # product components added in Phase 1
├── lib/
│   ├── config/
│   ├── i18n/
│   └── ...
├── messages/
│   ├── ja.json
│   └── en.json              # small structural placeholder; full translation not required
├── tests/
│   └── ...
├── e2e/
│   └── ...
├── public/
├── docs/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.*
├── playwright.config.*
├── vitest.config.*
├── .env.example
└── ...
```

### Directory rules

- Do not create a generic `utils/` dumping ground.
- Keep reusable UI primitives separate from Lunowa product components.
- Do not create `services/`, `repositories/`, or provider folders before code actually needs those boundaries.
- Do not create a monorepo/workspace topology during Phase 0.
- Do not pre-generate database/domain files only to make the architecture look complete.

---

## 6. Bootstrap tasks

### 6.1 Initialize the real application

Create/initialize the Next.js application **inside the existing repository without deleting or overwriting the current docs, decisions, templates, README, or AGENTS.md**.

Required characteristics:

- App Router;
- TypeScript;
- Tailwind CSS;
- no unnecessary demo/template content;
- package management through pnpm;
- package versions locked.

If the initializer conflicts with existing repository files, initialize in a temporary directory and selectively move the required application files rather than overwriting source-of-truth artifacts.

### 6.2 Runtime declaration

Make the Node/pnpm expectations explicit using ordinary ecosystem mechanisms, for example:

- `packageManager` in `package.json`;
- an appropriate Node version declaration/tool file if useful to the developer environment.

Do not pin to an obsolete patch when the repository only needs the accepted Node 24 LTS line.

### 6.3 TypeScript

Enable/retain strict TypeScript checking.

Do not weaken strictness to silence bootstrap errors.

Create a canonical `typecheck` command that checks the project without producing build output.

### 6.4 Styling foundation

Establish Tailwind CSS 4 and the minimum global CSS needed for Phase 1.

Do not attempt to reproduce the entire Brand System in Phase 0, but establish semantic token hooks so Phase 1 can implement it without scattering arbitrary values.

At minimum anticipate semantic groups such as:

- background/surface;
- foreground/muted text;
- border;
- primary brand navy;
- lunar-gold accent;
- state colors for action-required/deferred/waiting/completed;
- focus ring;
- radius/shadow conventions.

Exact visual values remain governed by `docs/design/` and the reference images and are Phase 1 work.

### 6.5 Internationalization foundation

Configure next-intl so Lunowa-owned UI strings are externalized from the beginning.

Requirements:

- Japanese is the initial/default product locale;
- architecture supports future English and additional locales;
- no giant translation catalog is required now;
- create only enough example copy to prove locale plumbing;
- date/time formatting should flow through locale-aware helpers later rather than hand-built Japanese formatting scattered through components.

Do not translate or transform user email contents as part of this system.

### 6.6 Minimal route/page

Render a deliberately small bootstrap page that proves:

- Next.js app runs;
- Tailwind styling works;
- localized Lunowa-owned copy renders;
- no external service/secret is required.

This page is disposable bootstrap proof, not the canonical Phase 1 UI.

Do not spend significant time polishing it.

### 6.7 Testing foundation

Configure:

#### Vitest

For pure/domain/helper/component tests where appropriate.

#### React Testing Library

Include one minimal behavior/rendering test proving the environment works.

#### Playwright

Include one minimal browser smoke test proving:

- the app starts in the test environment;
- the main bootstrap route loads;
- a stable Lunowa-owned element is visible.

Do not create large screenshot-golden suites yet. Phase 1 establishes visual golden screenshots after the rendered UI is approved.

### 6.8 Linting and formatting posture

Use the framework/current ecosystem lint setup with minimal customization.

The goal is mechanically useful feedback, not a large style-policy project.

If formatting tooling is added, keep configuration small and conventional.

### 6.9 Environment handling

Create `.env.example` containing names/comments only for variables actually needed now or immediately in the next accepted phase.

Phase 0 should require **no secret** to run the UI/test/build path.

Rules:

- `.env*` secret files ignored appropriately;
- no fake production credentials;
- no provider tokens/client secrets;
- no API keys in tests/docs/code.

### 6.10 Reusable component setup

Prepare shadcn/ui cleanly so Phase 1 can add required components from the official component source rather than hand-implementing every primitive.

Do not install dozens of components preemptively.

Add only what the bootstrap itself needs, if anything.

### 6.11 Fake-data boundary preparation

Phase 1 must not hard-code arbitrary conversation arrays throughout JSX.

During bootstrap, establish only the smallest convention needed so Phase 1 can add domain-shaped fixtures behind a clear module boundary.

Do not implement the full `DATA-MODEL.md` persistence layer yet.

A future shape such as:

```text
src-or-lib/
  demo/
    fixtures.ts
    mail-repository.ts
```

is acceptable, but create it only when the first Phase 1 screen actually needs it.

---

## 7. Canonical commands to establish

After bootstrap, `package.json` should expose actual working equivalents of:

```text
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm verify
```

### `pnpm verify`

Initial required baseline:

```text
typecheck
+ lint
+ unit/component tests
+ production build
```

Playwright can remain a separate command if including it in every local `verify` would make the feedback loop materially worse. The decision must be documented from actual runtime cost, not guessed.

Humans, Codex, and CI should converge on the same canonical verification commands where practical.

---

## 8. Verification requirements

Implementation is not complete merely because files were generated.

Before closing Phase 0, actually run and record the result of:

1. dependency install;
2. `pnpm typecheck`;
3. `pnpm lint`;
4. `pnpm test`;
5. `pnpm build`;
6. `pnpm verify`;
7. `pnpm test:e2e` or the equivalent Playwright smoke test;
8. local browser load of the bootstrap page.

If any command is intentionally omitted, state why and leave the phase incomplete if it is required above.

### Browser inspection

Open the running application in a real browser and verify:

- page loads without hydration/runtime error;
- localized content renders;
- base styling is applied;
- browser console has no unexplained application errors;
- basic responsive shrinking does not catastrophically overflow the trivial page.

Do not claim visual conformance to Lunowa's reference screens in Phase 0; that begins in Phase 1.

---

## 9. Documentation updates required in the same change

When the actual scaffold is established, update:

### `AGENTS.md`

Replace TBD canonical commands with the real commands.

Update repository stage from `pre-implementation / bootstrap` to reflect that the runtime scaffold exists while the product remains in Phase 1 implementation.

### `README.md`

Add the shortest useful local-development start instructions if they are not already clear.

### `docs/product/TECH-STACK.md`

Update only if implementation reveals a material divergence from the accepted stack.

### This plan

Mark completed or move to `docs/plans/completed/` only if retaining the execution history is valuable. Otherwise it may be removed after the durable state is represented by code/commands/docs and Git history.

Do not leave contradictory TBD instructions after the commands exist.

---

## 10. Explicit non-goals / stop boundaries

Do **not** extend this task into:

- implementing the three-pane Lunowa UI beyond a trivial scaffold;
- integrating Gmail OAuth/API;
- integrating Microsoft Graph;
- creating real users/sessions in production;
- connecting Neon production data;
- implementing the complete database schema;
- adding Trigger.dev;
- adding OpenAI SDK/runtime calls;
- implementing lifecycle/Temporal Contracts;
- semantic search;
- rich text editor selection beyond a narrowly scoped spike;
- native/mobile applications;
- deployment-production hardening.

If a setup tool insists on one of these boundaries, prefer the simplest local/mock/config-only path rather than silently expanding scope.

---

## 11. Acceptance criteria

Phase 0 is complete only when all are true:

- existing Lunowa docs/reference images remain intact;
- app starts locally using the documented Node/pnpm environment;
- one localized bootstrap route renders;
- TypeScript strict checking is active;
- Tailwind CSS is working;
- next-intl is working;
- tests are configured and at least one meaningful smoke test exists at each selected test layer;
- Playwright can launch the real app and verify the bootstrap route;
- production build succeeds;
- canonical `verify` command exists and succeeds;
- no external credentials are required for install/run/verify;
- no provider/AI/database/job architecture was prematurely implemented;
- `AGENTS.md` contains real canonical commands after successful verification;
- Codex can begin Phase 1 from `docs/design/references/00`, `01`, and `02` without first redesigning the repository foundation.

---

## 12. Stop conditions

Stop and report instead of guessing if:

- the chosen stable Next.js 16.x release is incompatible with Node 24 LTS or another accepted Phase 0 dependency;
- next-intl/shadcn/Tailwind setup requires a materially different architecture than this plan assumes;
- an existing repository file conflicts with app initialization and cannot be preserved safely;
- verification cannot be made reproducible with the selected tooling;
- a dependency requires secret/provider infrastructure merely to render/test the fake-data UI;
- implementation evidence makes an accepted ADR materially incorrect.

If a conflict is small and reversible, choose the simplest compatible implementation and document the assumption. If it changes a durable architecture decision, stop and update/review the relevant ADR first.

---

## 13. Phase 1 handoff

The next task after this plan is **not** `build the whole app`.

The first Phase 1 slice should implement the canonical shell using:

```text
docs/design/references/00-brand-system.png
docs/design/references/01-component-system.png
docs/design/references/02-desktop-conversation-default.png
```

with fake domain-shaped data and these required interactions:

- desktop three-pane shell;
- resizable pane boundaries;
- conversation selection;
- normal row body -> `会話`;
- status chip -> `今の要点`;
- selected-state preservation;
- responsive foundations;
- browser screenshot comparison against the design reference.

Only after that rendered slice is visually/behaviorally reviewed should Phase 1 expand into the other lifecycle/compose/search/context screens.