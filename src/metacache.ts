import { Columns } from './columns';
import { ColumnInfo } from './column_info';

const __tablenames = new Map<string, string>();
const __metacache = new Map<string, Columns>();

export function addModel(className: string, tableName: string) {
  if (!__tablenames.has(className)) {
    __tablenames.set(className, tableName);
  }
}

export function addModelColumn(className: string, column: ColumnInfo) {
  if (!__metacache.has(className)) {
    __metacache.set(className, new Columns().add(column));
    return;
  }

  const columns = __metacache.get(className);
  if (!!columns) {
    columns.add(column);
  }
}

export function tableNameFor(className: string): string {
  let cachedName = __tablenames.get(className);
  if (!!cachedName) {
    return cachedName;
  }
  return className;
}

export function columnsFor(className: string): Columns {
  let cols = __metacache.get(className);
  if (!!cols) {
    return cols;
  }
  return new Columns();
}
