# Issue 006: Radical element/original

Status: `open`

## Goal

Hiển thị bộ thủ trong chữ Hán cùng `element` và `original` từ file SVG tham khảo.

## Scope

- Parser/import radical data
- `backend/src/kanji/*`
- `frontend/src/lib/types.ts`
- `frontend/src/components/KanjiBreakdown.tsx`
- Kanji detail/word detail UI

## Steps

1. Xác định SVG metadata source.
2. Thiết kế lưu trữ data `element` và `original`.
3. Cập nhật API và UI.
4. Thêm test cho parse data hợp lệ và lỗi.

## Acceptance

- Kanji có data thì hiện đúng `element` và `original`.
- Kanji thiếu data thì fallback gọn.

## Completion Rule

Chỉ đóng issue sau khi feature được commit và user duyệt.
