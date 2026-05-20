# Issue 010: Structured example annotations

## Goal

Add structured example metadata to the backend word payloads so the hover UI can highlight exact Japanese token spans and the matching Vietnamese phrase spans without guessing from flat strings.

## Scope

- Backend word payloads
- `GET /api/search`
- `GET /api/word/:id`
- `GET /api/favorites`
- Example sentence annotation shape

## Steps

1. Define a structured annotation shape for example sentences, including Japanese token spans, Vietnamese spans, and POS metadata.
2. Extend the backend payloads that currently return flat example strings to include the structured annotation.
3. Preserve backward compatibility by keeping the flat example strings in place for now.
4. Add tests around the new payload shape and the mapping in each backend response path.

## Acceptance

- The example sentence payload includes structured token and span data.
- Existing example sentence consumers still receive the flat text fields.
- Payloads returned by search, word detail, and favorites stay in sync.
