const users = [];
let nextId = 1;

// GET /users
function getUsers(req, res) {
    res.json(users);
}

// POST /users
function createUser(req, res) {
    const { name, email } = req.body || {};
    if (!name || !email) {
        return res.status(400).json({ error: 'Both name and email are required' });
    }

    const user = { id: nextId++, name, email };
    users.push(user);
    return res.status(201).json(user);
}

module.exports = {
    getUsers,
    createUser,
    // export users for tests or debug if needed
    users,
};
