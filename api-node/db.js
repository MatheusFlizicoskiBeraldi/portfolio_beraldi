const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    socketPath: '/run/mysqld/mysqld.sock',
    user: 'dwii_user',
    password: 'dwii2026',
    database: 'dwii_db'
});

GPUShaderModule.exports = pool;