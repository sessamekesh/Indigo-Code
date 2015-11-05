/**
 * Created by Kamaron on 8/21/2015.
 */

var fs = require('fs');

var ProblemDescription = require('../../models/ProblemDescription').ProblemDescription;
var competitionLayer = require('../competition/index');

/**
 * @param req
 * @param res
 */
exports.get = function (req, res) {
    exports.fill_data(req, {
        title: req.problemData.name,
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id
    }, function (newData) {
        newData.problemDescription = new ProblemDescription(newData.problemData);

        fs.stat('./problem/descriptions/' + req.problemData.id + '.jade', function (fse, fsd) {
            if (fse || !fsd.isFile()) {
                // If no JADE file exists, look for other types. Say, PDF?
                fs.stat('./data/competition-assets/' + req.comp_data.id + '/pdesc-' + req.problemData.id + '.pdf', function (pdfe, pdfr) {
                    if (pdfe || !pdfr.isFile()) {
                        // Error
                        res.render('./error', {
                            error: new Error('Could not find description file - notify admin'),
                            message: 'Could not find description file - notify admin'
                        });
                    } else {
                        // Serve the generic JADE file, with the description PDF...
                        newData['description-type'] = 'pdf';
                        res.render('./problem/default-description', newData);
                    }
                });
            } else {
                // Serve the jade file...
                res.render('./problem/descriptions/' + req.problemData.id + '.jade', newData);
            }
        });
    });
};

/**
 * Fill data in general for problem layer pages. Call for all other problem pages.
 * @param req
 * @param data
 * @param cb {function (NewData: object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    competitionLayer.fill_data(req, data, function (newData) {
        newData.problemData = req.problemData;

        cb(newData);
    });
};