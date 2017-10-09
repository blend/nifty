import { Client } from "pg";
import { Query } from "./query";
export interface InvocationConfig {
    Client: Client;
}
export declare class Invocation {
    Connection: Client;
    Exec(statement: string, ...args: any[]): Promise<Error | null>;
    Query(statement: string, ...args: any[]): Promise<Query>;
    Begin(): Promise<Error | null>;
    Commit(): Promise<Error | null>;
    Rollback(): Promise<Error | null>;
    Close(): Promise<Error | null>;
    Get<T>(typeDef: {
        new (): T;
    }, ...ids: any[]): Promise<T | Error>;
    GetAll<T>(typeDef: {
        new (): T;
    }): Promise<Array<T> | Error>;
    Create(obj: any): Promise<Error | null>;
    CreateMany(...objs: any[]): Promise<Error | null>;
    Update<T>(obj: T): Promise<Error | null>;
    Upsert<T>(obj: T): Promise<Error | null>;
    Delete(obj: any): Promise<any>;
    Truncate<T>(typeDef: {
        new (): T;
    }): Promise<Error | null>;
}
