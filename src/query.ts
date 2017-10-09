import { Client, QueryResult } from "pg";
import { Columns } from "./columns";
import { TableNameFor, ColumnsFor } from "./metacache";

export class Query {
  Results: QueryResult;

  public Out<T>(typeDef: { new(): T; }): T {
    let ref: T = new typeDef()
    const className = ref.constructor.name
    let cols = ColumnsFor(className);
    let readCols = cols.NotReadOnly(); // these actually exist on the table.
    for (var col of readCols.All) {
      col.Set(ref, this.Results.rows[0][col.Name]);
    }
    return ref;
  }

  public OutMany<T>(): Promise<T[] | Error> {
    throw new Error('not implemented');
  }

  public Scan(...values: any[]): Promise<Error | null> {
    throw new Error('not implemented');
  }
}
