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
    this.lookup.set(col.name, col);
    return this;
  }

  // AddMany adds an array of columns to the collection.
  public addMany(cols: Array<ColumnInfo>): Columns {
    this.all = cols;
    for (let i = 0; i < cols.length; i++) {
      this.lookup.set(cols[i].name, cols[i]);
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
    const names = new Array<string>();
    for (let col of this.all) {
      names.push(col.name);
    }
    return names;
  }

  // ColumnValues returns the value for each column on a given object.
  public columnValues(instance: any): Array<any> {
    const values = new Array<any>();
    for (let col of this.all) {
      values.push(col.get(instance));
    }
    return values;
  }

  public tokens(): Array<string> {
    const tokens = new Array<string>();
    for (let i = 0; i < this.all.length; i++) {
      tokens.push(`$${i + 1}`);
    }
    return tokens;
  }

  public primaryKey(): Columns {
    const filtered = new Array<ColumnInfo>();
    for (let i = 0; i < this.all.length; i++) {
      if (this.all[i].isPrimaryKey) {
        filtered.push(this.all[i]);
      }
    }
    return new Columns().addMany(filtered);
  }

  public notPrimaryKey(): Columns {
    const filtered = new Array<ColumnInfo>();
    for (let i = 0; i < this.all.length; i++) {
      if (!this.all[i].isPrimaryKey) {
        filtered.push(this.all[i]);
      }
    }
    return new Columns().addMany(filtered);
  }

  public serial(): Columns {
    const filtered = new Array<ColumnInfo>();
    for (let i = 0; i < this.all.length; i++) {
      if (this.all[i].isSerial) {
        filtered.push(this.all[i]);
      }
    }
    return new Columns().addMany(filtered);
  }

  public notSerial(): Columns {
    const filtered = new Array<ColumnInfo>();
    for (let i = 0; i < this.all.length; i++) {
      if (!this.all[i].isSerial) {
        filtered.push(this.all[i]);
      }
    }
    return new Columns().addMany(filtered);
  }

  public readOnly(): Columns {
    const filtered = new Array<ColumnInfo>();
    for (let i = 0; i < this.all.length; i++) {
      if (this.all[i].isReadOnly) {
        filtered.push(this.all[i]);
      }
    }
    return new Columns().addMany(filtered);
  }

  public notReadOnly(): Columns {
    const filtered = new Array<ColumnInfo>();
    for (let i = 0; i < this.all.length; i++) {
      if (!this.all[i].isReadOnly) {
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
