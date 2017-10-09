import { Connection } from "../src/connection";
import { Table, Column } from "../src/decorators";

// MetadataTest is a class the implements database mapped.
@Table("metadata_test")
class MetadataTest {
	@Column("id", { PrimaryKey: true, Serial: true })
	ID: number;

	@Column("name")
	Name: string;
}

async function migrate(conn: Connection) {
	console.log("creating metadata table");
	let result = await conn.Exec(
		"CREATE TABLE IF NOT EXISTS metadata_test (id serial not null, name varchar(255))"
	);
	console.log("creating metadata table complete");

}

async function main() {
	var conn = new Connection();
	await conn.Open();
	await migrate(conn);

	console.log("creating object");
	let md = new MetadataTest();
	md.Name = "foo"
	await conn.Create(md);
	console.log("creating object complete");
	console.log("created", md, md.ID)

	// this seems anus tier but is necessary because typescript is not a real language.
	let verify = await conn.Get<MetadataTest>(MetadataTest, md.ID)
	console.log(verify)

	return
}
main();
