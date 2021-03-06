var config = require("config");
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: config.get("mysql.host"),
    user: config.get("mysql.user"),
    password: config.get("mysql.password"),
    database: config.get("mysql.database"),
    port: config.get("mysql.port")
});

// Check connection with database.
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

// Function get connection.
function getConnection() {
    if (!connection) {
        connection.connect();
        console.log("Connection database successfully!!");
    }
    return connection;
}

module.exports = {
    getConnection: getConnection
}