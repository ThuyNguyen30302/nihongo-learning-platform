# Implementation Plan: Kanji Selector for Stroke Animation

## Context
Thêm UI cho phép chọn từng kanji trong word để xem stroke animation riêng.

---

## Phase 1: Extract Kanji Characters

### Task: Modify WordCard to extract all kanji
- [ ] Create function to extract kanji characters from word.kanji
- [ ] Store list of kanji in component state
- [ ] Only show selector if word has 2+ kanji

---

## Phase 2: Add Kanji Selector UI

### Task: Create Kanji Selector Component
- [ ] Add `selectedKanjiIndex` state (default: 0)
- [ ] Create selector UI with kanji chips/buttons
- [ ] Style selector to highlight current selection
- [ ] Position selector above stroke animation area

### Task: Handle Kanji Selection
- [ ] Add onClick handler to select different kanji
- [ ] When selection changes, update stroke animation to show new kanji
- [ ] Reset animation when kanji changes

---

## Phase 3: Stroke Data Management

### Task: Lazy Load Kanji Data
- [ ] Modify fetch logic to get stroke data for selected kanji
- [ ] Cache fetched kanji data to avoid refetching
- [ ] Handle loading state per kanji

---

## Phase 4: Testing & Verification

### Task: Manual Verification
- [ ] Test word with 1 kanji (e.g., 水) - no selector shown
- [ ] Test word with 2 kanji (e.g., 日本) - selector shows both
- [ ] Test clicking different kanji shows correct animation
- [ ] Test animation resets when switching kanji

### Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

---

## Commands Reference

```bash
# Backend (port 3001)
cd backend && npm run start:dev

# Frontend (port 3000)
cd frontend && npm run dev

# Test API for kanji
curl "http://localhost:3001/api/kanji?char=日"
curl "http://localhost:3001/api/kanji?char=本"
```

---

## Checkpoints

- Phase 1: [checkpoint: _________]
- Phase 2: [checkpoint: _________]
- Phase 3: [checkpoint: _________]
- Phase 4: [checkpoint: _________]
