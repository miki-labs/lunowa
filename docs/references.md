# Primary References

Reviewed for blueprint v0.1 on **2026-08-19**.

This file records the major primary/authoritative sources used to derive or re-check the blueprint. The blueprint adapts them to a solo/small-team product-development context; it does **not** claim that any one source endorses every recommendation in this repository.

Keep durable policy focused on reusable invariants. Time-sensitive provider/model/platform/legal details must be re-checked at the point of a material implementation or release decision.

## OpenAI — coding agents and repository harnesses

- Harness engineering: leveraging Codex in an agent-first world  
  https://openai.com/index/harness-engineering/  
  Used for: short `AGENTS.md` as a map rather than an encyclopedia, repository-local knowledge, progressive disclosure, mechanical architecture constraints, agent legibility, and continuous harness improvement rather than prompt accumulation.

- Codex best practices  
  https://developers.openai.com/codex/learn/best-practices  
  Used for: Goal/Context/Constraints/Done task framing, planning complex work, short accurate repository instructions, adding rules after recurring failures, bounded permissions, and MCP/live integrations for external changing context.

- Codex agent approvals and security  
  https://developers.openai.com/codex/agent-approvals-security  
  Used for: sandboxing, restricted filesystem/network access, approval modes, secret isolation, and prompt-injection risk from external content.

- Codex GitHub Action  
  https://developers.openai.com/codex/github-action  
  Used for: CI/agent permission boundaries and treating issue/PR content as potentially untrusted input.

- Symphony: an open-source spec for Codex orchestration  
  https://openai.com/index/open-source-codex-orchestration-symphony/  
  Used only as evidence of current orchestration approaches; not treated as a requirement for ordinary products.

## Anthropic — agent harnesses, containment, and evaluation

- Effective harnesses for long-running agents  
  https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents  
  Used for: explicit durable artifacts across sessions, bounded work units, progress/state handoff, and long-running-agent reliability.

- Demystifying evals for AI agents  
  https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents  
  Used for: outcome-based evaluation, regression detection before production, evaluating multi-turn behavior in a realistic harness/environment, and not trusting agent self-reports as completion evidence.

- Scaling Managed Agents  
  https://www.anthropic.com/engineering/managed-agents  
  Used for: stable harness interfaces and the risk that model-specific compensations become stale as model capabilities evolve.

- How we contain Claude across products  
  https://www.anthropic.com/engineering/how-we-contain-claude-across-products  
  Used for: defense in depth, sandbox/egress/filesystem boundaries, limiting blast radius, and the weakness of relying on frequent user approval prompts as the primary security boundary.

## Google — software engineering and code review

- Software Engineering at Google  
  https://abseil.io/resources/swe-book  
  Used for: maintainability over time, readability, knowledge sharing, testing philosophy, dependency lifecycle cost, and engineering practices that scale only when their ongoing benefit exceeds their cost.

- Google Engineering Practices — Small CLs  
  https://google.github.io/eng-practices/review/developer/small-cls.html  
  Used for: small self-contained changes, reviewability, lower defect risk, rollback, and faster feedback.

- Google Engineering Practices — What to look for in a code review  
  https://google.github.io/eng-practices/review/reviewer/looking-for.html  
  Used for: functionality, design, complexity, tests, naming, comments, and over-engineering avoidance.

- Google Engineering Practices — The Standard of Code Review  
  https://google.github.io/eng-practices/review/reviewer/standard.html  
  Used for: continuous code-health improvement rather than theoretical perfection and preference-based blocking.

## DORA — delivery and AI-assisted software development

- 2025 State of AI-assisted Software Development report  
  https://dora.dev/research/2025/dora-report/  
  Used for: AI as an amplifier of the existing engineering system rather than a substitute for strong delivery/feedback practices.

- Working in small batches  
  https://dora.dev/capabilities/working-in-small-batches/  
  Used for: small batches as a delivery-risk reduction mechanism and as a safety mechanism when AI increases change throughput.

- Continuous Integration  
  https://dora.dev/capabilities/continuous-integration/  
  Used for: automated feedback, frequent integration, and keeping the integration branch healthy.

- Trunk-based development  
  https://dora.dev/capabilities/trunk-based-development/  
  Used for: short-lived branches and avoiding large stabilization phases.

- User-centric focus  
  https://dora.dev/capabilities/user-centric-focus/  
  Used for: connecting engineering work with user outcomes and avoiding faster implementation of the wrong product behavior.

## NIST — secure software, identity, and incident response

- NIST SP 800-218 — Secure Software Development Framework (SSDF) v1.1  
  https://csrc.nist.gov/pubs/sp/800/218/final  
  Used for: integrating security through the development lifecycle rather than treating it as a final scan.

- NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management  
  https://csrc.nist.gov/pubs/sp/800/61/r3/final  
  Used for: incident preparation, response/recovery, and learning from incidents.

- NIST SP 800-63-4 — Digital Identity Guidelines  
  https://csrc.nist.gov/pubs/sp/800/63/4/final  
  Used for: authentication, authenticator lifecycle, account recovery, reauthentication/session management, and federation. The blueprint adapts these concepts proportionally; it does not impose government assurance levels on ordinary consumer/SaaS products.

- NIST SP 800-63B — Authentication and Authenticator Management  
  https://pages.nist.gov/800-63-4/sp800-63b.html  
  Used for: authenticator binding/replacement/invalidation, compromise handling, recovery, and session lifecycle.

## OWASP — application and agent security

- OWASP Application Security Verification Standard (ASVS) 5.0  
  https://owasp.org/www-project-application-security-verification-standard/  
  Used as a concrete source for web-application security verification where applicable.

- OWASP Top 10:2025  
  https://owasp.org/Top10/2025/  
  Used for current awareness of major web-application risk categories including access control, misconfiguration, and supply-chain failures.

- OWASP Threat Modeling Cheat Sheet  
  https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html  
  Used for: assets, actors, data flows, trust boundaries, threats, mitigations, and verification.

- OWASP Authentication Cheat Sheet  
  https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

- OWASP AI Agent Security Cheat Sheet  
  https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html  
  Used conditionally for user-facing AI/agent products: least privilege, tool authorization, prompt-injection boundaries, structured-output validation, memory/retrieval security, high-impact action controls, monitoring, adversarial testing, and bounded token/tool/retry/cost execution.

- OWASP Top 10 for Agentic Applications  
  https://owasp.org/www-project-top-10-for-agentic-applications/  
  Used for current agentic failure modes such as goal hijacking, tool misuse, privilege abuse, memory poisoning, cascading failures, and over-trust in agent behavior. It is not a reason to add agent architecture to non-agent products.

## IETF / W3C — identity and accessibility standards

- RFC 9700 — Best Current Practice for OAuth 2.0 Security  
  https://www.rfc-editor.org/rfc/rfc9700.html  
  Use when OAuth/OIDC implementation is in scope.

- W3C Web Authentication (WebAuthn) Level 3  
  https://www.w3.org/TR/webauthn-3/  
  Use when passkey/phishing-resistant authentication choices are in scope.

- W3C Web Content Accessibility Guidelines (WCAG) 2.2  
  https://www.w3.org/TR/WCAG22/  
  Used as a current technology-neutral accessibility baseline for web products when applicable. The blueprint does not convert a particular conformance level into a universal product requirement without considering actual platform, users, and legal obligations.

## GitHub — repository instructions, CI/CD, and supply chain

- Adding repository custom instructions for GitHub Copilot  
  https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot  
  Used as current evidence that coding-agent instructions can be repository-wide or scoped/path-specific. Exact discovery/precedence behavior remains tool-specific and is not a global blueprint invariant.

- Secure use reference for GitHub Actions  
  https://docs.github.com/en/actions/reference/security/secure-use  
  Used for: least-privilege workflow permissions, untrusted input, third-party Action risk, immutable full-SHA pinning, and dependency review.

- GitHub-hosted runners reference  
  https://docs.github.com/en/actions/reference/runners/github-hosted-runners  
  Used for: treating CI runners as explicit build/test environments. Runner availability/specifications/pricing are time-sensitive.

- Dependency review  
  https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review

- Dependabot security updates  
  https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates

- Protected branches / required status checks  
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

- Deployment environments / protection  
  https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments

- OIDC for cloud deployments  
  https://docs.github.com/en/actions/concepts/security/openid-connect

## Google SRE — reliability, recovery, and operations

- Monitoring Distributed Systems  
  https://sre.google/sre-book/monitoring-distributed-systems/  
  Used for: useful monitoring signals, actionable alerting, and black-box/white-box observability.

- Handling Overload  
  https://sre.google/sre-book/handling-overload/  
  Used for: overload behavior, load shedding, retry amplification, and resource bounds.

- Service Best Practices  
  https://sre.google/sre-book/service-best-practices/  
  Used for: rollout, rollback, configuration safety, and operational interfaces.

- Reliable Product Launches  
  https://sre.google/sre-book/reliable-product-launches/  
  Used for: launch readiness, dependency/failure review, and recovery thinking. Large-organization launch ceremony is not imported as a solo-product requirement.

- Launch checklist  
  https://sre.google/sre-book/launch-checklist/  
  Used for: dependency, monitoring, capacity, failure, and recovery questions.

SRE guidance is adapted to the failure mode rather than copied organizationally. A solo product may need a tested restore or short runbook without needing an SRE organization, formal rotations, or incident-command roles.

## Apple — distribution and App Store commerce

Time-sensitive. Re-check current primary documentation before iOS/App Store release or monetization decisions.

- App Store submission requirements  
  https://developer.apple.com/app-store/submitting/

- Xcode SDK and system requirements  
  https://developer.apple.com/xcode/system-requirements

- App Review Guidelines  
  https://developer.apple.com/app-store/review/guidelines/  
  Used for: evidence that distribution, payment, external-purchase, restoration, disclosure, and review requirements vary over time and sometimes by storefront/program/product type.

- App Store Server Notifications  
  https://developer.apple.com/documentation/appstoreservernotifications  
  Used for: asynchronous purchase/subscription state, retries, revocations, and the need for verified/idempotent event handling plus authoritative state recovery.

## Google Play — Android distribution and commerce

Time-sensitive. Re-check current primary documentation before Android/Play release or monetization decisions.

- Integrate Google Play Billing with your server backend  
  https://developer.android.com/google/play/billing/backend  
  Used for: backend purchase status management, entitlement synchronization, duplicate handling, fraud/voided-purchase handling, and financial reconciliation/reporting.

- Purchase lifecycle  
  https://developer.android.com/google/play/billing/lifecycle  
  Used for: purchase lifecycle and entitlement synchronization, including changes originating outside the client.

- Real-time developer notifications reference  
  https://developer.android.com/google/play/billing/rtdn-reference  
  Used for: the provider rule that RTDN is a change signal and complete current purchase state must be retrieved from the Developer API before authoritative backend updates.

- Billing choice / alternative billing program overview  
  https://developer.android.com/google/play/billing/billingchoice  
  Used for: evidence that permitted payment flows/reporting programs can be market/program-specific and time-sensitive.

## PCI Security Standards Council — card-data scope

- PCI DSS  
  https://www.pcisecuritystandards.org/standards/pci-dss/  
  Use when payment-card scope/compliance is relevant.

- PCI SSC e-commerce / SAQ scope FAQ  
  https://www.pcisecuritystandards.org/faqs/if-a-merchant-s-e-commerce-implementation-meets-the-criteria-that-all-elements-of-payment-pages-originate-from-a-pci-dss-compliant-service-provider-is-the-merchant-eligible-to-complete-saq-a-or-saq-a-ep/  
  Used for: why provider-hosted payment handling can reduce but not automatically eliminate merchant responsibility.

## Stripe — billing/subscription operations

Provider-specific and time-sensitive. Re-check current docs before implementation.

- Customer portal  
  https://docs.stripe.com/customer-management/integrate-customer-portal  
  Used for: reuse-first commodity subscription/customer management.

- Subscription webhooks  
  https://docs.stripe.com/billing/subscriptions/webhooks  
  Used for: asynchronous subscription/payment lifecycle and failure handling.

- Usage-based billing  
  https://docs.stripe.com/billing/subscriptions/usage-based  
  Used for: provider-side usage-metering concepts when usage affects billing.

Stripe is an implementation candidate, not a universal required provider.

## AWS — operational and AI cost controls (supplemental)

- AWS Well-Architected — Operational Excellence Pillar  
  https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operational-excellence.html

- Agentic AI Lens — cost optimization design principles  
  https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/cost-optimization-design-principles.html

- Agentic AI Lens — automated cost controls with intelligent cutoffs  
  https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentcost07-bp01.html  
  Used supplementally for: externally enforced execution ceilings, token/iteration/time/concurrency limits, and automatic cutoff/throttling for materially expensive agentic workloads. AWS services themselves are not blueprint requirements.

## Email sender requirements

- Gmail sender guidelines  
  https://support.google.com/mail/answer/81126  
  Used for: current sender-authentication expectations such as SPF/DKIM/DMARC. Re-check because enforcement evolves.

## Japan — privacy and commercial/marketing review triggers

These sources define fact-specific review triggers, not universal legal advice.

- Personal Information Protection Commission (PPC) — guidelines and FAQs  
  https://www.ppc.go.jp/personalinfo/legal/  
  Used for: data-purpose, collection, retention, disclosure, and privacy-review triggers.

- Consumer Affairs Agency — mail-order / online commerce guidance  
  https://www.no-trouble.caa.go.jp/what/mailorder/  
  Used for: recognizing that paid online services can create commercial-disclosure and final-confirmation obligations.

- Consumer Affairs Agency — specified electronic mail guidance  
  https://www.caa.go.jp/policies/policy/consumer_transaction/specifed_email/  
  Used for: marketing-email compliance review triggers in Japan.

## Source maintenance rule

Time-sensitive claims—including standards versions, product/model capabilities, platform SDK/store requirements, CI runner availability/pricing, security guidance, provider behavior, pricing/licensing, payment programs, sender requirements, and laws/regulations—**MUST be re-checked against current primary sources before they are used to make a material product decision or release**.

A reference being listed here does not make every recommendation in that source a blueprint requirement. Adopt only the part that controls a relevant failure mode at a lifecycle cost appropriate to the product.
