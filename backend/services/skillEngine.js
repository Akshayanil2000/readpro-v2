const db = require('../config/db');
const crypto = require('crypto');

/**
 * Skill Update Engine
 * Formula: newScore = (oldScore * 0.7) + (currentPerformance * 0.3)
 */
const updateSkills = async (userId, sessionPerformance) => {
    // sessionPerformance can be { skill: 'speed', score: 85 } OR an array: [{ skill: 'speed', score: 85 }, ...]
    const performances = Array.isArray(sessionPerformance) ? sessionPerformance : [sessionPerformance];
    
    try {
        // 1. Get current skills
        const { rows } = await db.query(
            'SELECT * FROM "UserSkill" WHERE "userId" = $1',
            [userId]
        );

        const currentSkills = rows[0] || {};
        const updates = [];

        for (const perf of performances) {
            const field = perf.skill.toLowerCase();
            const currentScore = currentSkills[field] || 0;
            const newScore = rows.length === 0 
                ? perf.score // Baseline for first time
                : (currentScore * 0.7) + (perf.score * 0.3);
            
            updates.push({ field, score: parseFloat(newScore.toFixed(2)) });
        }

        if (rows.length === 0) {
            const fieldNames = updates.map(u => `"${u.field}"`).join(', ');
            const placeholders = updates.map((_, i) => `$${i + 3}`).join(', ');
            
            await db.query(
                `INSERT INTO "UserSkill" (id, "userId", ${fieldNames}, "updatedAt") 
                 VALUES ($1, $2, ${placeholders}, NOW())`,
                [crypto.randomUUID(), userId, ...updates.map(u => u.score)]
            );
        } else {
            const setClause = updates.map((u, i) => `"${u.field}" = $${i + 1}`).join(', ');
            await db.query(
                `UPDATE "UserSkill" SET ${setClause}, "updatedAt" = NOW() WHERE "userId" = $${updates.length + 1}`,
                [...updates.map(u => u.score), userId]
            );
        }
    } catch (error) {
        console.error('Skill Engine Update Error:', error);
    }
};

module.exports = { updateSkills };
