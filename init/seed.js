const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

// Direct MongoDB URI (hardcoded)
const MONGO_URI = "mongodb+srv://RISHI:HwpvKv9mtl7mGBnm@cluster0.dwvtitu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
main()
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return initDB(); // Call to seed data
  })
  .catch((err) => {
    console.log('❌ Connection error:', err);
});

// Connection function
async function main() {
  await mongoose.connect(MONGO_URI);
}

// Seed the database
const initDB = async () => {
  try {
    // await Listing.deleteMany({}); // Uncomment if you want to clear existing data
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "684d0d5a8bee2284b39e2e00" // Replace with actual user ID
    }));

    await Listing.insertMany(initData.data);
    console.log("✅ Sample listings inserted successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting listings:", err);
  }
};
