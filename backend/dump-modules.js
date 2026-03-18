require('dotenv').config();
const pool = require('./config/db');

async function dump() {
    try {
        const { rows } = await pool.query('SELECT title, "quizData", "correctAnswers" FROM "Module"');
        rows.forEach(r => {
            console.log(`\n--- Module: ${r.title} ---`);
            console.log('QuizData Type:', typeof r.quizData);
            console.log('QuizData:', JSON.stringify(r.quizData));
            console.log('CorrectAnswers Type:', typeof r.correctAnswers);
            console.log('CorrectAnswers:', JSON.stringify(r.correctAnswers));
        });
    } catch (err) {
        console.error(err);
    }
    process.exit();
}
dump();
