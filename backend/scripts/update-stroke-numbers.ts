import * as fs from 'fs';
import * as path from 'path';

interface StrokeNumber {
  x: number;
  y: number;
}

/**
 * Parse KanjiVG SVG to extract stroke paths and stroke number positions
 */
function parseKanjiVGFile(filePath: string): { strokes: string[]; strokeNumbers: StrokeNumber[] } | null {
  try {
    const svgContent = fs.readFileSync(filePath, 'utf-8').replace(/\r\n?/g, '\n');

    // Extract stroke paths - only paths with kvg:type attribute inside StrokePaths group
    const strokePathRegex = /kvg:type="[^"]+"\s+d="([^"]+)"/g;
    const strokes: string[] = [];
    let match;

    while ((match = strokePathRegex.exec(svgContent)) !== null) {
      strokes.push(match[1]);
    }

    if (strokes.length === 0) {
      return null;
    }

    // Extract stroke number positions
    // Format: <text transform="matrix(1 0 0 1 x y)">number</text>
    // The matrix is always: matrix(1 0 0 1 <x> <y>)
    const textRegex = /<text[^>]*transform="matrix\(1 0 0 1\s*([\d.]+)\s+([\d.]+)\)"\s*>([\d]+)<\/text>/g;
    const strokeNumbers: StrokeNumber[] = [];
    let textMatch;

    while ((textMatch = textRegex.exec(svgContent)) !== null) {
      const num = parseInt(textMatch[3], 10);
      strokeNumbers[num - 1] = {
        x: parseFloat(textMatch[1]),
        y: parseFloat(textMatch[2]),
      };
    }

    const sortedNumbers = strokeNumbers.filter(Boolean);

    return { strokes, strokeNumbers: sortedNumbers };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Get Unicode codepoint from kanji character
 */
function kanjiToCodepoint(kanji: string): string {
  const codePoint = kanji.charCodeAt(0);
  return codePoint.toString(16).padStart(5, '0').toUpperCase();
}

// Kanji to process
const kanjiList = [
  '日', '本', '水', '大', '小', '食', '行', '山', '川', '犬',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '百', '千', '人', '男', '女', '子', '月', '火', '木', '金',
  '土', '口', '目', '耳', '手', '足', '見', '聞', '飲', '話',
  '読', '書', '買', '学', '校', '生', '先', '今', '時'
];

const kanjiDir = path.join(__dirname, '../kanjivg_data/kanji');
const results: Record<string, { paths: string; numbers: string }> = {};

console.log('Parsing KanjiVG stroke numbers...\n');

for (const kanji of kanjiList) {
  const codepoint = kanjiToCodepoint(kanji);
  const fileName = `${codepoint}.svg`;
  const filePath = path.join(kanjiDir, fileName);

  if (fs.existsSync(filePath)) {
    const parsed = parseKanjiVGFile(filePath);
    if (parsed && parsed.strokes.length > 0 && parsed.strokeNumbers.length > 0) {
      results[kanji] = {
        paths: parsed.strokes.join('||'),
        numbers: JSON.stringify(parsed.strokeNumbers),
      };
      console.log(`✓ ${kanji}: ${parsed.strokes.length} strokes, ${parsed.strokeNumbers.length} numbers`);
      console.log(`  Numbers: ${JSON.stringify(parsed.strokeNumbers)}`);
    } else if (parsed && parsed.strokes.length > 0) {
      console.log(`✗ ${kanji}: Found ${parsed.strokes.length} strokes but ${parsed.strokeNumbers.length} numbers`);
    } else {
      console.log(`✗ ${kanji}: Failed to parse`);
    }
  } else {
    console.log(`✗ ${kanji}: File not found (${fileName})`);
  }
}

console.log(`\nTotal: ${Object.keys(results).length} kanji with complete data`);
