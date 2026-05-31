import Database from 'better-sqlite3';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let db: Database.Database;

  beforeEach(() => {
    service = new DatabaseService();
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kanji TEXT NOT NULL,
        kana TEXT NOT NULL,
        romaji TEXT NOT NULL,
        meaning_vi TEXT NOT NULL,
        han_viet TEXT,
        meaning_en TEXT NOT NULL,
        part_of_speech TEXT,
        example_sentence TEXT,
        example_meaning_vi TEXT
      );

      CREATE TABLE kanji_data (
        kanji TEXT PRIMARY KEY,
        meaning_vi TEXT NOT NULL DEFAULT '',
        meaning_en TEXT NOT NULL DEFAULT '',
        on_reading TEXT,
        kun_reading TEXT,
        stroke_count INTEGER,
        stroke_paths TEXT,
        stroke_numbers TEXT,
        radical TEXT,
        radical_element TEXT,
        radical_original TEXT,
        radical_meaning TEXT
      );

      CREATE TABLE favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE VIRTUAL TABLE words_fts USING fts5(
        kanji, kana, romaji, meaning_en, meaning_vi,
        content='words', content_rowid='id',
        tokenize='unicode61 remove_diacritics 0'
      );
    `);

    db.prepare(
      `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run('日本', 'にほん', 'nihon', 'Nhật Bản', 'Japan', 'danh từ', '', '');
    db.prepare(
      `
      INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(1, '日本', 'にほん', 'nihon', 'Japan', 'Nhật Bản');
    db.prepare(
      `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      '日本語',
      'にほんご',
      'nihongo',
      'Tiếng Nhật',
      'Japanese language',
      'noun',
      '',
      '',
    );
    db.prepare(
      `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      '水',
      'みず',
      'mizu',
      'Nước',
      'Water',
      'danh từ',
      '水を飲みます。',
      'Uống nước.',
    );
    db.prepare(
      `
      INSERT INTO words_fts(rowid, kanji, kana, romaji, meaning_en, meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(3, '水', 'みず', 'mizu', 'Water', 'Nước');
    db.prepare(
      `
      INSERT INTO kanji_data (kanji, meaning_vi, meaning_en, on_reading, kun_reading, stroke_count, stroke_paths, stroke_numbers, radical, radical_element, radical_original, radical_meaning)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      '日',
      'Ngày',
      'Sun',
      'ニチ',
      'ひ',
      4,
      'M0 0 L1 1||M1 1 L2 2',
      JSON.stringify([{ x: 10, y: 20 }]),
      '日',
      '日',
      '',
      'mặt trời',
    );

    const serviceWithDb = service as unknown as { db: Database.Database };
    serviceWithDb.db = db;
  });

  afterEach(() => {
    db.close();
  });

  it('searches words by kanji', () => {
    const results = service.searchWords('日本');

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]).toMatchObject({
      id: 1,
      kanji: '日本',
      kana: 'にほん',
      romaji: 'nihon',
      meaning_vi: 'Nhật Bản',
      meaning_en: 'Japan',
    });
  });

  it('searches words by romaji in the unified search', () => {
    const results = service.searchWords('NIHON');

    expect(results.map((word) => word.romaji)).toEqual(['nihon', 'nihongo']);
  });

  it('searches words by Vietnamese meaning in the unified search', () => {
    const results = service.searchWords('Tiếng');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ meaning_vi: 'Tiếng Nhật' });
  });

  it('searches words by kana in the unified search', () => {
    const results = service.searchWords('にほんご');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kana: 'にほんご' });
  });

  it('searches words by kanji in the unified search', () => {
    const results = service.searchWords('日本語');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kanji: '日本語' });
  });

  it('returns a word by id', () => {
    expect(service.getWordById(1)).toMatchObject({
      id: 1,
      kanji: '日本',
      kana: 'にほん',
    });
    expect(service.getWordById(1)?.example_tokens).toBeUndefined();
  });

  it('segments example sentences with kuromoji POS metadata', () => {
    const insertResult = db
      .prepare(
        `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        '放送',
        'ほうそう',
        'housou',
        'phát thanh; phát sóng',
        'broadcast',
        'danh từ',
        'ニュースは毎時放送しています。',
        'Chúng tôi phát thanh tin tức hàng giờ.',
      );
    const wordId = Number(insertResult.lastInsertRowid);
    db.prepare(
      `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      '毎時',
      'まいじ',
      'maiji',
      'mỗi tiếng; hàng giờ',
      'hourly',
      'danh từ, phó từ',
      '',
      '',
    );

    (
      service as unknown as {
        japaneseTokenizer: {
          tokenize: (sentence: string) => unknown[];
        };
      }
    ).japaneseTokenizer = {
      tokenize: jest.fn().mockReturnValue([
        {
          surface_form: 'ニュース',
          word_position: 1,
          pos: '名詞',
          pos_detail_1: '一般',
          basic_form: 'ニュース',
          reading: 'ニュース',
        },
        {
          surface_form: 'は',
          word_position: 5,
          pos: '助詞',
          pos_detail_1: '係助詞',
          basic_form: 'は',
          reading: 'ハ',
        },
        {
          surface_form: '毎時',
          word_position: 6,
          pos: '接頭詞',
          pos_detail_1: '数接続',
          basic_form: '毎時',
          reading: 'マイジ',
        },
        {
          surface_form: '放送',
          word_position: 8,
          pos: '名詞',
          pos_detail_1: 'サ変接続',
          basic_form: '放送',
          reading: 'ホウソウ',
        },
        {
          surface_form: 'し',
          word_position: 10,
          pos: '動詞',
          pos_detail_1: '自立',
          basic_form: 'する',
          reading: 'シ',
        },
        {
          surface_form: 'て',
          word_position: 11,
          pos: '助詞',
          pos_detail_1: '接続助詞',
          basic_form: 'て',
          reading: 'テ',
        },
        {
          surface_form: 'い',
          word_position: 12,
          pos: '動詞',
          pos_detail_1: '非自立',
          basic_form: 'いる',
          reading: 'イ',
        },
        {
          surface_form: 'ます',
          word_position: 13,
          pos: '助動詞',
          pos_detail_1: '*',
          basic_form: 'ます',
          reading: 'マス',
        },
        {
          surface_form: '。',
          word_position: 15,
          pos: '記号',
          pos_detail_1: '句点',
          basic_form: '。',
          reading: '。',
        },
      ]),
    };

    const word = service.getWordById(wordId);

    expect(word?.example_tokens?.map((token) => token.surface)).toEqual([
      'ニュース',
      'は',
      '毎時',
      '放送',
      'し',
      'て',
      'い',
      'ます',
      '。',
    ]);
    expect(
      word?.example_tokens?.find((token) => token.surface === '放送'),
    ).toMatchObject({
      kind: 'word',
      reading: 'ほうそう',
      pos_raw: '名詞',
      pos_detail: 'サ変接続',
      pos_raw_label: 'danh từ',
      pos_detail_label: 'liên kết động từ する',
      pos_label: 'danh từ',
      pos_group: 'noun',
      part_of_speech: 'danh từ',
      meaning_vi: 'phát thanh',
    });
    expect(
      word?.example_tokens?.find((token) => token.surface === '毎時'),
    ).toMatchObject({
      surface: '毎時',
      pos_raw: '接頭詞',
      pos_detail: '数接続',
      pos_raw_label: 'tiền tố',
      pos_detail_label: 'liên kết số',
      pos_label: 'danh từ',
      pos_group: 'noun',
      part_of_speech: 'danh từ, phó từ',
      meaning_vi: 'hàng giờ',
    });
    expect(word?.example_tokens?.at(-1)).toMatchObject({
      surface: '。',
      kind: 'punctuation',
      pos_raw: '記号',
      pos_raw_label: 'ký hiệu',
      pos_detail_label: 'dấu chấm câu',
      pos_label: 'ký hiệu',
      pos_group: 'symbol',
    });
    expect(
      word?.example_tokens?.find((token) => token.surface === 'し'),
    ).toMatchObject({
      pos_label: 'động từ',
      pos_group: 'verb',
      part_of_speech: 'động từ',
    });
    expect(
      word?.example_tokens?.find((token) => token.surface === 'て'),
    ).toMatchObject({
      pos_label: 'trợ từ',
      pos_group: 'particle',
      part_of_speech: 'trợ từ',
    });
    expect(
      word?.example_tokens?.find((token) => token.surface === 'ます'),
    ).toMatchObject({
      pos_label: 'trợ động từ',
      pos_group: 'auxiliary',
      part_of_speech: 'trợ động từ',
    });
  });

  it('translates raw POS details for frontend display', () => {
    const insertResult = db
      .prepare(
        `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run('ん', 'ん', 'n', '', '', 'danh từ', 'ん', '');
    const wordId = Number(insertResult.lastInsertRowid);

    (
      service as unknown as {
        japaneseTokenizer: {
          tokenize: (sentence: string) => unknown[];
        };
      }
    ).japaneseTokenizer = {
      tokenize: jest.fn().mockReturnValue([
        {
          surface_form: 'ん',
          word_position: 1,
          pos: '名詞',
          pos_detail_1: '非自立',
          pos_detail_2: '一般',
          basic_form: 'ん',
          reading: 'ン',
        },
      ]),
    };

    expect(service.getWordById(wordId)?.example_tokens?.[0]).toMatchObject({
      surface: 'ん',
      basic_form: 'ん',
      pos_raw: '名詞',
      pos_detail: '非自立 / 一般',
      pos_raw_label: 'danh từ',
      pos_detail_label: 'không độc lập / thường',
      part_of_speech: 'danh từ',
      pos_group: 'noun',
    });
  });

  it('returns example token annotations from search and favorites', () => {
    const insertResult = db
      .prepare(
        `
      INSERT INTO words (kanji, kana, romaji, meaning_vi, meaning_en, part_of_speech, example_sentence, example_meaning_vi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        '放送',
        'ほうそう',
        'housou',
        'phát sóng',
        'broadcast',
        'danh từ',
        '放送します。',
        'Phát sóng.',
      );
    const wordId = Number(insertResult.lastInsertRowid);

    (
      service as unknown as {
        japaneseTokenizer: {
          tokenize: (sentence: string) => unknown[];
        };
      }
    ).japaneseTokenizer = {
      tokenize: jest.fn().mockReturnValue([
        {
          surface_form: '放送',
          word_position: 1,
          pos: '名詞',
          pos_detail_1: 'サ変接続',
          basic_form: '放送',
          reading: 'ホウソウ',
        },
        {
          surface_form: 'し',
          word_position: 3,
          pos: '動詞',
          pos_detail_1: '自立',
          basic_form: 'する',
          reading: 'シ',
        },
        {
          surface_form: 'ます',
          word_position: 4,
          pos: '助動詞',
          pos_detail_1: '*',
          basic_form: 'ます',
          reading: 'マス',
        },
        {
          surface_form: '。',
          word_position: 6,
          pos: '記号',
          pos_detail_1: '句点',
          basic_form: '。',
          reading: '。',
        },
      ]),
    };

    expect(service.searchWords('放送')[0].example_tokens?.[0]).toMatchObject({
      surface: '放送',
      pos_label: 'danh từ',
      reading: 'ほうそう',
    });

    service.addFavorite(wordId);

    expect(service.getFavorites()[0].example_tokens?.[0]).toMatchObject({
      surface: '放送',
      pos_label: 'danh từ',
      reading: 'ほうそう',
    });
  });

  it('adds, reads, and removes favorites', () => {
    expect(service.addFavorite(1)).toMatchObject({ word_id: 1 });
    expect(service.isFavorite(1)).toBe(true);
    expect(service.removeFavorite(1)).toBe(true);
    expect(service.isFavorite(1)).toBe(false);
  });

  it('returns kanji records with the stored radical data', () => {
    expect(service.getKanji('日')).toMatchObject({
      kanji: '日',
      radical: '日',
      radical_element: '日',
      radical_original: '',
      radical_meaning: 'mặt trời',
    });
  });

  it('reads radical element and original from the radical group in kanjivg svg', () => {
    const svg = `
      <svg>
        <g id="kvg:06d77" kvg:element="海"></g>
        <g id="kvg:06d77-g1" kvg:element="氵" kvg:variant="true" kvg:original="水" kvg:position="left" kvg:radical="general"></g>
      </svg>
    `;

    expect(
      (
        service as unknown as {
          extractKanjiVGMetadata: (
            svgText: string,
            codePoint?: string,
          ) => { element?: string; original?: string };
        }
      ).extractKanjiVGMetadata(svg, '06d77'),
    ).toEqual({
      element: '氵',
      original: '水',
    });
  });
});
