import { addModel, addModelColumn } from './metacache';
import { ColumnInfo } from './column_info';

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
			column.name = name;
		} else {
			column.name = key;
		}

		column.field = key;
		if (!!opts) {
			column.isPrimaryKey = opts.PrimaryKey || false;
			column.isSerial = opts.Serial || false;
			column.isReadOnly = opts.ReadOnly || false;
		}

		column.get = (instance: any): any => {
			return instance[key];
		};
		column.set = (instance: any, value: any) => {
			instance[key] = value;
		};

		addModelColumn(target.constructor.name, column);
	}
}

export function Table(name?: string) {
	return function (target: any) {
		let tableName = name || target.name
		addModel(target.name, tableName)
	}
}