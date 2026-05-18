# Plan: Project Reorganization

Ngày tạo: 2026-05-18

Đây là plan/track cho đợt quy hoạch lại dự án Japan Dict. Quy trình chung vẫn nằm ở `conductor/workflow.md`; track này chỉ định nghĩa phạm vi, issue con và thứ tự ưu tiên thực hiện.

## Goal

- Dọn cấu trúc dự án để dễ bảo trì hơn.
- Loại bỏ page, component, class, script hoặc style dư thừa sau khi đã audit rõ usage.
- Đảm bảo backend mỗi service có Jest unit test tương ứng.
- Chuẩn bị kế hoạch thêm nghĩa Hán Việt cho từ vựng.
- Chuẩn bị kế hoạch hiển thị radical `element` và `original` từ SVG tham khảo.
- Sửa header để không trong suốt hoặc che chữ khi scroll.

## Issue Map

Issue chỉ được hoàn thành sau khi code đã commit và user đã duyệt.

- [Issue 001](./issues/001-audit-and-cleanup-scope.md): Audit phạm vi và xác nhận phần dư thừa
- [Issue 002](./issues/002-backend-jest-tests.md): Thêm Jest test cho từng backend service
- [Issue 003](./issues/003-shared-header-layout.md): Gom header/nav dùng chung và sửa header scroll
- [Issue 004](./issues/004-remove-dead-assets-and-components.md): Xóa asset/component/page dư thừa sau audit
- [Issue 005](./issues/005-han-viet-data-model.md): Thiết kế và triển khai nghĩa Hán Việt cho từ vựng
- [Issue 006](./issues/006-radical-element-original.md): Thiết kế và triển khai radical `element` / `original`
- [Issue 007](./issues/007-encoding-and-doc-cleanup.md): Dọn encoding mojibake và tài liệu lỗi

## Working Rules

1. Không xóa code chỉ vì nhìn có vẻ cũ. Chỉ xóa khi đã kiểm tra bằng `rg`, lint/build/test và xác nhận không còn usage.
2. Không trộn refactor lớn với feature mới.
3. Backend service nào thay đổi thì service đó phải có Jest test kèm theo.
4. Thay đổi dữ liệu phải có đường migrate/import rõ ràng.
5. Header/navigation nên dùng component chung thay vì copy ở từng page.
6. Mỗi issue chỉ nên chạm một nhóm thay đổi có thể kiểm tra độc lập.

## Execution Order

1. Audit phạm vi.
2. Viết và chạy backend Jest tests.
3. Gom shared header/nav và sửa header scroll.
4. Xóa phần dư thừa sau audit.
5. Thêm nghĩa Hán Việt.
6. Thêm radical `element` và `original`.
7. Dọn encoding/tài liệu còn lỗi.

## Definition of Done

- Backend services có test riêng.
- Frontend build/lint pass sau khi refactor.
- Các API thay đổi đã cập nhật type backend và frontend.
- Issue chỉ được đóng sau khi commit code xong và user đã duyệt.
