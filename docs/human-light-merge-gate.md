# Human-light Merge Gate

## Status

**Accepted initial merge policy for AI-heavy development.**

Lunowa does not assume that a human expert will read every line of every AI-generated diff. Merge confidence must therefore come from an evidence chain that is stronger than “the builder says it works” or “a fresh agent approved it.”

The objective is not zero human involvement. The objective is to spend human attention where judgment is valuable while ordinary implementation correctness is demonstrated mechanically.

Related sources:

- `agent-permission-model.md`
- `coding-agent-harness.md`
- `verification-review.md`
- `security-privacy.md`
- `product/ARCHITECTURE.md`
- `product/CONTRACTS.md`

`guardrail-integrity.md` is the protected-surface enforcement layer after its dedicated signer is verified.

---

## 1. Principle

> **Human-light does not mean evidence-light.**

A human should not need to reconstruct correctness by manually reading thousands of generated lines. Before merge, the repository should make the important claims observable through:

- accepted intent / acceptance criteria;
- deterministic type/schema/static constraints;
- behavior tests at the appropriate layer;
- runtime/browser/integration evidence when relevant;
- independent review for non-trivial work;
- protected-surface detection and human judgment for high-risk changes;
- rollback/recovery understanding for risky changes.

Passing CI is necessary, not universally sufficient.

---

## 2. Evidence bundle

Every non-trivial PR should make the following answerable without reading the whole diff:

1. **What was intended?**
   - task/issue/active plan and observable acceptance criteria.
2. **What changed?**
   - concise behavioral summary and material changed surfaces.
3. **What can break?**
   - actual failure modes relevant to the change.
4. **What evidence was executed?**
   - exact checks/tests/runtime actions and results.
5. **What was not verified?**
   - explicit limitations, mocks, unavailable provider/runtime evidence.
6. **Did another context challenge it?**
   - independent agent review when required by risk/complexity.
7. **Can it be recovered?**
   - revert/rollback/forward-fix posture where failure is costly.
8. **Does a human judgment gate apply?**
   - risk tier and protected-surface status.

A PR description/completion report should summarize this evidence rather than reproduce implementation reasoning.

---

## 3. Risk tiers

Risk is determined by **behavior and authority**, not merely by file extension or diff size.

If uncertain between two tiers, use the higher tier until the uncertainty is resolved.

### R0 — trivial / editorial

Examples:

- typo/copy correction;
- formatting-only documentation change;
- non-semantic comment cleanup;
- narrowly obvious test-data correction with no behavior change.

Required evidence:

- relevant lightweight check;
- no protected surface;
- no runtime/security/data behavior change.

Fresh reviewer is optional when the change is genuinely obvious.

Human may merge from the summary/checks without reading the entire diff.

### R1 — ordinary reversible product/engineering change

Examples:

- isolated UI behavior;
- ordinary component/refactor work;
- fake-data product slice;
- non-sensitive helper/domain code with clear tests;
- accessible/responsive interaction improvement;
- additive low-risk internal behavior with no privileged external side effect.

Required evidence as applicable:

- explicit acceptance criteria;
- `Verify` green;
- `E2E Smoke` and/or targeted Playwright for user-visible flows;
- focused unit/component/integration tests for the changed failure modes;
- browser/runtime evidence for frontend/runtime behavior;
- no unresolved protected surface;
- fresh independent reviewer for normal non-trivial R1 work;
- no unexplained warnings/flakes.

For R1, the human normally reviews the **evidence summary/outcome**, not every line of code.

### R2 — high-impact / protected / trust-sensitive

A change is R2 if a mistake can violate a significant trust, security, data-integrity, provider, money, or lifecycle promise even when rollback is technically possible.

Examples include:

- GitHub Actions / verification / build-script policy;
- dependency or lockfile changes that alter executable supply-chain capability;
- authentication / authorization / OAuth;
- provider credential handling;
- Gmail/Microsoft sync/reconciliation;
- send/retry/idempotency behavior;
- Lifecycle authoritative transitions;
- Temporal Contract persistence/firing/reconciliation;
- database schema/migrations with durable data impact;
- data retention/deletion paths;
- encryption/key-management code;
- billing/payment logic;
- production deployment configuration;
- major architecture/data-authority changes.

Required evidence:

- reviewed design/Task Contract before expensive implementation where appropriate;
- all relevant R1 evidence;
- fresh independent reviewer with an explicitly adversarial brief;
- negative/adversarial tests, not only happy-path tests;
- integration/provider/migration/idempotency/failure-injection evidence as applicable;
- rollback/forward-recovery plan;
- `Guardrail Integrity` exact-head human approval when the protected-surface mechanism applies;
- human judgment on the **risk-bearing surface**.

Human judgment does **not** require reading unrelated generated code. Keep R2 PRs small enough that the human can inspect the material boundary/change/evidence directly.

### R3 — irreversible / production-dangerous

A change/action is R3 when the main risk is an irreversible or externally consequential operation rather than merely merging code.

Examples:

- destructive production migration with non-trivial rollback risk;
- production data deletion/retention execution;
- encryption-key rotation/destruction;
- broad production OAuth scope/credential changes;
- changing production secret/IAM boundaries;
- direct production database repair/mutation;
- payment settlement/refund automation with material consequence;
- DNS/domain ownership or destructive cloud administration;
- bypassing repository/Guardrail protection.

Required posture:

- explicit human design/judgment before execution;
- staged/canary/dry-run where possible;
- backups/recovery evidence where relevant;
- separate production authorization;
- no coding-agent direct execution by default;
- no auto-merge/auto-deploy merely because CI is green.

R3 is a human-controlled operation assisted by agents, not an autonomous coding task.

---

## 4. Production Merge Gate

### Current mandatory baseline

A normal merge candidate must have:

- PR-based change to `main`;
- branch based on/up-to-date with current protected `main` once the Ruleset is active;
- `Verify = success`;
- `E2E Smoke = success`;
- `Guardrail Integrity = success` after that mechanism becomes enforced;
- no merge conflict;
- acceptance evidence appropriate to its risk tier;
- no known unresolved blocking review finding.

The GitHub Ruleset is the mechanical floor. Risk-tier requirements may be stricter than the Ruleset.

### Fresh reviewer

For R1 non-trivial and all R2 changes, use a reviewer that:

- starts from fresh context;
- reads accepted goal/constraints and current repository/diff;
- does not rely on the builder's hidden reasoning;
- reviews both conformance and adversarial correctness;
- may reject the requested design itself.

Fresh review is **one evidence source**, not a replacement for executable verification.

---

## 5. Testing Oracle problem

Builder-written tests can encode the same misunderstanding as builder-written code.

Mitigations for important changes:

- acceptance criteria come from durable product/provider contracts before implementation;
- test externally observable behavior rather than only private implementation details;
- use independent fixtures/contracts when available;
- include negative/authorization/failure scenarios;
- compare provider behavior with official API contracts for integration work;
- use browser/runtime evidence for UX rather than trusting component snapshots alone;
- use database constraints/transactions for data invariants that should not depend on application tests;
- for AI behavior, use held-out representative eval cases and deterministic authority outside model output.

For R2 work, a builder adding both implementation and tests is not enough evidence by itself.

---

## 6. What the human actually reviews

### R0

Usually just change intent + green checks.

### R1

Human reviews:

- intended user/system outcome;
- evidence summary;
- screenshots/runtime result when visually meaningful;
- any unresolved limitation/trade-off.

Line-by-line diff reading is normally optional.

### R2

Human reviews:

- why the change is needed;
- architecture/security/data/side-effect boundary being modified;
- credible failure modes;
- relevant focused diff or schema/config boundary where judgment matters;
- independent reviewer findings;
- verification evidence;
- rollback/recovery;
- exact-head Guardrail approval.

The human is reviewing **the dangerous decision surface**, not proving syntax correctness manually.

### R3

Human owns the decision and production execution authorization.

---

## 7. Builder completion report

For non-trivial changes, the builder should report:

```text
Behavior changed:
Risk tier:
Acceptance criteria:
Checks actually run:
Runtime/integration evidence:
Independent review:
Protected surfaces changed:
Anything not verified:
Rollback/recovery:
Durable docs changed:
```

Do not report a check as passed if it was mocked, skipped, inferred, or only run on a materially different environment.

---

## 8. Merge authority / automation policy

### Current stage

**No auto-merge. No agent-controlled merge.**

The human owner performs the final merge after the evidence bundle is complete.

Reason:

- one human merge click is currently cheap;
- Guardrail Integrity and permission separation are still being established;
- the product has not accumulated enough real failure/rollback evidence to justify removing this final stop point.

This is intentionally more conservative than mature high-throughput agent-first case studies whose repositories already have deeper test/observability/rollback infrastructure.

### Revisit criteria

Consider agent/auto-merge for R0/R1 only when all are true:

- `main` Ruleset is active and reliable;
- Guardrail expected-source spoof tests have passed;
- builder identity cannot issue human Guardrail approval;
- CI is deterministic enough that bypass/rerun rituals are rare;
- runtime/browser evidence is routinely generated for affected flows;
- revert/rollback path has been exercised;
- independent review is available when the tier requires it;
- actual merged-change history shows that current gates catch the failure modes that matter.

Do not set an arbitrary PR-count target and call that safety evidence.

R2/R3 remain human-gated even if R0/R1 automation later increases.

---

## 9. Flakes and failed checks

Do not normalize rerunning a failed check until it happens to pass.

When a required check fails:

1. inspect the failure;
2. identify product failure vs infrastructure flake;
3. fix systemic flakes when recurring;
4. rerun only when there is a reason the rerun is meaningful;
5. never weaken/skip a gate merely to unblock the PR.

A flaky required gate is itself a reliability defect because it trains humans/agents to ignore evidence.

---

## 10. Reversibility and small slices

AI generation speed is a reason to make **smaller coherent PRs**, not larger ones.

Prefer a PR that:

- has one observable goal;
- changes one primary risk surface;
- can be independently verified;
- can be reverted without unrelated damage;
- does not bundle opportunistic cleanup.

Do not use an arbitrary line-count limit. Diff size is a signal; semantic coupling and risk are the real constraints.

---

## 11. Escalation rules

Escalate the risk tier when:

- the change introduces a new external side effect;
- durable state/data authority changes;
- authorization/sensitive data scope expands;
- a retry/idempotency/concurrency invariant changes;
- rollback is unclear;
- verification depends primarily on mocks for a production-relevant property;
- provider/API behavior is uncertain;
- a protected surface is changed;
- the reviewer cannot explain why the evidence is sufficient.

Unknown is not evidence of safety.

---

## 12. Current Lunowa-specific high-risk promises

Even before exact implementation paths exist, treat changes to these promises as at least R2:

- `AI understands; rules decide state` authority boundary;
- ActionItem lifecycle authority and reopen/completion semantics;
- Temporal Contract persistence, trigger, idempotency, cancellation, reconciliation, and resurfacing;
- send idempotency / duplicate-send prevention;
- provider sync cursor/reconciliation and missed-event recovery;
- mailbox credential ownership/access;
- cross-account/scope authorization;
- email HTML/attachment trust boundary;
- user-data retention/deletion;
- any mechanism that can silently hide a real user obligation.

When the concrete modules/paths for these concerns are established, update Guardrail Integrity so the mechanical protected-surface detector covers the stable high-risk boundaries without forcing human approval for ordinary UI/test work.
