/**
 * Created by Kamaron on 4/22/2015.
 */

exports.get_problem_data = function (prob_id, cb) {
    cb({
        prob_id: prob_id,
        prob_name: 'Test Problem 1'
    });
};