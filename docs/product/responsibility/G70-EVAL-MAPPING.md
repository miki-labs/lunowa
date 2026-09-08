# G70 AI evaluation mapping

Status: Issue #142 post-merge hardening evidence for the G70 component accepted through PR #136. This document routes checks to canonical Product/Responsibility authority; it is not a second semantic oracle.

## Verification layers

| Layer | Evidence | Owned check | Explicit non-claim |
| --- | --- | --- | --- |
| Context | authorized normalized message snapshot | tenant/account/message scope, participant binding, current/quoted/forwarded zones, minimum draft payload | provider authorization itself |
| Canonical interpretation fixtures | detailed Tier-0 YAML oracles | exact focal event, direction/order, participants, existing Responsibility state, provider-evidence condition | reducer/Temporal/provider/Send correctness |
| Candidate boundary | ADR 0007 + Responsibility interpretation boundary | model emits language-level semantics only; prior identity is scoped; trusted provider observations stay outside the prompt | accepted state authority |
| Production provider boundary | PostgreSQL 18.6 G70 integration | complete normalized attachment absence can become trusted contradiction; partial/truncated evidence remains UNKNOWN; repository revalidates provider observation identity | real Gmail mailbox behavior |
| Draft assistance | PG-29/42/45/52 boundary tests | editable body only, no routing/Send authority, manual fallback | G50 persistence or G51 Send |
| Live selected-model acceptance | `scripts/g70-live-model-acceptance.ts` | repeated synthetic high-value trials bound to exact model/config/prompt/schema/data-control identity | ordinary deterministic CI or production-mail approval |

## Canonical fidelity

`tests/g70-canonical-fidelity.test.ts` reads the owning canonical YAML blocks and executes only the selected message-owned scenarios `T0-001`, `T0-002`, `T0-014`, `T0-029`, `T0-034`, and `T0-040`. It mechanically compares focal event, message direction/order, participants, accepted prior-state envelope, provider attachment condition, and focal body where serialized. Deliberate mutations must fail.

`T0-026` is a canonical `USER_COMMAND: SET_PERSONAL_TARGET` case and is deliberately rejected as an AI email-interpretation fixture. Routing metadata in `G70_EVAL_CASES` does not imply executable or live-model coverage by itself.

`tests/ai-runtime.test.ts` separately covers schema, source/participant authority, degradation, No Responsibility, prompt-injection and draft boundaries without pretending those checks are complete canonical scenario execution.

## Claim versus provider observation

The model may emit only bounded communicated claims (`ATTACHMENT_DELIVERED` or `DELIVERY_FAILURE_REPORTED`). Gmail normalization/provider observations are never included in the model prompt. `src/server/ai/provider-evidence.ts` derives deterministic attachment observations from normalized evidence, and the production Responsibility repository independently reconstructs and validates the same observation key before accepting `PROVIDER_NON_DELIVERY`. `MIME_STRUCTURE_TRUNCATED`, partial normalization, and unsupported body evidence cannot become trusted absence.

## Live model gate

Run explicitly, never from ordinary `pnpm verify`:

```text
OPENAI_API_KEY=... OPENAI_MODEL=... AI_MODEL_CONFIG_VERSION=... \
OPENAI_DATA_CONTROL_MODE=STANDARD_API_RETENTION G70_LIVE_TRIALS=3 \
node --import tsx scripts/g70-live-model-acceptance.ts
```

`OPENAI_DATA_CONTROL_MODE` must be `STANDARD_API_RETENTION` or separately verified `ZDR_VERIFIED`. The gate uses synthetic fixtures only, sends `store:false`, persists no raw prompt/output, hashes exact prompt/schema identities, and applies a `pass^k` rule: every selected trial must pass. Default is three trials; two through ten are allowed.

OpenAI API/data-control behavior was revalidated on 2026-09-08: Structured Outputs remains the preferred schema-adherent Responses path; `store:false` avoids foreground Responses application-state storage, while Zero Data Retention remains a separately approved organization/project control and must not be inferred from request flags alone.
