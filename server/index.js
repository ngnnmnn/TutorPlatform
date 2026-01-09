const express = require('express');
const cors = require('cors');
const path = require('path');
// Load env vars from the server directory
require('dotenv').config({ path: path.join(__dirname, '.env') });
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

app.get('/', (req, res) => {
    res.send('Tutor Platform API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
