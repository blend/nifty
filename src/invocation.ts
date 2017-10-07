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

  public async Get<T>(id: any) {}
  public async GetAll<T>() {}
  public async Create(obj: DatabaseMapped) {
    const tableName = obj.TableName();
    const cols = ColumnsFor(tableName);
    const writeCols = cols.NotReadOnly().NotSerial();
    const serials = cols.Serial();

    const colNames = writeCols.ColumnNames().join(",");
    const colValues = writeCols.ColumnValues(obj);

    let queryBody = `INSERT INTO ${tableName} (${colNames}) VALUES (${tokens})`;
  }
  public async CreateMany<T>(objs: T[]) {}
  public async Update<T>(obj: T) {}
  public async Upsert<T>(obj: T) {}
  public async Delete<T>(obj: T) {}
}
