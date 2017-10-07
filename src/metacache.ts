import { DatabaseMapped } from "./interfaces";

const __metacache = new Map<string, Columns>();

export function AddModelColumn(target: DatabaseMapped, column: ColumnInfo) {
  const tableName = target.TableName();
  if (!__metacache.has(tableName)) {
    __metacache.set(tableName, new Columns(new Array<ColumnInfo>(column)));
  }

  const columns = __metacache.get(tableName);
  if (!!columns) {
    columns.Add(column);
  }
}

export function ColumnsFor(tableName: string): Columns | undefined {
  return __metacache.get(tableName);
}
