var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var app = express(); 
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost/auth_app", {useNewUrlParser:true, useUnifiedTopology:true});
app.set("view engine", "ejs");

//setting up express sessions
app.use(require("express-session")({
    secret: "battyCats",
    resave: false,
    saveUninitialized: false
}));

//setting up passport
passport.use( new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes

//root
app.get("/", function(req, res){
    res.render("home");
});


//secret
app.get("/secret", isLoggedIn, function(req, res){          //isLoggedIn is a middile defined at bottom
    res.render("secret");
});

//register form
app.get("/register", function(req,res){
    res.render("register");
});

//register form
app.post("/register", function(req,res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err) { console.log("Error from Line 48"); res.redirect("/register");}
        else{
            passport.authenticate("local")(req, res, function(){  //using local strategy
                res.redirect("/secret");
            });
        }
    });
});

//login form
app.get("/login", function(req, res){
    res.render("login");
});

//login process //middleware //auth before final response
app.post("/login", passport.authenticate("local", {
    successRedirect:"/secret",
    failureRedirect: "/login"
}), function(req, res){

});

//logout
app.get("/logout", function(req, res){
    req.logout();                       //passport is that simple!
    res.redirect("/"); 
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){                  //isAuthenticated comes with passport
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function(){
    console.log("Server Started");
});