"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metacache_1 = require("./metacache");
const column_info_1 = require("./column_info");
// Column defines the mapping relationship between the type field and a column on a table in the database.
function Column(name, opts) {
    return function (target, key) {
        let column = new column_info_1.ColumnInfo();
        if (!!name) {
            column.name = name;
        }
        else {
            column.name = key;
        }
        column.field = key;
        if (!!opts) {
            column.isPrimaryKey = opts.PrimaryKey || false;
            column.isSerial = opts.Serial || false;
            column.isReadOnly = opts.ReadOnly || false;
        }
        column.get = (instance) => {
            return instance[key];
        };
        column.set = (instance, value) => {
            instance[key] = value;
        };
        metacache_1.addModelColumn(target.constructor.name, column);
    };
}
exports.Column = Column;
function Table(name) {
    return function (target) {
        let tableName = name || target.name;
        metacache_1.addModel(target.name, tableName);
    };
}
exports.Table = Table;
//# sourceMappingURL=decorators.js.map