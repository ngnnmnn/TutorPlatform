const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TutorRequest = require('./models/TutorRequest');
const Evidence = require('./models/Evidence');
const Certificate = require('./models/Certificate');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const combos = await mongoose.connection.collection('combos').find().toArray();
        console.log('Combos found:', combos.length);
        console.log(JSON.stringify(combos, null, 2));

        const tutors = await mongoose.connection.collection('accounts').find({ username: { $in: ['tutormai', 'tutornam'] } }).toArray();
        const tutorIds = tutors.map(t => t._id);

        const requests = await TutorRequest.find({ accountId: { $in: tutorIds } });
        console.log('TutorRequests found for mai and nam:', requests.length);
        console.log(JSON.stringify(requests, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
};

checkDB();
