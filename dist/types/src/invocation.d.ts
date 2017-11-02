import { Client } from 'pg';
import { Query } from './query';
export interface InvocationConfig {
    client: Client;
}
export declare class Invocation {
    connection: Client;
    constructor(config?: InvocationConfig);
    exec(statement: string, ...args: any[]): Promise<void>;
    query(statement: string, ...args: any[]): Promise<Query>;
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
    get<T>(typeDef: {
        new (): T;
    }, ...ids: any[]): Promise<T>;
    getAll<T>(typeDef: {
        new (): T;
    }): Promise<Array<T>>;
    create(obj: any): Promise<void>;
    createMany(objs: any[]): Promise<void>;
    update<T>(obj: T): Promise<void>;
    upsert<T>(obj: T): Promise<void>;
    delete(obj: any): Promise<void>;
    truncate<T>(typeDef: {
        new (): T;
    }): Promise<void>;
}
