import { Client } from 'pg';
import { Query } from './query';
export interface InvocationConfig {
    client: Client;
}
export declare class Invocation {
    connection: Client;
    constructor(config?: InvocationConfig);
    exec(statement: string, ...args: any[]): Promise<null>;
    query(statement: string, ...args: any[]): Promise<Query>;
    begin(): Promise<null>;
    commit(): Promise<null>;
    rollback(): Promise<null>;
    close(): Promise<null>;
    get<T>(typeDef: {
        new (): T;
    }, ...ids: any[]): Promise<T>;
    getAll<T>(typeDef: {
        new (): T;
    }): Promise<Array<T>>;
    create(obj: any): Promise<null>;
    createMany(...objs: any[]): Promise<null>;
    update<T>(obj: T): Promise<null>;
    upsert<T>(obj: T): Promise<null>;
    delete(obj: any): Promise<null>;
    truncate<T>(typeDef: {
        new (): T;
    }): Promise<null>;
}
