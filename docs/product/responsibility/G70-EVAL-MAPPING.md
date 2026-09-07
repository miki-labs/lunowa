# G70 AI evaluation mapping

Status: Issue #74 bounded implementation evidence. This manifest routes AI-layer checks to the accepted Responsibility and Product oracles; it does not replace those authorities and does not claim to prove reducer, Temporal, provider, authorization, or Send behavior.

## Oracle-first layers

| Layer | Evidence / oracle | Mechanical check owned here | Not claimed here |
| --- | --- | --- | --- |
| Context | authorized normalized message context | tenant/account/message scope, trusted source-zone spans, minimum draft context, untrusted-source framing, bounded payload, no raw-body run manifest | provider authorization or database query correctness |
| Structured interpretation | the explicit `T0-001` through `T0-044` cases plus applicable `PG-22/23/42/43/45/46/47/50/52/60` cases in `G70_EVAL_CASES` | version/revision/source IDs, source-zone/span/excerpt resolution, communicated-claim vs trusted-observation separation, semantic shape, explicit ambiguity/abstention, no trusted authority fields | semantic accuracy beyond the executable candidate checks |
| Candidate boundary | ADR 0007; `src/server/responsibility/interpretation.ts` | candidate can derive only through existing trusted admission/reducer boundary; provider observations are not model evidence | accepted Responsibility persistence/reducer correctness |
| Draft assistance | `PG-29` plus independent `PG-42-DRAFT` / `PG-45-DRAFT` / `PG-52-DRAFT` holdouts and draft contract tests | editable body only, currentness, Japanese business/noise/high-risk handling, no sender/recipient/send fields, manual fallback remains available | G50 draft persistence or G51 provider Send |
| Data control | current execution-time OpenAI evidence | `store:false` is explicit in every request; no raw prompt/output logging; model/config, declared data-control mode, and run manifest are versioned | organization/project retention mode or ZDR eligibility, which require deployment evidence |
| Eval discipline | family-stratified development/holdout manifest | holdout families do not overlap development families | generalization or production quality from fixtures alone |

## Held-out families

The holdout contains independent families for claim-vs-observation, high-risk authority, cross-account isolation, genuine ambiguity, AI degradation, prompt injection, successful No Responsibility, high-risk draft assistance, and context-boundary draft behavior. Development examples are not reported as holdout evidence.

The executable fixture gate is `pnpm ai:eval:fixtures` (included by `pnpm verify`): it supplies an explicit canonical fixture for every declared interpretation and draft case, validates interpretation outputs through schema and runtime derivation (including cancellation, weak acknowledgement, high-risk understanding, and ANY_OF ambiguity), and applies the layer-owned oracle for each case. `pnpm ai:eval:acceptance` is also included by `pnpm verify`; it runs the official `pnpm ai:eval` lane when the API key, model/config version, and actual `OPENAI_DATA_CONTROL_MODE` are supplied, and is a required failure in CI when they are absent. Local verification reports that live evidence is `NOT_VERIFIED` when provider configuration is unavailable. The live lane uses the same canonical IDs, directions, source zones, scoped prior state, and independent Japanese noise/high-risk draft holdouts. `tests/ai-runtime.test.ts` independently binds the manifest to the explicit `T0-001`–`T0-044` plus applicable Golden Scenario IDs; runtime provider failure and draft manual fallback remain separate checks for PG-22/PG-29. This remains candidate-layer evidence only and does not claim reducer, scheduler, provider, or Send correctness.

## Runtime boundary

The runtime records only the `AIInterpretationRun` manifest and status through the existing G30 substrate. A model result is rejected or degraded when it is malformed, unavailable, abstained, or based on stale evidence. A successful interpretation returns an untrusted candidate plus a deterministic derivation; it does not apply a privileged domain effect. A successful draft returns editable text plus a manual-fallback guarantee; it does not alter trusted route fields or send.
