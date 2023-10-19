// Note, SOCKELSTAPELGUT contains a GEO file! T2_MN_BER_SCX contains comment
export const defaultRawSections = ['DB_GEO', 'PROZESS_PARAMETER', 'SCRAP_AREA_GEO', 'SOCKELSTAPELGUT', 'T2_MN_BER_SCX', 'T1_REMAINDER_SHEETS'];

export const Constants = {
  WhiteSpace: /\s/,
  NumberStart: /[-+0-9]/,
  NumberChar: /[-+0-9.p]/,
  NameChar: /[0-9.A-Za-z_]/,
  OpeningBrace: '{',
  ClosingBrace: '}',
  Semicolon: ';',
  SectionStart: '[',
  SectionEnd: ']',
  StringDelimiter: '"',
  Domain: 'bereich',
  Header: 'Kopf',
  RawSections: defaultRawSections,
  EndOfFile: 'end_of_file',
};
