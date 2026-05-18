# Spec: Quy hoạch lại dự án Japan Dict

## Problem

Dự án đang có frontend Next.js và backend NestJS với nhiều phần đã phát triển theo từng track riêng. Hiện cần một track tổng hợp để dọn cấu trúc, giảm lặp UI, loại bỏ phần dư thừa, bổ sung test backend bằng Jest và chuẩn bị các thay đổi dữ liệu mới.

## Goals

- Loại bỏ page, component, class, asset hoặc script dư thừa sau khi đã audit rõ usage.
- Đảm bảo mỗi backend service có Jest unit test tương ứng.
- Gom các phần header/footer/mobile nav lặp lại thành component dùng chung nếu audit xác nhận hợp lý.
- Sửa header để không trong suốt hoặc đè chữ khi scroll.
- Lập kế hoạch triển khai nghĩa Hán Việt cho từng từ vựng.
- Lập kế hoạch hiển thị radical `element` và `original` từ SVG tham khảo.

## Non-Goals

- Không xóa code chưa được audit.
- Không triển khai đồng thời toàn bộ feature Hán Việt và radical trong cùng một refactor cleanup.
- Không đổi tech stack nếu chưa cập nhật `conductor/tech-stack.md`.

## Acceptance Criteria

- Track có plan rõ theo phase.
- Backend service tests được thêm theo từng service trước hoặc cùng lúc với refactor liên quan.
- Frontend build/lint pass sau khi dọn component hoặc header.
- API changes cho Hán Việt/radical có cập nhật type backend, frontend và test.
