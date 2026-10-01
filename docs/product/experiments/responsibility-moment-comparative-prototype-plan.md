# Responsibility / Moment Comparative Prototype Execution Plan

## Status

**PLANNING CANDIDATE — NOT IMPLEMENTATION AUTHORITY YET.**

This plan operationalizes GitHub Issues #26 and #28. It exists to make the next UI slice reviewable before write-heavy implementation begins. Product hypotheses, evidence classifications, and falsification rules remain owned by Issue #26; implementation scope remains owned by Issue #28.

Do not treat this file as evidence that H1–H4 are true.

## Goal

Build the smallest browser-verifiable fake-data prototype that can compare a competent conventional inbox workflow against Lunowa's Responsibility / Moment attention experience using the same realistic communication scenarios.

The prototype must retire product uncertainty, not maximize feature completeness.

## Fixed experiment contrast

```text
shared semantic scenarios
        |
        +--> baseline: competent inbox/thread workflow
        |
        +--> Lunowa: Responsibility projection + Moment preparation
```

The baseline must not be intentionally bad. The Lunowa condition must not rely on Gmail, Microsoft, auth, persistence, AI, or real send.

## Scenario contract

The first candidate includes seven deterministic scenario families:

- S1 `MY_TURN`: explicit material user action with source due date and evidence.
- S2 `WAITING`: user already acted; counterpart/event is next; no dominant current work CTA.
- S3 `LATER`: explicit user defer with truthful return condition; distinct from Waiting.
- S4 `REVIEW`: decision-critical uncertainty with minimal safe next decision and source evidence.
- S5 `DONE`: resolved work with truthful resolution evidence and quiet hierarchy.
- S6 multiple Responsibilities: one Conversation, at least three Responsibility-shaped items, one primary Moment, mixed projections.
- S7 cross-account pressure: at least two fake accounts/scopes; unified attention with explicit account/sender/provenance boundaries and no semantic auto-merge.

Every scenario must use realistic Japanese operational-email content and the same underlying evidence in both experiment conditions.

## Minimal fixture boundary

Use typed fake data only. A scenario should expose only experiment-relevant fields:

```text
Scenario
  id
  title
  accounts/scopes[]
  conversation
    id
    topic/subject
    messages[]
    attachments[]
  responsibilities[]
    id
    projection: MY_TURN | WAITING | LATER | DONE | REVIEW
    label
    currentQuestion
    currentOutcome / obligation
    timing / waiting / return context when relevant
    primarySafeAction? 
    provenanceRefs[]
  primaryResponsibilityId?
```

This is a UI experiment model, not a persistence model. Do not introduce a persisted canonical lifecycle field or infer final SQL shape from it.

## Route and facilitator model

Default implementation target:

```text
/[locale]/prototype?mode=baseline&scenario=<id>
/[locale]/prototype?mode=lunowa&scenario=<id>
```

Equivalent bounded routing is acceptable if it is simpler in the existing Next.js structure.

Experiment-only mode/scenario controls must be visually separated from normal product navigation so participants do not mistake facilitator tooling for the Lunowa IA.

## Baseline condition

Required:

- recognizable inbox/list hierarchy;
- account/scope control when S7 requires it;
- chronological thread reading;
- sender/recipient/account/time/subject/body/attachment evidence;
- ordinary reply affordance where relevant;
- familiar unread/pin/time metadata may exist;
- no My Turn / Waiting / Later / Review preparation that would erase the experimental contrast.

The baseline should be competent enough that any Lunowa advantage comes from reduced reconstruction/decision work rather than sabotage.

## Lunowa condition

### Desktop shell

```text
Sidebar | Conversation List | Detail
```

### Interaction invariants

- row body -> `会話`;
- projection/status chip -> `今の要点`;
- status chip keyboard focusable with accessible name;
- ordinary mail reading never gated by Moment.

### Conversation view

Show enough real-looking source communication for the participant to reconstruct the scenario if they choose to:

- sender / recipients / account identity;
- timestamps;
- message bodies;
- attachment treatment where applicable;
- restrained quoted-history treatment;
- deterministic, non-sending reply composer where useful.

### Moment view

Render only blocks relevant to the active projection. Typical order:

1. current question / projection;
2. primary obligation or outcome;
3. due / waiting / return condition;
4. one primary safe action when appropriate;
5. decision-critical Review explanation if applicable;
6. supporting context;
7. additional Responsibilities;
8. provenance/source disclosure.

S6 must preserve one visually primary Moment by default. Secondary Responsibilities can become active without flattening the Conversation into one lifecycle.

## Visual implementation boundary

Use current Markdown specifications as semantic authority and the committed visual references as implementation context.

Required global references:

- `00-brand-system.png`
- `01-component-system.png`
- `02-desktop-conversation-default.png`

Use only the relevant state references `03`–`08` and account reference `14` for this slice.

Do not implement generated screenshot accidents or obsolete lifecycle terminology.

## Reuse-first boundary

Before adding custom infrastructure:

1. inspect existing Next.js / React / Tailwind / next-intl bootstrap;
2. reuse current framework primitives and accepted design direction;
3. add only thin reusable UI components needed by the experiment;
4. do not introduce auth/database/provider/AI state-management architecture;
5. do not install a large dependency solely to reproduce a small presentational behavior.

## Implementation stages

### Stage A — fixture + route skeleton

- typed S1–S7 fixtures;
- deterministic route/query selection;
- same fixture evidence shared by baseline and Lunowa;
- tests that all scenario ids/modes resolve.

### Stage B — competent baseline

- inbox/list/thread shell sufficient for all scenarios;
- account boundary where relevant;
- no Lunowa semantic preparation.

### Stage C — Lunowa shell + interaction primitives

- sidebar / list / detail;
- row/chip click split;
- `会話` / `今の要点` tabs;
- projection chips;
- source/provenance disclosure;
- account identity.

### Stage D — Moment variants

- My Turn;
- Waiting;
- Later;
- Review;
- Done;
- multiple Responsibilities / secondary selection;
- cross-account pressure.

### Stage E — compact-layout sanity

- wide desktop around 1440 CSS px as primary target;
- one 800–1000px sanity target;
- no destructive loss of selected scenario/view/draft-like local state during ordinary resizing.

Do not expand into full mobile parity.

## Required tests before browser review

At minimum:

- fixture completeness / valid primary Responsibility reference;
- baseline and Lunowa use the same scenario source data;
- row click -> conversation view;
- chip click -> Moment view;
- projection rendering for all five projections;
- S6 one-primary-Moment default and secondary selection;
- S7 account/source identity is explicit;
- ordinary source reading works without AI/provider/runtime.

## Browser / visual evidence gate

An exact implementation candidate must be run in the browser and inspected, not merely built.

Evidence must cover:

- both modes for representative identical scenarios;
- deterministic reachability of S1–S7;
- row/chip semantics;
- each projection hierarchy;
- Review evidence disclosure;
- S6 one-primary-Moment behavior;
- S7 account/sender identity;
- keyboard focus for chips/tabs/primary controls;
- wide + compact viewport sanity;
- visual comparison to the relevant committed references.

## Mechanical gate

On the exact candidate head:

```text
Node 24
pnpm install --frozen-lockfile
pnpm verify
git diff --check origin/main...HEAD
GitHub Verify
GitHub E2E Smoke
```

No result may be reused after head changes.

## Product-evidence boundary

Implementation PASS means only: **the experiment is executable**.

It does not establish H1–H4. After integration, Issue #26 owns participant/scenario evidence and must separately record:

- baseline vs Lunowa observations;
- `T_action`, `N_reread`, `N_nav`, `N_transfer`, `Source_recheck`;
- correctness and trust/control observations;
- evidence quality (`DIRECT OBSERVED`, `SELF-REPORT`, `PROXY`, `INFERENCE`, `UNKNOWN`);
- H1–H4 disposition;
- next cheapest falsification experiment.

## Stop conditions

Stop instead of broadening scope if:

- a required behavior conflicts with current canonical Product/design/Responsibility sources;
- fixtures require inventing new canonical semantics;
- the baseline becomes artificially weak;
- Gmail/Auth/DB/AI/real-send work appears without a direct experiment need;
- visual polish consumes effort without improving the contrast being tested;
- implementation grows beyond a bounded prototype and should be decomposed;
- source/provenance/account boundaries cannot be represented without architectural invention.

## Parallelism / integration policy

Write-heavy UI work should have one owner/candidate branch for this slice. Parallel work may be used for read-only Blueprint analysis, fixture review, or independent verification, but avoid multiple agents concurrently editing the same UI/component surface or execution-policy files.

If Issue #21 changes execution/harness semantics while this prototype is in flight, do not silently rebase the candidate mid-review. Re-evaluate applicability at a deliberate integration boundary.

## Completion definition

The prototype implementation is complete only when:

- exact candidate scope is bounded;
- S1–S7 are deterministic and browser-verifiable;
- baseline and Lunowa share evidence;
- interaction invariants hold;
- all five projections are represented without a canonical lifecycle regression;
- one-primary-Moment behavior holds under S6;
- account/provenance boundaries hold under S7;
- no forbidden integration breadth entered;
- mechanical + browser + visual gates pass on the exact head;
- independent Product/interaction-fidelity review is durably recorded.

Merge remains explicitly human-authorized.