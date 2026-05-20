# Plan: Example Sentence Hover Alignment

Created: 2026-05-20

This track follows the conductor workflow: define scope, add structured example metadata where the data currently lives, then wire the result into every example sentence surface in the app.

## Issue Map

- [Issue 010](./issues/010-token-alignment-helpers.md): Add structured example annotations to the backend word payloads
- [Issue 011](./issues/011-example-sentence-hover-ui.md): Replace plain example sentence rendering with a reusable hover/highlight component across word detail, word cards, and flashcards

## Execution Order

1. Add structured example annotations first so the UI can stay small and focused.
2. Wire the reusable component into every place that renders example sentences.
3. Verify the hover state, highlighted translation spans, and POS titles in the browser.
