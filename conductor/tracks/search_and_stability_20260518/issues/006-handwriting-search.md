# Issue 006: Handwriting search

## Goal

Add a handwriting search entry point for users who want to search by drawing a kanji.

## Scope

- Frontend handwriting canvas/component.
- Search page integration.
- Backend endpoint only if recognition is handled server-side.

## Steps

1. Evaluate whether an existing local/browser handwriting recognition library fits the project.
2. If feasible, implement a canvas that produces candidate kanji.
3. If recognition is not feasible in the first pass, implement the canvas UI behind a clear planned state and keep the issue open.
4. Send recognized candidate kanji into `type=kanji` search.
5. Add manual verification steps for mouse and touch input.

## Acceptance Criteria

- User can open handwriting search from the search page.
- User can draw, clear, and submit candidate input.
- Recognized or selected kanji triggers kanji search.
- The implementation is honest about any limitation if full recognition is deferred.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
