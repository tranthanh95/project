var bcrypt = require('bcrypt');
var config = require('config');

// Function hash password.
function hash_password(password) {
    var saltRounds = config.get('salt');
    console.log(saltRounds);
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(password, saltRounds);
    // Store hash in your password DB.
    return hash;
}

// Function compare password of user.
function compare_password(password, hash) {
    return bcrypt.compareSync(password, hash);
}
//Export modules.
module.exports = {
    hash_password: hash_password,
    compare_password: compare_password
}