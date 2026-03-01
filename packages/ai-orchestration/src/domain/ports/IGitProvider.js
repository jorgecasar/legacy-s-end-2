/**
 * Port interface for Git Providers.
 * This decouples the AI Orchestrator application logic from specific SDKs like Octokit.
 *
 * @interface
 */
export class IGitProvider {
  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _issueNumber
   * @returns {Promise<any>}
   */
  async getIssue(_owner, _repo, _issueNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _pullNumber
   * @returns {Promise<any>}
   */
  async getPullRequestMetadata(_owner, _repo, _pullNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _pullNumber
   * @returns {Promise<string>}
   */
  async getPullRequest(_owner, _repo, _pullNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _issueNumber
   * @param {string} _body
   * @returns {Promise<void>}
   */
  async createComment(_owner, _repo, _issueNumber, _body) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _issueNumber
   * @param {string[]} _labels
   * @returns {Promise<void>}
   */
  async addLabels(_owner, _repo, _issueNumber, _labels) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _issueNumber
   * @param {number} _milestone
   * @returns {Promise<void>}
   */
  async updateMilestone(_owner, _repo, _issueNumber, _milestone) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _issueNumber
   * @returns {Promise<any[]>}
   */
  async listComments(_owner, _repo, _issueNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _pullNumber
   * @returns {Promise<any[]>}
   */
  async listReviewComments(_owner, _repo, _pullNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _pullNumber
   * @returns {Promise<any[]>}
   */
  async listReviews(_owner, _repo, _pullNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {number} _commentId
   * @param {string} _body
   * @returns {Promise<void>}
   */
  async updateComment(_owner, _repo, _commentId, _body) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {string} _title
   * @param {string} _head
   * @param {string} _base
   * @param {string} _body
   * @returns {Promise<any>}
   */
  async createPullRequest(_owner, _repo, _title, _head, _base, _body) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} _owner
   * @param {string} _repo
   * @param {object} _params
   * @returns {Promise<any[]>}
   */
  async listPullRequests(_owner, _repo, _params) {
    throw new Error("Not implemented");
  }
}
