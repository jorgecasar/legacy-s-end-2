/**
 * @typedef {import('../../domain/ports/IGitProvider.js').IGitProvider} IGitProvider
 */

/**
 * Simulated GitHub Adapter for testing and dry-runs.
 *
 * @implements {IGitProvider}
 */
export class MockGitHubAdapter {
  constructor() {
    this.memory = {
      comments: [],
      labels: [],
      milestones: [],
    };
  }

  async getIssue(owner, repo, issueNumber) {
    // Return a mocked issue that matches what tests or the selector might expect.
    return {
      number: issueNumber,
      title: "Mock Issue",
      body: "Mock Body",
      state: "open",
    };
  }

  async getPullRequest(_owner, _repo, _pullNumber) {
    // Returns a mock diff string
    return "Mock Diff";
  }

  async createComment(owner, repo, issueNumber, body) {
    this.memory.comments.push({ issueNumber, body });
    // Simulate successful creation
  }

  async addLabels(owner, repo, issueNumber, labels) {
    this.memory.labels.push({ issueNumber, labels });
    // Simulate successful addition
  }

  async updateMilestone(owner, repo, issueNumber, milestone) {
    this.memory.milestones.push({ issueNumber, milestone });
    // Simulate successful update
  }

  async listComments(owner, repo, issueNumber) {
    return this.memory.comments.filter((c) => c.issueNumber === issueNumber);
  }

  async updateComment(owner, repo, commentId, body) {
    const comment = this.memory.comments.find((c) => c.id === commentId);
    if (comment) comment.body = body;
  }

  async createPullRequest(_owner, _repo, title, head, base, body) {
    return {
      title,
      head: { ref: head },
      base: { ref: base },
      body,
      number: 999,
      html_url: `https://github.com/mock/mock/pull/999`,
    };
  }
}
