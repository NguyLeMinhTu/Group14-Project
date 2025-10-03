const express = require('express');
const app = express();
app.use(express.json());

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
app.use(cors({ origin: '*' }));


// users routes
const userRouter = require('./routes/user');
app.use('/users', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;