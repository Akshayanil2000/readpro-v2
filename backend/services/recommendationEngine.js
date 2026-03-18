const db = require('../config/db');

/**
 * Recommendation Engine
 * Logic:
 * 1. Fetch user's current skills.
 * 2. Identify the lowest score.
 * 3. Look at last 3 sessions to determine difficulty adjustment.
 * 4. Return suggested skill focus and difficulty.
 */
const getRecommendation = async (userId) => {
    try {
        // 1. Fetch skills
        const { rows: skillRows } = await db.query(
            'SELECT speed, comprehension, vocabulary, inference FROM "UserSkill" WHERE "userId" = $1',
            [userId]
        );

        // If no skills record yet, provide a baseline entry assessment
        if (skillRows.length === 0) {
            return {
                skillFocus: 'Comprehension',
                difficulty: 'Medium',
                weakArea: 'Comprehension',
                reason: 'Complete your first assessment to build your reader profile.'
            };
        }

        const skills = skillRows[0];
        const skillEntries = Object.entries(skills);
        
        // 2. Find weakest skill
        // Sort by value ascending
        skillEntries.sort((a, b) => a[1] - b[1]);
        const weakestSkill = skillEntries[0][0]; // the key name

        // 3. Determine difficulty based on recent performance
        const { rows: lastSessions } = await db.query(
            'SELECT accuracy FROM "LearningSession" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 3',
            [userId]
        );

        let suggestedDifficulty = 'Medium';
        if (lastSessions.length > 0) {
            const avgAccuracy = lastSessions.reduce((acc, s) => acc + s.accuracy, 0) / lastSessions.length;
            
            if (avgAccuracy > 85) suggestedDifficulty = 'Hard';
            if (avgAccuracy < 50) suggestedDifficulty = 'Easy';
        }

        const displaySkills = {
            speed: 'Speed',
            comprehension: 'Comprehension',
            vocabulary: 'Vocabulary',
            inference: 'Inference'
        };

        const currentFocus = displaySkills[weakestSkill] || 'Comprehension';

        return {
            skillFocus: currentFocus,
            difficulty: suggestedDifficulty,
            weakArea: currentFocus,
            reason: `Your ${currentFocus} score of ${Math.round(skills[weakestSkill])}% shows room for improvement.`
        };
    } catch (error) {
        console.error('Recommendation Engine Error:', error);
        return {
            skillFocus: 'Comprehension',
            difficulty: 'Medium',
            reason: 'Daily reading practice to maintain consistency'
        };
    }
};

module.exports = { getRecommendation };
