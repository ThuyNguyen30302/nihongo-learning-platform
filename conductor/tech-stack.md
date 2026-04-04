# Technology Stack

## Backend

### Framework
- **NestJS** (v11) - Progressive Node.js framework
- TypeScript for type safety

### Database
- **SQLite** via better-sqlite3
- Seeded with sample JMdict data

### Libraries
- `class-validator` - DTO validation
- `class-transformer` - Object transformation

### Development Tools
- ESLint + Prettier for linting/formatting
- Jest for testing
- ts-node for development

### Ports
- Backend API: `localhost:3001`

---

## Frontend

### Framework
- **Next.js 16** with App Router
- **React 19**

### Language
- TypeScript

### Styling
- **Tailwind CSS v4**

### Libraries
- `axios` - HTTP client
- `lucide-react` - Icons

### Development Tools
- ESLint for linting
- TypeScript

### Ports
- Frontend Dev: `localhost:3000`

---

## Architecture

### Monorepo Structure
```
japan-dict/
├── backend/          # NestJS API
│   └── src/
│       ├── dictionary/   # Word search
│       ├── kanji/        # Kanji & stroke order
│       ├── favorites/    # User favorites
│       └── database/     # SQLite service
└── frontend/         # Next.js app
    └── src/
        ├── app/          # Pages
        ├── components/   # UI components
        └── lib/          # API client & types
```

### API Design
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q={word}` | Search words |
| GET | `/api/word/:id` | Get word details |
| GET | `/api/kanji/:kanji` | Get kanji stroke order |
| GET | `/api/favorites` | List favorites |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites/:wordId` | Remove favorite |

### Data Models

**Word:**
- `id`: number
- `kanji`: string
- `kana`: string
- `meaning`: string (Vietnamese)
- `examples`: string[]

**Kanji:**
- `character`: string
- `strokes`: number
- `radicals`: string[]
- `readings`: { on: string[], kun: string[] }
- `meaning`: string
- `strokePaths`: string[] (SVG paths)

**Favorite:**
- `id`: number
- `wordId`: number
- `createdAt`: timestamp
