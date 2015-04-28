/**
 * Created by kamaron on 4/28/15.
 */

var user_dao = require('../../dao/user_dao');

exports.post = function (req, res) {
    // Attempt to get login information from database
    // On success, redirect and add user data to session
    // On fail, redirect and add error_message to session

    var uname = req.body.username,
        upass = req.body.password,
        redirect_to = req.body.redirect;

    if (req.body.login === 'Login') {
        // Login requested
        user_dao.authenticate_user(uname, upass, function (err, ares) {
            if (err) {
                throw err;
            } else {
                if (ares === true) {
                    // Success, get user data into session...
                    req.session.login_error = undefined;
                    user_dao.get_user_by_username(uname, function (aerr, bres) {
                        if (aerr) {
                            throw aerr;
                        } else {
                            req.session.user_data = bres;
                            res.redirect(redirect_to || '/');
                        }
                    });
                } else {
                    // Failure, notify user...
                    req.session.login_error = 'Invalid login!';
                    res.redirect(redirect_to || '/');
                }
            }
        });
    } else if (req.body.register === 'Register') {
        // Register requested
        // TODO KIP: If on a competition webpage, redirect to register for that competition specifically
        res.redirect('/register');
    } else {
        // Request is malformed
        throw new Error('Bad request - login page must receive request for login or registration');
    }
};