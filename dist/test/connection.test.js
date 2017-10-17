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
const ava_1 = require("ava");
const connection_1 = require("../src/connection");
const testConfig_1 = require("./testConfig");
ava_1.default('open: can open connection', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection();
    yield conn.open();
    t.not(conn.pool, undefined);
}));
ava_1.default('invoke: creates a connection', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    const invocation = yield conn.invoke();
    t.not(invocation.connection, undefined);
    yield invocation.close();
}));
ava_1.default('exec: can execute basic queries', (t) => __awaiter(this, void 0, void 0, function* () {
    // TODO: rollback all the effects from each of these tests
    // seems like we should only be able to query with the invocation
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    const createResult = yield conn.exec('CREATE TABLE IF NOT EXISTS test (id serial not null, name varchar(255))');
    t.is(createResult, null);
    const insertResult = yield conn.exec(`INSERT INTO test (name) VALUES ('testvalue')`);
    t.is(insertResult, null);
    const selectResult = yield conn.exec('SELECT * FROM test');
    t.is(selectResult, null);
    yield conn.exec('DROP TABLE test');
}));
ava_1.default('exec: throws an error on failed queries', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    const err = yield t.throws(conn.exec('DROP TABLE doesnt_exist'));
    t.truthy(err);
}));
//# sourceMappingURL=connection.test.js.map