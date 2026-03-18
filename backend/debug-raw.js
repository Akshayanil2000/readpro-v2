require('dotenv').config();
const pool = require('./config/db');

async function debug() {
    try {
        const { rows } = await pool.query('SELECT title, "quizData"::text as raw_quiz FROM "Module"');
        rows.forEach(r => {
            console.log(`\n--- ${r.title} ---`);
            console.log('RAW JSONB STRING:', r.raw_quiz);
        });
    } catch (err) {
        console.error(err);
    }
    process.exit();
}
debug();
