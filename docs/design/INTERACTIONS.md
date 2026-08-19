# Lunowa Interactions

This document is the textual source of truth for interaction behavior.

## Status

Scaffold only. Detailed interaction specifications will be added after the visual references are committed.

## Scope

This document will define behavior that screenshots alone cannot specify reliably, including:

- Conversation-row versus status-chip click behavior.
- Conversation view versus Moment View behavior.
- Temporal Contract behavior and resurfacing conditions.
- Lifecycle states and state transitions.
- Multiple action items inside one conversation.
- Composer behavior, drafts, send, send later, and inline completion.
- Search behavior and context preservation.
- Pinning, menus, attachment preview, and account/scope switching.
- Trust behavior such as provenance, undo, safe fallbacks, and uncertainty handling.

## Initial invariant

Normal conversation-row click opens the Conversation view. A status chip opens the corresponding Moment View. Moment View is contextual and must not become an unavoidable intermediate screen for ordinary conversation reading.
