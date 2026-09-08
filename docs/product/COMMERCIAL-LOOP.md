# Lunowa Commercial Loop

Status: canonical Product-level commercial operating contract.

This document defines how Lunowa connects Product evidence, acquisition, activation, retention, monetization, and unit economics. It does **not** declare the current ICP, price, packaging, acquisition channel, WTP, retention, PMF, CAC, LTV, or profitability as proven.

`docs/product/PRODUCT.md` remains the highest-level Product authority. `docs/monetization-engineering.md` remains the reusable engineering baseline for billing, entitlement, usage, and financial-state correctness once those risks actually exist.

## 1. Objective

Lunowa development must optimize for a complete commercial learning loop rather than feature completion alone:

```text
real problem / reachable segment
-> acquisition
-> credible Product exposure
-> activation through real delegated monitoring
-> repeated value / reduced parallel self-monitoring
-> retention / dependency behavior
-> value-exposed WTP and packaging evidence
-> payment when justified
-> sustainable unit economics
-> Product / positioning / channel decisions
-> repeat
```

Implementation completion, green CI, visual polish, waitlist count, sign-up count, and feature breadth are not substitutes for later arrows in this loop.

## 2. Authority boundaries

### 2.1 Product / commercial authority — `miki-labs/lunowa`

This repository owns:

- Product/problem hypotheses and accepted Product semantics;
- candidate segment / ICP evidence status;
- activation and repeated-value definitions;
- pricing, packaging and WTP hypotheses/decisions;
- entitlement and usage-policy requirements when monetization exists;
- Product telemetry semantics needed to judge delegation, reliability, retention and economics;
- variable-cost safety requirements;
- commercial experiment conclusions that may change Product scope or execution order.

### 2.2 Marketing/acquisition implementation — `miki-labs/lunowa-site`

The site repository owns:

- public/preview marketing implementation;
- acquisition landing surfaces and truthful claims;
- campaign/source attribution implemented on the site;
- CTA and early-access/waitlist behavior;
- conversion instrumentation implemented on the marketing surface;
- SEO, public analytics, preview and production web deployment.

The site may project accepted Product/commercial truth. It must not manufacture ICP, pricing, WTP, customer, validation, availability, security, reliability, or performance claims.

### 2.3 Protected research / lead data

Public GitHub is not the CRM or participant database.

PII, contact details, row-level participant/lead records, protected research notes and consent/administrative mappings belong in explicitly protected stores appropriate to their purpose and retention policy. Public GitHub contains disclosure-safe protocols, contracts, aggregate findings, task state and decisions only.

### 2.4 ACP

`miki-labs/agent-control-plane` owns execution/recovery infrastructure only. It does not own market hypotheses, pricing, Product metrics, lead state, revenue state or commercial decisions. Do not build a second Business Control Plane inside ACP.

## 3. Evidence ladder

Do not infer a later stage from an earlier one.

| Stage | Question | Minimum credible evidence | What it does **not** prove |
| --- | --- | --- | --- |
| C0 Problem / reachability | Does a reachable coherent cohort have recurring costly under-served monitoring burden? | recent real workflow reconstruction, current workaround evidence, disconfirming cases | solution fit, WTP, PMF |
| C1 Mechanism | Can the Lunowa mechanism improve reconstruction/control for relevant loops? | bounded mechanism/prototype evidence against real baseline | sustained trust, retention |
| C2 Acquisition | Can we repeatedly reach candidate users through a channel? | attributable qualified visits/leads or direct recruitment yield by channel | activation, WTP |
| C3 Activation | Do users delegate real eligible loops and reach first credible value? | real delegated loops with accepted monitoring/resurfacing outcome | repeated reliance, retention |
| C4 Repeated value | Do users delegate again and reduce parallel self-monitoring/scaffolding? | repeated delegation across days/weeks, fallback/self-check evidence | payment intent or long-term retention |
| C5 WTP / packaging | After credible value exposure, will users accept a concrete commercial offer? | value-exposed price/packaging test, preferably behavioral commitment rather than hypothetical preference alone | durable paid retention |
| C6 Paid | Can money, entitlement and support state remain correct? | real/sandbox payment path appropriate to stage, reconciliation/support evidence | positive unit economics or PMF |
| C7 Retention / economics | Does paid/repeated value persist and remain economically viable? | cohort retention/churn reasons + variable-cost attribution + contribution margin | scalable channel economics until acquisition is measured |
| C8 Scale | Can an acquisition channel grow without destroying quality/economics? | repeatable channel, conversion, retention and cost evidence | permanence; continue monitoring |

The cheapest experiment capable of falsifying the highest-impact unresolved assumption wins over broader implementation.

## 4. Current durable anchors

Reuse existing authorities/tasks rather than duplicating them:

- Product Discovery **Issue #36** owns the current Problem/ICP gate.
- Product mechanism/validation work remains under its existing Product Issues and accepted dependencies.
- `miki-labs/lunowa-site` **Issue #8** owns the minimal secure early-access boundary.
- `miki-labs/lunowa-site` **Issue #9** owns release/preview acceptance for the marketing site.
- `docs/monetization-engineering.md` applies when Lunowa actually introduces paid state, entitlement, usage limits or economically dangerous variable-cost behavior.

Issue existence is planning inventory, not automatic execution authority. Live task/dependency state must still be checked.

## 5. Commercial funnel and identity boundary

The smallest useful cross-surface lifecycle is:

```text
attributable visitor / recruited lead
-> CTA or research interest
-> waitlist / qualified lead
-> beta invited
-> Product account
-> activated
-> repeated delegation
-> commercial offer exposed
-> paid
-> retained / churned
```

Do not force all of these states into one database prematurely.

At early stages, use the smallest join keys and protected administrative process needed to reconcile evidence. Once Product accounts exist, prefer stable internal Product/account identifiers for Product telemetry and billing. Marketing identifiers, email addresses, provider identities and Product account IDs are distinct concepts and must not be casually collapsed.

## 6. Minimum commercial measurements

### 6.1 Acquisition

When public or campaign traffic exists, measure only what supports a decision:

- source / campaign / landing context where attributable and privacy-appropriate;
- qualified visit or lead volume by channel;
- CTA and early-access conversion;
- recruitment response / interview yield for direct channels;
- obvious low-quality/bot traffic separately from meaningful prospects.

Do not add a product-analytics platform merely to collect page-view volume already available from simpler infrastructure.

### 6.2 Activation

A generic login is not Lunowa activation.

Candidate activation evidence should be based on the earliest real Product value event, such as a user safely delegating an eligible real monitoring loop and receiving a credible outcome. Exact activation criteria remain empirical and must be frozen by a later task using real beta evidence.

### 6.3 Repeated value / retention

Prefer Product-specific behavioral evidence over vanity engagement:

- number of real loops delegated;
- repeated delegation after prior outcomes;
- class-scoped delegation expansion/contraction;
- correct resurfacing and material false negatives;
- unnecessary Review/resurfacing burden;
- parallel Inbox/Sent/source self-checks during delegated periods where measurable/ethically collectable;
- parallel reminders/tasks/manual scaffolding where captured through research or explicit Product interaction;
- repeated Managed inspection without material state change;
- recovery of trust after errors;
- churn, contraction and reason evidence.

DAU/MAU, sessions and email opens may be operational context but are not sufficient proof that Attention Delegation works.

### 6.4 WTP / pricing

Do not treat `Would you pay?` before credible value exposure as strong evidence.

A pricing/WTP experiment should, when justified:

- expose a concrete price/package to users who have experienced credible Product value;
- record actual choice/commitment where practical;
- preserve refusal and downgrade reasons;
- distinguish willingness to pay from willingness to depend on the Product;
- avoid silently turning one small sample into a universal pricing decision.

Price, free tier, packaging, billing interval and individual/business packaging remain `UNKNOWN` until accepted evidence closes them.

### 6.5 Revenue / retention

When real payment exists, measure:

- trial/offer -> paid conversion where applicable;
- paid cohort retention / cancellation / payment-failure states;
- downgrade/refund/dispute reasons where applicable;
- revenue state reconciled to authoritative provider state;
- support burden caused by commercial-state failures.

Do not use booked/attempted payment as a substitute for settled accepted commercial state.

## 7. Unit economics for an AI Product

Lunowa must be able to answer whether repeated Product value can be delivered economically.

At minimum, once real beta usage makes the data meaningful, attribute variable costs at the smallest practical safe level for decisions:

```text
AI/model cost
+ provider/API variable cost
+ variable compute/jobs/storage
+ payment fees when paid
+ directly attributable messaging/email/support tooling where material
= variable delivery cost
```

Useful decision views may include:

- variable cost per active user;
- variable cost per successfully delegated loop;
- variable cost per retained paid user;
- revenue per paid user;
- contribution margin before fixed founder/development cost;
- abnormal users/workflows that create disproportionate cost.

Do not invent CAC, LTV or margin targets before there is sufficient real data. Do establish hard economic containment before public exposure if an action can create material runaway AI/provider cost.

## 8. Stage-gated infrastructure

### C0–C1: discovery / mechanism

Use:

- GitHub contracts and disclosure-safe findings;
- protected research/admin store;
- existing Product prototypes and deterministic evidence.

Do **not** require Stripe, CRM, warehouse, analytics SDK, billing domain or growth automation.

### C2: acquisition / site

Use the smallest site stack that can answer acquisition questions:

- privacy-light traffic/performance analytics;
- first-party source/campaign attribution where needed;
- secure early-access endpoint when the CTA is real;
- protected lead/admin handling outside public GitHub.

Do not add a heavyweight CRM until lead count/process complexity creates measurable coordination loss.

### C3–C4: private beta / repeated value

Add only Product telemetry needed to establish activation, delegation quality, reliability, repeated use and variable cost. Prefer first-party domain events/metrics over a generic event firehose.

Telemetry must avoid copying sensitive mailbox content merely for analytics. Event names/fields must be reviewed against privacy/security/data-minimization boundaries.

### C5: value-exposed pricing/WTP

Add experiment support only as needed to present and record concrete offers. A fake door or manual commercial conversation may be stronger and cheaper than building billing.

### C6: first payment

Only now introduce a mature hosted/tokenized payment rail appropriate to the current distribution channel and current platform rules. Apply `docs/monetization-engineering.md` for:

- payment/subscription/entitlement separation;
- verified asynchronous events;
- idempotency;
- reconciliation;
- cancellation/refund/payment-failure semantics;
- support/remediation;
- revenue-critical observability.

Do not implement raw card processing or custom commodity billing machinery.

### C7–C8: retention / scale

Add cohort reporting, stronger cost attribution, deeper acquisition measurement, CRM/support automation, warehouse/BI or experimentation infrastructure only when current traffic/revenue/decision latency justifies the operational surface.

## 9. Decision rules

A commercial task should state:

1. the unresolved assumption;
2. evidence class needed to change the decision;
3. cheapest credible falsification;
4. current baseline/competitor/workaround;
5. pass/revise/stop decision;
6. what remains unknown;
7. whether the result changes Product, site, pricing, channel, or execution priority.

Negative evidence is a valid Product result. Do not force a positive disposition to justify prior implementation investment.

## 10. Review questions for future work

Before implementing a feature, acquisition mechanism, pricing flow or commercial tool, ask:

- Which commercial/evidence-stage question does this answer?
- Is there a cheaper non-code experiment?
- Is this Product behavior, site behavior, protected research/admin data, or execution infrastructure?
- What decision will the collected metric change?
- Does collection require sensitive mail/identity data that can be avoided?
- Does this create material variable cost or money/entitlement risk?
- Is an existing platform capability sufficient?
- What is the deletion/exit path if the hypothesis fails?

If the work has no credible answer, it is probably premature infrastructure or feature volume rather than commercial progress.

## 11. Current unknowns preserved

This contract does not change the Product's current empirical status. Unless later accepted evidence says otherwise, these remain unknown/hypothesis-level:

- exact first ICP / segment;
- problem prevalence/severity;
- acquisition channel and repeatable reachability;
- landing message/conversion optimum;
- activation threshold;
- long-term monitoring relinquishment and retention;
- price, free tier, packaging and billing interval;
- WTP after credible value exposure;
- paid conversion / churn;
- CAC / LTV / payback;
- sustainable contribution margin;
- PMF.

## 12. Definition of commercial progress

Commercial progress is not `more features shipped`.

Progress means reducing decision-relevant uncertainty while preserving the ability to deliver a trustworthy Product:

```text
better evidence about who has the problem
+ better evidence that we can reach them
+ better evidence that Lunowa changes behavior
+ better evidence that value repeats
+ better evidence that users will pay
+ correct money/access state when payment begins
+ evidence that revenue exceeds variable delivery cost sufficiently to sustain the Product
```

The implementation lane and commercial evidence lane may proceed in parallel when authorized, but neither silently upgrades the other's evidence.