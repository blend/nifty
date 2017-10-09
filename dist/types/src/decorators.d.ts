export interface ColumnOptions {
    PrimaryKey?: boolean;
    Serial?: boolean;
    ReadOnly?: boolean;
}
export declare function Column(name?: string, opts?: ColumnOptions): (target: any, key: string) => void;
export declare function Table(name?: string): (target: any) => void;
