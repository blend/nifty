class ColumnInfo {
  Name: string;
  Field: string;
  IsPrimaryKey: boolean;
  IsSerial: boolean;
  IsReadOnly: boolean;

  Get: () => any;
  Set: (value: any) => void;
}
