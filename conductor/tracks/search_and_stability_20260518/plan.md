# Plan: Search and Stability Fixes

Created: 2026-05-18

Current state: implemented and partially approved. Search mode splitting was reverted on 2026-05-19 per user request; search is unified again.

This track fixes the current visible defects first, then adds richer dictionary search modes. It follows the global workflow in `conductor/workflow.md`: plan first, tests before behavior changes where practical, commit code, then wait for user approval before closing issues.

## Issue Map

- [Issue 001](./issues/001-encoding-audit-and-fix.md) / GitHub [#1](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/1): Fix Vietnamese/Japanese mojibake and establish UTF-8 guardrails
- [Issue 002](./issues/002-kanji-stroke-rendering.md) / GitHub [#2](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/2): Restore Kanji stroke rendering and replay behavior
- [Issue 003](./issues/003-solid-header.md) / GitHub [#3](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/3): Make the sticky header fully opaque
- [Issue 004](./issues/004-search-mode-backend.md) / GitHub [#4](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/4): Add backend search modes for romaji, Vietnamese, kana, and kanji
- [Issue 005](./issues/005-search-mode-ui.md) / GitHub [#5](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/5): Add search mode UI and route queries by mode
- [Issue 006](./issues/006-handwriting-search.md) / GitHub [#6](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/6): Add handwriting search entry point
- [Issue 007](./issues/007-word-han-viet.md) / GitHub [#7](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/7): Add Han Viet meaning for vocabulary words
- [Issue 008](./issues/008-kanji-radical-element-original.md) / GitHub [#8](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/8): Add radical element and original shape fields for kanji
- [Issue 009](./issues/009-end-to-end-verification.md) / GitHub [#9](https://github.com/ThuyNguyen30302/nihongo-learning-platform/issues/9): Run full verification and update track status after user approval

## Execution Order

1. Fix encoding first because broken text affects every page and test expectation.
2. Fix Kanji stroke rendering next because it is a regression in a core dictionary detail page.
3. Fix header opacity as a small isolated UI change.
4. Add backend search types with Jest tests.
5. Add frontend search mode controls and API typing.
6. Add Han Viet vocabulary meaning after encoding is stable, because it touches dictionary data and display contracts.
7. Add radical `element` and `original` fields after Kanji API/data shape is confirmed.
8. Add handwriting search as a separate issue because it has the most uncertainty.
9. Verify the complete flow and only then request user approval for closure.

## Risk Notes

- The encoding issue may exist in source files, seed data, database import files, and docs. We must identify source of truth before rewriting strings.
- Existing `backend/JMdict_e` and `backend/OmohaDictionary` are large files already pushed. Future data handling should consider Git LFS or external import artifacts.
- Kanji stroke rendering may require measuring real SVG path length in the browser instead of using fixed `300` path lengths.
- Han Viet vocabulary data needs a clear source and should not be guessed from Japanese meaning alone.
- Radical `element` and `original` should be parsed from the SVG reference data rather than duplicated manually in UI code.
- Handwriting search should be designed so a basic candidate-based flow can ship before full recognition if recognition data/library needs more research.

## Definition of Done

- Visible Vietnamese and Japanese copy renders correctly in the app.
- Header no longer reveals content behind it when scrolling.
- Kanji stroke order draws and can be replayed.
- Search supports explicit modes for romaji, Vietnamese meaning, kana, and kanji.
- Vocabulary detail/list cards can show Han Viet meaning where available.
- Kanji radical display includes both the radical element present in the character and the original radical shape from reference data.
- Handwriting search has a committed implementation plan or working entry point depending on library feasibility.
- Relevant frontend/backend checks pass.
- No issue is marked complete until the code is committed and the user approves it.

## Implementation Record

- Issue 001: implemented in commit `b690bb8` with UTF-8/mojibake guard test.
- Issue 002: implemented in commit `70247da` with path-length based stroke animation.
- Issue 003: implemented in commit `d0a459c` with a fully opaque sticky header.
- Issue 004: implemented in commit `373c516` with backend `type` search support and Jest coverage, then superseded on 2026-05-19 by unified backend search.
- Issue 005: implemented in commit `8422bcb` with frontend search mode controls and API typing, then superseded on 2026-05-19 by unified search UI.
- Issue 006: implemented in commit `324f7fa` as a handwriting search entry point with manual candidate submission; automatic recognition is still deferred.
- Issue 007: implemented in commit `dc46932` with vocabulary `han_viet` data and UI display.
- Issue 008: implemented in commit `5263c04` with KanjiVG-derived `radical_element` and `radical_original`.
- Issue 009: automated checks passed before push: backend Jest coverage, backend lint, frontend lint, and frontend build. Browser/manual verification remains the next approval step.
