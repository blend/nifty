import { Client, QueryResult } from 'pg';
import { Columns } from './columns';
import { tableNameFor, columnsFor } from './metacache';

export class Query {
  results: QueryResult;

  public out<T>(typeDef: { new(): T; }): T {
    let ref: T = new typeDef()
    const className = ref.constructor.name
    let cols = columnsFor(className);
    let readCols = cols.notReadOnly(); // these actually exist on the table.
    for (var col of readCols.all) {
      col.set(ref, this.results.rows[0][col.name]);
    }
    return ref;
  }

  public outMany<T>(): Promise<T[]> {
    throw new Error('not implemented');
  }

  public scan(...values: any[]): Promise<null> {
    throw new Error('not implemented');
  }
}
