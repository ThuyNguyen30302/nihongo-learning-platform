# Specification: Kanji Selector for Stroke Animation

## Overview
- **Track ID**: kanji_selector_stroke_20260404
- **Type**: Feature Enhancement
- **Description**: Thêm khả năng chọn từng kanji trong một từ để xem stroke animation riêng lẻ

## Context
Hiện tại khi hiển thị stroke order animation trong WordCard:
- Chỉ hiển thị stroke animation của kanji ĐẦU TIÊN trong từ
- Không có UI để chọn xem kanji khác

Ví dụ: Từ "日本" (Nhật Bản) có 2 kanji: 日 và 本. Hiện tại chỉ show animation của 日.

Cần cải thiện để user có thể chọn xem stroke animation của từng kanji.

## Functional Requirements

### 1. Kanji Selector UI
- Khi word có nhiều hơn 1 kanji, hiển thị danh sách các kanji có thể chọn
- Mỗi kanji là một button/nhip nhỏ
- Kanji đang được chọn sẽ được highlight
- Click vào kanji nào thì hiển thị stroke animation của kanji đó

### 2. Stroke Animation Display
- Stroke animation hiển thị cho kanji đang được chọn
- Khi đổi kanji selection, animation reset và chạy lại từ đầu
- Giữ nguyên các tính năng đã có: rainbow colors, stroke numbers, controls

### 3. Responsive Behavior
- Nếu từ chỉ có 1 kanji: hiển thị bình thường không cần selector
- Nếu từ có 2+ kanji: hiển thị selector phía trên stroke animation

## Technical Approach

### Frontend Changes
- Modify `WordCard.tsx` để:
  1. Extract tất cả kanji từ word.kanji
  2. Thêm state để track kanji đang được chọn
  3. Thêm UI selector (chip/button list)
  4. Fetch stroke data cho tất cả kanji trong word (hoặc lazy load)
  5. Khi chọn kanji khác, hiển thị animation của kanji đó

### State Management
- `selectedKanji`: index hoặc character của kanji đang chọn
- `kanjiDataMap`: Map<string, KanjiInfo> để cache stroke data cho các kanji đã fetch

## Acceptance Criteria

1. [ ] Word với 1 kanji: hiển thị stroke animation bình thường, không có selector
2. [ ] Word với 2+ kanji: hiển thị selector với các kanji có thể chọn
3. [ ] Click vào kanji nào thì animation của kanji đó được hiển thị
4. [ ] Stroke numbers hiển thị đúng cho kanji được chọn
5. [ ] Animation chạy lại từ đầu khi chọn kanji mới

## Out of Scope
- Thay đổi backend API
- Thêm tính năng mới cho kanji data
- Thay đổi cấu trúc database
