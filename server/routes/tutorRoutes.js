const express = require('express');
const router = express.Router();
const { getTutors, getTutorById } = require('../controllers/tutorController');

router.get('/', getTutors);
router.get('/:id', getTutorById);

module.exports = router;
