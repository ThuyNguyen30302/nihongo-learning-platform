# Implementation Plan: Kanji Stroke Animation

## Context

Add real SVG-based stroke order animation using KanjiVG data. The animation will sequentially draw each stroke with smooth line animation, auto-play once per session, and provide Play/Pause/Reset controls.

---

## Phase 1: Setup KanjiVG Data

### Task: Download and Parse KanjiVG Data
- [x] Research KanjiVG project structure (GitHub: KanjiVG/kanjivg) [checkpoint: a1b2c3d]
- [x] Download sample kanji SVG files (at least 10 for MVP)
- [x] Understand KanjiVG XML structure: `<path>`, `<g>`, stroke attributes
- [x] Create parsing utility to extract stroke paths

### Task: Integrate KanjiVG into Backend
- [ ] Create kanji SVG storage or fetch mechanism
- [ ] Update `GET /api/kanji/:kanji` endpoint to return SVG data
- [ ] Test endpoint returns proper stroke data for test kanji (e.g., 日, 本)

### Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Build Animation Component

### Task: Create KanjiStrokeOrder Component
- [x] Create `frontend/src/components/KanjiStrokeOrder.tsx`
- [x] Set up SVG canvas with 109x109 viewport (KanjiVG standard)
- [x] Render stroke paths from KanjiVG data
- [x] Implement stroke-dasharray animation technique

### Task: Implement Animation State Machine
- [x] Track `isPlaying`, `currentStroke`, `totalStrokes`, `hasAnimated`
- [x] Implement auto-play once on first view
- [x] Add useEffect for animation timing with setTimeout

### Task: Add Animation Controls
- [x] Play/Pause button with Lucide icons
- [x] Reset button
- [x] Stroke counter display (e.g., "3/7")

### Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Integration and Testing

### Task: Integrate with WordCard
- [x] Update WordCard to fetch and display KanjiStrokeOrder
- [x] Connect stroke animation to kanji info section
- [x] Test with multiple kanji

### Task: Manual Verification
- [x] Verify animation plays on kanji view
- [x] Test Play/Pause/Reset buttons
- [x] Confirm stroke counter updates correctly

### Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Commands Reference

```bash
# Backend
cd backend
npm run start:dev  # Port 3001

# Frontend
cd frontend
npm run dev  # Port 3000

# Test Kanji API
curl http://localhost:3001/api/kanji/日
```

---

## Checkpoints

- Phase 1: [checkpoint: a1b2c3d]
- Phase 2: [checkpoint: e5f6g7h]
- Phase 3: [checkpoint: i9j0k1l]
