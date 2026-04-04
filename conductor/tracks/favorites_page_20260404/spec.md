# Specification: Favorites Page Feature

## Overview
- **Track ID**: favorites_page_20260404
- **Type**: Feature
- **Description**: Tạo trang `/favorites` để hiển thị danh sách từ yêu thích đã lưu

## Context
Hiện tại app đã có:
- Backend API `/api/favorites` để CRUD favorites
- Frontend có component WordCard hiển thị thông tin từ
- Icon bookmark trên WordCard để lưu/bỏ lưu từ

Cần tạo trang `/favorites` để user xem danh sách từ đã lưu.

## Functional Requirements

### 1. Trang Favorites (`/favorites`)
- Route mới trong Next.js App Router
- Layout tương tự trang chủ (header, container)
- Gọi API `GET /api/favorites` để lấy danh sách

### 2. Danh sách WordCards
- Hiển thị các WordCard đã được bookmark
- Mỗi WordCard có:
  - Kanji, kana, romaji
  - Nghĩa tiếng Việt
  - Ví dụ câu
  - Nút bookmark để bỏ lưu (unbookmark)

### 3. Xóa khỏi Favorites
- Click icon bookmark trên WordCard → gọi DELETE `/api/favorites/:wordId`
- Cập nhật UI sau khi xóa thành công

### 4. Empty State
- Khi chưa có từ yêu thích nào:
  - Hiển thị message: "Chưa có từ yêu thích nào"
  - Link "Tìm kiếm từ mới" → chuyển về trang chủ `/`

### 5. Điều hướng
- Button "Học với Flashcards" → chuyển đến `/flashcards`

## Technical Approach

### Backend
- API `/api/favorites` đã có sẵn, không cần thay đổi

### Frontend
- Tạo route `/app/favorites/page.tsx`
- Reuse existing components:
  - `WordCard` - hiển thị từ
  - `SearchBar` layout pattern
- State management: React useState + useEffect để fetch data

## Acceptance Criteria

1. [ ] Truy cập `/favorites` hiển thị danh sách từ đã bookmark
2. [ ] Mỗi WordCard có nút để bỏ bookmark
3. [ ] Bỏ bookmark thành công → từ biến mất khỏi danh sách
4. [ ] Empty state hiển thị khi không có từ nào
5. [ ] Link "Tìm kiếm từ mới" chuyển về trang chủ
6. [ ] Button "Học với Flashcards" chuyển đến `/flashcards`

## Out of Scope
- Thay đổi backend API
- Thêm tính năng edit/rename favorites
- Export favorites ra file
