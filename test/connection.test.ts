import test from 'ava';
import { Connection } from '../src/connection';
import { connectionConfig } from './testConfig';

test('can open connection', async t => {
  const conn = new Connection();
  await conn.open();
  t.not(conn.pool, undefined);
});

test('invoke creates a connection', async t => {
  const conn = new Connection();
  conn.open();
  const invocation = await conn.invoke();
  t.not(invocation.connection, undefined);
  await invocation.close();
});

test('exec can execute a query', async t => {
  const conn = new Connection();
  let result = await conn.exec(
    'CREATE TABLE IF NOT EXISTS test (id serial not null, name varchar(255))'
  );
  console.log('\n\nresult ', JSON.stringify(result, null, 2));
});
