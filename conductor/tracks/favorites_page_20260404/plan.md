# Implementation Plan: Favorites Page Feature

## Context
Tạo trang `/favorites` để hiển thị danh sách từ yêu thích. Backend API đã có sẵn, chỉ cần tạo frontend page.

---

## Phase 1: Setup và Infrastructure

### Task: Create Favorites Page Route
- [ ] Create `frontend/src/app/favorites/page.tsx`
- [ ] Setup basic layout with header và container
- [ ] Add navigation link back to home

### Task: Fetch Favorites Data
- [ ] Call API `GET /api/favorites` on mount
- [ ] Handle loading state
- [ ] Handle error state

---

## Phase 2: Display WordCards

### Task: Render Favorites List
- [ ] Map through favorites data
- [ ] Render WordCard for each favorite
- [ ] Pass `onToggleFavorite` handler

### Task: Implement Unbookmark Functionality
- [ ] Create `handleRemoveFavorite(wordId)` function
- [ ] Call DELETE `/api/favorites/:wordId`
- [ ] Update local state after successful delete

---

## Phase 3: Empty State & Navigation

### Task: Empty State Component
- [ ] Show message "Chưa có từ yêu thích nào"
- [ ] Add link "Tìm kiếm từ mới" → `/`

### Task: Navigation to Flashcards
- [ ] Add button "Học với Flashcards"
- [ ] Link to `/flashcards`

---

## Phase 4: Testing & Verification

### Task: Manual Verification
- [ ] Test accessing `/favorites`
- [ ] Test unbookmark removes item
- [ ] Test empty state displays correctly
- [ ] Test navigation works

### Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

---

## Commands Reference

```bash
# Backend (port 3001)
cd backend && npm run start:dev

# Frontend (port 3000)
cd frontend && npm run dev

# Test API
curl http://localhost:3001/api/favorites
```

---

## Checkpoints

- Phase 1: [checkpoint: _________]
- Phase 2: [checkpoint: _________]
- Phase 3: [checkpoint: _________]
- Phase 4: [checkpoint: _________]
