/**
 * Result Pattern
 * Standardizes the response structure for Domain and Use Case layers.
 *
 * @template T
 * @typedef {Object} SuccessResult
 * @property {true} success
 * @property {T} value
 * @property {undefined} [error]
 */

/**
 * @typedef {Object} FailureResult
 * @property {false} success
 * @property {undefined} [value]
 * @property {string} error
 */

/**
 * @template T
 * @typedef {SuccessResult<T> | FailureResult} Result
 */

// Export dummy to make it a module if needed, though JSDoc is the primary goal
export const Result = {};
