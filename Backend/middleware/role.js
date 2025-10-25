// Advanced RBAC middleware
// Supports role hierarchy and options such as allowSelf when acting on a resource id
const roleHierarchy = ['user', 'moderator', 'admin'];

function checkRole(required, options = {}) {
    // required: string or array of allowed minimum roles or exact roles
    // options: { allowSelf: boolean } when checking routes with :id
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const userRole = req.user.role;

        // allowSelf handling: if option set and req.params.id equals requester id
        if (options.allowSelf && req.params && req.params.id && req.user.id === req.params.id) {
            return next();
        }

        // normalize required to array
        const requiredArr = Array.isArray(required) ? required : [required];

        // if any required entry is a hierarchy operator like '>=moderator', support it
        for (const reqEntry of requiredArr) {
            if (typeof reqEntry === 'string' && reqEntry.startsWith('>=')) {
                const minRole = reqEntry.slice(2);
                const minIdx = roleHierarchy.indexOf(minRole);
                const userIdx = roleHierarchy.indexOf(userRole);
                if (minIdx !== -1 && userIdx !== -1 && userIdx >= minIdx) return next();
                continue;
            }

            // plain role name match
            if (reqEntry === userRole) return next();
        }

        // also allow if user's role is higher than any single-role required (e.g., required ['moderator'])
        // treat a single plain role as minimum required
        if (requiredArr.length === 1 && typeof requiredArr[0] === 'string' && roleHierarchy.includes(requiredArr[0])) {
            const minIdx = roleHierarchy.indexOf(requiredArr[0]);
            const userIdx = roleHierarchy.indexOf(userRole);
            if (userIdx !== -1 && userIdx >= minIdx) return next();
        }

        return res.status(403).json({ message: 'Forbidden: insufficient role' });
    };
}

// backward-compatible alias
const requireRole = (r) => checkRole(r);

module.exports = { checkRole, requireRole };
