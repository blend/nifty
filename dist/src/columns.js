"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const column_info_1 = require("./column_info");
class Columns {
    constructor() {
        this.all = new Array();
        this.lookup = new Map();
    }
    // Add adds a column to the collection.
    add(col) {
        this.all.push(col);
        this.lookup.set(col.name, col);
        return this;
    }
    // AddMany adds an array of columns to the collection.
    addMany(cols) {
        this.all = cols;
        for (let i = 0; i < cols.length; i++) {
            this.lookup.set(cols[i].name, cols[i]);
        }
        return this;
    }
    // First returns the first column in the collection.
    first() {
        if (this.all.length === 0) {
            return new column_info_1.ColumnInfo();
        }
        return this.all[0];
    }
    // Len returns the number of columns.
    len() {
        return this.all.length;
    }
    columnNames() {
        const names = new Array();
        for (let col of this.all) {
            names.push(col.name);
        }
        return names;
    }
    // ColumnValues returns the value for each column on a given object.
    columnValues(instance) {
        const values = new Array();
        for (let col of this.all) {
            values.push(col.get(instance));
        }
        return values;
    }
    tokens() {
        const tokens = new Array();
        for (let i = 0; i < this.all.length; i++) {
            tokens.push(`$${i + 1}`);
        }
        return tokens;
    }
    primaryKey() {
        const filtered = new Array();
        for (let i = 0; i < this.all.length; i++) {
            if (this.all[i].isPrimaryKey) {
                filtered.push(this.all[i]);
            }
        }
        return new Columns().addMany(filtered);
    }
    notPrimaryKey() {
        const filtered = new Array();
        for (let i = 0; i < this.all.length; i++) {
            if (!this.all[i].isPrimaryKey) {
                filtered.push(this.all[i]);
            }
        }
        return new Columns().addMany(filtered);
    }
    serial() {
        const filtered = new Array();
        for (let i = 0; i < this.all.length; i++) {
            if (this.all[i].isSerial) {
                filtered.push(this.all[i]);
            }
        }
        return new Columns().addMany(filtered);
    }
    notSerial() {
        const filtered = new Array();
        for (let i = 0; i < this.all.length; i++) {
            if (!this.all[i].isSerial) {
                filtered.push(this.all[i]);
            }
        }
        return new Columns().addMany(filtered);
    }
    readOnly() {
        const filtered = new Array();
        for (let i = 0; i < this.all.length; i++) {
            if (this.all[i].isReadOnly) {
                filtered.push(this.all[i]);
            }
        }
        return new Columns().addMany(filtered);
    }
    notReadOnly() {
        const filtered = new Array();
        for (let i = 0; i < this.all.length; i++) {
            if (!this.all[i].isReadOnly) {
                filtered.push(this.all[i]);
            }
        }
        return new Columns().addMany(filtered);
    }
    // InsertCols returns the columns that will be set during an insert.
    insertCols() {
        return this.notReadOnly().notSerial();
    }
    // UpdateCols returns the columns that will be set during an update.
    updateCols() {
        return this.notReadOnly()
            .notSerial()
            .notPrimaryKey();
    }
}
exports.Columns = Columns;
//# sourceMappingURL=columns.js.map