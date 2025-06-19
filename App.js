if(process.env.NODE_ENV !== "production"){
require("dotenv").config();
const isLoggedIn = require('./middleware/isLoggedIn.js');
}
console.log(process.env.SECRET);

const express = require('express'); 
const app = express(); 
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('./schema.js');
const Review = require('./models/review.js');
const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/review.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./routes/user.js');
const isLoggedIn = require('./middleware/isLoggedIn.js');
const Razorpay = require("razorpay");

//USEFUL MIDDLEWARE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);


//rozo gatway
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


//SESSION MIDDLEWARE
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}


//home route
app.get('/', (req, res) => {
    // res.send('Hello World');
    res.redirect('/listings');
});

//------------------------------------------------


//SESSION MIDDLEWARE
app.use(session(sessionConfig));


//FLASH MIDDLEWARE
app.use(flash());

//------------------------------`----------



//PASSPORT 
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//------------------------------`----------


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

//------------------------------`----------

// //demo user for testing signup

// app.get("/demouser", async (req, res) => {
//     const user = new User({email: "demo@gmail.com", username: "demo"});
//     const newUser = await User.register(user, "password");
//     res.send(newUser);
// });



//MONGO CONNECTION    ------------------------------------------------

const MONGO_URI = process.env.ALTAS;


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
//------------------------------------------------






//ROUTES    ------------------------------------------------

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// app.get("/testlisting", async (req, res) => {
//     const sampleListing = new Listing({
//         title: "Test Listing",
//         description: "This is a test listing",
//         price: 1000,
//         location: "New York",
//         country: "United States",
//     });

//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("TESTING");
// });









// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });


//------------------------------------------------

//ERROR ROUTE

app.use((err, req, res, next) => {
   let{statusCode = 500,message = "Something went wrong"} = err;
   res.status(statusCode).render("error.ejs", {statusCode,message});
//    res.status(statusCode).send(message);
});



//------------------------------------------------






//listening to the server
app.listen(3000, () => {
    console.log('Server is running on port 3000 http://localhost:3000');
});