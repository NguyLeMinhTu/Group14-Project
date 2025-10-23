const Log = require('../models/log');

// Helper to create a log entry
async function logActivity({ userId = null, type = 'activity', message = '', req = null, meta = {} } = {}) {
    try {
        const doc = new Log({
            userId,
            type,
            ip: req ? (req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress) : undefined,
            userAgent: req && req.headers ? req.headers['user-agent'] : undefined,
            message,
            meta
        });
        await doc.save();
        return doc;
    } catch (err) {
        // Do not throw - logging should not break main flow
        console.error('Failed to write log:', err);
        return null;
    }
}

// Express middleware to log every request (lightweight)
function requestLogger(options = {}) {
    const { skipPaths = [] } = options;
    return async (req, res, next) => {
        try {
            if (skipPaths.some(p => req.path.startsWith(p))) return next();
            // only log authenticated requests if user present
            const userId = req.user ? req.user.id : null;
            logActivity({ userId, type: 'request', message: `${req.method} ${req.path}`, req, meta: { headers: { accept: req.headers.accept } } });
        } catch (err) {
            console.error('requestLogger error', err);
        }
        next();
    };
}

module.exports = { logActivity, requestLogger };
// Middleware factory: logActivityMiddleware(action)
// Usage: app.post('/some', logActivityMiddleware('some_action'), handler)
function logActivityMiddleware(action = 'activity') {
    return async (req, res, next) => {
        try {
            const userId = req.user ? req.user.id : null;
            await logActivity({ userId, type: action, message: `${action} via middleware`, req });
        } catch (err) {
            console.error('logActivityMiddleware error', err);
        }
        next();
    };
}

module.exports.logActivityMiddleware = logActivityMiddleware;
