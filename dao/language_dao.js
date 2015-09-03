/**
 * Created by kamaron on 9/2/15.
 */

var db = require('./db');

/**
 * Create a database entry for the language supplied by the buildserver
 * @param id {string}
 * @param name {string}
 * @param notes {string}
 * @constructor
 */
var LanguageData = function (id, name, notes) {
    this.id = id;
    this.name = name;
    this.notes = notes;
};

/**
 * @param languageId {string}
 * @param callback {function (err: Error=, data: LanguageData=)}
 */
var getLanguageData = function (languageId, callback) {
    if (!languageId) {
        callback(new Error('Invalid language ID'));
    } else {
        db.owl_query(
            'SELECT id, name, notes FROM language WHERE id=?;',
            [languageId],
            function (dberr, dbres) {
                callback(dberr, dbres.map(function (row) {
                    return new LanguageData(
                        row.id,
                        row.name,
                        row.notes
                    );
                }));
            }
        );
    }
};

/**
 * @param languageData {LanguageData}
 * @param callback {function (err: Error=, data: LanguageData=)}
 */
var createLanguageEntry = function (languageData, callback) {
    db.owl_query(
        'INSERT INTO language (id, name, notes) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), notes=VALUES(notes);',
        [languageData.id, languageData.name, languageData.notes],
        function (dberr, dbres) {
            callback(dberr, new LanguageData(
                languageData.id,
                languageData.name,
                languageData.notes
            ));
        }
    );
};

exports.LanguageData = LanguageData;
exports.getLanguageData = getLanguageData;
exports.createLanguageEntry = createLanguageEntry;