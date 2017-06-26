const os = require("os");
const path = require('path');
const fs = require('fs');
const express = require("express");
const router = express.Router();

const formidable = require("formidable");

const user_md = require("../models/user");
const file_md = require("../models/file");
const helper = require("../helpers/helper");
const login_middleware = require("../middlewares/login-middleware");

// Router home page
router.get("/test", (req, res) => {
    res.render("test", {data: false});
});

// router login form
router.get("/login", (req, res) => {
    res.render("login", {data: false});
});

// router login form
router.post("/login", (req, res) => {
    var params = req.body;
    // console.log(params);
    if (params.email.trim().length == 0) {
        res.render("login", {
            data: {
                error: "Please enter an email!"
            }
        });
    } else {
        var data = user_md.getUserByEmail(params.email);
        if (data) {
            data.then((users) => {
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
                        req.session.user = user;
                        delete req.session.user.password; // delete the password from the session.
                        delete req.session.user.resetPasswordToken; // delete the resetPasswordToken from the session.
                        delete req.session.user.resetPasswordExpires; // delete the resetPasswordExpires from the session.
                        delete req.session.user.block; // delete the block from the session.
                        // console.log(req.session.user);
                        res.redirect("/");
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
router.get("/register", (req, res) => {
    res.render("register", {data: false});
});

// Function when user register and check.
router.post("/register", (req, res) => {
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
    result.then((data) => {
        res.redirect("/login");
    }).catch((err) => {
        res.render("register", {
            data: {
                error: "Could not insert user data to DB!"
            }
        });
    });
});

// This will handle forgot password requests.
router.get("/forgot", (req, res) => {
    res.render("forgotpassword");
});

// Router get all file from database.
router.get("/files", (req, res) => {
    var listFiles = file_md.getAllFiles();
    if (listFiles) {
        listFiles.then((files) => {
            if (files.length > 0) {
                // console.log(files[0].name);
                res.render('files', {
                    data: {
                        files: files,
                        error: false
                    }
                });
            }
        }).catch((error) => {
            res.render('files', {
                data: {
                    error: error
                }
            });
        });
    } else {
        res.render("files", {
            data: {
                error: "Could not data form database!!"
            }
        });
    }
});

// This will handle forgot password requests.
router.get("/", login_middleware, (req, res) => {
    var id_user = req.session.user.id;
    // console.log(id_user);
    var files = file_md.getFilesById(id_user);
    if (files) {
        files.then((results) => {
            if (results.length > 0) {
                // console.log(files);
                res.render('homepage', {
                    data: {
                        fullname: req.session.user.fullname,
                        id: req.session.user.id,
                        error: false
                    }
                });
            } else {
                res.render("homepage", {
                    data: {
                        error: "Could not data form database!!",
                        fullname: req.session.user.fullname
                    }
                });
            }
        }).catch((error) => {
            res.render('homepage', {
                data: {
                    error: error,
                    fullname: req.session.user.fullname
                }
            });
        });
    } else {
        res.render("homepage", {
            data: {
                error: "Could not data form database!!",
                fullname: req.session.user.fullname
            }
        });
    }
});

// This will handle upload file.
router.post('/', login_middleware, (req, res) => {
    // create an incoming form object
    var form = new formidable.IncomingForm();
    // specify that we want to allow the user to upload multiple files in a single
    // request
    form.multiples = true;
    // store all uploads in the /uploads directory console.log(process.cwd());
    // console.log(process.cwd() + '/public/uploads');
    form.uploadDir = path.join((process.cwd() + " ").trim(), '/public/uploads');
    // every time a file has been uploaded successfully, rename it to it's orignal
    // name
    form.on('file', (field, file) => {
        // console.log(file); Add file into Database.
        var currentFile = {
            name: file.name,
            format: file.type,
            size: file.size,
            id_user: req.session.user.id,
            created_at: file.lastModifiedDate,
            path: form.uploadDir
        };
        var data = file_md.addFile(currentFile);
        data.then((results) => {
            // console.log(form.uploadDir);
            fs.rename(file.path, path.join(form.uploadDir, file.name));
        }).catch((error) => {
            res.render('homepage', {
                data: {
                    error: "Could not insert Database!"
                }
            });
        });
    });
    // log any errors that occur
    form.on('error', (err) => {
        console.log('An error has occured: \n' + err);
    });
    // once all the files have been uploaded, send a response to the client
    form.on('end', () => {
        res.end('success');
    });
    // parse the incoming request containing the form data
    form.parse(req);
});

// This will handle logout requests.
router.get("/logout", (req, res) => {
    req
        .session
        .destroy();
    res.redirect('login');
});

// This will handle 404 requests.
router.get("*", (req, res) => {
    res
        .status(404)
        .send("404");
});

// Export module.
module.exports = router;