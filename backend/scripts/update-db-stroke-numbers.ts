import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

interface StrokeNumber {
  x: number;
  y: number;
}

function parseKanjiVGFile(filePath: string): { strokes: string[]; strokeNumbers: StrokeNumber[] } | null {
  try {
    const svgContent = fs.readFileSync(filePath, 'utf-8').replace(/\r\n?/g, '\n');

    const strokePathRegex = /kvg:type="[^"]+"\s+d="([^"]+)"/g;
    const strokes: string[] = [];
    let match;
    while ((match = strokePathRegex.exec(svgContent)) !== null) {
      strokes.push(match[1]);
    }

    if (strokes.length === 0) return null;

    const textRegex = /<text[^>]*transform="matrix\(1 0 0 1\s*([\d.]+)\s+([\d.]+)\)"\s*>([\d]+)<\/text>/g;
    const strokeNumbers: StrokeNumber[] = [];
    let textMatch;
    while ((textMatch = textRegex.exec(svgContent)) !== null) {
      const num = parseInt(textMatch[3], 10);
      strokeNumbers[num - 1] = { x: parseFloat(textMatch[1]), y: parseFloat(textMatch[2]) };
    }

    return { strokes, strokeNumbers: strokeNumbers.filter(Boolean) };
  } catch (error) {
    return null;
  }
}

function kanjiToCodepoint(kanji: string): string {
  return kanji.charCodeAt(0).toString(16).padStart(5, '0').toUpperCase();
}

const kanjiList = [
  '日', '本', '水', '大', '小', '食', '行', '山', '川', '犬',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '百', '千', '人', '男', '女', '子', '月', '火', '木', '金',
  '土', '口', '目', '耳', '手', '足', '見', '聞', '飲', '話',
  '読', '書', '買', '学', '校', '生', '先', '今', '時'
];

const kanjiDir = path.join(__dirname, '../kanjivg_data/kanji');
const dbPath = path.join(__dirname, '../data/dictionary.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const updateStmt = db.prepare(`
  UPDATE kanji_data
  SET stroke_numbers = ?
  WHERE kanji = ?
`);

let updated = 0;
for (const kanji of kanjiList) {
  const codepoint = kanjiToCodepoint(kanji);
  const filePath = path.join(kanjiDir, `${codepoint}.svg`);

  if (fs.existsSync(filePath)) {
    const parsed = parseKanjiVGFile(filePath);
    if (parsed && parsed.strokeNumbers.length > 0) {
      const numbersJson = JSON.stringify(parsed.strokeNumbers);
      const result = updateStmt.run(numbersJson, kanji);
      if (result.changes > 0) {
        updated++;
        console.log(`✓ ${kanji}: updated`);
      }
    }
  }
}

console.log(`\nUpdated ${updated} kanji entries with stroke numbers`);
db.close();
