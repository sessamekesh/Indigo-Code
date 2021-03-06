/**
 * Created by Kamaron on 7/22/2015.
 */

var async = require('async');
var problemDAO = require('../../dao/problem_dao');
var ProblemData = problemDAO.ProblemData;
var fs = require('fs');
var jade = require('jade');

// Make sure all of our data directories exist...
function makeSureDirectoryExists(path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST'){
            throw e;
        }
    }
}

/**
 * Receive a problem submission
 *  1) Register the Problem (maintain the ID, in case we need to delete it)
 *      On error, abort
 *  2) Upload the problem description, make sure it is in a recognizable format
 *      On error, delete problem and abort
 *  3) Show success page (link to create-new-test, create-problem pages)
 * @param req
 * @param res
 */
exports.post = function (req, res) {

    /**
     * @type {number|null}
     */
    var problemId = null;

    /**
     * @type {ProblemData|null}
     */
    var problemData = null;

    async.waterfall([
        function (callback) {
            // Insert the new problem
            problemDAO.insertProblem(new ProblemData(
                null,
                req.body.prob_name,
                req.body.comp_id,
                req.body.default_time_limit,
                false
            ), callback);
        }, function (newProblemData, callback) {
            problemId = newProblemData.id;
            problemData = newProblemData;
            // Find and move the problem description file to a staging area.
            //  As of now, we support PDF and JADE files.
            if (req.files['problem_description']) {
                console.log(req.files['problem_description']);
                var description = req.files['problem_description'];
                if (description.extension === 'jade') {
                    var newLocation = './views/problem/descriptions/' + problemId + '.jade';
                    var jadeDest = fs.createWriteStream(newLocation);
                    var jadeSource = fs.createReadStream(description.path);

                    jadeSource.pipe(jadeDest);
                    jadeSource.on('end', function () {
                        fs.unlink(description.path, function (delete_file_error) {
                            delete_file_error && (console.log(
                                'new-problem-submit.js: Error deleting file '
                                + description.path
                                + ' - '
                                + delete_file_error.message));
                        });

                        try {
                            var renderFunction = jade.compileFile(newLocation, {pretty: false});
                            renderFunction({
                                problemList: [],
                                problemData: problemData
                            });

                            callback(null, {path: newLocation, type: description.extension});
                        } catch (e) {
                            // Could not be compiled
                            console.log('Invalid JADE file:', e.message);
                            callback(new Error('Invalid JADE file provided'));
                            fs.unlink(newLocation);
                        }
                    });
                } else if (description.extension === 'pdf') {
                    // Copy PDF file over.
                    // TODO KAM: Copy over to competition assets directory
                    makeSureDirectoryExists('./data/competition-assets/' + req.body.comp_id);
                    newLocation = './data/competition-assets/' + req.body.comp_id + '/pdesc-' + problemId + '.pdf';
                    var pdfDest = fs.createWriteStream(newLocation);
                    var pdfSource = fs.createReadStream(description.path);
                    pdfSource.pipe(pdfDest);
                    pdfSource.on('end', function () {
                        fs.unlink(description.path, function (dfe) {
                            dfe && (console.log('new-problem-submit.js: Error deleting file ' + description.path, dfe));
                        });
                        callback(null, { path: newLocation, type: 'pdf' });
                    });
                } else {
                    // TODO KAM: Be a bit more picky about what file types are uploaded, mkay?
                    newLocation = './views/problem/descriptions/' + problemId + '.' + description.extension;
                    var otherDest = fs.createWriteStream(newLocation);
                    var otherSource = fs.createReadStream(description.path);
                    otherSource.pipe(otherDest);
                    otherSource.on('end', function () {
                        fs.unlink(description.path, function (delete_file_error) {
                            delete_file_error && (console.log(
                                'new-problem-submit.js: Error deleting file '
                                + description.path
                                + ' - '
                                + delete_file_error.message
                            ));
                        });
                        callback(null, { path: newLocation, type: description.extension });
                    });
                }
            } else {
                fs.unlink(description.path, function (delete_file_error) {
                    delete_file_error && (console.log(
                        'new-problem-submit.js: Error deleting file '
                        + description.path
                        + ' - '
                        + delete_file_error.message
                    ));
                });
                callback(new Error('No problem description file provided!'));
            }
        }
    ], function (err, result) {
        // TODO KAM
        // Everything is done, show success or error
        // If there was an error, delete the problem created
        if (err) {
            problemId && problemDAO.removeProblem(problemId, function () {});
            res.status(400).render('./error.jade', { error: err, message: err.message } );
        } else {
            res.status(201).render('./admin/new-problem-submit.jade', {
                title: 'New problem successfully created',
                subtitle: 'Problem ' + problemData.name,
                redirect_url: '/admin',
                problemId: problemId,
                compId: problemData.compId
            });
        }
    });
};