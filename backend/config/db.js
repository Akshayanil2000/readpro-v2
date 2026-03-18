const { Pool } = require('pg');

// Create a connection pool using DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL;
const shouldUseSsl =
    process.env.DB_SSL !== undefined
        ? process.env.DB_SSL === 'true'
        : /sslmode=require/i.test(connectionString || '');

// Append uselibpqcompat=true to suppress the pg v9 deprecation warning
let pgConnectionString = connectionString;
if (pgConnectionString && pgConnectionString.includes('sslmode=require') && !pgConnectionString.includes('uselibpqcompat')) {
    pgConnectionString = pgConnectionString.replace('sslmode=require', 'sslmode=require&uselibpqcompat=true');
}

const pool = new Pool({
    connectionString: pgConnectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
});

async function initDb() {
    // Keep schema creation minimal and idempotent.
    // This prevents runtime 500s when the database hasn't been migrated yet.
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "User" (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            "currentLevel" TEXT NOT NULL DEFAULT 'Beginner',
            "avgWpm" INT NOT NULL DEFAULT 0,
            "avgAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

    // Create SurveyResponse table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "SurveyResponse" (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id),
            "readingFrequency" TEXT NOT NULL,
            "preferredType" TEXT NOT NULL,
            "selfRating" TEXT NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

    // Create Assessment table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "Assessment" (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL REFERENCES "User"(id),
            wpm INT NOT NULL,
            accuracy DOUBLE PRECISION NOT NULL,
            "levelAssigned" TEXT NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

    // Create Module table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "Module" (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            level TEXT NOT NULL,
            "skillFocus" TEXT NOT NULL,
            topic TEXT NOT NULL,
            "quizData" JSONB NOT NULL,
            "correctAnswers" JSONB NOT NULL,
            "estimatedTime" INT NOT NULL DEFAULT 5
        );
    `);

    // Create ModuleCompletion table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "ModuleCompletion" (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL REFERENCES "User"(id),
            "moduleId" TEXT NOT NULL REFERENCES "Module"(id),
            wpm INT NOT NULL,
            accuracy DOUBLE PRECISION NOT NULL,
            "completedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
    // Create UserSkill table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "UserSkill" (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
            speed DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            comprehension DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            vocabulary DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            inference DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

    // Create LearningSession table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "LearningSession" (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
            "skillFocus" TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            "passageTitle" TEXT NOT NULL,
            "passageContent" TEXT NOT NULL,
            "quizData" JSONB NOT NULL,
            "correctAnswers" JSONB NOT NULL,
            wpm INT,
            accuracy DOUBLE PRECISION,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

    // Create DynamicAssessmentSession table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "DynamicAssessmentSession" (
            "userId" TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
            "passageTitle" TEXT NOT NULL,
            "passageContent" TEXT NOT NULL,
            "quizData" JSONB NOT NULL,
            "correctAnswers" JSONB NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
}

module.exports = pool;
module.exports.initDb = initDb;
