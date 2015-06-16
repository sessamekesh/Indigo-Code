/**
 * Created by kamaron on 4/28/15.
 */

var user_dao = require('../../dao/user_dao');

exports.post = function (req, res) {
    // Attempt to get login information from database
    // On success, redirect and add user data to session
    // On fail, redirect and add error_message to session

    var uname = req.body.username;
    var upass = req.body.password;
    var redirect_to = req.body.redirect;

    if (req.body.login === 'Login') {
        // Login requested
        user_dao.authUser(uname, upass, function (err, ares) {
            if (err) {
                // TODO: Redirect to login-error instead
                res.render('./error', {message: err.message, error: err});
            } else {
                if (ares) {
                    // Success, get user data into session...
                    req.session.user_data = ares;
                    res.redirect(redirect_to || '/');

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
        res.redirect('/register-user');
    } else {
        // Request is malformed
        throw new Error('Bad request - login page must receive request for login or registration');
    }
};