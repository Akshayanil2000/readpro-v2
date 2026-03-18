const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAll() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The listModels method isn't directly on GenAI instance sometimes depending on SDK version
        // or uses a different manager.
        // Actually, in the latest @google/generative-ai, we use the client directly:
        // But for a quick test, let's just try the most common names.
        const models = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-1.0-pro'];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("test");
                console.log(`MODEL ${m}: WORKING`);
            } catch (e) {
                console.log(`MODEL ${m}: FAILED (${e.status || e.message})`);
            }
        }
    } catch (err) {
        console.error('List FAILED:', err.message);
    }
}

listAll();
