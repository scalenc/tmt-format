import { Domain, Header, Section } from '../model';
import { Value } from '../model/Value';
import { Constants } from './Constants';

export class Writer {
  public static write(header: Header, domains: Domain[]): string {
    return `${Writer.writeHeader(header)}${Writer.writeDomains(domains)}${Constants.EndOfFile}
`;
  }

  private static writeHeader(header: Header): string {
    return `${Constants.Domain} ${Constants.Header} {
"${header.name}"
${header.date}
${header.version}
"${header.format}"
"${header.measuringSystem}"
"${header.application}"
};
`;
  }

  private static writeDomains(domains: Domain[]): string {
    return domains.map((d) => Writer.writeDomain(d)).join('');
  }

  private static writeDomain(domain: Domain): string {
    return `${Constants.Domain} ${domain.name} {${Writer.writeValues(domain.values)}
${Writer.writeSections(domain.sections)}};
`;
  }

  private static writeSections(sections: Section[]): string {
    return sections.map((s) => Writer.writeSection(s)).join('');
  }

  private static writeSection(section: Section): string {
    return `[${section.name}]${Writer.writeValues(section.values)}
${section.raw ?? ''}`;
  }

  private static writeValues(values?: Value[][]): string {
    return values ? values.map((vs) => `${vs.map((v, i) => `${v.whitespace ?? (i === 0 ? '\n' : ' ')}${Writer.writeValue(v)}`).join('')};`).join('') : '';
  }

  private static writeValue(value: Value): string {
    return typeof value.value === 'number' || value.isPointer ? `${value.value}` : `"${value.value}"`;
  }
}
