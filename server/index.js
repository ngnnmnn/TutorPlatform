const express = require('express');
const cors = require('cors');
const path = require('path');
// Load env vars from the server directory
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not Loaded');

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tutors', require('./routes/tutorRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

app.get('/', (req, res) => {
    res.send('Tutor Platform API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
