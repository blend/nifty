import { Connection } from "./connection";
import { DatabaseMapped } from "./interfaces";

// MetadataTest is a class the implements database mapped.
class MetadataTest implements DatabaseMapped {
  ID: number;
  Name: string;

  public TableName(): string {
    return "metadata_test";
  }
}

async function migrate(conn: Connection) {
  console.log("creating metadata table");
  await conn
    .Invoke()
    .Exec(
      "CREATE TABLE IF NOT EXISTS metadata_test (id serial, name varchar(255))"
    );
}

async function main() {
  var conn = new Connection();
  await conn.Open();
  await migrate(conn);

  let md = new MetadataTest();
  await conn.Invoke().Create(md);
}
main();
