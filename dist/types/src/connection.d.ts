import { Pool } from 'pg';
import { Invocation } from './invocation';
import { Query } from './query';
export interface ConnectionConfig {
    host?: string;
    port?: number;
    database?: string;
    schema?: string;
    username?: string;
    password?: string;
    sslMode?: string;
}
export declare class Connection {
    host: string;
    port: number;
    database: string;
    schema: string;
    username: string;
    password: string;
    sslMode: string;
    pool: Pool;
    constructor(opts?: ConnectionConfig);
    open(): void;
    invoke(): Promise<Invocation>;
    exec(statement: string): Promise<Error | null>;
    query(statement: string, ...args: any[]): Promise<Query>;
    get<T>(typeDef: {
        new (): T;
    }, ...ids: any[]): Promise<T | Error>;
    getAll<T>(typeDef: {
        new (): T;
    }): Promise<Array<T> | Error>;
    create(obj: any): Promise<Error | null>;
    createMany(...objs: any[]): Promise<Error | null>;
    update(obj: any): Promise<Error | null>;
    delete(obj: any): Promise<Error | null>;
    truncate<T>(typeDef: {
        new (): T;
    }): Promise<Error | null>;
}
