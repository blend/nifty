export interface Populatable {
  Populate(): void;
}

export interface DatabaseMapped {
  new (): any;
  TableName(): string;
}
