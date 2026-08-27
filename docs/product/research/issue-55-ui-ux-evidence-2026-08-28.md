# Issue #55 — UI/UX implementation-readiness evidence

## Status

**Dated external/repository evidence for Issue #55. Not Product or Responsibility semantic authority.**

Date: `2026-08-28`

This document records the evidence used to make the current Lunowa v1 UI/UX implementation contract decision-complete. It distinguishes external facts from Lunowa-specific inferences. Product truth remains in `PRODUCT.md` / `PRODUCT-CONTENT.md`; Responsibility truth remains in `responsibility/`; canonical design/interaction/responsive authorities remain in `docs/design/`.

The current task is not to invent a new Product. It is to make the already accepted Minimum Complete Delegation Loop implementable without requiring the implementation agent to guess material screen behavior.

---

# 1. Research question

Given the accepted Lunowa Product thesis, what UI/UX decisions are required in 2026 so that:

1. the Product does not collapse back into an AI-enhanced Inbox;
2. users can distinguish `Needs You`, quiet delegated monitoring, material Review, Source evidence, and system integrity;
3. AI assistance encourages **appropriate reliance**, not persuasive overreliance;
4. notification/delivery behavior protects attention instead of recreating email interruption load;
5. list/detail behavior remains coherent across desktop, tablet, mobile, zoom, keyboard and assistive technology;
6. async operations such as Send/reconnect/monitoring changes never imply stronger truth than has actually been confirmed;
7. implementation can proceed from stable UI read-model contracts without creating new domain/schema authority.

---

# 2. Repository evidence

## 2.1 Current accepted Product/design state

Repository authorities already establish:

- Attention Delegation as the core value;
- Minimum Complete Delegation Loop rather than provider parity;
- `Evidence != Interpretation != Admission != Domain state != Safe action != UI projection`;
- Source always reachable;
- Needs You = current USER work, not important/new mail;
- Managed = quiet inspectable monitoring, not a second Inbox;
- Review = sparse material question surface, not a confidence/approval queue;
- Moment = one primary current question and generally one primary safe action;
- Message arrival != attention event;
- Trigger != notification;
- Send attempt != provider-reconciled acceptance;
- integrity degradation must revoke stale reassurance;
- responsive behavior preserves the same Product model with fewer simultaneous panes.

Relevant current authorities:

- `docs/product/PRODUCT.md`
- `docs/product/PRODUCT-CONTENT.md`
- `docs/product/GOLDEN-SCENARIO-BANK.md`
- `docs/design/DESIGN.md`
- `docs/design/INTERACTIONS.md`
- `docs/design/RESPONSIVE.md`
- `docs/design/references/README.md`
- `docs/product/responsibility/README.md`

## 2.2 Existing visual references

`docs/design/references/00`–`19` remain useful for composition, density, component appearance, projection treatment and responsive direction. They are not scope/semantic authority.

Important current interpretation:

- `00` brand system and `01` component system remain strongest visual foundations;
- `02` is the reusable desktop shell, not proof Source Inbox should be Home;
- `03`–`08` provide Moment visual families but legacy filenames are not domain enums;
- `10` is useful for search/result continuity;
- `17` is useful for system-state treatment but must be extended by current integrity semantics;
- `18`–`19` are responsive composition references, not device-specific ontologies.

---

# 3. 2026 competitive UI frontier

## 3.1 Gmail AI Inbox

Primary sources:

- Google, **Gmail is entering the Gemini era**, 2026-01-08: https://blog.google/products-and-platforms/products/gmail/gmail-is-entering-the-gemini-era/
- Google I/O 2026 announcements: https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/
- Google Workspace updates, 2026-05-19: https://blog.google/products-and-platforms/products/workspace/workspace-updates/

Current external facts:

- Gmail AI Inbox surfaces critical to-dos/important updates rather than only raw message order.
- 2026 updates add personalized draft replies, relevant Docs/Sheets/Slides links beside to-dos, mark-task-done/dismiss actions and conversational inbox access.

**Inference for Lunowa:** `AI prioritized inbox + suggested task + contextual draft` is already incumbent territory. Lunowa should not visually center generic AI sorting, a chat box, or task extraction as its distinctive interaction.

## 3.2 Outlook Copilot

Primary source:

- Microsoft Support, **Prioritize my inbox**, current 2026 documentation: https://support.microsoft.com/Outlook/copilot-outlook/prioritize-my-inbox

Current external facts:

- Copilot can assign high/normal/low priority to incoming email.
- list rows can show AI-generated brief summaries;
- selected messages can show a reason the message was considered important;
- users can customize prioritization rules.

**Inference for Lunowa:** importance/reasoning overlays are not enough. Lunowa must visually separate `important` from `current user obligation` and `source evidence` from `model rationale`.

## 3.3 Superhuman Mail

Primary source:

- Superhuman Help, **Auto Reminders & Auto Drafts**, current page with 2026 updates: https://help.superhuman.com/hc/en-us/articles/46005658551053-Auto-Reminders-Auto-Drafts

Current external facts:

- Superhuman automatically resurfaces sent mail without replies;
- AI can detect messages likely needing follow-up;
- Auto Drafts can prepare follow-up and response drafts.

**Inference for Lunowa:** no-reply tracking and draft preparation cannot be presented as the core differentiator. A follow-up state must remain a consequence of current Responsibility/outcome evidence, not a new-message/no-reply heuristic made visually central.

## 3.4 Shortwave + Tasklet

Primary sources:

- Shortwave, **Fully Automate Your Email with Shortwave + Tasklet**, 2026-01-06: https://www.shortwave.com/blog/shortwave-tasklet-integration/
- Shortwave AI Assistant guide: https://www.shortwave.com/docs/guides/ai-assistant/
- Shortwave keyboard shortcuts: https://www.shortwave.com/docs/references/shortcuts/

Current external facts:

- Tasklet can create Shortwave todos, draft replies, and run trigger/schedule-based automation;
- Shortwave supports inbox organization, AI retrieval, natural-language search, command palette and extensive keyboard shortcuts.

**Inference for Lunowa:** agent automation, todos, NL search and keyboard speed are useful capabilities but are not Product identity. Lunowa should use keyboard efficiency where it reduces work, while keeping the primary visual grammar around delegated outcome monitoring rather than a general automation console.

## 3.5 Competitive conclusion

The 2026 frontier makes these weak differentiation claims:

```text
AI summarizes email
AI prioritizes email
AI extracts todos
AI drafts replies
AI reminds on no reply
AI searches email naturally
AI automates trigger-based workflows
```

The UI must therefore make the stronger Lunowa thesis legible:

```text
What unresolved outcome is being carried?
Does the user need attention now?
If not, why is it safe to leave?
What exact event/time/evidence will cause reconsideration?
If attention returns, why now and what safe action remains?
What source/provider observation supports that conclusion?
Can the system still truthfully claim monitoring integrity?
```

---

# 4. Human-AI trust / appropriate reliance evidence

## 4.1 Explanations can increase overreliance

Primary/research sources:

- Hunsicker et al., 2026, *Trust the Explanation or my Expectation? Effects of Output Accuracy and Explanations on Expectation Violations and Trust in AI-Supported Decisions*, International Journal of Human-Computer Studies, DOI `10.1016/j.ijhcs.2026.103775`.
- Kim et al., CHI 2025, *Fostering Appropriate Reliance on Large Language Models: The Role of Explanations, Sources, and Inconsistencies*, Microsoft Research / CHI 2025.
- Li et al., CHI 2025, *From Text to Trust: Empowering AI-assisted Decision Making with Adaptive LLM-powered Analysis*, DOI `10.1145/3706598.3713133`.

Current empirical findings relevant to Lunowa:

- inaccurate AI outputs reduce trust overall, but adding explanations can increase behavioral reliance on inaccurate outputs;
- explanations can increase reliance on both correct and incorrect LLM answers;
- providing sources can reduce reliance on incorrect responses;
- showing all possible analyses/explanations can add cognitive burden; fewer high-information items can be more useful.

**Design decision:** do not use generated rationale, model confidence or verbose explanation as default trust theater.

Preferred trust stack:

```text
current conclusion / safe action
-> minimal material reason
-> explicit source/provider/user-origin evidence
-> original source
```

Source provenance is a first-class interaction, not an afterthought.

## 4.2 Confidence is not authority

The repository already forbids model confidence from owning accepted state. Current HCI evidence reinforces that a fluent explanation or confidence cue is not the same as warranted reliance.

**Design decision:** no persistent confidence percentage on ordinary Moment/Managed rows. If uncertainty matters, surface the material unresolved question/evidence difference, not a scalar confidence badge.

## 4.3 Review should be sparse and decision-specific

Current Product semantics already require Review only for material ambiguity where user judgment helps. HCI evidence about cognitive load and overreliance supports limiting the amount of AI analysis shown.

**Design decision:** Review presents one bounded question, the minimum conflict/safety evidence, bounded choices, and source access. It never expands into an AI-debug panel.

---

# 5. Attention and notification evidence

## 5.1 Interruptions have measurable cost

Useful evidence:

- Mark/attention-interruption literature consistently finds task switching and resumption costs.
- Journal of Occupational Health 2023 review/experiment reports notification-driven interruptions as performance/strain stressors and summarizes evidence that reducing/batching notifications can improve perceived productivity.
- 2025 email-management qualitative work continues to report substantial organizational/personal difficulty controlling email load: *You've got mail – whether you want it or not*, Computers in Human Behavior Reports 18 (2025), `100618`.

These are directional supports, not proof of Lunowa's ICP or Product effect.

## 5.2 Platform notification guidance

Primary source:

- Apple Human Interface Guidelines, **Managing notifications**: https://developer.apple.com/design/human-interface-guidelines/managing-notifications

Current platform guidance distinguishes passive, active, time-sensitive and critical interruption levels and warns against exaggerating urgency because users may disable notifications entirely.

**Design decision:** Lunowa Product delivery lanes map to interruption behavior, but do not map one-to-one to a platform enum:

```text
Silent           -> no interruptive notification
Awareness        -> passive/in-app/digest by user policy
Normal Attention -> ordinary active delivery at a safe review point
Urgent Attention -> time-sensitive only when actual delay cost warrants it
Integrity Alert  -> severity based on monitoring promise impact; not automatically urgent
```

Message arrival alone never determines notification delivery.

## 5.3 Temporal calibration

Recent HCI discussion continues to treat timing as part of interaction design, not merely backend scheduling. The relevant Product consequence is already captured by Lunowa's separation of state change, attention need and delivery urgency.

**Design decision:** UI copy must avoid implying that a state was delayed merely because notification was delayed. Monitoring/re-evaluation may happen now while user interruption waits.

---

# 6. Feedback / async-operation evidence

Primary source:

- Apple HIG, **Feedback**: https://developer.apple.com/design/human-interface-guidelines/feedback

Current guidance emphasizes matching feedback prominence to the significance of the event and avoiding unnecessary alerts for routine success.

**Design decision:**

- routine successful internal state persistence uses local/polite status, not modal confirmation;
- failed/ambiguous consequential effects stay attached to the affected composer/Moment and preserve context;
- significant destructive/account-scope changes use explicit decision-complete confirmation;
- toast-only feedback is insufficient for send ambiguity, integrity loss or anything the user must act on.

---

# 7. Adaptive/responsive evidence

Primary sources:

- Android Developers, **Canonical layouts**, updated 2026: https://developer.android.com/develop/adaptive-apps/guides/canonical-layouts
- Android Developers, **Use window size classes**, updated 2026.

Current platform guidance reinforces:

- list-detail is a strong canonical layout for messaging/productivity apps;
- expanded widths can show list + detail simultaneously;
- compact widths replace list with detail and Back restores the list;
- resizing/orientation changes should preserve selected detail/state;
- large/extra-large windows should not be treated as merely scaled-up tablet layouts;
- supporting panes are appropriate for context that is meaningful only relative to the primary content.

**Design decision:** existing Lunowa `Sidebar | List | Detail` direction is retained.

Refinement:

- use content-fit and available window width, not device detection;
- at very large widths, an optional **user-opened supporting pane** may show Source/provenance/attachment/person context, but do not create a permanent fourth dashboard pane merely because space exists;
- on compact widths, selected detail remains primary and Back restores exact list/query/scroll state;
- drafts and async-operation state must survive layout transitions.

---

# 8. Accessibility evidence

Primary sources:

- W3C, **WCAG 2.2**: https://www.w3.org/TR/WCAG22/
- W3C WAI, **What's New in WCAG 2.2**: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- W3C WAI Technique **ARIA22: role=status**: https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22

Relevant requirements/guidance:

- WCAG 2.2 AA includes Focus Not Obscured (Minimum), Dragging Movements alternatives and Target Size (Minimum);
- target minimum is 24×24 CSS px unless an exception applies;
- status updates can be exposed to assistive technology without moving focus;
- WCAG 2.2 AAA Focus Appearance provides a useful robust target: focus indicator area comparable to a 2 CSS px perimeter and 3:1 contrast.

**Implementation target for Lunowa:** WCAG 2.2 AA as the release baseline, with selected stronger rules where cheap:

- visible 2px focus ring with >=3:1 contrast against adjacent background;
- focus never hidden under sticky banners/composer/nav;
- primary touch controls generally >=44 CSS px on compact/touch layouts;
- no essential drag-only action;
- async status conveyed programmatically;
- color never the only state distinction;
- keyboard order follows visual/logical order;
- motion respects `prefers-reduced-motion`.

---

# 9. Japanese input / composer implications

No Product advantage justifies breaking IME behavior.

Implementation rules derived from browser/interaction constraints and current Product safety posture:

- composition events must not trigger keyboard actions while Japanese IME composition is active;
- Enter in a multiline reply editor inserts/commits text, not implicit Send;
- explicit Send remains the default commit mechanism;
- if a power-user send shortcut is later supported, it must not fire during composition and must be discoverable/reversible only to the extent the external effect actually allows;
- viewport/keyboard changes must not cover active input or discard draft state.

---

# 10. Visual contrast / token audit

Current design authority names:

- Lunowa Navy `#0F1B3D`;
- Lunar Gold `#F2D9A6`;
- action/coral, Later/amber, Waiting/blue, Done/mint families.

Current bootstrap CSS is not yet canonical visual implementation and uses different navy/gold values. Issue #55 should remove ambiguity before UI implementation.

Contrast checks against white show why functional colors should not be used as arbitrary small text colors:

- Navy `#0F1B3D` on white: ~16.9:1;
- Lunar Gold `#F2D9A6` on white: ~1.4:1 — **not a text color on light surface**;
- existing coral family around `#D9605A`: ~3.6:1;
- amber around `#C88927`: ~3.0:1;
- blue around `#4E79B8`: ~4.4:1;
- mint around `#4D9B7B`: ~3.3:1.

**Design decision:** keep the softer colors as accent/surface families, but provide dedicated darker semantic foreground tokens for text/icons. Do not rely on a single color token for fill, text and border.

Recommended implementation-facing semantic foregrounds to verify again in the rendered system:

```text
Action foreground  #A83B36  (~6.3:1 on white)
Later foreground   #8A5A00  (~5.9:1)
Waiting foreground #315E9C  (~6.5:1)
Done foreground    #2F7156  (~5.8:1)
Review foreground  #705A9A  (~5.8:1)
```

These are UI token decisions, not Responsibility semantics.

Lunar Gold is suitable as a decorative/selected accent on Navy or as a pale surface, not body text on white.

---

# 11. Resulting Issue #55 design decisions

## D-55-01 — Outcome/attention-first hierarchy

Do not center unread count, generic importance, AI priority score, extracted todo count or automation activity. Center current user obligation, quiet delegated monitoring, material Review and source/integrity paths.

## D-55-02 — Evidence-first trust

Generated explanation/confidence is never default proof. Default hierarchy is conclusion/safe action -> minimal material reason -> provenance/source -> original communication.

## D-55-03 — Home ordering is attention-aware, not fixed `Review always first`

Home preserves semantic separation of Needs You and Review, but presentation order follows actual attention/delay cost. A nonurgent Review must not automatically outrank an urgent/current user action merely because it is Review. An urgent/blocking Review may appear first.

This refines an older candidate visual ordering without changing Product semantics.

## D-55-04 — Managed is reassurance first

Default Managed is aggregate quiet reassurance + integrity. Detailed item list appears only on intentional inspection. Counts are not backlog/gamification badges.

## D-55-05 — Async truth is explicit

UI distinguishes local intent/pending request/provider acceptance/reconciliation/domain consequence. Send and monitoring promises do not jump directly from click to confirmed semantic state.

## D-55-06 — Notifications represent attention handoff

No push for every message. Delivery is derived from attention need + delay cost + channel policy; Integrity severity is evaluated separately.

## D-55-07 — Adaptive list/detail, supporting context on demand

Keep stable shell; collapse panes based on content fit; preserve selection/draft/query; use optional supporting pane on very wide windows only when user-invoked/contextual.

## D-55-08 — Accessibility baseline is WCAG 2.2 AA

Stronger focus/touch/status behavior is adopted where low cost. No hover-only or drag-only essential interaction.

## D-55-09 — Japanese IME safety is acceptance-critical

No implicit Enter-to-send during composition; active draft must survive responsive/layout changes.

## D-55-10 — Functional color families separate foreground/surface/border

Color is redundant with text/icon; pale brand/state colors are not automatically valid text colors.

---

# 12. What remains hypothesis/usability work

Issue #55 can make implementation decision-complete without claiming these are empirically optimal:

- exact Japanese labels and microcopy;
- exact Home section order in every real workload;
- exact row density preferred by target users;
- final breakpoint values after browser/zoom/render testing;
- whether optional NL search/person context/digest/quiet-hours are promoted into first beta;
- whether users prefer Home vs Source as default after trust is earned;
- exact keyboard shortcut set beyond accessibility-required keyboard operation;
- exact notification defaults;
- whether a native full mail-client form is eventually superior.

These remain testable Product/usability questions. Implementation must not convert them into market facts.

---

# 13. Acceptance implication

The evidence supports proceeding with a **screen/state/read-model implementation contract** now. It does not support changing Responsibility semantics, claiming PMF, or expanding v1 into broad client parity.

The implementation-facing contract should therefore:

1. define every v1 CORE surface and material state;
2. explicitly model integrity/async operation state separately from Responsibility projection;
3. define navigation and focus return rules;
4. define responsive pane transitions/state preservation;
5. define visual/accessibility tokens sufficient for consistent implementation;
6. define UI read-model/event contracts as projections only;
7. map observable consequences back to Product Golden Scenarios/Responsibility oracles;
8. retain all empirical unknowns as unknown.