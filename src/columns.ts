class Columns {
  All: Array<ColumnInfo>;
  Lookup: Map<string, ColumnInfo>;

  constructor(cols: Array<ColumnInfo>) {
    this.All = cols;
    for (var i = 0; i < cols.length; i++) {
      this.Lookup.set(cols[i].Name, cols[i]);
    }
  }

  // Add
  public Add(col: ColumnInfo) {
    this.All.push(col);
    this.Lookup.set(col.Name, col);
  }

  // Copy returns a new collection.
  public Copy(): Columns {
    return new Columns(this.All);
  }

  public PrimaryKey(): Columns {
    var filtered = new Array<ColumnInfo>();
    for (var i = 0; i < this.All.length; i++) {
      if (this.All[i].IsPrimaryKey) {
        filtered.push(this.All[i]);
      }
    }
    return new Columns(filtered);
  }

  public NotPrimaryKey(): Columns {
    var filtered = new Array<ColumnInfo>();
    for (var i = 0; i < this.All.length; i++) {
      if (!this.All[i].IsPrimaryKey) {
        filtered.push(this.All[i]);
      }
    }
    return new Columns(filtered);
  }

  public Serial(): Columns {
    var filtered = new Array<ColumnInfo>();
    for (var i = 0; i < this.All.length; i++) {
      if (this.All[i].IsSerial) {
        filtered.push(this.All[i]);
      }
    }
    return new Columns(filtered);
  }

  public NotSerial(): Columns {
    var filtered = new Array<ColumnInfo>();
    for (var i = 0; i < this.All.length; i++) {
      if (!this.All[i].IsSerial) {
        filtered.push(this.All[i]);
      }
    }
    return new Columns(filtered);
  }

  public ReadOnly(): Columns {
    var filtered = new Array<ColumnInfo>();
    for (var i = 0; i < this.All.length; i++) {
      if (this.All[i].IsReadOnly) {
        filtered.push(this.All[i]);
      }
    }
    return new Columns(filtered);
  }

  public NotReadOnly(): Columns {
    var filtered = new Array<ColumnInfo>();
    for (var i = 0; i < this.All.length; i++) {
      if (!this.All[i].IsReadOnly) {
        filtered.push(this.All[i]);
      }
    }
    return new Columns(filtered);
  }

  // InsertCols returns the columns that will be set during an insert.
  public InsertCols(): Columns {
    return this.NotReadOnly().NotSerial();
  }

  // UpdateCols returns the columns that will be set during an update.
  public UpdateCols(): Columns {
    return this.NotReadOnly()
      .NotSerial()
      .NotPrimaryKey();
  }
}
