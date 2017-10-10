import { Client } from "pg";
import { Query } from "./query";
export interface InvocationConfig {
    client: Client;
}
export declare class Invocation {
    connection: Client;
    exec(statement: string, ...args: any[]): Promise<Error | null>;
    query(statement: string, ...args: any[]): Promise<Query>;
    begin(): Promise<Error | null>;
    commit(): Promise<Error | null>;
    rollback(): Promise<Error | null>;
    close(): Promise<Error | null>;
    get<T>(typeDef: {
        new (): T;
    }, ...ids: any[]): Promise<T | Error>;
    getAll<T>(typeDef: {
        new (): T;
    }): Promise<Array<T> | Error>;
    create(obj: any): Promise<Error | null>;
    createMany(...objs: any[]): Promise<Error | null>;
    update<T>(obj: T): Promise<Error | null>;
    upsert<T>(obj: T): Promise<Error | null>;
    delete(obj: any): Promise<any>;
    truncate<T>(typeDef: {
        new (): T;
    }): Promise<Error | null>;
}
