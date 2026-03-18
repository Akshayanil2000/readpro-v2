const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function normalizeGeminiError(error) {
    const status = error?.status;
    const message = error?.message || error?.toString?.() || 'Unknown Gemini error';
    return { status, message };
}

function validateAIPayload(payload) {
    if (!payload || typeof payload !== 'object') return 'Model output is not an object';
    if (typeof payload.title !== 'string' || payload.title.trim().length === 0) return 'Missing title';
    if (typeof payload.content !== 'string' || payload.content.trim().length === 0) return 'Missing content';
    if (!Array.isArray(payload.quiz) || payload.quiz.length === 0) return 'Missing quiz array';

    for (const q of payload.quiz) {
        if (!q || typeof q !== 'object') return 'Quiz item is not an object';
        if (typeof q.id !== 'string' || q.id.trim().length === 0) return 'Quiz item missing id';
        if (typeof q.question !== 'string' || q.question.trim().length === 0) return 'Quiz item missing question';
        if (!Array.isArray(q.options) || q.options.length !== 4) return 'Quiz item must have exactly 4 options';
        if (q.options.some((o) => typeof o !== 'string' || o.trim().length === 0)) return 'Quiz options must be non-empty strings';
        if (typeof q.correctAnswer !== 'string' || q.correctAnswer.trim().length === 0) return 'Quiz item missing correctAnswer';
        if (!q.options.includes(q.correctAnswer)) return 'Quiz correctAnswer must be one of options';
    }
    return null;
}

/**
 * STRATEGY: PURE AI Integration for Assessment only.
 * No caching, no fallbacks, direct Studio integration.
 */
const generateAIPassage = async (skillFocus, difficulty, userInterests = 'general settings') => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing');
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
        Act as an Elite Reading Specialist. 
        Generate a reading assessment on the topic: "${userInterests}".
        Focus area: ${skillFocus}.
        Level: ${difficulty}.

        Passage: Approximately 300 words, high quality.
        Quiz: Exactly 6 multiple choice questions.

        Return valid JSON:
        {
          "title": "string",
          "content": "string",
          "quiz": [
            { "id": "q1", "question": "string", "options": ["A","B","C","D"], "correctAnswer": "A" }
          ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json|```/gi, '').trim();
        const parsed = JSON.parse(cleanedText);

        const validationErr = validateAIPayload(parsed);
        if (validationErr) throw new Error(`AI generated invalid payload: ${validationErr}`);

        return { ...parsed, source: 'gemini' };
    } catch (error) {
        const { status, message } = normalizeGeminiError(error);
        const e = new Error(`AI Session Failed: ${message}`);
        e.status = status || 500;
        throw e;
    }
};

module.exports = { generateAIPassage };
