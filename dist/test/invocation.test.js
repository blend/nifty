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
const decorators_1 = require("../src/decorators");
const testConfig_1 = require("./testConfig");
const createTableQuery = 'CREATE TABLE IF NOT EXISTS test_invocation (id serial not null, name varchar(255), monies int)';
const createTableQueryPk = 'CREATE TABLE IF NOT EXISTS test_invocation_pk (id serial not null, name varchar(255) primary key, monies int, test varchar(32))';
let TestInvocation = class TestInvocation {
};
__decorate([
    decorators_1.Column('id', { PrimaryKey: true, Serial: true }),
    __metadata("design:type", Number)
], TestInvocation.prototype, "id", void 0);
__decorate([
    decorators_1.Column('name'),
    __metadata("design:type", String)
], TestInvocation.prototype, "name", void 0);
__decorate([
    decorators_1.Column('monies'),
    __metadata("design:type", Number)
], TestInvocation.prototype, "monies", void 0);
TestInvocation = __decorate([
    decorators_1.Table('test_invocation')
], TestInvocation);
let TestInvocationPk = class TestInvocationPk {
};
__decorate([
    decorators_1.Column('id', { Serial: true }),
    __metadata("design:type", Number)
], TestInvocationPk.prototype, "id", void 0);
__decorate([
    decorators_1.Column('name', { PrimaryKey: true }),
    __metadata("design:type", String)
], TestInvocationPk.prototype, "name", void 0);
__decorate([
    decorators_1.Column('monies'),
    __metadata("design:type", Number)
], TestInvocationPk.prototype, "monies", void 0);
__decorate([
    decorators_1.Column('test'),
    __metadata("design:type", String)
], TestInvocationPk.prototype, "test", void 0);
TestInvocationPk = __decorate([
    decorators_1.Table('test_invocation_pk')
], TestInvocationPk);
let TestDifferent = class TestDifferent {
};
__decorate([
    decorators_1.Column('id', { PrimaryKey: true, Serial: true }),
    __metadata("design:type", Number)
], TestDifferent.prototype, "id", void 0);
__decorate([
    decorators_1.Column('name'),
    __metadata("design:type", String)
], TestDifferent.prototype, "name", void 0);
TestDifferent = __decorate([
    decorators_1.Table('test_different')
], TestDifferent);
function createConnectionAndInvoke() {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = new connection_1.Connection(testConfig_1.connectionConfig);
        conn.open();
        return yield conn.invoke();
    });
}
function createManyRecords(n) {
    const data = [];
    for (let i = 0; i < n; i++) {
        const item = new TestInvocation();
        item.name = `item${i + 1}`;
        item.monies = i * 2;
        data.push(item);
    }
    return data;
}
// pg returns anonymous node objects, which don't deep compare correctly
function deanonymizeObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}
ava_1.default('rollback: rolls all queries in transaction', (t) => __awaiter(this, void 0, void 0, function* () {
    const inv = yield createConnectionAndInvoke();
    yield inv.begin();
    yield inv.query(createTableQuery);
    yield inv.query(`INSERT INTO test_invocation (id, name) values (1, 'jimmyjohn')`);
    const res = yield inv.query('SELECT * from test_invocation');
    t.deepEqual(deanonymizeObj(res.results.rows[0]), { id: 1, name: 'jimmyjohn', monies: null });
    yield inv.rollback();
    const err = yield t.throws(inv.query('SELECT * FROM test_invocation'));
    t.truthy(err);
}));
ava_1.default('commit: commits a transaction which is not undone by rollback', (t) => __awaiter(this, void 0, void 0, function* () {
    const inv = yield createConnectionAndInvoke();
    yield inv.begin();
    yield inv.query('CREATE TABLE IF NOT EXISTS test_commit (id serial not null, name varchar(255))');
    yield inv.query(`INSERT INTO test_commit (id, name) values (1, 'jimmyjohn')`);
    yield inv.commit();
    yield inv.rollback();
    const res = yield inv.query('SELECT * FROM test_commit');
    t.is(res.results.rowCount, 1);
    yield inv.query('DROP TABLE test_commit');
}));
ava_1.default('truncate: can delete all rows in table and restart serial identity', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = createManyRecords(5);
    const inv = yield createConnectionAndInvoke();
    yield inv.begin();
    yield inv.query(createTableQuery);
    data.forEach((item) => __awaiter(this, void 0, void 0, function* () {
        yield inv.create(item);
    }));
    const res = yield inv.query('SELECT * FROM test_invocation');
    t.is(res.results.rowCount, 5);
    t.deepEqual(_.map(res.results.rows, 'id'), [1, 2, 3, 4, 5]);
    yield inv.truncate(TestInvocation);
    const emptyRes = yield inv.query('SELECT * FROM test_invocation');
    t.is(emptyRes.results.rowCount, 0);
    const newRecord = new TestInvocation();
    newRecord.name = 'i am new';
    yield inv.create(newRecord);
    const newRes = yield inv.query('SELECT * FROM test_invocation');
    t.is(newRes.results.rowCount, 1);
    t.is(newRes.results.rows[0].id, 1);
    yield inv.rollback();
}));
ava_1.default('create/get: can create and get record given object mapping', (t) => __awaiter(this, void 0, void 0, function* () {
    const inv = yield createConnectionAndInvoke();
    const testRecord = new TestInvocation();
    testRecord.name = 'world test record';
    testRecord.monies = 5;
    yield inv.begin();
    yield inv.query(createTableQuery);
    yield inv.create(testRecord);
    let res = (yield inv.get(TestInvocation, testRecord.id));
    t.is(res.id, 1);
    t.is(res.name, 'world test record');
    yield inv.rollback();
}));
ava_1.default('update/upsert: updates and upserts', (t) => __awaiter(this, void 0, void 0, function* () {
    const inv = yield createConnectionAndInvoke();
    const testRecord = new TestInvocationPk();
    testRecord.name = 'world test record';
    testRecord.monies = 5;
    testRecord.test = 'hello';
    yield inv.begin();
    yield inv.query(createTableQueryPk);
    yield inv.create(testRecord);
    let res = (yield inv.get(TestInvocationPk, testRecord.name));
    t.is(res.id, 1);
    t.is(res.name, 'world test record');
    t.is(res.test, 'hello');
    const newRecord = new TestInvocationPk();
    newRecord.name = 'world test record';
    newRecord.monies = 0;
    const test = yield inv.update(newRecord);
    res = (yield inv.get(TestInvocationPk, testRecord.name));
    t.is(res.id, 1);
    t.is(res.monies, 0);
    t.is(res.test, 'hello');
    const newRecord2 = new TestInvocationPk();
    newRecord2.name = 'world test record';
    newRecord2.monies = 3;
    yield inv.upsert(newRecord2);
    res = (yield inv.get(TestInvocationPk, testRecord.name));
    t.is(res.id, 1);
    t.is(res.monies, 3);
    t.is(res.test, 'hello');
    res.name = 'hello';
    res.monies = 0;
    yield inv.upsert(res);
    res = (yield inv.get(TestInvocationPk, 'hello'));
    t.is(res.id, 3);
    t.is(res.monies, 0);
    t.is(res.name, 'hello');
    yield inv.rollback();
}));
ava_1.default('delete: can delete record given object mapping', (t) => __awaiter(this, void 0, void 0, function* () {
    const inv = yield createConnectionAndInvoke();
    const testRecord = new TestInvocation();
    testRecord.name = 'bingoWasHisNameO';
    yield inv.begin();
    yield inv.query(createTableQuery);
    yield inv.create(testRecord);
    yield inv.delete(testRecord);
    const res = yield inv.get(TestInvocation, testRecord.id);
    t.falsy(res);
    yield inv.rollback();
}));
ava_1.default('createMany: adds multiple objects', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = createManyRecords(5);
    const inv = yield createConnectionAndInvoke();
    yield inv.begin();
    yield inv.query(createTableQuery);
    yield inv.createMany(data);
    const res = yield inv.query('SELECT * from test_invocation');
    t.is(res.results.rowCount, 5);
    t.deepEqual(_.map(res.results.rows, 'name'), ['item1', 'item2', 'item3', 'item4', 'item5']);
    t.deepEqual(_.map(data, 'id'), [1, 2, 3, 4, 5]);
    yield inv.rollback();
}));
ava_1.default('createMany: throws an error if all objects are not of same type', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = createManyRecords(3);
    data.push(new TestDifferent());
    const inv = yield createConnectionAndInvoke();
    yield inv.begin();
    yield inv.query(createTableQuery);
    const err = yield t.throws(inv.createMany(data));
    t.truthy(err);
    t.is(err.message, 'createMany requires the objects to all be of the same type');
    yield inv.rollback();
}));
//# sourceMappingURL=invocation.test.js.map