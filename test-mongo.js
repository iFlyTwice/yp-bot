const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// First check DNS resolution
console.log('Testing DNS resolution...');
dns.setServers(['8.8.8.8']); // Use Google's DNS server

dns.resolve('bot.0df3o.mongodb.net', (err, addresses) => {
  console.log('DNS resolution result:', err || addresses);
});

const uri = process.env.MONGO_CONNECTION;
console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', uri);

mongoose.set('debug', true);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  family: 4,  // Force IPv4
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  if (err.name === 'MongoServerSelectionError') {
    console.error('Server selection details:', err.reason);
  }
  process.exit(1);
});
