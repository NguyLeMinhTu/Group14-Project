const requireRole = (required) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const userRole = req.user.role;
        if (Array.isArray(required)) {
            if (!required.includes(userRole)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
        } else {
            if (userRole !== required) return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }
        next();
    };
};

module.exports = { requireRole };
