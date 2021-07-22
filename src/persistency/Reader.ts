/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Domain, Header, Section } from '../model';
import { Value } from '../model/Value';
import { Constants } from './Constants';
import { Parser } from './Parser';
import { TokenType } from './Token';

export class Reader {
  private parser: Parser;

  public constructor(source: string) {
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
    const measuringSystem = this.readExpected('string');
    const application = this.readExpected('string');

    this.readExpected('brace', Constants.ClosingBrace);
    this.readExpected('semicolon', Constants.Semicolon);

    this.header = { name, date, version, format, measuringSystem, application };
    return this;
  }

  public readGeneric(rawSections: string[] = Constants.RawSections): Reader {
    while (this.parser.read() && !this.isToken('name', Constants.EndOfFile)) {
      this.readDomain(rawSections);
    }
    return this;
  }

  public readDomain(rawSections: string[] = Constants.RawSections): Reader {
    this.assert('name', Constants.Domain);
    const name = this.readExpected('name');
    this.readExpected('brace', Constants.OpeningBrace);

    const domainValues = this.readValues();

    const sections: Section[] = [];
    while (this.parser.token?.type === 'section') {
      const section = this.parser.token.text;
      if (rawSections.includes(section)) {
        const raw = this.parser.readRaw();
        sections.push({ name: section, raw });
        this.parser.read();
      } else {
        const values = this.readValues();
        sections.push({ name: section, values });
      }
    }

    this.assert('brace', Constants.ClosingBrace);
    this.readExpected('semicolon', Constants.Semicolon);

    (this.domains ?? (this.domains = [])).push({ name, sections, values: domainValues.length ? domainValues : undefined });
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
        values.pop();
        break;
      }
    }
    return values;
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
      return { whitespace: this.parser.token.whitespace, value: +this.parser.token.text };
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
