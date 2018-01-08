"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const _ = require("lodash");
const connection_1 = require("../src/connection");
const testConfig_1 = require("./testConfig");
const decorators_1 = require("../src/decorators");
let TestConnection = class TestConnection {
};
__decorate([
    decorators_1.Column('id', { PrimaryKey: true, Serial: true }),
    __metadata("design:type", Number)
], TestConnection.prototype, "id", void 0);
__decorate([
    decorators_1.Column('name'),
    __metadata("design:type", String)
], TestConnection.prototype, "name", void 0);
TestConnection = __decorate([
    decorators_1.Table('test_connection')
], TestConnection);
ava_1.default.before((t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    yield conn.exec('CREATE TABLE IF NOT EXISTS test_connection (id serial primary key, name varchar(255))');
}));
ava_1.default('open: can open connection with pg default pool size', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection();
    conn.open();
    t.truthy(conn.pool);
}));
ava_1.default('open: can set max/min pool size with connectionConfig', (t) => __awaiter(this, void 0, void 0, function* () {
    const configClone = _.cloneDeep(testConfig_1.connectionConfig);
    configClone.minPoolSize = 4;
    configClone.maxPoolSize = 10;
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    const pool = conn.open();
    t.truthy(pool);
}));
ava_1.default('invoke: creates a connection', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    const invocation = yield conn.invoke();
    t.truthy(invocation.connection);
    yield invocation.close();
}));
ava_1.default('exec: can execute basic queries', (t) => __awaiter(this, void 0, void 0, function* () {
    // TODO: rollback all the effects from each of these tests
    // seems like we should only be able to query with the invocation
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    const createResult = yield conn.exec('CREATE TABLE IF NOT EXISTS test (id serial not null, name varchar(255))');
    t.is(createResult, undefined);
    const insertResult = yield conn.exec(`INSERT INTO test (name) VALUES ('testvalue')`);
    t.is(insertResult, undefined);
    const selectResult = yield conn.exec('SELECT * FROM test');
    t.is(selectResult, undefined);
    yield conn.exec('DROP TABLE test');
}));
ava_1.default('exec: throws an error on failed queries', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    const err = yield t.throws(conn.exec('DROP TABLE doesnt_exist'));
    t.truthy(err);
}));
ava_1.default('create/get: creates/gets given object', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    const testObj = new TestConnection();
    testObj.name = 'test';
    conn.open();
    yield conn.create(testObj);
    const hi = yield conn.query(`SELECT * FROM test_connection`);
    const res = yield conn.get(TestConnection, testObj.id);
    t.is(res.name, 'test');
}));
ava_1.default('inTx: can execute multiple calls in a transaction', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = new connection_1.Connection(testConfig_1.connectionConfig);
    conn.open();
    const txFn = function (inv) {
        return __awaiter(this, void 0, void 0, function* () {
            const testObj = new TestConnection();
            testObj.name = 'test';
            yield inv.create(testObj);
            const first = yield inv.get(TestConnection, testObj.id);
            t.is(first.name, 'test');
            yield inv.query(`INSERT INTO test_connection(name) VALUES ('secondone')`);
            yield inv.rollback();
            return first;
        });
    };
    const res = yield conn.inTx(txFn);
    t.is(res.name, 'test');
    const { results } = yield conn.query(`SELECT * FROM test_connection WHERE name='secondone'`);
    t.is(results.rowCount, 0);
}));
//# sourceMappingURL=connection.test.js.map