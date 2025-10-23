const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    type: { type: String, required: true }, // e.g., 'login_attempt', 'login_success', 'request'
    ip: { type: String },
    userAgent: { type: String },
    message: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
