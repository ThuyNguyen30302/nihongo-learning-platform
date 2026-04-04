# Implementation Plan: Radical Breakdown Feature

## Context
Thêm radical data và hiển thị phân tích bộ thủ trong WordCard.

---

## Phase 1: Database & Backend

### Task: Add radical columns to kanji_data table
- [ ] Add migration: `ALTER TABLE kanji_data ADD COLUMN radical TEXT`
- [ ] Add migration: `ALTER TABLE kanji_data ADD COLUMN radical_name TEXT`
- [ ] Add migration: `ALTER TABLE kanji_data ADD COLUMN radical_meaning TEXT`

### Task: Update seed data with radical info
- [ ] Update sampleKanji array với radical fields
- [ ] Add radical info cho 49 kanji hiện có

### Task: Update API response
- [ ] Update getKanji() trả về radical fields
- [ ] Verify API response format

---

## Phase 2: Frontend Integration

### Task: Update TypeScript types
- [ ] Add radical fields to KanjiInfo interface

### Task: Add RadicalDisplay component
- [ ] Create simple radical display in WordCard
- [ ] Show below stroke animation area
- [ ] Display: symbol, name, meaning

---

## Phase 3: Testing & Verification

### Task: Manual Verification
- [ ] Test: Search word with kanji → Click Layers → See radical info
- [ ] Test: Verify radical data matches expected values

### Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Commands Reference

```bash
# Backend (port 3001)
cd backend && npm run start:dev

# Frontend (port 3000)
cd frontend && npm run dev

# Test API
curl "http://localhost:3001/api/kanji?char=日"
```

---

## Checkpoints

- Phase 1: [checkpoint: _________]
- Phase 2: [checkpoint: _________]
- Phase 3: [checkpoint: _________]
