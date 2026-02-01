const OrderCombo = require('../models/OderCombo');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Account = require('../models/Account');

const createOrder = async (req, res) => {
    try {
        const { comboId, price } = req.body; // Expecting combo details
        const userId = req.user.id; // User from auth middleware

        // You might want to validate combo existence here if not passed fully in body,
        // but for now relying on passed ID and trusting logic or looking it up.
        // Assuming we accept the request to create a PENDING order.

        // We need to look up the Combo to get slot count if not passed?
        // Let's assume we look it up or trust the frontend. 
        // Better to look it up to be safe, but adhering to the "fast" request.
        // Let's use the Combo model if needed, but for now let's assume we can just create the OrderCombo.
        // Wait, OrderCombo needs initial slots.
        const Combo = require('../models/Combo');
        const combo = await Combo.findById(comboId);

        if (!combo) {
            return res.status(404).json({ message: 'Combo not found' });
        }

        const newOrder = new OrderCombo({
            comboID: comboId,
            accountId: userId,
            used_slot: 0,
            remaining_slot: combo.slot, // Helper logic: total slots
            approvalStatus: combo.slot > 2 ? 'pending' : 'approved',
            status: true // Active
        });

        await newOrder.save();

        // Notify Admins
        const admins = await Account.find({ role: 'admin' });
        for (const admin of admins) {
            await new Notification({
                recipient: admin._id,
                sender: userId,
                type: 'order_created',
                title: 'Đơn hàng Combo mới',
                message: `Người dùng đã đặt mua combo ${combo.combo_name}. ${combo.slot > 2 ? 'Vui lòng duyệt.' : 'Đã tự động duyệt.'}`,
                link: '/admin'
            }).save();
        }

        // If approved, notify user immediately
        if (newOrder.approvalStatus === 'approved') {
            await new Notification({
                recipient: userId,
                sender: null,
                type: 'order_status_update',
                title: 'Đơn hàng Combo thành công',
                message: `Bạn đã mua thành công combo ${combo.combo_name}.`,
                link: '/combos'
            }).save();
        }

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        // Populate user and combo details
        const orders = await OrderCombo.find()
            .populate('accountId', 'full_name email')
            .populate('comboID')
            .sort({ createAt: -1 });

        // Only return orders where the combo has more than 2 slots
        const filteredOrders = orders.filter(order => order.comboID && order.comboID.slot > 2);

        res.json(filteredOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const approveOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await OrderCombo.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.approvalStatus = status;
        if (status === 'rejected') {
            order.status = false; // Inactive if rejected
        }
        await order.save();

        // Notify User
        await new Notification({
            recipient: order.accountId,
            sender: req.user.id, // Admin
            type: 'order_status_update',
            title: `Đơn hàng Combo đã bị ${status === 'approved' ? 'duyệt' : 'từ chối'}`,
            message: `Đơn hàng mua combo của bạn đã được ${status === 'approved' ? 'chấp nhận' : 'từ chối'}.`,
            link: '/combos'
        }).save();

        res.json(order);
    } catch (error) {
        console.error("Error approving order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    approveOrder
};
