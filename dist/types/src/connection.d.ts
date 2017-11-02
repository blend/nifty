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
    minPoolSize?: number;
    maxPoolSize?: number;
}
export declare class Connection {
    host: string;
    port: number;
    database: string;
    schema: string;
    username: string;
    password: string;
    sslMode: string;
    minPoolSize: number | undefined;
    maxPoolSize: number | undefined;
    pool: Pool;
    constructor(opts?: ConnectionConfig);
    open(): Pool;
    invoke(): Promise<Invocation>;
    exec(statement: string): Promise<void>;
    query(statement: string, ...args: any[]): Promise<Query>;
    get<T>(typeDef: {
        new (): T;
    }, ...ids: any[]): Promise<T>;
    getAll<T>(typeDef: {
        new (): T;
    }): Promise<Array<T>>;
    create(obj: any): Promise<void>;
    createMany(objs: any[]): Promise<void>;
    update(obj: any): Promise<void>;
    delete(obj: any): Promise<void>;
    truncate<T>(typeDef: {
        new (): T;
    }): Promise<void>;
    inTx(txFn: (inv: Invocation) => Promise<any>): Promise<any>;
}
