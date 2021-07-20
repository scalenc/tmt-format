import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { Reader } from '../../src';

describe(Reader.name, () => {
  describe(Reader.prototype.readHeader.name, () => {
    [
      { file: 'laser.tmt', format: 'ToPs100' },
      { file: 'punch.tmt', format: 'ToPs200' },
    ].forEach((t) => {
      it(`should read ${t.file}`, async () => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const tmt = await fs.promises.readFile(path.join(__dirname, '..', 'data', t.file), 'latin1');
        const header = new Reader(tmt).readHeader().header;
        expect(header).is.not.undefined;
        expect(header?.format).equals(t.format);
      });
    });
  });

  describe(Reader.prototype.read.name, () => {
    [
      { file: 'laser.tmt', format: 'ToPs100', domainsCount: 6 },
      { file: 'punch.tmt', format: 'ToPs200', domainsCount: 12 },
    ].forEach((t) => {
      it(`should read ${t.file}`, async () => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const tmt = await fs.promises.readFile(path.join(__dirname, '..', 'data', t.file), 'latin1');
        const reader = new Reader(tmt).read();
        const header = reader.header;
        expect(header).is.not.undefined;
        expect(header?.format).equals(t.format);
        expect(reader.domains).has.lengthOf(t.domainsCount);
      });
    });
  });
});
