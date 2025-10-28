/**
 * Input validation and sanitization utilities
 */

/**
 * Validates required inputs
 * @param {Object} inputs - Input object
 * @throws {Error} If required fields are missing
 */
export function validateRequiredInputs(inputs) {
  if (!inputs.repo || !inputs.language) {
    throw new Error('Missing required inputs: REPO and LANGUAGE are required');
  }
}

/**
 * Sanitize path strings - remove shell metacharacters (good hygiene, prevents accidental issues)
 * @param {string} pathStr - Path string to sanitize
 * @returns {string} Sanitized path
 */
export function sanitizePath(pathStr) {
  return pathStr.replace(/[;&|`$(){}[\]<>]/g, '');
}

/**
 * Sanitize rule IDs - allow only alphanumeric, hyphens, slashes, and underscores
 * @param {string} ruleId - Rule ID to sanitize
 * @returns {string} Sanitized rule ID
 */
export function sanitizeRuleId(ruleId) {
  return ruleId.replace(/[^a-zA-Z0-9\-/_]/g, '');
}

/**
 * Escape output for GITHUB_OUTPUT - prevent workflow variable injection
 * @param {*} value - Value to escape
 * @returns {string} Escaped value
 */
export function escapeOutput(value) {
  if (!value) return '';
  return String(value)
    .replace(/%/g, '%25') // % must be first
    .replace(/\r/g, '%0D') // carriage return
    .replace(/\n/g, '%0A'); // newline
}
