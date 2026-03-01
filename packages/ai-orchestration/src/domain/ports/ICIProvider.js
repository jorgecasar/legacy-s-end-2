/**
 * Port interface for CI Provider operations (Environment, Inputs, Logging, Context).
 * This decouples the orchestrator from GitHub Actions SDK (`@actions/core`, `@actions/github`).
 *
 * @interface
 */
export class ICIProvider {
  /**
   * Reads an input parameter from the CI environment.
   * @param {string} _name
   * @param {{ required?: boolean }} [_options]
   * @returns {string}
   */
  getInput(_name, _options = {}) {
    throw new Error("Not implemented");
  }

  /**
   * Gets the context of the event that triggered the CI run.
   * @returns {{
   *   owner: string,
   *   repo: string,
   *   eventName: string,
   *   payload: any
   * }}
   */
  getEventContext() {
    throw new Error("Not implemented");
  }

  /**
   * Logs an informational message.
   * @param {string} _message
   */
  info(_message) {
    throw new Error("Not implemented");
  }

  /**
   * Logs a warning message.
   * @param {string} _message
   */
  warning(_message) {
    throw new Error("Not implemented");
  }

  /**
   * Logs an error message without necessarily failing the run.
   * @param {string} _message
   */
  error(_message) {
    throw new Error("Not implemented");
  }

  /**
   * Marks the CI run as failed and logs an error message.
   * @param {string} _message
   */
  setFailed(_message) {
    throw new Error("Not implemented");
  }
}
