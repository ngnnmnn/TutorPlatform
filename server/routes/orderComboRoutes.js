const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, approveOrder } = require('../controllers/orderComboController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, admin, getAllOrders);
router.put('/:id/approval', protect, admin, approveOrder);

module.exports = router;
