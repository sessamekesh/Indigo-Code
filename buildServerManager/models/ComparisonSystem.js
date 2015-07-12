/**
 * Created by Kamaron on 7/11/2015.
 *
 * REQUIRED FOR INDIGO-CODE-BUILDSERVER v0.1 INTERFACE
 */

/**
 * Data about a comparison system. Defined in Indigo Code Buildserver v0.1 API specification
 * @param id {String} Unique name for the comparison system (e.g., whaleshark_diff_0.1.1)
 * @param name {String} Human readable name for the build system (e.g., Basic Diff)
 * @param description {String} Notes that may be valuable for an admin or user
 * @constructor
 */
var ComparisonSystem = function (id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
};

module.exports.ComparisonSystem = ComparisonSystem;