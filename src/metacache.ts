import { Columns } from "./columns";
import { ColumnInfo } from "./column_info";

const __tablenames = new Map<string, string>()
const __metacache = new Map<string, Columns>()

export function AddModel(className: string, tableName: string) {
	if (!__tablenames.has(className)) {
		__tablenames.set(className, tableName)
	}
}

export function AddModelColumn(className: string, column: ColumnInfo) {
	if (!__metacache.has(className)) {
		__metacache.set(className, new Columns().Add(column));
		return
	}

	const columns = __metacache.get(className);
	if (!!columns) {
		columns.Add(column);
	}
}

export function TableNameFor(className: string): string {
	let cachedName = __tablenames.get(className)
	if (!!cachedName) {
		return cachedName
	}
	return className
}

export function ColumnsFor(className: string): Columns {
	let cols = __metacache.get(className);
	if (!!cols) {
		return cols;
	}
	return new Columns();
}
