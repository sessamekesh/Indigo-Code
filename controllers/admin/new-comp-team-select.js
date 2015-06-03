/**
 * Created by Kamaron on 5/30/2015.
 */

'use strict';

var admin_layer = require('./index');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');
var user_dao = require('../../dao/user_dao');
var comp_dao = require('../../dao/competition_dao');

/**
 * Get will only happen if the form failed to submit last time
 * @param req
 * @param res
 */
exports.get = function (req, res) {
    admin_layer.fill_data(req, {
        title: 'Create a New Competition',
        subtitle: 'Step 2 / 3: Administrator team members',
        redirect_url: '/admin/new-comp-team-select' // TODO KIP; This may not be wise, unless you use session data
    }, function (new_data) {
        res.render('./admin/new-comp-team-select.jade', new_data);
    });
};

/**
 * Post will happen if the form was submitted via the last step (new-comp), or if the data was
 *  submitted from this step, and involved adding/removing an administrator.
 * @param req
 * @param res
 */
exports.post = function (req, res) {
    var data = {
        title: 'Create a New Competition',
        subtitle: 'Step 2 / 3: Administrator team members',
        redirect_url: '/admin/new-comp-team-select' // TODO KIP; This may not be wise, unless you use session data
    };

    if (req.session.new_comp_errors) {
        console.log(req.session.new_comp_errors);
    }
    data.page_errors = req.session.new_comp_errors || new RegistrationPageErrorCollection();

    if (!!req.body.add_admin) {
        // TODO KIP Add an administrator to the team...
        console.log('Add administrator: ' + req.body.add_admin);
        user_dao.addAdminToTeam(req.session.new_comp_data.id, req.body.add_admin, function (aerr) {
            if (aerr) {
                data.page_errors.addError('add_admin', aerr.message);
            }
            finish();
        });
    } else if (!!req.body.remove_admin) {
        // TODO KIP Remove an administrator from the team...
        console.log('Remove administrator: ' + req.body.remove_admin);
        user_dao.removeAdminFromTeam(req.session.new_comp_data.id, req.body.remove_admin, function (aerr) {
            if (aerr) {
                data.page_errors.addError('remove_admin', aerr.message);
            }
            finish();
        });
    } else {
        // This is a post from new-comp, create a new team (if not already created)
        //  and start using that information.
        if (!req.session.new_comp_data) {
            // Create a new competition, assign it to session variable, continue
            console.log('Creating a new competition...');
            var new_comp = new comp_dao.CompData(
                null,
                req.body.comp_name,
                req.body.start_date,
                req.body.end_date,
                req.body.time_penalty,
                req.body.max_team_size);

            var error_list = new_comp.validateInsert();
            if (error_list.length === 0) {
                comp_dao.create_competition(new_comp, function (aerr, new_comp_data) {
                    if (aerr) {
                        // Route back to 'new-comp', with errors
                        res.redirect('/new-comp');
                        req.session.new_comp_errors = new RegistrationPageErrorCollection();
                        req.session.new_comp_errors.addError('general', aerr.message);
                    } else {
                        user_dao.create_team(new user_dao.TeamData(
                            null,
                            new_comp_data.id,
                            'ADMINS',
                            'We fight for the User',
                            true,
                            true,
                            [req.session.user_data.id]
                        ), function (berr, bres) {
                            if (berr) {
                                req.session.new_comp_errors = req.session.new_comp_errors || new RegistrationPageErrorCollection();
                                req.session.new_comp_errors.addError('general', berr.message);
                            } else {
                                req.session.new_comp_data = new_comp_data;
                                data.comp_id = req.session.new_comp_data.id;
                                console.log('Competition created, id: ' + req.session.new_comp_data.id);
                                finish();
                            }
                        });
                    }
                });
            } else {
                // Redirect, with errors.
                req.session.new_comp_errors = new RegistrationPageErrorCollection();
                for (var i = 0; i < error_list.length; i++) {
                    if (error_list[i].field === 'name') {
                        req.session.new_comp_errors.addError('comp_name', error_list[i].error);
                    } else if (error_list[i].field === 'start_date') {
                        req.session.new_comp_errors.addError('start_date', error_list[i].error);
                    } else if (error_list[i].field === 'end_date') {
                        req.session.new_comp_errors.addError('end_date', error_list[i].error);
                    } else if (error_list[i].field === 'time_penalty') {
                        req.session.new_comp_errors.addError('time_penalty', error_list[i].error);
                    } else if (error_list[i].field === 'max_team_size') {
                        req.session.new_comp_errors.addError('max_team_size', error_list[i].error);
                    } else {
                        req.session.new_comp_errors.addError('general', error_list[i].error);
                    }
                }
                res.redirect('/admin/new-comp');
            }
        } else {
            console.log('New competition ' + req.session.new_comp_data.name + ' already created, skipping creation...');
            data.comp_id = req.session.new_comp_data.id;
            finish();
        }
    }

    /**
     * Perform the fill_data function and render the page.
     */
    function finish() {

        // Get page errors from session, if they exist. If not, create a new, empty object
        req.session.new_comp_errors = null;

        data.comp_data = req.session.new_comp_data;

        user_dao.getAdminTeamMembers(data.comp_data.id, function (aerr, admin_team) {
            data.admins_list = [];
            if (aerr) {
                data.page_errors.addError('admin_team_list', 'Could not load list of admins: ' + aerr.message);
            } else {
                data.admins_list = admin_team;
            }

            admin_layer.fill_data(req, data, function (new_data) {
                res.render('./admin/new-comp-team-select.jade', new_data);
            });
        });
    }
};