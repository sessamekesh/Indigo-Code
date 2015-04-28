/**
 * Created by kamaron on 4/28/15.
 */

exports.post = function (req, res) {
    // Super easy. Redirect the page indicated (or index, if none given),
    //  after removing the user data from the session.

    req.session.user_data = undefined;
    res.redirect(req.body.redirect || '/');
};