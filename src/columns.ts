import { ColumnInfo } from './column_info';

export class Columns {
	public all: Array<ColumnInfo>;
	public lookup: Map<string, ColumnInfo>;

	constructor() {
		this.all = new Array<ColumnInfo>();
		this.lookup = new Map<string, ColumnInfo>();
	}

	// Add adds a column to the collection.
	public add(col: ColumnInfo): Columns {
		this.all.push(col);
		this.lookup.set(col.Name, col);
		return this;
	}

	// AddMany adds an array of columns to the collection.
	public addMany(cols: Array<ColumnInfo>): Columns {
		this.all = cols;
		for (var i = 0; i < cols.length; i++) {
			this.lookup.set(cols[i].Name, cols[i]);
		}
		return this;
	}

	// First returns the first column in the collection.
	public first(): ColumnInfo {
		if (this.all.length === 0) {
			return new ColumnInfo();
		}
		return this.all[0];
	}

	// Len returns the number of columns.
	public len(): number {
		return this.all.length;
	}

	public columnNames(): Array<string> {
		let names = new Array<string>();
		for (var col of this.all) {
			names.push(col.Name);
		}
		return names;
	}

	// ColumnValues returns the value for each column on a given object.
	public columnValues(instance: any): Array<any> {
		let values = new Array<any>();
		for (var col of this.all) {
			values.push(col.Get(instance));
		}
		return values;
	}

	public tokens(): Array<string> {
		let tokens = new Array<string>();
		for (var i = 0; i < this.all.length; i++) {
			tokens.push(`$${i + 1}`);
		}
		return tokens;
	}

	public primaryKey(): Columns {
		var filtered = new Array<ColumnInfo>();
		for (var i = 0; i < this.all.length; i++) {
			if (this.all[i].IsPrimaryKey) {
				filtered.push(this.all[i]);
			}
		}
		return new Columns().addMany(filtered);
	}

	public notPrimaryKey(): Columns {
		var filtered = new Array<ColumnInfo>();
		for (var i = 0; i < this.all.length; i++) {
			if (!this.all[i].IsPrimaryKey) {
				filtered.push(this.all[i]);
			}
		}
		return new Columns().addMany(filtered);
	}

	public serial(): Columns {
		var filtered = new Array<ColumnInfo>();
		for (var i = 0; i < this.all.length; i++) {
			if (this.all[i].IsSerial) {
				filtered.push(this.all[i]);
			}
		}
		return new Columns().addMany(filtered);
	}

	public notSerial(): Columns {
		var filtered = new Array<ColumnInfo>();
		for (var i = 0; i < this.all.length; i++) {
			if (!this.all[i].IsSerial) {
				filtered.push(this.all[i]);
			}
		}
		return new Columns().addMany(filtered);
	}

	public readOnly(): Columns {
		var filtered = new Array<ColumnInfo>();
		for (var i = 0; i < this.all.length; i++) {
			if (this.all[i].IsReadOnly) {
				filtered.push(this.all[i]);
			}
		}
		return new Columns().addMany(filtered);
	}

	public notReadOnly(): Columns {
		var filtered = new Array<ColumnInfo>();
		for (var i = 0; i < this.all.length; i++) {
			if (!this.all[i].IsReadOnly) {
				filtered.push(this.all[i]);
			}
		}
		return new Columns().addMany(filtered);
	}

	// InsertCols returns the columns that will be set during an insert.
	public insertCols(): Columns {
		return this.notReadOnly().notSerial();
	}

	// UpdateCols returns the columns that will be set during an update.
	public updateCols(): Columns {
		return this.notReadOnly()
			.notSerial()
			.notPrimaryKey();
	}
}
