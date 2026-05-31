declare module 'kuromoji' {
  export interface IpadicFeatures {
    surface_form: string;
    word_position: number;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading?: string;
    pronunciation?: string;
  }

  export interface Tokenizer<T> {
    tokenize(sentence: string): T[];
  }

  export interface TokenizerBuilder<T> {
    build(
      callback: (error: Error | null, tokenizer?: Tokenizer<T>) => void,
    ): void;
  }

  export function builder<T = IpadicFeatures>(options: {
    dicPath: string;
  }): TokenizerBuilder<T>;

  const kuromoji: {
    builder: typeof builder;
  };

  export default kuromoji;
}
