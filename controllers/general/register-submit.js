/**
 * Created by kamaron on 4/28/15.
 */

var user_dao = require('../../dao/user_dao'),
    team_dao = require('../../dao/team_dao');

exports.get = function (req, res) {
    // TODO KIP: Send away the user in shame here
    res.send("Hooray!");
};

exports.post = function (req, res) {
    // TODO KIP: Parse team registration form here
    var info = req.body;

    if (info === undefined) {
        throw new Error('No information sent via POST for registration');
    } else if (req.method !== 'POST') {
        throw new Error('Information must be sent via POST (for security)');
    } else {
        console.log(req.body);
        res.send('Hooray-er!');
    }
};