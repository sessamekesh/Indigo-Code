/**
 * Created by Kamaron on 6/8/2015.
 */

var admin_layer = require('./index');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');
var fs = require('fs');

/**
 * Only called on a failed submit, display errors and show form again.
 * @param req {Object}
 * @param res {Object}
 */
exports.get = function (req, res) {
    admin_layer.fill_data(req, {
        title: 'Create a New Competition',
        subtitle: 'Step 3 / 3: Competition description files',
        redirect_url: '/admin/new-comp-desc-files',
        comp_data: req.session.new_comp_data
    }, function (new_data) {
        res.render('./admin/new-comp-desc-files.jade', new_data);
    });
};

/**
 * Received from new-comp-team-select, verify correctness of data to this point and continue.
 *  If data is incorrect, redirect back to new-comp-team-select, filling the new-comp-errors
 *  field of the session variable.
 * @param req
 * @param res
 */
exports.post = function (req, res) {
    var data = {
        title: 'Create a New Competition',
        subtitle: 'Step 3 / 3: Competition description files',
        redirect_url: '/admin/new-comp-desc-files',
        comp_data: req.session.new_comp_data
    };
    var desc_copied = false;
    var rules_copied = false;
    var timeout_time = Date.now() + 750000; // After 7.5 seconds, timeout and send error instead.
    var check_end_frequency = 100; // Every 100 ms, check again if the files copied.

    data.page_errors = req.session.new_comp_errors || new RegistrationPageErrorCollection();

    // Make sure all POST data is okay...
    // Who am I kidding? There's no new data.
    //  Just make sure we have comp_data
    if (!req.session.new_comp_data) {
        // Error page and exit.
        res.render('./error', { error: new Error(), message: 'No competition data defined - cannot continue'});
        return;
    }

    // So! Here, you need to...
    // 1) Copy the template files for both description and rules to the new competition files, respectively.
    // Copy templates over to new files...
    var templates = [
        fs.createReadStream(__dirname + '/../../views/competition/descriptions/template.jade'),
        fs.createReadStream(__dirname + '/../../views/competition/rules/template.jade')
    ];
    var new_files = [
        fs.createWriteStream(__dirname + '/../../views/competition/descriptions/' + req.session.new_comp_data.id + '.jade'),
        fs.createWriteStream(__dirname + '/../../views/competition/rules/' + req.session.new_comp_data.id + '.jade')
    ];

    templates[0].pipe(new_files[0]);
    templates[1].pipe(new_files[1]);

    // That's it. You're done. You can send the result back now.
    //  Or, rather, when both pipes are done.
    templates[0].on('end', function () {
        desc_copied = true;
    });
    templates[1].on('end', function () {
        rules_copied = true;
    });

    check_for_end();

    /**
     * Check to see if either a timeout has occurred, or both files have been copied.
     */
    function check_for_end() {
        if (Date.now() > timeout_time) {
            res.render('./error', { message: 'Timeout occurred. Description copied: ' + desc_copied + ', rules: ' + rules_copied, error: new Error() });
        } else if (desc_copied && rules_copied) {
            // Success! Now, send the response page back.
            admin_layer.fill_data(req, data, function (new_data) {
                res.render('./admin/new-comp-desc-files.jade', new_data);
            });
        } else {
            setTimeout(check_for_end, check_end_frequency);
        }
    }
};