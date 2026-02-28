/**
 * Port interface for CI Provider operations (Environment, Inputs, Logging, Context).
 * This decouples the orchestrator from GitHub Actions SDK (`@actions/core`, `@actions/github`).
 *
 * @interface
 */
export class ICIProvider {
	/**
	 * Reads an input parameter from the CI environment.
	 * @param {string} name 
	 * @param {{ required?: boolean }} [options] 
	 * @returns {string}
	 */
	getInput(name, options = {}) {
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
	 * @param {string} message 
	 */
	info(message) {
		throw new Error("Not implemented");
	}

	/**
	 * Logs a warning message.
	 * @param {string} message 
	 */
	warning(message) {
		throw new Error("Not implemented");
	}

	/**
	 * Marks the CI run as failed and logs an error message.
	 * @param {string} message 
	 */
	setFailed(message) {
		throw new Error("Not implemented");
	}
}
