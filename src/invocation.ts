import { Client, QueryResult } from "pg";
import { Columns } from "./columns";
import { TableNameFor, ColumnsFor } from "./metacache";
import { Populatable } from "./interfaces";

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

	// Close closes the connection.
	public async Close(): Promise<Error | null> {
		try {
			this.Connection.release()
			return null;
		} catch (e) {
			return e
		}
	}

	public async Get<T>(typeDef: { new(): T; }, ...ids: any[]): Promise<T | Error> {
		let ref: T = new typeDef()
		const className = ref.constructor.name
		let tableName = TableNameFor(className);
		let cols = ColumnsFor(className);
		let readCols = cols.NotReadOnly(); // these actually exist on the table.
		let pks = cols.PrimaryKey();

		if (pks.Len() == 0) {
			return new Error("invalid type; no primary keys");
		}

		if (pks.Len() !== ids.length) {
			return new Error("insufficient argument value count for type primary keys");
		}

		let tokens = pks.Tokens();

		let columnNames = readCols.ColumnNames().join(",");

		let queryBody = `SELECT ${columnNames} FROM ${tableName} WHERE `;

		// loop over the pks, add the tokens etc.
		for (var i = 0; i < pks.Len(); i++) {
			var pk = pks.All[i];

			queryBody = queryBody + pk.Name + " = " + `$${i + 1}`;

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
	public async GetAll<T>(typeDef: { new(): T; }): Promise<Array<T> | Error> {
		// build query
		// execute query
		// loop over results, bind each to a new object, add to the array.
		// hope whoever created T knew to implement populate.
		return new Array<T>();
	}

	// Create inserts the object into the db.
	public async Create(obj: any): Promise<Error | null> {
		const className = obj.constructor.name
		const tableName = TableNameFor(className)
		const cols = ColumnsFor(className)
		const writeCols = cols.NotReadOnly().NotSerial()
		const serials = cols.Serial()

		const colNames = writeCols.ColumnNames().join(",");
		const colValues = writeCols.ColumnValues(obj);
		const tokens = writeCols.Tokens().join(",");

		let queryBody = `INSERT INTO ${tableName} (${colNames}) VALUES (${tokens})`;

		if (serials.Len() > 0) {
			queryBody = queryBody + ` RETURNING ${serials.First().Name}`;
		}

		try {
			let res = await this.Connection.query(queryBody, colValues);
			if (serials.Len() > 0) {
				let serial = serials.First();
				serial.Set(obj, res.rows[0][serial.Name]);
			}
		} catch (e) {
			return e
		}

		return null;
	}

	// CreateMany inserts multiple objects at once.
	public async CreateMany(...objs: any[]): Promise<Error | null> { return null }

	// Update updates an object by primary key; it does not re-assign the pk value(s).
	public async Update<T>(obj: T): Promise<Error | null> { return null }

	// Upsert creates an object if it doesn't exit, otherwise it updates it.
	public async Upsert<T>(obj: T): Promise<Error | null> { return null }

	// Delete deletes a given object.
	public async Delete(obj: any) {
		const className = obj.constructor.name
		const tableName = TableNameFor(className)
		const cols = ColumnsFor(className)
		const pks = cols.PrimaryKey()

		if (pks.Len() == 0) {
			return new Error("invalid type; no primary keys");
		}

		let ids = new Array<any>()
		let queryBody = `DELETE FROM ${tableName} WHERE`
		// loop over the pks, add the tokens etc.
		for (var i = 0; i < pks.Len(); i++) {
			var pk = pks.All[i];

			queryBody = queryBody + pk.Name + " = " + `${i + 1}`;

			if (i < pks.Len() - 1) {
				queryBody = queryBody + " AND ";
			}

			ids.push(pk.Get(obj))
		}

		try {
			await this.Connection.query(queryBody, ids);
		} catch (e) {
			return e;
		}

		return null
	}

	// Truncate deletes *all* rows of a table using the truncate command.
	// If the type implements a `serial` column it will restart the identity.
	public async Truncate<T>(typeDef: { new(): T; }): Promise<Error | null> {
		let ref: T = new typeDef()
		const className = ref.constructor.name
		const tableName = TableNameFor(className)
		const cols = ColumnsFor(className)
		const serials = cols.Serial()

		let queryBody = `TRUNCATE ${tableName}`

		if (serials.Len() > 0) {
			queryBody = queryBody + " RESTART IDENTITY"
		}

		try {
			await this.Connection.query(queryBody);
		} catch (e) {
			return e;
		}
		return null
	}
}
