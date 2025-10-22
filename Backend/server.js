const express = require('express');
const app = express();
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Kết nối MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
	.then(() => console.log('Kết nối MongoDB thành công!'))
	.catch((err) => console.error('Kết nối MongoDB thất bại:', err));

// Thêm CORS middleware
const cors = require('cors');
// Allow credentials from the frontend origin. When using credentials (cookies) the
// Access-Control-Allow-Origin header MUST NOT be '*'. Use an explicit origin.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));


// users routes
const userRouter = require('./routes/user');
app.use('/users', userRouter);

// auth routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// profile routes
const profileRouter = require('./routes/profile');
app.use('/profile', profileRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;


