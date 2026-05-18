# Issue 002: Kanji stroke rendering

## Goal

Restore Kanji stroke order rendering on the word detail page.

## Scope

- `frontend/src/components/KanjiStrokeOrder.tsx`
- `frontend/src/app/word/[id]/page.tsx`
- `backend/src/kanji/*` only if the stroke API returns invalid data.

## Steps

1. Verify whether the backend returns valid `stroke_paths` and `stroke_numbers`.
2. Add focused tests or component-level checks for non-empty stroke path rendering.
3. Replace fixed path lengths with real SVG path measurement where needed.
4. Add replay/reset behavior if current animation state gets stuck after completion.
5. Manually verify at least one kanji with multiple strokes.

## Acceptance Criteria

- Stroke paths are visible.
- Animation progresses stroke by stroke.
- Stroke numbers appear in sequence.
- Empty data still shows a graceful fallback.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
