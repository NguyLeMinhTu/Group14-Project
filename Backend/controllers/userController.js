const User = require('../models/user'); // Import model User

// GET /users (Lấy tất cả users)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Tìm tất cả users
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /users (Tạo user mới)
exports.createUser = async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email
    });

    try {
        const newUser = await user.save(); // Lưu user vào MongoDB
        res.status(201).json(newUser);
    } catch (err) {
        // Lỗi 400 thường là lỗi validation (ví dụ: email đã tồn tại)
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
        user.name = req.body.name;
        user.email = req.body.email;
        const updatedUser = await user.save();
        res.json(updatedUser);
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