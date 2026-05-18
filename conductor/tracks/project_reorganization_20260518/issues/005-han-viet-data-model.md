# Issue 005: Han Viet data model

Status: `open`

## Goal

Thêm nghĩa Hán Việt cho từng từ vựng và hiển thị ở các màn hình cần thiết.

## Scope

- Backend word model và migration/import scripts
- `backend/src/dictionary/*`
- `frontend/src/lib/types.ts`
- `frontend/src/components/WordListItem.tsx`
- `frontend/src/components/WordCard.tsx` nếu cần

## Steps

1. Chốt nguồn dữ liệu Hán Việt.
2. Thiết kế field hoặc bảng phù hợp.
3. Cập nhật API và types frontend.
4. Thêm Jest test cho mapping dữ liệu.

## Acceptance

- Search/word detail trả và hiển thị Hán Việt.
- Không làm rối UI hiện có.

## Completion Rule

Chỉ đóng issue sau khi backend và frontend đã được commit, rồi user duyệt.
