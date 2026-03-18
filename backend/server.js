const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});


// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const learningRoutes = require('./routes/learningRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/learning', learningRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Start the server even if DB init fails (e.g., DNS/network issues).
// Routes will still return a useful error until the DB is reachable.
const os = require('os');
const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

app.listen(PORT, () => {
    const localIp = getLocalIp();
    console.log(`Server running on port ${PORT}`);
    console.log(`Local Network URL: http://${localIp}:${PORT}`);
    console.log(`To fix network errors, ensure mobile/src/config/api.js matches this IP.`);
});

db.initDb().catch((err) => {
    console.error('Failed to initialize database schema:', err);
});
