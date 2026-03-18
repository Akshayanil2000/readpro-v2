require('dotenv').config();
const pool = require('./config/db');

async function debug() {
    console.log('--- DEBUG START ---');
    try {
        // 1. Check Module Table Schema
        console.log('\n[1] Checking Module Table Columns:');
        const { rows: cols } = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Module'
        `);
        console.table(cols);

        // 2. Check LearningSession Table Schema
        console.log('\n[2] Checking LearningSession Table Columns:');
        const { rows: lsCols } = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'LearningSession'
        `);
        console.table(lsCols);

        // 3. Check UserSkill Sample
        console.log('\n[3] Checking UserSkill Data:');
        const { rows: skills } = await pool.query('SELECT * FROM "UserSkill" LIMIT 5');
        console.table(skills);

        // 4. Test a Module fetch
        console.log('\n[4] Testing Module fetch:');
        const { rows: mods } = await pool.query('SELECT * FROM "Module" LIMIT 1');
        if (mods.length > 0) {
            console.log('Title:', mods[0].title);
            console.log('QuizData Type:', typeof mods[0].quizData);
            console.log('QuizData Value:', JSON.stringify(mods[0].quizData).slice(0, 100));
        }

    } catch (err) {
        console.error('Debug failed:', err);
    }
    console.log('\n--- DEBUG END ---');
}

debug().then(() => process.exit());
