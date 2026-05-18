/**
 * translate-missing-vi.ts
 *
 * Batch translate meaning_en → meaning_vi for words missing Vietnamese.
 * Uses Google Translate free endpoint (gtx).
 *
 * Usage:  npx ts-node scripts/translate-missing-vi.ts [--start=N] [--limit=N]
 *
 * Options:
 *   --start=N   Skip first N words
 *   --limit=N   Translate at most N words (default: all)
 *   --dry-run   Show what would be translated without updating DB
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as https from 'https';

interface PendingWord {
  id: number;
  meaning_en: string;
}

const DELIMITER = ' ||| ';
const BATCH_SIZE = 120; // translate this many words per API request
const DELAY_MS = 1500; // between requests to avoid rate limiting

function translateBatch(texts: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const joined = texts.join(DELIMITER);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(joined)}`;

    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (!Array.isArray(parsed) || !Array.isArray(parsed[0])) {
            console.error('  Unexpected response structure, body:', body.substring(0, 200));
            reject(new Error('Bad response: ' + body.substring(0, 100)));
            return;
          }
          // Google Translate returns [[["translated", "original"], ...]]
          const translated = parsed[0].map((item: any[]) => item[0]).join('');
          const results = translated.split(DELIMITER).map((s) => s.trim());
          resolve(results);
        } catch (e) {
          console.error('  Parse error, body:', body.substring(0, 200));
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  // Parse args
  let startIdx = 0;
  let limit = Infinity;
  let dryRun = false;
  for (const arg of process.argv) {
    if (arg.startsWith('--start=')) startIdx = parseInt(arg.split('=')[1], 10);
    if (arg.startsWith('--limit=')) limit = parseInt(arg.split('=')[1], 10);
    if (arg === '--dry-run') dryRun = true;
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Get words without Vietnamese meaning, ordered by id
  const pending = db.prepare(
    "SELECT id, meaning_en FROM words WHERE (meaning_vi = '' OR meaning_vi IS NULL) AND meaning_en != '' ORDER BY id"
  ).all() as PendingWord[];

  console.log(`Words missing Vietnamese: ${pending.length}`);
  const toProcess = pending.slice(startIdx, startIdx + limit);
  console.log(`Processing: ${toProcess.length} (offset=${startIdx})`);

  if (dryRun) {
    console.log('DRY RUN - showing first 10 entries:');
    for (let i = 0; i < Math.min(10, toProcess.length); i++) {
      console.log(`  [${toProcess[i].id}] ${toProcess[i].meaning_en.substring(0, 80)}`);
    }
    db.close();
    return;
  }

  // Prepare update statement
  const updateStmt = db.prepare('UPDATE words SET meaning_vi = ? WHERE id = ?');

  let translatedCount = 0;
  let failedCount = 0;
  const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE);

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const texts = batch.map((w) => {
      // Use first 1-2 glosses to keep it short
      const glosses = w.meaning_en.split(';').slice(0, 2).join(';').trim();
      return glosses.length > 200 ? glosses.substring(0, 200) : glosses;
    });

    try {
      process.stdout.write(`\r  Batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, toProcess.length)}/${toProcess.length}) ...`);

      const results = await translateBatch(texts);

      // Update DB in a transaction
      const tx = db.transaction(() => {
        for (let j = 0; j < batch.length; j++) {
          if (results[j] && results[j].trim()) {
            updateStmt.run(results[j].trim(), batch[j].id);
            translatedCount++;
          }
        }
      });
      tx();

      if (batchNum % 10 === 0) {
        process.stdout.write(`\n  Progress: ${translatedCount} translated, ${i + BATCH_SIZE}/${toProcess.length} done`);
      }

      await sleep(DELAY_MS);
    } catch (err) {
      failedCount += batch.length;
      process.stdout.write(`\n  FAILED batch ${batchNum}: ${err}`);
      await sleep(DELAY_MS * 2);
    }
  }

  console.log(`\n\nDone! Translated: ${translatedCount}, Failed: ${failedCount}`);

  // Verify final count
  const stats = db.prepare("SELECT SUM(CASE WHEN meaning_vi != '' THEN 1 ELSE 0 END) as c FROM words").get() as { c: number };
  console.log(`Total words with Vietnamese: ${stats.c} / ${pending.length + stats.c - translatedCount}`);

  db.close();
}

main();
