/**
 * merge-english-meanings.ts
 *
 * Parse JMdict for English meanings, merge into words table via ent_seq.
 * Only updates rows where meaning_en is currently empty.
 *
 * Usage:  npx ts-node scripts/merge-english-meanings.ts
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const jmdictPath = path.join(rootDir, 'JMdict_e');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  if (!fs.existsSync(jmdictPath)) {
    console.error('JMdict_e not found');
    process.exit(1);
  }

  console.log('Parsing JMdict for English meanings...');
  const xml = fs.readFileSync(jmdictPath, 'utf-8');
  const enMap = new Map<string, string>(); // ent_seq → English meanings

  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  let count = 0;

  while ((match = re.exec(xml)) !== null) {
    const block = match[1];

    const entSeq = extract(block, /<ent_seq>(\d+)<\/ent_seq>/);
    if (!entSeq) continue;

    // Extract English glosses (no m_lang attribute)
    const meaningRe = /<gloss(?: g_type="[^"]*")?>([^<]+)<\/gloss>/g;
    const enMeanings: string[] = [];
    let mm;
    while ((mm = meaningRe.exec(block)) !== null) {
      const fullMatch = mm[0];
      if (!fullMatch.includes('xml:lang=') && !fullMatch.includes('m_lang=')) {
        enMeanings.push(mm[1]);
      }
    }

    if (enMeanings.length > 0) {
      enMap.set(entSeq, enMeanings.slice(0, 8).join('; '));
    }

    count++;
    if (count % 50000 === 0) console.log(`  ... parsed ${count} entries`);
  }
  console.log(`  Done: ${count} parsed, ${enMap.size} have English meanings`);

  // Update DB
  console.log('Merging into database...');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const update = db.prepare("UPDATE words SET meaning_en = ? WHERE ent_seq = ? AND (meaning_en = '' OR meaning_en IS NULL)");
  let updated = 0;
  let skipped = 0;

  const tx = db.transaction(() => {
    for (const [entSeq, enMeaning] of enMap) {
      const r = update.run(enMeaning, entSeq);
      if (r.changes > 0) updated++;
      else skipped++;
    }
  });
  tx();

  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (no match or already has EN): ${skipped}`);

  // Verify
  const stats = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN meaning_en != '' THEN 1 ELSE 0 END) as en, SUM(CASE WHEN meaning_vi != '' THEN 1 ELSE 0 END) as vi FROM words").get() as { total: number; en: number; vi: number };
  console.log(`\nFinal: ${stats.total} words, ${stats.vi} VI, ${stats.en} EN`);

  // Show bilingual samples
  const samples = db.prepare("SELECT kanji, kana, meaning_vi, meaning_en FROM words WHERE meaning_en != '' AND meaning_vi != '' LIMIT 5").all() as { kanji: string; kana: string; meaning_vi: string; meaning_en: string }[];
  console.log('\nBilingual samples:');
  for (const s of samples) {
    console.log(`  ${s.kanji} (${s.kana})`);
    console.log(`    VI: ${s.meaning_vi.substring(0, 70)}`);
    console.log(`    EN: ${s.meaning_en.substring(0, 70)}`);
  }

  db.close();
  console.log('\nDone!');
}

function extract(str: string, regex: RegExp): string | undefined {
  const m = regex.exec(str);
  return m ? m[1] : undefined;
}

main();
