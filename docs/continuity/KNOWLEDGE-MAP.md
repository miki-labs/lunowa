# Knowledge Map

This map routes a question to its authoritative source. It is navigation, not a substitute for the sources it names. Authority depends on the question; executable evidence that exposes stale documentation requires reconciliation rather than a silent redefinition of intended behavior.

| Question / knowledge class | Primary authority | Secondary/context source | Freshness/live rule | Notes |
| --- | --- | --- | --- | --- |
| Product intent / accepted behavior | Current accepted product and feature documentation | Durable decisions; task Issue for requested scope | Reconcile material conflict; Issue does not silently replace durable intent | Product-specific authority remains outside continuity docs. |
| UX / design behavior | `docs/design/` sources and applicable visual-reference rules | Product documentation; implementation tests | Inspect rendered behavior when actual UI state matters | Visual references are interpreted under their README. |
| Architecture and contracts | `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, and `CONTRACTS.md` | Relevant decisions and implementation evidence | Reconcile when executable evidence reveals stale docs | Architecture docs answer intended boundaries; code answers actual behavior. |
| Responsibility semantics / persistence / evals | `docs/product/responsibility/` canonical sources | Relevant ADRs and implementation/proof evidence | Follow current proof/evaluation evidence where applicable | Do not duplicate conclusions in continuity files. |
| Durable decision rationale | Applicable `docs/decisions/` record | Current canonical documentation and Git history | Record supersession where future interpretation needs it | Decision status belongs to the decision artifact. |
| Accepted technology / platform choices | `docs/product/TECH-STACK.md` and relevant ADRs | Official current provider/platform documentation | Recheck live external facts before time-sensitive activation | Accepted stack is not proof of current vendor behavior. |
| Actual implementation / runtime behavior | Code, schema, migrations, tests, deployed/runtime evidence | Canonical intended behavior documentation | Prefer current executable/live evidence for actual-state questions | A mismatch does not automatically make intent correct. |
| Current requested change | Current GitHub Issue | Relevant canonical constraints and code | Fetch live Issue state before acting | The Issue is task intent, not a copied durable specification. |
| Candidate change / review / evidence | GitHub PR, review threads, CI, and branch diff | Current Issue and canonical constraints | Query GitHub; do not duplicate review state in `CURRENT.md` | Review vocabulary remains GitHub-scoped. |
| Current project checkpoint | `docs/continuity/CURRENT.md` as navigation snapshot | Canonical sources and live GitHub state | Stale checkpoint loses to canonical/current evidence | Keep only material resume context. |
| Reusable Blueprint baseline / adoption | Upstream `miki-thecat/software-engineering-blueprint` plus `BLUEPRINT-ADOPTION.md` | Local reusable baseline documents | Review applicability before adopting upstream change | Local product/domain sources remain authoritative for Lunowa. |
| Current external/provider facts | Authoritative external source, API, or live tool | Time-stamped local decision/evidence when relevant | Query current primary source when freshness matters | Do not copy volatile facts as durable truth. |

## Update lifecycle and duplication boundary

Update this map only when authority routing, a durable source location, or a freshness rule changes. Do not add current workstream inventory, detailed product semantics, a universal precedence order, or copied content from the sources above. Use repository-relative links and stable GitHub identifiers when links are needed.
