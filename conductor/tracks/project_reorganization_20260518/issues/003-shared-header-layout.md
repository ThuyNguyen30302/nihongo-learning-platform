# Issue 003: Shared header layout

Status: `open`

## Goal

Gom header/nav dùng chung và sửa header để không trong suốt khi scroll.

## Scope

- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/search/page.tsx`
- `frontend/src/app/word/[id]/page.tsx`
- `frontend/src/app/favorites/page.tsx`
- `frontend/src/app/flashcards/page.tsx`
- Shared UI component mới nếu cần

## Steps

1. Xác định phần header/nav đang lặp.
2. Tạo component dùng chung nếu hợp lý.
3. Áp nền header đặc hơn khi sticky.
4. Kiểm tra desktop và mobile không bị đè chữ.

## Acceptance

- Header đọc rõ khi scroll.
- Không có header copy/paste ở nhiều page nếu đã gom được.

## Completion Rule

Chỉ đóng issue sau khi UI được kiểm tra và user duyệt.
