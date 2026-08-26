# Product Spec v1 Consolidation and Reconciliation Evidence — 2026-08-27

## Status

**Dated evidence/reconciliation artifact. Not Product authority by itself.**

Purpose:

1. re-check the 2026 frontier before consolidating Lunowa Product content;
2. separate external evidence from Lunowa-specific inference;
3. record the material conflicts between current canonical documents and the consolidated `PRODUCT-SPEC-V1-CANDIDATE.md`;
4. define the audit/promote path without silently rewriting Responsibility semantics or Product-discovery sequencing.

---

# 1. Evidence classification

- **CURRENT PRODUCT FACT** — current vendor documentation/product behavior;
- **RESEARCH EVIDENCE** — published/preprint study, with limitations preserved;
- **INFERENCE** — reasoning from evidence;
- **LUNOWA CANDIDATE** — Product-specific choice not externally proven;
- **UNKNOWN** — unresolved.

Vendor feature presence does not establish accuracy, retention, Product quality, or moat.

---

# 2. Current email / agent frontier re-check

## 2.1 Gmail AI Inbox

**CURRENT PRODUCT FACT:** Gmail AI Inbox is in beta and exposes `Suggested to-dos` plus `Topics to catch up on`. Suggested to-dos highlight priority incoming-email items that need attention; topics summarize important updates across threads. Related source email/chat is directly inspectable.

Source:
- https://support.google.com/mail/answer/16845247

**INFERENCE:** task extraction, AI prioritization, catch-up summaries, and source-linked AI surfaces are incumbent territory. Lunowa cannot claim differentiation merely from an AI-generated action list.

## 2.2 Outlook Copilot

**CURRENT PRODUCT FACT:** Copilot Prioritize assigns high/normal/low priority to incoming Inbox email, tends to mark action-required email as more important, provides brief summaries/reasons, and supports prioritization customization. Microsoft also documents Copilot triage actions such as pin/flag/archive/delete/read-unread.

Sources:
- https://support.microsoft.com/en-us/outlook/copilot-outlook/prioritize-my-inbox
- https://support.microsoft.com/en-us/outlook/frequently-asked-questions-about-copilot-in-outlook

**INFERENCE:** message-level importance/triage is highly occupied. Lunowa's core unit should remain current operational/attention state rather than another message-priority layer.

## 2.3 Superhuman

**CURRENT PRODUCT FACT:** Superhuman Auto Reminders can identify sent messages that need follow-up when no reply has arrived. Auto Drafts generate follow-up drafts and response drafts; current documentation shows response Auto Drafts available in 2026. Gmail/Outlook Email Assistant drafts appear as normal provider drafts and are not sent automatically.

Sources:
- https://help.superhuman.com/hc/en-us/articles/46005658551053-Auto-Reminders-Auto-Drafts
- https://help.superhuman.com/hc/en-us/articles/46005854346893-Email-Assistant-by-Superhuman-Mail-Gmail
- https://help.superhuman.com/hc/en-us/articles/46183302401933-Email-Assistant-by-Superhuman-Mail-Outlook

**INFERENCE:** no-reply monitoring, follow-up drafting, provider-draft integration, and AI response preparation are not unique Lunowa claims. Contextual drafting remains useful table stakes around Lunowa's stateful loop.

## 2.4 Shortwave / Tasklet

**CURRENT PRODUCT FACT:** Shortwave integrates with Tasklet for background email automation. Tasklet can draft replies, organize email into todos, add team context, and connect to thousands of external apps; Shortwave presents the drafts in its own client for review/send.

Sources:
- https://www.shortwave.com/blog/shortwave-tasklet-integration/
- https://www.shortwave.com/docs/guides/ai-assistant/

**INFERENCE:** background event-triggered email automation and natural-language workflow setup are already occupied. Lunowa should not become a generic automation builder merely to appear agentic.

## 2.5 Microsoft Copilot Cowork

**CURRENT PRODUCT FACT:** Cowork can run event-driven tasks when matching email/Teams events occur. Shared actions such as sending email or changing a shared system default to draft-and-approve; approval UX shows action details and supports bounded session/recipient/domain permission choices. Automated tasks run with the user's permissions and have rate/loop safeguards.

Sources:
- https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
- https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-admin-governance

**INFERENCE:** capability and permission should remain separate; action-specific scoped authorization is more defensible than one global autonomy level. Lunowa's monitoring autonomy can progress independently of external-action authority.

---

# 3. Human-AI / memory evidence that constrains the Product

## 3.1 Appropriate reliance: sources matter more than persuasive explanation

**RESEARCH EVIDENCE:** CHI 2025 work by Kim et al. (`N=308`, pre-registered experiment) found that explanations increased reliance on both correct and incorrect LLM answers; incorrect-answer reliance was reduced when sources were provided or explanation inconsistencies were visible.

Source:
- https://doi.org/10.1145/3706598.3714020

**INFERENCE:** Lunowa should prefer source-grounded evidence/provenance over long persuasive AI rationale or confidence theater.

## 3.2 Prospective-memory offloading increases the cost of failure

**RESEARCH EVIDENCE:** 2026 prospective-memory work reports that sufficiently reliable external reminders can reduce internal intention maintenance, while removing relied-upon reminder support can impair later prospective retrieval.

**INFERENCE:** if Lunowa succeeds, users may stop carrying delegated loops mentally; material false negatives and silent monitoring-integrity failures therefore become more damaging, not less.

This supports explicit monitoring-integrity UX, durable triggers/reconciliation, and a North Star centered on actual monitoring relinquishment.

## 3.3 Long-term memory staleness remains unsolved

**RESEARCH EVIDENCE / CURRENT 2026 BENCHMARK DIRECTION:** recent evolving-memory benchmarks (including Memora/STALE-style work) show that high recall does not guarantee current-state correctness when information changes or old facts become stale.

**INFERENCE:** opaque AI memory must not become canonical Product truth. Lunowa should preserve source evidence, accepted state, chronology, supersession/correction, and evidence-relative answers. Semantic similarity is candidate retrieval, not authority.

## 3.4 Proactive intervention timing is contextual

**RESEARCH EVIDENCE:** recent proactive-AI field work reports materially different receptivity depending on whether an intervention arrives at a workflow boundary versus mid-task.

**INFERENCE:** message arrival and human interruption should remain separate. v1 should use bounded predictable delivery/quiet-hours policy rather than prematurely building invasive activity inference.

---

# 4. Consolidation result

The frontier re-check does **not** justify a new Product thesis. It strengthens the existing one:

> **Lunowa's defensible Product hypothesis is the complete behavioral outcome of reliable Attention Delegation across heterogeneous unresolved communication — not the presence of AI email features.**

The consolidation therefore keeps:

- Open-loop Monitoring Offload as problem/wedge hypothesis;
- Responsibility as current canonical semantic mechanism;
- Moment as context restoration;
- source/provenance and deterministic authority boundaries;
- Issue #36 as current highest Product-discovery gate.

It adds/clarifies Product content that was previously distributed across chat/candidates:

- Minimum Complete Delegation Loop;
- five conceptual Product surfaces;
- continuous-monitoring / episodic-attention Daily Operating Model;
- onboarding/trust progression;
- awareness/delivery/integrity lanes;
- operational retrieval/history/people boundaries;
- ordinary communication action boundary;
- provider vs Lunowa ownership;
- explicit v1 scope/non-goals.

---

# 5. Reconciliation against current repository authority

## 5.1 `PRODUCT.md`

### Already aligned

Current canonical Product authority already establishes:

- North Star;
- monitoring relinquishment;
- problem/ICP evidence discipline;
- Open-loop Monitoring Offload as a wedge rather than differentiation;
- system-led intelligence;
- source/provenance/control;
- human authority for material actions;
- Responsibility/Moment/Temporal Contract roles;
- Product evidence before implementation breadth;
- full-client form factor as unvalidated;
- Issue #36 as the highest Product-discovery gate.

### Materially stale / incomplete relative to consolidated candidate

Current `PRODUCT.md` still lists as major unknowns or leaves distributed rather than consolidated:

- exact Product-surface contract;
- Daily Operating Model;
- onboarding/trust progression;
- awareness vs action vs integrity delivery;
- operational retrieval/history/people boundary;
- ordinary communication-action ownership;
- stronger companion/hybrid v1 preference;
- mailbox-state vs Responsibility-state separation as a Product invariant;
- source-notification migration hypothesis.

**Promotion implication:** `PRODUCT.md` can be updated without claiming Product-market validation by retaining `HYPOTHESIS/UNKNOWN` labels.

## 5.2 `docs/design/DESIGN.md`

### Material conflict A — broad initial mail-client scope

Current canonical design lists broad initial capabilities including:

- Gmail + Outlook;
- one/multiple accounts;
- full compose/reply/reply-all/forward;
- Cc/Bcc, formatting, signatures;
- Drafts/Sent/Archive/Trash/Spam/Block/Read-Unread;
- Send Later;
- contact autocomplete;
- bulk actions;
- attachment preview;
- person/company context.

The consolidated v1 candidate instead prefers:

- one-provider complete-loop proof;
- Source reading/search/provenance;
- Moment-bound contextual reply/draft/send;
- provider fallback for arbitrary compose and mailbox administration;
- no requirement for second provider, broad folder/hygiene parity, bulk actions, Send Later, or contact management before the Attention loop is proven.

This is a **material Product-scope conflict**, not a cosmetic design difference.

### Material conflict B — top-level state navigation

Current design recommends `すべて / 対応が必要 / あとで / 待ち / 確認 / ピン留め` as high-frequency navigation.

The consolidated candidate proposes:

- Home/Landing;
- Needs You;
- conditional Review;
- Managed assurance/inspection;
- Source Conversations;
- Waiting/Later normally as details/filters under Managed.

Reason: permanent Waiting/Later queues can recreate user monitoring burden.

This remains a Product hypothesis and should be promoted as a current design direction, not claimed as validated IA.

### Material conflict C — ordinary row defaults to source-first

Current design says ordinary row open defaults to `会話`; Moment is contextual.

The candidate does not require source-first as the default **work** path: Needs You opens Moment; Source remains directly accessible. Source-first may remain correct for Source Conversations.

Promotion must preserve this distinction rather than globally changing every row interaction.

## 5.3 `docs/design/INTERACTIONS.md`

Expected reconciliation areas:

- arrival != notification;
- awareness-only delivery is not Needs You;
- integrity alert is not a fake Responsibility state;
- contextual send path and approval boundary;
- provider mailbox state does not mutate Responsibility semantics;
- Managed inspection / Moment / Source behavior;
- source-notification migration remains opt-in hypothesis.

Do not create new Responsibility states to express Product delivery/system integrity.

## 5.4 `responsibility/DECISIONS.md`

The consolidated candidate must preserve FIXED semantics including:

- `No Responsibility`;
- admission `TRACK / DO_NOT_TRACK / NEEDS_REVIEW`;
- Review subject distinction;
- Conversation 0/1/many Responsibilities;
- multiple obligation legs/expected events;
- claim vs observation;
- evidence-relative state;
- semantic similarity not identity authority;
- REOPEN identity rule;
- resolution/live tracking/attention orthogonality;
- send attempt != provider acceptance;
- historical no-closure != live tracking;
- AI failure must not block ordinary mail;
- no generic workflow engine;
- cross-account semantic merge prohibited initially.

**Audit rule:** Product consolidation fails if it invents a new lifecycle/aggregate or bypasses these FIXED semantics.

## 5.5 `IMPLEMENTATION-PLAN.md`

Current implementation sequencing is substantially aligned:

- problem/ICP evidence first;
- minimal fake-data mechanism experiment;
- longitudinal monitoring-relinquishment proof;
- broaden credible-client shell only after evidence;
- one real provider read path before second provider;
- real compose/send path only when justified;
- search/context after trusted domain/runtime foundations.

Promotion should **not** reorder Issue #36 or authorize Issue #28 merely because Product content is now more complete.

## 5.6 Architecture/data/contracts

No new Product term in the consolidated candidate authorizes:

- `AttentionContract` persistence;
- `OpenCoordinationLoop` parent aggregate;
- new lifecycle enums;
- generic workflow tables;
- global trust score;
- global autonomy level.

Existing architecture/domain authority remains intact until explicitly changed by its own evidence/review process.

---

# 6. Candidate promotion doctrine

A canonical Product promotion may safely state a complete Product direction while continuing to label these as empirical unknowns:

- exact ICP;
- actual monitoring-burden prevalence/severity;
- PMF;
- WTP/pricing;
- real false-negative/false-positive rates;
- actual trust threshold;
- exact notification/digest defaults;
- whether five-surface IA wins usability tests;
- whether companion/hybrid remains superior in mature usage;
- whether native compose/calendar/multi-account later become Product-critical.

Canonical Product direction is allowed to contain explicitly labeled hypotheses. Canonical does **not** mean proven market fact.

---

# 7. Proposed canonical reconciliation scope after full acceptance audit

If the final consolidated candidate passes full acceptance audit, the minimal coherent promotion should update together:

1. `PRODUCT.md` — consolidate the Product contract and remove stale `unknown` items that are now explicit hypotheses/decisions;
2. `docs/design/DESIGN.md` — reconcile v1 scope and high-level information architecture;
3. `docs/design/INTERACTIONS.md` — reconcile delivery/Managed/Moment/Source/action behavior without changing Responsibility semantics;
4. `docs/product/README.md` — update authority/routing description;
5. `IMPLEMENTATION-PLAN.md` only where wording materially conflicts; preserve Product-discovery sequencing;
6. continuity router only if necessary and without duplicating Product truth.

Do not delete historical candidate/evidence files during the same promotion unless they create routing ambiguity; they remain useful rationale/history when clearly marked noncanonical.
