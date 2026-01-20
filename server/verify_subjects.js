const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Subject = require('./models/Subject');

dotenv.config({ path: path.join(__dirname, '.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const subjects = await Subject.find({});
        console.log('Subjects in DB:', JSON.stringify(subjects, null, 2));
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

verify();
