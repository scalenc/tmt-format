/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Domain, Header, Section } from '../model';
import { Value } from '../model/Value';
import { Constants } from './Constants';
import { Parser } from './Parser';
import { TokenType } from './Token';

export class Reader {
  private parser: Parser;

  public constructor(source: string, private rawSections = Constants.RawSections) {
    this.parser = new Parser(source);
  }

  public header?: Header;
  public domains?: Domain[];

  public read(): Reader {
    this.readHeader().readGeneric();
    return this;
  }

  public readHeader(): Reader {
    this.readExpected('name', Constants.Domain);
    this.readExpected('name', Constants.Header);
    this.readExpected('brace', Constants.OpeningBrace);

    const name = this.readExpected('string');
    const date = this.readExpected('number');
    const version = this.readExpected('name');
    const format = this.readExpected('string');

    this.parser.read();
    const measuringSystem = this.skipOptional('string');
    const application = this.skipOptional('string');

    this.assert('brace', Constants.ClosingBrace);
    this.readExpected('semicolon', Constants.Semicolon);

    this.header = { name, date, version, format, measuringSystem, application };
    return this;
  }

  public readGeneric(): Reader {
    while (this.parser.read() && !this.isToken('name', Constants.EndOfFile)) {
      this.readDomain();
    }
    return this;
  }

  public readDomain(): Reader {
    this.assert('name', Constants.Domain);
    const name = this.readExpected('name');
    this.readExpected('brace', Constants.OpeningBrace);

    const domainValues = this.readValues();

    const sections: Section[] = [];
    while (this.parser.token?.type === 'section') {
      const section = this.parser.token.text;
      if (this.rawSections.includes(section)) {
        const raw = this.parser.readRaw();
        sections.push({ name: section, raw });
        this.parser.read();
      } else {
        const values = this.readValues();
        sections.push({ name: section, values });
      }
    }

    const endWhitespaces = this.parser.token?.whitespace?.trim() ? this.parser.token.whitespace : undefined;
    this.assert('brace', Constants.ClosingBrace);
    this.readExpected('semicolon', Constants.Semicolon);

    (this.domains ?? (this.domains = [])).push({ name, sections, values: domainValues.length ? domainValues : undefined, endWhitespaces });
    return this;
  }

  private readValues(): Value[][] {
    const values: Value[][] = [[]];
    while (this.parser.read()) {
      const value = this.tryGetTokenAsValue();
      if (value) {
        values[values.length - 1].push(value);
      } else if (this.isToken('semicolon', ';')) {
        values.push([]);
      } else {
        if (!values[values.length - 1].length) values.pop();
        break;
      }
    }
    return values;
  }

  private skipOptional(type: TokenType, text?: string): string | undefined {
    if (this.parser.token?.type === type && (text === undefined || text === this.parser.token.text)) {
      const text = this.parser.token.text;
      this.parser.read();
      return text;
    }
    return undefined;
  }

  private readExpected(type: TokenType, text?: string): string {
    this.parser.read();
    return this.assert(type, text);
  }

  private tryGetTokenAsValue(): Value | undefined {
    if (this.parser.token?.type === 'string') {
      return { whitespace: this.parser.token.whitespace, value: this.parser.token.text };
    }
    if (this.parser.token?.type === 'number') {
      if (this.parser.token.text.includes('p')) {
        return { whitespace: this.parser.token.whitespace, value: this.parser.token.text, isPointer: true };
      }
      return { whitespace: this.parser.token.whitespace, value: +this.parser.token.text, isFloat: this.parser.token.text.includes('.') };
    }
    if (this.parser.token?.type === 'raw') {
      return { whitespace: this.parser.token.whitespace, value: this.parser.token.text, isRaw: true };
    }
    if (this.parser.token?.type === 'geo') {
      return { whitespace: this.parser.token.whitespace, value: this.parser.token.text, isGeo: true };
    }
  }

  private isToken(type: TokenType, name: string): boolean {
    return this.parser.token?.type === type && this.parser.token.text === name;
  }

  private assert(type: TokenType, text?: string): string {
    if (!this.parser.token) {
      throw new Error(`In line ${this.parser.lineNumber}: unexpected end of file`);
    }
    if (this.parser.token.type !== type) {
      throw new Error(
        `In line ${this.parser.lineNumber}: expected token of type ${type}${text ? ` with value '${text}'` : ''} but found token of type ${
          this.parser.token.type
        } with value '${this.parser.token.text}'`
      );
    }
    if (text !== undefined && text !== this.parser.token.text) {
      throw new Error(`In line ${this.parser.lineNumber}: expected ${type} token '${text}'  but found '${this.parser.token.text}'`);
    }
    return this.parser.token.text;
  }
}
