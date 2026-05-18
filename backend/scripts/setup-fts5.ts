/**
 * setup-fts5.ts
 *
 * Create FTS5 virtual table for full-text search on words table.
 * Populates from existing data + adds triggers for auto-sync.
 *
 * Usage:  npx ts-node scripts/setup-fts5.ts
 */

import Database from 'better-sqlite3';
import * as path from 'path';

function main() {
  const dbPath = path.join(path.resolve(__dirname, '..'), 'data', 'dictionary.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  console.log('Setting up FTS5 full-text search...');

  // Drop existing FTS table + triggers if any
  db.exec('DROP TABLE IF EXISTS words_fts');
  db.exec('DROP TRIGGER IF EXISTS words_fts_ai');
  db.exec('DROP TRIGGER IF EXISTS words_fts_ad');
  db.exec('DROP TRIGGER IF EXISTS words_fts_au');

  // Create FTS5 virtual table indexing all searchable columns
  db.exec(`
    CREATE VIRTUAL TABLE words_fts USING fts5(
      kanji,
      kana,
      romaji,
      meaning_en,
      meaning_vi,
      content='words',
      content_rowid='id',
      tokenize='unicode61 remove_diacritics 0'
    )
  `);

  // Populate FTS from existing data
  console.log('Populating FTS from existing words...');
  const count = db.prepare('SELECT COUNT(*) as c FROM words').get() as { c: number };
  console.log(`  Total words: ${count.c}`);

  db.exec(`
    INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
    SELECT id, kanji, kana, romaji, meaning_en, meaning_vi FROM words
  `);

  const ftsCount = db.prepare('SELECT COUNT(*) as c FROM words_fts').get() as { c: number };
  console.log(`  Indexed: ${ftsCount.c}`);

  // Triggers to keep FTS in sync
  db.exec(`
    CREATE TRIGGER words_fts_ai AFTER INSERT ON words BEGIN
      INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      VALUES (new.id, new.kanji, new.kana, new.romaji, new.meaning_en, new.meaning_vi);
    END
  `);

  db.exec(`
    CREATE TRIGGER words_fts_ad AFTER DELETE ON words BEGIN
      INSERT INTO words_fts(words_fts, rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      VALUES ('delete', old.id, old.kanji, old.kana, old.romaji, old.meaning_en, old.meaning_vi);
    END
  `);

  db.exec(`
    CREATE TRIGGER words_fts_au AFTER UPDATE ON words BEGIN
      INSERT INTO words_fts(words_fts, rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      VALUES ('delete', old.id, old.kanji, old.kana, old.romaji, old.meaning_en, old.meaning_vi);
      INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      VALUES (new.id, new.kanji, new.kana, new.romaji, new.meaning_en, new.meaning_vi);
    END
  `);

  // Test search performance
  console.log('\nPerformance test:');
  const testQueries = ['nihon', '食べる', 'Japanese', 'water', '勉強'];

  for (const q of testQueries) {
    // FTS5
    const ftsStart = Date.now();
    const ftsResults = db.prepare(`
      SELECT w.* FROM words w
      JOIN words_fts f ON w.id = f.rowid
      WHERE words_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `).all(q) as any[];
    const ftsTime = Date.now() - ftsStart;

    // LIKE (old method)
    const likeStart = Date.now();
    const likeResults = db.prepare(`
      SELECT * FROM words
      WHERE LOWER(kanji) LIKE ? OR LOWER(kana) LIKE ? OR LOWER(romaji) LIKE ? OR LOWER(meaning_en) LIKE ?
      LIMIT 50
    `).all(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`) as any[];
    const likeTime = Date.now() - likeStart;

    console.log(`  "${q}": FTS5=${ftsTime}ms (${ftsResults.length} results) | LIKE=${likeTime}ms (${likeResults.length} results) | ${ftsTime < likeTime ? 'FTS5 FASTER' : 'LIKE faster'}`);
  }

  // Show FTS5 info
  const info = db.prepare("SELECT * FROM words_fts WHERE words_fts MATCH 'nihon' ORDER BY rank LIMIT 3").all() as any[];
  console.log('\nSample FTS5 results for "nihon":');
  for (const r of info) {
    console.log(`  rank=${r.rank} ${r.kanji} (${r.kana}) - ${r.meaning_en?.substring(0, 50)}`);
  }

  db.close();
  console.log('\nFTS5 setup complete!');
}

main();
