/**
 * @typedef {import('../../domain/ports/ICIProvider.js').ICIProvider} ICIProvider
 */

/**
 * Mock adapter for CI Provider operations.
 * Used for testing and local execution without @actions/* dependencies.
 * @implements {ICIProvider}
 */
export class MockCIAdapter {
	constructor(inputs = {}, context = {}) {
		this.inputs = inputs;
		this.context = {
			owner: "mock-owner",
			repo: "mock-repo",
			eventName: "workflow_dispatch",
			payload: {},
			...context,
		};
		this.logs = {
			info: [],
			warning: [],
			failed: [],
		};
	}

	getInput(name, options = {}) {
		const value = this.inputs[name];
		if (options.required && !value) {
			throw new Error(`Input required and not supplied: ${name}`);
		}
		return value || "";
	}

	getEventContext() {
		return this.context;
	}

	info(message) {
		console.log(`[INFO] ${message}`);
		this.logs.info.push(message);
	}

	warning(message) {
		console.warn(`[WARNING] ${message}`);
		this.logs.warning.push(message);
	}

	setFailed(message) {
		console.error(`[ERROR] ${message}`);
		this.logs.failed.push(message);
	}
}
