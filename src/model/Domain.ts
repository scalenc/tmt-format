import { Section } from './Section';
import { Value } from './Value';

export interface Domain {
  name: string;
  values?: Value[][];
  sections: Section[];
  endWhitespaces?: string;
}
