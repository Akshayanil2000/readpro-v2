require('dotenv').config();
const pool = require('./config/db');

async function debug() {
    console.log('\n--- CHECKING All Table Column Types ---');
    try {
        const { rows } = await pool.query(`
            SELECT table_name, column_name, udt_name 
            FROM information_schema.columns 
            WHERE table_name IN ('LearningSession', 'DynamicAssessmentSession', 'Module')
            AND column_name IN ('quizData', 'correctAnswers')
        `);
        console.table(rows);
    } catch (err) {
        console.error(err);
    }
    process.exit();
}
debug();
