require('dotenv').config();
const mongoose = require('mongoose');
const Log = require('../models/log');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Create a test log
    const created = await Log.create({ type: 'test', message: 'Script-created log', meta: { example: true } });
    console.log('Created log:', created._id);

    // Query recent logs
    const found = await Log.find({ type: 'test' }).sort({ createdAt: -1 }).limit(10);
    console.log('Found logs:', found.length);
    found.forEach(l => console.log(l.createdAt, l.type, l.message));

    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
