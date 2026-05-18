# Issue 005: Search mode UI

## Goal

Expose clear search mode controls on the search page.

## Scope

- `frontend/src/app/search/SearchPageClient.tsx`
- `frontend/src/components/SearchBar.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/types.ts`

## Steps

1. Add a compact segmented control for search mode.
2. Persist mode in the URL query string, for example `?q=nihon&type=romaji`.
3. Update autocomplete/suggestions to use the selected type.
4. Display the active mode near result count.
5. Ensure mobile layout stays usable.

## Acceptance Criteria

- User can switch between romaji, Vietnamese, kana, and kanji search.
- Search mode survives refresh/back navigation through URL params.
- UI does not overlap or resize awkwardly on mobile.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
