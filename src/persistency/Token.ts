export type TokenType = 'name' | 'number' | 'string' | 'section' | 'brace' | 'semicolon';

export interface Token {
  whitespace: string;
  text: string;
  type: TokenType;
}
