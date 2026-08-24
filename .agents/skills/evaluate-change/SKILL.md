---
name: evaluate-change
description: Independently evaluate a non-trivial proposed or implemented repository change against accepted intent and actual evidence. Use for fresh-context code/change review, pre-merge verification, AI-generated change audit, or when asked whether a change is actually complete, correct, and sufficiently evidenced to integrate.
---

# Evaluate Change

Act as an independent evaluator, not as the builder defending its own work. Read the accepted intent, inspect the actual candidate state, and try to falsify important completion claims before deciding whether the available evidence is sufficient.

Repository-local quality/security/release policy outranks this portable default when it is more specific and current.

Remain read-only by default. Do not silently repair the candidate while judging it; if remediation is requested, finish the evaluation first and then switch explicitly into an implementation task.

## 1. Identify the exact candidate

Establish, where applicable:

- repository/worktree;
- base and candidate branch/ref/commit;
- current working-tree changes;
- accepted task/spec/issue and its freshness;
- verification artifacts/runs claimed by the builder;
- environment/platform/source identity needed to interpret material evidence.

Do not review a summary when the actual diff/source/evidence is available.

If the candidate moved after evidence was produced and the movement can invalidate that evidence, classify the affected claim as stale until re-run.

## 2. Separate the evaluation questions

Do not collapse these into one confidence judgment:

1. **Conformance** — does the candidate implement the accepted intent without missing, contradictory, partial, or unrequested behavior?
2. **Executable/runtime verification** — were checks capable of falsifying the important claims actually run against the candidate state?
3. **Engineering review** — did the change introduce correctness, architecture, maintainability, security/privacy, data, reliability, platform, test-quality, or scope problems not encoded by the checks?
4. **Gate/integration decision** — is the available fresh evidence sufficient for the actual risk and repository policy?

A green test suite can coexist with a wrong requirement or weak test. A good-looking diff can still be unverified at runtime.

## 3. Inspect the accepted intent and actual diff

Read the smallest relevant set of authoritative sources, then inspect the changed-file list and actual diff.

Look specifically for:

- missing acceptance behavior or failure paths;
- scope beyond the accepted task/non-goals;
- duplicated services/helpers/components/state owners that should have reused a canonical path;
- unnecessary complexity or architecture drift;
- compatibility/migration/data-state mistakes;
- accidental secrets, debug state, generated artifacts, or broad permissions;
- behavior that is only asserted in prose rather than implementation/evidence.

Prefer evidence from exact current sources over builder recollection.

## 4. Route specialist review only when triggered

Escalate the relevant question, not the whole review, when the change materially affects:

- architecture/state/dependency boundaries;
- runtime/UI/device/integration behavior;
- security/privacy/auth/authorization/sensitive data/trust boundaries;
- high-impact NFR/evidence/freshness requirements;
- async/retry/idempotency/failure/recovery semantics;
- platform/store/device/build/signing;
- production deployment/migration/rollback/recovery;
- money/entitlement/usage/commercial state;
- user-facing AI/model/tool/action authority.

Do not load every specialist discipline for a low-risk local patch.

## 5. Challenge the evidence

For each material claim, ask what evidence could falsify it and whether that evidence actually exists for the candidate state.

Inspect important tests rather than counting them. Check for:

- meaningful assertions against observable behavior/contracts;
- deterministic and isolated setup where required;
- negative/failure/boundary cases proportional to risk;
- realistic integration boundaries;
- tests that would actually fail if the requirement regressed;
- generated tests that merely mirror the generated implementation's assumptions.

When the claim is inherently runtime/UI/integration-specific and direct reproduction is affordable, prefer independently exercising the runtime over trusting builder screenshots or narrative alone.

Agent/LLM visual or exploratory judgment is probabilistic evidence, not the sole authority for behavior that can be checked mechanically.

## 6. Protect the judge from self-modification

If the candidate modifies a required check, policy engine, allowlist, visual baseline, test oracle, merge/release rule, or other mechanism that helps certify the same candidate, distinguish implementation evidence from independent trust-root evidence.

A candidate-controlled green result does not by itself prove that the judging authority remains trustworthy.

Do not accept a failing candidate merely because the builder/agent:

- weakened or deleted an assertion;
- changed expected behavior without accepted requirement change;
- skipped a scenario;
- updated a screenshot/visual baseline solely to remove the diff;
- disabled or relaxed a required check;
- repeatedly reran a flaky test until it happened to pass.

## 7. Record findings by impact and evidence

Lead with concrete blocking findings, not a narrative recap.

For each material finding, state enough to act on it:

- affected behavior/file/contract;
- why it matters;
- supporting source/evidence;
- whether it is confirmed, a concern, or unverified;
- the smallest credible remediation or missing evidence when useful.

Avoid inventing speculative problems merely to produce a longer review.

## 8. Decision vocabulary

Use the repository's formal gate vocabulary when it exists. Otherwise use this compact evaluation vocabulary:

- **PASS** — material applicable claims have fresh sufficient evidence and no blocking finding remains.
- **CONCERNS** — evidence is sufficient for the current risk, but a material non-blocking limitation/residual risk should remain explicit.
- **FAIL** — a required behavior/control is wrong, a blocking finding exists, or repository policy defines a required missing/stale criterion as failure.
- **NOT_VERIFIED** — evidence needed to judge a material claim was unavailable, not run, not inspectable, or stale; this is not permission to integrate.

Do not force certainty when the evidence does not support it.

## 9. Output

Return concisely:

1. decision/status;
2. blocking findings first, then material concerns;
3. conformance result;
4. verification/evidence result and freshness;
5. specialist findings only where triggered;
6. anything still `NOT_VERIFIED`;
7. whether integration is supported by the available evidence.

If there are no findings, say so directly rather than padding the review.
