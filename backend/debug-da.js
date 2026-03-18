require('dotenv').config();
const pool = require('./config/db');

async function debug() {
    try {
        const { rows } = await pool.query('SELECT * FROM "DynamicAssessmentSession" LIMIT 5');
        rows.forEach(r => {
            console.log(`\n--- User: ${r.userId} ---`);
            console.log('QuizData Type:', typeof r.quizData);
            console.log('QuizData:', JSON.stringify(r.quizData));
        });
    } catch (err) {
        console.log('Error querying DynamicAssessmentSession:', err.message);
    }
    process.exit();
}
debug();
