import { Pool, Client } from 'pg';

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

	public Close() {

	}
}