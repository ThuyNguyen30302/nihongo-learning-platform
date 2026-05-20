# Issue 011: Example sentence hover UI

## Goal

Replace plain example sentence text with a reusable interactive component that highlights the hovered Japanese token and the aligned Vietnamese meaning phrase.

## Scope

- `frontend/src/components`
- Word detail page
- Word cards
- Flashcards

## Steps

1. Create a reusable example sentence component.
2. Render Japanese tokens as hoverable spans with the token POS in the title.
3. Render the Vietnamese translation as aligned spans that react to the hovered token.
4. Swap the current plain example sentence markup in all surfaces that show examples.

## Acceptance

- Hovering a Japanese token highlights that token and the matched Vietnamese phrase.
- The same component can be reused anywhere example sentences appear.
- Surfaces without example data continue to render normally.

