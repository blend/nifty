import { Pool, PoolConfig, Client, QueryResult } from 'pg';
import { Invocation } from './invocation';
import { Query } from './query';
import { Populatable } from './interfaces';

export interface ConnectionConfig {
  host?: string;
	port?: number;
	database?: string;
	schema?: string;
	username?: string;
	password?: string;
  sslMode?: string;
  minPoolSize?: number;
  maxPoolSize?: number;
}

// Connection represents the metadata used to make the initial conneciton.
export class Connection {
	host: string;
	port: number;
	database: string;
	schema: string;
	username: string;
	password: string;
  sslMode: string;
  minPoolSize: number | undefined; // pg defaults these
  maxPoolSize: number | undefined; // pg defaults these

  pool: Pool;

  constructor(opts?: ConnectionConfig) {
    if (opts) {
      let { host, port, database, schema, username, password, sslMode, minPoolSize, maxPoolSize } = opts;
      this.host = host || 'localhost';
      this.port = port || 5432;
      this.database = database || '';
      this.schema = schema || 'public';
      this.username = username || '';
      this.password = password || '';
      this.sslMode = sslMode || '';
      this.minPoolSize = minPoolSize;
      this.maxPoolSize = maxPoolSize;
    }
  }

	// Open either returns the current pool or creates a new pool.
	public open(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        host: this.host,
        port: this.port,
        database: this.database,
        user: this.username,
        password: this.password,
        min: this.minPoolSize,
        max: this.maxPoolSize
      });
    }
    return this.pool;
	}

	// Invoke opens a new connection.
	// Note; it is the caller's responsibility to close the invocation.
	public async invoke(): Promise<Invocation> {
		const inv = new Invocation();
		inv.connection = await this.pool.connect();
		return inv;
	}

	// Exec opens a new connection and runs a given statement.
	public async exec(statement: string): Promise<null> {
		let inv = await this.invoke()
		try {
			return inv.exec(statement);
		} catch(e) {
      throw e;
    } finally {
			inv.close();
		}
	}

	// Exec opens a new connection and runs a given statement.
	public async query(statement: string, ...args: any[]): Promise<Query> {
		let inv = await this.invoke()
		try {
			return inv.query(statement, ...args);
		} finally {
			inv.close();
		}
	}

	// Get opens a new connection and fetches a single instance by id(s).
	// note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
	public async get<T>(typeDef: { new(): T; }, ...ids: any[]): Promise<T | Error> {
		let inv = await this.invoke()
		try {
			return inv.get<T>(typeDef, ...ids);
		} catch(e) {
      throw e;
    }finally {
			inv.close();
		}
	}

	// GetAll opens a new connection and gets all instances of a given model.
	// note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
	public async getAll<T>(typeDef: { new(): T; }): Promise<Array<T>> {
		let inv = await this.invoke();
		try {
			return inv.getAll<T>(typeDef)
		} catch(e) {
      throw e;
    } finally {
			inv.close();
		}
	}

	// Create opens a new connection and inserts the object.
	public async create(obj: any): Promise<null> {
		let inv = await this.invoke()
		try {
			return inv.create(obj);
		} catch(e) {
      throw e;
    } finally {
			inv.close();
		}
	}

	// Create opens a new connection and inserts the object.
	public async createMany(objs: any[]): Promise<null> {
		let inv = await this.invoke();
		try {
			return inv.createMany(objs)
		} catch(e) {
      throw e;
    } finally {
			inv.close();
		}
	}

	// Update opens a new connection and updates the object.
	public async update(obj: any): Promise<null> {
		let inv = await this.invoke();
		try {
			return inv.update(obj)
		} finally {
			inv.close();
		}
	}

	// Delete opens a new connection and deletes a given object.
	public async delete(obj: any): Promise<null> {
		let inv = await this.invoke();
		try {
			return inv.delete(obj)
		} finally {
			inv.close();
		}
	}

	// Truncate opens a new connection and truncates a table represented by a type.
	// note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
	public async truncate<T>(typeDef: { new(): T; }): Promise<null> {
		let inv = await this.invoke();
		try {
			return inv.truncate<T>(typeDef)
		} catch(e) {
      throw e;
    } finally {
			inv.close();
		}
	}
}
