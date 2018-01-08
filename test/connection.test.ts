import test from 'ava';
import * as _ from 'lodash';
import { Connection } from '../src/connection';
import { Invocation } from '../src/invocation';
import { connectionConfig } from './testConfig';
import { Table, Column } from '../src/decorators';

@Table('test_connection')
class TestConnection {
  @Column('id', { PrimaryKey: true, Serial: true })
  id: number;

  @Column('name')
  name: string;
}

test.before(async t => {
  const conn = new Connection(connectionConfig);
  conn.open();
  await conn.exec('CREATE TABLE IF NOT EXISTS test_connection (id serial primary key, name varchar(255))');
});

test('open: can open connection with pg default pool size', async t => {
  const conn = new Connection();
  conn.open();
  t.truthy(conn.pool);
});

test('open: can set max/min pool size with connectionConfig', async t => {
  const configClone = _.cloneDeep(connectionConfig);
  configClone.minPoolSize = 4;
  configClone.maxPoolSize = 10;
  const conn = new Connection(connectionConfig);
  const pool = conn.open();
  t.truthy(pool);
});

test('invoke: creates a connection', async t => {
  const conn = new Connection(connectionConfig);
  conn.open();
  const invocation = await conn.invoke();
  t.truthy(invocation.connection);
  await invocation.close();
});

test('exec: can execute basic queries', async t => {
  // TODO: rollback all the effects from each of these tests
  // seems like we should only be able to query with the invocation
  const conn = new Connection(connectionConfig);
  conn.open();

  const createResult = await conn.exec('CREATE TABLE IF NOT EXISTS test (id serial not null, name varchar(255))');
  t.is(createResult, undefined);

  const insertResult = await conn.exec(`INSERT INTO test (name) VALUES ('testvalue')`);
  t.is(insertResult, undefined);

  const selectResult = await conn.exec('SELECT * FROM test');
  t.is(selectResult, undefined);

  await conn.exec('DROP TABLE test');
});

test('exec: throws an error on failed queries', async t => {
  const conn = new Connection(connectionConfig);
  conn.open();

  const err = await t.throws(conn.exec('DROP TABLE doesnt_exist'));
  t.truthy(err);
});

test('create/get: creates/gets given object', async t => {
  const conn = new Connection(connectionConfig);
  const testObj = new TestConnection();
  testObj.name = 'test';
  conn.open();
  await conn.create(testObj);
  const hi = await conn.query(`SELECT * FROM test_connection`);
  const res = await conn.get(TestConnection, testObj.id);
  t.is(res!.name, 'test');
});

test('inTx: can execute multiple calls in a transaction', async t => {
  const conn = new Connection(connectionConfig);
  conn.open();

  const txFn = async function(inv: Invocation) {
    const testObj = new TestConnection();
    testObj.name = 'test';
    await inv.create(testObj);
    const first = await inv.get(TestConnection, testObj.id);
    t.is(first!.name, 'test');
    await inv.query(`INSERT INTO test_connection(name) VALUES ('secondone')`);
    await inv.rollback();
    return first;
  }

  const res = await conn.inTx(txFn);
  t.is(res.name, 'test');
  const { results } = await conn.query(`SELECT * FROM test_connection WHERE name='secondone'`);
  t.is(results.rowCount, 0);
});
