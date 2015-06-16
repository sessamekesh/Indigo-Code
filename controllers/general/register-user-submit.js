/**
 * Created by Kamaron on 6/15/2015.
 */

var user_dao = require('../../dao/user_dao');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

/**
 * This endpoint can never be reached. Redirect to register-user
 * @param req {object} Request (Express)
 * @param res {object} Response (Express)
 */
exports.get = function (req, res) {
    res.redirect('/register-user');
};

/**
 * Process form submission, validate, all that good stuff.
 * @param req {object} Request (Express)
 * @param res {object} Response (Express)
 */
exports.post = function (req, res) {
    var info = req.body;
    var page_errors = new RegistrationPageErrorCollection();

    if (!info) {
        throw new Error('No information sent via POST for registration');
    } else if (req.method !== 'POST') {
        throw new Error('In some magical way that I don\'t understand, you managed to POST without POSTing');
    } else if (info['password'] !== info['confirm_password']) {
        page_errors.addError('confirm_password', 'Passwords do not match!');
        res.render('./general/register-user', {
            title: 'USU ACM Competition Framework',
            subtitle: 'Version 0.3.1 - Zora',
            redirect_url: '/register-user',
            page_errors: page_errors,
            field_values: info
        });
    } else {
        user_dao.addUser(new user_dao.UserData(
            null,
            info['username'],
            false,
            !!info['public_profile'],
            info['first_name'],
            info['last_name'],
            info['email']),
            info['password'],
            function (err, result) {
                if (err) {
                    // TODO KIP: Check for exact errors here?
                    // TODO HANSY: You could also do this.
                    // TODO SAM: You could also do this.
                    // Pretty much, in the addUser method, I am returning an err object if something wrong happened.
                    //  I want to know which field went wrong - for example, if it was the username that went wrong,
                    //  I would say page_errors.addError('username', error message) and that would show the problem
                    //  next to the username box.
                    // It would also be nice if I could have multiple errors happen - so maybe, err could be a list
                    //  instead of a single object?
                    page_errors.addError('general', 'Could not add user for database reasons (check log)');
                    console.log('register-user-submit.js: Could not add user: ' + err.message);
                    res.render('./general/register-user', {
                        title: 'USU ACM Competition Framework',
                        subtitle: 'Version 0.3.1 - Zora',
                        redirect_url: '/register-user',
                        page_errors: page_errors,
                        field_values: info
                    });
                } else {
                    req.session.user_data = result;
                    res.redirect('register-user-success');
                }
            }
        );
    }
};