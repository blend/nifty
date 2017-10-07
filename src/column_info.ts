export class ColumnInfo {
  Name: string;
  Field: string;
  IsPrimaryKey: boolean;
  IsSerial: boolean;
  IsReadOnly: boolean;

  Get: (instance: any) => any;
  Set: (instance: any, value: any) => void;
}
