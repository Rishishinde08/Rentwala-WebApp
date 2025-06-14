const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URI = "mongodb://127.0.0.1:27017/Rentwala";

main()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log(err);
});

async function main() {     
    await mongoose.connect(MONGO_URI);
}

const initDB = async () => {
    // await Listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({...obj, owner: "684d0d5a8bee2284b39e2e00"}));
    await Listing.insertMany(initData.data);
    console.log("Data has been added to the database");
}

initDB();