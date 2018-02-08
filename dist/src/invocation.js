"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const query_1 = require("./query");
const metacache_1 = require("./metacache");
class Invocation {
    constructor(config) {
        if (config)
            this.connection = config.client;
    }
    // Exec runs a given statement. Throws an error if a sql error occurs.
    exec(statement, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.query(statement, ...args);
        });
    }
    // Query runs a given query with a given set of arguments, and returns a bound result.
    query(statement, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.connection.query(statement, ...args);
            let q = new query_1.Query();
            q.results = res;
            return q;
        });
    }
    begin() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.query('BEGIN');
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.query('COMMIT');
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.query('ROLLBACK');
        });
    }
    // Close closes the connection.
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.release();
        });
    }
    get(typeDef, ...ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let ref = new typeDef();
            const className = ref.constructor.name;
            let tableName = metacache_1.tableNameFor(className);
            let cols = metacache_1.columnsFor(className);
            let readCols = cols.notReadOnly(); // these actually exist on the table.
            let pks = cols.primaryKey();
            if (pks.len() == 0) {
                throw new Error('invalid type; no primary keys');
            }
            if (pks.len() !== ids.length) {
                throw new Error('insufficient argument value count for type primary keys');
            }
            let tokens = pks.tokens();
            let columnNames = readCols.columnNames().join(',');
            let queryBody = `SELECT ${columnNames} FROM ${tableName} WHERE `;
            // loop over the pks, add the tokens etc.
            for (let i = 0; i < pks.len(); i++) {
                const pk = pks.all[i];
                queryBody = queryBody + pk.name + ' = ' + `$${i + 1}`;
                if (i < pks.len() - 1) {
                    queryBody = queryBody + ' AND ';
                }
            }
            let res = yield this.connection.query(queryBody, ids);
            if (_.isEmpty(res.rows))
                return null;
            for (let col of readCols.all) {
                col.set(ref, res.rows[0][col.name]);
            }
            return ref;
        });
    }
    // GetAll returns all instances of T in it's respective table as an array.
    getAll(typeDef) {
        return __awaiter(this, void 0, void 0, function* () {
            // build query
            // execute query
            // loop over results, bind each to a new object, add to the array.
            // hope whoever created T knew to implement populate.
            return new Array();
        });
    }
    // Create inserts the object into the db.
    create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = obj.constructor.name;
            const tableName = metacache_1.tableNameFor(className);
            const cols = metacache_1.columnsFor(className);
            const writeCols = cols.notReadOnly().notSerial();
            const serials = cols.serial();
            const colNames = writeCols.columnNames().join(',');
            const colValues = writeCols.columnValues(obj);
            const tokens = writeCols.tokens().join(',');
            let queryBody = `INSERT INTO ${tableName} (${colNames}) VALUES (${tokens})`;
            if (serials.len() > 0) {
                queryBody += ` RETURNING ${serials.first().name}`;
            }
            const res = yield this.connection.query(queryBody, colValues);
            if (serials.len() > 0) {
                let serial = serials.first();
                serial.set(obj, res.rows[0][serial.name]);
            }
        });
    }
    // CreateMany inserts multiple objects at once.
    createMany(objs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (objs.length < 1)
                return;
            const tableNames = _.uniq(_.map(objs, obj => metacache_1.tableNameFor(obj.constructor.name)));
            if (_.size(tableNames) > 1)
                throw new Error('createMany requires the objects to all be of the same type');
            const className = objs[0].constructor.name;
            const tableName = tableNames[0];
            const allColValues = [];
            // only use column names once
            const cols = metacache_1.columnsFor(className);
            const serials = cols.serial();
            const writeCols = cols.insertCols();
            const colNames = writeCols.columnNames().join(',');
            let valuesString = '';
            let metaIndex = 1;
            for (let x = 0; x < objs.length; x++) {
                valuesString += '(';
                for (let y = 0; y < writeCols.all.length; y++) {
                    valuesString += `$${metaIndex}`;
                    metaIndex++;
                    if (y < writeCols.all.length - 1)
                        valuesString += ',';
                }
                valuesString += ')';
                if (x < objs.length - 1)
                    valuesString += ',';
            }
            _.forEach(objs, obj => {
                const colValues = writeCols.columnValues(obj);
                const tokens = writeCols.tokens().join(',');
                allColValues.push(colValues);
            });
            const queryBody = `INSERT INTO ${tableName} (${colNames}) VALUES ${valuesString} RETURNING ${serials.first().name}`;
            const { rows } = yield this.connection.query(queryBody, _.flatten(allColValues));
            if (serials.len() > 0) {
                _.each(rows, (row, i) => {
                    let serial = serials.first();
                    serial.set(objs[i], rows[i][serial.name]);
                });
            }
        });
    }
    // Update updates an object by primary key; it does not re-assign the pk value(s).
    update(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = obj.constructor.name;
            const tableName = metacache_1.tableNameFor(className);
            const cols = metacache_1.columnsFor(className);
            const pks = cols.primaryKey();
            const updateCols = cols.updateCols().notNullOfObj(obj);
            const updateValues = updateCols.columnValues(obj);
            let values = [];
            let queryBody = `UPDATE ${tableName} SET `;
            for (let i = 0; i < updateCols.len(); i++) {
                const colName = updateCols.columnNames()[i];
                queryBody = queryBody + colName + ' = ' + `$${i + 1}`;
                if (i < updateCols.len() - 1) {
                    queryBody = queryBody + ', ';
                }
                values.push(updateCols.all[i].get(obj));
            }
            queryBody = queryBody + ' WHERE ';
            // loop over the pks, add the tokens etc.
            for (let i = 0; i < pks.len(); i++) {
                const pk = pks.all[i];
                queryBody = queryBody + pk.name + ' = ' + `$${updateCols.len() + i + 1}`;
                if (i < pks.len() - 1) {
                    queryBody = queryBody + ' AND ';
                }
                values.push(pk.get(obj));
            }
            yield this.connection.query(queryBody, values);
        });
    }
    // Upsert creates an object if it doesn't exit, otherwise it updates it.
    upsert(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = obj.constructor.name;
            const tableName = metacache_1.tableNameFor(className);
            const cols = metacache_1.columnsFor(className);
            const pks = cols.primaryKey();
            const writeCols = cols.notReadOnly().notSerial().notNullOfObj(obj);
            const updateCols = cols.updateCols().notNullOfObj(obj);
            const updateValues = updateCols.columnValues(obj);
            let values = [];
            let queryBody = `INSERT INTO ${tableName} (`;
            for (let i = 0; i < writeCols.len(); i++) {
                const colName = writeCols.columnNames()[i];
                queryBody = queryBody + colName;
                if (i < writeCols.len() - 1) {
                    queryBody = queryBody + ', ';
                }
            }
            queryBody = queryBody + ') VALUES (';
            for (let i = 0; i < writeCols.len(); i++) {
                queryBody = queryBody + `$${i + 1}`;
                if (i < writeCols.len() - 1) {
                    queryBody = queryBody + ', ';
                }
                values.push(writeCols.all[i].get(obj));
            }
            queryBody = queryBody + ')';
            if (pks.len() > 0) {
                const nameMap = {};
                const writeColNames = writeCols.columnNames();
                for (let i = 0; i < writeCols.len(); i++) {
                    nameMap[writeColNames[i]] = `$${i + 1}`;
                }
                queryBody = queryBody + ' ON CONFLICT (';
                const pkNames = pks.columnNames();
                for (let i = 0; i < pks.len(); i++) {
                    queryBody = queryBody + pkNames[i];
                    if (i < pks.len() - 1) {
                        queryBody = queryBody + ', ';
                    }
                }
                queryBody = queryBody + ') DO UPDATE SET ';
                const updateColNames = updateCols.columnNames();
                for (let i = 0; i < updateCols.len(); i++) {
                    queryBody = queryBody + `${updateColNames[i]} = ${nameMap[updateColNames[i]]}`;
                    if (i < updateCols.len() - 1) {
                        queryBody = queryBody + ', ';
                    }
                }
            }
            const serial = cols.serial().first();
            if (serial)
                queryBody = queryBody + ` RETURNING ${serial.name}`;
            const res = yield this.connection.query(queryBody, values);
            return _.first(res.rows);
        });
    }
    // Delete deletes a given object.
    delete(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = obj.constructor.name;
            const tableName = metacache_1.tableNameFor(className);
            const cols = metacache_1.columnsFor(className);
            const pks = cols.primaryKey();
            if (pks.len() == 0) {
                throw new Error('invalid type; no primary keys');
            }
            let ids = [];
            let queryBody = `DELETE FROM ${tableName} WHERE `;
            // loop over the pks, add the tokens etc.
            for (let i = 0; i < pks.len(); i++) {
                const pk = pks.all[i];
                queryBody = queryBody + pk.name + ' = ' + `$${i + 1}`;
                if (i < pks.len() - 1) {
                    queryBody = queryBody + ' AND ';
                }
                ids.push(pk.get(obj));
            }
            yield this.connection.query(queryBody, ids);
        });
    }
    // Truncate deletes *all* rows of a table using the truncate command.
    // If the type implements a `serial` column it will restart the identity.
    truncate(typeDef) {
        return __awaiter(this, void 0, void 0, function* () {
            let ref = new typeDef();
            const className = ref.constructor.name;
            const tableName = metacache_1.tableNameFor(className);
            const cols = metacache_1.columnsFor(className);
            const serials = cols.serial();
            let queryBody = `TRUNCATE ${tableName}`;
            if (serials.len() > 0) {
                queryBody = queryBody + ' RESTART IDENTITY';
            }
            yield this.connection.query(queryBody);
        });
    }
}
exports.Invocation = Invocation;
//# sourceMappingURL=invocation.js.map