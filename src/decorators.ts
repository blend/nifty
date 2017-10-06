// Table defines the mapping relationship between the type and a relation in the database.
function Table(name?: string) {}

// Column defines the mapping relationship between the type field and a column on a table in the database.
function Column(
  name?: string,
  primaryKey: boolean = false,
  serial: boolean = false,
  readOnly: boolean = false
) {}
