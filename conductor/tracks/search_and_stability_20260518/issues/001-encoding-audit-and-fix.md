# Issue 001: Encoding audit and fix

## Goal

Fix broken Vietnamese/Japanese text display across the app and identify where mojibake enters the system.

## Scope

- Frontend visible strings in `frontend/src`.
- Backend seed/sample data in `backend/src/database/database.service.ts`.
- Conductor docs that users read during planning.
- Database/import path only if runtime data is generated from mojibake source.

## Steps

1. Search for mojibake patterns such as `Ã`, `Â`, `Ä`, `áº`, `ã`, `æ`, and `â`.
2. Classify each occurrence as source text, generated data, or legacy documentation.
3. Fix visible UI strings first.
4. Fix backend seed/sample data and tests.
5. Add a lightweight guardrail script or test if practical to detect common mojibake in source files.

## Acceptance Criteria

- Main pages show readable Vietnamese and Japanese text.
- Backend tests pass after seed data cleanup.
- A documented checklist exists for future encoding-sensitive imports.

## Completion Rule

Do not mark complete until code is committed and user approval is recorded.
