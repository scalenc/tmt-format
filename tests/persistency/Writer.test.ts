import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { Reader, Writer } from '../../src';

describe(Writer.name, () => {
  describe(Writer.write.name, () => {
    [
      { file: 'laser.tmt', format: 'ToPs100' },
      { file: 'punch.tmt', format: 'ToPs200' },
    ].forEach((t) =>
      it(`should write ${t.file}`, async () => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const tmt = await fs.promises.readFile(path.join(__dirname, '..', 'data', t.file), 'latin1');
        const reader = new Reader(tmt).read();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const written = Writer.write(reader.header!, reader.domains!);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.promises.mkdir(path.join(__dirname, '..', 'dump'), { recursive: true });
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.promises.writeFile(path.join(__dirname, '..', 'dump', t.file), written, { encoding: 'latin1' });
        expect(written.trim()).equals(tmt.trim().replace(/ ;/g, ';'));
      })
    );
  });
});
