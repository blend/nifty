import { Pool } from "pg";
import { Invocation } from "./invocation";
import { Query } from "./query";
export declare class Connection {
    Host: string;
    Port: number;
    Database: string;
    Schema: string;
    Username: string;
    Password: string;
    SSLMode: string;
    Pool: Pool;
    Open(): void;
    Invoke(): Promise<Invocation>;
    Exec(statement: string): Promise<Error | null>;
    Query(statement: string, ...args: any[]): Promise<Query>;
    Get<T>(typeDef: {
        new (): T;
    }, ...ids: any[]): Promise<T | Error>;
    GetAll<T>(typeDef: {
        new (): T;
    }): Promise<Array<T> | Error>;
    Create(obj: any): Promise<Error | null>;
    CreateMany(...objs: any[]): Promise<Error | null>;
    Update(obj: any): Promise<Error | null>;
    Delete(obj: any): Promise<Error | null>;
    Truncate<T>(typeDef: {
        new (): T;
    }): Promise<Error | null>;
}
