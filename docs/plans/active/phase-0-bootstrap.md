# Phase 0 — Lunowa Application Bootstrap

## Status

**Active / Ready for implementation**

This is the current execution artifact for bootstrapping Lunowa's real application codebase. It is intentionally narrower than `docs/product/IMPLEMENTATION-PLAN.md`.

The goal is to establish a reproducible, verified application foundation that Codex can extend into the high-fidelity fake-data product shell in Phase 1.

Phase 0 also establishes the first repository-level verification gate: local canonical commands and GitHub Actions must exercise the same accepted baseline before later Human-light development depends on them.

This plan does **not** authorize implementation of Gmail, Microsoft Graph, Neon production data, Trigger.dev production jobs, or OpenAI runtime behavior yet.

---

## 1. Goal

Create the smallest real Lunowa application scaffold that:

- follows the accepted initial stack;
- runs locally with one documented command;
- builds reproducibly;
- has strict type/lint/test verification;
- exposes one canonical `verify` command shared by humans, Codex, and CI where practical;
- has GitHub Actions that independently verify proposed changes with stable `Verify` and `E2E Smoke` checks;
- is ready to implement the committed visual references;
- supports Japanese-first UI without hard-coding the app into a Japanese-only architecture;
- keeps future provider/auth/database/job/AI boundaries available without activating unnecessary infrastructure now.

The output of this phase is a **working engineering foundation**, not a finished product screen.

---

## 2. Why this phase exists

The repository currently has accepted product/design/architecture sources but no established runtime code, canonical commands, or executable CI gate.

Skipping this phase would force later Codex tasks to invent:

- package manager/runtime assumptions;
- directory structure;
- styling conventions;
- test setup;
- localization boundaries;
- environment handling;
- browser verification path;
- CI behavior and status-check names.

Those decisions should be established once and then reused.

Local success is not enough for an AI-heavy workflow. The same baseline must run independently in GitHub Actions so a later coding agent cannot rely on an unverified local environment or completion claim.

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
- current stable, security-patched Next.js 16.x App Router release
- React version supported by the selected Next.js 16 release
- Tailwind CSS 4
- next-intl
- shadcn/ui setup or the minimum prerequisites required to add its components cleanly in Phase 1
- Lucide React icons if immediately useful for shell primitives
- Zod if needed for configuration validation
- Vitest
- React Testing Library
- Playwright

Record the exact resolved dependency graph in `pnpm-lock.yaml`. Durable docs describe accepted support lines; the lockfile records the concrete installed versions.

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
├── .github/
│   └── workflows/
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

Make the Node/pnpm expectations explicit using ordinary ecosystem mechanisms:

- declare the actual pnpm version with `packageManager` in `package.json`;
- declare the accepted Node 24 runtime line using the smallest conventional mechanism useful to local/CI tooling.

Do not pin durable documentation to an obsolete patch when the repository only needs the accepted Node 24 LTS line. Concrete dependency/tool resolutions belong in the lockfile and runtime configuration.

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

The canonical CI-facing test command must run deterministically and exit; do not make watch mode the `pnpm test` contract.

#### React Testing Library

Include one minimal behavior/rendering test proving the environment works.

#### Playwright

Include one minimal browser smoke test proving:

- the app starts in the test environment;
- the main bootstrap route loads;
- a stable Lunowa-owned element is visible.

Initial CI may use Chromium only. Broader browser/device coverage belongs to later support validation.

Do not create large screenshot-golden suites yet. Phase 1 establishes visual golden screenshots after the rendered UI is approved.

### 6.8 Linting and formatting posture

Use the current ecosystem lint setup with minimal customization.

Next.js 16 does not own the lint command; run ESLint directly through the repository's `lint` script.

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

### 6.12 GitHub Actions CI

Create the smallest CI workflow that makes the Phase 0 baseline independently reproducible on GitHub.

Run on:

- pull requests targeting `main`;
- pushes to `main`.

Expose stable job/check names suitable for the immediately following `main` Ruleset task:

#### `Verify`

- checkout the repository;
- use Node 24;
- activate/install the repository-declared pnpm version;
- install dependencies with a frozen lockfile;
- run `pnpm verify`.

#### `E2E Smoke`

- checkout the repository;
- use Node 24;
- install dependencies with a frozen lockfile;
- install the minimum required Playwright browser/system dependencies;
- start the real application deterministically (for example via Playwright `webServer`);
- run the Phase 0 smoke test.

Use one Playwright worker initially unless measured CI behavior supports safe parallelism.

#### CI security baseline

- workflow permissions default to `contents: read` unless a narrower/stronger reason is documented;
- do not expose application/provider/production secrets;
- do not use `pull_request_target` for ordinary PR verification;
- prefer first-party/official actions where available;
- pin third-party/prebuilt Actions to immutable full commit SHAs where practical, retaining a readable version comment when useful;
- do not add deployment behavior or production credentials;
- do not make CI green by weakening type/lint/test/security settings.

GitHub Ruleset/main protection is deliberately the next task, after these real check names have run successfully at least once.

---

## 7. Canonical commands to establish

After bootstrap, `package.json` should expose actual working equivalents of:

```text
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:watch       # optional convenience command, not the CI contract
pnpm test:e2e
pnpm build
pnpm start
pnpm verify
```

### `pnpm verify`

Initial required baseline:

```text
typecheck
+ lint
+ deterministic unit/component tests
+ production build
```

Keep Playwright as a separate explicit layer initially so the local fast feedback path and browser evidence remain independently diagnosable.

Humans, Codex, and CI should converge on the same canonical verification commands where practical.

---

## 8. Verification requirements

Implementation is not complete merely because files were generated.

Before closing Phase 0, actually run and record the result of:

1. dependency install using the locked dependency graph;
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

### GitHub CI evidence

After the implementation branch/PR is pushed:

- confirm the `Verify` check runs and passes;
- confirm the `E2E Smoke` check runs and passes;
- inspect failure logs rather than rerunning blindly if a check fails;
- confirm no application secrets are required by either job;
- confirm the workflow token has no unjustified write permission.

Local success does not substitute for CI evidence.

---

## 9. Documentation updates required in the same change

When the actual scaffold is established, update:

### `AGENTS.md`

Replace TBD canonical commands with the real commands.

Update repository stage from `pre-implementation / bootstrap` to reflect that the runtime scaffold exists while the product remains in Phase 1 implementation.

### `README.md`

Add the shortest useful local-development start instructions if they are not already clear.

Ensure README reflects `docs/product/TECH-STACK.md` as the accepted initial stack source of truth rather than claiming the stack remains undecided.

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
- production deployment configuration;
- GitHub Ruleset/main branch protection;
- protected-surface/Guardrail Integrity policy;
- auto-merge or agent-controlled production deployment.

If a setup tool insists on one of these boundaries, prefer the simplest local/mock/config-only path rather than silently expanding scope.

---

## 11. Acceptance criteria

Phase 0 is complete only when all are true:

- existing Lunowa docs/reference images remain intact;
- app starts locally using the documented Node/pnpm environment;
- exact pnpm version is declared and the lockfile is committed;
- one localized bootstrap route renders;
- TypeScript strict checking is active;
- Tailwind CSS is working;
- next-intl is working;
- tests are configured and at least one meaningful smoke/behavior test exists at each selected test layer;
- Playwright can launch the real app and verify the bootstrap route;
- production build succeeds;
- canonical `verify` command exists and succeeds;
- `pnpm test` is deterministic and exits;
- no external credentials are required for install/run/verify;
- no provider/AI/database/job architecture was prematurely implemented;
- GitHub Actions exists for PRs/pushes to `main`;
- GitHub Actions uses frozen-lockfile installation;
- GitHub Actions uses least privilege and no application secrets;
- no ordinary verification workflow uses `pull_request_target`;
- stable `Verify` and `E2E Smoke` checks both pass on the implementation PR;
- `AGENTS.md` contains real canonical commands after successful verification;
- README reflects the accepted initial stack/runtime state;
- Codex can begin Phase 1 from `docs/design/references/00`, `01`, and `02` without first redesigning the repository foundation.

---

## 12. Stop conditions

Stop and report instead of guessing if:

- the chosen stable Next.js 16.x release is incompatible with Node 24 LTS or another accepted Phase 0 dependency;
- next-intl/shadcn/Tailwind setup requires a materially different architecture than this plan assumes;
- an existing repository file conflicts with app initialization and cannot be preserved safely;
- verification cannot be made reproducible with the selected tooling;
- a dependency requires secret/provider infrastructure merely to render/test the fake-data UI;
- GitHub CI requires unexplained write permissions, production secrets, or privileged events;
- passing verification would require weakening TypeScript, lint, tests, or security configuration;
- implementation evidence makes an accepted ADR materially incorrect.

If a conflict is small and reversible, choose the simplest compatible implementation and document the assumption. If it changes a durable architecture decision, stop and update/review the relevant ADR first.

---

## 13. Phase 1 handoff

The next task after this plan is **not** `build the whole app`.

Immediately after the Phase 0 implementation PR produces real green `Verify` and `E2E Smoke` checks, configure the `main` Ruleset so these checks become required before normal product implementation proceeds.

The first Phase 1 product slice should then implement the canonical shell using:

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