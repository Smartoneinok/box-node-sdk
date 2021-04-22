/**
 * @fileoverview Manager for the Retention Policies Resource
 */

'use strict';

// -----------------------------------------------------------------------------
// Typedefs
// -----------------------------------------------------------------------------

/**
 * Retention policy type, which specifies how long the policy should
 * remain in effect
 * @typedef {string} RetentionPolicyType
 */

/**
 * Retention policy disposition action, which specifies what should
 * be done when the retention period is over
 * @typedef {string} RetentionPolicyDispositionAction
 */

/**
 * Policy assignment types, which specify what type of object the policy applies to
 * @typedef {string} RetentionPolicyAssignmentType
 */

/**
 * Metadata template fields to filter on for assigning a retention policy
 * @typedef {Object} MetadataFilterField
 * @property {string} field The field to filter on
 * @property {string|int} value The value to filter against
 */

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------
var urlPath = require('../util/url-path');

// -----------------------------------------------------------------------------
// Private
// -----------------------------------------------------------------------------
var BASE_PATH = '/retention_policies',
	ASSIGNMENTS_PATH = '/retention_policy_assignments',
	FILE_VERSION_RETENTIONS_PATH = '/file_version_retentions',
	ASSIGNMENTS_SUBRESOURCE = 'assignments',
	FILES_UNDER_RETENTION_SUBRESOURCE = 'files_under_retention',
	FILES_VERSIONS_UNDER_RETENTION_SUBRESOURCE = 'files_versions_under_retention';

// -----------------------------------------------------------------------------
// Public
// -----------------------------------------------------------------------------

/**
 * Simple manager for interacting with all Retention Policies endpoints and actions.
 *
 * @constructor
 * @param {BoxClient} client - The Box API Client that is responsible for making calls to the API
 * @returns {void}
 */
function RetentionPolicies(client) {
	this.client = client;
}

/**
 * Enum of valid retention policy types, which specify how long the policy should
 * remain in effect.
 * @readonly
 * @enum {RetentionPolicyType}
 */
RetentionPolicies.prototype.policyTypes = Object.freeze({
	FINITE: 'finite',
	INDEFINITE: 'indefinite'
});

/**
 * Enum of valid retention policy disposition actions, which specify what should
 * be done when the retention period is over
 * @readonly
 * @enum {RetentionPolicyDispositionAction}
 */
RetentionPolicies.prototype.dispositionActions = Object.freeze({
	PERMANENTLY_DELETE: 'permanently_delete',
	REMOVE_RETENTION: 'remove_retention'
});

/**
 * Enum of valid policy assignment types, which specify what object the policy applies to
 * @readonly
 * @enum {RetentionPolicyAssignmentType}
 */
RetentionPolicies.prototype.assignmentTypes = Object.freeze({
	FOLDER: 'folder',
	ENTERPRISE: 'enterprise',
	METADATA: 'metadata_template'
});

/**
 * Used to create a single retention policy for an enterprise
 *
 * API Endpoint: '/retention_policies'
 * Method: POST
 *
 * @param {string} name - The name of the retention policy to be created
 * @param {RetentionPolicyType} type - The type of policy to create
 * @param {RetentionPolicyDispositionAction} action - The disposition action for the new policy
 * @param {Object} [options] - Additional parameters
 * @param {int} [options.retention_length] - For finite policies, the number of days to retain the content
 * @param {Function} [callback] - Passed the new policy information if it was acquired successfully, error otherwise
 * @returns {Promise<Object>} A promise resolving to the new policy object
 */
RetentionPolicies.prototype.create = function(name, type, action, options, callback) {
	var apiPath = urlPath(BASE_PATH),
		params = {
			body: {
				policy_name: name,
				policy_type: type,
				disposition_action: action
			}
		};

	Object.assign(params.body, options);

	return this.client.wrapWithDefaultHandler(this.client.post)(apiPath, params, callback);
};

/**
 * Fetches details about a specific retention policy
 *
 * API Endpoint: '/retention_policies/:policyID'
 * Method: GET
 *
 * @param {string} policyID - The Box ID of the retention policy being requested
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {Function} [callback] - Passed the policy information if it was acquired successfully, error otherwise
 * @returns {Promise<Object>} A promise resolving to the policy object
 */
RetentionPolicies.prototype.get = function(policyID, options, callback) {
	var apiPath = urlPath(BASE_PATH, policyID),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

/**
 * Update or modify a retention policy.
 *
 * API Endpoint: '/retention_policies/:policyID'
 * Method: PUT
 *
 * @param {string} policyID - The Box ID of the retention policy to update
 * @param {Object} updates - The information to be updated
 * @param {string} [updates.policy_name] - The name of the retention policy
 * @param {RetentionPolicyDispositionAction} [updates.disposition_action] - The disposition action for the updated policy
 * @param {string} [updates.status] - Used to retire a retention policy if status is set to retired
 * @param {Function} [callback] - Passed the updated policy information if it was acquired successfully, error otherwise
 * @returns {Promise<Object>} A promise resolving to the updated policy object
 */
RetentionPolicies.prototype.update = function(policyID, updates, callback) {

	var apiPath = urlPath(BASE_PATH, policyID),
		params = {
			body: updates
		};

	return this.client.wrapWithDefaultHandler(this.client.put)(apiPath, params, callback);
};

/**
 * Fetches a list of retention policies for the enterprise
 *
 * API Endpoint: '/retention_policies
 * Method: GET
 *
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {string} [options.policy_name] - A full or partial name to filter the retention policies by
 * @param {RetentionPolicyType} [options.policy_type] - A policy type to filter the retention policies by
 * @param {string} [options.created_by_user_id] - A user id to filter the retention policies by
 * @param {Function} [callback] - Passed the policy objects if they were acquired successfully, error otherwise
 * @returns {Promise<Object>} A promise resolving to the collection of policies
 */
RetentionPolicies.prototype.getAll = function(options, callback) {
	var apiPath = urlPath(BASE_PATH),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

/**
 * Fetch a list of assignments for a given retention policy
 *
 * API Endpoint: '/retention_policies/:policyID/assignments'
 * Method: GET
 *
 * @param {string} policyID - The Box ID of the retention policy to get assignments for
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {RetentionPolicyAssignmentType} [options.type] - The type of the retention policy assignment to retrieve
 * @param {Function} [callback] - Passed the assignment objects if they were acquired successfully, error otherwise
 * @returns {Promise<Object>} A promise resolving to the collection of policy assignments
 */
RetentionPolicies.prototype.getAssignments = function(policyID, options, callback) {

	var apiPath = urlPath(BASE_PATH, policyID, ASSIGNMENTS_SUBRESOURCE),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

/**
 * Assign a retention policy to a folder or the entire enterprise.
 *
 * API Endpoint: '/retention_policy_assignments
 * Method: POST
 *
 * @param {string} policyID - The ID of the policy to assign
 * @param {RetentionPolicyAssignmentType} assignType - The type of object the policy will be assigned to
 * @param {string} assignID - The Box ID of the object to assign the retention policy to
 * @param {Object} [options] - Optional parameters for the request
 * @param {MetadataFilterField[]} [options.filter_fields] - Metadata fields to filter against, if assigning to a metadata template
 * @param {Function} [callback] - Passed the new assignment object if successful, error otherwise
 * @returns {Promise<Object>} A promise resolving to the created assignment object
 */
RetentionPolicies.prototype.assign = function(policyID, assignType, assignID, options, callback) {

	// Shuffle optional arguments
	if (typeof options === 'function') {
		callback = options;
		options = null;
	}

	var apiPath = urlPath(ASSIGNMENTS_PATH),
		params = {
			body: {
				policy_id: policyID,
				assign_to: {
					type: assignType,
					id: assignID
				}
			}
		};

	Object.assign(params.body, options);

	return this.client.wrapWithDefaultHandler(this.client.post)(apiPath, params, callback);
};

/**
 * Fetch a specific policy assignment
 *
 * API Endpoint: '/retention_policy_assignments/:assignmentID'
 * Method: GET
 *
 * @param {string} assignmentID - The Box ID of the policy assignment object to fetch
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {Function} [callback] - Passed the assignment object if it was acquired successfully, error otherwise
 * @returns {Promise<Object>} A promise resolving to the assignment object
 */
RetentionPolicies.prototype.getAssignment = function(assignmentID, options, callback) {

	var apiPath = urlPath(ASSIGNMENTS_PATH, assignmentID),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

/**
 * Get the specific retention record for a retained file version. To use this feature,
 * you must have the manage retention policies scope enabled for your API key
 * via your application management console.
 *
 * API Endpoint: '/file_version_retentions/:retentionID'
 * Method: GET
 *
 * @param {string} retentionID - The ID for the file retention record to retrieve
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {Function} [callback] - Pass the file version retention record if successful, error otherwise
 * @returns {Promise<Object>} A promise resolving to the retention record
 */
RetentionPolicies.prototype.getFileVersionRetention = function(retentionID, options, callback) {

	var apiPath = urlPath(FILE_VERSION_RETENTIONS_PATH, retentionID),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

/**
 * Get a list of retention records for a retained file versions in an enterprise.
 * To use this feature, you must have the manage retention policies scope enabled
 * for your API key via your application management console.
 *
 * API Endpoint: '/file_version_retentions'
 * Method: GET
 *
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {string} [options.file_id] - A file id to filter the file version retentions by
 * @param {string} [options.file_version_id] - A file version id to filter the file version retentions by
 * @param {string} [options.policy_id] - A policy id to filter the file version retentions by
 * @param {RetentionPolicyDispositionAction} [options.disposition_action] - The disposition action of the retention policy to filter by
 * @param {string} [options.disposition_before] - Filter by retention policies which will complete before a certain time
 * @param {string} [options.disposition_after] - Filter by retention policies which will complete after a certain time
 * @param {int} [options.limit] - The maximum number of items to return in a page
 * @param {string} [options.marker] - Paging marker, left blank to begin paging from the beginning
 * @param {Function} [callback] - Pass the file version retention record if successful, error otherwise
 * @returns {Promise<Object>} A promise resolving to the collection of retention records
 */
RetentionPolicies.prototype.getAllFileVersionRetentions = function(options, callback) {

	var apiPath = urlPath(FILE_VERSION_RETENTIONS_PATH),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

/**
 * Get files under retention by each assignment
 * To use this feature, you must have the manage retention policies scope enabled
 * for your API key via your application management console.
 *
 * API Endpoint: '/retention_policy_assignments/:assignmentID/files_under_retention'
 * Method: GET
 *
 * @param {string} assignmentID - The Box ID of the policy assignment object to fetch
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {string} [options.fields] - Comma-separated list of fields to include in the response: disposition_at, winning_retention_policy
 * @param {int} [options.limit] - The maximum number of items to return in a page
 * @param {string} [options.marker] - Paging marker, left blank to begin paging from the beginning
 * @param {Function} [callback] - Pass the file version retention record if successful, error otherwise
 * @returns {Promise<Object>} A promise resolving to the collection of retention records
 */
RetentionPolicies.prototype.getFilesUnderRetentionForAssignment = function(assignmentID, options, callback) {

	var apiPath = urlPath(ASSIGNMENTS_PATH, assignmentID, FILES_UNDER_RETENTION_SUBRESOURCE),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

/**
 * Get file versions under retention by each assignment
 * To use this feature, you must have the manage retention policies scope enabled
 * for your API key via your application management console.
 *
 * API Endpoint: '/retention_policy_assignments/:assignmentID/files_versions_under_retention'
 * Method: GET
 *
 * @param {string} assignmentID - The Box ID of the policy assignment object to fetch
 * @param {Object} [options] - Additional options for the request. Can be left null in most cases.
 * @param {string} [options.fields] - Comma-separated list of fields to include in the response: disposition_at, winning_retention_policy
 * @param {int} [options.limit] - The maximum number of items to return in a page
 * @param {string} [options.marker] - Paging marker, left blank to begin paging from the beginning
 * @param {Function} [callback] - Pass the file version retention record if successful, error otherwise
 * @returns {Promise<Object>} A promise resolving to the collection of retention records
 */
RetentionPolicies.prototype.getFilesVersionUnderRetentionForAssignment = function(assignmentID, options, callback) {

	var apiPath = urlPath(ASSIGNMENTS_PATH, assignmentID, FILES_VERSIONS_UNDER_RETENTION_SUBRESOURCE),
		params = {
			qs: options
		};

	return this.client.wrapWithDefaultHandler(this.client.get)(apiPath, params, callback);
};

module.exports = RetentionPolicies;
