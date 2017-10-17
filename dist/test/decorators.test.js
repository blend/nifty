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
const connection_1 = require("../src/connection");
const decorators_1 = require("../src/decorators");
const testConfig_1 = require("./testConfig");
function deanonymizeObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}
const createTableQueryTestData = 'CREATE TABLE IF NOT EXISTS test_invocation (id serial not null, name varchar(255) not null, test boolean)';
let TestData = class TestData {
};
__decorate([
    decorators_1.Column('id', { PrimaryKey: true, Serial: true }),
    __metadata("design:type", Number)
], TestData.prototype, "id", void 0);
__decorate([
    decorators_1.Column('name'),
    __metadata("design:type", String)
], TestData.prototype, "notName", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Boolean)
], TestData.prototype, "test", void 0);
TestData = __decorate([
    decorators_1.Table('test_invocation')
], TestData);
const createTableQuerytest_name = 'CREATE TABLE IF NOT EXISTS test_name (id serial not null, name varchar(255), branch boolean)';
let test_name = class test_name {
};
__decorate([
    decorators_1.Column(undefined, { PrimaryKey: true, Serial: true }),
    __metadata("design:type", Number)
], test_name.prototype, "id", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], test_name.prototype, "name", void 0);
__decorate([
    decorators_1.Column('branch', { ReadOnly: true }),
    __metadata("design:type", Boolean)
], test_name.prototype, "branch", void 0);
test_name = __decorate([
    decorators_1.Table()
], test_name);
function createConnectionAndInvoke() {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = new connection_1.Connection(testConfig_1.connectionConfig);
        conn.open();
        return yield conn.invoke();
    });
}
ava_1.default('decorators', (t) => __awaiter(this, void 0, void 0, function* () {
    const inv = yield createConnectionAndInvoke();
    const testRecord = new TestData();
    testRecord.notName = 'bingoWasHisNameO';
    testRecord.test = false;
    const testName = new test_name();
    testName.name = 'lmaokar';
    testName.branch = true;
    yield inv.begin();
    yield inv.query(createTableQueryTestData);
    yield inv.query(createTableQuerytest_name);
    yield inv.create(testRecord);
    yield inv.create(testName);
    t.deepEqual(deanonymizeObj(yield inv.get(TestData, testRecord.id)), deanonymizeObj(testRecord));
    const expectedRes = {
        id: testName.id,
        name: 'lmaokar'
    };
    t.deepEqual(deanonymizeObj(yield inv.get(test_name, testName.id)), expectedRes);
    yield inv.rollback();
}));
//# sourceMappingURL=decorators.test.js.map