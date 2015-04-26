/**
 * Created by Kamaron on 4/22/2015.
 */

exports.get_team_data = function (team_id, cb) {
    cb(null, {
        team_id: team_id,
        comp_id: 0,
        team_name: 'Team Awesome',
        tagline: 'Definitely gonna win',
        users: [0],
        share_code: true,
        is_admin: true
    });
};