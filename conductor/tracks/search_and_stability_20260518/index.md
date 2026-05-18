# Track: Search and Stability Fixes

Created: 2026-05-18
Status: Implemented, pending user approval

This track covers the current user-facing defects and the next dictionary search upgrade:

- Fix broken Vietnamese/Japanese text display caused by mojibake/encoding issues.
- Restore Kanji stroke rendering.
- Make the sticky header fully opaque so scrolled content cannot show through it.
- Keep dictionary search unified across romaji, Vietnamese meaning, kana, kanji, and handwriting input.

Detailed execution lives in [plan.md](./plan.md). Acceptance criteria live in [spec.md](./spec.md). Each issue must only be marked complete after code is committed and the user approves the result.

## Current State

Code has been implemented and pushed for issues 001-008. Issue 009 verification has passing automated checks recorded, but all GitHub/local issue checkboxes remain open until user approval is explicitly recorded.

2026-05-19 change request: explicit search mode selection was removed. Search now uses one unified query path again, while handwriting remains a separate input entry point.
