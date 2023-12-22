import { Domain, Header, Section, Value } from '../model';
import { Constants } from './Constants';

export class Writer {
  public static write(header: Header, domains: Domain[]): string {
    return `${Writer.writeHeader(header)}${Writer.writeDomains(domains)}${Constants.EndOfFile}${Constants.NewLine}`;
  }

  private static writeHeader(header: Header): string {
    return [
      `${Constants.Domain} ${Constants.Header} {`,
      `"${header.name}"`,
      `${header.date}`,
      `${header.version}`,
      `"${header.format}"`,
      `${header.measuringSystem === undefined ? '' : `"${header.measuringSystem}"`}`,
      `${header.application === undefined ? '' : `"${header.application}"`}`,
      `};`,
      ``,
    ].join(Constants.NewLine);
  }

  private static writeDomains(domains: Domain[]): string {
    return domains.map((d) => Writer.writeDomain(d)).join('');
  }

  private static writeDomain(domain: Domain): string {
    return [
      `${Constants.Domain} ${domain.name} {${Writer.writeValues(domain.values)}`,
      `${Writer.writeSections(domain.sections)}${domain.endWhitespaces?.trimStart() ?? ''}};`,
      ``,
    ].join(Constants.NewLine);
  }

  private static writeSections(sections: Section[]): string {
    return sections.map((s) => Writer.writeSection(s)).join('');
  }

  private static writeSection(section: Section): string {
    return [`[${section.name}]${Writer.writeValues(section.values)}`, `${section.raw ?? ''}`].join(Constants.NewLine);
  }

  private static writeValues(values?: Value[][]): string {
    if (!values) return '';
    return values
      .map((vs) => {
        const s = `${vs.map((v, i) => `${v.whitespace ?? (i === 0 || v.isGeo || v.isRaw ? Constants.NewLine : ' ')}${Writer.writeValue(v)}`).join('')}`;
        return vs[vs.length - 1]?.isGeo || vs[vs.length - 1]?.isRaw ? s.trimEnd() : `${s};`;
      })
      .join('');
  }

  private static writeValue(value: Value): string {
    if (value.isGeo || value.isRaw) return value.value as string;
    if (value.isPointer) return value.value as string;
    if (value.isFloat) return value.value.toLocaleString('en-US', { useGrouping: false, minimumFractionDigits: 9 });
    if (typeof value.value === 'number') return `${value.value}`;
    return `"${value.value}"`;
  }
}
