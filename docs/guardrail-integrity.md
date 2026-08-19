# Guardrail Integrity

Lunowa is developed with substantial AI coding-agent execution and limited line-by-line human review. Stable verification and security controls therefore need protection from the same agents whose changes they evaluate.

This document defines the minimal **Guardrail Integrity** policy for the current solo-developer repository.

## Threat model

A generated change can appear healthy while weakening the system that judges it. Examples include:

- replacing a real CI command with a no-op;
- deleting or weakening lint/type/test configuration;
- changing GitHub Actions so required checks always pass;
- broadening OAuth/auth/security behavior without explicit judgment;
- changing database migration or deletion behavior;
- adding dependency/install-script capability without review;
- modifying architecture/security source-of-truth docs to normalize an unsafe implementation.

The policy does **not** assume malicious intent. Accidental optimization toward “make CI green” is sufficient reason to isolate these controls.

## Core rule

Ordinary product changes should be able to merge from mechanical evidence without line-by-line human review.

Changes to a **protected surface** require an explicit human judgment event tied to the exact PR head SHA in addition to normal CI.

The approval is not evidence that every changed line is correct. It means a human intentionally accepted that this PR is allowed to modify a high-impact boundary and has reviewed the relevant risk/evidence.

## Protected surfaces — current baseline

The enforcement workflow is the executable source of truth for exact path matching. The baseline protects these categories:

### Repository / agent / verification control

- `.github/**`
- `AGENTS.md`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `.gitignore`
- `.env.example`
- `.node-version`
- TypeScript / ESLint / Next / PostCSS / Vitest / Playwright configuration
- `docs/coding-agent-harness.md`
- `docs/verification-review.md`
- this document

### Durable architecture / security decisions

- `docs/security-privacy.md`
- `docs/product/ARCHITECTURE.md`
- `docs/product/CONTRACTS.md`
- `docs/product/DATA-MODEL.md`
- `docs/product/TECH-STACK.md`
- `docs/decisions/**`

### Security / persistence / privileged product code

Current/future paths under:

- `drizzle/**`
- `migrations/**`
- `src/db/**`
- `src/proxy.ts`
- `src/**` path segments named `auth`, `oauth`, `security`, `billing`, `payments`, `encryption`, `crypto`, or `migrations`

Do not protect every test or application file. That would turn the Human-light model back into manual review of ordinary feature work. Test **infrastructure** is protected; ordinary behavior tests remain part of normal implementation evidence.

Update the protected set when the repository acquires a new high-impact boundary. Do not expand it for one-off anxiety without a repeatable failure mode.

## Enforcement architecture

`.github/workflows/guardrail-integrity.yml` runs from the trusted **base repository/default-branch context** on PR metadata events.

It intentionally:

- does **not** checkout PR code;
- does **not** install PR dependencies;
- does **not** execute PR scripts/configuration;
- does **not** use application/provider secrets;
- reads PR metadata/files/comments through the GitHub API;
- posts only the `Guardrail Integrity` commit status to the PR head SHA.

The workflow uses `pull_request_target` only for this metadata-policy purpose. Using `pull_request_target` for build/test execution remains prohibited unless separately designed and reviewed.

Once the workflow is on `main`, a PR that edits the guardrail workflow itself is still evaluated by the pre-existing trusted version from `main`.

## Approval protocol

If no protected path changed, the workflow posts:

```text
Guardrail Integrity = success
```

If a protected path changed, it posts failure until the repository owner comments on that PR with exactly:

```text
guardrail-approved:<FULL_PR_HEAD_SHA>
```

Example:

```text
guardrail-approved:0123456789abcdef0123456789abcdef01234567
```

The approval must:

- come from the repository owner;
- have GitHub author association `OWNER`;
- match the current full PR head SHA exactly.

A later push changes the head SHA, so an older approval no longer authorizes the new version. The owner must intentionally approve the new head again.

### Agent rule

Builder/reviewer agents MUST NOT create, edit, or imitate the `guardrail-approved:<sha>` approval comment.

The later Agent Permission Model must preserve this mechanically by keeping ordinary coding-agent credentials away from issue/PR-comment administration where practical.

## Merge gate

After this mechanism is verified, the `main` Ruleset should require all of:

- `Verify`
- `E2E Smoke`
- `Guardrail Integrity`

When GitHub lets the required status be bound to an expected source, use GitHub Actions rather than an arbitrary source.

## Failure-safe behavior

If Guardrail Integrity cannot evaluate the PR or post its status, it should not manufacture success. Missing/failed required status should block merge once the Ruleset is active.

Do not add path filters that can cause the required check not to run on some PRs.

## What this does not solve

Guardrail Integrity is one layer, not proof of correctness. It does not replace:

- acceptance criteria;
- domain/integration/E2E tests;
- security analysis;
- dependency review;
- independent review where worthwhile;
- runtime evidence;
- rollback/recovery planning;
- human judgment for high-impact product/security changes.

It also relies on coding agents **not** receiving the repository-owner capability used to issue approval comments. That is handled by the Agent Permission Model.

## Verification before enforcement

Before adding `Guardrail Integrity` to the required Ruleset:

1. Merge the trusted base workflow after normal CI and focused review.
2. Open an ordinary non-protected test PR and confirm `Guardrail Integrity = success`.
3. Open a disposable PR that changes a protected surface and confirm it is `failure` without approval.
4. Add an exact owner approval for that test head SHA and confirm the status becomes `success`.
5. Push another commit and confirm the old approval no longer authorizes the new SHA.
6. Close the disposable test PR without merging.

Only after this evidence should the Ruleset require the status.

## Repository ownership caveat

The current approval rule assumes this repository remains owned by the personal account `miki-thecat`, where GitHub marks the owner's comments with association `OWNER`.

If Lunowa moves to an organization or gains additional trusted human maintainers, redesign the approver identity rule before relying on this mechanism. Do not silently broaden approval to any collaborator.
