const Log = require('../models/log');

exports.queryLogs = async (req, res) => {
    try {
        const { userId, type, from, to, limit = 100 } = req.query;
        const q = {};
        if (userId) q.userId = userId;
        if (type) q.type = type;
        if (from || to) q.createdAt = {};
        if (from) q.createdAt.$gte = new Date(from);
        if (to) q.createdAt.$lte = new Date(to);

        const items = await Log.find(q).sort({ createdAt: -1 }).limit(Math.min(parseInt(limit, 10) || 100, 1000));
        res.json({ count: items.length, items });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
