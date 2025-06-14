const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");


//SIGNUP ROUTE
router.get("/signup", (req, res) => {
   
    // res.send("signup page");
    res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
    try {
        const {email, password, username} = req.body;
        const user = new User({email, username});
        const newUser = await User.register(user, password);
        req.login(newUser, (err) => {
            if(err) return next(err);
            req.flash("success", `welcome to rentwala ${username}`);
            console.log(newUser);
            
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});



//login routes
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/listings",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "welcome back!",
}), async (req, res) => {
    req.flash("success", "welcome back!");
    res.redirect("/listings");
});



//LOGOUT ROUTE
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if(err) return next(err);
        req.flash("success", "Goodbye! You are logged out");
        res.redirect("/listings");
    });
});



module.exports = router;