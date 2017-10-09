import { Pool, PoolConfig, Client } from "pg";
import { Invocation } from "./invocation";

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

	// Run returns a new context.
	public async Invoke(): Promise<Invocation> {
		const inv = new Invocation();
		inv.Client = await this.Pool.connect()
		return inv;
	}
}
