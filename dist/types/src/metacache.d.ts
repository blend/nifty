import { Columns } from './columns';
import { ColumnInfo } from './column_info';
export declare function addModel(className: string, tableName: string): void;
export declare function addModelColumn(className: string, column: ColumnInfo): void;
export declare function tableNameFor(className: string): string;
export declare function columnsFor(className: string): Columns;
