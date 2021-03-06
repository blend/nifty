import { Connection } from '../src/connection';
import { Table, Column } from '../src/decorators';

// MetadataTest is a class the implements database mapped.
@Table('metadata_test')
class MetadataTest {
	@Column('id', { PrimaryKey: true, Serial: true })
	ID: number;

	@Column('name')
	Name: string;
}

async function migrate(conn: Connection) {
	console.log('creating metadata table');
	let result = await conn.exec(
		'CREATE TABLE IF NOT EXISTS metadata_test (id serial not null, name varchar(255))'
	);
	console.log('creating metadata table complete');

}

async function main() {
	const conn = new Connection();
	conn.open();
	await migrate(conn);

	console.log('creating object');
	let md = new MetadataTest();
	md.Name = 'foo';
	await conn.create(md);
	console.log('creating object complete');
	console.log('created', md, md.ID);

	let verify = await conn.get(MetadataTest, md.ID);
	console.log(verify);
}
main();
