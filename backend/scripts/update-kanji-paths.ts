import Database from 'better-sqlite3';
import * as path from 'path';
import { updateKanjiData } from '../src/kanji/kanjivg-simple';

const kanjiDir = path.join(__dirname, '../kanjivg_data/kanji');
const dbPath = path.join(__dirname, '../data/dictionary.db');

// Kanji characters we have in our database
const kanjiChars = [
  '日', '本', '水', '大', '小', '食', '行', '山', '川', '犬',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '百', '千', '人', '男', '女', '子', '月', '火', '木', '金',
  '土', '口', '目', '耳', '手', '足', '見', '聞', '飲', '話',
  '読', '書', '買', '学', '校', '生', '先', '今', '時'
];

console.log('Updating kanji stroke paths from KanjiVG data...\n');

const strokePaths = updateKanjiData(kanjiDir, kanjiChars);

if (strokePaths.size === 0) {
  console.error('No stroke paths found!');
  process.exit(1);
}

// Update database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const updateStmt = db.prepare(`
  UPDATE kanji_data
  SET stroke_paths = ?
  WHERE kanji = ?
`);

let updated = 0;
for (const [kanji, pathString] of strokePaths.entries()) {
  const result = updateStmt.run(pathString, kanji);
  if (result.changes > 0) {
    updated++;
  }
}

console.log(`\nUpdated ${updated} kanji entries in database.`);

db.close();
