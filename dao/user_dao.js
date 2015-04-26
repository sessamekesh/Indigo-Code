/**
 * Created by Kamaron on 4/22/2015.
 */

exports.get_user_data = function (user_id, cb) {
    cb(null, {
        user_id: user_id,
        username: 'Sessamekesh',
        pass_hash: 'asdf',
        email_address: 'kam.is.amazing@gmail.com',
        is_admin: true
    });
};

exports.get_user_by_username = function (username, cb) {
    if (username === 'Sessamekesh') {
        cb(null, {
            user_id: user_id,
            username: 'Sessamekesh',
            pass_hash: 'asdf',
            email_address: 'kam.is.amazing@gmail.com',
            is_admin: true
        });
    } else {
        cb(null, undefined);
    }
};

exports.authenticate_user = function (username, password, cb) {
    if (username === 'Sessamekesh' && password === 'asdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};