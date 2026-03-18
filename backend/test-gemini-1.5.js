const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try a different Gemini model in case the 2.0 quota is per-model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, respond with 'OK' if you see this.");
        console.log('Gemini 1.5 Response:', result.response.text());
    } catch (err) {
        console.error('Gemini 1.5 Test FAILED:', err.message);
        if (err.status) console.error('Status Code:', err.status);
    }
}

testGemini();
