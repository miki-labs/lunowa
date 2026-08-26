# Onboarding / Trust Progression Evidence Review — 2026-08-26

## Status

Dated external-evidence review supporting `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md`.

This artifact distinguishes published evidence, current vendor behavior, synthesis, and Lunowa-specific hypotheses. It does not claim that cited results directly validate Lunowa's Product decisions.

---

## 1. Research question

How should Lunowa move a new user from source-first email use to real monitoring delegation without causing blind overtrust, permanent undertrust, or a second oversight workload?

Subquestions:

- Is trust static or dynamic?
- Does stated trust predict actual delegation?
- Should autonomy expand globally or by function/scope?
- What information helps users calibrate reliance?
- How should the Product respond after errors?
- What do current AI/email products do during onboarding and permission expansion?

---

## 2. Dynamic trust and behavioral reliance

### Dynamic calibration of trust and trustworthiness in AI-enabled systems — 2026

Liebherr et al., *International Journal on Software Tools for Technology Transfer* (2026), frame trust, system trustworthiness, and calibrated trust as dynamic phenomena that evolve through user/system history rather than static attributes.

Use for Lunowa:

- supports treating delegation readiness as dynamic;
- does not justify a single numeric Product trust score.

Source:
https://link.springer.com/article/10.1007/s10009-026-00840-6

### From perception to adoption: A longitudinal study of trust and delegation in everyday AI use — 2026

Longitudinal study reports:

- perceived creepiness predicted lower later trust;
- perceived usefulness did not reliably predict later trust;
- trust and willingness to delegate were correlated within waves, but trust did not predict later willingness to delegate;
- willingness to delegate predicted later AI adoption.

Use for Lunowa:

- supports measuring actual delegation behavior rather than only self-reported trust;
- warns against assuming positive attitudes automatically become future delegation.

Source:
https://www.sciencedirect.com/science/article/pii/S2949882126000770

### Dynamic Trust Formation in AI-Enabled Automation — 2026

Longitudinal case study of real-world advanced-driver-assistance use concludes that trust is continuously evaluated from experience and new information and becomes compartmentalized rather than remaining one uniform global state.

Use for Lunowa:

- supports function/context-specific trust/delegation;
- does not imply that vehicle automation findings transfer quantitatively to email.

Source:
https://onlinelibrary.wiley.com/doi/10.1111/isj.70046

---

## 3. Humans can learn reliability, but cues can also mislead

### Learning to Trust: How Humans Mentally Recalibrate AI Confidence Signals — 2026 preprint

Behavioral experiment N=200 found users improved predictions of AI correctness over 50 repeated trials under standard, overconfident, and underconfident calibration conditions; a reverse-confidence mapping remained substantially harder.

Use for Lunowa:

- repeated real experience can teach a system's functional reliability;
- supports progressive experiential onboarding;
- preprint and abstract task, so do not infer an exact number of successful loops.

Source:
https://arxiv.org/abs/2603.22634

### Too Sure for Our Own Good — AAAI 2026

N=184 within-subject experiment found well-calibrated confidence cues improved decision accuracy while miscalibrated confidence produced little gain and increased automation/conservatism biases.

Use for Lunowa:

- model confidence must not become a decorative authority signal;
- user-visible confidence requires real calibration for the specific task.

Source:
https://ojs.aaai.org/index.php/AAAI/article/view/38798

### More is not better: Visual uncertainty cues — 2026

Study reports that visual confidence cues improved subjective accuracy discrimination yet increased behavioral agreement with incorrect LLM outputs; response accuracy remained a dominant trust driver.

Use for Lunowa:

- more uncertainty UI is not automatically better calibration;
- supports source/evidence grounding over confidence theater.

Source:
https://www.sciencedirect.com/science/article/pii/S2949882126000587

---

## 4. Explanations, sources, and appropriate reliance

### Fostering Appropriate Reliance on Large Language Models — CHI 2025

Pre-registered controlled experiment N=308 found:

- explanations increased reliance on both correct and incorrect LLM responses;
- providing sources or exposing inconsistencies reduced reliance on incorrect responses.

Use for Lunowa:

- fluent explanation alone must not be the trust mechanism;
- source evidence and contradictions should remain inspectable;
- supports Moment/Review showing evidence/provenance rather than persuasive AI rationale.

Source:
https://www.microsoft.com/en-us/research/publication/fostering-appropriate-reliance-on-large-language-models-the-role-of-explanations-sources-and-inconsistencies/

### Adjust for Trust — IUI 2026

Study investigates trust-adaptive interventions. Supporting explanations under under-trust and counter-explanations/forced pauses under over-trust reduced inappropriate reliance in the studied tasks.

Use for Lunowa:

- one fixed explanation policy is unlikely to fit every reliance state;
- intervention can be targeted to moments where calibration is materially wrong;
- tasks differ substantially from email monitoring, so exact effects are not portable.

Source:
https://doi.org/10.1145/3742413.3789136

---

## 5. Prospective-memory offloading raises the cost of failure

### Let it go: How trusted reminders alter intention maintenance — 2026-08-18

Experiment N=320 found that after exposure to fully reliable reminders, participants reduced prospective-memory-related thoughts and redistributed attention; unexpected removal of reminder support harmed later retrieval.

Use for Lunowa:

- directly supports the possibility that reliable delegated monitoring changes cognitive behavior;
- also implies material false negatives become more severe once users have learned to offload monitoring;
- supports explicit monitoring-integrity warnings.

Source:
https://link.springer.com/article/10.3758/s13423-026-02985-6

---

## 6. Error response and trust repair

### Explainability in AI: Comparing Human-Like and System-Like Trust Repair Strategies — 2026

Controlled online experiment N=261 after simulated conversational-agent error found system-like XAI repair strategies and apology repaired subjective trust similarly, while XAI-based explanations produced higher actual continuance decisions. The paper also reports that making users help fix errors they did not cause undermined repair effectiveness.

Use for Lunowa:

- supports concrete system-like incident explanation and recovery rather than apology-only UI;
- supports minimizing correction labor after system-caused errors.

Source:
https://link.springer.com/article/10.1007/s10796-026-10751-1

### Apologizing artificial intelligence — 2026

Two experiments found users were less forgiving of AI than human experts after noticeable advice errors; simple apology did not reliably restore reliance and could be ineffective/detrimental depending on context.

Use for Lunowa:

- supports avoiding anthropomorphic apology theater as the primary trust-repair mechanism;
- evidence is advice-task-specific and not direct email-monitoring evidence.

Source:
https://link.springer.com/article/10.1007/s00146-026-03067-w

### Evaluation of Failure Communication Strategies for Trust Repair — LREC 2026

Controlled physical collaborative task found actively communicating AI mistakes improved trust relative to no repair; earlier repair tended to be more effective.

Use for Lunowa:

- supports proactively communicating material misses/integrity failures rather than silently correcting them later.

Source:
https://aclanthology.org/2026.lrec-1.230/

### Do users forgive fallible artificial intelligence? — 2026 working paper

Repeated-advice experiment reports utilization fell during error rounds but recovered when performance improved, suggesting recalibration rather than necessarily permanent aversion.

Use for Lunowa:

- suggests trust/delegation can potentially be re-earned through subsequent reliable behavior;
- working paper, so treat as directional only.

Source:
https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6728859

---

## 7. Current product behavior: bounded control and gradual adaptation

### Microsoft Copilot Cowork — August 2026

Current official behavior:

- sensitive actions such as sending email/posting Teams/scheduling meetings require approval;
- preview is shown before approval for many actions;
- user may allow similar actions for the rest of the current session, with email/Teams scopes such as specific recipient or domain;
- event-driven tasks show trigger, instructions, required permissions, state, last run, and history;
- automated tasks default to draft-and-approve for shared actions;
- activity remains auditable.

Use for Lunowa:

- production evidence that permission can expand by action and scope rather than a global autonomy toggle;
- monitoring and external action authority can remain separated.

Sources:
https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-admin-governance

### Fyxer onboarding — current 2026 help center

Current vendor onboarding is explicitly progressive:

- Day 0 setup: connect inbox/calendar and permissions;
- Days 1–2: understand categorized inbox and review/edit/send first drafts;
- Days 2–7: train preferences/style and build habits;
- users can keep more categories in the main inbox to “ease into categorization gradually”;
- nothing is deleted/hidden permanently and mail remains searchable;
- drafts are reviewed by the user and not auto-sent;
- edits help personalize future drafts.

Use for Lunowa:

- current product evidence that gradual visibility reduction and source fallback are practical onboarding patterns;
- does not validate Fyxer's categorization accuracy or prove the same day-based structure should be copied.

Sources:
https://support.fyxer.com/article/your-7-day-onboarding-checklist-what-to-do
https://support.fyxer.com/article/your-new-organized-inbox-explained
https://support.fyxer.com/article/how-to-review-edit-and-send-your-first-draft

---

## 8. Evidence synthesis

### Strongly supported direction

The evidence supports these general principles:

1. Trust/reliance develops over experience and can differ by task/function.
2. Stated trust is not an adequate substitute for behavioral reliance/delegation metrics.
3. Explanation alone can increase over-reliance; source evidence and contradictions matter.
4. Uncalibrated confidence indicators can harm reliance decisions.
5. Reliable reminder/offloading systems can cause users to reduce internal monitoring, making system failure more consequential.
6. Sensitive action authority should remain scoped and explicit.
7. Material failure communication should be concrete and active rather than silently hidden or repaired through apology alone.
8. Current production assistants preserve user review for consequential outbound actions.
9. Gradual onboarding and source fallback are current practical product patterns.

### Lunowa-specific Product hypotheses

The following are NOT directly validated by external literature:

- selecting one real Sent/current loop as the ideal first-run proof;
- the exact bounded-delegation card copy;
- evidence receipts inside Managed;
- stewardship receipts after closure;
- when to offer class-scoped automatic monitoring;
- when to suggest Attention-first landing;
- exact incident UI after a material miss;
- whether class-scoped delegation is understandable enough without becoming a rule builder.

These require Product testing.

---

## 9. Research implications for validation

A Lunowa onboarding experiment should not ask only whether the user “trusts the app”. It should measure:

- whether the user delegates a real loop;
- whether they continue checking Source/Sent during the waiting period;
- whether they create a parallel reminder;
- whether the correct Moment restores context without rereading the whole thread;
- whether a successful loop increases willingness to delegate a similar loop;
- how false positives vs false negatives change later delegation;
- whether incident explanation/recovery changes behavioral continuation;
- whether evidence receipts reduce checking or accidentally encourage it.

A positive result means behaviorally appropriate delegation increases while unnecessary parallel monitoring falls; it does not mean users simply report high trust.
