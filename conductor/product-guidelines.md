# Product Guidelines

## 1. Design Language

### Aesthetic Direction
Japanese minimalist — clean, spacious, with deliberate use of red accents inspired by the Japanese flag and torii gates.

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary | Japanese Red | `#BC002D` |
| Secondary | Ink Black | `#1A1A1A` |
| Background | Off White | `#FAFAFA` |
| Surface | Pure White | `#FFFFFF` |
| Text Primary | Dark Gray | `#333333` |
| Text Secondary | Medium Gray | `#666666` |
| Border | Light Gray | `#E5E5E5` |

### Typography
- **Headings:** Inter (clean, modern sans-serif)
- **Body:** Inter
- **Japanese Text:** Noto Sans JP (for proper rendering)

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Card padding: 16px
- Page margins: 24px (mobile), 48px (desktop)

### Motion Philosophy
- Subtle and purposeful
- Card flip: 600ms with ease-in-out
- Page transitions: 200ms fade
- Hover states: 150ms transitions

## 2. Layout & Structure

### Page Structure
- **Header:** App title with Japanese flag icon, navigation links
- **Main Content:** Centered container (max-width: 800px)
- **Footer:** Minimal, just copyright

### Navigation
- Home (search) - `/`
- Favorites - `/favorites`
- Flashcards - `/flashcards`

### Responsive Strategy
- Mobile-first
- Breakpoints: 640px (sm), 768px (md), 1024px (lg)
- Stack layout on mobile, side-by-side on desktop

## 3. Component Guidelines

### SearchBar
- Full-width input with search icon
- Placeholder: "Tìm từ tiếng Nhật..."
- Clear button appears when text is entered
- Focus ring in primary red

### WordCard
- White card with subtle shadow
- Kanji prominently displayed (24px+)
- Kana reading below kanji
- Vietnamese meaning in body text
- Example sentence in italics
- Bookmark icon button in corner

### KanjiStrokeOrder
- SVG canvas for stroke animation
- Play/Reset control buttons
- Stroke count indicator

### FlashCard
- 3D flip animation on click
- Front: Kanji + kana
- Back: Meaning + example
- Visual indicator of mastery level

## 4. Content Guidelines

### Language
- UI labels: Vietnamese
- Dictionary content: Vietnamese meanings
- Japanese text: Always properly encoded

### Error States
- Empty search: "Vui lòng nhập từ cần tìm"
- No results: "Không tìm thấy kết quả"
- API error: "Đã xảy ra lỗi. Vui lòng thử lại."

### Loading States
- Skeleton cards while loading results
- Spinner for bookmark actions
