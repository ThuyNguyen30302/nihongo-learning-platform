/**
 * import-word-data.ts
 *
 * One-shot: parse JMdict XML → import into words table with generated romaji.
 *
 * Usage:  npx ts-node scripts/import-word-data.ts
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// ── Kana → Romaji converter ────────────────────────────────────────────

// Hepburn romanization maps
const HIRAGANA_MAP: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'i', ゑ: 'e', を: 'o',
  ん: 'n',
  っ: 'tsu', // small tsu — handled specially
  ゃ: 'ya', ゅ: 'yu', ょ: 'yo',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
};

const KATAKANA_MAP: Record<string, string> = {
  ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o',
  カ: 'ka', キ: 'ki', ク: 'ku', ケ: 'ke', コ: 'ko',
  ガ: 'ga', ギ: 'gi', グ: 'gu', ゲ: 'ge', ゴ: 'go',
  サ: 'sa', シ: 'shi', ス: 'su', セ: 'se', ソ: 'so',
  ザ: 'za', ジ: 'ji', ズ: 'zu', ゼ: 'ze', ゾ: 'zo',
  タ: 'ta', チ: 'chi', ツ: 'tsu', テ: 'te', ト: 'to',
  ダ: 'da', ヂ: 'ji', ヅ: 'zu', デ: 'de', ド: 'do',
  ナ: 'na', ニ: 'ni', ヌ: 'nu', ネ: 'ne', ノ: 'no',
  ハ: 'ha', ヒ: 'hi', フ: 'fu', ヘ: 'he', ホ: 'ho',
  バ: 'ba', ビ: 'bi', ブ: 'bu', ベ: 'be', ボ: 'bo',
  パ: 'pa', ピ: 'pi', プ: 'pu', ペ: 'pe', ポ: 'po',
  マ: 'ma', ミ: 'mi', ム: 'mu', メ: 'me', モ: 'mo',
  ヤ: 'ya', ユ: 'yu', ヨ: 'yo',
  ラ: 'ra', リ: 'ri', ル: 'ru', レ: 're', ロ: 'ro',
  ワ: 'wa', ヰ: 'i', ヱ: 'e', ヲ: 'o',
  ン: 'n',
  ッ: 'tsu',
  ャ: 'ya', ュ: 'yu', ョ: 'yo',
  ァ: 'a', ィ: 'i', ゥ: 'u', ェ: 'e', ォ: 'o',
  'ー': '-',
};

// Special: chars in the 30A0-30FF (Katakana) and 3040-309F (Hiragana) ranges
// that are in our maps above will be handled
// Small characters for yōon detection
const SMALL_KATAKANA = new Set(['ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ']);
const SMALL_HIRAGANA = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ']);

// Yōon combination: base + small → combined romaji
// e.g. ki + ya → kya,  shi + ya → sha,  chi + ya → cha
function yoonCombine(base: string, small: string): string {
  const vowel = small[1]; // 'a', 'u', or 'o' from ya/yu/yo

  // Special: shi → sh-, chi → ch-, ji → j-
  if (base === 'shi') return 'sh' + vowel;
  if (base === 'chi') return 'ch' + vowel;
  if (base === 'ji') return 'j' + vowel;
  if (base === 'tsu') return 'ts' + vowel;

  // Regular: ki → k-, ni → n-, etc. Remove the trailing 'i'
  return base.slice(0, -1) + small;
}

function kanaToRomaji(kana: string): string {
  let result = '';
  for (let i = 0; i < kana.length; i++) {
    const ch = kana[i];
    const code = ch.charCodeAt(0);

    // Katakana range
    if (code >= 0x30A0 && code <= 0x30FF) {
      const next = i + 1 < kana.length ? kana[i + 1] : '';

      // Small tsu ッ → geminate consonant
      if (ch === 'ッ') {
        const nextRom = KATAKANA_MAP[next];
        if (nextRom && !SMALL_KATAKANA.has(next)) {
          result += nextRom[0];
        }
        continue;
      }

      // Small ya/yu/yo for yōon (explicitly check small chars)
      if (SMALL_KATAKANA.has(next)) {
        const base = KATAKANA_MAP[ch];
        const small = KATAKANA_MAP[next];
        if (base && small && base.length === 2) {
          result += yoonCombine(base, small);
          i++;
          continue;
        }
      }

      // Long vowel mark ー
      if (ch === 'ー') {
        if (result.length > 0) {
          const prevChar = result[result.length - 1];
          const vowels: Record<string, string> = { a: 'a', i: 'i', u: 'u', e: 'e', o: 'o' };
          result += vowels[prevChar] || prevChar;
        }
        continue;
      }

      result += KATAKANA_MAP[ch] || ch;
    }
    // Hiragana range
    else if (code >= 0x3040 && code <= 0x309F) {
      const next = i + 1 < kana.length ? kana[i + 1] : '';

      // Small tsu っ → geminate consonant
      if (ch === 'っ') {
        const nextRom = HIRAGANA_MAP[next];
        if (nextRom && !SMALL_HIRAGANA.has(next)) {
          result += nextRom[0];
        }
        continue;
      }

      // Small ya/yu/yo for yōon
      if (SMALL_HIRAGANA.has(next)) {
        const base = HIRAGANA_MAP[ch];
        const small = HIRAGANA_MAP[next];
        if (base && small && small.length === 2) {
          result += yoonCombine(base, small);
          i++;
          continue;
        }
      }

      result += HIRAGANA_MAP[ch] || ch;
    }
    else if (ch === '・') {
      result += ' ';
    }
    else {
      result += ch;
    }
  }

  return result.trim();
}

// ── POS mapping: entity → label ────────────────────────────────────────

function mapPos(rawPos: string): string {
  // Map the common entities to user-friendly Vietnamese/English labels
  const posMap: Record<string, string> = {
    'n': 'danh từ',
    'adj-i': 'tính từ -i',
    'adj-na': 'tính từ -na',
    'adj-no': 'tính từ -no',
    'adj-t': 'tính từ -tari',
    'adj-f': 'tính từ',
    'adv': 'phó từ',
    'v1': 'động từ nhóm 1',
    'v5': 'động từ nhóm 1',
    'v5u': 'động từ nhóm 1 (-u)',
    'v5k': 'động từ nhóm 1 (-ku)',
    'v5g': 'động từ nhóm 1 (-gu)',
    'v5s': 'động từ nhóm 1 (-su)',
    'v5t': 'động từ nhóm 1 (-tsu)',
    'v5n': 'động từ nhóm 1 (-nu)',
    'v5b': 'động từ nhóm 1 (-bu)',
    'v5m': 'động từ nhóm 1 (-mu)',
    'v5r': 'động từ nhóm 1 (-ru)',
    'v5aru': 'động từ nhóm 1 (-aru)',
    'v5k-s': 'động từ nhóm 1 (-iku/yuku)',
    'v5r-i': 'động từ nhóm 1 (-iru)',
    'v5u-s': 'động từ nhóm 1 (-uu)',
    'vs': 'động từ suru',
    'vs-s': 'động từ suru',
    'vs-i': 'động từ suru',
    'vi': 'động từ (nội động từ)',
    'vt': 'động từ (ngoại động từ)',
    'vz': 'động từ nhóm 3',
    'v-unspec': 'động từ',
    'num': 'số từ',
    'pn': 'đại từ',
    'prt': 'trợ từ',
    'conj': 'liên từ',
    'int': 'thán từ',
    'exp': 'cụm từ',
    'pref': 'tiền tố',
    'suf': 'hậu tố',
    'aux': 'trợ động từ',
    'aux-v': 'trợ động từ',
    'aux-adj': 'trợ tính từ',
    'unc': 'chưa phân loại',
  };
  return posMap[rawPos] || rawPos;
}

// ── Parse JMdict ───────────────────────────────────────────────────────

interface EntryRow {
  kanji: string;
  kana: string;
  romaji: string;
  meaning_en: string;
  meaning_vi: string;
  part_of_speech: string;
}

function parseJMdict(filePath: string): EntryRow[] {
  console.log('Parsing JMdict XML...');
  const xml = fs.readFileSync(filePath, 'utf-8');
  const rows: EntryRow[] = [];

  // Split by entry tags
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  let count = 0;

  while ((match = re.exec(xml)) !== null) {
    const block = match[1];

    // Extract first kanji form
    let kanji = extract(block, /<keb>([^<]+)<\/keb>/);

    // Extract first reading
    let kana = extract(block, /<reb>([^<]+)<\/reb>/);

    if (!kana) continue; // must have reading

    // If no kanji, use kana as kanji (for kana-only words)
    if (!kanji) kanji = kana;

    // Collect all senses (meanings)
    const senseRe = /<sense>([\s\S]*?)<\/sense>/g;
    let sm;
    const allPositions: string[] = [];
    const allMeanings: string[] = [];

    while ((sm = senseRe.exec(block)) !== null) {
      const senseBlock = sm[1];

      // Part of speech
      const posRe = /<pos>(.*?)<\/pos>/g;
      let pm;
      while ((pm = posRe.exec(senseBlock)) !== null) {
        const p = pm[1].replace(/&|;/g, '');
        if (p && !allPositions.includes(p)) {
          allPositions.push(p);
        }
      }

      // Glosses (English)
      const glossRe = /<gloss[^>]*>([^<]+)<\/gloss>/g;
      let gm;
      while ((gm = glossRe.exec(senseBlock)) !== null) {
        allMeanings.push(gm[1]);
      }
    }

    const romaji = kanaToRomaji(kana);
    const pos = allPositions.map(mapPos).join(', ');
    const meaningEn = allMeanings.slice(0, 8).join('; ');

    rows.push({
      kanji,
      kana,
      romaji,
      meaning_en: meaningEn,
      meaning_vi: '', // no Vietnamese in JMdict
      part_of_speech: pos,
    });

    count++;
    if (count % 50000 === 0) {
      console.log(`  ... parsed ${count} entries`);
    }
  }

  console.log(`  Done: ${count} entries parsed`);
  return rows;
}

function extract(str: string, regex: RegExp): string | undefined {
  const m = regex.exec(str);
  return m ? m[1] : undefined;
}

// ── Import to DB ───────────────────────────────────────────────────────

function importToDb(dbPath: string, rows: EntryRow[]) {
  console.log('Opening database...');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = OFF');

  console.log('Clearing existing favorites & words...');
  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM favorites');
  db.exec('DELETE FROM words');
  db.pragma('foreign_keys = ON');

  const insert = db.prepare(`
    INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech)
    VALUES (@kanji, @kana, @romaji, @meaning_vi, @meaning_en, @part_of_speech)
  `);

  let imported = 0;
  const batchSize = 5000;

  const insertBatch = db.transaction((batch: EntryRow[]) => {
    for (const row of batch) {
      insert.run(row);
      imported++;
    }
  });

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    insertBatch(batch);
    console.log(`  ... imported ${imported}/${rows.length}`);
  }

  // Recreate favorites table (since we deleted all favorites)
  // Actually just keep the table, it's empty now

  db.close();
  console.log(`\nImport complete: ${imported} words`);
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const jmdictPath = path.join(rootDir, 'JMdict_e');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  if (!fs.existsSync(jmdictPath)) {
    console.error('ERROR: JMdict_e not found at', jmdictPath);
    process.exit(1);
  }
  if (!fs.existsSync(dbPath)) {
    console.error('ERROR: dictionary.db not found at', dbPath);
    process.exit(1);
  }

  console.log('=== Word Data Import ===\n');

  const rows = parseJMdict(jmdictPath);
  importToDb(dbPath, rows);

  console.log('\nDone!');
}

main();
