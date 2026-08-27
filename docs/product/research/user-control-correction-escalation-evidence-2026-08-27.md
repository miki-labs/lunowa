# User Control / Correction / Escalation Evidence Review — 2026-08-27

## Status

**Dated research/rationale. Noncanonical.**

This document evaluates current evidence for how Lunowa should handle user correction, human approval, escalation, and recovery after AI/system errors. It does **not** create Responsibility schema, reducer semantics, persistence objects, permission grants, or implementation authorization.

Evidence labels:

- **EXTERNAL EVIDENCE** — published/current source evidence;
- **INFERENCE** — reasoning from the evidence;
- **PRODUCT HYPOTHESIS** — Lunowa-specific candidate behavior requiring validation;
- **UNKNOWN** — not established.

Canonical Product authority remains `docs/product/PRODUCT.md`; canonical Responsibility semantics remain under `docs/product/responsibility/`.

---

# 1. Current frontier

## 1.1 Action approval is increasingly scoped rather than global

**EXTERNAL EVIDENCE — Microsoft Cowork, current 2026 documentation**

Microsoft Cowork asks permission before sensitive actions such as sending email or posting to Teams. The approval surface shows the intended action and, for some actions, a rich preview. Current-session permission can be broadened only in bounded forms such as a specific recipient, recipient domain, or action; the user can inspect or revoke these choices from the Permissions panel.

Source:
- Microsoft Learn, `Use Copilot Cowork`, accessed 2026-08-27: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork

**INFERENCE:** modern production agent UX is moving away from one global autonomy switch toward action-specific and scope-specific permission. Approval is safer when the user can see recipients/content/parameters before committing.

**PRODUCT HYPOTHESIS:** Lunowa should keep monitoring delegation separate from external-action authority and, if standing authorization is ever introduced, bind it to explicit action + context + scope and make it inspectable/revocable.

---

## 1.2 Blind approval is not meaningful oversight

**EXTERNAL EVIDENCE — CHI 2026**

A CHI 2026 study of GUI agents and manipulative interfaces found that approval without sufficient evidence can become effectively blind. Participants lacked enough information to assess the implications of agent choices; some overrode protective agent decisions and fell for dark patterns. The paper also reports cognitive overhead from interfaces that make users divide attention between agent plans and execution.

Source:
- `Dark Patterns Meet GUI Agents: LLM Agent Susceptibility to Manipulative Interfaces and the Role of Human Oversight`, CHI 2026: https://doi.org/10.1145/3772318.3791568

**INFERENCE:** “human approved” is not a safety property by itself. Approval quality depends on concise decision-critical evidence, not on forcing a click.

**PRODUCT HYPOTHESIS:** Lunowa Review/approval should show the smallest material question plus decision-critical evidence and concrete effect. It should not ask users to approve opaque model confidence or internal reasoning.

---

## 1.3 Approval fatigue is itself a control failure

**EXTERNAL EVIDENCE — OWASP AI Security & Privacy Guide**

OWASP guidance recommends human approval where accountability/expertise is required, but explicitly warns that human oversight must avoid approval fatigue caused by repeatedly approving actions that are almost always fine. It also lists undo/revert controls as another form of human oversight.

Source:
- OWASP AI Security & Privacy Guide, general controls: https://github.com/OWASP/www-project-ai-security-and-privacy-guide/blob/main/content/ai_exchange/content/docs/1_general_controls.md

**INFERENCE:** escalation should be sparse and material. Sending harmless uncertainty to Review can reduce the effectiveness of Review for genuinely consequential cases.

**PRODUCT HYPOTHESIS:** Review is a safety valve, not an uncertainty sink. If a class of cases repeatedly requires user confirmation, Lunowa should narrow automatic delegation for that class rather than generate an ever-growing approval queue.

---

# 2. Error correction and trust repair

## 2.1 Users should not have to debug the system's failure

**EXTERNAL EVIDENCE — Information Systems Frontiers, 2026**

A 2026 experiment comparing AI trust-repair strategies found that self-repair generally outperformed user-assisted repair. Requiring the user to diagnose or clarify the system's error adds cognitive burden after an already disruptive failure. However, low-effort structured choices performed much better than open-ended clarification and approached self-repair effectiveness. XAI-based local explanations/counterfactual options produced stronger actual continuance behavior than human-like apology/question strategies.

Sources:
- `Explainability in AI: Comparing Human-Like and System-Like Trust Repair Strategies`, Information Systems Frontiers, 2026: https://doi.org/10.1007/s10796-026-10751-1
- Full article page: https://link.springer.com/article/10.1007/s10796-026-10751-1

**INFERENCE:** after a Lunowa mistake, the Product should repair what it can itself, disclose the concrete impact, and ask the user only for the smallest missing decision that cannot be safely inferred.

**PRODUCT HYPOTHESIS:** correction UI should prefer bounded options (`[金曜] [月曜]`) over “please explain what went wrong” and should never make the user reconstruct the entire Responsibility merely because the model failed.

---

## 2.2 Apology alone is insufficient evidence of recovery

**EXTERNAL EVIDENCE — 2026 trust-repair research**

2026 studies on AI apologies report that apology style can improve subjective trust, but trust repair depends on context and does not by itself demonstrate restored system competence or correct state. Separate 2026 trust-repair work above found actual continuance behavior benefited more from system-like explanatory/choice-based strategies than from apology/asking-question strategies.

Sources:
- `Apologizing artificial intelligence: designing and evaluating effective AI apologies after errors`, AI & Society, 2026: https://doi.org/10.1007/s00146-026-03067-w
- `Guilty apology and trust repair in generative artificial intelligence`, International Journal of Human-Computer Studies, 2026: https://doi.org/10.1016/j.ijhcs.2026.103813

**INFERENCE:** Lunowa should not treat an apology banner as recovery. Recovery requires corrected accepted state, disclosed impact, affected-scope check where warranted, and reliable monitoring restoration.

---

# 3. Product synthesis

## 3.1 Control operations should map to distinct meanings

**INFERENCE from canonical Lunowa semantics + external evidence:** a generic `Undo` or `Fix` control is too ambiguous because several different user intents exist:

1. **Correct interpretation** — `この期限は月曜`, `待っているのは見積書`; changes accepted interpretation/state through authorized user input while preserving source/history.
2. **Return attention now** — user wants an otherwise Managed/Later Responsibility back in active attention; does not claim the world changed.
3. **Modify return condition** — change when/under what event Lunowa should reconsider attention; does not change outcome truth.
4. **Stop tracking** — user ends Lunowa monitoring; does not assert successful external outcome unless separately supported.
5. **Confirm outcome/closure evidence** — user supplies authoritative information that the outcome is actually satisfied/cancelled/etc.; reducer/domain rules still determine the semantic effect.
6. **Approve external action** — grants only the displayed/bounded action authority; does not grant monitoring/state authority generally.

**PRODUCT HYPOTHESIS:** surface these meanings explicitly enough that users cannot accidentally convert “stop reminding me” into “the external outcome succeeded.”

---

## 3.2 Correction should preserve evidence and history

**INFERENCE:** source communication remains immutable evidence. A user correction should not rewrite the original email or erase the system's prior accepted state/history. The corrected state should be reconstructable as `old interpretation -> user correction -> new accepted state` where audit/history matters.

**PRODUCT HYPOTHESIS:** ordinary UX can stay concise, but source/provenance/history should remain inspectable for material changes.

---

## 3.3 Escalate material uncertainty, not model discomfort

**INFERENCE:** current Lunowa already separates `Operational State`, `Attention Need`, `Delivery Urgency`, and `Authority`. Escalation should therefore be triggered by material inability to maintain a safe Product contract, not merely by low model confidence.

Candidate escalation triggers:

- ambiguity changes whether a Responsibility exists;
- ambiguity changes current owner/actionability materially;
- ambiguity changes a material deadline/expected event;
- evidence conflicts about closure/satisfaction;
- the requested external action has consequential/irreversible/security/financial implications;
- account/recipient/attachment ambiguity materially changes what will be sent;
- monitoring integrity is degraded enough that Lunowa cannot honor its promise.

Non-escalation examples:

- harmless wording uncertainty;
- internal taxonomy ambiguity that does not alter user action/attention;
- low confidence when conservative behavior can safely keep the Responsibility open/quiet;
- AI draft stylistic uncertainty the user can simply edit.

---

## 3.4 Repeated correction should narrow automation before it broadens authority

**PRODUCT HYPOTHESIS:** repeated material corrections in one class of situations are evidence that current automatic handling is insufficient. Lunowa may narrow that class to confirmation/Review or reduce automatic admission/action behavior, with the change disclosed to the user.

Repeated successful corrections or later good performance should **not** silently grant broader external-action permissions. Permission expansion remains a separate explicit user choice.

---

## 3.5 Use true reversibility, not decorative Undo

**INFERENCE:** an internal attention/defer change can often be truly reversible. An external email send, payment, acceptance, or provider mutation may not be. A temporary “Undo” affordance must not cause the Product to classify an otherwise consequential effect as low risk unless reversal is actually guaranteed and reconciled.

**PRODUCT HYPOTHESIS:** use instant reversible controls freely for local Product state where semantically safe; for external effects, show explicit commit/approval and provider reconciliation rather than relying on cosmetic undo.

---

# 4. Candidate Product doctrine

The strongest current synthesis is:

> **User control should be local, semantically explicit, and low-effort. Lunowa should correct its own mistakes where possible, ask the user only for material decisions it cannot safely resolve, preserve evidence/history, and never turn correction into a second monitoring job.**

Supporting principles:

- **Control is not the same as constant confirmation.**
- **Review is a safety valve, not an uncertainty inbox.**
- **The user corrects the decision, not the model's internal reasoning.**
- **Stop tracking != successful completion.**
- **Return now != world-state change.**
- **Monitoring delegation != external-action authority.**
- **Low-effort structured choice > making the user co-debug the AI.**
- **Failure repair must restore state/integrity, not merely apologize.**
- **Repeated material errors should narrow delegation locally before broader automation is trusted.**
- **True reversibility must be distinguished from apparent Undo.**

---

# 5. Explicit non-promotions / unknowns

This evidence review does **not** establish:

- a new `Correction`, `Override`, `Escalation`, or `AttentionContract` persisted aggregate;
- exact Review thresholds;
- a numeric confidence threshold for escalation;
- automatic permission expansion from correction history;
- a universal trust score;
- production-safe autonomous sending;
- an SLA for recovery after monitoring failure;
- that Microsoft/OWASP/agent research directly predicts Lunowa user behavior.

These remain Product/implementation validation questions.
