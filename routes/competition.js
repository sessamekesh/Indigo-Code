/**
 * Created by Kamaron on 4/21/2015.
 */

var express = require('express');
var problem_router = require('./problem');
var fs = require('fs');
var user_dao = require('../dao/user_dao');
var competition_dao = require('../dao/competition_dao');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // Competition restrictions go here...

    /** @type {user_dao.UserData} */
    var user_data = req.session.user_data;
    var team_data;

    // ID must be an integer...
    if (isNaN(parseInt(req.params.id || {}))) {
        throw new Error('Competition ID ' + req.params.id + ' is not valid!');
    } else {
        // Authenticate user!
        console.log('----------------------GATEKEEPER-----------------------');
        console.log('For competition ' + req.params.id + '!');
        if (user_data) {
            console.log('-- ' + (user_data.is_admin ? 'SIR ' + user_data.username : user_data.username + ' THE PEASANT'));
            // Load in team data from dao...
            user_dao.getTeamOfUser(req.session.user_data.id, req.params.id, true, function (team_err, user_team_data) {
                if (team_err) {
                    console.log('-- Could not load team data - ' + team_err.message);
                } else {
                    team_data = user_team_data;
                }
                auth();
            });
        } else {
            console.log('-- FILTHY GUEST');
            auth();
        }
    }

    /**
     * Perform the actual work, once team data is loaded
     */
    function auth() {
        competition_dao.get_competition_data(req.params.id, function (aerr, comp_data) {
            if (aerr) {
                console.log('Failed to get competition data: ' + aerr.message);
                throw aerr;
            } else {
                if (comp_data) {
                    gatekeeper(team_data, comp_data, function (is_authenticated, needs_to_register, rejection_message) {
                        var err;
                        if (is_authenticated) {
                            // TODO KAM: If needs_to_register, create a new team here
                            if (needs_to_register) {
                                if (user_data) {
                                    user_dao.create_team(new user_dao.TeamData(
                                        null,
                                        comp_data.id,
                                        ' ' + user_data.username,
                                        'For the lulz',
                                        false,
                                        user_data.public_facing, // TODO KIP: A way to customize this better?
                                        [user_data.id]
                                    ), function (reg_err, reg_res) {
                                        if (reg_err) {
                                            res.render('./error', { message: 'Could not access competition - could not create team for individual user. Check logs' });
                                            console.log('competition.js: Could not create team for individual user ' + user_data.username + ': ' + reg_err.message);
                                        } else {
                                            req.comp_data = comp_data;
                                            req.team_data = reg_res;
                                            req.user_data = user_data;
                                            next();
                                        }
                                    });
                                } else {
                                    req.comp_data = comp_data;
                                    req.team_data = team_data;
                                    req.user_data = user_data;
                                    next();
                                }
                            } else {
                                req.comp_data = comp_data;
                                req.team_data = team_data;
                                req.user_data = user_data;
                                next();
                            }
                        } else if (needs_to_register) {
                            res.redirect('/register-team?id=' + comp_data.id);
                        } else {
                            err = new Error('Access denied - ' + rejection_message);
                            res.render('./error', { message: err.message, error: err, competition: comp_data.id });
                        }
                    });
                } else {
                    throw new Error('No competition found with the given ID, or whatever.');
                }
            }
        });
    }
});

// Anything under directory '/problem' goes to problem router
router.use('/:id/problem', problem_router);

// Add router endpoints here...
var controllers = fs.readdirSync(__dirname + '/../controllers/competition');
for (var i = 0; i < controllers.length; i++) {
    var cl = require('../controllers/competition/' + controllers[i]);
    if (Object.prototype.toString.call(cl.get) === '[object Function]') {
        router.get('/:id/' + controllers[i].substring(0, controllers[i].length - 3), cl.get);
        if (controllers[i] === 'index.js') {
            router.get('/:id/', cl.get);
        }
    }

    if (Object.prototype.toString.call(cl.post) === '[object Function]') {
        router.post('/:id/' + controllers[i].substring(0, controllers[i].length - 3), cl.post);
        if (controllers[i] === 'index.js') {
            router.post('/:id/', cl.post);
        }
    }
}

/**
 * Authenticates a viewer to the system, based on their user and team data,
 *  as well as the competition data for the competition they are trying to access.
 * @param teamData {user_dao.TeamData=}
 * @param compData {comp_dao.CompData}
 * @param cb {function(result: boolean, should_register: boolean, notes: string=)}
 */
function gatekeeper(teamData, compData, cb) {
    if (teamData && teamData.is_admin === true) {
        // Admin team? Brush them right in.
        cb(true, false);
    } else if (compData.end_date < Date.now()) {
        // The competition is over, let anybody see it.
        cb(true, !teamData);
    } else if (compData.start_date < Date.now()) {
        // The competition has begun...
        if (!!teamData) {
            // And the user is a member of a team, pass on through
            cb(true, false);
        } else {
            // And the user is not on a team, deny
            cb(false, true, "Must be a member of a team to view an ongoing competition");
        }
    } else {
        cb(false, true, "Competition has not yet begun, must be on an admin team to continue");
    }
}

module.exports = router;
