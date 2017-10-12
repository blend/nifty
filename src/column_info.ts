export class ColumnInfo {
  name: string;
  field: string;
  isPrimaryKey: boolean;
  isSerial: boolean;
  isReadOnly: boolean;

  get: (instance: any) => any;
  set: (instance: any, value: any) => void;
}
