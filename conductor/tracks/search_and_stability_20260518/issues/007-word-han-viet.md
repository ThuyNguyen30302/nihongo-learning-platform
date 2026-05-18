# Issue 007: Word Han Viet

## Goal

Add Han Viet meaning for vocabulary words and expose it through backend API, frontend types, and relevant UI.

## Scope

- Backend word schema/query mapping.
- Import or migration path for Han Viet vocabulary data.
- Dictionary/search/word detail API response shape.
- Frontend `Word` type and word display components.
- Jest tests for service/API mapping.

## Steps

1. Confirm the source of Han Viet vocabulary data.
2. Add a nullable `han_viet` or `meaning_han_viet` field to word data.
3. Update database initialization/import scripts so new and existing records can carry the value.
4. Update dictionary service result mapping and word detail API response.
5. Update frontend types and show Han Viet meaning where it improves comprehension.
6. Add tests for records with and without Han Viet data.

## Acceptance Criteria

- Word responses include the Han Viet field.
- UI displays Han Viet meaning when present and hides the row when absent.
- Existing words without Han Viet data do not break.
- Backend tests cover the new field.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
