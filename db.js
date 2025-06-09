// LIGAÇÃO SIMPLES DO BANCO DE DADOS (ESModules)

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'portal_etv',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
