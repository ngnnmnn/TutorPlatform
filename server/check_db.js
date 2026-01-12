const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TutorRequest = require('./models/TutorRequest');
const Evidence = require('./models/Evidence');
const Certificate = require('./models/Certificate');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const latestRequest = await TutorRequest.findOne().sort({ createdAt: -1 });

        if (!latestRequest) {
            console.log('No TutorRequests found.');
        } else {
            console.log('Latest Tutor Request:');
            console.log(JSON.stringify(latestRequest, null, 2));

            const certs = await Certificate.find({ tutorrequestID: latestRequest._id });
            console.log('Certificates:');
            console.log(JSON.stringify(certs, null, 2));

            const evs = await Evidence.find({ tutorrequestID: latestRequest._id });
            console.log('Evidence:');
            console.log(JSON.stringify(evs, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
};

checkDB();
