import { QueryResult } from 'pg';
export declare class Query {
    results: QueryResult;
    out<T>(typeDef: {
        new (): T;
    }): T;
    outMany<T>(): Promise<T[] | Error>;
    scan(...values: any[]): Promise<Error | null>;
}
