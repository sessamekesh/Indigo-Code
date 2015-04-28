/**
 * Created by Kamaron on 4/22/2015.
 */

exports.get_user_data = function (user_id, cb) {
    cb(null, {
        user_id: user_id,
        username: 'sessamekesh',
        pass_hash: 'asdf',
        email_address: 'kam.is.amazing@gmail.com',
        is_admin: true
    });
};

exports.get_user_by_username = function (username, cb) {
    if (username === 'sessamekesh') {
        cb(null, {
            user_id: 0,
            username: 'sessamekesh',
            pass_hash: 'asdf',
            email_address: 'kam.is.amazing@gmail.com',
            is_admin: true
        });
    } else {
        cb('User ' + username + ' does not exist!', undefined);
    }
};

exports.authenticate_user = function (username, password, cb) {
    if (username === 'sessamekesh' && password === 'asdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};