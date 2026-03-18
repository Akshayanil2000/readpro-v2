const db = require('../config/db');
const crypto = require('crypto');
const { getRecommendation } = require('../services/recommendationEngine');
const { updateSkills } = require('../services/skillEngine');
const { calculateStreak, calculateWeeklyProgress } = require('../utils/statCalculators');

// @desc    Get dashboard metrics and current recommendation
// @route   GET /api/user/dashboard
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch User Profile
        const { rows: userRows } = await db.query(
            'SELECT name, email, "currentLevel" FROM "User" WHERE id = $1',
            [userId]
        );

        // 2. Fetch Skills (Ensure baseline object if missing)
        const { rows: skillRows } = await db.query(
            'SELECT speed, comprehension, vocabulary, inference FROM "UserSkill" WHERE "userId" = $1',
            [userId]
        );
        const userSkills = skillRows[0] || { speed: 0, comprehension: 0, vocabulary: 0, inference: 0 };

        // 3. Get Engine Recommendation
        const recommendation = await getRecommendation(userId);

        // 4. Fetch Stats (Calc real sessions, streak and progress)
        // We look across LearningSessions AND initial Assessments
        const { rows: activityData } = await db.query(
            `SELECT "createdAt", wpm FROM "LearningSession" WHERE "userId" = $1 AND accuracy IS NOT NULL
             UNION ALL
             SELECT "createdAt", wpm FROM "Assessment" WHERE "userId" = $1`,
            [userId]
        );

        const dates = activityData.map(row => row.createdAt);
        const wpmValues = activityData.filter(row => row.wpm > 0).map(row => row.wpm);
        const avgWpm = wpmValues.length > 0 ? Math.round(wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length) : 0;
        const totalUniqueDays = new Set(dates.map(d => {
            const date = new Date(d);
            return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        })).size;

        const streak = calculateStreak(dates);
        const weeklyProgress = calculateWeeklyProgress(dates);

        const stats = {
            totalSessions: dates.length,
            avgWpm: avgWpm,
            totalDays: totalUniqueDays,
            streak: streak,
            weeklyProgress: weeklyProgress,
            weakArea: recommendation.weakArea || 'Comprehension'
        };

        console.log(`\n--- DASHBOARD DATA SYNC ---`);
        console.log(`User ID: ${userId}`);
        console.log(`Email ID: ${userRows[0]?.email}`);
        console.log(`Sessions: ${stats.totalSessions}, AvgWPM: ${stats.avgWpm}, Days: ${stats.totalDays}`);
        console.log(`Skills: Speed:${userSkills.speed}%, Comp:${userSkills.comprehension}%, Vocab:${userSkills.vocabulary}%, Inf:${userSkills.inference}%`);
        console.log(`Recommendation: ${recommendation.skillFocus} (${recommendation.difficulty})`);
        console.log(`Weak Area Sync: ${stats.weakArea}`);
        console.log('----------------------------\n');

        const trainingGuide = {
            Speed: "Move your eyes in groups of words; don't read them individually. Avoid pronouncing words in your head (subvocalization).",
            Comprehension: "Focus on identifying the 'Main Idea' of each paragraph. Mentally summarize every section in one sentence.",
            Vocabulary: "Don't stop reading for difficult words. Use context clues from surrounding sentences to deduce meaning in real-time.",
            Inference: "Read 'between the lines.' Ask yourself: Why did the author write this? What is their hidden tone or intention?"
        };

        res.json({
            user: userRows[0],
            skills: userSkills,
            recommendation,
            stats,
            trainingGuide
        });
    } catch (error) {
        console.error('Dashboard Data Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Start a new recommended learning session
// @route   POST /api/learning/start
const startSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillFocus, difficulty } = req.body;

        // 1. Get user interest for personalization
        const { rows: survey } = await db.query(
            'SELECT "preferredType" FROM "SurveyResponse" WHERE "userId" = $1',
            [userId]
        );
        const interest = survey.length > 0 ? survey[0].preferredType : 'General Knowledge';

        // 2. SMART SELECTION FROM POOL (Excluding already completed modules)
        const { rows: modules } = await db.query(
            `SELECT * FROM "Module" 
             WHERE "skillFocus" = $1 AND level = $2 
             AND id NOT IN (SELECT "moduleId" FROM "ModuleCompletion" WHERE "userId" = $3)
             ORDER BY RANDOM() LIMIT 1`,
            [skillFocus, difficulty, userId]
        );

        let content;
        if (modules.length > 0) {
            console.log(`[CONTENT POOL] Precise Hit for ${skillFocus}/${difficulty} (New Content)`);
            content = modules[0];
        } else {
            // Fallback: AI Generation to make it "Never Ending"
            try {
                console.log(`[CONTENT POOL] No new modules. Invoking AI for ${skillFocus}/${difficulty}`);
                const { generateAIPassage } = require('../services/aiService');
                const aiAssessment = await generateAIPassage(skillFocus, difficulty, interest);
                
                content = {
                    title: aiAssessment.title,
                    content: aiAssessment.content,
                    skillFocus: skillFocus, // Preserve the requested focus
                    level: difficulty,
                    quizData: aiAssessment.quiz,
                    correctAnswers: aiAssessment.quiz.map(q => ({ id: q.id, answer: q.correctAnswer })),
                    source: 'gemini'
                };
            } catch (aiError) {
                console.error('[AI FALLBACK FAILED]', aiError);
                // Last resort: Get any random module even if repeated
                const { rows: anyModule } = await db.query('SELECT * FROM "Module" ORDER BY RANDOM() LIMIT 1');
                if (anyModule.length === 0) throw new Error('No learning modules available.');
                content = anyModule[0];
            }
        }

        // 3. Store the session (referencing the module)
        const sessionId = crypto.randomUUID();
        await db.query(
            `INSERT INTO "LearningSession" (id, "userId", "skillFocus", difficulty, "passageTitle", "passageContent", "quizData", "correctAnswers")
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)`,
            [
                sessionId, 
                userId, 
                content.skillFocus, 
                content.level, 
                content.title, 
                content.content, 
                JSON.stringify(content.quizData), 
                JSON.stringify(content.correctAnswers)
            ]
        );

        res.json({
            sessionId,
            title: content.title,
            content: content.content,
            quiz: content.quizData,
            wordCount: content.content.trim().split(/\s+/).length,
            source: content.source || 'pool'
        });
    } catch (error) {
        console.error('Start Session Error:', error);
        res.status(error.status || 500).json({
            message: 'Failed to start session',
            error: error.message || 'Unknown error'
        });
    }
};

// @desc    Submit quiz and update user skills
// @route   POST /api/learning/submit
const submitSessionResults = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId, wpm, answers } = req.body;

        // 1. Fetch session record
        const { rows: sessionRows } = await db.query(
            'SELECT * FROM "LearningSession" WHERE id = $1 AND "userId" = $2',
            [sessionId, userId]
        );

        if (sessionRows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = sessionRows[0];
        const correctAnswers = session.correctAnswers;

        // 2. Calculate accuracy
        let correctCount = 0;
        answers.forEach(ans => {
            const match = correctAnswers.find(c => c.id === ans.id);
            if (match && match.answer === ans.answer) correctCount++;
        });

        const accuracy = (correctCount / correctAnswers.length) * 100;

        // 3. Update the session record with performance
        await db.query(
            'UPDATE "LearningSession" SET wpm = $1, accuracy = $2 WHERE id = $3',
            [wpm, accuracy, sessionId]
        );

        // 4. TRIGGER SKILL ENGINE
        // We use accuracy for most skills, speed for speed focus
        let skillMetric = accuracy;
        if (session.skillFocus === 'Speed') {
            // Normalized speed calculation (e.g., 200 WPM = 80%)
            skillMetric = Math.min(100, (wpm / 250) * 100);
        }

        await updateSkills(userId, {
            skill: session.skillFocus,
            score: skillMetric
        });

        // 5. MARK MODULE AS COMPLETED (to prevent repeat in Smart Pool)
        // Find the module ID by title (since we didn't store moduleId in session yet)
        const { rows: modOrigin } = await db.query('SELECT id FROM "Module" WHERE title = $1', [session.passageTitle]);
        if (modOrigin.length > 0) {
            await db.query(
                'INSERT INTO "ModuleCompletion" (id, "userId", "moduleId", wpm, accuracy) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                [crypto.randomUUID(), userId, modOrigin[0].id, wpm, accuracy]
            );
        }

        res.json({
            message: 'Session completed',
            wpm: Math.round(wpm),
            accuracy: Math.round(accuracy),
            skillFocus: session.skillFocus,
            correctCount,
            totalQuestions: correctAnswers.length,
            improvement: '+3.2%',
            feedback: [
                { 
                    type: accuracy > 70 ? 'success' : 'warning', 
                    text: accuracy > 70 ? "Excellent comprehension! Your focus is sharp." : "Try reading the passage again to catch missed details.",
                    icon: accuracy > 70 ? 'check' : 'priority-high'
                },
                { 
                    type: 'info', 
                    text: wpm > 150 ? "Your reading pace is optimal for this level." : "Working on eye-movement techniques could boost your speed.", 
                    icon: 'lightbulb' 
                }
            ]
        });
    } catch (error) {
        console.error('Submit Session Error:', error);
        res.status(500).json({ message: 'Failed to submit results' });
    }
};

// @desc    Get detailed insights / performance history
// @route   GET /api/learning/insights
const getInsights = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch Skill Progress with history
        const { rows: skillRows } = await db.query(
            'SELECT speed, comprehension, vocabulary, inference FROM "UserSkill" WHERE "userId" = $1',
            [userId]
        );

        // 2. Fetch last 10 sessions for charts
        const { rows: sessionHistory } = await db.query(
            `SELECT wpm, accuracy, "skillFocus", "createdAt" 
             FROM "LearningSession" 
             WHERE "userId" = $1 AND accuracy IS NOT NULL
             ORDER BY "createdAt" DESC LIMIT 10`,
            [userId]
        );

        // 3. Simple Weekly Summary logic
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const { rows: lastWeekCount } = await db.query(
            'SELECT COUNT(*) FROM "LearningSession" WHERE "userId" = $1 AND "createdAt" > $2',
            [userId, oneWeekAgo]
        );

        res.json({
            skills: skillRows[0] || { speed: 0, comprehension: 0, vocabulary: 0, inference: 0 },
            history: sessionHistory.reverse(), // For chronological charts
            weeklySummary: {
                sessionsCompleted: parseInt(lastWeekCount[0].count),
                improvement: '+12%', // Mock calculation for now
                focusArea: 'Inference'
            }
        });
    } catch (error) {
        console.error('Insights Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardData,
    getInsights,
    startSession,
    submitSessionResults
};

