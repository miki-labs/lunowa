# Daily Operating Model Evidence Review — 2026-08-26

## Status

Dated external evidence review supporting `../DAILY-OPERATING-MODEL-CANDIDATE.md`.

This file is evidence context, not canonical Product truth. Vendor documentation shows current product behavior, not independent proof of quality, user benefit, retention, or market success. Academic studies vary in domain, sample, and external validity; their results are used directionally rather than copied as universal constants.

---

# 1. Current mail / agent product frontier

## Gmail AI Inbox — action vs catch-up separation

Sources:

- https://support.google.com/mail/answer/16845247
- https://blog.google/products-and-platforms/products/gmail/gmail-is-entering-the-gemini-era/

Current behavior observed in official documentation:

- AI Inbox is a separate optional surface, not a replacement for the normal Inbox.
- It separates `Suggested to-dos` from `Topics to catch up on`.
- Suggested to-dos identify high-priority incoming email needing attention and can expose View/Reply actions.
- Catch-up topics synthesize informational updates across related mail.
- Google describes AI Inbox as a personalized/proactive briefing and continues to preserve direct source access.

Product implication for Lunowa:

- action-required information and awareness/catch-up do not need to share one queue;
- a briefing surface can be useful without making every update actionable;
- these capabilities are incumbent territory, so Lunowa must differentiate through stateful delegated monitoring rather than generic to-do extraction.

Limitations:

- Gmail's exact ranking, notification behavior, and user outcomes are not independently established by these support pages;
- AI Inbox is beta and may change.

## Gmail summary cards — current information over raw messages

Source:

- https://support.google.com/mail/answer/15195630

Current behavior:

- summary cards synthesize information for purchases, events, travel, bills, promotions;
- cards can update based on related email and show source provenance (`Based on x email`);
- users can provide correction feedback.

Product implication:

- current-state projections over source communication are a familiar product pattern;
- provenance should remain inspectable.

## Outlook Copilot Prioritize — incoming importance remains message-centric

Sources:

- https://support.microsoft.com/en-us/outlook/copilot-outlook/prioritize-my-inbox
- https://support.microsoft.com/en-us/outlook/frequently-asked-questions-about-copilot-in-outlook

Current behavior:

- incoming Inbox mail is assigned high/normal/low priority;
- action-required mail tends to be marked more important;
- brief summaries and explanations are shown;
- users can customize prioritization instructions;
- old mail is not retroactively prioritized by this feature.

Product implication:

- message importance/action prediction is mature incumbent territory;
- Lunowa should not use `important email` as the same semantic unit as `current user attention obligation`.

## Superhuman Reminders / Split Inbox / notifications

Sources:

- https://help.superhuman.com/hc/en-us/articles/46005666142733-Remind-Me
- https://help.superhuman.com/hc/en-us/articles/46005619081101-Default-Split-Inbox
- https://help.superhuman.com/hc/en-us/articles/46005802618765-Email-Notifications

Current behavior:

- returned reminders can be separated from ordinary Important/Other mail;
- pending reminders and returned reminders are distinct surfaces;
- `if no reply` reminders cancel when a reply arrives;
- mobile notifications can be all, high priority, selected Split Inboxes, or off;
- Superhuman recommends a bounded number of Split Inboxes to avoid excessive places to process.

Product implication:

- returned work can be separated from new mail;
- notification scope should be controllable;
- a large taxonomy of persistent inboxes risks recreating checking burden;
- Lunowa must go beyond `reply arrived -> reminder canceled` because a reply may not satisfy the operational outcome.

## Outlook notification grouping / snooze

Sources:

- https://support.microsoft.com/en-us/outlook/how-do-i-disable-grouping-of-notifications-in-outlook
- https://support.microsoft.com/ja-jp/outlook/how-can-i-snooze-my-notifications-in-outlook

Current behavior:

- Outlook mobile groups notifications by conversation;
- notification snooze supports scheduled quiet periods.

Product implication:

- grouping and temporary notification suppression are familiar patterns;
- Lunowa should distinguish continued background monitoring from human notification availability.

## Microsoft Copilot / Cowork — scheduled and event-driven operation

Sources:

- https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork
- https://support.microsoft.com/en-US/Microsoft-365-Copilot/schedule-your-most-used-copilot-prompts
- https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-cowork
- https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/

Current behavior:

- scheduled prompts can generate morning briefings, follow-up summaries, and end-of-day summaries;
- event-driven tasks run on matching email or Teams events instead of requiring the user to watch manually;
- event-driven tasks expose trigger/instructions/permissions and default external shared actions to draft-and-approve;
- Cowork presents tasks that need input, are in progress, complete, or scheduled;
- current Microsoft material explicitly positions push notifications for meaningful checkpoints such as approval/input/completion so users need not monitor long-running tasks continuously.

Product implication:

- event-driven background stewardship and optional scheduled briefing are current frontier patterns;
- briefing is a projection, not necessarily the core monitoring mechanism;
- notification at meaningful checkpoints rather than every internal step aligns with Lunowa's Attention Delegation thesis.

---

# 2. Notification interruption evidence

## Fitz et al. — batching smartphone notifications

Citation:

Nicholas S. Fitz, Kostadin Kushlev, Ranjan Jagannathan, Terrel Lewis, Devang Paliwal, Dan Ariely. “Batching smartphone notifications can improve well-being.” Computers in Human Behavior 101 (2019), 84–94. DOI: 10.1016/j.chb.2019.07.016.

Useful source pages:

- https://scholars.duke.edu/publication/1402953
- https://doi.org/10.1016/j.chb.2019.07.016

Study:

- randomized field experiment;
- n=237;
- notifications as usual vs batched vs never;
- batching three times per day produced improvements in several self-reported attention/well-being/control outcomes compared with usual notifications;
- complete notification removal produced fewer benefits and increased anxiety/FoMO.

Product implication:

- unpredictable continuous notification is costly;
- complete silence is not automatically optimal;
- predictable batching is a credible direction for standard, delay-tolerant attention returns.

Critical limitation:

- 2019 smartphone notification study, not email coordination or Lunowa;
- the exact `three times/day` cadence must NOT be promoted into Lunowa Product truth.

## Mark et al. — email duration / batching behavior

Source:

- https://www.microsoft.com/en-us/research/wp-content/uploads/2016/06/Email20Duration20Camera20Ready20submission3-1.pdf

Study context:

- 40 information workers over 12 days;
- longer email duration associated with lower perceived productivity and higher stress;
- people who clustered email use (“Batchers”) reported higher end-of-day productivity than notification-driven/continuous checking patterns.

Product implication:

- reducing notification-triggered mail checking is directionally aligned with Lunowa.

Limitations:

- older observational workplace evidence;
- does not establish a specific optimal batching schedule.

---

# 3. Proactive AI intervention timing

## Kuo et al. — Developer Interaction Patterns with Proactive AI (IUI 2026)

Sources:

- https://doi.org/10.1145/3742413.3789148
- https://research.tudelft.nl/en/publications/developer-interaction-patterns-with-proactive-ai-a-five-day-field/

Study:

- 15 developers;
- 5-day in-the-wild field study;
- 229 proactive interventions across 5,732 interaction points;
- workflow-boundary interventions reached 52% engagement;
- mid-task interventions were dismissed 62% of the time;
- well-timed proactive suggestions required less interpretation time than reactive suggestions in reported analysis.

Product implication:

- timing relative to human workflow matters, not merely semantic importance;
- mid-task interruption can be systematically unwelcome;
- a predictable or boundary-aware delivery policy is more defensible than immediate interruption on every new Attention Need.

Critical limitation:

- coding/IDE domain, small sample;
- Lunowa v1 should not pretend to infer universal “best moment” from these results.

## Chen et al. — active vs passive AI reflection (CHI 2025)

Sources:

- https://www.microsoft.com/en-us/research/publication/are-we-on-track-ai-assisted-active-and-passive-goal-reflection-during-meetings/
- https://doi.org/10.1145/3706598.3714052

Study:

- technology probe with 15 knowledge workers;
- passive ambient feedback helped maintain focus with less disruption;
- active intervention triggered immediate reflection/action but risked disrupting conversational flow;
- authors emphasize adapting intervention intensity and timing and preserving user control.

Product implication:

- surface visibility and interruption are separate design levers;
- passive awareness and active action-return should be distinct lanes.

Critical limitation:

- meeting domain, exploratory probe, small sample.

---

# 4. Daily briefing patterns

## Microsoft scheduled prompts / Cowork daily briefing

Sources:

- https://support.microsoft.com/en-US/Microsoft-365-Copilot/schedule-your-most-used-copilot-prompts
- https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/

Current pattern:

- users can schedule a morning briefing, weekly follow-up summary, or end-of-day action-item recap;
- scheduled prompt can optionally email the user when the response is ready;
- Cowork includes daily briefing as a built-in use case/skill.

Product implication:

- morning/evening briefing is familiar and potentially useful;
- the current products make this user-selected/scheduled rather than proving that every user needs a mandatory ritual.

Lunowa inference:

- briefing should remain optional unless Lunowa-specific evidence proves it improves monitoring relinquishment;
- core monitoring must not depend on a daily briefing being reviewed.

---

# 5. Synthesis for Lunowa

The evidence supports a direction, not a fixed notification schedule:

```text
internal event handling
  continuous/event-driven

external human delivery
  sparse / importance alone insufficient

non-actionable progress
  silent

awareness-only outcomes
  passive / catch-up

ordinary actionable return
  current immediately in Product state;
  external interruption preferably predictable/grouped

high-delay-cost actionable return
  immediate only under explainable accepted criteria

monitoring integrity loss
  separate degraded-state lane;
  delivery urgency based on affected delegated contracts
```

Strongest Product invariant:

> **A user should not have to open Lunowa every day for Lunowa to keep its monitoring promise.**

Strongest anti-pattern:

> **Do not translate every source event into human attention.**

---

# 6. Claims deliberately NOT established by this review

This review does not establish that:

- three notification batches per day is optimal for Lunowa;
- morning briefings improve Lunowa retention or task outcomes;
- a particular quiet-hours default is universally correct;
- AI can reliably detect users' workflow boundaries from email/device context;
- a specific percentage/confidence threshold defines urgency;
- all users prefer batching over immediate delivery;
- awareness needs a separate permanent Product surface;
- fewer sessions/opens automatically means Product success;
- current vendor features are accurate, popular, or effective beyond what their official documentation claims.

These remain Product questions requiring Lunowa-specific validation.
