require('dotenv').config();
const pool = require('./config/db');

async function debug() {
    console.log('\n--- CHECKING DynamicAssessmentSession DB TYPES ---');
    try {
        const { rows: lsCols } = await pool.query(`
            SELECT column_name, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'DynamicAssessmentSession'
        `);
        console.table(lsCols);

        const { rows: sample } = await pool.query('SELECT * FROM "DynamicAssessmentSession" LIMIT 1');
        if (sample.length > 0) {
            console.log('User:', sample[0].userId);
            console.log('quizData TYPE (RAW):', typeof sample[0].quizData);
            console.log('quizData VALUE (RAW):', sample[0].quizData);
        }
    } catch (err) {
        console.error(err);
    }
    process.exit();
}
debug();
