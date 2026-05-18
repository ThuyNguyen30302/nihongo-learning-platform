# Issue 002: Backend Jest tests

Status: `open`

## Goal

Thêm hoặc hoàn thiện Jest unit test cho mỗi backend service.

## Scope

- `backend/src/dictionary/dictionary.service.ts`
- `backend/src/kanji/kanji.service.ts`
- `backend/src/favorites/favorites.service.ts`
- `backend/src/database/database.service.ts`

## Steps

1. Kiểm tra test naming/style hiện có trong backend.
2. Tạo `*.spec.ts` cạnh từng service.
3. Cover happy path và error/not-found path.
4. Chạy `npm test` và `npm run test:cov`.

## Acceptance

- Mỗi service có test riêng.
- Test pass ổn định, không dùng database thật.
- Coverage mới không bị bỏ trống ở phần logic thêm mới.

## Completion Rule

Chỉ đóng issue sau khi code đã commit và user duyệt kết quả test.
