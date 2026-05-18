# Issue 001: Audit and cleanup scope

Status: `open`

## Goal

Lập danh sách chính xác page, component, class, script và asset đang dùng để tránh xóa nhầm.

## Scope

- `frontend/src/app/**/*`
- `frontend/src/components/**/*`
- `backend/src/**/*`
- `frontend/public/*`
- `backend/scripts/*`

## Steps

1. Chạy audit usage bằng `rg`.
2. Ghi danh sách file/route/component/service đang còn được dùng.
3. Phân loại phần dư thừa, phần giữ lại, phần cần refactor.

## Acceptance

- Có danh sách usage rõ ràng.
- Có danh sách candidate cleanup được xác minh.
- Không xóa file ở issue này.

## Completion Rule

Issue này chỉ được đánh dấu xong sau khi audit được ghi nhận và user duyệt danh sách cleanup.
