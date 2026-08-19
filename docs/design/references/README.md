# Lunowa Visual References

This directory contains the canonical visual references used to implement Lunowa.

## Naming convention

Use lowercase English `kebab-case` file names with a two-digit numeric prefix.

Do not use temporary names such as `final`, `new`, `latest`, dates, or generated names such as `imagegen.png`.

## Reference priority

When screenshots conflict:

1. Follow the current textual design specification in `docs/design/`.
2. `00-brand-system.png` is canonical for brand identity and visual language.
3. `01-component-system.png` is canonical for reusable component appearance and states.
4. `02-desktop-conversation-default.png` is canonical for the desktop shell and default layout.
5. State/feature-specific images are canonical only for the behavior or state they are intended to demonstrate.

A state-specific screenshot must not silently redefine the global shell, typography, colors, spacing, or component system.

## Planned reference files

### Foundation

- `00-brand-system.png`
  - Brand identity, logo usage, color system, typography, radius, shadows, icon direction, spacing tone.
- `01-component-system.png`
  - Buttons, status chips, fields, tabs, avatars, conversation rows, attachment chips, composer, menus, hover/focus/disabled states, resize handles.

### Desktop core and Moment View

- `02-desktop-conversation-default.png`
  - Canonical desktop three-pane shell. Normal conversation-row click opens the Conversation view.
- `03-moment-action-required.png`
  - Moment View for an action-required conversation; one primary question and one primary action.
- `04-moment-deferred.png`
  - Deferred / Temporal Contract state; when the conversation returns and what can bring it back earlier.
- `05-moment-waiting.png`
  - Waiting state; whose turn it is and when Lunowa will re-check.
- `06-moment-follow-up.png`
  - Follow-up state after no reply; prepared follow-up and primary action.
- `07-moment-completed.png`
  - Completed state; quiet confirmation that no action is required.
- `08-moment-multiple-tasks.png`
  - Multiple action items in one conversation while preserving one primary task for the current moment.

### Everyday mail functions

- `09-compose-new-email.png`
  - New-message composer: From, To, Cc/Bcc, Subject, body, signature, attachments, formatting, draft state, send, send later, minimize/close.
- `10-search-mode.png`
  - Search results, result types, selected result, match highlighting, and retained detail context.
- `11-person-context-panel.png`
  - Person/company context side sheet without turning Lunowa into a CRM.
- `12-attachment-preview.png`
  - In-place attachment preview with context preservation.

### Navigation and account management

- `13-navigation-and-actions.png`
  - Sidebar `Other`, conversation-level menus, individual-message menus, hover actions, and secondary commands.
- `14-scope-account-management.png`
  - Work/personal/university scopes, All scope, provider accounts, add/reconnect account, sender-account selection.

### Entry, settings, and system states

- `15-onboarding-multi-account.png`
  - Minimal first-run account connection and optional second-account flow.
- `16-settings.png`
  - General, accounts, grouping/separation, appearance, and privacy settings.
- `17-system-states.png`
  - Loading, syncing, offline, send failure, reconnect, empty state, and attachment failure examples.

### Responsive

- `18-tablet-layout.png`
  - Tablet shell and pane-collapse behavior.
- `19-mobile-layout.png`
  - Mobile list/detail views, navigation, Moment View/Conversation switching, composer, and primary actions.

## How to add the images

Drag each image into this directory in GitHub and rename it to the matching canonical file name above before committing.

If a reference does not yet exist, leave it absent rather than creating an unrelated placeholder image.

## Images vs. text specifications

Images are authoritative for visual appearance, hierarchy, density, relative sizing, and component placement.

Markdown specifications are authoritative for behavior, state transitions, exact rules, edge cases, accessibility, responsive breakpoints, and conflict resolution.
