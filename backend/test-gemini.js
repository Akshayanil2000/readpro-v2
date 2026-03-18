const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent("Hello, respond with 'OK' if you see this.");
        console.log('Gemini Response:', result.response.text());
    } catch (err) {
        console.error('Gemini Test FAILED:', err.message);
        if (err.status) console.error('Status Code:', err.status);
    }
}

testGemini();
