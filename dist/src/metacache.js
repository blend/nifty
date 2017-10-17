"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const columns_1 = require("./columns");
const __tablenames = new Map();
const __metacache = new Map();
function addModel(className, tableName) {
    if (!__tablenames.has(className)) {
        __tablenames.set(className, tableName);
    }
}
exports.addModel = addModel;
function addModelColumn(className, column) {
    if (!__metacache.has(className)) {
        __metacache.set(className, new columns_1.Columns().add(column));
        return;
    }
    const columns = __metacache.get(className);
    if (!!columns) {
        columns.add(column);
    }
}
exports.addModelColumn = addModelColumn;
function tableNameFor(className) {
    let cachedName = __tablenames.get(className);
    if (!!cachedName) {
        return cachedName;
    }
    return className;
}
exports.tableNameFor = tableNameFor;
function columnsFor(className) {
    let cols = __metacache.get(className);
    if (!!cols) {
        return cols;
    }
    return new columns_1.Columns();
}
exports.columnsFor = columnsFor;
//# sourceMappingURL=metacache.js.map