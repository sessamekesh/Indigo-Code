/**
 * Created by kamaron on 11/20/15.
 */

/**
 * I'm going to handle this as a module, so as to have some degree of encapsulation
 */
var ScoreboardController = (function () {

    /**
     * Represents if or if not a problem was solved, to the rendering frontend
     * NOTICE: Taken from server side model. Do not modify without also modifying server model
     * @param problemName {string} Name of the problem (human-readable)
     * @param isSolved {bool} True if the problem was solved, false otherwise
     * @constructor
     */
    var ProblemSolvedRenderData = function (problemName, isSolved)  {
        this.problemName = problemName;
        this.isSolved = !!isSolved;
    };

    /**
     * Represents a single row in the Scoreboard table on the client side
     * NOTICE: Taken from server side model. Do not modify without also modifying server model
     * @param teamID {number} Numeric unique ID of the team
     * @param teamName {string} Name of the team
     * @param teamTagline {string}
     * @param score {number}
     * @param timePenalty {number}
     * @param problemsSolved {Array.<ProblemSolvedRenderData>}
     * @constructor
     */
    var ScoreboardRenderData = function (teamID, teamName, teamTagline, score, timePenalty, problemsSolved) {
        this.teamID = teamID;
        this.teamName = teamName;
        this.teamTagline = teamTagline;
        this.score = score;
        this.timePenalty = timePenalty;
        this.problemsSolved = problemsSolved;
    };

    /**
     * Time to fade in/out for table rows as they are changing positions
     * @type {number}
     */
    var fadeTime = 400;

    /**
     * How much time to wait for new updates after an update is received before
     *  sorting the scoreboard. On receive a new update, refresh any waiting done.
     * @type {number}
     */
    var waitToUpdateTime = 2500;

    /**
     * An individual score results row may be stored in JavaScript,
     *  will create itself and add itself to the score table, and handle
     *  all JQuery methods itself as well
     * Will create a row on creation of the results row!!!
     * @param renderData {ScoreboardRenderData} Render data to use for this particular thing
     * @param problemList {Array.<ProblemSolvedRenderData>} List of problems
     * @constructor
     */
    var ScoreResultsRow = function (renderData, problemList) {
        /**
         * Index for iteration
         * @type {number}
         */
        var i = 0;

        /**
         * Identifying value of this row - the team ID
         * @type {number|*}
         */
        this.teamID = renderData.teamID;

        /**
         * False until the object is initialized. Prevents double initialization
         * @type {boolean}
         * @private
         */
        this._isInitialized = false;

        /**
         * Logical data used for the rendering of our ScoreResultsRow
         * @type {?ScoreboardRenderData}
         */
        this.renderData = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._rankElement = $('<td>', { id: 'score-data-rank-' + this.teamID });


        /**
         * @type {jQuery}
         * @private
         */
        this._teamNameElement = $('<p>', { id: 'score-data-team-' + this.teamID });

        /**
         * @type {jQuery}
         * @private
         */
        this._teamTaglineElement = $('<i>', { id: 'score-data-tagline-' + this.teamID });

        /**
         * @type {jQuery}
         * @private
         */
        this._teamScoreElement = $('<td>', { id: 'score-data-score-' + this.teamID });

        /**
         * @type {jQuery}
         * @private
         */
        this._teamPenaltyElement = $('<td>', { id: 'score-data-penalty-' + this.teamID });

        /**
         * @type {{string : jQuery}}
         * @private
         */
        this._teamProblemElements = [];

        for (i = 0; i < problemList.length; ++i) {
            this._teamProblemElements.push($('<td>', { id: 'score-data-team-' + teamID + '-problem-' + problemList[i].problemName }));
        }

        /**
         * @type {jQuery}
         */
        this.rowElement = $('<tr>', { id: 'score-row-' + this.teamID })
            .append(this._rankElement.text('#'))
            .append($('<td>').append(this._teamNameElement.text('TEAM NAME')).append(this._teamTaglineElement).text('TEAM TAGLINE'))
            .append(this._teamScoreElement.text('SCORE'))
            .append(this._teamPenaltyElement.text('PENALTY'));

        for (i = 0; i < this._teamProblemElements.length; ++i) {
            this.rowElement.append(this._teamProblemElements[i].text('??'));
        }
    };

    /**
     * Update the score results row with data from the client side
     * @param rank {number} Numeric rank of this row
     * @param resultsData {ScoreboardRenderData}
     */
    ScoreResultsRow.prototype.update = function(rank, resultsData) {
        this.renderData = resultsData;
        this._rankElement.text(rank);

        this._teamNameElement.text(resultsData.teamName);
        this._teamTaglineElement.text(resultsData.teamTagline);
        this._teamScoreElement.text(resultsData.score);
        this._teamPenaltyElement.text(resultsData.timePenalty);

        // TODO KAMARON: This assumes always sorted, is that okay? I'm not sure.
        for (var i = 0; i < resultsData.problemsSolved.length; ++i) {
            this._teamProblemElements[i].text(resultsData.problemsSolved[i].isSolved);
        }
    };

    /**
     * Holds a list of ScoreResultRows, and handles all sorting and state between them
     * @constructor
     */
    var Scoreboard = function () {

        /**
         * @type {Array.<ProblemSolvedRenderData>}
         * @private
         */
        this._problemList = [];

        /**
         * @type {Array.<ScoreResultsRow>}
         * @private
         */
        this._resultsRows = [];

        /**
         * Represents if the scoreboard has been initialized yet.
         *  False if it has not. Starts as false.
         * @type {boolean}
         * @private
         */
        this._isInitialized = false;

        /**
         * ID of the JavaScript Timeout that will be used to perform a sort
         *  and update on the DOM.
         * @type {?number}
         * @private
         */
        this._updateTimeoutID = null;
    };

    /**
     * Initialize the scoreboard with all information needed to function
     * @param problemList {Array.<ProblemSolvedRenderData>}
     * @constructor
     */
    Scoreboard.prototype.Init = function (problemList) {
        this._isInitialized = true;
        this._problemList = problemList;
    };

    /**
     * Method to be invoked when a piece of score data is updated
     * @param data {ScoreboardRenderData}
     * @constructor
     */
    Scoreboard.prototype.UpdateScore = function (data) {

        /**
         * @type {jQuery}
         * @private
         */
        this._base = $('#scoreboard_table');

        // Early out if we have not yet been initialized
        if (!this._isInitialized) {
            console.log('Cannot update score - scoreboard object has not yet been initialized!');
            return;
        }

        /**
         * @type {Scoreboard}
         */
        var me = this;

        /**
         * @type {?ScoreResultsRow}
         */
        var row;

        /**
         * @type {number}
         */
        var rank = -1;

        for (var i = 0; i < this._resultsRows.length; ++i) {
            if (this._resultsRows[i].teamID === data.teamID) {
                row = this._resultsRows[i];
                rank = i + 1;
                break;
            }
        }

        if (!row) {
            row = new ScoreResultsRow(data.teamID, this._problemList);
            rank = this._resultsRows.length + 1;

            if (this._resultsRows.length === 0) {
                this._base.append(row.rowElement);
            } else {
                // TODO KAM: this._base.append(...)?
                row.rowElement.insertAfter(this._resultsRows[this._resultsRows.length - 1].rowElement);
            }

            this._resultsRows.push(row);
        }

        row.update(rank, data);

        if (this._updateTimeoutID) {
            clearTimeout(this._updateTimeoutID);
        }
        this._updateTimeoutID = setTimeout(function () {
            me.SortRows();
            me._updateTimeoutID = null;
        }, waitToUpdateTime);
    };

    /**
     * Sort the ScoreResultsRows stored internally, then update
     *  their locations in the DOM. On a swap, perform blurring operations.
     */
    Scoreboard.prototype.SortRows = function() {
        // Step 1: Get a list of indices the length of our ScoreResultsRow array
        // Step 2: Sort those indices, by score and time penalty of corresponding row
        // Step 3: Fade out results rows that are not properly placed
        // Step 4: Put results rows in the proper place, also performing the .addAfter calls
        // Step 5: Fade back in rows that were previously faded out
    };

    return {
        Scoreboard: new Scoreboard(),
        ScoreResultsRow: ScoreResultsRow
    };
})();