"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metacache_1 = require("./metacache");
class Query {
    out(typeDef) {
        let ref = new typeDef();
        const className = ref.constructor.name;
        let cols = metacache_1.columnsFor(className);
        let readCols = cols.notReadOnly(); // these actually exist on the table.
        for (var col of readCols.all) {
            col.set(ref, this.results.rows[0][col.name]);
        }
        return ref;
    }
    outMany() {
        throw new Error('not implemented');
    }
    scan(...values) {
        throw new Error('not implemented');
    }
}
exports.Query = Query;
//# sourceMappingURL=query.js.map