import { Value } from './Value';

export interface Section {
  name: string;
  raw?: string;
  values?: Value[][];
}
