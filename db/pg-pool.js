
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});
console.log("Pool created with:", process.env.DATABASE_URL);
module.exports = pool;