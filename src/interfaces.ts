import { QueryResult } from "pg";

export interface Populatable {
	Populate(rows: QueryResult): Error;
}

export interface DatabaseMapped {
	TableName(): string;
}
