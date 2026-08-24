const dns=require('dns');
dns.setServers(['1.1.1.1','8.8.8.8'])
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to database
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.log('MONGO_URI is not set in environment variables. Skipping DB connection for now.');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
