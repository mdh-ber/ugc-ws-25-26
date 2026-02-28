//test-db.js
require('dotenv').config();
const connectDB = require('./database');

console.log('Testing database connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

connectDB();