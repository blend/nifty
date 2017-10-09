import { DatabaseMapped } from "./interfaces";
import { Columns } from "./columns";
import { ColumnInfo } from "./column_info";

const __ctorcache = new Map<string, () => any>()
const __tablenames = new Map<string, string>()
const __metacache = new Map<string, Columns>()

export function AddModel(tableName: string, className: string, ctor: () => any) {
	if (!__tablenames.has(className)) {
		__tablenames.set(className, tableName)
	}
	if (!__ctorcache.has(className)) {
		__ctorcache.set(className, ctor);
	}
}

export function AddModelColumn(target: DatabaseMapped, column: ColumnInfo) {
	const tableName = target.TableName();
	if (!__metacache.has(tableName)) {
		__metacache.set(tableName, new Columns().Add(column));
	}

	const columns = __metacache.get(tableName);
	if (!!columns) {
		columns.Add(column);
	}
}

export function TableNameFor(className: string): string | undefined {
	return __tablenames.get(className)
}

export function CreateNew(className: string): any | undefined {
	let ctor = __ctorcache.get(className)
	if (!!ctor) {
		return ctor()
	}
	return
}

export function ColumnsFor(tableName: string): Columns {
	let cols = __metacache.get(tableName);
	if (!!cols) {
		return cols;
	}
	return new Columns();
}
