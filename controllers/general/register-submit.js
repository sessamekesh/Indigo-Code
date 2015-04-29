/**
 * Created by kamaron on 4/28/15.
 */

exports.get = function (req, res) {
    // TODO KIP: Send away the user in shame here
    res.send("Hooray!");
};

exports.post = function (req, res) {
    // TODO KIP: Parse team registration form here
    console.log(req.body);
    res.send("Hooray-er!");
};