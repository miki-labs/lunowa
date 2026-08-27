# Product Content Completion Evidence Review — 2026-08-27

## Status

**Dated research/rationale. Noncanonical.**

This document supports GitHub Issue #45 and the cumulative remaining-Product-content candidate. It re-checks current 2025–2026 evidence relevant to user control, failure/degradation, account lifecycle, settings, communication edge cases, Managed/Review, zero states, and final v1 boundaries.

It does **not** create Product truth merely by existing. Canonical Product authority remains `docs/product/PRODUCT.md`; canonical Responsibility semantics remain under `docs/product/responsibility/`.

Evidence labels:

- **EXTERNAL EVIDENCE** — published/current external source evidence;
- **INFERENCE** — reasoning from external evidence plus current Lunowa canonical contracts;
- **PRODUCT HYPOTHESIS** — Lunowa-specific candidate behavior requiring empirical validation;
- **UNKNOWN** — not established.

Competitor behavior is frontier/context evidence only. Feature presence is not proof that the same behavior is correct for Lunowa or that the competitor implementation is effective.

---

# 1. Current email/agent frontier

## 1.1 Gmail AI Inbox has moved toward action-oriented inbox assistance

**EXTERNAL EVIDENCE — Google, 2026**

Google announced AI Inbox as a Gmail view that prioritizes important updates and time-sensitive tasks. By Google I/O 2026 it also supported personalized draft replies, links to relevant Docs/Sheets/Slides for tasks, marking suggested tasks done, dismissing unhelpful suggestions, topic-level read actions, and Gmail Live conversational access.

Sources:

- Google, `Gmail is entering the Gemini era`, 2026-01-08: https://blog.google/products-and-platforms/products/gmail/gmail-is-entering-the-gemini-era/
- Google, `New ways to create and get things done in Google Workspace`, 2026-05-19: https://blog.google/products-and-platforms/products/workspace/workspace-updates/
- Google I/O 2026 announcement roundup: https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/

**INFERENCE:** task extraction, inbox prioritization, contextual drafting, and lightweight correction/dismissal are incumbent territory. Lunowa cannot treat those individual features as sufficient differentiation.

---

## 1.2 Outlook Copilot increasingly combines priority, explanation, triage, and customization

**EXTERNAL EVIDENCE — Microsoft, current 2026 documentation**

Outlook Copilot can prioritize incoming mail, show short summaries and reasons, and let users customize what should be considered high or low priority. Current documentation also lists Copilot-based triage actions and thread/attachment summaries with source citations in supported experiences.

Sources:

- Microsoft Support, `Prioritize my inbox`: https://support.microsoft.com/en-us/outlook/copilot-outlook/prioritize-my-inbox
- Microsoft Support, `Frequently asked questions about Copilot in Outlook`, updated 2026-02: https://support.microsoft.com/en-us/outlook/frequently-asked-questions-about-copilot-in-outlook
- Microsoft Support, `Summarize an email thread with Copilot in Outlook`: https://support.microsoft.com/en-us/outlook/copilot-pages/summarize-an-email-thread-with-copilot-in-outlook
- Microsoft Support, `Copilot Toggle`: https://support.microsoft.com/en-US/Outlook/copilot-toggle

Current Prioritize documentation also explicitly excludes some classes such as out-of-office, meeting mail, some low-content or encrypted mail from that feature.

**INFERENCE:** a production email Product must have safe behavior for unsupported/unevaluated content rather than silently assuming comprehensive AI coverage. User-facing controls should be scoped and understandable, but Lunowa should not copy priority-rule customization into a generic rule builder without evidence.

---

## 1.3 Superhuman and Shortwave already cover reminders, drafts, tasking, and agent automation

**EXTERNAL EVIDENCE — Superhuman, current 2026 documentation**

Superhuman Mail supports Remind Me, automatic reminders for sent mail without replies, and automatic response/follow-up drafts. Its MCP guidance warns that send tools can send instantly and recommends per-action confirmation by default; permissions can be configured at tool level.

Sources:

- Superhuman Help, `Remind Me`: https://help.superhuman.com/hc/en-us/articles/46005666142733-Remind-Me
- Superhuman Help, `Auto Reminders & Auto Drafts`: https://help.superhuman.com/hc/en-us/articles/46005658551053-Auto-Reminders-Auto-Drafts
- Superhuman Help, `Superhuman Mail MCP Server`: https://help.superhuman.com/hc/en-us/articles/46005696690317-Superhuman-Mail-MCP-Server

**EXTERNAL EVIDENCE — Shortwave/Tasklet, 2025–2026**

Shortwave supports AI search/analysis, todos, follow-up reminders, contextual drafting and calendar-aware actions. Tasklet is explicitly positioned as a separate background automation product running on triggers/schedules/webhooks and can draft replies or manipulate Shortwave todos automatically.

Sources:

- Shortwave, `Introducing Tasklet: Automate your business with AI Agents`, 2025-10-09: https://www.shortwave.com/blog/introducing-tasklet-ai-automation/
- Shortwave, `Fully Automate Your Email with Shortwave + Tasklet`, 2026-01-06: https://www.shortwave.com/blog/shortwave-tasklet-integration/
- Shortwave blog index/current product history: https://www.shortwave.com/blog/

**INFERENCE:** no-reply reminders, drafting, AI search, email task extraction, and background trigger automation are not standalone Lunowa moats. Lunowa's differentiated claim must remain the complete monitoring-relinquishment outcome under trustworthy state/closure/control semantics.

---

# 2. Human control, approval, and intervenability

## 2.1 Sensitive action approval is increasingly scoped

**EXTERNAL EVIDENCE — Microsoft Cowork, current August 2026 documentation**

Cowork asks permission before sensitive actions such as sending email or posting messages. Its approval UI uses action-specific buttons and supports bounded current-session permission expansion for cases such as a specific recipient, recipient domain, or action; users can inspect/revoke permissions.

Sources:

- Microsoft Learn, `Use Copilot Cowork`: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
- Microsoft Learn, `Copilot Cowork overview`: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/

**INFERENCE:** capability and permission should remain separate, and standing authorization—if Lunowa ever supports it—should be inspectable, revocable, and scoped to action/context rather than one global autonomy level.

---

## 2.2 A human click does not make an opaque action safe

**EXTERNAL EVIDENCE — GUI-agent oversight, CHI 2026 / 2025 preprint**

`Dark Patterns Meet GUI Agents: LLM Agent Susceptibility to Manipulative Interfaces and the Role of Human Oversight` studies humans, GUI agents, and human-agent teams across dark-pattern scenarios. The authors report that human oversight improved avoidance but also introduced attentional tunneling and cognitive load; neither humans nor agents were uniformly resilient.

Source:

- arXiv preprint (2025; paper associated with CHI 2026): https://arxiv.org/abs/2509.10723

**INFERENCE:** approval quality depends on decision-critical evidence and manageable cognitive burden. `Approve` without a concrete effect preview is weak oversight.

---

## 2.3 Intervenability is broader than emergency stop

**EXTERNAL EVIDENCE — 2026 preprint**

`Intervenability as a Design Requirement for Autonomy and Oversight within Human-Centered AI` proposes intervenability as a design requirement spanning real-time intervention, discrete decision correction, and reconfiguration, while explicitly considering user mental effort.

Source:

- arXiv, 2026-07: https://arxiv.org/abs/2607.10322

This is a recent preprint rather than a frozen standard.

**INFERENCE:** Lunowa control should be available at the local case where the user notices a problem, without forcing them to enter a global settings/policy editor. Intervention should change only the intended semantic dimension.

---

## 2.4 Delegation and adoption are distinct reliance decisions

**EXTERNAL EVIDENCE — 2026 preprint**

`AI, Take the Wheel: What Drives Delegation and Trust in Human-Computer Cooperative Question Answering?` separates delegation (letting AI act without first seeing the output) from adoption (deciding whether to use a shown AI suggestion), and observes both over- and under-reliance in expert human/AI collaboration.

Source:

- arXiv, 2026-05: https://arxiv.org/abs/2605.28255

**INFERENCE:** Lunowa's monitoring-delegation permission and approval/adoption of a concrete external action should stay separate. A history of successful monitoring should not silently become permission to send or mutate external systems.

---

# 3. Trust repair and correction burden

## 3.1 Self-repair and structured repair can outperform asking users to diagnose the system

**EXTERNAL EVIDENCE — Information Systems Frontiers, 2026**

`Explainability in AI: Comparing Human-Like and System-Like Trust Repair Strategies` reports a scenario-based experiment with 261 participants comparing human-like and XAI/system-like repair strategies after conversational-agent errors.

Source:

- Springer / DOI, published 2026-06-03: https://doi.org/10.1007/s10796-026-10751-1

**INFERENCE:** after a Lunowa error, the Product should self-repair from trusted evidence where it safely can. When user input is required, a bounded material choice is preferable to asking the user to diagnose prompts, confidence, or internal model reasoning.

---

## 3.2 Apology is not a substitute for restored state/integrity

**EXTERNAL EVIDENCE — 2026 trust-repair studies**

Recent AI trust-repair studies show that apology framing can influence perceived trust, but simple apology is not a reliable substitute for restored competence/reliance and effects vary by context/task.

Sources:

- `Apologizing artificial intelligence: designing and evaluating effective AI apologies after errors`, AI & Society, 2026: https://doi.org/10.1007/s00146-026-03067-w
- `Guilty apology and trust repair in generative artificial intelligence: the role of mind perception`, International Journal of Human-Computer Studies, 2026: https://doi.org/10.1016/j.ijhcs.2026.103813

**INFERENCE:** Lunowa recovery should lead with corrected state, affected scope, last trustworthy observation, and restored/narrowed monitoring—not anthropomorphic apology theater.

---

# 4. Failure, incident response, and safe degradation

## 4.1 AI risk management explicitly includes fail-safe behavior, monitoring, override, incident response, and recovery

**EXTERNAL EVIDENCE — NIST AI RMF / AIRC**

The NIST AI RMF Core calls for production monitoring, safe failure, security/resilience evaluation, human oversight, and risk treatment including appeal/override, incident response, recovery, and change management. The Generative AI Profile remains a companion cross-sector resource, and NIST's AI RMF materials were still being actively updated/revised in 2026.

Sources:

- NIST AI RMF Core / AIRC: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
- NIST AI RMF: https://www.nist.gov/itl/ai-risk-management-framework
- NIST AI RMF Generative AI Profile: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

**INFERENCE:** a delegated-monitoring Product needs explicit product behavior for monitoring degradation and recovery. `Something failed` is insufficient; affected scope, remaining safe capability, impact interval, and recovery/reconciliation matter.

**PRODUCT HYPOTHESIS:** Lunowa should degrade the smallest affected scope consistent with evidence rather than globally disabling unrelated safe capabilities.

---

# 5. Account connection, permission revocation, and deletion frontier

## 5.1 Provider access can be revoked independently of the third-party Product account

**EXTERNAL EVIDENCE — Google/Microsoft current documentation**

Google documents that users can review/remove third-party app access; removing access prevents the app from accessing the Google Account and can make features unavailable. Microsoft similarly documents user-visible application permissions and revocation, with the caveat that revocation can break application functionality.

Sources:

- Google Account Help, `Manage links between your Google Account & apps from other developers`: https://support.google.com/accounts/answer/13533235
- Google Account Help, linked-app issue guidance: https://support.google.com/accounts/answer/12917337
- Microsoft Support, `Edit or revoke application permissions in the My Apps portal`: https://support.microsoft.com/en-us/accounts-billing/work-school/edit-or-revoke-application-permissions-in-the-my-apps-portal

**INFERENCE:** Lunowa must distinguish provider authorization loss from an intentional Lunowa mailbox disconnect and from Lunowa-account deletion. All can remove capability, but user intent and recovery behavior differ.

---

## 5.2 Mail-client account removal and Product-account deletion are separate user jobs

**EXTERNAL EVIDENCE — current products**

Superhuman Mail exposes add/switch/remove account operations. Shortwave documents Product-account deletion separately and states that deleting Shortwave does not delete the user's Gmail messages; provider permissions can also be revoked separately.

Sources:

- Superhuman Help, `Managing Accounts`: https://help.superhuman.com/hc/en-us/articles/46005777934733-Managing-Accounts
- Shortwave, `Upgrade, downgrade, or delete account`: https://www.shortwave.com/docs/how-tos/downgrade/
- Shortwave, `Security & Privacy`: https://www.shortwave.com/docs/guides/security/

**INFERENCE:** Lunowa's Settings/account lifecycle should not use one ambiguous `Sign out / Remove / Delete` operation for device sign-out, mailbox disconnect, and Product-account deletion.

---

## 5.3 Exact retention/deletion semantics remain Product/legal/implementation work

**EXTERNAL EVIDENCE:** competitor/provider deletion flows vary, and provider authorization revocation does not itself specify what a third-party service must retain/delete under its own privacy/legal obligations.

**UNKNOWN:** Lunowa's exact deletion SLA, backup retention period, audit retention, export guarantees, and organization-admin constraints are not established by current Product research.

**PRODUCT HYPOTHESIS:** the UI must state the concrete known consequences before destructive account removal/deletion, while exact legal/retention commitments should not be invented before the privacy/legal implementation contract is decided.

---

# 6. Settings and permission-control frontier

## 6.1 Current products expose scoped controls, but broad rule builders are not a required pattern

**EXTERNAL EVIDENCE:**

- Outlook Copilot exposes account-level Copilot toggles and priority customization.
- Cowork supports action/scope/session approvals and revocation.
- Superhuman's current agent/connectors expose approval/allow controls at action/tool level.

Sources:

- Outlook Copilot Toggle: https://support.microsoft.com/en-US/Outlook/copilot-toggle
- Outlook Prioritize: https://support.microsoft.com/en-us/outlook/copilot-outlook/prioritize-my-inbox
- Microsoft Cowork: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
- Superhuman Go current approval modes: https://help.superhuman.com/hc/en-us/articles/48093779871117-Get-started-with-Superhuman-Go-for-iOS

**INFERENCE:** Lunowa Settings should be a compact control plane for persistent user-owned scope/preferences. Case-specific correction, return-condition changes, Stop Tracking, and ordinary send approval belong near the affected Moment/Managed item, not hidden in Settings.

**PRODUCT HYPOTHESIS:** do not expose model temperature/confidence/prompt controls or a generic workflow/rule builder as a substitute for clear Product semantics.

---

# 7. Communication edge-case evidence

## 7.1 Production email AI already has coverage exclusions

**EXTERNAL EVIDENCE — Outlook 2026**

Current Outlook Prioritize documentation excludes or does not evaluate several categories including out-of-office mail, meeting mail, some encrypted mail, and other special/low-content cases.

Source:

- https://support.microsoft.com/en-us/outlook/copilot-outlook/prioritize-my-inbox

**INFERENCE:** Lunowa must have explicit safe fallback for messages it cannot interpret reliably. Coverage gaps must not be converted into false `No Responsibility`, false Managed reassurance, or fake completion.

---

## 7.2 Provider/source observations can differ from linguistic claims

**INFERENCE from FIXED Lunowa Responsibility semantics:** claims such as `attached`, `sent`, `approved`, or `done` remain distinct from trusted provider/source observations. Bounce/non-delivery, missing attachment, quoted history, out-of-order ingestion, CC membership, and acknowledgement all require the existing claim/observation, chronology, obligation-bearer, and closure boundaries rather than new Product enums.

This is primarily **canonical internal evidence**, not a competitor-derived claim.

---

# 8. Product synthesis by remaining domain

## 8.1 User Control / Correction / Escalation

**INFERENCE:** the PR #44 candidate is directionally supported by current evidence and canonical semantics:

- correction remains field-scoped;
- source is immutable;
- local correction should repair the smallest material decision;
- monitoring delegation and action permission remain separate;
- Review should stay sparse/material;
- Integrity Alert remains separate from semantic Review;
- true reversibility must be distinguished from decorative Undo.

**Required reconciliation before promotion:** `Return Attention Now` must not fabricate USER actionability or force a Waiting item into Needs You when no current USER obligation exists. It may cancel defer/open/focus an item while canonical projection remains truthful. User correction must also preserve semantic kind—for example, a USER_TARGET must not be relabeled as SOURCE_DUE merely because the user entered a date.

---

## 8.2 Failure / degraded states

**INFERENCE:** Product behavior should distinguish at least these **conceptual failure classes without creating an enum/table automatically**:

- provider authorization/source visibility loss;
- source ingestion lag or completeness uncertainty;
- Temporal Contract/scheduler execution degradation;
- AI interpretation unavailable or materially behind;
- external action execution/reconciliation failure or ambiguity;
- notification/delivery-channel degradation;
- client/network offline while server monitoring may remain healthy;
- attachment/search/preview-local capability failure.

The critical question is not `is there an error?` but:

```text
what promise/capability is affected?
what is the last trustworthy observation?
which delegated loops are affected?
what remains safe/usable?
what reconciliation/recovery is required before reassurance resumes?
```

---

## 8.3 Account lifecycle

**INFERENCE:** account lifecycle should distinguish:

```text
device/app sign-out
!= provider authorization loss
!= intentional mailbox disconnect
!= Lunowa account deletion
```

Intentional disconnect must be decision-complete when live delegated monitoring depends on that account. It ends affected monitoring but must not fabricate Responsibility satisfaction. Re-adding an intentionally disconnected mailbox should not silently reactivate old delegation; temporary auth recovery may restore prior intent only after source reconciliation confirms integrity.

---

## 8.4 Settings

**INFERENCE:** persistent Settings should center user-owned scope/effects:

- Accounts & data/integrity;
- Attention & notification delivery;
- Delegation scopes/classes that the user explicitly enabled;
- External-action permissions where such permissions exist;
- Privacy/data controls;
- lightweight experience choices such as landing preference/language where accepted.

Settings should not become a second ontology, AI-debug panel, or generic automation builder.

---

## 8.5 Communication edge cases

**INFERENCE:** current FIXED semantics already cover much of the hard boundary. Product completion should make the user-visible fallback explicit for:

- zero/one/many Responsibilities in a Conversation;
- quoted/forwarded history;
- CC/group/ambiguous obligation bearer;
- auto-replies/out-of-office;
- acknowledgement/partial response;
- bounce/non-delivery;
- attachment claim vs observation;
- conflicting/revised terms;
- off-channel completion/correction;
- cross-thread continuation ambiguity;
- encrypted/unsupported/uninterpretable source;
- prompt injection/high-risk requests;
- duplicate/out-of-order/historical sync evidence.

No new aggregate is implied merely because these scenarios are listed.

---

## 8.6 Managed / Review

**INFERENCE:** Managed should only reassure about live delegated work that Lunowa can currently monitor with adequate integrity and that does not currently require USER action or material Review. Integrity-compromised items must not remain hidden inside a green Managed count.

Review remains a question surface, not a generic state queue. It should contain only material admission/field/safety ambiguity requiring a user decision that cannot be resolved more cheaply/safely. Routine explicit Send approval belongs in its contextual action surface rather than creating a Review backlog.

---

## 8.7 Zero / empty / unavailable states

**INFERENCE:** a true zero and an unknown/unavailable state must remain different:

```text
no current Needs You / Review
!= data has not synced
!= provider access lost
!= AI processing behind where monitoring depends on it
!= user disconnected all monitoring
```

Empty states are Product trust surfaces. They should avoid Inbox-Zero gamification and avoid absolute reassurance unsupported by current integrity.

---

# 9. Explicit unknowns / non-promotions

This evidence review does **not** establish:

- exact ICP / PMF / WTP / pricing / distribution;
- attainable production false-negative or unnecessary-Review rates;
- a numeric monitoring-health threshold;
- a numeric Review threshold;
- exact notification/digest/quiet-hours defaults;
- a new failure/account/settings lifecycle enum;
- a generic persisted `Correction`, `Override`, `Escalation`, `Managed`, `Review`, `Setting`, or account-lifecycle aggregate;
- automatic standing preference memory from correction history;
- universal auto-learning from user correction;
- global trust/autonomy score;
- production-safe autonomous email sending;
- exact retention/deletion SLA;
- second-provider/full-client necessity;
- calendar integration timing;
- generic workflow/rule-builder need;
- that competitor behavior predicts Lunowa adoption.

These remain empirical, legal, implementation, or future Product questions according to their owning authority.