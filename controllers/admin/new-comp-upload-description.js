/**
 * Created by Kamaron on 6/12/2015.
 */

/**
 * This file is to be used as a POST endpoint receiving a .JADE file, which will serve as the competition
 *  description. TODO KIP: Allow for assets to also be taken in here.
 */

// TODO HANSY: Look at this file and /views/admin/new-comp-desc-files.jade. You'll find that in
//  new-comp-desc-files, there are a whole bunch of endpoints that are missing.
//  Create a file /controllers/admin/new-comp-upload-rules.js, it will pretty much do the exact same thing this
//  file does, except you will be moving to "rules" instead of "description" everywhere.

var CompetitionDescription = require('../../models/CompetitionDescription');
var app = require('../../app');
var fs = require('fs');
var jade = require('jade');

/**
 * Receive a POST request containing a .JADE file
 * TODO KIP: Also absorb any required assets here, so that they can be linked in this function (pictures, etc)
 * @param req {object}
 * @param res {object}
 */
exports.post = function (req, res) {

    var testPageData;
    var file = req.files["new-desc-file"];

    // TODO KIP: If file.mime === whatever/jade, upload jade, otherwise yeah yeah yeah.

    // For the created competition, attempt to render JADE file using same data competition/index.js
    //  will use when it goes to render this file.
    testPageData = new CompetitionDescription(req.session.new_comp_data);

    var testPath = './views/competition/descriptions/' + req.session.new_comp_data.id + '_t.jade';
    var newPath = './views/competition/descriptions/' + req.session.new_comp_data.id + '.jade';

    // Copy file to new location
    var source;
    var dest;
    source = fs.createReadStream(file.path);
    dest = fs.createWriteStream(testPath);
    source.pipe(dest);
    source.on('end', function () {
        fs.unlink(file.path, function (delete_file_error) {
            if (delete_file_error) {
                console.log('new-comp-upload-description.js: Error deleting file ' + file.path + ' - ' + delete_file_error.message);
            }
        });

        try {
            var renderFunction = jade.compileFile(testPath, { pretty: true });
            var html = renderFunction(testPageData);
            res.status(200).type('htm').send(html);

            // Move from the test path to the new path, finishing the deal.
            var finalSource = fs.createReadStream(testPath);
            var finalDest = fs.createWriteStream(newPath);
            finalSource.pipe(finalDest);
            finalSource.on('end', function() {
                fs.unlink(testPath, function (delete_file_error) {
                    if (delete_file_error) {
                        console.log('new-comp-upload-description.js: Error deleting test file ' + testPath + ' - ' + delete_file_error.message);
                    }
                });
            });
            finalSource.on('error', function (err) {
                console.log('new-comp-upload-description.js: Error moving ' + testPath + ' to ' + newPath + ': ' + err.message);
            });
        } catch (e) {
            res.render('./error', {message: 'Could not render page, description not updated', error: e});
            fs.unlink(testPath, function (delete_file_error) {
                if (delete_file_error) {
                    console.log('new-comp-upload-description.js: Error deleting uploaded file ' + file.path + ' - ' + delete_file_error.message);
                }
            });
        }
    });
    source.on('error', function (err) {
        res.status(500).render('./error', { message: 'Error copying file', error: err });
        console.log('Could not copy file to new location: ' + err.message);
    });
};