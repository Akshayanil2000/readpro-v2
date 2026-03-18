require('dotenv').config();
const pool = require('./config/db');

async function migrate() {
    console.log('🔄 Migrating DynamicAssessmentSession columns to JSONB...');
    try {
        // 1. Drop the table and recreate it correctly (Safe because it's dynamic/temporary session data)
        await pool.query('DROP TABLE IF EXISTS "DynamicAssessmentSession"');
        
        await pool.query(`
            CREATE TABLE "DynamicAssessmentSession" (
                "userId" TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
                "passageTitle" TEXT NOT NULL,
                "passageContent" TEXT NOT NULL,
                "quizData" JSONB NOT NULL,
                "correctAnswers" JSONB NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    }
    process.exit();
}
migrate();
