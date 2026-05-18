import Database from 'better-sqlite3';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let db: Database.Database;

  beforeEach(() => {
    service = new DatabaseService();
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE words (
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

      CREATE TABLE kanji_data (
        kanji TEXT PRIMARY KEY,
        meaning_vi TEXT NOT NULL DEFAULT '',
        meaning_en TEXT NOT NULL DEFAULT '',
        on_reading TEXT,
        kun_reading TEXT,
        stroke_count INTEGER,
        stroke_paths TEXT,
        stroke_numbers TEXT,
        radical TEXT,
        radical_meaning TEXT
      );

      CREATE TABLE favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE VIRTUAL TABLE words_fts USING fts5(
        kanji, kana, romaji, meaning_en, meaning_vi,
        content='words', content_rowid='id',
        tokenize='unicode61 remove_diacritics 0'
      );
    `);

    db.prepare(
      `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run('日本', 'にほん', 'nihon', 'Nhật Bản', 'Japan', 'danh từ', '', '');
    db.prepare(
      `
      INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(1, '日本', 'にほん', 'nihon', 'Japan', 'Nhật Bản');
    db.prepare(
      `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      '日本語',
      'にほんご',
      'nihongo',
      'Tiếng Nhật',
      'Japanese language',
      'noun',
      '',
      '',
    );
    db.prepare(
      `
      INSERT INTO kanji_data (kanji, meaning_vi, meaning_en, on_reading, kun_reading, stroke_count, stroke_paths, stroke_numbers, radical, radical_meaning)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      '日',
      'Ngày',
      'Sun',
      'ニチ',
      'ひ',
      4,
      'M0 0 L1 1||M1 1 L2 2',
      JSON.stringify([{ x: 10, y: 20 }]),
      '日',
      'mặt trời',
    );

    const serviceWithDb = service as unknown as { db: Database.Database };
    serviceWithDb.db = db;
  });

  afterEach(() => {
    db.close();
  });

  it('searches words by kanji', () => {
    const results = service.searchWords('日本');

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]).toMatchObject({
      id: 1,
      kanji: '日本',
      kana: 'にほん',
      romaji: 'nihon',
      meaning_vi: 'Nhật Bản',
      meaning_en: 'Japan',
    });
  });

  it('searches words by romaji mode', () => {
    const results = service.searchWords('NIHON', 'romaji');

    expect(results.map((word) => word.romaji)).toEqual(['nihon', 'nihongo']);
  });

  it('searches words by Vietnamese meaning mode', () => {
    const results = service.searchWords('Tiếng', 'vietnamese');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ meaning_vi: 'Tiếng Nhật' });
  });

  it('searches words by kana mode', () => {
    const results = service.searchWords('にほんご', 'kana');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kana: 'にほんご' });
  });

  it('searches words by kanji mode', () => {
    const results = service.searchWords('日本語', 'kanji');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kanji: '日本語' });
  });

  it('returns a word by id', () => {
    expect(service.getWordById(1)).toMatchObject({
      id: 1,
      kanji: '日本',
      kana: 'にほん',
    });
  });

  it('adds, reads, and removes favorites', () => {
    expect(service.addFavorite(1)).toMatchObject({ word_id: 1 });
    expect(service.isFavorite(1)).toBe(true);
    expect(service.removeFavorite(1)).toBe(true);
    expect(service.isFavorite(1)).toBe(false);
  });

  it('returns kanji records with the stored radical data', () => {
    expect(service.getKanji('日')).toMatchObject({
      kanji: '日',
      radical: '日',
      radical_meaning: 'mặt trời',
    });
  });
});
