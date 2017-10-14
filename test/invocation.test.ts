import test from 'ava';
import { Connection } from '../src/connection';
import { Invocation } from '../src/invocation';
import { Table, Column } from '../src/decorators';
import { connectionConfig } from './testConfig';

const createTableQuery = 'CREATE TABLE IF NOT EXISTS test_invocation (id serial not null, name varchar(255), monies int)';
@Table('test_invocation')
class TestInvocation {
  @Column('id', { PrimaryKey: true, Serial: true })
  id: number;

  @Column('name')
  name: string;

  @Column('monies')
  monies: number;
}

@Table('test_different')
class TestDifferent {
  @Column('id', { PrimaryKey: true, Serial: true })
  id: number;

  @Column('name')
  name: string;
}

async function createConnectionAndInvoke() {
  const conn = new Connection(connectionConfig);
  conn.open();
  return await conn.invoke();
}

function createManyRecords(n: number) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const item = new TestInvocation();
    item.name = `item${i}`;
    item.monies = i*2;
    data.push(item);
  }
  return data;
}

// pg returns anonymous node objects, which don't deep compare correctly
function deanonymizeObj(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

test('rollback: rolls all queries in transaction', async t => {
  const inv = await createConnectionAndInvoke();
  await inv.begin();
  await inv.query(createTableQuery);
  await inv.query(`INSERT INTO test_invocation (id, name) values (1, 'jimmyjohn')`);
  const res = await inv.query('SELECT * from test_invocation');
  t.deepEqual(deanonymizeObj(res.results.rows[0]), { id: 1, name: 'jimmyjohn', monies: null });
  await inv.rollback();
  const err = await t.throws(inv.query('SELECT * FROM test_invocation'));
  t.truthy(err);
});

test('commit: commits a transaction which is not undone by rollback', async t => {
  const inv = await createConnectionAndInvoke();
  await inv.begin();
  await inv.query('CREATE TABLE IF NOT EXISTS test_commit (id serial not null, name varchar(255))');
  await inv.query(`INSERT INTO test_commit (id, name) values (1, 'jimmyjohn')`);
  await inv.commit();
  await inv.rollback();
  const res = await inv.query('SELECT * FROM test_commit');
  t.is(res.results.rowCount, 1);
  await inv.query('DROP TABLE test_commit');
});

test('truncate: can delete all rows in table and restart serial identity', async t => {
  const data = createManyRecords(5);

  const inv = await createConnectionAndInvoke();
  await inv.begin();
  await inv.query(createTableQuery);

  data.forEach(async (item) => {
    await inv.create(item);
  });
  const res = await inv.query('SELECT * FROM test_invocation');
  t.is(res.results.rowCount, 5);
  t.deepEqual(res.results.rows.map((e) => e.id) , [1,2,3,4,5]);

  await inv.truncate(TestInvocation);
  const emptyRes = await inv.query('SELECT * FROM test_invocation');
  t.is(emptyRes.results.rowCount, 0);

  const newRecord = new TestInvocation();
  newRecord.name = 'i am new';
  await inv.create(newRecord);
  const newRes = await inv.query('SELECT * FROM test_invocation');
  t.is(newRes.results.rowCount, 1);
  t.is(newRes.results.rows[0].id, 1);

  await inv.rollback();
});

test('create/get: can create and get record given object mapping', async t => {
  const inv = await createConnectionAndInvoke();
  const testRecord = new TestInvocation();
  testRecord.name = 'world test record';
  await inv.begin();
  await inv.query(createTableQuery);
  await inv.create(testRecord);
  const res = await inv.get(TestInvocation, testRecord.id) as TestInvocation;
  await inv.rollback();
  t.is(res.id, 1);
  t.is(res.name, 'world test record');
});

test('delete: can delete record given object mapping', async t => {
  const inv = await createConnectionAndInvoke();
  const testRecord = new TestInvocation();
  testRecord.name = 'bingoWasHisNameO';
  await inv.begin();
  await inv.query(createTableQuery);
  await inv.create(testRecord);
  await inv.delete(testRecord)
  const err = await t.throws(inv.get(TestInvocation, testRecord.id));
  t.truthy(err);
  await inv.rollback();
});

test('createMany: adds multiple objects', async t => {
  const data = createManyRecords(5);
  const inv = await createConnectionAndInvoke();
  await inv.begin();
  await inv.createMany(data);
  const res = await inv.query('SELECT * from test_invocation');
  t.is(res.results.rowCount, 5);
  t.is(res.results.rows.map((e) => e.name), ['item1', 'item2', 'item3', 'item4', 'item5']);
  await inv.rollback();
});

test('createMany: throws an error if all objects are not of same type', async t => {
  const data: any = createManyRecords(3);
  data.push(new TestDifferent());
  const inv = await createConnectionAndInvoke();
  await inv.begin();
  const err = await t.throws(inv.createMany(data));
  t.truthy(err);
  t.is(err.message, 'createMany requires the objects to all be of the same type');
  await inv.rollback();
});
