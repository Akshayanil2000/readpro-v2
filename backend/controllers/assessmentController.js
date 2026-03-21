const db = require('../config/db');
const crypto = require('crypto');
const { generateAIPassage } = require('../services/aiService');
const { updateSkills } = require('../services/skillEngine');

const generateDynamicAssessment = async (category, level) => {
    const difficulty =
        level === '1' || /beginner/i.test(level) ? 'Beginner' : level === '3' || /expert|advanced/i.test(level) ? 'Advanced' : 'Intermediate';

    // Assessment is comprehension-focused AI only (Gemini)
    return generateAIPassage('Comprehension', difficulty, category);
};

const getPassage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows: survey } = await db.query(
            'SELECT "preferredType", "selfRating" FROM "SurveyResponse" WHERE "userId" = $1',
            [userId]
        );
        const category = survey.length > 0 ? survey[0].preferredType : 'General Knowledge';
        const level = survey.length > 0 ? survey[0].selfRating : 'Intermediate';

        const assessment = await generateDynamicAssessment(category, level);
        const quizOnly = assessment.quiz.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
        }));
        const correctAnswers = assessment.quiz.map(q => ({
            id: q.id,
            answer: q.correctAnswer
        }));

        await db.query(
            `INSERT INTO "DynamicAssessmentSession" ("userId", "passageTitle", "passageContent", "quizData", "correctAnswers")
             VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
             ON CONFLICT ("userId") DO UPDATE SET
                "passageTitle" = EXCLUDED."passageTitle",
                "passageContent" = EXCLUDED."passageContent",
                "quizData" = EXCLUDED."quizData",
                "correctAnswers" = EXCLUDED."correctAnswers"`,
            [userId, assessment.title, assessment.content, JSON.stringify(quizOnly), JSON.stringify(correctAnswers)]
        );

        const wordCount = assessment.content.trim().split(/\s+/).length;
        res.json({
            title: assessment.title,
            content: assessment.content,
            wordCount: wordCount
        });
    } catch (error) {
        console.error('Get passage error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const submitReadingTime = async (req, res) => {
    try {
        const { timeTakenSeconds } = req.body;
        const userId = req.user.id;
        const { rows: session } = await db.query(
            'SELECT "passageContent", "quizData" FROM "DynamicAssessmentSession" WHERE "userId" = $1',
            [userId]
        );
        if (session.length === 0) return res.status(404).json({ message: 'Session not found' });

        const wordCount = session[0].passageContent.trim().split(/\s+/).length;
        const wpm = Math.round((wordCount / timeTakenSeconds) * 60);

        res.json({
            wpm,
            quiz: session[0].quizData // JSONB is auto-parsed by pg driver
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const submitAssessment = async (req, res) => {
    try {
        const { wpm, answers } = req.body;
        const userId = req.user.id;
        const { rows: session } = await db.query(
            'SELECT "correctAnswers" FROM "DynamicAssessmentSession" WHERE "userId" = $1',
            [userId]
        );
        if (session.length === 0) return res.status(404).json({ message: 'Session not found' });
        
        const correctAnswersList = session[0].correctAnswers; // JSONB is auto-parsed
        let correctCount = 0;
        answers.forEach(userAns => {
            const match = correctAnswersList.find(c => c.id == userAns.id);
            if (match && match.answer === userAns.answer) correctCount++;
        });

        const accuracy = (correctCount / correctAnswersList.length) * 100;
        let levelAssigned = accuracy > 80 && wpm > 200 ? 'Advanced' : (accuracy > 50 ? 'Intermediate' : 'Beginner');

        await db.query(
            'INSERT INTO "Assessment" (id, "userId", wpm, accuracy, "levelAssigned") VALUES ($1, $2, $3, $4, $5)',
            [crypto.randomUUID(), userId, wpm, accuracy, levelAssigned]
        );

        await db.query(
            'UPDATE "User" SET "currentLevel" = $1, "avgWpm" = $2, "avgAccuracy" = $3 WHERE id = $4',
            [levelAssigned, wpm, accuracy, userId]
        );

        // Update all 4 skills at once for dashboard consistency
        const normalizedSpeed = Math.min(100, (wpm / 250) * 100);
        await updateSkills(userId, [
            { skill: 'speed', score: normalizedSpeed },
            { skill: 'comprehension', score: accuracy },
            { skill: 'vocabulary', score: accuracy },
            { skill: 'inference', score: accuracy }
        ]);

        await db.query('DELETE FROM "DynamicAssessmentSession" WHERE "userId" = $1', [userId]);

        res.json({ wpm, accuracy, levelAssigned, correctCount, totalQuestions: correctAnswersList.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAssessmentHistory = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id, wpm, accuracy, "levelAssigned", "createdAt" FROM "Assessment" WHERE "userId" = $1 ORDER BY "createdAt" ASC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPassage, submitReadingTime, submitAssessment, getAssessmentHistory };
