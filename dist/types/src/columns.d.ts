import { ColumnInfo } from './column_info';
export declare class Columns {
    all: Array<ColumnInfo>;
    lookup: Map<string, ColumnInfo>;
    constructor();
    add(col: ColumnInfo): Columns;
    addMany(cols: Array<ColumnInfo>): Columns;
    first(): ColumnInfo;
    len(): number;
    columnNames(): Array<string>;
    columnValues(instance: any): Array<any>;
    tokens(): Array<string>;
    primaryKey(): Columns;
    notPrimaryKey(): Columns;
    serial(): Columns;
    notSerial(): Columns;
    readOnly(): Columns;
    notReadOnly(): Columns;
    insertCols(): Columns;
    updateCols(): Columns;
}
