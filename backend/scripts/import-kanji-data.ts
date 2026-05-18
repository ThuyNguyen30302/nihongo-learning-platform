/**
 * import-kanji-data.ts
 *
 * One-shot script: parse KANJIDIC2 + KanjiVG SVG → merge → import into kanji_data table.
 *
 * Usage:  npx ts-node scripts/import-kanji-data.ts
 *
 * Expects:
 *   data/dictionary.db         — existing SQLite DB (tables already created)
 *   kanjidic2.xml              — in project root
 *   kanjivg_data/kanji/*.svg   — KanjiVG stroke files
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// ── 214 Kangxi Radicals ──────────────────────────────────────────────────
// number → { symbol, name_jp (Japanese name), name_vi (Vietnamese meaning) }

const RADICAL_MAP: Record<number, { symbol: string; name_jp: string; name_vi: string }> = {
  1:   { symbol: '一', name_jp: 'いち', name_vi: 'Một' },
  2:   { symbol: '丨', name_jp: 'たてぼう', name_vi: 'Nét sổ' },
  3:   { symbol: '丶', name_jp: 'てん', name_vi: 'Nét chấm' },
  4:   { symbol: '丿', name_jp: 'の', name_vi: 'Nét phẩy' },
  5:   { symbol: '乙', name_jp: 'おつ', name_vi: 'Ất' },
  6:   { symbol: '亅', name_jp: 'はねぼう', name_vi: 'Nét móc' },
  7:   { symbol: '二', name_jp: 'に', name_vi: 'Hai' },
  8:   { symbol: '亠', name_jp: 'なべぶた', name_vi: 'Đầu' },
  9:   { symbol: '人', name_jp: 'ひと', name_vi: 'Người' },
  10:  { symbol: '儿', name_jp: 'にんにょう', name_vi: 'Chân người' },
  11:  { symbol: '入', name_jp: 'いる', name_vi: 'Vào' },
  12:  { symbol: '八', name_jp: 'はち', name_vi: 'Tám' },
  13:  { symbol: '冂', name_jp: 'けいがまえ', name_vi: 'Vòng ngoài' },
  14:  { symbol: '冖', name_jp: 'わかんむり', name_vi: 'Mũ' },
  15:  { symbol: '冫', name_jp: 'にすい', name_vi: 'Băng' },
  16:  { symbol: '几', name_jp: 'つくえ', name_vi: 'Bàn' },
  17:  { symbol: '凵', name_jp: 'うけばこ', name_vi: 'Hố' },
  18:  { symbol: '刀', name_jp: 'かたな', name_vi: 'Đao' },
  19:  { symbol: '力', name_jp: 'ちから', name_vi: 'Lực' },
  20:  { symbol: '勹', name_jp: 'つつみがまえ', name_vi: 'Bao' },
  21:  { symbol: '匕', name_jp: 'さじ', name_vi: 'Chủy' },
  22:  { symbol: '匚', name_jp: 'はこがまえ', name_vi: 'Hộp' },
  23:  { symbol: '匸', name_jp: 'かくしがまえ', name_vi: 'Che' },
  24:  { symbol: '十', name_jp: 'じゅう', name_vi: 'Mười' },
  25:  { symbol: '卜', name_jp: 'ぼく', name_vi: 'Bốc' },
  26:  { symbol: '卩', name_jp: 'ふしづくり', name_vi: 'Tiết' },
  27:  { symbol: '厂', name_jp: 'がんだれ', name_vi: 'Sườn' },
  28:  { symbol: '厶', name_jp: 'む', name_vi: 'Khư' },
  29:  { symbol: '又', name_jp: 'また', name_vi: 'Hựu' },
  30:  { symbol: '口', name_jp: 'くち', name_vi: 'Miệng' },
  31:  { symbol: '囗', name_jp: 'くにがまえ', name_vi: 'Vây' },
  32:  { symbol: '土', name_jp: 'つち', name_vi: 'Đất' },
  33:  { symbol: '士', name_jp: 'さむらい', name_vi: 'Sĩ' },
  34:  { symbol: '夂', name_jp: 'ふゆがしら', name_vi: 'Trĩ' },
  35:  { symbol: '夊', name_jp: 'すいにょう', name_vi: 'Tuy' },
  36:  { symbol: '夕', name_jp: 'ゆう', name_vi: 'Tịch' },
  37:  { symbol: '大', name_jp: 'だい', name_vi: 'Lớn' },
  38:  { symbol: '女', name_jp: 'おんな', name_vi: 'Nữ' },
  39:  { symbol: '子', name_jp: 'こ', name_vi: 'Con' },
  40:  { symbol: '宀', name_jp: 'うかんむり', name_vi: 'Miên' },
  41:  { symbol: '寸', name_jp: 'すん', name_vi: 'Thốn' },
  42:  { symbol: '小', name_jp: 'ちいさい', name_vi: 'Nhỏ' },
  43:  { symbol: '尢', name_jp: 'まげあし', name_vi: 'Uông' },
  44:  { symbol: '尸', name_jp: 'しかばね', name_vi: 'Thi' },
  45:  { symbol: '屮', name_jp: 'くさのめ', name_vi: 'Triệt' },
  46:  { symbol: '山', name_jp: 'やま', name_vi: 'Núi' },
  47:  { symbol: '川', name_jp: 'かわ', name_vi: 'Sông' },
  48:  { symbol: '工', name_jp: 'たくみ', name_vi: 'Công' },
  49:  { symbol: '己', name_jp: 'おのれ', name_vi: 'Kỷ' },
  50:  { symbol: '巾', name_jp: 'はば', name_vi: 'Cân' },
  51:  { symbol: '干', name_jp: 'ほす', name_vi: 'Can' },
  52:  { symbol: '幺', name_jp: 'いとがしら', name_vi: 'Yêu' },
  53:  { symbol: '广', name_jp: 'まだれ', name_vi: 'Nghiễm' },
  54:  { symbol: '廴', name_jp: 'えんにょう', name_vi: 'Dẫn' },
  55:  { symbol: '廾', name_jp: 'にじゅうあし', name_vi: 'Củng' },
  56:  { symbol: '弋', name_jp: 'しきがまえ', name_vi: 'Dặc' },
  57:  { symbol: '弓', name_jp: 'ゆみ', name_vi: 'Cung' },
  58:  { symbol: '彐', name_jp: 'けいがしら', name_vi: 'Kệ' },
  59:  { symbol: '彡', name_jp: 'さんづくり', name_vi: 'Sam' },
  60:  { symbol: '彳', name_jp: 'ぎょうにんべん', name_vi: 'Xích' },
  61:  { symbol: '心', name_jp: 'こころ', name_vi: 'Tâm' },
  62:  { symbol: '戈', name_jp: 'ほこ', name_vi: 'Qua' },
  63:  { symbol: '戸', name_jp: 'と', name_vi: 'Hộ' },
  64:  { symbol: '手', name_jp: 'て', name_vi: 'Thủ' },
  65:  { symbol: '支', name_jp: 'しにょう', name_vi: 'Chi' },
  66:  { symbol: '攴', name_jp: 'ぼくづくり', name_vi: 'Phộc' },
  67:  { symbol: '文', name_jp: 'ぶん', name_vi: 'Văn' },
  68:  { symbol: '斗', name_jp: 'とます', name_vi: 'Đẩu' },
  69:  { symbol: '斤', name_jp: 'おの', name_vi: 'Cân' },
  70:  { symbol: '方', name_jp: 'ほう', name_vi: 'Phương' },
  71:  { symbol: '无', name_jp: 'なし', name_vi: 'Vô' },
  72:  { symbol: '日', name_jp: 'ひ', name_vi: 'Mặt trời, Ngày' },
  73:  { symbol: '曰', name_jp: 'ひらび', name_vi: 'Viết' },
  74:  { symbol: '月', name_jp: 'つき', name_vi: 'Mặt trăng, Tháng' },
  75:  { symbol: '木', name_jp: 'き', name_vi: 'Cây' },
  76:  { symbol: '欠', name_jp: 'あくび', name_vi: 'Khiếm' },
  77:  { symbol: '止', name_jp: 'とめる', name_vi: 'Chỉ' },
  78:  { symbol: '歹', name_jp: 'がつへん', name_vi: 'Đãi' },
  79:  { symbol: '殳', name_jp: 'ほこづくり', name_vi: 'Thù' },
  80:  { symbol: '毋', name_jp: 'なかれ', name_vi: 'Vô' },
  81:  { symbol: '比', name_jp: 'くらべる', name_vi: 'Tỉ' },
  82:  { symbol: '毛', name_jp: 'け', name_vi: 'Lông' },
  83:  { symbol: '氏', name_jp: 'うじ', name_vi: 'Thị' },
  84:  { symbol: '气', name_jp: 'きがまえ', name_vi: 'Khí' },
  85:  { symbol: '水', name_jp: 'みず', name_vi: 'Nước' },
  86:  { symbol: '火', name_jp: 'ひ', name_vi: 'Lửa' },
  87:  { symbol: '爪', name_jp: 'つめ', name_vi: 'Trảo' },
  88:  { symbol: '父', name_jp: 'ちち', name_vi: 'Cha' },
  89:  { symbol: '爻', name_jp: 'こう', name_vi: 'Hào' },
  90:  { symbol: '爿', name_jp: 'しょうへん', name_vi: 'Tường' },
  91:  { symbol: '片', name_jp: 'かた', name_vi: 'Phiến' },
  92:  { symbol: '牙', name_jp: 'きば', name_vi: 'Nha' },
  93:  { symbol: '牛', name_jp: 'うし', name_vi: 'Trâu' },
  94:  { symbol: '犬', name_jp: 'いぬ', name_vi: 'Chó' },
  95:  { symbol: '玄', name_jp: 'げん', name_vi: 'Huyền' },
  96:  { symbol: '玉', name_jp: 'たま', name_vi: 'Ngọc' },
  97:  { symbol: '瓜', name_jp: 'うり', name_vi: 'Qua' },
  98:  { symbol: '瓦', name_jp: 'かわら', name_vi: 'Ngõa' },
  99:  { symbol: '甘', name_jp: 'あまい', name_vi: 'Cam' },
  100: { symbol: '生', name_jp: 'うまれる', name_vi: 'Sinh' },
  101: { symbol: '用', name_jp: 'もちいる', name_vi: 'Dụng' },
  102: { symbol: '田', name_jp: 'た', name_vi: 'Ruộng' },
  103: { symbol: '疋', name_jp: 'ひき', name_vi: 'Sơ' },
  104: { symbol: '疒', name_jp: 'やまいだれ', name_vi: 'Bệnh' },
  105: { symbol: '癶', name_jp: 'はつがしら', name_vi: 'Bát' },
  106: { symbol: '白', name_jp: 'しろ', name_vi: 'Trắng' },
  107: { symbol: '皮', name_jp: 'けがわ', name_vi: 'Bì' },
  108: { symbol: '皿', name_jp: 'さら', name_vi: 'Mãnh' },
  109: { symbol: '目', name_jp: 'め', name_vi: 'Mắt' },
  110: { symbol: '矛', name_jp: 'ほこ', name_vi: 'Mâu' },
  111: { symbol: '矢', name_jp: 'や', name_vi: 'Thỉ' },
  112: { symbol: '石', name_jp: 'いし', name_vi: 'Đá' },
  113: { symbol: '示', name_jp: 'しめす', name_vi: 'Thị' },
  114: { symbol: '禸', name_jp: 'ぐうのあし', name_vi: 'Nhựu' },
  115: { symbol: '禾', name_jp: 'のぎ', name_vi: 'Hòa' },
  116: { symbol: '穴', name_jp: 'あな', name_vi: 'Huyệt' },
  117: { symbol: '立', name_jp: 'たつ', name_vi: 'Lập' },
  118: { symbol: '竹', name_jp: 'たけ', name_vi: 'Trúc' },
  119: { symbol: '米', name_jp: 'こめ', name_vi: 'Mễ' },
  120: { symbol: '糸', name_jp: 'いと', name_vi: 'Mịch' },
  121: { symbol: '缶', name_jp: 'ほとぎ', name_vi: 'Phẫu' },
  122: { symbol: '网', name_jp: 'あみがしら', name_vi: 'Võng' },
  123: { symbol: '羊', name_jp: 'ひつじ', name_vi: 'Dương' },
  124: { symbol: '羽', name_jp: 'はね', name_vi: 'Vũ' },
  125: { symbol: '老', name_jp: 'おい', name_vi: 'Lão' },
  126: { symbol: '而', name_jp: 'しかして', name_vi: 'Nhi' },
  127: { symbol: '耒', name_jp: 'らいすき', name_vi: 'Lỗi' },
  128: { symbol: '耳', name_jp: 'みみ', name_vi: 'Nhĩ' },
  129: { symbol: '聿', name_jp: 'ふでづくり', name_vi: 'Duật' },
  130: { symbol: '肉', name_jp: 'にく', name_vi: 'Thịt' },
  131: { symbol: '臣', name_jp: 'しん', name_vi: 'Thần' },
  132: { symbol: '自', name_jp: 'みずから', name_vi: 'Tự' },
  133: { symbol: '至', name_jp: 'いたる', name_vi: 'Chí' },
  134: { symbol: '臼', name_jp: 'うす', name_vi: 'Cữu' },
  135: { symbol: '舌', name_jp: 'した', name_vi: 'Thiệt' },
  136: { symbol: '舛', name_jp: 'まいあし', name_vi: 'Suyễn' },
  137: { symbol: '舟', name_jp: 'ふね', name_vi: 'Chu' },
  138: { symbol: '艮', name_jp: 'こん', name_vi: 'Cấn' },
  139: { symbol: '色', name_jp: 'いろ', name_vi: 'Sắc' },
  140: { symbol: '艸', name_jp: 'くさかんむり', name_vi: 'Thảo' },
  141: { symbol: '虍', name_jp: 'とらかんむり', name_vi: 'Hô' },
  142: { symbol: '虫', name_jp: 'むし', name_vi: 'Trùng' },
  143: { symbol: '血', name_jp: 'ち', name_vi: 'Huyết' },
  144: { symbol: '行', name_jp: 'ぎょう', name_vi: 'Hành' },
  145: { symbol: '衣', name_jp: 'ころも', name_vi: 'Y' },
  146: { symbol: '襾', name_jp: 'にし', name_vi: 'Tây' },
  147: { symbol: '見', name_jp: 'みる', name_vi: 'Kiến' },
  148: { symbol: '角', name_jp: 'つの', name_vi: 'Giác' },
  149: { symbol: '言', name_jp: 'ことば', name_vi: 'Ngôn' },
  150: { symbol: '谷', name_jp: 'たに', name_vi: 'Cốc' },
  151: { symbol: '豆', name_jp: 'まめ', name_vi: 'Đậu' },
  152: { symbol: '豕', name_jp: 'ぶた', name_vi: 'Thỉ' },
  153: { symbol: '豸', name_jp: 'むじな', name_vi: 'Trãi' },
  154: { symbol: '貝', name_jp: 'かい', name_vi: 'Bối' },
  155: { symbol: '赤', name_jp: 'あか', name_vi: 'Xích' },
  156: { symbol: '走', name_jp: 'はしる', name_vi: 'Tẩu' },
  157: { symbol: '足', name_jp: 'あし', name_vi: 'Túc' },
  158: { symbol: '身', name_jp: 'み', name_vi: 'Thân' },
  159: { symbol: '車', name_jp: 'くるま', name_vi: 'Xa' },
  160: { symbol: '辛', name_jp: 'からい', name_vi: 'Tân' },
  161: { symbol: '辰', name_jp: 'しんのたつ', name_vi: 'Thần' },
  162: { symbol: '辵', name_jp: 'しんにょう', name_vi: 'Sước' },
  163: { symbol: '邑', name_jp: 'むら', name_vi: 'Ấp' },
  164: { symbol: '酉', name_jp: 'とり', name_vi: 'Dậu' },
  165: { symbol: '釆', name_jp: 'のごめ', name_vi: 'Biện' },
  166: { symbol: '里', name_jp: 'さと', name_vi: 'Lý' },
  167: { symbol: '金', name_jp: 'かね', name_vi: 'Kim' },
  168: { symbol: '長', name_jp: 'ながい', name_vi: 'Trường' },
  169: { symbol: '門', name_jp: 'もん', name_vi: 'Môn' },
  170: { symbol: '阜', name_jp: 'こざとへん', name_vi: 'Phụ' },
  171: { symbol: '隶', name_jp: 'れいづくり', name_vi: 'Đãi' },
  172: { symbol: '隹', name_jp: 'ふるとり', name_vi: 'Chuy' },
  173: { symbol: '雨', name_jp: 'あめ', name_vi: 'Vũ' },
  174: { symbol: '青', name_jp: 'あお', name_vi: 'Thanh' },
  175: { symbol: '非', name_jp: 'あらず', name_vi: 'Phi' },
  176: { symbol: '面', name_jp: 'めん', name_vi: 'Diện' },
  177: { symbol: '革', name_jp: 'かわ', name_vi: 'Cách' },
  178: { symbol: '韋', name_jp: 'なめしがわ', name_vi: 'Vi' },
  179: { symbol: '韭', name_jp: 'にら', name_vi: 'Cửu' },
  180: { symbol: '音', name_jp: 'おと', name_vi: 'Âm' },
  181: { symbol: '頁', name_jp: 'おおがい', name_vi: 'Hiệt' },
  182: { symbol: '風', name_jp: 'かぜ', name_vi: 'Phong' },
  183: { symbol: '飛', name_jp: 'とぶ', name_vi: 'Phi' },
  184: { symbol: '食', name_jp: 'しょく', name_vi: 'Thực' },
  185: { symbol: '首', name_jp: 'くび', name_vi: 'Thủ' },
  186: { symbol: '香', name_jp: 'かおり', name_vi: 'Hương' },
  187: { symbol: '馬', name_jp: 'うま', name_vi: 'Mã' },
  188: { symbol: '骨', name_jp: 'ほね', name_vi: 'Cốt' },
  189: { symbol: '高', name_jp: 'たかい', name_vi: 'Cao' },
  190: { symbol: '髟', name_jp: 'かみがしら', name_vi: 'Tiêu' },
  191: { symbol: '鬥', name_jp: 'とうがまえ', name_vi: 'Đấu' },
  192: { symbol: '鬯', name_jp: 'ちょう', name_vi: 'Sưởng' },
  193: { symbol: '鬲', name_jp: 'かなえ', name_vi: 'Cách' },
  194: { symbol: '鬼', name_jp: 'おに', name_vi: 'Quỷ' },
  195: { symbol: '魚', name_jp: 'うお', name_vi: 'Ngư' },
  196: { symbol: '鳥', name_jp: 'とり', name_vi: 'Điểu' },
  197: { symbol: '鹵', name_jp: 'しお', name_vi: 'Lỗ' },
  198: { symbol: '鹿', name_jp: 'しか', name_vi: 'Lộc' },
  199: { symbol: '麥', name_jp: 'むぎ', name_vi: 'Mạch' },
  200: { symbol: '麻', name_jp: 'あさ', name_vi: 'Ma' },
  201: { symbol: '黄', name_jp: 'き', name_vi: 'Hoàng' },
  202: { symbol: '黍', name_jp: 'きび', name_vi: 'Thử' },
  203: { symbol: '黒', name_jp: 'くろ', name_vi: 'Hắc' },
  204: { symbol: '黹', name_jp: 'ふつ', name_vi: 'Chỉ' },
  205: { symbol: '黽', name_jp: 'べん', name_vi: 'Mãnh' },
  206: { symbol: '鼎', name_jp: 'かなえ', name_vi: 'Đỉnh' },
  207: { symbol: '鼓', name_jp: 'つづみ', name_vi: 'Cổ' },
  208: { symbol: '鼠', name_jp: 'ねずみ', name_vi: 'Thử' },
  209: { symbol: '鼻', name_jp: 'はな', name_vi: 'Tỵ' },
  210: { symbol: '齊', name_jp: 'せい', name_vi: 'Tề' },
  211: { symbol: '齒', name_jp: 'は', name_vi: 'Xỉ' },
  212: { symbol: '龍', name_jp: 'りゅう', name_vi: 'Long' },
  213: { symbol: '龜', name_jp: 'かめ', name_vi: 'Quy' },
  214: { symbol: '龠', name_jp: 'やく', name_vi: 'Dược' },
};

// ── Types ─────────────────────────────────────────────────────────────────

interface Kanjidic2Entry {
  kanji: string;
  ucs: string;             // hex codepoint e.g. "4e9c"
  on_readings: string[];   // katakana
  kun_readings: string[];  // hiragana
  meanings: string[];      // English
  radical_classical: number;
  stroke_count: number;
  jlpt: number | null;
  freq: number | null;
}

interface KanjiVGData {
  strokes: string[];                // SVG path 'd' strings
  strokeNumbers: { x: number; y: number }[];
}

// ── Parse KANJIDIC2 ────────────────────────────────────────────────────

function parseKanjidic2(xmlPath: string): Map<string, Kanjidic2Entry> {
  console.log('Parsing KANJIDIC2 XML...');
  const xml = fs.readFileSync(xmlPath, 'utf-8');
  const map = new Map<string, Kanjidic2Entry>();

  // Split by closing character tag, find each block
  const re = /<character>([\s\S]*?)<\/character>/g;
  let match;
  let count = 0;

  while ((match = re.exec(xml)) !== null) {
    const block = match[1];

    const literal = extract(block, /<literal>([^<]+)<\/literal>/);
    if (!literal) continue;

    const ucs = extract(block, /<cp_value cp_type="ucs">([^<]+)<\/cp_value>/) || '';
    const radClassical = parseInt(extract(block, /<rad_value rad_type="classical">(\d+)<\/rad_value>/) || '0', 10);
    const strokeCount = parseInt(extract(block, /<stroke_count>(\d+)<\/stroke_count>/) || '0', 10);
    const jlptStr = extract(block, /<jlpt>(\d+)<\/jlpt>/);
    const freqStr = extract(block, /<freq>(\d+)<\/freq>/);

    const onReadings: string[] = [];
    const kunReadings: string[] = [];
    const meanings: string[] = [];

    // Extract ja_on readings
    const onRe = /<reading r_type="ja_on">([^<]+)<\/reading>/g;
    let rm;
    while ((rm = onRe.exec(block)) !== null) {
      onReadings.push(rm[1]);
    }

    // Extract ja_kun readings
    const kunRe = /<reading r_type="ja_kun">([^<]+)<\/reading>/g;
    while ((rm = kunRe.exec(block)) !== null) {
      kunReadings.push(rm[1]);
    }

    // Extract English meanings (no m_lang attribute or m_lang not present)
    const meaningRe = /<meaning(?: m_lang="[^"]*")?>([^<]+)<\/meaning>/g;
    while ((rm = meaningRe.exec(block)) !== null) {
      // Only take meanings without m_lang (default = English)
      // Check if this specific match had m_lang
      const fullMatch = rm[0];
      if (!fullMatch.includes('m_lang=')) {
        meanings.push(rm[1]);
      }
    }

    map.set(literal, {
      kanji: literal,
      ucs,
      on_readings: onReadings,
      kun_readings: kunReadings,
      meanings,
      radical_classical: radClassical || 0,
      stroke_count: strokeCount || 0,
      jlpt: jlptStr ? parseInt(jlptStr, 10) : null,
      freq: freqStr ? parseInt(freqStr, 10) : null,
    });

    count++;
    if (count % 2000 === 0) {
      console.log(`  ... parsed ${count} kanji entries`);
    }
  }

  console.log(`  Done: ${count} kanji entries parsed from KANJIDIC2`);
  return map;
}

function extract(str: string, regex: RegExp): string | undefined {
  const m = regex.exec(str);
  return m ? m[1] : undefined;
}

// ── Parse KanjiVG SVGs ─────────────────────────────────────────────────

function parseKanjiVG(svgDir: string): Map<string, KanjiVGData> {
  console.log('Parsing KanjiVG SVG files...');
  const map = new Map<string, KanjiVGData>();
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
  let count = 0;

  for (const file of files) {
    const filePath = path.join(svgDir, file);
    const svg = fs.readFileSync(filePath, 'utf-8');

    // Extract kanji from kvg:element
    const elementMatch = svg.match(/kvg:element="([^"]+)"/);
    if (!elementMatch) continue;
    const kanji = elementMatch[1];
    if (kanji.length !== 1) continue; // skip non-single-char entries

    // Extract stroke paths (only direct path children that have kvg:type)
    const pathRe = /<path[^>]+kvg:type="([^"]*)"[^>]+d="([^"]+)"[^>]*>/g;
    const strokes: string[] = [];
    let pm;
    while ((pm = pathRe.exec(svg)) !== null) {
      strokes.push(pm[2]);
    }

    if (strokes.length === 0) continue;

    // Extract stroke number positions from StrokeNumbers group
    const strokeNumbers: { x: number; y: number }[] = [];
    const numRe = /<text transform="matrix\(1 0 0 1 ([0-9.]+) ([0-9.]+)\)">(\d+)<\/text>/g;
    let nm;
    while ((nm = numRe.exec(svg)) !== null) {
      const numIndex = parseInt(nm[3], 10) - 1; // zero-based
      strokeNumbers[numIndex] = { x: parseFloat(nm[1]), y: parseFloat(nm[2]) };
    }

    // Filter out undefined entries (in case of gaps)
    const cleanNumbers = strokeNumbers.filter(n => n !== undefined);

    map.set(kanji, { strokes, strokeNumbers: cleanNumbers });
    count++;

    if (count % 2000 === 0) {
      console.log(`  ... parsed ${count} SVG files`);
    }
  }

  console.log(`  Done: ${count} SVG files parsed`);
  return map;
}

// ── Merge & Import ─────────────────────────────────────────────────────

function importToDb(
  dbPath: string,
  kanjidic2: Map<string, Kanjidic2Entry>,
  kanjivg: Map<string, KanjiVGData>,
) {
  console.log('Opening database...');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = OFF'); // speed up bulk insert

  // Clear existing data
  console.log('Clearing existing kanji_data...');
  db.exec('DELETE FROM kanji_data');

  const insert = db.prepare(`
    INSERT INTO kanji_data (kanji, meaning_vi, meaning_en, on_reading, kun_reading, stroke_count, stroke_paths, stroke_numbers, radical, radical_meaning)
    VALUES (@kanji, @meaning_vi, @meaning_en, @on_reading, @kun_reading, @stroke_count, @stroke_paths, @stroke_numbers, @radical, @radical_meaning)
  `);

  let imported = 0;
  let withStrokes = 0;
  let skipped = 0;

  const insertMany = db.transaction(() => {
    for (const [kanji, kd2] of kanjidic2) {
      const vg = kanjivg.get(kanji);
      const rad = RADICAL_MAP[kd2.radical_classical];

      // Build meaning_vi: for now derive from radical or leave placeholder
      // English meanings are primary; Vietnamese will need manual work later
      const meaningVi = ''; // will be filled later via separate translation pass
      const meaningEn = kd2.meanings.slice(0, 5).join('; '); // limit to 5 meanings
      const onReading = kd2.on_readings.join(', ');
      const kunReading = kd2.kun_readings.join(', ');
      const strokePaths = vg ? vg.strokes.join('||') : '';
      const strokeNumbersJson = vg ? JSON.stringify(vg.strokeNumbers) : '[]';
      const radicalSymbol = rad ? rad.symbol : '';

      const radicalMeaning = rad ? rad.name_vi : '';

      insert.run({
        kanji,
        meaning_vi: meaningVi,
        meaning_en: meaningEn,
        on_reading: onReading,
        kun_reading: kunReading,
        stroke_count: kd2.stroke_count || (vg ? vg.strokes.length : 0),
        stroke_paths: strokePaths,
        stroke_numbers: strokeNumbersJson,
        radical: radicalSymbol,
        radical_meaning: radicalMeaning,
      });

      if (vg && vg.strokes.length > 0) withStrokes++;
      imported++;
    }
  });

  insertMany();

  // Also count kanji that are in KanjiVG but NOT in KANJIDIC2
  for (const [kanji] of kanjivg) {
    if (!kanjidic2.has(kanji)) {
      skipped++;
    }
  }

  db.close();

  console.log(`\nImport complete:`);
  console.log(`  Total imported:   ${imported}`);
  console.log(`  With stroke data: ${withStrokes}`);
  console.log(`  KanjiVG-only (skipped, not in KANJIDIC2): ${skipped}`);
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const kanjidic2Path = path.join(rootDir, 'kanjidic2.xml');
  const kanjivgDir = path.join(rootDir, 'kanjivg_data', 'kanji');
  const dbPath = path.join(rootDir, 'data', 'dictionary.db');

  if (!fs.existsSync(kanjidic2Path)) {
    console.error('ERROR: kanjidic2.xml not found at', kanjidic2Path);
    process.exit(1);
  }
  if (!fs.existsSync(kanjivgDir)) {
    console.error('ERROR: KanjiVG dir not found at', kanjivgDir);
    process.exit(1);
  }
  if (!fs.existsSync(dbPath)) {
    console.error('ERROR: dictionary.db not found at', dbPath);
    process.exit(1);
  }

  console.log('=== Kanji Data Import ===\n');

  const kanjidic2 = parseKanjidic2(kanjidic2Path);
  const kanjivg = parseKanjiVG(kanjivgDir);
  importToDb(dbPath, kanjidic2, kanjivg);

  console.log('\nDone!');
}

main();
