// MetadataTest is a class the implements database mapped.
class MetadataTest implements DatabaseMapped {
  ID: number;
  Name: string;

  public TableName(): string {
    return "metadata_test";
  }
}

async function main() {
  var conn = new Connection();
  await conn.Open();
}
main();
