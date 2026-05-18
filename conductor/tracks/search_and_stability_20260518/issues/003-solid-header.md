# Issue 003: Solid header

## Goal

Make the sticky header fully cover content behind it during scroll.

## Scope

- `frontend/src/components/AppHeader.tsx`
- Any layout CSS needed to support sticky header behavior.

## Steps

1. Remove translucent background classes and backdrop blur from the header.
2. Use an opaque surface color that matches the app theme.
3. Verify desktop and mobile scroll behavior on search/detail/favorites/flashcards pages.

## Acceptance Criteria

- Content behind the header is not visible while scrolling.
- Header remains sticky and visually consistent.
- Frontend lint/build pass.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
