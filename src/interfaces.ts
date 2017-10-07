interface Populatable {
  Populate(): void;
}

interface DatabaseMapped {
  TableName(): string;
}
