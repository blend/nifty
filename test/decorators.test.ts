import test from 'ava';
import { Connection } from '../src/connection';
import { Invocation } from '../src/invocation';
import { Table, Column } from '../src/decorators';
import { connectionConfig } from './testConfig';

function deanonymizeObj(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

const createTableQueryTestData =
  'CREATE TABLE IF NOT EXISTS test_invocation (id serial not null, name varchar(255) not null, test boolean)';
@Table('test_invocation')
class TestData {
  @Column('id', { PrimaryKey: true, Serial: true })
  id: number;

  @Column('name') notName: string;

  @Column() test: boolean;
}

const createTableQuerytest_name =
  'CREATE TABLE IF NOT EXISTS test_name (id serial not null, name varchar(255), branch boolean)';
@Table()
class test_name {
  @Column(undefined, { PrimaryKey: true, Serial: true })
  id: number;

  @Column() name: string;

  @Column('branch', { ReadOnly: true })
  branch: boolean;
}

async function createConnectionAndInvoke() {
  const conn = new Connection(connectionConfig);
  conn.open();
  return await conn.invoke();
}

test('decorators', async t => {
  const inv = await createConnectionAndInvoke();
  const testRecord = new TestData();
  testRecord.notName = 'bingoWasHisNameO';
  testRecord.test = false;
  const testName = new test_name();
  testName.name = 'lmaokar';
  testName.branch = true;
  await inv.begin();
  await inv.query(createTableQueryTestData);
  await inv.query(createTableQuerytest_name);
  await inv.create(testRecord);
  await inv.create(testName);
  t.deepEqual(deanonymizeObj(await inv.get(TestData, testRecord.id)), deanonymizeObj(testRecord));
  const expectedRes = {
    id: testName.id,
    name: 'lmaokar'
  };
  t.deepEqual(deanonymizeObj(await inv.get(test_name, testName.id)), expectedRes);
  await inv.rollback();
});
