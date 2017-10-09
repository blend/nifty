import { AddModel, AddModelColumn } from "./metacache";
import { ColumnInfo } from "./column_info";

export interface ColumnOptions {
	PrimaryKey?: boolean
	Serial?: boolean
	ReadOnly?: boolean
}

// Column defines the mapping relationship between the type field and a column on a table in the database.
export function Column(name?: string, opts?: ColumnOptions) {
	return function (target: any, key: string) {
		let column = new ColumnInfo();

		if (!!name) {
			column.Name = name;
		} else {
			column.Name = key;
		}

		column.Field = key;
		if (!!opts) {
			column.IsPrimaryKey = opts.PrimaryKey || false;
			column.IsSerial = opts.Serial || false;
			column.IsReadOnly = opts.ReadOnly || false;
		}

		column.Get = (instance: any): any => {
			return instance[key];
		};
		column.Set = (instance: any, value: any) => {
			instance[key] = value;
		};

		AddModelColumn(target, column);
	}
}

export function Table(name?: string) {
	return function (target: any) {
		let tableName = name || target.constructor.name
		AddModel(tableName, target.cosntructor.name, target.constructor)
	}
}