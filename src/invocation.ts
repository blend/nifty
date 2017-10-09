import { Client, QueryResult } from "pg";
import { Columns } from "./columns";
import { ColumnsFor } from "./metacache";
import { DatabaseMapped, Populatable } from "./interfaces";

export interface InvocationConfig {
  Client: Client;
}

export class Invocation {
  Connection: Client;

  // Exec runs a given statement and returns an error. 
  public async Exec(statement: string): Promise<Error | null> {
    try {
      await this.Connection.query(statement);
    } catch (e) {
      return e
    }
    return null;
  }

  // Query runs a given query with a given set of arguments, and returns a bound result.
  public async Query(statement: string, ...args: any[]) { }

  public async Begin(): Promise<Error | null> {
    try {
      await this.Connection.query("BEGIN");
    } catch (e) {
      return e;
    }
    return null;
  }

  public async Commit(): Promise<Error | null> {
    try {
      await this.Connection.query("COMMIT");
    } catch (e) {
      return e;
    }
    return null;
  }

  public async Rollback(): Promise<Error | null> {
    try {
      await this.Connection.query("ROLLBACK");
    } catch (e) {
      return e;
    }
    return null;
  }

  public async Get<T extends DatabaseMapped>(...ids: any[]): Promise<T | Error> {
    // WCTODO: have a real ctor pattern here / ctor cache.
    // Makes me long for `Expression.Lambda<Func<T>>(Expression.New(typeof(T))).Compile();`
    let ref: T = {} as T; // HACK ALERT.

    let tableName = ref.TableName();
    let cols = ColumnsFor(tableName);
    let readCols = cols.NotReadOnly(); // these actually exist on the table.
    let pks = cols.PrimaryKey();
    if (pks.Len() == 0) {
      return new Error("invalid type; no primary keys");
    }

    let tokens = pks.Tokens();

    let columnNames = readCols.ColumnNames().join(",");

    let queryBody = `SELECT ${columnNames} FROM ${tableName} WHERE `;

    // loop over the pks, add the tokens etc.
    for (var i = 0; i < pks.Len(); i++) {
      var pk = pks.All[i];

      queryBody = queryBody + pk.Name + " = " + `${i + 1}`;

      if (i < pks.Len() - 1) {
        queryBody = queryBody + " AND ";
      }
    }

    try {
      let res = await this.Connection.query(queryBody, ids);
      for (var col of readCols.All) {
        col.Set(ref, res.rows[0][col.Name]);
      }
    } catch (e) {
      return e;
    }

    return ref;
  }

  // GetAll returns all instances of T in it's respective table as an array.
  public async GetAll<T>(): Promise<Array<T> | Error> {
    // build query
    // execute query
    // loop over results, bind each to a new object, add to the array.
    // hope whoever created T knew to implement populate.
    return new Array<T>();
  }

  // Create inserts the object into the db.
  public async Create(obj: DatabaseMapped): Promise<Error | null> {
    const tableName = obj.TableName();
    const cols = ColumnsFor(tableName);
    const writeCols = cols.NotReadOnly().NotSerial();
    const serials = cols.Serial();

    const colNames = writeCols.ColumnNames().join(",");
    const colValues = writeCols.ColumnValues(obj);
    const tokens = writeCols.Tokens().join(",");

    let queryBody = `INSERT INTO ${tableName} (${colNames}) VALUES (${tokens})`;

    if (serials.Len() > 0) {
      queryBody = queryBody + ` RETURNING ${serials.First().Name}`;
    }

    let res = await this.Connection.query(queryBody, colValues);
    if (serials.Len() > 0) {
      let serial = serials.First();
      serial.Set(obj, res.rows[0][serial.Name]);
    }

    return null;
  }

  // CreateMany inserts multiple objects at once.
  public async CreateMany<T>(objs: T[]) { }

  public async Update<T>(obj: T) { }

  // Upsert creates an object if it doesn't exit, otherwise it updates it.
  public async Upsert<T>(obj: T) { }

  // Delete deletes a given object.
  public async Delete<T>(obj: T) { }

  // Truncate deletes *all* rows of a table, using the truncate command.
  public async Truncate<T>(obj: T) { }
}
