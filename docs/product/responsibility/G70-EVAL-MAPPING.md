# G70 AI evaluation mapping

Status: Issue #74 bounded implementation evidence. This manifest routes AI-layer checks to the accepted Responsibility and Product oracles; it does not replace those authorities and does not claim to prove reducer, Temporal, provider, authorization, or Send behavior.

## Oracle-first layers

| Layer | Evidence / oracle | Mechanical check owned here | Not claimed here |
| --- | --- | --- | --- |
| Context | authorized normalized message context | tenant/account/message scope, trusted source-zone spans, minimum draft context, untrusted-source framing, bounded payload, no raw-body run manifest | provider authorization or database query correctness |
| Structured interpretation | `T0-001/002`, `T0-009..044`, `PG-22/23/50/60` | version/revision/source IDs, source-zone/span/excerpt resolution, semantic shape, explicit ambiguity/abstention, no trusted authority fields | semantic accuracy beyond the executable candidate checks |
| Candidate boundary | ADR 0007; `src/server/responsibility/interpretation.ts` | candidate can derive only through existing trusted admission/reducer boundary; provider observations are not model evidence | accepted Responsibility persistence/reducer correctness |
| Draft assistance | `PG-29`, `PG-42`, `PG-45`, `PG-52` | editable body only, currentness, no sender/recipient/send fields, manual fallback remains available | G50 draft persistence or G51 provider Send |
| Data control | current execution-time OpenAI evidence | `store:false` is explicit in every request; no raw prompt/output logging; model/config, declared data-control mode, and run manifest are versioned | organization/project retention mode or ZDR eligibility, which require deployment evidence |
| Eval discipline | family-stratified development/holdout manifest | holdout families do not overlap development families | generalization or production quality from fixtures alone |

## Held-out families

The holdout contains independent families for claim-vs-observation, high-risk authority, cross-account isolation, genuine ambiguity, AI degradation, prompt injection, successful No Responsibility, high-risk draft assistance, and context-boundary draft behavior. Development examples are not reported as holdout evidence.

## Runtime boundary

The runtime records only the `AIInterpretationRun` manifest and status through the existing G30 substrate. A model result is rejected or degraded when it is malformed, unavailable, abstained, or based on stale evidence. A successful interpretation returns an untrusted candidate plus a deterministic derivation; it does not apply a privileged domain effect. A successful draft returns editable text plus a manual-fallback guarantee; it does not alter trusted route fields or send.
