const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const { rows: existing } = await db.query(
            'SELECT id FROM "User" WHERE email = $1',
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const createResult = await db.query(
            'INSERT INTO "User" (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, "currentLevel"',
            [crypto.randomUUID(), name, email, hashedPassword]
        );
        const user = createResult.rows[0];

        const { rows: assessment } = await db.query(
            'SELECT id FROM "Assessment" WHERE "userId" = $1 LIMIT 1',
            [user.id]
        );

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            currentLevel: user.currentLevel,
            onboardingCompleted: false, // Just registered
            assessmentCompleted: false,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const { rows } = await db.query(
            'SELECT id, name, email, password, "currentLevel" FROM "User" WHERE email = $1',
            [email]
        );
        const user = rows[0];

        // Check if user and password match
        if (user && (await bcrypt.compare(password, user.password))) {
            // Check completion status
            const { rows: survey } = await db.query(
                'SELECT id FROM "SurveyResponse" WHERE "userId" = $1 LIMIT 1',
                [user.id]
            );
            const { rows: assessment } = await db.query(
                `SELECT id FROM "Assessment" WHERE "userId" = $1 
                 UNION ALL 
                 SELECT id FROM "LearningSession" WHERE "userId" = $1 AND accuracy IS NOT NULL
                 LIMIT 1`,
                [user.id]
            );

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                currentLevel: user.currentLevel,
                onboardingCompleted: survey.length > 0,
                assessmentCompleted: assessment.length > 0,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
