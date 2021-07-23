/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'fs';
import path from 'path';
import { Domain, Reader, Writer } from '../../src';
import { Value } from '../../src/model/Value';
import { Constants } from '../../src/persistency/Constants';

describe('Conversion for TRUMPF TMTs for K02 to K08', () => {
  const dataDir = path.join(__dirname, '..', 'data', 'trumpf-conversion-source');
  const dumpDir = path.join(__dirname, '..', 'dump', 'trumpf-conversion-source');
  fs.mkdirSync(dumpDir, { recursive: true });
  const tmts = fs.readdirSync(dataDir).filter((f) => f.toLowerCase().endsWith('.tmt'));

  let domainsToOverwrite: Domain[] = [];

  const lttIndexBySectionName: Record<string, number> = {
    LAS_ANFA_LIN: 11,
    LAS_ANFA_ARC: 14,
    LAS_SCHN_LIN: 12,
    LAS_SCHN_ARC: 15,
  };
  const ruleIndexBySectionName: Record<string, number> = {
    LAS_ANFA_LIN: 12,
    LAS_ANFA_ARC: 15,
    LAS_SCHN_LIN: 13,
    LAS_SCHN_ARC: 16,
  };
  const lttReplacements: Record<string, string> = {
    'T2D-8172O2': 'ST030MD0-O2S0-20-2:TC43-FW-4000-0-99999-3-1.0038-1-0-1-0-170',
    'T2D-8169N2': 'ST030MD0-O2S0-20-2:TC43-FW-4000-0-99999-3-1.0038-1-0-1-0-170',
  };
  const ruleReplacements: Record<string, string> = {
    'T2D-8172O2-5': 'ST030MD0-O2S0-20-2:TC43-FW-4000-4000-0-99999-3-1.0038-1-0-1-0-170:1',
    'KT2D-8169N2-1': 'ST030MD0-O2S0-20-2:TC43-FW-4000-4000-0-99999-3-1.0038-1-0-1-0-170:1',
  };

  function getContainedLttsAndRules(domains: Domain[]): { ltts: string[]; rules: string[] } {
    const technology = domains.find((d) => d.name === 'Technologie');
    if (!technology) throw new Error('Missing domain "Technologie"');
    const ltts = new Set<string>();
    const rules = new Set<string>();
    technology.sections.forEach((s) => {
      const lttIndex = lttIndexBySectionName[s.name];
      const ruleIndex = ruleIndexBySectionName[s.name];
      if (lttIndex !== undefined) s.values?.forEach((v) => v[lttIndex]?.value && ltts.add(v[lttIndex].value as string));
      if (ruleIndex !== undefined) s.values?.forEach((v) => v[ruleIndex]?.value && rules.add(v[ruleIndex].value as string));
    });
    return { ltts: [...ltts], rules: [...rules] };
  }

  function replaceLttAndRules(values?: Value[][]): boolean {
    values?.forEach((vv) =>
      vv.forEach((v) => {
        if (typeof v.value === 'string') {
          const lttReplacement = lttReplacements[v.value];
          if (lttReplacement) {
            v.value = lttReplacement;
          } else {
            const ruleReplacement = ruleReplacements[v.value];
            if (ruleReplacement) {
              v.value = ruleReplacement;
            }
          }
        }
      })
    );
    return true; // Return true to allow chaining with `&&`.
  }

  before(async () => {
    const tmt = await fs.promises.readFile(path.join(dataDir, 'tmt.domain.overwrites'), 'latin1');
    domainsToOverwrite = new Reader(tmt).readGeneric().domains ?? [];
  });

  tmts.forEach((fileName) =>
    it(`should convert '${fileName}'`, async () => {
      const tmt = await fs.promises.readFile(path.join(dataDir, fileName), 'latin1');
      const reader = new Reader(tmt, [...Constants.RawSections, 'SOCKELSTAPELGUT']).read(); // Note, SOCKELSTAPELGUT contains a GEO file!

      const header = reader.header;
      if (!header) throw new Error('No header read from TMT');
      const domains = reader.domains;
      if (!domains) throw new Error('No domains read from TMT');

      // Replace machine, etc.
      domains.forEach((d, i) => {
        const replacement = domainsToOverwrite.find((o) => o.name === d.name);
        if (replacement) {
          domains[i] = replacement;
        }
      });

      // Replace LTTs and Rules
      const { ltts, rules } = getContainedLttsAndRules(domains);
      const unknownLtts = ltts.filter((ltt) => !lttReplacements[ltt]);
      const unknownRules = rules.filter((rule) => !ruleReplacements[rule]);
      if (unknownLtts.length || unknownRules.length) {
        throw new Error(`Unknown LTTs [${unknownLtts.join(', ')}] and/or unknown rules [${unknownRules.join(', ')}]`);
      }
      domains.forEach((d) => replaceLttAndRules(d.values) && d.sections.forEach((s) => replaceLttAndRules(s.values)));

      const written = Writer.write(header, domains);

      await fs.promises.writeFile(path.join(dumpDir, fileName), written, { encoding: 'latin1' });
    })
  );
});
