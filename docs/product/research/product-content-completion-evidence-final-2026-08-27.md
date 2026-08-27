# Product Content Completion Evidence Review — Final 2026-08-27

## Status

**Dated research/rationale. Noncanonical evidence; canonical Product truth lives in Product authorities.**

This review supports GitHub Issue #45 and the final Product-content completion candidate. It supersedes earlier evidence-source version choices where a final peer-reviewed/version-of-record source is now available.

Evidence labels are strict:

- **EXTERNAL EVIDENCE** — current product documentation, standard/framework, or published research;
- **INFERENCE** — reasoning from external evidence plus Lunowa's canonical contract;
- **PRODUCT HYPOTHESIS** — Lunowa-specific behavior still requiring empirical validation;
- **UNKNOWN** — not established.

Competitor feature presence is frontier evidence, not proof that Lunowa should copy the feature or that it works well.

---

# 1. Email / agent frontier

## 1.1 Gmail

**EXTERNAL EVIDENCE — Google, 2026.** Gmail AI Inbox prioritizes important updates and time-sensitive tasks; Google Workspace announcements describe personalized draft replies, surfacing relevant files for tasks, marking suggested tasks done, and dismissing suggestions. Google's broader agent UX also distinguishes higher-stakes actions such as sending email/calendar changes from ordinary assistance.

Primary sources:

- Google, `Gmail is entering the Gemini era`, 2026-01-08: https://blog.google/products-and-platforms/products/gmail/gmail-is-entering-the-gemini-era/
- Google, `New ways to create and get things done in Google Workspace`, 2026-05-19: https://blog.google/products-and-platforms/products/workspace/workspace-updates/
- Google I/O 2026 announcements: https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/

**INFERENCE:** prioritization, task extraction, drafts, action suggestions, and lightweight correction/dismissal are incumbent territory. Lunowa differentiation cannot rest on those features individually.

## 1.2 Outlook Copilot

**EXTERNAL EVIDENCE — Microsoft, current 2026 documentation.** Prioritize can classify incoming mail, provide reasons, and expose customization. Current support documentation also identifies coverage exclusions/non-evaluated categories including some out-of-office, meeting, encrypted, low-content and related special mail.

Primary sources:

- Microsoft Support, `Prioritize my inbox`: https://support.microsoft.com/en-us/outlook/copilot-outlook/prioritize-my-inbox
- Microsoft Support, `Frequently asked questions about Copilot in Outlook`: https://support.microsoft.com/en-us/outlook/frequently-asked-questions-about-copilot-in-outlook
- Microsoft Support, `Summarize an email thread with Copilot in Outlook`: https://support.microsoft.com/en-us/outlook/copilot-pages/summarize-an-email-thread-with-copilot-in-outlook

**INFERENCE:** production AI coverage is not universal. Unsupported/unevaluated content needs truthful source/manual/degraded fallbacks; it must not become false `No Responsibility`, fake user work, or fake healthy reassurance.

## 1.3 Superhuman / Shortwave

**EXTERNAL EVIDENCE — current 2026 product documentation.** Superhuman supports reminders, no-reply automation, drafts, and action confirmation/permission controls in agent integrations. Shortwave/Tasklet supports trigger/schedule-driven background email automation and contextual drafting/task operations.

Primary sources:

- Superhuman Help, `Remind Me`: https://help.superhuman.com/hc/en-us/articles/46005666142733-Remind-Me
- Superhuman Help, `Auto Reminders & Auto Drafts`: https://help.superhuman.com/hc/en-us/articles/46005658551053-Auto-Reminders-Auto-Drafts
- Superhuman Help, `Superhuman Mail MCP Server`: https://help.superhuman.com/hc/en-us/articles/46005696690317-Superhuman-Mail-MCP-Server
- Shortwave, `Introducing Tasklet: Automate your business with AI Agents`, 2025-10-09: https://www.shortwave.com/blog/introducing-tasklet-ai-automation/
- Shortwave, `Fully Automate Your Email with Shortwave + Tasklet`, 2026-01-06: https://www.shortwave.com/blog/shortwave-tasklet-integration/

**INFERENCE:** reminder/drafting/search/background-trigger automation does not by itself establish a moat. Lunowa's stronger hypothesis remains end-to-end monitoring relinquishment with trustworthy closure, return, correction, and integrity semantics.

---

# 2. Human oversight, delegation, and permission

## 2.1 Microsoft Cowork: concrete action approval

**EXTERNAL EVIDENCE — Microsoft, current August 2026.** Cowork asks for permission before sensitive actions such as sending/posting or other consequential operations. Current documentation presents action-specific approval UI, preview/hand-back controls, cancelability, and bounded permission patterns rather than one undifferentiated autonomy switch.

Primary sources:

- Microsoft Learn, `Use Copilot Cowork`: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
- Microsoft Learn, `Copilot Cowork overview`: https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/

**INFERENCE:** capability and authority should remain distinct. When Lunowa needs approval, the user should see the concrete decision-critical effect rather than approve an opaque agent intention.

## 2.2 Human oversight can itself become a failure mode

**EXTERNAL EVIDENCE — peer-reviewed CHI 2026.** `Dark Patterns Meet GUI Agents: LLM Agent Susceptibility to Manipulative Interfaces and the Role of Human Oversight` reports that human oversight can improve avoidance of manipulative interface effects while also introducing attentional tunneling and cognitive load; neither humans nor agents are uniformly robust.

Version of record:

- ACM CHI 2026, DOI: https://doi.org/10.1145/3772318.3791568

**INFERENCE:** safety is not maximized by requiring users to supervise every inference. Lunowa should minimize routine confirmation while preserving contextual, decision-complete intervention at material boundaries.

## 2.3 Delegation and adoption are separate reliance decisions

**EXTERNAL EVIDENCE — peer-reviewed ACL Findings 2026.** `AI, Take the Wheel: What Drives Delegation and Trust in Human–Computer Cooperative Question Answering?` distinguishes delegation from adoption and observes both over- and under-reliance in human-AI collaboration.

Version of record:

- Findings of ACL 2026, DOI: https://doi.org/10.18653/v1/2026.findings-acl.422

**INFERENCE:** letting Lunowa monitor a class of communication is not the same decision as approving a concrete outgoing action. Successful monitoring history does not silently create send authority.

## 2.4 Intervenability remains an emerging design direction

**EXTERNAL EVIDENCE — 2026 preprint, not frozen standard.** `Intervenability as a Design Requirement for Autonomy and Oversight within Human-Centered AI` frames intervention as including real-time stopping, decision correction, and reconfiguration while considering human effort.

Source:

- arXiv: https://arxiv.org/abs/2607.10322

**INFERENCE:** case-local correction, Return Attention, Stop Tracking, and bounded permission revocation are preferable to forcing users into a global automation/debug surface.

---

# 3. Trust repair

## 3.1 Repair should restore usable state, not demand system diagnosis

**EXTERNAL EVIDENCE — Information Systems Frontiers, 2026.** `Explainability in AI: Comparing Human-Like and System-Like Trust Repair Strategies` compared repair strategies after conversational-agent errors. The study supports the importance of structured repair/explanation and shows that user continuance and subjective trust can differ.

Version of record:

- DOI: https://doi.org/10.1007/s10796-026-10751-1

**INFERENCE:** Lunowa should self-repair from trusted evidence where possible; where user input is needed, ask one bounded material question rather than expose prompts/confidence/model internals.

## 3.2 Apology is not integrity recovery

**EXTERNAL EVIDENCE — 2026 published studies.** Recent work on AI apologies finds context-dependent trust effects; apology framing alone is not equivalent to restored capability or reliable behavior.

Sources:

- `Apologizing artificial intelligence: designing and evaluating effective AI apologies after errors`, AI & Society: https://doi.org/10.1007/s00146-026-03067-w
- `Guilty apology and trust repair in generative artificial intelligence: the role of mind perception`, International Journal of Human-Computer Studies: https://doi.org/10.1016/j.ijhcs.2026.103813

**INFERENCE:** Lunowa recovery should lead with corrected state, affected scope, last trustworthy observation, reconciliation, and any scope narrowing. Apology is optional secondary communication.

---

# 4. Failure / recovery / AI risk management

## 4.1 NIST AI RMF Core

**EXTERNAL EVIDENCE — NIST.** The AI RMF Core includes production monitoring, human oversight, appeal/override, incident/error response, recovery, and change-management activities. It treats post-deployment risk management as an ongoing system responsibility rather than a one-time pre-release check.

Primary sources:

- NIST AIRC, AI RMF Core: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
- NIST AI RMF: https://www.nist.gov/itl/ai-risk-management-framework
- NIST Generative AI Profile: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

**INFERENCE:** a delegated-monitoring Product must define degraded behavior, affected scope, recovery, and reconciliation. A generic `something went wrong` state is insufficient.

**PRODUCT HYPOTHESIS:** default to smallest-evidence-supported degradation scope rather than disabling unrelated healthy capability globally.

---

# 5. Account permissions and deletion boundaries

## 5.1 Provider access revocation is not Product-account deletion

**EXTERNAL EVIDENCE — Google/Microsoft current documentation.** Users can revoke a third-party application's access independently of deleting the third-party Product account. Google explicitly notes that removing access can stop future account access without necessarily deleting data already held by the third party. Microsoft similarly documents application-permission revocation and warns that app functionality may break.

Primary sources:

- Google Account Help, `Manage links between your Google Account & apps from other developers`: https://support.google.com/accounts/answer/13533235
- Google Account Help, linked-app guidance: https://support.google.com/accounts/answer/12917337
- Microsoft Support, `Edit or revoke application permissions in the My Apps portal`: https://support.microsoft.com/en-us/accounts-billing/work-school/edit-or-revoke-application-permissions-in-the-my-apps-portal

**INFERENCE:** Lunowa must keep device sign-out, unexpected provider authorization loss, intentional mailbox disconnect, and Product-account deletion as distinct user jobs with distinct intent/recovery semantics.

## 5.2 Exact deletion/retention semantics remain external release work

**UNKNOWN:** Lunowa's exact deletion SLA, backup/audit retention, export guarantees, billing consequences, and organization-admin constraints are not established by Product research.

**INFERENCE:** Product-content closure can define the deletion operation boundary while keeping exact legal/data values unknown. However public release of the destructive interaction requires an accepted privacy/legal/data-retention contract so the confirmation can be decision-complete without fabricated guarantees.

---

# 6. Product synthesis by Issue #45 domain

## User Control / Correction / Escalation

**INFERENCE:** preserve field-scoped correction, immutable source, semantic kind, local controls, sparse material Review, and explicit bounded action approval.

**PRODUCT HYPOTHESIS:** repeated material failure should narrow the implicated class rather than globally disable unrelated healthy monitoring.

## Failure / degraded behavior

**INFERENCE:** separate monitoring integrity, delivery integrity, AI-local capability, provider permission scope, and external-action reconciliation. Restore strong reassurance only after affected intervals/scopes are sufficiently reconciled.

## Account lifecycle

**INFERENCE:** temporary auth loss preserves different user intent from intentional disconnect. Re-add after intentional disconnect must not silently resurrect old delegation. Disconnect with live delegated work needs an inspectable affected-items path, not only a count.

## Settings

**INFERENCE:** Settings is a capability-conditional persistent control plane. Case-local correction/Stop Tracking/return/ordinary Send approval stay local. Do not expose unsupported autonomy controls, model tuning, or generic workflow rules.

## Communication edge cases

**INFERENCE:** production-safe behavior follows existing Responsibility distinctions—claim vs observation, bearer vs speaker, chronology vs ingestion order, semantic similarity vs identity, source request vs safe action—rather than adding edge-case enums.

## Managed / Review

**INFERENCE:** healthy Managed reassurance and a currently surfaced material Review should not describe the same item simultaneously. Unaffected background monitoring may continue, but the primary user-facing projection is Review until the question resolves.

## Zero / unavailable

**INFERENCE:** strict all-clear requires neither Needs You nor unresolved surfaced Review and requires trustworthy relevant integrity. Unsynced, degraded, or intentionally unmonitored states are different from healthy zero.

## Feature scope

**INFERENCE:** one-provider Minimum Complete Delegation Loop remains the correct current v1 breadth. Full client parity, broad multi-account, generic workflow automation, and default autonomous Send are not required to close Product content.

---

# 7. Explicit evidence limits

This research does **not** establish:

- which ICP has the strongest problem;
- real prevalence/severity of monitoring burden;
- whether current incumbents are inadequate for that ICP;
- acceptable real false-negative/unnecessary-Review rates;
- the reliability threshold for genuine monitoring relinquishment;
- exact IA/copy/notification defaults;
- whether class-scoped delegation should enter late v1;
- willingness to pay, retention, distribution, or PMF;
- exact legal/privacy commitments;
- production provider/security feasibility.

Those remain empirical, technical, usability, or legal evidence targets. Competitor capability is not a substitute for Lunowa validation.
