const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        // unique: true,
    },  
});


 


userSchema.plugin(passportLocalMongoose);    // for hash user password hashing and salting
module.exports = mongoose.model("User", userSchema);