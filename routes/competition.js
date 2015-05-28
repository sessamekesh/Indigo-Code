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

    // ID must be an integer...
    if (isNaN(parseInt(req.params.id || {}))) {
        throw new Error('Competition ID ' + req.params.id + ' is not valid!');
    } else {
        // Authenticate user!
        console.log('----------------------GATEKEEPER-----------------------');
        console.log('For competition ' + req.params.id + '!');
        if (user_data) {
            console.log('-- ' + (user_data.is_admin ? 'SIR ' + user_data.username : user_data.username + ' THE PEASANT'));
        } else {
            console.log('-- FILTHY GUEST');
        }

        competition_dao.get_competition_data(req.params.id, function (aerr, comp_data) {
            /** @type {null|function(user_dao.UserData, user_dao.TeamData, comp_dao.CompData, function (boolean, String=))} */
            var auth_function;

            if (aerr) {
                console.log('Failed to get competition data: ' + aerr.message);
                throw aerr;
            } else {
                if (comp_data) {
                    if (!user_data) {
                        // Filthy guest rules
                        authenticateGuest(comp_data, function (is_authenticated, notes) {
                            if (is_authenticated) {
                                req.comp_data = comp_data;
                                req.team_data = null;
                                next();
                            } else {
                                throw new Error('Access denied - ' + notes);
                            }
                        });
                    } else {
                        if (user_data.is_admin) {
                            // Admin rules
                            auth_function = authenticateAdmin;
                        } else {
                            // Peasant rules
                            auth_function = authenticateUser;
                        }
                        user_dao.getTeamOfUser(user_data.id, comp_data.id, true, function (berr, team_data) {
                            if (berr) {
                                throw berr;
                            } else {
                                auth_function(user_data, team_data, comp_data, function (is_authenticated, notes) {
                                    if (is_authenticated) {
                                        req.comp_data = comp_data;
                                        req.team_data = team_data;
                                        req.user_data = user_data;
                                        next();
                                    } else {
                                        throw new Error('Access denied - '+ notes);
                                    }
                                });
                            }
                        });
                    }
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
 * Authenticate a competition against a team that is administrators in the system
 * @param userData {user_dao.UserData}
 * @param teamData {user_dao.TeamData}
 * @param compData {comp_dao.CompData}
 * @param cb {function (result: Boolean, notes: String=)} result is true if user is authenticated. If not, a message is attached.
 */
function authenticateAdmin(userData, teamData, compData, cb) {
    console.log(userData);
    console.log(teamData);
    console.log(compData);
    cb(true);
}

/**
 * Authenticate a competition against a team that is not an administrator in the system
 * @param userData {user_dao.UserData}
 * @param teamData {user_dao.TeamData}
 * @param compData {comp_dao.CompData}
 * @param cb {function (result: Boolean, notes: String=)} result is true if user is authenticated. If not, a message is attached.
 */
function authenticateUser(userData, teamData, compData, cb) {
    console.log(userData);
    console.log(teamData);
    console.log(compData);
    cb(true);
}

/**
 * Authenticate a guest to a competition
 * @param compData {comp_dao.CompData}
 * @param cb {function (result: Boolean, notes: String=)} result is true if user is authenticated. If not, a message is attached.
 */
function authenticateGuest(compData, cb) {
    console.log(compData);
    cb(true);
}

module.exports = router;