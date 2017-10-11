import test from 'ava';
import { Connection } from '../src/connection';
import { Table, Column } from '../src/decorators';
import { connectionConfig } from './testConfig';

@Table('test')
class TestData {
  @Column('id', { PrimaryKey: true, Serial: true })
  id: number;

  @Column('name')
  name: string;
}

test('can open connection', async t => {
  const conn = new Connection();
  await conn.open();
  t.not(conn.pool, undefined);
});

test('invoke creates a connection', async t => {
  const conn = new Connection(connectionConfig);
  conn.open();
  const invocation = await conn.invoke();
  t.not(invocation.connection, undefined);
  await invocation.close();
});

test('exec can execute basic queries', async t => {
  const conn = new Connection(connectionConfig);
  conn.open();

  const createResult = await conn.exec('CREATE TABLE IF NOT EXISTS test (id serial not null, name varchar(255))');
  t.is(createResult, null);

  const insertResult = await conn.exec(`INSERT INTO test (name) VALUES ('testvalue')`);
  t.is(insertResult, null);

  const selectResult = await conn.exec('SELECT * FROM test');
  t.is(selectResult, null);
});

test('exec returns an error on failed queries', async t => {
  const conn = new Connection(connectionConfig);
  conn.open();

  const err = await conn.exec('DROP TABLE doesnt_exist');
  t.truthy(err);
});
