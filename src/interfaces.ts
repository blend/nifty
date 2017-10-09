import { QueryResult } from "pg";

export interface Populatable {
	Populate(rows: QueryResult): Error;
}
