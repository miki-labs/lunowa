# Coding-Agent Harness

AI coding agents are an execution layer inside the engineering system. Correctness should come primarily from repository knowledge, stable interfaces, constrained permissions, executable verification, and review—not from assuming a particular model will remember or infer every rule.

This document is provider-neutral. Product repositories may use Codex, Claude Code, Copilot, or other agents without turning transient model behavior into global engineering policy.

## Humans steer judgment; agents execute bounded work

Keep human/product-owner judgment focused on areas where incorrect assumptions are expensive:

- product intent and acceptance criteria,
- important trade-offs,
- architecture/security/privacy boundaries,
- irreversible or high-impact decisions,
- final evaluation of meaningful outcomes.

Use agents for high-volume execution such as repository inspection, implementation, tests, static checks, documentation maintenance, routine review, and feedback handling.

Do not equate autonomy with success. Increase autonomy only when the surrounding repository and tools make failures detectable, bounded, and recoverable.

## Durable context lives outside a chat session

Critical implementation knowledge SHOULD live in versioned inspectable artifacts rather than only in chat history, model memory, or undocumented human memory.

Use `docs/repository-knowledge.md` for the shared knowledge architecture. Agents do not need identical conversation histories when they can inspect the same accepted product behavior, architecture, contracts, tests, decisions, and verification rules.

Do not dump raw conversation history into the repository.

## Keep `AGENTS.md` short and navigational

Root agent instructions should normally contain only:

- project purpose,
- repository/source-of-truth map,
- canonical install/run/verify commands,
- a small set of high-value global constraints,
- pointers to deeper project-local guidance.

When instructions become large, move durable detail to the artifact that owns it rather than expanding always-loaded context.

Use narrower path/component instructions only when they solve a real local problem and the selected agent supports that mechanism. Avoid depending on one vendor's exact lookup semantics as a portable invariant.

## Give non-trivial work an evaluable contract

A coding task should provide enough information to determine whether it succeeded.

Use `templates/task-contract.md` as needed and include:

- goal and why,
- relevant source of truth,
- current and desired observable behavior,
- scope and non-goals,
- constraints,
- required reuse or prohibited replacement,
- security/privacy/platform considerations,
- acceptance criteria,
- verification expectations,
- stop/escalation conditions.

Avoid prescribing speculative implementation detail before the agent inspects the repository unless the detail is an actual constraint.

## Prefer direct task execution before orchestration

The default non-trivial delivery path should remain legible without a custom control plane:

```text
live task contract + dependency gate
-> dedicated branch/worktree
-> direct coding agent
-> targeted and canonical verification
-> PR/CI
-> independent exact-head cumulative review
-> correction on the same PR/worktree on FAIL
-> merge only after PASS
```

One active implementation should own one task/worktree. Never run duplicate agents against the same task/worktree concurrently. Parallel implementation is appropriate only for distinct unblocked tasks with isolated worktrees and runtime state; that isolation does not establish parallel merge safety. Revalidate affected candidates after material base movement.

Add orchestration only after measured throughput, coordination, or recovery pressure justifies its lifecycle and failure cost. Do not turn direct execution into a new daemon, workflow database, automatic replay system, or SDK control plane by default.

### Terminal control and bounded parallelism

For Lunowa, the durable terminal control surface is `scripts/direct_agent_control.py`; `lw snapshot` / `lw fleet` / `lw agent ...` are host convenience aliases. The script reads live GitHub `blocked_by`, PRs, worktrees, bounded process/log evidence, local resources, and observed Codex quota failures. It does not own Product state or introduce a scheduler/database.

The operating assumption is **ChatGPT-only human control**: the human gives Product intent to ChatGPT; ChatGPT plus Remote Desktop Commander drives the machine interface. `snapshot` is therefore the default routine read. It normalizes decision-relevant GitHub/Git/runtime state into compact JSON, while `fleet`, task/review commands, and raw logs are progressive-disclosure diagnostics. A snapshot is never a new authority: GitHub/Git/CI remain authoritative and write actions re-read live state. `snapshot_id` is only a deterministic fingerprint of the observed decision state; `agent start --expect-snapshot ID` may reject stale controller state before dispatch.

CLI optimization is measured rather than assumed. Local controller metrics may record only bounded metadata such as command name, elapsed time, output bytes, subprocess/GitHub-CLI/remote-git call counts, success, and model-reported Codex usage totals. They must not persist raw stdout/stderr, prompts, GitHub bodies, provider/mail content, scanner findings, or credentials. Model-reported token usage is an engineering signal, not billing/quota truth. Metrics failure is optional and must never block Product delivery.

Operational defaults are deliberately small:

- target about **3** concurrent top-level implementation lanes; hard-cap ordinary solo operation at **4** until measurement justifies more;
- actual fresh dispatch is `min(independent ready work, candidate/review WIP capacity, quota, local resource capacity)`;
- correction of an existing candidate consumes process capacity but does not create new WIP;
- one Issue/worktree has one top-level write owner; use native subagents only for independent read-heavy exploration, research, hypothesis testing, or test/log analysis unless a task explicitly establishes disjoint write ownership;
- review-ready candidates count against WIP. Drain review/integration before opening excess fresh branches;
- stop/timeout/crash never grants retry authority. Inspect the worktree, logs, terminal event, PR head, and GitHub state first;
- shared root assets, workflows, migrations, and schema ownership may require serial merge/revalidation even when implementation ran in parallel.

Useful controller commands:

```text
python scripts/direct_agent_control.py snapshot
python scripts/direct_agent_control.py snapshot --since SNAPSHOT_ID
python scripts/direct_agent_control.py fleet
python scripts/direct_agent_control.py metrics
python scripts/direct_agent_control.py agent start ISSUE --dry-run
python scripts/direct_agent_control.py agent start ISSUE --expect-snapshot SNAPSHOT_ID --dry-run
python scripts/direct_agent_control.py agent start ISSUE --tool-profile docs --dry-run
python scripts/direct_agent_control.py agent status [ISSUE]
python scripts/direct_agent_control.py agent logs ISSUE
python scripts/direct_agent_control.py agent stop ISSUE
```

The controller (normally ChatGPT plus Remote Desktop Commander) chooses which Issue to start, model/reasoning effort, external evidence, review order, and any privileged write. The terminal helper validates and executes that decision; it does not autonomously choose, retry, merge, deploy, or broaden tool authority.

Direct-agent tool profiles are fail-closed: `repo` exposes no MCP/plugin integrations, `docs` adds Context7, `ui` adds Context7 + Next DevTools, and `browser-debug` additionally adds Chrome DevTools. Remote plugins and privileged external/provider MCPs remain disabled for coding-agent runs; the controller obtains or authorizes that evidence separately.

### Agent-native tooling policy

Optional local tools should reduce context, risk, or verification cost without becoming new task authority. Inspect them with `python scripts/direct_agent_control.py capabilities`. Prefer `rg` first and `ast-grep outline` when available for a cheap structural first pass. Betterleaks may scan the local diff/pre-commit state in JSON form, but ordinary guards must not enable live secret validation/network calls implicitly. Missing optional tools never block the direct path.

Docker Sandboxes remain an experimental execution substrate, not the default path. Promote them only after a bounded single-Issue A/B pilot proves KVM/access readiness, Codex authentication, project skills/tool profiles/MCP behavior, worktree semantics, verification compatibility, startup overhead, and terminal failure observability. User-level `~/.codex` configuration is not assumed to exist inside a sandbox. Testcontainers is deferred until package/lockfile ownership is clear or a DB task explicitly needs real isolated PostgreSQL evidence. Serena is opt-in for semantic cross-file work rather than a global MCP dependency.

## Inspect before editing

For non-trivial work, inspect the relevant subset of:

- repository instructions and durable product/architecture knowledge,
- nearby implementations and conventions,
- schemas/contracts,
- tests and canonical verification,
- framework/platform/official capabilities,
- dependencies and security constraints.

Search for an existing solution before creating another one.

## Plan only when complexity justifies it

Complex, cross-cutting, risky, ambiguous, or long-running work SHOULD have a reviewed plan before large edits.

Narrow tasks should not pay the same planning cost.

Plans are living artifacts: revise them when repository or runtime evidence invalidates assumptions.

## Optimize agent throughput through small batches

AI generation capacity is a reason to produce more small safe changes, not larger diffs.

Prefer slices that are:

- coherent,
- independently verifiable,
- easy to review,
- easy to revert or contain,
- explicit about dependencies on previous slices.

Large mixed changes increase the chance that correct-looking code hides requirement, security, migration, or integration errors.

## Reuse before custom generation

Agents MUST NOT treat cheap code generation as evidence that custom implementation has the lowest lifecycle cost.

Before substantial custom implementation or a new dependency, inspect existing repository, framework/platform, official SDK/API, established component/template, mature OSS, and suitable managed-service options.

When a task explicitly requires an OSS component, service, or template, do not silently replace it with a custom imitation. Report the incompatibility and trade-off instead.

## Mechanical guardrails beat repeated prompt rules

Stable invariants SHOULD be encoded in the strongest practical mechanism:

- schemas/types,
- database constraints,
- module/package boundaries,
- generated/executable contracts,
- tests,
- lint/static/architecture checks,
- CI policy.

Use prose for judgment, rationale, and context that cannot safely be encoded.

A recurring agent mistake is evidence to improve the system only when the failure is general enough to justify the added maintenance cost.

## Make the repository legible to agents and humans

Prefer:

- predictable directories,
- explicit contracts and ownership,
- canonical commands,
- deterministic tests,
- useful error messages,
- searchable structured logs,
- local/test environments capable of reproducing important behavior.

Avoid critical conventions that exist only in one person's memory or hidden editor configuration.

## Builder verification is evidence, not a completion claim

The implementing agent SHOULD:

- run the canonical verification path,
- run targeted checks for the actual change risks,
- inspect its diff,
- exercise runtime/browser/device behavior when required,
- report exactly what was and was not verified.

Never claim a platform, behavior, security property, migration, or deployment was verified when the required check was not executed.

## Independent review for non-trivial work

Use a fresh reviewer context when the expected risk reduction exceeds the review cost.

The reviewer should receive the accepted goal/constraints and inspect the current repository/diff directly. Review both:

1. **conformance** — does the change satisfy the accepted behavior?, and
2. **adversarial correctness** — is the requested design itself introducing architecture drift, security/privacy risk, unnecessary complexity, weak tests, unsafe operations, or conflict with stronger repository evidence?

Builder self-review is useful but should not be the only evidence for high-impact changes.

## Containment and permissions

Coding agents are part of the threat model. Begin with the smallest practical authority and expand it only when the task requires it.

As appropriate:

- restrict filesystem write scope,
- restrict outbound network access,
- keep production credentials out of ordinary coding contexts,
- avoid routine deploy/admin/payment/store access,
- isolate secrets/signing material,
- constrain dangerous shell/tool capabilities,
- require stronger controls for irreversible or high-impact actions.

Treat issues, PRs, emails, webpages, retrieved docs, dependency metadata, and external repositories as potentially untrusted content when privileged tools are available.

Approval prompts are not a complete security boundary. Repeated approvals can become mechanical, and a user may not reliably detect a malicious instruction every time. Prefer hard sandbox, permission, egress, credential, and tool boundaries where practical; use approvals as an additional control for genuinely exceptional high-impact actions.

## Stable interfaces over model-specific compensations

Coding-agent harnesses inevitably contain assumptions about current models. Minimize assumptions that encode temporary model weaknesses or prompting tricks as durable architecture.

Prefer stable contracts such as:

- repository structure,
- schemas,
- commands,
- task contracts,
- tests,
- tool interfaces,
- permission boundaries,
- observability.

Re-evaluate harness workarounds when models or tools materially improve. Delete obsolete instructions rather than accumulating compatibility folklore forever.

## External/live context

Use repository files for durable accepted context and live integrations such as MCP/API tools for mutable external state that must be queried at execution time.

Start with repository files, search, and deterministic local CLI evidence. Select the smallest useful task-specific surface, adding MCP, plugins, network access, or specialist skills only when they provide material evidence or capability that the local path cannot provide equivalently. More connected tools increase context, permission, data-exposure, and failure cost; availability alone is not a reason to enable them.

Query mutable external state live only when its freshness can change the implementation or acceptance decision. Privileged or destructive external writes require separate explicit authority and containment; they should not become ambient coding-agent capability.

## Harness feedback loop

When an agent fails, ask what was actually missing:

- durable context,
- source-of-truth navigation,
- tool access,
- a stable interface,
- validation,
- a test fixture,
- observability,
- an architecture boundary,
- a permission constraint,
- a clearer task contract.

Fix the recurring system cause at the cheapest durable layer.

### Measure accepted delivery, not candidate activity

Use `python scripts/direct_agent_control.py throughput` (host shortcut: `lw throughput`) when comparing workflow changes. Track first-pass exact-head acceptance, correction runs, implementation-start-to-merge latency, and model/token usage per accepted Issue. Treat missing historical evidence as missing; publication, green CI, or merge without an observable exact-head PASS must not be promoted into acceptance evidence. Compare several comparable Issues before changing the harness again.

## Do not overgeneralize high-autonomy case studies

Organizations that allow highly autonomous agent execution generally rely on repository-specific investment in tests, guardrails, observability, deterministic tools, containment, and recovery.

Do not copy aggressive autonomy, merge, orchestration, or multi-agent practices without the supporting system and evidence that they improve this product's throughput or quality.

The default for a solo/small-team product is the smallest harness that makes important work reliable—not the largest agent platform that can be built.
