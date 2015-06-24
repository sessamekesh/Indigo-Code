/**
 * Created by Kamaron on 6/22/2015.
 */

var user_dao = require('../../dao/user_dao');

/**
 * Participation get endpoint. Make sure user is logged in, and has access to view the user with the given ID.
 *  If they do, then return a list of competition data for the competitions in which they have served, as well
 *  as a link to that competition's data, and the team data of team on which they participated for that competition.
 * @param req
 * @param res
 */
exports.get = function(req, res) {
    console.log(req.query);

    if (!isNaN(parseInt(req.query && req.query.id))) {
        user_dao.getUserById(req.query.id, false, function (err, user_data) {
            if (err) {
                if (err.message === user_dao.USER_ID_NOT_FOUND) {
                    res.status(404).json({'error': 'User with given ID was not found'});
                } else {
                    res.status(500).json({'error': 'Internal server error occurred. Check server logs.'});
                    console.log('/controllers/user/participation.js: Could not load user data from database: ' + err.message);
                }
            } else {
                if (user_data && (user_data.public_facing || user_data.id == (req.session.user_data || {}).id || (req.session.user_data || {}).is_admin)) {
                    // TODO KAM: Change this to... whatever format you want to send across here
                    user_dao.getUserParticipation(user_data, function (aerr, ares) {
                        if (aerr) {
                            if (aerr.message === user_dao.NO_USER_PARTICIPATION_FOUND) {
                                res.status(200).json({'success': true, 'participation': []});
                            } else if (aerr.message === user_dao.USER_ID_NOT_FOUND) {
                                res.status(404).json({'error': 'User with given ID was not found'});
                            } else {
                                res.status(500).json({'error': 'Internal server error occurred. Check server logs.'});
                                console.log('/controllers/user/participation.js: Could not load participation from database: ' + aerr.message);
                            }
                        } else {
                            // NEXT VERSION: Why not make a fully functional REST API, in the true spirit of REST?
                            //  That would include sending links to get the competition data across here, in addition
                            //  to the compID and required information for this particular endpoint.
                            res.status(200).json({'success': true, 'participation': ares.map(function (row) {
                                return {
                                    'compID': row.compData.id,
                                    'compName': row.compData.name,
                                    'teamName': row.teamData.team_name,
                                    'teamTagline': row.teamData.team_tagline
                                };
                            })});
                        }
                    });
                } else {
                    res.status(403).json({'error': 'Cannot access data for user with given ID. Must be logged in as admin to view private user participation data'});
                }
            }
        });
    } else {
        res.status(400).json({'error': 'Could not process request: No user ID provided'});
    }
};