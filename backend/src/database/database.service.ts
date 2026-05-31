import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import kuromoji from 'kuromoji';
import * as path from 'path';

export interface Word {
  id: number;
  kanji: string;
  kana: string;
  romaji: string;
  meaning_vi: string;
  han_viet?: string;
  meaning_en: string;
  part_of_speech: string;
  example_sentence: string;
  example_meaning_vi: string;
  example_tokens?: ExampleSentenceTokenAnnotation[];
}

export type ExampleSentenceTokenKind = 'word' | 'space' | 'punctuation';
export type ExampleSentencePosGroup =
  | 'noun'
  | 'verb'
  | 'modifier'
  | 'particle'
  | 'suffix'
  | 'auxiliary'
  | 'symbol'
  | 'other';

export interface ExampleSentenceTokenAnnotation {
  id: number;
  surface: string;
  start: number;
  end: number;
  kind: ExampleSentenceTokenKind;
  basic_form?: string;
  reading?: string;
  pos_raw?: string | null;
  pos_detail?: string | null;
  pos_raw_label?: string | null;
  pos_detail_label?: string | null;
  pos_label?: string | null;
  pos_group?: ExampleSentencePosGroup;
  part_of_speech: string | null;
  meaning_vi: string | null;
}

export interface FavoriteWordRow extends Favorite {
  kanji: string;
  kana: string;
  romaji: string;
  meaning_vi: string;
  han_viet?: string;
  meaning_en: string;
  part_of_speech: string;
  example_sentence: string;
  example_meaning_vi: string;
  example_tokens?: ExampleSentenceTokenAnnotation[];
}

export interface Kanji {
  kanji: string;
  meaning_vi: string;
  meaning_en: string;
  on_reading: string;
  kun_reading: string;
  stroke_count: number;
  stroke_paths: string;
  stroke_numbers?: string; // JSON array of {x, y} positions
  radical?: string; // Primary radical symbol
  radical_element?: string;
  radical_original?: string;

  radical_meaning?: string; // Vietnamese meaning of radical
}

export interface Favorite {
  id: number;
  word_id: number;
  created_at: string;
}

interface ExampleSentenceToken {
  text: string;
  start: number;
  end: number;
  kind: ExampleSentenceTokenKind;
  basicForm?: string;
  reading?: string;
  posRaw?: string;
  posDetail?: string | null;
  posRawLabel?: string | null;
  posDetailLabel?: string | null;
  posLabel?: string | null;
  posGroup?: ExampleSentencePosGroup;
  lookupQueries?: string[];
}

interface KuromojiToken {
  surface_form: string;
  word_position: number;
  pos: string;
  pos_detail_1: string;
  pos_detail_2?: string;
  pos_detail_3?: string;
  basic_form?: string;
  reading?: string;
}

type KuromojiTokenizer = {
  tokenize(sentence: string): KuromojiToken[];
};

function classifyExampleSentenceToken(text: string): ExampleSentenceTokenKind {
  if (/^\s+$/u.test(text)) {
    return 'space';
  }

  if (/^[\p{P}\p{S}]+$/u.test(text)) {
    return 'punctuation';
  }

  return 'word';
}

function toHiragana(value: string) {
  return value.replace(/[\u30a1-\u30f6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60),
  );
}

function formatKuromojiPosDetail(token: KuromojiToken) {
  const details = [
    token.pos_detail_1,
    token.pos_detail_2,
    token.pos_detail_3,
  ].filter((detail): detail is string => Boolean(detail && detail !== '*'));

  return details.length > 0 ? details.join(' / ') : null;
}

function translateKuromojiPosDetail(detail: string) {
  const detailMap: Record<string, string> = {
    一般: 'thường',
    固有名詞: 'danh từ riêng',
    人名: 'tên người',
    姓: 'họ',
    名: 'tên',
    組織: 'tổ chức',
    地域: 'địa danh/khu vực',
    国: 'quốc gia',
    代名詞: 'đại từ',
    副詞可能: 'có thể dùng như trạng từ',
    サ変接続: 'liên kết động từ する',
    形容動詞語幹: 'gốc tính động từ',
    ナイ形容詞語幹: 'gốc tính từ ない',
    数: 'số',
    非自立: 'không độc lập',
    特殊: 'đặc biệt',
    接尾: 'hậu tố',
    助数詞: 'lượng từ',
    接続助詞: 'trợ từ nối',
    係助詞: 'trợ từ chủ đề',
    格助詞: 'trợ từ cách',
    副助詞: 'trợ từ phụ',
    並立助詞: 'trợ từ song song',
    終助詞: 'trợ từ cuối câu',
    '副助詞／並立助詞／終助詞': 'trợ từ phụ / song song / cuối câu',
    連体化: 'liên thể hóa',
    副詞化: 'phó từ hóa',
    名詞接続: 'nối danh từ',
    体言接続: 'nối thể ngôn',
    数接続: 'liên kết số',
    自立: 'độc lập',
    引用: 'trích dẫn',
    空白: 'khoảng trắng',
    句点: 'dấu chấm câu',
    読点: 'dấu phẩy câu',
    アルファベット: 'chữ cái Latin',
    連用テ接続: 'nối dạng て',
    基本形: 'dạng cơ bản',
    仮定形: 'dạng giả định',
    命令ｅ: 'mệnh lệnh',
    命令ｉ: 'mệnh lệnh',
    未然形: 'dạng chưa hoàn thành',
    連用形: 'dạng liên dụng',
  };

  return detailMap[detail] ?? detail;
}

function formatKuromojiPosDetailLabel(token: KuromojiToken) {
  const details = [
    token.pos_detail_1,
    token.pos_detail_2,
    token.pos_detail_3,
  ].filter((detail): detail is string => Boolean(detail && detail !== '*'));

  return details.length > 0
    ? details.map(translateKuromojiPosDetail).join(' / ')
    : null;
}

function mapKuromojiPartOfSpeech(
  token: Pick<KuromojiToken, 'pos' | 'pos_detail_1'>,
): { label: string | null; group: ExampleSentencePosGroup } {
  const posMap: Record<
    string,
    { label: string; group: ExampleSentencePosGroup }
  > = {
    名詞: { label: 'danh từ', group: 'noun' },
    指示詞: { label: 'chỉ thị từ', group: 'noun' },
    動詞: { label: 'động từ', group: 'verb' },
    形容詞: { label: 'tính từ', group: 'modifier' },
    副詞: { label: 'trạng từ', group: 'modifier' },
    助詞: { label: 'trợ từ', group: 'particle' },
    接続詞: { label: 'liên từ', group: 'particle' },
    連体詞: { label: 'liên thể từ', group: 'particle' },
    接尾辞: { label: 'hậu tố', group: 'suffix' },
    接頭詞: { label: 'tiền tố', group: 'auxiliary' },
    助動詞: { label: 'trợ động từ', group: 'auxiliary' },
    判定詞: { label: 'hệ từ', group: 'auxiliary' },
    感動詞: { label: 'thán từ', group: 'other' },
    記号: { label: 'ký hiệu', group: 'symbol' },
    フィラー: { label: 'từ đệm', group: 'other' },
  };

  if (token.pos_detail_1?.includes('接尾')) {
    return { label: 'hậu tố', group: 'suffix' };
  }

  return posMap[token.pos] ?? { label: token.pos ?? null, group: 'other' };
}

function normalizePartOfSpeech(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();
}

function mapDictionaryPartOfSpeech(
  partOfSpeech?: string | null,
): { label: string | null; group: ExampleSentencePosGroup | null } {
  if (!partOfSpeech) {
    return { label: null, group: null };
  }

  const normalized = normalizePartOfSpeech(partOfSpeech);
  const candidates: Array<{
    needle: string;
    label: string;
    group: ExampleSentencePosGroup;
  }> = [
    { needle: 'danh tu', label: 'danh từ', group: 'noun' },
    { needle: 'dong tu', label: 'động từ', group: 'verb' },
    { needle: 'tro dong tu', label: 'trợ động từ', group: 'auxiliary' },
    { needle: 'tinh tu', label: 'tính từ', group: 'modifier' },
    { needle: 'pho tu', label: 'phó từ', group: 'modifier' },
    { needle: 'trang tu', label: 'trạng từ', group: 'modifier' },
    { needle: 'tro tu', label: 'trợ từ', group: 'particle' },
    { needle: 'lien tu', label: 'liên từ', group: 'particle' },
    { needle: 'lien the', label: 'liên thể từ', group: 'particle' },
    { needle: 'hau to', label: 'hậu tố', group: 'suffix' },
    { needle: 'tien to', label: 'tiền tố', group: 'auxiliary' },
    { needle: 'ky hieu', label: 'ký hiệu', group: 'symbol' },
  ];

  const match = candidates
    .map((candidate) => ({
      ...candidate,
      index: normalized.indexOf(candidate.needle),
    }))
    .filter((candidate) => candidate.index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  return match
    ? { label: match.label, group: match.group }
    : { label: partOfSpeech, group: 'other' };
}

function shouldUseDictionaryPartOfSpeech(
  token: ExampleSentenceToken,
  dictionaryPos: { label: string | null; group: ExampleSentencePosGroup | null },
) {
  if (!dictionaryPos.label || !dictionaryPos.group) {
    return false;
  }

  if (/[\u3400-\u9fff]/u.test(token.text)) {
    return true;
  }

  if (token.posRaw === '名詞' && dictionaryPos.group === 'noun') {
    return true;
  }

  if (token.posRaw === '副詞' && dictionaryPos.group === 'modifier') {
    return true;
  }

  return false;
}

function tokenizeWithKuromoji(
  sentence: string,
  tokenizer: KuromojiTokenizer,
): ExampleSentenceToken[] {
  const tokens: ExampleSentenceToken[] = [];
  let cursor = 0;

  for (const token of tokenizer.tokenize(sentence)) {
    const text = token.surface_form;
    const start = Math.max(token.word_position - 1, cursor);
    const end = start + text.length;

    if (start > cursor) {
      const gap = sentence.slice(cursor, start);
      tokens.push({
        text: gap,
        start: cursor,
        end: start,
        kind: classifyExampleSentenceToken(gap),
      });
    }

    const basicForm =
      token.basic_form && token.basic_form !== '*' ? token.basic_form : text;
    const shouldPreferBasicForm =
      (token.pos === '動詞' || token.pos === '形容詞') && basicForm !== text;
    const lookupCandidates = shouldPreferBasicForm
      ? [basicForm, text]
      : [text, basicForm];
    const lookupQueries = [...new Set(lookupCandidates.filter(Boolean))];

    const pos = mapKuromojiPartOfSpeech(token);
    const reading =
      token.reading && token.reading !== '*'
        ? toHiragana(token.reading)
        : undefined;

    tokens.push({
      text,
      start,
      end,
      kind: classifyExampleSentenceToken(text),
      basicForm,
      reading,
      posRaw: token.pos,
      posDetail: formatKuromojiPosDetail(token),
      posRawLabel: pos.label,
      posDetailLabel: formatKuromojiPosDetailLabel(token),
      posLabel: pos.label,
      posGroup: pos.group,
      lookupQueries,
    });

    cursor = end;
  }

  if (cursor < sentence.length) {
    const rest = sentence.slice(cursor);
    tokens.push({
      text: rest,
      start: cursor,
      end: sentence.length,
      kind: classifyExampleSentenceToken(rest),
    });
  }

  return tokens;
}

function tokenizeExampleSentence(
  sentence: string,
  tokenizer?: KuromojiTokenizer,
): ExampleSentenceToken[] {
  if (!sentence) {
    return [];
  }

  if (tokenizer) {
    return tokenizeWithKuromoji(sentence, tokenizer);
  }

  const segmenter =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? new Intl.Segmenter('ja', { granularity: 'word' })
      : null;

  if (segmenter) {
    return [...segmenter.segment(sentence)].map((segment) => {
      const text = segment.segment;
      return {
        text,
        start: segment.index,
        end: segment.index + text.length,
        kind: classifyExampleSentenceToken(text),
      };
    });
  }

  const tokens: ExampleSentenceToken[] = [];
  const pattern =
    /(\s+|[\p{P}\p{S}]+|[\p{Script=Han}]+|[\p{Script=Hiragana}]+|[\p{Script=Katakana}]+|[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?|.)/gu;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sentence)) !== null) {
    const text = match[1];
    tokens.push({
      text,
      start: match.index,
      end: match.index + text.length,
      kind: classifyExampleSentenceToken(text),
    });
  }

  return tokens;
}

function normalizeForMatching(value: string) {
  const normalizedChars: string[] = [];
  const indexMap: number[] = [];

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const normalized = char.normalize('NFD');

    for (const normalizedChar of normalized) {
      if (/[\p{M}]/u.test(normalizedChar)) {
        continue;
      }

      const lower = normalizedChar.toLowerCase();
      if (/\s/u.test(lower)) {
        if (normalizedChars[normalizedChars.length - 1] !== ' ') {
          normalizedChars.push(' ');
          indexMap.push(i);
        }
        continue;
      }

      normalizedChars.push(lower);
      indexMap.push(i);
    }
  }

  return {
    normalized: normalizedChars.join(''),
    indexMap,
  };
}

function resolveVietnameseMeaning(
  exampleMeaningVi: string,
  tokenMeaningVi?: string,
): string | null {
  if (!exampleMeaningVi || !tokenMeaningVi) {
    return null;
  }

  const candidates = splitMeaningPhrases(tokenMeaningVi).sort(
    (a, b) => b.length - a.length,
  );

  const normalizedMeaning = normalizeForMatching(exampleMeaningVi);

  for (const candidate of candidates) {
    if (exampleMeaningVi.includes(candidate)) {
      return candidate;
    }

    const normalizedCandidate = normalizeForMatching(candidate);
    if (!normalizedCandidate.normalized) {
      continue;
    }

    if (normalizedMeaning.normalized.includes(normalizedCandidate.normalized)) {
      return candidate;
    }
  }

  return null;
}

function splitMeaningPhrases(meaningVi: string): string[] {
  return meaningVi
    .split(/[;、,/·•\n]+/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

function inferExamplePartOfSpeech(surface: string): string | null {
  const normalized = surface.replace(/\s+/g, '').trim();
  if (!normalized) {
    return null;
  }

  if (/^[はがをにへとでやもかなの]+$/u.test(normalized)) {
    return 'trợ từ';
  }

  if (
    /^(する|し|して|してい|て|てい|ます|ました|ない|なかっ|だった|です|だ|いる|いく|くる|れる|られる)$/u.test(
      normalized,
    )
  ) {
    return 'động từ';
  }

  if (/^(です|だ)$/u.test(normalized)) {
    return 'trợ động từ';
  }

  return null;
}

function buildExampleTokens(
  word: Pick<
    Word,
    | 'example_sentence'
    | 'example_meaning_vi'
    | 'meaning_vi'
    | 'part_of_speech'
    | 'id'
    | 'kanji'
    | 'kana'
    | 'romaji'
  >,
  lookupWord: (query: string) => Word | undefined,
  tokenizer?: KuromojiTokenizer,
): ExampleSentenceTokenAnnotation[] | undefined {
  if (!word.example_sentence) {
    return undefined;
  }

  const tokens = tokenizeExampleSentence(word.example_sentence, tokenizer);
  const annotations = tokens
    .filter((token) => token.text.length > 0)
    .map<ExampleSentenceTokenAnnotation>((token, index) => {
      const inferred = token.posLabel ?? inferExamplePartOfSpeech(token.text);
      const baseAnnotation = {
        id: index + 1,
        surface: token.text,
        start: token.start,
        end: token.end,
        kind: token.kind,
        ...(token.basicForm ? { basic_form: token.basicForm } : {}),
        ...(token.reading ? { reading: token.reading } : {}),
        ...(token.posRaw ? { pos_raw: token.posRaw } : {}),
        ...(token.posDetail ? { pos_detail: token.posDetail } : {}),
        ...(token.posRawLabel ? { pos_raw_label: token.posRawLabel } : {}),
        ...(token.posDetailLabel
          ? { pos_detail_label: token.posDetailLabel }
          : {}),
        ...(inferred ? { pos_label: inferred } : {}),
        ...(token.posGroup ? { pos_group: token.posGroup } : {}),
      };

      if (token.kind !== 'word' || token.text.trim().length === 0) {
        return {
          ...baseAnnotation,
          part_of_speech: inferred,
          meaning_vi: null,
        };
      }

      const lookupQueries = token.lookupQueries ?? [token.text];
      const match = lookupQueries
        .map((query) => lookupWord(query))
        .find((entry): entry is Word => Boolean(entry));
      if (!match) {
        return {
          ...baseAnnotation,
          part_of_speech: inferred,
          meaning_vi: null,
        };
      }

      const meaningVi = resolveVietnameseMeaning(
        word.example_meaning_vi,
        match.meaning_vi,
      );
      const dictionaryPos = mapDictionaryPartOfSpeech(match.part_of_speech);
      const useDictionaryPos = shouldUseDictionaryPartOfSpeech(
        token,
        dictionaryPos,
      );

      return {
        ...baseAnnotation,
        ...(useDictionaryPos && dictionaryPos.label
          ? { pos_label: dictionaryPos.label }
          : {}),
        ...(useDictionaryPos && dictionaryPos.group
          ? { pos_group: dictionaryPos.group }
          : {}),
        part_of_speech: useDictionaryPos
          ? match.part_of_speech || inferred
          : inferred,
        meaning_vi: meaningVi,
      };
    });

  return annotations;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;
  private japaneseTokenizer?: KuromojiTokenizer;

  async onModuleInit() {
    const dbPath = path.join(process.cwd(), 'data', 'dictionary.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
    this.seedData();
    this.populateMissingWordHanViet();
    this.populateMissingRadicalShapes();
    await this.initializeJapaneseTokenizer();
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
    }
  }

  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kanji TEXT NOT NULL,
        kana TEXT NOT NULL,
        romaji TEXT NOT NULL,
        meaning_vi TEXT NOT NULL,
        han_viet TEXT,
        meaning_en TEXT NOT NULL,
        part_of_speech TEXT,
        example_sentence TEXT,
        example_meaning_vi TEXT
      );

      CREATE TABLE IF NOT EXISTS kanji_data (
        kanji TEXT PRIMARY KEY,
        meaning_vi TEXT NOT NULL DEFAULT '',
        meaning_en TEXT NOT NULL DEFAULT '',
        on_reading TEXT,
        kun_reading TEXT,
        stroke_count INTEGER,
        stroke_paths TEXT,
        stroke_numbers TEXT,
        radical TEXT,
        radical_element TEXT,
        radical_original TEXT,

        radical_meaning TEXT
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (word_id) REFERENCES words(id)
      );

      CREATE INDEX IF NOT EXISTS idx_words_romaji ON words(romaji);
      CREATE INDEX IF NOT EXISTS idx_words_kanji ON words(kanji);
      CREATE INDEX IF NOT EXISTS idx_words_kana ON words(kana);
      CREATE INDEX IF NOT EXISTS idx_favorites_word_id ON favorites(word_id);
    `);

    // FTS5 full-text search (idempotent — won't recreate if exists)
    this.ensureColumn('words', 'han_viet', 'TEXT');
    this.ensureColumn('kanji_data', 'radical_element', 'TEXT');
    this.ensureColumn('kanji_data', 'radical_original', 'TEXT');
    this.initFTS5();
  }

  private initializeJapaneseTokenizer(): Promise<void> {
    const dicPath = path.join(
      process.cwd(),
      'node_modules',
      'kuromoji',
      'dict',
    );

    return new Promise((resolve) => {
      kuromoji.builder({ dicPath }).build((error, tokenizer) => {
        if (!error && tokenizer) {
          this.japaneseTokenizer = tokenizer;
        }

        resolve();
      });
    });
  }

  private ensureColumn(table: string, column: string, definition: string) {
    const columns = this.db.prepare(`PRAGMA table_info(${table})`).all() as {
      name: string;
    }[];
    if (columns.some((entry) => entry.name === column)) {
      return;
    }
    this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }

  private initFTS5() {
    const hasFts = this.db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='words_fts'",
      )
      .get();

    if (hasFts) return; // already set up

    this.db.exec(`
      CREATE VIRTUAL TABLE words_fts USING fts5(
        kanji, kana, romaji, meaning_en, meaning_vi,
        content='words', content_rowid='id',
        tokenize='unicode61 remove_diacritics 0'
      );

      INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      SELECT id, kanji, kana, romaji, meaning_en, meaning_vi FROM words;

      CREATE TRIGGER words_fts_ai AFTER INSERT ON words BEGIN
        INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
        VALUES (new.id, new.kanji, new.kana, new.romaji, new.meaning_en, new.meaning_vi);
      END;

      CREATE TRIGGER words_fts_ad AFTER DELETE ON words BEGIN
        INSERT INTO words_fts(words_fts, rowid, kanji, kana, romaji, meaning_en, meaning_vi)
        VALUES ('delete', old.id, old.kanji, old.kana, old.romaji, old.meaning_en, old.meaning_vi);
      END;

      CREATE TRIGGER words_fts_au AFTER UPDATE ON words BEGIN
        INSERT INTO words_fts(words_fts, rowid, kanji, kana, romaji, meaning_en, meaning_vi)
        VALUES ('delete', old.id, old.kanji, old.kana, old.romaji, old.meaning_en, old.meaning_vi);
        INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
        VALUES (new.id, new.kanji, new.kana, new.romaji, new.meaning_en, new.meaning_vi);
      END;
    `);
  }

  private seedData() {
    const count = this.db
      .prepare('SELECT COUNT(*) as count FROM words')
      .get() as { count: number };
    if (count.count > 0) return;

    const sampleWords = [
      {
        kanji: '日本',
        kana: 'にほん',
        romaji: 'nihon',
        meaning_vi: 'Nhật Bản',
        meaning_en: 'Japan',
        pos: 'danh từ',
        example: '日本は美しいです。',
        example_vi: 'Nhật Bản là đẹp.',
      },
      {
        kanji: 'ありがとう',
        kana: 'ありがとう',
        romaji: 'arigatou',
        meaning_vi: 'Cảm ơn',
        meaning_en: 'Thank you',
        pos: 'cụm từ',
        example: 'ありがとうございます。',
        example_vi: 'Cảm ơn (bạn).',
      },
      {
        kanji: '水',
        kana: 'みず',
        romaji: 'mizu',
        meaning_vi: 'Nước',
        meaning_en: 'Water',
        pos: 'danh từ',
        example: '水を飲みたいです。',
        example_vi: 'Tôi muốn uống nước.',
      },
      {
        kanji: '食べる',
        kana: 'たべる',
        romaji: 'taberu',
        meaning_vi: 'Ăn',
        meaning_en: 'To eat',
        pos: 'động từ',
        example: 'ごはんを食べます。',
        example_vi: 'Ăn cơm.',
      },
      {
        kanji: '行く',
        kana: 'いく',
        romaji: 'iku',
        meaning_vi: 'Đi',
        meaning_en: 'To go',
        pos: 'động từ',
        example: '学校に行きます。',
        example_vi: 'Đi đến trường.',
      },
      {
        kanji: '本',
        kana: 'ほん',
        romaji: 'hon',
        meaning_vi: 'Sách',
        meaning_en: 'Book',
        pos: 'danh từ',
        example: '本を読みます。',
        example_vi: 'Đọc sách.',
      },
      {
        kanji: '犬',
        kana: 'いぬ',
        romaji: 'inu',
        meaning_vi: 'Con chó',
        meaning_en: 'Dog',
        pos: 'danh từ',
        example: '犬が可愛いです。',
        example_vi: 'Con chó đáng yêu.',
      },
      {
        kanji: '猫',
        kana: 'ねこ',
        romaji: 'neko',
        meaning_vi: 'Con mèo',
        meaning_en: 'Cat',
        pos: 'danh từ',
        example: '猫が新鮮なです。',
        example_vi: 'Con mèo dễ thương.',
      },
      {
        kanji: '山',
        kana: 'やま',
        romaji: 'yama',
        meaning_vi: 'Núi',
        meaning_en: 'Mountain',
        pos: 'danh từ',
        example: '山に登ります。',
        example_vi: 'Leo núi.',
      },
      {
        kanji: '海',
        kana: 'うみ',
        romaji: 'umi',
        meaning_vi: 'Biển',
        meaning_en: 'Sea',
        pos: 'danh từ',
        example: '海が綺麗です。',
        example_vi: 'Biển đẹp.',
      },
      {
        kanji: '花',
        kana: 'はな',
        romaji: 'hana',
        meaning_vi: 'Hoa',
        meaning_en: 'Flower',
        pos: 'danh từ',
        example: '花が咲いています。',
        example_vi: 'Hoa đang nở.',
      },
      {
        kanji: '車',
        kana: 'くるま',
        romaji: 'kuruma',
        meaning_vi: 'Ô tô',
        meaning_en: 'Car',
        pos: 'danh từ',
        example: '車で通勤します。',
        example_vi: 'Đi làm bằng ô tô.',
      },
      {
        kanji: '友達',
        kana: 'ともだち',
        romaji: 'tomodachi',
        meaning_vi: 'Bạn bè',
        meaning_en: 'Friend',
        pos: 'danh từ',
        example: '友達と遊びます。',
        example_vi: 'Chơi với bạn bè.',
      },
      {
        kanji: '先生',
        kana: 'せんせい',
        romaji: 'sensei',
        meaning_vi: 'Giáo viên',
        meaning_en: 'Teacher',
        pos: 'danh từ',
        example: '先生は優しいです。',
        example_vi: 'Giáo viên dễ thương.',
      },
      {
        kanji: '学生',
        kana: 'がくせい',
        romaji: 'gakusei',
        meaning_vi: 'Học sinh',
        meaning_en: 'Student',
        pos: 'danh từ',
        example: '私は学生です。',
        example_vi: 'Tôi là học sinh.',
      },
      {
        kanji: '日本語',
        kana: 'にほんご',
        romaji: 'nihongo',
        meaning_vi: 'Tiếng Nhật',
        meaning_en: 'Japanese language',
        pos: 'danh từ',
        example: '日本語を勉強します。',
        example_vi: 'Học tiếng Nhật.',
      },
      {
        kanji: '好き',
        kana: 'すき',
        romaji: 'suki',
        meaning_vi: 'Thích',
        meaning_en: 'Like',
        pos: 'tính từ',
        example: '寿司が好きです。',
        example_vi: 'Thích ăn sushi.',
      },
      {
        kanji: '嫌い',
        kana: 'きらい',
        romaji: 'kirai',
        meaning_vi: 'Ghét',
        meaning_en: 'Dislike',
        pos: 'tính từ',
        example: 'ピーマンが嫌いです。',
        example_vi: 'Ghét ớt chuông.',
      },
      {
        kanji: '大きい',
        kana: 'おおきい',
        romaji: 'ookii',
        meaning_vi: 'Lớn',
        meaning_en: 'Big',
        pos: 'tính từ',
        example: 'この家は大きいです。',
        example_vi: 'Ngôi nhà này lớn.',
      },
      {
        kanji: '小さい',
        kana: 'ちいさい',
        romaji: 'chiisai',
        meaning_vi: 'Nhỏ',
        meaning_en: 'Small',
        pos: 'tính từ',
        example: 'この猫は小さいです。',
        example_vi: 'Con mèo này nhỏ.',
      },
      // Nature elements
      {
        kanji: '火',
        kana: 'ひ',
        romaji: 'hi',
        meaning_vi: 'Lửa',
        meaning_en: 'Fire',
        pos: 'danh từ',
        example: '火曜日に会います。',
        example_vi: 'Gặp vào thứ Ba.',
      },
      {
        kanji: '木',
        kana: 'き',
        romaji: 'ki',
        meaning_vi: 'Cây',
        meaning_en: 'Tree',
        pos: 'danh từ',
        example: '木の上に鳥がいます。',
        example_vi: 'Có chim trên cây.',
      },
      {
        kanji: '川',
        kana: 'かわ',
        romaji: 'kawa',
        meaning_vi: 'Sông',
        meaning_en: 'River',
        pos: 'danh từ',
        example: '川で魚を釣ります。',
        example_vi: 'Câu cá ở sông.',
      },
      {
        kanji: '空',
        kana: 'そら',
        romaji: 'sora',
        meaning_vi: 'Bầu trời',
        meaning_en: 'Sky',
        pos: 'danh từ',
        example: '空が綺麗です。',
        example_vi: 'Bầu trời đẹp.',
      },
      {
        kanji: '雨',
        kana: 'あめ',
        romaji: 'ame',
        meaning_vi: 'Mưa',
        meaning_en: 'Rain',
        pos: 'danh từ',
        example: '雨が降っています。',
        example_vi: 'Trời đang mưa.',
      },
      {
        kanji: '雪',
        kana: 'ゆき',
        romaji: 'yuki',
        meaning_vi: 'Tuyết',
        meaning_en: 'Snow',
        pos: 'danh từ',
        example: '雪が積もっています。',
        example_vi: 'Tuyết đang堆积.',
      },
      {
        kanji: '風',
        kana: 'かぜ',
        romaji: 'kaze',
        meaning_vi: 'Gió',
        meaning_en: 'Wind',
        pos: 'danh từ',
        example: '風が強いです。',
        example_vi: 'Gió mạnh.',
      },
      {
        kanji: '星',
        kana: 'ほし',
        romaji: 'hoshi',
        meaning_vi: 'Sao',
        meaning_en: 'Star',
        pos: 'danh từ',
        example: '星が綺麗です。',
        example_vi: 'Những ngôi sao đẹp.',
      },
      {
        kanji: '月',
        kana: 'つき',
        romaji: 'tsuki',
        meaning_vi: 'Mặt trăng',
        meaning_en: 'Moon',
        pos: 'danh từ',
        example: '月が綺麗ですね。',
        example_vi: 'Mặt trăng đẹp nhỉ.',
      },
      {
        kanji: '日',
        kana: 'ひ',
        romaji: 'hi',
        meaning_vi: 'Mặt trời',
        meaning_en: 'Sun',
        pos: 'danh từ',
        example: '日出が綺麗です。',
        example_vi: 'Mặt trời mọc đẹp.',
      },
      // Time & numbers
      {
        kanji: '今日',
        kana: 'きょう',
        romaji: 'kyou',
        meaning_vi: 'Hôm nay',
        meaning_en: 'Today',
        pos: 'danh từ',
        example: '今日は晴れです。',
        example_vi: 'Hôm nay trời nắng.',
      },
      {
        kanji: '明日',
        kana: 'あした',
        romaji: 'ashita',
        meaning_vi: 'Ngày mai',
        meaning_en: 'Tomorrow',
        pos: 'danh từ',
        example: '明日会います。',
        example_vi: 'Gặp ngày mai.',
      },
      {
        kanji: '昨日',
        kana: 'きのう',
        romaji: 'kinou',
        meaning_vi: 'Hôm qua',
        meaning_en: 'Yesterday',
        pos: 'danh từ',
        example: '昨日映画を見ました。',
        example_vi: 'Hôm qua xem phim.',
      },
      {
        kanji: '一',
        kana: 'いち',
        romaji: 'ichi',
        meaning_vi: 'Một',
        meaning_en: 'One',
        pos: 'số từ',
        example: '一つください。',
        example_vi: 'Cho tôi một cái.',
      },
      {
        kanji: '二',
        kana: 'に',
        romaji: 'ni',
        meaning_vi: 'Hai',
        meaning_en: 'Two',
        pos: 'số từ',
        example: '二郎美味しいです。',
        example_vi: 'Ramen Jiro ngon.',
      },
      {
        kanji: '三',
        kana: 'さん',
        romaji: 'san',
        meaning_vi: 'Ba',
        meaning_en: 'Three',
        pos: 'số từ',
        example: '三時に会います。',
        example_vi: 'Gặp lúc 3 giờ.',
      },
      {
        kanji: '四',
        kana: 'よん',
        romaji: 'yon',
        meaning_vi: 'Bốn',
        meaning_en: 'Four',
        pos: 'số từ',
        example: '四月が一番綺麗です。',
        example_vi: 'Tháng tư đẹp nhất.',
      },
      {
        kanji: '五',
        kana: 'ご',
        romaji: 'go',
        meaning_vi: 'Năm',
        meaning_en: 'Five',
        pos: 'số từ',
        example: '五年間日本に住んでいました。',
        example_vi: 'Sống ở Nhật 5 năm.',
      },
      {
        kanji: '六',
        kana: 'ろく',
        romaji: 'roku',
        meaning_vi: 'Sáu',
        meaning_en: 'Six',
        pos: 'số từ',
        example: '六時に起きます。',
        example_vi: 'Dậy lúc 6 giờ.',
      },
      {
        kanji: '七',
        kana: 'なな',
        romaji: 'nana',
        meaning_vi: 'Bảy',
        meaning_en: 'Seven',
        pos: 'số từ',
        example: '七月は暑期です。',
        example_vi: 'Tháng bảy là kỳ nghỉ.',
      },
      {
        kanji: '八',
        kana: 'はち',
        romaji: 'hachi',
        meaning_vi: 'Tám',
        meaning_en: 'Eight',
        pos: 'số từ',
        example: '八幡宮に行きました。',
        example_vi: 'Đi đến đền Hachiman.',
      },
      {
        kanji: '九',
        kana: 'きゅう',
        romaji: 'kyuu',
        meaning_vi: 'Chín',
        meaning_en: 'Nine',
        pos: 'số từ',
        example: '九月の旅行が好きです。',
        example_vi: 'Thích đi du lịch vào tháng 9.',
      },
      {
        kanji: '十',
        kana: 'じゅう',
        romaji: 'juu',
        meaning_vi: 'Mười',
        meaning_en: 'Ten',
        pos: 'số từ',
        example: '十時に寝ます。',
        example_vi: 'Ngủ lúc 10 giờ.',
      },
      {
        kanji: '百',
        kana: 'ひゃく',
        romaji: 'hyaku',
        meaning_vi: 'Trăm',
        meaning_en: 'Hundred',
        pos: 'số từ',
        example: '三百円でした。',
        example_vi: 'Là 300 yen.',
      },
      {
        kanji: '千',
        kana: 'せん',
        romaji: 'sen',
        meaning_vi: 'Nghìn',
        meaning_en: 'Thousand',
        pos: 'số từ',
        example: '千年前のことです。',
        example_vi: 'Chuyện từ 1000 năm trước.',
      },
      // Common verbs
      {
        kanji: '来る',
        kana: 'くる',
        romaji: 'kuru',
        meaning_vi: 'Đến',
        meaning_en: 'To come',
        pos: 'động từ',
        example: '明日来ます。',
        example_vi: 'Ngày mai tôi sẽ đến.',
      },
      {
        kanji: '見る',
        kana: 'みる',
        romaji: 'miru',
        meaning_vi: 'Nhìn, Xem',
        meaning_en: 'To see, To watch',
        pos: 'động từ',
        example: '映画を見ます。',
        example_vi: 'Xem phim.',
      },
      {
        kanji: '飲む',
        kana: 'のむ',
        romaji: 'nomu',
        meaning_vi: 'Uống',
        meaning_en: 'To drink',
        pos: 'động từ',
        example: 'コーヒーを飲みます。',
        example_vi: 'Uống cà phê.',
      },
      {
        kanji: '書く',
        kana: 'かく',
        romaji: 'kaku',
        meaning_vi: 'Viết',
        meaning_en: 'To write',
        pos: 'động từ',
        example: '手紙を書きます。',
        example_vi: 'Viết thư.',
      },
      {
        kanji: '読む',
        kana: 'よむ',
        romaji: 'yomu',
        meaning_vi: 'Đọc',
        meaning_en: 'To read',
        pos: 'động từ',
        example: '本を読みます。',
        example_vi: 'Đọc sách.',
      },
      {
        kanji: '話す',
        kana: 'はなす',
        romaji: 'hanasu',
        meaning_vi: 'Nói',
        meaning_en: 'To speak',
        pos: 'động từ',
        example: '日本語を話します。',
        example_vi: 'Nói tiếng Nhật.',
      },
      {
        kanji: '聞く',
        kana: 'きく',
        romaji: 'kiku',
        meaning_vi: 'Nghe, Hỏi',
        meaning_en: 'To hear, To ask',
        pos: 'động từ',
        example: '音楽を聞きます。',
        example_vi: 'Nghe nhạc.',
      },
      {
        kanji: '買う',
        kana: 'かう',
        romaji: 'kau',
        meaning_vi: 'Mua',
        meaning_en: 'To buy',
        pos: 'động từ',
        example: '野菜を買います。',
        example_vi: 'Mua rau.',
      },
      {
        kanji: '寝る',
        kana: 'ねる',
        romaji: 'neru',
        meaning_vi: 'Ngủ',
        meaning_en: 'To sleep',
        pos: 'động từ',
        example: '早く寝ます。',
        example_vi: 'Đi ngủ sớm.',
      },
      {
        kanji: '起きる',
        kana: 'おきる',
        romaji: 'okiru',
        meaning_vi: 'Thức dậy',
        meaning_en: 'To wake up',
        pos: 'động từ',
        example: '六時に起きます。',
        example_vi: 'Dậy lúc 6 giờ.',
      },
      {
        kanji: '働く',
        kana: 'はたらく',
        romaji: 'hataraku',
        meaning_vi: 'Làm việc',
        meaning_en: 'To work',
        pos: 'động từ',
        example: '毎日働きます。',
        example_vi: 'Làm việc mỗi ngày.',
      },
      {
        kanji: '作る',
        kana: 'つくる',
        romaji: 'tsukuru',
        meaning_vi: 'Làm, Tạo',
        meaning_en: 'To make',
        pos: 'động từ',
        example: '料理を作ります。',
        example_vi: 'Nấu ăn.',
      },
      {
        kanji: '思う',
        kana: 'おもう',
        romaji: 'omou',
        meaning_vi: 'Nghĩ',
        meaning_en: 'To think',
        pos: 'động từ',
        example: '美味しいと思います。',
        example_vi: 'Tôi nghĩ là ngon.',
      },
      {
        kanji: '分かる',
        kana: 'わかる',
        romaji: 'wakaru',
        meaning_vi: 'Hiểu',
        meaning_en: 'To understand',
        pos: 'động từ',
        example: '日本語が分かります。',
        example_vi: 'Tôi hiểu tiếng Nhật.',
      },
      {
        kanji: '使う',
        kana: 'つかう',
        romaji: 'tsukau',
        meaning_vi: 'Sử dụng',
        meaning_en: 'To use',
        pos: 'động từ',
        example: 'パソコンを使います。',
        example_vi: 'Dùng máy tính.',
      },
      {
        kanji: '待つ',
        kana: 'まつ',
        romaji: 'matsu',
        meaning_vi: 'Đợi',
        meaning_en: 'To wait',
        pos: 'động từ',
        example: 'ここで待ちます。',
        example_vi: 'Đợi ở đây.',
      },
      {
        kanji: '教える',
        kana: 'おしえる',
        romaji: 'oshieru',
        meaning_vi: 'Dạy',
        meaning_en: 'To teach',
        pos: 'động từ',
        example: '数学を教えます。',
        example_vi: 'Dạy toán.',
      },
      {
        kanji: '勉強する',
        kana: 'べんきょうする',
        romaji: 'benkyou suru',
        meaning_vi: 'Học',
        meaning_en: 'To study',
        pos: 'động từ',
        example: '毎日勉強します。',
        example_vi: 'Học mỗi ngày.',
      },
      // Common adjectives
      {
        kanji: '新しい',
        kana: 'あたらしい',
        romaji: 'atarashii',
        meaning_vi: 'Mới',
        meaning_en: 'New',
        pos: 'tính từ',
        example: '新しい車を買いました。',
        example_vi: 'Mua xe mới.',
      },
      {
        kanji: '古い',
        kana: 'ふるい',
        romaji: 'furui',
        meaning_vi: 'Cũ',
        meaning_en: 'Old',
        pos: 'tính từ',
        example: '古い家です。',
        example_vi: 'Là ngôi nhà cũ.',
      },
      {
        kanji: '美味しい',
        kana: 'おいしい',
        romaji: 'oishii',
        meaning_vi: 'Ngon',
        meaning_en: 'Delicious',
        pos: 'tính từ',
        example: 'この寿司美味しいです。',
        example_vi: 'Sushi này ngon.',
      },
      {
        kanji: '高い',
        kana: 'たかい',
        romaji: 'takai',
        meaning_vi: 'Cao, Đắt',
        meaning_en: 'High, Expensive',
        pos: 'tính từ',
        example: '山が高いです。',
        example_vi: 'Ngọn núi cao.',
      },
      {
        kanji: '低い',
        kana: 'ひくい',
        romaji: 'hikui',
        meaning_vi: 'Thấp',
        meaning_en: 'Low',
        pos: 'tính từ',
        example: 'あのビルは低いです。',
        example_vi: 'Tòa nhà kia thấp.',
      },
      {
        kanji: '長い',
        kana: 'ながい',
        romaji: 'nagai',
        meaning_vi: 'Dài',
        meaning_en: 'Long',
        pos: 'tính từ',
        example: '髪が長いです。',
        example_vi: 'Tóc dài.',
      },
      {
        kanji: '短い',
        kana: 'みじかい',
        romaji: 'mijikai',
        meaning_vi: 'Ngắn',
        meaning_en: 'Short',
        pos: 'tính từ',
        example: '髪が短いです。',
        example_vi: 'Tóc ngắn.',
      },
      {
        kanji: '広い',
        kana: 'ひろい',
        romaji: 'hiroi',
        meaning_vi: 'Rộng',
        meaning_en: 'Wide',
        pos: 'tính từ',
        example: '部屋が広いです。',
        example_vi: 'Phòng rộng.',
      },
      {
        kanji: '狭い',
        kana: 'せまい',
        romaji: 'semai',
        meaning_vi: 'Hẹp',
        meaning_en: 'Narrow',
        pos: 'tính từ',
        example: '部屋が狭いです。',
        example_vi: 'Phòng hẹp.',
      },
      {
        kanji: '易しい',
        kana: 'やさしい',
        romaji: 'yasashii',
        meaning_vi: 'Dễ',
        meaning_en: 'Easy',
        pos: 'tính từ',
        example: 'この問題は易しいです。',
        example_vi: 'Câu này dễ.',
      },
      // Daily life & school
      {
        kanji: '学校',
        kana: 'がっこう',
        romaji: 'gakkou',
        meaning_vi: 'Trường học',
        meaning_en: 'School',
        pos: 'danh từ',
        example: '学校に行きます。',
        example_vi: 'Đi đến trường.',
      },
      {
        kanji: '病院',
        kana: 'びょういん',
        romaji: 'byouin',
        meaning_vi: 'Bệnh viện',
        meaning_en: 'Hospital',
        pos: 'danh từ',
        example: '病院に行きます。',
        example_vi: 'Đi bệnh viện.',
      },
      {
        kanji: '会社',
        kana: 'かいしゃ',
        romaji: 'kaisha',
        meaning_vi: 'Công ty',
        meaning_en: 'Company',
        pos: 'danh từ',
        example: '会社で働いています。',
        example_vi: 'Làm việc ở công ty.',
      },
      {
        kanji: '電車',
        kana: 'でんしゃ',
        romaji: 'densha',
        meaning_vi: 'Tàu điện',
        meaning_en: 'Train',
        pos: 'danh từ',
        example: '電車で行きます。',
        example_vi: 'Đi bằng tàu điện.',
      },
      {
        kanji: '駅',
        kana: 'えき',
        romaji: 'eki',
        meaning_vi: 'Ga (tàu)',
        meaning_en: 'Station',
        pos: 'danh từ',
        example: '駅はどこですか。',
        example_vi: 'Ga ở đâu?',
      },
      {
        kanji: '電話',
        kana: 'でんわ',
        romaji: 'denwa',
        meaning_vi: 'Điện thoại',
        meaning_en: 'Telephone',
        pos: 'danh từ',
        example: '電話をかけます。',
        example_vi: 'Gọi điện thoại.',
      },
      {
        kanji: '時計',
        kana: 'とけい',
        romaji: 'tokei',
        meaning_vi: 'Đồng hồ',
        meaning_en: 'Clock',
        pos: 'danh từ',
        example: '時計を見ます。',
        example_vi: 'Nhìn đồng hồ.',
      },
      {
        kanji: '朝',
        kana: 'あさ',
        romaji: 'asa',
        meaning_vi: 'Buổi sáng',
        meaning_en: 'Morning',
        pos: 'danh từ',
        example: '朝ご飯を食べます。',
        example_vi: 'Ăn sáng.',
      },
      {
        kanji: '昼',
        kana: 'ひる',
        romaji: 'hiru',
        meaning_vi: 'Buổi trưa',
        meaning_en: 'Noon',
        pos: 'danh từ',
        example: '昼に休みます。',
        example_vi: 'Nghỉ trưa.',
      },
      {
        kanji: '夜',
        kana: 'よる',
        romaji: 'yoru',
        meaning_vi: 'Buổi tối',
        meaning_en: 'Night',
        pos: 'danh từ',
        example: '夜仕事します。',
        example_vi: 'Làm việc ban đêm.',
      },
      {
        kanji: '朝ご飯',
        kana: 'あさごはん',
        romaji: 'asagohan',
        meaning_vi: 'Bữa sáng',
        meaning_en: 'Breakfast',
        pos: 'danh từ',
        example: '朝ご飯を食べます。',
        example_vi: 'Ăn sáng.',
      },
      {
        kanji: '昼ご飯',
        kana: 'ひるごはん',
        romaji: 'hirugohan',
        meaning_vi: 'Bữa trưa',
        meaning_en: 'Lunch',
        pos: 'danh từ',
        example: '昼ご飯は何ですか。',
        example_vi: 'Trưa ăn gì?',
      },
      {
        kanji: '晩ご飯',
        kana: 'ばんごはん',
        romaji: 'bangohan',
        meaning_vi: 'Bữa tối',
        meaning_en: 'Dinner',
        pos: 'danh từ',
        example: '晩ご飯を作りません。',
        example_vi: 'Không nấu bữa tối.',
      },
      {
        kanji: 'お茶',
        kana: 'おちゃ',
        romaji: 'ocha',
        meaning_vi: 'Trà',
        meaning_en: 'Tea',
        pos: 'danh từ',
        example: 'お茶を飲みます。',
        example_vi: 'Uống trà.',
      },
      {
        kanji: 'コーヒー',
        kana: 'コーヒー',
        romaji: 'koohii',
        meaning_vi: 'Cà phê',
        meaning_en: 'Coffee',
        pos: 'danh từ',
        example: 'コーヒーをください。',
        example_vi: 'Cho tôi một cà phê.',
      },
      {
        kanji: '部屋',
        kana: 'へや',
        romaji: 'heya',
        meaning_vi: 'Phòng',
        meaning_en: 'Room',
        pos: 'danh từ',
        example: '部屋が綺麗です。',
        example_vi: 'Phòng đẹp.',
      },
      {
        kanji: '手紙',
        kana: 'てがみ',
        romaji: 'tegami',
        meaning_vi: 'Thư',
        meaning_en: 'Letter',
        pos: 'danh từ',
        example: '手紙を書きます。',
        example_vi: 'Viết thư.',
      },
      {
        kanji: '天気',
        kana: 'てんき',
        romaji: 'tenki',
        meaning_vi: 'Thời tiết',
        meaning_en: 'Weather',
        pos: 'danh từ',
        example: '明日の天気はどうですか。',
        example_vi: 'Ngày mai thời tiết thế nào?',
      },
      {
        kanji: '家族',
        kana: 'かぞく',
        romaji: 'kazoku',
        meaning_vi: 'Gia đình',
        meaning_en: 'Family',
        pos: 'danh từ',
        example: '家族は何人ですか。',
        example_vi: 'Gia đình có mấy người?',
      },
      {
        kanji: '父',
        kana: 'ちち',
        romaji: 'chichi',
        meaning_vi: 'Cha',
        meaning_en: 'Father',
        pos: 'danh từ',
        example: '父は教師です。',
        example_vi: 'Cha tôi là giáo viên.',
      },
      {
        kanji: '母',
        kana: 'はは',
        romaji: 'haha',
        meaning_vi: 'Mẹ',
        meaning_en: 'Mother',
        pos: 'danh từ',
        example: '母は料理を作ります。',
        example_vi: 'Mẹ nấu ăn.',
      },
    ];

    const insertWord = this.db.prepare(`
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (@kanji, @kana, @romaji, @meaning_vi, @meaning_en, @pos, @example, @example_vi)
    `);

    const insertMany = this.db.transaction((words: typeof sampleWords) => {
      for (const word of words) {
        insertWord.run(word);
      }
    });

    insertMany(sampleWords);
  }

  private populateMissingWordHanViet() {
    const words = this.db
      .prepare(
        "SELECT id, kanji FROM words WHERE han_viet IS NULL OR han_viet = ''",
      )
      .all() as Pick<Word, 'id' | 'kanji'>[];
    const kanjiChars = new Set<string>();

    for (const word of words) {
      for (const char of word.kanji) {
        if (/[\u4e00-\u9faf]/.test(char)) {
          kanjiChars.add(char);
        }
      }
    }

    if (kanjiChars.size === 0) {
      return;
    }

    const readings = this.loadVietnameseKanjiReadings(kanjiChars);
    if (readings.size === 0) {
      return;
    }

    const update = this.db.prepare(
      'UPDATE words SET han_viet = ? WHERE id = ?',
    );
    const updateBatch = this.db.transaction(() => {
      for (const word of words) {
        const hanViet = [...word.kanji]
          .map((char) => readings.get(char)?.[0])
          .filter(Boolean)
          .join(' ');
        if (hanViet) {
          update.run(hanViet, word.id);
        }
      }
    });

    updateBatch();
  }

  private loadVietnameseKanjiReadings(chars: Set<string>) {
    const readings = new Map<string, string[]>();
    const xmlPath = path.join(process.cwd(), 'kanjidic2.xml');
    if (!fs.existsSync(xmlPath)) {
      return readings;
    }

    const xml = fs.readFileSync(xmlPath, 'utf8');
    const characterRegex = /<character>([\s\S]*?)<\/character>/g;
    let match: RegExpExecArray | null;

    while ((match = characterRegex.exec(xml)) !== null) {
      const block = match[1];
      const literal = block.match(/<literal>([^<]+)<\/literal>/)?.[1];
      if (!literal || !chars.has(literal)) {
        continue;
      }

      const vietnamReadings = [
        ...block.matchAll(/<reading r_type="vietnam">([^<]+)<\/reading>/g),
      ].map((entry) => entry[1]);
      if (vietnamReadings.length > 0) {
        readings.set(literal, vietnamReadings);
      }
      if (readings.size === chars.size) {
        break;
      }
    }

    return readings;
  }

  private populateMissingRadicalShapes() {
    const kanjiRows = this.db
      .prepare(
        `
        SELECT kanji FROM kanji_data
        WHERE radical_element IS NULL
          OR radical_element = ''
          OR radical_original IS NULL
          OR (radical_element = kanji AND radical IS NOT NULL AND radical != kanji)
      `,
      )
      .all() as Pick<Kanji, 'kanji'>[];
    if (kanjiRows.length === 0) {
      return;
    }

    const update = this.db.prepare(
      'UPDATE kanji_data SET radical_element = ?, radical_original = ? WHERE kanji = ?',
    );
    const updateBatch = this.db.transaction(() => {
      for (const row of kanjiRows) {
        const metadata = this.loadKanjiVGMetadata(row.kanji);
        if (metadata.element || metadata.original !== undefined) {
          update.run(
            metadata.element || '',
            metadata.original || '',
            row.kanji,
          );
        }
      }
    });

    updateBatch();
  }

  private loadKanjiVGMetadata(kanji: string) {
    const codePoint = kanji
      .codePointAt(0)
      ?.toString(16)
      .padStart(5, '0')
      .toLowerCase();
    if (!codePoint) {
      return {};
    }

    const svgPath = path.join(
      process.cwd(),
      'kanjivg_data',
      'kanji',
      `${codePoint}.svg`,
    );
    if (!fs.existsSync(svgPath)) {
      return {};
    }

    const svg = fs.readFileSync(svgPath, 'utf8');
    return this.extractKanjiVGMetadata(svg, codePoint);
  }

  private extractKanjiVGMetadata(svg: string, codePoint?: string) {
    const groups = [...svg.matchAll(/<g\b([^>]*)>/g)].map((match) => match[1]);
    if (groups.length === 0) {
      return {};
    }

    const radicalGroups = groups
      .map((attrs) => ({
        attrs,
        radical: attrs.match(/kvg:radical="([^"]+)"/)?.[1],
      }))
      .filter((group): group is { attrs: string; radical: string } =>
        Boolean(group.radical),
      );

    const selectedGroup =
      radicalGroups.find((group) => group.radical === 'general') ??
      radicalGroups.find((group) => group.radical === 'tradit') ??
      radicalGroups[0];
    const attrs = selectedGroup?.attrs;
    if (!attrs) {
      const rootGroup = codePoint
        ? svg.match(new RegExp(`<g[^>]+id="kvg:${codePoint}"[^>]*>`))?.[0]
        : undefined;
      if (rootGroup) {
        return {
          element: rootGroup.match(/kvg:element="([^"]+)"/)?.[1],
          original: rootGroup.match(/kvg:original="([^"]+)"/)?.[1],
        };
      }

      return {};
    }

    return {
      element: attrs.match(/kvg:element="([^"]+)"/)?.[1],
      original: attrs.match(/kvg:original="([^"]+)"/)?.[1],
    };
  }

  searchWords(query: string): Word[] {
    return this.searchWordsRaw(query).map((word) => this.annotateWord(word));
  }

  private searchWordsRaw(query: string): Word[] {
    const q = query.trim();
    if (!q) return [];

    const likeQ = `%${q}%`;
    const prefixQ = `${q}%`;

    // Multi-tier scoring: build union of all match strategies
    const sql = `
      SELECT id, MAX(score) as final_score FROM (
        -- Tier 1: exact meaning_vi match (score 100)
        SELECT id, 100 as score FROM words WHERE meaning_vi = ?
        UNION ALL
        -- Tier 2: meaning_vi prefix match (score 90)
        SELECT id, 90 as score FROM words WHERE meaning_vi LIKE ? ESCAPE '\\'
        UNION ALL
        -- Tier 3: kanji exact (score 85)
        SELECT id, 85 as score FROM words WHERE kanji = ?
        UNION ALL
        -- Tier 4: kana exact (score 80)
        SELECT id, 80 as score FROM words WHERE kana = ?
        UNION ALL
        -- Tier 5: romaji exact (score 75)
        SELECT id, 75 as score FROM words WHERE LOWER(romaji) = LOWER(?)
        UNION ALL
        -- Tier 6: meaning_vi contains (score 60)
        SELECT id, 60 as score FROM words WHERE meaning_vi LIKE ? ESCAPE '\\'
        UNION ALL
        -- Tier 7: kana/kanji contains (score 50)
        SELECT id, 50 as score FROM words WHERE kana LIKE ? ESCAPE '\\' OR kanji LIKE ? ESCAPE '\\'
        UNION ALL
        -- Tier 8: romaji contains (score 45)
        SELECT id, 45 as score FROM words WHERE LOWER(romaji) LIKE LOWER(?)
        UNION ALL
        -- Tier 9: FTS5 full-text (score 20)
        SELECT w.id, 20 as score FROM words w
        JOIN words_fts f ON w.id = f.rowid
        WHERE words_fts MATCH ?
      )
      GROUP BY id
      ORDER BY final_score DESC, id ASC
      LIMIT 50
    `;

    // Build FTS5 query: quote each term for phrase matching
    const terms = q
      .replace(/['"*^()]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 0);
    const ftsQuery = terms.map((t) => `"${t}"`).join(' ');

    try {
      const rows = this.db.prepare(sql).all(
        q, // exact meaning_vi
        prefixQ, // meaning_vi prefix
        q, // kanji exact
        q, // kana exact
        q, // romaji exact
        likeQ, // meaning_vi contains
        likeQ,
        likeQ, // kana/kanji contains
        likeQ, // romaji contains
        ftsQuery,
      ) as { id: number; final_score: number }[];

      if (rows.length === 0) return [];

      // Fetch full word data for matched IDs in score order
      const ids = rows.map((r) => r.id);
      const placeholders = ids.map(() => '?').join(',');
      const words = this.db
        .prepare(`SELECT * FROM words WHERE id IN (${placeholders})`)
        .all(...ids) as Word[];

      // Re-sort by score order
      const idOrder = new Map(ids.map((id, i) => [id, i]));
      words.sort(
        (a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99),
      );

      return words;
    } catch {
      // Fallback: simple LIKE search
      return this.db
        .prepare(
          `
        SELECT * FROM words
        WHERE meaning_vi LIKE ? OR kana LIKE ? OR kanji LIKE ? OR LOWER(romaji) LIKE LOWER(?)
        LIMIT 50
      `,
        )
        .all(likeQ, likeQ, likeQ, likeQ) as Word[];
    }
  }

  getWordById(id: number): Word | undefined {
    const word = this.db.prepare('SELECT * FROM words WHERE id = ?').get(id) as
      | Word
      | undefined;
    if (!word) {
      return undefined;
    }

    return this.annotateWord(word);
  }

  getKanji(kanji: string): Kanji | undefined {
    return this.db
      .prepare('SELECT * FROM kanji_data WHERE kanji = ?')
      .get(kanji) as Kanji | undefined;
  }

  getAllKanji(): Kanji[] {
    return this.db.prepare('SELECT * FROM kanji_data').all() as Kanji[];
  }

  getFavorites(): FavoriteWordRow[] {
    const favorites = this.db
      .prepare(
        `
      SELECT f.*, w.kanji, w.kana, w.romaji, w.meaning_vi, w.han_viet, w.meaning_en, w.part_of_speech, w.example_sentence, w.example_meaning_vi
      FROM favorites f
      JOIN words w ON f.word_id = w.id
      ORDER BY f.created_at DESC
    `,
      )
      .all() as FavoriteWordRow[];

    return favorites.map((favorite) => this.annotateWord(favorite));
  }

  addFavorite(wordId: number): Favorite {
    const existing = this.db
      .prepare('SELECT * FROM favorites WHERE word_id = ?')
      .get(wordId);
    if (existing) {
      return existing as Favorite;
    }
    const result = this.db
      .prepare('INSERT INTO favorites (word_id) VALUES (?)')
      .run(wordId);
    return {
      id: result.lastInsertRowid as number,
      word_id: wordId,
      created_at: new Date().toISOString(),
    };
  }

  removeFavorite(wordId: number): boolean {
    const result = this.db
      .prepare('DELETE FROM favorites WHERE word_id = ?')
      .run(wordId);
    return result.changes > 0;
  }

  isFavorite(wordId: number): boolean {
    const result = this.db
      .prepare('SELECT id FROM favorites WHERE word_id = ?')
      .get(wordId);
    return !!result;
  }

  private annotateWord<
    T extends {
      example_sentence: string;
      example_meaning_vi: string;
      meaning_vi: string;
      part_of_speech: string;
      id: number;
      kanji: string;
      kana: string;
      romaji: string;
    },
  >(word: T): T & { example_tokens?: ExampleSentenceTokenAnnotation[] } {
    if (!word.example_sentence) {
      return word as T & { example_tokens?: ExampleSentenceTokenAnnotation[] };
    }

    const cache = new Map<string, Word | undefined>();
    const exactKanjiLookup = this.db.prepare(
      'SELECT * FROM words WHERE kanji = ? ORDER BY id ASC LIMIT 1',
    );
    const exactKanaLookup = this.db.prepare(
      'SELECT * FROM words WHERE kana = ? ORDER BY id ASC LIMIT 1',
    );

    const lookupWord = (query: string) => {
      const normalized = query.trim();
      if (!normalized) {
        return undefined;
      }

      if (cache.has(normalized)) {
        return cache.get(normalized);
      }

      const match =
        (exactKanjiLookup.get(normalized) as Word | undefined) ??
        (exactKanaLookup.get(normalized) as Word | undefined);
      cache.set(normalized, match);
      return match;
    };

    const exampleTokens = buildExampleTokens(
      word,
      lookupWord,
      this.japaneseTokenizer,
    );
    if (!exampleTokens) {
      return word as T & { example_tokens?: ExampleSentenceTokenAnnotation[] };
    }

    return {
      ...word,
      example_tokens: exampleTokens,
    };
  }
}
