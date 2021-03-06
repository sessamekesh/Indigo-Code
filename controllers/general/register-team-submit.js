/**
 * Created by kamaron on 4/28/15.
 */

// TODO KIP: Working in this file has made me realize that logging needs to be done in its own class. Something more elaborate than we have now.
//  For instance, logs should generate some searchable number where an admin can find the error. Perhaps save errors with the user viewing?
//  Or just save errors to some global place, but then an error ID can be searched? Like a MySQL entry?

var user_dao = require('../../dao/user_dao');
var register_controller = require('./register-team');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

exports.get = function (req, res) {
    res.redirect('/register-team');
};

exports.post = function (req, res) {
    var info = req.body;
    var user_ids = [];
    var created_user_ids = [];
    var page_errors = new RegistrationPageErrorCollection();

    if (info === undefined) {
        throw new Error('No information sent via POST for registration');
    } else if (req.method !== 'POST') {
        throw new Error('Information must be sent via POST (for security)'); // Pretty pointless, don't you think?
    } else {
        if (req.body.team_name[0] === ' ') {
            page_errors.addError('team_name', 'Team name cannot begin with a space');
        }
        add_next_user(0);
    }

    /**
     * Attempts to extract information for either a new, existing, or blank user at i.
     *  If none of them exist, throws an error.
     *  On failure, will destroy all users created by this function.
     * @param i {number} Index of user to check.
     */
    function add_next_user(i) {
        if (i >= req.body.max_team_size) {
            finalize_team();
        } else {
            if (req.body['usertype_' + i] === 'new') {
                // New user - create and add to created_user_ids
                // But first make, sure passwords match!
                if (req.body['new_user_' + i + '_password'] !== req.body['new_user_' + i + '_confirm_password']) {
                    page_errors.addError('new_user_' + i + '_confirm_password', 'Must match password');
                    add_next_user(i + 1);
                } else {
                    user_dao.addUser(new user_dao.UserData(
                        null,
                        req.body['new_user_' + i + '_username'],
                        false,
                        !!req.body['new_user_' + i + '_public_profile'],
                        req.body['new_user_' + i + '_first_name'],
                        req.body['new_user_' + i + '_last_name'],
                        req.body['new_user_' + i + '_email']
                    ), req.body['new_user_' + i + '_password'], function (err, res) {
                        if (err) {
                            // TODO KIP: Check for exact errors here?
                            // TODO HANSY: You could also do this.
                            // TODO SAM: You could also do this.
                            // Pretty much, in the addUser method, I am returning an err object if something wrong happened.
                            //  I want to know which field went wrong - for example, if it was the username that went wrong,
                            //  I would say page_errors.addError('new_user_' + i + '_username', error message) and that would show the problem
                            //  next to the username box.
                            // It would also be nice if I could have multiple errors happen - so maybe, err could be a list
                            //  instead of a single object?
                            page_errors.addError('general', 'Could not add user for database reasons (check log)');
                            console.log('register-team-submit.js: Could not add new user: ' + err.message);
                            add_next_user(i + 1);
                        } else {
                            created_user_ids.push(res.id);
                            user_ids.push(res.id);
                            add_next_user(i + 1);
                        }
                    });
                }
            } else if (req.body['usertype_' + i] ==='existing') {
                // Existing user - authenticate user, get user ID
                user_dao.authUser(req.body['existing_user_' + i + '_username'],
                    req.body['existing_user_' + i + '_password'],
                    function (err, ares) {
                        if (err) {
                            // TODO KIP: Check for exact errors here
                            page_errors.addError('existing_user_' + i + '_username', 'Database errors - check log');
                            console.log('register-team-submit.js: Could not add existing user: ' + err.message);
                            add_next_user(i + 1);
                        } else {
                            user_ids.push(ares.id);
                            add_next_user(i + 1);
                        }
                    }

                );
            } else if (req.body['usertype_' + i] === 'blank') {
                add_next_user(i + 1);
            } else {
                // Well, this should never happen.
                page_errors.addError('usertype_' + i, 'Invalid user type ' + req.body['usertype_' + i] + ' found');
                console.log('register-team-submit.js - unexpected user type ' + req.body['usertype_' + i] + ' found!');
                add_next_user(i + 1);
            }
        }
    }

    /**
     * Performs the final actions to create a team.
     *  If this action fails, unwinds by destroying all users created in this function
     */
    function finalize_team() {
        // Make sure we added at least one user...
        if (user_ids.length === 0) {
            page_errors.addError('usertype_0', 'No user data provided - need at least one user');
        }

        if (page_errors.isFatal()) {
            register_controller.fill_data(req, {
                title: 'USU ACM Competition Framework',
                subtitle: 'Version 0.3.1 - Zora',
                redirect_url: '/register-team?id=' + req.body.comp_id,
                comp_id: req.body.comp_id,
                page_errors: page_errors,
                field_values: req.body
            }, function (data) {
                if (data.error) {
                    res.render('./error', data);
                } else {
                    res.render('./general/register-team', data);
                }
            });
            destroy_created_users(created_user_ids);
        } else {
            user_dao.create_team(
                new user_dao.TeamData(
                    null,
                    req.body.comp_id,
                    req.body.team_name,
                    req.body.team_tagline,
                    null,
                    !!req.body.team_share_code,
                    user_ids),
                function (err, ares) {
                    if (err) {
                        destroy_created_users(created_user_ids);
                        res.render('./error', {message: err.message, error: err});
                    } else {
                        // TODO KIP: Replace this with an actual confirmation page.
                        res.redirect('register-team-success');
                    }
                }
            );
        }
    }

    /**
     * Destroy all users in the created_user_ids array
     * @param created_user_ids {number[]}
     */
    function destroy_created_users(created_user_ids) {
        for (var i = 0; i < created_user_ids.length; i++) {
            user_dao.remove_user(created_user_ids[i], function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
};