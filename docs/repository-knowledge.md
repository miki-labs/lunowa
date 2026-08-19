# Repository Knowledge and Source-of-Truth Architecture

Humans, planning assistants, and coding agents need durable knowledge that survives chat sessions, model changes, contributor turnover, and long-running implementation work.

The durable layer is the **Git repository and the versioned artifacts it contains**, not a particular hosting vendor and not an agent's hidden memory. GitHub is a useful collaboration host, but the architecture should remain portable.

The goal is not to preserve every conversation. It is to preserve the smallest set of current knowledge required to make correct future decisions.

## What belongs in durable repository knowledge

Use this promotion rule:

`discussion / research -> validated or accepted knowledge -> repository artifact`

Do not copy entire chats, meeting transcripts, research dumps, or agent reasoning into the repository by default.

Information often worth promoting includes:

- accepted product behavior and important non-goals,
- stable UX/product principles that constrain implementation,
- architecture boundaries and invariants,
- security/privacy constraints,
- public API, schema, event, and data contracts,
- durable dependency/platform decisions,
- non-obvious rejected alternatives whose rationale will matter later,
- acceptance criteria for durable feature behavior,
- active implementation plans for complex or long-running work.

Information usually not worth promoting includes:

- raw brainstorming,
- abandoned ideas with no future relevance,
- transient debugging chatter,
- implementation details obvious from nearby code,
- copied external facts that can be queried authoritatively when needed,
- speculative rules for failure modes that do not justify their maintenance cost.

## `AGENTS.md` is a map, not the knowledge base

Keep root agent instructions concise and high signal. They should point to canonical commands, a repository map, high-value global constraints, and deeper project-local sources of truth.

Do not turn `AGENTS.md` into a complete product, architecture, security, workflow, platform, and operations manual. Large monolithic instruction files consume context, become stale, create conflicts, and make priority ambiguous.

Use narrower path- or component-specific instructions only when the agent/tool supports them and the repository genuinely has local rules that should not burden every task. Do not depend on one vendor's exact instruction-discovery algorithm as a portable architectural invariant.

## Start with the minimum knowledge structure

Do not create a documentation tree merely because a template exists.

A prototype may need only:

```text
README.md
AGENTS.md        # when coding agents are used
```

A non-trivial product moving toward production often benefits from:

```text
AGENTS.md

docs/
  PRODUCT.md
  ARCHITECTURE.md
```

Add the following only when they solve a real coordination or correctness problem:

```text
docs/
  DESIGN.md              # durable UI/interaction rules
  QUALITY.md             # project-specific verification contract
  specs/                 # durable feature behavior
  decisions/             # durable rationale
  plans/active/          # complex active execution
  plans/completed/       # only completed plans worth retaining
```

Small libraries, CLIs, research code, prototypes, or highly conventional products may need less.

## Roles of common artifacts

### `PRODUCT.md`

Use for durable product intent that constrains engineering:

- target user/actor,
- problem and jobs to be done,
- value proposition,
- product principles,
- major user flows,
- current scope/non-goals,
- validated facts versus assumptions/hypotheses,
- material product risks that change what should be built.

It is an accepted engineering-facing snapshot, not the entire customer-discovery, competitive-research, growth, or backlog system.

### `DESIGN.md`

Use only when durable UX/interaction guidance materially helps implementation:

- primary flows and information architecture,
- interaction principles,
- responsive behavior,
- loading/empty/error/success states,
- accessibility expectations,
- component/design-system strategy.

Feature-specific behavior should move to a feature spec when it becomes too detailed for the overview. External design tools may remain authoritative for visual artifacts; avoid duplicating volatile details unnecessarily.

### `ARCHITECTURE.md`

Use for the current system model and stable technical constraints:

- components and responsibilities,
- ownership and dependency direction,
- data flow/persistence boundaries,
- APIs/contracts,
- authentication/authorization boundaries,
- external integrations,
- trust boundaries,
- architectural invariants,
- current technology choices that materially constrain implementation,
- links to relevant decision records.

Prefer invariants that can eventually be enforced mechanically.

### `QUALITY.md`

Use when the project needs a local verification contract beyond a simple canonical `verify` command and the reusable blueprint defaults.

It may define:

- canonical verification command/path,
- test strategy,
- change-type-specific verification,
- runtime/browser/device expectations,
- security/reliability/performance checks,
- completion evidence.

Do not duplicate generic blueprint text.

### Feature specs

A feature spec describes **current intended durable behavior**. It is not a task ticket or implementation plan.

Use one when behavior is complex enough that code/tests alone do not make intent easy to recover. Keep acceptance criteria observable and update the spec when accepted behavior changes materially.

### Decision records

Use decision records for choices that are long-lived, expensive to reverse, architecture/security significant, or likely to be misunderstood later. Do not record every local implementation choice.

### Plans

Use plans for complex, cross-cutting, risky, or long-running work. Plans are living execution artifacts, not permanent product specifications.

Keep the active set small. Retain completed plans only when their historical context remains valuable; otherwise rely on Git history and durable current docs.

## Specs, tasks, plans, decisions, and code answer different questions

Do not use one artifact type as a universal source of truth.

- **Product/feature spec** — what behavior is currently intended?
- **Task/issue** — what change is currently requested?
- **Implementation plan** — how will a non-trivial change be executed?
- **Decision record** — why was a durable choice made?
- **Code/schema/migrations/tests/runtime evidence** — what is actually implemented or happening now?
- **External primary source/API** — what is currently true outside the repository?

An issue should reference the relevant durable sources rather than copy them wholesale.

## Authority is determined by the question, not one total ranking

A universal precedence list is unsafe because different artifacts are authoritative for different questions.

Use this default authority model:

| Question | Primary authority |
| --- | --- |
| What should the user/system behavior be? | Current accepted product/feature spec and explicit product-owner decision |
| What architecture/security/privacy constraints apply? | Current accepted architecture/security artifacts and durable decisions |
| What does the system actually do now? | Current code, schemas, migrations, tests, deployed/runtime evidence |
| What change is requested now? | Current task contract/issue, interpreted against stronger durable constraints |
| Why was a durable choice made? | Accepted decision record and relevant history |
| What is currently true about a provider, law, platform, price, API, or external system? | Current primary external source or authoritative live API/tool |

Executable artifacts may reveal that documentation is stale; they do not automatically redefine intended product behavior. Likewise, a stale spec does not make contradictory runtime behavior correct.

## Conflict rule

Agents and humans MUST NOT silently resolve a material conflict when the resolution changes product behavior, architecture, security/privacy, data integrity, platform compatibility, commercial correctness, or another high-impact constraint.

Instead:

1. identify the question being answered and which artifact type should be authoritative for that question,
2. inspect current repository state, dates/status, history, and runtime evidence where relevant,
3. identify the likely stale or incorrect artifact when evidence is strong,
4. reconcile the artifacts in the same change when the correct state is known,
5. stop/escalate when the correct state cannot be determined safely.

Do not use a mechanical total-order rule to paper over a semantic conflict.

## Knowledge status and lifecycle

Add explicit metadata only when it changes interpretation. Useful fields may include:

- `Status`: Draft / Hypothesis / Needs Validation / Accepted / Deprecated / Superseded / Rejected,
- `Last validated`: for time-sensitive external assumptions,
- `Supersedes` / `Superseded by`: when history would otherwise be ambiguous.

Do not require front matter, owners, review dates, or status fields on every file merely for uniformity.

For external research that can become stale, record the checked date and primary source when the fact materially constrains an accepted decision.

## Documentation changes travel with durable behavior changes

Code and durable documentation SHOULD evolve together.

Update repository knowledge in the same change when implementation materially modifies:

- accepted user-visible behavior,
- public interfaces/contracts,
- architecture boundaries or invariants,
- data ownership/model semantics,
- security/privacy model,
- supported platform behavior,
- operational/reliability requirements,
- accepted technical/product decisions.

Documentation updates are normally unnecessary for behavior-preserving refactors, local renames, formatting, or implementation details that do not change durable knowledge.

## Retrieval: files and search first

For a small or medium repository, prefer versioned files plus repository search before adding a dedicated memory platform.

A useful retrieval path is:

`AGENTS.md -> repository map -> targeted search/grep -> relevant durable artifact -> code/tests/runtime evidence`

This is inspectable, versioned with the product, portable across coding agents, and cheap to maintain.

Consider semantic retrieval/RAG only after repository size or corpus shape causes demonstrated retrieval failures that ordinary navigation/search cannot solve economically.

A vector index, embedding store, or knowledge graph is a **rebuildable retrieval index, not an authority**. Retrieved claims should resolve back to an authoritative versioned or live source.

## External and live knowledge

Not all knowledge belongs in Git.

Use MCP, an API, or an equivalent live integration when authoritative context:

- changes frequently,
- belongs to an external system,
- should not be copied into the repository,
- must be queried at execution time.

Examples include current analytics, issue trackers, design artifacts, monitoring, production state, provider dashboards, and frequently changing vendor documentation.

A live tool result is not automatically accepted durable knowledge. Promote only the stable decision, invariant, or requirement derived from it when future work needs that knowledge.

## Agent memory is not authoritative

Model memory, local agent memory stores, vector caches, conversation state, and hidden summaries may improve convenience, but MUST NOT be the only place a critical product, architecture, security, commercial, or operational constraint exists.

If losing the memory layer would make the repository unsafe to change, the important knowledge belongs in a durable inspectable source instead.

## Harness integration

For a non-trivial coding-agent task:

1. read the concise repository instructions,
2. identify and inspect only the source-of-truth artifacts relevant to the task,
3. inspect current code/tests before prescribing implementation,
4. plan when complexity or risk justifies it,
5. implement in small independently verifiable slices,
6. run the project-specific verification contract,
7. update durable knowledge when accepted behavior or constraints changed,
8. report evidence, assumptions, limitations, and anything not verified,
9. use an independent/fresh review context when the risk justifies it.

A reviewer SHOULD check both specification conformance and whether the requested approach itself creates regressions, security problems, architecture drift, unnecessary complexity, or conflict with stronger evidence.

## When to improve the knowledge system

Do not add infrastructure preemptively. Improve it when evidence shows recurring failure such as:

- agents repeatedly miss the same durable constraint,
- humans cannot determine which artifact answers a question,
- stale docs repeatedly cause incorrect implementation,
- related knowledge becomes difficult to locate,
- the same rationale is repeatedly reconstructed from chat/history,
- live external context requires repeated manual copy/paste.

Prefer the smallest intervention that fixes the observed failure: better navigation, a durable document, a decision record, mechanical enforcement, improved repository search, a live integration, or only then a specialized retrieval/memory layer.

## Template use

`templates/project-knowledge/` is a selective starter, not a mandatory tree. Copy only the artifacts that reduce a real coordination, implementation, review, or maintenance risk.

This blueprint remains the source of reusable defaults. Each product repository remains the system of record for that product's accepted behavior, current architecture, constraints, and durable decisions.
