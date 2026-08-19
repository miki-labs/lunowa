# Lunowa Responsive Design

This document is the textual source of truth for responsive behavior across desktop, tablet, and mobile layouts.

## Status

Scaffold only. Exact breakpoints and pane-collapse rules will be finalized after the responsive visual references are committed.

## Principles

- Preserve the user's current context whenever possible.
- Avoid unnecessary full-page navigation on wider layouts.
- Desktop uses the canonical three-pane shell.
- Narrower layouts progressively collapse or hide panes rather than reproducing the desktop layout at unusable widths.
- Conversation state, draft state, selected item, and navigation context should survive layout changes.
- Resizable panes are part of the desktop interaction model; responsive collapse is a separate behavior.

## Planned visual references

- `references/18-tablet-layout.png`
- `references/19-mobile-layout.png`
