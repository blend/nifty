import { DatabaseMapped } from "./interfaces";
import { Columns } from "./columns";
import { ColumnInfo } from "./column_info";

const __metacache = new Map<string, Columns>();

export function AddModelColumn(target: DatabaseMapped, column: ColumnInfo) {
  const tableName = target.TableName();
  if (!__metacache.has(tableName)) {
    __metacache.set(tableName, new Columns().Add(column));
  }

  const columns = __metacache.get(tableName);
  if (!!columns) {
    columns.Add(column);
  }
}

export function ColumnsFor(tableName: string): Columns {
  let cols = __metacache.get(tableName);
  if (!!cols) {
    return cols;
  }
  return new Columns();
}
