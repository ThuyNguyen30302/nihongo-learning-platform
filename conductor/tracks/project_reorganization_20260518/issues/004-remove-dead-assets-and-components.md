# Issue 004: Remove dead assets and components

Status: `open`

## Goal

Xóa phần dư thừa sau khi audit xong.

## Scope

- `frontend/public/*`
- `frontend/src/components/*`
- `frontend/src/app/*` nếu route/page thật sự không còn dùng
- `backend/scripts/*` nếu script đã trùng hoặc không còn nhiệm vụ

## Steps

1. Chỉ xóa khi có bằng chứng usage không còn.
2. Chạy lint/build/test sau mỗi lượt xóa lớn.
3. Ghi lại lý do xóa trong summary của issue.

## Acceptance

- File bị xóa không còn import/usage.
- Build và lint vẫn pass.

## Completion Rule

Issue này chỉ được đóng sau khi cleanup đã commit và user duyệt.
