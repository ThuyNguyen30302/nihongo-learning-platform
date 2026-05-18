# Issue 007: Encoding and doc cleanup

Status: `open`

## Goal

Dọn các chuỗi mojibake và tài liệu lỗi encoding để repo dễ đọc hơn.

## Scope

- `conductor/*`
- Backend seed/import files nếu có encoding lỗi
- Frontend strings/docs nếu phát hiện mojibake

## Steps

1. Lập danh sách file bị lỗi encoding.
2. Sửa dần theo từng nhóm nhỏ.
3. Kiểm tra lại diff và rendering của file.

## Acceptance

- File tài liệu và string chính hiển thị đúng.
- Không sửa lan sang phần chưa audit.

## Completion Rule

Chỉ đóng issue sau khi sửa xong, commit xong và user duyệt.
