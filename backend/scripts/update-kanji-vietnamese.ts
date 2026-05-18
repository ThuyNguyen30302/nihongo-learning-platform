/**
 * update-kanji-vietnamese.ts
 *
 * Parse KANJIDIC2 for vietnam readings → update kanji_data.meaning_vi
 *
 * Usage:  npx ts-node scripts/update-kanji-vietnamese.ts
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const xmlPath = path.join(rootDir, 'kanjidic2.xml');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  console.log('Parsing KANJIDIC2 for Vietnamese readings...');
  const xml = fs.readFileSync(xmlPath, 'utf-8');
  const map = new Map<string, string[]>(); // kanji → vietnamese readings

  const re = /<character>([\s\S]*?)<\/character>/g;
  let match;
  let count = 0;

  while ((match = re.exec(xml)) !== null) {
    const block = match[1];

    const literalMatch = block.match(/<literal>([^<]+)<\/literal>/);
    if (!literalMatch) continue;
    const kanji = literalMatch[1];

    // Extract vietnam readings
    const vnRe = /<reading r_type="vietnam">([^<]+)<\/reading>/g;
    const vnReadings: string[] = [];
    let vm;
    while ((vm = vnRe.exec(block)) !== null) {
      vnReadings.push(vm[1]);
    }

    if (vnReadings.length > 0) {
      map.set(kanji, vnReadings);
    }

    count++;
    if (count % 5000 === 0) console.log(`  ... parsed ${count} kanji`);
  }
  console.log(`  Done: ${count} parsed, ${map.size} have Vietnamese readings`);

  // Update DB
  console.log('Updating database...');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const update = db.prepare('UPDATE kanji_data SET meaning_vi = ? WHERE kanji = ?');
  let updated = 0;

  const updateBatch = db.transaction(() => {
    for (const [kanji, readings] of map) {
      const meaningVi = readings.join(', ');
      const result = update.run(meaningVi, kanji);
      if (result.changes > 0) updated++;
    }
  });

  updateBatch();

  // Show samples
  const samples = db.prepare("SELECT kanji, meaning_vi, meaning_en FROM kanji_data WHERE meaning_vi != '' LIMIT 8").all() as { kanji: string; meaning_vi: string; meaning_en: string }[];
  console.log('\nSample results:');
  for (const s of samples) {
    console.log(`  ${s.kanji}  →  ${s.meaning_vi.padEnd(25)}  |  ${s.meaning_en.substring(0, 50)}`);
  }

  db.close();
  console.log(`\nUpdated: ${updated} kanji`);
}

main();
