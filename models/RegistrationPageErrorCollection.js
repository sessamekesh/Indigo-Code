/**
 * Created by Kamaron on 5/17/2015.
 */

/**
 * A collection of registration page errors. If empty, is non-fatal and does noting.
 *  Errors may be added to this object, which cause it to be fatal.
 *  Each field may collect a list of errors, which will be separated by something.
 * @constructor
 */
module.exports = function () {
    /**
     * Object containing all errors possible, with the key being the name of the field with the
     *  error and the value being the value of the error to show on the registration page
     * @type {{string}}
     */
    this.errors = {};

    /**
     * Count of errors in the RegistrationPageErrorCollection object. I don't imagine this will
     *  be used anywhere but internally, but if feature creep comes along, here it is!
     * @type {number}
     */
    this.err_count = 0;
}

/**
 * Adds an error to the registration page error collection
 * @param field {string} Name of the field that was affected
 * @param message {string} Message to show to the user
 */
module.exports.prototype.addError = function (field, message) {
    this.err_count++;
    if (this.errors[field]) {
        this.errors[field] += '' + message; // TODO KIP: Replace first '' with separating character <br /> or \n or whatever
    } else {
        this.errors[field] = message;
    }
};

/**
 * @return {boolean} True if the RegistrationPageErrorCollection object requires registration to not continue
 */
module.exports.prototype.isFatal = function () {
    return this.err_count > 0;
};

/**
 * @param field {string} The name of the field in which to check for errors.
 * @return {string} A string containing the error message to show to the user. Empty string if no such message exists.
 */
module.exports.prototype.getError = function (field) {
    return this.errors[field] || '';
};