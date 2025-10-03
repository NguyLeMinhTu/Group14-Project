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