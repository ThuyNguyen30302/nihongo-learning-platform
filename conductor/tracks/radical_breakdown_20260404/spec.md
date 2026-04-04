# Specification: Radical Breakdown Feature

## Overview
- **Track ID**: radical_breakdown_20260404
- **Type**: Feature Enhancement
- **Description**: Thêm radical data và hiển thị phân tích bộ thủ trong WordCard

## Context
Theo product.md, app có feature "Radical breakdown with explanations" nhưng hiện tại chưa được implement. Database chỉ có stroke data, không có radical information.

## Functional Requirements

### 1. Database Enhancement
- Thêm columns vào bảng kanji_data: `radical`, `radical_name`, `radical_meaning`
- Update seed data với radical info cho các kanji N5

### 2. Backend API
- API `/api/kanji?char=X` trả về thêm radical info
- Update interface KanjiInfo trả về radical fields

### 3. Frontend Display
- Thêm section hiển thị radical breakdown trong WordCard
- Hiển thị khi user click vào Layers icon (stroke order toggle)
- UI gồm: radical symbol, radical name, radical meaning

### 4. Radical Info Format
```typescript
interface KanjiInfo {
  // existing fields...
  radical?: string;        // e.g., "日" for 日本
  radical_name?: string;   // e.g., "nhật" (Japanese name)
  radical_meaning?: string; // e.g., "Mặt trời, Ngày"
}
```

## Technical Approach

### Backend Changes
1. Add migration for radical columns
2. Update sampleKanji seed data với radical info
3. Update getKanji() method trả về radical fields

### Frontend Changes
1. Update types.ts interface KanjiInfo
2. Add RadicalDisplay component trong WordCard
3. Show radical info below stroke animation

## Acceptance Criteria

1. [ ] Database có radical columns
2. [ ] API trả về radical info
3. [ ] WordCard hiển thị radical breakdown
4. [ ] Radical info hiển thị với symbol, name, meaning

## Out of Scope
- Full radical tree visualization
- Radical search functionality
- Historical/radical evolution info
