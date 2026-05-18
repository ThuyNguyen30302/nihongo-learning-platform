import Database from 'better-sqlite3';
import * as path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'dictionary.db');
const db = new Database(dbPath);

// Radical data for common N5 kanji
const radicalData: Record<string, { radical: string; radical_meaning: string }> = {
  '日': { radical: '日', radical_meaning: 'Mặt trời, Ngày' },
  '本': { radical: '木', radical_meaning: 'Cây' },
  '水': { radical: '水', radical_meaning: 'Nước' },
  '大': { radical: '大', radical_meaning: 'Lớn' },
  '小': { radical: '小', radical_meaning: 'Nhỏ' },
  '食': { radical: '食', radical_meaning: 'Ăn, Thức ăn' },
  '行': { radical: '行', radical_meaning: 'Đi, Hành động' },
  '山': { radical: '山', radical_meaning: 'Núi' },
  '川': { radical: '川', radical_meaning: 'Sông' },
  '犬': { radical: '犬', radical_meaning: 'Con chó' },
  '一': { radical: '一', radical_meaning: 'Một' },
  '二': { radical: '二', radical_meaning: 'Hai' },
  '三': { radical: '一', radical_meaning: 'Một' },
  '四': { radical: '囗', radical_meaning: 'Bốn (bị vây)' },
  '五': { radical: '五', radical_meaning: 'Năm' },
  '六': { radical: '八', radical_meaning: 'Tám' },
  '七': { radical: '一', radical_meaning: 'Một' },
  '八': { radical: '八', radical_meaning: 'Tám' },
  '九': { radical: '九', radical_meaning: 'Chín' },
  '十': { radical: '十', radical_meaning: 'Mười' },
  '百': { radical: '一', radical_meaning: 'Một' },
  '千': { radical: '千', radical_meaning: 'Nghìn' },
  '人': { radical: '人', radical_meaning: 'Người' },
  '男': { radical: '田', radical_meaning: 'Ruộng' },
  '女': { radical: '女', radical_meaning: 'Nữ giới' },
  '子': { radical: '子', radical_meaning: 'Con' },
  '月': { radical: '月', radical_meaning: 'Mặt trăng, Tháng' },
  '火': { radical: '火', radical_meaning: 'Lửa' },
  '木': { radical: '木', radical_meaning: 'Cây' },
  '金': { radical: '金', radical_meaning: 'Vàng, Tiền' },
  '土': { radical: '土', radical_meaning: 'Đất' },
  '口': { radical: '口', radical_meaning: 'Miệng' },
  '目': { radical: '目', radical_meaning: 'Mắt' },
  '耳': { radical: '耳', radical_meaning: 'Tai' },
  '手': { radical: '手', radical_meaning: 'Tay' },
  '足': { radical: '足', radical_meaning: 'Chân, Đủ' },
  '見': { radical: '目', radical_meaning: 'Mắt' },
  '聞': { radical: '耳', radical_meaning: 'Tai' },
  '飲': { radical: '食', radical_meaning: 'Ăn' },
  '話': { radical: '言', radical_meaning: 'Nói' },
  '読': { radical: '言', radical_meaning: 'Nói' },
  '書': { radical: '日', radical_meaning: 'Mặt trời, Ngày' },
  '買': { radical: '貝', radical_meaning: 'Vỏ sò, Tiền' },
  '学': { radical: '子', radical_meaning: 'Con' },
  '校': { radical: '木', radical_meaning: 'Cây' },
  '生': { radical: '生', radical_meaning: 'Sinh, Sống' },
  '先': { radical: '儿', radical_meaning: 'Chân, Nhỏ' },
  '今': { radical: '人', radical_meaning: 'Người' },
  '時': { radical: '日', radical_meaning: 'Mặt trời, Ngày' },
};

// Update each kanji with radical data
const updateStmt = db.prepare(`
  UPDATE kanji_data
  SET radical = ?, radical_meaning = ?
  WHERE kanji = ?
`);

let updated = 0;
for (const [kanji, data] of Object.entries(radicalData)) {
  const result = updateStmt.run(data.radical, data.radical_meaning, kanji);
  if (result.changes > 0) {
    updated++;
    console.log(`Updated ${kanji}: radical=${data.radical}`);
  }
}

console.log(`\nTotal: ${updated} kanji updated`);

// Verify
const verify = db.prepare('SELECT kanji, radical, radical_meaning FROM kanji_data WHERE radical IS NOT NULL').all();
console.log(`\nVerification: ${verify.length} kanji have radical data`);
verify.forEach((row: any) => {
  console.log(`  ${row.kanji}: ${row.radical} - ${row.radical_meaning}`);
});

db.close();