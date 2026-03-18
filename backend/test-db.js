const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testConn() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('DB Connection SUCCESSFUL:', res.rows[0]);
    } catch (err) {
        console.error('DB Connection FAILED:', err.message);
    } finally {
        await pool.end();
    }
}

testConn();
