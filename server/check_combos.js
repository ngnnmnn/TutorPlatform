const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Combo = require('./models/Combo');

const checkCombos = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const combos = await Combo.find();
        console.log('--- Combos ---');
        combos.forEach(c => {
            console.log(`- ${c.combo_name}: Price=${c.price}, Slots=${c.slot}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCombos();
