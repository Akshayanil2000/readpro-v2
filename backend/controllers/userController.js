const db = require('../config/db');
const crypto = require('crypto');

// @desc    Submit onboarding survey data
// @route   POST /api/user/onboarding
// @access  Private
const submitOnboardingSurvey = async (req, res) => {
    try {
        const { readingFrequency, preferredType, selfRating } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!readingFrequency || !preferredType || !selfRating) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const surveyId = crypto.randomUUID();

        // Atomic UPSERT: Insert new record, or update if userId already exists
        const result = await db.query(
            `INSERT INTO "SurveyResponse" (id, "userId", "readingFrequency", "preferredType", "selfRating") 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT ("userId") 
             DO UPDATE SET 
                "readingFrequency" = EXCLUDED."readingFrequency",
                "preferredType" = EXCLUDED."preferredType",
                "selfRating" = EXCLUDED."selfRating"
             RETURNING *`,
            [surveyId, userId, readingFrequency, preferredType, selfRating]
        );

        res.status(200).json({
            message: 'Onboarding survey saved successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Survey submission error:', error);
        res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
    }
};

// @desc    Get user profile/dashboard data
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get base user data
        const { rows: userRows } = await db.query(
            'SELECT id, name, email, "currentLevel", "avgWpm", "avgAccuracy", "createdAt" FROM "User" WHERE id = $1',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userRows[0];
        const currentLevel = user.currentLevel;

        // 2. Get latest assessment for Latest WPM & Accuracy if available
        const { rows: latestAssesmentRows } = await db.query(
            'SELECT wpm, accuracy FROM "Assessment" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
            [userId]
        );
        const latestAssessment = latestAssesmentRows.length > 0 ? latestAssesmentRows[0] : null;

        // 3. Calculate Level Progress (Modules Completed vs Available for the level)
        // We need to count how many modules exist for this level
        const { rows: modulesForLevel } = await db.query(
            'SELECT id, title, "estimatedTime" FROM "Module" WHERE level = $1',
            [currentLevel]
        );

        // Count how many distinct modules the user has completed for this level
        const { rows: completedModulesRows } = await db.query(
            `SELECT DISTINCT m.id 
             FROM "ModuleCompletion" mc 
             JOIN "Module" m ON mc."moduleId" = m.id 
             WHERE mc."userId" = $1 AND m.level = $2`,
            [userId, currentLevel]
        );

        const totalModulesForLevel = modulesForLevel.length;
        // In the MVP, a level might have 5 modules. If there are no modules yet, avoid NaN.
        const completedModulesCount = completedModulesRows.length;
        const progressPercentage = totalModulesForLevel === 0 ? 0 : Math.round((completedModulesCount / totalModulesForLevel) * 100);

        // 4. Get Performance Data (Recent Assessments and Module Completions combined for graphing)
        // We'll extract only WPM and Accuracy history
        const { rows: performanceRows } = await db.query(
            `SELECT wpm, accuracy, "createdAt" FROM "Assessment" WHERE "userId" = $1
             UNION ALL
             SELECT wpm, accuracy, "completedAt" as "createdAt" FROM "ModuleCompletion" WHERE "userId" = $1
             ORDER BY "createdAt" ASC LIMIT 10`,
            [userId]
        );

        // Map results
        res.json({
            user: {
                ...user,
                latestWpm: latestAssessment ? latestAssessment.wpm : user.avgWpm,
                latestAccuracy: latestAssessment ? latestAssessment.accuracy : user.avgAccuracy,
            },
            levelProgress: {
                completed: completedModulesCount,
                total: totalModulesForLevel > 0 ? totalModulesForLevel : 5, // Fallback to 5 if DB empty
                percentage: progressPercentage,
            },
            availableModules: modulesForLevel,
            performanceGraph: performanceRows.map(row => ({
                wpm: row.wpm,
                accuracy: row.accuracy,
                date: row.createdAt
            }))
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
    }
};

module.exports = {
    submitOnboardingSurvey,
    getUserProfile
};
