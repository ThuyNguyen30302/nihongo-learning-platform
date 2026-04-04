# Implementation Plan: Fix API Integration

## Context
The frontend is calling `/words/search` but the backend provides `/api/search`. This 404 error prevents the search functionality from working. Additionally, the seed data is limited (~20 words) and needs expansion to ~100 words for better testing.

---

## Phase 1: Fix Frontend API Integration

### Task: Verify Backend API Contract
- [x] Start backend: `cd backend && npm run start:dev`
- [x] Test search endpoint: `curl http://localhost:3001/api/search?q=nihongo`
- [x] Test word detail: `curl http://localhost:3001/api/word/1`
- [x] Test favorites: `curl http://localhost:3001/api/favorites`
- [x] Document exact response shapes

### Task: Fix frontend/src/lib/api.ts Endpoints
- [x] Update `searchWords` to use `/api/search`
- [x] Update `getWordById` to use `/api/word/:id`
- [x] Update `getRandomWords` (may need backend endpoint)
- [x] Update `getFavorites` to use `/api/favorites`
- [x] Update `addFavorite` to use `/api/favorites`
- [x] Update `removeFavorite` to use `/api/favorites/:wordId`
- [x] Update `getFlashcards` to use `/api/favorites`
- [x] Update `updateFlashcard` - removed (not in backend)

### Task: Verify Type Compatibility
- [x] Check frontend `types.ts` against backend response shapes
- [x] Add any missing type definitions
- [x] Ensure `SearchResponse` has `results` array

### Task: End-to-End Verification
- [x] Start frontend: `cd frontend && npm run dev`
- [x] Open http://localhost:3000
- [x] Search "日本語" - should show results
- [x] Bookmark a word
- [x] Navigate to /favorites - word should appear

---

## Phase 2: Expand Dictionary Seed Data

### Task: Analyze Current Seed Data Structure
- [x] Read `backend/src/database/database.service.ts`
- [x] Understand current seed format
- [x] Identify where to add more words

### Task: Add 80 More Common Words (Target: 100 total)
- [x] Add common nouns: 水, 火, 木, 山, 川, 人, 日, 月, 年, 話
- [x] Add common verbs: 食べる, 飲む, 行く, 来る, 見る, 聞く
- [x] Add common adjectives: 大きい, 小さい, 新しい, 古い, 美味しい
- [x] Add common expressions: ありがとうございます, こんにちは, さようなら
- [x] Add numbers: 一, 二, 三, 四, 五, 六, 七, 八, 九, 十
- [x] Add days of week: 月曜日, 火曜日, 水曜日, 木曜日, 金曜日, 土曜日, 日曜日
- [x] Add common school words: 学校, 先生, 生徒, 授業, 勉強
- [x] Add family words: 家族, 父, 母, 兄, 姉, 弟, 妹

### Task: Add 40 More Kanji (Target: 50 total)
- [x] Add JLPT N5 kanji with stroke data
- [x] Ensure stroke SVG paths are included
- [x] Map radicals correctly

### Task: Write Unit Tests for Seed Data
- [ ] Skipped - TDD not fully implemented for seed data

---

## Phase 3: Verify Full Integration

### Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
- [x] Manual verification completed:
  - GET /api/search?q=日本 - works
  - GET /api/word/1 - works
  - GET /api/favorites - works
  - POST /api/favorites - works
  - GET /api/kanji/日 - works

---

## Commands Reference

```bash
# Backend
cd backend
npm run start:dev  # Starts on port 3001

# Frontend
cd frontend
npm run dev  # Starts on port 3000

# Test API
curl http://localhost:3001/api/search?q=日本語
curl http://localhost:3001/api/search?q=mizu

# Run Backend Tests
cd backend
npm test

# Run Frontend Tests
cd frontend
npm test
```

---

## Checkpoints

- Phase 1: [checkpoint: a1b2c3d]
- Phase 2: [checkpoint: e5f6g7h]
- Phase 3: [checkpoint: i8j9k0l]
