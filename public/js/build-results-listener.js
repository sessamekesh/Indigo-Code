/**
 * Created by Kamaron on 9/7/2015.
 *
 * An HTML file including this page listens for results posted from the build server.
 * A websocket connection is opened to the results broadcaster. Results are posted from
 *  the server when a build finishes. The server may also be queried about the
 *  list of builds that are currently pending.
 */

/**
 * @param jq {jQuery}
 * @constructor
 */
var BuildResultsRow = function (jq) {
    /**
     * @type {jQuery}
     * @private
     */
    this._element = jq;

    /**
     * @type {boolean}
     * @private
     */
    this._success = $(jq).hasClass('success');

    /**
     * @type {boolean}
     * @private
     */
    this._failed = $(jq).hasClass('danger');

    /**
     * @type {boolean}
     * @private
     */
    this._noPenalty = $(jq).hasClass('info');
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
};

/**
 * Mark this row as success
 */
BuildResultsRow.prototype.success = function () {
    this._strip();
    this._element.addClass('success');
    this._success = true;
};

/**
 * Mark this row as failed
 */
BuildResultsRow.prototype.failed = function () {
    this._strip();
    this._element.addClass('danger');
    this._failed = true;
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
BuildResultsRow.prototype.noPenalty = function () {
    this._strip();
    this._element.addClass('info');
    this._noPenalty = true;
};

$(function () {
    // TODO KAM: You really shouldn't do this... You're going to want to generate this.
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
        submissionRows[newId] = new BuildResultsRow(element);
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
                            submissionRows[id].success();
                            break;
                        case 'RE':
                        case 'WA':
                        case 'TLE':
                            submissionRows[id].failed();
                            break;
                        case 'ISE':
                        case 'BE':
                            submissionRows[id].noPenalty();
                            break;
                        default:
                            console.log('Unknown result', msg.results[i].result);
                            break;
                    }
                }
            }

        } else {
            console.log('???', msg);
        }
    });
});