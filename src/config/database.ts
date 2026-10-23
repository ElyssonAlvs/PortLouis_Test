import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const dbPort = Number(process.env.DB_PORT || 3306);

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.isNaN(dbPort) ? 3306 : dbPort,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? 'root',
  database: process.env.DB_NAME || 'contatos_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
