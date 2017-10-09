import { QueryResult } from "pg";
export declare class Query {
    Results: QueryResult;
    Out<T>(typeDef: {
        new (): T;
    }): T;
    OutMany<T>(): Promise<T[] | Error>;
    Scan(...values: any[]): Promise<Error | null>;
}
