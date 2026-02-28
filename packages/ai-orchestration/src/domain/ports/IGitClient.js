/**
 * Port interface for local Git CLI operations.
 * This decouples the orchestrator from direct `child_process.execSync` calls.
 *
 * @interface
 */
export class IGitClient {
	/**
	 * Configures the local git author for commits.
	 * @param {string} name 
	 * @param {string} email 
	 * @returns {void}
	 */
	configAuthor(name, email) {
		throw new Error("Not implemented");
	}

	/**
	 * Checks if a branch exists on the remote.
	 * @param {string} branchName 
	 * @returns {boolean}
	 */
	branchExistsRemotely(branchName) {
		throw new Error("Not implemented");
	}

	/**
	 * Checks out an existing branch or creates a new one.
	 * @param {string} branchName 
	 * @param {boolean} [create=false]
	 * @returns {void}
	 */
	checkout(branchName, create = false) {
		throw new Error("Not implemented");
	}

	/**
	 * Rebases the current branch onto a target branch.
	 * @param {string} targetBranch 
	 * @returns {{ success: boolean, hasConflicts: boolean }}
	 */
	rebase(targetBranch) {
		throw new Error("Not implemented");
	}

	/**
	 * Aborts an ongoing rebase operation.
	 * @returns {void}
	 */
	abortRebase() {
		throw new Error("Not implemented");
	}

	/**
	 * Gets the name of the currently checked out branch.
	 * @returns {string}
	 */
	getCurrentBranch() {
		throw new Error("Not implemented");
	}

	/**
	 * Checks if there are any uncommitted changes in the working tree.
	 * @returns {boolean}
	 */
	hasChanges() {
		throw new Error("Not implemented");
	}

	/**
	 * Stages all changes in the working tree.
	 * @returns {void}
	 */
	stageAll() {
		throw new Error("Not implemented");
	}

	/**
	 * Soft resets the current branch to a target, squashing history.
	 * @param {string} targetBranch 
	 * @returns {void}
	 */
	squashOnto(targetBranch) {
		throw new Error("Not implemented");
	}

	/**
	 * Commits staged changes.
	 * @param {string} message 
	 * @param {boolean} [skipVerify=true]
	 * @returns {void}
	 */
	commit(message, skipVerify = true) {
		throw new Error("Not implemented");
	}

	/**
	 * Force pushes the current branch to the remote.
	 * @param {string} branchName 
	 * @returns {void}
	 */
	pushForce(branchName) {
		throw new Error("Not implemented");
	}

	/**
	 * Runs local verification commands (linters, tests).
	 * @returns {boolean} True if all commands succeed, false otherwise.
	 */
	runVerification() {
		throw new Error("Not implemented");
	}
}
