# Issue 008: Kanji radical element/original

## Goal

Add radical `element` and `original` fields for Kanji, sourced from the SVG/reference data, and display both values in the Kanji radical section.

## Scope

- Kanji data schema and import scripts.
- `backend/src/kanji/*` API mapping.
- Frontend `KanjiInfo` type.
- Word detail Kanji radical UI.
- Tests for Kanji service parsing/response shape.

## Steps

1. Locate the SVG/reference source fields for `element` and `original`.
2. Add nullable `radical_element` and `radical_original` fields to Kanji data.
3. Update import/update scripts so data is populated from reference files.
4. Update Kanji service/controller response mapping.
5. Update frontend type and radical UI to show:
   - the radical component present in the kanji (`element`)
   - the original radical shape (`original`)
6. Add tests for Kanji with both fields, one missing field, and no radical metadata.

## Acceptance Criteria

- Kanji API returns `radical_element` and `radical_original`.
- UI shows both values clearly when available.
- Missing values degrade gracefully.
- Backend tests cover the response shape.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
