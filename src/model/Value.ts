export interface Value {
  value: string | number;
  whitespace?: string;
  isPointer?: boolean;
  isFloat?: boolean;
  isGeo?: boolean;
  isRaw?: boolean;
}
