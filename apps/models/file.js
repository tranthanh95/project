var q = require("q");
var db = require("../common/database");
// Get connection.
var conn = db.getConnection();

// Function get all posts.
var getAllFiles = () => {
    var defer = q.defer();
    // console.log(JSON.stringify(user));
    var query = conn.query('SELECT * FROM files', (error, files) => {
        if (error) {
            defer.reject(error);
        } else {
            defer.resolve(files);
            // console.log(files);
        }
    });
    console.log(query.sql); // Print SQL Query.
    return defer.promise;
}

// Function get info files by id. Param : id(int)
var getFilesById = (id) => {
    if (id) {
        var defer = q.defer();
        // console.log(JSON.stringify(email));
        var query = conn.query('SELECT * FROM files WHERE ?', {
            id_user: id
        }, (error, results) => {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(results);
            }
        });
        console.log(query.sql);
        return defer.promise;
    }
    return false;
}

// Function add a File to Database. Param: file(Object)
var addFile = (file) => {
    if (file) {
        var defer = q.defer();
        // console.log(JSON.stringify(file));
        var query = conn.query('INSERT INTO files SET ?', file, (error, files, fields) => {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(files);
            }
        });
        //console.log(query.sql); // Print SQL Query.
        return defer.promise;
    }
    return false;
}

// Export modules.
module.exports = {
    getAllFiles: getAllFiles,
    addFile: addFile,
    getFilesById: getFilesById
};