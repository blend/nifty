// Table defines the mapping relationship between the type and a relation in the database.
function Table(name?: string) {}

// Column defines the mapping relationship between the type field and a column on a table in the database.
function Column(target: DatabaseMapped, key: string) {
  // property value
  var thisRef = this;

  let column = new ColumnInfo();
  column.Name = key;
  column.Field = key;
  column.Get = (): any => {
    return thisRef[key];
  };
  column.Set = (value: any) => {
    thisRef[key] = value;
  };

  AddModelColumn(target, column);
}
