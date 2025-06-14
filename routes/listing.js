const express = require("express"); 
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {listingSchema, reviewSchema} = require('../schema.js');
const {isLoggedIn} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});



const validateListing = (req, res, next) => {
    const {error} = listingSchema.validate(req.body);
    if(error){
     let errMsg = error.details.map(el => el.message).join(",");
     throw new ExpressError(400, errMsg);
    }else{
     next();
    }
}


//PROFILE ROUTE
router.get("/profile", isLoggedIn, async (req, res) => {
    try {
        // Find all listings by the current user
        const userListings = await Listing.find({ owner: req.user._id });
        
        // Find all reviews where the user is the author
        const userReviews = await Listing.aggregate([
            { $unwind: "$reviews" },
            { $match: { "reviews.author": req.user._id } },
            { $project: {
                review: "$reviews",
                listingTitle: "$title",
                listingId: "$_id"
            }}
        ]);

        res.render("users/profile.ejs", {
            currentUser: req.user,
            userListings,
            userReviews,
            listingsCount: userListings.length,
            reviewsCount: userReviews.length
        });
    } catch (err) {
        req.flash("error", "Error loading profile!");
        res.redirect("/listings");
    }
});

 //------------------------------------------------

//ALL LISTINGS
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});


//NEW  CREATE ROUTE
router.get("/new", isLoggedIn, (req, res) => {
    console.log(req.user);

    // if(!req.isAuthenticated()){
    //     req.flash("error", "You must be logged in to create a listing!");
    //     return res.redirect("/login");
    // }
    res.render("listings/new.ejs");
});

// CREATE ROUTE
router.post(
    "/", isLoggedIn, validateListing,upload.single("listing[image]"),
    wrapAsync(async (req, res) => {
        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        await newListing.save();
        req.flash("success", "Successfully made a new listing!");
        res.redirect(`/listings`);
    })
);











//EDIT ROUTE
router.get("/:id/edit",isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
});

//UPDATE ROUTE
router.put(
    "/:id", isLoggedIn, validateListing,upload.single("listing[image]"),
    async (req, res) => {
    const {id} = req.params;

    
    
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }


    req.flash("success", "Successfully edited listing!");
    res.redirect(`/listings`);
});

//DELETE ROUTE
router.delete("/:id", isLoggedIn, async (req, res) => {
    const {id} = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success", "Successfully deleted listing!");
    res.redirect(`/listings`);
});


//SEARCH ROUTE
// router.get("/search", async (req, res) => {
//     const {q} = req.query;
//     const listings = await Listing.find({title: {$regex: q, $options: "i"}});
//     res.render("listings/index.ejs", {listings});
// });




//SHOW ROUTE for reviews
router.get("/:id", async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username"  // Explicitly select username field
            }
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
});


//SEARCH ROUTE
router.get("/search", async (req, res) => {
    // const {q} = req.query;
    // const listings = await Listing.find({title: {$regex: q, $options: "i"}});
    res.render("index.ejs");
});


module.exports = router;