# Product Constitution Evidence Review — Boundary, Closure, and Agent Autonomy

Date: 2026-08-26

## Status

**Research evidence artifact — not canonical Product truth by itself.**

Purpose: support the `PRODUCT-CONSTITUTION-V1-CANDIDATE.md` synthesis with current external evidence, explicit limitations, and evidence-strength classification.

This artifact focuses on three Product questions:

1. **Jurisdiction:** what unresolved work should Lunowa steward, overlay, or refuse to own?
2. **Closure:** what evidence is sufficient to stop monitoring a communication loop?
3. **Autonomy:** what may Lunowa/AI do autonomously, what needs deterministic mediation, and what should require human authority?

The artifact does **not** prove Lunowa demand, Product-market fit, or differentiation.

---

# 1. Evidence discipline

Use four classes:

- **External evidence:** directly supported by a cited source;
- **Current product behavior:** documented behavior of a current vendor/product; useful as frontier evidence, not proof of quality;
- **Supported inference:** synthesis from several sources;
- **Lunowa Product hypothesis:** proposed design requiring validation.

Vendor docs establish what is offered/claimed, not actual accuracy, adoption, retention, or superiority.

Preprints/benchmarks are evidence about evaluated settings only; do not convert benchmark percentages into Lunowa production-accuracy claims.

---

# 2. Autonomy: capability and permission must be separate

## 2.1 Levels of Autonomy for AI Agents — 2025

Source:

- Feng, McDonald, Zhang, **Levels of Autonomy for AI Agents** (2025): https://arxiv.org/abs/2506.12469

External evidence:

- proposes five escalating autonomy levels framed by the user's role: operator, collaborator, consultant, approver, observer;
- argues autonomy is a deliberate design decision separable from capability and environment.

Supported inference for Lunowa:

> Do not increase allowed authority simply because the underlying model becomes more capable.

## 2.2 Separating Capability from Permission — July 2026

Source:

- Zheng et al., **Separating Capability from Permission: A Governance Framework for Agentic AI Autonomy Levels** (2026): https://arxiv.org/abs/2607.23438

External evidence:

- explicitly separates Autonomous Capability Levels from Allowed Autonomy Levels;
- frames permitted autonomy around risk, oversight, accountability, reversibility, and organizational readiness;
- demonstrates that a highly capable system may deliberately operate at a lower permitted autonomy.

Evidence quality note:

- recent preprint; useful conceptual framework, not a universally accepted standard.

Strong supported inference:

> `can do` and `may do` must be different state/policy questions in Lunowa.

---

# 3. Current governance frontier: risk-scaled and action-specific

## 3.1 Microsoft 2026 agent governance

Sources:

- **Govern agents by risk**: https://learn.microsoft.com/en-us/agents/center-of-excellence/govern-agents-risk
- **Apply responsible AI**: https://learn.microsoft.com/en-us/agents/center-of-excellence/responsible-ai
- **Reduce autonomous agentic AI risk**: https://learn.microsoft.com/en-us/security/zero-trust/sfi/manage-agentic-risk
- **Secure autonomous agentic AI systems**: https://learn.microsoft.com/en-us/security/zero-trust/sfi/secure-agentic-systems

Current external guidance:

- distinguishes assistive behavior from execution into systems of record;
- recommends governance proportional to risk rather than one checklist for every agent;
- explicitly recommends human approval for hard-to-reverse actions or actions affecting people, money, or compliance;
- recommends minimum tools/data/operations, default-deny posture, meaningful pause/stop/control, auditability, and deterministic safeguards;
- treats the shift from assistive to executing agents as a major escalation in governance burden.

Supported inference:

- summaries/drafts/monitoring and shared-system mutations should not share one authorization regime;
- human approval everywhere creates unnecessary friction, while execution without deterministic mediation under-governs consequential actions.

## 3.2 NIST AI-agent standards/security work — 2026

Sources:

- **AI Agent Standards Initiative**, Feb 17 2026: https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure
- **AI Agent Identity and Authorization concept paper**, Feb 5 2026: https://csrc.nist.gov/pubs/other/2026/02/05/accelerating-the-adoption-of-software-and-ai-agent/ipd
- **Summary Analysis of Responses Regarding Security Considerations for AI Agents**, May 18 2026: https://www.nist.gov/publications/summary-analysis-responses-request-information-regarding-security-considerations-ai
- **TEVV-Athlon initial draft**, Aug 7 2026: https://www.nist.gov/artificial-intelligence/ai-research/tevv-athlon-framework-evaluating-ai-systems

External evidence:

- NIST treats autonomous action, identity, authorization, secure interaction with external systems, and test/evaluation/verification/validation as active 2026 standards problems;
- security concerns are identified as a barrier to agent adoption;
- current NIST work emphasizes structured evaluation of real-world impacts/outcomes for agentic systems.

Supported inference:

> Lunowa should model agent identity/authorization and verification as Product/system boundaries, not rely on prompt-level behavior alone.

---

# 4. OWASP 2026: excessive agency is a first-class security problem

Sources:

- **OWASP Top 10 for Agentic Applications 2026**: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- **OWASP LLM Top 10 2026**: https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/
- **Excessive Agency mitigation**: https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency.html

External guidance:

- excessive agency/tool misuse/identity and privilege abuse are treated as material agentic risks;
- recommends least privilege, explicit approval for high-impact actions, and complete mediation in downstream systems rather than allowing the LLM to decide its own authorization.

Current incident-oriented evidence:

- OWASP's Q1 2026 exploit roundup includes personal-agent cases where overly broad email/destructive permissions and weak confirmation created unsafe actions: https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/

Caution:

- incident summaries depend on reported underlying events; use them as failure-mode evidence, not prevalence estimates.

Strong supported inference:

> `LLM says action is safe` is not an authorization mechanism.

---

# 5. Current product frontier: Microsoft Copilot Cowork

Sources current in August 2026:

- **Cowork overview**: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/
- **Use Cowork / approvals / event-driven tasks**: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
- **Cowork admin governance**: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-admin-governance
- **Cowork FAQ**: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-faq

Current documented behavior:

- Cowork can monitor matching email/Teams events and run scheduled/event-driven tasks;
- it can send email, post messages, schedule meetings, and change shared-system state;
- event-driven tasks default to **draft-and-approve** for shared actions;
- approval can be broadened for similar actions within the current session, including recipient/domain-scoped email permission;
- tasks run with the user's permissions, have run history, and include loop/rate protections;
- approval UIs expose planned action details/parameters and medium/high-risk indicators for certain actions.

Frontier implication:

- monitoring and external execution can be separated;
- modern products are already exploring bounded pre-authorization rather than a single global autonomy switch.

Non-claim:

- this does not prove Cowork has the optimal policy, only that action-specific/session-scoped permission is now a real production design pattern.

---

# 6. Long-horizon productivity-agent reliability remains limited

## 6.1 ClawsBench — April 2026

Source:

- **ClawsBench: Evaluating Capability and Safety of LLM Productivity Agents in Simulated Workspaces**: https://arxiv.org/abs/2604.05172

External benchmark evidence:

- realistic mock Gmail/Slack/Calendar/Docs/Drive services with stateful tasks;
- across tested conditions, full scaffolding produced task-success rates of roughly 39–64%;
- unsafe-action rates remained roughly 7–33% depending on condition;
- identified recurring unsafe behaviors including multi-step escalation and silent contract modification.

Caution:

- benchmark environment != production Lunowa;
- percentages must not be used as direct production predictions.

Product implication:

> current agent capability does not justify broad default write authority in a personal communication system.

## 6.2 ClawMark — April 2026

Source:

- **ClawMark: A Living-World Benchmark for Multi-Turn, Multi-Day, Multimodal Coworker Agents**: https://arxiv.org/abs/2604.23781

External benchmark evidence:

- 100 tasks over multiple days with email/calendar/knowledge-base/spreadsheet/filesystem state changing between turns;
- deterministic rule-based evaluation;
- best strict Task Success reported at 20.0% despite much higher partial-progress scores;
- performance drops after exogenous environment changes.

Product implication:

- Lunowa's target problem — persistent monitoring while the world changes independently — remains technically difficult even for frontier agent systems;
- explicit durable state/reconciliation is justified as a reliability requirement.

---

# 7. Verification: process is not outcome

Source:

- Microsoft Research, **The Art of Building Verifiers for Computer Use Agents**, Apr 21 2026: https://www.microsoft.com/en-us/research/articles/the-art-of-building-verifiers-for-computer-use-agents/

External evidence:

- separates process quality from final outcome success;
- reports that rubric design and explicit process/outcome distinction materially improve verification quality;
- Universal Verifier reduced false positives to near zero relative to cited baseline verifier rates in its benchmark.

Product implication:

```text
tool/action executed
!= desired external result
!= verified loop closure
```

This directly supports Lunowa's closure and action-reconciliation doctrine.

---

# 8. Human delegation is not automatically calibrated

Source:

- Gor et al., **AI, Take the Wheel: What Drives Delegation and Trust in Human-Computer Cooperative Question Answering?** (2026): https://arxiv.org/abs/2605.28255

External evidence in the study setting:

- distinguishes delegation decisions from adoption of visible AI suggestions;
- humans both under-relied on correct AI and over-relied on misleading AI in observed cases;
- authors recommend calibrated confidence, evidence-grounded explanations, and trust-refinement mechanisms.

Limitations:

- competitive question-answering setting, small number of expert participants/agents;
- not email workflow evidence.

Supported inference:

> users should not be expected to perfectly choose appropriate autonomy from a single generic trust slider; Product policy should provide safer defaults and evidence-based boundaries.

---

# 9. Human-centered proactivity: initiative must remain contestable

Sources:

- **Proactive Systems in HCI and AI: Concepts, Challenges, and Opportunities** (2026): https://arxiv.org/abs/2606.25149
- CHIIR 2026 workshop report, **Human-Centered Proactive and Personalized Agents for Interactive Information Access**: https://arxiv.org/abs/2608.18638

Current research synthesis:

- proactive behavior is not simply earlier intervention;
- current open challenges include timing, appropriateness, user control, transparency, trust, privacy, and evaluation;
- latest workshop synthesis emphasizes calibrated initiative that is timed, transparent, contestable, and aligned with user goals.

Product implication:

> Lunowa should optimize initiative separately from external authority. Proactive resurfacing can be high-autonomy while consequential action remains approval-bounded.

---

# 10. Closure evidence carried forward from the same research sequence

The Product Constitution candidate also incorporates earlier 2026-08-26 review findings.

## 10.1 Conversation-for-action / commitment semantics

Historical Conversation-for-Action literature distinguishes request/promise/performance/completion declaration/satisfaction rather than collapsing every message into one task state.

Product implication:

```text
performed
!= satisfied
```

## 10.2 Current support/case-product behavior

Current Zendesk documentation distinguishes `Solved` from later `Closed`, allowing a solved ticket to reopen before hard closure:

- https://support.zendesk.com/hc/en-us/articles/4408887712154-What-is-the-difference-between-a-solved-ticket-and-a-closed-ticket

Current Intercom guidance explicitly warns against interpreting a customer saying they will wait as proof of resolution:

- https://www.intercom.com/help/en/articles/11433030-conversational-fin-experience

Current Intercom close/snooze behavior also distinguishes waiting from full resolution:

- https://www.intercom.com/help/en/articles/8363763-close-a-conversation

Frontier implication:

> reply arrival, waiting acknowledgment, resolution judgment, and hard closure are distinct operational concepts in mature systems.

## 10.3 Competitor caveat

Current email follow-up vendors already claim response/outcome verification, so `reply != resolution` must not be presented as Lunowa's market moat.

It is a semantic reliability requirement whose Product value must be demonstrated behaviorally.

---

# 11. Jurisdiction synthesis

Supported inference from case-management/work-management/frontier comparison:

- fixed personal tasks are already well served by task/calendar systems;
- project/deal/ticket workflows often have dedicated systems of record;
- case-management theory is better suited to evolving, information-driven, event-conditioned work than rigid workflow sequences;
- email creates a notable gap where heterogeneous external coordination exists without a dedicated canonical state system.

Therefore the strongest current Lunowa jurisdiction candidate is:

> **externally dependent, temporally open, email-originated/evidenced coordination for which continued human monitoring creates burden and no stronger structured system already owns the relevant state.**

This remains a Product hypothesis until real-workflow discovery validates its frequency/value.

---

# 12. Autonomy synthesis for Lunowa

## 12.1 Strongest doctrine candidate

> **Attention delegation first; authority delegation only through explicit bounded policy.**

## 12.2 Why

The synthesis is supported by:

- autonomy frameworks separating capability from permission;
- current Microsoft risk-tier/action-approval guidance;
- NIST identity/authorization/TEVV work;
- OWASP excessive-agency and complete-mediation guidance;
- current Cowork draft-and-approve / bounded session authorization;
- agent benchmarks showing meaningful safety and long-horizon reliability gaps;
- verifier research separating action/process from actual outcome;
- human-reliance research showing users do not perfectly calibrate delegation themselves.

## 12.3 Candidate action classes

### Autonomous by default within authorized read scope

- source observation;
- candidate semantic interpretation;
- low-risk context preparation;
- deterministic internal monitoring/reconciliation permitted by domain policy;
- passive/internal resurfacing scheduling.

### Prepare / human commits by default

- email replies/sends;
- shared-system modifications;
- calendar changes involving others;
- external statements/commitments on behalf of the user.

### Outside initial autonomous authority / explicit transaction boundary

- payment/money movement;
- contract acceptance;
- destructive deletion without reliable restoration;
- security/permission changes;
- other high-impact or identity-sensitive irreversible actions.

This is a Product-policy candidate, not a frozen implementation ACL table.

---

# 13. Important anti-patterns

Do not use:

- model capability as permission;
- model self-confidence as authorization;
- `human-in-the-loop` approval for every harmless internal update;
- global `autonomy = high/low` as the sole policy;
- tool-call success as proof of user outcome;
- email `Undo Send` as if it guaranteed real reversibility;
- a dedicated external system's data as justification for Lunowa to silently become that system of record;
- silence/non-response as proof of outcome satisfaction;
- more alerts/Review items as a substitute for trustworthy monitoring.

---

# 14. Remaining unknowns / falsifiers

Still unknown:

- exact real user tolerance for approval prompts;
- which external actions, if any, should earn persistent/bounded pre-authorization;
- achievable monitoring false-negative rate in real heterogeneous mail;
- how much uncertainty can remain invisible before trust falls;
- whether `Attention Contract` is the best durable internal concept/name;
- whether the proposed closure dispositions are too complex for the actual target cases;
- whether most high-value loops are already covered by CRM/ticket/project systems;
- whether Product value eventually shifts from attention delegation to execution delegation.

Falsifiers for the current doctrine include:

- users primarily demand autonomous execution and gain little value from monitoring offload;
- approval-bounded execution creates more burden than the monitoring savings;
- real target workflows are mostly structured and already have superior systems of record;
- reliable outcome/state verification cannot be achieved without constant manual confirmation;
- a much simpler reminder model performs equivalently on actual target behavior.

---

# 15. Research conclusion

The 2026 evidence does **not** justify a broad autonomous email agent that acts because a frontier model is capable of doing so.

The strongest current synthesis is narrower:

1. Lunowa's first responsibility is **continuous attention/state stewardship**, not broad action authority.
2. Capability and allowed autonomy must be separate.
3. Permission should be **action-specific, context/scope-specific, least-privilege, revocable, and deterministically mediated**.
4. Human approval should protect material authority boundaries, not every low-risk internal inference.
5. External execution must be verified against outcome; successful tool invocation is insufficient.
6. Dedicated systems of record should retain domain ownership where they already model the work well.
7. The full Product proposition remains a hypothesis until users actually stop self-monitoring in realistic longitudinal use.
