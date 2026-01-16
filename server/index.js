const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tutors', require('./routes/tutorRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.send('Tutor Platform API is running');
});

// 404 Not Found Middleware
const notFound = require('./middleware/notFound');
app.use(notFound);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
