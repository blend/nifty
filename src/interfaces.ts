export interface Populatable {
  Populate(): void;
}

export interface DatabaseMapped {
  TableName(): string;
}
