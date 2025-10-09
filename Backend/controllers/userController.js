const User = require('../models/user'); // Import model User
const bcrypt = require('bcrypt');

// Helper to remove sensitive fields
function sanitize(user) {
    const obj = user.toObject ? user.toObject() : user;
    if (obj.password) delete obj.password;
    return obj;
}

// GET /users (Lấy tất cả users)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Tìm tất cả users
        res.json(users.map(sanitize));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /users (Tạo user mới)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash, role: role || 'user' });
        const newUser = await user.save();
        res.status(201).json(sanitize(newUser));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Put /users/:id (Cập nhật user theo ID)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Tìm user theo ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);
        if (req.body.role) user.role = req.body.role;
        const updatedUser = await user.save();
        res.json(sanitize(updatedUser));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Xoá user (nếu cần)
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- Profile endpoints (Activity 2)
// These assume an auth middleware sets req.user = { id, role }
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(sanitize(user));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, avatar, password } = req.body;
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        if (password) user.password = await bcrypt.hash(password, 10);

        const updated = await user.save();
        res.json(sanitize(updated));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};