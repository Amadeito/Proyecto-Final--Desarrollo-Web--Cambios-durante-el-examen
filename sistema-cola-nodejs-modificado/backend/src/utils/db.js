const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool;

async function connect() {
  if (pool) return pool;
  pool = await sql.connect(config);
  return pool;
}

module.exports = { connect, sql };
