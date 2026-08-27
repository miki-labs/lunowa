# User Control / Correction / Escalation Candidate

## Status

**NONCANONICAL Product candidate — 2026-08-27.**

This document narrows Product behavior for user control, correction, escalation, approval, and failure repair. It does not supersede `docs/product/PRODUCT.md`, does not create new Responsibility schema or reducer semantics, and does not authorize implementation.

Evidence/rationale: `docs/product/research/user-control-correction-escalation-evidence-2026-08-27.md`.

---

# 1. Product objective

Lunowa should let the user remain in control **without making the user supervise every inference or action**.

Candidate doctrine:

> **User control should be local, semantically explicit, and low-effort. Lunowa should repair what it safely can itself, ask only for material decisions it cannot safely resolve, and never turn correction into a second monitoring job.**

This extends the canonical doctrine:

> **Eliminate work, not control.**

---

# 2. Distinct user-control meanings

The Product must not collapse these into one generic `Fix`, `Undo`, or `Done` operation.

## 2.1 Correct interpretation

Examples:

- `期限は月曜です`;
- `待っているのは見積書です`;
- `この依頼は私ではなく相手側です`.

Effect:

- user input becomes authorized evidence/decision input according to existing Responsibility authority rules;
- source communication remains immutable;
- relevant accepted state is re-evaluated;
- prior material interpretation/history remains reconstructable where needed.

Correction does not require the user to explain the model's internal failure.

## 2.2 Return attention now

Examples:

- `[今の対応に戻す]`;
- user pulls a Managed/Later item back into active attention.

Effect:

- changes attention/defer behavior where semantically valid;
- does **not** assert that external-world state changed;
- does not silently alter outcome, owner, closure, or evidence.

## 2.3 Modify return condition

Examples:

- `明日ではなく金曜に再確認`;
- `返信が来たら戻す`.

Effect:

- changes the relevant Temporal/attention return condition;
- does not change outcome truth;
- trigger firing still causes re-evaluation rather than automatic notification.

## 2.4 Stop tracking

Example:

- `[追跡を終了]`.

Effect:

- ends Lunowa monitoring according to existing domain rules;
- does **not** claim successful external outcome;
- must not be represented as `Satisfied` unless separate evidence/authority justifies satisfaction.

## 2.5 Confirm/correct outcome state

Examples:

- `これは完了済み`;
- `この依頼はキャンセルされた`.

Effect:

- supplies user-authoritative evidence/decision input;
- existing canonical Responsibility semantics determine satisfaction/cancellation/etc.;
- does not erase source/history.

## 2.6 Approve external action

Examples:

- `[送信]` after reviewing draft/recipients;
- future approved calendar/system mutation.

Effect:

- grants authority only for the displayed/bounded action;
- does not grant general monitoring, future-send, or unrelated tool authority;
- provider/tool outcome must still reconcile before accepted state changes.

---

# 3. Correction interaction

## 3.1 Smallest material correction

When Lunowa is wrong, ask for the smallest user decision that repairs the state.

Prefer:

```text
期限を確認

最新本文   金曜まで
以前の本文 月曜まで

[金曜]
[月曜]
[原文を見る]
```

Avoid:

```text
Lunowaの理解が間違っていました。
正しいResponsibility、owner、expected event、due dateを説明してください。
```

The user corrects **the material decision**, not the internal model representation.

## 3.2 Self-repair first

If trusted evidence/rules can safely repair the inconsistency without user judgment, Lunowa should do so and preserve/disclose the meaningful change where useful.

Escalate only when a user decision/authority is actually required.

## 3.3 Correction should not rewrite evidence

Original communication remains source evidence. Correction updates accepted interpretation/state through authorized input; it does not edit the original email or pretend the prior interpretation never existed.

For material cases, the history should remain reconstructable conceptually as:

```text
previous accepted interpretation
-> correction / new evidence
-> new accepted state
```

Routine UI need not show this entire trace unless useful for trust/recovery.

---

# 4. Escalation / Review contract

## 4.1 Review is a safety valve

> **Review is a safety valve, not an uncertainty inbox.**

Escalation is justified when uncertainty materially prevents Lunowa from maintaining a safe Product contract.

Candidate material triggers include:

- whether a Responsibility exists at all;
- current user/counterparty ownership or actionability;
- material due/expected-event interpretation;
- conflicting evidence about outcome satisfaction/closure;
- consequential, irreversible, financial, contractual, security, or identity-sensitive requested action;
- sender/account/recipient/attachment ambiguity that materially changes an external action;
- monitoring integrity degradation that prevents Lunowa from reliably keeping a delegated promise.

## 4.2 Do not escalate harmless uncertainty

Normally do not ask the user merely because:

- wording/taxonomy is imperfect but user action is unchanged;
- model confidence is low while a conservative state can safely remain open;
- an AI draft has stylistic uncertainty the user can edit normally;
- internal representation could be cleaner but the Product contract remains safe.

Model confidence alone is never the Review decision.

## 4.3 Approval must be decision-complete

For consequential external actions, the approval surface should expose the material effect before commit, such as:

- effective sender/account;
- recipients/scope;
- content/commitment;
- attachments;
- target system/object where relevant;
- meaningful irreversibility/risk where not obvious.

Do not use blind `Approve` for opaque actions.

## 4.4 Approval fatigue is a Product failure mode

If a class of ordinary cases repeatedly enters Review, the Product should not normalize an ever-growing approval queue.

Candidate response:

1. diagnose the repeated ambiguity class;
2. narrow automatic delegation/action handling for that class;
3. preserve conservative safe behavior;
4. disclose meaningful narrowing to the user;
5. re-expand only after evidence and, for permissions, explicit user authorization.

No numeric Review quota is fixed by this candidate.

---

# 5. Failure and trust repair

## 5.1 Repair state, not just sentiment

A material-miss recovery should, where supportable, communicate:

1. what was missed/wrong;
2. concrete affected interval/scope;
3. what state has been repaired;
4. whether related items were rechecked;
5. whether delegation was narrowed;
6. what remains safe/usable now.

Apology may accompany recovery, but apology alone is not recovery.

## 5.2 User should not co-debug the failure

Prefer self-repair and low-effort structured decisions. Do not make the user diagnose prompts, confidence values, scheduler internals, or model reasoning.

If user input is unavoidable, provide bounded alternatives and source evidence.

## 5.3 Scope-local degradation

One failure should not automatically disable unrelated safe capabilities.

Example:

```text
reply-arrival monitoring      continue
Temporal Contract             continue
attachment-completeness class confirmation mode
external send                 still approval-required
```

A systemic/integrity failure may require broader degradation, but scope should match evidence of impact.

---

# 6. Repeated correction and learning

## 6.1 Corrections can inform future interpretation

Repeated user corrections may be useful evidence for future candidate interpretation or class-specific behavior, subject to privacy/authority constraints.

## 6.2 Corrections do not silently expand permissions

Repeated correct behavior, user corrections, or model confidence must never automatically grant broader external-action authority.

Permission expansion remains an explicit, bounded user decision.

## 6.3 Material error should narrow before broadening

When repeated material errors show that a class is not safe for automatic handling, degrade that class toward:

- conservative monitoring;
- explicit confirmation;
- Review only where material;
- source-first fallback.

Do not compensate for weak semantics by asking the user to approve every harmless case.

---

# 7. Undo / reversibility

## 7.1 True local reversibility

Use lightweight reversible controls freely for internal Product state when semantics are genuinely reversible, for example:

- attention/defer adjustment;
- return-condition adjustment;
- view/filter/navigation state;
- draft edits before commit.

## 7.2 External effects require stronger treatment

Do not treat external effects as low-risk merely because UI displays `Undo`.

Email send, payment, contract acceptance, permission changes, calendar mutation, deletion, or other external effects may not be truly reversible once accepted by the provider/system.

Initial rule:

```text
preview / explicit commit
-> external request
-> provider/tool reconciliation
-> accepted state update
```

A provider-native undo window is a convenience unless actual reversal is guaranteed and reconciled.

---

# 8. Candidate controls by surface

## Needs You / Moment

Potential controls:

- perform/edit the safe primary action;
- `[あとで]` / return-condition change;
- `[判断を修正]` where material interpretation is wrong;
- `[追跡を終了]` with truthful semantics;
- Source access.

Do not overload every Moment with every possible control; secondary controls can remain under compact disclosure.

## Managed

Potential controls:

- inspect expected event/return condition;
- `[今の対応に戻す]` where valid;
- `[条件を変更]`;
- `[判断を修正]`;
- `[追跡を終了]`;
- Source/provenance.

Managed remains reassurance/inspection, not a daily management queue.

## Review

Controls should be specific to the material unresolved question. Do not present generic `Approve AI` or ask users to inspect internal confidence.

## Integrity alert

Controls should focus on restoring monitoring capability (`[再接続]`, retry/recovery where safe), not on pretending system failure is a semantic Responsibility decision.

---

# 9. Product invariants proposed for promotion

1. **Control != constant confirmation.**
2. **Correction changes accepted interpretation/state; it never rewrites source evidence.**
3. **The user corrects the material decision, not the model's reasoning.**
4. **Return attention now != world-state change.**
5. **Stop tracking != successful completion.**
6. **Monitoring delegation != external-action authority.**
7. **Review is a safety valve, not an uncertainty inbox.**
8. **Approval must expose decision-critical effect, not just offer an `Approve` button.**
9. **Failure recovery repairs state/integrity and minimizes user diagnostic burden.**
10. **Repeated material errors narrow delegation locally before wider automation is trusted.**
11. **Corrections never silently broaden permissions.**
12. **True reversibility must be distinguished from decorative/apparent Undo.**

---

# 10. Non-promotions / unresolved questions

This candidate does not establish:

- a persisted `Correction`, `Override`, or `Escalation` aggregate;
- a new Responsibility lifecycle enum;
- exact numeric Review/confidence thresholds;
- universal auto-learning from user corrections;
- global trust/autonomy score;
- autonomous send permission;
- a universal recovery SLA;
- exact copy/layout for every control;
- exact policy for when repeated errors trigger class-level degradation.

Before canonical promotion, audit this candidate against `PRODUCT.md`, `INTERACTIONS.md`, Responsibility `DECISIONS.md`, Temporal Contract ADRs, and implementation sequencing as one cumulative contract.
