# Product Definition

## 1. Concept & Vision

A Japanese-Vietnamese dictionary web application that enables users to search Japanese words, understand their Vietnamese meanings, study with flashcards, and visualize kanji stroke order. The app feels like a clean, focused learning tool with a distinctly Japanese minimalist aesthetic.

## 2. User Experience

### Target Users
- Vietnamese speakers learning Japanese (JLPT prep students)
- Japanese language enthusiasts
- translators and linguists

### Core User Flows
1. **Search Flow:** User types a word (kanji, kana, or romaji) → sees Vietnamese meanings and examples
2. **Bookmark Flow:** User saves interesting words → revisits them in Favorites page
3. **Study Flow:** User opens Flashcards → flips through saved words to memorize

## 3. Features

### 3.1 Search & Lookup
- Search bar accepting kanji, hiragana, katakana, or romaji input
- Word results showing: kanji, kana reading, Vietnamese meaning, example sentences
- Word detail view with additional context

### 3.2 Kanji Information
- Kanji stroke order animation (SVG-based)
- Radical breakdown with explanations
- Readings (on'yomi, kun'yomi)

### 3.3 Favorites System
- Bookmark/unbookmark words
- Persistent storage via backend API
- Favorites list page

### 3.4 Flashcard Study
- Flip-card interface for memorization
- Front: Kanji + reading
- Back: Vietnamese meaning + example
- Mastery tracking

## 4. Technical Scope

### Backend (NestJS)
- REST API with endpoints for search, kanji data, favorites CRUD
- SQLite database for dictionary data and user favorites
- JMdict-based seed data (~20 sample words, 10 kanji)

### Frontend (Next.js)
- App Router with pages: `/`, `/favorites`, `/flashcards`
- Components: SearchBar, WordCard, KanjiBreakdown, KanjiStrokeOrder, FlashCard
- API client connecting to backend at localhost:3001

## 5. Out of Scope (MVP)
- User authentication
- Cloud sync
- Full JMdict import (170k entries)
- Audio pronunciation
- spaced repetition algorithm
