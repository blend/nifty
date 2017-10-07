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

  Client: Client;
  Pool: Pool;

  // Open either returns the current pool or creates a new pool.
  public async Open() {
    if (!!this.Pool) {
      return;
    }
    await this.OpenNew();
  }

  // OpenNew creates the pool and opens the initial connection.
  public async OpenNew() {
    this.Pool = new Pool({
      host: this.Host,
      port: this.Port,
      database: this.Database,
      user: this.Username,
      password: this.Password
    });
    this.Client = await this.Pool.connect();
  }

  // Prepare creates and returns a postgres query plan for a given statement.
  // You can optionally cache this plan for re-use.
  public Prepare(statement: string) {}

  // Begin should start a transaction.
  public Begin() {}

  // Close destroys the pool and underlying connections.
  public Close() {}

  // Run returns a new context.
  public Invoke(): Invocation {
    const inv = new Invocation();
    inv.Pool = this.Pool;
    return inv;
  }
}
