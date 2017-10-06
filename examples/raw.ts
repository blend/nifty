import { Client } from "pg";

async function main(cb) {
  const client = new Client();

  await client.connect();

  const res = await client.query("select 'ok!'");

  console.log(res.rows[0]);

  await client.end();
  cb();
}

main(function() {
  console.log("done");
});
