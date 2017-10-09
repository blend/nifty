import { Client } from "pg";
import { DatabaseMapped } from "./interfaces";
export interface InvocationConfig {
    Client: Client;
}
export declare class Invocation {
    Connection: Client;
    Exec(statement: string): Promise<Error | null>;
    Query(statement: string, ...args: any[]): Promise<void>;
    Begin(): Promise<Error | null>;
    Commit(): Promise<Error | null>;
    Rollback(): Promise<Error | null>;
    Get<T extends DatabaseMapped>(...ids: any[]): Promise<T | Error>;
    GetAll<T>(): Promise<Array<T> | Error>;
    Create(obj: DatabaseMapped): Promise<Error | null>;
    CreateMany<T>(objs: T[]): Promise<void>;
    Update<T>(obj: T): Promise<void>;
    Upsert<T>(obj: T): Promise<void>;
    Delete(obj: DatabaseMapped): Promise<any>;
    Truncate<T extends DatabaseMapped>(): Promise<Error | null>;
}
