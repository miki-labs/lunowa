# Lunowa v1 Product Surface Evidence Review — 2026-08-26

## Status

**Dated evidence/reasoning artifact.**

This file supports `docs/product/V1-PRODUCT-SURFACE-CANDIDATE.md`. It is not canonical Product truth and does not authorize implementation.

Evidence classes:

- **CURRENT PRODUCT FACT** — behavior documented by a current official vendor source;
- **EXTERNAL RESEARCH** — published/preprint evidence relevant to Product design;
- **SUPPORTED INFERENCE** — synthesis from evidence, not an externally proven Lunowa result;
- **PRODUCT HYPOTHESIS** — Lunowa-specific design requiring validation.

Vendor documentation proves feature/behavior availability, not independent quality, adoption, retention, or moat. Small HCI studies do not establish universal effect sizes. Agent benchmarks/oversight studies are not Lunowa production reliability estimates.

---

# 1. Current email/AI Product frontier

## 1.1 Gmail AI Inbox

**CURRENT PRODUCT FACT:** Gmail AI Inbox is currently beta and exposes two separate sections:

- `Suggested to-dos` — high-priority incoming-email items needing attention, with action/due information;
- `Topics to catch up on` — summaries of important updates across topics/projects.

Users can View/Reply/Mark done and open related source material. AI Inbox remains a separate surface rather than replacing the ordinary Inbox. Current documented limitations include Primary-tab scope and lack of attachment/delegated/encrypted-mail support.

Source:

- Google Gmail Help, `Manage to-dos & topics with AI Inbox`: https://support.google.com/mail/answer/16845247

**SUPPORTED INFERENCE:** incoming-message task extraction and an AI attention surface are incumbent territory. Lunowa cannot justify itself by `AI finds tasks in email` alone.

## 1.2 Outlook Copilot Prioritize

**CURRENT PRODUCT FACT:** Outlook Copilot assigns high/normal/low priority to incoming Inbox mail, tends to mark action-required mail as more important, replaces the message-list first content line with a short summary, and gives an expandable explanation for why a message was prioritized. Users can add natural-language prioritization instructions.

Source:

- Microsoft Support, `Prioritize my inbox`: https://support.microsoft.com/en-us/outlook/copilot-outlook/prioritize-my-inbox

**SUPPORTED INFERENCE:** message importance/prioritization is not enough. Lunowa's candidate unit should be current attention obligation/state, not simply prioritized messages.

## 1.3 Superhuman reminders and auto drafts

**CURRENT PRODUCT FACT:** Superhuman Remind Me removes a message from the inbox and returns it at a chosen time. `If no reply` reminders are canceled if a reply arrives. Auto Reminders can identify sent messages for follow-up, and Auto Drafts automatically prepare both follow-ups and responses.

Sources:

- https://help.superhuman.com/hc/en-us/articles/46005666142733-Remind-Me
- https://help.superhuman.com/hc/en-us/articles/46005658551053-Auto-Reminders-Auto-Drafts

**SUPPORTED INFERENCE:** time-return/no-reply monitoring and prepared replies are already established feature territory. Lunowa's stronger requirement is re-evaluation of the expected outcome/state, including cases where a reply does not satisfy the result.

## 1.4 Shortwave

**CURRENT PRODUCT FACT:** Shortwave remains strongly Inbox/triage centered. Its documented method asks the user to process every Inbox item, separating non-actionable items, sub-two-minute work, and larger actionable tasks. Stars/todos remain visible work organization. Its AI Assistant can organize Inbox, identify priorities, create todos, search/analyze email, manage calendar interactions, connect to external tools, and automate filters; Tasklet adds background automation.

Sources:

- https://www.shortwave.com/docs/guides/method/
- https://www.shortwave.com/docs/guides/ai-assistant/
- https://www.shortwave.com/docs/guides/customize-your-shortwave-settings/

**SUPPORTED INFERENCE:** a deliberate Lunowa differentiation hypothesis is to remove routine arrival-by-arrival triage rather than optimize it. That remains a Product hypothesis, not a validated advantage.

## 1.5 Fyxer

**CURRENT PRODUCT FACT:** Fyxer operates inside Gmail/Outlook, automatically drafts replies for messages it judges need attention, and tracks sent email that has not received a reply. After a configured waiting period, a conversation can be labeled `Awaiting reply` / `To follow up` and receive a prepared follow-up draft.

Sources:

- https://support.fyxer.com/article/how-fyxer-drafts-your-emails-and-where-to-find-them
- https://support.fyxer.com/article/track-email-follow-ups

**SUPPORTED INFERENCE:** useful email AI/follow-up value can be delivered without replacing the mail client. Full-client ownership is therefore not a necessary premise for Lunowa v1.

## 1.6 Microsoft Copilot Cowork

**CURRENT PRODUCT FACT:** Cowork supports event-driven tasks triggered by matching email/Teams events. The task card shows trigger, behavior, and permissions. Event-driven tasks default to draft-and-approve for actions such as sending email, posting messages, or changing shared systems. Current governance documentation also allows bounded pre-authorization for automated tasks.

Sources:

- https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
- https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-admin-governance

**SUPPORTED INFERENCE:** `watch for a matching email and prepare a response` is already general-agent territory. Lunowa should focus Product surface on trustworthy ongoing coordination state/attention rather than exposing generic agent-task configuration as the primary experience.

---

# 2. Proactive intervention / attention evidence

## 2.1 Active versus passive AI intervention

**EXTERNAL RESEARCH:** CHI 2025 technology-probe work with 15 knowledge workers compared active and passive AI goal-reflection support in meetings. Passive intervention supported focus with less disruption; active intervention triggered more immediate reflection/action but risked disrupting conversation. Authors emphasize adapting intervention intensity/timing and user control.

Source:

- Microsoft Research, `Are We On Track? AI-Assisted Active and Passive Goal Reflection During Meetings` (CHI 2025): https://www.microsoft.com/en-us/research/publication/are-we-on-track-ai-assisted-active-and-passive-goal-reflection-during-meetings/

Limitations:

- small qualitative/probe study;
- meeting domain rather than email;
- does not establish Lunowa notification thresholds.

**SUPPORTED INFERENCE:** internal state visibility, passive queue placement, and active interruption should be separate Product decisions.

## 2.2 Workflow-boundary timing

**EXTERNAL RESEARCH / PREPRINT:** a five-day 2026 field study of 15 developers observed 229 proactive AI interventions across 5,732 interaction points. Workflow-boundary interventions had 52% engagement; mid-task interventions were dismissed 62% of the time. Well-timed proactive suggestions required less interpretation time than reactive suggestions in that study.

Source:

- `Developer Interaction Patterns with Proactive AI: A Five-Day Field Study`: https://arxiv.org/abs/2601.10253

Limitations:

- developer/IDE domain;
- small sample;
- preprint;
- timing percentages must not be transferred directly to email.

**SUPPORTED INFERENCE:** `state changed now` and `interrupt user now` should remain separate. Lunowa should prefer the lowest-interruption delivery compatible with delay cost.

---

# 3. Temporal work / context restoration

## 3.1 Work spans retrospection and prospection

**EXTERNAL RESEARCH:** DIS 2025 Microsoft work frames knowledge work as temporally connected across meetings/projects through retrospection (looking back) and prospection (looking ahead), and explores GenAI interfaces designed around that continuity.

Source:

- `Designing Interfaces that Support Temporal Work Across Meetings with Generative AI`: https://www.microsoft.com/en-us/research/publication/designing-interfaces-that-support-temporal-work-across-meetings-with-generative-ai/

**SUPPORTED INFERENCE:** after Lunowa successfully removes a loop from attention, resurfacing should restore enough past context to enable the next future action. A Moment is better understood as a temporal handoff than as a generic summary.

---

# 4. Trusted reminders / offloading evidence

## 4.1 Trusted reminders can reduce internal intention maintenance

**EXTERNAL RESEARCH:** `Let it go: How trusted reminders alter intention maintenance` was published 18 August 2026 in Psychonomic Bulletin & Review. In the reported studies, experience with fully reliable reminders reduced prospective-memory-related thoughts and shifted attention toward the ongoing task; unexpected removal of reminders harmed retrieval.

Source:

- https://link.springer.com/article/10.3758/s13423-026-02985-6

**SUPPORTED INFERENCE:** if Lunowa earns monitoring trust, users may genuinely stop carrying the intention internally. That makes monitoring integrity/failure disclosure a first-order Product requirement and raises the cost of silent misses.

It does not prove that Lunowa's interface will earn this trust or that any particular Managed copy will work.

---

# 5. Agent oversight / interface evidence

## 5.1 Oversight creates work

**EXTERNAL RESEARCH / PREPRINT:** 2026 interviews with 17 experienced developers identified at least four forms of oversight work around software agents: a priori control, co-planning, real-time monitoring, and post hoc review.

Source:

- `Human oversight of agentic systems in practice`: https://arxiv.org/abs/2606.05391

**SUPPORTED INFERENCE:** Lunowa should not turn the user into a supervisor of its internal agent/scheduler/LLM execution. The default Managed surface should communicate user-relevant state/integrity rather than technical trajectory.

## 5.2 More human involvement is not automatically better oversight

**EXTERNAL RESEARCH / PREPRINT:** a 2026 mixed-methods study with 48 participants compared four oversight strategies for computer-use agents. It found no uniformly best strategy; plan-based strategies reduced exposure to problematic actions more consistently than they improved runtime correction. Qualitative findings emphasize that decision-critical moments must become legible in time for meaningful intervention.

Source:

- `Comparing Human Oversight Strategies for Computer-Use Agents`: https://arxiv.org/abs/2604.04918

**SUPPORTED INFERENCE:** Review should surface material judgment points, not maximize human approvals throughout ordinary monitoring.

## 5.3 Agent trace visibility can help when oversight is actually required

**EXTERNAL RESEARCH / PREPRINT:** AgentGUI (July 2026) provides rich trajectory visualization and steering for long-running agents; a controlled study reported 38% faster identification of key trace elements in its evaluation.

Source:

- https://arxiv.org/abs/2607.26300

**SUPPORTED INFERENCE:** deep trace/audit views can be useful for debugging/oversight, but this does not imply that a normal email user's Home should be an agent activity console. Lunowa should expose provenance and technical details progressively when needed.

---

# 6. Surface synthesis

## 6.1 Needs You

Evidence supports separating user actionability from generic importance and timing delivery separately from state. Current incumbents remain substantially message/Inbox-oriented.

**PRODUCT HYPOTHESIS:** Needs You should represent current actionable/decision-required Responsibilities rather than selected important messages, ordered by explainable attention/delay tiers instead of newest-first chronology.

## 6.2 Moment

Temporal-work evidence and the Product's monitoring-offload thesis support a small handoff that connects why the item returned, what changed, what remains, and what happens next.

**PRODUCT HYPOTHESIS:** the four conceptual questions `Why now / What changed / What remains / What next` are a stronger v1 Moment contract than long AI thread summaries.

## 6.3 Managed

Trusted-reminder evidence suggests successful delegation can reduce internal maintenance, while oversight research shows that monitoring agents creates additional work.

**PRODUCT HYPOTHESIS:** Managed should default to quiet assurance/integrity and expose detailed Waiting/Later lists only on intentional inspection.

Potential failure: aggregate assurance itself could make users anxious or encourage checking. This requires longitudinal evidence.

## 6.4 Review

Agent oversight research favors making decision-critical moments legible rather than maximizing involvement.

**PRODUCT HYPOTHESIS:** Review should contain only material ambiguity/authority questions that block safe delegation, and appear conditionally rather than as a permanent uncertainty inbox.

## 6.5 Source Conversations

Current Gmail/Outlook/Superhuman/Shortwave behavior and Lunowa's own provenance contract support preserving direct source access.

**PRODUCT HYPOTHESIS:** source reading/search/provenance + contextual reply can be enough for an initial companion/hybrid proof; full provider-client parity is not required until evidence shows it materially improves the core outcome.

---

# 7. Claims that must remain hypotheses

Do not present the following as established Product facts before Lunowa-specific evidence:

- users prefer Needs You as default landing;
- Managed aggregate reassurance reduces checking;
- Waiting/Later should definitely leave top-level navigation;
- five conceptual surfaces are the optimal IA;
- one-provider companion/hybrid is commercially sufficient;
- contextual compose/reply is enough for the first real target segment;
- a particular notification cadence is optimal;
- attention-tier ranking will be trusted;
- users will stop self-monitoring because the interface is semantically correct.

These are testable Product decisions, not conclusions from external literature alone.

---

# 8. Current strongest synthesis

The strongest current candidate surface hierarchy is:

```text
LUNOWA

ATTENTION
  -> Needs You
  -> conditional Review
  -> Moment

DELEGATED MONITORING
  -> Managed assurance
  -> on-demand Waiting/Later inspection

SOURCE
  -> Conversations / search / original evidence
```

Directional surface principles:

> **Surface obligations, not activity.**

> **Managed work should be inspectable, not attention-seeking.**

> **Return context, not history.**

> **State change immediately; interrupt only when justified.**

> **Source is always accessible, but need not remain the primary work surface.**
