/**
 * Created by Kamaron on 8/22/2015.
 */

exports.post = function (req, res) {
    res.status(501).render('./error', {
        error: new Error('Endpoint not implemented'),
        message: 'Endpoint not implemented'
    });
};