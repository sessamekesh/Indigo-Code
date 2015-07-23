/**
 * Created by Kamaron on 7/22/2015.
 */

var async = require('async');
var problemDAO = require('../../dao/problem_dao');

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

    async.waterfall([
        function (callback) {
            // Insert the new problem
            problemDAO.insertProblem(new problemDAO.exports.ProblemData(
                null,
                req.body.prob_name,
                req.body.comp_id,
                req.body.default_time_limit,
                false
            ), callback);
        }, function (newProblemData, callback) {
            problemId = newProblemData.id;
            // Find and move the problem description file to a staging area
            // TODO KAM
            callback(null);
        }, function (descriptionFile, callback) {
            // Validate the description file
            // TODO KAM
            callback(null, true);
        }
    ], function (err, result) {
        // TODO KAM
        // Everything is done, show success or error
        // If there was an error, delete the problem created
        if (err) {
            // problemId && problemDAO.removeProblem(problemId);
            res.send('Error happened');
        } else {
            res.send('No error happened');
        }
    });
};