import { QueryResult } from 'pg';
export declare class Query {
    results: QueryResult;
    out<T>(typeDef: {
        new (): T;
    }): T;
    outMany<T>(): Promise<T[]>;
    scan(...values: any[]): Promise<null>;
}
