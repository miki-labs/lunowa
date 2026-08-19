# Product Operations Engineering Interfaces

This document covers the engineering capabilities needed to learn from a deployed product, support users, communicate reliably, provide accessible critical flows, and keep software behavior aligned with privacy/commercial obligations.

It does **not** define customer discovery, positioning, pricing research, distribution strategy, sales, growth marketing, accounting, tax, or substantive legal advice. Those belong in the product/business operating system. This blueprint owns only the engineering interface or trigger created by those decisions.

Add the smallest capability that supports a real product decision, user need, or material obligation.

## Engineering health and product health are different

Operational monitoring asks:

- Is the software failing?
- Which release/configuration regressed?
- Which dependency/job is broken?

Product measurement asks:

- Are users reaching the intended value?
- Where do they fail or abandon the flow?
- Do they return?
- Does paid conversion or another product outcome improve?

Do not substitute one for the other.

## Product analytics

For beta or production products, SHOULD measure the smallest set of events/outcomes needed to make current product decisions.

Prefer outcome-oriented signals such as activation, successful core-value use, retention, conversion, and decision-relevant feature adoption over collecting every possible interaction.

MUST avoid collecting data merely because it is technically available.

### Measurement contract

Analytics that materially drives product decisions SHOULD define enough semantics that releases, humans, and agents do not silently measure different things.

For an important event/metric, define as applicable:

- decision/question the signal exists to answer,
- exact observable occurrence that counts,
- required properties and meaning,
- identity semantics including anonymous/account linkage,
- authoritative measurement point,
- duplicate/late-event behavior when it changes interpretation,
- privacy/sensitive-data classification,
- retention/access,
- version/evolution behavior if meaning changes.

Do not create a giant event taxonomy before product questions exist. Instrument the critical value/funnel events first.

A/B experimentation infrastructure is conditional. Add it only when traffic, decision value, and statistical/operational cost justify it.

## Support and diagnostic context

Public or paid products SHOULD expose a support channel. A support email is sufficient until volume/workflow proves a need for more.

Support tooling SHOULD provide the minimum context needed to reproduce and resolve important issues without encouraging unnecessary collection of private data or broad production access.

Use the constrained repair guidance in `reliability-operability.md`; money/access incidents also follow `monetization-engineering.md`.

Support systems are production-adjacent control planes and MUST follow appropriate access-control and sensitive-data rules.

## Transactional communication

When the product must send account, security, billing, or service messages, prefer a mature managed delivery provider rather than self-hosting delivery infrastructure unless a concrete requirement justifies ownership.

Separate transactional and marketing communication because purpose, consent, deliverability, and operational requirements differ.

For email, configure current sender/domain authentication required by the provider/recipient ecosystem, such as SPF/DKIM/DMARC where applicable. Treat sender requirements as time-sensitive external constraints.

If delivery is critical to recovery, security, payment remediation, or another important flow, persistent delivery failures SHOULD be observable enough to diagnose the user impact.

Do not include secrets or unnecessary sensitive content in messages.

## Marketing communication interface

The blueprint does not define marketing strategy.

Engineering SHOULD implement consent/preferences/opt-out and required disclosure behavior when the applicable law, platform, channel, or accepted product policy requires them.

Do not use transactional-message privileges to bypass marketing consent or deliverability rules.

## Accessibility

Accessibility is a product-quality property, not visual polish added after implementation.

For public user-facing products, critical flows SHOULD have an explicit accessibility target appropriate to the platform, audience, legal context, and product stage.

For web products, current W3C/WAI guidance such as WCAG is a strong baseline when applicable. Do not copy a version-specific compliance claim into a global MUST without checking the actual product/jurisdiction requirements.

Verification should combine the cheapest useful evidence. Depending on the product, this may include:

- semantic/native controls rather than inaccessible custom interactions,
- keyboard/focus navigation,
- labels/names/roles/states for assistive technology,
- contrast and non-color-only communication,
- text scaling/reflow,
- reduced-motion behavior,
- automated accessibility checks,
- manual screen-reader or platform assistive-technology checks for critical flows.

Automated tooling catches only part of accessibility behavior. A passing scanner is not proof that a real critical flow is usable.

Prototype work does not need a heavyweight compliance program. Public/paid products should not knowingly ship core flows that are unusable through the accessibility modes they claim or are required to support.

Keep platform-specific verification in `platform-development.md` and project-specific expectations in `DESIGN.md` or `QUALITY.md` only when those artifacts are justified.

## User feedback collection

Use the lightest mechanism capable of answering the current question: interview, support email, feedback form, in-product prompt, store review workflow, or another justified channel.

Feedback tooling SHOULD avoid unnecessary sensitive data and preserve only enough context to distinguish product pain, confusion, and software defects when useful.

Do not build a large feedback platform before feedback volume/synthesis cost justifies it.

## Privacy readiness

When personal or sensitive data is processed, document actual software behavior before finalizing policy text.

At minimum identify as applicable:

- data categories and purposes,
- authoritative stores,
- processors/third parties,
- analytics/support use,
- retention/deletion,
- cross-border processing where relevant,
- access/security controls,
- backup/replay/import implications.

A privacy policy SHOULD describe reality rather than a generic aspirational template.

Consent-management infrastructure is conditional: implement it when the actual jurisdiction, platform, tracking technology, or product behavior requires consent or user choice.

Do not accept legal text solely because an AI or template generated it.

## Account deletion and data lifecycle

Where user accounts/data can be deleted or closed, define the behavior across relevant systems:

- primary application data,
- billing records that must legitimately be retained,
- analytics identifiers,
- support records,
- external-provider tokens,
- scheduled/background work,
- shared/team resources,
- backups,
- downstream processors/integrations.

Deletion behavior SHOULD be testable where failure would materially violate the product's promise or obligation.

If deleted data can reappear through restore, replay, sync, re-import, or rebuilt derived state, preserve deletion intent or define the accepted exception explicitly.

## Legal/commercial review triggers

Before public/paid release or material behavior changes, evaluate whether actual product facts trigger review for items such as:

- Privacy Policy,
- Terms of Service,
- commercial-law disclosures,
- subscription/renewal/cancellation/refund disclosures,
- age restrictions,
- acceptable-use restrictions,
- tracking/consent requirements,
- distribution/store declarations.

The engineering blueprint owns the trigger and consistency between product behavior and disclosures. It does not provide universal legal text.

## Business/control-plane continuity

Payment, email/notification, analytics, support, domain/DNS, store/developer, and other product-operation systems can become production dependencies.

Not every dependency needs redundancy. Decide from user impact, provider maturity, recoverability, and cost.

Critical renewals, credentials, signing identities, domains, or provider deadlines that can stop production/revenue SHOULD have an ownership/recovery path rather than depend on undocumented memory. See `production-readiness.md` for solo-operated control-plane recovery.

## Stage-based adoption

### Prototype

Usually omit complex analytics, marketing machinery, ticketing, compliance tooling, and accessibility process unless they are required to test the hypothesis or target users.

### Private beta

Usually add:

- critical product measurement with clear semantics,
- simple support channel,
- privacy disclosure consistent with real data handling,
- transactional communication if required,
- basic accessibility checks on the critical flow where relevant.

### Public free

Usually require:

- support path,
- stable enough analytics semantics for real decisions,
- account/data lifecycle behavior,
- applicable legal/privacy interfaces,
- reliable critical notifications,
- explicit accessibility expectations for important public flows.

### Paid production

Also apply `monetization-engineering.md`; ensure support, product access, communication, cancellation/refund behavior, and disclosures agree with the actual commercial system.

### Growth

Add richer cohorts/experimentation, support automation, warehouse/BI, broader accessibility coverage, or formal customer-operations tooling only when scale and decision value justify the lifecycle cost.

## Decision rule

Add product-operations engineering when one of these becomes true:

- users need it to receive/use the product safely,
- an accepted business model requires software support,
- a legal/privacy/platform obligation requires product behavior,
- the team needs it to make a real product decision,
- operational risk without it becomes material.

The objective is sustainable product operation with minimum justified complexity—not recreating a mature SaaS organization around a product that has not earned it.

Current primary sources and time-sensitive regulatory/provider notes belong in `references.md`.
