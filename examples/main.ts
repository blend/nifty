import { Connection } from "../src/connection";
import { Column } from "../src/decorators";
import { DatabaseMapped } from "../src/interfaces";

// MetadataTest is a class the implements database mapped.
class MetadataTest implements DatabaseMapped {

	@Column("id", { PrimaryKey: true, Serial: true })
	ID: number;

	@Column("name")
	Name: string;

	public TableName(): string {
		return "metadata_test";
	}
}

async function migrate(conn: Connection) {
	console.log("creating metadata table");
	let result = await conn.Exec(
		"CREATE TABLE IF NOT EXISTS metadata_test (id serial not null, name varchar(255))"
	);

}

async function main() {
	var conn = new Connection();
	await conn.Open();
	await migrate(conn);

	let md = new MetadataTest();
	await conn.Create(md);
}
main();
