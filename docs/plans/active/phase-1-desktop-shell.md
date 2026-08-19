# Phase 1 Task Contract — Canonical Desktop Shell

## Status

**Prepared / blocked on repository protection.**

Do not begin product-code implementation until the `main` branch Ruleset is confirmed to require the existing **`Verify`** and **`E2E Smoke`** checks. This document may be reviewed before that gate is active.

This is the first Phase 1 product slice. It intentionally does **not** implement the whole Phase 1 surface.

## Goal / why

Replace the Phase 0 bootstrap proof with a high-fidelity, fake-data implementation of Lunowa's canonical desktop workspace from visual references `00`–`02`.

The slice should prove that the core information hierarchy and the most important interaction invariant work in the real application **before** Gmail, persistence, background jobs, or AI shape the UX.

Target user outcome:

> A user can scan realistic conversations, open an ordinary thread in `会話`, and open the same conversation's contextual `今の要点` through its status chip without losing orientation.

## Current -> desired behavior

### Current

- `/ja` renders the Phase 0 `BootstrapProof` page.
- Tailwind, next-intl, Vitest, Playwright, and CI are working.
- No product shell or product component system is implemented.
- `shadcn/ui` has been accepted architecturally but deliberately not initialized yet.

### Desired

- `/ja` renders Lunowa's real three-pane desktop shell with representative fake data.
- Sidebar, conversation list, and detail pane match the hierarchy/tone of `00`–`02` closely enough to validate the product direction.
- Pane widths are resizable within safe bounds and persist locally.
- Ordinary conversation-row body activation selects the conversation and opens **`会話`**.
- Status-chip activation selects the same conversation and opens **`今の要点`**.
- Selected conversation and active detail mode are stable and keyboard-accessible.
- The fake-data boundary is domain-shaped and replaceable; fixture data is not scattered through presentation JSX.

## Relevant source of truth

Read only these first unless implementation evidence requires escalation:

- `AGENTS.md`
- `docs/product/IMPLEMENTATION-PLAN.md` — Phase 1 sequencing and scope
- `docs/design/DESIGN.md` — product/visual hierarchy and canonical shell
- `docs/design/INTERACTIONS.md` — row-body/status-chip semantics and context preservation
- `docs/design/RESPONSIVE.md` — minimum safe adaptation/resizing rules
- `docs/design/references/README.md` — visual-reference authority
- `docs/design/references/00-brand-system.png`
- `docs/design/references/01-component-system.png`
- `docs/design/references/02-desktop-conversation-default.png`
- `docs/product/TECH-STACK.md`
- `docs/decisions/0004-web-runtime-and-ui-stack.md`
- current `package.json`, `src/app/globals.css`, locale messages, tests, and Playwright configuration

Text specifications override incidental screenshot artifacts. `00` owns brand direction, `01` reusable component language, and `02` the canonical desktop shell.

## Scope / non-goals

### In scope

1. **Design tokens / UI foundation**
   - normalize Lunowa brand/state/surface/text/border/focus tokens in one semantic layer;
   - use the accepted Navy `#0F1B3D` and Lunar Gold `#F2D9A6` direction from the design spec rather than preserving Phase 0 approximations blindly;
   - establish readable Japanese-capable typography using framework/platform-supported loading rather than copying fonts into the repository;
   - initialize only the shadcn/ui foundation/components actually required by this slice.

2. **Canonical wide desktop shell**
   - Sidebar;
   - Conversation List;
   - Detail;
   - safe min/max widths;
   - pointer resizing with accessible separator semantics where supported;
   - persisted preferred pane widths in browser-local state;
   - Detail remains the priority reading surface.

3. **Sidebar shell**
   - Lunowa brand mark treatment using committed repository assets/references;
   - `＋ 新規メール` affordance (visual only for this slice unless trivial navigation state is needed);
   - current scope control;
   - primary lifecycle navigation (`すべて`, `対応が必要`, `あとで`, `待ち`, `ピン留め`);
   - account/settings presence sufficient to match the shell hierarchy.

4. **Conversation list**
   - representative realistic fake conversations;
   - sender/organization, topic, preview, time/date, unread/pin/account context where useful;
   - one primary lifecycle status chip;
   - selected/hover/focus states;
   - density consistent with roughly 8–12 useful rows in a typical laptop viewport.

5. **Conversation detail**
   - `会話` / `今の要点` switching surface;
   - representative thread timeline with short and long-message examples;
   - attachment card treatment sufficient to match `02`;
   - inline reply-composer shell sufficient to match `02` visually;
   - no real send behavior.

6. **Critical interaction contract**
   - row body -> same conversation in `会話`;
   - status chip -> same conversation in `今の要点`;
   - chip is not nested inside a row-wide button in a way that breaks keyboard/pointer semantics;
   - chip has an accessible name such as `今の要点を見る` including enough conversation context to avoid ambiguity where practical.

7. **Minimum width safety**
   - desktop is the quality target for this slice;
   - at narrower widths the page must not catastrophically overflow or discard selected state;
   - do not attempt full `18`/`19` tablet/mobile fidelity in this task.

### Out of scope

- Moment-state visual fidelity for references `03`–`08` beyond the minimum content needed to verify chip -> `今の要点` routing;
- full new-compose flow/reference `09`;
- search, Person Context, attachment preview, onboarding, settings, system-state feature implementation;
- polished tablet/mobile implementations `18`–`19`;
- Gmail/Microsoft APIs or OAuth;
- PostgreSQL, Drizzle, Better Auth, Neon;
- Trigger.dev or Temporal Contract execution;
- OpenAI/AI runtime;
- TanStack Query unless a real server-state need appears (none is expected in fake-data shell);
- a global client-state library;
- rich-text editor selection or implementation;
- production deployment/release work.

## Material constraints

- Preserve the accepted product invariant: **Conversation is not the workflow-state owner; Action Items are.** Fake fixtures should not encode the UI around a one-state-per-conversation domain assumption.
- Keep provider-specific shapes out of the UI fixture/domain boundary.
- `Pin` is orthogonal to lifecycle state.
- Lunowa-owned UI strings remain behind next-intl; do not scatter hard-coded Japanese strings through reusable components.
- Generated reference images are visual evidence, not executable behavior specs.
- Do not reduce core text size just to mimic a screenshot or keep three panes visible.
- No production or provider secrets are needed for this slice.
- Do not weaken existing `Verify` / `E2E Smoke` evidence to land the UI.

## Reuse / existing path

Reuse before custom implementation:

1. existing Next.js / React / Tailwind / next-intl setup;
2. semantic tokens already started in `src/app/globals.css`, reconciled with current accepted design values;
3. shadcn/ui for commodity accessible primitives where it fits, especially resizable panes, tabs, buttons/tooltips/dropdowns/scroll areas as actually needed;
4. Lucide-compatible icons;
5. browser `localStorage` or an equivalently small browser-native mechanism for pane-width preference;
6. existing Vitest/RTL/Playwright setup.

### shadcn/ui activation note

Current official shadcn guidance was re-checked on 2026-08-20:

- Base UI is the default base for new projects;
- the Rhea style is specifically positioned as a soft/rounded but more compact product-interface foundation;
- CSS variables remain the recommended theming mechanism.

**Preferred first candidate:** Base UI + Rhea-family style + neutral base + Lucide + CSS variables, because it appears to fit Lunowa's calm/soft-but-dense direction better than a spacious or editorial baseline.

This is implementation material, not design authority. Before generating multiple components, inspect the resulting foundation against `00-brand-system.png` and `01-component-system.png`. If it clearly fights Lunowa's component geometry/density, stop and choose a better official shadcn base/style rather than compensating with widespread overrides.

Do not install a broad component library inventory. Add only primitives used by the slice and review the generated/copied code and dependency changes.

## Design notes

### Suggested code boundary

Use an equivalent clean structure; exact names are not mandatory if nearby repository conventions support a better one.

```text
src/
  components/
    ui/                   # copied/adapted commodity primitives
    mail/                 # Lunowa product components
  features/
    mail-workspace/       # shell/list/detail state and composition
  fixtures/
    mail/                 # representative fake domain-shaped data
  lib/                    # narrow shared utilities only
```

Avoid a giant `page.tsx` containing the entire product.

### Fake-data contract

Fixtures should model enough real shape to pressure the UI:

- several conversations;
- different lifecycle projections (`ACTION_REQUIRED`, `DEFERRED`, `WAITING`, `COMPLETED` as display inputs, while underlying fixture shape can include Action Items);
- read/unread;
- pinned/unpinned;
- multiple accounts/scopes where useful to the shell;
- short and long names/topics/previews;
- a representative thread with multiple messages and an attachment;
- at least one conversation with multiple Action Items in the fixture model even though full Moment multiple-task UI is deferred.

Do not build persistence/repository abstractions that pretend a database already exists. A typed fixture source or thin in-memory repository interface is enough if it keeps UI components independent of literal fixture objects.

### UI state

For this slice, ordinary React state is expected to be sufficient for:

- selected conversation;
- active detail mode (`conversation` / `moment`);
- pane widths;
- simple nav selection.

Do not introduce Zustand/Redux/TanStack Query unless implementation evidence demonstrates a concrete need.

## Specialist triggers

**Expected trigger:** runtime/browser verification only.

Use the existing Playwright/browser path to prove interaction and rendering. Do **not** load the full Security, Monetization, AI, Reliability, Delivery/Recovery, or Production Readiness harnesses for this fake-data UI task unless the scope actually changes.

Architecture escalation is unnecessary if the slice remains inside the accepted ADR/product architecture and does not create a new durable system boundary.

## Acceptance criteria

- [ ] **AC-01** `/ja` renders the real Lunowa workspace rather than `BootstrapProof`.
- [ ] **AC-02** At a canonical wide desktop viewport, Sidebar / Conversation List / Detail are simultaneously visible with hierarchy/proportions materially consistent with `02-desktop-conversation-default.png`.
- [ ] **AC-03** Brand/component styling is materially consistent with `00`/`01`; semantic tokens are centralized rather than scattered as one-off values.
- [ ] **AC-04** Conversation fixtures are typed/domain-shaped and presentation components are not filled with scattered arbitrary sample literals.
- [ ] **AC-05** Activating a normal conversation-row body selects that conversation and opens `会話`.
- [ ] **AC-06** Activating that row's lifecycle chip selects the same conversation and opens `今の要点`; the chip is keyboard focusable and has an accessible name.
- [ ] **AC-07** Switching conversations after visiting `今の要点` via a chip still makes an ordinary row-body activation open `会話`; the prior mode must not leak across the row-body semantic.
- [ ] **AC-08** Pane boundaries resize within safe limits; preferred widths survive a reload in the same browser profile; invalid/stale stored values cannot make the shell unusable.
- [ ] **AC-09** The list demonstrates realistic density, selection, unread, pin, status, long/short copy, and account-context behavior without severe clipping at the target desktop viewport.
- [ ] **AC-10** Detail renders a representative thread, attachment treatment, and reply-composer shell without real provider/send dependencies.
- [ ] **AC-11** Essential interaction is usable by keyboard with visible focus; color is not the sole indicator of lifecycle/selection.
- [ ] **AC-12** Existing canonical verification remains green and browser tests assert the new product behavior rather than obsolete Phase 0 bootstrap copy.
- [ ] **AC-13** A narrow viewport smoke check still proves the application does not catastrophically overflow or become inaccessible; full responsive visual fidelity remains deferred.
- [ ] **AC-14** No Gmail, database, auth, jobs, AI, global-state framework, or production service is activated by this slice.

## Verification / evidence plan

| Criterion | Required evidence | How / where |
| --- | --- | --- |
| AC-01–04 | implementation + static/component evidence | `pnpm verify`, targeted RTL tests where they add signal |
| AC-05–07 | direct browser interaction | Playwright against the real built app |
| AC-08 | direct browser interaction + reload | Playwright drag/reload or equivalent high-signal browser check |
| AC-02–03, AC-09–10 | rendered visual evidence | screenshots at the canonical desktop viewport, inspected against `00`–`02`; do not establish permanent golden baselines until visual approval |
| AC-11 | interaction/accessibility evidence | keyboard-focused Playwright/RTL checks; inspect semantic roles/names |
| AC-12 | canonical regression evidence | `pnpm verify` + `pnpm test:e2e`; PR CI `Verify` + `E2E Smoke` once Ruleset is active |
| AC-13 | narrow browser smoke | Playwright at a representative narrow width; only basic safety in this slice |
| AC-14 | diff/dependency inspection | inspect `package.json`, lockfile, env/config changes |

When screenshots are captured, record viewport dimensions. Visual comparison is evidence for layout/hierarchy, not proof of interaction behavior.

## Stop / escalation conditions

Stop and surface the issue before broad implementation if any of these occurs:

- `main` protection has not been confirmed with required `Verify` and `E2E Smoke` checks;
- `00`–`02` materially conflict with current Markdown design/interaction specs and the authority rule does not resolve it;
- the chosen shadcn base/style clearly fights Lunowa's accepted visual language before substantial component generation;
- implementing pane resize requires a custom low-level primitive despite a suitable mature component already being accepted/available;
- the fixture boundary starts dictating a persistence/provider architecture not accepted by `ARCHITECTURE.md` / later phases;
- scope expands into `03`–`19`, real provider/auth/database/AI, or production infrastructure;
- required browser verification cannot run reliably;
- a visual problem reveals the accepted information hierarchy itself is materially confusing — change/review the design before layering integrations on top.

## Completion report

At completion, report:

- exact product behavior implemented;
- which source/reference images were used;
- shadcn base/style/components actually adopted and why;
- `pnpm verify` result;
- `pnpm test:e2e` result;
- PR CI results;
- desktop screenshot viewport(s) and material visual mismatches still remaining;
- narrow smoke result;
- anything intentionally deferred to the next Phase 1 slice;
- whether this ordinary product task required any specialist Blueprint harness beyond browser/runtime verification.

That last item is part of the Blueprint v1.0-rc1 validation: ordinary Product UI work should remain on the thin Golden Path unless real risk triggers escalation.
