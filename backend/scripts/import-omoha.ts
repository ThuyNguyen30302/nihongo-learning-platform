/**
 * import-omoha.ts
 *
 * Import OmohaDictionary (Japanese-Vietnamese) into words table.
 * Replaces machine-translated data with real Vietnamese translations.
 * Also extracts example sentences (JPN→VI).
 *
 * Usage:  npx ts-node scripts/import-omoha.ts
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// ── Kana → Romaji (same as before) ────────────────────────────────────

const HIRAGANA_MAP: Record<string, string> = {
  あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',
  が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',
  ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',
  だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',
  は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',
  ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',
  や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',
  わ:'wa',ゐ:'i',ゑ:'e',を:'o',ん:'n',っ:'tsu',
  ゃ:'ya',ゅ:'yu',ょ:'yo',ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o',
};
const KATAKANA_MAP: Record<string, string> = {
  ア:'a',イ:'i',ウ:'u',エ:'e',オ:'o',カ:'ka',キ:'ki',ク:'ku',ケ:'ke',コ:'ko',
  ガ:'ga',ギ:'gi',グ:'gu',ゲ:'ge',ゴ:'go',サ:'sa',シ:'shi',ス:'su',セ:'se',ソ:'so',
  ザ:'za',ジ:'ji',ズ:'zu',ゼ:'ze',ゾ:'zo',タ:'ta',チ:'chi',ツ:'tsu',テ:'te',ト:'to',
  ダ:'da',ヂ:'ji',ヅ:'zu',デ:'de',ド:'do',ナ:'na',ニ:'ni',ヌ:'nu',ネ:'ne',ノ:'no',
  ハ:'ha',ヒ:'hi',フ:'fu',ヘ:'he',ホ:'ho',バ:'ba',ビ:'bi',ブ:'bu',ベ:'be',ボ:'bo',
  パ:'pa',ピ:'pi',プ:'pu',ペ:'pe',ポ:'po',マ:'ma',ミ:'mi',ム:'mu',メ:'me',モ:'mo',
  ヤ:'ya',ユ:'yu',ヨ:'yo',ラ:'ra',リ:'ri',ル:'ru',レ:'re',ロ:'ro',
  ワ:'wa',ヰ:'i',ヱ:'e',ヲ:'o',ン:'n',ッ:'tsu',
  ャ:'ya',ュ:'yu',ョ:'yo',ァ:'a',ィ:'i',ゥ:'u',ェ:'e',ォ:'o','ー':'-',
};
const SMALL_KATAKANA = new Set(['ャ','ュ','ョ','ァ','ィ','ゥ','ェ','ォ']);
const SMALL_HIRAGANA = new Set(['ゃ','ゅ','ょ','ぁ','ぃ','ぅ','ぇ','ぉ']);

function yoonCombine(base: string, small: string): string {
  const vowel = small[1];
  if (base === 'shi') return 'sh' + vowel;
  if (base === 'chi') return 'ch' + vowel;
  if (base === 'ji') return 'j' + vowel;
  return base.slice(0, -1) + small;
}

function kanaToRomaji(kana: string): string {
  let result = '';
  for (let i = 0; i < kana.length; i++) {
    const ch = kana[i];
    const code = ch.charCodeAt(0);
    if (code >= 0x30A0 && code <= 0x30FF) {
      const next = i + 1 < kana.length ? kana[i + 1] : '';
      if (ch === 'ッ') {
        const nextRom = KATAKANA_MAP[next];
        if (nextRom && !SMALL_KATAKANA.has(next)) { result += nextRom[0]; }
        continue;
      }
      if (SMALL_KATAKANA.has(next)) {
        const base = KATAKANA_MAP[ch];
        const small = KATAKANA_MAP[next];
        if (base && small && small.length === 2) { result += yoonCombine(base, small); i++; continue; }
      }
      if (ch === 'ー') {
        if (result.length > 0) { const v: Record<string,string>={a:'a',i:'i',u:'u',e:'e',o:'o'}; result += v[result[result.length-1]]||result[result.length-1]; }
        continue;
      }
      result += KATAKANA_MAP[ch] || ch;
    } else if (code >= 0x3040 && code <= 0x309F) {
      const next = i + 1 < kana.length ? kana[i + 1] : '';
      if (ch === 'っ') {
        const nextRom = HIRAGANA_MAP[next];
        if (nextRom && !SMALL_HIRAGANA.has(next)) { result += nextRom[0]; }
        continue;
      }
      if (SMALL_HIRAGANA.has(next)) {
        const base = HIRAGANA_MAP[ch];
        const small = HIRAGANA_MAP[next];
        if (base && small && small.length === 2) { result += yoonCombine(base, small); i++; continue; }
      }
      result += HIRAGANA_MAP[ch] || ch;
    } else if (ch === '・') { result += ' ';
    } else { result += ch; }
  }
  return result.trim();
}

// ── Parse OmohaDictionary ─────────────────────────────────────────────

interface OmohaEntry {
  ent_seq: string;
  kanji: string;
  kana: string;
  meaning_vi: string;
  meaning_en: string;
  part_of_speech: string;
  example_sentence: string;
  example_meaning_vi: string;
}

function parseOmoha(filePath: string): OmohaEntry[] {
  console.log('Parsing OmohaDictionary...');
  const xml = fs.readFileSync(filePath, 'utf-8');
  const rows: OmohaEntry[] = [];

  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  let count = 0;

  while ((match = re.exec(xml)) !== null) {
    const block = match[1];

    const entSeq = extract(block, /<ent_seq>(\d+)<\/ent_seq>/) || '';

    // First kanji form
    let kanji = extract(block, /<keb>([^<]+)<\/keb>/);

    // First reading
    let kana = extract(block, /<reb>([^<]+)<\/reb>/);
    if (!kana) continue;
    if (!kanji) kanji = kana;

    // Collect POS and Vietnamese glosses from all senses
    const senseRe = /<sense>([\s\S]*?)<\/sense>/g;
    let sm;
    const allPos: string[] = [];
    const allGlosses: string[] = [];
    let exampleJp = '';
    let exampleVi = '';

    while ((sm = senseRe.exec(block)) !== null) {
      const senseBlock = sm[1];

      // POS
      const posRe = /<pos>(.*?)<\/pos>/g;
      let pm;
      while ((pm = posRe.exec(senseBlock)) !== null) {
        const p = pm[1].replace(/&|;/g, '');
        if (p && !allPos.includes(p)) allPos.push(p);
      }

      // Vietnamese glosses
      const glossRe = /<gloss[^>]*>([^<]+)<\/gloss>/g;
      let gm;
      while ((gm = glossRe.exec(senseBlock)) !== null) {
        allGlosses.push(gm[1]);
      }

      // Example sentences
      const exRe = /<ex_sent xml:lang="jpn">([^<]+)<\/ex_sent>[\s\S]*?<ex_sent xml:lang="vi">([^<]+)<\/ex_sent>/g;
      let em;
      if ((em = exRe.exec(senseBlock)) !== null) {
        if (!exampleJp) exampleJp = em[1];
        if (!exampleVi) exampleVi = em[2];
      }
    }

    const pos = allPos.map(p => {
      const m: Record<string,string> = {
        'n':'danh từ','adj-i':'tính từ -i','adj-na':'tính từ -na','adj-no':'tính từ -no',
        'adv':'phó từ','v1':'động từ','v5':'động từ','vs':'động từ suru',
        'vi':'nội động từ','vt':'ngoại động từ','num':'số từ','pn':'đại từ',
        'prt':'trợ từ','conj':'liên từ','int':'thán từ','exp':'cụm từ',
        'pref':'tiền tố','suf':'hậu tố','aux':'trợ động từ','unc':'chưa phân loại',
      };
      return m[p] || p;
    }).join(', ');

    rows.push({
      ent_seq: entSeq,
      kanji,
      kana,
      meaning_vi: allGlosses.slice(0, 8).join('; '),
      meaning_en: '', // will merge from JMdict later
      part_of_speech: pos,
      example_sentence: exampleJp,
      example_meaning_vi: exampleVi,
    });

    count++;
    if (count % 50000 === 0) console.log(`  ... parsed ${count} entries`);
  }

  console.log(`  Done: ${count} entries`);
  return rows;
}

function extract(str: string, regex: RegExp): string | undefined {
  const m = regex.exec(str);
  return m ? m[1] : undefined;
}

// ── Import to DB ──────────────────────────────────────────────────────

function importToDb(dbPath: string, rows: OmohaEntry[]) {
  console.log('Importing to database...');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = OFF');
  db.pragma('foreign_keys = OFF');

  // Add example columns if needed
  const cols = (db.prepare("PRAGMA table_info(words)").all() as {name:string}[]).map(c=>c.name);
  if (!cols.includes('ent_seq')) db.exec('ALTER TABLE words ADD COLUMN ent_seq TEXT');

  // Clear existing data
  db.exec('DELETE FROM favorites');
  db.exec('DELETE FROM words');
  db.exec("DELETE FROM words_fts"); // rebuild FTS after

  const insert = db.prepare(`
    INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi, ent_seq)
    VALUES (@kanji, @kana, @romaji, @meaning_vi, @meaning_en, @part_of_speech, @example_sentence, @example_meaning_vi, @ent_seq)
  `);

  let imported = 0;
  const BATCH = 5000;

  const insertBatch = db.transaction((batch: OmohaEntry[]) => {
    for (const row of batch) {
      const romaji = kanaToRomaji(row.kana);
      insert.run({ ...row, romaji });
      imported++;
    }
  });

  for (let i = 0; i < rows.length; i += BATCH) {
    insertBatch(rows.slice(i, i + BATCH));
    if (imported % 50000 === 0) console.log(`  ... ${imported}/${rows.length}`);
  }

  // Rebuild FTS5
  console.log('Rebuilding FTS5...');
  db.exec('DROP TABLE IF EXISTS words_fts');
  db.exec(`
    CREATE VIRTUAL TABLE words_fts USING fts5(
      kanji, kana, romaji, meaning_en, meaning_vi, content='words', content_rowid='id', tokenize='unicode61 remove_diacritics 0'
    )
  `);
  db.exec('INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi) SELECT id, kanji, kana, romaji, meaning_en, meaning_vi FROM words');

  db.exec('DROP TRIGGER IF EXISTS words_fts_ai');
  db.exec('DROP TRIGGER IF EXISTS words_fts_ad');
  db.exec('DROP TRIGGER IF EXISTS words_fts_au');

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

  db.pragma('foreign_keys = ON');
  db.close();
  console.log(`Import complete: ${imported} words`);
}

// ── Main ──────────────────────────────────────────────────────────────

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const omohaPath = path.join(rootDir, 'OmohaDictionary');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  if (!fs.existsSync(omohaPath)) { console.error('OmohaDictionary not found'); process.exit(1); }

  console.log('=== Import OmohaDictionary ===\n');
  const rows = parseOmoha(omohaPath);
  importToDb(dbPath, rows);
  console.log('\nDone!');
}

main();
