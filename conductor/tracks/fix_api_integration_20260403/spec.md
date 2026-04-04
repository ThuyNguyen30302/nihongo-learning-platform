# Specification: Fix API Integration

## Overview
Fix the API integration between the Next.js frontend and NestJS backend, and expand the dictionary seed data from ~20 words to ~100 words.

## Problem Statement
Frontend is calling endpoints like `/words/search` but backend provides `/api/search`. This causes 404 errors.

## 1. API Integration Fix

### Frontend API Client (`frontend/src/lib/api.ts`)

**Current Endpoints:**
| Function | Current Path | Correct Path |
|----------|--------------|--------------|
| searchWords | `/words/search` | `/api/search` |
| getWordById | `/words/:id` | `/api/word/:id` |
| getFavorites | `/favorites` | `/api/favorites` |

**Required Changes:**
- [ ] Update all API paths to use `/api` prefix
- [ ] Ensure `params: { q: query }` matches backend `@Query('q')`
- [ ] Verify response types match frontend interfaces

### Backend API Validation

**Existing Endpoints (confirmed working):**
- `GET /api/search?q={word}` - returns `{ results: [...] }`
- `GET /api/word/:id` - returns word object
- `GET /api/kanji/:kanji` - returns kanji info with stroke order
- `GET /api/favorites` - returns array of favorite words
- `POST /api/favorites` - body: `{ wordId }`
- `DELETE /api/favorites/:wordId` - removes favorite

## 2. Expand Dictionary Seed Data

### Current State
- ~20 sample words with Vietnamese meanings
- ~10 kanji with stroke data

### Target State
- ~100 common Japanese words with Vietnamese meanings
- ~50 kanji with stroke data
- Better variety (nouns, verbs, adjectives)

### Data Structure
```typescript
interface Word {
  id: number;
  kanji: string;
  kana: string;
  meaning: string;      // Vietnamese meaning
  examples?: string[];   // Example sentences
  partOfSpeech?: string; // noun, verb, adjective
}

interface Kanji {
  character: string;
  strokes: number;
  radical: string;
  onReadings: string[];
  kunReadings: string[];
  meaning: string;       // Vietnamese meaning
  strokePaths?: string[]; // SVG path data for animation
}
```

### Sample Words to Add
1. 水 (water) - みず - Nước
2. 火 (fire) - ひ - Lửa
3. 木 (tree/wood) - き - Cây/Gỗ
4. 山 (mountain) - やま - Núi
5. 川 (river) - かわ - Sông
6. 人 (person) - ひと - Người
7. 日 (day/sun) - ひ/にち - Ngày/Mặt trời
8. 月 (month/moon) - つき/げつ - Tháng/Mặt trăng
9.好吃的 (delicious) - おいしい - Ngon
10. 学校 (school) - がっこう - Trường học
... and 90 more

## 3. Verification Criteria

### API Integration
- [ ] Search "日本語" returns results
- [ ] Search "nước" (romaji "mizu") returns 水
- [ ] Bookmark a word, verify it appears in /favorites
- [ ] Remove bookmark, verify it's gone from /favorites

### Data Quality
- [ ] All 100 words have Vietnamese meanings
- [ ] All 50 kanji have stroke order data
- [ ] Search works for kanji, kana, and romaji input

## 4. Files to Modify

### Frontend
- `frontend/src/lib/api.ts` - Fix endpoint paths
- `frontend/src/lib/types.ts` - Ensure types match backend

### Backend
- `backend/src/database/database.service.ts` - Expand seed data
- Add new seed data files if needed

## 5. Out of Scope
- Adding user authentication
- Full JMdict import
- Audio pronunciation
- Cloud sync
