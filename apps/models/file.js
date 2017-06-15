var q = require("q");
var db = require("../common/database");

var conn = db.getConnection();

// Function get all posts.
function getAllFiles() {
    var defer = q.defer();
    // console.log(JSON.stringify(user));
    var query = conn.query('SELECT * FROM files', function(error, files) {
        if (error) {
            defer.reject(error);
        } else {
            defer.resolve(files);
        }
    });
    console.log(query.sql); // Print SQL Query.
    return defer.promise;
}

// Function add a User.
function addFile(file) {
    if (file) {
        var defer = q.defer();
        console.log(JSON.stringify(file));
        var query = conn.query('INSERT INTO files SET ?', file, function(error, results, fields) {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(results);
            }
        });
        console.log(query.sql); // Print SQL Query.
        return defer.promise;
    }
    return false;
}


module.exports = {
    getAllFiles: getAllFiles,
    addFile: addFile
};