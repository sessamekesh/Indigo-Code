/**
 * Created by Kamaron on 6/8/2015.
 */

var competition_layer = require('./index');
var CompetitionRules = require('../../models/CompetitionRules');

exports.get = function (req, res) {
    competition_layer.fill_data(req, {
        title: req.comp_data.name,
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/competition/' + req.comp_data.id + '/rules'
    }, function (new_data) {
        // I'm putting this here, because it only applies to the index page.
        new_data.comp_desc = new CompetitionRules(new_data.comp_data);

        res.render('./competition/rules/' + req.comp_data.id + '.jade', new_data);
    });
};