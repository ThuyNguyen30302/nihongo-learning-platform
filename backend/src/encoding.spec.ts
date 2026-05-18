import * as fs from 'fs';
import * as path from 'path';

const SOURCE_ROOTS = [
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), '..', 'frontend', 'src'),
];

const MOJIBAKE_PATTERNS = [
  [0x00c3],
  [0x00c4, 0x2018],
  [0x00e1, 0x00ba],
  [0x00e1, 0x00bb],
  [0x00e2, 0x20ac, 0x0153],
  [0x00e2, 0x20ac],
  [0x00e3, 0x0081],
  [0x00e3, 0x201a],
  [0x00e6, 0x2014],
  [0x00e6, 0x0153],
].map((chars) => String.fromCharCode(...chars));

function listSourceFiles(root: string): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      return listSourceFiles(entryPath);
    }

    if (!/\.(ts|tsx|md)$/.test(entry.name) || entry.name.endsWith('.spec.ts')) {
      return [];
    }

    return [entryPath];
  });
}

describe('source encoding guardrail', () => {
  it('does not contain common mojibake sequences in runtime source files', () => {
    const offenders = SOURCE_ROOTS.flatMap(listSourceFiles)
      .map((file) => ({
        file: path.relative(path.join(process.cwd(), '..'), file),
        content: fs.readFileSync(file, 'utf8'),
      }))
      .filter(({ content }) =>
        MOJIBAKE_PATTERNS.some((pattern) => content.includes(pattern)),
      )
      .map(({ file }) => file);

    expect(offenders).toEqual([]);
  });
});
