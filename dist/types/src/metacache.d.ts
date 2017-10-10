import { Columns } from './columns';
import { ColumnInfo } from './column_info';
export declare function AddModel(className: string, tableName: string): void;
export declare function AddModelColumn(className: string, column: ColumnInfo): void;
export declare function TableNameFor(className: string): string;
export declare function ColumnsFor(className: string): Columns;
