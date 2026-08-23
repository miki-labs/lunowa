# Blueprint Adoption

This file is the durable record of Lunowa's relationship to the reusable upstream engineering baseline. It records reviewed local adoption and divergence; it does not synchronize automatically, override Lunowa product/domain authority, or serve as an upstream decision log.

## Adoption metadata

- Upstream repository: `miki-thecat/software-engineering-blueprint`
- Adopted revision: _Not populated by structure v0.1._
- Last reconciliation date/state: _Not populated by structure v0.1._
- Local adaptation policy: _Populate after a dedicated applicability/reconciliation review; upstream changes require review before adoption._

## Classification vocabulary

| Classification | Meaning |
| --- | --- |
| `MIRROR` | Intended to track upstream semantics closely; local differences are limited to mechanical or project-path adaptation. |
| `ADAPTED` | Upstream-derived and intentionally modified for Lunowa; record the local rationale and boundary. |
| `LUNOWA-OWNED` | Product-specific authority that must not be overwritten by Blueprint synchronization. |
| `NOT-ADOPTED` | Intentionally absent because current Lunowa risk does not justify it. |
| `NEEDS-REVIEW` | Adoption is unresolved or baseline drift has not been reconciled. |

These classifications apply only to Blueprint adoption. They are not a global project status vocabulary.

## Adoption mapping

| Upstream artifact/capability | Lunowa location | Classification | Adopted-from revision | Local rationale / divergence | Re-review trigger |
| --- | --- | --- | --- | --- | --- |
| _Populate in a dedicated baseline reconciliation task._ | _Repository-relative Lunowa path or intentionally absent._ | _Use the vocabulary above._ | _Pinned upstream revision._ | _Concise local boundary/rationale._ | _Upstream or local change that requires applicability review._ |

## Update lifecycle and boundaries

Populate this mapping only through a dedicated reconciliation/applicability review. Do not infer automatic synchronization from a matching path or copied history. A reusable lesson discovered in Lunowa may be proposed upstream separately, but this file records Lunowa's local decision only.

Keep mappings concise. Do not copy Blueprint prose, current Lunowa workstreams, product/domain semantics, or a chat/research history here. If a local product or domain source conflicts with an upstream baseline, the local canonical source remains authoritative for Lunowa behavior; surface and resolve material adoption ambiguity rather than silently overwriting local intent.
