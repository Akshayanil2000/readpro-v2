require('dotenv').config();
const pool = require('./config/db');
const crypto = require('crypto');

async function seed() {
    console.log('🌱 Seeding initial content pool...');
    
    const modules = [
        {
            id: crypto.randomUUID(),
            title: 'The Silent Giants: Ocean Ecology',
            level: 'Intermediate',
            skillFocus: 'Comprehension',
            topic: 'Science',
            content: 'Whales play a crucial role in maintaining the health of our oceans. By moving massive amounts of nutrients between the deep sea and the surface, they act as ocean fertilizers. This process, often called the “whale pump,” supports the growth of phytoplankton, which in turn feeds thousands of other marine species. Protecting these giants is not just about animal conservation; it is about protecting the very lungs of our planet, as phytoplankton produce over half of the earth’s oxygen.',
            quizData: [
                { id: 'q1', question: 'What is the “whale pump”?', options: ['A way to clean trash', 'Moving nutrients between depths', 'Whale communication', 'Whale migration routes'] },
                { id: 'q2', question: 'How much of Earth’s oxygen is produced by phytoplankton?', options: ['None', 'Around 10%', 'Over 50%', 'Exactly 100%'] },
                { id: 'q3', question: 'Whales support the growth of:', options: ['Trees', 'Coral reefs', 'Phytoplankton', 'Sharks'] },
                { id: 'q4', question: 'Why are whales called ocean fertilizers?', options: ['They plant seeds', 'They move nutrients from deep sea', 'They produce oxygen directy', 'They eat phytoplankton'] },
                { id: 'q5', question: 'The term "whale pump" refers to:', options: ['Heart movement', 'Vertical nutrient transfer', 'Breathing mechanism', 'Swimming speed'] },
                { id: 'q6', question: 'Which species feeds on phytoplankton?', options: ['Only whales', 'Marine species', 'Trees', 'Land animals'] }
            ],
            correctAnswers: [
                { id: 'q1', answer: 'Moving nutrients between depths' },
                { id: 'q2', answer: 'Over 50%' },
                { id: 'q3', answer: 'Phytoplankton' },
                { id: 'q4', answer: 'They move nutrients from deep sea' },
                { id: 'q5', answer: 'Vertical nutrient transfer' },
                { id: 'q6', answer: 'Marine species' }
            ]
        },
        {
            id: crypto.randomUUID(),
            title: 'The Paradox of Choice',
            level: 'Advanced',
            skillFocus: 'Inference',
            topic: 'Psychology',
            content: 'Modern society prides itself on maximizing consumer choice. However, having too many options can lead to "choice paralysis." When faced with fifty types of jam, a shopper is statistically less likely to make a purchase than when faced with only six. Even if they do pick one, their satisfaction is often lower because they wonder if one of the forty-nine other choices would have been better. This suggests that the secret to happiness may lie in setting artificial boundaries.',
            quizData: [
                { id: 'q1', question: 'What does "choice paralysis" imply?', options: ['Physical inability to move', 'Difficulty making a decision', 'Buying more items', 'Improved shopper happiness'] },
                { id: 'q2', question: 'According to the text, more choice often leads to:', options: ['Greater satisfaction', 'Faster shopping', 'Less purchase likelihood', 'Increased jam production'] },
                { id: 'q3', question: 'Setting artificial boundaries is:', options: ['Bad for business', 'A secret to happiness', 'Forced by the government', 'Unfair to shoppers'] },
                { id: 'q4', question: 'Satisfaction is lower with more choices because:', options: ['Items are too expensive', 'They worry about missed options', 'Fifty jams are too sweet', 'Purchase takes longer'] },
                { id: 'q5', question: 'The example of the jam shopper showed that:', options: ['Six options are better than fifty', 'People love unlimited choice', 'Fifty jams sell faster', 'Shoppers prefer no jam'] },
                { id: 'q6', question: 'The text suggests modern society may be:', options: ['Overvaluing choice', 'Undervalueing jam', 'Too fast at shopping', 'Perfectly happy'] }
            ],
            correctAnswers: [
                { id: 'q1', answer: 'Difficulty making a decision' },
                { id: 'q2', answer: 'Less purchase likelihood' },
                { id: 'q3', answer: 'A secret to happiness' },
                { id: 'q4', answer: 'They worry about missed options' },
                { id: 'q5', answer: 'Six options are better than fifty' },
                { id: 'q6', answer: 'Overvaluing choice' }
            ]
        },
        {
            id: crypto.randomUUID(),
            title: 'Ancient Trade Routes',
            level: 'Beginner',
            skillFocus: 'Vocabulary',
            topic: 'History',
            content: 'The Silk Road was not just one road. It was a network of many trails that connected Europe to Asia. Traders carried silk, spices, and tea on camels and horses. They braved long deserts and high mountains. Along the way, they exchanged not only goods but also ideas and inventions. This made the world feel much closer even though travel took many months.',
            quizData: [
                { id: 'q1', question: 'What was the Silk Road?', options: ['A literal silk path', 'A network of trails', 'A single long road', 'A desert palace'] },
                { id: 'q2', question: 'What animals were used for trade?', options: ['Elephants', 'Dogs', 'Camels and horses', 'Lions'] },
                { id: 'q3', question: 'What did traders carry besides silk?', options: ['Gold only', 'Spices and tea', 'Ice cream', 'Cars'] },
                { id: 'q4', question: 'The Silk Road connected which regions?', options: ['America and Africa', 'Europe and Asia', 'Mars and Moon', 'Only local cities'] },
                { id: 'q5', question: 'What else was exchanged besides goods?', options: ['Inventions and ideas', 'Sand and rocks', 'Only empty boxes', 'Nothing else'] },
                { id: 'q6', question: 'How did the Silk Road affect the world?', options: ['Made it feel further', 'Made it feel closer', 'Distanced nations', 'No change at all'] }
            ],
            correctAnswers: [
                { id: 'q1', answer: 'A network of trails' },
                { id: 'q2', answer: 'Camels and horses' },
                { id: 'q3', answer: 'Spices and tea' },
                { id: 'q4', answer: 'Europe and Asia' },
                { id: 'q5', answer: 'Inventions and ideas' },
                { id: 'q6', answer: 'Made it feel closer' }
            ]
        }
    ];

    try {
        for (const m of modules) {
            await pool.query(
                `INSERT INTO "Module" (id, title, content, level, "skillFocus", topic, "quizData", "correctAnswers", "estimatedTime") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
                [m.id, m.title, m.content, m.level, m.skillFocus, m.topic, JSON.stringify(m.quizData), JSON.stringify(m.correctAnswers), 5]
            );
        }
        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    }
}

seed().then(() => process.exit());
