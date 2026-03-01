/**
 * Port interface for local Git CLI operations.
 * This decouples the orchestrator from direct `child_process.execSync` calls.
 *
 * @interface
 */
export class IGitClient {
  /**
   * Configures the local git author for commits.
   * @param {string} _name
   * @param {string} _email
   * @returns {void}
   */
  configAuthor(_name, _email) {
    throw new Error("Not implemented");
  }

  /**
   * Checks if a branch exists on the remote.
   * @param {string} _branchName
   * @returns {boolean}
   */
  branchExistsRemotely(_branchName) {
    throw new Error("Not implemented");
  }

  /**
   * Checks out an existing branch or creates a new one.
   * @param {string} _branchName
   * @param {boolean} [_create=false]
   * @param {boolean} [_force=false]
   * @returns {void}
   */
  checkout(_branchName, _create = false, _force = false) {
    throw new Error("Not implemented");
  }

  /**
   * Rebases the current branch onto a target branch.
   * @param {string} _targetBranch
   * @returns {{ success: boolean, hasConflicts: boolean }}
   */
  rebase(_targetBranch) {
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
   * @param {string} _targetBranch
   * @returns {void}
   */
  squashOnto(_targetBranch) {
    throw new Error("Not implemented");
  }

  /**
   * Commits staged changes.
   * @param {string} _message
   * @param {boolean} [_skipVerify=true]
   * @returns {void}
   */
  commit(_message, _skipVerify = true) {
    throw new Error("Not implemented");
  }

  /**
   * Force pushes the current branch to the remote.
   * @param {string} _branchName
   * @returns {void}
   */
  pushForce(_branchName) {
    throw new Error("Not implemented");
  }

  /**
   * Runs local verification commands (linters, tests).
   * @returns {{ success: boolean, output: string }} Results and combined output.
   */
  runVerification() {
    throw new Error("Not implemented");
  }
}
