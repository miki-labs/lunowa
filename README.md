# Software Engineering Blueprint

A reusable, living software-engineering standard for solo/small-team product development with substantial use of AI coding agents.

This repository is not a framework-specific starter, a maximal engineering handbook, or a claim that one process fits every product. It provides durable defaults, decision rules, launch gates, and selective templates that should be adapted to actual product risk, user value, longevity, reversibility, security/privacy, operational constraints, target platforms, and business model.

## Purpose

The blueprint exists to increase the probability of shipping and sustaining useful software products while minimizing avoidable engineering, operational, commercial, and AI-agent failure.

It optimizes for:

- correct user/system behavior rather than code volume,
- validated product scope rather than implementation throughput for its own sake,
- simplicity and reader/agent legibility,
- reuse before reinvention,
- explicit architecture, state ownership, and trust boundaries where they matter,
- small, reversible, independently verifiable changes,
- pervasive security/privacy and least privilege,
- mechanical verification rather than prompt/document reliance,
- failure-aware and safely repairable production systems,
- explicit platform build/test/release commitments,
- safe monetization through explicit commercial-state authority, reconciliation, repair, and bounded economic exposure,
- product measurement/support/accessibility interfaces proportional to the product stage,
- durable repository-backed knowledge shared across planning and coding-agent contexts,
- bounded, evaluated user-facing AI behavior when AI is part of the product,
- deletion and simplification of stale process as real product evidence accumulates.

## Repository map

`AGENTS.md` is the concise entry point. Read deeper documents only when relevant.

- `docs/core-principles.md` — durable principles, evidence/risk discipline, MUST/SHOULD/MAY semantics, rule lifecycle.
- `docs/implementation-workflow.md` — risk-scaled workflow from requirement to release.
- `docs/greenfield-bootstrap.md` — minimum reproducible foundation for new production-oriented repositories.
- `docs/architecture-design.md` — boundaries, data/state ownership, contracts, decisions, risk-scaled design.
- `docs/reuse-dependencies.md` — reuse-first decisions, dependencies/services, lifecycle and supply-chain trade-offs.
- `docs/reliability-operability.md` — failure handling, async work, boundedness, observability, recovery and safe repair.
- `docs/security-privacy.md` — secure-by-design baseline, identity/account lifecycle and threat-model triggers.
- `docs/verification-review.md` — test strategy, CI, behavior verification, review and Definition of Done.
- `docs/platform-development.md` — platform support and build/test/release boundaries without vendor-specific permanent policy.
- `docs/production-readiness.md` — stage-based launch gates, control-plane recovery and production safety.
- `docs/product-operations.md` — analytics, support, communication, accessibility, data lifecycle and legal/commercial engineering interfaces.
- `docs/monetization-engineering.md` — payment/commercial state, entitlements, usage, reconciliation/repair, revenue observability and economic containment.
- `docs/ai-product-runtime.md` — conditional engineering for user-facing AI/model/agent behavior, evaluation, tools, memory, cost and fallback.
- `docs/coding-agent-harness.md` — provider-neutral repository/task/permission/verification design for AI coding agents.
- `docs/repository-knowledge.md` — durable shared knowledge, authority-by-question, conflict handling, retrieval and live-context boundaries.
- `docs/references.md` — primary references and time-sensitive evidence used to derive or re-check the blueprint.
- `templates/` — selective task/design/threat/plan/decision/review/platform/launch templates.
- `templates/project-knowledge/` — optional product-repository knowledge starters; not a mandatory document set.

## Architecture of use

The intended loop is:

```text
Product evidence / accepted requirement
        ↓
Durable product-repository knowledge
        ↓
Risk-scaled task/design/plan
        ↓
Human + coding-agent implementation
        ↓
Mechanical verification + independent review when valuable
        ↓
Release / production evidence
        ↓
User, incident, support, commercial and agent-failure learning
        ↓
Smallest durable improvement to code/tests/docs/tools/harness
```

Raw chat history is not the durable knowledge layer. Accepted knowledge is promoted into versioned repository artifacts only when it will constrain or explain future work.

## Scope boundary

This is an **engineering blueprint**, not the complete startup operating system.

Customer discovery, competitive research, positioning, pricing research, willingness-to-pay validation, distribution, SEO/ASO, sales, outreach, growth marketing, accounting, tax, and substantive legal work live outside this repository.

Engineering retains the interfaces/triggers created by those domains: accepted product behavior, analytics contracts, payment/entitlement logic, disclosure/consent requirements, distribution/store constraints, support/repair capability, and other software obligations.

## Stage principle

Do not demand paid-production machinery from a prototype. Do not run a paid/public product with prototype discipline.

The blueprint deliberately rejects default requirements for microservices, Kubernetes, service meshes, multi-region active-active, formal CABs, enterprise SIEM/GRC, large experimentation platforms, 24/7 formal on-call processes, or specialized agent orchestration unless actual product scale/risk makes them cheaper than the failure they prevent.

## Status

**v0.1 — broad production/paid baseline, consolidated for solo/small-team use; awaiting validation through real products.**

The current baseline is informed by primary/authoritative material from OpenAI agent/coding guidance, Anthropic agent/harness/evaluation engineering, Google Software Engineering and DORA, NIST, OWASP, GitHub, Google SRE, W3C, current platform/store/payment documentation, PCI SSC, and relevant public regulatory sources.

The repository intentionally avoids freezing provider/model/store version details into durable policy. Time-sensitive external facts are re-checked when they materially affect implementation or release.

This version should not be expanded simply to improve theoretical coverage. Further durable additions SHOULD be driven primarily by:

- a material failure mode not currently controlled,
- repeated coding-agent or human implementation failure,
- production/support/commercial incidents,
- validated product/platform requirements,
- stronger current evidence that invalidates an existing rule.

## Core rule

Use this repository as a source of defaults and decision criteria, not as ceremonial compliance.

A rule, document, template, tool, or platform commitment that adds ongoing cost without reducing a relevant failure risk or enabling validated product value should be challenged, made conditional, merged, moved to the product repository, or deleted.
