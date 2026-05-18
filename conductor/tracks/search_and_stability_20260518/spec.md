# Spec: Search and Stability Fixes

## Problems

1. Vietnamese and Japanese text is displayed as mojibake in the app and documentation.
2. Kanji stroke order no longer draws reliably after the recent refactor.
3. The sticky header still uses transparency/backdrop blur, so content remains visible behind it during scroll.
4. Search is currently a single generic text search. Users need explicit search modes: romaji, Vietnamese meaning, kana, kanji, and handwriting input.
5. Vocabulary entries do not yet expose Han Viet meaning.
6. Kanji radical data does not yet expose the radical `element` and `original` shape fields from the SVG reference.

## Target Behavior

- All visible app copy, seed data used by the UI, and relevant conductor docs render as valid UTF-8 Vietnamese/Japanese text.
- Kanji stroke order renders all stroke paths, supports replay, and does not fail because path length state is unavailable.
- Header uses a fully opaque background and covers content behind it.
- Search page has clear mode controls. Each mode sends an explicit search type to the backend and returns ranked, predictable results for that mode.
- Handwriting search has a usable first implementation with drawing, clear, undo, and search controls.
- Vocabulary API/types/UI include a Han Viet field when the data is available.
- Kanji API/types/UI include radical `element` and `original`, and the UI shows both values in the radical section.

## Non-Goals

- Full lesson/community platform features are out of scope for this track.
- A complete handwriting recognition model is not required in the first code batch unless a suitable local library/data source is already available.
- Design mockups in `design/` are not pushed or required for this track.

## Quality Gates

- Frontend: `npm run lint` and `npm run build` pass.
- Backend: `npm run lint`, `npm test`, and `npm run test:cov` pass.
- Search service changes include Jest coverage for each search mode.
- Han Viet and radical field changes include backend service tests and frontend type updates.
- Manual verification covers desktop and mobile header/search behavior.
