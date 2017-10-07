import { Client, QueryResult } from "pg";

function ColumnAttr(target: DatabaseMapped, propertyKey: string | symbol) {
  console.log("prop", target.TableName(), propertyKey);
}

interface DatabaseMapped {
  TableName(): string;
}

class MetadataTest implements DatabaseMapped {
  @ColumnAttr public ID: number;
  @ColumnAttr public Name: string;

  public TableName(): string {
    return "metadata_test";
  }
}

async function query(client: Client, queryBody: string): Promise<QueryResult> {
  await client.connect();
  const res = await client.query(queryBody);
  await client.end();
  return res;
}

async function main() {
  const client = new Client({});
  const res = await query(client, "select 'ok!' as result");
  console.log(res.rows[0].result);
}
main();
