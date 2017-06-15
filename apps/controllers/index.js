var os = require("os");
var path = require('path');
var fs = require('fs');
var express = require("express");
var router = express.Router();

var formidable = require("formidable");

var user_md = require("../models/user");
var file_md = require("../models/file");
var helper = require("../helpers/helper");
var login_middleware = require("../middlewares/login-middleware");

// Router home page
router.get("/", function(req, res) {
    res.render("test", {
        data: false
    });
});

// router login form
router.get("/login", function(req, res) {
    res.render("login", {
        data: false
    });
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
});

// Router register form
router.get("/register", function(req, res) {
    res.render("register", {
        data: false
    });
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
router.get("/homepage", login_middleware, function(req, res) {
    res.render("homepage", { data: { fullname: req.session.user.fullname } });
});

// This will handle upload file.
router.post('/homepage', login_middleware, function(req, res) {
    // create an incoming form object
    var form = new formidable.IncomingForm();
    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;
    // store all uploads in the /uploads directory
    console.log(process.cwd());
    console.log(process.cwd() + '/public/uploads');
    form.uploadDir = path.join((process.cwd() + " ").trim(), '/public/uploads');
    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        // console.log(file);
        //Add file into Database.
        var currentFile = {
            name: file.name,
            format: file.type,
            size: file.size,
            id_user: req.session.user.id,
            created_at: file.lastModifiedDate,
            path: form.uploadDir
        };
        var data = file_md.addFile(currentFile);
        data.then(function(results) {
            console.log(form.uploadDir);
            fs.rename(file.path, path.join(form.uploadDir, file.name));
        }).catch(function(error) {
            res.render('homepage', { data: { error: "Could not insert Database!" } });
        });
    });
    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });
    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end('success');
    });
    // parse the incoming request containing the form data
    form.parse(req);
});

// This will handle logout requests.
router.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect('login');
});

// This will handle 404 requests.
router.get("*", function(req, res) {
    res.status(404).send("404");
});

module.exports = router;