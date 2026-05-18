# Carrot - Japan-Dict Design System

Tài liệu thiết kế đồng bộ cho toàn bộ frontend. Mọi trang / component mới phải tuân thủ các quy tắc này.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 |
| Styling | Tailwind CSS 4 + `tw-animate-css` |
| Component Library | shadcn/ui (style: `base-nova`, baseColor: `neutral`) |
| Icons | lucide-react |
| Utilities | `clsx` + `tailwind-merge` (qua `@/lib/utils.ts`) |
| Font | Be Vietnam Pro (400, 500, 600, 700) |

---

## 2. Design Tokens

Toàn bộ token được định nghĩa trong `globals.css` qua CSS custom properties. Palette theo **Carrot Learning System** — warm orange/cream, professional, Vietnamese-first.

### 2.1 Color Palette (Carrot)

Tuyệt đối dùng token semantic, không hardcode màu:

```css
/* ✅ ĐÚNG */
className="text-primary bg-card border-border"

/* ❌ SAI */
className="text-blue-600 bg-white border-gray-200"
```

| Token | Hex | Vai trò |
|-------|-----|--------|
| `--background` | `#fff8f6` | Nền chính (warm cream) |
| `--foreground` | `#231914` | Chữ chính (warm charcoal) |
| `--card` | `#ffffff` | Nền card |
| `--card-foreground` | `#231914` | Chữ card |
| `--primary` | `#9b4500` | Nhấn chính — carrot orange dark |
| `--primary-foreground` | `#ffffff` | Chữ trên primary |
| `--secondary` | `#f2dfd5` | Nền phụ (warm surface-variant) |
| `--secondary-foreground` | `#231914` | Chữ trên secondary |
| `--muted` | `#f2dfd5` | Nền mờ |
| `--muted-foreground` | `#564338` | Chữ mờ, label |
| `--accent` | `#baeea0` | Nhấn phụ — green success |
| `--accent-foreground` | `#406d2f` | Chữ trên accent |
| `--destructive` | `#ba1a1a` | Lỗi, xóa |
| `--destructive-foreground` | `#ffffff` | Chữ trên destructive |
| `--border` | `#ddc1b3` | Viền mảnh warm |
| `--input` | `#ddc1b3` | Viền input |
| `--ring` | `#ff8c42` | Focus ring (primary-container) |

**Extended tokens (dùng khi cần chi tiết):**

| Token | Hex | Ghi chú |
|-------|-----|---------|
| `--primary-container` | `#ff8c42` | Orange tươi — CTA button, hover shadow |
| `--on-primary-container` | `#6a2d00` | Chữ trên primary-container |
| `--secondary-container` | `#baeea0` | Green container — tag/badge success |
| `--on-secondary-container` | `#406d2f` | Chữ trên green container |
| `--tertiary` | `#00677f` | Blue accent — flashcard "Dễ" |
| `--tertiary-container` | `#00b9e2` | Blue bright |
| `--surface-container` | `#feeae0` | Fill container nhẹ |
| `--surface-container-low` | `#fff1eb` | Fill input/search bar |
| `--surface-container-high` | `#f8e4db` | Hover surface |
| `--outline` | `#897266` | Divider/icon mờ |
| `--outline-variant` | `#ddc1b3` | Border card |

**LƯU Ý**: Component `KanjiStrokeOrder` được phép dùng màu trực tiếp (`#FF8C42`, `#231914`) vì nó render SVG riêng biệt. Các component khác phải dùng token semantic.

### 2.2 Elevation & Shadow

Hệ thống dùng **Tonal Layers** + **Ambient Shadows**:

| Token | Value | Dùng cho |
|-------|-------|----------|
| `shadow-soft` | `0px 4px 20px rgba(0,0,0,0.05)` | Card mặc định, dropdown |
| `shadow-interaction` | `0px 8px 30px rgba(255,140,66,0.15)` | Hover card, active input, primary CTA |

```css
/* Tailwind class tùy chỉnh */
.shadow-soft { box-shadow: var(--shadow-soft); }
.shadow-interaction { box-shadow: var(--shadow-interaction); }
```

### 2.3 Border Radius

```css
--radius: 0.5rem;  /* base = 8px */
```

| Quy mô | Giá trị | Dùng cho |
|--------|---------|----------|
| `rounded-lg` | 0.5rem (8px) | Card, input, button |
| `rounded-xl` | 0.75rem (12px) | Modal, large container |
| `rounded-2xl` | 1rem (16px) | Stroke order container |
| `rounded-full` | 9999px | Tag, badge, avatar |

### 2.4 Typography

Font duy nhất: **Be Vietnam Pro** — geometric, legible tiếng Việt ở size nhỏ.

| Token | Size | Weight | Line-height | Letter-spacing | Dùng cho |
|-------|------|--------|-------------|----------------|----------|
| `text-display-lg` | 40px | 700 | 48px | -0.02em | Kanji lớn (hero/detail) |
| `text-headline-lg` | 32px | 600 | 40px | -0.01em | Tiêu đề trang |
| `text-headline-md` | 24px | 600 | 32px | — | Tiêu đề section, card |
| `text-body-lg` | 18px | 400 | 28px | — | Body chính, meaning |
| `text-body-md` | 16px | 400 | 24px | — | Body thường, kana |
| `text-label-md` | 14px | 600 | 20px | 0.02em | Label, badge, button |
| `text-label-sm` | 12px | 500 | 16px | — | Caption, meta, JLPT tag |

**Quy tắc typography:**
- Kanji lớn dùng `font-bold` (700) để stroke rõ.
- Kana/furigana dùng `text-muted-foreground` + `text-body-md`.
- Body text slightly enlarged (18px) để dễ đọc song ngữ.
- Tighten letter-spacing trên display; tăng nhẹ trên label để scanable.

### 2.5 Spacing (8px base grid)

| Token | Giá trị | Ngữ cảnh |
|-------|---------|----------|
| `space-base` | 8px | Unit nhỏ nhất |
| `space-sm` (stack-sm) | 12px | Gap trong component |
| `space-md` (stack-md) | 24px | Gap giữa section/card |
| `space-lg` (stack-lg) | 48px | Gap major section |
| `gutter` | 16px | Gap cột grid |
| `container-margin` | 24px | Padding page left/right |

**Layout width:** `max-w-[1100px] mx-auto` thay vì `max-w-4xl` — để hiển thị kanji và nội dung song ngữ thoáng hơn.

---

## 3. Layout Pattern

Mọi trang đều theo cấu trúc 3 phần:

```tsx
<div className="min-h-screen bg-background">
  {/* Header — sticky, có border-bottom */}
  <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
    <div className="max-w-[1100px] mx-auto px-6 py-4">
      {/* Nội dung header */}
    </div>
  </header>

  {/* Main */}
  <main className="max-w-[1100px] mx-auto px-6 py-8">
    {/* Nội dung chính */}
  </main>

  {/* Footer */}
  <footer className="border-t border-outline-variant bg-surface mt-auto">
    <div className="max-w-[1100px] mx-auto px-6 py-6">
      <p className="text-center text-sm text-muted-foreground">
        Carrot — Japanese-Vietnamese Dictionary
      </p>
    </div>
  </footer>
</div>
```

### 3.1 Header quy tắc

- Bên trái: **Carrot** brand `text-headline-md font-bold text-primary` hoặc logo icon + title.
- Giữa (desktop): nav links — active có `text-primary border-b-2 border-primary`, inactive có `text-muted-foreground hover:text-primary`.
- Bên phải: icon button `p-2 rounded-lg hover:bg-surface-container-low transition-colors`.
- Nếu có nút quay lại: `<ArrowLeft>` bọc trong `<Link>`.

### 3.2 BottomNavBar (Mobile only)

```tsx
<nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 md:hidden bg-surface border-t border-outline-variant shadow-soft">
  <Link href="/" className="flex flex-col items-center text-muted-foreground hover:text-primary">
    <Home className="w-5 h-5" />
    <span className="text-label-sm">Home</span>
  </Link>
  {/* ... */}
</nav>
```

- Active item: `text-primary font-bold` hoặc `bg-primary-container text-on-primary-container rounded-full px-4`.
- Luôn thêm `pb-safe` hoặc padding bottom trên main để tránh bị che.

---

## 4. Component Patterns

### 4.1 Card

Dùng cho mọi nội dung: kết quả tìm kiếm, empty state, error state.

```tsx
import { Card, CardContent } from '@/components/ui/card';

<Card className="overflow-hidden border border-outline-variant shadow-soft hover:shadow-interaction transition-shadow">
  <CardContent className="p-6">
    {/* Nội dung */}
  </CardContent>
</Card>
```

- Section divider trong card: `<div className="mt-6 pt-6 border-t border-outline-variant">`
- Card favorites grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

### 4.2 Button

| Variant | Style | Dùng cho |
|---------|-------|----------|
| `default` | `bg-primary text-primary-foreground` | CTA chính |
| `outline` | `border-primary text-primary bg-transparent` | CTA phụ |
| `ghost` | `text-primary hover:bg-surface-container-low` | Icon button |
| `secondary` | `bg-secondary text-secondary-foreground` | Tag/filter |
| `destructive` | `bg-destructive text-white` | Xóa, "Again" SRS |

Flashcard SRS buttons (4 nút đặc trưng):

```tsx
<div className="grid grid-cols-4 gap-4">
  <button className="flex flex-col items-center gap-1 bg-surface-container border border-outline-variant hover:border-primary rounded-lg p-3 transition-all">
    <span className="text-label-md text-error font-bold">Lặp lại</span>
    <span className="text-label-sm text-muted-foreground">1 min</span>
  </button>
  <button className="... text-primary">Khó</button>
  <button className="... text-secondary font-bold">Tốt</button>
  <button className="... text-tertiary font-bold">Dễ</button>
</div>
```

### 4.3 Search Bar

```tsx
<div className="relative w-full max-w-2xl mx-auto group">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
  <input
    className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg
               focus:border-primary-container focus:outline-none focus:shadow-interaction
               transition-all text-body-md"
    placeholder="Tìm kiếm từ vựng, Kanji..."
  />
</div>
```

- Gợi ý dropdown: absolute top-full, `bg-surface-container-lowest border border-outline-variant rounded-xl shadow-soft p-4`.
- Mỗi suggestion row: `flex items-center justify-between py-2 px-3 hover:bg-surface-container-low cursor-pointer rounded-lg`.

### 4.4 Word Card (Search Result)

```tsx
<Card className="overflow-hidden border border-outline-variant shadow-soft hover:shadow-interaction transition-all cursor-pointer">
  <CardContent className="p-6">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-display-lg font-bold text-on-surface">{word.kanji}</h2>
        <p className="text-body-md text-muted-foreground">{word.kana}</p>
        <p className="text-body-lg text-on-surface mt-2">{word.meaning_vi}</p>
        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-surface-container text-label-sm text-on-surface">
          {word.part_of_speech}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon"><Volume2 className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon"><Bookmark /></Button>
      </div>
    </div>
  </CardContent>
</Card>
```

### 4.5 Word Detail Page

Layout 2 cột cho stroke order + info:

```tsx
<section className="bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-surface-variant">
  {/* Header */}
  <div className="flex items-end gap-2">
    <span className="text-body-md text-muted-foreground">{word.kana}</span>
    <span className="text-[64px] font-bold text-on-background tracking-widest">{word.kanji}</span>
  </div>
  <h1 className="text-headline-lg text-primary mt-2">{word.meaning_vi}</h1>

  {/* Info grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-surface-variant">
    <div>
      <span className="text-label-md text-muted-foreground uppercase">Cấp độ</span>
      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-md">
        {word.jlpt || 'N5'}
      </span>
    </div>
    {/* ... */}
  </div>
</section>
```

- Stroke order: SVG container `aspect-square max-w-[320px] bg-[#fffcf5] border border-outline-variant rounded-2xl`.
- Example sentences: dùng `<ruby>` tag chuẩn HTML5 cho furigana.

### 4.6 Loading & Error & Empty State

```tsx
// Loading
<div className="flex justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
</div>

// Error
<Card className="bg-destructive/10 border-destructive/20">
  <CardContent className="p-6 text-center">
    <p className="text-destructive">{errorMessage}</p>
  </CardContent>
</Card>

// Empty
<Card className="text-center border border-outline-variant">
  <CardContent className="p-12">
    <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-headline-md font-semibold mb-2">Tiêu đề</h3>
    <p className="text-muted-foreground mb-6">Mô tả ngắn gọn.</p>
    <Button variant="default">CTA</Button>
  </CardContent>
</Card>
```

---

## 5. Icon Library

Dùng **lucide-react**, size chuẩn `w-5 h-5` (icon nhỏ) hoặc `w-16 h-16` (empty state).

| Icon | Mục đích |
|------|----------|
| `Heart` / `Bookmark` | Favorites |
| `Layers` | Stroke order / Flashcards |
| `Book` / `BookOpen` | Dictionary / Search |
| `ArrowLeft` | Quay lại |
| `Search` | Tìm kiếm |
| `X` | Xóa / Đóng |
| `CheckCircle` | Đúng / Hoàn thành |
| `XCircle` | Sai |
| `Volume2` | Phát âm |
| `Play` / `Pause` / `RotateCcw` | Animation control |
| `Shuffle` | Xáo trộn |
| `GridView` / `ViewList` | Toggle view |
| `Flip` | Flip card |
| `ChevronLeft` / `ChevronRight` | Pagination |
| `FilterList` | Filter |
| `Home` | Trang chủ |
| `MenuBook` | Dictionary (mobile nav) |
| `Style` | Flashcards (mobile nav) |
| `AccountCircle` | User |
| `Lightbulb` | Gợi ý |
| `History` | Lịch sử |
| `Star` | Yêu thích |
| `Info` | Thông tin |
| `Favorite` | Yêu thích (filled) |

---

## 6. Animation & Transition

### Quy tắc chung
- Hover state: `hover:bg-surface-container-low transition-colors duration-200`
- Link CTA: `hover:opacity-90 transition-opacity`
- Card shadow: `shadow-soft hover:shadow-interaction transition-shadow`
- Button scale khi active đã có trong base shadcn.
- Flashcard flip: CSS 3D transform (`.perspective-1000`, `.transform-style-preserve-3d`, `.backface-hidden`, `.rotate-y-180`).
- Stroke animation: `@keyframes stroke-draw` với `stroke-dasharray/stroke-dashoffset`.

---

## 7. Responsive Design

| Breakpoint | Target |
|-----------|--------|
| Mobile (< 768px / `md:`) | Single column, bottom nav, ẩn text labels chỉ hiện icon |
| Tablet / Desktop (≥ 768px) | Hiện text labels, top nav, layout giãn hơn |

- Dùng `hidden md:inline` để ẩn text trên mobile.
- Dùng `flex-col md:flex-row` cho layout chuyển cột.
- Container width: `max-w-[1100px]`.

---

## 8. Dark Mode

Đã hỗ trợ qua class `.dark` trong `globals.css`. Mọi component dùng token semantic tự động thích ứng.

---

## 9. Cấu trúc file

```
src/
├── app/
│   ├── globals.css          # Design tokens, animations, base styles
│   ├── layout.tsx            # Root layout (metadata, font, body)
│   ├── page.tsx              # Trang chủ / landing
│   ├── search/
│   │   └── page.tsx          # Trang tìm kiếm chuyên dụng
│   ├── word/
│   │   └── [id]/
│   │       └── page.tsx      # Trang chi tiết từ vựng
│   ├── favorites/
│   │   └── page.tsx          # Trang yêu thích
│   └── flashcards/
│       └── page.tsx          # Trang flashcard
├── components/
│   ├── ui/                   # shadcn/ui primitives (Button, Card, Progress)
│   ├── SearchBar.tsx
│   ├── WordCard.tsx
│   ├── KanjiStrokeOrder.tsx
│   ├── KanjiBreakdown.tsx
│   ├── FlashCard.tsx
│   └── ExampleSentence.tsx   # Component <ruby> + audio button
├── lib/
│   ├── api.ts                # API calls
│   ├── types.ts              # Type definitions
│   └── utils.ts              # cn() utility
```

### Quy ước khi thêm file mới

- Component dùng chung → `src/components/`
- Primitive UI từ shadcn/ui → `src/components/ui/`
- Trang mới → `src/app/<route>/page.tsx`
- Custom hook → `src/hooks/`
