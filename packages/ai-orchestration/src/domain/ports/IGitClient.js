/**
 * Interface for Git CLI operations.
 * @interface IGitClient
 */
export class IGitClient {
  /**
   * Configures git user.
   * @param {string} _name
   * @param {string} _email
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
   * Fetches from remote.
   * @param {string} [_remote]
   * @param {string} [_branch]
   */
  fetch(_remote, _branch) {
    throw new Error("Not implemented");
  }

  /**
   * Hard reset to target.
   * @param {string} _target
   */
  resetHard(_target) {
    throw new Error("Not implemented");
  }

  /**
   * Checkout branch.
   * @param {string} _branchName
   * @param {boolean} [_create]
   * @param {boolean} [_force]
   */
  checkout(_branchName, _create, _force) {
    throw new Error("Not implemented");
  }

  /**
   * Rebase current branch onto target.
   * @param {string} _targetBranch
   * @returns {{ success: boolean, hasConflicts: boolean }}
   */
  rebase(_targetBranch) {
    throw new Error("Not implemented");
  }

  /**
   * Aborts current rebase.
   */
  abortRebase() {
    throw new Error("Not implemented");
  }

  /**
   * Gets current branch name.
   * @returns {string}
   */
  getCurrentBranch() {
    throw new Error("Not implemented");
  }

  /**
   * Checks if there are unstaged or uncommitted changes.
   * @returns {boolean}
   */
  hasChanges() {
    throw new Error("Not implemented");
  }

  /**
   * Stages all changes.
   */
  stageAll() {
    throw new Error("Not implemented");
  }

  /**
   * Soft resets onto target branch to squash.
   * @param {string} _targetBranch
   */
  squashOnto(_targetBranch) {
    throw new Error("Not implemented");
  }

  /**
   * Commits staged changes.
   * @param {string} _message
   * @param {boolean} [_skipVerify]
   */
  commit(_message, _skipVerify) {
    throw new Error("Not implemented");
  }

  /**
   * Force pushes current branch.
   * @param {string} _branchName
   */
  pushForce(_branchName) {
    throw new Error("Not implemented");
  }

  /**
   * Gets the URL of a git remote.
   * @param {string} [_remote]
   * @returns {string|null}
   */
  getRemoteUrl(_remote) {
    throw new Error("Method not implemented.");
  }

  /**
   * Run local verification commands (linters, tests).
   * @returns {{ success: boolean, output: string }} Results and combined output.
   */
  runVerification() {
    throw new Error("Method not implemented.");
  }

  /**
   * Run linters and formatters to fix issues automatically.
   */
  fix() {
    throw new Error("Method not implemented.");
  }
}
