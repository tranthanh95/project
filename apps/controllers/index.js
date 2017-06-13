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
    console.log(params.remember == '1');
    console.log(req.session.cookie);
    if (req.session.cookie) {
        res.redirect("/homepage");
    } else {
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
                    // console.log(JSON.stringify(users));
                    if (users.length > 0) {
                        var user = users[0];
                        var status = helper.compare_password(params.password, user.password);
                        if (!status) {
                            res.render("login", {
                                data: {
                                    error: "Password Wrong!"
                                }
                            });
                        } else {
                            if (params.remember == '1') {
                                console.log('asdsdas');
                                req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
                                console.log(req.session.cookie);
                            } else {
                                req.session.cookie.expires = false;
                                req.session.user = user;
                                console.log(req.session.user);
                                res.redirect("/homepage");
                            }
                        }
                    } else {
                        res.render("login", {
                            data: {
                                error: "Username not found!!"
                            }
                        });
                    }
                });
            } else {
                res.render("login", {
                    data: {
                        error: "User not exists!"
                    }
                });
            }
        }
    }

});

// Router register form
router.get("/register", function(req, res) {
    res.render("register", { data: false });
});

// Function when user register and check.
router.post("/register", function(req, res) {

    /*
    // Check captcha.
    // g-recaptcha-response is the key that browser will generate upon form submit.
    // if its blank or null means user has not selected the captcha, so return the error.
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        return res.json({ "responseCode": 1, "responseDesc": "Please select captcha" });
    }
    // Put your secret key here.
    var secretKey = "6Lc4GSUUAAAAACY8_1G3-ACb7cXg9YvcW7pMSmsd";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl, function(error, response, body) {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if (body.success !== undefined && !body.success) {
            return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
        }
        res.json({ "responseCode": 0, "responseDesc": "Sucess" });
    });

    //---------------- */

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

// This will handle forgot password requests.
router.get("/forgot", function(req, res) {
    res.render("forgotpassword");
});

// This will handle forgot password requests.
router.get("/homepage", function(req, res) {
    res.render("homepage");
});

// This will handle 404 requests.
router.get("*", function(req, res) {
    res.status(404).send("404");
});

module.exports = router;