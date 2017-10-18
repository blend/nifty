import test from 'ava';
import * as _ from 'lodash';
import { Connection } from '../src/connection';
import { connectionConfig } from './testConfig';

test('open: can open connection with pg default pool size', async t => {
  const conn = new Connection();
  await conn.open();
  t.not(conn.pool, undefined);
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
  t.not(invocation.connection, undefined);
  await invocation.close();
});

test('exec: can execute basic queries', async t => {
  // TODO: rollback all the effects from each of these tests
  // seems like we should only be able to query with the invocation
  const conn = new Connection(connectionConfig);
  conn.open();

  const createResult = await conn.exec('CREATE TABLE IF NOT EXISTS test (id serial not null, name varchar(255))');
  t.is(createResult, null);

  const insertResult = await conn.exec(`INSERT INTO test (name) VALUES ('testvalue')`);
  t.is(insertResult, null);

  const selectResult = await conn.exec('SELECT * FROM test');
  t.is(selectResult, null);

  await conn.exec('DROP TABLE test');
});

test('exec: throws an error on failed queries', async t => {
  const conn = new Connection(connectionConfig);
  conn.open();

  const err = await t.throws(conn.exec('DROP TABLE doesnt_exist'));
  t.truthy(err);
});
