const mongoose = require('mongoose');
const Role = require('./models/Role');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const roles = await Role.find({});
        console.log('Roles found:', roles);

        const studentRole = await Role.findOne({ role_name: 'student' });
        if (!studentRole) {
            console.error('CRITICAL: Student role not found!');
        } else {
            console.log('Student role exists:', studentRole);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkRoles();
