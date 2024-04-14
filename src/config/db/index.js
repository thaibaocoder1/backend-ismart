const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connect successfully');
  } catch (error) {
    console.log('Failed to connect with database', error.message);
  }
}

module.exports = { connect };
