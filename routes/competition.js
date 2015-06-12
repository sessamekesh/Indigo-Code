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
                    gatekeeper(team_data, comp_data, function (is_authenticated, rejection_message) {
                        var err;

                        if (is_authenticated) {
                            req.comp_data = comp_data;
                            req.team_data = team_data;
                            req.user_data = user_data;
                            next();
                        } else {
                            err = new Error('Access denied - ' + rejection_message);
                            console.log(comp_data.id);
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
 * @param cb {function(result: boolean, notes: string=)}
 */
function gatekeeper(teamData, compData, cb) {
    if (teamData && teamData.is_admin === true) {
        // Admin team? Brush them right in.
        cb(true);
    } else if (compData.end_date < Date.now()) {
        // The competition is over, let anybody see it.
        cb(true);
    } else if (compData.start_date < Date.now()) {
        // The competition has begun...
        if (!!teamData) {
            // And the user is a member of a team, pass on through
            cb(true);
        } else {
            // And the user is not on a team, deny
            cb(false, "Must be a member of a team to view an ongoing competition");
        }
    } else {
        cb(false, "Competition has not yet begun, must be on an admin team to continue");
    }
}

module.exports = router;
