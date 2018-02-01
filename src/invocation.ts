import * as _ from 'lodash';
import { Client, QueryResult } from 'pg';
import { Columns } from './columns';
import { Query } from './query';
import { tableNameFor, columnsFor } from './metacache';
import { Populatable } from './interfaces';

export interface InvocationConfig {
  client: Client;
}

export class Invocation {
  connection: Client;

  constructor(config?: InvocationConfig) {
    if (config) this.connection = config.client;
  }

  // Exec runs a given statement. Throws an error if a sql error occurs.
  public async exec(statement: string, ...args: any[]): Promise<void> {
    await this.connection.query(statement, ...args);
  }

  // Query runs a given query with a given set of arguments, and returns a bound result.
  public async query(statement: string, ...args: any[]): Promise<Query> {
    let res = await this.connection.query(statement, ...args);
    let q = new Query();
    q.results = res;
    return q;
  }

  public async begin(): Promise<void> {
    await this.connection.query('BEGIN');
  }

  public async commit(): Promise<void> {
    await this.connection.query('COMMIT');
  }

  public async rollback(): Promise<void> {
    await this.connection.query('ROLLBACK');
  }

  // Close closes the connection.
  public async close(): Promise<void> {
    await this.connection.release();
  }

  public async get<T>(typeDef: { new (): T }, ...ids: any[]): Promise<T | null> {
    let ref: T = new typeDef();
    const className = ref.constructor.name;
    let tableName = tableNameFor(className);
    let cols = columnsFor(className);
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

    let res = await this.connection.query(queryBody, ids);
    if (_.isEmpty(res.rows)) return null;

    for (let col of readCols.all) {
      col.set(ref, res.rows[0][col.name]);
    }
    return ref;
  }

  // GetAll returns all instances of T in it's respective table as an array.
  public async getAll<T>(typeDef: { new (): T }): Promise<Array<T>> {
    // build query
    // execute query
    // loop over results, bind each to a new object, add to the array.
    // hope whoever created T knew to implement populate.
    return new Array<T>();
  }

  // Create inserts the object into the db.
  public async create(obj: any): Promise<void> {
    const className = obj.constructor.name;
    const tableName = tableNameFor(className);
    const cols = columnsFor(className);
    const writeCols = cols.notReadOnly().notSerial();
    const serials = cols.serial();

    const colNames = writeCols.columnNames().join(',');
    const colValues = writeCols.columnValues(obj);
    const tokens = writeCols.tokens().join(',');

    let queryBody = `INSERT INTO ${tableName} (${colNames}) VALUES (${tokens})`;

    if (serials.len() > 0) {
      queryBody += ` RETURNING ${serials.first().name}`;
    }

    const res = await this.connection.query(queryBody, colValues);
    if (serials.len() > 0) {
      let serial = serials.first();
      serial.set(obj, res.rows[0][serial.name]);
    }
  }

  // CreateMany inserts multiple objects at once.
  public async createMany(objs: any[]): Promise<void> {
    if (objs.length < 1) return;
    const tableNames = _.uniq(_.map(objs, obj => tableNameFor(obj.constructor.name)));
    if (_.size(tableNames) > 1) throw new Error('createMany requires the objects to all be of the same type');
    const className = objs[0].constructor.name;
    const tableName = tableNames[0];

    const allColValues: any[] = [];

    // only use column names once
    const cols = columnsFor(className);
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
        if (y < writeCols.all.length - 1) valuesString += ',';
      }
      valuesString += ')';
      if (x < objs.length - 1) valuesString += ',';
    }

    _.forEach(objs, obj => {
      const colValues = writeCols.columnValues(obj);
      const tokens = writeCols.tokens().join(',');

      allColValues.push(colValues);
    });

    const queryBody = `INSERT INTO ${tableName} (${colNames}) VALUES ${valuesString} RETURNING ${serials.first().name}`;

    const { rows } = await this.connection.query(queryBody, _.flatten(allColValues));

    if (serials.len() > 0) {
      _.each(rows, (row, i) => {
        let serial = serials.first();
        serial.set(objs[i], rows[i][serial.name]);
      });
    }
  }

  // Update updates an object by primary key; it does not re-assign the pk value(s).
  public async update<T>(obj: T): Promise<void> {
    const className = obj.constructor.name;
    const tableName = tableNameFor(className);
    const cols = columnsFor(className);
    const pks = cols.primaryKey();
    const updateCols = cols.updateCols();
    const updateValues = updateCols.columnValues(obj);

    let values: any[] = [];
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

    await this.connection.query(queryBody, values);
  }

  // Upsert creates an object if it doesn't exit, otherwise it updates it.
  public async upsert<T>(obj: T): Promise<QueryResult> {
    const className = obj.constructor.name;
    const tableName = tableNameFor(className);
    const cols = columnsFor(className);
    const pks = cols.primaryKey();
    const writeCols = cols.notReadOnly().notSerial();
    const updateCols = cols.updateCols();
    const updateValues = updateCols.columnValues(obj);

    let values: any[] = [];
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
      const nameMap: { [key: string]: any } = {};
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

    if (serial) queryBody = queryBody + ` RETURNING ${serial.name}`;
    const res = await this.connection.query(queryBody, values);
    return _.first(res.rows);
  }

  // Delete deletes a given object.
  public async delete(obj: any): Promise<void> {
    const className = obj.constructor.name;
    const tableName = tableNameFor(className);
    const cols = columnsFor(className);
    const pks = cols.primaryKey();

    if (pks.len() == 0) {
      throw new Error('invalid type; no primary keys');
    }

    let ids: any[] = [];
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

    await this.connection.query(queryBody, ids);
  }

  // Truncate deletes *all* rows of a table using the truncate command.
  // If the type implements a `serial` column it will restart the identity.
  public async truncate<T>(typeDef: { new (): T }): Promise<void> {
    let ref: T = new typeDef();
    const className = ref.constructor.name;
    const tableName = tableNameFor(className);
    const cols = columnsFor(className);
    const serials = cols.serial();

    let queryBody = `TRUNCATE ${tableName}`;

    if (serials.len() > 0) {
      queryBody = queryBody + ' RESTART IDENTITY';
    }

    await this.connection.query(queryBody);
  }
}
