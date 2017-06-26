var q = require("q");
var db = require("../common/database");

// Get connection.
var conn = db.getConnection();

// Function add a User. Param: user(Object)
var addUser = (user) => {
    if (user) {
        var defer = q.defer();
        // console.log(JSON.stringify(user));
        var query = conn.query('INSERT INTO users SET ?', user, (error, results, fields) => {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(results);
            }
        });
        //console.log(query.sql); // Print SQL Query.
        return defer.promise;
    }
    return false;
}

// Function get info user by email. Param: email(String)
var getUserByEmail = (email) => {
    if (email) {
        var defer = q.defer();
        // console.log(JSON.stringify(email));
        var query = conn.query('SELECT * FROM users WHERE ?', {
            email: email
        }, (error, result) => {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(result);
            }
        });
        // console.log(query.sql);
        return defer.promise;
    }
    return false;
}

// Export modules
module.exports = {
    getUserByEmail: getUserByEmail,
    addUser: addUser
};