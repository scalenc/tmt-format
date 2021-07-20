import { Constants } from './Constants';
import { Token } from './Token';

export class Parser {
  private pos: number;

  public get isOk(): boolean {
    return this.pos < this.source.length;
  }

  public get isAtLineEnd(): boolean {
    return this.char === '\r' || this.char === '\n';
  }

  public token: Token | null = null;
  public char: string | null = null;
  public lineNumber: number;

  public constructor(private source: string) {
    this.pos = -1;
    this.lineNumber = 1;
    this.readNextChar();
  }

  public readRaw(): string {
    this.assert(this.isAtLineEnd, `Expected to be at end of line before reading raw section`);
    this.readNextChar();

    const i0 = this.pos;
    while (this.char && this.char !== Constants.SectionStart && this.char !== Constants.ClosingBrace) {
      this.skipLine();
    }
    return this.source.substring(i0, this.pos);
  }

  public read(): boolean {
    const whitespace = this.readWhile(Constants.WhiteSpace);
    switch (this.char) {
      case null:
      case undefined:
        this.token = null;
        return false;

      case Constants.OpeningBrace:
      case Constants.ClosingBrace:
        this.token = { whitespace, type: 'brace', text: this.char };
        this.readNextChar();
        return true;

      case Constants.Semicolon:
        this.token = { whitespace, type: 'semicolon', text: this.char };
        this.readNextChar();
        return true;

      case Constants.SectionStart:
        this.readNextChar();
        this.token = { whitespace, type: 'section', text: this.readUntil(Constants.SectionEnd) };
        this.assert(this.char === Constants.SectionEnd, `Expected end of section`);
        this.readNextChar();
        return true;

      case Constants.StringDelimiter:
        this.readNextChar();
        this.token = { whitespace, type: 'string', text: this.readUntil(Constants.StringDelimiter) };
        this.assert(this.char === Constants.StringDelimiter, `Expected end of string`);
        this.readNextChar();
        return true;

      default:
        if (Constants.NumberStart.test(this.char)) {
          this.token = { whitespace, type: 'number', text: this.readWhile(Constants.NumberChar) };
          return true;
        } else {
          this.token = { whitespace, type: 'name', text: this.readWhile(Constants.NameChar) };
          this.assert(this.token.text !== '', `Expected name but found end of file or unknown character`);
          return true;
        }
    }
  }

  private readWhile(pattern: RegExp): string {
    const i0 = this.pos;
    while (this.char && pattern.test(this.char)) {
      this.readNextChar();
    }
    return this.source.substring(i0, this.pos);
  }

  private readUntil(delimiter: string): string {
    const i0 = this.pos;
    while (this.char && this.char !== delimiter) {
      this.readNextChar();
    }
    return this.source.substring(i0, this.pos);
  }

  private skipLine() {
    while (this.char && !this.isAtLineEnd) {
      this.readNextChar();
    }
    this.readNextChar();
  }

  private readNextChar(): void {
    if (this.isOk) {
      if (++this.pos === this.source.length) {
        this.char = null;
      } else {
        let next: string | null = this.source[this.pos];

        if (this.isAtLineEnd) {
          ++this.lineNumber;
          if (this.char === '\r' && next === '\n') {
            if (++this.pos === this.source.length) {
              next = null;
            } else {
              next = this.source[this.pos];
            }
          }
        }

        this.char = next;
      }
    }
  }

  private assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(`In line ${this.lineNumber}: ${message}`);
    }
  }
}
