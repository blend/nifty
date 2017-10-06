import { Pool, Client } from "pg";

// Connection represents the metadata used to make the initial conneciton.
class Connection {
  Host: string;
  Port: string;
  Database: string;
  Schema: string;
  Username: string;
  Password: string;
  SSLMode: string;

  Pool: Pool;

  // Open either returns the current pool or creates a new pool.
  public Open() {}

  // OpenNew creates the pool and opens the initial connection.
  public OpenNew() {}

  // Prepare creates and returns a postgres query plan for a given statement.
  // You can optionally cache this plan for re-use.
  public Prepare(statement: string) {}

  // Begin should start a transaction.
  public Begin() {}

  // Close destroys the pool and underlying connections.
  public Close() {}

  // Run returns a new context.
  public Run() {}
}
