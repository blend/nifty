import { Pool } from "pg";
import { Invocation } from "./invocation";
import { DatabaseMapped } from "./interfaces";
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
    Get<T extends DatabaseMapped>(...ids: any[]): Promise<T | Error>;
    GetAll<T extends DatabaseMapped>(): Promise<Array<T> | Error>;
    Create(obj: DatabaseMapped): Promise<Error | null>;
}
