import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple regex-based KanjiVG parser
 * Extracts stroke paths from KanjiVG SVG files
 */

export interface KanjiVGStroke {
  path: string;
  type?: string;
}

export interface ParsedKanjiVG {
  kanji: string;
  strokes: KanjiVGStroke[];
}

/**
 * Parse a KanjiVG SVG file and extract stroke paths
 */
export function parseKanjiVGFile(filePath: string): ParsedKanjiVG | null {
  try {
    const svgContent = fs.readFileSync(filePath, 'utf-8');

    // Extract kanji character from kvg:element attribute
    const kanjiMatch = svgContent.match(/kvg:element="([^"]+)"/);
    const kanji = kanjiMatch ? kanjiMatch[1] : '';

    // Extract all path 'd' attributes
    const pathRegex = /<path[^>]+d="([^"]+)"[^>]*>/g;
    const strokes: KanjiVGStroke[] = [];
    let match: RegExpExecArray | null;

    while ((match = pathRegex.exec(svgContent)) !== null) {
      strokes.push({ path: match[1] });
    }

    if (strokes.length === 0) {
      return null;
    }

    return { kanji, strokes };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Get stroke paths as a single string for database storage
 * Uses || as delimiter between strokes
 */
export function strokesToPathString(strokes: KanjiVGStroke[]): string {
  return strokes.map((s) => s.path).join('||');
}

/**
 * Parse stroke path string back to array
 */
export function pathStringToStrokes(pathString: string): string[] {
  if (!pathString) return [];
  return pathString.split('||');
}

/**
 * Get the Unicode code point from a kanji character
 */
export function kanjiToCodepoint(kanji: string): string {
  const codePoint = kanji.charCodeAt(0);
  return codePoint.toString(16).padStart(5, '0').toUpperCase();
}

/**
 * Find KanjiVG file for a given kanji character
 */
export function findKanjiVGFile(
  kanjiDir: string,
  kanji: string,
): string | null {
  const codepoint = kanjiToCodepoint(kanji);
  const fileName = `${codepoint}.svg`;
  const filePath = path.join(kanjiDir, fileName);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  // Try alternate naming (some files have suffixes)
  const files = fs.readdirSync(kanjiDir);
  const matching = files.find((f) => f.startsWith(codepoint));
  if (matching) {
    return path.join(kanjiDir, matching);
  }

  return null;
}

/**
 * Update kanji database with real KanjiVG stroke paths
 */
export function updateKanjiData(
  kanjiDir: string,
  kanjiChars: string[],
): Map<string, string> {
  const results = new Map<string, string>();

  for (const kanji of kanjiChars) {
    const filePath = findKanjiVGFile(kanjiDir, kanji);
    if (filePath) {
      const parsed = parseKanjiVGFile(filePath);
      if (parsed && parsed.strokes.length > 0) {
        const pathString = strokesToPathString(parsed.strokes);
        results.set(kanji, pathString);
        console.log(`✓ ${kanji}: ${parsed.strokes.length} strokes`);
      } else {
        console.log(`✗ ${kanji}: no strokes found`);
      }
    } else {
      console.log(
        `✗ ${kanji}: file not found (codepoint: ${kanjiToCodepoint(kanji)})`,
      );
    }
  }

  return results;
}
