# Lunowa Knowledge Continuity System

## Purpose and scope

This continuity layer helps a fresh session recover the decision-relevant Lunowa project state from durable repository and GitHub sources without relying on prior chat history. It is navigation and checkpoint infrastructure, not a second product, architecture, decision, or session-history knowledge base.

It preserves decision continuity, not conversation transcripts or private reasoning. This stable contract should change rarely; mutable project checkpoint information belongs in `CURRENT.md`.

## Knowledge classes and authority boundaries

| Knowledge class | Role | Authority rule |
| --- | --- | --- |
| Canonical knowledge | Accepted product, design, domain, architecture, contract, decision, and external-fact knowledge | The artifact authoritative for the question remains normative. |
| Navigation / checkpoint state | `AGENTS.md`, `CURRENT.md`, and `KNOWLEDGE-MAP.md` | Routes readers to authority and may summarize only what is needed to resume safely. |
| Live execution state | GitHub Issues, PRs, reviews, labels, CI, and review queues | Query GitHub when current task/review state matters; do not maintain a duplicate backlog here. |
| Reusable upstream baseline | `miki-thecat/software-engineering-blueprint` and local adoption metadata | `BLUEPRINT-ADOPTION.md` records local adoption/divergence; it never overrides Lunowa product/domain authority. |
| Transient reasoning / execution context | Chats, Codex sessions, private reasoning, routine debugging | Useful context, but never the sole record of a material accepted decision or required dependency after checkpointing. |

Authority is determined by the question, not by a universal total-order precedence rule. Code, schema, tests, and runtime evidence establish what actually happens; accepted canonical documentation establishes what behavior is intended. GitHub Issues state the requested change, and PR/CI evidence states live review/execution status. Current external/provider facts require their authoritative live source.

## Promotion and bounded duplication

Use one-way promotion:

```text
transient discussion or research
  -> classify decision-relevant change
  -> promote it to the artifact authoritative for that question
  -> update navigation/checkpoint only if routing or current state changed
```

Promote only information whose loss could materially cause a wrong decision, repeated costly research, violation of a durable constraint, incorrect dependency ordering, or loss of necessary evidence/rationale. Keep ordinary brainstorming, discarded wording, transient debugging, and recoverable conversation detail transient.

Navigation may point to authority; canonical artifacts must not depend on continuity summaries to reconstruct their meaning. Concise duplication is permitted only when it is necessary to resume safely. If changing a canonical rule routinely requires matching substantive edits here, move the detail back to the canonical artifact and leave a pointer.

When accepted knowledge changes, update the current normative artifact first. Record a supersession only where a future reader could otherwise repeat an old decision or misread evidence. `CURRENT.md` may note only recent, material supersessions affecting bootstrap; it is not a changelog.

## Freshness, updates, and conflict handling

- Keep `CURRENT.md` small, dated, and interpretable with repository candidate state and whether live GitHub was checked.
- Update `KNOWLEDGE-MAP.md` when a routing or authority boundary changes.
- Update `BLUEPRINT-ADOPTION.md` only after an applicability review changes local adoption metadata.
- Use repository-relative paths and stable GitHub Issue/PR identifiers; do not rely on ephemeral chat links, local paths, or hidden model state.
- Do not introduce a global status enum. Status vocabulary is scoped to the owning artifact or system.

If a navigation artifact is stale, contradictory, or incomplete: identify the question, consult `KNOWLEDGE-MAP.md`, inspect the source authoritative for that question, check live/current evidence when freshness matters, and surface any unresolved material conflict rather than guessing. Repair the stale navigation/checkpoint artifact in the same accepted change when appropriate. A checkpoint never outranks its canonical source or live GitHub state.

## Fresh-session bootstrap

Use a selective bootstrap; do not load the entire repository or Blueprint by default:

```text
AGENTS.md
  -> this README
  -> CURRENT.md + KNOWLEDGE-MAP.md
  -> current GitHub Issue / PR / review queue state
  -> only the canonical sources relevant to the decision
  -> code, tests, or runtime evidence when implementation state matters
  -> BLUEPRINT-ADOPTION.md only when reusable-baseline drift matters
```

A later bootstrap evaluation is successful only if a fresh AI context with repository/GitHub access can identify authoritative project state, unresolved material blockers, relevant canonical sources, and the correct next action without hidden memory. It should also test stale or contradictory checkpoint cases.

## Session-close or phase-checkpoint promotion

Before closing a material session or phase, ask whether any of these changed: accepted fact/evidence, durable decision, material assumption/hypothesis, consequential rejection/supersession, blocker/dependency/next decision, or canonical-document freshness. Promote the result to its proper canonical artifact first. Then update `CURRENT.md` only when checkpoint or routing information changed.

Do not dump transcripts, create dated handoff trees, or backfill a research archive. Add automation or another knowledge system only after real usage shows recurring drift or burden that this small structure cannot address.

## Forbidden duplication

The continuity layer must not become:

- a duplicate product, architecture, contract, or decision source of truth;
- a manually maintained Issue/PR backlog or CI ledger;
- a chat, session, or reasoning archive;
- a Responsibility research/conclusion store;
- a copied Blueprint handbook or automatic synchronization mechanism; or
- a circular authority system in which canonical documents depend on continuity summaries.
