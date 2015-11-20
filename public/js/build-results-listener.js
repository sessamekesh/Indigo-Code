/**
 * Created by Kamaron on 9/7/2015.
 *
 * An HTML file including this page listens for results posted from the build server.
 * A websocket connection is opened to the results broadcaster. Results are posted from
 *  the server when a build finishes. The server may also be queried about the
 *  list of builds that are currently pending.
 */

/**
 * @param submissionID {number}
 * @constructor
 */
var BuildResultsRow = function (submissionID) {
    /**
     * @type {jQuery}
     * @private
     */
    this._element = $('#submission_' + submissionID);

    /**
     * @type {jQuery}
     * @private
     */
    this._resultsDiv = $('#submission_' + submissionID + '_result');

    /**
     * @type {*|jQuery|HTMLElement}
     * @private
     */
    this._notesDialog = $('<div>');

    /**
     * @type {boolean}
     * @private
     */
    this._success = this._element.hasClass('success');

    /**
     * @type {boolean}
     * @private
     */
    this._failed = this._element.hasClass('danger');

    /**
     * @type {boolean}
     * @private
     */
    this._noPenalty = this._element.hasClass('info');

    this._resultsDiv.on('click', function () {
        this._notesDialog.dialog();
    }.bind(this));
};

/**
 * Strips all colors from the row, in preparation for setting a state
 * @private
 */
BuildResultsRow.prototype._strip = function () {
    if (this._failed) {
        this._element.removeClass('danger');
        this._failed = false;
    }

    if (this._noPenalty) {
        this._element.removeClass('info');
        this._noPenalty = false;
    }

    if (this._success) {
        this._element.removeClass('success');
        this._success = false;
    }

    this._notesDialog.html('');
    this._notesDialog.prop('title', 'Pending...');
    this._resultsDiv.text('Pending...');
};

/**
 * Mark this row as success
 */
BuildResultsRow.prototype.success = function (result) {
    this._strip();
    this._element.addClass('success');
    this._success = true;

    this._resultsDiv.text('Correct Answer');

    this._notesDialog.html('<p>' + result.notes + '</p>');
    this._notesDialog.prop('title', 'Correct Answer');
};

/**
 * Mark this row as failed
 */
BuildResultsRow.prototype.failed = function (result) {
    this._strip();
    this._element.addClass('danger');
    this._failed = true;

    var resultText = '';

    switch (result.result) {
        case 'WA':
            resultText = 'Wrong Answer';
            break;
        case 'TLE':
            resultText = 'Time Limit Exceeded';
            break;
        case 'RE':
            resultText = 'Runtime Error';
            break;
        default:
            resultText = 'Corrupt Response (fail)';
            break;
    }

    this._notesDialog.prop('title', resultText);
    this._resultsDiv.text(resultText);

    this._notesDialog.html('<p>' + result.notes + '</p>');
};

/**
 * Mark a build pending
 */
BuildResultsRow.prototype.pending = function () {
    this._strip();
};

/**
 * Mark this row as failed, with no penalty
 */
BuildResultsRow.prototype.noPenalty = function (result) {
    this._strip();
    this._element.addClass('info');
    this._noPenalty = true;

    var resultText = '';

    switch (result.result) {
        case 'ISE':
            resultText = 'Internal Server Error';
            break;
        case 'BE':
            resultText = 'Build Error';
            break;
        default:
            resultText = 'Corrupt Response (fail, no penalty)';
            break;
    }

    this._notesDialog.prop('title', resultText);
    this._resultsDiv.text(resultText);

    this._notesDialog.html('<p>' + result.notes + '</p>');
};

$(function () {
    var socket = io('http://' + window.location.hostname + ':' + window.location.port + '/build-results');

    var jqs = $('tr[id*="submission_"]');

    /**
     * @type {{number: BuildResultsRow}}
     */
    var submissionRows = {};
    var submissionIDs = [];

    jqs.each(function (idx, element) {
        var newId = parseInt(element.id.substr(element.id.indexOf('submission_') + 'submission_'.length));
        submissionIDs.push(newId);
        submissionRows[newId] = new BuildResultsRow(newId);
    });

    socket.emit('get results', {
        idList: submissionIDs
    });

    socket.on('get results', function (msg) {
        if (msg.error) {
            console.log('Error getting results:', msg);
        } else if (msg.results) {
            console.log('Results obtained!', msg);
            // Update all of the rows (if we have them) in the results...
            for (var i = 0; i < msg.results.length; i++) {
                var id = msg.results[i].id;
                if (submissionRows[id]) {
                    switch (msg.results[i].result) {
                        case '':
                            submissionRows[id].pending();
                            break;
                        case 'AC':
                            submissionRows[id].success(msg.results[i]);
                            break;
                        case 'RE':
                        case 'WA':
                        case 'TLE':
                            submissionRows[id].failed(msg.results[i]);
                            break;
                        case 'ISE':
                        case 'BE':
                            submissionRows[id].noPenalty(msg.results[i]);
                            break;
                        default:
                            console.log('Unknown result', msg.results[i]);
                            break;
                    }
                }
            }
        } else {
            console.log('???', msg);
        }
    });
});