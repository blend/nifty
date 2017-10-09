import { Pool, PoolConfig, Client, QueryResult } from "pg";
import { Invocation } from "./invocation";
import { Query } from "./query";
import { Populatable } from "./interfaces";

// Connection represents the metadata used to make the initial conneciton.
export class Connection {
	Host: string;
	Port: number;
	Database: string;
	Schema: string;
	Username: string;
	Password: string;
	SSLMode: string;

	Pool: Pool;

	// Open either returns the current pool or creates a new pool.
	public Open() {
		this.Pool = new Pool({
			host: this.Host,
			port: this.Port,
			database: this.Database,
			user: this.Username,
			password: this.Password
		});
	}

	// Invoke opens a new connection.
	// Note; it is the caller's responsibility to close the invocation.
	public async Invoke(): Promise<Invocation> {
		const inv = new Invocation();
		inv.Connection = await this.Pool.connect()
		return inv;
	}

	// Exec opens a new connection and runs a given statement.
	public async Exec(statement: string): Promise<Error | null> {
		let inv = await this.Invoke()
		try {
			return inv.Exec(statement)
		} finally {
			inv.Close()
		}
	}

	// Exec opens a new connection and runs a given statement.
	public async Query(statement: string, ...args: any[]): Promise<Query> {
		let inv = await this.Invoke()
		try {
			return inv.Query(statement, ...args)
		} finally {
			inv.Close()
		}
	}

	// Get opens a new connection and fetches a single instance by id(s).
	// note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
	public async Get<T>(typeDef: { new(): T; }, ...ids: any[]): Promise<T | Error> {
		let inv = await this.Invoke()
		try {
			return inv.Get<T>(typeDef, ...ids)
		} finally {
			inv.Close()
		}
	}

	// GetAll opens a new connection and gets all instances of a given model.
	// note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
	public async GetAll<T>(typeDef: { new(): T; }): Promise<Array<T> | Error> {
		let inv = await this.Invoke()
		try {
			return inv.GetAll<T>(typeDef)
		} finally {
			inv.Close()
		}
	}

	// Create opens a new connection and inserts the object.
	public async Create(obj: any): Promise<Error | null> {
		let inv = await this.Invoke()
		try {
			return inv.Create(obj)
		} finally {
			inv.Close()
		}
	}

	// Create opens a new connection and inserts the object.
	public async CreateMany(...objs: any[]): Promise<Error | null> {
		let inv = await this.Invoke()
		try {
			return inv.CreateMany(...objs)
		} finally {
			inv.Close()
		}
	}

	// Update opens a new connection and updates the object.
	public async Update(obj: any): Promise<Error | null> {
		let inv = await this.Invoke()
		try {
			return inv.Update(obj)
		} finally {
			inv.Close()
		}
	}

	// Delete opens a new connection and deletes a given object.
	public async Delete(obj: any): Promise<Error | null> {
		let inv = await this.Invoke()
		try {
			return inv.Delete(obj)
		} finally {
			inv.Close()
		}
	}

	// Truncate opens a new connection and truncates a table represented by a type.
	// note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
	public async Truncate<T>(typeDef: { new(): T; }): Promise<Error | null> {
		let inv = await this.Invoke()
		try {
			return inv.Truncate<T>(typeDef)
		} finally {
			inv.Close()
		}
	}
}
