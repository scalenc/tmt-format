export const defaultRawSections: string[] = [];

export const Constants = {
  WhiteSpace: /\s/,
  CommentStart: '/*',
  CommentEnd: '*/',
  NumberStart: /[-+0-9]/,
  NumberChar: /[0-9.p]/,
  NameChar: /[0-9.A-Za-z_]/,
  RawStart: '#',
  RawEndPostfix: '_END',
  GeoStart: '#~1',
  GeoEnd: '#~EOF',
  OpeningBrace: '{',
  ClosingBrace: '}',
  Semicolon: ';',
  SectionStart: '[',
  SectionEnd: ']',
  StringDelimiter: '"',
  EscapeStringDelimiter: '\\',
  Domain: 'bereich',
  Header: 'Kopf',
  RawSections: defaultRawSections,
  EndOfFile: 'end_of_file',
  NewLine: '\r\n',
};
