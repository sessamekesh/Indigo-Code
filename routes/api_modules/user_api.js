/**
 * Created by kamaron on 4/2/15.
 */

var user_dao = require('../../dao/user_dao'),
    url = require('url');

exports.login = function (req, res) {
    console.log('Login function invoked!');

    var req_params = (Object.keys(req.body).length > 0) ? req.body : req.query;

    if (req_params && req_params.register !== undefined) {
        console.log('Registration requested. Routing to registration page...');
        res.redirect('/register');
    } else if (req_params && req_params.logout !== undefined) {
        // Logout code...
        console.log('Logging out current user...');
    } else {
        // Login code...
        console.log('Authenticating user for login...');
        user_dao.authUser(req_params.username, req_params.password, function (rsl, err) {
            if (err) {
                res.status(400).send({ 'success': false, 'error': req.url, 'message': 'Could not authenticate user - ' + err.toString(),
                    'username': req_params.username, 'password': req_params.password});
            } else {
                // Get user data, add to session for use throughout session...
                if (rsl === true) {
                    console.log('Authentication succeeded - storing user data to session variable...');

                    user_dao.getUserData(req_params.username, false, function (rsl, err) {
                        if (err) {
                            res.status(400).send({ 'success': false, 'error': req.url, 'message': 'Could not log in user - SQL error', 'reason': err.toString()});
                        } else {
                            req.session.user_data = rsl;
                            if (req_params.redirect !== undefined) {
                                res.redirect(req_params.redirect);
                            } else {
                                res.send({'success': true});
                            }
                        }
                    });

                } else {
                    console.log('Authentication failed - notifying user...');
                    res.status(400).send({ 'success': false, 'error': req.url, 'message': 'Failed to authenticate user - incorrect or missing password'});
                }
            }
        });
    }
};

exports.logout = function (req, res) {
    var rd,
        req_params = (Object.keys(req.body).length > 0) ? req.body : req.query;
    req.session.destroy();
    if (req_params.redirect !== undefined) {
        res.redirect(req_params.redirect);
    } else {
        res.send({'success': true});
    }
};

exports.register = function (req, res) {
    console.log('Register function invoked!');

    var req_params = ((Object.keys(req.body).length > 0) ? req.body : req.query) || {};

    // Registration code...
    console.log('Registering new user...');
    user_dao.addUser(req_params.name, req_params.username, req_params.password, req_params.email, req_params.user_type, function (rsl, err) {
        if (err) {
            res.status(400).send({ 'success': false, 'error': req.url, 'message': 'Could not register user', 'reason': err.toString()});
        } else {
            if (req_params.redirect !== undefined) {
                res.redirect(req_params.redirect);
            } else {
                res.send({ 'success': true });
            }
        }
    });
};

exports.get_user_data = function (req, res) {
    if (req.session.user_data === undefined || req.session.user_data.user_name === undefined) {
        res.status(400).send({'success': false, 'error': req.url, 'message': 'No user logged in - could not fetch information'});
    } else {
        user_dao.getUserData(req.session.user_data.user_name, true, function (rsl, err) {
            if (err) {
                res.status(400).send({'success': false, 'error': req.url, 'message': 'Could not get user information', 'reason': err.toString()});
            } else {
                res.send({'success': true, 'result': rsl});
            }
        });
    }
};