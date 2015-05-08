/**
 * Created by Kamaron on 4/22/2015.
 */

var index = require('./index');

exports.get = function (req, res) {
    var params = {
        title: 'About USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/about'
    };

    index.fill_data(req, params, function (new_data) {
        res.render('./general/about', new_data);
    });
};