export type TokenType = 'name' | 'number' | 'string' | 'section' | 'brace' | 'semicolon' | 'raw' | 'geo';

export interface Token {
  whitespace: string;
  text: string;
  type: TokenType;
}
