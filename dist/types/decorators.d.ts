import { DatabaseMapped } from "./interfaces";
export interface ColumnOptions {
    PrimaryKey?: boolean;
    Serial?: boolean;
    ReadOnly?: boolean;
}
export declare function Column(name?: string, opts?: ColumnOptions): (target: DatabaseMapped, key: string) => void;
