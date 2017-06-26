const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");
const session = require('express-session');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const app = express();

// Body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: config.get("secret_key"),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));

app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
// Static folder
app.use("/static", express.static(__dirname + "/public"));

// Using socket.io
var server = require("http").createServer(app);
var io = require("socket.io")(server);
// Socket control.
var socketcontrol = require("./apps/common/socket-control")(io);
// Controller.
var controllers = require(__dirname + "/apps/controllers");

app.use(controllers);

var host = config.get("server.host");
var port = config.get("server.port");

server.listen(port, host, () => {
    console.log('Server is running on ' + host + ":" + port);
});