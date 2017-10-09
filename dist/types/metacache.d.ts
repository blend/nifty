import { DatabaseMapped } from "./interfaces";
import { Columns } from "./columns";
import { ColumnInfo } from "./column_info";
export declare function AddModelColumn(target: DatabaseMapped, column: ColumnInfo): void;
export declare function ColumnsFor(tableName: string): Columns;
