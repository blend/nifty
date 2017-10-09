import { Client, QueryResult } from "pg";
import { Columns } from "./columns";
import { TableNameFor, ColumnsFor } from "./metacache";

export class Query {
  Connection: Client;

  public async Out<T>(): Promise<T | Error> {
    return null;
  }
  public async OutMany<T>(): Promise<T[] | Error> {
    return null;
  }

  public Scan(...values: any[]): Promise<Error | null> { }
}
