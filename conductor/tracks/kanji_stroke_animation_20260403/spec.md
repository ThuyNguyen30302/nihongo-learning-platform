# Specification: Kanji Stroke Animation

## Overview

Add real SVG-based stroke order animation for kanji characters using KanjiVG data. The animation will sequentially draw each stroke using smooth line animation, providing users with a visual guide for proper kanji writing.

## Data Source: KanjiVG

KanjiVG (Kanji Vector Graphics) provides:
- SVG path data for each stroke
- Proper stroke order
- Stroke grouping (paths are organized by stroke number)
- Color information for active/completed strokes

### KanjiVG Data Format

Each kanji in KanjiVG has:
- `path` elements with `d` attribute containing SVG path commands
- `stroke` attribute for stroke number
- Grouped by `<g>` elements with `kvg:element` attribute

### Backend Integration

- Store KanjiVG XML/SVG data per kanji character
- Endpoint: `GET /api/kanji/:kanji` should return kanji with `svgData` containing KanjiVG format
- For MVP: Embed KanjiVG data directly in database or fetch from KanjiVG API

## Requirements

### Functional Requirements

1. **SVG Rendering**
   - Parse KanjiVG SVG format
   - Render strokes on HTML5 Canvas or SVG element
   - Support stroke-by-stroke rendering

2. **Animation Engine**
   - Sequential stroke animation using stroke-dasharray technique
   - Each stroke draws before next begins
   - Smooth line-drawing effect

3. **Animation Triggers**
   - Auto-play once when kanji detail is first viewed
   - Subsequent views require manual Play trigger
   - Track "has been animated" state per session

4. **Controls**
   - Play/Pause toggle button
   - Reset button (returns to stroke 1, pauses)
   - Visual indicator showing current stroke number / total

5. **Visual Design (from KanjiVG)**
   - Use KanjiVG's native colors
   - Active stroke: Red (#BC002D)
   - Completed strokes: Dark gray
   - Guide stroke: Light gray
   - Canvas: 200x200px default

## Component Structure

```
KanjiStrokeOrder (main component)
├── SVG/Canvas container (200x200)
│   └── Individual stroke paths with animation
├── Controls bar
│   ├── Play/Pause button (Lucide icons)
│   ├── Reset button
│   └── Stroke counter ("3/7")
```

## State Management

```typescript
interface KanjiStrokeState {
  isPlaying: boolean;
  currentStroke: number;  // 0-based index
  totalStrokes: number;
  hasAnimated: boolean;  // for auto-play once
  strokes: string[];     // array of SVG path data from KanjiVG
}
```

## Animation Timing

- Individual stroke duration: 600ms
- Delay between strokes: 200ms pause
- Total = (stroke_count * 600ms) + ((stroke_count - 1) * 200ms)

## Out of Scope

- Speed adjustment controls
- Step-by-step manual advancement
- Saving animation progress
- Audio narration
- Export as GIF/video
- Full KanjiVG file parsing (MVP: use embedded stroke paths)

## Acceptance Criteria

1. [ ] KanjiVG stroke data integrated into backend
2. [ ] Animation auto-plays once per session when viewing kanji
3. [ ] Play/Pause toggles animation state
4. [ ] Reset returns to stroke 1 and pauses
5. [ ] Stroke counter shows current/total (e.g., "3/7")
6. [ ] Smooth line-drawing animation (not instant appear)
7. [ ] Works with existing kanji data in database
