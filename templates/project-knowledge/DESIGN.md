# Design

Use this document only when durable UX/interaction guidance materially helps implementation. Move detailed feature behavior to feature specs rather than growing this file indefinitely.

## Status

Draft / Accepted

## UX goal

What should the product feel easy, fast, safe, or clear to accomplish?

## Primary user flow

Describe the critical path at a level that constrains implementation.

## Information architecture

What major information/entities are presented, and how are they organized?

## Interaction principles

List durable interaction rules, for example:

- preserve user context across navigation,
- prefer direct manipulation over hidden modes,
- make destructive actions explicit and recoverable where practical.

## Visual / design-system principles

Document only implementation-relevant rules such as typography scale, spacing system, component library, density, or visual hierarchy. Link to an external design source when that is authoritative instead of duplicating it.

## Responsive behavior

Define meaningful layout/interaction changes across supported viewport/device classes when relevant.

## Required states

For important surfaces, define the expected behavior for:

- loading,
- empty,
- error,
- success,
- disabled/read-only,
- offline/degraded states where relevant.

## Accessibility

Document project-specific accessibility expectations, target standards, keyboard/screen-reader requirements, reduced motion, contrast, or other constraints where relevant.

## Component strategy

State whether the project uses an existing design system/component library and any rules that prevent unnecessary custom implementations.

## Related specs / references

Link feature specs, screenshots/prototypes, external design files, or decision records that are authoritative.