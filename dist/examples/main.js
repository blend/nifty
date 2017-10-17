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
const connection_1 = require("../src/connection");
const decorators_1 = require("../src/decorators");
// MetadataTest is a class the implements database mapped.
let MetadataTest = class MetadataTest {
};
__decorate([
    decorators_1.Column('id', { PrimaryKey: true, Serial: true }),
    __metadata("design:type", Number)
], MetadataTest.prototype, "ID", void 0);
__decorate([
    decorators_1.Column('name'),
    __metadata("design:type", String)
], MetadataTest.prototype, "Name", void 0);
MetadataTest = __decorate([
    decorators_1.Table('metadata_test')
], MetadataTest);
function migrate(conn) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('creating metadata table');
        let result = yield conn.exec('CREATE TABLE IF NOT EXISTS metadata_test (id serial not null, name varchar(255))');
        console.log('creating metadata table complete');
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = new connection_1.Connection();
        conn.open();
        yield migrate(conn);
        console.log('creating object');
        let md = new MetadataTest();
        md.Name = 'foo';
        yield conn.create(md);
        console.log('creating object complete');
        console.log('created', md, md.ID);
        // this seems anus tier but is necessary because typescript is not a real language.
        let verify = yield conn.get(MetadataTest, md.ID);
        console.log(verify);
    });
}
main();
//# sourceMappingURL=main.js.map