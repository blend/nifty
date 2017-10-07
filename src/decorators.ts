import { DatabaseMapped } from "./interfaces";
import { AddModelColumn } from "./metacache";
import { ColumnInfo } from "./column_info";

// Table defines the mapping relationship between the type and a relation in the database.
function Table(name?: string) {}

// Column defines the mapping relationship between the type field and a column on a table in the database.
function Column(target: DatabaseMapped, key: string) {
  let column = new ColumnInfo();
  column.Name = key;
  column.Field = key;
  column.Get = (instance: any): any => {
    return instance[key];
  };
  column.Set = (instance: any, value: any) => {
    instance[key] = value;
  };

  AddModelColumn(target, column);
}
