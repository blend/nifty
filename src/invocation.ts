import { Pool, QueryResult } from "pg";
import { Columns } from "./columns";
import { ColumnsFor } from "./metacache";
import { DatabaseMapped } from "./interfaces";

export class Invocation {
  Label: string;
  Pool: Pool;

  // Exec runs a given query and returns an error. Maybe.
  public async Exec(statement: string): Promise<QueryResult> {
    const res = await this.Pool.query(statement);
    return res;
  }

  // Query runs a given query with a given set of arguments, and returns a bound result.
  public async Query(statement: string) {}

  public async Get<T extends DatabaseMapped>(
    ref: T,
    ...ids: any[]
  ): Promise<T | Error> {
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
    return ref;
  }

  public async GetAll<T>(): Promise<Array<T> | Error> {
    return new Array<T>();
  }

  public async Create(obj: DatabaseMapped): Promise<Error | undefined> {
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

    let res = await this.Pool.query(queryBody, colValues);
    if (serials.Len() > 0) {
      let serial = serials.First();
      serial.Set(obj, res.rows[0][serial.Name]);
    }
    return;
  }

  public async CreateMany<T>(objs: T[]) {}
  public async Update<T>(obj: T) {}
  public async Upsert<T>(obj: T) {}
  public async Delete<T>(obj: T) {}
}
