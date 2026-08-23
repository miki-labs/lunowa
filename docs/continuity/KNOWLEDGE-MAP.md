# Knowledge Map

This map routes a question to its authoritative source. It is navigation, not a substitute for the sources it names. Authority depends on the question; executable evidence that exposes stale documentation requires reconciliation rather than a silent redefinition of intended behavior.

| Question / knowledge class | Primary authority | Secondary/context source | Freshness/live rule | Notes |
| --- | --- | --- | --- | --- |
| Product vision / problem / audience hypothesis / differentiation / validation state | `docs/product/PRODUCT.md` | `docs/design/DESIGN.md`; durable decisions; current task Issue | Keep accepted product direction separate from hypotheses/needs-validation; re-check market/competitor/provider claims when freshness matters | This is the product-level “what/why/for whom” authority; detailed UX and domain semantics remain elsewhere. |
| Accepted UX / design behavior | `docs/design/DESIGN.md`, `INTERACTIONS.md`, and `RESPONSIVE.md` | `docs/product/PRODUCT.md`; applicable visual references; implementation tests | Inspect rendered behavior when actual UI state matters | Visual references are interpreted under their README; screenshots do not override current textual semantics. |
| Architecture and contracts | `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, and `CONTRACTS.md` | Relevant decisions and implementation evidence | Reconcile when executable evidence reveals stale docs | Architecture docs answer intended boundaries; code answers actual behavior. |
| Responsibility semantics / persistence / evals | `docs/product/responsibility/` canonical sources | ADRs 0008/0009 and implementation/proof evidence | Follow the current freeze/proof level and exact evidence; static review is not executable proof | Do not duplicate detailed Responsibility conclusions in continuity files. |
| Durable decision rationale | Applicable `docs/decisions/` record | Current canonical documentation and Git history | Record supersession where future interpretation needs it | Decision status belongs to the decision artifact. |
| Accepted technology / platform choices | `docs/product/TECH-STACK.md` and relevant ADRs | Official current provider/platform documentation | Recheck live external facts before time-sensitive activation | Accepted stack is not proof of current vendor behavior. |
| Current implementation sequence | `docs/product/IMPLEMENTATION-PLAN.md` | Current task Issue; product/design/domain constraints | Treat the plan as living execution state, not permanent product semantics | Bounded technical spikes do not silently reorder product validation priorities. |
| Actual implementation / runtime behavior | Code, schema, migrations, tests, deployed/runtime evidence | Canonical intended behavior documentation | Prefer current executable/live evidence for actual-state questions | A mismatch does not automatically make either side correct; reconcile the stale artifact. |
| Current requested change | Current GitHub Issue | Relevant canonical constraints and code | Fetch live Issue state before acting | The Issue is task intent, not a copied durable specification. |
| Candidate change / review / evidence | GitHub PR, review threads, CI, and branch diff | Current Issue and canonical constraints | Query GitHub; do not duplicate review state in `CURRENT.md` | `agent:review-ready` means ready to inspect, never PASS. |
| Current project checkpoint | `docs/continuity/CURRENT.md` as navigation snapshot | Canonical sources and live GitHub state | Stale checkpoint loses to canonical/current evidence | Keep only material resume context. |
| Reusable Blueprint baseline / adoption | Upstream `miki-thecat/software-engineering-blueprint` plus `docs/continuity/BLUEPRINT-ADOPTION.md` | Local reusable baseline documents | Review applicability before adopting upstream change | Local product/domain sources remain authoritative for Lunowa. |
| Current external/provider/competitor facts | Authoritative external primary source, API, or live tool | Time-stamped local decision/evidence when relevant | Query current primary source when freshness matters | Do not copy volatile facts as timeless product truth. |

## Update lifecycle and duplication boundary

Update this map only when authority routing, a durable source location, or a freshness rule changes. Do not add current workstream inventory, detailed product semantics, a universal precedence order, or copied content from the sources above. Use repository-relative links and stable GitHub identifiers when links are needed.
