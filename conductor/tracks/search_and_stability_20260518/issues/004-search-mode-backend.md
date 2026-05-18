# Issue 004: Search mode backend

## Goal

Support explicit dictionary search modes in the backend.

## Scope

- `backend/src/dictionary/dictionary.controller.ts`
- `backend/src/dictionary/dictionary.service.ts`
- `backend/src/database/database.service.ts`
- Jest specs for dictionary/database search behavior.

## Search Types

- `romaji`
- `vietnamese`
- `kana`
- `kanji`
- `auto`

## Steps

1. Add a typed `type` query parameter to `/api/search`.
2. Add backend validation/defaulting for unsupported search types.
3. Implement mode-specific database queries and ranking.
4. Keep `auto` behavior backward compatible.
5. Add Jest tests for each mode and edge cases.

## Acceptance Criteria

- `/api/search?q=nihon&type=romaji` searches romaji.
- `/api/search?q=Nhật&type=vietnamese` searches Vietnamese meaning.
- `/api/search?q=にほん&type=kana` searches kana.
- `/api/search?q=日本&type=kanji` searches kanji.
- Existing `/api/search?q=...` continues to work.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
