/**
 * Created by kamaron on 11/20/15.
 */

/**
 * Represents if or if not a problem was solved, to the rendering frontend
 * @param problemName {string} Name of the problem (human-readable)
 * @param isSolved {bool} True if the problem was solved, false otherwise
 * @constructor
 */
exports.ProblemSolvedRenderData = function (problemName, isSolved)  {
    this.problemName = problemName;
    this.isSolved = !!isSolved;
};

/**
 * Represents a single row in the Scoreboard table on the client side
 * @param teamID {number} Unique numeric ID of the team
 * @param teamName {string} Name of the team
 * @param teamTagline {string}
 * @param score {number}
 * @param timePenalty {number}
 * @param problemsSolved {Array.<ProblemSolvedRenderData>}
 * @constructor
 */
exports.ScoreboardRenderData = function (teamID, teamName, teamTagline, score, timePenalty, problemsSolved) {
    this.teamID = teamID;
    this.teamName = teamName;
    this.teamTagline = teamTagline;
    this.score = score;
    this.timePenalty = timePenalty;
    this.problemsSolved = problemsSolved;
};