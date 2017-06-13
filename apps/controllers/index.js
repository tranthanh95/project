var express = require('express');
var router = express.Router();

var user_md = require("../models/user");

var helper = require("../helpers/helper");

// Router home page
router.get("/", function(req, res) {
    res.render("test", { data: false });
});

// router login form
router.get("/login", function(req, res) {
    res.render("login", { data: false });
});

// router login form
router.post("/login", function(req, res) {
    var params = req.body;
    console.log(params);
    if (params.email.trim().length == 0) {
        res.render("login", {
            data: {
                error: "Please enter an email!"
            }
        });
    } else {
        var data = user_md.getUserByEmail(params.email);
        if (data) {
            data.then(function(users) {
                console.log(JSON.stringify(users));
                var user = users[0];
                var status = helper.compare_password(params.password, user.password);
                if (!status) {
                    res.render("login", {
                        data: {
                            error: "Password Wrong!"
                        }
                    });
                } else {
                    req.session.user = user;
                    console.log(req.session.user);
                    res.redirect("/homepage");
                }
            });
        } else {
            res.render("/login", {
                data: {
                    error: "User not exists!"
                }
            });
        }
    }
});

// Router register form
router.get("/register", function(req, res) {
    res.render("register", { data: false });
});

// Function when user register and check.
router.post("/register", function(req, res) {
    var user = req.body;
    console.log(user);
    if (user.email.trim().length == 0) {
        res.render("register", {
            data: {
                error: "Email is required!"
            }
        });
    }
    if (user.password != user.repassword && user.password.trim().length != 0) {
        res.render("register", {
            data: {
                error: "Password is not match!"
            }
        });
    }
    // Insert DB.
    var password = helper.hash_password(user.password);
    // user model
    user = {
        email: user.email,
        password: password,
        fullname: user.fullname,
        block: 0
    }
    var result = user_md.addUser(user);
    result.then(function(data) {
        res.redirect("/login");
    }).catch(function(err) {
        res.render("register", {
            data: {
                error: "Could not insert user data to DB!"
            }
        });
    });
});

module.exports = router;