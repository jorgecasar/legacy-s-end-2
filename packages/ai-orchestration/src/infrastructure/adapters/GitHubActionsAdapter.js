import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * @typedef {import('../../domain/ports/ICIProvider.js').ICIProvider} ICIProvider
 */

/**
 * Adapter for GitHub Actions.
 * Encapsulates `@actions/core` and `@actions/github`.
 * @implements {ICIProvider}
 */
export class GitHubActionsAdapter {
	getInput(name, options = {}) {
		return core.getInput(name, options);
	}

	getEventContext() {
		return {
			owner: github.context.repo.owner,
			repo: github.context.repo.repo,
			eventName: github.context.eventName,
			payload: github.context.payload,
		};
	}

	info(message) {
		core.info(message);
	}

	warning(message) {
		core.warning(message);
	}

	setFailed(message) {
		core.setFailed(message);
	}
}
