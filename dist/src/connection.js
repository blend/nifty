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
const pg_1 = require("pg");
const invocation_1 = require("./invocation");
// Connection represents the metadata used to make the initial conneciton.
class Connection {
    constructor(opts) {
        if (opts) {
            let { host, port, database, schema, username, password, sslMode, minPoolSize, maxPoolSize } = opts;
            this.host = host || 'localhost';
            this.port = port || 5432;
            this.database = database || '';
            this.schema = schema || 'public';
            this.username = username || '';
            this.password = password || '';
            this.sslMode = sslMode || '';
            this.minPoolSize = minPoolSize;
            this.maxPoolSize = maxPoolSize;
        }
    }
    // Open either returns the current pool or creates a new pool.
    open() {
        if (!this.pool) {
            this.pool = new pg_1.Pool({
                host: this.host,
                port: this.port,
                database: this.database,
                user: this.username,
                password: this.password,
                min: this.minPoolSize,
                max: this.maxPoolSize
            });
        }
        return this.pool;
    }
    // Invoke opens a new connection.
    // Note; it is the caller's responsibility to close the invocation.
    invoke() {
        return __awaiter(this, void 0, void 0, function* () {
            const inv = new invocation_1.Invocation();
            inv.connection = yield this.pool.connect();
            return inv;
        });
    }
    // Exec opens a new connection and runs a given statement.
    exec(statement) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.exec(statement);
            }
            catch (e) {
                throw e;
            }
            finally {
                inv.close();
            }
        });
    }
    // Exec opens a new connection and runs a given statement.
    query(statement, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.query(statement, ...args);
            }
            finally {
                inv.close();
            }
        });
    }
    // Get opens a new connection and fetches a single instance by id(s).
    // note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
    get(typeDef, ...ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.get(typeDef, ...ids);
            }
            catch (e) {
                throw e;
            }
            finally {
                inv.close();
            }
        });
    }
    // GetAll opens a new connection and gets all instances of a given model.
    // note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
    getAll(typeDef) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.getAll(typeDef);
            }
            catch (e) {
                throw e;
            }
            finally {
                inv.close();
            }
        });
    }
    // Create opens a new connection and inserts the object.
    create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.create(obj);
            }
            catch (e) {
                throw e;
            }
            finally {
                inv.close();
            }
        });
    }
    // Create opens a new connection and inserts the object.
    createMany(objs) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.createMany(objs);
            }
            catch (e) {
                throw e;
            }
            finally {
                inv.close();
            }
        });
    }
    // Update opens a new connection and updates the object.
    update(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.update(obj);
            }
            finally {
                inv.close();
            }
        });
    }
    // Delete opens a new connection and deletes a given object.
    delete(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.delete(obj);
            }
            finally {
                inv.close();
            }
        });
    }
    // Truncate opens a new connection and truncates a table represented by a type.
    // note: the `typeDef` is required because we can't infer the <T> ctor at runtime.
    truncate(typeDef) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                return inv.truncate(typeDef);
            }
            catch (e) {
                throw e;
            }
            finally {
                inv.close();
            }
        });
    }
    inTx(txFn) {
        return __awaiter(this, void 0, void 0, function* () {
            let inv = yield this.invoke();
            try {
                yield inv.begin();
                const res = yield txFn(inv);
                yield inv.commit();
                return res;
            }
            catch (err) {
                yield inv.rollback();
                throw err;
            }
            finally {
                inv.close();
            }
        });
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map